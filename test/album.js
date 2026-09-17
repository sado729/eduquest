/* EduQuest — regression test for the sticker album.
   Run it with:  node test/album.js      (no dependencies, no build step)

   Why this file exists: the album is a *collection*, and a collection is the one kind
   of feature that fails without ever looking broken. The bag used to carry a counter —
   "STICKERS FOR YOUR ROOM · 3 OF 24" — over five fixed drawings, with nothing behind it:
   `s.stickers` was a number and nothing recorded which stickers a child had. A screen
   like that renders perfectly while being, to a seven-year-old, a lie.

   What is now underneath it is `s.stickerIds`, and three things about it fail silently:

     1. the *identity*. `s.stickers` must never be anything but `s.stickerIds.length`.
        Let them drift and the header counts one thing while the album shows another —
        both plausible, one wrong, and no error anywhere.
     2. the *migration*. Children are already playing with a count and no ids. Those
        saves have to become real stickers, or the album opens empty on a child who has
        been earning them for weeks — which reads exactly like their collection was
        taken away. The same cleaner runs on an imported transfer code.
     3. the *carry*. A transfer moves an adventure to a new phone. If the ids do not
        ride along, the album arrives empty while the counter arrives full.

   The screens are design-project visuals and the store beneath them is hand-written, so
   a re-sync can restore the album and drop the awarding. If this suite goes red after a
   re-sync, that is what happened — see `EQ.awardSticker` / `EQ.cleanStickers` in
   js/app.js and `EQD.STICKERS` in js/data.js. */

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
const { EQ, EQD, EQS, EQT, EQX, EQ_DEFAULTS, TX, EQI } = sandbox;

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
};

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
group('a chest hands over a named sticker, never just a number');
fresh();
const first = EQ.awardSticker();
ok('the first chest gives sticker #1', first && first.id === EQD.STICKERS[0].id);
ok('it lands in the album', EQ.hasSticker(EQD.STICKERS[0].id));
ok('the counter follows the album', EQ.s.stickers === EQ.s.stickerIds.length && EQ.s.stickers === 1);
ok('the same sticker is never given twice', EQ.awardSticker(EQD.STICKERS[0].id) === null);
ok('a duplicate does not move the counter', EQ.s.stickers === 1);
ok('an unknown id gives nothing', EQ.awardSticker('no-such-sticker') === null);

group('the album fills to 24 and then stops');
fresh();
let given = 0;
while (EQ.awardSticker()) given++;
ok('exactly 24 can be earned', given === 24, 'got ' + given);
ok('a full album refuses a 25th', EQ.awardSticker() === null);
ok('the counter tops out at 24', EQ.s.stickers === 24);
ok('nothing is missing from a full album',
  EQD.STICKERS.every(s => EQ.hasSticker(s.id)));
ok('they arrive in album order',
  EQ.s.stickerIds.join() === EQD.STICKERS.map(s => s.id).join());

group('openChest is what actually pays it out');
fresh();
EQ.s.chestReady = true;
EQ.go = name => { EQ._went = name; };
EQ.openChest();
ok('opening a chest adds a sticker', EQ.s.stickers === 1, 'got ' + EQ.s.stickers);
ok('and coins and the hat still arrive', EQ.s.coins === 100 && EQ.s.wizardHatOwned);
ok('the child is shown which one they got', EQ._went === 'sticker' && EQ.session.newSticker === EQ.s.stickerIds[0]);

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
vm.runInContext('this.EQP = EQP;', sandbox);
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
  while (EQ.awardSticker());
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
  while (EQ.awardSticker());
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
  ['one sticker', () => { fresh(); EQ.awardSticker(); }],
  ['half full', () => { fresh(); for (let i = 0; i < 12; i++) EQ.awardSticker(); }],
  ['full', () => { fresh(); while (EQ.awardSticker()); }]
];
const BAD = ['undefined', '[object Object]', 'NaN'];
for (const [label, set] of states) {
  for (const lang of EQI.langs) {
    set();
    EQI.set(lang);
    EQ.session.newSticker = EQ.s.stickerIds[0] || EQD.STICKERS[0].id;
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
for (let i = 0; i < 9; i++) EQ.awardSticker();
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
EQ.awardSticker();
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
  EQ.awardSticker();
  const st = EQD.STICKERS[0];
  return EQS.screens.home(EQ.s).indexOf(st.art.slice(0, 40)) >= 0;
})());

group('the chest keeps its promise: you see the sticker before you open it');
fresh();
EQ.s.chestReady = true;
let chest = EQS.screens.chest(EQ.s);
ok('the chest names the sticker it is about to give', chest.indexOf(TX(EQD.STICKERS[0].name)) >= 0);
ok('and draws that sticker, not a generic one', chest.indexOf(EQD.STICKERS[0].art.slice(0, 40)) >= 0);
ok('the chest and the payout agree on which one', (() => {
  EQ.go = n => { EQ._went = n; };
  const named = EQD.nextSticker(EQ.s.stickerIds);
  EQ.openChest();
  return EQ.s.stickerIds[EQ.s.stickerIds.length - 1] === named.id;
})());
ok('a full album still renders the chest', (() => {
  fresh();
  while (EQ.awardSticker());
  const html = EQS.screens.chest(EQ.s);
  return BAD.every(b => html.indexOf(b) < 0);
})());

group('the sticker just earned is badged, once');
/* the real router this time — clearing the badge lives in EQ.go(), so a stubbed
   router would be testing nothing at all (fresh() leaves EQ.go alone; only render,
   save, toast and tracking are stubbed) */
fresh();
EQ.s.chestReady = true;
EQ.openChest();                       /* → the reveal screen, holding the new sticker */
const justGot = EQ.session.newSticker;
EQ.openAlbum('forest');               /* → the album, which should badge it */
ok('the chest lands on the reveal screen, then the album', EQ.current === 'album');
ok('the album knows which sticker is new', EQ.session.justAdded === justGot);
ok('the badge is on the page', EQS.screens.album(EQ.s).indexOf('YENİ') >= 0 || EQS.screens.album(EQ.s).indexOf('NEW') >= 0);
EQ.go('bag');
ok('leaving the album clears the badge', EQ.session.justAdded === null);
ok('coming back is an ordinary visit', (() => {
  EQ.openAlbum();
  return EQ.session.justAdded === null;
})());

group('the rest screen still governs the album');
ok('the album is a screen the pause may take over',
  fs.readFileSync(path.join(JS, 'app.js'), 'utf8').match(/EQ_REST_NUDGE = \[[^\]]*'album'/) !== null);
ok('a sticker already earned is never interrupted',
  fs.readFileSync(path.join(JS, 'app.js'), 'utf8').match(/EQ_REST_FREE = \[[^\]]*'sticker'/) !== null);

/* ── done ── */
console.log('\n' + (fail ? 'FAILED ' + fail + ' of ' + (pass + fail) : 'ALL ' + pass + ' CHECKS PASSED'));
process.exit(fail ? 1 : 0);
