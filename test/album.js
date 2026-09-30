/* EduQuest — regression test for the sticker album.
   Run it with:  node test/album.js      (no dependencies, no build step)

   Why this file exists: the album is a *collection*, and a collection is the one kind
   of feature that fails without ever looking broken. The bag used to carry a counter —
   "STICKERS FOR YOUR ROOM · 3 OF 24" — over five fixed drawings, with nothing behind it:
   `s.stickers` was a number and nothing recorded which stickers a child had. A screen
   like that renders perfectly while being, to a seven-year-old, a lie.

   What is now underneath it is `s.stickerIds`, and four things about it fail silently:

     1. the *identity*. `s.stickers` must never be anything but `s.stickerIds.length`.
        Let them drift and the header counts one thing while the album shows another —
        both plausible, one wrong, and no error anywhere.
     2. the *migration*. Children are already playing with a count and no ids. Those
        saves have to become real stickers, or the album opens empty on a child who has
        been earning them for weeks — which reads exactly like their collection was
        taken away. The same cleaner runs on an imported transfer code.
     3. the *carry*. A transfer moves an adventure to a new phone. If the ids do not
        ride along, the album arrives empty while the counter arrives full.
     4. the *promise*. Every locked slot says how to earn it ("Reach level 5"). For a
        while every sticker really came from the chest in album order and nothing ever
        looked at those lines — a child reached Level 5 and no rocket came. Now each
        line is a rule (EQ.STICKER_RULES) and the four chest stickers say "Comes in a
        chest"; section 6 plays each promise through the real game and checks the
        sticker arrives — and that the chest shows exactly what it gives.

   The screens are design-project visuals and the store beneath them is hand-written, so
   a re-sync can restore the album and drop the awarding. If this suite goes red after a
   re-sync, that is what happened — see `EQ.awardSticker` / `EQ.cleanStickers` /
   `EQ.checkStickers` / `EQ.STICKER_RULES` in js/app.js and `EQD.STICKERS` /
   `EQD.nextChestSticker` in js/data.js. */

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

const FILES = ['i18n.js', 'components.js', 'data.js', 'regions.js', 'tracking.js', 'profiles.js', 'qr.js',
  'transfer.js', 'interact.js', 'screens-onboarding.js', 'screens-world.js', 'screens-play.js',
  'screens-collect.js', 'parent.js', 'sound.js', 'app.js'];
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
vm.runInContext('this.EQ = EQ; this.EQD = EQD; this.EQS = EQS; this.EQT = EQT; this.EQX = EQX; this.EQ_DEFAULTS = EQ_DEFAULTS; this.TX = TX; this.EQI = EQI; this.EQI_FMT = EQI_FMT; this.EQIX = EQIX; this.EQP = EQP;', sandbox);
const { EQ, EQD, EQS, EQT, EQX, EQ_DEFAULTS, TX, EQI, EQI_FMT } = sandbox;
/* the real recorders, kept aside: fresh() stubs them, live() puts them back — several
   sticker rules read what the tracker recorded (questions solved, solved after a hint) */
const realEQT = {};
for (const k of ['attempt', 'done', 'hint', 'bossHit', 'bossWin', 'tick']) realEQT[k] = EQT[k];

/* the real router, kept aside: two groups below stub EQ.go to record where a tap would
   have gone, and one group needs the router itself back */
const realGo = EQ.go;

const fresh = () => {
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.onboarded = true;
  EQ.s.settings.music = false;
  EQ.s.stickerIds = [];
  EQ.save = () => {};
  EQ.render = () => {};
  EQ.toast = m => EQ._toasts.push(m);
  EQ._toasts = [];
  EQ.current = 'map';
  EQ.go = realGo;                   /* undo any stub a previous group installed */
  EQ.restGuard = () => false;
  EQ.checkNewDay = () => false;
  for (const k of ['attempt', 'done', 'hint', 'bossHit', 'bossWin', 'tick']) EQT[k] = () => {};
  Object.assign(EQ.session, { mission: null, region: null, ctx: 'daily', q: null, qIdx: -1, qKey: null, answering: false, attempted: false, hinted: false, sparked: false, stepQ: null, stickerNext: null, chestNote: false, justAdded: null, helmNews: [], helmCard: null, afterLevel: null });
};
/* a new child playing the real game: the tracker records, nothing is stubbed but the screen */
const live = () => {
  fresh();
  Object.assign(EQT, realEQT);
  EQT.init(EQ.s);
};
/* every sticker, owned, by id — there is no "next in album order" to lean on any more */
const fill = () => EQD.STICKERS.forEach(st => EQ.awardSticker(st.id));
const giveN = n => EQD.STICKERS.slice(0, n).forEach(st => EQ.awardSticker(st.id));
/* answer whatever is on screen, the way the child would (see test/regions.js) */
const answer = right => {
  const q = EQ.session.q;
  EQ.session.answering = false;
  if (q.kind && EQI_FMT[q.kind]) { sandbox.EQIX.done = false; sandbox.EQIX.commit(q, right); return; }
  const x = EQD.qa(q);
  EQ.answer(right ? x.answers.indexOf(x.correct) : x.answers.findIndex(a => a !== x.correct));
};
const has = id => EQ.hasSticker(id);

/* ── 1 · the album itself ── */
group('the album is 24 stickers a child can actually look at');
fresh();
ok('there are exactly 24 stickers', EQD.STICKERS.length === 24, 'got ' + EQD.STICKERS.length);
ok('the bag counter and the album agree on the total',
  EQD.STICKERS.length === 24, 'the bag says "of 24"');
ok('every id is unique', new Set(EQD.STICKERS.map(s => s.id)).size === EQD.STICKERS.length);
ok('every sticker belongs to a real set',
  EQD.STICKERS.every(s => EQD.STICKER_SETS.some(g => g.id === s.set)));
ok('every set has at least one sticker',
  EQD.STICKER_SETS.every(g => EQD.STICKERS.some(s => s.set === g.id)));
ok('the set pages cover all 24 between them',
  EQD.STICKER_SETS.reduce((n, g) => n + EQD.STICKERS.filter(s => s.set === g.id).length, 0) === EQD.STICKERS.length);
ok('every sticker has a drawing', EQD.STICKERS.every(s => typeof s.art === 'string' && s.art.indexOf('<') === 0));
/* a locked slot that says nothing is the thing this whole feature replaces */
ok('every sticker says how to earn it',
  EQD.STICKERS.every(s => s.how && s.how.az && s.how.en && s.how.ru));
ok('every sticker has a trilingual name',
  EQD.STICKERS.every(s => s.name && s.name.az && s.name.en && s.name.ru));
ok('numbering runs 1..24 in album order',
  EQD.STICKERS.every((s, i) => s.no === i + 1));
ok('the id lookup finds every sticker',
  EQD.STICKERS.every(s => EQD.STICKER_BY_ID[s.id] === s));

/* ── 2 · earning them ── */
group('a sticker is handed over by name, never just a number');
fresh();
const first = EQ.awardSticker('leaf');
ok('a named sticker is given', first && first.id === 'leaf');
ok('it lands in the album', EQ.hasSticker('leaf'));
ok('the counter follows the album', EQ.s.stickers === EQ.s.stickerIds.length && EQ.s.stickers === 1);
ok('it waits for the reveal screen', EQ.s.stickerNew.join() === 'leaf');
ok('the same sticker is never given twice', EQ.awardSticker('leaf') === null);
ok('a duplicate does not move the counter or the reveal', EQ.s.stickers === 1 && EQ.s.stickerNew.length === 1);
ok('an unknown id gives nothing', EQ.awardSticker('no-such-sticker') === null);
/* the old bug lived in a no-argument call that meant "the next one in album order" */
ok('there is no "next in album order" any more', EQ.awardSticker() === null && EQD.nextSticker === undefined);

group('the album fills to 24 and then stops');
fresh();
fill();
ok('exactly 24 can be owned', EQ.s.stickerIds.length === 24, 'got ' + EQ.s.stickerIds.length);
ok('the counter tops out at 24', EQ.s.stickers === 24);
ok('nothing is missing from a full album', EQD.STICKERS.every(s => EQ.hasSticker(s.id)));
ok('a full album refuses every one again', EQD.STICKERS.every(s => EQ.awardSticker(s.id) === null));

group('openChest is what actually pays it out');
fresh();
EQ.s.chestReady = true;
EQ.go = name => { EQ._went = name; };
EQ.openChest();
ok('opening the first chest adds a sticker', EQ.s.stickers === 1, 'got ' + EQ.s.stickers);
ok('and it is the Happy Leaf — "Open your first chest"', EQ.s.stickerIds[0] === 'leaf');
ok('and coins and the hat still arrive', EQ.s.coins === 100 && EQ.s.wizardHatOwned);
ok('the child is shown which one they got', EQ._went === 'sticker' && EQ.s.stickerNew[0] === 'leaf');

/* ── 3 · the migration (children already playing) ── */
group('a save from before the album keeps its stickers');
fresh();
/* the shape a child on the previous version has on disk: a count, no ids */
ok('a count of 5 becomes the first 5 stickers',
  EQ.cleanStickers(null, 5).join() === EQD.STICKERS.slice(0, 5).map(s => s.id).join());
ok('a count of 0 is an empty album', EQ.cleanStickers(null, 0).length === 0);
ok('a count larger than the album is capped at 24', EQ.cleanStickers(null, 99).length === 24);
ok('a negative or broken count is an empty album',
  EQ.cleanStickers(null, -3).length === 0 && EQ.cleanStickers(null, 'x').length === 0);
ok('real ids are kept as they are',
  EQ.cleanStickers(['owl', 'rocket'], 0).join() === 'owl,rocket');
ok('unknown ids are dropped', EQ.cleanStickers(['owl', 'ghost'], 0).join() === 'owl');
ok('duplicates are collapsed', EQ.cleanStickers(['owl', 'owl'], 0).join() === 'owl');
/* ids win over the count: a child with ids is on the new version already */
ok('ids win over a stale count', EQ.cleanStickers(['questy'], 9).join() === 'questy');

group('loading a pre-album save migrates it');
fresh();
/* exactly what a child on the previous version has on disk: a count and no ids */
sandbox.localStorage.setItem(sandbox.EQP.key(), JSON.stringify(
  Object.assign({}, EQ_DEFAULTS, { onboarded: true, stickers: 3 })));
EQ.load();
ok('the three they earned are really in the album', EQ.s.stickerIds.length === 3, 'got ' + EQ.s.stickerIds.length);
ok('and the counter did not change under them', EQ.s.stickers === 3);
ok('a brand new child starts empty', (() => {
  sandbox.localStorage.removeItem(sandbox.EQP.key());
  EQ.load();
  return EQ.s.stickerIds.length === 0 && EQ.s.stickers === 0;
})());

/* ── 4 · the carry (moving to another phone) ── */
group('a transfer carries the album, not just the count');
fresh();
EQ.s.stickerIds = ['leaf', 'owl', 'rocket', 'questy'];
EQ.s.stickers = 4;
EQ.s.track = { start: EQ.dayKey(), days: {} };
const back = EQX.clean(EQX.unpack(EQX.pack(EQ.s, 0)));
ok('the same four stickers arrive', back.stickerIds.join() === 'leaf,owl,rocket,questy', back.stickerIds.join());
ok('the counter arrives with them', back.stickers === 4);
ok('a full album survives the trip', (() => {
  fresh();
  fill();
  EQ.s.track = { start: EQ.dayKey(), days: {} };
  const r = EQX.clean(EQX.unpack(EQX.pack(EQ.s, 0)));
  return r.stickerIds.length === 24 && r.stickers === 24;
})());
ok('an empty album survives the trip', (() => {
  fresh();
  EQ.s.track = { start: EQ.dayKey(), days: {} };
  const r = EQX.clean(EQX.unpack(EQX.pack(EQ.s, 0)));
  return r.stickerIds.length === 0 && r.stickers === 0;
})());
/* a code written by the previous version has no sticker field at all */
ok('a code from before the album migrates its count', (() => {
  fresh();
  EQ.s.stickerIds = ['leaf', 'acorn'];
  EQ.s.stickers = 2;
  EQ.s.track = { start: EQ.dayKey(), days: {} };
  const packed = EQX.pack(EQ.s, 0).split('_');
  packed[4] = packed[4].split('.').slice(0, 14).join('.');   /* drop the mask, as an old code would */
  const r = EQX.clean(EQX.unpack(packed.join('_')));
  return r.stickerIds.length === 2 && r.stickerIds.join() === 'leaf,acorn';
})());
ok('the mask keeps a QR code small', (() => {
  fresh();
  fill();
  EQ.s.track = { start: EQ.dayKey(), days: {} };
  const withAll = EQX.pack(EQ.s, 0).length;
  EQ.s.stickerIds = []; EQ.s.stickers = 0;
  const without = EQX.pack(EQ.s, 0).length;
  return withAll - without <= 6;   /* 24 stickers cost a handful of characters, not a list */
})(), 'a full album must not cost the QR more than a few characters');

/* ── 5 · the screens ── */
group('the album renders, in every language and at every stage of filling');
const states = [
  ['empty', () => { fresh(); }],
  ['one sticker', () => { fresh(); giveN(1); }],
  ['half full', () => { fresh(); giveN(12); }],
  ['full', () => { fresh(); fill(); }],
  ['three at once', () => { fresh(); ['acorn', 'dragon', 'key'].forEach(id => EQ.awardSticker(id)); }]
];
const BAD = ['undefined', '[object Object]', 'NaN'];
for (const [label, set] of states) {
  for (const lang of EQI.langs) {
    set();
    EQI.set(lang);
    let bad = '';
    for (const scr of ['album', 'sticker', 'bag', 'home']) {
      const html = EQS.screens[scr](EQ.s);
      for (const b of BAD) if (html.indexOf(b) >= 0) bad = scr + ' contains ' + b;
    }
    ok(label + ' / ' + lang + ': no broken value reaches the markup', !bad, bad);
  }
}
EQI.set('az');

group('every page of the album renders');
fresh();
giveN(9);
for (const g of EQD.STICKER_SETS) {
  EQ.session.albumSet = g.id;
  const html = EQS.screens.album(EQ.s);
  ok('page "' + g.id + '" renders its own stickers',
    html.indexOf(TX(g.name)) >= 0 && BAD.every(b => html.indexOf(b) < 0));
}
ok('an unknown page falls back to the first one instead of blanking', (() => {
  EQ.session.albumSet = 'nope';
  const html = EQS.screens.album(EQ.s);
  return html.indexOf(TX(EQD.STICKER_SETS[0].name)) >= 0;
})());

group('the album is reachable, and shows what is still hidden');
fresh();
EQ.awardSticker('leaf');
EQ.session.albumSet = 'forest';
const album = EQS.screens.album(EQ.s);
ok('an owned sticker is named on the page', album.indexOf(TX(EQD.STICKERS[0].name)) >= 0);
/* the point of the whole screen: a locked slot tells a child what to go and do */
ok('a locked slot shows what to do for it', album.indexOf(TX(EQD.STICKERS[1].how)) >= 0);
ok('the bag opens the album', EQS.screens.bag(EQ.s).indexOf('EQ.openAlbum(') >= 0);
ok('the room opens the album', EQS.screens.home(EQ.s).indexOf('EQ.openAlbum(') >= 0);
ok('the reveal screen offers the album', EQS.screens.sticker(EQ.s).indexOf('EQ.openAlbum(') >= 0);
ok('openAlbum goes to the album screen', (() => {
  EQ.go = n => { EQ._went = n; };
  EQ.openAlbum('sky');
  return EQ._went === 'album' && EQ.session.albumSet === 'sky';
})());
ok('the earned stickers hang in the room', (() => {
  fresh();
  EQ.awardSticker('leaf');
  const st = EQD.STICKERS[0];
  return EQS.screens.home(EQ.s).indexOf(st.art.slice(0, 40)) >= 0;
})());

/* ── 6 · every "how" is a promise the game keeps ── */
/* the child's path through the real game: a daily question, the boss, the next stage */
const solve = (miss) => {
  EQ.go('challenge');
  if (miss) { answer(false); EQ.go('challenge'); }
  answer(true);
};
const winBoss = (miss) => {
  let n = 0;
  while (!EQ.s.bossBeaten && n++ < 12) {
    EQ.go('boss');
    if (miss && n === 1) { answer(false); EQ.go('boss'); }
    answer(true);
  }
};
const playStage = (miss) => {
  for (let i = 0; i < 5; i++) solve(false);
  winBoss(miss);
  EQ.s.chestReady = false; EQ.s.chestOpened = true; /* the chest has its own group */
  EQ.nextStage();
};

group('every sticker is either earned by its own line or honestly a chest sticker');
ok('the chest stickers are exactly Leaf, Moon, Cloud and Comet, in album order',
  EQD.CHEST_STICKERS.map(s => s.id).join() === 'leaf,moon,cloud,comet', EQD.CHEST_STICKERS.map(s => s.id).join());
ok('every other sticker has a rule', EQD.STICKERS.every(s => s.chest || typeof EQ.STICKER_RULES[s.id] === 'function'));
ok('no chest sticker has a rule (one way in, never two)', EQD.CHEST_STICKERS.every(s => !EQ.STICKER_RULES[s.id]));
ok('no rule names a sticker that does not exist', Object.keys(EQ.STICKER_RULES).every(id => EQD.STICKER_BY_ID[id]));
ok('the chest stickers say "comes in a chest" in every language',
  ['moon', 'cloud', 'comet'].every(id => EQI.langs.every(l => EQD.STICKER_BY_ID[id].how[l] === { az: 'Sandıqda gəlir', en: 'Comes in a chest', ru: 'Приходит в сундуке' }[l])));
ok('…and the Leaf still says it is the first chest, which it is',
  /first chest/.test(EQD.STICKER_BY_ID.leaf.how.en));
ok('no earned sticker says "chest"', EQD.STICKERS.filter(s => !s.chest).every(s => !/chest/i.test(s.how.en)));
ok('a brand new child is given nothing for nothing', (() => { live(); return EQ.checkStickers() === 0 && EQ.s.stickerIds.length === 0; })());

group('Palıd Qozası, Nöqtəli Göbələk, Müdrik Bayquş — the first questions');
live();
solve(false);
ok('"Solve one challenge": the first right answer gives the Acorn', has('acorn'));
ok('…and nothing it did not earn', EQ.s.stickerIds.join() === 'acorn', EQ.s.stickerIds.join());
for (let i = 0; i < 3; i++) { EQ.continueAfterSuccess(); if (EQ.current === 'sticker') EQ.afterSticker(); solve(false); }
ok('four challenges are not "all 5 of a stage"', !has('mushroom'));
ok('four unaided answers are not five', !has('owl'));
EQ.continueAfterSuccess(); if (EQ.current === 'sticker') EQ.afterSticker();
solve(false);
ok('"Finish all 5 challenges of a stage": the fifth gives the Mushroom', has('mushroom'));
ok('"Solve 5 questions with no hint": the fifth gives the Owl', has('owl'));
live();
for (let i = 0; i < 5; i++) solve(true);
ok('five answers each after a miss do not give the Owl — every one had its hint open', !has('owl'));
ok('…but they are still five challenges', has('mushroom') && has('acorn'));

group('Sehrli Çubuq — hangs off the hint-spark rule (js/app.js EQ.earnSpark)');
live();
solve(false);
ok('a question solved unaided earns no spark and no Wand', EQ.s.hintSparks === 0 && !has('wand'));
EQ.continueAfterSuccess(); if (EQ.current === 'sticker') EQ.afterSticker();
solve(true);
ok('the first spark gives the Wand', EQ.s.hintSparks === 1 && has('wand'));
ok('a spark earned in a region round counts too — it is the same rule', (() => {
  live(); EQ.s.trophiesEarned = 1; EQ.openRegion('valley'); EQ.go('challenge');
  answer(false); EQ.go('challenge'); answer(true);
  return EQ.s.hintSparks === 1 && has('wand');
})());

group('Fikir İksiri — the gentler question from the tutor');
live();
for (let i = 0; i < 3; i++) { solve(false); EQ.continueAfterSuccess(); if (EQ.current === 'sticker') EQ.afterSticker(); }
ok('three ordinary right answers are not the Potion', !has('potion'));
EQ.go('challenge');
const hard = EQ.session.q;
ok('(the fourth day-0 question has a gentler one)', !!(hard && hard.easier));
answer(false);
EQ.easierOne();
ok('stepping down alone is not the Potion', !has('potion') && EQ.session.q === hard.easier);
answer(true);
ok('"Use an easier one to get unstuck": solving the gentler one gives the Potion', has('potion'));

group('Parlaq Ulduz, Göy Qurşağı, Böyük Ağac, Kiçik Raket — XP and levels');
live();
EQ.s.xp = 400;
solve(false);
ok('450 XP is not 500', EQ.s.xp === 450 && !has('star'));
EQ.continueAfterSuccess(); if (EQ.current === 'sticker') EQ.afterSticker();
solve(false);
ok('"Collect 500 XP": the answer that reaches it gives the Star', has('star'));
ok('XP carried across a level still counts (level 2, 0 XP is 1500 in all)', (() => {
  fresh(); EQ.s.level = 2; EQ.s.xp = 0; EQ.checkStickers(); return has('star');
})());
fresh();
const lvl = () => { EQ.s.xp = EQD.XP_PER_LEVEL; EQ.s.pendingLevelUp = true; EQ.session.afterLevel = 'map'; EQ.applyLevelUp(); };
ok('level 1 has no level stickers', !has('rainbow') && !has('tree') && !has('rocket'));
lvl();
ok('"Gain one level": Level 2 gives the Rainbow', EQ.s.level === 2 && has('rainbow') && !has('tree'));
lvl();
ok('"Reach level 3": Level 3 gives the Tree', EQ.s.level === 3 && has('tree') && !has('rocket'));
lvl();
ok('Level 4 is not Level 5', !has('rocket'));
lvl();
ok('"Reach level 5": Level 5 gives the Rocket', EQ.s.level === 5 && has('rocket'));

group('Tülkü Balası, Seriya Alovu — days played');
live();
ok('the first day is one day', !has('fox'));
EQ.newDay('2026-01-02');
ok('"Play on 2 days": the second day gives the Fox', EQ.s.streak === 2 && has('fox') && !has('flame'));
EQ.newDay('2026-01-05');
ok('"Play on 3 days": the third gives the Flame (days played — the game never resets its streak)', has('flame'));

group('Cəsarət Qalxanı, Dost Əjdaha, Qədim Açar, Qızıl Medal — the first boss');
live();
for (let i = 0; i < 5; i++) solve(false);
ok('five challenges are not a boss faced', !has('shield'));
EQ.go('boss');
answer(false);
ok('"Face one boss": answering the boss at all — even wrong — gives the Shield', has('shield') && !EQ.s.bossBeaten);
ok('…and the miss spoils the stage for the Medal', EQ.s.stageSlip === true);
ok('facing is not beating', !has('dragon') && !has('key'));
EQ.go('boss');
winBoss(false);
ok('"Befriend the Math Dragon": the day-0 guardian is the Math Dragon', EQ.s.bossBeaten && has('dragon'));
ok('"Open the Ancient Gate": beating the day-0 quest gives the Key', has('key'));
ok('one boss is not three', !has('sword'));
ok('a stage with a miss gives no Medal', !has('medal'));
ok('a guardian is not a chapter finale', !has('crystal'));
live();
playStage(false);
ok('"Finish a stage with no mistakes": a clean stage gives the Medal', has('medal'));
live();
for (let i = 0; i < 5; i++) solve(i === 2);
winBoss(false);
ok('a miss in the daily five spoils it too', !has('medal'));
ok('a miss in a region round is practice, not the stage', (() => {
  live(); EQ.s.trophiesEarned = 1; EQ.openRegion('valley'); EQ.go('challenge'); answer(false);
  EQ.leaveRegion();
  playStage(false);
  return has('medal');
})());
ok('a slip does not carry into the next stage', (() => {
  live(); playStage(true); const before = has('medal'); playStage(false); return !before && has('medal');
})());

group('Bilik Qılıncı, Bilik Kristalı, Yol Fənəri — three stages, a chapter');
live();
playStage(false);
playStage(false);
ok('two bosses are not three', !has('sword') && !has('crystal'));
ok('chapter 1 is not "a new chapter"', !has('lantern'));
for (let i = 0; i < 5; i++) solve(false);
winBoss(false);
ok('"Clear a chapter finale": stage 3 gives the Crystal', has('crystal'));
ok('"Defeat 3 bosses": the third gives the Sword', EQ.s.trophiesEarned === 3 && has('sword'));
EQ.s.chestReady = false; EQ.s.chestOpened = true;
EQ.nextStage();
ok('"Open a new chapter": chapter 2 opening gives the Lantern', EQ.chapter().chapterNo === 2 && has('lantern'));
ok('the Math Dragon is only the forest\'s guardian — another chapter\'s is not it', (() => {
  live(); EQ.s.questDay = 3; playStage(false);
  return EQ.s.trophiesEarned === 1 && !has('dragon');
})());
ok('a child who missed the day-0 gate still gets the Key from their first boss', (() => {
  live(); EQ.s.questDay = 3; playStage(false);
  return has('key');
})());
ok('so the album can still be finished: Questy is not locked out by a missed day 0', (() => {
  live(); EQ.s.questDay = 3; playStage(false);
  EQD.STICKERS.forEach(st => { if (st.id !== 'questy' && st.id !== 'key' && !has(st.id)) EQ.awardSticker(st.id); });
  EQ.checkStickers();
  return has('key') && has('questy');
})());

group('Söz Kitabı — a whole round in Word Valley');
live();
EQ.s.trophiesEarned = 1;
EQ.openRegion('valley');
for (let i = 0; i < 4; i++) { EQ.go('challenge'); answer(true); }
ok('four valley answers are not a round', !has('book'));
EQ.go('challenge'); answer(true);
ok('"Finish a round in Word Valley": the fifth gives the Book', has('book'));
ok('a round somewhere else is not Word Valley', (() => {
  live(); EQ.s.level = 10; EQ.s.trophiesEarned = 1; EQ.openRegion('island');
  for (let i = 0; i < 5; i++) { EQ.go('challenge'); answer(true); }
  return EQ.s.diverHelmOwned && !has('book');
})());

group('Questy! — the rest of the album');
fresh();
EQD.STICKERS.filter(s => s.id !== 'questy' && s.id !== 'medal').forEach(s => EQ.awardSticker(s.id));
EQ.checkStickers();
ok('22 of the other 23 is not the rest of the album', !has('questy'));
EQ.s.feats.flawless = true;
EQ.checkStickers();
ok('"Fill the rest of the album": the 23rd gives Questy!', has('questy') && EQ.s.stickers === 24);

group('no sticker is ever given twice');
live();
const seenIds = [];
for (let st = 0; st < 7; st++) {
  playStage(st === 1);
  EQ.newDay('2026-02-0' + (st + 1));
  seenIds.push(EQ.s.stickerIds.length);
}
ok('a week of play leaves no duplicate in the album', new Set(EQ.s.stickerIds).size === EQ.s.stickerIds.length, EQ.s.stickerIds.join());
ok('the counter is the album, all the way through', EQ.s.stickers === EQ.s.stickerIds.length);
ok('the reveal queue holds no duplicate either', new Set(EQ.s.stickerNew).size === EQ.s.stickerNew.length);
ok('checking again gives nothing new', EQ.checkStickers() === 0);
ok('the album only ever grew', seenIds.every((n, i) => i === 0 || n >= seenIds[i - 1]));

/* ── 7 · the chest ── */
group('the chest keeps its promise: you see the sticker before you open it');
fresh();
EQ.go = n => { EQ._went = n; };
const chestSays = [];
let promiseKept = true;
for (let c = 0; c < 4; c++) {
  EQ.s.chestReady = true; EQ.s.chestOpened = false; EQ.s.stickerNew = [];
  const shown = EQD.nextChestSticker(EQ.s.stickerIds);
  const html = EQS.screens.chest(EQ.s);
  if (html.indexOf(TX(shown.name)) < 0 || html.indexOf(shown.art.slice(0, 40)) < 0) promiseKept = false;
  EQ.openChest();
  if (EQ.s.stickerIds[EQ.s.stickerIds.length - 1] !== shown.id) promiseKept = false;
  chestSays.push(shown.id);
}
ok('four chests: each one names and draws the sticker it then gives', promiseKept);
ok('they are the chest stickers, in album order', chestSays.join() === 'leaf,moon,cloud,comet', chestSays.join());
ok('a chest never hands over a sticker that has its own "how"', EQ.s.stickerIds.every(id => EQD.STICKER_BY_ID[id].chest));
EQ.s.chestReady = true; EQ.s.chestOpened = false; EQ.s.stickerNew = [];
const emptyChest = EQS.screens.chest(EQ.s);
ok('the fifth chest shows no sticker slot — nothing is promised', emptyChest.indexOf('ALBOMUN ÜÇÜN') < 0 && BAD.every(b => emptyChest.indexOf(b) < 0));
EQ._toasts = [];
EQ.openChest();
ok('…and gives none, but still the coins and the hat', EQ.s.stickerIds.length === 4 && EQ.s.coins === 500 && EQ._went === 'map' && EQ._toasts.length === 1);
ok('a child who got the first three the old way is shown the Moon next — and gets it', (() => {
  fresh(); EQ.go = n => { EQ._went = n; };
  EQ.s.stickerIds = EQ.cleanStickers(null, 3); EQ.s.stickers = 3; EQ.s.chestReady = true;
  const html = EQS.screens.chest(EQ.s);
  EQ.openChest();
  return html.indexOf(TX(EQD.STICKER_BY_ID.moon.name)) >= 0 && EQ.s.stickerIds[3] === 'moon';
})());
ok('the chest sticker that finishes the album brings Questy! with it', (() => {
  fresh(); EQ.go = n => { EQ._went = n; };
  EQD.STICKERS.filter(s => s.id !== 'comet' && s.id !== 'questy').forEach(s => EQ.awardSticker(s.id));
  EQ.s.stickerNew = []; EQ.s.chestReady = true;
  EQ.openChest();
  return has('comet') && has('questy') && EQ.s.stickerNew.join() === 'comet,questy' && EQ._went === 'sticker';
})());
ok('the chest renders in every language, full or empty', (() => {
  let clean = true;
  for (const lang of EQI.langs) {
    EQI.set(lang);
    fresh(); clean = clean && BAD.every(b => EQS.screens.chest(EQ.s).indexOf(b) < 0);
    fill(); clean = clean && BAD.every(b => EQS.screens.chest(EQ.s).indexOf(b) < 0);
  }
  EQI.set('az');
  return clean;
})());

/* ── 8 · children already playing ── */
group('a child who already did it gets it on load — and loses nothing');
fresh();
const KEY = sandbox.EQP.key();
const day = k => ({ secs: 60, secsQ: 0, secsB: 0, a: 12, c: 10, done: 10, hg: 2, hints: 3, boss: 4, bossWin: 1, subj: {}, topics: {} });
sandbox.localStorage.setItem(KEY, JSON.stringify(Object.assign({}, EQ_DEFAULTS, {
  onboarded: true, stickers: 3, stickerIds: undefined, stickerNew: undefined, feats: undefined, stageSlip: undefined,
  level: 6, xp: 100, streak: 4, bestStreak: 4, hintSparks: 2, trophiesEarned: 3, relics: { 1: 7 }, questDay: 3,
  challengesDone: 2, regions: { valley: { day: '2026-01-01', round: 1, n: 0, total: 7 } },
  track: { start: '2026-01-01', days: { '2026-01-01': day() } }
})));
EQ.load();
const expectNew = ['fox', 'owl', 'tree', 'shield', 'dragon', 'crystal', 'sword', 'flame', 'star', 'rainbow', 'rocket', 'wand', 'key', 'book', 'lantern'];
ok('the three from the old chests are still there', ['leaf', 'acorn', 'mushroom'].every(has));
ok('everything the save shows they did is now in the album', expectNew.every(has), expectNew.filter(id => !has(id)).join());
ok('nothing the save cannot show is given (Medal, Potion)', !has('medal') && !has('potion'));
ok('no chest sticker is given without a chest', !has('moon') && !has('cloud') && !has('comet'));
ok('the counter is the album', EQ.s.stickers === EQ.s.stickerIds.length && EQ.s.stickers === 18, 'got ' + EQ.s.stickers);
ok('the new ones wait for the reveal; the old ones do not', expectNew.every(id => EQ.s.stickerNew.indexOf(id) >= 0) && EQ.s.stickerNew.indexOf('leaf') < 0);
ok('a stage already under way counts as slipped (no one knows)', EQ.s.stageSlip === true);
ok('loading again gives nothing twice', (() => {
  sandbox.localStorage.setItem(KEY, JSON.stringify(EQ.s));
  EQ.load();
  return EQ.s.stickers === 18 && new Set(EQ.s.stickerIds).size === 18 && EQ.s.stickerNew.length === expectNew.length;
})());
ok('a sticker the rules would not give today is never taken away', (() => {
  sandbox.localStorage.setItem(KEY, JSON.stringify(Object.assign({}, EQ_DEFAULTS, { onboarded: true, stickerIds: ['rocket', 'medal', 'comet'], stickers: 3 })));
  EQ.load();
  return ['rocket', 'medal', 'comet'].every(has) && EQ.s.level === 1;
})());
ok('a saved stage start is clean, a saved slip stays a slip', (() => {
  sandbox.localStorage.setItem(KEY, JSON.stringify(Object.assign({}, EQ_DEFAULTS, { onboarded: true })));
  EQ.load(); const a = EQ.s.stageSlip === false;
  sandbox.localStorage.setItem(KEY, JSON.stringify(Object.assign({}, EQ_DEFAULTS, { onboarded: true, challengesDone: 3, stageSlip: false })));
  EQ.load(); const b = EQ.s.stageSlip === false;
  sandbox.localStorage.setItem(KEY, JSON.stringify(Object.assign({}, EQ_DEFAULTS, { onboarded: true, stageSlip: true })));
  EQ.load(); return a && b && EQ.s.stageSlip === true;
})());
ok('a broken reveal queue is cleaned (unknown, unowned and repeated ids dropped)', (() => {
  sandbox.localStorage.setItem(KEY, JSON.stringify(Object.assign({}, EQ_DEFAULTS, { onboarded: true, stickerIds: ['leaf'], stickers: 1, stickerNew: ['leaf', 'leaf', 'ghost', 'owl'] })));
  EQ.load(); return EQ.s.stickerNew.join() === 'leaf';
})());
sandbox.localStorage.removeItem(KEY);

ok('after a transfer file the loader derives what it can (a Valley round from its count)', (() => {
  fresh();
  EQ.s.regions = { valley: { day: EQ.dayKey(), round: 0, n: 0, total: 6 } };
  EQ.s.track = { start: EQ.dayKey(), days: {} };
  EQ.s.feats = { faced: true }; /* on the old phone; a transfer file does not carry it */
  const r = EQX.clean(JSON.parse(JSON.stringify(EQ.s)));
  sandbox.localStorage.setItem(KEY, JSON.stringify(r));
  EQ.load();
  return r.feats === undefined && has('book');
})());
sandbox.localStorage.removeItem(KEY);

group('the ids and the transfer mask are unchanged');
ok('the album order is the one every saved mask was written in',
  EQD.STICKERS.map(s => s.id).join() === 'leaf,acorn,mushroom,fox,owl,tree,shield,dragon,crystal,sword,flame,medal,star,moon,rainbow,cloud,rocket,comet,wand,potion,key,book,lantern,questy');
ok('a mask packs and unpacks to the same ids', (() => {
  const ids = ['acorn', 'dragon', 'moon', 'questy'];
  return EQX.stickerIds(EQX.stickerMask(ids)).join() === ids.join();
})());

/* ── 9 · the reveal ── */
group('a sticker earned in play is revealed, then the child carries on');
live();
solve(false);
EQ.continueAfterSuccess();
ok('the step out of success opens the reveal screen', EQ.current === 'sticker');
let rev = EQS.screens.sticker(EQ.s);
ok('it shows the Acorn by name', rev.indexOf(TX(EQD.STICKER_BY_ID.acorn.name)) >= 0);
ok('…and says what earned it', rev.indexOf(TX(EQD.STICKER_BY_ID.acorn.how)) >= 0);
EQ._toasts = [];
EQ.afterSticker();
ok('"Back to the adventure" goes where the child was going — the next challenge', EQ.current === 'challenge');
ok('…with no chest toast, since there was no chest', EQ._toasts.length === 0);
ok('the reveal is done with', EQ.s.stickerNew.length === 0);
ok('no reveal when nothing is new', (() => { solve(false); EQ.continueAfterSuccess(); return EQ.current === 'challenge'; })());

group('the album badges every sticker not yet looked at');
live();
solve(false);
EQ.continueAfterSuccess();
EQ.openAlbum('forest');
ok('from the reveal screen the album opens with the event sticker badged', EQ.current === 'album' && (EQ.session.justAdded || []).indexOf('acorn') >= 0);
ok('the badge is on the page', EQS.screens.album(EQ.s).indexOf('YENİ') >= 0);
ok('…with the pop animation', /class="press pop"/.test(EQS.screens.album(EQ.s)));
EQ.go('bag');
ok('leaving the album clears the badge', EQ.session.justAdded === null);
ok('coming back is an ordinary visit', (() => { EQ.openAlbum(); return EQ.session.justAdded === null; })());
ok('opening the album from the bag also badges what the reveal has not shown yet', (() => {
  fresh(); ['shield', 'dragon', 'key'].forEach(id => EQ.awardSticker(id));
  EQ.openAlbum('brave');
  return (EQ.session.justAdded || []).join() === 'shield,dragon,key' && EQ.s.stickerNew.length === 0 && (EQS.screens.album(EQ.s).match(/YENİ/g) || []).length === 2;
})(), 'shield and dragon are on the brave page; key is on the magic page');

group('several at once are shown together, and the chest still says its line');
fresh();
['shield', 'dragon', 'key'].forEach(id => EQ.awardSticker(id));
rev = EQS.screens.sticker(EQ.s);
ok('the header counts them', rev.indexOf('ALBOMUNA 3 YENİ STİKER') >= 0);
ok('all three are drawn', ['shield', 'dragon', 'key'].every(id => rev.indexOf(EQD.STICKER_BY_ID[id].art.slice(0, 40)) >= 0));
ok('the reveal renders in every language', EQI.langs.every(l => { EQI.set(l); const h = EQS.screens.sticker(EQ.s); return BAD.every(b => h.indexOf(b) < 0); }));
EQI.set('az');
fresh();
EQ.s.chestReady = true;
EQ.openChest();
ok('the chest lands on the reveal screen', EQ.current === 'sticker' && EQ.s.stickerNew.join() === 'leaf');
ok('a chest sticker says it came out of the chest', /Sandıqdan çıxdı|İlk sandığını aç/.test(EQS.screens.sticker(EQ.s)));
EQ._toasts = [];
EQ.afterSticker();
ok('and after it, the map and the chest\'s coins-and-hat line', EQ.current === 'map' && /Sehrbaz/.test(EQ._toasts.join()));
fresh();
EQ.s.xp = EQD.XP_PER_LEVEL; EQ.s.pendingLevelUp = true; EQ.session.afterLevel = 'map';
EQ.current = 'levelup';
EQ.applyLevelUp();
ok('a level\'s sticker is revealed straight after the level-up screen', EQ.current === 'sticker' && EQ.s.stickerNew.indexOf('rainbow') >= 0);
EQ.afterSticker();
ok('…and then the level-up goes where it was going', EQ.current === 'map');

group('the rest screen still governs the album');
ok('the album is a screen the pause may take over',
  fs.readFileSync(path.join(JS, 'app.js'), 'utf8').match(/EQ_REST_NUDGE = \[[^\]]*'album'/) !== null);
ok('a sticker already earned is never interrupted',
  fs.readFileSync(path.join(JS, 'app.js'), 'utf8').match(/EQ_REST_FREE = \[[^\]]*'sticker'/) !== null);

/* ── done ── */
console.log('\n' + (fail ? 'FAILED ' + fail + ' of ' + (pass + fail) : 'ALL ' + pass + ' CHECKS PASSED'));
process.exit(fail ? 1 : 0);
