/* EduQuest — regression test for the "Bigger text" switch.
   Run it with:  node test/bigtext.js      (no dependencies, no build step)

   Why this file exists: parent settings had a "Bigger text — larger labels and answers"
   switch that was saved, carried in a transfer code, and changed nothing on any screen.
   It works now through a body class (EQ.applyBig, the same pattern as calm mode), and
   every way it can break is invisible from the switch itself:

     1. the class stops following the setting — at boot, on the switch, or when the
        grown-up switches to another child (the setting is per child: one child may read
        fine and a younger sibling not yet);
     2. the setting is lost on the way to another phone;
     3. the screens lose their tags. The screens are fixed-px designs with absolutely
        placed parts, so nothing is scaled wholesale — only elements tagged .bt / .btf
        grow, and the question cards are re-anchored so they grow upward instead of
        sliding under the answers. A design re-sync restores the screens *without* the
        tags: the switch goes back to doing nothing, and nothing looks broken;
     4. a .btf label without its inline --fs. Its font-size is calc(var(--fs) * …): with
        no --fs the declaration is invalid and the label silently falls back to the
        inherited size — in big-text mode a 38px answer would drop to 16px.

   Layout itself (nothing clipped, nothing overlapping, Done on screen) can only be
   measured in a browser; that was checked by hand in headless Chrome, three languages,
   both modes. This file pins the wiring and the markup that layout depends on. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const JS = path.join(ROOT, 'js');

/* ── harness ── */
let pass = 0, fail = 0;
const group = name => console.log('\n' + name);
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  -> ' + extra : '')); }
};

/* a body whose classList really holds classes, so "on" and "off" can be read back */
const bodyClasses = new Set();
const classList = {
  toggle(c, on) { const v = on === undefined ? !bodyClasses.has(c) : !!on; if (v) bodyClasses.add(c); else bodyClasses.delete(c); return v; },
  add(c) { bodyClasses.add(c); }, remove(c) { bodyClasses.delete(c); }, contains: c => bodyClasses.has(c)
};
const el = () => ({ style: {}, innerHTML: '', setAttribute() {}, classList: { toggle() {}, add() {}, remove() {} } });
const sandbox = {
  document: {
    hidden: false, title: '', documentElement: {}, body: { classList },
    getElementById: id => (String(id).indexOf('eqi-') === 0 ? null : el()),
    addEventListener() {}
  },
  localStorage: {
    _m: {},
    getItem(k) { return Object.prototype.hasOwnProperty.call(this._m, k) ? this._m[k] : null; },
    setItem(k, v) { this._m[k] = String(v); },
    removeItem(k) { delete this._m[k]; }
  },
  navigator: {}, console, Math, JSON, Date, Object, Array, String, Number, Set,
  isNaN, parseInt, parseFloat, setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
  addEventListener() {}, matchMedia: () => ({ matches: false, addListener() {} }),
  location: { search: '', hash: '', pathname: '/' }, history: { replaceState() {} }, URLSearchParams,
  innerWidth: 402, innerHeight: 874
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const FILES = ['i18n.js', 'components.js', 'data.js', 'regions.js', 'tracking.js', 'profiles.js', 'qr.js',
  'transfer.js', 'screens-onboarding.js', 'screens-world.js', 'interact.js', 'speech.js', 'screens-play.js',
  'screens-collect.js', 'parent.js', 'app.js'];
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
vm.runInContext('this.EQ = EQ; this.EQD = EQD; this.EQS = EQS; this.EQT = EQT; this.EQP = EQP; this.EQX = EQX; this.EQIX = EQIX; this.EQ_DEFAULTS = EQ_DEFAULTS; this.EQI = EQI; this.EQP_STATE_KEY = EQP_STATE_KEY;', sandbox);
const { EQ, EQD, EQS, EQT, EQP, EQX, EQIX, EQ_DEFAULTS, EQI } = sandbox;
const store = sandbox.localStorage;

const big = () => bodyClasses.has('bigtext');
const wipe = () => { store._m = {}; bodyClasses.clear(); EQP.ids = ['p1']; EQP.active = 'p1'; };
const quiet = () => { EQ.toast = () => {}; EQ.render = () => {}; EQ.restGuard = () => false; };

/* ── 1 · the switch drives the class ── */
group('the switch puts the class on the page and takes it off again');
(() => {
  wipe();
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.settings.music = false;
  quiet();
  ok('off by default', EQ_DEFAULTS.settings.bigText === false);
  EQ.applyBig();
  ok('default state: no bigtext class', !big());
  EQ.ptoggle('bigText');
  ok('switch on → setting saved as true', EQ.s.settings.bigText === true);
  ok('switch on → body has .bigtext', big());
  ok('…and it is persisted for this child', JSON.parse(store.getItem(EQP.key())).settings.bigText === true);
  EQ.ptoggle('bigText');
  ok('switch off → class removed', !big());
  ok('switch off → setting false', EQ.s.settings.bigText === false);
  EQ.ptoggle('calm');
  ok('the calm switch does not turn big text on', !big() && bodyClasses.has('calm'));
  EQ.ptoggle('calm');
  EQ.s.settings.bigText = true; EQ.ptoggle('readAloud');
  ok('any other switch re-applies it rather than dropping it', big());
})();

/* ── 2 · boot applies the saved setting ── */
group('a saved "bigger text" is applied when the app starts');
const boot = () => { bodyClasses.clear(); EQ.s = null; EQ.current = null; EQ.boot(); };
(() => {
  wipe();
  const st = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  st.onboarded = true; st.settings.bigText = true; st.settings.music = false;
  store.setItem(sandbox.EQP_STATE_KEY, JSON.stringify(st));
  boot();
  ok('boot with bigText on → .bigtext', big() && EQ.s.settings.bigText === true);
  st.settings.bigText = false;
  store.setItem(sandbox.EQP_STATE_KEY, JSON.stringify(st));
  boot();
  ok('boot with bigText off → no .bigtext', !big());
  const legacy = JSON.parse(JSON.stringify(st)); delete legacy.settings.bigText;
  store.setItem(sandbox.EQP_STATE_KEY, JSON.stringify(legacy));
  boot();
  ok('a save from before the switch did anything boots with it off', !big() && EQ.s.settings.bigText === false);
})();

/* ── 3 · each child keeps their own ── */
group('switching child applies that child\'s own setting');
(() => {
  wipe();
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  quiet();
  EQ.s.onboarded = true; EQ.s.heroName = 'Aysel'; EQ.s.settings.music = false;
  EQ.s.settings.bigText = false; EQ.save(); EQ.applyBig();
  const p2 = EQP.add('az');
  EQ.s.onboarded = true; EQ.s.heroName = 'Murad';
  EQ.ptoggle('bigText'); /* the younger one reads with bigger text */
  ok('child 2 on → class on', big() && EQ.s.heroName === 'Murad');
  EQP.swap('p1');
  ok('back to child 1 → class off', !big() && EQ.s.heroName === 'Aysel');
  ok('…and child 1\'s setting was never touched', EQ.s.settings.bigText === false);
  EQP.swap(p2);
  ok('child 2 again → class on', big() && EQ.s.settings.bigText === true);
  const p3 = EQP.add('ru');
  ok('a brand-new child starts without it (not inherited from whoever was playing)', !big() && EQ.s.settings.bigText === false);
  EQP.swap(p2);
  ok('p3 → p2 → class on', big());
  EQP.remove(p2);
  ok('removing the playing child applies the next child\'s setting', !big() && EQP.active !== p2);
  EQP.swap(p3);
  EQP.save();
  ok('the switch is per child in storage too', JSON.parse(store.getItem(EQP.key('p1'))).settings.bigText === false);
})();

/* ── 4 · it moves with the child ── */
group('a transfer keeps the setting');
const packed = on => {
  const s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  s.onboarded = true; s.heroName = 'Leyla'; s.settings.bigText = on;
  s.track = { start: EQ.dayKey(), days: {} }; s.lastDay = EQ.dayKey();
  return EQX.pack(s, 0);
};
(() => {
  ok('code round trip: on stays on', EQX.clean(EQX.unpack(packed(true))).settings.bigText === true);
  ok('code round trip: off stays off', EQX.clean(EQX.unpack(packed(false))).settings.bigText === false);
  /* written by the build before this change (transfer.js is append-only: the bit was
     already there, so every old code must go on reading exactly as it did) */
  const OLD_ON = '1_Leyla_F2C49B.4A2E20.3DBE6E.2A9455.5B3FD6.0.0_FF9243.F0762A_0.4.0.1.1.0.0.0.0.0.0.0.0.0.0.0.0_1_r.19.xc.2.0_fze.0.2..___';
  const OLD_OFF = OLD_ON.replace('_r.19.', '_p.19.');
  const a = EQX.clean(EQX.unpack(OLD_ON)), b = EQX.clean(EQX.unpack(OLD_OFF));
  ok('an old code with the bit set arrives with bigger text', a && a.settings.bigText === true && a.heroName === 'Leyla');
  ok('…its neighbours in the same flags are unchanged', a.settings.readAloud === true && a.settings.calm === false && a.settings.lang === 'ru');
  ok('an old code without the bit arrives without it', b && b.settings.bigText === false);
  const file = JSON.stringify({ app: 'eduquest', made: '2026-09-20', profiles: [{ state: Object.assign(JSON.parse(JSON.stringify(EQ_DEFAULTS)), { onboarded: true, heroName: 'Leyla', settings: Object.assign({}, EQ_DEFAULTS.settings, { bigText: true }) }) }] });
  const fb = EQX.readBundle(file);
  ok('a backup file carries it', fb && fb.states[0].settings.bigText === true);
  const oldFile = JSON.parse(file); delete oldFile.profiles[0].state.settings.bigText;
  ok('a file with no bigText field reads as off', EQX.readBundle(JSON.stringify(oldFile)).states[0].settings.bigText === false);

  /* the whole way: import on a fresh phone, reload, and the class is on */
  wipe();
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS)); quiet();
  const state = EQX.clean(EQX.unpack(packed(true)));
  ok('import writes it', EQX.applyOne(state, EQX.plan(state)));
  EQ.frozen = false;
  boot();
  ok('after the reload the arriving child reads with bigger text', big() && EQ.s.heroName === 'Leyla');
})();

/* ── 5 · the screens carry the tags the CSS grows ── */
group('the child\'s screens carry the tags (a re-sync would drop them)');
const LANGS = ['az', 'en', 'ru'];
const setup = lang => {
  wipe();
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  quiet();
  EQ.s.onboarded = true; EQ.s.level = 20; EQ.s.trophiesEarned = 3; EQ.s.settings.music = false;
  EQ.s.settings.bigText = true;
  EQT.init(EQ.s);
  EQI.set(lang);
};
const show = (q, screen, topic, why) => {
  Object.assign(EQ.session, { mission: null, region: null, ctx: 'daily', q, qIdx: 0, qKey: null, answering: false, tutorWhy: !!why });
  const r = EQD.regionOf(topic);
  if (r && EQD.REGIONS[r]) { EQ.region(r); EQ.session.region = r; EQ.session.ctx = 'region'; }
  if (screen === 'boss') EQ.session.ctx = 'boss';
  return EQS.screens[screen](EQ.s);
};
const gen = (t, alt, hard, k) => {
  const rnd = EQD.mulberry(k * 977 + t.length * 31 + (hard ? 7 : 0) + 1);
  return EQD.TOPIC_GEN[t]((a, b) => a + Math.floor(rnd() * (b - a + 1)), hard, alt);
};
const tagOf = (h, re) => (h.match(re) || []).length;
/* every .btf element must carry its own --fs; returns the offending snippets */
const btfWithoutFs = h => (h.match(/<[a-z]+ [^>]*class="[^"]*\bbtf\b[^"]*"[^>]*>/g) || []).filter(t => !/--fs:\d+(\.\d+)?px/.test(t));

const topics = Object.keys(EQD.TOPIC_GEN);
let seen = 0, bad = [];
for (const lang of LANGS) {
  setup(lang);
  for (const t of topics) for (const alt of (EQD.ALT_TOPICS[t] ? [false, true] : [false])) for (const hard of [false, true]) for (let k = 0; k < 3; k++) {
    const q = gen(t, alt, hard, k);
    const id = `${lang} ${t}${alt ? '/alt' : ''}${hard ? '/hard' : ''}#${k}`;
    const hands = !!(q.kind && EQIX.fmt(q));
    const ch = show(q, 'challenge', t);
    const h = show(q, 'hint', t);
    const tu = show(q, 'tutor', t, true);
    const scr = [ch, h, tu];
    seen++;
    if (!/class="bt" style="font:800 21px[^"]*">/.test(ch)) bad.push(id + ': question title not .bt');
    if (hands) {
      if (!/class="rise bt-hands"/.test(ch)) bad.push(id + ': hands-on card not .bt-hands');
      if (!/id="eqi-done" class="press btf"|class="eqi-p btf"/.test(ch)) bad.push(id + ': panel controls not .btf');
    } else {
      if (!/class="rise bt-card"/.test(ch)) bad.push(id + ': question card not .bt-card');
      if (tagOf(ch, /class="press ans btf"/g) !== EQD.qa(q).answers.length) bad.push(id + ': not every answer is .btf');
      if (!/class="bt-ansrow"/.test(ch)) bad.push(id + ': answer row not .bt-ansrow');
      if (!/class="bt bt-tip"/.test(ch)) bad.push(id + ': Questy tip not .bt-tip');
    }
    if (tagOf(h, /class="bt"/g) < 4) bad.push(id + ': hint heading/sub/panel title/note not all .bt');
    if (tagOf(h, /class="press btf"/g) < 3) bad.push(id + ': hint buttons not .btf');
    if (!/class="bt-tflow"[\s\S]*id="tutor-card"[\s\S]*class="bt-tvis"/.test(tu)) bad.push(id + ': tutor card and picture are not one .bt-tflow column');
    if (!/class="bt bt-tt"/.test(tu) || tagOf(tu, /class="press btf"/g) < 4) bad.push(id + ': tutor title/buttons untagged');
    if (!/class="bt-tgrid"/.test(tu) || !/class="press bt-tvoice"/.test(tu) || !/class="float bt-tq"/.test(tu)) bad.push(id + ': tutor layout hooks missing');
    if (!q.kind) {
      const b = show(q, 'boss', t);
      if (!/class="rise bt-boss"/.test(b) || tagOf(b, /class="press ans btf"/g) !== EQD.qa(q).answers.length) bad.push(id + ': boss card/answers untagged');
      scr.push(b);
    }
    scr.forEach((x, i) => { const m = btfWithoutFs(x); if (m.length) bad.push(id + ` screen ${i}: .btf without --fs: ` + m[0].slice(0, 90)); });
  }
}
ok(`${seen} questions × challenge/hint/tutor/boss in 3 languages carry their tags`, bad.length === 0, bad.slice(0, 5).join(' | '));
ok('the sweep really covered every topic and every format', seen === LANGS.length * topics.reduce((n, t) => n + (EQD.ALT_TOPICS[t] ? 12 : 6), 0), String(seen));

group('long answers grow less than short ones (one word cannot wrap)');
(() => {
  const num = (re, a) => { const m = re.exec(EQS.ansFont(a, 38)); return m ? Number(m[1]) : NaN; };
  const bz = a => num(/--bz:([\d.]+)/, a);
  const fsz = a => num(/--fs:(\d+)px/, a);
  ok('a number grows by a quarter', bz('12') === 1.25 && fsz('12') === 38);
  ok('a short word grows by a quarter', bz('Mars') === 1.25);
  ok('a 5–6 letter word grows less', bz('Юпитер') < 1.25 && bz('Юпитер') >= 1.1);
  ok('a long word grows least', bz('Млекопитающее') <= bz('Космос') && bz('Млекопитающее') > 1);
  ok('the --fs is the same size the button already uses', ['12', 'Mars', 'Юпитер', 'Млекопитающее'].every(a => new RegExp(`font:800 ${fsz(a)}px`).test(EQS.ansFont(a, 38))));
})();

/* ── 6 · the stylesheet ── */
group('css/app.css has the rules the tags point at');
(() => {
  const css = fs.readFileSync(path.join(ROOT, 'css', 'app.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = sel => { const m = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}').exec(css); return m ? m[1] : null; };
  const has = (sel, re) => { const r = rule(sel); return !!r && re.test(r); };
  ok('.bigtext .bt grows running text by a quarter', has('.bigtext .bt', /zoom:\s*1\.25\b/));
  ok('.bigtext .btf grows labels from --fs × --bz', has('.bigtext .btf', /font-size:\s*calc\(var\(--fs\)\s*\*\s*var\(--bz,\s*1\.25\)\)\s*!important/));
  ok('the challenge card grows upward (anchored above the answers)', has('.bigtext .bt-card', /top:\s*auto\s*!important/) && has('.bigtext .bt-card', /bottom:/));
  ok('the boss card grows upward', has('.bigtext .bt-boss', /top:\s*auto\s*!important/) && has('.bigtext .bt-boss', /bottom:/));
  ok('a hands-on card grows upward rather than scrolling Done away', has('.bigtext .bt-hands', /top:\s*auto\s*!important/) && has('.bigtext .bt-hands', /max-height:[^;]*!important/));
  ok('the tutor column is inert when big text is off', has('.bt-tflow', /display:\s*contents/));
  ok('…and a real column when it is on', has('.bigtext .bt-tflow', /display:\s*flex/) && has('.bigtext .bt-tflow', /flex-direction:\s*column/));
  ok('nothing is scaled outside body.bigtext', !/(^|})\s*\.bt[a-z-]*\s*\{[^}]*(zoom|font-size)/.test(css));
})();

/* ── 7 · shipping ── */
group('it ships with the app');
(() => {
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const m = /const CACHE = 'eduquest-v(\d+)'/.exec(sw);
  ok('sw.js cache has been bumped past v21 (clients must fetch the new css/js)', m && Number(m[1]) >= 22, m && m[0]);
  const src = fs.readFileSync(path.join(JS, 'app.js'), 'utf8');
  const bootBody = src.slice(src.indexOf('  boot() {'), src.indexOf('  autotest() {'));
  ok('boot applies it (not only the switch)', /this\.applyBig\(\)/.test(bootBody));
})();

console.log('\n' + (fail ? `${fail} FAILED, ${pass} passed` : `ALL ${pass} CHECKS PASSED`));
process.exit(fail ? 1 : 0);
