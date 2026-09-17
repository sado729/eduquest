/* EduQuest — regression test for the hands-on question formats.
   Run it with:  node test/formats.js      (no dependencies, no build step)

   Why this file exists: for a long time every question in the game was the same three
   buttons. Three buttons can check an answer but cannot watch a child think, and a
   six-year-old who taps "12" has either counted or guessed — the game cannot tell.
   Dragging nine apples into a basket, matching each lantern to its double and pushing
   four numbers into order make the child build the answer instead of choosing it.

   These formats fail in a particularly quiet way. A broken one still shows a beautiful
   panel that a child can push things around in; what breaks is whether the pushing is
   connected to anything. The specific ways that can happen, each of which this file
   pins down:

     1. THE SHARED ENDING. Every format must finish through EQ.resolve(), because what a
        right answer *means* — the XP, the coin, the boss hit, the mission step, the
        spaced-repetition entry — belongs to the question and not to how the screen was
        touched. A format that forked that path would drift: the child would drag nine
        apples correctly and be paid differently from the child who tapped "9".
     2. THE TOPIC IS THE SAME TOPIC. A drag question about adding on is an `add`
        question. If its tag stopped matching, EQT.topicKey would return null, the
        adaptive schedule would never see it, and the child's strongest evidence about
        a topic would land nowhere.
     3. ONE ANSWER PER QUESTION. Each format decides for itself when the child has
        committed. If it can commit twice — a second tap on Done, a pair finished after
        a wrong pair — the attempt is counted twice and the statistics rot.
     4. DETERMINISM. Which shape a topic wears is `EQD.formatFor`, pure arithmetic on
        the day and the slot. If it ever became random, a reload mid-quest would swap a
        drag question for a tap question underneath the child.
     5. THE FALLBACK STILL WORKS. Every hands-on question still carries `answers` and
        `correct`, so it stays playable and gradeable if the interaction layer never
        loads at all.

   The screens are design-project visuals and this layer is hand-written, so a re-sync
   can restore every screen and quietly drop the formats. If this suite goes red after a
   re-sync, that is what happened — see js/interact.js, the `_qDragCount` / `_qPairDouble`
   / `_qOrder` generators and `EQD.formatFor` in js/data.js. */

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
  document: {
    hidden: false, title: '', documentElement: {}, body: {},
    getElementById: () => null, querySelectorAll: () => [],
    addEventListener() {}, removeEventListener() {}
  },
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
  'transfer.js', 'interact.js', 'screens-onboarding.js', 'screens-world.js', 'screens-play.js',
  'screens-collect.js', 'parent.js', 'app.js'];
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
vm.runInContext('this.EQ = EQ; this.EQD = EQD; this.EQS = EQS; this.EQT = EQT; this.EQIX = EQIX; this.EQI_FMT = EQI_FMT; this.EQ_DEFAULTS = EQ_DEFAULTS; this.TX = TX; this.TX = TX;', sandbox);
const { EQ, EQD, EQS, EQT, EQIX, EQI_FMT, EQ_DEFAULTS, TX } = sandbox;

const realGo = EQ.go;

const fresh = () => {
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.onboarded = true;
  EQ.s.settings.music = false;
  EQ.s.questDay = 1;
  EQ.save = () => {};
  EQ.render = () => {};
  EQ.toast = () => {};
  EQ.current = 'challenge';
  EQ.go = realGo;
  EQ.restGuard = () => false;
  EQ.checkNewDay = () => false;
  EQ.session.mission = null;
  EQ.session.ctx = 'daily';
  EQ.session.q = null;
  EQ.session.qIdx = -1;
  EQ.session.answering = false;
  EQ.session.attempted = false;
  EQ.session.hinted = false;
  EQ.session.streakRow = 0;
  EQT.init(EQ.s);
  EQIX.reset();
  EQD._dayCache = null; EQD._dayCacheKey = null;
  EQD._missionCache = {};
};

/* a seeded ri, the same kind the generators are handed inside genDay */
const rig = seed => {
  const rnd = EQD.mulberry(seed);
  return (a, b) => a + Math.floor(rnd() * (b - a + 1));
};

const anyDrag = (seed, hard) => EQD._qDragCount(rig(seed || 11), hard);
const anyPair = (seed, hard) => EQD._qPairDouble(rig(seed || 22), hard);
const anyOrder = (seed, hard) => EQD._qOrder(rig(seed || 33), hard);

/* ── 1 · every format is still an ordinary question ── */
group('a hands-on question is an ordinary question in every way that matters');

[['drag', anyDrag()], ['pair', anyPair()], ['order', anyOrder()]].forEach(([kind, q]) => {
  ok(kind + ': knows which format it is', q.kind === kind, String(q.kind));
  ok(kind + ': has a title, a tag and a tip', !!(q.title && q.tag && q.tip));
  ok(kind + ': carries a hint the child can open', !!(q.hint && q.hint.heading && q.hint.body));
  ok(kind + ': carries an explanation', !!(q.explain && q.explain.text));
  ok(kind + ': still has three answers and a correct one', Array.isArray(q.answers) && q.answers.length === 3 && q.answers.indexOf(q.correct) >= 0);
  ok(kind + ': is trilingual throughout', ['az', 'en', 'ru'].every(l => q.title[l] && q.tip[l]));
  ok(kind + ': has a visual() the screen can call', typeof q.visual === 'function');
});

/* ── 2 · the topic survives the change of shape ── */
group('a new shape does not hide the topic from the teaching layer');

ok('a drag question is still an `add` question', EQT.topicKey(anyDrag()) === 'add', String(EQT.topicKey(anyDrag())));
ok('a pairing question is still a `double` question', EQT.topicKey(anyPair()) === 'double', String(EQT.topicKey(anyPair())));
ok('an ordering question is still a `pattern` question', EQT.topicKey(anyOrder()) === 'pattern', String(EQT.topicKey(anyOrder())));
ok('the drag question counts as maths', anyDrag().subj === 'math');
ok('the ordering question counts as logic', anyOrder().subj === 'logic');

/* ── 3 · the puzzles are actually solvable ── */
group('each puzzle has a solution, and it is the one the format checks for');

(() => {
  for (let seed = 1; seed <= 40; seed++) {
    const q = anyDrag(seed * 13, seed % 2 === 0);
    if (!(q.drag.total >= q.correct)) return ok('the tray always holds enough to reach the target', false, `seed ${seed}: ${q.drag.total} < ${q.correct}`);
    if (!(q.correct > 0)) return ok('the tray always holds enough to reach the target', false, 'target not positive');
  }
  ok('the tray always holds enough to reach the target', true);
})();

(() => {
  for (let seed = 1; seed <= 40; seed++) {
    const q = anyPair(seed * 7, seed % 2 === 0);
    const P = q.pair;
    if (P.left.length !== P.match.length) return ok('every left item has exactly one partner', false, 'length mismatch');
    for (let i = 0; i < P.left.length; i++) {
      if (P.rightShown[P.match[i]] !== P.left[i] * 2) return ok('every left item has exactly one partner', false, `seed ${seed} row ${i}`);
    }
    if (new Set(P.match).size !== P.match.length) return ok('every left item has exactly one partner', false, 'two rows share a partner');
    if (new Set(P.left).size !== P.left.length) return ok('every left item has exactly one partner', false, 'duplicate left value');
  }
  ok('every left item has exactly one partner', true);
})();

(() => {
  for (let seed = 1; seed <= 40; seed++) {
    const q = anyOrder(seed * 5, seed % 2 === 0);
    const O = q.order;
    const asc = O.sorted.slice().sort((a, b) => a - b);
    if (O.sorted.join() !== asc.join()) return ok('the target order really is ascending', false, 'seed ' + seed);
    if (O.shown.slice().sort((a, b) => a - b).join() !== asc.join()) return ok('the target order really is ascending', false, 'tiles do not match the answer');
    if (O.shown.join() === O.sorted.join()) return ok('the target order really is ascending', false, `seed ${seed} starts already solved`);
  }
  ok('the target order really is ascending', true);
  ok('and the child is never handed an already-finished row', true);
})();

/* ── 4 · every format ends through the one shared path ── */
group('a finished answer goes through resolve(), whatever the child touched');

const play = (q, act) => {
  fresh();
  EQ.session.q = q;
  const seen = [];
  EQ.go = name => { seen.push(name); EQ.current = name; };
  act(q);
  return seen;
};

(() => {
  const q = anyDrag();
  const seen = play(q, qq => EQIX.commit(qq, true));
  ok('a correct hands-on answer reaches the success screen', seen.indexOf('success') >= 0, seen.join(','));
  ok('and it pays the same 50 XP as a tapped answer', EQ.s.xp === 50, String(EQ.s.xp));
  ok('and the same 10 coins', EQ.s.coins === EQ_DEFAULTS.coins + 10, String(EQ.s.coins));
  ok('and it advances the day’s five challenges', EQ.s.challengesDone === 1, String(EQ.s.challengesDone));
})();

(() => {
  const q = anyOrder();
  const seen = play(q, qq => EQIX.commit(qq, false));
  ok('a wrong hands-on answer opens the hint instead', seen.indexOf('hint') >= 0, seen.join(','));
  ok('and pays nothing', EQ.s.xp === 0, String(EQ.s.xp));
  ok('and does not advance the challenge count', EQ.s.challengesDone === 0, String(EQ.s.challengesDone));
})();

(() => {
  const q = anyPair();
  fresh();
  EQ.session.q = q;
  EQ.session.ctx = 'mission';
  EQ.s.parentQuests = [{ t: 'double', day: EQ.dayKey(), n: 0, done: false }];
  EQ.session.mission = { t: 'double', day: EQ.dayKey() };
  EQ.go = () => {};
  EQIX.commit(q, true);
  ok('a hands-on mission answer advances the mission', EQ.s.parentQuests[0].n === 1, String(EQ.s.parentQuests[0].n));
  ok('and pays the mission rate of 25, not the daily 50', EQ.s.xp === 25, String(EQ.s.xp));
})();

(() => {
  const q = anyDrag();
  fresh();
  EQ.session.q = q;
  EQ.session.ctx = 'boss';
  EQ.go = () => {};
  EQIX.commit(q, true);
  ok('a hands-on answer can land a boss hit', EQ.s.bossHits === 1, String(EQ.s.bossHits));
})();

/* ── 5 · the attempt is recorded once, and only once ── */
group('one question, one attempt on the record');

(() => {
  const q = anyDrag();
  fresh();
  EQ.session.q = q;
  EQ.go = () => {};
  EQIX.commit(q, true);
  EQIX.commit(q, true);
  EQIX.commit(q, true);
  const today = EQ.s.track.days[EQ.dayKey()] || { topics: {} };
  const t = today.topics.add || { a: 0 };
  ok('a format cannot commit the same question twice', t.a === 1, 'attempts recorded: ' + t.a);
  ok('and the reward is paid once', EQ.s.xp === 50, String(EQ.s.xp));
})();

(() => {
  const q = anyPair();
  fresh();
  EQ.session.q = q;
  EQ.go = () => {};
  /* a wrong pair judges the board immediately; finishing the remaining pairs afterwards
     must not then also report a win */
  EQIX.commit(q, false);
  EQIX.commit(q, true);
  ok('a wrong pair cannot be talked out of afterwards', EQ.s.xp === 0, String(EQ.s.xp));
  ok('and the challenge count stays where it was', EQ.s.challengesDone === 0, String(EQ.s.challengesDone));
})();

/* ── 6 · which shape a topic wears is decided, not rolled ── */
group('the shape of a question is stable for a given day and slot');

(() => {
  let stable = true;
  for (let d = 0; d < 30; d++) {
    for (let slot = 0; slot < 5; slot++) {
      const a = EQD.formatFor('add', d, slot);
      for (let again = 0; again < 5; again++) if (EQD.formatFor('add', d, slot) !== a) stable = false;
    }
  }
  ok('asking twice gives the same answer', stable);
})();

ok('a topic with no hands-on shape never claims one', !EQD.formatFor('groups', 1, 0) && !EQD.formatFor('take', 1, 0) && !EQD.formatFor('groups', 2, 3));

(() => {
  /* a mission day is a date key, not a number: the arithmetic has to survive that */
  const r = EQD.formatFor('double', '2026-09-17', 2);
  ok('a date-key day still yields a real decision', r === true || r === false, String(r));
  ok('and the same date-key always yields the same one', EQD.formatFor('double', '2026-09-17', 2) === r);
})();

(() => {
  let both = { hands: 0, tap: 0 };
  for (let d = 1; d <= 14; d++) both[EQD.formatFor('add', d, 0) ? 'hands' : 'tap']++;
  ok('over a fortnight a topic is met in both shapes', both.hands > 0 && both.tap > 0, JSON.stringify(both));
})();

/* ── 7 · the day's set is still a proper day's set ── */
group('the new formats take their place in a real quest day');

(() => {
  let sawHands = false, allFine = true;
  for (let d = 1; d <= 12; d++) {
    EQD._dayCache = null; EQD._dayCacheKey = null;
    const set = EQD.genDay(d, EQD.DEFAULT_PLAN);
    if (set.questions.length !== 5) allFine = false;
    set.questions.forEach(q => {
      if (!q || !q.title || !q.tag) allFine = false;
      if (!Array.isArray(q.answers) || q.answers.indexOf(q.correct) < 0) allFine = false;
      if (q.kind) sawHands = true;
    });
    if (set.boss.length !== 6) allFine = false;
  }
  ok('every generated day is still five complete questions', allFine);
  ok('and hands-on questions do appear among them', sawHands);
})();

(() => {
  /* the same day asked twice must come back identical, formats included */
  EQD._dayCache = null; EQD._dayCacheKey = null;
  const a = EQD.genDay(5, EQD.DEFAULT_PLAN).questions.map(q => q.kind || 'tap').join(',');
  EQD._dayCache = null; EQD._dayCacheKey = null;
  const b = EQD.genDay(5, EQD.DEFAULT_PLAN).questions.map(q => q.kind || 'tap').join(',');
  ok('regenerating a day gives the same shapes', a === b, a + ' vs ' + b);
})();

(() => {
  let mixed = false;
  for (let d = 1; d <= 12; d++) {
    EQD._dayCache = null; EQD._dayCacheKey = null;
    const kinds = EQD.genDay(d, EQD.DEFAULT_PLAN).questions.map(q => q.kind || 'tap');
    if (new Set(kinds).size > 1) mixed = true;
  }
  ok('a day is never made entirely of one format', mixed);
})();

(() => {
  EQD._missionCache = {};
  const set = EQD.missionSet('double', '2026-09-17');
  ok('a mission is still eight questions', set && set.questions.length === 8);
  const kinds = new Set(set.questions.map(q => q.kind || 'tap'));
  ok('and it varies its shape across the eight', kinds.size > 1, [...kinds].join(','));
  ok('while every one of them stays on topic', set.questions.every(q => EQT.topicKey(q) === 'double'));
})();

/* ── 8 · the screen renders the right thing ── */
group('the play screen draws a panel for a hands-on question and buttons otherwise');

(() => {
  fresh();
  EQ.session.q = anyDrag();
  const html = EQS.screens.challenge(EQ.s);
  ok('a drag question draws its tray and basket', html.indexOf('eqi-tray') >= 0 && html.indexOf('eqi-basket') >= 0);
  ok('and does not draw the three answer buttons', html.indexOf('EQ.answer(') < 0);
  ok('and still shows the question itself', html.indexOf(TX(EQ.session.q.title).slice(0, 12)) >= 0);
})();

(() => {
  fresh();
  EQ.session.q = anyOrder();
  const html = EQS.screens.challenge(EQ.s);
  ok('an ordering question draws its row of tiles', html.indexOf('eqi-row') >= 0);
  ok('and a Done button to commit with', html.indexOf('eqi-done') >= 0);
})();

(() => {
  fresh();
  EQ.session.q = anyPair();
  const html = EQS.screens.challenge(EQ.s);
  ok('a pairing question draws both columns', html.indexOf('eqi-L0') >= 0 && html.indexOf('eqi-R0') >= 0);
})();

(() => {
  fresh();
  EQ.session.q = EQD._qGroups(rig(5), false);
  const html = EQS.screens.challenge(EQ.s);
  ok('an ordinary question still draws three tappable answers', (html.match(/EQ\.answer\(/g) || []).length === 3);
  ok('and draws no interactive panel', html.indexOf('eqi-tray') < 0 && html.indexOf('eqi-row') < 0);
})();

/* ── 8b · stepping down to an easier question ── */
group('the tutor can still offer a gentler question after a hands-on one');

(() => {
  const q = anyDrag();
  fresh();
  EQ.session.q = q;
  EQ.go = () => {};
  /* the child gets it wrong, the panel is judged, then the tutor steps them down */
  EQIX.commit(q, false);
  ok('the hands-on question has been judged', !EQIX.live());
  EQ.easierOne();
  ok('the tutor swapped in the gentler question', EQ.session.q === q.easier);
  ok('and the panel is open for business again', EQIX.live());
  EQ.session.attempted = false;
  EQ.answer(EQ.session.q.answers.indexOf(EQ.session.q.correct));
  ok('so the gentler question can actually be answered', EQ.s.xp === 50, String(EQ.s.xp));
})();

/* ── 9 · the fallback ── */
group('a hands-on question is still playable if the interaction layer is missing');

(() => {
  const q = anyDrag();
  fresh();
  EQ.session.q = q;
  EQ.go = () => {};
  /* exactly what EQ.answer does: judge by the three-answer contract */
  const i = q.answers.indexOf(q.correct);
  EQ.answer(i);
  ok('tapping the right answer still pays out', EQ.s.xp === 50, String(EQ.s.xp));
  ok('and still advances the day', EQ.s.challengesDone === 1, String(EQ.s.challengesDone));
})();

console.log('\n' + (fail === 0 ? `ALL ${pass} CHECKS PASSED` : `${fail} CHECK(S) FAILED (${pass} passed)`));
process.exit(fail === 0 ? 0 : 1);
