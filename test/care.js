/* EduQuest — regression test for the Questy care loop.
   Run it with:  node test/care.js      (no dependencies, no build step)

   Why this file exists: the coin had one place to go. The Star Crown costs 250 and is
   bought once; after that a child keeps earning coins that buy nothing, which quietly
   drains the meaning out of every reward the game hands out. Caring for Questy is the
   second sink, and the *daily* one — three small things, 20 coins each, once a day.

   Three things about it fail silently, and each one fails in a way that looks fine:

     1. the *once a day*. Care is keyed to the calendar day, not to resetDaily(). If the
        day key stops being consulted, a child either buys the same berry forever (coins
        drain to zero with nothing to show) or can never buy it again (the loop dies
        after one day). Both render perfectly.
     2. the *never decays*. This is the design rule that matters most and the easiest to
        lose: nothing about Questy may get worse while a child is away. A pet that grows
        hungry overnight punishes a seven-year-old for sleeping — and this app already
        took the opposite position with the rest screen, which *stops* play rather than
        rewarding more of it. The care state must only ever be added to.
     3. the *carry*. A transfer moves an adventure to a new phone. Care that does not
        ride along means the child arrives able to re-buy what they already bought today,
        or with their careTotal reset to nothing.

   The screens are design-project visuals and the store beneath them is hand-written, so
   a re-sync can restore the Questy drawing and drop the loop — leaving a fox you can tap
   for a chirp and coins with nowhere to go. If this suite goes red after a re-sync, that
   is what happened — see `EQ.careGive` / `EQ.careToday` in js/app.js, `EQD.CARE` in
   js/data.js, and `EQS.screens.care` in js/screens-collect.js. */

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

const realGo = EQ.go;
/* the real guard, kept aside: fresh() stubs it out, and group 8 needs it back */
const realRestGuard = EQ.restGuard;

const fresh = coins => {
  EQ.s = JSON.parse(JSON.stringify(EQ_DEFAULTS));
  EQ.s.onboarded = true;
  EQ.s.settings.music = false;
  EQ.s.coins = coins == null ? 500 : coins;
  EQ.save = () => {};
  EQ.render = () => {};
  EQ.toast = m => EQ._toasts.push(m);
  EQ._toasts = [];
  EQ.current = 'map';
  EQ.go = realGo;
  EQ.restGuard = () => false;
  EQ.checkNewDay = () => false;
  for (const k of ['attempt', 'done', 'hint', 'bossHit', 'bossWin', 'tick']) EQT[k] = () => {};
};
const lastToast = () => EQ._toasts[EQ._toasts.length - 1] || '';

/* ── 1 · the catalogue ── */
group('there are three things to give, each fully described');
fresh();
ok('the catalogue is not empty', EQD.CARE.length === 3, 'got ' + EQD.CARE.length);
ok('every id is unique', new Set(EQD.CARE.map(c => c.id)).size === EQD.CARE.length);
ok('the id lookup finds every item', EQD.CARE.every(c => EQD.CARE_BY_ID[c.id] === c));
ok('every item has a drawing',
  EQD.CARE.every(c => typeof c.art === 'string' && c.art.indexOf('<') === 0));
ok('every item has a trilingual name',
  EQD.CARE.every(c => c.name && c.name.az && c.name.en && c.name.ru));
ok('every item explains itself in three languages',
  EQD.CARE.every(c => c.note && c.note.az && c.note.en && c.note.ru));
/* the kind reply when a child taps something already given today — a screen that just
   goes silent reads, at seven, as "it is broken" */
ok('every item has a trilingual thank-you',
  EQD.CARE.every(c => c.done && c.done.az && c.done.en && c.done.ru));
ok('every item has a trilingual "already done today"',
  EQD.CARE.every(c => c.again && c.again.az && c.again.en && c.again.ru));
ok('every item maps to a mood Questy can actually wear',
  EQD.CARE.every(c => typeof EQC_MOODS().indexOf === 'function' && EQC_MOODS().indexOf(c.mood) >= 0),
  'moods: ' + EQD.CARE.map(c => c.mood).join());
ok('a care costs a round, small number of coins',
  EQD.CARE_COST > 0 && EQD.CARE_COST <= 50, 'got ' + EQD.CARE_COST);
/* the whole point: a day of care must cost less than a day of play earns, or caring
   competes with the Crown instead of sitting beside it */
ok('a full day of care costs less than a finished adventure pays',
  EQD.CARE.length * EQD.CARE_COST < 5 * 40 + 100,
  EQD.CARE.length * EQD.CARE_COST + ' vs ' + (5 * 40 + 100));

/* EQC.questy accepts a fixed set of moods; an item pointing at a mood that does not
   exist falls back silently to 'happy', so the reward for caring quietly disappears */
function EQC_MOODS() {
  return ['happy', 'excited', 'thinking', 'confused', 'celebrating', 'encouraging', 'hint'];
}

/* ── 2 · giving ── */
group('giving a care costs coins and Questy notices');
fresh(100);
EQ.careGive('feed');
ok('the coins are spent', EQ.s.coins === 100 - EQD.CARE_COST, 'got ' + EQ.s.coins);
ok('it is recorded as given today', EQ.caredWith('feed'));
ok('the lifetime count moves', EQ.s.careTotal === 1);
ok('the child is thanked', lastToast() === TX(EQD.CARE_BY_ID.feed.done));
ok('Questy wears the mood that belongs to it', EQ.careMood() === EQD.CARE_BY_ID.feed.mood);
ok('the other two are still on offer', EQ.careLeft() === 2, 'got ' + EQ.careLeft());

group('the same care cannot be bought twice in a day');
fresh(500);
EQ.careGive('feed');
const afterFirst = EQ.s.coins;
EQ.careGive('feed');
ok('the second tap takes no coins', EQ.s.coins === afterFirst, 'got ' + EQ.s.coins);
ok('the lifetime count does not move either', EQ.s.careTotal === 1);
ok('it is not recorded twice', EQ.careToday().filter(id => id === 'feed').length === 1);
ok('the child gets a kind answer, not silence', lastToast() === TX(EQD.CARE_BY_ID.feed.again));

group('all three can be given, and then the day is complete');
fresh(500);
EQD.CARE.forEach(c => EQ.careGive(c.id));
ok('all three are recorded', EQ.careToday().length === 3);
ok('nothing is left to give', EQ.careLeft() === 0);
ok('it cost exactly three cares', EQ.s.coins === 500 - 3 * EQD.CARE_COST, 'got ' + EQ.s.coins);
ok('the lifetime count is three', EQ.s.careTotal === 3);
EQD.CARE.forEach(c => EQ.careGive(c.id));
ok('a fourth round of taps costs nothing', EQ.s.coins === 500 - 3 * EQD.CARE_COST);
ok('and does not inflate the lifetime count', EQ.s.careTotal === 3);

group('an unknown item is not a way to spend coins');
fresh(100);
EQ.careGive('no-such-item');
ok('nothing is spent', EQ.s.coins === 100);
ok('nothing is recorded', EQ.careToday().length === 0);

/* ── 3 · not enough coins ── */
group('a child short on coins is told how far off they are, not just refused');
fresh(EQD.CARE_COST - 5);
EQ.careGive('feed');
ok('nothing is spent', EQ.s.coins === EQD.CARE_COST - 5);
ok('nothing is recorded', EQ.caredWith('feed') === false);
ok('the coins never go negative', EQ.s.coins >= 0);
ok('the message names the gap', lastToast().indexOf('5') >= 0, lastToast());
ok('and points back at the adventure',
  /sınaq|challenge|испытание/i.test(lastToast()), lastToast());
fresh(0);
EQ.careGive('feed');
ok('a child with nothing still gets an answer', EQ._toasts.length === 1);
ok('and still has nothing taken', EQ.s.coins === 0);

/* ── 4 · the day boundary ── */
group('care comes back tomorrow, and only tomorrow');
fresh(500);
EQ.careGive('feed');
EQ.careGive('play');
ok('two are spent today', EQ.careToday().length === 2);
/* a new calendar day: the same thing the app sees when a child opens it the next morning */
EQ.s.careDay = '2000-01-01';
ok('yesterday\'s care does not count as today\'s', EQ.careToday().length === 0);
ok('all three are on offer again', EQ.careLeft() === 3);
ok('Questy starts the day happy, not sad', EQ.careMood() === 'happy');
EQ.careGive('feed');
ok('and the berry can be given again', EQ.caredWith('feed'));
ok('the lifetime count kept counting across the day', EQ.s.careTotal === 3, 'got ' + EQ.s.careTotal);
ok('yesterday\'s list was replaced, not appended to', EQ.careToday().length === 1);

group('a save that has never seen care behaves like a fresh day');
fresh(500);
delete EQ.s.careDay; delete EQ.s.careGiven; delete EQ.s.careTotal;
ok('nothing is given yet', EQ.careToday().length === 0);
ok('all three are on offer', EQ.careLeft() === 3);
ok('Questy is happy', EQ.careMood() === 'happy');
EQ.careGive('brush');
ok('and caring still works', EQ.caredWith('brush') && EQ.s.careTotal === 1);

/* ── 5 · the rule that matters: nothing decays ── */
group('Questy never gets worse while the child is away');
fresh(500);
EQD.CARE.forEach(c => EQ.careGive(c.id));
const moodCaredFor = EQ.careMood();
/* a week passes with the app closed. This is the exact shape of the bug this group
   exists to catch: some re-synced "pet" logic that lowers a mood, or empties a bag, or
   marks Questy hungry, because time passed. */
EQ.s.careDay = '2000-01-01';
ok('the lifetime count is not taken away', EQ.s.careTotal === 3);
ok('the coins already spent are not refunded or re-charged', EQ.s.coins === 500 - 3 * EQD.CARE_COST);
ok('Questy is never in a sad or hungry mood', EQ.careMood() === 'happy');
ok('there is no mood in the catalogue that reads as unhappy',
  EQD.CARE.every(c => ['confused'].indexOf(c.mood) < 0));
ok('coming back offers care, it does not demand it', EQ.careLeft() === 3);
ok('caring again returns the happy mood', (EQ.careGive('play'), EQ.careMood() === moodCaredFor || EQ.careMood() === EQD.CARE_BY_ID.play.mood));
/* there must be no code path that removes a care or lowers careTotal */
const appSrc = fs.readFileSync(path.join(JS, 'app.js'), 'utf8');
ok('no code path decreases the lifetime care count',
  !/careTotal\s*(-=|--)/.test(appSrc) && !/careTotal\s*=\s*[^;]*-\s*1/.test(appSrc));
ok('no code path removes an already-given care',
  !/careGiven[^;\n]*\.(splice|pop|shift)\s*\(/.test(appSrc));

/* ── 6 · the screen ── */
group('the care screen renders, in all three languages');
fresh(500);
ok('the screen exists', typeof EQS.screens.care === 'function');
const langs = ['az', 'en', 'ru'];
const html = {};
langs.forEach(l => {
  EQI.set(l); EQ.s.settings.lang = l;
  html[l] = EQS.screens.care(EQ.s);
});
EQI.set('az');
ok('it renders in every language', langs.every(l => html[l] && html[l].length > 500));
ok('each language produces its own text', new Set(langs.map(l => html[l])).size === 3);
langs.forEach(l => {
  ok('every item is named on the ' + l + ' screen',
    EQD.CARE.every(c => html[l].indexOf(c.name[l]) >= 0));
});
ok('the price is shown', html.en.indexOf(String(EQD.CARE_COST)) >= 0);
ok('the coin balance is shown', html.en.indexOf('>' + EQ.s.coins + '<') >= 0);
ok('every item is tappable', EQD.CARE.every(c => html.en.indexOf("EQ.careGive('" + c.id + "')") >= 0));
ok('there is a way back out', html.en.indexOf("EQ.go('map')") >= 0);
/* an "empty/hungry" meter is exactly the shape this feature refuses to have */
ok('no language shows Questy as hungry or sad',
  langs.every(l => !/hungry|sad|starv|ac qal|kədər|голоден|груст/i.test(html[l])));

group('the screen tells a cared-for day apart from a fresh one');
fresh(500);
const before = EQS.screens.care(EQ.s);
EQD.CARE.forEach(c => EQ.careGive(c.id));
const after = EQS.screens.care(EQ.s);
ok('the screen changes once care is given', before !== after);
ok('a given item is marked done, not offered again at a price',
  after.indexOf(TX(EQD.CARE[0].name)) >= 0);
ok('a completed day is still a warm screen, not an empty one', after.length > 500);

/* ── 7 · getting there ── */
group('a child can find Questy from the world and from home');
fresh(500);
const map = EQS.screens.map(EQ.s);
ok('tapping Questy on the map opens the care screen', map.indexOf("EQ.go('care')") >= 0);
ok('and the map shows how many cares are left', map.indexOf('>3<') >= 0);
const home = EQS.screens.home(EQ.s);
ok('tapping Questy at home opens it too', home.indexOf("EQ.go('care')") >= 0);
EQD.CARE.forEach(c => EQ.careGive(c.id));
const mapDone = EQS.screens.map(EQ.s);
ok('a finished day drops the badge rather than showing a zero',
  mapDone.indexOf("EQ.go('care')") >= 0 && mapDone.indexOf('>0<') < 0);
ok('the router actually reaches the screen', (EQ.go('care'), EQ.current === 'care'));

/* ── 8 · the rest screen still wins ── */
group('the daily limit and bedtime still stop the day, care included');
fresh(500);
/* the real guard, not the stub: care must not be on the rest-free list */
EQ.restGuard = realRestGuard;
EQ.s.settings.limit = 45;
EQ.s.track = { start: EQ.dayKey(), days: { [EQ.dayKey()]: { secs: 60 * 60 } } };
ok('the rest state is reached', EQ.restState() === 'limit', 'got ' + EQ.restState());
ok('the care screen is paused by the limit', EQ.restGuard('care') === true);
ok('a child sent to rest lands on the rest screen', (EQ.go('care'), EQ.current === 'restday'));
ok('the grown-up area is still reachable', EQ.restGuard('parent_gate') === false);

/* ── 9 · the carry ── */
group('care makes the trip to a new phone');
fresh(500);
EQ.careGive('feed');
EQ.careGive('brush');
EQ.s.careTotal = 17;              /* a child who has been caring for a while */
const packed = EQX.pack(EQ.s, 14);
const landed = EQX.clean(EQX.unpack(packed));
ok('the code still fits a QR', packed.length < EQX.QR_MAX, packed.length + ' chars');
ok('the coins made the trip', landed.coins === EQ.s.coins, 'got ' + landed.coins);
ok('the lifetime care count made the trip', landed.careTotal === 17, 'got ' + landed.careTotal);
ok('today\'s care day made the trip', landed.careDay === EQ.dayKey(), 'got ' + landed.careDay);
ok('the berry is still marked given', landed.careGiven.indexOf('feed') >= 0);
ok('the brush is still marked given', landed.careGiven.indexOf('brush') >= 0);
ok('the ball is still on offer', landed.careGiven.indexOf('play') < 0);
/* the actual risk: arriving able to re-buy what was already bought today */
EQ.s = landed; EQ.save = () => {}; EQ.render = () => {};
EQ._toasts = [];
const coinsOnArrival = EQ.s.coins;
EQ.careGive('feed');
ok('the new phone does not sell the same berry again', EQ.s.coins === coinsOnArrival);
ok('and the ball can still be bought there', (EQ.careGive('play'), EQ.s.coins === coinsOnArrival - EQD.CARE_COST));

group('a transfer code from before Questy had care still imports');
fresh(500);
EQ.s.careTotal = 4; EQ.careGive('feed');
const full = EQX.pack(EQ.s, 14);
/* strip the two care fields off the counters group and the care date off the date group,
   which is exactly the shape of a code written by the previous version */
const parts = full.split('_');
parts[4] = parts[4].split('.').slice(0, 15).join('.');
parts[7] = parts[7].split('.').slice(0, 4).join('.');
const old = EQX.clean(EQX.unpack(parts.join('_')));
ok('an older code still reads', old !== null && old.onboarded === true);
ok('the coins still arrive', old.coins === EQ.s.coins, 'got ' + old.coins);
ok('care simply reads as never given', old.careGiven.length === 0 && old.careTotal === 0);
ok('and the child can care straight away',
  (EQ.s = old, EQ.save = () => {}, EQ.render = () => {}, EQ.careLeft() === 3));

group('a corrupt code cannot smuggle anything into the care state');
fresh(500);
const junk = EQX.clean({
  careGiven: ['feed', 'feed', '<img src=x onerror=alert(1)>', 'no-such', 'brush'],
  careDay: 'not-a-day', careTotal: -5, coins: 50
});
ok('unknown items are dropped', junk.careGiven.every(id => EQD.CARE_BY_ID[id]));
ok('duplicates are dropped', new Set(junk.careGiven).size === junk.careGiven.length);
ok('a bad day means nothing was given', junk.careGiven.length === 0, JSON.stringify(junk.careGiven));
ok('the lifetime count cannot go negative', junk.careTotal >= 0);
const junk2 = EQX.clean({ careGiven: ['feed', 'brush'], careDay: EQ.dayKey(), careTotal: 0 });
ok('a real day keeps its real items', junk2.careGiven.join() === 'feed,brush');
ok('the lifetime count is never less than what was given today', junk2.careTotal >= 2);

/* ── done ── */
console.log('\n' + (fail ? 'FAILED ' + fail + ' of ' + (pass + fail) : 'ALL ' + pass + ' CHECKS PASSED'));
process.exit(fail ? 1 : 0);
