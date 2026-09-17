/* EduQuest — regression test for adaptive difficulty and spaced repetition.
   Run it with:  node test/adaptive.js      (no dependencies, no build step)

   Why this file exists: EQT has recorded per-topic accuracy and hint counts since
   parent tracking was built, and for a long time nothing read any of it back into
   what the child was actually asked. `EQD.genDay` handed out the same five topics in
   the same order every single day — add, pattern, groups, take, double — however the
   child had been doing. A child who could not subtract got exactly one subtraction
   question a day, the same as a child who had mastered it; a child who had mastered
   doubles got asked about doubles forever. The statistics were real and the teaching
   was not, which is the difference between a question booklet and a teacher.

   Two mechanisms close that gap, and both of them fail *silently* — a broken version
   still serves five perfectly playable questions, and nobody looking at the screen
   can tell that the adaptation stopped:

     1. WEAKNESS WEIGHTING. A topic the child misses, or needs hints for, should come
        round more often than one they answer cleanly. If the scoring breaks, the set
        is still five good questions — just the wrong five, forever.
     2. SPACED REPETITION. A topic answered correctly should come back after a gap
        that grows (3 days, 6, 12 …), because a review timed as recall starts to fade
        is worth several timed while it is still fresh. If the schedule breaks, the
        child either drills what they already know or never revisits it at all.

   Three further things have to hold or the adaptation does real harm:

     3. VARIETY. Weighting toward weakness must never become five questions on the
        child's worst topic. That is a worksheet, and it teaches a six-year-old that
        the game punishes being bad at something. MAX_REPEAT caps it.
     4. STABILITY WITHIN A DAY. The plan is recomputed from stats that change with
        every answer. If it were consulted live, answering challenge 3 would reshuffle
        challenge 4 underneath the child. The plan is frozen per quest day.
     5. THE FIRST DAY. A child with no history must still get a sensible, varied set —
        the adaptation must degrade to the original fixed lineup, not to nothing.

   The screens are design-project visuals and this loop is hand-written, so a re-sync
   can restore every screen and quietly drop the adaptation. If this suite goes red
   after a re-sync, that is what happened — see the adaptive section of js/tracking.js
   (`mastery`, `review`, `plan`, `todayPlan`) and `EQD.genDay` in js/data.js. */

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
  navigator: {}, console, Math, JSON, Date, Object, Array, String, Number, Set,
  isNaN, parseInt, parseFloat, setTimeout: f => { f(); return 0; }, clearTimeout: () => {},
  setInterval: () => 0, clearInterval: () => {},
  addEventListener() {}, matchMedia: () => ({ matches: false, addListener() {} }),
  AudioContext: function () {}, location: { search: '' }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const FILES = ['i18n.js', 'components.js', 'data.js', 'tracking.js', 'profiles.js', 'qr.js',
  'transfer.js', 'screens-onboarding.js', 'screens-world.js', 'screens-play.js',
  'screens-collect.js', 'parent.js', 'app.js'];
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
vm.runInContext('this.EQ = EQ; this.EQD = EQD; this.EQS = EQS; this.EQT = EQT; this.EQX = EQX; this.EQ_DEFAULTS = EQ_DEFAULTS; this.TX = TX; this.EQI = EQI;', sandbox);
const { EQ, EQD, EQT, EQX, EQ_DEFAULTS, EQI } = sandbox;

const realGo = EQ.go;
const TOPICS = Object.keys(EQT.TOPICS);

const fresh = () => {
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.onboarded = true;
  EQ.s.settings.music = false;
  EQ.s.questDay = 1;
  EQ.save = () => {};
  EQ.render = () => {};
  EQ.toast = () => {};
  EQ.current = 'quest';
  EQ.go = realGo;
  EQ.restGuard = () => false;
  EQ.checkNewDay = () => false;
  EQ.session.mission = null;
  EQ.session.ctx = 'daily';
  EQ.session.q = null;
  EQ.session.qIdx = -1;
  EQ.session.answering = false;
  EQT.init(EQ.s);
  EQD._dayCache = null; EQD._dayCacheKey = null;
};

/* a day key `n` days before today, which is how history is written */
const dayAgo = n => {
  const t = new Date();
  return EQ.dayKey(new Date(t.getFullYear(), t.getMonth(), t.getDate() - n));
};

/* write history directly: `ago` days back, topic answered `a` times with `c` right
   and `h` hints. This is exactly the shape EQT.attempt/hint leave behind. */
const history = (ago, topic, a, c, h) => {
  const k = dayAgo(ago);
  const days = EQ.s.track.days;
  const d = days[k] || (days[k] = { secs: 0, secsQ: 0, secsB: 0, a: 0, c: 0, done: 0, hg: 0, hints: 0, boss: 0, bossWin: 0, subj: {}, topics: {} });
  const t = d.topics[topic] || (d.topics[topic] = { a: 0, c: 0, h: 0 });
  t.a += a; t.c += c; t.h += (h || 0);
  d.a += a; d.c += c; d.hints += (h || 0);
};

const count = (arr, k) => arr.filter(x => x === k).length;

/* ── 1 · mastery reflects how play actually went ── */
group('a topic is scored by how the child really did, not by how often it appeared');
fresh();
ok('a topic never played scores unknown, not zero',
  EQT.mastery().add.score === null,
  'got ' + EQT.mastery().add.score);

fresh();
history(1, 'add', 10, 10, 0);
history(1, 'take', 10, 1, 0);
let m = EQT.mastery();
ok('a topic answered right scores high', m.add.score > 0.8, 'got ' + m.add.score);
ok('a topic answered wrong scores low', m.take.score < 0.3, 'got ' + m.take.score);
ok('the strong topic outscores the weak one', m.add.score > m.take.score);

/* the hint half-credit is the whole reason a child who leans on hints is not
   mistaken for a child who has mastered the topic */
fresh();
history(1, 'add', 10, 10, 0);
history(1, 'double', 10, 10, 10);
m = EQT.mastery();
ok('right-without-help beats right-after-a-hint',
  m.add.score > m.double.score,
  m.add.score + ' vs ' + m.double.score);
ok('hints on every question is not counted as mastery',
  m.double.score < EQT.SOLID_AT,
  'got ' + m.double.score);

/* thin evidence must not brand a topic — one miss on a brand new topic is noise */
fresh();
history(1, 'take', 1, 0, 0);
const thin = EQT.mastery().take.score;
fresh();
history(1, 'take', 12, 0, 0);
const thick = EQT.mastery().take.score;
ok('one miss is treated far more gently than twelve', thin > thick, thin + ' vs ' + thick);
ok('one miss alone does not read as total failure', thin > 0.2, 'got ' + thin);

group('recent play counts for more than old play');
fresh();
history(1, 'add', 8, 8, 0);      /* fixed recently */
history(20, 'add', 8, 0, 0);     /* was bad long ago */
const recovered = EQT.mastery().add.score;
fresh();
history(1, 'add', 8, 0, 0);      /* broken recently */
history(20, 'add', 8, 8, 0);     /* used to be fine */
const decayed = EQT.mastery().add.score;
ok('a topic recently fixed outscores one recently broken',
  recovered > decayed, recovered + ' vs ' + decayed);
ok('the recently fixed topic reads as solid-ish', recovered > 0.5, 'got ' + recovered);
ok('the recently broken topic reads as weak', decayed < 0.5, 'got ' + decayed);

fresh();
history(60, 'add', 20, 0, 0); /* far outside the window */
ok('play older than the window is ignored entirely',
  EQT.mastery().add.score === null,
  'got ' + EQT.mastery().add.score);

/* ── 2 · spaced repetition ── */
group('a topic answered cleanly is scheduled, not finished');
fresh();
const qAdd = { tag: { en: 'ADDING ON' }, subj: 'math' };
const qTake = { tag: { en: 'TAKING AWAY' }, subj: 'math' };

ok('a topic never scheduled is due now', EQT.dueIn('add') <= 0);
EQT.review(qAdd, true, false);
ok('one clean pass pushes it out by the first gap',
  EQT.sched().add.gap === EQT.FIRST_GAP,
  'gap ' + EQT.sched().add.gap);
ok('and it is no longer due today', EQT.dueIn('add') === EQT.FIRST_GAP, 'due in ' + EQT.dueIn('add'));
ok('three days is the first gap the design asks for', EQT.FIRST_GAP === 3);

const g1 = EQT.sched().add.gap;
EQT.review(qAdd, true, false);
const g2 = EQT.sched().add.gap;
EQT.review(qAdd, true, false);
const g3 = EQT.sched().add.gap;
ok('each further clean pass widens the gap', g2 > g1 && g3 > g2, [g1, g2, g3].join(' → '));
ok('the gaps grow by the stated factor', g2 === g1 * EQT.GAP_GROWTH);
ok('the clean-pass streak is counted', EQT.sched().add.streak === 3);

for (let i = 0; i < 12; i++) EQT.review(qAdd, true, false);
ok('the gap is capped so a topic is never retired for good',
  EQT.sched().add.gap === EQT.MAX_GAP,
  'got ' + EQT.sched().add.gap);

group('a lapse cancels the schedule');
fresh();
EQT.review(qAdd, true, false);
EQT.review(qAdd, true, false);
ok('the topic is comfortably scheduled away', EQT.dueIn('add') > 3);
EQT.review(qAdd, false, false);
ok('a wrong answer makes it due immediately', EQT.dueIn('add') <= 0);
ok('and the gap collapses', EQT.sched().add.gap === 0);
ok('and the streak resets', EQT.sched().add.streak === 0);

fresh();
EQT.review(qAdd, true, false);
EQT.review(qAdd, true, true); /* right, but only with the hint */
ok('right-with-a-hint does not earn a longer gap',
  EQT.dueIn('add') <= 0,
  'due in ' + EQT.dueIn('add'));

group('the schedule survives a reload and a transfer');
fresh();
EQT.review(qAdd, true, false);
const saved = JSON.parse(JSON.stringify(EQ.s));
EQ.s = saved;
EQT.init(EQ.s);
ok('a saved schedule is still there after init', EQT.sched().add.gap === EQT.FIRST_GAP);

EQ.s.track.sched = { add: { due: 'not-a-date', gap: 999, streak: -4 }, ghost: { due: 'x' }, bad: null };
EQT.init(EQ.s);
ok('a schedule for a topic that no longer exists is dropped', !EQT.sched().ghost);
ok('a null entry is dropped', !EQT.sched().bad);
ok('an impossible gap is clamped', EQT.sched().add.gap === EQT.MAX_GAP, 'got ' + EQT.sched().add.gap);
ok('a negative streak is clamped', EQT.sched().add.streak === 0);
ok('an unparseable due date falls back to today', EQT.dueIn('add') === 0);

/* ── 3 · the plan the child actually plays ── */
group('the weak topic comes round more often than the strong one');
fresh();
/* subtraction is a real problem; everything else is fine */
TOPICS.forEach(t => history(1, t, 10, 10, 0));
history(1, 'take', 12, 1, 6);
history(3, 'take', 12, 2, 6);
let plan = EQT.plan(5, 5);
ok('the plan still fills the whole day', plan.length === 5, plan.join(','));
ok('the struggling topic gets more than one slot',
  count(plan, 'take') >= 2, plan.join(','));
ok('every topic in the plan is a real topic',
  plan.every(t => !!EQT.TOPICS[t]), plan.join(','));

group('but a weak topic never takes over the whole day');
fresh();
TOPICS.forEach(t => history(1, t, 10, 10, 0));
/* make one topic catastrophically bad over a long stretch */
for (let d = 1; d <= 14; d++) history(d, 'take', 12, 0, 10);
plan = EQT.plan(5, 5);
ok('the worst topic is capped',
  count(plan, 'take') <= EQT.MAX_REPEAT,
  plan.join(','));
ok('the day is never one topic five times',
  new Set(plan).size >= 3, plan.join(','));
ok('a six-year-old still meets several topics',
  new Set(plan).size >= 3, plan.join(','));

group('a session does not open on the hardest thing');
fresh();
TOPICS.forEach(t => history(1, t, 10, 10, 0));
for (let d = 1; d <= 10; d++) history(d, 'take', 12, 0, 10);
plan = EQT.plan(5, 5);
const mm = EQT.mastery();
const sc = k => (mm[k] && mm[k].score == null ? 0.5 : mm[k].score);
ok('the set does not begin with the weakest topic', plan[0] !== 'take', plan.join(','));
ok('the set does not end with the weakest topic either', plan[4] !== 'take', plan.join(','));
ok('the opener is at least as strong as the middle',
  sc(plan[0]) >= Math.min(sc(plan[1]), sc(plan[2])), plan.join(','));

group('a topic that is due comes back even when it is not weak');
fresh();
/* everything is equally well known, but one topic is long overdue */
TOPICS.forEach(t => history(2, t, 8, 8, 0));
TOPICS.forEach(t => { EQT.sched()[t] = { due: dayAgo(-10), gap: 6, streak: 2 }; }); /* all far in the future */
EQT.sched().double = { due: dayAgo(9), gap: 6, streak: 2 };                          /* this one is overdue */
plan = EQT.plan(5, 5);
ok('the overdue topic is on the day’s list', plan.indexOf('double') >= 0, plan.join(','));

/* ── 4 · the day's five questions really follow the plan ── */
group('the plan becomes the questions the child is handed');
fresh();
const forced = ['double', 'take', 'take', 'pattern', 'add'];
const set = EQD.genDay(4, forced);
ok('five questions are built', set.questions.length === 5);
ok('every question is answerable',
  set.questions.every(q => Array.isArray(q.answers) && q.answers.indexOf(q.correct) >= 0));
ok('every question is trilingual',
  set.questions.every(q => q.title && q.title.az && q.title.en && q.title.ru));
ok('every question can be drawn',
  set.questions.every(q => typeof q.visual === 'function' && typeof q.visual() === 'string'));
ok('every question can be hinted',
  set.questions.every(q => q.hint && q.hint.heading));
ok('the questions are the planned topics, in order',
  set.questions.map(q => EQT.topicKey(q)).join(',') === forced.join(','),
  set.questions.map(q => EQT.topicKey(q)).join(','));
ok('the boss fight is still its own fixed six', set.boss.length === 6);
ok('the day keeps its theme and its chest',
  !!set.title && !!set.headline && !!set.chestTitle && typeof set.progressLine === 'function');

group('a different plan really produces a different day');
fresh();
const a = EQD.genDay(4, ['add', 'add', 'pattern', 'groups', 'double']);
const aTopics = a.questions.map(q => EQT.topicKey(q)).join(',');
const b = EQD.genDay(4, ['take', 'take', 'pattern', 'groups', 'double']);
const bTopics = b.questions.map(q => EQT.topicKey(q)).join(',');
ok('the cache does not serve the first plan for the second', aTopics !== bTopics, aTopics + ' vs ' + bTopics);

/* ── 5 · difficulty follows mastery ── */
group('a mastered topic is asked a harder question');
fresh();
for (let d = 1; d <= 6; d++) history(d, 'double', 10, 10, 0);
ok('a mastered topic is marked hard', EQT.hardFor('double') === true,
  'score ' + EQT.mastery().double.score);
fresh();
for (let d = 1; d <= 6; d++) history(d, 'double', 10, 1, 8);
ok('a struggling topic stays gentle', EQT.hardFor('double') === false,
  'score ' + EQT.mastery().double.score);
fresh();
ok('an unknown topic stays gentle', EQT.hardFor('double') === false);

/* the harder variant has to be a real question, not just a wider range that breaks */
fresh();
for (let d = 1; d <= 6; d++) TOPICS.forEach(t => history(d, t, 10, 10, 0));
const hardSet = EQD.genDay(7, EQT.plan(7, 5));
ok('a day built entirely of mastered topics is still playable',
  hardSet.questions.every(q => Array.isArray(q.answers) && q.answers.indexOf(q.correct) >= 0
    && q.title && q.title.az && q.title.en && q.title.ru
    && typeof q.visual() === 'string'));

/* ── 6 · the plan holds still while the child plays it ── */
group('answering a question does not reshuffle the rest of the day');
fresh();
TOPICS.forEach(t => history(1, t, 6, 3, 2));
const before = EQ.qset().questions.map(q => EQT.topicKey(q)).join(',');
/* answer the first challenge — this reschedules its topic mid-day */
EQ.go('challenge');
const firstQ = EQ.session.q;
EQ.session.answering = false;
EQ.answer(firstQ.answers.indexOf(firstQ.correct));
const after = EQ.qset().questions.map(q => EQT.topicKey(q)).join(',');
ok('the day’s topics are unchanged after an answer', before === after, before + ' → ' + after);
ok('the answer still counted', EQ.s.challengesDone === 1);
ok('but the schedule did move', EQT.sched()[EQT.topicKey(firstQ)].gap > 0);

group('the frozen plan is rebuilt when the day turns over');
fresh();
const planDay1 = EQT.todayPlan(1).join(',');
ok('the plan is remembered for the day', EQT.todayPlan(1).join(',') === planDay1);
ok('the plan is stored in state', EQ.s.track.plan && EQ.s.track.plan.day === 1);
/* a new day, with fresh evidence that one topic is now a problem */
for (let d = 0; d <= 3; d++) history(d, 'take', 12, 0, 10);
EQT.replan(2);
ok('the new day is planned afresh', EQ.s.track.plan.day === 2);
ok('the newly weak topic is picked up', EQT.todayPlan(2).indexOf('take') >= 0,
  EQT.todayPlan(2).join(','));

fresh();
EQ.s.track.plan = { day: 1, topics: ['ghost', 'add', 'add', 'add', 'add'] };
ok('a stored plan naming a dead topic is rebuilt',
  EQT.todayPlan(1).every(t => !!EQT.TOPICS[t]), EQT.todayPlan(1).join(','));

group('the quest day advancing replans the set');
fresh();
EQ.s.bossBeaten = true; EQ.s.chestReady = true; EQ.s.chestOpened = true;
EQ.nextStage();
ok('the next stage planned its own set', EQ.s.track.plan.day === EQ.s.questDay);

/* ── 7 · a brand new child still gets a good day ── */
group('a child with no history gets the original varied lineup');
fresh();
EQ.s.track.days = {};
plan = EQT.plan(1, 5);
ok('five topics are planned with no evidence at all', plan.length === 5, plan.join(','));
ok('and they are all different', new Set(plan).size === 5, plan.join(','));
ok('every subject the game teaches is represented',
  TOPICS.every(t => plan.indexOf(t) >= 0), plan.join(','));

const day1 = EQD.genDay(1, EQT.plan(1, 5));
ok('day one is fully playable',
  day1.questions.length === 5
  && day1.questions.every(q => Array.isArray(q.answers) && q.answers.indexOf(q.correct) >= 0));

/* day 0 is the hand-authored opening set and must not be touched by any of this */
group('the hand-authored first quest is left alone');
fresh();
const d0 = EQD.questSet(0);
ok('day zero still has its five hand-authored challenges', d0.questions.length === 5);
ok('day zero keeps its own title',
  d0.title && d0.title.en === 'Open the Ancient Gate', JSON.stringify(d0.title));
ok('day zero is playable',
  d0.questions.every(q => Array.isArray(q.answers) && q.answers.indexOf(q.correct) >= 0));

group('a set is served even if tracking is somehow empty');
fresh();
EQ.s.track = null;
const rescue = EQD.questSet(3);
ok('a missing track store still yields five questions',
  rescue && rescue.questions.length === 5);
ok('and they are all real questions',
  rescue.questions.every(q => Array.isArray(q.answers) && q.answers.indexOf(q.correct) >= 0));

/* ── 8 · what the grown-up is shown ── */
group('the grown-up can see what the app decided');
fresh();
TOPICS.forEach(t => history(1, t, 10, 10, 0));
for (let d = 1; d <= 6; d++) history(d, 'take', 12, 0, 10);
const sum = EQT.adaptSummary();
ok('the weak topic is reported weak', sum.weak.indexOf('take') >= 0, sum.weak.join(','));
ok('a mastered topic is reported solid', sum.solid.length > 0, sum.solid.join(','));
ok('the weak topic is not also called solid', sum.solid.indexOf('take') < 0);
ok('the summary carries the underlying scores', !!sum.mastery && sum.mastery.take.score != null);

/* ── 9 · moving to a new device ── */
group('adaptation survives a device transfer');
fresh();
/* a history where one topic is clearly the problem, as it would be on the old phone */
TOPICS.forEach(t => history(1, t, 10, 10, 0));
for (let d = 1; d <= 6; d++) history(d, 'take', 12, 0, 10);
const exported = EQX.clean(JSON.parse(JSON.stringify(EQ.s)));
fresh();
EQ.s = Object.assign({}, EQ_DEFAULTS, exported);
EQT.init(EQ.s);
ok('the per-topic history made the trip',
  EQ.s.track.days && Object.keys(EQ.s.track.days).length > 0);
ok('the new device scores the weak topic as weak',
  EQT.mastery().take.score != null && EQT.mastery().take.score < EQT.WEAK_AT,
  'got ' + EQT.mastery().take.score);
ok('the schedule store is rebuilt rather than missing', !!EQT.sched());
const moved = EQT.plan(5, 5);
ok('the new device still plans the weak topic in',
  moved.indexOf('take') >= 0, moved.join(','));
ok('and the plan is a full, playable day',
  moved.length === 5 && moved.every(t => !!EQT.TOPICS[t]), moved.join(','));

/* ── 10 · the grown-up's screen says so, in every language ── */
group('the adaptation is explained on the parent screen in all three languages');
fresh();
TOPICS.forEach(t => history(1, t, 10, 10, 0));
for (let d = 1; d <= 6; d++) history(d, 'take', 12, 0, 10);
EQT.replan(EQ.s.questDay);
const langs = ['az', 'en', 'ru'];
const rendered = {};
langs.forEach(l => {
  EQI.set(l);
  rendered[l] = sandbox.EQS.screens.parent_analytics
    ? sandbox.EQS.screens.parent_analytics(EQ.s) : '';
});
EQI.set('az');
ok('the progress screen renders in all three languages',
  langs.every(l => typeof rendered[l] === 'string' && rendered[l].length > 200),
  langs.map(l => l + ':' + (rendered[l] || '').length).join(' '));
ok('each language produces its own text',
  rendered.az !== rendered.en && rendered.en !== rendered.ru,
  'az==en:' + (rendered.az === rendered.en) + ' en==ru:' + (rendered.en === rendered.ru));
ok('the adaptation is actually explained to the grown-up',
  rendered.en.indexOf('HOW QUESTY ADAPTS') >= 0);
ok('and the explanation is translated, not left in English',
  rendered.az.indexOf('HOW QUESTY ADAPTS') < 0 && rendered.ru.indexOf('HOW QUESTY ADAPTS') < 0);
ok('the grown-up is told a cleared topic comes back',
  rendered.en.indexOf('3 days') >= 0, 'no spacing sentence');

console.log('\n' + (fail === 0 ? 'ALL ' + pass + ' CHECKS PASSED' : fail + ' OF ' + (pass + fail) + ' CHECKS FAILED'));
process.exit(fail === 0 ? 0 : 1);
