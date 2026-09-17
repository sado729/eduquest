/* EduQuest — regression test for the parent dashboard's date ranges.
   Run it with:  node test/ranges.js      (no dependencies, no build step)

   Why this file exists: the dashboard is the one place a grown-up is handed *numbers*
   about their child, and a wrong number is worse than a missing one — it looks exactly
   as trustworthy as a right one. The screen now reads a chosen range (7 / 14 / 30 days)
   instead of a hardcoded week, so every figure on it (learning time, the comparison with
   the period before, challenges, the limit tally, the chart) has to move together. If one
   of them keeps its old hardcoded 7, the card still renders and simply reports the wrong
   period — nothing on screen would say so.

   The chart also *groups* longer ranges into blocks (5 days per bar for a month), which
   is where numbers get quietly lost: a bucketing that drops or double-counts a day still
   draws a perfectly plausible chart. So the arithmetic is pinned here against the same
   days the range itself totals.

   It loads the real js/tracking.js and js/parent.js — no reimplementation — seeds a
   known number of minutes per day, and asserts the totals and the rendered screen. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const JS = path.join(__dirname, '..', 'js');

/* ── a browser small enough for the screens to render in ── */
const sandbox = {
  document: {
    hidden: false, addEventListener() {},
    /* enough of a node for EQ.go()/render() to write into — this suite renders for real */
    getElementById: () => ({ innerHTML: '', classList: { add() {}, remove() {}, toggle() {} }, style: {} }),
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
  console, Date, Math, JSON, Object, Array, String, Number,
  isNaN, parseInt, parseFloat, setTimeout, clearTimeout, setInterval, clearInterval
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const FILES = ['i18n.js', 'components.js', 'data.js', 'tracking.js', 'app.js', 'profiles.js',
  'qr.js', 'transfer.js', 'screens-onboarding.js', 'screens-world.js', 'screens-play.js',
  'screens-collect.js', 'parent.js'];
for (const f of FILES) {
  vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
}

vm.runInContext('globalThis.__EQ = EQ; globalThis.__EQT = EQT; globalThis.__EQS = EQS; globalThis.__EQI = EQI;', sandbox);
const EQ = sandbox.__EQ;
const EQT = sandbox.__EQT;
const EQS = sandbox.__EQS;
const EQI = sandbox.__EQI;

/* ── harness ── */
let pass = 0, fail = 0;
const group = name => console.log('\n' + name);
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  -> ' + extra : '')); }
};

const KEYS = ['week', 'fort', 'month'];

/* give day `back` (0 = today) a known number of minutes and one answered challenge */
const seed = (back, mins) => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back);
  EQ.s.track.days[EQ.dayKey(d)] = {
    secs: mins * 60, secsQ: mins * 30, secsB: mins * 12, a: 1, c: 1, done: 1,
    hg: 0, hints: 0, boss: 0, bossWin: 0, subj: {}, topics: {}
  };
};
const clearDays = () => { EQ.s.track.days = {}; };

EQ.load();
EQ.s.onboarded = true;
EQ.s.heroName = 'Aysu';

group('the ranges the picker offers');
ok('there are three of them', EQT.RANGES.length === 3, 'got ' + EQT.RANGES.length);
ok('they are a week, a fortnight and a month', EQT.RANGES.map(r => r.days).join(',') === '7,14,30',
  'got ' + EQT.RANGES.map(r => r.days).join(','));
ok('the default is the week', EQ.session.range === 'week', 'got ' + EQ.session.range);
ok('an unknown key falls back to the week rather than crashing', EQT.range('nope').key === 'week');
ok('every range fits inside the 70 days of history kept, with room for its own comparison',
  EQT.RANGES.every(r => r.days * 2 <= 70), 'a range is too long to compare against the period before it');
ok('every range divides evenly into its chart blocks',
  EQT.RANGES.every(r => r.days % r.group === 0), 'a block would straddle the edge of the range');

group('the picker is a cycle, so tapping always gets somewhere');
ok('week -> fortnight', EQT.nextRange('week') === 'fort', 'got ' + EQT.nextRange('week'));
ok('fortnight -> month', EQT.nextRange('fort') === 'month', 'got ' + EQT.nextRange('fort'));
ok('month wraps back to the week', EQT.nextRange('month') === 'week', 'got ' + EQT.nextRange('month'));
let cyc = 'week';
for (let i = 0; i < EQT.RANGES.length; i++) cyc = EQT.nextRange(cyc);
ok('a full cycle returns to where it started', cyc === 'week');

group('each range totals exactly its own days, and no more');
clearDays();
for (let i = 0; i < 60; i++) seed(i, 10); /* 10 minutes every day for 60 days */
ok('a week totals 7 days', EQT.rangeMins('week', 0) === 70, 'got ' + EQT.rangeMins('week', 0));
ok('a fortnight totals 14 days', EQT.rangeMins('fort', 0) === 140, 'got ' + EQT.rangeMins('fort', 0));
ok('a month totals 30 days', EQT.rangeMins('month', 0) === 300, 'got ' + EQT.rangeMins('month', 0));

group('the comparison period is the same span immediately before');
clearDays();
for (let i = 0; i < 7; i++) seed(i, 10);        /* this week: 70 min */
for (let i = 7; i < 14; i++) seed(i, 4);        /* the week before: 28 min */
for (let i = 14; i < 30; i++) seed(i, 100);     /* older still — must not leak in */
ok('the week reads its own 7 days', EQT.rangeMins('week', 0) === 70, 'got ' + EQT.rangeMins('week', 0));
ok('the previous week reads the 7 before that', EQT.rangeMins('week', 1) === 28, 'got ' + EQT.rangeMins('week', 1));
ok('older days do not leak into either', EQT.rangeMins('week', 0) + EQT.rangeMins('week', 1) === 98);
ok('a fortnight is the two weeks combined', EQT.rangeMins('fort', 0) === 98, 'got ' + EQT.rangeMins('fort', 0));
ok('the previous fortnight steps back a full 14 days', EQT.rangeMins('fort', 1) === 1400,
  'got ' + EQT.rangeMins('fort', 1));

group('the chart blocks account for every day, exactly once');
clearDays();
for (let i = 0; i < 60; i++) seed(i, i + 1); /* deliberately uneven, so a lost day shows */
for (const key of KEYS) {
  const b = EQT.buckets(key);
  const n = EQT.range(key).days;
  const covered = b.reduce((t, x) => t + x.span, 0);
  const summed = b.reduce((t, x) => t + x.mins, 0);
  ok(key + ': the blocks cover the whole range', covered === n, 'covered ' + covered + ' of ' + n);
  ok(key + ': the blocks total what the range totals', summed === EQT.rangeMins(key, 0),
    'bars say ' + summed + ', the card says ' + EQT.rangeMins(key, 0));
  ok(key + ': the last block ends today', b[b.length - 1].k === EQ.dayKey());
  ok(key + ': no block is empty of days', b.every(x => x.span > 0));
  ok(key + ': every block carries a label', b.every(x => String(EQT.bucketLabel(x)).length > 0));
}

group('the chart stays readable — a month is blocks, not 30 slivers');
ok('a week is one bar per day', EQT.buckets('week').length === 7, 'got ' + EQT.buckets('week').length);
ok('a fortnight pairs its days', EQT.buckets('fort').length === 7, 'got ' + EQT.buckets('fort').length);
ok('a month is six blocks of five', EQT.buckets('month').length === 6, 'got ' + EQT.buckets('month').length);
ok('no range ever draws more bars than a week does', KEYS.every(k => EQT.buckets(k).length <= 7));
ok('a single-day block is labelled by weekday', EQT.buckets('week')[0].span === 1
  && /^[^0-9]/.test(String(EQT.bucketLabel(EQT.buckets('week')[0]))));
ok('a multi-day block is labelled by date', EQT.buckets('month')[0].span > 1
  && /^[0-9]+$/.test(String(EQT.bucketLabel(EQT.buckets('month')[0]))));

group('the whole screen follows the range, not just the chart');
clearDays();
for (let i = 0; i < 40; i++) seed(i, 10);
const html = {};
for (const key of KEYS) {
  EQ.session.range = key;
  html[key] = EQS.screens.parent_dashboard(EQ.s);
}
ok('the learning-time card moves with the range',
  html.week.indexOf(EQT.fmtMin(70)) >= 0 && html.month.indexOf(EQT.fmtMin(300)) >= 0,
  'a card kept its own hardcoded period');
ok('the challenge count moves with the range',
  html.week.indexOf('>7<') >= 0 && html.month.indexOf('>30<') >= 0,
  'the challenges card did not follow the range');
ok('the chart subtitle names the range', html.month.indexOf('30') >= 0);
ok('the picker shows the range that is actually displayed',
  html.month.split('cycleRange')[1].indexOf('30') >= 0, 'the chip and the numbers disagree');
ok('the picker is wired to the cycle, not to a toast',
  html.week.indexOf('EQ.cycleRange()') >= 0 && html.week.indexOf('coming soon') === -1,
  'the range picker is still a placeholder');
ok('the three ranges really render differently', html.week !== html.fort && html.fort !== html.month);

group('it renders cleanly in every range and every language');
for (const key of KEYS) {
  for (const lang of EQI.langs) {
    EQI.set(lang);
    EQ.session.range = key;
    const h = EQS.screens.parent_dashboard(EQ.s);
    const bad = ['undefined', '[object Object]', 'NaN'].filter(t => h.indexOf(t) >= 0);
    ok(key + ' / ' + lang + ': no broken value reaches the markup', bad.length === 0, bad.join(', '));
  }
}
EQI.set('az');

group('an empty range says so instead of showing a wrong number');
clearDays();
for (const key of KEYS) {
  EQ.session.range = key;
  ok(key + ': totals zero rather than crashing', EQT.rangeMins(key, 0) === 0);
  const h = EQS.screens.parent_dashboard(EQ.s);
  ok(key + ': the screen still renders', h.length > 0 && h.indexOf('NaN') === -1);
  ok(key + ': the blocks are all empty, not missing', EQT.buckets(key).every(b => b.mins === 0));
}

group('leaving the grown-up area puts the dashboard back on the week');
EQ.session.range = 'month';
EQ.exitParent();
ok('the next visit opens on the week', EQ.session.range === 'week', 'got ' + EQ.session.range);

console.log('\n' + (fail
  ? 'FAILED ' + fail + ' of ' + (pass + fail) + ' checks'
  : 'ALL ' + pass + ' CHECKS PASSED'));
process.exit(fail ? 1 : 0);
