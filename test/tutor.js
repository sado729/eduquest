/* EduQuest — regression test for the tutor's voice button and its header.
   Run it with:  node test/tutor.js       (no dependencies, no build step)

   Why this file exists: the tutor screen (21) carried two microphone buttons — one in the
   corner, one big "hold to talk to Questy" bar — and both only ever showed a toast saying
   hold-to-talk "is coming with voice support". A child was handed a promise nobody kept.
   Real listening is not on the table: browser speech recognition (Chrome, and so the
   Android TWA) streams the child's voice to Google's servers, needs a connection, and
   has no usable Azerbaijani model for a six-year-old — while the game tells the family
   that nothing leaves the device. So the buttons became the one honest thing they can
   be: "Questy, read it" — the explanation read aloud by js/speech.js, on the device.

   What breaks silently here:
     1. the bar comes back as a promise (a mic, "coming", "tezliklə", a toast);
     2. the bar reads something other than the explanation on the card — or, in Söz
        Vadisi, reads the explanation that states the answer;
     3. the bar shows with nothing behind it — switch off, no voice of this language,
        no speech API — and a tap does nothing;
     4. anything starts listening (SpeechRecognition) and the privacy promise is broken;
     5. the header says "PARENT-APPROVED" on explanations no grown-up ever saw — it is
        only true of a mission a parent approved on screen 26. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const JS = path.join(__dirname, '..', 'js');

/* ── harness ── */
let pass = 0, fail = 0;
const group = name => console.log('\n' + name);
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  -> ' + extra : '')); }
};

/* timers are queued, not run, so a test can change screens *between* a start and its
   delayed speak — exactly the race the real Chrome workaround opens */
let timers = [];
const flush = () => { const t = timers; timers = []; t.forEach(f => f()); };

/* the fake engine */
const V = (lang, name, local, dflt) => ({ lang, name: name || lang, voiceURI: name || lang, localService: local !== false, default: !!dflt });
const engine = {
  voices: [], spoken: [], cancels: 0, listeners: {}, paused: false,
  getVoices() { return this.voices; },
  speak(u) { this.spoken.push(u); },
  cancel() { this.cancels++; },
  resume() { this.paused = false; },
  addEventListener(ev, f) { (this.listeners[ev] = this.listeners[ev] || []).push(f); },
  fire(ev) { (this.listeners[ev] || []).forEach(f => f()); }
};
function Utterance(text) { this.text = text; }

const el = () => ({ style: {}, innerHTML: '', setAttribute() {}, classList: { toggle() {} } });
const docListeners = {};
const sandbox = {
  document: {
    hidden: false, title: '', documentElement: {}, body: { classList: { toggle() {} } },
    getElementById: id => (String(id).indexOf('eqi-') === 0 ? null : el()),
    addEventListener(ev, f) { (docListeners[ev] = docListeners[ev] || []).push(f); }
  },
  localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; }, removeItem(k) { delete this._m[k]; } },
  navigator: {}, console, Math, JSON, Date, Object, Array, String, Number, Set,
  isNaN, parseInt, parseFloat, setTimeout: f => { timers.push(f); return timers.length; }, clearTimeout: () => {},
  setInterval: () => 0, clearInterval: () => {},
  addEventListener() {}, matchMedia: () => ({ matches: false, addListener() {} }),
  AudioContext: function () {}, location: { search: '', hash: '', pathname: '/' }, history: { replaceState() {} }, URLSearchParams,
  innerWidth: 402, innerHeight: 874,
  speechSynthesis: engine, SpeechSynthesisUtterance: Utterance
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const FILES = ['i18n.js', 'components.js', 'data.js', 'regions.js', 'tracking.js', 'profiles.js', 'qr.js',
  'transfer.js', 'screens-onboarding.js', 'screens-world.js', 'interact.js', 'speech.js', 'screens-play.js',
  'screens-collect.js', 'parent.js', 'sound.js', 'app.js'];
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
vm.runInContext('this.EQ = EQ; this.EQD = EQD; this.EQS = EQS; this.EQT = EQT; this.EQV = EQV; this.EQ_DEFAULTS = EQ_DEFAULTS; this.TX = TX; this.EQI = EQI; this.EQIX = EQIX;', sandbox);
const { EQ, EQD, EQS, EQT, EQV, EQ_DEFAULTS, TX, EQI } = sandbox;

const LANGS = ['az', 'en', 'ru'];
const ALL_VOICES = [V('az-AZ', 'Banu'), V('en-US', 'Samantha', true, true), V('ru-RU', 'Milena')];
const realGo = EQ.go;
const realRest = EQ.restGuard;

const fresh = (voices, lang) => {
  engine.voices = voices === undefined ? ALL_VOICES.slice() : voices;
  engine.spoken = []; engine.cancels = 0; engine.listeners = {};
  timers = [];
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.onboarded = true;
  EQ.s.settings.music = false;
  EQ.save = () => {};
  EQ.toast = () => {};
  EQ.current = 'map';
  EQ.go = realGo;
  EQ.restGuard = () => false;
  EQ.checkNewDay = () => false;
  Object.assign(EQ.session, { mission: null, region: null, ctx: 'daily', q: null, qIdx: -1, qKey: null, answering: false, tutorWhy: false });
  EQT.init(EQ.s);
  EQI.set(lang || 'az');
  EQV.voices = []; EQV.ready = false; EQV.speaking = false; EQV.lastKey = null;
  EQV.init();
  timers = timers.filter(() => false); /* drop init's safety timeout */
};
const said = () => { flush(); return engine.spoken.map(u => u.text); };
const html = () => EQS.screens[EQ.current](EQ.s);


const rendered = () => { EQ.current = 'tutor'; return html(); };
const toTutor = () => { EQ.go('challenge'); flush(); EQ.go('tutor'); engine.spoken = []; };
/* anything on the screen that promises a voice feature instead of doing one */
const PROMISE = /coming|soon|tezliklə|gələcək|gəlir|скоро|появится|hold to talk|basıb.saxla|удерживай/i;
const MIC = 'M12 4 a4 4 0 0 1 4 4 v3 a4 4 0 0 1 -8 0 V8';
const LABEL = { az: 'Questy oxusun', en: 'Let Questy read it', ru: 'Пусть Квести прочитает' };
const STOP = { az: 'Dayandır', en: 'Stop', ru: 'Стоп' };
const APPROVED = { az: 'VALİDEYN TƏSDİQLİ', en: 'PARENT-APPROVED', ru: 'ОДОБРЕНО РОДИТЕЛЯМИ' };

/* ── 1 · the bar is a real button ── */
group('the tutor bar reads the explanation, in every language');
(() => {
  LANGS.forEach(l => {
    fresh(undefined, l);
    toTutor();
    const h = rendered();
    ok(`${l}: the bar is there, labelled "${LABEL[l]}"`, /id="eqv-big"/.test(h) && h.indexOf(LABEL[l]) > 0);
    ok(`${l}: the bar and the corner are not microphones any more`, h.indexOf(MIC) < 0);
    ok(`${l}: nothing on the screen promises a voice feature`, !PROMISE.test(h.replace(/<[^>]*>/g, ' ')), (h.replace(/<[^>]*>/g, ' ').match(PROMISE) || [])[0]);
    ok(`${l}: the bar's tap goes to the voice, not to a toast`, /id="eqv-big" onclick="EQV\.tap\(\)"/.test(h) && !/EQ\.toast\([^)]*🎤/.test(h));

    const q = EQ.session.q;
    ok(`${l}: the question has its own explanation (a real text to read)`, !!(q.explain && TX(q.explain.text)));
    EQV.tap();
    const s = said();
    const want = EQV.clean(TX(q.explain.title)) + ' ' + EQV.clean(TX(q.explain.text));
    ok(`${l}: a tap reads the card — its heading, then its explanation`, s.length === 1 && s[0] === want, JSON.stringify(s) + ' vs ' + JSON.stringify(want));
    ok(`${l}: in the ${l} voice`, engine.spoken[0].lang.toLowerCase().indexOf(l) === 0, engine.spoken[0].lang);

    EQ.session.tutorWhy = true;
    engine.spoken = []; EQV.speaking = false;
    EQV.tap();
    const w = said();
    ok(`${l}: after "Why?" the bar reads the why too`, w.length === 1 && w[0] === want + ' ' + EQV.clean(TX(q.explain.why)), JSON.stringify(w));
    EQ.session.tutorWhy = false;
  });
})();

/* ── 2 · the bar shows what it is doing ── */
group('while Questy reads, the bar says "Stop" and stops');
(() => {
  LANGS.forEach(l => {
    fresh(undefined, l);
    toTutor();
    EQV.tap(); flush();
    ok(`${l}: speaking → the bar reads "${STOP[l]}"`, EQV.speaking && rendered().indexOf('>' + STOP[l] + '<') > 0);
    const c = engine.cancels;
    EQV.tap();
    ok(`${l}: a second tap hushes it and the label comes back`, engine.cancels > c && !EQV.speaking && rendered().indexOf('>' + LABEL[l] + '<') > 0);
  });

  /* paintBtn updates the label in place, without a redraw */
  fresh();
  toTutor();
  const lbl = { textContent: LABEL.az }, wave = { o: null, setAttribute(k, v) { this.o = v; } };
  const qsa = sandbox.document.querySelectorAll;
  sandbox.document.querySelectorAll = sel => (sel === '.eqv-lbl' ? [lbl] : sel === '.eqv-wave' ? [wave] : []);
  EQV.tap(); flush();
  ok('the label turns to "Dayandır" the moment speech starts', lbl.textContent === STOP.az && wave.o === '1', lbl.textContent);
  engine.spoken[0].onend();
  ok('…and back to "Questy oxusun" when it ends', lbl.textContent === LABEL.az && wave.o === '0.55', lbl.textContent);
  sandbox.document.querySelectorAll = qsa;
})();

/* ── 3 · Söz Vadisi: the explanation states the answer ── */
group('in Söz Vadisi the bar never reads the answer');
(() => {
  fresh();
  EQ.s.trophiesEarned = 1; EQ.s.level = 20;
  EQ.openRegion('valley'); EQ.startRegionQuestion();
  let checked = 0, leaked = [];
  const e = EQ.region('valley');
  for (let round = 0; round < 6; round++) {
    e.round = round;
    EQ.regionSet('valley').questions.forEach(q => LANGS.forEach(l => {
      if (q.subj !== 'reading' || !q.explain) return;
      EQI.set(l);
      EQ.session.q = q; EQ.session.tutorWhy = false;
      engine.spoken = []; EQV.speaking = false;
      if (!/id="eqv-big"/.test(rendered())) { leaked.push(l + ': no bar'); return; }
      EQV.tap();
      const s = said().join(' ');
      checked++;
      if (!s || s.indexOf(EQV.clean(TX(q.explain.text))) >= 0) leaked.push(l + ': ' + (s || '(silent)'));
    }));
  }
  ok('reading questions were reached on the tutor', checked >= 60, String(checked));
  ok('the bar reads the heading, never the explanation that states the answer', leaked.length === 0, leaked.slice(0, 2).join(' | '));
})();

/* ── 4 · nothing behind it → no bar ── */
group('no voice, no bar — and never a promise in its place');
(() => {
  const noBar = (name, lang) => {
    const h = rendered();
    ok(`${name}: no bar`, !/id="eqv-big"/.test(h) && !/eqv-btn/.test(h));
    ok(`${name}: no microphone and no "coming" in its place`, h.indexOf(MIC) < 0 && !PROMISE.test(h.replace(/<[^>]*>/g, ' ')));
    ok(`${name}: the rest of the tutor is still there`, /id="tutor-card"/.test(h) && /class="bt-tgrid"/.test(h));
  };
  fresh(); EQ.s.settings.readAloud = false; toTutor();
  noBar('the switch is off');
  fresh([V('en-US'), V('ru-RU'), V('tr-TR')], 'az'); toTutor();
  noBar('az with no Azerbaijani voice (the usual phone)');
  ok('…and no Turkish voice stands in for it', engine.spoken.length === 0);
  fresh([], 'en'); toTutor();
  noBar('a device with no voices');
  const keep = sandbox.speechSynthesis;
  delete sandbox.speechSynthesis;
  fresh(undefined, 'ru'); toTutor();
  noBar('a browser with no speech API');
  sandbox.speechSynthesis = keep;
})();

/* ── 5 · bigger text: the bar steps aside for the card's small speaker ── */
group('bigger text keeps a way to hear it');
(() => {
  fresh(); toTutor();
  const h = rendered();
  ok('the bar carries the class bigger text hides', /class="press bt-tvoice" id="eqv-big"/.test(h));
  ok('the card keeps a small speaker, hidden unless the text is bigger', /class="press eqv-bigonly" id="eqv-btn"/.test(h));
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'app.css'), 'utf8');
  ok('css: .eqv-bigonly is hidden in normal mode', /\.eqv-bigonly\{display:none !important\}/.test(css));
  ok('css: …and shown in bigger text', /\.bigtext \.eqv-bigonly\{display:flex !important\}/.test(css));
  ok('css: the bar hides in bigger text (its room goes to the explanation)', /\.bigtext \.bt-tvoice\{display:none !important\}/.test(css));
})();

/* ── 6 · "PARENT-APPROVED" only where a parent approved ── */
group('"PARENT-APPROVED" only on a parent\'s mission');
(() => {
  LANGS.forEach(l => {
    fresh(undefined, l); toTutor();
    ok(`${l}: a daily question's tutor does not claim a parent's approval`, rendered().indexOf(APPROVED[l]) < 0);
    EQ.session.ctx = 'boss';
    ok(`${l}: nor a guardian's`, rendered().indexOf(APPROVED[l]) < 0);

    fresh(undefined, l);
    EQ.s.trophiesEarned = 1; EQ.s.level = 20;
    EQ.openRegion('island'); EQ.startRegionQuestion(); EQ.go('tutor');
    ok(`${l}: nor a region round's`, EQ.session.ctx === 'region' && rendered().indexOf(APPROVED[l]) < 0, EQ.session.ctx);

    fresh(undefined, l);
    EQ.s.parentQuests = [{ t: 'add', day: EQ.dayKey(), n: 0, done: false }];
    EQ.openMission('add', EQ.dayKey()); EQ.startMissionQuestion(); EQ.go('tutor');
    ok(`${l}: a mission the parent approved says so`, EQ.session.ctx === 'mission' && rendered().indexOf(APPROVED[l]) > 0, EQ.session.ctx);
  });
})();

/* ── 7 · the privacy promise ── */
group('nothing listens — the child\'s voice never leaves the device');
(() => {
  const files = fs.readdirSync(JS).filter(f => /\.js$/.test(f));
  const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const hits = files.filter(f => /SpeechRecognition|getUserMedia|MediaRecorder/.test(strip(fs.readFileSync(path.join(JS, f), 'utf8'))));
  ok('no js/ file uses SpeechRecognition, getUserMedia or MediaRecorder', hits.length === 0, hits.join(', '));
  const play = fs.readFileSync(path.join(JS, 'screens-play.js'), 'utf8');
  const tutor = play.slice(play.indexOf('EQS.screens.tutor'), play.indexOf('EQS.meta.boss'));
  ok('the tutor screen source has no voice toast left', tutor.length > 500 && !/voiceToast|🎤/.test(tutor) && !PROMISE.test(tutor.replace(/\/\*[\s\S]*?\*\//g, '')));
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  const m = /eduquest-v(\d+)/.exec(sw);
  ok('sw.js cache bumped past v23', m && Number(m[1]) >= 24, m && m[0]);
})();

console.log('\n' + (fail ? `${fail} FAILED, ${pass} passed` : `ALL ${pass} CHECKS PASSED`));
process.exit(fail ? 1 : 0);
