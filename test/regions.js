/* EduQuest — regression test for the four regions beyond the forest.
   Run it with:  node test/regions.js      (no dependencies, no build step)

   Why this file exists: for a long time Söz Vadisi, Elm Adası, Kosmik Stansiya and
   Sirli Qala were pictures on the map with nothing behind them, and Söz Vadisi told the
   child it would open "after today's adventure" — a promise nothing kept. The regions
   are real now (js/regions.js), and what can go wrong with them goes wrong silently:

     1. a question that cannot be answered. Reading questions carry answers that depend
        on the language (🍎 starts with A in az/en and Я in ru). If the right answer is
        missing from the choices in even one language, the child is stuck on a question
        with no way through and nothing on screen says why.
     2. a picture that is not there. An emoji newer than the phone draws as an empty
        box; as a quiz answer that is an unreadable choice. Unicode 11 is the ceiling.
     3. the doors. Söz Vadisi opens after the first boss, the others at Levels 10 / 15 /
        20. Open too early and the map lies; never open and it lies the other way.
     4. the separation. A region round borrows the challenge, hint, tutor and success
        screens. Let its context leak and a region answer advances the daily 5/5, or the
        forest plan starts asking about planets.
     5. the grown-up side. A region topic must not be suggested before the child can
        reach it, and once it can, it must be a mission that actually builds.

   The region screens are hand-written; a design re-sync would bring back the old
   locked pictures and the false promise. If this suite goes red after a re-sync, that
   is what happened. */

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

const sandbox = {
  document: { hidden: false, title: '', documentElement: {}, body: {}, getElementById: () => null, addEventListener() {} },
  localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; }, removeItem(k) { delete this._m[k]; } },
  navigator: {}, console, Math, JSON, Date, Object, Array, String, Number, Set,
  isNaN, parseInt, parseFloat, setTimeout: f => { f(); return 0; }, clearTimeout: () => {},
  setInterval: () => 0, clearInterval: () => {},
  addEventListener() {}, matchMedia: () => ({ matches: false, addListener() {} }),
  AudioContext: function () {}, location: { search: '' }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const FILES = ['i18n.js', 'components.js', 'data.js', 'regions.js', 'tracking.js', 'profiles.js', 'qr.js',
  'transfer.js', 'interact.js', 'screens-onboarding.js', 'screens-world.js', 'screens-play.js',
  'screens-collect.js', 'parent.js', 'sound.js', 'app.js'];
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
vm.runInContext('this.EQ = EQ; this.EQD = EQD; this.EQS = EQS; this.EQT = EQT; this.EQX = EQX; this.EQ_DEFAULTS = EQ_DEFAULTS; this.TX = TX; this.EQI = EQI; this.EQI_FMT = EQI_FMT; this.EQIX = EQIX;', sandbox);
const { EQ, EQD, EQS, EQT, EQX, EQ_DEFAULTS, TX, EQI, EQI_FMT } = sandbox;

const realGo = EQ.go;
const LANGS = ['az', 'en', 'ru'];
const REGION_TOPICS = [].concat(...EQD.REGION_ORDER.map(r => EQD.REGIONS[r].topics));

const fresh = () => {
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.onboarded = true;
  EQ.s.settings.music = false;
  /* a full album: the sticker reveal is album.js's business, not a beat in this flow */
  EQ.s.stickerIds = EQD.STICKERS.map(st => st.id); EQ.s.stickers = EQ.s.stickerIds.length;
  EQ.save = () => {};
  EQ.render = () => {};
  EQ.toast = m => EQ._toasts.push(m);
  EQ._toasts = [];
  EQ.current = 'map';
  EQ.go = realGo;
  EQ.restGuard = () => false;
  EQ.checkNewDay = () => false;
  Object.assign(EQ.session, { mission: null, region: null, ctx: 'daily', q: null, qIdx: -1, qKey: null, answering: false, recSkips: [], unlockRegion: null });
  EQT.init(EQ.s);
  EQI.set('az');
};

const rig = seed => { const rnd = EQD.mulberry(seed); return (a, b) => a + Math.floor(rnd() * (b - a + 1)); };

/* answer whatever is on screen, the way the child would: a tap for three buttons, the
   format's own verdict for a hands-on panel */
const answer = right => {
  const q = EQ.session.q;
  EQ.session.answering = false;
  if (q.kind && EQI_FMT[q.kind]) {
    sandbox.EQIX.done = false;
    sandbox.EQIX.commit(q, right);
    return;
  }
  const x = EQD.qa(q);
  EQ.answer(right ? x.answers.indexOf(x.correct) : x.answers.findIndex(a => a !== x.correct));
};

/* ── 1 · every question can be answered, in every language ── */
group('every region question is answerable in all three languages');
(() => {
  let built = 0, bad = [];
  REGION_TOPICS.forEach(t => {
    for (let seed = 1; seed <= 40; seed++) {
      const ri = rig(seed * 131 + t.length);
      [false, true].forEach(hard => {
        [false, true].forEach(alt => {
          const q = EQD.TOPIC_GEN[t](ri, hard, alt);
          built++;
          const check = (qq, where) => {
            LANGS.forEach(l => {
              EQI.set(l);
              const x = EQD.qa(qq);
              if (!Array.isArray(x.answers) || x.answers.length < 3) bad.push(`${t} ${where} ${l}: answers`);
              else if (x.answers.indexOf(x.correct) < 0) bad.push(`${t} ${where} ${l}: correct ${x.correct} not in ${x.answers}`);
              else if (new Set(x.answers.map(String)).size !== x.answers.length) bad.push(`${t} ${where} ${l}: duplicate choice ${x.answers}`);
              if (typeof TX(qq.title) !== 'string' || !TX(qq.title)) bad.push(`${t} ${where} ${l}: title`);
              if (typeof qq.visual !== 'function' || typeof qq.visual() !== 'string') bad.push(`${t} ${where} ${l}: visual`);
              if (!qq.hint || !TX(qq.hint.heading) || !TX(qq.hint.sub) || typeof qq.hint.body() !== 'string') bad.push(`${t} ${where} ${l}: hint`);
              if (qq.explain && (typeof TX(qq.explain.text) !== 'string' || typeof qq.explain.visual() !== 'string')) bad.push(`${t} ${where} ${l}: explain`);
              if (/undefined|\[object Object\]/.test(TX(qq.title) + TX(qq.hint.sub) + qq.visual() + qq.hint.body() + (qq.explain ? TX(qq.explain.text) + qq.explain.visual() : '') + TX(qq.successLine) + TX(qq.praise)))
                bad.push(`${t} ${where} ${l}: undefined leaked into the text`);
            });
          };
          check(q, 'main');
          if (q.easier) check(q.easier, 'easier');
          if (q.topic !== t) bad.push(`${t}: carries topic ${q.topic}`);
          if (EQT.topicKey(q) !== t) bad.push(`${t}: tracking files it under ${EQT.topicKey(q)}`);
          if (q.easier && EQT.topicKey(q.easier) !== t) bad.push(`${t}: the easier one is filed under ${EQT.topicKey(q.easier)}`);
          if (q.subj !== EQT.TOPICS[t].subj) bad.push(`${t}: subject ${q.subj}`);
        });
      });
    }
  });
  EQI.set('az');
  ok(`${built} questions across ${REGION_TOPICS.length} topics build cleanly`, bad.length === 0, bad.slice(0, 5).join(' | '));
})();

group('the reading answers are really the reading answers');
(() => {
  const it = EQD.WORDS.filter(w => w.id === 'apple')[0];
  ok('azerbaijani capitals keep their dots', EQD._up('ilan', 'az') === 'İLAN' && EQD._up('qarışqa', 'az') === 'QARIŞQA');
  let wrong = [];
  for (let seed = 1; seed <= 60; seed++) {
    const q = EQD._qLetter(rig(seed), true);
    /* the picture on screen is the one the answer is about, in every language */
    const e = (q.visual().match(/>([^<]+)<\/div>$/) || [])[1];
    const word = EQD.WORDS.filter(w => w.e === e)[0];
    if (!word) { wrong.push('no word for ' + e); continue; }
    LANGS.forEach(l => {
      if (q.correct[l] !== EQD._up(word.w[l], l)[0]) wrong.push(`${l}: ${word.w[l]} -> ${q.correct[l]}`);
    });
  }
  ok('the first-letter answer is the first letter of the pictured word, per language', wrong.length === 0, wrong.slice(0, 3).join(' | '));
  ok('🍎 starts with A in az and en but Я in ru', EQD._up(it.w.az, 'az')[0] === 'A' && EQD._up(it.w.ru, 'ru')[0] === 'Я');

  let spelled = [];
  for (let seed = 1; seed <= 60; seed++) {
    const q = EQD._qBuild(rig(seed), seed % 2 === 0);
    LANGS.forEach(l => {
      EQI.set(l);
      const shown = TX(q.order.shown).join(''), sorted = TX(q.order.sorted).join('');
      if (shown === sorted) spelled.push(`${l}: ${sorted} dealt already spelled`);
      if (TX(q.order.shown).slice().sort().join('') !== TX(q.order.sorted).slice().sort().join('')) spelled.push(`${l}: tiles are not the word's letters`);
      if (EQI_FMT.order.solve(q).join('') !== sorted) spelled.push(`${l}: solve()`);
    });
  }
  EQI.set('az');
  ok('a word to build is never dealt already spelled, and its tiles are its letters', spelled.length === 0, spelled.slice(0, 3).join(' | '));

  let gaps = [];
  for (let seed = 1; seed <= 80; seed++) {
    const q = EQD._qMissing(rig(seed), seed % 2 === 0);
    LANGS.forEach(l => {
      EQI.set(l);
      const at = TX(q.visual().match(/>\?</) ? q.correct : null);
      if (!at) gaps.push(`${l}: no gap drawn`);
      if (['Ь', 'Ъ', 'Й'].indexOf(TX(q.correct)) >= 0) gaps.push(`${l}: a silent letter was hidden`);
    });
  }
  EQI.set('az');
  ok('a missing-letter word always shows its gap, and never hides a silent letter', gaps.length === 0, gaps.slice(0, 3).join(' | '));
})();

group('a set does not ask the same thing twice');
(() => {
  let dup = 0;
  ['animals', 'riddle', 'planets', 'letter'].forEach(t => {
    const set = EQD.missionSet(t, '2026-09-24');
    const titles = set.questions.map(q => JSON.stringify(q.title) + (q.kind === 'order' ? JSON.stringify(q.order.sorted) : q.visual()));
    if (new Set(titles).size !== titles.length) dup++;
  });
  ok('eight mission questions on one topic are eight different questions', dup === 0);
})();

/* ── 2 · pictures a phone can draw ── */
group('every picture is one an older phone can draw (Unicode 11 or older)');
(() => {
  /* the ranges and code points added in Unicode 12 and later that sit near the ones we use */
  const late = cp => (cp >= 0x1FA70 && cp <= 0x1FAFF) || (cp >= 0x1F7E0 && cp <= 0x1F7EB)
    || (cp >= 0x1F90D && cp <= 0x1F90F) || cp === 0x1F93F || cp === 0x1F971 || cp === 0x1F972 || cp === 0x1F97B
    || (cp >= 0x1F9A3 && cp <= 0x1F9A4) || (cp >= 0x1F9A5 && cp <= 0x1F9AA) || (cp >= 0x1F9AB && cp <= 0x1F9AF)
    || (cp >= 0x1F9BA && cp <= 0x1F9BF) || (cp >= 0x1F9C3 && cp <= 0x1F9CA) || (cp >= 0x1F9CB && cp <= 0x1F9CF)
    || (cp >= 0x1F6D5 && cp <= 0x1F6D7) || (cp >= 0x1F6FA && cp <= 0x1F6FC) || cp === 0x1F6DD || cp === 0x1F6DE || cp === 0x1F6DF;
  const src = fs.readFileSync(path.join(JS, 'regions.js'), 'utf8');
  const found = [];
  for (const ch of src) { const cp = ch.codePointAt(0); if (late(cp)) found.push(ch + ' U+' + cp.toString(16).toUpperCase()); }
  ok('no emoji from Unicode 12 or later in the region content', found.length === 0, found.slice(0, 5).join(', '));
})();

/* ── 3 · the doors ── */
group('each region opens exactly when the map says it does');
fresh();
ok('a brand-new child has no region open', EQD.REGION_ORDER.every(r => !EQ.regionOpen(r)));
EQ.s.trophiesEarned = 1;
ok('Söz Vadisi opens once the first boss is beaten', EQ.regionOpen('valley'));
ok('the others still wait for their level', !EQ.regionOpen('island') && !EQ.regionOpen('station') && !EQ.regionOpen('castle'));
EQ.s.level = 9;
ok('Level 9 is not yet Elm Adası', !EQ.regionOpen('island'));
EQ.s.level = 10;
ok('Level 10 opens Elm Adası', EQ.regionOpen('island'));
EQ.s.level = 15;
ok('Level 15 opens Kosmik Stansiya', EQ.regionOpen('station') && !EQ.regionOpen('castle'));
EQ.s.level = 20;
ok('Level 20 opens Sirli Qala', EQ.regionOpen('castle'));
ok('all four count toward World Explorer', EQ.regionsOpen().length === 4);

group('the map tells the truth about every region');
fresh();
const mapLocked = LANGS.map(l => { EQI.set(l); return EQS.screens.map(EQ.s); }).join('');
EQI.set('az');
ok('the old promise that Söz Vadisi opens "after today’s adventure" is gone',
  mapLocked.indexOf('bugünkü macəradan sonra') < 0 && mapLocked.indexOf('after today’s adventure') < 0);
ok('a closed pin leads to its unlock screen', /EQ\.openRegion\('valley'\)/.test(mapLocked));
EQ.openRegion('valley');
ok('tapping closed Söz Vadisi explains what opens it', EQ.current === 'unlock' && EQ.session.unlockRegion === 'valley');
const unlockHtml = EQS.screens.unlock(EQ.s);
ok('the unlock screen names the first boss, not a level', unlockHtml.indexOf('bossu') >= 0 && unlockHtml.indexOf('undefined') < 0);
EQ.s.trophiesEarned = 1;
const mapOpen = EQS.screens.map(EQ.s);
ok('an open Söz Vadisi shows five questions waiting today', /EQ\.openRegion\('valley'\)[\s\S]{0,1400}>5<\/div>/.test(mapOpen));
['station', 'castle', 'island'].forEach(r => {
  EQ.session.unlockRegion = r;
  const h = LANGS.map(l => { EQI.set(l); return EQS.screens.unlock(EQ.s); }).join('');
  ok(`the ${r} unlock screen renders in all three languages`, h.indexOf('undefined') < 0 && h.indexOf('[object') < 0 && h.indexOf(String(EQD.REGIONS[r].level)) >= 0);
});
EQI.set('az');

/* ── 4 · playing a round ── */
group('a region round is five real questions beside the adventure');
fresh();
EQ.s.trophiesEarned = 1;
EQ.s.challengesDone = 2;
const coins0 = EQ.s.coins, xp0 = EQ.s.xp;
EQ.openRegion('valley');
ok('an open region opens its own screen', EQ.current === 'region' && EQ.session.ctx === 'region');
const regionHtml = LANGS.map(l => { EQI.set(l); return EQS.screens.region(EQ.s); }).join('');
EQI.set('az');
ok('the region screen renders in all three languages', regionHtml.indexOf('undefined') < 0 && regionHtml.indexOf('[object') < 0);
ok('it lists the region’s four reading topics', EQD.REGIONS.valley.topics.every(t => regionHtml.indexOf(TX(EQT.TOPICS[t].name)) >= 0));
EQ.startRegionQuestion();
ok('the first question is a reading question', EQ.current === 'challenge' && EQ.session.q.subj === 'reading');
const planned = EQ.region('valley').plan.slice();
ok('the round is planned from the valley’s own topics only', planned.length === 5 && planned.every(t => EQD.REGIONS.valley.topics.indexOf(t) >= 0), planned.join(','));
const chHtml = EQS.screens.challenge(EQ.s);
ok('the challenge counter names the region', chHtml.indexOf('Söz Vadisi · 1 / 5') >= 0);
ok('and the exit goes back to the region, not the quest list', chHtml.indexOf(`EQ.go('region')`) >= 0);

/* a wrong answer is the same gentle hint as anywhere else, and keeps the question */
const firstQ = EQ.session.q;
answer(false);
ok('a wrong answer opens the hint', EQ.current === 'hint');
ok('and the hint pips follow the round, not the daily quest', EQS.screens.hint(EQ.s).indexOf('undefined') < 0);
EQ.go('challenge');
ok('coming back from the hint keeps the same question', EQ.session.q === firstQ);
EQ.go('tutor');
if (firstQ.easier) {
  EQ.easierOne();
  ok('the tutor’s gentler question survives the trip back to the challenge', EQ.session.q === firstQ.easier && EQ.current === 'challenge');
}
answer(true);
ok('a right answer lands on the success screen', EQ.current === 'success');
ok('and advances the region, not the daily quest', EQ.region('valley').n === 1 && EQ.s.challengesDone === 2);
const succ = EQS.screens.success(EQ.s);
ok('the success screen shows the region’s own progress', succ.indexOf('1/5') >= 0 && succ.indexOf('SÖZ VADİSİ') >= 0);
EQ.continueAfterSuccess();
ok('the next question follows', EQ.current === 'challenge' && EQ.session.qIdx === 1);
for (let i = 0; i < 4; i++) { answer(true); EQ.continueAfterSuccess(); }
const e = EQ.region('valley');
ok('five right answers finish the round', e.n === 5 && EQ.current === 'region');
ok('the first round of the day pays 5 × 5 coins plus the bonus', EQ.s.coins - coins0 === 25 + EQD.REGION_BONUS, 'got ' + (EQ.s.coins - coins0));
ok('and 5 × 25 XP', EQ.s.xp - xp0 === 125, 'got ' + (EQ.s.xp - xp0));
ok('the daily quest never moved', EQ.s.challengesDone === 2 && !EQ.s.bossBeaten);
ok('the lifetime reading count went up', e.total === 5);
ok('the finished round offers another', EQS.screens.region(EQ.s).indexOf('EQ.regionAgain()') >= 0);

group('another round is new practice, without a second bonus');
const firstSet = EQ.regionSet('valley').questions;
const coins1 = EQ.s.coins;
EQ.regionAgain();
ok('the second round starts at question one', EQ.region('valley').round === 1 && EQ.region('valley').n === 0 && EQ.current === 'challenge');
ok('with different questions', EQ.regionSet('valley').questions !== firstSet);
for (let i = 0; i < 5; i++) { answer(true); EQ.continueAfterSuccess(); }
ok('it pays per question only', EQ.s.coins - coins1 === 25, 'got ' + (EQ.s.coins - coins1));

group('leaving mid-round and coming back continues the same round');
fresh();
EQ.s.trophiesEarned = 1;
EQ.openRegion('valley');
EQ.startRegionQuestion();
answer(true); EQ.continueAfterSuccess();
const q2 = EQ.session.q;
EQ.go('map');
ok('leaving drops the region context', EQ.session.ctx === 'daily' && EQ.session.region === null);
EQ.go('challenge');
ok('the daily quest does not inherit a region question', EQ.session.q !== q2 && EQ.session.q.subj !== 'reading');
EQ.openRegion('valley');
EQ.startRegionQuestion();
ok('coming back resumes at question two, the same question', EQ.session.qIdx === 1 && JSON.stringify(EQ.session.q.title) === JSON.stringify(q2.title));

group('a new day starts a fresh round');
EQ.s.regions.valley.day = '2020-01-01';
ok('yesterday’s progress does not carry into today', EQ.region('valley').n === 0 && EQ.region('valley').round === 0 && !EQ.region('valley').paid);
ok('but the lifetime count does', EQ.region('valley').total === 1);

group('a level earned mid-round comes back to the round');
fresh();
EQ.s.trophiesEarned = 1;
EQ.s.xp = 1490;
EQ.openRegion('valley');
EQ.startRegionQuestion();
answer(true);
EQ.continueAfterSuccess();
ok('the level-up screen shows', EQ.current === 'levelup');
EQ.applyLevelUp();
ok('and afterwards the child is back in the region, on its next question', EQ.current === 'challenge' && EQ.session.ctx === 'region' && EQ.session.q.subj === 'reading');

group('the same happens for a mission (it used to fall back to the daily quest)');
fresh();
EQ.s.xp = 1490;
EQ.addMission('add');
EQ.startNextMission();
EQ.startMissionQuestion();
answer(true);
EQ.continueAfterSuccess();
EQ.applyLevelUp();
ok('after the level-up the mission continues', EQ.current === 'challenge' && EQ.session.ctx === 'mission');

group('the other regions play the same way');
['island', 'station', 'castle'].forEach(r => {
  fresh();
  EQ.s.level = 20;
  EQ.openRegion(r);
  EQ.startRegionQuestion();
  const subj = EQD.REGIONS[r].subj;
  let okAll = EQ.current === 'challenge';
  for (let i = 0; i < 5 && okAll; i++) {
    if (EQ.session.q.subj !== subj || EQD.REGIONS[r].topics.indexOf(EQ.session.q.topic) < 0) okAll = false;
    answer(true); EQ.continueAfterSuccess();
  }
  ok(`${TX(EQD.REGIONS[r].name)}: five ${subj} questions from its own topics, then the round screen`, okAll && EQ.current === 'region' && EQ.region(r).n === 5);
});

/* ── 5 · the forest and the grown-up ── */
group('the forest’s daily set never asks region questions');
fresh();
EQ.s.level = 20; EQ.s.trophiesEarned = 3;
let leak = false;
for (let d = 1; d <= 20; d++) if (EQT.plan(d, 5).some(t => EQT.TOPICS[t].region)) leak = true;
ok('twenty planned days are all forest topics', !leak);
EQ.s.track.plan = { day: 3, topics: ['letter', 'add', 'add', 'add', 'add'] };
ok('a stored plan that somehow names a region topic is rebuilt', EQT.todayPlan(3).every(t => !EQT.TOPICS[t].region));

group('a region is only suggested to a grown-up once the child can reach it');
fresh();
ok('no region topic is suggested to a brand-new child', EQT.recommend().every(x => !EQT.TOPICS[x.k].region));
EQ.s.trophiesEarned = 1;
const rec = EQT.recommend().map(x => x.k);
ok('reading topics are offered once Söz Vadisi is open', EQD.REGIONS.valley.topics.some(t => rec.indexOf(t) >= 0));
ok('but not the science ones yet', !rec.some(t => EQT.TOPICS[t].region === 'island'));
ok('every region topic is a mission that builds eight questions',
  REGION_TOPICS.every(t => EQT.MISSIONS[t] && EQD.missionSet(t, '2026-09-24').questions.length === EQD.MISSION_LEN));
EQ.addMission('letter');
EQ.startNextMission();
EQ.startMissionQuestion();
ok('an approved reading mission plays reading questions', EQ.current === 'challenge' && EQ.session.q.subj === 'reading');
const pq = LANGS.map(l => { EQI.set(l); return EQS.screens.parent_quests(EQ.s); }).join('');
EQI.set('az');
ok('the recommendations screen renders with region topics in it', pq.indexOf('undefined') < 0 && pq.indexOf('[object') < 0);

group('reading and science finally show up in the grown-up’s analytics');
fresh();
EQ.s.trophiesEarned = 1;
EQ.openRegion('valley');
EQ.startRegionQuestion();
EQT.attempt(EQ.session.q, true);
const st = EQT.subjStats(7);
ok('a reading answer is counted under Oxu', st.reading && st.reading.a === 1);

/* ── 6 · awards ── */
group('the two reading/world trophies are live');
fresh();
const awardsLocked = EQS.screens.awards(EQ.s);
ok('Book Explorer is locked with the reason while the valley is closed', awardsLocked.indexOf('ilk bossdan sonra') >= 0);
EQ.s.trophiesEarned = 1;
EQ.s.regions = { valley: { day: EQ.dayKey(), round: 0, n: 0, plan: null, paid: false, total: 7 } };
const awardsOpen = EQS.screens.awards(EQ.s);
ok('Book Explorer counts real reading answers', awardsOpen.indexOf('7/20') >= 0);
ok('World Explorer counts real open worlds', awardsOpen.indexOf('1/3') >= 0);

/* ── 7 · moving to another phone ── */
group('region progress survives a device transfer');
fresh();
EQ.s.trophiesEarned = 1;
EQ.s.regions = { valley: { day: EQ.dayKey(), round: 1, n: 3, plan: ['letter', 'word', 'missing', 'build', 'letter'], paid: true, total: 12 }, bogus: { n: 3 } };
const cleaned = EQX.clean(JSON.parse(JSON.stringify(EQ.s)));
ok('a file transfer keeps the round and the lifetime count', cleaned.regions.valley && cleaned.regions.valley.total === 12 && cleaned.regions.valley.n === 3);
ok('an unknown region is dropped', !cleaned.regions.bogus);
const hostile = EQ.cleanRegions({ valley: { day: '<script>', n: 99, total: -4, plan: ['add', 'x'] } });
ok('hostile values are clamped, not trusted', hostile.valley.n === 0 && hostile.valley.total === 0 && hostile.valley.plan === null && hostile.valley.day === '1970-01-01');
ok('the code keeps the old topics at their old numbers', ['add', 'pattern', 'groups', 'take', 'double'].every((t, i) => EQX.TOPIC[i] === t));
/* a day with reading play rides through a packed code */
fresh();
EQ.s.track.days[EQ.dayKey()] = { secs: 60, secsQ: 30, secsB: 0, a: 3, c: 2, done: 2, hg: 0, hints: 0, boss: 0, bossWin: 0, subj: { reading: { a: 3, c: 2 } }, topics: { letter: { a: 2, c: 1, h: 0 }, seq: { a: 1, c: 1, h: 0 } } };
const back = EQX.clean(EQX.unpack(EQX.pack(EQ.s, 5)));
const bd = back.track.days[EQ.dayKey()];
ok('region topic stats survive a packed code', bd && bd.topics.letter && bd.topics.letter.a === 2 && bd.topics.seq && bd.topics.seq.c === 1, JSON.stringify(bd && bd.topics));

/* ── 8 · the answer buttons fit their words ── */
group('word answers are sized to fit their button');
ok('a picture or a letter is drawn big', EQS.ansFont('🌍', 38).indexOf('38px') >= 0 && EQS.ansFont('Я', 38).indexOf('38px') >= 0 && EQS.ansFont(12, 38).indexOf('38px') >= 0);
ok('a planet name steps down', EQS.ansFont('Меркурий', 38).indexOf('19px') >= 0);
ok('a short phrase steps down further and may wrap', EQS.ansFont('Земля вращается', 38).indexOf('16px') >= 0);

console.log(`\n${fail ? 'FAILED ' + fail + ' OF ' + (pass + fail) : 'ALL ' + pass + ' CHECKS PASSED'}`);
process.exit(fail ? 1 : 0);
