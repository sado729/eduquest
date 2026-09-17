/* EduQuest — regression test for the chapter structure (3 stages = 1 chapter).
   Run it with:  node test/chapters.js      (no dependencies, no build step)

   Why this file exists: the chapter framing used to be three hardcoded strings
   ("FƏSİL 2 / 3"), so the screens said "chapter 2 of 3" no matter where the child
   actually was. It is now derived from questDay by EQD.chapterAt(), and every
   screen — details, story, quest, map, boss, victory — reads its names, its beats
   and its boss out of EQD.CHAPTERS.

   Two things here fail silently if they break:

     1. the *shape*. A chapter finale is the longer fight (6 hits, not 4), and the
        boss question pool has to be deep enough to supply one question per hit.
        Make the pool four long again and the sixth hit reuses — or crashes on —
        a missing question, with nothing in the UI to say so.
     2. the *content*. Every chapter needs a guardian and a finale, one beat per
        stage, and a boss whose `hits` a pool can cover. A chapter added without a
        finale would simply fall back to a guardian and the chapter would never
        feel like it ended.

   The play-loop half drives the real EQ.answer()/EQ.nextStage() through two whole
   chapters, so the state machine itself — not a reimplementation — is what is
   asserted: that stage 3 takes six hits, stage 1–2 take four, and clearing a
   finale rolls the child into the next chapter. */

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
const sandbox = {
  document: { hidden: false, title: '', documentElement: {}, body: {}, getElementById: () => null, addEventListener() {} },
  localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; }, removeItem(k) { delete this._m[k]; } },
  navigator: {}, console, Math, JSON, Date, Object, Array, String, Number,
  isNaN, parseInt, parseFloat, setTimeout: f => { f(); return 0; }, clearTimeout: () => {},
  setInterval: () => 0, clearInterval: () => {},
  addEventListener() {}, matchMedia: () => ({ matches: false, addListener() {} }),
  AudioContext: function () {}, location: { search: '' }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const FILES = ['i18n.js', 'components.js', 'data.js', 'tracking.js', 'profiles.js', 'qr.js',
  'transfer.js', 'interact.js', 'screens-onboarding.js', 'screens-world.js', 'screens-play.js',
  'screens-collect.js', 'parent.js', 'app.js'];
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
/* the game's files use `const`, which never lands on the context object */
vm.runInContext('this.EQ = EQ; this.EQD = EQD; this.EQS = EQS; this.EQT = EQT; this.EQ_DEFAULTS = EQ_DEFAULTS; this.TX = TX; this.EQI = EQI;', sandbox);
const { EQ, EQD, EQS, EQT, EQ_DEFAULTS, TX, EQI } = sandbox;

const fresh = () => {
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.onboarded = true;
  EQ.s.settings.music = false;      /* no AudioContext in node */
  EQ.save = () => {};
  EQ.render = () => {};
  EQ.toast = m => EQ._toasts.push(m);
  EQ._toasts = [];
  EQ.current = 'map';
  EQ.restGuard = () => false;       /* the rest screen has its own suite */
  EQ.checkNewDay = () => false;
  /* tracking has its own store and its own suite; it is not what is under test */
  for (const k of ['attempt', 'done', 'hint', 'bossHit', 'bossWin', 'tick']) EQT[k] = () => {};
};

/* ── 1 · the shape ── */
group('chapterAt — 3 stages make a chapter');
fresh();
ok('a chapter is 3 stages', EQD.STAGES_PER_CHAPTER === 3, 'got ' + EQD.STAGES_PER_CHAPTER);
ok('stage 0 is chapter 1, stage 1', (() => { const c = EQD.chapterAt(0); return c.chapterNo === 1 && c.stageNo === 1; })());
ok('stage 2 is the chapter 1 finale', (() => { const c = EQD.chapterAt(2); return c.chapterNo === 1 && c.stageNo === 3 && c.final; })());
ok('stage 3 opens chapter 2', (() => { const c = EQD.chapterAt(3); return c.chapterNo === 2 && c.stageNo === 1 && !c.final; })());
ok('only every 3rd stage is a finale',
  [0, 1, 2, 3, 4, 5, 6, 7, 8].map(d => EQD.chapterAt(d).final).join() === 'false,false,true,false,false,true,false,false,true');
ok('chapters cycle but the number keeps climbing', (() => {
  const c = EQD.chapterAt(EQD.STAGES_PER_CHAPTER * EQD.CHAPTERS.length);
  return c.chapterNo === EQD.CHAPTERS.length + 1 && c.ch === EQD.CHAPTERS[0];
})());
ok('a negative / missing questDay is still chapter 1 stage 1',
  [undefined, null, -5].every(d => { const c = EQD.chapterAt(d); return c.chapterNo === 1 && c.stageNo === 1; }));

group('the finale is the longer fight');
ok('a guardian takes 4 hits', EQD.chapterAt(0).boss.hits === 4);
ok('a finale takes 6 hits', EQD.chapterAt(2).boss.hits === 6);
ok('stages 1–2 share the chapter guardian',
  EQD.chapterAt(0).boss === EQD.chapterAt(1).boss && EQD.chapterAt(0).boss === EQD.CHAPTERS[0].guardian);
ok('stage 3 uses the chapter finale', EQD.chapterAt(2).boss === EQD.CHAPTERS[0].finale);

group('every boss has a question per hit');
let deep = true, why = '';
for (let d = 0; d < EQD.STAGES_PER_CHAPTER * EQD.CHAPTERS.length + 3; d++) {
  const need = EQD.chapterAt(d).boss.hits;
  const pool = EQD.questSet(d).boss.length;
  if (pool < need) { deep = false; why = 'stage ' + d + ': pool ' + pool + ' < ' + need + ' hits'; break; }
}
ok('the boss pool covers the hits it needs, every stage', deep, why);
ok('day 0 (the hand-authored set) is deep enough too',
  EQD.questSet(0).boss.length >= EQD.chapterAt(0).boss.hits);
ok('boss questions are distinct objects', (() => {
  const b = EQD.questSet(1).boss;
  return new Set(b).size === b.length;
})());

/* ── 2 · the content ── */
group('every chapter is complete');
EQD.CHAPTERS.forEach((c, i) => {
  const tag = 'chapter ' + (i + 1) + ' (' + c.id + ')';
  ok(tag + ': has a guardian and a finale', !!c.guardian && !!c.finale);
  ok(tag + ': one beat per stage', c.beats.length === EQD.STAGES_PER_CHAPTER,
    'got ' + c.beats.length);
  ok(tag + ': the finale is longer than the guardian fight', c.finale.hits > c.guardian.hits);
  const keys = ['name', 'role', 'awaits', 'face', 'befriended', 'done', 'banner', 'badge', 'badgeNote'];
  ok(tag + ': both bosses carry every label',
    keys.every(k => c.guardian[k] && c.finale[k]),
    keys.filter(k => !c.guardian[k] || !c.finale[k]).join());
  ok(tag + ': both bosses carry their arena colours',
    ['sky', 'floor', 'glow', 'accent', 'accentSoft'].every(k => c.guardian[k] && c.finale[k]));
});
ok('chapter ids are unique', new Set(EQD.CHAPTERS.map(c => c.id)).size === EQD.CHAPTERS.length);
ok('finale names are all different', (() => {
  const n = EQD.CHAPTERS.map(c => c.finale.name.en);
  return new Set(n).size === n.length;
})());

/* ── 3 · the screens actually say it ── */
group('the screens render the real chapter, not a hardcoded one');
const strip = h => h.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
fresh();
for (const lang of ['az', 'en', 'ru']) {
  EQI.set(lang);
  let clean = true, leak = '';
  for (let day = 0; day < 9; day++) {
    EQ.s.questDay = day;
    const cp = EQ.chapter();
    for (const [done, hits, beaten] of [[2, 0, false], [5, 0, false], [5, cp.boss.hits, true]]) {
      EQ.s.challengesDone = done; EQ.s.bossHits = hits; EQ.s.bossBeaten = beaten;
      EQ.s.chestReady = beaten; EQ.s.chestOpened = false;
      const pool = EQ.qset().boss;
      EQ.session.q = done >= 5 ? pool[Math.min(pool.length - 1, hits)] : EQ.qset().questions[done];
      EQ.session.ctx = done >= 5 ? 'boss' : 'daily';
      for (const name of ['map', 'quest', 'details', 'story', 'boss', 'victory']) {
        const html = EQS.screens[name](EQ.s);
        if (typeof html !== 'string' || !html.length) { clean = false; leak = name + ' rendered nothing'; break; }
        const m = html.match(/undefined|\[object Object\]|NaN/);
        if (m) { clean = false; leak = name + ' @ stage ' + day + ': ' + m[0]; break; }
      }
      if (!clean) break;
    }
    if (!clean) break;
  }
  ok(lang + ': every chapter screen renders without a gap', clean, leak);
}
EQI.set('en');

fresh();
EQ.s.questDay = 4;                 /* chapter 2, stage 2 */
EQ.s.challengesDone = 2;
let d = strip(EQS.screens.details(EQ.s));
ok('details names the real chapter and stage', /CHAPTER 2 · STAGE 2 OF 3/.test(d), d.slice(0, 80));
ok('details no longer says the old hardcoded "CHAPTER 2 OF 3"', !/CHAPTER 2 OF 3/.test(d));
ok('details shows this chapter\'s title', d.includes(EQD.CHAPTERS[1].title.en), d.slice(0, 120));
ok('details marks the cleared stage 1 as done', /1 · .* Done/.test(d), d.slice(0, 200));
ok('details locks the stage 3 finale', d.includes('Chapter finale'));

EQ.s.questDay = 2;                 /* chapter 1, the finale */
EQ.s.challengesDone = 5; EQ.s.bossHits = 0; EQ.s.bossBeaten = false;
EQ.session.q = EQ.qset().boss[0]; EQ.session.ctx = 'boss';
const b = strip(EQS.screens.boss(EQ.s));
ok('the finale boss screen names the finale', b.includes(EQD.CHAPTERS[0].finale.name.en), b.slice(0, 80));
ok('the finale boss screen counts to 6', /6 to go/.test(b), b.slice(0, 120));
ok('the finale boss screen is not the guardian', !b.includes('GUARDIAN OF THE BRIDGE'));

/* ── 4 · the real play loop ── */
group('playing two whole chapters');
fresh();
let loopOk = true, note = '';
const seen = [];
for (let stage = 0; stage < 6; stage++) {
  const cp = EQ.chapter();
  seen.push('ch' + cp.chapterNo + 's' + cp.stageNo + (cp.final ? 'F' : ''));
  for (let i = 0; i < 5; i++) {
    EQ.go('challenge');
    const q = EQ.session.q;
    if (!q) { loopOk = false; note = 'no question at stage ' + stage + ' challenge ' + i; break; }
    EQ.answer(q.answers.indexOf(q.correct));
  }
  if (!loopOk) break;
  if (EQ.s.challengesDone !== 5) { loopOk = false; note = 'stage ' + stage + ': challengesDone ' + EQ.s.challengesDone; break; }
  let hits = 0;
  while (!EQ.s.bossBeaten && hits < 12) {
    EQ.go('boss');
    const q = EQ.session.q;
    if (!q) { loopOk = false; note = 'stage ' + stage + ': no boss question at hit ' + hits; break; }
    EQ.answer(q.answers.indexOf(q.correct));
    hits++;
  }
  if (!loopOk) break;
  if (hits !== cp.boss.hits) { loopOk = false; note = 'stage ' + stage + ': took ' + hits + ' hits, boss needs ' + cp.boss.hits; break; }
  EQ.s.chestOpened = true;
  EQ.nextStage();
}
ok('six stages play through cleanly', loopOk, note);
ok('they were the right six', seen.join(' ') === 'ch1s1 ch1s2 ch1s3F ch2s1 ch2s2 ch2s3F', seen.join(' '));
ok('clearing a finale lands in the next chapter', EQ.chapter().chapterNo === 3 && EQ.chapter().stageNo === 1);
ok('a trophy per boss', EQ.s.trophiesEarned === 6, 'got ' + EQ.s.trophiesEarned);
ok('a chapter start is announced when one opens',
  EQ._toasts.filter(t => /Chapter \d begins/.test(t)).length === 2,
  EQ._toasts.join(' | '));

group('a finale pays more than a guardian');
fresh();
const purse = final => {
  fresh();
  EQ.s.questDay = final ? 2 : 0;
  EQ.s.challengesDone = 5;
  const before = { xp: EQ.s.xp, coins: EQ.s.coins };
  let n = 0;
  while (!EQ.s.bossBeaten && n < 12) { EQ.go('boss'); const q = EQ.session.q; EQ.answer(q.answers.indexOf(q.correct)); n++; }
  return { xp: EQ.s.xp - before.xp, coins: EQ.s.coins - before.coins };
};
const g = purse(false), f = purse(true);
ok('a guardian pays 250 XP / 100 coins', g.xp === 250 && g.coins === 100, JSON.stringify(g));
ok('a finale pays more of both', f.xp > g.xp && f.coins > g.coins, JSON.stringify(f));

/* ── done ── */
console.log('\n' + (fail ? fail + ' CHECK' + (fail === 1 ? '' : 'S') + ' FAILED of ' + (pass + fail) : 'ALL ' + pass + ' CHECKS PASSED'));
process.exit(fail ? 1 : 0);
