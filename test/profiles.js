/* EduQuest — regression test for the several-children-on-one-phone store.
   Run it with:  node test/profiles.js      (no dependencies, no build step)

   Why this file exists: the profile screens come from the design project, but the store
   underneath them (js/profiles.js) is hand-written. A design re-sync can bring back the
   "Children" list while dropping the per-child storage keys, and the damage would be
   silent and permanent: two children sharing one key means the second child's first save
   overwrites the first child's whole adventure. Nothing on screen would say so.

   So this test loads the real js/profiles.js on top of the real js/app.js — no
   reimplementation — and asserts the promises the screen makes to the grown-up:
   every child keeps their own progress, switching parks the current one first, the first
   child keeps the pre-profiles key so an adventure that started before profiles existed
   is never lost, removing erases only that child, and the last child can never be removed. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const JS = path.join(__dirname, '..', 'js');

/* ── a browser small enough for app.js to boot in ── */
const RealDate = Date;
const sandbox = {
  document: {
    hidden: false, getElementById: () => null, addEventListener() {},
    body: { classList: { toggle() {} } }, documentElement: {}
  },
  window: { addEventListener() {}, location: { search: '' } },
  localStorage: {
    _m: {},
    getItem(k) { return Object.prototype.hasOwnProperty.call(this._m, k) ? this._m[k] : null; },
    setItem(k, v) { this._m[k] = String(v); },
    removeItem(k) { delete this._m[k]; }
  },
  navigator: {},
  console, Date: RealDate, Math, JSON, Object, Array, String, Number,
  isNaN, parseInt, parseFloat, setTimeout, clearTimeout, setInterval, clearInterval
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

/* the helpers profiles.js reaches for that live in screen files — TX/RUP are the real
   ones from i18n.js below, so the language assertions mean what they say */
vm.runInContext(`
  var EQC = new Proxy({}, { get: () => () => '' });
  var EQS = { meta: {}, screens: {}, ptoggle: () => '' };
`, sandbox);

for (const f of ['i18n.js', 'tracking.js', 'app.js', 'profiles.js']) {
  vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
}

/* `const EQ` is a lexical binding inside the module, not a property of the sandbox */
vm.runInContext('globalThis.__EQ = EQ; globalThis.__EQP = EQP; globalThis.__EQI = EQI; globalThis.__MAX = EQP_MAX; globalThis.__SKEY = EQP_STATE_KEY;', sandbox);
const EQ = sandbox.__EQ;
const EQP = sandbox.__EQP;
const EQI = sandbox.__EQI;
const MAX = sandbox.__MAX;
const STATE_KEY = sandbox.__SKEY;
const store = sandbox.localStorage;

/* ── harness ── */
let pass = 0, fail = 0;
const group = name => console.log('\n' + name);
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  -> ' + extra : '')); }
};

/* give whoever is playing now a recognisable adventure */
const playAs = (name, level, coins) => {
  EQ.s.onboarded = true;
  EQ.s.heroName = name;
  EQ.s.level = level;
  EQ.s.coins = coins;
  EQ.save();
};

/* ── a single child, exactly as the app booted before profiles existed ── */
group('one child: nothing changes for a phone that has always had one');
EQP.load();
EQ.load();
ok('a fresh phone starts with one child', EQP.ids.length === 1, 'ids=' + EQP.ids);
ok('that child is the one playing', EQP.active === 'p1');
ok('the first child keeps the pre-profiles key', EQP.key('p1') === STATE_KEY, 'got ' + EQP.key('p1'));
playAs('Aysu', 4, 120);
ok('the adventure is saved under the original key', JSON.parse(store.getItem(STATE_KEY)).heroName === 'Aysu');
ok('no second key was invented', Object.keys(store._m).filter(k => k.indexOf(STATE_KEY + '_') === 0).length === 0);

/* ── the second child ── */
group('a second child gets their own adventure, not a share of the first');
const second = EQP.add('en');
ok('the new child has a new id', second === 'p2', 'got ' + second);
ok('both children are on the list', EQP.ids.join(',') === 'p1,p2', 'ids=' + EQP.ids);
ok('the new child is the one playing now', EQP.active === 'p2');
ok('the new child stores under their own key', EQP.key('p2') === STATE_KEY + '_p2', 'got ' + EQP.key('p2'));
ok('the new child starts before the first run', EQ.s.onboarded !== true);
ok('the new child is not shown as a finished hero', EQP.label(EQ.s) !== EQ.s.heroName,
  'a child who has not made a hero yet was labelled with the placeholder name');
ok('the new child opens in the grown-up\'s language', EQ.s.settings.lang === 'en', 'got ' + EQ.s.settings.lang);
ok('the first child is untouched on disk', JSON.parse(store.getItem(STATE_KEY)).heroName === 'Aysu');

playAs('Rustam', 2, 40);
ok('the second child saved to their own key', JSON.parse(store.getItem(STATE_KEY + '_p2')).heroName === 'Rustam');
ok('and did NOT overwrite the first child', JSON.parse(store.getItem(STATE_KEY)).heroName === 'Aysu',
  'the first adventure was overwritten — the per-child key is gone');
ok('the two adventures really are different', JSON.parse(store.getItem(STATE_KEY)).level !== JSON.parse(store.getItem(STATE_KEY + '_p2')).level);

/* ── switching ── */
group('switching parks one child and brings the other in');
EQ.s.coins = 999; /* unsaved progress: swap() must save it before leaving */
EQP.swap('p1');
ok('the first child is playing again', EQP.active === 'p1');
ok('their own adventure came back', EQ.s.heroName === 'Aysu' && EQ.s.level === 4, 'got ' + EQ.s.heroName + '/' + EQ.s.level);
ok('the child who left was saved on the way out', JSON.parse(store.getItem(STATE_KEY + '_p2')).coins === 999,
  'unsaved progress was dropped by the swap');
ok('their language came back too', EQI.lang === 'az', 'got ' + EQI.lang);
EQP.swap('p2');
ok('switching back finds the second child again', EQ.s.heroName === 'Rustam' && EQ.s.coins === 999);
EQP.swap('p1');

/* ── what the grown-up's list shows ── */
group('the list a grown-up reads');
const kids = EQP.list();
ok('the list has every child', kids.length === 2);
ok('it marks exactly one as playing now', kids.filter(k => k.active).length === 1);
ok('the one marked is the one playing', kids.find(k => k.active).id === 'p1');
ok('a finished child shows their hero name', EQP.label(EQP.peek('p2')) === 'Rustam', 'got ' + EQP.label(EQP.peek('p2')));
const fresh = EQP.add('az');
ok('a child still in the first run is never left nameless', EQP.label(EQP.peek(fresh)).length > 0);
ok('and is not labelled with a half-made hero', EQP.label({ heroName: 'Yarım' }) !== 'Yarım',
  'a hero abandoned mid-creation was shown as if finished');
ok('peek() reads another child without disturbing the one playing', EQP.peek('p1').heroName === 'Aysu' && EQP.active === fresh);

/* ── the ceiling ── */
group('the phone holds a stated number of children, no more');
while (!EQP.full()) EQP.add('az');
ok('the list fills to the stated maximum', EQP.ids.length === MAX, 'ids=' + EQP.ids);
ok('full() says so', EQP.full() === true);
const overflow = EQP.add('az');
ok('one more is refused, not silently dropped on top of a child', overflow === null);
ok('and the list did not grow', EQP.ids.length === MAX);

/* ── removing ── */
group('removing a child erases that child only');
EQP.swap('p1');
playAs('Aysu', 4, 120);
const doomed = EQP.ids.filter(id => id !== 'p1' && id !== 'p2')[0];
const doomedKey = EQP.key(doomed);
ok('the child about to go had storage of their own', store.getItem(doomedKey) !== null);
ok('removing reports success', EQP.remove(doomed) === true);
ok('they are off the list', EQP.ids.indexOf(doomed) === -1, 'ids=' + EQP.ids);
ok('their storage is gone', store.getItem(doomedKey) === null);
ok('the child playing kept their adventure', EQ.s.heroName === 'Aysu' && EQ.s.level === 4);
ok('the other children kept theirs', JSON.parse(store.getItem(STATE_KEY + '_p2')).heroName === 'Rustam');
ok('removing an unknown id does nothing', EQP.remove('p99') === false);

group('removing the child who is playing hands the phone to someone else');
EQP.swap('p2');
ok('the second child is playing', EQP.active === 'p2');
EQP.remove('p2');
ok('somebody else is playing now', EQP.active !== 'p2' && EQP.ids.indexOf(EQP.active) >= 0, 'active=' + EQP.active);
ok('the removed child\'s storage is gone', store.getItem(STATE_KEY + '_p2') === null);
ok('the new player\'s own adventure is loaded', EQ.s.heroName === EQP.label(EQP.peek(EQP.active)));
ok('and it was not overwritten by the removed child on the way out',
  EQP.active !== 'p1' || EQ.s.heroName === 'Aysu', 'got ' + EQ.s.heroName);

group('the last child can never be removed');
while (EQP.ids.length > 1) EQP.remove(EQP.ids[EQP.ids.length - 1]);
ok('one child is left', EQP.ids.length === 1, 'ids=' + EQP.ids);
ok('removing it is refused', EQP.remove(EQP.ids[0]) === false);
ok('the phone still has a child', EQP.ids.length === 1);
ok('that child still has an adventure', EQ.s !== null && typeof EQ.s === 'object');

/* ── surviving a restart ── */
group('the phone remembers who was playing after a restart');
EQP.swap('p1');
playAs('Aysu', 4, 120);
const joined = EQP.add('ru');
playAs('Nigar', 7, 300);
EQP.save();
EQP.ids = []; EQP.active = null; /* as if the page had just been opened */
EQP.load();
EQ.load();
ok('both children came back', EQP.ids.length === 2, 'ids=' + EQP.ids);
ok('the child who was playing is playing again', EQP.active === joined, 'active=' + EQP.active);
ok('with their own adventure', EQ.s.heroName === 'Nigar' && EQ.s.level === 7, 'got ' + EQ.s.heroName);
ok('the other child is still there', EQP.peek('p1').heroName === 'Aysu');

group('a damaged index never costs a child their adventure');
store.setItem('eduquest_profiles_v1', '{ not json');
EQP.load();
ok('unreadable index falls back to one child', EQP.ids.length === 1 && EQP.active === 'p1', 'ids=' + EQP.ids);
EQ.load();
ok('and that child is the original adventure, not a blank one', EQ.s.heroName === 'Aysu',
  'the pre-profiles adventure was lost when the index broke');
store.setItem('eduquest_profiles_v1', JSON.stringify({ v: 1, active: 'p9', ids: ['p1', 'p2'] }));
EQP.load();
ok('an active id that is not on the list is corrected', EQP.active === 'p1', 'active=' + EQP.active);

console.log('\n' + (fail
  ? 'FAILED ' + fail + ' of ' + (pass + fail) + ' checks'
  : 'ALL ' + pass + ' CHECKS PASSED'));
process.exit(fail ? 1 : 0);
