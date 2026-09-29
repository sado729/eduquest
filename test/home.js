/* EduQuest — regression test for "My home" (screen 17) and the trophies it shares with
   the Awards screen.
   Run it with:  node test/home.js      (no dependencies, no build step)

   Why this file exists: the room came from the design project as a picture that looked
   like state and was not.

     · "Math Master trophy earned — tap to place it" was shown to every child, a brand
       new one included; it looked only at `s.trophyPlaced`. The trophy needs 100 math
       questions (the Awards screen says so).
     · "6 of 18 decorations placed" was typed in (`trophyPlaced ? 7 : 6`), over a room
       drawn by hand — a gold cup, a "Math Master" plaque, a "Reading Champion" sign.
     · "Decorate" only toasted that decorating "opens with the next chest". It never did.
     · the Awards screen said "N of 40" (no 40 exists; N was the bosses beaten), and its
       Bridge Keeper read `bossBeaten`, which the next stage resets — gone the next day.

   Now: 19 decorations (3 starters that say so, 16 earned — the six trophies, the three
   chapter finales, the first round in each region, three from chests), 12 places in the
   room, a card only for one really earned and never placed, and decorating by tap-one,
   tap-where (the put-in-order panel's rule) with a box where nothing is ever lost.

   What fails silently, and what this suite pins:

     1. the *screen*: no card for a child who has done nothing, and every number and every
        drawn decoration comes from the save — a typed-in one turns this red.
     2. the *rules*: each decoration at its own edge (99 → 100, 19 → 20, 4/5 → 5/5, a
        guardian is not a finale, the hat before the chest decorations), and the Awards
        screen and the shelf reading the same table.
     3. the *moves*: pick, put, swap, put away — and 600 random taps that never change
        what is owned or put one decoration in two places.
     4. the *migration*: a save from before the room keeps what it earned; the old
        `trophyPlaced` counts only for a Math Master really earned.
     5. the *carry*: a code (13th group) and a file carry the room, and a code or file
        written before it still reads — and derives the room as the loader does.

   See `EQD.DECOR` / `EQD.HOME_SPOTS` / `EQD.TROPHIES` in js/data.js, `EQ.loadDecor` /
   `EQ.putDecor` / `EQ.placeNew` / `EQ.TROPHY_RULES` / `EQ.DECOR_RULES` in js/app.js,
   `EQS.screens.home` / `EQS.screens.awards` in js/screens-collect.js, the chest in
   js/screens-play.js and the room group at the end of the code in js/transfer.js. */

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
const realSave = EQ.save;
const LANGS = ['az', 'en', 'ru'];
const BAD = /undefined|\[object Object\]|NaN/;
const D = id => EQD.DECOR_BY_ID[id];
const owned = id => EQ.hasDecor(id);
const STARTERS = EQD.DECOR.filter(d => d.start).map(d => d.id);
const EARNABLE = EQD.DECOR.filter(d => !d.start);

const fresh = level => {
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.onboarded = true;
  EQ.s.settings.music = false;
  /* a full album: the sticker reveal is album.js's business, not a beat in these flows */
  EQ.s.stickerIds = EQD.STICKERS.map(st => st.id); EQ.s.stickers = EQ.s.stickerIds.length;
  EQ.s.level = level || 1;
  EQ.save = () => {};
  EQ.render = () => {};
  EQ._toasts = [];
  EQ.toast = m => { EQ._toasts.push(m); SHOWN.push(m); };
  EQ.current = 'map';
  EQ.go = realGo;
  EQ.restGuard = () => false;
  EQ.checkNewDay = () => false;
  Object.assign(EQ.session, { mission: null, region: null, ctx: 'daily', q: null, qIdx: -1, qKey: null, answering: false, attempted: false, hinted: false, sparked: false, recSkips: [], unlockRegion: null, helmNews: [], helmCard: null, decor: null, decorPop: null, decorNews: [], chestNote: false, stickerNext: null });
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
/* n correct answers in region r, through the real screens (see test/helmets.js) */
const play = (r, n) => {
  if (EQ.session.region !== r) EQ.openRegion(r);
  for (let i = 0; i < n; i++) {
    EQ.go('challenge');
    answer(true);
    EQ.continueAfterSuccess();
    if (EQ.current === 'levelup') EQ.applyLevelUp();
  }
};
const home = () => EQS.screens.home(EQ.s);
const awards = () => EQS.screens.awards(EQ.s);
const text = html => html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
/* the decorations the room actually draws, place by place */
const drawn = html => {
  const out = {};
  (html.match(/id="spot-(\w+)"[^>]*data-decor="([^"]*)"/g) || []).forEach(m => {
    const [, sp, id] = /id="spot-(\w+)"[^>]*data-decor="([^"]*)"/.exec(m);
    if (id) out[sp] = id;
  });
  return out;
};
const same = (a, b) => JSON.stringify(Object.keys(a).sort().map(k => [k, a[k]])) === JSON.stringify(Object.keys(b).sort().map(k => [k, b[k]]));
const ticks = html => (html.match(/border-radius:15px;background:#3DBE6E/g) || []).length;
const read = f => fs.readFileSync(path.join(JS, f), 'utf8');
/* every toast and every screen this suite makes the game show, for the emoji check at the end */
const SHOWN = [];

/* ── 1 · what is no longer there ── */
group('nothing in the room is typed in');
(() => {
  const src = read('screens-collect.js');
  const homeSrc = src.slice(src.indexOf('EQS.screens.home = '), src.indexOf('EQS.meta.awards'));
  const awardsSrc = src.slice(src.indexOf('EQS.screens.awards = '), src.indexOf('EQS.goalCard = '));
  ok('no "N of 18" typed into the header', !/18 bəzəkdən|of 18 decorations|из 18/.test(homeSrc) && !/\?\s*7\s*:\s*6/.test(homeSrc));
  ok('no Math Master plaque, Reading Champion sign or gold cup drawn for everyone',
    ['RİYAZİYYAT<br>USTASI', 'OXU ÇEMPİONU', 'READING CHAMPION', "EQC.trophy('#FFC24B', 40)"].every(w => homeSrc.indexOf(w) < 0));
  ok('the card no longer hangs on the old flag', homeSrc.indexOf('trophyPlaced') < 0 && homeSrc.indexOf('placeTrophy') < 0);
  ok('"Decorate" decorates instead of promising the next chest',
    !/növbəti sandıqla açılır|opens with the next chest|откроется со следующим сундуком/.test(homeSrc) && homeSrc.indexOf('EQ.decorEdit()') >= 0);
  ok('nothing in js/ still calls placeTrophy', fs.readdirSync(JS).filter(f => f.endsWith('.js')).every(f => read(f).indexOf('placeTrophy') < 0));
  ok('no "of 40" on the Awards screen', !/40-dan|of 40|из 40/.test(awardsSrc));
  ok('the Awards screen reads the shared table, and not the stage-scoped bossBeaten',
    awardsSrc.indexOf('EQ.TROPHY_RULES') >= 0 && awardsSrc.indexOf('bossBeaten') < 0 && awardsSrc.indexOf('firstQuestDone') < 0);
  ok('a new state has no trophyPlaced flag any more', !('trophyPlaced' in EQ_DEFAULTS));
})();

/* ── 2 · the catalogue ── */
group('nineteen decorations, twelve places');
ok('3 starters and 16 to earn', EQD.DECOR.length === 19 && STARTERS.length === 3 && EARNABLE.length === 16, EQD.DECOR.length);
ok('every id is unique', new Set(EQD.DECOR.map(d => d.id)).size === EQD.DECOR.length);
ok('every earned one has exactly one source (trophy, finale, region or chest)',
  EARNABLE.every(d => [d.trophy, d.finale, d.region, d.chest].filter(Boolean).length === 1));
ok('each of the six trophies has one decoration, and each trophy decoration a trophy',
  EQD.TROPHIES.length === 6 && EQD.TROPHIES.every(t => EQD.DECOR.filter(d => d.trophy === t.id).length === 1)
  && EQD.DECOR.filter(d => d.trophy).every(d => EQD.TROPHY_BY_ID[d.trophy]));
ok('each finale names a real chapter, each region a real region',
  EQD.DECOR.filter(d => d.finale).map(d => d.finale).sort().join() === EQD.CHAPTERS.map(c => c.id).sort().join()
  && EQD.DECOR.filter(d => d.region).map(d => d.region).sort().join() === EQD.REGION_ORDER.slice().sort().join());
ok('every earned one but the chest ones has a rule; starters and chest ones have none',
  EQD.DECOR.every(d => !!EQ.DECOR_RULES[d.id] === !(d.start || d.chest)));
ok('the chest ones come in a fixed order', EQD.CHEST_DECOR.map(d => d.id).join() === 'rug,bunting,lamp');
ok('every name and every "how" in three languages',
  EQD.DECOR.every(d => ['name', 'how'].every(k => d[k] && LANGS.every(l => typeof d[k][l] === 'string' && d[k][l].length > 2))));
ok('every trophy says what earns it, in three languages',
  EQD.TROPHIES.every(t => ['title', 'how'].every(k => LANGS.every(l => typeof t[k][l] === 'string' && t[k][l].length > 3))));
ok('every decoration has a picture; wide pictures only for the rug and the ceiling',
  EQD.DECOR.every(d => typeof d.art === 'string' && d.art.length > 40 && (!d.wide || d.kind === 'rug' || d.kind === 'hang'))
  && EQD.DECOR.filter(d => d.kind === 'rug' || d.kind === 'hang').every(d => d.wide && d.wide.vb && d.wide.svg));
(() => {
  const kinds = ['shelf', 'wall', 'floor', 'rug', 'hang'];
  ok('every decoration has a kind with at least one place in the room',
    EQD.DECOR.every(d => kinds.indexOf(d.kind) >= 0 && EQD.HOME_SPOTS.some(sp => sp.kind === d.kind)));
  ok('twelve places, unique ids, every one a known kind', EQD.HOME_SPOTS.length === 12
    && new Set(EQD.HOME_SPOTS.map(sp => sp.id)).size === 12 && EQD.HOME_SPOTS.every(sp => kinds.indexOf(sp.kind) >= 0));
  ok('every place is on the phone, above the nav bar', EQD.HOME_SPOTS.every(sp => sp.x >= 0 && sp.y >= 106 && sp.x + sp.w <= 402 && sp.y + sp.h <= 776));
  const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const clash = [];
  EQD.HOME_SPOTS.forEach((a, i) => EQD.HOME_SPOTS.slice(i + 1).forEach(b => { if (hit(a, b)) clash.push(a.id + '/' + b.id); }));
  ok('no two places overlap, so every tap has one target', clash.length === 0, clash.join());
  ok('the starters stand in places of their kind', Object.keys(EQD.HOME_START).length === 3
    && Object.keys(EQD.HOME_START).every(k => EQD.SPOT_BY_ID[k] && D(EQD.HOME_START[k]).start && D(EQD.HOME_START[k]).kind === EQD.SPOT_BY_ID[k].kind));
})();

/* ── 3 · a new child ── */
group('a new child\'s room: no false card, and every number is the room\'s own');
fresh();
(() => {
  const h = home();
  ok('no trophy card for a child who has done nothing', h.indexOf('decor-card') < 0 && !/qazanıldı/.test(text(h)));
  ok('the three starters, in their places', same(EQ.s.decorAt, EQD.HOME_START) && EQ.s.decorIds.slice().sort().join() === STARTERS.slice().sort().join());
  ok('exactly those three are drawn — nothing else stands in the room', same(drawn(h), EQD.HOME_START), JSON.stringify(drawn(h)));
  ok('the header says 3 in the room, 0 of 16 earned', text(h).indexOf('Otaqda 3 bəzək · 0/16 qazanılıb') >= 0, text(h).slice(0, 200));
  ok('no badge on "Decorate"', !/<div style="position:absolute;right:-6px;top:-7px[^>]*>\d+</.test(h));
  ok('no badge on the map\'s home pin', EQS.screens.map(EQ.s).indexOf('home-badge') < 0);
  ok('an empty wall place shows a nail, not a picture', (h.match(/border-radius:5px;background:#D8BC92/g) || []).length === 1);
  const want = { en: '3 in the room · 0 of 16 earned', ru: 'В комнате: 3 · получено 0 из 16' };
  Object.keys(want).forEach(l => { EQI.set(l); ok(`…in ${l} too`, text(home()).indexOf(want[l]) >= 0); });
  EQI.set('az');
  store._m = {};
  EQ.load();
  ok('a child loaded from nothing at all gets the same room', same(EQ.s.decorAt, EQD.HOME_START) && EQ.s.decorNew.length === 0 && EQ.s.decorIds.length === 3);
  ok('…and the defaults were not shared into it (a move cannot change EQ_DEFAULTS)', (() => {
    EQ.s.decorAt.s2 = 'books'; EQ.s.decorIds.push('rug');
    const clean = EQ_DEFAULTS.decorAt.s2 === undefined && EQ_DEFAULTS.decorIds.indexOf('rug') < 0;
    return clean;
  })());
})();

/* ── 4 · every decoration comes from what its line says ── */
group('the six trophies, each at its own edge, through the real game');
fresh();
ok('before any answer: no First Quest trophy', !owned('t_first'));
EQ.go('challenge');
answer(false);
ok('a wrong answer is not it', !owned('t_first'));
EQ.go('challenge');
answer(true);
ok('the first question solved gives it', owned('t_first') && EQ.s.decorNew.indexOf('t_first') >= 0);
ok('…not shouted over the success beat', EQ.current === 'success' && !EQ._toasts.some(t => t.indexOf(TX(D('t_first').name)) >= 0));
EQ.go('map');
ok('…but told on the next calm screen', EQ._toasts.some(t => t.indexOf(TX(D('t_first').name)) >= 0), EQ._toasts.join(' | '));
ok('…once', (() => { const n = EQ._toasts.length; EQ.go('quest'); EQ.go('map'); return EQ._toasts.length === n; })());
ok('…and the map\'s home pin counts it', /id="home-badge"[^>]*>1</.test(EQS.screens.map(EQ.s)));

fresh();
EQ.s.challengesDone = 5; EQ.s.bossHits = 3;
EQ.go('boss');
ok('three hits of four: no Bridge Keeper', !owned('t_bridge'));
answer(true);
ok('the boss beaten: Bridge Keeper', EQ.s.bossBeaten && owned('t_bridge'));
EQ.openChest(); EQ.nextStage();
ok('the next stage resets bossBeaten — the trophy stays', !EQ.s.bossBeaten && owned('t_bridge') && EQ.trophyHas('bridge'));
ok('…and the Awards screen still ticks it (it used to vanish here)', text(awards()).indexOf('2/6 kubok qazanılıb') >= 0 && ticks(awards()) === 2);

fresh();
for (let i = 0; i < 5; i++) EQ.newDay(EQ.dayKey());
ok('six days played: no 7 Day Explorer', EQ.s.streak === 6 && !owned('t_week'));
EQ.newDay(EQ.dayKey());
ok('the seventh gives it', EQ.s.streak === 7 && owned('t_week'));
ok('the Awards card now shows a tick, not "7/7" and a bar that keeps going', ticks(awards()) === 1 && text(awards()).indexOf('7/7') < 0 && text(awards()).indexOf('1/6 kubok qazanılıb') >= 0);

fresh();
EQ.s.mathSolved = 99;
EQ.checkDecor();
ok('99 math questions: no Math Master', !owned('t_math'));
for (let i = 0; i < 5 && EQ.s.mathSolved < 100; i++) { EQ.go('challenge'); answer(true); }
ok('the hundredth gives it', EQ.s.mathSolved === 100 && owned('t_math'));

fresh();
EQ.s.trophiesEarned = 1;
EQ.s.regions = { valley: { day: EQ.dayKey(), round: 0, n: 0, plan: null, paid: false, total: 19 } };
EQ.checkDecor();
ok('19 reading questions: no Book Explorer', !owned('t_book'));
EQ.openRegion('valley');
EQ.go('challenge');
answer(true);
ok('the twentieth gives it', EQ.s.regions.valley.total === 20 && owned('t_book'));

fresh(14);
EQ.s.trophiesEarned = 1;
EQ.checkDecor();
ok('two worlds open: no World Explorer', EQ.regionsOpen().length === 2 && !owned('t_world'));
EQ.s.xp = EQD.XP_PER_LEVEL; EQ.s.pendingLevelUp = true; EQ.session.afterLevel = 'map'; EQ.current = 'levelup';
EQ.applyLevelUp();
ok('Level 15 opens the third and gives it', EQ.s.level === 15 && owned('t_world'));

group('the Awards screen and the shelf read one table');
[
  ['a new child', 1, {}],
  ['one answer', 1, { mathSolved: 1 }],
  ['a boss and a week', 4, { mathSolved: 30, trophiesEarned: 1, streak: 7 }],
  ['a week in bestStreak only', 2, { streak: 3, bestStreak: 8 }],
  ['a hundred and a valley', 9, { mathSolved: 100, trophiesEarned: 2, regions: { valley: { day: '2026-01-01', total: 25 } } }],
  ['everything', 20, { mathSolved: 100, trophiesEarned: 9, streak: 30, regions: { valley: { day: '2026-01-01', total: 40 } } }]
].forEach(([name, level, st]) => {
  fresh(level);
  Object.assign(EQ.s, st);
  EQ.s.regions = EQ.cleanRegions(EQ.s.regions);
  EQ.checkDecor();
  const n = EQD.TROPHIES.filter(t => EQ.trophyHas(t.id)).length;
  const shelf = EQD.DECOR.filter(d => d.trophy && owned(d.id)).length;
  const aw = awards();
  ok(`${name}: ${n} of 6 on the Awards screen, ${shelf} at home, ${ticks(aw)} ticks`, n === shelf && ticks(aw) === n && text(aw).indexOf(`${n}/6 kubok qazanılıb`) >= 0);
});

group('the chapter finales');
fresh(); EQ.s.questDay = 0; beatBoss();
ok('a chapter guardian is not its finale', EQ.s.bossBeaten && !owned('grove'));
fresh(); EQ.s.questDay = 2; beatBoss();
ok('the Whispering Grove finale: the grove painting, and only that', owned('grove') && !owned('aquarium') && !owned('mobile'));
fresh(); EQ.s.questDay = 5; beatBoss();
ok('the Singing River finale: the fish tank', owned('aquarium') && !owned('grove'));
fresh(); EQ.s.questDay = 8; beatBoss();
ok('the Rainbow Ridge finale: the star mobile', owned('mobile'));
fresh(); EQ.s.questDay = 11; beatBoss();
ok('chapter 4 is the forest again, so its finale is the grove', owned('grove') && !owned('aquarium'));
fresh(); EQ.s.questDay = 2; EQ.s.challengesDone = 5; EQ.s.bossHits = 5; EQ.go('boss');
ok('five hits of a finale\'s six give nothing', !owned('grove'));

group('the regions: the first full round, the helmet\'s moment');
[['valley', 'blocks'], ['island', 'microscope'], ['station', 'telescope'], ['castle', 'castle']].forEach(([r, id]) => {
  fresh(20);
  EQ.s.trophiesEarned = 1;
  play(r, 4);
  ok(`${r}: four answers are not a round`, !owned(id));
  play(r, 1);
  ok(`${r}: the fifth — ${id}`, owned(id) && EQ.s.decorNew.indexOf(id) >= 0);
});
fresh(20);
EQ.s.trophiesEarned = 1;
play('island', 3);
EQ.s.regions.island.day = '2000-01-01'; /* the calendar moves on: a new day, a new round */
play('island', 2);
ok('three answers one day and two the next are not a round', EQ.s.regions.island.total === 5 && !owned('microscope'));

group('the chest: the hat first, then its decorations — shown before it is opened');
fresh();
EQ.s.chestReady = true;
(() => {
  let ch = EQS.screens.chest(EQ.s);
  ok('the first chest shows the Wizard Hat and no decoration', ch.indexOf('chest-hat') >= 0 && ch.indexOf('chest-decor') < 0);
  EQ.openChest();
  ok('…gives the hat and no decoration', EQ.s.wizardHatOwned && !EQD.CHEST_DECOR.some(d => owned(d.id)));
  ok('…and its line names the hat', EQ._toasts.some(t => /Sehrbaz Papağı/.test(t)));
  EQD.CHEST_DECOR.forEach((d, i) => {
    EQ._toasts = [];
    EQ.s.chestReady = true; EQ.s.chestOpened = false;
    ch = EQS.screens.chest(EQ.s);
    ok(`chest ${i + 2} shows ${d.id} where the hat was`, ch.indexOf('chest-decor') >= 0 && ch.indexOf(TX(d.name)) >= 0 && ch.indexOf('chest-hat') < 0);
    EQ.openChest();
    ok(`…hands over exactly that`, owned(d.id) && EQ.s.decorNew.indexOf(d.id) >= 0
      && EQD.CHEST_DECOR.slice(i + 1).every(x => !owned(x.id)));
    ok(`…and its line says so, without the hat`, EQ._toasts.length === 1 && EQ._toasts[0].indexOf(TX(d.name)) >= 0 && !/Sehrbaz/.test(EQ._toasts[0]), EQ._toasts.join(' | '));
    ok(`…told once, not again by the map`, EQ.session.decorNews.length === 0);
  });
  EQ.s.chestReady = true; EQ.s.chestOpened = false;
  ch = EQS.screens.chest(EQ.s);
  ok('once all three are home, the chest has no middle place at all', ch.indexOf('chest-hat') < 0 && ch.indexOf('chest-decor') < 0);
  const n = EQ.s.decorIds.length;
  EQ.openChest();
  ok('…and gives no decoration', EQ.s.decorIds.length === n);
  LANGS.forEach(l => {
    EQI.set(l);
    fresh(); EQ.s.wizardHatOwned = true; EQ.s.chestReady = true;
    const h = EQS.screens.chest(EQ.s);
    ok(`the chest renders clean with a decoration inside (${l})`, !BAD.test(h) && h.indexOf(TX(D('rug').name)) >= 0);
  });
  EQI.set('az');
})();

/* ── 5 · the card ── */
group('the card: only one really earned and never placed, one at a time');
fresh();
EQ.s.mathSolved = 37;
EQ.checkDecor();
ok('37 of 100 math questions: no Math Master card', text(home()).indexOf(TX(D('t_math').name)) < 0);
ok('the card names what really was earned (the first question)', text(home()).indexOf('İlk Tapşırıq kuboku qazanıldı') >= 0 && home().indexOf("EQ.placeNew('t_first')") >= 0);
EQ.placeNew('t_first');
ok('a tap puts it on the first empty shelf', EQ.s.decorAt.s2 === 't_first' && EQ.s.decorNew.length === 0);
ok('…and the card is gone', home().indexOf('decor-card') < 0);
ok('…with a pop where it landed', EQ.session.decorPop === 's2' && /id="spot-s2" class="press pop"/.test(home()));
ok('…and the header counts it', text(home()).indexOf('Otaqda 4 bəzək · 1/16 qazanılıb') >= 0);

fresh();
EQ.s.trophiesEarned = 1; EQ.s.streak = 7; EQ.s.mathSolved = 3;
EQ.checkDecor();
(() => {
  ok('three earned at once: one card, trophies in Awards order, "2 more waiting"',
    text(home()).indexOf('İlk Tapşırıq kuboku qazanıldı') >= 0 && text(home()).indexOf('daha 2 gözləyir') >= 0);
  ok('"Decorate" and the map pin both count all three', />3</.test(home().slice(home().indexOf('EQ.decorEdit()'))) && /id="home-badge"[^>]*>3</.test(EQS.screens.map(EQ.s)));
  EQI.set('ru');
  ok('…in Russian with the right plural', text(home()).indexOf('ещё 2 ждут') >= 0);
  EQI.set('az');
  EQ.placeNew('t_first');
  ok('placed one: the next one\'s card, "1 more"', text(home()).indexOf('Körpü Keşikçisi kuboku qazanıldı') >= 0 && text(home()).indexOf('daha 1 gözləyir') >= 0);
  EQI.set('ru');
  ok('…"ещё 1 ждёт"', text(home()).indexOf('ещё 1 ждёт') >= 0);
  EQI.set('az');
  EQ.placeNew('t_bridge');
  ok('then the last one, with nothing more waiting', text(home()).indexOf('7 Günlük Kaşif kuboku qazanıldı') >= 0 && text(home()).indexOf('gözləyir') < 0);
  EQ.placeNew('t_week');
  ok('all three on the shelf and no card left', ['t_first', 't_bridge', 't_week'].every(id => /^s\d$/.test(EQ.decorSpotOf(id) || '')) && home().indexOf('decor-card') < 0);
})();

fresh();
EQ.awardDecor('blocks');
ok('a decoration that is not a trophy says "new decoration", not "trophy"', text(home()).indexOf('Yeni bəzək: Hərf kubikləri') >= 0 && text(home()).indexOf('Otağa qoymaq üçün toxun') >= 0);
EQ.placeNew('blocks');
ok('…and goes to the free floor corner', EQ.s.decorAt.f1 === 'blocks');

group('a full shelf: the card opens decorating with the trophy in hand');
fresh();
['t_first', 't_bridge', 't_week', 't_math', 't_book'].forEach(id => { EQ.awardDecor(id, true); EQ.placeNew(id); });
ok('the six shelf places are full', ['s1', 's2', 's3', 's4', 's5', 's6'].every(k => EQ.s.decorAt[k]));
EQ.awardDecor('t_world', true);
EQ._toasts = [];
EQ.placeNew('t_world');
ok('the tap opens decorating with the globe in hand', EQ.session.decor && EQ.session.decor.pick.id === 't_world' && EQ.session.decor.pick.from === null);
ok('…and says the shelves are full', EQ._toasts.join().indexOf(TX(EQ.DECOR_FULL.shelf)) >= 0);
(() => {
  const h = home();
  const green = EQD.HOME_SPOTS.filter(sp => new RegExp(`id="target-${sp.id}"[^>]*2\\.5px dashed #2A9455`).test(h)).map(sp => sp.id);
  ok('…the shelves glow and nothing else does', green.join() === 's1,s2,s3,s4,s5,s6', green.join());
})();
EQ.decorSpot('s1');
ok('tapping a shelf puts it there', EQ.s.decorAt.s1 === 't_world');
ok('…and what stood there goes to the box, still owned', owned('books') && !EQ.decorSpotOf('books'));
ok('…without a card for it (it was placed before)', EQ.decorWaiting().length === 0 && (EQ.session.decor = null, home().indexOf('decor-card') < 0));
EQ.decorEdit(); EQ.decorPick('t_math'); EQ.decorBox(); EQ.decorDone();
ok('a trophy the child put away waits in the box, and no card calls it back', !EQ.decorSpotOf('t_math') && owned('t_math') && home().indexOf('decor-card') < 0);

/* ── 6 · decorating ── */
group('decorating: tap one, then tap where it goes');
fresh();
['t_first', 'blocks', 'rug'].forEach(id => EQ.awardDecor(id, true));
EQ.decorEdit();
(() => {
  let h = home();
  ok('"Decorate" opens the box in place of the nav bar', h.indexOf('decor-box') >= 0 && h.indexOf("EQ.nav('world')") < 0);
  ok('…with "Done" where "Decorate" was', h.indexOf('EQ.decorDone()') >= 0 && h.indexOf('EQ.decorEdit()') < 0);
  ok('the box holds what is owned and not in the room', ['t_first', 'blocks', 'rug'].every(id => h.indexOf(`id="tile-${id}"`) >= 0) && STARTERS.every(id => h.indexOf(`id="tile-${id}"`) < 0));
  ok('…the three new ones badged', (h.match(/>YENİ</g) || []).length === 3);
  ok('…and it counts them', text(h).indexOf('QUTUDA 3') >= 0 && text(h).indexOf('13 hələ qazanılmayıb') >= 0);
  ok('the ones still to earn are there as locked tiles', (h.match(/Hələ gizlidir/g) || []).length === 13);
  EQ._toasts = [];
  EQ.decorPick('lamp');
  ok('tapping a locked one says what it takes, and picks nothing', EQ.session.decor.pick === null && EQ._toasts[0] === 'Hələ bağlıdır — ' + TX(D('lamp').how));
  EQ.decorPick('rug');
  ok('tapping a tile picks it up', EQ.session.decor.pick.id === 'rug' && EQ.session.decor.pick.from === null);
  h = home();
  ok('…the header names it', text(h).indexOf('Rəngli xalça — hara qoyaq?') >= 0);
  ok('…and only the rug place glows', /id="target-r1"[^>]*2\.5px dashed #2A9455/.test(h) && !/id="target-s2"[^>]*2\.5px dashed #2A9455/.test(h));
  EQ._toasts = [];
  EQ.decorSpot('s2');
  ok('a place it does not fit refuses it and keeps it in hand', !EQ.s.decorAt.s2 && EQ.session.decor.pick.id === 'rug' && /sığmır/.test(EQ._toasts.join()));
  EQ.decorSpot('r1');
  ok('the rug place takes it', EQ.s.decorAt.r1 === 'rug' && EQ.session.decor.pick === null && EQ.s.decorNew.indexOf('rug') < 0);
  EQ.decorPick('t_first'); EQ.decorPick('t_first');
  ok('tapping the same tile again puts it down', EQ.session.decor.pick === null);
  EQ.decorPick('t_first'); EQ.decorSpot('s3');
  ok('a trophy onto a shelf', EQ.s.decorAt.s3 === 't_first');
  EQ.decorSpot('s1');
  ok('with nothing in hand, tapping a placed one picks it up from the room', EQ.session.decor.pick.id === 'books' && EQ.session.decor.pick.from === 's1');
  ok('…and the box offers to take it', home().indexOf('id="tile-box"') >= 0);
  EQ.decorSpot('s2');
  ok('onto an empty place: it moves', EQ.s.decorAt.s2 === 'books' && !EQ.s.decorAt.s1);
  EQ.decorSpot('s2'); EQ.decorSpot('s3');
  ok('onto another one\'s place: the two swap', EQ.s.decorAt.s3 === 'books' && EQ.s.decorAt.s2 === 't_first');
  EQ.decorSpot('s3'); EQ.decorBox();
  ok('the box tile puts it away — still owned', !EQ.decorSpotOf('books') && owned('books'));
  EQ.decorPick('books'); EQ.decorSpot('s1');
  ok('…and out of the box again', EQ.s.decorAt.s1 === 'books');
  EQ.decorPick('blocks'); EQ.decorSpot('s1');
  ok('holding the blocks, tapping the books picks the books instead', EQ.session.decor.pick.id === 'books');
  EQ.decorSpot('s1');
  ok('…and tapping them again lets go', EQ.session.decor.pick === null);
  EQ._toasts = [];
  EQ.decorSpot('s4');
  ok('an empty place with nothing in hand says what to do', EQ.session.decor.pick === null && /qutudan/.test(EQ._toasts.join()));
  EQ.decorDone();
  ok('"Done" puts the tools away and the nav bar back', !EQ.session.decor && home().indexOf("EQ.nav('world')") >= 0);
  EQ.current = 'home'; EQ.decorEdit(); EQ.go('map');
  ok('leaving the room does too', !EQ.session.decor);
  EQ.current = 'home';
  EQ._toasts = [];
  EQ.decorPeek('t_first');
  ok('outside decorating, a tap on one says what it is and what it took', EQ._toasts[0] === TX(D('t_first').name) + ' · ✓ ' + TX(EQD.TROPHY_BY_ID.first.how));
  EQ.decorPeek('books');
  ok('…a starter says it is a starter', /Başlanğıc/.test(EQ._toasts[1]));
  h = home();
  ok('…placed ones are tappable, empty places are not', h.indexOf("EQ.decorPeek('books')") >= 0 && !/id="spot-s4"[^>]*onclick/.test(h));
  ok('…and the hero and Questy are left alone outside decorating', h.indexOf("EQ.go('care')") >= 0 && !/pointer-events:none/.test(h.slice(h.indexOf("EQ.go('care')") - 400, h.indexOf("EQ.go('care')") + 200)));
  EQ.decorEdit();
  h = home();
  ok('while decorating, taps pass through the hero and Questy to the places', /onclick="EQ\.go\('care'\)" style="[^"]*pointer-events:none/.test(h));
  ok('…and every place is a target', EQD.HOME_SPOTS.every(sp => h.indexOf(`onclick="EQ.decorSpot('${sp.id}')"`) >= 0));
})();

group('nothing is ever lost');
fresh();
EQD.DECOR.forEach(d => EQ.awardDecor(d.id, true));
(() => {
  const all = EQ.s.decorIds.slice().sort().join();
  const rnd = EQD.mulberry(20260929);
  EQ.decorEdit();
  let bad = null;
  for (let i = 0; i < 600 && !bad; i++) {
    const r = rnd();
    if (r < 0.4) EQ.decorPick(EQD.DECOR[Math.floor(rnd() * EQD.DECOR.length)].id);
    else if (r < 0.9) EQ.decorSpot(EQD.HOME_SPOTS[Math.floor(rnd() * EQD.HOME_SPOTS.length)].id);
    else EQ.decorBox();
    const at = EQ.s.decorAt, vals = Object.keys(at).map(k => at[k]);
    if (EQ.s.decorIds.slice().sort().join() !== all) bad = 'the owned set changed at tap ' + i;
    else if (new Set(vals).size !== vals.length) bad = 'one decoration in two places at tap ' + i;
    else if (Object.keys(at).some(k => !EQD.SPOT_BY_ID[k] || D(at[k]).kind !== EQD.SPOT_BY_ID[k].kind)) bad = 'a place holding the wrong kind at tap ' + i;
  }
  ok('600 random taps: the owned set never changes, nothing stands in two places, every place holds its kind', !bad, bad);
  const inRoom = Object.keys(EQ.s.decorAt).length;
  ok('…and the box is exactly the rest', text(home()).indexOf(`QUTUDA ${EQD.DECOR.length - inRoom}`) >= 0);
  ok('no path in js/ ever takes a decoration away from decorIds',
    !/decorIds\s*=\s*[^;]*filter|decorIds\.(splice|pop|shift)|delete\s+[\w.]*decorIds/.test(read('app.js')));
})();
fresh();
EQ.save = realSave;
store._m = {};
EQ.awardDecor('rug', true);
EQ.decorEdit(); EQ.decorPick('rug'); EQ.decorSpot('r1');
EQ.decorPick('books'); EQ.decorSpot('s5');
EQ.load();
ok('every move is saved as it is made — a reload without "Done" keeps the room', EQ.s.decorAt.r1 === 'rug' && EQ.s.decorAt.s5 === 'books' && !EQ.s.decorAt.s1);
ok('…and a reload leaves decorating closed', EQ.session.decor === null);

/* ── 7 · the migration ── */
group('a save from before the room keeps what it earned');
const oldSave = fields => {
  const s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  delete s.decorIds; delete s.decorAt; delete s.decorNew;
  Object.assign(s, { onboarded: true }, fields);
  store._m = {};
  store.setItem(EQP.key(), JSON.stringify(s));
  EQ.load();
};
fresh();
oldSave({});
ok('a save with nothing earned: a new room, nothing waiting', same(EQ.s.decorAt, EQD.HOME_START) && EQ.s.decorNew.length === 0 && EQ.s.decorIds.length === 3);
oldSave({ trophyPlaced: true, mathSolved: 37 });
ok('the old card tapped at 37/100: no Math Master (the card was shown to everyone)', !owned('t_math') && text(home()).indexOf(TX(D('t_math').name)) < 0);
ok('…what it really earned waits on the card', EQ.s.decorNew.join() === 't_first');
ok('…and the old flag is gone from the save', !('trophyPlaced' in EQ.s));
oldSave({ trophyPlaced: true, mathSolved: 100 });
ok('the old card tapped at 100/100: Math Master is already on the shelf', /^s\d$/.test(EQ.decorSpotOf('t_math') || '') && EQ.s.decorNew.indexOf('t_math') < 0);
oldSave({ trophyPlaced: false, mathSolved: 100 });
ok('100/100 never tapped: Math Master waits on the card', !EQ.decorSpotOf('t_math') && EQ.s.decorNew.indexOf('t_math') >= 0);
oldSave({ level: 16, trophiesEarned: 1, regions: { station: { day: '2026-09-01', round: 0, n: 0, total: 6 } } });
ok('a region played to five answers before rounds were kept: its decoration, as the helmets do', owned('telescope') && !owned('microscope'));
oldSave({ decorIds: STARTERS, decorAt: EQD.HOME_START, decorNew: [], level: 16, trophiesEarned: 1, regions: { station: { day: '2026-09-01', round: 0, n: 0, total: 6 } } });
ok('…but once the room is real, only a full round gives it', !owned('telescope'));
oldSave({ wizardHatOwned: true, trophiesEarned: 10, questDay: 12 });
ok('chests opened before the room held no decoration, so none is credited', !EQD.CHEST_DECOR.some(d => owned(d.id)));
oldSave({ relics: { 1: 7, 2: 7, 3: 3 } });
ok('finales on record give their decorations', owned('grove') && owned('aquarium') && !owned('mobile'));
fresh();
EQ.save = realSave;
oldSave({ trophiesEarned: 1, mathSolved: 5 });
EQ.go('map');
ok('the child is told once what the room now holds', EQ._toasts.some(t => /Evində 2 yeni bəzək/.test(t)), EQ._toasts.join(' | '));
EQ.save();
EQ.load();
EQ._toasts = [];
EQ.go('map');
ok('…and not again after a reload', !EQ._toasts.some(t => /bəzək/.test(t)) && EQ.s.decorNew.length === 2);
oldSave({
  mathSolved: 100,
  decorIds: ['books', '<img src=x>', 't_math', 't_math', 'hasOwnProperty'],
  decorAt: { s1: 't_math', f1: 't_math', r1: 'books', zz: 'rug', s2: 'nope', hasOwnProperty: 's1' },
  decorNew: ['t_math', 'ghost', 'books']
});
ok('a damaged save keeps only what is real: known, owned, in a place of its kind, once',
  EQ.s.decorAt.s1 === 't_math' && Object.keys(EQ.s.decorAt).length === 1 && EQ.s.decorIds.every(id => D(id)) && EQ.s.decorIds.indexOf('portrait') >= 0,
  JSON.stringify([EQ.s.decorIds, EQ.s.decorAt, EQ.s.decorNew]));
ok('…and nothing waits that is placed, unknown or a starter', EQ.s.decorNew.length === 0 || EQ.s.decorNew.every(id => D(id) && !D(id).start && !EQ.decorSpotOf(id)));

/* ── 8 · the carry ── */
group('a transfer carries the room, and old codes and files still read');
(() => {
  fresh();
  ['t_first', 'rug', 'grove', 'blocks'].forEach(id => EQ.awardDecor(id, true));
  EQ.putDecor('t_first', 's2'); EQ.putDecor('rug', 'r1'); EQ.putDecor('grove', 'd2'); EQ.putDecor('books', 's6');
  const st = JSON.parse(JSON.stringify(EQ.s));
  Object.assign(st, { heroName: 'Aysel', relics: { 1: 1 } });
  st.track = { start: EQ.dayKey(), days: {} }; st.lastDay = EQ.dayKey();
  const packed = EQX.pack(EQX.clean(st), 0);
  const g = packed.split('_');
  ok('the room rides in a thirteenth group at the end', g.length === 13);
  ok('…and the relics keep the twelfth', g[11] === '1.1');
  ok('…in a few characters', g[12].length <= 24, g[12]);
  const back = EQX.clean(EQX.unpack(packed));
  ok('code round trip: what is owned', back.decorIds.slice().sort().join() === st.decorIds.slice().sort().join());
  ok('…what stands where', same(back.decorAt, st.decorAt), JSON.stringify(back.decorAt));
  ok('…and what still waits for its card', back.decorNew.join() === 'blocks');

  /* written by the build before this change: Math Master earned (100) and its old card tapped */
  const OLD_A = '1_Aysel_F2C49B.4A2E20.3DBE6E.2A9455.5B3FD6.0.0_FF9243.F0762A_0.6.0.3.3.0.0.0.0.2s.0.0.2.3.0.0.0_29_3d.19.xc.0.0_fzg.0.8..____1.3';
  /* …and the same card tapped at 37 of 100 */
  const OLD_B = '1_Aysel_F2C49B.4A2E20.3DBE6E.2A9455.5B3FD6.0.0_FF9243.F0762A_0.4.0.2.2.0.0.0.0.11.0.0.1.1.0.0.0_29_3d.19.xc.0.0_fzg.0.8..____1.1';
  ok('the fixtures are twelve-group codes', OLD_A.split('_').length === 12 && OLD_B.split('_').length === 12);
  const oa = EQX.clean(EQX.unpack(OLD_A));
  ok('an old code still imports', oa && oa.heroName === 'Aysel' && oa.mathSolved === 100 && oa.relics[1] === 3);
  ok('…with no room of its own, and the old flag kept for the loader', !('decorIds' in oa) && oa.trophyPlaced === true);
  fresh(); store._m = {}; store.setItem(EQP.key(), JSON.stringify(oa)); EQ.load();
  ok('…which puts the Math Master it really earned on the shelf', /^s\d$/.test(EQ.decorSpotOf('t_math') || '') && owned('t_bridge') && EQ.s.decorNew.indexOf('t_math') < 0);
  ok('…and exports again with a room', EQX.pack(EQX.clean(EQ.s), 0).split('_').length === 13);
  const ob = EQX.clean(EQX.unpack(OLD_B));
  fresh(); store._m = {}; store.setItem(EQP.key(), JSON.stringify(ob)); EQ.load();
  ok('the card tapped at 37/100 gives no Math Master on the new phone either', ob.mathSolved === 37 && !owned('t_math') && owned('t_first'));

  const junk = g.slice(); junk[12] = 'zzzzzz.zzzzzzzzzzzz.zzzzzz';
  const j = EQX.clean(EQX.unpack(junk.join('_')));
  ok('a mangled room group reads as known decorations in places of their kind', j.decorIds.every(id => D(id))
    && Object.keys(j.decorAt).every(k => EQD.SPOT_BY_ID[k] && D(j.decorAt[k]).kind === EQD.SPOT_BY_ID[k].kind));

  const b1 = s => EQX.readBundle(JSON.stringify({ app: 'eduquest', made: '2026-09-29', profiles: [{ state: s }] }));
  const f1 = b1(st);
  ok('a backup file carries the room', f1 && same(f1.states[0].decorAt, st.decorAt) && f1.states[0].decorNew.join() === 'blocks');
  const legacy = JSON.parse(JSON.stringify(st));
  delete legacy.decorIds; delete legacy.decorAt; delete legacy.decorNew;
  Object.assign(legacy, { trophyPlaced: true, mathSolved: 100 });
  const f2 = b1(legacy);
  ok('a file from before the room carries none, and keeps the old flag for the loader', f2 && !('decorIds' in f2.states[0]) && f2.states[0].trophyPlaced === true);
  fresh(); store._m = {}; store.setItem(EQP.key(), JSON.stringify(f2.states[0])); EQ.load();
  ok('…and loads into a room with its Math Master on the shelf', /^s\d$/.test(EQ.decorSpotOf('t_math') || ''));
  const f3 = b1(Object.assign({}, st, {
    decorIds: ['books', '<script>', 't_math', 'hasOwnProperty', '__proto__'],
    decorAt: { s1: 'rug', f1: 't_math', s2: 't_math', s3: 't_math', r1: '<b>', hasOwnProperty: 'x' },
    decorNew: ['t_math', 'x', 'portrait']
  }));
  const h3 = f3 && f3.states[0];
  ok('a hostile file cannot put markup, an unowned or a wrong-kind decoration in the room',
    h3 && JSON.stringify([h3.decorIds, h3.decorAt, h3.decorNew]).indexOf('<') < 0
    && same(h3.decorAt, { s2: 't_math' }) && STARTERS.every(id => h3.decorIds.indexOf(id) >= 0) && h3.decorNew.length === 0,
    h3 && JSON.stringify([h3.decorIds, h3.decorAt, h3.decorNew]));
  const f4 = b1(Object.assign({}, st, { decorIds: STARTERS, decorAt: 'nope', decorNew: 'x' }));
  ok('…nor crash the reader with the wrong shapes', f4 && f4.states[0].decorAt && Object.keys(f4.states[0].decorAt).length === 0 && f4.states[0].decorNew.length === 0);
})();

/* ── 9 · every screen, every language ── */
group('the room, the Awards, the chest and the map render clean in every language');
(() => {
  const setups = {
    'new child': () => fresh(),
    'new child, decorating': () => { fresh(); EQ.decorEdit(); },
    'three waiting': () => { fresh(); EQ.s.trophiesEarned = 1; EQ.s.streak = 7; EQ.s.mathSolved = 3; EQ.checkDecor(); },
    'everything, one in hand': () => {
      fresh(20); EQD.DECOR.forEach(d => EQ.awardDecor(d.id, true));
      Object.assign(EQ.s, { mathSolved: 100, trophiesEarned: 9, streak: 30, relics: { 1: 7, 2: 7, 3: 7 } });
      EQ.putDecor('mobile', 'h1'); EQ.putDecor('rug', 'r1'); EQ.putDecor('telescope', 'f1'); EQ.putDecor('grove', 'd2'); EQ.putDecor('t_math', 's2');
      EQ.decorEdit(); EQ.decorSpot('s2');
    },
    'everything placed': () => {
      fresh(20); EQD.DECOR.forEach(d => EQ.awardDecor(d.id, true));
      ['t_first', 't_bridge', 't_week', 't_math', 't_book'].forEach((id, i) => EQ.putDecor(id, 's' + (i + 2)));
      EQ.putDecor('bunting', 'h1'); EQ.putDecor('rug', 'r1'); EQ.putDecor('lamp', 'f1'); EQ.putDecor('aquarium', 'f2'); EQ.putDecor('grove', 'd2');
      EQ.s.decorNew = [];
    }
  };
  Object.keys(setups).forEach(name => {
    LANGS.forEach(l => {
      setups[name]();
      EQI.set(l);
      let h = '';
      try { h = [home(), awards(), EQS.screens.chest(EQ.s), EQS.screens.map(EQ.s)].join(''); } catch (e) { h = 'THREW ' + e.message; }
      SHOWN.push(h);
      ok(`${name} · ${l}: renders, no undefined / NaN`, !BAD.test(h) && h.indexOf('THREW') < 0, (h.match(BAD) || [h.slice(0, 80)])[0]);
      const d = drawn(home());
      ok(`${name} · ${l}: the room draws exactly what the save places`, same(d, EQ.s.decorAt), JSON.stringify(d));
    });
  });
  EQI.set('az');
  const news = ids => { fresh(); EQ.session.decorNews = ids.slice(); const t = EQ.newsLine(); SHOWN.push(t); return t; };
  LANGS.forEach(l => {
    EQI.set(l);
    ok(`the news line for one names it, for several counts them (${l})`,
      news(['telescope']).indexOf(TX(D('telescope').name)) >= 0 && /\b3\b/.test(news(['rug', 'lamp', 'grove'])) && !BAD.test(news(['rug', 'lamp'])));
    EQD.CHEST_DECOR.forEach(d => SHOWN.push(EQ.chestLine(true, d)));
    Object.keys(EQ.DECOR_FULL).forEach(k => SHOWN.push(TX(EQ.DECOR_FULL[k])));
    EQD.DECOR.forEach(d => SHOWN.push(TX(d.name), TX(d.how)));
  });
  EQI.set('az');
  /* the ranges and code points added in Unicode 12 and later (as test/regions.js) */
  const late = cp => (cp >= 0x1FA70 && cp <= 0x1FAFF) || (cp >= 0x1F7E0 && cp <= 0x1F7EB)
    || (cp >= 0x1F90D && cp <= 0x1F90F) || cp === 0x1F93F || cp === 0x1F971 || cp === 0x1F972 || cp === 0x1F97B
    || (cp >= 0x1F9A3 && cp <= 0x1F9AF) || (cp >= 0x1F9BA && cp <= 0x1F9BF) || (cp >= 0x1F9C3 && cp <= 0x1F9CF)
    || (cp >= 0x1F6D5 && cp <= 0x1F6D7) || (cp >= 0x1F6FA && cp <= 0x1F6FC) || (cp >= 0x1F6DD && cp <= 0x1F6DF);
  const found = [];
  for (const ch of SHOWN.join('')) { const cp = ch.codePointAt(0); if (late(cp) && found.indexOf(ch) < 0) found.push(ch + ' U+' + cp.toString(16).toUpperCase()); }
  ok(`every emoji the room shows is one an older phone can draw (Unicode 11) — ${SHOWN.length} screens and lines`, found.length === 0, found.join(', '));
})();

/* ── 10 · the cache ── */
group('installed phones fetch the new code');
(() => {
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  const m = /const CACHE = 'eduquest-v(\d+)'/.exec(sw);
  ok('sw.js cache bumped past v28', m && Number(m[1]) >= 29, m && m[0]);
})();

console.log('\n' + (fail ? `${fail} OF ${pass + fail} CHECKS FAILED` : `ALL ${pass} CHECKS PASSED`));
process.exit(fail ? 1 : 0);
