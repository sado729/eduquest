/* EduQuest — regression test for the two region helmets.
   Run it with:  node test/helmets.js      (no dependencies, no build step)

   Why this file exists: the wardrobe always showed a Diver Helm ("opens on Science
   Island") and a Space Helm ("reach Level 15") as locked cards — and nothing anywhere
   could open them. Both regions have been playable for a while, so a child could do
   everything the cards asked and still find them locked. Now the first full round in
   Elm Adası earns the Diver Helm and the first full round in Kosmik Stansiya earns the
   Space Helm (that region opens at Level 15, so the old card's level stays true).

   What fails silently, and what this suite pins:

     1. the *earning*. A flag nobody sets renders exactly like a locked card, which is
        exactly what the bug looked like. Four answers must not be enough; the fifth must.
     2. the *telling*. A helmet that appears in the wardrobe with no word to the child is
        a reward nobody receives — a toast on the next calm screen and the hero wearing it
        on the round's end screen.
     3. the *old children*. A save from before this change has no helmet flag, but does
        remember every correct answer given in a region (`s.regions[r].total`). Five of
        them is a round's worth: that child gets the helmet on load, and is told.
     4. the *carry*. A transfer code carries the helmets in two new flag bits and the
        hats in an append-only list, so every code written before still reads as it did.
     5. the *drawing*. Every screen draws the hero through EQC.hero; a helmet key it does
        not know silently draws a bare head, and a broken template prints "undefined".

   A design re-sync would restore the static locked cards (the design project has them)
   and drop all of this. If this suite goes red after a re-sync, that is what happened —
   see `EQD.HELMS` in js/regions.js, `EQ.earnHelm` / `EQ.loadHelms` in js/app.js, the
   hat branch of `EQC.hero` in js/components.js and the helmet bits in js/transfer.js. */

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
const { EQ, EQC, EQD, EQS, EQT, EQP, EQX, EQ_DEFAULTS, TX, EQI, EQI_FMT } = sandbox;

const realGo = EQ.go;
const LANGS = ['az', 'en', 'ru'];
const BAD = /undefined|\[object Object\]|NaN/;
const DIVER = EQD.HELM_BY && EQD.HELM_BY.diver, SPACE = EQD.HELM_BY && EQD.HELM_BY.space;

const fresh = level => {
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.onboarded = true;
  EQ.s.settings.music = false;
  /* a full album: the sticker reveal is album.js's business, not a beat in this flow */
  EQ.s.stickerIds = EQD.STICKERS.map(st => st.id); EQ.s.stickers = EQ.s.stickerIds.length;
  EQ.s.level = level == null ? 16 : level;
  EQ.save = () => {};
  EQ.render = () => {};
  EQ.toast = m => EQ._toasts.push(m);
  EQ._toasts = [];
  EQ.current = 'map';
  EQ.go = realGo;
  EQ.restGuard = () => false;
  EQ.checkNewDay = () => false;
  Object.assign(EQ.session, { mission: null, region: null, ctx: 'daily', q: null, qIdx: -1, qKey: null, answering: false, recSkips: [], unlockRegion: null, helmNews: [], helmCard: null, wardrobeCat: 'hats' });
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
/* play n correct answers in region r, through the real screens' buttons */
const play = (r, n) => {
  if (EQ.session.region !== r) EQ.openRegion(r);
  for (let i = 0; i < n; i++) {
    EQ.go('challenge');
    answer(true);
    EQ.continueAfterSuccess();
    if (EQ.current === 'levelup') EQ.applyLevelUp();
  }
};
const wardrobe = () => EQS.screens.wardrobe(EQ.s);

/* ── 1 · the catalogue ── */
group('two helmets, each belonging to a region');
fresh();
ok('EQD.HELMS lists the Diver Helm and the Space Helm', DIVER && SPACE && EQD.HELMS.length === 2);
ok('the Diver Helm belongs to Elm Adası, the Space Helm to Kosmik Stansiya',
  DIVER.region === 'island' && SPACE.region === 'station' && EQD.helmOf('island') === DIVER && EQD.helmOf('station') === SPACE);
ok('the forest-side regions give no helmet', EQD.helmOf('valley') === null && EQD.helmOf('castle') === null);
ok('both start unowned for a new child', EQ_DEFAULTS.diverHelmOwned === false && EQ_DEFAULTS.spaceHelmOwned === false);
ok('each helmet names its state flag', DIVER.flag === 'diverHelmOwned' && SPACE.flag === 'spaceHelmOwned');
ok('the hat list is append-only: the four old hats keep their numbers',
  ['none', 'explorer', 'wizard', 'crown'].every((h, i) => EQX.HAT[i] === h), EQX.HAT.join());
ok('…and the helmets come after them', EQX.HAT.indexOf('diver') === 4 && EQX.HAT.indexOf('space') === 5);
ok('the "how to earn" line names the region\'s real level (10 and 15)',
  LANGS.every(l => DIVER.shut[l].indexOf(String(EQD.REGIONS.island.level)) >= 0 && SPACE.shut[l].indexOf(String(EQD.REGIONS.station.level)) >= 0));
ok('Kosmik Stansiya still opens at Level 15, so the card\'s old "Level 15" stays true', EQD.REGIONS.station.level === 15);
ok('every helmet text is in all three languages',
  EQD.HELMS.every(h => ['name', 'note', 'how', 'shut', 'got'].every(k => h[k] && LANGS.every(l => typeof h[k][l] === 'string' && h[k][l].length > 3))));

/* ── 2 · locked before the round ── */
group('before the round the helmets are locked, and say how to earn them');
fresh(16);
ok('neither helmet is in the owned-hat list', EQ.ownedHats().indexOf('diver') < 0 && EQ.ownedHats().indexOf('space') < 0);
EQ.wearHat('diver');
ok('tapping a locked helmet does not put it on', EQ.s.hero.hat === 'none');
EQ.wearHat('space');
ok('…nor the other one', EQ.s.hero.hat === 'none');
for (let i = 0; i < 8; i++) EQ.cycleHat(1);
ok('the preview arrows never land on a locked helmet', EQ.ownedHats().indexOf(EQ.s.hero.hat) >= 0 && ['diver', 'space'].indexOf(EQ.s.hero.hat) < 0);
EQ.s.hero.hat = 'none';
LANGS.forEach(l => {
  EQI.set(l);
  const w = wardrobe();
  ok(`${l}: the wardrobe shows both helmets as locked cards`,
    /EQ\.helmHow\('diver'\)/.test(w) && /EQ\.helmHow\('space'\)/.test(w) && !/EQ\.wearHat\('diver'\)/.test(w) && !/EQ\.wearHat\('space'\)/.test(w));
  ok(`${l}: each card states the real condition (a round in its region)`,
    w.indexOf(DIVER.note[l]) >= 0 && w.indexOf(SPACE.note[l]) >= 0);
  ok(`${l}: the old "unlocks in / at Level 15" wording is gone`,
    !/Elm Adasında açılır|unlocks in Science Island|Reach Level 15|15-ci səviyyədə açılır|Достигни 15/.test(w));
  ok(`${l}: the wardrobe renders clean`, !BAD.test(w), (w.match(BAD) || [])[0]);
});
EQI.set('az');
fresh(9);
let w9 = wardrobe();
ok('at Level 9 both cards also show the level their region opens at',
  w9.indexOf('Səviyyə 10') >= 0 && w9.indexOf('Səviyyə 15') >= 0);
EQ.helmHow('diver');
ok('tapping a helmet whose region is shut explains the level first', EQ._toasts.pop() === DIVER.shut.az);
fresh(16);
w9 = wardrobe();
ok('at Level 16 both regions are open, so no level line is left', w9.indexOf('Səviyyə 10') < 0 && w9.indexOf('Səviyyə 15') < 0);
EQ.helmHow('space');
ok('tapping a helmet whose region is open says "finish one round"', EQ._toasts.pop() === SPACE.how.az);
fresh(12);
EQ.helmHow('space');
ok('at Level 12 the Space Helm still says the station is shut', EQ._toasts.pop() === SPACE.shut.az);

/* ── 3 · four answers are not a round ── */
group('four answers are not enough');
fresh(16);
play('island', 4);
ok('after four of five island questions the Diver Helm is still locked', EQ.s.diverHelmOwned === false);
ok('…nothing was announced', EQ.session.helmNews.length === 0 && !EQ._toasts.some(t => t.indexOf(DIVER.got.az) >= 0));
ok('a wrong answer earns nothing either', (() => { EQ.go('challenge'); answer(false); return EQ.s.diverHelmOwned === false; })());

/* ── 4 · the fifth one earns it, and the child is told ── */
group('the first full round earns the helmet, and the child is told');
fresh(16);
play('island', 4);
EQ.go('challenge');
answer(true);
ok('the fifth island answer puts the Diver Helm in the wardrobe', EQ.s.diverHelmOwned === true);
ok('…and only that one', EQ.s.spaceHelmOwned === false);
ok('the reward is not shouted over the success beat', EQ.current === 'success' && !EQ._toasts.some(t => t.indexOf(DIVER.got.az) >= 0));
EQ.continueAfterSuccess();
ok('the round\'s end screen is next', EQ.current === 'region');
ok('…and a toast there says it was added to the wardrobe', EQ._toasts.some(t => t.indexOf(DIVER.got.az) === 0), EQ._toasts.join(' | '));
ok('the toast is not repeated on the next screen', (() => { const n = EQ._toasts.length; EQ.go('map'); EQ.go('wardrobe'); return EQ._toasts.length === n; })());
EQ.openRegion('island');
EQ.session.helmCard = 'diver'; /* as the round left it — openRegion re-enters the same finished round */
LANGS.forEach(l => {
  EQI.set(l);
  const r = EQS.screens.region(EQ.s);
  ok(`${l}: the round's end shows the new helmet with a "put it on" button`,
    r.indexOf(TX(DIVER.name)) >= 0 && /EQ\.wearHat\('diver'\)/.test(r) && /fill-rule="evenodd"/.test(r));
  ok(`${l}: that screen renders clean`, !BAD.test(r), (r.match(BAD) || [])[0]);
});
EQI.set('az');
EQ.wearHat('diver');
ok('the button dresses the hero in it', EQ.s.hero.hat === 'diver');
ok('the card then says it is being worn', /Geyinilib/.test(EQS.screens.region(EQ.s)) && !/EQ\.wearHat\('diver'\)/.test(EQS.screens.region(EQ.s)));
ok('the helmet is now an owned hat', EQ.ownedHats().indexOf('diver') >= 0);
let wd = wardrobe();
ok('the wardrobe card is wearable and marked as worn', /EQ\.wearHat\('diver'\)/.test(wd) && wd.indexOf('Geyinilib') >= 0 && !/EQ\.helmHow\('diver'\)/.test(wd));
ok('the Space Helm card stays locked', /EQ\.helmHow\('space'\)/.test(wd));
EQ.wearHat('none');
EQ.cycleHat(-1);
ok('the preview arrows now reach it', EQ.s.hero.hat === 'diver', EQ.s.hero.hat);
EQ.go('map');
ok('leaving the region drops the round-end card', EQ.session.helmCard === null);
const toastsBefore = EQ._toasts.length;
EQ.openRegion('island');
EQ.regionAgain();
for (let i = 0; i < 5; i++) { EQ.go('challenge'); answer(true); EQ.continueAfterSuccess(); }
ok('a second round does not announce it again', !EQ._toasts.slice(toastsBefore).some(t => t.indexOf(DIVER.got.az) >= 0) && EQ.session.helmCard === null);

group('Kosmik Stansiya gives the Space Helm the same way');
fresh(16);
play('station', 5);
ok('a full station round earns the Space Helm', EQ.s.spaceHelmOwned === true && EQ.s.diverHelmOwned === false);
ok('…and says so', EQ._toasts.some(t => t.indexOf(SPACE.got.az) === 0));
EQ.wearHat('space');
ok('it can be worn', EQ.s.hero.hat === 'space');
fresh(20);
play('valley', 5);
play('castle', 5);
ok('rounds in Söz Vadisi and Sirli Qala give no helmet', !EQ.s.diverHelmOwned && !EQ.s.spaceHelmOwned && EQ.session.helmNews.length === 0);

/* ── 5 · old children ── */
group('a child who finished a round before this change gets the helmet on load');
const store = sandbox.localStorage;
const oldSave = extra => {
  const s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  delete s.diverHelmOwned; delete s.spaceHelmOwned; /* the pre-helmet shape */
  Object.assign(s, { onboarded: true, level: 16 }, extra);
  store._m = {};
  EQP.ids = ['p1']; EQP.active = 'p1';
  store.setItem(EQP.key(), JSON.stringify(s));
  EQ.load();
};
oldSave({ regions: { island: { day: '2026-09-20', round: 0, n: 5, plan: null, paid: true, total: 7 } } });
ok('seven island answers in an old save → Diver Helm owned', EQ.s.diverHelmOwned === true);
ok('…but no station answers → no Space Helm', EQ.s.spaceHelmOwned === false);
ok('…and the child will be told on the next calm screen', EQ.session.helmNews.indexOf('diver') >= 0);
EQ.toast = m => EQ._toasts.push(m); EQ._toasts = []; EQ.render = () => {}; EQ.save = () => {};
EQ.restGuard = () => false; EQ.checkNewDay = () => false;
EQ.go('map');
ok('the map shows that toast', EQ._toasts.indexOf(DIVER.got.az) >= 0, EQ._toasts.join(' | '));
oldSave({ regions: { station: { day: '2026-09-24', round: 1, n: 0, plan: null, paid: true, total: 10 } } });
ok('ten station answers → Space Helm owned', EQ.s.spaceHelmOwned === true && EQ.s.diverHelmOwned === false);
oldSave({ regions: { island: { day: '2026-09-24', round: 0, n: 4, plan: null, paid: false, total: 4 } } });
ok('four island answers are not a round\'s worth', EQ.s.diverHelmOwned === false && EQ.session.helmNews.length === 0);
oldSave({});
ok('a save with no regions at all gets nothing', !EQ.s.diverHelmOwned && !EQ.s.spaceHelmOwned);
oldSave({ diverHelmOwned: false, regions: { island: { day: '2026-09-24', round: 0, n: 2, plan: null, paid: false, total: 9 } } });
ok('once the flag is saved as a boolean, the history no longer decides', EQ.s.diverHelmOwned === false);
oldSave({ hero: Object.assign({}, EQ_DEFAULTS.hero, { hat: 'space' }) });
ok('a helmet worn without being owned comes off on load', EQ.s.hero.hat === 'none');
oldSave({ diverHelmOwned: true, spaceHelmOwned: true, hero: Object.assign({}, EQ_DEFAULTS.hero, { hat: 'space' }) });
ok('an owned, worn helmet stays on and nothing is re-announced', EQ.s.hero.hat === 'space' && EQ.session.helmNews.length === 0);
store._m = {};
EQ.load();
ok('a brand-new child starts with neither', !EQ.s.diverHelmOwned && !EQ.s.spaceHelmOwned && EQ.session.helmNews.length === 0);

/* ── 6 · the carry ── */
group('a transfer carries the helmets, and old codes still read');
const packState = (diver, space, hat) => {
  const s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  Object.assign(s, { onboarded: true, heroName: 'Aysel', level: 16, diverHelmOwned: diver, spaceHelmOwned: space, crownOwned: true, pendingLevelUp: true });
  s.hero.hat = hat;
  s.track = { start: EQ.dayKey(), days: {} }; s.lastDay = EQ.dayKey();
  return s;
};
(() => {
  const both = EQX.clean(EQX.unpack(EQX.pack(packState(true, true, 'space'), 0)));
  ok('code round trip: both helmets owned', both.diverHelmOwned === true && both.spaceHelmOwned === true);
  ok('…and the worn Space Helm is still on', both.hero.hat === 'space');
  ok('…and the older flags beside them are untouched', both.crownOwned === true && both.pendingLevelUp === true && both.wizardHatOwned === false);
  const one = EQX.clean(EQX.unpack(EQX.pack(packState(true, false, 'diver'), 0)));
  ok('code round trip: only the Diver Helm', one.diverHelmOwned === true && one.spaceHelmOwned === false && one.hero.hat === 'diver');
  const none = EQX.clean(EQX.unpack(EQX.pack(packState(false, false, 'crown'), 0)));
  ok('code round trip: neither', none.diverHelmOwned === false && none.spaceHelmOwned === false && none.hero.hat === 'crown');
  const cheat = EQX.clean(EQX.unpack(EQX.pack(packState(false, false, 'space'), 0)));
  ok('a code wearing a helmet it does not own arrives without it', cheat.hero.hat === 'none');
  /* written by the build before this change: Aysel, Level 16, Star Crown on */
  const OLD = '1_Aysel_F2C49B.4A2E20.3DBE6E.2A9455.5B3FD6.0.3_FF9243.F0762A_0.g.0.1.1.0.0.0.0.0.0.0.0.0.0.0.0_1d_3d.19.xc.0.0_fzg.0.4..___';
  const old = EQX.clean(EQX.unpack(OLD));
  ok('an old code still imports', old && old.heroName === 'Aysel' && old.level === 16);
  ok('…with its crown still on (hat number 3 is still the crown)', old.hero.hat === 'crown' && old.crownOwned === true && old.wizardHatOwned === true);
  ok('…and no helmets it never earned', old.diverHelmOwned === false && old.spaceHelmOwned === false);

  const fileState = extra => Object.assign(JSON.parse(JSON.stringify(EQ_DEFAULTS)), { onboarded: true, heroName: 'Aysel', level: 16 }, extra);
  const b1 = EQX.readBundle(JSON.stringify({ app: 'eduquest', made: '2026-09-25', profiles: [{ state: fileState({ diverHelmOwned: false, spaceHelmOwned: true, hero: Object.assign({}, EQ_DEFAULTS.hero, { hat: 'space' }) }) }] }));
  ok('a backup file carries both flags and the worn helmet', b1 && b1.states[0].spaceHelmOwned === true && b1.states[0].diverHelmOwned === false && b1.states[0].hero.hat === 'space');
  const legacy = fileState({ regions: { island: { day: '2026-09-21', round: 0, n: 5, plan: null, paid: true, total: 6 } } });
  delete legacy.diverHelmOwned; delete legacy.spaceHelmOwned;
  const b2 = EQX.readBundle(JSON.stringify({ app: 'eduquest', made: '2026-09-21', profiles: [{ state: legacy }] }));
  ok('a file from before the helmets derives them from its regions, as the loader does', b2 && b2.states[0].diverHelmOwned === true && b2.states[0].spaceHelmOwned === false);
  /* the import writes the cleaned state and reloads: the loader then sees a stored flag */
  store._m = {}; EQP.ids = ['p1']; EQP.active = 'p1';
  store.setItem(EQP.key(), JSON.stringify(b2.states[0]));
  EQ.load();
  ok('…and after the reload the child is told about the helmet the file gave them', EQ.s.diverHelmOwned === true && EQ.session.helmNews.join() === 'diver', EQ.session.helmNews.join());
  ok('…once: the note is not kept in the save', !('helmTell' in EQ.s));
  store.setItem(EQP.key(), JSON.stringify(EQ.s)); EQ.load();
  ok('…so the next load says nothing again', EQ.session.helmNews.length === 0);
  ok('a file that carries its own flags adds no note', b1 && !('helmTell' in b1.states[0]));
})();

/* ── 7 · the drawing ── */
group('the hero draws each helmet, on every screen, in every language');
(() => {
  const base = EQC.hero(Object.assign({}, EQ_DEFAULTS.hero, { hat: 'none' }));
  const d = EQC.hero(Object.assign({}, EQ_DEFAULTS.hero, { hat: 'diver' }));
  const sp = EQC.hero(Object.assign({}, EQ_DEFAULTS.hero, { hat: 'space' }));
  ok('the Diver Helm draws something the bare head does not', d.length > base.length + 200 && /fill-rule="evenodd"/.test(d));
  ok('the Space Helm draws something the bare head does not', sp.length > base.length + 200 && /r="35"/.test(sp));
  ok('the two helmets are different drawings', d !== sp);
  ok('the face is still drawn under both (eyes and smile)', [d, sp].every(x => /cx="49" cy="46"/.test(x) && /M53 57 q7 7 14 0/.test(x)));
  ok('no NaN or undefined in the hero markup', [d, sp].every(x => !BAD.test(x)));
})();
/* the screens that draw the hero (and a few beside them that must not break); `prep`
   puts the game where that screen expects it, as the router would */
const SCREENS = ['map', 'wardrobe', 'region', 'challenge', 'success', 'levelup', 'boss', 'victory', 'home', 'bag', 'awards', 'quest', 'parent_dashboard'];
const HERO_ON = ['map', 'wardrobe', 'challenge', 'success', 'boss', 'victory', 'home', 'parent_dashboard'];
const prep = n => {
  if (n === 'challenge') { EQ.session.ctx = 'daily'; EQ.session.region = null; EQ.go('challenge'); }
  if (n === 'boss') { EQ.s.challengesDone = 5; EQ.go('boss'); }
  if (n === 'victory') EQ.s.bossBeaten = true;
};
['diver', 'space'].forEach(hat => {
  LANGS.forEach(l => {
    fresh(16);
    EQ.s.diverHelmOwned = true; EQ.s.spaceHelmOwned = true;
    EQ.s.hero.hat = hat;
    EQI.set(l);
    const drawn = [], dirty = [], broke = [];
    SCREENS.forEach(n => {
      if (n === 'region') EQ.openRegion(hat === 'diver' ? 'island' : 'station');
      let html = '';
      try {
        prep(n);
        html = EQS.screens[n](EQ.s);
      } catch (e) { broke.push(n + ': ' + e.message); return; }
      if (BAD.test(html)) dirty.push(n + ' (' + html.match(BAD)[0] + ')');
      if ((hat === 'diver' ? /fill-rule="evenodd"/ : /r="35" fill="#BDEBFF"/).test(html)) drawn.push(n);
    });
    ok(`${hat} · ${l}: every screen renders`, broke.length === 0, broke.join('; '));
    ok(`${hat} · ${l}: no undefined / NaN / [object Object] anywhere`, dirty.length === 0, dirty.join(', '));
    ok(`${hat} · ${l}: the helmet is on the hero wherever the hero is drawn (${HERO_ON.length} screens)`,
      HERO_ON.every(n => drawn.indexOf(n) >= 0), 'drawn on: ' + drawn.join(', '));
  });
});

/* ── 8 · the cache ── */
group('installed phones fetch the new code');
(() => {
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  const m = /eduquest-v(\d+)/.exec(sw);
  ok('sw.js cache bumped past v24', m && Number(m[1]) >= 25, m && m[0]);
})();

console.log('\n' + (fail ? `${fail} OF ${pass + fail} CHECKS FAILED` : `ALL ${pass} CHECKS PASSED`));
process.exit(fail ? 1 : 0);
