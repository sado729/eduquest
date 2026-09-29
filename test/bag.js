/* EduQuest — regression test for the bag screen (screen 16).
   Run it with:  node test/bag.js      (no dependencies, no build step)

   Why this file exists: the bag came from the design project with five things on it
   that looked like state and were not.

     · "Hint spark ×N" read `s.hintSparks`, which nothing ever raised — always ×0.
     · "Double XP ×1" was a typed-in 1 with nothing behind it.
     · "Crystal Shard — collect 3" drew `s.bossBeaten ? 2 : 1`, whatever had happened.
     · the quest-items row had a map "1" and a magnifier "3", both typed in.

   Now: a hint spark is earned by a question solved *after* its hint was open (the hint
   itself stays free, and sparks are never spent); the shard is the current chapter's
   relic, one piece per stage whose boss was really beaten (`s.relics`); Double XP, the
   map and the magnifier are gone — a boost to "play more now" has no place in a game
   whose rest screen stops play, and the other two had nothing to count.

   What fails silently, and what this suite pins:

     1. the *screen*: every number the bag prints comes from state, and a fixed number
        typed back in (a re-sync would do exactly that) turns this red.
     2. the *spark*: earned in every context the hint exists in, once per question,
        never without the hint, and the hint never costs one.
     3. the *relic*: only a beaten boss adds a piece; a stage the calendar moved past is
        named as missed, never counted; chapters keep their own record; old saves keep
        what the old bag showed them.
     4. the *carry*: a code (new last group) and a file carry both, and a code or file
        written before this change still reads.

   See `EQ.earnSpark` / `EQ.earnRelic` / `EQ.relicNow` / `EQ.cleanRelics` in js/app.js,
   `relic` on each of `EQD.CHAPTERS` in js/data.js, `EQS.screens.bag` in
   js/screens-collect.js and the relic group at the end of the code in js/transfer.js. */

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

/* ── a browser small enough for the game to boot in ── */
const store = { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; }, removeItem(k) { delete this._m[k]; } };
const sandbox = {
  document: { hidden: false, title: '', documentElement: {}, body: {}, getElementById: () => null, addEventListener() {} },
  localStorage: store,
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
vm.runInContext('this.EQ = EQ; this.EQD = EQD; this.EQS = EQS; this.EQT = EQT; this.EQP = EQP; this.EQX = EQX; this.EQ_DEFAULTS = EQ_DEFAULTS; this.TX = TX; this.EQI = EQI; this.EQI_FMT = EQI_FMT; this.EQIX = EQIX;', sandbox);
const { EQ, EQD, EQS, EQT, EQP, EQX, EQ_DEFAULTS, TX, EQI, EQI_FMT } = sandbox;

const realGo = EQ.go;
const LANGS = ['az', 'en', 'ru'];
const BAD = /undefined|\[object Object\]|NaN/;
const PER = EQD.STAGES_PER_CHAPTER;

const fresh = () => {
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.onboarded = true;
  EQ.s.settings.music = false;
  /* a full album: the sticker reveal is album.js's business, not a beat in this flow */
  EQ.s.stickerIds = EQD.STICKERS.map(st => st.id); EQ.s.stickers = EQ.s.stickerIds.length;
  EQ.s.level = 16;
  EQ.save = () => {};
  EQ.render = () => {};
  EQ._toasts = [];
  EQ.toast = m => EQ._toasts.push(m);
  EQ.current = 'map';
  EQ.go = realGo;
  EQ.restGuard = () => false;
  EQ.checkNewDay = () => false;
  Object.assign(EQ.session, { mission: null, region: null, ctx: 'daily', q: null, qIdx: -1, qKey: null, answering: false, attempted: false, hinted: false, sparked: false, recSkips: [], unlockRegion: null, helmNews: [], helmCard: null });
  EQT.init(EQ.s);
  EQI.set('az');
};

/* answer whatever is on screen, the way the child would (see test/regions.js) */
const answer = right => {
  const q = EQ.session.q;
  EQ.session.answering = false;
  if (q.kind && EQI_FMT[q.kind]) { sandbox.EQIX.done = false; sandbox.EQIX.commit(q, right); return; }
  const x = EQD.qa(q);
  EQ.answer(right ? x.answers.indexOf(x.correct) : x.answers.findIndex(a => a !== x.correct));
};
/* beat the stage's boss through the real fight */
const beatBoss = () => {
  EQ.s.challengesDone = 5;
  for (let i = 0; i < 20 && !EQ.s.bossBeaten; i++) { EQ.go('boss'); answer(true); }
};
const bag = () => EQS.screens.bag(EQ.s);
const text = html => html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const src = fs.readFileSync(path.join(JS, 'screens-collect.js'), 'utf8');
const bagSrc = src.slice(src.indexOf('EQS.screens.bag = '), src.indexOf('EQS.meta.home'));

/* ── 1 · what is no longer there ── */
group('nothing on the bag is typed in');
ok('no "Double XP" card, in any language', ['İkiqat XP', 'Double XP', 'Двойной XP'].every(w => bagSrc.indexOf(w) < 0));
ok('no shard count made up from bossBeaten', !/bossBeaten\s*\?\s*2\s*:\s*1/.test(bagSrc));
ok('no ×1 typed into the markup', !/×1\b/.test(bagSrc));
ok('the map and magnifier with their typed-in counts are gone',
  bagSrc.indexOf('M6 8 q8-3 12 2') < 0 && bagSrc.indexOf('cx="13" cy="13" r="8"') < 0);
ok('the helpers section still says it is earned, never bought', bagSrc.indexOf('YALNIZ QAZANILIR, ALINMIR') >= 0);
ok('nothing in js/ ever spends a spark',
  fs.readdirSync(JS).filter(f => f.endsWith('.js')).every(f => !/hintSparks\s*(--|-=)|--\s*[\w.]*hintSparks/.test(fs.readFileSync(path.join(JS, f), 'utf8'))));

/* every number drawn as an element's own text (a badge) must be one the state explains */
group('every number the bag prints comes from state');
[[0, {}, 0], [7, { 1: 1 }, 0], [23, { 1: 5 }, 2], [2, { 1: 7 }, 2]].forEach(([sparks, relics, day]) => {
  fresh();
  EQ.s.hintSparks = sparks; EQ.s.relics = relics; EQ.s.questDay = day;
  const html = bag();
  const have = [0, 1, 2].filter(i => (relics[1] || 0) & (1 << i)).length;
  const badges = (html.match(/>(\d+)</g) || []).map(m => m.slice(1, -1));
  ok(`sparks ${sparks}, relic mask ${relics[1] || 0}: the only badge is the relic count (${have})`,
    badges.length === 1 && badges[0] === String(have), badges.join(','));
  const times = (text(html).match(/×\d+/g) || []);
  ok(`…and the only ×N is the spark count`, times.length === 1 && times[0] === '×' + sparks, times.join(','));
  ok(`…the relic line reads ${have}/${PER}`, text(html).indexOf(`${have}/${PER}`) >= 0);
  const filled = (html.match(/id="relic-bars"[\s\S]*?<\/div>\s*<\/div>/) || [''])[0].split(EQD.CHAPTERS[0].relic.color).length - 1;
  ok(`…and exactly ${have} of the ${PER} bars are lit`, filled === have, filled);
});

/* ── 2 · the hint spark ── */
group('a spark is earned by solving after the hint — once, and never without it');
fresh();
EQ.go('challenge');
answer(true);
ok('a right answer with no hint earns no spark', EQ.s.hintSparks === 0 && EQ.current === 'success');
ok('…and the success screen shows no spark chip', EQS.screens.success(EQ.s).indexOf('spark-chip') < 0);
EQ.continueAfterSuccess();
answer(false);
ok('a miss opens the hint, for free', EQ.current === 'hint' && EQ.s.hintSparks === 0);
EQ.go('challenge');
answer(false);
EQ.go('challenge');
answer(true);
ok('solving it after the hint earns one spark', EQ.s.hintSparks === 1);
ok('two misses on the way still make one spark, not two', EQ.s.hintSparks === 1);
LANGS.forEach(l => {
  EQI.set(l);
  const h = EQS.screens.success(EQ.s);
  ok(`the success screen says so (${l})`, h.indexOf('spark-chip') >= 0 && !BAD.test(h));
});
EQI.set('az');
EQ.continueAfterSuccess();
EQ.go('hint');
ok('tapping the hint button with no sparks still opens the hint', EQ.current === 'hint');
EQ.go('challenge');
answer(true);
ok('solving after a tapped hint earns a spark too', EQ.s.hintSparks === 2);
EQ.continueAfterSuccess();
answer(true);
ok('the next question, unhinted, earns nothing — the flag did not carry over', EQ.s.hintSparks === 2);
(() => {
  /* the guard itself: whatever route reaches it twice for one question pays once */
  const before = EQ.s.hintSparks;
  Object.assign(EQ.session, { hinted: true, sparked: false });
  EQ.earnSpark(); EQ.earnSpark();
  ok('one hinted question can never pay two sparks', EQ.s.hintSparks === before + 1);
})();

group('…in a mission, a region round and the boss fight as well');
fresh();
EQ.addMission('add');
EQ.startNextMission();
EQ.startMissionQuestion();
answer(false); EQ.go('challenge'); answer(true);
ok('mission: solved after the hint → +1', EQ.s.hintSparks === 1 && EQ.session.ctx === 'mission');
fresh();
EQ.s.trophiesEarned = 1;                     /* Söz Vadisi opens after the first boss */
EQ.openRegion('valley');
EQ.go('challenge');
answer(false); EQ.go('challenge'); answer(true);
ok('region round: solved after the hint → +1', EQ.s.hintSparks === 1 && EQ.session.ctx === 'region');
fresh();
EQ.s.challengesDone = 5;
EQ.go('boss');
answer(false);
ok('boss: a miss opens the same free hint', EQ.current === 'hint');
EQ.go('boss');
answer(true);
ok('boss: the hit after the hint → +1', EQ.s.hintSparks === 1);
ok('…and the child is told (the boss has no success screen)', EQ._toasts.some(t => /✨/.test(t)));
EQ.go('boss');
answer(true);
ok('boss: the next hit, unhinted, earns nothing', EQ.s.hintSparks === 1);

group('the bag shows the sparks the child actually has');
LANGS.forEach(l => {
  EQI.set(l);
  const h = bag();
  ok(`${l}: ×${EQ.s.hintSparks} and a line on how sparks are earned`,
    text(h).indexOf('×' + EQ.s.hintSparks) >= 0 && h.indexOf('spark-card') >= 0 && !BAD.test(h));
});
EQI.set('az');

/* ── 3 · the chapter relic ── */
group('a relic piece is a boss really beaten, in this chapter');
fresh();
ok('a new child starts with no record', JSON.stringify(EQ.s.relics) === '{}' && EQ.relicNow().have === 0);
ok('each chapter has its own relic, in three languages', EQD.CHAPTERS.every(c => c.relic
  && ['piece', 'whole', 'goal', 'done'].every(k => LANGS.every(l => typeof c.relic[k][l] === 'string' && c.relic[k][l].length > 3))
  && c.relic.art && c.relic.color));
ok('every "collect N" line matches the stages in a chapter',
  EQD.CHAPTERS.every(c => LANGS.every(l => c.relic.goal[l].indexOf(String(PER)) >= 0)));
EQ.s.challengesDone = 5; EQ.s.bossHits = 3;
EQ.go('boss');
ok('three hits of four is not a piece', EQ.relicNow().have === 0);
answer(true);
ok('the boss beaten → stage 1 piece', EQ.s.bossBeaten && EQ.s.relics[1] === 1 && EQ.relicNow().have === 1);
EQ.go('boss');
ok('revisiting a beaten boss adds nothing', EQ.s.relics[1] === 1);
EQ.openChest(); EQ.nextStage();
beatBoss();
ok('stage 2 boss → two pieces', EQ.s.relics[1] === 3 && EQ.relicNow().have === 2 && !EQ.relicNow().whole);
EQ.openChest(); EQ.nextStage();
ok('stage 3 is the finale', EQ.chapter().final);
beatBoss();
ok('the finale → the relic is whole', EQ.s.relics[1] === 7 && EQ.relicNow().whole);
LANGS.forEach(l => {
  EQI.set(l);
  ok(`the bag says it was rebuilt (${l})`, bag().indexOf(TX(EQD.CHAPTERS[0].relic.done)) >= 0);
});
EQI.set('az');
EQ.openChest(); EQ.nextStage();
ok('chapter 2 starts its own relic, empty', EQ.chapter().chapterNo === 2 && EQ.relicNow().have === 0 && EQ.relicNow().relic === EQD.CHAPTERS[1].relic);
ok('…and chapter 1\'s record is kept', EQ.s.relics[1] === 7);
ok('the bag names chapter 2\'s relic, not the crystal', bag().indexOf(TX(EQD.CHAPTERS[1].relic.piece)) >= 0 && bag().indexOf(TX(EQD.CHAPTERS[0].relic.piece)) < 0);

group('a stage the calendar moved past is missed, never counted');
fresh();
EQ.s.challengesDone = 5;
beatBoss();
EQ.newDay(EQ.dayKey());                      /* day 2: stage 2, never finished */
EQ.newDay(EQ.dayKey());                      /* day 3: the finale */
ok('the day moved the adventure to stage 3', EQ.chapter().stageNo === 3);
ok('only the piece really won is counted', EQ.relicNow().have === 1 && EQ.relicNow().missed === 1);
LANGS.forEach(l => {
  EQI.set(l);
  const h = text(bag());
  ok(`the bag says a stage passed without its boss (${l})`, h.indexOf(`1/${PER}`) >= 0 && /boss|босс/i.test(h) && !BAD.test(h));
});
EQI.set('az');
beatBoss();
ok('the finale still adds its own piece — 2 of 3, not whole', EQ.relicNow().have === 2 && !EQ.relicNow().whole);
ok('a relic never loses a piece (no path in js/ clears a bit)', !/relics\[[^\]]+\]\s*(&=|=\s*0\b|-=)|delete\s+[\w.]*relics/.test(fs.readFileSync(path.join(JS, 'app.js'), 'utf8')));

group('a save from before the relics keeps what the old bag showed');
const oldSave = fields => {
  const s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  delete s.relics;
  Object.assign(s, { onboarded: true }, fields);
  store._m = {};
  store.setItem(EQP.key(), JSON.stringify(s));
  EQ.load();
};
oldSave({ questDay: 0, bossBeaten: false });
ok('stage 1, boss not beaten → no pieces', JSON.stringify(EQ.s.relics) === '{}');
oldSave({ questDay: 0, bossBeaten: true });
ok('stage 1, boss beaten → one piece', EQ.s.relics[1] === 1);
oldSave({ questDay: 2, bossBeaten: false });
ok('stage 3 of chapter 1 → the two earlier stages credited', EQ.s.relics[1] === 3 && EQ.relicNow().missed === 0);
oldSave({ questDay: 4, bossBeaten: true });
ok('chapter 2, stage 2, beaten → two pieces of chapter 2', EQ.s.relics[2] === 3 && !EQ.s.relics[1]);
oldSave({ questDay: 4, bossBeaten: false, relics: { 2: 1, x: 9, 0: 7, 3: 'junk' } });
ok('once there is a record, only the record decides (junk dropped)', JSON.stringify(EQ.s.relics) === '{"2":1}');
oldSave({ questDay: 4, relics: { 2: 255 } });
ok('a mask wider than three stages is trimmed', EQ.s.relics[2] === 7);

/* ── 4 · the carry ── */
group('a transfer carries sparks and relics, and old codes and files still read');
(() => {
  const st = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  Object.assign(st, { onboarded: true, heroName: 'Aysel', level: 4, questDay: 7, hintSparks: 41, relics: { 1: 7, 2: 5, 3: 2 } });
  st.track = { start: EQ.dayKey(), days: {} }; st.lastDay = EQ.dayKey();
  const packed = EQX.pack(st, 0);
  /* the room came after them as a thirteenth group (test/home.js); the relics keep the twelfth */
  ok('the relics ride in the twelfth group', packed.split('_').length >= 12 && packed.split('_')[11] === '1.7-2.5-3.2');
  const back = EQX.clean(EQX.unpack(packed));
  ok('code round trip: sparks', back.hintSparks === 41);
  ok('code round trip: relics', JSON.stringify(back.relics) === JSON.stringify({ 1: 7, 2: 5, 3: 2 }), JSON.stringify(back.relics));
  const none = Object.assign({}, st, { relics: {} });
  const nb = EQX.clean(EQX.unpack(EQX.pack(none, 0)));
  ok('an empty record stays empty (not re-derived)', JSON.stringify(nb.relics) === '{}');

  /* written by the build before this change: 4 sparks, chapter 2 stage 2, boss beaten */
  const OLD = '1_Aysel_F2C49B.4A2E20.3DBE6E.2A9455.5B3FD6.0.3_FF9243.F0762A_0.g.0.1.1.0.0.0.0.0.4.0.0.4.0.0.0_1f_3d.19.xc.0.0_fzg.0.4..___';
  ok('the fixture is an eleven-group code', OLD.split('_').length === 11);
  const old = EQX.clean(EQX.unpack(OLD));
  ok('an old code still imports', old && old.heroName === 'Aysel' && old.level === 16);
  ok('…with its sparks', old.hintSparks === 4);
  ok('…and relics derived as the loader derives them', JSON.stringify(old.relics) === '{"2":3}', JSON.stringify(old.relics));

  const b1 = EXB => EQX.readBundle(JSON.stringify({ app: 'eduquest', made: '2026-09-29', profiles: [{ state: EXB }] }));
  const f1 = b1(Object.assign({}, st));
  ok('a backup file carries sparks and relics', f1 && f1.states[0].hintSparks === 41 && f1.states[0].relics[2] === 5);
  const legacy = Object.assign({}, st, { questDay: 2, bossBeaten: true });
  delete legacy.relics;
  const f2 = b1(legacy);
  ok('a file from before the relics derives them', f2 && f2.states[0].relics[1] === 7);
  const f3 = b1(Object.assign({}, st, { relics: '<script>', hintSparks: -5 }));
  ok('a hostile file cannot put markup or a negative count on the bag',
    f3 && JSON.stringify(f3.states[0].relics).indexOf('<') < 0 && f3.states[0].hintSparks === 0);
})();

/* ── 5 · every chapter, every language ── */
group('the bag renders clean for every chapter and language');
EQD.CHAPTERS.forEach((c, ci) => {
  [0, 1, 2].forEach(stage => {
    fresh();
    EQ.s.questDay = ci * PER + stage;
    EQ.s.relics = { [ci + 1]: stage === 2 ? 5 : 1 };
    EQ.s.hintSparks = 3;
    LANGS.forEach(l => {
      EQI.set(l);
      let h = '';
      try { h = bag(); } catch (e) { h = 'THREW ' + e.message; }
      ok(`${c.id} · stage ${stage + 1} · ${l}: renders, no undefined / NaN`, !BAD.test(h) && h.indexOf('THREW') < 0 && h.indexOf(TX(c.relic.piece)) >= 0);
    });
  });
});

/* ── 6 · the cache ── */
group('installed phones fetch the new code');
(() => {
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  const m = /const CACHE = 'eduquest-v(\d+)'/.exec(sw);
  ok('sw.js cache bumped past v26', m && Number(m[1]) >= 27, m && m[0]);
})();

console.log('\n' + (fail ? `${fail} OF ${pass + fail} CHECKS FAILED` : `ALL ${pass} CHECKS PASSED`));
process.exit(fail ? 1 : 0);
