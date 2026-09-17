/* EduQuest — regression test for the daily limit and the bedtime pause.
   Run it with:  node test/rest.js      (no dependencies, no build step)

   Why this file exists: the rest screen's *visuals* come from the design project, but
   the enforcement below is hand-written on top of it. A design re-sync can quietly bring
   back the pretty screen while dropping the guards, which would leave a parent setting a
   45-minute limit that does nothing at all. This test loads the real js/app.js and
   js/tracking.js — no reimplementation — freezes the clock, and asserts that a limit and
   a bedtime actually stop play, that the stop stays soft, and that the pause screen never
   burns limit minutes. If it goes red after a re-sync, the enforcement is what broke. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const JS = path.join(__dirname, '..', 'js');

/* ── a browser small enough for app.js to boot in ── */
const RealDate = Date;
const sandbox = {
  document: { hidden: false, getElementById: () => null, addEventListener() {}, body: {} },
  window: { addEventListener() {}, location: { search: '' } },
  localStorage: {
    _m: {},
    getItem(k) { return this._m[k] || null; },
    setItem(k, v) { this._m[k] = v; },
    removeItem(k) { delete this._m[k]; }
  },
  navigator: {},
  console, Date: RealDate, Math, JSON, Object, Array, String, Number,
  isNaN, parseInt, parseFloat, setTimeout, clearTimeout, setInterval, clearInterval
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

/* the few helpers app.js/tracking.js reach for that live in other files —
   this test is about the time guards, so a thin az-only TX is enough */
vm.runInContext(`
  var TX  = o => (o && o.az !== undefined ? o.az : o);
  var RUP = (n, a) => a;
  var EQC = new Proxy({}, { get: () => () => '' });
  var EQS = { meta: {}, screens: {}, ptoggle: () => '' };
  var EQP = { key: () => 'eq_test', ids: ['a'], label: () => 'x' };
`, sandbox);

/* data.js comes along because EQ.load() reads the real sticker album through EQD —
   loading it beats hand-maintaining a fake copy that would drift from the real one */
for (const f of ['data.js', 'tracking.js', 'app.js']) {
  vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
}

/* `const EQ` is a lexical binding inside the module, not a property of the sandbox */
vm.runInContext('globalThis.__EQ = EQ; globalThis.__EQT = EQT;', sandbox);
const EQ = sandbox.__EQ;
const EQT = sandbox.__EQT;

/* ── harness ── */
let pass = 0, fail = 0;
const group = name => console.log('\n' + name);
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  -> ' + extra : '')); }
};

/* freeze the clock at h:m so the bedtime window is testable at any hour */
const at = (h, m) => {
  const fixed = new RealDate(2026, 8, 16, h, m, 0);
  sandbox.Date = class extends RealDate {
    constructor(...a) { return a.length ? new RealDate(...a) : fixed; }
    static now() { return fixed.getTime(); }
  };
};
const realClock = () => { sandbox.Date = RealDate; };

/* a played-minutes bucket for today, as the tracker would have written it */
const played = mins => {
  EQ.s.track.days[EQ.dayKey()] = {
    secs: mins * 60, secsQ: 0, secsB: 0, a: 0, c: 0, done: 3,
    hg: 0, hints: 0, boss: 0, bossWin: 0, subj: {}, topics: {}
  };
};

/* boot one onboarded child on the map */
EQ.load();
EQ.s.onboarded = true;
EQ.current = 'map';
EQ.s.lastDay = EQ.dayKey();

group('defaults the parent is handed');
ok('daily limit defaults to 45 min', EQ.s.settings.limit === 45, 'got ' + EQ.s.settings.limit);
ok('bedtime pause is on by default', EQ.s.settings.bedtime === true);
ok('bedtime defaults to 20:00', EQ.s.settings.bedMin === 1200, 'bedMin=' + EQ.s.settings.bedMin);

group('the daily limit actually stops play');
EQ.s.settings.bedtime = false; /* isolate the limit path from the clock */
played(44);
ok('44 of 45 min -> play continues', EQ.restState() === null, 'restState=' + EQ.restState());
ok('44 min -> a challenge still opens', EQ.restGuard('challenge') === false);
played(45);
ok('45 min -> restState is "limit"', EQ.restState() === 'limit', 'got ' + EQ.restState());
ok('45 min -> a challenge is held back', EQ.restGuard('challenge') === true);
ok('45 min -> the map is held back', EQ.restGuard('map') === true);

group('the stop stays soft, never a hard lock');
ok('the grown-up gate stays reachable', EQ.restGuard('parent_gate') === false);
ok('parent settings stay reachable', EQ.restGuard('parent_settings') === false);
ok('restday does not redirect to itself', EQ.restGuard('restday') === false);
ok('an earned reward still plays out (success)', EQ.restGuard('success') === false);
ok('an earned reward still plays out (chest)', EQ.restGuard('chest') === false);
ok('a level-up still plays out', EQ.restGuard('levelup') === false);

group('a parent grants a few more minutes');
EQ.s.settings.bonusDay = EQ.dayKey();
EQ.s.settings.bonusMins = 15;
ok('+15 min -> play resumes', EQ.restState() === null, 'got ' + EQ.restState());
played(60);
ok('60 min of the 45+15 -> stopped again', EQ.restState() === 'limit');
EQ.s.settings.bonusDay = '1999-01-01';
ok('a bonus from another day never carries over', EQ.bonusMins() === 0);
EQ.s.settings.bonusDay = null;
EQ.s.settings.bonusMins = 0;

group('the pause screen never burns limit minutes');
played(45);
const before = EQ.s.track.days[EQ.dayKey()].secs;
const tickFrom = screen => {
  EQ.current = screen;
  EQT._t = RealDate.now() - 30000;
  EQT._vis = true;
  EQT.tick();
  return EQ.s.track.days[EQ.dayKey()].secs - before;
};
ok('30s on restday adds nothing', tickFrom('restday') === 0, 'delta=' + tickFrom('restday'));
ok('30s in the parent area adds nothing', tickFrom('parent_settings') === 0);
ok('30s on a challenge does count', tickFrom('challenge') > 0);

group('bedtime brings up the same screen after 20:00');
played(0); /* no minutes used — bedtime has to stand on its own */
EQ.current = 'map';
EQ.s.settings.bedtime = true;
at(19, 59); ok('19:59 -> play continues', EQ.restState() === null, 'got ' + EQ.restState());
at(20, 0);  ok('20:00 -> restState is "bed"', EQ.restState() === 'bed', 'got ' + EQ.restState());
at(20, 0);  ok('20:00 -> a challenge is held back', EQ.restGuard('challenge') === true);
at(22, 30); ok('22:30 -> still bedtime', EQ.restState() === 'bed');
at(2, 0);   ok('02:00, past midnight -> still bedtime', EQ.restState() === 'bed', 'got ' + EQ.restState());
at(5, 0);   ok('05:00 -> the window closes, play resumes', EQ.restState() === null, 'got ' + EQ.restState());
at(7, 30);  ok('07:30 -> play continues', EQ.restState() === null);

at(20, 30);
EQ.s.settings.bonusDay = EQ.dayKey();
EQ.s.settings.bonusMins = 45;
ok('+45 min pushes bedtime to 20:45, so 20:30 is fine',
  EQ.restState() === null, 'bedStart=' + EQ.fmtTime(EQ.bedStart()));
EQ.s.settings.bonusDay = null;
EQ.s.settings.bonusMins = 0;

at(20, 30);
EQ.s.settings.bedtime = false;
ok('bedtime switched off -> 20:30 is fine', EQ.restState() === null);
EQ.s.settings.bedtime = true;
realClock();

group('the guards know when to stay out of the way');
EQ.s.onboarded = false;
played(99);
ok('a child still in the first run is never stopped', EQ.restState() === null);
EQ.s.onboarded = true;

EQ.s.settings.bedtime = false;
EQ.s.settings.limit = 0;
played(500);
ok('limit 0 means no limit at all', EQ.restState() === null, 'got ' + EQ.restState());

console.log('\n' + (fail
  ? 'FAILED ' + fail + ' of ' + (pass + fail) + ' checks'
  : 'ALL ' + pass + ' CHECKS PASSED'));
process.exit(fail ? 1 : 0);
