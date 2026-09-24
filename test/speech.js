/* EduQuest — regression test for Questy reading the questions aloud.
   Run it with:  node test/speech.js      (no dependencies, no build step)

   Why this file exists: the parent settings had a "Read questions aloud" switch, on by
   default, and for a long time no line of code ever spoke. The switch was saved and even
   carried in a transfer code, so a parent reasonably believed a child who cannot read
   yet was being read to. js/speech.js is the voice behind it now, and every way it can
   fail is invisible on screen:

     1. the switch stops meaning anything — off still talks, or on never does;
     2. the voice outlives its screen — the question goes on being read over the success
        screen, over the rest screen, from a hidden tab;
     3. the wrong voice — an English (or Turkish) voice reading Azerbaijani text, which
        in a game that teaches the sounds of letters teaches the wrong sounds;
     4. the voice gives the answer away — in Söz Vadisi, saying the word on the card *is*
        the answer to "read the word", and reading the letter choices aloud turns "which
        letter?" into "which button?";
     5. the grown-up is told it works on a device with no voice for the language.

   speechSynthesis is stubbed: a fake engine that records every utterance and every
   cancel, with a voice list the test controls. */

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
  'screens-collect.js', 'parent.js', 'app.js'];
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

/* ── 1 · the text a voice gets ── */
group('HTML is cleaned before it is spoken');
(() => {
  fresh();
  ok('<br> becomes a pause, not the letters b-r', EQV.clean('Two lines.<br>How many now?') === 'Two lines. How many now?', EQV.clean('Two lines.<br>How many now?'));
  ok('a <br> after a question mark does not add a second stop', EQV.clean('Which one?<br>Tap it') === 'Which one? Tap it', EQV.clean('Which one?<br>Tap it'));
  ok('a <br> after a comma keeps the comma, no stray full stop', EQV.clean('buraxır,<br>sonra daha 4') === 'buraxır, sonra daha 4', EQV.clean('buraxır,<br>sonra daha 4'));
  ok('…and after an ellipsis', EQV.clean('2, 4, 6, 8…<br>Which next?') === '2, 4, 6, 8… Which next?', EQV.clean('2, 4, 6, 8…<br>Which next?'));
  ok('&#39; is an apostrophe', EQV.clean('I&#39;ll try again') === 'I\'ll try again', EQV.clean('I&#39;ll try again'));
  ok('named and hex entities decode', EQV.clean('A &amp; B &#x2014; C&nbsp;D') === 'A & B — C D', EQV.clean('A &amp; B &#x2014; C&nbsp;D'));
  ok('tags inside the text are dropped', EQV.clean('Bu <b>alma</b> <span style="color:#FFC24B">qırmızıdır</span>') === 'Bu alma qırmızıdır', EQV.clean('Bu <b>alma</b> <span style="color:#FFC24B">qırmızıdır</span>'));
  const emo = EQV.clean('BALIQ — bu, 🐟 deməkdir 🍎👩‍🚀🇦🇿 3️⃣');
  ok('emoji are removed (including ZWJ sequences, flags and keycaps)', !/[\u{1F300}-\u{1FAFF}‍️⃣\u{1F1E6}-\u{1F1FF}]/u.test(emo) && /3$/.test(emo), emo);
  EQI.set('az');
  ok('a word in capitals is read as a word (az: İ → i, I → ı)', EQV.clean('Söz: BALIQ, İLAN') === 'Söz: balıq, ilan', EQV.clean('Söz: BALIQ, İLAN'));
  ok('a single capital letter is left alone', EQV.clean('Söz B hərfi ilə başlayır') === 'Söz B hərfi ilə başlayır');
  EQI.set('ru');
  ok('ru capitals lower too', EQV.clean('Слово РЫБА') === 'Слово рыба', EQV.clean('Слово РЫБА'));
  ok('nothing left but whitespace → nothing to say', EQV.clean('🐟 <br> 🍎') === '');
  EQI.set('az');
})();

/* ── 2 · which voice ── */
group('the voice matches the game language — or there is no voice');
(() => {
  fresh([V('en-US'), V('tr-TR', 'Yelda'), V('ru-RU')], 'az');
  ok('az with no az voice: no voice at all (no Turkish, no English)', EQV.voiceFor('az') === null);
  ok('…and the status says so', EQV.status() === 'novoice', EQV.status());
  EQ.s.settings.readAloud = true;
  EQ.go('challenge');
  ok('…and the question is not read in another language', said().length === 0, JSON.stringify(said()));
  ok('…and the question screen draws no speaker that would do nothing', html().indexOf('eqv-btn') < 0);

  fresh([V('en-US'), V('az_AZ', 'eSpeak az')], 'az');
  ok('an Android-style az_AZ tag is recognised', EQV.voiceFor('az') && EQV.voiceFor('az').name === 'eSpeak az');

  fresh([V('en-IN', 'IN', true), V('en-US', 'US-net', false), V('en-US', 'US-local', true), V('en-GB', 'GB', true)], 'en');
  ok('an offline voice beats a network one (the app is offline-first)', EQV.voiceFor('en').localService === true);
  ok('en-US / en-GB are preferred over other English', ['US-local', 'GB'].indexOf(EQV.voiceFor('en').name) >= 0, EQV.voiceFor('en').name);

  fresh(undefined, 'ru');
  EQ.go('challenge');
  const u = (flush(), engine.spoken[0]);
  ok('ru reads with the ru voice, and its lang is set too', u && u.voice.lang === 'ru-RU' && u.lang === 'ru-RU', u && u.lang);

  /* Chrome fills the list later: an empty first list must not be reported as "no voice" */
  fresh([], 'az');
  ok('before the voices load, the status is "loading", not a false "no voice"', EQV.status() === 'loading', EQV.status());
  ok('…and the settings subtitle does not claim there is no voice', EQV.note().bad === false);
  engine.voices = ALL_VOICES.slice();
  engine.fire('voiceschanged');
  ok('voiceschanged fills the list', EQV.status() === 'ok', EQV.status());
})();

/* ── 3 · the switch ── */
group('the parent switch decides');
(() => {
  fresh();
  EQ.s.settings.readAloud = false;
  EQ.go('challenge');
  ok('off: opening a question reads nothing', said().length === 0);
  ok('off: no speaker button on the question screen', html().indexOf('eqv-btn') < 0);
  EQ.go('hint');
  EQV.read('hint');
  ok('off: even a direct read of the hint says nothing', said().length === 0);

  fresh();
  ok('the default is on (a new child hears the questions)', EQ_DEFAULTS.settings.readAloud === true);
  EQ.go('challenge');
  const q = EQ.session.q;
  const s = said();
  ok('on: the question is read once as the screen opens', s.length === 1, JSON.stringify(s));
  ok('on: what is read is the question itself, cleaned', s[0] === EQV.clean(TX(q.title)), s[0]);
  ok('on: the speaker button is on the question screen', html().indexOf('eqv-btn') >= 0);

  /* the answer choices are never read */
  const ans = EQD.qa(q).answers.map(String);
  const choicesRead = ans.every(a => s[0].indexOf(a) >= 0) && EQV.clean(TX(q.title)).split(/\s+/).length < s[0].split(/\s+/).length;
  ok('the answer choices are not appended to what is read', !choicesRead && s[0] === EQV.clean(TX(q.title)));

  /* switching off mid-sentence stops at once; switching on plays a sample */
  EQ.current = 'parent_settings';
  const realRender = EQ.render;
  EQ.render = () => {};
  const before = engine.cancels;
  EQ.ptoggle('readAloud');
  ok('switching it off cancels the voice immediately', EQ.s.settings.readAloud === false && engine.cancels > before);
  engine.spoken = [];
  EQ.ptoggle('readAloud');
  const smp = said();
  ok('switching it on lets the grown-up hear a sample in the game language', smp.length === 1 && /Questy/.test(smp[0]), JSON.stringify(smp));
  EQ.render = realRender;
})();

/* ── 4 · the voice never outlives its screen ── */
group('the voice stops when the screen does');
(() => {
  fresh();
  EQ.go('challenge');
  flush();
  let c = engine.cancels;
  EQ.go('hint');
  ok('leaving the question cancels it', engine.cancels > c);
  ok('the hint screen does not start talking on its own', said().length === 1);

  fresh();
  EQ.go('challenge');           /* the speak is queued … */
  EQ.go('quest');               /* … and the child leaves before it starts */
  ok('a start still queued when the screen changes never speaks', said().length === 0);

  fresh();
  EQ.go('challenge'); flush();
  c = engine.cancels;
  EQ.restGuard = realRest;
  const realState = EQ.restState;
  EQ.restState = () => 'limit';
  EQ.go('quest');
  ok('the rest screen took over', EQ.current === 'restday');
  ok('…and silenced the voice', engine.cancels > c);
  ok('…and says nothing itself', said().length === 1);
  EQ.restState = realState;

  fresh();
  EQ.go('challenge'); flush();
  c = engine.cancels;
  EQ.resolve(true, null);
  ok('answering stops the question being read', engine.cancels > c);

  fresh();
  EQ.go('challenge'); flush();
  c = engine.cancels;
  EQ.setLang('en');
  ok('a language switch stops the sentence in the old language', engine.cancels > c);

  /* a redraw of the same question keeps talking; a new question starts over */
  fresh();
  EQ.go('challenge'); flush();
  c = engine.cancels;
  EQ.go('challenge');
  ok('re-opening the very same question does not restart it', engine.cancels === c && said().length === 1);
  fresh();
  EQ.s.challengesDone = 5;
  EQ.go('boss'); flush();
  const first = engine.spoken.length;
  EQ.s.bossHits = 1;
  EQ.go('boss');
  const s = said();
  ok('the next boss question is read as it arrives', s.length === first + 1 && s[s.length - 1] === EQV.clean(TX(EQ.session.q.title)), JSON.stringify(s));

  /* a hidden tab: boot wires visibilitychange; the handler must cancel */
  fresh();
  EQ.boot();
  timers = [];
  EQ.go('challenge'); flush();
  c = engine.cancels;
  sandbox.document.hidden = true;
  (docListeners.visibilitychange || []).forEach(f => f());
  sandbox.document.hidden = false;
  ok('hiding the tab cancels the voice', engine.cancels > c);
})();

/* ── 5 · where it reads ── */
group('question screens read; hint and tutor read on the button');
(() => {
  /* a mission and a region round play on the challenge screen too */
  fresh();
  EQ.s.parentQuests = [{ t: 'add', day: EQ.dayKey(), n: 0, done: false }];
  EQ.openMission('add', EQ.dayKey());
  EQ.startMissionQuestion();
  ok('a mission question is read', EQ.current === 'challenge' && said()[0] === EQV.clean(TX(EQ.session.q.title)));

  fresh();
  EQ.s.trophiesEarned = 1; EQ.s.level = 20;
  EQD.REGION_ORDER.forEach(r => {
    engine.spoken = [];
    EQ.openRegion(r);
    EQ.startRegionQuestion();
    const s = said();
    ok(`a ${r} round question is read`, EQ.current === 'challenge' && s.length === 1 && s[0] === EQV.clean(TX(EQ.session.q.title)), JSON.stringify(s));
  });

  /* the hands-on formats (js/interact.js) are read like any question */
  fresh();
  const kinds = {};
  for (let day = 1; day <= 30 && Object.keys(kinds).length < 3; day++) {
    EQD.genDay(day, EQT.plan(day)).questions.forEach(q => { if (q.kind && !kinds[q.kind]) kinds[q.kind] = q; });
  }
  Object.keys(kinds).forEach(k => {
    const q = kinds[k];
    const t = EQV.lines('challenge', q);
    ok(`a hands-on ${k} question reads its question`, t.length === 1 && t[0] === EQV.clean(TX(q.title)) && t[0].length > 5, JSON.stringify(t));
  });
  ok('all three hands-on formats were found', Object.keys(kinds).length === 3, Object.keys(kinds).join(','));

  fresh();
  EQ.go('challenge'); flush();
  EQ.go('hint');
  ok('the hint screen has the speaker', html().indexOf('eqv-btn') >= 0);
  engine.spoken = [];
  EQV.tap();
  const h = EQ.session.q.hint;
  const hs = said();
  ok('the speaker reads the hint', hs.length === 1 && hs[0].indexOf(EQV.clean(TX(h.heading))) === 0 && hs[0].indexOf(EQV.clean(TX(h.sub))) > 0, JSON.stringify(hs));
  EQV.speaking = true;
  const c = engine.cancels;
  EQV.tap();
  ok('tapping it again while it talks hushes it', engine.cancels > c && said().length === 1);

  EQ.go('tutor');
  ok('the tutor has the speaker', html().indexOf('eqv-btn') >= 0);
  engine.spoken = [];
  EQV.tap();
  const q = EQ.session.q;
  const ex = q.explain;
  const ts = said();
  ok('the speaker reads the tutor explanation', ts.length === 1 && (!ex || ts[0].indexOf(EQV.clean(TX(ex.text))) > 0), JSON.stringify(ts));
})();

/* ── 6 · calm mode ── */
group('calm mode reads slower and softer');
(() => {
  fresh();
  EQ.go('challenge'); flush();
  const loud = engine.spoken[0];
  fresh();
  EQ.s.settings.calm = true;
  EQ.go('challenge'); flush();
  const calm = engine.spoken[0];
  ok('slower', calm.rate < loud.rate, calm.rate + ' vs ' + loud.rate);
  ok('softer', calm.volume < loud.volume && calm.pitch <= loud.pitch);
  ok('still a sensible speed for a child', calm.rate >= 0.6 && loud.rate <= 1);
})();

/* ── 7 · Söz Vadisi: the voice never reads what the child must read ── */
group('in Söz Vadisi the answer is never spoken');
(() => {
  fresh();
  const norm = s => ' ' + String(s).toLocaleLowerCase(EQI.lang).replace(/[^\p{L}\p{N}]+/gu, ' ').trim() + ' ';
  const has = (line, w) => norm(line).indexOf(norm(w)) >= 0;
  const strip = h => String(h).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const rig = seed => { const rnd = EQD.mulberry(seed); return (a, b) => a + Math.floor(rnd() * (b - a + 1)); };
  let n = 0, bad = [], titled = 0, tutorBad = [];
  ['letter', 'word', 'missing', 'build'].forEach(t => {
    for (let seed = 1; seed <= 40; seed++) {
      [false, true].forEach(hard => [false, true].forEach(alt => {
        const q = EQD.TOPIC_GEN[t](rig(seed * 977 + t.length), hard, alt);
        [q, q.easier].filter(Boolean).forEach(qq => {
          LANGS.forEach(l => {
            EQI.set(l);
            n++;
            /* what the child is being asked to read, worked out here, not from q.hush */
            const secret = qq.kind === 'pair' ? qq.pair.left.map(w => TX(w))
              : qq.topic === 'word' ? [strip(qq.visual())] : [];
            EQ.session.tutorWhy = true;
            ['challenge', 'hint', 'tutor'].forEach(sc => {
              EQV.lines(sc, qq).forEach(line => secret.forEach(w => { if (w && has(line, w)) bad.push(`${t}/${sc}/${l}: "${line}" says ${w}`); }));
            });
            EQ.session.tutorWhy = false;
            const tl = EQV.lines('challenge', qq);
            if (tl.length === 1 && tl[0].length > 5) titled++;
            /* every reading explanation states the answer; the tutor must not read it */
            if (qq.explain) {
              const tx = EQV.clean(TX(qq.explain.text));
              if (EQV.lines('tutor', qq).some(x => x.indexOf(tx) >= 0)) tutorBad.push(`${t}/${l}`);
            }
            /* and the choices never: letters read in order would make it "which button?" */
            const choices = EQD.qa(qq).answers.map(String).filter(a => EQV.clean(a));
            if (qq.topic === 'letter' || qq.topic === 'missing') {
              const tl0 = tl[0] || '';
              if (choices.length && choices.every(c => (' ' + tl0 + ' ').indexOf(' ' + c + ' ') >= 0)) bad.push(`${t}/${l}: title reads every choice`);
            }
          });
        });
      }));
    }
  });
  EQI.set('az');
  ok(`${n} reading questions × 3 screens never say the word being read`, bad.length === 0, bad.slice(0, 3).join(' | '));
  ok('…but every one of them still has its question read', titled === n, titled + ' / ' + n);
  ok('the tutor never reads a reading explanation (it states the answer)', tutorBad.length === 0, tutorBad.slice(0, 3).join(' | '));

  /* the rule is about the reading region only: elsewhere the explanation is read */
  const math = EQD.genDay(3, EQT.plan(3)).questions.filter(q => q.explain && !q.kind)[0];
  ok('outside Söz Vadisi the tutor does read its explanation', EQV.lines('tutor', math).some(x => x.indexOf(EQV.clean(TX(math.explain.text))) >= 0));
  /* a pairing board's hint names one word — the voice has to leave that line out */
  const pair = EQD.TOPIC_GEN.word(rig(5), false, true);
  EQI.set('az');
  const hl = EQV.lines('hint', pair);
  ok('the pairing board hint drops the line that names a word, keeps the rest', hl.length >= 1 && !hl.some(x => pair.pair.left.some(w => has(x, TX(w)))), JSON.stringify(hl));
})();

/* ── 8 · the grown-up is told the truth ── */
group('the settings subtitle is honest');
(() => {
  const sub = () => { const m = /id="eqv-note"[^>]*>([^<]*)</.exec(EQS.screens.parent_settings(EQ.s)); return m ? m[1] : null; };
  fresh([V('en-US'), V('ru-RU'), V('tr-TR')], 'az');
  ok('az, no az voice: "bu cihazda Azərbaycan səsi yoxdur"', /Azərbaycan səsi yoxdur/.test(sub() || ''), sub());
  fresh([V('az-AZ'), V('ru-RU')], 'en');
  ok('en, no en voice: says so in English', /No English voice/.test(sub() || ''), sub());
  fresh([V('az-AZ'), V('en-US')], 'ru');
  ok('ru, no ru voice: says so in Russian', /нет русского голоса/.test(sub() || ''), sub());
  fresh(undefined, 'az');
  ok('with the voice: the normal description', sub() === 'Questy hər sualı səsləndirir', sub());
})();

/* ── 9 · no API, no voices: nothing breaks ── */
group('without speech support nothing breaks');
(() => {
  const keep = sandbox.speechSynthesis;
  delete sandbox.speechSynthesis;
  let threw = null;
  try {
    fresh(undefined, 'az');
    EQ.go('challenge'); flush();
    EQ.go('hint'); EQV.tap(); flush();
    EQ.go('tutor'); EQV.tap(); flush();
    EQ.resolve(true, null);
    EQV.stop(); EQV.sample();
    html();
  } catch (e) { threw = e; }
  ok('no API: playing through a question throws nothing', !threw, threw && threw.stack);
  ok('no API: no speaker button', (EQ.current = 'challenge', EQ.session.answering = false, html().indexOf('eqv-btn') < 0));
  ok('no API: the subtitle says the browser cannot read aloud', EQV.note().bad && /dəstəkləmir/.test(EQV.note().text));
  sandbox.speechSynthesis = keep;

  engine.speak = () => { throw new Error('engine down'); };
  threw = null;
  try { fresh(); EQ.go('challenge'); flush(); } catch (e) { threw = e; }
  ok('an engine that throws on speak is swallowed', !threw, threw && threw.message);
  engine.speak = function (u) { this.spoken.push(u); };
})();

/* ── 10 · the other suites load app.js without speech.js ── */
group('the game still runs if speech.js is missing');
(() => {
  const src = fs.readFileSync(path.join(JS, 'app.js'), 'utf8');
  /* a guarded block counts as guarded; what is left must each carry its own guard */
  const rest = src.replace(/if \([^)\n]*typeof EQV !== 'undefined'[^)\n]*\) \{[\s\S]*?\n\s*\}/g, '');
  const calls = (src.match(/EQV\.\w+\(/g) || []).length;
  const loose = (rest.match(/EQV\.\w+\(/g) || []).length;
  const guarded = (rest.match(/typeof EQV !== 'undefined'[^;\n]*EQV\.\w+\(/g) || []).length;
  ok('every EQV call in app.js is behind a typeof guard', calls >= 8 && loose === guarded, calls + ' calls, ' + (loose - guarded) + ' unguarded');
  const idx = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  ok('index.html loads js/speech.js before app.js', idx.indexOf('js/speech.js') > 0 && idx.indexOf('js/speech.js') < idx.indexOf('js/app.js'));
  ok('sw.js precaches js/speech.js (it must work offline)', sw.indexOf("'./js/speech.js'") > 0);
})();

console.log('\n' + (fail ? `${fail} FAILED, ${pass} passed` : `ALL ${pass} CHECKS PASSED`));
process.exit(fail ? 1 : 0);
