/* EduQuest — regression test for the two sound switches: music and sound effects.
   Run it with:  node test/sound.js      (no dependencies, no build step)

   Why this file exists: the parent settings showed "Music · Forest theme · 40%" in a
   game that had no music. The switch really silenced the effect cues, so a grown-up
   turning "music" off switched every sound off, and one leaving it on was promised a
   melody that never played. js/sound.js now holds both — SFX (the cues, settings.sfx)
   and EQM (a synthesized forest melody, settings.music) — and every way it can go
   wrong is inaudible in a test run and easy to miss by ear:

     1. the switches leak into each other again (music off silences the cues, or the
        cues' switch starts the melody);
     2. "40%" stops being true, or calm mode stops making it softer;
     3. the melody plays before the first touch (browsers refuse it — and a context
        made before a gesture would sit there suspended);
     4. the melody plays over the rest screen, or from a hidden tab;
     5. the audio context is left running with nothing playing (battery);
     6. a transfer code or backup written before the split reads the new switch wrong —
        transfer.js is append-only, so old codes must keep reading.

   The AudioContext is a fake that records every oscillator, every gain node, what
   each is connected to and every value a gain was asked to move to. It obeys the
   autoplay rule: resume() only works once a gesture has happened. */

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
const near = (a, b) => Math.abs(a - b) < 1e-6;

/* timers are queued, not run: a test decides when "later" happens */
let timers = [];
const flush = () => { const t = timers; timers = []; t.forEach(x => x.f()); };

/* the fake audio engine */
let gesture = false;
let ctxs = [];
function Param() { this.log = []; this.value = 1; }
Param.prototype.setValueAtTime = function (v, t) { this.log.push(['set', v, t]); this.value = v; };
Param.prototype.exponentialRampToValueAtTime = function (v, t) { this.log.push(['ramp', v, t]); this.value = v; };
Param.prototype.setTargetAtTime = function (v, t, k) { this.log.push(['target', v, t, k]); this.value = v; };
Param.prototype.cancelScheduledValues = function () {};
function FakeCtx() {
  this.state = gesture ? 'running' : 'suspended';
  this.currentTime = 0;
  this.destination = { dest: true };
  this.oscs = []; this.gains = [];
  this.suspends = 0;
  ctxs.push(this);
}
FakeCtx.prototype.resume = function () { if (gesture) this.state = 'running'; return Promise.resolve(); };
FakeCtx.prototype.suspend = function () { this.state = 'suspended'; this.suspends++; return Promise.resolve(); };
FakeCtx.prototype.createGain = function () {
  const g = { gain: new Param(), to: null, cut: false, connect(n) { this.to = n; }, disconnect() { this.to = null; this.cut = true; } };
  this.gains.push(g); return g;
};
FakeCtx.prototype.createOscillator = function () {
  const o = { type: '', frequency: { value: 0 }, to: null, at: null, connect(n) { this.to = n; }, start(t) { this.at = t; }, stop() {} };
  this.oscs.push(o); return o;
};

const docListeners = {};
const el = () => ({ style: {}, innerHTML: '', setAttribute() {}, classList: { toggle() {}, add() {}, remove() {} } });
const sandbox = {
  document: {
    hidden: false, title: '', documentElement: {}, body: { classList: { toggle() {}, add() {}, remove() {} } },
    getElementById: id => (String(id).indexOf('eqi-') === 0 ? null : el()),
    addEventListener(ev, f) { (docListeners[ev] = docListeners[ev] || []).push(f); }
  },
  localStorage: {
    _m: {},
    getItem(k) { return Object.prototype.hasOwnProperty.call(this._m, k) ? this._m[k] : null; },
    setItem(k, v) { this._m[k] = String(v); },
    removeItem(k) { delete this._m[k]; }
  },
  navigator: {}, console, Math, JSON, Date, Object, Array, String, Number, Set, Promise,
  isNaN, parseInt, parseFloat,
  setTimeout: (f, ms) => { timers.push({ f, ms }); return timers.length; }, clearTimeout: () => {},
  setInterval: () => 0, clearInterval: () => {},
  addEventListener() {}, matchMedia: () => ({ matches: false, addListener() {} }),
  location: { search: '', hash: '', pathname: '/' }, history: { replaceState() {} }, URLSearchParams,
  innerWidth: 402, innerHeight: 874,
  AudioContext: FakeCtx
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

/* the same files, in the same order, as index.html */
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const FILES = [...html.matchAll(/<script src="js\/([^"]+)"><\/script>/g)].map(m => m[1]);
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
vm.runInContext('this.EQ = EQ; this.EQS = EQS; this.EQT = EQT; this.EQP = EQP; this.EQX = EQX; this.EQV = EQV; this.EQM = EQM; this.SFX = SFX; this.EQ_DEFAULTS = EQ_DEFAULTS; this.EQI = EQI; this.EQP_STATE_KEY = EQP_STATE_KEY; this.TX = TX;', sandbox);
const { EQ, EQS, EQT, EQP, EQX, EQV, EQM, SFX, EQ_DEFAULTS, EQI } = sandbox;
const store = sandbox.localStorage;

const fire = ev => (docListeners[ev] || []).forEach(f => f());
const touch = () => { gesture = true; fire('pointerdown'); };
const ctx = () => SFX.ctx;
const dest = () => ctx().destination;
/* an oscillator's own gain node decides where it goes: straight out = a cue, into the bus = music */
const cues = () => (ctx() ? ctx().oscs.filter(o => o.to && o.to.to === dest()) : []);
const tune = () => (ctx() ? ctx().oscs.filter(o => o.to && o.to.to && o.to.to !== dest()) : []);
const peak = o => (o.to.gain.log.find(x => x[0] === 'ramp') || [])[1];
const busLevel = () => (EQM.bus ? EQM.bus.gain.value : null);

/* a clean device, booted the way a phone boots it — and nobody has touched it yet */
const device = (settings, screen) => {
  store._m = {}; timers = []; ctxs = []; gesture = false;
  Object.keys(docListeners).forEach(k => delete docListeners[k]);
  sandbox.document.hidden = false;
  SFX.ctx = null; SFX.busy = 0;
  Object.assign(EQM, { unlocked: false, playing: false, ducked: false, bus: null, timer: null, gen: 0 });
  EQP.ids = ['p1']; EQP.active = 'p1';
  const st = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  st.onboarded = true; st.heroName = 'Aysel'; st.lastDay = EQ.dayKey();
  st.track = { start: EQ.dayKey(), days: {} };
  Object.assign(st.settings, { bedtime: false, limit: 0 }, settings || {});
  store.setItem(sandbox.EQP_STATE_KEY, JSON.stringify(st));
  sandbox.location.search = screen ? '?screen=' + screen : '?screen=map';
  EQ.s = null; EQ.current = null;
  EQ.toast = () => {};
  EQ.boot();
  timers = [];
};

/* ── 1 · two switches, two jobs ── */
group('the effects switch and the music switch are independent');
(() => {
  ok('both are on by default', EQ_DEFAULTS.settings.music === true && EQ_DEFAULTS.settings.sfx === true);

  device({ music: true, sfx: false });
  touch();
  SFX.tap(); SFX.correct(); SFX.fanfare();
  ok('effects off, music on: no cue plays', cues().length === 0, cues().length);
  ok('…but the melody does', EQM.playing && tune().length > 0);

  device({ music: false, sfx: true });
  touch();
  SFX.tap();
  ok('music off, effects on: the cue plays', cues().length === 1);
  ok('…and no melody starts', !EQM.playing && tune().length === 0);

  device({ music: true, sfx: true });
  touch();
  EQ.ptoggle('sfx');
  ok('switching the effects off leaves the music switch alone', EQ.s.settings.music === true && EQ.s.settings.sfx === false);
  ok('…and the melody keeps playing', EQM.playing);
  const before = cues().length;
  SFX.tap();
  ok('…while the cues are really silent', cues().length === before);
  EQ.ptoggle('music');
  ok('switching the music off leaves the effects switch alone', EQ.s.settings.sfx === false && EQ.s.settings.music === false);
  ok('…and stops the melody at once', !EQM.playing && EQM.bus === null);
  EQ.ptoggle('sfx');
  const n = cues().length;
  SFX.tap();
  ok('effects back on with music off: cues play, melody stays off', cues().length === n + 1 && !EQM.playing);
  EQ.ptoggle('music');
  ok('music back on: the melody returns', EQM.playing);
})();

/* ── 2 · 40% means 40% ── */
group('the melody sits at the level the settings say');
(() => {
  device({ music: true, sfx: true });
  touch();
  ok('the bus is headed for 0.4 (40% of the effects)', near(busLevel(), 0.4), busLevel());
  const melody = tune().filter(o => o.type === 'sine').map(peak);
  ok('…with melody notes written at the effect cues\' own scale (0.07)', melody.length && melody.every(v => near(v, 0.07)), melody.join(','));
  ok('…so what reaches the speaker is 0.4 × a cue', near(0.07 * busLevel(), 0.028));
  ok('the settings line says 40%', /40%/.test(EQS.screens.parent_settings(EQ.s)));

  EQ.ptoggle('calm');
  ok('calm mode softens the melody to 0.2', near(busLevel(), 0.2), busLevel());
  ok('…and the settings line says so', /20%/.test(EQS.screens.parent_settings(EQ.s)) && !/· 40%/.test(EQS.screens.parent_settings(EQ.s)));
  SFX.tap();
  ok('calm mode really softens the cues too ("softer sounds")', near(peak(cues()[cues().length - 1]), 0.0125), peak(cues()[cues().length - 1]));
  ok('calm mode slows the melody', EQM.bpm() < EQM.BPM);
  EQ.ptoggle('calm');
  ok('calm off: back to 0.4', near(busLevel(), 0.4));

  EQV.speaking = true; EQV.duck();
  ok('while Questy reads a question aloud the melody steps back', busLevel() < 0.2, busLevel());
  EQV.stop();
  ok('…and comes back when the voice stops', near(busLevel(), 0.4), busLevel());
})();

/* ── 3 · nothing before the first touch ── */
group('the melody never starts before a touch (autoplay rule)');
(() => {
  device({ music: true, sfx: true });
  EQ.go('map'); EQ.go('quest');
  ok('navigating before any touch: no melody', !EQM.playing);
  ok('…and no audio context made just for it', ctxs.length === 0 || tune().length === 0);
  touch();
  ok('the first touch starts it', EQM.playing && ctx().state === 'running');
  const bus = EQM.bus;
  ok('…fading in from silence, not starting on a jolt', bus.gain.log[0][0] === 'set' && bus.gain.log[0][1] <= 0.001);
  touch();
  ok('a second touch does not start a second copy', EQM.bus === bus);
})();

/* ── 4 · the rest screen and a hidden tab are silent ── */
group('the rest screen and a hidden tab stop the music');
(() => {
  device({ music: true, sfx: true });
  touch();
  EQ.go('restday');
  ok('the rest screen stops the melody', !EQM.playing && EQM.bus === null);
  flush();
  ok('…and once the fade is done the audio context is suspended', ctx().state === 'suspended');
  EQ.go('map');
  ok('leaving the rest screen brings it back', EQM.playing);

  /* the real path: the limit is reached and the router sends the child to rest */
  device({ music: true, sfx: true, limit: 15 });
  EQ.s.track.days[EQ.dayKey()] = { secs: 16 * 60 };
  touch();
  EQ.go('quest');
  ok('a reached limit reroutes to the rest screen…', EQ.current === 'restday');
  ok('…and the rest screen is silent', !EQM.playing);
  touch();
  ok('a touch on the rest screen does not start it again', !EQM.playing);

  device({ music: true, sfx: true });
  touch();
  sandbox.document.hidden = true; fire('visibilitychange');
  ok('the tab is hidden: the melody stops', !EQM.playing);
  flush();
  ok('…and the audio context sleeps', ctx().state === 'suspended');
  const made = tune().length;
  flush();
  ok('…with no timer left queueing notes', tune().length === made && timers.length === 0);
  sandbox.document.hidden = false; fire('visibilitychange');
  ok('the tab is back: so is the melody', EQM.playing);
})();

/* ── 5 · the battery ── */
group('a quiet game costs the battery nothing');
(() => {
  device({ music: false, sfx: true });
  touch();
  SFX.tap();
  ctx().currentTime = 5;
  flush();
  ok('music off: after a cue the audio context is suspended again', ctx().state === 'suspended' && ctx().suspends > 0);
  SFX.tap();
  ok('the next cue wakes it', ctx().state === 'running');

  device({ music: true, sfx: true });
  touch();
  const t = timers.filter(x => x.ms > 1000);
  ok('while playing, one wake-up is queued per phrase (not a ticking timer)', t.length === 1 && t[0].ms > 4000, timers.map(x => x.ms).join(','));
  const phrase = EQM.TUNE[0];
  ok('…each phrase is handed to the audio clock at once', tune().length === phrase.m.filter(x => x[0]).length + phrase.b.length, tune().length);
  ok('…ahead of time, not as it plays', tune().some(o => o.at > 1));
  ctx().currentTime = 7;
  flush();
  ok('the next phrase follows on the clock without a gap', EQM.phrase === 2 && EQM.next > 11.5);
  ctx().currentTime = 12;
  SFX.sleep(); flush();
  ok('the context is never suspended under a playing melody', ctx().state === 'running');
})();

/* ── 6 · transfer: append-only ── */
group('transfer codes and files keep reading');
const packed = (music, sfx) => {
  const s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  s.onboarded = true; s.heroName = 'Leyla'; s.settings.music = music; s.settings.sfx = sfx;
  s.track = { start: EQ.dayKey(), days: {} }; s.lastDay = EQ.dayKey();
  return EQX.pack(s, 0);
};
(() => {
  [[true, true], [true, false], [false, true], [false, false]].forEach(([m, x]) => {
    const r = EQX.clean(EQX.unpack(packed(m, x)));
    ok(`code round trip: music ${m ? 'on' : 'off'}, effects ${x ? 'on' : 'off'}`, r && r.settings.music === m && r.settings.sfx === x);
  });
  /* written by the build before this change: bit 8 was "music" and silenced everything */
  const OLD_ON = '1_Leyla_F2C49B.4A2E20.3DBE6E.2A9455.5B3FD6.0.0_FF9243.F0762A_0.4.0.1.1.0.0.0.0.0.0.0.0.0.0.0.0_1_r.19.xc.2.0_fze.0.2..___';
  const OLD_OFF = OLD_ON.replace('_r.19.', '_j.19.');
  const a = EQX.clean(EQX.unpack(OLD_ON)), b = EQX.clean(EQX.unpack(OLD_OFF));
  ok('an old code with "music" on arrives with music and effects on', a && a.settings.music === true && a.settings.sfx === true);
  ok('an old code with "music" off arrives silent — effects off too, as before', b && b.settings.music === false && b.settings.sfx === false);
  ok('…its neighbours in the same flags are unchanged', a.settings.readAloud && a.settings.bigText && a.settings.bedtime && !a.settings.calm && a.settings.lang === 'ru' && a.heroName === 'Leyla');
  const code = packed(false, true);
  const sf = EQX.n(code.split('_')[6].split('.')[0]);
  ok('a new code keeps the old bits where they were (an older reader still finds music at 8)', (sf & 8) === 0 && (sf & 1) === 1 && (sf & 16) === 16);

  const file = st => JSON.stringify({ app: 'eduquest', made: '2026-09-20', profiles: [{ state: Object.assign(JSON.parse(JSON.stringify(EQ_DEFAULTS)), { onboarded: true, heroName: 'Leyla', settings: st }) }] });
  const legacy = m => { const st = Object.assign({}, EQ_DEFAULTS.settings, { music: m }); delete st.sfx; return st; };
  ok('an old backup file with music off reads silent', EQX.readBundle(file(legacy(false))).states[0].settings.sfx === false);
  ok('an old backup file with music on reads with effects', EQX.readBundle(file(legacy(true))).states[0].settings.sfx === true);
  ok('a new file carries the effects switch on its own', EQX.readBundle(file(Object.assign({}, EQ_DEFAULTS.settings, { music: true, sfx: false }))).states[0].settings.sfx === false);

  /* a phone updated in place: the saved state has no sfx yet */
  const st = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  st.onboarded = true; st.settings.music = false; delete st.settings.sfx;
  store._m = {}; store.setItem(sandbox.EQP_STATE_KEY, JSON.stringify(st));
  EQP.ids = ['p1']; EQP.active = 'p1'; EQ.load();
  ok('a saved game with "music" off stays silent after the update', EQ.s.settings.sfx === false && EQ.s.settings.music === false);
  st.settings.music = true;
  store.setItem(sandbox.EQP_STATE_KEY, JSON.stringify(st)); EQ.load();
  ok('a saved game with "music" on keeps its effects', EQ.s.settings.sfx === true);
})();

/* ── 7 · the settings screen tells the truth ── */
group('the settings say what the switches do — in all three languages');
(() => {
  device({ music: true, sfx: true }, 'parent_settings');
  ['az', 'en', 'ru'].forEach(l => {
    EQI.set(l);
    const h = EQS.screens.parent_settings(EQ.s);
    ok(`${l}: one switch for music, one for effects`, /ptoggle\('music'\)/.test(h) && /ptoggle\('sfx'\)/.test(h));
    ok(`${l}: no "cosmetics" purchases line any more`, !/kosmetika|Cosmetics|косметика/i.test(h));
    ok(`${l}: the money row opens its own screen`, /EQ\.go\('parent_money'\)/.test(h));
    const m = EQS.screens.parent_money(EQ.s);
    ok(`${l}: the money screen says no real-money purchases and no ads`,
      { az: /Real pulla heç bir alış yoxdur[\s\S]*Reklam yoxdur/, en: /No real-money purchases[\s\S]*No ads/, ru: /Никаких покупок[\s\S]*Никакой рекламы/ }[l].test(m));
    const g = EQS.screens.parent_gate(EQ.s);
    ok(`${l}: the grown-up gate no longer promises "purchases are made here"`, !/Alışlar yalnız|Purchases are only|Покупки совершаются|alışlar buradadır|and purchases|и покупки/.test(g));
  });
  EQI.set('az');
})();

/* ── 8 · shipping ── */
group('it ships with the app');
(() => {
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  ok('sw.js precaches js/sound.js', /'\.\/js\/sound\.js'/.test(sw));
  const m = /const CACHE = 'eduquest-v(\d+)'/.exec(sw);
  ok('sw.js cache bumped past v22', m && Number(m[1]) >= 23, m && m[0]);
  ok('index.html loads sound.js before app.js', FILES.indexOf('sound.js') >= 0 && FILES.indexOf('sound.js') < FILES.indexOf('app.js'));
  const app = fs.readFileSync(path.join(JS, 'app.js'), 'utf8');
  ok('app.js no longer carries its own copy of SFX', !/const SFX\s*=/.test(app));
  ok('the effects answer to settings.sfx, not settings.music', /off\(\)\s*\{\s*return !EQ\.s\.settings\.sfx/.test(fs.readFileSync(path.join(JS, 'sound.js'), 'utf8')));
})();

console.log('\n' + (fail ? `${fail} FAILED, ${pass} passed` : `ALL ${pass} CHECKS PASSED`));
process.exit(fail ? 1 : 0);
