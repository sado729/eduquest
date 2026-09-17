/* EduQuest — regression test for parent-approved missions.
   Run it with:  node test/missions.js      (no dependencies, no build step)

   Why this file exists: screen 26 makes a grown-up a promise in three languages —
   "you approve, then it appears in the child's world" — and for a long time nothing
   behind that button was true. `EQ.addMission()` pushed `{t, day}` into
   `s.parentQuests`, the screen turned green, and the entry sat in localStorage where
   no child could ever reach it. The dashboard's whole point is the loop
   analytics → recommendation → approval → play, and the loop was open at the last
   step: the one step the parent can actually see.

   What closes it is a real mission: eight questions on the approved topic, built by
   the same `EQD._q*` generators the daily quest uses, played on the same challenge
   screen. Four things about that fail without ever looking broken:

     1. the *appearance*. If the card does not render on the child's quest list, the
        approval screen still says "added" and the parent still believes it arrived.
        Nothing anywhere reports the difference.
     2. the *separation*. A mission borrows the challenge, hint, tutor and success
        screens from the daily adventure. Let its context leak and a mission answer
        advances `challengesDone`, or worse, the boss opens early — the adventure
        quietly plays itself while the child practises.
     3. the *resumption*. Eight questions is more than one sitting for a six-year-old.
        The questions are seeded from topic + approval day so that leaving halfway and
        coming back continues the same mission. Reseed it and the child restarts, over
        and over, never reaching the end.
     4. the *report*. Once a mission is playable, the parent screen has to say what
        became of it. An approval that reports nothing back is the same open loop in
        a new place.

   The screens are design-project visuals and the loop beneath them is hand-written,
   so a re-sync can restore the recommendation screen and drop the playing. If this
   suite goes red after a re-sync, that is what happened — see `EQ.openMission` /
   `EQ.missionAdvance` in js/app.js, `EQD.missionSet` in js/data.js and
   `EQT.nextMission` in js/tracking.js. */

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
  'transfer.js', 'interact.js', 'screens-onboarding.js', 'screens-world.js', 'screens-play.js',
  'screens-collect.js', 'parent.js', 'app.js'];
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
vm.runInContext('this.EQ = EQ; this.EQD = EQD; this.EQS = EQS; this.EQT = EQT; this.EQX = EQX; this.EQ_DEFAULTS = EQ_DEFAULTS; this.TX = TX; this.EQI = EQI;', sandbox);
const { EQ, EQD, EQS, EQT, EQX, EQ_DEFAULTS, TX, EQI } = sandbox;

const realGo = EQ.go;
const LEN = EQD.MISSION_LEN;

const fresh = () => {
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.onboarded = true;
  EQ.s.settings.music = false;
  EQ.save = () => {};
  EQ.render = () => {};
  EQ.toast = m => EQ._toasts.push(m);
  EQ._toasts = [];
  EQ.current = 'quest';
  EQ.go = realGo;
  EQ.restGuard = () => false;
  EQ.checkNewDay = () => false;
  EQ.session.mission = null;
  EQ.session.ctx = 'daily';
  EQ.session.q = null;
  EQ.session.qIdx = -1;
  EQ.session.answering = false;
  EQ.session.recSkips = [];
  EQT.init(EQ.s);
  for (const k of ['attempt', 'done', 'hint', 'bossHit', 'bossWin', 'tick']) EQT[k] = () => {};
};

/* answer the question the child is looking at, correctly. The real `answer()` runs its
   reward on a setTimeout, which the sandbox fires immediately — so this is the whole
   round trip: tap → success screen. */
const answerRight = () => {
  const q = EQ.session.q;
  EQ.session.answering = false;
  EQ.answer(q.answers.indexOf(q.correct));
};
const answerWrong = () => {
  const q = EQ.session.q;
  EQ.session.answering = false;
  EQ.answer(q.answers.findIndex(a => a !== q.correct));
};

/* ── 1 · the mission set itself ── */
group('an approved topic becomes eight real questions');
fresh();
ok('the promised length is eight', LEN === 8, 'got ' + LEN);
ok('every topic on the approval screen can be built',
  Object.keys(EQT.MISSIONS).every(k => {
    const set = EQD.missionSet(k, '2026-09-17');
    return set && set.questions.length === LEN;
  }));
ok('an unknown topic builds nothing', EQD.missionSet('no-such-topic', '2026-09-17') === null);

const addSet = EQD.missionSet('add', '2026-09-17');
ok('every question is answerable',
  addSet.questions.every(q => Array.isArray(q.answers) && q.answers.indexOf(q.correct) >= 0));
ok('every question can be drawn',
  addSet.questions.every(q => typeof q.visual === 'function' && typeof q.visual() === 'string'));
ok('every question is trilingual',
  addSet.questions.every(q => q.title && q.title.az && q.title.en && q.title.ru));
ok('every question can be hinted',
  addSet.questions.every(q => q.hint && q.hint.heading));
/* the whole point of an approved mission is that it drills the approved topic */
ok('all eight questions are the topic that was approved',
  addSet.questions.every(q => EQT.topicKey(q) === 'add'),
  addSet.questions.map(q => EQT.topicKey(q)).join(','));
ok('a pattern mission is all patterns',
  EQD.missionSet('pattern', '2026-09-17').questions.every(q => EQT.topicKey(q) === 'pattern'));
ok('a doubles mission is all doubles',
  EQD.missionSet('double', '2026-09-17').questions.every(q => EQT.topicKey(q) === 'double'));

group('the same mission is the same eight questions every time');
ok('asking twice gives identical questions',
  JSON.stringify(EQD.missionSet('take', '2026-09-17').questions.map(q => q.correct))
  === JSON.stringify(EQD.missionSet('take', '2026-09-17').questions.map(q => q.correct)));
ok('a different approval day is different practice',
  JSON.stringify(EQD.missionSet('take', '2026-09-17').questions.map(q => q.correct))
  !== JSON.stringify(EQD.missionSet('take', '2026-09-18').questions.map(q => q.correct)));
ok('a different topic is a different mission',
  EQD.missionSet('add', '2026-09-17').questions[0].tag.en
  !== EQD.missionSet('groups', '2026-09-17').questions[0].tag.en);

/* ── 2 · approval puts it in the child's world ── */
group('approving on screen 26 reaches the child');
fresh();
EQ.addMission('add');
const entry = EQ.s.parentQuests[0];
ok('the approval is stored', !!entry && entry.t === 'add');
ok('it is stamped with today', entry.day === EQ.dayKey());
ok('it starts unplayed', entry.n === 0 && entry.done === false);
ok('approving the same topic twice in a day adds one mission', (() => {
  EQ.addMission('add');
  return EQ.s.parentQuests.length === 1;
})());
ok('the child has a mission waiting', EQT.nextMission(EQ.s) === entry);

group('the mission card is on the child\'s quest list');
const questHTML = EQS.screens.quest(EQ.s);
ok('the card renders', questHTML.indexOf(TX(EQT.MISSIONS.add.name)) >= 0);
ok('it says who it came from',
  questHTML.indexOf('VALİDEYNDƏN') >= 0 || questHTML.indexOf('GROWN-UP') >= 0 || questHTML.indexOf('ВЗРОСЛОГО') >= 0);
ok('tapping it opens the mission', questHTML.indexOf('EQ.startNextMission()') >= 0);
ok('a child with no mission sees no card', (() => {
  const clean = JSON.parse(JSON.stringify(EQ.s));
  clean.parentQuests = [];
  return EQS.screens.quest(clean).indexOf('EQ.startNextMission()') === -1;
})());

/* ── 3 · playing it ── */
group('the child can actually play the eight questions');
fresh();
EQ.addMission('groups');
EQ.startNextMission();
ok('the mission screen opens', EQ.current === 'mission');
ok('the session is pointed at it', EQ.session.ctx === 'mission' && EQ.session.mission.t === 'groups');
ok('the mission screen renders', typeof EQS.screens.mission(EQ.s) === 'string');
ok('it offers a start button', EQS.screens.mission(EQ.s).indexOf('EQ.startMissionQuestion()') >= 0);

EQ.startMissionQuestion();
ok('the first question opens', EQ.current === 'challenge');
ok('it is the mission\'s own first question',
  EQ.session.q === EQD.missionSet('groups', EQ.s.parentQuests[0].day).questions[0]);
ok('the challenge screen counts to eight, not five',
  EQS.screens.challenge(EQ.s).indexOf('/ ' + LEN) >= 0 || EQS.screens.challenge(EQ.s).indexOf('of ' + LEN) >= 0
  || EQS.screens.challenge(EQ.s).indexOf('из ' + LEN) >= 0);
ok('leaving mid-question goes back to the mission, not the adventure',
  EQS.screens.challenge(EQ.s).indexOf("EQ.go('mission')") >= 0);

answerRight();
ok('a right answer lands on success', EQ.current === 'success');
ok('the mission advanced', EQ.s.parentQuests[0].n === 1);
ok('the daily adventure did not', EQ.s.challengesDone === 0);
ok('the success screen offers the next question',
  EQS.screens.success(EQ.s).indexOf('EQ.continueAfterSuccess()') >= 0);

EQ.continueAfterSuccess();
ok('continuing goes to the next question', EQ.current === 'challenge');
ok('and it is a different question', EQ.session.qIdx === 1);

/* run out the rest */
let guard = 0;
while (EQ.s.parentQuests[0].n < LEN && guard++ < 40) {
  if (EQ.current === 'challenge') answerRight();
  else if (EQ.current === 'success') EQ.continueAfterSuccess();
  else break;
}
ok('all eight questions can be finished', EQ.s.parentQuests[0].n === LEN, 'stopped at ' + EQ.s.parentQuests[0].n);
ok('the mission is marked done', EQ.s.parentQuests[0].done === true);
ok('the adventure was never touched', EQ.s.challengesDone === 0 && EQ.s.bossBeaten === false);
ok('no boss was opened on the way', EQ.current !== 'boss' && EQ.current !== 'victory');

group('the finished mission closes on its own screen');
EQ.continueAfterSuccess();
ok('the last answer leads to the mission screen', EQ.current === 'mission');
const endHTML = EQS.screens.mission(EQ.s);
ok('it reads as complete',
  endHTML.indexOf('TAMAMLANDI') >= 0 || endHTML.indexOf('COMPLETE') >= 0 || endHTML.indexOf('ВЫПОЛНЕНА') >= 0);
ok('and leads back out', endHTML.indexOf('EQ.leaveMission()') >= 0);
ok('no mission is waiting any more', EQT.nextMission(EQ.s) === null);
ok('the card is gone from the quest list', EQS.screens.quest(EQ.s).indexOf('EQ.startNextMission()') === -1);
EQ.leaveMission();
ok('leaving returns to the quest list', EQ.current === 'quest');
ok('and drops the mission context', EQ.session.ctx === 'daily' && EQ.session.mission === null);

/* ── 4 · it must not bleed into the adventure ── */
group('a mission never plays the daily adventure for the child');
fresh();
EQ.addMission('take');
EQ.startNextMission();
EQ.startMissionQuestion();
const beforeXP = EQ.s.xp;
answerRight();
ok('a mission question pays less than a daily challenge', EQ.s.xp - beforeXP === 25, 'got ' + (EQ.s.xp - beforeXP));
ok('the daily 5/5 is untouched', EQ.s.challengesDone === 0);
ok('no chest was armed', EQ.s.chestReady === false);

group('putting a mission down leaves the adventure exactly as it was');
fresh();
EQ.s.challengesDone = 2;
EQ.addMission('double');
EQ.startNextMission();
EQ.startMissionQuestion();
answerRight();
EQ.go('quest');
ok('the context is the adventure again', EQ.session.ctx === 'daily');
ok('the mission question is not left loaded', EQ.session.q === null);
ok('the daily counter is where the child left it', EQ.s.challengesDone === 2);
EQ.go('challenge');
ok('the adventure serves its own question',
  EQ.session.q === EQ.qset().questions[2], 'got index ' + EQ.session.qIdx);
ok('and the mission kept its progress', EQ.s.parentQuests[0].n === 1);

group('a mission does not open the boss early');
fresh();
EQ.s.challengesDone = 5;      /* the adventure is at its boss */
EQ.addMission('add');
EQ.startNextMission();
EQ.startMissionQuestion();
ok('the mission still opens its own question, not the boss', EQ.current === 'challenge');
ok('and it is the mission\'s question', EQ.session.ctx === 'mission' && EQ.session.qIdx === 0);
answerRight();
ok('answering does not beat the boss', EQ.s.bossBeaten === false && EQ.s.bossHits === 0);

/* ── 5 · the child can stop and come back ── */
group('half a mission today is half a mission tomorrow');
fresh();
EQ.addMission('pattern');
const day = EQ.s.parentQuests[0].day;
EQ.startNextMission();
EQ.startMissionQuestion();
answerRight();
EQ.continueAfterSuccess();
answerRight();
ok('two questions are behind the child', EQ.s.parentQuests[0].n === 2);
const midQ = EQD.missionSet('pattern', day).questions[2];

/* the child closes the app: session gone, state saved */
const saved = JSON.parse(JSON.stringify(EQ.s));
fresh();
EQ.s = saved;
EQT.init(EQ.s);
ok('the progress survived the restart', EQ.s.parentQuests[0].n === 2);
ok('the mission is still waiting', EQT.nextMission(EQ.s).t === 'pattern');
ok('the card says how far in they are',
  EQS.screens.quest(EQ.s).indexOf('2') >= 0 && EQS.screens.quest(EQ.s).indexOf('EQ.startNextMission()') >= 0);
EQ.startNextMission();
EQ.startMissionQuestion();
ok('it resumes on question three, not question one', EQ.session.qIdx === 2);
ok('and it is the same question three as before', EQ.session.q.correct === midQ.correct);

group('several approved missions queue up oldest first');
fresh();
EQ.s.parentQuests = [
  { t: 'add', day: '2026-09-15', n: 0, done: false },
  { t: 'take', day: '2026-09-16', n: 0, done: false }
];
ok('two are open', EQT.openMissions(EQ.s).length === 2);
ok('the older one is offered first', EQT.nextMission(EQ.s).t === 'add');
ok('the card says how many are waiting', EQS.screens.quest(EQ.s).indexOf('· 2') >= 0);
EQ.s.parentQuests[0].done = true;
ok('finishing it promotes the next', EQT.nextMission(EQ.s).t === 'take');
ok('a done mission is no longer open', EQT.openMissions(EQ.s).length === 1);

/* ── 6 · the loop reports back to the grown-up ── */
group('the approval screen says what became of the mission');
fresh();
EQ.addMission('groups');
let p26 = EQS.screens.parent_quests(EQ.s);
ok('a sent mission is listed', p26.indexOf(TX(EQT.MISSIONS.groups.name)) >= 0);
ok('an untouched one says so',
  p26.indexOf('hələ başlanmayıb') >= 0 || p26.indexOf('not started yet') >= 0 || p26.indexOf('ещё не начато') >= 0);
EQ.s.parentQuests[0].n = 3;
p26 = EQS.screens.parent_quests(EQ.s);
ok('a mission in progress shows its count',
  p26.indexOf('3') >= 0 && (p26.indexOf('sual') >= 0 || p26.indexOf('questions') >= 0 || p26.indexOf('вопрос') >= 0));
EQ.s.parentQuests[0].n = LEN; EQ.s.parentQuests[0].done = true;
p26 = EQS.screens.parent_quests(EQ.s);
ok('a finished one is reported complete',
  p26.indexOf('tamamlandı') >= 0 || p26.indexOf('completed') >= 0 || p26.indexOf('выполнено') >= 0);
ok('a grown-up with nothing sent sees no list', (() => {
  const clean = JSON.parse(JSON.stringify(EQ.s));
  clean.parentQuests = [];
  const html = EQS.screens.parent_quests(clean);
  return html.indexOf('Göndərdiyiniz missiyalar') === -1 && html.indexOf('Missions you have sent') === -1;
})());

/* ── 7 · the mission survives a move to a new phone ── */
group('a transfer carries the mission and how far the child got');
fresh();
EQ.addMission('double');
EQ.s.parentQuests[0].n = 5;
EQ.s.parentQuests.push({ t: 'add', day: EQ.dayKey(), n: LEN, done: true });
const packed = EQX.pack(EQ.s, 30);
const landed = EQX.clean(EQX.unpack(packed));
ok('both missions arrive', landed.parentQuests.length === 2);
ok('the unfinished one keeps its progress',
  landed.parentQuests[0].t === 'double' && landed.parentQuests[0].n === 5 && landed.parentQuests[0].done === false);
ok('the finished one arrives finished',
  landed.parentQuests[1].t === 'add' && landed.parentQuests[1].done === true);
ok('the child resumes on the new phone, not from scratch', (() => {
  const s2 = Object.assign({}, EQ_DEFAULTS, landed);
  EQT.init(s2);
  return EQT.nextMission(s2).t === 'double' && EQT.nextMission(s2).n === 5;
})());

group('a save from before missions were playable still works');
fresh();
/* exactly what the old addMission wrote: no progress fields at all */
EQ.s.parentQuests = [{ t: 'add', day: EQ.dayKey() }, { t: 'bogus', day: EQ.dayKey() }];
EQT.init(EQ.s);
ok('the real one becomes a playable mission',
  EQ.s.parentQuests.length === 1 && EQ.s.parentQuests[0].t === 'add');
ok('it starts from the beginning', EQ.s.parentQuests[0].n === 0 && EQ.s.parentQuests[0].done === false);
ok('a topic that no longer exists is dropped',
  EQ.s.parentQuests.every(m => !!EQT.MISSIONS[m.t]));
ok('the child sees the card it was always promised',
  EQS.screens.quest(EQ.s).indexOf('EQ.startNextMission()') >= 0);
ok('nonsense progress is clamped', (() => {
  EQ.s.parentQuests = [{ t: 'add', day: EQ.dayKey(), n: 999 }, { t: 'take', day: EQ.dayKey(), n: -4 }];
  EQT.init(EQ.s);
  return EQ.s.parentQuests[0].n === LEN && EQ.s.parentQuests[1].n === 0;
})());

/* ── 8 · the rest screen still governs a mission ── */
group('the daily limit and bedtime still apply to missions');
const appSrc = fs.readFileSync(path.join(JS, 'app.js'), 'utf8');
ok('the mission screen is one the pause may take over',
  appSrc.match(/EQ_REST_NUDGE = \[[^\]]*'mission'/) !== null);
ok('a mission is not on the list of screens the pause skips',
  appSrc.match(/EQ_REST_FREE = \[[^\]]*'mission'/) === null);
ok('the pause takes over a mission in progress', (() => {
  fresh();
  EQ.addMission('add');
  EQ.restGuard = name => name === 'mission' || name === 'challenge';
  EQ.startNextMission();
  return EQ.current === 'restday';
})());

/* ── 9 · a wrong answer is still a hint, not a failure ── */
group('a mission answers wrong the same gentle way the adventure does');
fresh();
EQ.addMission('add');
EQ.startNextMission();
EQ.startMissionQuestion();
answerWrong();
ok('a wrong answer opens the hint', EQ.current === 'hint');
ok('the mission did not advance', EQ.s.parentQuests[0].n === 0);
ok('the hint sends the child back to the same question',
  EQS.screens.hint(EQ.s).indexOf("EQ.go('challenge')") >= 0);
EQ.go('challenge');
ok('the same question is waiting', EQ.session.qIdx === 0 && EQ.session.ctx === 'mission');
answerRight();
ok('and it can still be got right', EQ.s.parentQuests[0].n === 1);

group('the tutor\'s easier question works inside a mission too');
fresh();
EQ.addMission('add');
EQ.startNextMission();
EQ.startMissionQuestion();
ok('the mission question offers an easier one', !!EQ.session.q.easier);
EQ.easierOne();
ok('the easier one opens on the challenge screen', EQ.current === 'challenge');
ok('the mission context is kept', EQ.session.ctx === 'mission');
answerRight();
ok('clearing the easier one still counts for the mission', EQ.s.parentQuests[0].n === 1);

/* ── 10 · trilingual, like everything a child reads ── */
group('every new string a child or grown-up reads is trilingual');
const SRC = ['app.js', 'data.js', 'tracking.js', 'screens-world.js', 'screens-play.js', 'parent.js']
  .map(f => fs.readFileSync(path.join(JS, f), 'utf8')).join('\n');
ok('no mission string is hard-coded English only',
  /VALİDEYNDƏN XÜSUSİ MİSSİYA/.test(SRC) && /SPECIAL MISSION FROM A GROWN-UP/.test(SRC) && /ОСОБАЯ МИССИЯ ОТ ВЗРОСЛОГО/.test(SRC));
ok('the mission screen renders in all three languages', (() => {
  fresh();
  EQ.addMission('add');
  EQ.startNextMission();
  return ['az', 'en', 'ru'].every(l => {
    EQI.set(l);
    const h = EQS.screens.mission(EQ.s);
    return typeof h === 'string' && h.length > 400 && h.indexOf('undefined') === -1;
  });
})());
ok('the quest card renders in all three languages', (() => {
  const out = ['az', 'en', 'ru'].every(l => {
    EQI.set(l);
    const h = EQS.screens.quest(EQ.s);
    return h.indexOf('EQ.startNextMission()') >= 0 && h.indexOf('undefined') === -1;
  });
  EQI.set('az');
  return out;
})());
ok('the approval screen renders in all three languages', (() => {
  const out = ['az', 'en', 'ru'].every(l => {
    EQI.set(l);
    const h = EQS.screens.parent_quests(EQ.s);
    return typeof h === 'string' && h.indexOf('undefined') === -1;
  });
  EQI.set('az');
  return out;
})());

/* ── done ── */
console.log('\n' + (fail ? 'FAILED ' + fail + ' of ' + (pass + fail) : 'ALL ' + pass + ' CHECKS PASSED'));
process.exit(fail ? 1 : 0);
