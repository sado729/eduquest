#!/bin/bash
# Re-apply the Play Games Services integration to the bubblewrap-generated project.
#
# Implements https://developer.android.com/games/pgs/android/android-signin
# ("New client integration"): the SDK dependency, the project ID, and
# PlayGamesSdk.initialize().
#
# `bubblewrap update` regenerates build.gradle, app/build.gradle,
# app/src/main/AndroidManifest.xml and
# app/src/main/java/com/vebstudio/eduquest/Application.java from its templates,
# which drops the PGS SDK. Run this AFTER `bubblewrap update` and BEFORE
# `bubblewrap build`, or Play Console will again report that the production APK is
# missing the Play Games Services SDK.
#
# The project ID is kept in pgs/game-ids.xml and copied into
# app/src/main/res/values/ by this script: `bubblewrap update` deletes and regenerates
# that whole res/values/ directory, so a copy living only in there does not survive.
#
# Safe to run repeatedly; each step is skipped if already applied.

set -euo pipefail
cd "$(dirname "$0")"

PGS_VERSION='21.0.0'   # newest release that still supports minSdkVersion 21; 22.x needs 24
ROOT_GRADLE='build.gradle'
APP_GRADLE='app/build.gradle'
MANIFEST='app/src/main/AndroidManifest.xml'
APPJAVA='app/src/main/java/com/vebstudio/eduquest/Application.java'
GAME_IDS_SRC='pgs/game-ids.xml'
GAME_IDS='app/src/main/res/values/game-ids.xml'

for f in "$ROOT_GRADLE" "$APP_GRADLE" "$MANIFEST" "$APPJAVA" "$GAME_IDS_SRC"; do
  [ -f "$f" ] || { echo "missing $f — run this from android/ after bubblewrap update"; exit 1; }
done

# 0. Restore res/values/game-ids.xml, which `bubblewrap update` deletes along with the
# rest of the generated res/values/ directory.
if cmp -s "$GAME_IDS_SRC" "$GAME_IDS"; then
  echo "  already applied: $GAME_IDS"
else
  cp "$GAME_IDS_SRC" "$GAME_IDS"
  echo "  applied: $GAME_IDS restored from $GAME_IDS_SRC"
fi

PGS_VERSION="$PGS_VERSION" ROOT_GRADLE="$ROOT_GRADLE" APP_GRADLE="$APP_GRADLE" \
MANIFEST="$MANIFEST" APPJAVA="$APPJAVA" python3 - <<'PY'
import io, os, re, sys

changed = []

def read(path):
    return io.open(path, encoding='utf-8').read()

def write(path, s):
    io.open(path, 'w', encoding='utf-8').write(s)

def skip(label):
    print('  already applied: ' + label)

def ok(label):
    changed.append(label)
    print('  applied: ' + label)

def fail(label, path):
    sys.exit('FAILED: anchor for "%s" not found in %s — the bubblewrap template '
             'changed, reapply by hand.' % (label, path))

def patch(path, needle, old, new, label):
    s = read(path)
    if needle in s:
        return skip(label)
    if old not in s:
        fail(label, path)
    write(path, s.replace(old, new, 1))
    ok(label)

v = os.environ['PGS_VERSION']

# 1. Project-level build.gradle: Google's Maven repo + Maven Central, in both
# `buildscript` and `allprojects`. The bubblewrap template still lists jcenter(),
# which is shut down and cannot serve play-services-games-v2.
def patch_root_repos(path):
    label = 'mavenCentral() in ' + path
    s = read(path)
    if 'jcenter()' not in s:
        if 'mavenCentral()' not in s or 'google()' not in s:
            fail(label, path)
        return skip(label)
    write(path, s.replace('jcenter()', 'mavenCentral()'))
    ok(label)

# 2. Module-level build.gradle: the PGS dependency, spliced in just before the
# brace that closes the `dependencies` block. Walking the braces instead of
# matching a specific library line keeps this working through bubblewrap's
# template indentation and its androidbrowserhelper version bumps.
def patch_app_gradle(path, version):
    label = 'PGS dependency in ' + path
    s = read(path)
    if 'play-services-games-v2' in s:
        return skip(label)
    m = re.search(r'^dependencies\s*\{', s, re.M)
    if not m:
        fail(label, path)
    depth, i = 0, m.end() - 1
    while i < len(s):
        if s[i] == '{':
            depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0:
                break
        i += 1
    else:
        fail(label, path)
    line_start = s.rfind('\n', 0, i) + 1
    added = (
        "    // Play Games Services v2. Required by Play Console before a PGS configuration\n"
        "    // can be published (\"Add the Play Games Services SDK to your production APK\").\n"
        "    // Pinned to {v}: newest release that still supports minSdkVersion 21 (22.x needs 24).\n"
        "    implementation 'com.google.android.gms:play-services-games-v2:{v}'\n"
    ).format(v=version)
    write(path, s[:line_start] + added + s[line_start:])
    ok(label)

patch_root_repos(os.environ['ROOT_GRADLE'])
patch_app_gradle(os.environ['APP_GRADLE'], v)

# 3. The project ID, read from res/values/game-ids.xml.
patch(os.environ['MANIFEST'], 'com.google.android.gms.games.APP_ID',
      '        <meta-data\n'
      '            android:name="twa_generator"\n'
      '            android:value="@string/generatorApp" />',
      '        <meta-data\n'
      '            android:name="twa_generator"\n'
      '            android:value="@string/generatorApp" />\n'
      '\n'
      '        <!-- Play Games Services: the APP_ID meta-data must be present for\n'
      '             PlayGamesSdk.initialize() to work. Value lives in res/values/game-ids.xml. -->\n'
      '        <meta-data\n'
      '            android:name="com.google.android.gms.games.APP_ID"\n'
      '            android:value="@string/game_services_project_id" />',
      'APP_ID meta-data in AndroidManifest.xml')

# 4. Initialize the SDK in Application.onCreate().
patch(os.environ['APPJAVA'], 'PlayGamesSdk.initialize',
      '  public void onCreate() {\n      super.onCreate();\n',
      '  public void onCreate() {\n'
      '      super.onCreate();\n'
      '      // Play Games Services. Initializing here is what puts the SDK on the app\'s\n'
      '      // startup path, which is what Play Console checks for in the production build.\n'
      '      // It also performs the automatic PGS sign-in.\n'
      '      com.google.android.gms.games.PlayGamesSdk.initialize(this);\n',
      'PlayGamesSdk.initialize in Application.java')

print('\n%d change(s) applied.' % len(changed))
PY

ID=$(sed -n 's/.*name="game_services_project_id"[^>]*>\([^<]*\)<.*/\1/p' "$GAME_IDS" | tr -d ' ')
if [ "$ID" = "000000000000" ]; then
  echo
  echo "WARNING: game_services_project_id is still the 000000000000 placeholder."
  echo "Put the real numeric Project ID from Play Console > Grow > Play Games Services"
  echo "> Setup and management > Configuration into $GAME_IDS_SRC before shipping."
fi
