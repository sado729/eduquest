/* EduQuest — regression test for the three languages (az / en / ru).
   Run it with:  node test/i18n.js      (no dependencies, no build step)

   Why this file exists: the game is trilingual, but the strings do not live in locale
   files — they are ~840 inline {az,en,ru} objects sitting next to the screens that use
   them. Nothing structural stops a new string from shipping with one language missing,
   and TX() quietly falls back to English, so an Azerbaijani child simply sees an English
   sentence with no error anywhere. The design project is monolingual, so a re-sync is
   the most likely way for that to happen in bulk.

   Two halves:
     1. a scanner that finds every {az,en,ru} literal in js/ and fails on a missing key;
     2. unit tests for the language helpers that carry real linguistic logic —
        RUP (russian plurals), AZD (azerbaijani vowel harmony) and UPC (dotted İ). */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const JS = path.join(__dirname, '..', 'js');
const LANGS = ['az', 'en', 'ru'];

/* ── harness ── */
let pass = 0, fail = 0;
const group = name => console.log('\n' + name);
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  -> ' + extra : '')); }
};

/* ── a tiny source reader ──
   Regex cannot do this job: these objects nest, and they are full of template literals
   holding `${...}` with braces of their own. So walk the source instead, skipping over
   strings, template interpolations and comments, and match braces honestly. */

/* index of the '}' closing the '{' at `open`, or -1 */
function matchBrace(src, open) {
  let depth = 0, i = open;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (c === '/' && n === '/') { const e = src.indexOf('\n', i); i = e === -1 ? src.length : e; continue; }
    if (c === '/' && n === '*') { const e = src.indexOf('*/', i); i = e === -1 ? src.length : e + 2; continue; }
    if (c === '"' || c === "'") { i = skipQuoted(src, i) ; continue; }
    if (c === '`') { i = skipTemplate(src, i); continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
    i++;
  }
  return -1;
}

/* index just past a '...' or "..." string starting at `i` */
function skipQuoted(src, i) {
  const q = src[i];
  let j = i + 1;
  while (j < src.length) {
    if (src[j] === '\\') { j += 2; continue; }
    if (src[j] === q) break;
    j++;
  }
  return j + 1;
}

/* index just past a `...` template literal starting at `i`, interpolations included */
function skipTemplate(src, i) {
  let j = i + 1;
  while (j < src.length) {
    if (src[j] === '\\') { j += 2; continue; }
    if (src[j] === '`') break;
    if (src[j] === '$' && src[j + 1] === '{') {
      const close = matchBrace(src, j + 1);
      if (close === -1) break;
      j = close + 1;
      continue;
    }
    j++;
  }
  return j + 1;
}

/* the top-level keys of an object literal body (text between its braces) */
function topKeys(body) {
  const keys = [];
  let i = 0, depth = 0, expectKey = true;
  const readIdent = at => { let j = at; while (j < body.length && /[\w$]/.test(body[j])) j++; return j; };
  const afterSpace = at => { let m = at; while (m < body.length && /\s/.test(body[m])) m++; return m; };

  while (i < body.length) {
    const c = body[i], n = body[i + 1];
    if (c === '/' && n === '/') { const e = body.indexOf('\n', i); i = e === -1 ? body.length : e; continue; }
    if (c === '/' && n === '*') { const e = body.indexOf('*/', i); i = e === -1 ? body.length : e + 2; continue; }
    if (c === '"' || c === "'") {
      const end = skipQuoted(body, i);
      if (depth === 0 && expectKey) {           /* a quoted key, e.g. 'az': ... */
        const k = body.slice(i + 1, end - 1);
        if (body[afterSpace(end)] === ':') { keys.push(k); expectKey = false; }
      }
      i = end; continue;
    }
    if (c === '`') { i = skipTemplate(body, i); continue; }
    if (c === '{' || c === '(' || c === '[') { depth++; i++; continue; }
    if (c === '}' || c === ')' || c === ']') { depth--; i++; continue; }
    if (c === ',' && depth === 0) { expectKey = true; i++; continue; }
    if (depth === 0 && expectKey && /[A-Za-z_$]/.test(c)) {
      const end = readIdent(i);
      const colon = afterSpace(end);
      if (body[colon] === ':') { keys.push(body.slice(i, end)); expectKey = false; i = colon + 1; continue; }
      i = end; continue;
    }
    i++;
  }
  return keys;
}

/* every translation object in js/: a literal whose top-level keys are ONLY az/en/ru.
   Requiring "only" keeps ordinary objects that merely contain a translation out. */
function scanTranslations() {
  const found = [];
  for (const f of fs.readdirSync(JS).filter(x => x.endsWith('.js')).sort()) {
    const src = fs.readFileSync(path.join(JS, f), 'utf8');
    for (let i = 0; i < src.length; i++) {
      if (src[i] !== '{') continue;
      const close = matchBrace(src, i);
      if (close === -1) continue;
      const body = src.slice(i + 1, close);
      const keys = topKeys(body);
      if (!keys.length) continue;
      if (!keys.some(k => LANGS.includes(k))) continue;
      if (keys.some(k => !LANGS.includes(k))) continue;
      found.push({
        file: f,
        line: src.slice(0, i).split('\n').length,
        keys,
        missing: LANGS.filter(l => !keys.includes(l)),
        snip: body.slice(0, 64).replace(/\s+/g, ' ').trim()
      });
      i = close;
    }
  }
  return found;
}

group('every string carries all three languages');
const all = scanTranslations();
/* a floor, so a scanner that silently stops matching cannot pass as "all complete" */
ok('the scanner finds the inline strings (expected 700+)', all.length >= 700, 'found ' + all.length);

const incomplete = all.filter(t => t.missing.length);
ok('no string is missing az, en or ru', incomplete.length === 0,
  incomplete.length + ' incomplete, first: ' +
  incomplete.slice(0, 8).map(t => `${t.file}:${t.line} missing[${t.missing}] ${t.snip}`).join(' | '));

/* per-file totals, so the output says where the strings actually live */
const byFile = {};
all.forEach(t => { byFile[t.file] = (byFile[t.file] || 0) + 1; });
console.log('        ' + Object.keys(byFile).sort().map(f => f.replace('.js', '') + ' ' + byFile[f]).join(' · '));

group('the scanner really can fail');
/* prove it on synthetic sources, so a broken scanner cannot quietly report success */
const probe = body => {
  const keys = topKeys(body);
  return LANGS.filter(l => !keys.includes(l));
};
ok('a complete object passes', probe("az: 'a', en: 'b', ru: 'c'").length === 0);
ok('a missing ru is caught', probe("az: 'a', en: 'b'").join() === 'ru');
ok('a missing az is caught', probe("en: 'b', ru: 'c'").join() === 'az');
ok('quoted keys are understood', probe("'az': 'a', \"en\": 'b', ru: 'c'").length === 0);
ok('a nested brace does not hide a key',
  probe("az: `x ${ { a: 1 } } y`, en: 'b', ru: 'c'").length === 0);
ok('a colon inside a template is not read as a key',
  probe("az: `font:700 12px`, en: 'b'").join() === 'ru');
ok('a comma inside an interpolation does not split keys',
  probe("az: `${ f(1, 2) }`, en: 'b', ru: 'c'").length === 0);

/* ── the language helpers, loaded from the real js/i18n.js ── */
const sandbox = { document: { documentElement: {} }, console };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(JS, 'i18n.js'), 'utf8'), sandbox, { filename: 'i18n.js' });
vm.runInContext('globalThis.__x = { EQI, TX, RUP, UPC, AZD };', sandbox);
const { EQI, TX, RUP, UPC, AZD } = sandbox.__x;

group('TX picks the active language');
const s3 = { az: 'Salam', en: 'Hello', ru: 'Привет' };
EQI.set('az'); ok('az selected', TX(s3) === 'Salam');
EQI.set('en'); ok('en selected', TX(s3) === 'Hello');
EQI.set('ru'); ok('ru selected', TX(s3) === 'Привет');
ok('an unknown language falls back to az', (EQI.set('de'), EQI.lang) === 'az');
ok('a plain string passes through', TX('plain') === 'plain');
ok('null survives', TX(null) === null);
EQI.set('ru');
ok('a missing key falls back to en rather than undefined',
  TX({ az: 'A', en: 'E' }) === 'E');
EQI.set('az');

group('EQI.deep localizes a question without touching its machinery');
EQI.set('en');
const fn = () => 'visual';
const deep = EQI.deep({
  text: { az: 'Sual', en: 'Question', ru: 'Вопрос' },
  tag: { az: 'ÜSTÜNƏ', en: 'ADDING', ru: 'ПРИСЧ' },
  answers: [1, 2, 3],
  build: fn,
  nested: { tip: { az: 'İpucu', en: 'Hint', ru: 'Подсказка' } }
});
ok('a leaf becomes a string', deep.text === 'Question');
ok('a nested leaf becomes a string', deep.nested.tip === 'Hint');
ok('an answers array is left alone', Array.isArray(deep.answers) && deep.answers.length === 3);
ok('a visual builder stays callable', typeof deep.build === 'function' && deep.build() === 'visual');
EQI.set('az');

group('RUP — russian plurals');
/* день / дня / дней */
ok('1 день', RUP(1, 'день', 'дня', 'дней') === 'день');
ok('2 дня', RUP(2, 'день', 'дня', 'дней') === 'дня');
ok('5 дней', RUP(5, 'день', 'дня', 'дней') === 'дней');
ok('11 дней (not "день")', RUP(11, 'день', 'дня', 'дней') === 'дней');
ok('12 дней (not "дня")', RUP(12, 'день', 'дня', 'дней') === 'дней');
ok('14 дней', RUP(14, 'день', 'дня', 'дней') === 'дней');
ok('21 день', RUP(21, 'день', 'дня', 'дней') === 'день');
ok('22 дня', RUP(22, 'день', 'дня', 'дней') === 'дня');
ok('25 дней', RUP(25, 'день', 'дня', 'дней') === 'дней');
ok('101 день', RUP(101, 'день', 'дня', 'дней') === 'день');
ok('111 дней', RUP(111, 'день', 'дня', 'дней') === 'дней');
ok('0 дней', RUP(0, 'день', 'дня', 'дней') === 'дней');

group('AZD — azerbaijani ablative, by vowel harmony');
/* back vowels take -dan, front vowels take -dən; the suffix follows the spoken word */
ok('6 → altıdan', AZD(6) === 'dan');
ok('9 → doqquzdan', AZD(9) === 'dan');
ok('7 → yeddidən', AZD(7) === 'dən');
ok('5 → beşdən', AZD(5) === 'dən');
ok('10 → ondan', AZD(10) === 'dan');
ok('30 → otuzdan', AZD(30) === 'dan');
ok('40 → qırxdan', AZD(40) === 'dan');
ok('60 → altmışdan', AZD(60) === 'dan');
ok('90 → doxsandan', AZD(90) === 'dan');
ok('20 → iyirmidən', AZD(20) === 'dən');
ok('50 → əllidən', AZD(50) === 'dən');
ok('70 → yetmişdən', AZD(70) === 'dən');
ok('80 → səksəndən', AZD(80) === 'dən');
ok('100 → yüzdən', AZD(100) === 'dən');
ok('16 → on altıdan', AZD(16) === 'dan');
ok('12 → on ikidən', AZD(12) === 'dən');

group('UPC — locale-aware uppercase');
EQI.set('az');
ok('az: i → İ (dotted, not I)', UPC('i') === 'İ', 'got ' + UPC('i'));
ok('az: "bilik" → "BİLİK"', UPC('bilik') === 'BİLİK', 'got ' + UPC('bilik'));
EQI.set('en');
ok('en: i → I', UPC('i') === 'I');
EQI.set('ru');
ok('ru: "лес" → "ЛЕС"', UPC('лес') === 'ЛЕС');
EQI.set('az');

group('the language list itself');
ok('exactly three languages', EQI.langs.length === 3);
ok('az / en / ru, in that order', EQI.langs.join(',') === 'az,en,ru');
ok('az is the default', (vm.runInContext('EQI.lang', sandbox), true) && EQI.langs[0] === 'az');

console.log('\n' + (fail
  ? 'FAILED ' + fail + ' of ' + (pass + fail) + ' checks'
  : 'ALL ' + pass + ' CHECKS PASSED'));
process.exit(fail ? 1 : 0);
