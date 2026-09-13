/* EduQuest — i18n core: az / en / ru.
   Strings live next to their screens as {az,en,ru} objects; TX() picks the active language. */
const EQI = {
  langs: ['az', 'en', 'ru'],
  lang: 'az',

  set(l) {
    if (this.langs.indexOf(l) === -1) l = 'az';
    this.lang = l;
    document.documentElement.lang = l;
  },

  /* resolve one {az,en,ru} object (strings pass through untouched) */
  x(v) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return v[this.lang] !== undefined ? v[this.lang] : v.en;
    }
    return v;
  },

  /* deep-localize a question object: {az,en,ru} leaves become strings,
     functions (visual builders) and arrays (answers) pass through */
  deep(o) {
    if (o == null || typeof o !== 'object') return o;
    if (Array.isArray(o)) return o;
    if ('az' in o || 'en' in o || 'ru' in o) return this.x(o);
    const out = {};
    for (const k in o) {
      const v = o[k];
      out[k] = (typeof v === 'function') ? v : this.deep(v);
    }
    return out;
  }
};

const TX = v => EQI.x(v);

/* russian plural picker: RUP(2, 'печать', 'печати', 'печатей') */
function RUP(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

/* locale-aware uppercase (azerbaijani i → İ) */
function UPC(s) {
  return String(s).toLocaleUpperCase(EQI.lang);
}

/* azerbaijani ablative suffix for a number written in digits: 6-dan, 7-dən, 15-dən…
   vowel harmony follows the spoken number word (altı→dan, yeddi→dən, on→dan) */
function AZD(n) {
  const last = n % 10;
  if (last === 6 || last === 9) return 'dan';
  if (last === 0) {
    const tens = n % 100;
    return (tens === 10 || tens === 30 || tens === 40 || tens === 60 || tens === 90) ? 'dan' : 'dən';
  }
  return 'dən';
}
