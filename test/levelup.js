/* EduQuest — regression test for the level-up screen.
   Run it with:  node test/levelup.js      (no dependencies, no build step)

   Why this file exists: the level-up screen came from the design project with three
   lines written in stone, and all three were false for most children:

     1. "NEW ITEM UNLOCKED · Explorer Hat · waiting in your wardrobe" — on every level.
        The Explorer Hat is the hat a child starts the game wearing, and a level hands
        over no item at all. A child opened the wardrobe to find nothing new.
     2. "1,500 / 1,500 XP" — the level size printed twice, whatever the child had.
     3. "N LEVELS AWAY · Science Island" — always the island, and "0 levels away" from
        Level 10 on, although Kosmik Stansiya (15) and Sirli Qala (20) were still shut.

   What really comes with a level is derived from the code, never written down twice:
   `EQ.levelGifts(level)` (a region whose opening condition becomes true, or a new rank
   name — no hat: the helmets are earned by a round inside their region; a level's
   sticker is shown by the reveal screen that follows, see test/album.js) and `EQ.nextRegion(level)` (the nearest region
   still shut and its real condition — the first boss for Söz Vadisi, a level for the
   rest). The level size is `EQD.XP_PER_LEVEL`, used everywhere 1500 used to be typed.

   A design re-sync would bring the three fixed cards back. If this suite goes red after
   one, that is what happened — see `EQS.screens.levelup` in js/screens-play.js and
   `levelGifts` / `nextRegion` / `regionOpenAt` in js/app.js. */

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
vm.runInContext('this.EQ = EQ; this.EQC = EQC; this.EQD = EQD; this.EQS = EQS; this.EQT = EQT; this.EQP = EQP; this.EQX = EQX; this.EQ_DEFAULTS = EQ_DEFAULTS; this.TX = TX; this.EQI = EQI; this.EQI_FMT = EQI_FMT; this.EQIX = EQIX;', sandbox);
const { EQ, EQC, EQD, EQS, EQT, EQ_DEFAULTS, TX, EQI } = sandbox;

const LANGS = ['az', 'en', 'ru'];
const BAD = /undefined|\[object Object\]|NaN/;
/* the design's invented reward, in every language it was written in */
const FAKE = /Kaşif Papağı|Explorer Hat|Шляпа Исследователя|YENİ ƏŞYA|NEW ITEM|НОВЫЙ ПРЕДМЕТ|Qarderobunda gözləyir|Waiting in your wardrobe|Ждёт в твоём гардеробе/;
const NEED = EQD.XP_PER_LEVEL;

/* a child one level-up away from `to`, with `trophies` bosses beaten and `xp` in hand */
const at = (to, trophies, xp) => {
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  Object.assign(EQ.s, { onboarded: true, heroName: 'Aysel', level: to - 1, trophiesEarned: trophies, xp: xp == null ? NEED : xp, pendingLevelUp: true, xpToday: 250, coinsToday: 30, streak: 4 });
  EQ.s.settings.music = false;
  EQ.save = () => {};
  EQ.render = () => {};
  EQ.toast = () => {};
  EQ.restGuard = () => false;
  EQ.checkNewDay = () => false;
  EQ.go = n => { EQ.current = n; };
  EQ.session.afterLevel = null;
  EQT.init(EQ.s);
  EQI.set('az');
};
const screen = l => { EQI.set(l); const h = EQS.screens.levelup(EQ.s); EQI.set('az'); return h; };
const T = o => LANGS.map(l => o[l]);
const has = (html, strs) => strs.every(x => html.indexOf(x) >= 0);
const R = EQD.REGIONS;

/* ── 1 · one number for the level size ── */
group('the level size is one constant');
ok('EQD.XP_PER_LEVEL is 1500', NEED === 1500);
(() => {
  const leaks = [];
  ['app.js', 'components.js', 'screens-play.js', 'screens-world.js', 'screens-collect.js', 'parent.js'].forEach(f => {
    const src = fs.readFileSync(path.join(JS, f), 'utf8');
    src.split('\n').forEach((line, i) => { if (/\b1500\b/.test(line)) leaks.push(`${f}:${i + 1}`); });
  });
  ok('no screen or game rule types 1500 itself', leaks.length === 0, leaks.join(', '));
})();
(() => {
  /* change the constant and every place must follow it — the proof that they read it */
  const keep = EQD.XP_PER_LEVEL;
  EQD.XP_PER_LEVEL = 1000;
  at(3, 1, 0);
  EQ.s.pendingLevelUp = false;
  EQ.grant(990, 0);
  ok('grant(): 990 of 1000 is not a level yet', EQ.s.pendingLevelUp === false);
  EQ.grant(40, 0);
  ok('grant(): 1030 of 1000 is', EQ.s.pendingLevelUp === true);
  EQ.applyLevelUp();
  ok('applyLevelUp(): the level size is taken off, the rest carries', EQ.s.level === 3 && EQ.s.xp === 30, `level ${EQ.s.level}, xp ${EQ.s.xp}`);
  ok('the HUD bar reads the constant', EQC.hud(EQ.s).indexOf('30 / 1,000 XP') >= 0);
  at(3, 1, 1030);
  ok('the level-up screen reads the constant', screen('en').indexOf('1,030 / 1,000 XP') >= 0);
  EQD.XP_PER_LEVEL = keep;
})();

/* ── 2 · what a level really gives ── */
group('what each level really hands over');
at(2, 1);
const G = l => EQ.levelGifts(l);
ok('Level 10 opens Elm Adası', G(10).regions.join() === 'island', G(10).regions.join());
ok('Level 15 opens Kosmik Stansiya', G(15).regions.join() === 'station', G(15).regions.join());
ok('Level 20 opens Sirli Qala', G(20).regions.join() === 'castle', G(20).regions.join());
ok('no other level from 2 to 40 opens a region',
  [...Array(39)].map((_, i) => i + 2).filter(l => [10, 15, 20].indexOf(l) < 0).every(l => G(l).regions.length === 0));
ok('Söz Vadisi is never opened by a level (its key is the first boss)',
  [...Array(40)].map((_, i) => i + 1).every(l => G(l).regions.indexOf('valley') < 0));
ok('the region levels come from EQD.REGIONS, not from the test',
  G(R.island.level).regions[0] === 'island' && G(R.station.level).regions[0] === 'station' && G(R.castle.level).regions[0] === 'castle');
ok('a new rank name is reported only when the name changes',
  [...Array(30)].map((_, i) => i + 2).every(l => G(l).rank === (TX(EQD.RANKS[l] || (l >= 13 ? EQD.RANK_LEGEND : EQD.RANK_DEFAULT)) !== EQ.rank(l - 1))));
ok('Level 6 and Level 11 repeat the rank before them — no new rank', !G(6).rank && !G(11).rank);
ok('Level 13 makes a Legend, and after that nothing new', G(13).rank && [...Array(20)].every((_, i) => !G(14 + i).rank));

/* ── 3 · the next region ── */
group('the next region is the nearest one still shut, with its real condition');
at(2, 0);
let n = EQ.nextRegion(2);
ok('before the first boss it is Söz Vadisi, waiting for the boss', n && n.r === 'valley' && n.boss === true);
at(2, 1);
n = EQ.nextRegion(2);
ok('after the first boss it is Elm Adası, 8 levels away', n && n.r === 'island' && !n.boss && n.levels === 8, JSON.stringify(n && { r: n.r, l: n.levels }));
n = EQ.nextRegion(10);
ok('at Level 10 it is Kosmik Stansiya, 5 levels away', n && n.r === 'station' && n.levels === 5);
n = EQ.nextRegion(15);
ok('at Level 15 it is Sirli Qala, 5 levels away', n && n.r === 'castle' && n.levels === 5);
ok('at Level 20 with the boss beaten, nothing is left', EQ.nextRegion(20) === null && EQ.nextRegion(25) === null);
at(20, 0);
n = EQ.nextRegion(20);
ok('at Level 20 without a boss, Söz Vadisi is still waiting — for the boss, not a level', n && n.r === 'valley' && n.boss && n.levels === 0);
ok('regionOpenAt() agrees with regionOpen() at the child\'s own level',
  [1, 9, 10, 14, 15, 19, 20, 25].every(l => { at(l + 1, 1); return EQD.REGION_ORDER.every(r => EQ.regionOpen(r) === EQ.regionOpenAt(r, l)); }));

/* ── 4 · the screen, level by level, in three languages ── */
const CASES = [
  { to: 2, tro: 0, gift: 'rank', next: 'valley', why: '1→2 before the first boss' },
  { to: 2, tro: 1, gift: 'rank', next: 'island', left: 8, why: '1→2 after the first boss' },
  { to: 10, tro: 1, gift: 'island', next: 'station', left: 5, why: '9→10' },
  { to: 15, tro: 1, gift: 'station', next: 'castle', left: 5, why: '14→15' },
  { to: 20, tro: 1, gift: 'castle', next: null, why: '19→20, every region open' },
  { to: 20, tro: 0, gift: 'castle', next: 'valley', why: '19→20, no boss yet' },
  { to: 25, tro: 1, gift: null, next: null, why: '24→25' },
  { to: 6, tro: 1, gift: null, next: 'island', left: 4, why: '5→6, same rank' }
];
const NEWREGION = { az: 'YENİ REGİON AÇILDI', en: 'NEW REGION OPEN', ru: 'НОВЫЙ РЕГИОН ОТКРЫТ' };
const NEWRANK = { az: 'YENİ RÜTBƏ', en: 'NEW RANK', ru: 'НОВОЕ ЗВАНИЕ' };
const AFTERBOSS = { az: 'İLK BOSSDAN SONRA', en: 'AFTER YOUR FIRST BOSS', ru: 'ПОСЛЕ ПЕРВОГО БОССА' };
const leftLine = (l, k) => ({ az: `${k} SƏVİYYƏ QALIB`, en: `${k} ${k === 1 ? 'LEVEL' : 'LEVELS'} AWAY`, ru: `ЧЕРЕЗ ${k} ${sandbox.UPC(sandbox.RUP(k, 'уровень', 'уровня', 'уровней'))}` })[l];
CASES.forEach(c => {
  group(`level-up screen · ${c.why}`);
  LANGS.forEach(l => {
    at(c.to, c.tro, NEED + 40);
    let html = '';
    try { html = screen(l); } catch (e) { ok(`${l}: renders`, false, e.message); return; }
    ok(`${l}: renders`, html.length > 1000);
    ok(`${l}: no undefined / NaN / [object Object]`, !BAD.test(html), (html.match(BAD) || [])[0]);
    ok(`${l}: no invented item`, !FAKE.test(html), (html.match(FAKE) || [])[0]);
    ok(`${l}: the XP line is the child's own XP (1,540 / 1,500, 40 carrying over)`, html.indexOf('1,540 / 1,500 XP') >= 0 && html.indexOf(' 40 XP') >= 0);
    ok(`${l}: the level badge and rank are the new level's`, html.indexOf(`>${c.to}</div>`) >= 0 && html.indexOf(EQ.rankOf(c.to)[l]) >= 0);
    if (c.gift === 'rank') ok(`${l}: the card names the new rank (and nothing else is promised)`, html.indexOf(NEWRANK[l]) >= 0 && html.indexOf(NEWREGION[l]) < 0);
    else if (c.gift) {
      const helm = EQD.helmOf(c.gift);
      ok(`${l}: the card says ${R[c.gift].name.en} opened`, html.indexOf(NEWREGION[l]) >= 0 && html.indexOf(R[c.gift].name[l]) >= 0 && html.indexOf(NEWRANK[l]) < 0);
      if (helm) ok(`${l}: …and points at the helmet earned there, without handing it over`, html.indexOf(helm.name[l]) >= 0 && !EQ.s[helm.flag]);
    } else ok(`${l}: nothing given, so no reward card`, html.indexOf(NEWREGION[l]) < 0 && html.indexOf(NEWRANK[l]) < 0);
    if (c.next === 'valley') ok(`${l}: the next region is Söz Vadisi, after the first boss`, has(html, [AFTERBOSS[l], R.valley.name[l]]) && !/SƏVİYYƏ QALIB|LEVELS? AWAY|ЧЕРЕЗ \d/.test(html));
    else if (c.next) ok(`${l}: the next region is ${R[c.next].name.en}, ${c.left} levels away`, has(html, [leftLine(l, c.left), R[c.next].name[l], R[c.next].short[l]]), leftLine(l, c.left));
    else ok(`${l}: every region open, so no next-region card`, !/SƏVİYYƏ QALIB|LEVELS? AWAY|ЧЕРЕЗ \d|İLK BOSSDAN|AFTER YOUR FIRST BOSS|ПОСЛЕ ПЕРВОГО/.test(html));
    ok(`${l}: never "0 levels away"`, !/>0 SƏVİYYƏ|>0 LEVELS|ЧЕРЕЗ 0/.test(html));
  });
});

group('the XP line with no XP to carry');
LANGS.forEach(l => {
  at(4, 1, NEED);
  const html = screen(l);
  ok(`${l}: exactly 1,500 / 1,500 XP, no "carries over" tail`, html.indexOf('1,500 / 1,500 XP</div>') >= 0);
});

group('English says "1 LEVEL AWAY", Russian declines the level');
at(10, 1);
EQ.s.level = 13;
ok('en: singular at one level', (EQI.set('en'), EQS.screens.levelup(EQ.s)).indexOf('1 LEVEL AWAY') >= 0);
ok('ru: "ЧЕРЕЗ 1 УРОВЕНЬ"', (EQI.set('ru'), EQS.screens.levelup(EQ.s)).indexOf('ЧЕРЕЗ 1 УРОВЕНЬ') >= 0);
EQI.set('az');

/* ── 5 · through the real flow ── */
group('the real flow: level 9 → 10 opens the island the card announced');
at(10, 1, NEED - 50);
EQ.s.pendingLevelUp = false;
EQ.grant(50, 5);
ok('50 more XP makes the level', EQ.s.pendingLevelUp === true);
const before = EQ.regionOpen('island');
const card = screen('az').indexOf(R.island.name.az) >= 0;
EQ.session.afterLevel = 'map';
EQ.applyLevelUp();
ok('the island was shut before, the card named it, and it is open after', !before && card && EQ.regionOpen('island') && EQ.s.level === 10);
ok('the wardrobe gained nothing from the level', EQ.ownedHats().join() === 'none,explorer', EQ.ownedHats().join());

/* ── 6 · the cache ── */
group('installed phones fetch the new code');
(() => {
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  const m = /eduquest-v(\d+)/.exec(sw);
  ok('sw.js cache bumped past v25', m && Number(m[1]) >= 26, m && m[0]);
})();

console.log('\n' + (fail ? `${fail} OF ${pass + fail} CHECKS FAILED` : `ALL ${pass} CHECKS PASSED`));
process.exit(fail ? 1 : 0);
