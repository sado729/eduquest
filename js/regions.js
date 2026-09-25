/* EduQuest — the four regions beyond Knowledge Forest, and the questions that live there.

   Why this file exists: the map has always shown Söz Vadisi, Elm Adası, Kosmik Stansiya
   and Sirli Qala, and for a long time there was nothing behind any of them. The question
   pool was math and logic only, so the regions were pictures with a lock — and Söz
   Vadisi even promised to open "after today's adventure", which it never did.

   Each region is one subject:
     valley  · Söz Vadisi       · Oxu (reading)     · opens after the first boss
     island  · Elm Adası        · Elm (science)     · Level 10
     station · Kosmik Stansiya  · Elm · kosmos      · Level 15
     castle  · Sirli Qala       · Məntiq (riddles)  · Level 20

   A region question is an ordinary question in every way the rest of the game cares
   about: same fields as the forest ones, same hint → tutor → easier ladder, and it ends
   in EQ.resolve(). Two things are new, both small:

   1. `topic` — the tracking key, set directly. The forest questions are still filed by
      their tag (EQT.topicKey reads the tag), but a tag is display text and there are
      now fourteen more of them; naming the topic outright is sturdier.

   2. answers that depend on the language. "Which letter does 🍎 start with?" is A in
      Azerbaijani and English and Я in Russian, so `answers` / `correct` may be
      {az,en,ru} objects instead of plain values. EQD.qa(q) resolves them, and every
      place that reads answers goes through it. Picture answers (🐟, 🌍) stay plain.

   Emoji are kept to Unicode 11 (2018) or older: the game runs as a TWA on whatever
   Android a family has, and a newer emoji draws as an empty box on an older phone —
   which, as a quiz answer, is a question the child cannot read. test/regions.js
   guards it. */

/* ── resolving language-dependent answers ── */
EQD.qa = function (q) {
  return { answers: TX(q.answers), correct: TX(q.correct) };
};

EQD._subjReading = { az: 'Oxu', en: 'Reading', ru: 'Чтение' };
EQD._subjScience = { az: 'Elm', en: 'Science', ru: 'Наука' };

/* the three languages, each built by the same function */
EQD._L3 = function (f) { return { az: f('az'), en: f('en'), ru: f('ru') }; };

/* azerbaijani needs its own capitals: i → İ, ı → I */
EQD._up = function (w, l) {
  return l === 'az' ? String(w).replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase() : String(w).toUpperCase();
};
EQD._letters = function (w, l) { return Array.from(EQD._up(w, l)); };

/* an answer drawn big (a picture, a number, a letter) rather than set as words */
EQD.isShort = function (v) {
  const letters = String(v == null ? '' : v).match(/\p{L}/gu);
  return !letters || letters.length <= 2;
};

/* ── a deck per set ──
   A mission is eight questions on one topic, and a fact bank has about a dozen facts,
   so drawing at random would ask the same thing twice in one sitting. Each set builds
   its own seeded `ri`, so the cards already dealt are remembered per `ri` — a new set
   gets a fresh deck, and the same set rebuilt from the same seed deals the same cards.
   The gentler step-down questions draw from a deck of their own (`deck(…, true)`), or
   eight questions plus eight step-downs would run a dozen-card bank dry halfway. */
EQD._deck = function (key, easier) { return easier ? key + ':easy' : key; };
EQD._decks = new WeakMap();
EQD._pick = function (ri, key, list) {
  let m = EQD._decks.get(ri);
  if (!m) { m = {}; EQD._decks.set(ri, m); }
  const used = m[key] || (m[key] = []);
  let free = list.filter(x => used.indexOf(x) < 0);
  if (!free.length) { used.length = 0; free = list.slice(); }
  const x = free[ri(0, free.length - 1)];
  used.push(x);
  return x;
};

/* ── visual builders ── */
EQD.vPic = function (emoji, h) {
  const size = h || 104;
  return `<div style="margin-top:14px;height:${size}px;border-radius:22px;background:#E4F6FF;display:flex;align-items:center;justify-content:center;font-size:${Math.round(size * 0.6)}px;line-height:1">${emoji}</div>`;
};

/* one letter per tile; `hide` is the index drawn as the empty, glowing box */
EQD.vTiles = function (letters, hide) {
  const cells = letters.map((ch, i) => i === hide
    ? `<div class="btf" style="flex:1;max-width:52px;height:54px;border-radius:16px;background:rgba(123,92,255,0.18);box-shadow:0 0 0 2.5px #7B5CFF inset;display:flex;align-items:center;justify-content:center;font:800 22px 'Baloo 2', system-ui;--fs:22px;--bz:1.2;color:#7B5CFF">?</div>`
    : `<div class="btf" style="flex:1;max-width:52px;height:54px;border-radius:16px;background:#7B5CFF;box-shadow:0 4px 0 #5B3FD6;display:flex;align-items:center;justify-content:center;font:800 22px 'Baloo 2', system-ui;--fs:22px;--bz:1.2;color:#fff">${ch}</div>`).join('');
  return `<div style="margin-top:12px;display:flex;gap:6px;justify-content:center">${cells}</div>`;
};

/* a picture and the word under it, side by side (the word may have a gap) */
EQD.vPicTiles = function (emoji, letters, hide) {
  return `<div style="margin-top:12px;display:flex;align-items:center;gap:12px">
    <div style="flex:none;width:84px;height:84px;border-radius:22px;background:#E4F6FF;display:flex;align-items:center;justify-content:center;font-size:50px;line-height:1">${emoji}</div>
    <div style="flex:1;min-width:0">${EQD.vTiles(letters, hide).replace('margin-top:12px;', '')}</div>
  </div>`;
};

/* a big word, the way a reading card shows it */
EQD.vWord = function (word) {
  return `<div style="margin-top:14px;height:84px;border-radius:22px;background:#FBE9CC;display:flex;align-items:center;justify-content:center;font:800 40px 'Baloo 2', system-ui;color:#2A1F45;letter-spacing:3px">${word}</div>`;
};

/* a row of pictures ending in the one to find */
EQD.vSeq = function (items, askLast) {
  const cells = items.map((it, i) => (askLast && i === items.length - 1)
    ? `<div style="flex:1;height:50px;border-radius:14px;background:rgba(255,138,76,0.16);box-shadow:0 0 0 2.5px #FF8A4C inset;display:flex;align-items:center;justify-content:center;font:800 20px 'Baloo 2';color:#E06327">?</div>`
    : `<div style="flex:1;height:50px;border-radius:14px;background:#fff;box-shadow:0 3px 0 #E0C79A;display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1">${it}</div>`).join('');
  return `<div style="margin-top:14px;display:flex;gap:5px">${cells}</div>`;
};

/* the choices of a question with one of them struck out (the fact hint) */
EQD.vStrike = function (opts, out) {
  const cells = opts.map(o => {
    const gone = o === out;
    const big = EQD.isShort(o);
    return `<div class="btf" style="flex:1;min-height:64px;padding:6px;border-radius:18px;background:${gone ? '#F1E6D2' : '#fff'};box-shadow:0 4px 0 ${gone ? '#E0D2B8' : '#C9BCA6'};display:flex;align-items:center;justify-content:center;text-align:center;font:800 ${big ? 30 : 14}px 'Baloo 2', system-ui;--fs:${big ? 30 : 14}px;--bz:${big ? 1.1 : 1.2};color:#2A1F45;line-height:1.15;${gone ? 'opacity:0.45;text-decoration:line-through;' : ''}position:relative">${o}${gone ? '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 40px Nunito;color:#E06327">✕</div>' : ''}</div>`;
  }).join('');
  return `<div style="margin-top:16px;display:flex;gap:8px">${cells}</div>`;
};

/* ── the regions ── */
EQD.REGION_LEN = 5;
EQD.REGION_BONUS = 30;
EQD.REGION_ORDER = ['valley', 'island', 'station', 'castle'];
EQD.REGIONS = {
  valley: {
    subj: 'reading', topics: ['letter', 'word', 'missing', 'build'], level: 1, trophy: 1,
    name: { az: 'Söz Vadisi', en: 'Word Valley', ru: 'Долина Слов' },
    blurb: {
      az: 'Danışan hərflər, gizli sözlər və şəkillərdən qurulan sözlər.',
      en: 'Talking letters, hidden words and words built from pictures.',
      ru: 'Говорящие буквы, спрятанные слова и слова из картинок.'
    },
    hello: {
      az: 'Hərflər bu vadidə yaşayır — gəl onlarla dostlaşaq!',
      en: 'Letters live in this valley — let’s make friends with them!',
      ru: 'В этой долине живут буквы — давай с ними подружимся!'
    },
    lock: {
      az: 'Söz Vadisi ilk bossu məğlub edəndə açılır.',
      en: 'Word Valley opens once you beat your first boss.',
      ru: 'Долина Слов откроется, когда ты победишь первого босса.'
    },
    go: { az: 'Vadiyə gir', en: 'Enter the valley', ru: 'Войти в долину' },
    dark: '#10324A', accent: '#45C6F0', ink: '#06303F', soft: '#A5DCF0'
  },
  island: {
    subj: 'science', topics: ['animals', 'body', 'nature', 'matter'], level: 10,
    name: { az: 'Elm Adası', en: 'Science Island', ru: 'Остров Науки' },
    blurb: {
      az: 'Qaynayan iksirlər, maraqlı heyvanlar və yalnız sən tapanda işləyən maşınlar.',
      en: 'Bubbling potions, curious animals and machines that only work when you figure them out.',
      ru: 'Бурлящие зелья, любопытные звери и машины, которые работают, только когда ты их разгадаешь.'
    },
    hello: {
      az: 'Adada hər şey sual verir — cavablar isə səndədir.',
      en: 'Everything on this island asks a question — and you have the answers.',
      ru: 'На этом острове всё задаёт вопросы — а ответы у тебя.'
    },
    go: { az: 'Adaya üz', en: 'Sail to the island', ru: 'Плыви к острову' },
    dark: '#0E2A38', accent: '#45C6F0', ink: '#06303F', soft: '#A5DCF0'
  },
  station: {
    subj: 'science', topics: ['planets', 'sky', 'astro'], level: 15,
    name: { az: 'Kosmik Stansiya', en: 'Space Station', ru: 'Космическая Станция' },
    blurb: {
      az: 'Planetlər, ulduzlar və raketlər — kosmosun sirlərini aç.',
      en: 'Planets, stars and rockets — unlock the secrets of space.',
      ru: 'Планеты, звёзды и ракеты — раскрой тайны космоса.'
    },
    hello: {
      az: 'Kosmik stansiyaya xoş gəldin! Kəmərləri bağla.',
      en: 'Welcome aboard the space station! Buckle up.',
      ru: 'Добро пожаловать на космическую станцию! Пристегнись.'
    },
    go: { az: 'Stansiyaya uç', en: 'Fly to the station', ru: 'Лететь на станцию' },
    dark: '#1B1640', accent: '#9B7CFF', ink: '#fff', soft: '#C9BCEF'
  },
  castle: {
    subj: 'logic', topics: ['odd', 'riddle', 'seq'], level: 20,
    name: { az: 'Sirli Qala', en: 'Mystery Castle', ru: 'Замок Тайн' },
    blurb: {
      az: 'Tapmacalar, gizli naxışlar və artıq əşyalar — qalanın qapıları yalnız ağıla açılır.',
      en: 'Riddles, hidden patterns and odd ones out — the castle doors open only to clever minds.',
      ru: 'Загадки, тайные узоры и лишние предметы — ворота замка открываются только смекалке.'
    },
    hello: {
      az: 'Qalanın hər qapısında bir tapmaca var. Hazırsan?',
      en: 'Every castle door hides a puzzle. Ready?',
      ru: 'За каждой дверью замка — головоломка. Готов?'
    },
    go: { az: 'Qalaya gir', en: 'Enter the castle', ru: 'Войти в замок' },
    dark: '#2A1733', accent: '#FF8A4C', ink: '#3A1604', soft: '#F5C6A8'
  }
};

/* which region a topic belongs to (forest topics have none) */
EQD.regionOf = function (topic) {
  for (const r in EQD.REGIONS) if (EQD.REGIONS[r].topics.indexOf(topic) >= 0) return r;
  return null;
};

/* ── the two helmets the regions give ──
   The wardrobe always showed a Diver Helm and a Space Helm as locked cards, with nothing
   anywhere that could open them. Each now belongs to its region: the first full round
   there (all five questions) puts it in the wardrobe, and `flag` is where the state
   keeps it — the same shape as wizardHatOwned / crownOwned. `key` is the hero's hat key
   (EQC.hero draws it) and is appended to EQX.HAT, so its number in a code never moves. */
EQD.HELMS = [
  {
    key: 'diver', region: 'island', flag: 'diverHelmOwned', mark: '🌊',
    name: { az: 'Dalğıc Dəbilqəsi', en: 'Diver Helm', ru: 'Шлем Водолаза' },
    note: { az: 'Elm Adasında 1 raund', en: '1 round on Science Island', ru: '1 раунд на Острове Науки' },
    how: {
      az: 'Elm Adasında bir tam raund (5 sual) bitir — Dalğıc Dəbilqəsi sənin olacaq! 🌊',
      en: 'Finish one full round (5 questions) on Science Island and the Diver Helm is yours! 🌊',
      ru: 'Пройди один полный раунд (5 вопросов) на Острове Науки — и Шлем Водолаза твой! 🌊'
    },
    shut: {
      az: 'Dalğıc Dəbilqəsi Elm Adasındadır: ada 10-cu səviyyədə açılır, orada bir tam raund bitir. 🌊',
      en: 'The Diver Helm waits on Science Island: the island opens at Level 10 — finish one full round there. 🌊',
      ru: 'Шлем Водолаза ждёт на Острове Науки: остров откроется на 10-м уровне — пройди там один полный раунд. 🌊'
    },
    got: { az: 'Dalğıc Dəbilqəsi qarderobuna əlavə olundu! 🌊', en: 'Diver Helm added to your wardrobe! 🌊', ru: 'Шлем Водолаза добавлен в гардероб! 🌊' }
  },
  {
    key: 'space', region: 'station', flag: 'spaceHelmOwned', mark: '🚀',
    name: { az: 'Kosmik Dəbilqə', en: 'Space Helm', ru: 'Космошлем' },
    note: { az: 'Kosmik Stansiyada 1 raund', en: '1 round at the Space Station', ru: '1 раунд на Космостанции' },
    how: {
      az: 'Kosmik Stansiyada bir tam raund (5 sual) bitir — Kosmik Dəbilqə sənin olacaq! 🚀',
      en: 'Finish one full round (5 questions) at the Space Station and the Space Helm is yours! 🚀',
      ru: 'Пройди один полный раунд (5 вопросов) на Космической Станции — и Космошлем твой! 🚀'
    },
    shut: {
      az: 'Kosmik Dəbilqə Kosmik Stansiyadadır: stansiya 15-ci səviyyədə açılır, orada bir tam raund bitir. 🚀',
      en: 'The Space Helm waits at the Space Station: it opens at Level 15 — finish one full round there. 🚀',
      ru: 'Космошлем ждёт на Космической Станции: она откроется на 15-м уровне — пройди там один полный раунд. 🚀'
    },
    got: { az: 'Kosmik Dəbilqə qarderobuna əlavə olundu! 🚀', en: 'Space Helm added to your wardrobe! 🚀', ru: 'Космошлем добавлен в гардероб! 🚀' }
  }
];
EQD.HELM_BY = {};
EQD.HELMS.forEach(h => { EQD.HELM_BY[h.key] = h; });
EQD.helmOf = r => EQD.HELMS.find(h => h.region === r) || null;

/* the per-topic labels a question carries */
EQD.RTAG = {
  letter: { az: 'OXU · İLK HƏRF', en: 'READING · FIRST LETTERS', ru: 'ЧТЕНИЕ · ПЕРВАЯ БУКВА' },
  word: { az: 'OXU · SÖZÜ OXU', en: 'READING · READ THE WORD', ru: 'ЧТЕНИЕ · ПРОЧТИ СЛОВО' },
  missing: { az: 'OXU · ƏSKİK HƏRF', en: 'READING · MISSING LETTER', ru: 'ЧТЕНИЕ · ПРОПУЩЕННАЯ БУКВА' },
  build: { az: 'OXU · SÖZ QUR', en: 'READING · BUILD A WORD', ru: 'ЧТЕНИЕ · СОБЕРИ СЛОВО' },
  animals: { az: 'ELM · HEYVANLAR', en: 'SCIENCE · ANIMALS', ru: 'НАУКА · ЖИВОТНЫЕ' },
  body: { az: 'ELM · BƏDƏN VƏ HİSSLƏR', en: 'SCIENCE · BODY & SENSES', ru: 'НАУКА · ТЕЛО И ЧУВСТВА' },
  nature: { az: 'ELM · TƏBİƏT', en: 'SCIENCE · NATURE', ru: 'НАУКА · ПРИРОДА' },
  matter: { az: 'ELM · MADDƏLƏR', en: 'SCIENCE · MATERIALS', ru: 'НАУКА · ВЕЩЕСТВА' },
  planets: { az: 'KOSMOS · PLANETLƏR', en: 'SPACE · PLANETS', ru: 'КОСМОС · ПЛАНЕТЫ' },
  sky: { az: 'KOSMOS · GÜNDÜZ VƏ GECƏ', en: 'SPACE · DAY & NIGHT', ru: 'КОСМОС · ДЕНЬ И НОЧЬ' },
  astro: { az: 'KOSMOS · KOSMONAVTLAR', en: 'SPACE · ASTRONAUTS', ru: 'КОСМОС · КОСМОНАВТЫ' },
  odd: { az: 'MƏNTİQ · ARTIĞI TAP', en: 'LOGIC · ODD ONE OUT', ru: 'ЛОГИКА · НАЙДИ ЛИШНЕЕ' },
  riddle: { az: 'MƏNTİQ · TAPMACALAR', en: 'LOGIC · RIDDLES', ru: 'ЛОГИКА · ЗАГАДКИ' },
  seq: { az: 'MƏNTİQ · ŞƏKİL NAXIŞLARI', en: 'LOGIC · PICTURE PATTERNS', ru: 'ЛОГИКА · УЗОРЫ ИЗ КАРТИНОК' }
};

/* the fields every region question shares */
EQD._rBase = function (topic) {
  const r = EQD.regionOf(topic);
  const subj = EQD.REGIONS[r].subj;
  return {
    topic: topic, subj: subj, tag: EQD.RTAG[topic],
    subject: subj === 'reading' ? EQD._subjReading : subj === 'science' ? EQD._subjScience : EQD._subjLogic,
    meta: EQD._metaCalm
  };
};

/* ════════════════════════════ Söz Vadisi · Oxu ════════════════════════════ */

/* picture words: id, emoji, az, en, ru */
EQD.WORDS = [
  ['apple', '🍎', 'alma', 'apple', 'яблоко'], ['fish', '🐟', 'balıq', 'fish', 'рыба'],
  ['cat', '🐱', 'pişik', 'cat', 'кошка'], ['dog', '🐶', 'it', 'dog', 'собака'],
  ['sun', '☀️', 'günəş', 'sun', 'солнце'], ['moon', '🌙', 'ay', 'moon', 'луна'],
  ['star', '⭐', 'ulduz', 'star', 'звезда'], ['house', '🏠', 'ev', 'house', 'дом'],
  ['tree', '🌳', 'ağac', 'tree', 'дерево'], ['flower', '🌷', 'çiçək', 'flower', 'цветок'],
  ['car', '🚗', 'maşın', 'car', 'машина'], ['ball', '⚽', 'top', 'ball', 'мяч'],
  ['book', '📖', 'kitab', 'book', 'книга'], ['bird', '🐦', 'quş', 'bird', 'птица'],
  ['milk', '🥛', 'süd', 'milk', 'молоко'], ['bread', '🍞', 'çörək', 'bread', 'хлеб'],
  ['key', '🔑', 'açar', 'key', 'ключ'], ['horse', '🐴', 'at', 'horse', 'лошадь'],
  ['bear', '🐻', 'ayı', 'bear', 'медведь'], ['frog', '🐸', 'qurbağa', 'frog', 'лягушка'],
  ['lemon', '🍋', 'limon', 'lemon', 'лимон'], ['grapes', '🍇', 'üzüm', 'grapes', 'виноград'],
  ['melon', '🍉', 'qarpız', 'watermelon', 'арбуз'], ['duck', '🦆', 'ördək', 'duck', 'утка'],
  ['cow', '🐮', 'inək', 'cow', 'корова'], ['snake', '🐍', 'ilan', 'snake', 'змея'],
  ['mouse', '🐭', 'siçan', 'mouse', 'мышь'], ['banana', '🍌', 'banan', 'banana', 'банан'],
  ['egg', '🥚', 'yumurta', 'egg', 'яйцо'], ['boat', '⛵', 'qayıq', 'boat', 'лодка'],
  ['cloud', '☁️', 'bulud', 'cloud', 'облако'], ['lion', '🦁', 'şir', 'lion', 'лев'],
  ['owl', '🦉', 'bayquş', 'owl', 'сова'], ['rabbit', '🐰', 'dovşan', 'rabbit', 'заяц'],
  ['elephant', '🐘', 'fil', 'elephant', 'слон'], ['carrot', '🥕', 'yerkökü', 'carrot', 'морковь'],
  ['tomato', '🍅', 'pomidor', 'tomato', 'помидор'], ['clock', '⏰', 'saat', 'clock', 'часы'],
  ['door', '🚪', 'qapı', 'door', 'дверь'], ['umbrella', '☂️', 'çətir', 'umbrella', 'зонт'],
  ['bee', '🐝', 'arı', 'bee', 'пчела'], ['turtle', '🐢', 'tısbağa', 'turtle', 'черепаха'],
  ['pear', '🍐', 'armud', 'pear', 'груша'], ['cake', '🎂', 'tort', 'cake', 'торт'],
  ['drum', '🥁', 'təbil', 'drum', 'барабан'], ['hat', '🎩', 'papaq', 'hat', 'шляпа']
].map(a => ({ id: a[0], e: a[1], w: { az: a[2], en: a[3], ru: a[4] } }));

/* letters a distractor may be drawn from; vowels, so a hidden vowel is swapped for a vowel */
EQD._ABC = {
  az: Array.from('ABCÇDEƏFGHXIİJKQLMNOÖPRSŞTUÜVYZ'),
  en: Array.from('ABCDEFGHIJKLMNOPRSTUVWY'),
  ru: Array.from('АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ')
};
EQD._VOW = { az: Array.from('AEƏIİOÖUÜ'), en: Array.from('AEIOU'), ru: Array.from('АЕИОУЫЭЮЯ') };

/* words whose length (in every language) is inside [lo, hi] */
EQD._wordsLen = function (lo, hi) {
  return EQD.WORDS.filter(it => ['az', 'en', 'ru'].every(l => {
    const n = Array.from(it.w[l]).length;
    return n >= lo && n <= hi;
  }));
};

/* the correct letter plus two others from the same family (vowel ↔ vowel) */
EQD._letterChoices = function (ri, l, correct) {
  const vow = EQD._VOW[l];
  const pool = (vow.indexOf(correct) >= 0 ? vow : EQD._ABC[l].filter(c => vow.indexOf(c) < 0)).filter(c => c !== correct);
  const a = pool[ri(0, pool.length - 1)];
  let b = pool[ri(0, pool.length - 1)];
  for (let k = 0; b === a && k < 12; k++) b = pool[ri(0, pool.length - 1)];
  if (b === a) b = pool.filter(c => c !== a)[0];
  return EQD._shuffleAns(ri, [correct, a, b]);
};

/* first letters of a word as {az,en,ru} answers, for any reading question's fallback */
EQD._firstLetterAnswers = function (ri, it) {
  const first = EQD._L3(l => EQD._letters(it.w[l], l)[0]);
  return { answers: EQD._L3(l => EQD._letterChoices(ri, l, first[l])), correct: first };
};

/* ── İlk hərf: 🍎 → A ── */
EQD._qLetter = function (ri, hard, noEasier) {
  const list = hard ? EQD.WORDS : EQD._wordsLen(2, 6);
  const it = EQD._pick(ri, EQD._deck('words', noEasier), list);
  const W = EQD._L3(l => EQD._up(it.w[l], l));
  const L = EQD._L3(l => EQD._letters(it.w[l], l)[0]);
  const fa = EQD._firstLetterAnswers(ri, it);
  const q = Object.assign(EQD._rBase('letter'), {
    name: { az: 'Hərfin səsi', en: 'The sound of a letter', ru: 'Звук буквы' },
    cardTitle: { az: 'İlk hərfi tap', en: 'Find the first letter', ru: 'Найди первую букву' },
    title: {
      az: 'Bu şəklin adı hansı hərflə başlayır?',
      en: 'Which letter does this picture’s name start with?',
      ru: 'С какой буквы начинается название картинки?'
    },
    visual: () => EQD.vPic(it.e),
    answers: fa.answers, correct: fa.correct,
    tip: {
      az: 'Şəklin adını yavaşca de və ilk səsə qulaq as.',
      en: 'Say the picture’s name slowly and listen to the very first sound.',
      ru: 'Назови картинку медленно и прислушайся к первому звуку.'
    },
    successLine: { az: `${W.az} — ${L.az} ilə başlayır!`, en: `${W.en} starts with ${L.en}!`, ru: `${W.ru} начинается с ${L.ru}!` },
    praise: {
      az: 'İlk səsi eşitdin — oxumaq elə belə başlayır!',
      en: 'You heard the first sound — that’s exactly how reading starts!',
      ru: 'Ты услышал первый звук — именно так и начинается чтение!'
    },
    hint: {
      heading: { az: 'Az qaldı! Gəl birlikdə deyək.', en: 'Almost! Let’s say it together.', ru: 'Почти! Давай скажем вместе.' },
      sub: {
        az: `Şəkildəki: ${it.w.az}. Sözü yavaşca de — ilk hansı səs gəlir?`,
        en: `The picture is: ${it.w.en}. Say it slowly — which sound comes first?`,
        ru: `На картинке: ${it.w.ru}. Скажи медленно — какой звук первый?`
      },
      panelTitle: { az: 'Sözü hərf-hərf gör', en: 'See the word letter by letter', ru: 'Посмотри на слово по буквам' },
      body: () => EQD.vTiles(Array.from(TX(W)), 0),
      note: { az: 'Birinci qutuya hansı hərf yazılır?', en: 'Which letter goes in the first box?', ru: 'Какая буква стоит в первой клетке?' }
    },
    explain: {
      title: { az: 'Hər söz bir hərflə başlayır.', en: 'Every word starts with a letter.', ru: 'Каждое слово начинается с буквы.' },
      text: {
        az: `«${W.az}» sözünü de və ilk səsi uzat. Onu yazanda ${L.az} hərfini yazırıq.`,
        en: `Say “${W.en}” and stretch the first sound. When we write it, we write the letter ${L.en}.`,
        ru: `Скажи «${W.ru}» и протяни первый звук. На письме это буква ${L.ru}.`
      },
      why: {
        az: 'İlk hərfi tanıyanda yeni sözləri oxumaq çox asanlaşır.',
        en: 'Knowing first letters makes new words much easier to read.',
        ru: 'Когда знаешь первые буквы, новые слова читать гораздо легче.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="font-size:56px;line-height:1;flex:none">${it.e}</div><div style="flex:1"><div style="font:800 24px 'Baloo 2', system-ui;color:#fff;letter-spacing:2px"><span style="color:#FFC24B">${TX(L)}</span>${Array.from(TX(W)).slice(1).join('')}</div><div class="bt" style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: 'Sarı hərf — sözün ilk hərfi.', en: 'The yellow letter is the first one.', ru: 'Жёлтая буква — первая в слове.' })}</div></div></div>`
    }
  });
  /* the step down shows the word with only its first letter gone — the same question
     with the word as scaffolding, so it is still filed under first letters */
  if (!noEasier) q.easier = Object.assign(EQD._qMissing(ri, false, true, 0), { topic: 'letter', tag: EQD.RTAG.letter });
  return q;
};

/* ── Sözü oxu: BALIQ → 🐟 (tap), or match three words to three pictures (pair) ── */
EQD._qWord = function (ri, hard, alt, noEasier) {
  if (alt) return EQD._qWordPair(ri, hard);
  const it = EQD._pick(ri, EQD._deck('words', noEasier), hard ? EQD.WORDS : EQD._wordsLen(2, 6));
  const W = EQD._L3(l => EQD._up(it.w[l], l));
  /* two other pictures per language; a hard question prefers ones whose word starts with
     the same letter, so the child has to read past the first letter to tell them apart */
  const answers = EQD._L3(l => {
    const first = EQD._letters(it.w[l], l)[0];
    const others = EQD.WORDS.filter(x => x !== it);
    const same = others.filter(x => EQD._letters(x.w[l], l)[0] === first);
    const pool = hard && same.length >= 2 ? same : others;
    const a = pool[ri(0, pool.length - 1)];
    let b = pool[ri(0, pool.length - 1)];
    for (let k = 0; b === a && k < 12; k++) b = pool[ri(0, pool.length - 1)];
    if (b === a) b = others.filter(x => x !== a)[0];
    return EQD._shuffleAns(ri, [it.e, a.e, b.e]);
  });
  const q = Object.assign(EQD._rBase('word'), {
    name: { az: 'Söz kartı', en: 'The word card', ru: 'Карточка со словом' },
    cardTitle: { az: 'Sözü oxu', en: 'Read the word', ru: 'Прочитай слово' },
    title: { az: 'Sözü oxu. Hansı şəkildir?', en: 'Read the word. Which picture is it?', ru: 'Прочитай слово. Какая это картинка?' },
    visual: () => EQD.vWord(TX(W)),
    /* the word is the question: Questy's voice must never say it (js/speech.js) */
    hush: [W],
    answers: answers, correct: it.e,
    tip: {
      az: 'Hərfləri bir-bir səslə, sonra birləşdir.',
      en: 'Sound out each letter, then blend them together.',
      ru: 'Произнеси каждую букву, потом соедини их.'
    },
    successLine: { az: `${W.az} — ${it.e}!`, en: `${W.en} — ${it.e}!`, ru: `${W.ru} — ${it.e}!` },
    praise: {
      az: 'Sözü özün oxudun — əsl oxucu!',
      en: 'You read that word all by yourself — a real reader!',
      ru: 'Ты сам прочитал это слово — настоящий читатель!'
    },
    hint: {
      heading: { az: 'Az qaldı! Gəl hərf-hərf oxuyaq.', en: 'Almost! Let’s read it letter by letter.', ru: 'Почти! Давай прочитаем по буквам.' },
      sub: {
        az: 'Hər hərfi ayrıca səslə, sonra hamısını birlikdə de.',
        en: 'Say each letter’s sound, then say them all together.',
        ru: 'Произнеси каждую букву отдельно, а потом всё слово вместе.'
      },
      panelTitle: { az: 'Hərf-hərf', en: 'Letter by letter', ru: 'По буквам' },
      body: () => EQD.vTiles(Array.from(TX(W)), -1),
      note: { az: 'İndi səsləri birləşdir — hansı şəkil yadına düşür?', en: 'Now blend the sounds — which picture does it make you think of?', ru: 'Теперь соедини звуки — какую картинку это напоминает?' }
    },
    explain: {
      title: { az: 'Hərflər birləşib söz olur.', en: 'Letters join up to make a word.', ru: 'Буквы соединяются в слово.' },
      text: {
        az: `Hərfləri birləşdirəndə «${W.az}» alınır — bu, ${it.e} deməkdir.`,
        en: `Blend the letters and you get “${W.en}” — that’s ${it.e}.`,
        ru: `Если соединить буквы, получится «${W.ru}» — это ${it.e}.`
      },
      why: {
        az: 'Hərfləri səsə çevirib birləşdirmək — oxumaq elə budur.',
        en: 'Turning letters into sounds and blending them — that is reading.',
        ru: 'Превращать буквы в звуки и соединять их — это и есть чтение.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="font-size:56px;line-height:1;flex:none">${it.e}</div><div style="flex:1"><div style="font:800 24px 'Baloo 2', system-ui;color:#fff;letter-spacing:2px">${TX(W)}</div><div class="bt" style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${Array.from(TX(W)).join(' · ')}</div></div></div>`
    }
  });
  if (!noEasier) q.easier = EQD._qWord(ri, false, false, true);
  return q;
};

EQD._qWordPair = function (ri, hard) {
  const pool = EQD._wordsLen(2, hard ? 8 : 6);
  const items = [];
  for (let i = 0; i < 3; i++) items.push(EQD._pick(ri, 'words', pool.filter(x => items.indexOf(x) < 0)));
  const rightShown = EQD._shuffleAns(ri, items.map(x => x.e));
  const match = items.map(x => rightShown.indexOf(x.e));
  const words = items.map(x => EQD._L3(l => EQD._up(x.w[l], l)));
  const first = items[0];
  const q = Object.assign(EQD._rBase('word'), {
    kind: 'pair',
    name: { az: 'Söz və şəkil', en: 'Words and pictures', ru: 'Слова и картинки' },
    cardTitle: { az: 'Sözləri şəkillərə bağla', en: 'Join words to pictures', ru: 'Соедини слова с картинками' },
    title: {
      az: 'Hər sözü öz şəkli ilə birləşdir.<br>Əvvəl sözə, sonra şəklə toxun.',
      en: 'Match every word to its picture.<br>Tap a word, then its picture.',
      ru: 'Соедини каждое слово с картинкой.<br>Нажми на слово, потом на картинку.'
    },
    visual: () => '',
    hush: words, /* never read aloud — reading them is the task (js/speech.js) */
    pair: { left: words, rightShown: rightShown, match: match, label: { az: 'Söz — şəkil', en: 'Word — picture', ru: 'Слово — картинка' } },
    answers: EQD._shuffleAns(ri, items.map(x => x.e)), correct: first.e,
    tip: {
      az: 'Hər sözü yavaşca oxu, sonra onun şəklini axtar.',
      en: 'Read each word slowly, then look for its picture.',
      ru: 'Прочитай каждое слово медленно, потом найди его картинку.'
    },
    successLine: { az: 'Bütün sözlər yerini tapdı!', en: 'Every word found its picture!', ru: 'Все слова нашли свои картинки!' },
    praise: {
      az: 'Üç sözü oxudun və heç birini qarışdırmadın.',
      en: 'You read three words and didn’t mix up a single one.',
      ru: 'Ты прочитал три слова и ни одного не перепутал.'
    },
    hint: {
      heading: { az: 'Az qaldı! Bir sözlə başlayaq.', en: 'Almost! Let’s start with one word.', ru: 'Почти! Начнём с одного слова.' },
      sub: {
        az: `${EQD._up(first.w.az, 'az')} — bu, ${first.e} deməkdir. Qalanlarını da belə hərf-hərf oxu.`,
        en: `${EQD._up(first.w.en, 'en')} means ${first.e}. Read the others letter by letter the same way.`,
        ru: `${EQD._up(first.w.ru, 'ru')} — это ${first.e}. Остальные прочитай так же, по буквам.`
      },
      panelTitle: { az: 'Hərf-hərf', en: 'Letter by letter', ru: 'По буквам' },
      body: () => EQD.vPicTiles(first.e, EQD._letters(first.w[EQI.lang] || first.w.en, EQI.lang), -1),
      note: { az: 'Bir söz — bir şəkil. İkisini birdən seçmə.', en: 'One word, one picture. Never two at once.', ru: 'Одно слово — одна картинка.' }
    },
    explain: {
      title: { az: 'Hər sözün öz şəkli var.', en: 'Every word has its own picture.', ru: 'У каждого слова своя картинка.' },
      text: {
        az: 'Sözü hərf-hərf oxu, səsləri birləşdir və gözünün önünə gətir. Beyninə gələn şəkil — cavabdır.',
        en: 'Read the word letter by letter, blend the sounds and picture it. The picture in your head is the answer.',
        ru: 'Прочитай слово по буквам, соедини звуки и представь его. Картинка в голове — это ответ.'
      },
      why: {
        az: 'Oxuyarkən sözü təsəvvür etmək mətni başa düşməyin açarıdır.',
        en: 'Picturing words as you read is the key to understanding stories.',
        ru: 'Представлять слова во время чтения — ключ к пониманию текста.'
      },
      visual: () => `<div style="display:flex;flex-direction:column;gap:6px">${items.map((x, i) => `<div style="display:flex;align-items:center;gap:10px"><span style="font-size:26px;line-height:1">${x.e}</span><span style="font:800 17px 'Baloo 2', system-ui;color:#fff;letter-spacing:1px">${TX(words[i])}</span></div>`).join('')}</div>`
    }
  });
  q.easier = EQD._qWord(ri, false, false, true);
  return q;
};

/* ── Əskik hərf: B_LIQ ── (`pos` forces the gap, for the gentler step-down) */
EQD._qMissing = function (ri, hard, noEasier, pos) {
  const it = EQD._pick(ri, EQD._deck('words', noEasier), EQD._wordsLen(hard ? 4 : 3, hard ? 8 : 6));
  const letters = EQD._L3(l => EQD._letters(it.w[l], l));
  /* a soft sign or й has no sound of its own to listen for, so it is never the gap */
  const silent = ['Ь', 'Ъ', 'Й'];
  const at = EQD._L3(l => {
    const n = letters[l].length;
    if (pos != null) return Math.min(pos, n - 1);
    let i = hard ? ri(1, n - 1) : ri(0, n - 1);
    for (let k = 0; k < 8 && silent.indexOf(letters[l][i]) >= 0; k++) i = hard ? ri(1, n - 1) : ri(0, n - 1);
    if (silent.indexOf(letters[l][i]) >= 0) i = 0;
    return i;
  });
  const L = EQD._L3(l => letters[l][at[l]]);
  const W = EQD._L3(l => letters[l].join(''));
  const q = Object.assign(EQD._rBase('missing'), {
    name: { az: 'İtmiş hərf', en: 'The lost letter', ru: 'Потерянная буква' },
    cardTitle: { az: 'Əskik hərfi tap', en: 'Find the missing letter', ru: 'Найди пропущенную букву' },
    title: { az: 'Sözdə hansı hərf əskikdir?', en: 'Which letter is missing from the word?', ru: 'Какой буквы не хватает в слове?' },
    visual: () => EQD.vPicTiles(it.e, TX(letters), TX(at)),
    answers: EQD._L3(l => EQD._letterChoices(ri, l, L[l])), correct: L,
    tip: {
      az: 'Şəklin adını yavaşca de və boş qutuya çatanda dayan.',
      en: 'Say the picture’s name slowly and stop when you reach the empty box.',
      ru: 'Произнеси название медленно и остановись на пустой клетке.'
    },
    successLine: { az: `${W.az} — tamamdır!`, en: `${W.en} — complete!`, ru: `${W.ru} — готово!` },
    praise: {
      az: 'Sözün hər səsini eşitdin — əla qulaq!',
      en: 'You heard every sound in the word — great listening!',
      ru: 'Ты услышал каждый звук в слове — отличный слух!'
    },
    hint: {
      heading: { az: 'Az qaldı! Sözü dinləyək.', en: 'Almost! Let’s listen to the word.', ru: 'Почти! Давай послушаем слово.' },
      sub: {
        az: `Şəkildəki: ${it.w.az}. Yavaş-yavaş de və boş yerdə hansı səs olduğuna qulaq as.`,
        en: `The picture is: ${it.w.en}. Say it slowly and listen for the sound in the gap.`,
        ru: `На картинке: ${it.w.ru}. Скажи медленно и прислушайся к звуку на месте пропуска.`
      },
      panelTitle: { az: 'Boşluğun qonşuları', en: 'The gap’s neighbours', ru: 'Соседи пропуска' },
      body: () => EQD.vTiles(TX(letters), TX(at)),
      note: { az: 'Boşluqdan əvvəl və sonra hansı hərflər var?', en: 'Which letters come just before and after the gap?', ru: 'Какие буквы стоят до и после пропуска?' }
    },
    explain: {
      title: { az: 'Hər səsin öz hərfi var.', en: 'Every sound has its letter.', ru: 'У каждого звука своя буква.' },
      text: {
        az: `Tam söz belədir: ${W.az}. Boş yerdə ${L.az} hərfi dayanır.`,
        en: `The whole word is ${W.en}. The gap needs the letter ${L.en}.`,
        ru: `Всё слово — ${W.ru}. На месте пропуска стоит буква ${L.ru}.`
      },
      why: {
        az: 'Sözü səs-səs dinləmək onu düzgün yazmağı da öyrədir.',
        en: 'Listening to each sound in a word helps you spell it too.',
        ru: 'Когда слушаешь каждый звук, легче и писать слово правильно.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="font-size:56px;line-height:1;flex:none">${it.e}</div><div style="flex:1"><div style="font:800 24px 'Baloo 2', system-ui;color:#fff;letter-spacing:2px">${TX(letters).map((c, i) => i === TX(at) ? `<span style="color:#FFC24B">${c}</span>` : c).join('')}</div><div class="bt" style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: 'Sarı hərf boşluğa yerləşdi.', en: 'The yellow letter filled the gap.', ru: 'Жёлтая буква заполнила пропуск.' })}</div></div></div>`
    }
  });
  if (!noEasier) q.easier = EQD._qMissing(ri, false, true, 0);
  return q;
};

/* ── Söz qur: L-A-M-A → ALMA (the put-in-order panel, with letters for tiles) ── */
EQD._qBuild = function (ri, hard, noEasier) {
  const it = EQD._pick(ri, EQD._deck('words', noEasier), noEasier ? EQD._wordsLen(3, 4) : EQD._wordsLen(3, hard ? 6 : 5));
  const sorted = EQD._L3(l => EQD._letters(it.w[l], l));
  /* a shuffle that comes out already spelled (repeated letters make it likelier) is not
     a question, so it is re-dealt, and a last resort rotates the word by one */
  const shown = EQD._L3(l => {
    const want = sorted[l];
    let s = EQD._shuffleAns(ri, want);
    for (let k = 0; k < 6 && s.every((c, i) => c === want[i]); k++) s = EQD._shuffleAns(ri, want);
    if (s.every((c, i) => c === want[i])) s = want.slice(1).concat(want[0]);
    return s;
  });
  const W = EQD._L3(l => sorted[l].join(''));
  const fa = EQD._firstLetterAnswers(ri, it);
  const q = Object.assign(EQD._rBase('build'), {
    kind: 'order',
    name: { az: 'Dağılmış hərflər', en: 'The scattered letters', ru: 'Рассыпанные буквы' },
    cardTitle: { az: 'Sözü qur', en: 'Build the word', ru: 'Собери слово' },
    title: {
      az: 'Hərfləri düz sıraya qoy və şəklin adını qur.<br>Hərfə, sonra onun yerinə toxun.',
      en: 'Put the letters in order to spell the picture.<br>Tap a letter, then where it goes.',
      ru: 'Расставь буквы, чтобы получилось название картинки.<br>Нажми на букву, потом на её место.'
    },
    visual: () => EQD.vPic(it.e, 84),
    order: {
      shown: shown, sorted: sorted,
      label: { az: 'Şəklin adı', en: 'The picture’s name', ru: 'Название картинки' },
      doneLabel: { az: 'Hazıram', en: 'Done', ru: 'Готово' }
    },
    answers: fa.answers, correct: fa.correct,
    tip: {
      az: 'Əvvəl ilk hərfi tap və başa qoy.',
      en: 'Find the first letter and put it at the front.',
      ru: 'Сначала найди первую букву и поставь её в начало.'
    },
    successLine: { az: `${W.az} — sözü qurdun!`, en: `${W.en} — you built it!`, ru: `${W.ru} — слово собрано!` },
    praise: {
      az: 'Hərfləri səslərin sırası ilə düzdün — elə yazmaq budur!',
      en: 'You put the letters in the order of the sounds — that’s writing!',
      ru: 'Ты расставил буквы в порядке звуков — это и есть письмо!'
    },
    hint: {
      heading: { az: 'Az qaldı! Başdan başlayaq.', en: 'Almost! Let’s start at the beginning.', ru: 'Почти! Начнём с начала.' },
      sub: {
        az: `Söz ${sorted.az[0]} hərfi ilə başlayır. Onu başa qoy, sonra sözü yavaşca deyərək davam et.`,
        en: `The word starts with ${sorted.en[0]}. Put it first, then keep going as you say the word slowly.`,
        ru: `Слово начинается с ${sorted.ru[0]}. Поставь её первой и продолжай, медленно произнося слово.`
      },
      panelTitle: { az: 'Sözün başlanğıcı', en: 'How the word begins', ru: 'Начало слова' },
      body: () => EQD.vTiles(TX(sorted).map((c, i) => i < 2 ? c : '?'), -1),
      note: { az: 'Hər dəfə növbəti səsi de və onun hərfini tap.', en: 'Each time, say the next sound and find its letter.', ru: 'Каждый раз произноси следующий звук и ищи его букву.' }
    },
    explain: {
      title: { az: 'Söz səslərin sırasıdır.', en: 'A word is sounds in order.', ru: 'Слово — это звуки по порядку.' },
      text: {
        az: `Sözü yavaşca de: ${sorted.az.join(' - ')}. Hər səsin hərfini sıra ilə qoyanda ${W.az} alınır.`,
        en: `Say it slowly: ${sorted.en.join(' - ')}. Put each sound’s letter down in order and you get ${W.en}.`,
        ru: `Скажи медленно: ${sorted.ru.join(' - ')}. Поставь буквы по порядку звуков — получится ${W.ru}.`
      },
      why: {
        az: 'Səsləri sıra ilə eşidən uşaq sözləri özü yaza bilir.',
        en: 'Hearing sounds in order is what lets you write words by yourself.',
        ru: 'Кто слышит звуки по порядку, тот может сам писать слова.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="font-size:56px;line-height:1;flex:none">${it.e}</div><div style="flex:1"><div style="font:800 24px 'Baloo 2', system-ui;color:#fff;letter-spacing:4px">${TX(W)}</div><div class="bt" style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX(sorted).join(' → ')}</div></div></div>`
    }
  });
  if (!noEasier) q.easier = EQD._qBuild(ri, false, true);
  return q;
};

/* ═══════════════ Elm Adası · Kosmik Stansiya · Sirli Qala tapmacaları ═══════════════
   Fact banks: `q` the question, `a` the right answer, `no` the two wrong ones (emoji, or
   {az,en,ru} words where no emoji says it), `why` the one-line reason the child is told
   on the success screen and in the tutor, `pic` an optional picture over the question,
   `hard` for the facts held back until the topic is going well. */
EQD.FACTS = {
  animals: [
    { pic: '🐟', q: { az: 'Balıq harada yaşayır?', en: 'Where does a fish live?', ru: 'Где живёт рыба?' }, a: '🌊', no: ['🌳', '🏜️'],
      why: { az: 'Balıq suda qəlsəmələri ilə nəfəs alır.', en: 'A fish breathes underwater with its gills.', ru: 'Рыба дышит в воде жабрами.' } },
    { q: { az: 'Hansı heyvan yumurta qoyur?', en: 'Which animal lays eggs?', ru: 'Какое животное откладывает яйца?' }, a: '🐔', no: ['🐶', '🐮'],
      why: { az: 'Toyuq quşdur, quşlar isə yumurta qoyur.', en: 'A hen is a bird, and birds lay eggs.', ru: 'Курица — птица, а птицы откладывают яйца.' } },
    { pic: '🐝', q: { az: 'Arılar nə düzəldir?', en: 'What do bees make?', ru: 'Что делают пчёлы?' }, a: '🍯', no: ['🥛', '🧀'],
      why: { az: 'Arılar çiçək nektarından bal düzəldir.', en: 'Bees make honey from the nectar of flowers.', ru: 'Пчёлы делают мёд из нектара цветов.' } },
    { pic: '🐮', q: { az: 'İnək bizə nə verir?', en: 'What does a cow give us?', ru: 'Что даёт нам корова?' }, a: '🥛', no: ['🍯', '🥚'],
      why: { az: 'İnək südündən pendir və qatıq da hazırlanır.', en: 'Cheese and yogurt are made from cow’s milk too.', ru: 'Из коровьего молока делают и сыр, и йогурт.' } },
    { pic: '🐰', q: { az: 'Dovşan nə yeməyi sevir?', en: 'What does a rabbit like to eat?', ru: 'Что любит есть заяц?' }, a: '🥕', no: ['🍖', '🐟'],
      why: { az: 'Dovşan bitki ilə qidalanır — tərəvəz və ot sevir.', en: 'A rabbit eats plants — it loves vegetables and grass.', ru: 'Заяц ест растения — любит овощи и траву.' } },
    { q: { az: 'Hansı heyvan uça bilir?', en: 'Which animal can fly?', ru: 'Какое животное умеет летать?' }, a: '🦅', no: ['🐢', '🐘'],
      why: { az: 'Qartalın güclü, geniş qanadları var.', en: 'An eagle has strong, wide wings.', ru: 'У орла сильные широкие крылья.' } },
    { q: { az: 'Hansı heyvan bütün qışı yatır?', en: 'Which animal sleeps all winter?', ru: 'Какое животное спит всю зиму?' }, a: '🐻', no: ['🐶', '🐔'],
      why: { az: 'Ayı qışı yuvasında yatıb keçirir.', en: 'A bear spends the winter asleep in its den.', ru: 'Медведь проводит зиму во сне в берлоге.' } },
    { q: { az: 'Hörümçək nə toxuyur?', en: 'What does a spider spin?', ru: 'Что плетёт паук?' }, a: '🕸️', no: ['🧶', '🎈'],
      why: { az: 'Hörümçək torla həşərat tutur.', en: 'A spider catches insects in its web.', ru: 'Паук ловит насекомых паутиной.' } },
    { q: { az: 'Hansı heyvanın çox uzun boynu var?', en: 'Which animal has a very long neck?', ru: 'У какого животного очень длинная шея?' }, a: '🦒', no: ['🐷', '🐭'],
      why: { az: 'Zürafə uzun boynu ilə hündür ağacların yarpaqlarına çatır.', en: 'A giraffe’s long neck reaches leaves high up in the trees.', ru: 'Длинная шея помогает жирафу доставать листья с высоких деревьев.' } },
    { pic: '🐧', q: { az: 'Pinqvin harada yaşayır?', en: 'Where do penguins live?', ru: 'Где живут пингвины?' }, a: '❄️', no: ['🌵', '🌴'],
      why: { az: 'Pinqvinlər soyuq, buzlu yerlərdə yaşayır və yaxşı üzür.', en: 'Penguins live in cold, icy places and are great swimmers.', ru: 'Пингвины живут там, где холодно и много льда, и отлично плавают.' } },
    { hard: true, q: { az: 'Tırtıl böyüyüb nəyə çevrilir?', en: 'What does a caterpillar grow into?', ru: 'В кого превращается гусеница?' }, a: '🦋', no: ['🐝', '🐞'],
      why: { az: 'Tırtıl barama qurur, sonra kəpənək olub uçur.', en: 'A caterpillar wraps itself in a cocoon and comes out a butterfly.', ru: 'Гусеница делает кокон и выходит из него бабочкой.' } },
    { hard: true, q: { az: 'Hansı balaca anasının südünü əmir?', en: 'Which baby drinks its mother’s milk?', ru: 'Какой малыш пьёт мамино молоко?' }, a: '🐶', no: ['🐍', '🐟'],
      why: { az: 'Küçüklər anasının südünü əmir — itlər məməlidir.', en: 'Puppies drink their mother’s milk — dogs are mammals.', ru: 'Щенки пьют мамино молоко — собаки млекопитающие.' } }
  ],
  body: [
    { q: { az: 'Nə ilə eşidirik?', en: 'What do we hear with?', ru: 'Чем мы слышим?' }, a: '👂', no: ['👃', '👁️'],
      why: { az: 'Səslər qulağa girir, beyin onları tanıyır.', en: 'Sounds go into our ears and our brain works out what they are.', ru: 'Звуки попадают в уши, а мозг их узнаёт.' } },
    { q: { az: 'Nə ilə iy bilirik?', en: 'What do we smell with?', ru: 'Чем мы чувствуем запах?' }, a: '👃', no: ['👂', '✋'],
      why: { az: 'Burun həm çiçəyin, həm tortun iyini tutur.', en: 'Your nose catches the smell of flowers and cake alike.', ru: 'Нос чувствует запах и цветов, и торта.' } },
    { q: { az: 'Nə ilə görürük?', en: 'What do we see with?', ru: 'Чем мы видим?' }, a: '👁️', no: ['👄', '👂'],
      why: { az: 'Gözlər rəngləri və formaları görür.', en: 'Our eyes see colours and shapes.', ru: 'Глаза видят цвета и формы.' } },
    { q: { az: 'Dadı nə ilə bilirik?', en: 'What do we taste with?', ru: 'Чем мы чувствуем вкус?' }, a: '👅', no: ['👃', '👁️'],
      why: { az: 'Dil şirini, turşunu və duzlunu ayırır.', en: 'Your tongue tells sweet, sour and salty apart.', ru: 'Язык различает сладкое, кислое и солёное.' } },
    { q: { az: 'Yeməkdən əvvəl əlləri nə ilə yuyuruq?', en: 'What do we wash our hands with before eating?', ru: 'Чем моют руки перед едой?' }, a: '🧼', no: ['📺', '🎮'],
      why: { az: 'Sabun əllərdəki mikrobları yuyub aparır.', en: 'Soap washes the germs off our hands.', ru: 'Мыло смывает микробы с рук.' } },
    { q: { az: 'Hansı qida bədən üçün daha faydalıdır?', en: 'Which food is best for your body?', ru: 'Какая еда полезнее для тела?' }, a: '🍎', no: ['🍭', '🍟'],
      why: { az: 'Meyvədə vitamin çoxdur, konfetdə isə şəkər.', en: 'Fruit is full of vitamins; sweets are mostly sugar.', ru: 'Во фруктах много витаминов, а в конфетах — сахара.' } },
    { q: { az: 'Gecə bədənə nə lazımdır?', en: 'What does your body need at night?', ru: 'Что нужно телу ночью?' }, a: '😴', no: ['🎮', '🍭'],
      why: { az: 'Yuxuda bədən dincəlir və böyüyür.', en: 'While you sleep, your body rests and grows.', ru: 'Во сне тело отдыхает и растёт.' } },
    { q: { az: 'Toxunmağı ən yaxşı nə ilə hiss edirik?', en: 'What do we feel touch with best?', ru: 'Чем мы лучше всего чувствуем прикосновения?' }, a: '✋', no: ['👂', '👃'],
      why: { az: 'Barmaq uclarımız isti, soyuq və yumşağı hiss edir.', en: 'Our fingertips feel warm, cold and soft.', ru: 'Кончики пальцев чувствуют тепло, холод и мягкость.' } },
    { q: { az: 'Günəşli gündə gözləri nə qoruyur?', en: 'What protects your eyes on a sunny day?', ru: 'Что защищает глаза в солнечный день?' }, a: '🕶️', no: ['🧤', '🧣'],
      why: { az: 'Günəş eynəyi gözləri parlaq işıqdan qoruyur.', en: 'Sunglasses shield your eyes from bright light.', ru: 'Солнечные очки защищают глаза от яркого света.' } },
    { q: { az: 'Soyuq qış günü nə geyinirik?', en: 'What do we wear on a cold winter day?', ru: 'Что мы надеваем в холодный зимний день?' }, a: '🧥', no: ['👙', '👒'],
      why: { az: 'Qalın palto bədənin istisini saxlayır.', en: 'A warm coat keeps your body’s heat in.', ru: 'Тёплое пальто сохраняет тепло тела.' } },
    { hard: true, q: { az: 'Qaçanda nə daha tez döyünür?', en: 'What beats faster when you run?', ru: 'Что бьётся быстрее, когда ты бегаешь?' }, a: '❤️', no: ['🦶', '👂'],
      why: { az: 'Ürək qanı bütün bədənə vurur, qaçanda daha çox işləyir.', en: 'Your heart pumps blood around your body and works harder when you run.', ru: 'Сердце качает кровь по телу и при беге работает сильнее.' } },
    { hard: true, q: { az: 'Bədəni dik saxlayan nədir?', en: 'What holds your body up?', ru: 'Что держит наше тело прямо?' }, a: '🦴', no: ['💧', '🎈'],
      why: { az: 'Sümüklər bədənin skeletini qurur, onsuz dayana bilməzdik.', en: 'Bones make your skeleton — without them you couldn’t stand.', ru: 'Кости образуют скелет — без него мы не смогли бы стоять.' } }
  ],
  nature: [
    { q: { az: 'Qar hansı fəsildə yağır?', en: 'In which season does it snow?', ru: 'В какое время года идёт снег?' }, a: '⛄', no: ['🌸', '🌞'],
      why: { az: 'Qışda hava elə soyuq olur ki, yağış qara çevrilir.', en: 'In winter it is cold enough for rain to turn into snow.', ru: 'Зимой так холодно, что дождь превращается в снег.' } },
    { q: { az: 'Payızda yarpaqlar necə olur?', en: 'What happens to leaves in autumn?', ru: 'Что происходит с листьями осенью?' }, a: '🍂', no: ['🌸', '⛄'],
      why: { az: 'Payızda yarpaqlar saralır və yerə tökülür.', en: 'In autumn leaves turn yellow and fall.', ru: 'Осенью листья желтеют и опадают.' } },
    { pic: '🌱', q: { az: 'Bitkinin böyüməsi üçün nə lazımdır?', en: 'What does a plant need to grow?', ru: 'Что нужно растению, чтобы расти?' }, a: '💧', no: ['🍭', '🧸'],
      why: { az: 'Bitkiyə su, günəş işığı və torpaq lazımdır.', en: 'A plant needs water, sunlight and soil.', ru: 'Растению нужны вода, солнечный свет и земля.' } },
    { pic: '🌈', q: { az: 'Göy qurşağı nə vaxt görünür?', en: 'When can we see a rainbow?', ru: 'Когда можно увидеть радугу?' }, a: '🌦️', no: ['🌙', '❄️'],
      why: { az: 'Günəş yağış damlalarının arasından keçəndə göy qurşağı yaranır.', en: 'A rainbow appears when sunlight shines through raindrops.', ru: 'Радуга появляется, когда солнце светит сквозь капли дождя.' } },
    { q: { az: 'Toxumdan nə böyüyür?', en: 'What grows from a seed?', ru: 'Что вырастает из семечка?' }, a: '🌱', no: ['🧱', '🥚'],
      why: { az: 'Toxum torpaqda cücərir və yeni bitki olur.', en: 'A seed sprouts in the soil and becomes a new plant.', ru: 'Семечко прорастает в земле и становится новым растением.' } },
    { q: { az: 'Yayda hava necə olur?', en: 'What is the weather like in summer?', ru: 'Какая погода летом?' }, a: '🌞', no: ['❄️', '🌨️'],
      why: { az: 'Yayda günəş daha çox parlayır və hava isti olur.', en: 'In summer the sun shines longer and it gets hot.', ru: 'Летом солнце светит дольше, и становится жарко.' } },
    { q: { az: 'Yazda nə açır?', en: 'What blooms in spring?', ru: 'Что расцветает весной?' }, a: '🌸', no: ['🍂', '⛄'],
      why: { az: 'Yazda hava isinir və çiçəklər açır.', en: 'In spring the air warms up and flowers bloom.', ru: 'Весной теплеет, и распускаются цветы.' } },
    { q: { az: 'İldırım nə vaxt çaxır?', en: 'When do we see lightning?', ru: 'Когда сверкает молния?' }, a: '⛈️', no: ['🌈', '🌞'],
      why: { az: 'İldırım tufanlı qara buludlarda yaranır.', en: 'Lightning comes from dark storm clouds.', ru: 'Молния появляется в тёмных грозовых тучах.' } },
    { pic: '🍎', q: { az: 'Alma harada bitir?', en: 'Where do apples grow?', ru: 'Где растут яблоки?' }, a: '🌳', no: ['🌊', '🏔️'],
      why: { az: 'Alma ağacda bitir — yazda çiçək açır, payızda meyvə verir.', en: 'Apples grow on trees — blossom in spring, fruit in autumn.', ru: 'Яблоки растут на деревьях: весной цветут, осенью плодоносят.' } },
    { hard: true, q: { az: 'Hansı bitki səhrada yaşaya bilir?', en: 'Which plant can live in the desert?', ru: 'Какое растение может жить в пустыне?' }, a: '🌵', no: ['🌷', '🍄'],
      why: { az: 'Kaktus suyu gövdəsində saxlayır.', en: 'A cactus stores water inside its stem.', ru: 'Кактус запасает воду в стебле.' } },
    { hard: true, pic: '☁️', q: { az: 'Buludlar nədən ibarətdir?', en: 'What are clouds made of?', ru: 'Из чего состоят облака?' }, a: '💧', no: ['🧶', '🍦'],
      why: { az: 'Bulud havada üzən xırda su damcılarıdır.', en: 'Clouds are tiny drops of water floating in the air.', ru: 'Облака — это крошечные капли воды в воздухе.' } }
  ],
  matter: [
    { pic: '❄️', q: { az: 'Buz isinəndə nəyə çevrilir?', en: 'What does ice turn into when it warms up?', ru: 'Во что превращается лёд, когда нагревается?' }, a: '💧', no: ['🔥', '🧱'],
      why: { az: 'İstidə buz əriyir və su olur.', en: 'Warmth melts ice into water.', ru: 'В тепле лёд тает и становится водой.' } },
    { q: { az: 'Hansı suyun üzündə qalır?', en: 'Which one floats on water?', ru: 'Что держится на воде?' }, a: '⚽', no: ['🔑', '⚓'],
      why: { az: 'İçi hava ilə dolu top suyun üzündə qalır.', en: 'A ball full of air stays on top of the water.', ru: 'Мяч, наполненный воздухом, держится на воде.' } },
    { pic: '🧲', q: { az: 'Hansı maqnitə yapışır?', en: 'Which one sticks to a magnet?', ru: 'Что притягивается к магниту?' }, a: '📎', no: ['🧸', '🍎'],
      why: { az: 'Maqnit dəmirdən olan əşyaları, məsələn, sancağı çəkir.', en: 'A magnet pulls things made of iron, like a paper clip.', ru: 'Магнит притягивает железные вещи, например скрепку.' } },
    { pic: '💧', q: { az: 'Şaxtalı gecədə su nəyə çevrilir?', en: 'What does water turn into on a freezing night?', ru: 'Во что превращается вода в морозную ночь?' }, a: '❄️', no: ['🔥', '🌈'],
      why: { az: 'Çox soyuqda su donur və buz olur.', en: 'When it is very cold, water freezes into ice.', ru: 'В сильный холод вода замерзает и становится льдом.' } },
    { q: { az: 'Hansı işıq verir?', en: 'Which one gives light?', ru: 'Что даёт свет?' }, a: '💡', no: ['📚', '🧦'],
      why: { az: 'Lampa elektriki işığa çevirir.', en: 'A light bulb turns electricity into light.', ru: 'Лампочка превращает электричество в свет.' } },
    { q: { az: 'Hansı istidə əriyə bilər?', en: 'Which one can melt in the heat?', ru: 'Что может растаять в тепле?' }, a: '🍦', no: ['🔑', '🧱'],
      why: { az: 'Dondurma istidə əriyir, açar və kərpic isə yox.', en: 'Ice cream melts in the heat; a key and a brick do not.', ru: 'Мороженое тает в тепле, а ключ и кирпич — нет.' } },
    { q: { az: 'Hansının içindən baxıb görmək olur?', en: 'Which one can you see through?', ru: 'Сквозь что можно смотреть?' }, a: '👓', no: ['🧱', '📦'],
      why: { az: 'Şüşədən işıq keçir, ona görə içindən görürük.', en: 'Light passes through glass, so we can see through it.', ru: 'Стекло пропускает свет, поэтому сквозь него видно.' } },
    { q: { az: 'Hansı istidir — ondan uzaq dur!', en: 'Which one is hot — stay away!', ru: 'Что горячее — держись подальше!' }, a: '🔥', no: ['💧', '❄️'],
      why: { az: 'Od isti və təhlükəlidir, ona toxunmaq olmaz.', en: 'Fire is hot and dangerous — never touch it.', ru: 'Огонь горячий и опасный — его нельзя трогать.' } },
    { q: { az: 'Hansı suyu özünə çəkir?', en: 'Which one soaks up water?', ru: 'Что впитывает воду?' }, a: '🧽', no: ['🔑', '🥄'],
      why: { az: 'Süngərdə xırda deşiklər çoxdur, su onlara dolur.', en: 'A sponge is full of tiny holes that fill up with water.', ru: 'В губке много маленьких дырочек, и вода их заполняет.' } },
    { hard: true, pic: '♨️', q: { az: 'Qaynayan sudan yuxarı nə qalxır?', en: 'What rises from boiling water?', ru: 'Что поднимается над кипящей водой?' },
      a: { az: 'buxar', en: 'steam', ru: 'пар' }, no: [{ az: 'qar', en: 'snow', ru: 'снег' }, { az: 'qum', en: 'sand', ru: 'песок' }],
      why: { az: 'Qaynar su buxara çevrilib havaya qalxır.', en: 'Boiling water turns into steam and rises into the air.', ru: 'Кипящая вода превращается в пар и поднимается вверх.' } },
    { hard: true, q: { az: 'Hansı ən ağırdır?', en: 'Which one is the heaviest?', ru: 'Что тяжелее всего?' }, a: '🧱', no: ['🎈', '🍃'],
      why: { az: 'Kərpic sıx və bərkdir, şar isə hava ilə doludur.', en: 'A brick is solid and dense; a balloon is full of air.', ru: 'Кирпич плотный и твёрдый, а шарик наполнен воздухом.' } }
  ],
  planets: [
    { q: { az: 'Biz hansı planetdə yaşayırıq?', en: 'Which planet do we live on?', ru: 'На какой планете мы живём?' }, a: '🌍', no: ['🌕', '☀️'],
      why: { az: 'Yer — suyu və havası olan evimizdir.', en: 'Earth is our home — a planet with water and air.', ru: 'Земля — наш дом, планета с водой и воздухом.' } },
    { pic: '☀️', q: { az: 'Günəş nədir?', en: 'What is the Sun?', ru: 'Что такое Солнце?' },
      a: { az: 'ulduz', en: 'a star', ru: 'звезда' }, no: [{ az: 'planet', en: 'a planet', ru: 'планета' }, { az: 'bulud', en: 'a cloud', ru: 'облако' }],
      why: { az: 'Günəş bizə ən yaxın ulduzdur — ona görə belə böyük və parlaq görünür.', en: 'The Sun is the star closest to us — that’s why it looks so big and bright.', ru: 'Солнце — ближайшая к нам звезда, поэтому оно такое большое и яркое.' } },
    { q: { az: 'Hansı planet qırmızı görünür?', en: 'Which planet looks red?', ru: 'Какая планета выглядит красной?' },
      a: { az: 'Mars', en: 'Mars', ru: 'Марс' }, no: [{ az: 'Yer', en: 'Earth', ru: 'Земля' }, { az: 'Neptun', en: 'Neptune', ru: 'Нептун' }],
      why: { az: 'Marsın torpağı paslı tozla örtülüdür, ona görə qırmızıdır.', en: 'Mars is covered in rusty dust, which makes it red.', ru: 'Марс покрыт ржавой пылью, поэтому он красный.' } },
    { q: { az: 'Hansı planetin böyük halqaları var?', en: 'Which planet has big rings?', ru: 'У какой планеты большие кольца?' },
      a: { az: 'Saturn', en: 'Saturn', ru: 'Сатурн' }, no: [{ az: 'Mars', en: 'Mars', ru: 'Марс' }, { az: 'Yer', en: 'Earth', ru: 'Земля' }],
      why: { az: 'Saturnun halqaları buz və daş parçalarındandır.', en: 'Saturn’s rings are made of chunks of ice and rock.', ru: 'Кольца Сатурна состоят из кусочков льда и камня.' } },
    { pic: '🌕', q: { az: 'Ay nəyin ətrafında fırlanır?', en: 'What does the Moon travel around?', ru: 'Вокруг чего вращается Луна?' }, a: '🌍', no: ['⭐', '☁️'],
      why: { az: 'Ay Yerin peykidir — təxminən bir aya Yerin ətrafında dövrə vurur.', en: 'The Moon is Earth’s satellite — it circles us about once a month.', ru: 'Луна — спутник Земли, она облетает её примерно за месяц.' } },
    { pic: '🌍', q: { az: 'Yer nəyin ətrafında fırlanır?', en: 'What does Earth travel around?', ru: 'Вокруг чего вращается Земля?' }, a: '☀️', no: ['🌕', '☁️'],
      why: { az: 'Yer Günəşin ətrafında bir dövrəni bir ilə vurur.', en: 'Earth takes one whole year to go around the Sun.', ru: 'Земля облетает Солнце за один год.' } },
    { q: { az: 'Hansı planetdə okean və meşə var?', en: 'Which planet has oceans and forests?', ru: 'На какой планете есть океаны и леса?' }, a: '🌍', no: ['🌕', '☄️'],
      why: { az: 'Bildiyimiz qədər, canlılar yalnız Yerdə yaşayır.', en: 'As far as we know, Earth is the only planet with living things.', ru: 'Насколько мы знаем, жизнь есть только на Земле.' } },
    { hard: true, q: { az: 'Ən böyük planet hansıdır?', en: 'Which is the biggest planet?', ru: 'Какая планета самая большая?' },
      a: { az: 'Yupiter', en: 'Jupiter', ru: 'Юпитер' }, no: [{ az: 'Merkuri', en: 'Mercury', ru: 'Меркурий' }, { az: 'Mars', en: 'Mars', ru: 'Марс' }],
      why: { az: 'Yupiterin içinə 1000-dən çox Yer sığardı!', en: 'More than 1,000 Earths could fit inside Jupiter!', ru: 'Внутри Юпитера поместилось бы больше 1000 Земель!' } },
    { hard: true, q: { az: 'Günəşə ən yaxın planet hansıdır?', en: 'Which planet is closest to the Sun?', ru: 'Какая планета ближе всех к Солнцу?' },
      a: { az: 'Merkuri', en: 'Mercury', ru: 'Меркурий' }, no: [{ az: 'Neptun', en: 'Neptune', ru: 'Нептун' }, { az: 'Yer', en: 'Earth', ru: 'Земля' }],
      why: { az: 'Merkuri Günəşin lap yanındadır, orada gündüz çox istidir.', en: 'Mercury is right next to the Sun, so its days are scorching.', ru: 'Меркурий совсем рядом с Солнцем, поэтому днём там очень жарко.' } },
    { hard: true, q: { az: 'Günəş sistemində neçə planet var?', en: 'How many planets are in our solar system?', ru: 'Сколько планет в Солнечной системе?' }, a: 8, no: [5, 12],
      why: { az: 'Səkkiz planet: Merkuri, Venera, Yer, Mars, Yupiter, Saturn, Uran, Neptun.', en: 'Eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.', ru: 'Восемь планет: Меркурий, Венера, Земля, Марс, Юпитер, Сатурн, Уран, Нептун.' } }
  ],
  sky: [
    { q: { az: 'Gündüz göydə nə parlayır?', en: 'What shines in the sky during the day?', ru: 'Что светит на небе днём?' }, a: '☀️', no: ['🌙', '⭐'],
      why: { az: 'Gündüz Günəş Yerin bizim tərəfini işıqlandırır.', en: 'In the daytime the Sun lights up our side of Earth.', ru: 'Днём Солнце освещает нашу сторону Земли.' } },
    { q: { az: 'Gecə göydə nə görürük?', en: 'What do we see in the night sky?', ru: 'Что мы видим на ночном небе?' }, a: '🌙', no: ['🌞', '🌈'],
      why: { az: 'Gecə Ay və ulduzlar görünür.', en: 'At night we can see the Moon and the stars.', ru: 'Ночью видно Луну и звёзды.' } },
    { q: { az: 'Ulduzlar nə vaxt görünür?', en: 'When can we see the stars?', ru: 'Когда видно звёзды?' }, a: '🌃', no: ['🌞', '🌤️'],
      why: { az: 'Ulduzlar gündüz də var, sadəcə Günəş işığı onları gizlədir.', en: 'Stars are there in the day too — sunlight just hides them.', ru: 'Звёзды есть и днём — их просто скрывает солнечный свет.' } },
    { q: { az: 'Göydə parlaq quyruqla uçan nədir?', en: 'What flies across the sky with a glowing tail?', ru: 'Что летит по небу со светящимся хвостом?' }, a: '☄️', no: ['🌙', '🌍'],
      why: { az: 'Kometa buz və tozdandır, Günəşə yaxınlaşanda quyruğu parlayır.', en: 'A comet is ice and dust; its tail glows as it nears the Sun.', ru: 'Комета — это лёд и пыль; у Солнца её хвост светится.' } },
    { q: { az: 'Hansı tam Aydır (bədirdir)?', en: 'Which one is a full moon?', ru: 'Какая из них — полная луна?' }, a: '🌕', no: ['🌙', '🌘'],
      why: { az: 'Bədir zamanı Ayın bütün işıqlı üzü bizə baxır.', en: 'At full moon the whole lit side of the Moon faces us.', ru: 'В полнолуние к нам повёрнута вся освещённая сторона Луны.' } },
    { q: { az: 'Hansı ən isti və ən parlaqdır?', en: 'Which one is the hottest and brightest?', ru: 'Что самое горячее и яркое?' }, a: '☀️', no: ['🌙', '🌍'],
      why: { az: 'Günəş nəhəng qaynar qaz topudur.', en: 'The Sun is a giant ball of burning-hot gas.', ru: 'Солнце — огромный шар раскалённого газа.' } },
    { q: { az: 'Səhər göydə nə çıxır?', en: 'What rises in the sky in the morning?', ru: 'Что восходит на небе утром?' }, a: '🌅', no: ['🌃', '🌌'],
      why: { az: 'Səhər Günəş üfüqdən qalxır və gün başlayır.', en: 'In the morning the Sun climbs over the horizon and the day begins.', ru: 'Утром Солнце поднимается над горизонтом, и начинается день.' } },
    { hard: true, q: { az: 'Ay işığını haradan alır?', en: 'Where does the Moon’s light come from?', ru: 'Откуда у Луны свет?' }, a: '☀️', no: ['💡', '🔥'],
      why: { az: 'Ay özü işıq vermir — Günəşin işığını əks etdirir.', en: 'The Moon makes no light of its own — it reflects sunlight.', ru: 'Луна не светится сама — она отражает свет Солнца.' } },
    { hard: true, q: { az: 'Niyə gecə olur?', en: 'Why does night come?', ru: 'Почему наступает ночь?' },
      a: { az: 'Yer fırlanır', en: 'Earth turns', ru: 'Земля вращается' }, no: [{ az: 'Günəş sönür', en: 'The Sun goes out', ru: 'Солнце гаснет' }, { az: 'Bulud gəlir', en: 'Clouds come', ru: 'Приходят тучи' }],
      why: { az: 'Yer fırlanır: bizim tərəf Günəşdən dönəndə gecə olur.', en: 'Earth spins, and when our side turns away from the Sun it is night.', ru: 'Земля вращается, и когда наша сторона отворачивается от Солнца, наступает ночь.' } },
    { hard: true, q: { az: 'Ulduzlardan düzəlmiş şəkilə nə deyirlər?', en: 'What do we call a picture made of stars?', ru: 'Как называют рисунок из звёзд?' },
      a: { az: 'bürc', en: 'constellation', ru: 'созвездие' }, no: [{ az: 'bulud', en: 'cloud', ru: 'облако' }, { az: 'göy qurşağı', en: 'rainbow', ru: 'радуга' }],
      why: { az: 'Qədim insanlar ulduzları xətlə birləşdirib bürclər düzəldib, məsələn, Böyük Ayı.', en: 'Long ago people joined stars with lines to make constellations, like the Great Bear.', ru: 'Давным-давно люди соединили звёзды линиями — так появились созвездия, например Большая Медведица.' } }
  ],
  astro: [
    { q: { az: 'Kosmonavtlar kosmosa nə ilə uçur?', en: 'What do astronauts fly into space in?', ru: 'На чём космонавты летят в космос?' }, a: '🚀', no: ['🚲', '🚂'],
      why: { az: 'Raketin çox güclü mühərrikləri var.', en: 'A rocket has very powerful engines.', ru: 'У ракеты очень мощные двигатели.' } },
    { q: { az: 'Uzaq ulduzlara nə ilə baxırlar?', en: 'What do we use to look at faraway stars?', ru: 'Через что смотрят на далёкие звёзды?' }, a: '🔭', no: ['🔍', '📷'],
      why: { az: 'Teleskop uzaqdakı şeyləri böyüdüb yaxın göstərir.', en: 'A telescope makes faraway things look big and close.', ru: 'Телескоп делает далёкие предметы большими и близкими.' } },
    { q: { az: 'Yerin ətrafında uçub şəkil və siqnal göndərən nədir?', en: 'What circles Earth sending pictures and signals?', ru: 'Что летает вокруг Земли и передаёт снимки и сигналы?' }, a: '🛰️', no: ['🚁', '🎈'],
      why: { az: 'Peyk kosmosda uçur, hava xəritələrini və telefon siqnallarını ötürür.', en: 'A satellite orbits in space, sending weather maps and phone signals.', ru: 'Спутник летает в космосе и передаёт карты погоды и сигналы телефонов.' } },
    { q: { az: 'Kosmosa çıxmaq üçün kim düzgün geyinib?', en: 'Who is dressed right for a spacewalk?', ru: 'Кто правильно одет для выхода в космос?' }, a: '👨‍🚀', no: ['👷', '🏄'],
      why: { az: 'Kosmosda hava yoxdur — skafandr kosmonavta hava verir və onu qoruyur.', en: 'There is no air in space — a spacesuit gives astronauts air and keeps them safe.', ru: 'В космосе нет воздуха — скафандр даёт космонавту воздух и защищает его.' } },
    { q: { az: 'Raket havaya qalxanda altından nə çıxır?', en: 'What comes out of a rocket as it lifts off?', ru: 'Что вырывается из ракеты при взлёте?' }, a: '🔥', no: ['💧', '❄️'],
      why: { az: 'Yanan yanacaq qaynar qazı aşağı itələyir, qaz isə raketi yuxarı.', en: 'Burning fuel pushes hot gas down, and that pushes the rocket up.', ru: 'Горящее топливо выталкивает горячий газ вниз, а ракету — вверх.' } },
    { q: { az: 'Kosmik stansiyanın pəncərəsindən nə görünür?', en: 'What can you see from a space station window?', ru: 'Что видно из окна космической станции?' }, a: '🌍', no: ['🌳', '🏠'],
      why: { az: 'Stansiya Yerin çox yuxarısında uçur, pəncərədən bütöv planet görünür.', en: 'The station flies high above Earth, so the whole planet is in view.', ru: 'Станция летит высоко над Землёй, и из окна видна вся планета.' } },
    { q: { az: 'İnsanlar Aya nə ilə uçub?', en: 'How did people travel to the Moon?', ru: 'На чём люди летали на Луну?' }, a: '🚀', no: ['🚢', '✈️'],
      why: { az: '1969-cu ildə insanlar raketlə Aya uçub orada gəziblər.', en: 'In 1969 people flew to the Moon on a rocket and walked on it.', ru: 'В 1969 году люди долетели до Луны на ракете и гуляли по ней.' } },
    { hard: true, q: { az: 'Kosmik stansiyada əşyalar nə edir?', en: 'What do things do inside a space station?', ru: 'Что делают предметы на космической станции?' },
      a: { az: 'üzür', en: 'they float', ru: 'парят' }, no: [{ az: 'düşür', en: 'they fall', ru: 'падают' }, { az: 'əriyir', en: 'they melt', ru: 'тают' }],
      why: { az: 'Stansiyada hər şey çəkisiz olur və havada üzür.', en: 'On a space station everything is weightless and floats.', ru: 'На станции всё невесомое и парит в воздухе.' } },
    { hard: true, q: { az: 'Ayda ayaq izi niyə illərlə qalır?', en: 'Why do footprints on the Moon last for years?', ru: 'Почему следы на Луне сохраняются годами?' },
      a: { az: 'külək yoxdur', en: 'there is no wind', ru: 'там нет ветра' }, no: [{ az: 'çox soyuqdur', en: 'it is too cold', ru: 'там очень холодно' }, { az: 'qar yağır', en: 'it snows', ru: 'там идёт снег' }],
      why: { az: 'Ayda hava və külək yoxdur, izləri pozan heç nə yoxdur.', en: 'The Moon has no air or wind, so nothing wipes the prints away.', ru: 'На Луне нет воздуха и ветра, и следы ничто не стирает.' } },
    { hard: true, q: { az: 'Kosmosa uçan ilk insan kim olub?', en: 'Who was the first person to fly into space?', ru: 'Кто первым из людей полетел в космос?' },
      a: { az: 'Qaqarin', en: 'Gagarin', ru: 'Гагарин' }, no: [{ az: 'Nyuton', en: 'Newton', ru: 'Ньютон' }, { az: 'Kolumb', en: 'Columbus', ru: 'Колумб' }],
      why: { az: '1961-ci ildə Yuri Qaqarin kosmosa uçan ilk insan olub.', en: 'In 1961 Yuri Gagarin became the first person in space.', ru: 'В 1961 году Юрий Гагарин первым из людей полетел в космос.' } }
  ],
  riddle: [
    { q: { az: 'Uzun qulaqlı, qısa quyruqlu, yerkökü sevir, hoppanaraq qaçır. Bu kimdir?', en: 'Long ears, a fluffy tail, loves carrots and hops everywhere. Who is it?', ru: 'Длинные уши, короткий хвост, любит морковку и прыгает. Кто это?' }, a: '🐰', no: ['🐱', '🐭'],
      why: { az: 'Uzun qulaq, yerkökü və hoppanmaq — bunlar dovşandır.', en: 'Long ears, carrots and hopping — that’s a rabbit.', ru: 'Длинные уши, морковка и прыжки — это заяц.' } },
    { q: { az: 'Gecə çıxır, gündüz gizlənir; gah dəyirmi olur, gah oraq kimi. Bu nədir?', en: 'It comes out at night and hides by day; sometimes round, sometimes a thin smile. What is it?', ru: 'Ночью выходит, днём прячется, то круглая, то как серп. Что это?' }, a: '🌙', no: ['☀️', '⭐'],
      why: { az: 'Formasını dəyişən gecə işığı — Aydır.', en: 'A night light that changes shape — the Moon.', ru: 'Ночной свет, который меняет форму, — это Луна.' } },
    { q: { az: 'Qulaqları iri, xortumu uzun, özü lap nəhəngdir. Bu kimdir?', en: 'Huge ears, a long trunk, and very, very big. Who is it?', ru: 'Большие уши, длинный хобот, а сам огромный. Кто это?' }, a: '🐘', no: ['🦒', '🐻'],
      why: { az: 'Xortum yalnız filin olur.', en: 'Only an elephant has a trunk.', ru: 'Хобот есть только у слона.' } },
    { q: { az: 'Yağışda açılır, günəşdə bağlanır, başımızı islanmağa qoymur. Bu nədir?', en: 'It opens in the rain, closes in the sun and keeps your head dry. What is it?', ru: 'В дождь раскрывается, в солнце закрывается, голову от воды защищает. Что это?' }, a: '☂️', no: ['🎩', '🧢'],
      why: { az: 'Yağışda açılan — çətirdir.', en: 'The thing that opens in the rain is an umbrella.', ru: 'То, что раскрывается в дождь, — зонт.' } },
    { q: { az: 'Əqrəbləri var, ayağı yox; dayanmadan tıqqıldayır, vaxtı göstərir. Bu nədir?', en: 'It has hands but no feet, ticks all day and tells the time. What is it?', ru: 'Есть стрелки, а ног нет, тикает весь день и показывает время. Что это?' }, a: '⏰', no: ['🔔', '📖'],
      why: { az: 'Əqrəblər və tıqqıltı — bu, saatdır.', en: 'Hands and a tick-tock — that’s a clock.', ru: 'Стрелки и тиканье — это часы.' } },
    { q: { az: 'Özü balacadır, amma böyük qapını açır. Bu nədir?', en: 'It is tiny, but it can open a big door. What is it?', ru: 'Сам маленький, а большую дверь открывает. Что это?' }, a: '🔑', no: ['🔨', '✏️'],
      why: { az: 'Qapını açan balaca şey — açardır.', en: 'The tiny thing that opens a door is a key.', ru: 'Маленький предмет, который открывает дверь, — ключ.' } },
    { q: { az: 'Vızıldayır, çiçəkdən-çiçəyə qonur, şirin bal düzəldir. Bu kimdir?', en: 'It buzzes from flower to flower and makes sweet honey. Who is it?', ru: 'Жужжит, летает с цветка на цветок и делает сладкий мёд. Кто это?' }, a: '🐝', no: ['🦋', '🐞'],
      why: { az: 'Bal düzəldən — arıdır.', en: 'The one that makes honey is a bee.', ru: 'Мёд делает пчела.' } },
    { q: { az: 'Evini belində gəzdirir, çox yavaş yeriyir, qılafına gizlənir. Bu kimdir?', en: 'It carries its house on its back, walks very slowly and hides in its shell. Who is it?', ru: 'Свой дом на спине носит, ходит медленно и прячется в панцирь. Кто это?' }, a: '🐢', no: ['🐸', '🐍'],
      why: { az: 'Belində qını olan yavaş heyvan — tısbağadır.', en: 'A slow animal with a shell on its back — a turtle.', ru: 'Медленное животное с панцирем на спине — черепаха.' } },
    { q: { az: 'Yağışdan sonra göydə yeddi rəngli körpü görünür. Bu nədir?', en: 'After the rain a seven-coloured bridge appears in the sky. What is it?', ru: 'После дождя в небе появляется мост из семи цветов. Что это?' }, a: '🌈', no: ['☁️', '⭐'],
      why: { az: 'Yeddi rəngli körpü — göy qurşağıdır.', en: 'A seven-coloured bridge in the sky is a rainbow.', ru: 'Мост из семи цветов в небе — радуга.' } },
    { q: { az: 'Göydən ağappaq düşür, ovcunda əriyir. Bu nədir?', en: 'It falls white from the sky and melts in your hand. What is it?', ru: 'С неба белое падает, а в ладошке тает. Что это?' }, a: '❄️', no: ['🍬', '⭐'],
      why: { az: 'Ağ düşüb ovucda əriyən — qardır.', en: 'White from the sky and melting in your hand — snow.', ru: 'Белое с неба, которое тает в ладошке, — снег.' } },
    { hard: true, q: { az: 'Ağ evdə sarı top gizlənib, nə qapısı var, nə pəncərəsi. Bu nədir?', en: 'A white house with no door or window, and a yellow ball hidden inside. What is it?', ru: 'Белый домик без окон и дверей, а внутри — жёлтый шарик. Что это?' }, a: '🥚', no: ['🍋', '⚽'],
      why: { az: 'Ağ qabığın içində sarı — yumurtadır.', en: 'A white shell with yellow inside — an egg.', ru: 'Белая скорлупа, а внутри жёлтое — яйцо.' } },
    { hard: true, q: { az: 'Danışmır, amma çox şey öyrədir; vərəqləri var, amma ağac deyil. Bu nədir?', en: 'It never speaks but teaches you a lot; it has leaves but it is not a tree. What is it?', ru: 'Молчит, а многому учит; листы есть, а не дерево. Что это?' }, a: '📖', no: ['🌳', '📺'],
      why: { az: 'Vərəqləri olan və öyrədən — kitabdır.', en: 'Something with pages that teaches you — a book.', ru: 'То, у чего есть страницы и что учит, — книга.' } }
  ]
};

/* which fact banks feed which region, and the region-level lines around them */
EQD.FACT_TEXT = {
  hint: {
    animals: { az: 'Heyvanı gözünün önünə gətir: harada yaşayır, nə edir?', en: 'Picture the animal: where does it live, what does it do?', ru: 'Представь это животное: где оно живёт, что делает?' },
    body: { az: 'Öz bədəninə bax — bu işi hansı hissə görür?', en: 'Think about your own body — which part does this job?', ru: 'Подумай о своём теле — какая часть это делает?' },
    nature: { az: 'İlin müxtəlif vaxtlarında çöldə nə gördüyünü xatırla.', en: 'Think of what you see outside at different times of the year.', ru: 'Вспомни, что видно на улице в разное время года.' },
    matter: { az: 'Bunu evdə sınasaydın, nə olardı?', en: 'If you tried this at home, what would happen?', ru: 'Если бы ты попробовал это дома, что бы случилось?' },
    planets: { az: 'Kosmosu böyük bir ailə kimi təsəvvür et — hər planetin öz xüsusiyyəti var.', en: 'Think of space as one big family — every planet has something special.', ru: 'Представь космос большой семьёй — у каждой планеты своя особенность.' },
    sky: { az: 'Gündüz və gecə səmasını xatırla — orada nə görürsən?', en: 'Remember the sky by day and by night — what do you see there?', ru: 'Вспомни небо днём и ночью — что ты там видишь?' },
    astro: { az: 'Özünü kosmonavt kimi təsəvvür et — sənə nə lazım olardı?', en: 'Imagine you are an astronaut — what would you need?', ru: 'Представь, что ты космонавт, — что бы тебе понадобилось?' },
    riddle: { az: 'Tapmacanı yenidən oxu və hər ipucunu ayrıca düşün.', en: 'Read the riddle again and think about each clue on its own.', ru: 'Прочитай загадку ещё раз и подумай над каждой подсказкой.' }
  },
  success: {
    animals: { az: 'Heyvan bilicisi!', en: 'Animal expert!', ru: 'Знаток животных!' },
    body: { az: 'Bədənini tanıyırsan!', en: 'You know your body!', ru: 'Ты знаешь своё тело!' },
    nature: { az: 'Təbiətin dostu!', en: 'Friend of nature!', ru: 'Друг природы!' },
    matter: { az: 'Balaca alim!', en: 'Little scientist!', ru: 'Юный учёный!' },
    planets: { az: 'Planet kaşifi!', en: 'Planet explorer!', ru: 'Исследователь планет!' },
    sky: { az: 'Səma müşahidəçisi!', en: 'Sky watcher!', ru: 'Наблюдатель неба!' },
    astro: { az: 'Gələcəyin kosmonavtı!', en: 'Future astronaut!', ru: 'Будущий космонавт!' },
    riddle: { az: 'Tapmaca açıldı!', en: 'Riddle solved!', ru: 'Загадка разгадана!' }
  },
  name: {
    animals: { az: 'Adanın heyvanları', en: 'Island animals', ru: 'Животные острова' },
    body: { az: 'Hisslər laboratoriyası', en: 'The senses lab', ru: 'Лаборатория чувств' },
    nature: { az: 'Fəsillər bağı', en: 'The garden of seasons', ru: 'Сад времён года' },
    matter: { az: 'İksir masası', en: 'The potion table', ru: 'Стол зелий' },
    planets: { az: 'Planetlər xəritəsi', en: 'The planet map', ru: 'Карта планет' },
    sky: { az: 'Rəsədxana', en: 'The observatory', ru: 'Обсерватория' },
    astro: { az: 'Kosmonavt məktəbi', en: 'Astronaut school', ru: 'Школа космонавтов' },
    riddle: { az: 'Qapıdakı tapmaca', en: 'The riddle on the door', ru: 'Загадка на двери' }
  },
  explainTitle: {
    science: { az: 'Gəl birlikdə kəşf edək.', en: 'Let’s discover it together.', ru: 'Давай откроем это вместе.' },
    space: { az: 'Kosmos sirrini açır.', en: 'Space shares a secret.', ru: 'Космос открывает секрет.' },
    riddle: { az: 'Tapmacanın açarı ipucudadır.', en: 'The key to a riddle is in its clues.', ru: 'Ключ к загадке — в подсказках.' }
  },
  explainWhy: {
    science: { az: 'Alimlər də belə öyrənir: müşahidə edir, sual verir, yoxlayır.', en: 'Scientists learn just like this: they watch, ask and check.', ru: 'Учёные узнают всё именно так: наблюдают, спрашивают и проверяют.' },
    space: { az: 'Hər kosmik fakt gecə səmasına baxmağı daha maraqlı edir.', en: 'Every space fact makes the night sky more exciting to look at.', ru: 'Каждый факт о космосе делает ночное небо ещё интереснее.' },
    riddle: { az: 'Tapmaca ipucularını birləşdirməyi öyrədir — məntiq elə budur.', en: 'Riddles teach you to put clues together — that is what logic is.', ru: 'Загадки учат соединять подсказки — это и есть логика.' }
  }
};

EQD._qFact = function (topic, ri, hard, noEasier) {
  const bank = EQD.FACTS[topic];
  const pool = hard ? bank : bank.filter(f => !f.hard);
  const f = EQD._pick(ri, EQD._deck('fact:' + topic, noEasier), pool);
  const opts = EQD._shuffleAns(ri, [f.a].concat(f.no));
  const wordy = opts.some(o => o && typeof o === 'object');
  const at = l => o => (o && typeof o === 'object' ? o[l] : o);
  const answers = wordy ? EQD._L3(l => opts.map(at(l))) : opts;
  const correct = f.a;
  const out = f.no[0];
  const kind = topic === 'riddle' ? 'riddle' : (EQD.regionOf(topic) === 'station' ? 'space' : 'science');
  const T = EQD.FACT_TEXT;
  const q = Object.assign(EQD._rBase(topic), {
    name: T.name[topic], cardTitle: T.name[topic],
    title: f.q,
    visual: () => f.pic ? EQD.vPic(f.pic, 88) : '',
    answers: answers, correct: correct,
    tip: T.hint[topic],
    successLine: T.success[topic],
    praise: f.why,
    hint: {
      heading: { az: 'Az qaldı! Gəl birlikdə düşünək.', en: 'Almost! Let’s think it through together.', ru: 'Почти! Давай подумаем вместе.' },
      sub: T.hint[topic],
      panelTitle: { az: 'Bir seçimi sildim', en: 'I took one choice away', ru: 'Я убрал один вариант' },
      body: () => EQD.vStrike(opts.map(o => TX(o)), TX(out)),
      note: { az: 'İki seçim qaldı — hansı daha uyğundur?', en: 'Two choices left — which one fits better?', ru: 'Осталось два варианта — какой подходит лучше?' }
    },
    explain: {
      title: T.explainTitle[kind],
      text: f.why,
      why: T.explainWhy[kind],
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="flex:none;min-width:64px;height:64px;padding:0 10px;border-radius:20px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font:800 ${EQD.isShort(TX(f.a)) ? 40 : 16}px 'Baloo 2', system-ui;color:#fff;line-height:1">${TX(f.a)}</div><div class="bt" style="flex:1;font:700 13px Nunito;color:#C9BCEF;line-height:1.5">${TX(f.q)}</div></div>`
    }
  });
  if (!noEasier) q.easier = EQD._qFact(topic, ri, false, true);
  return q;
};

/* ── Artığı tap: 🍎 🍌 🚗 🍇 → 🚗 ── */
EQD.GROUPS = {
  fruit: { e: ['🍎', '🍌', '🍇', '🍐', '🍊', '🍓', '🍉', '🍋'], many: { az: 'meyvələr', en: 'fruits', ru: 'фрукты' }, one: { az: 'meyvə deyil', en: 'not a fruit', ru: 'не фрукт' } },
  veg: { e: ['🥕', '🥦', '🌽', '🥒', '🍆', '🥔'], many: { az: 'tərəvəzlər', en: 'vegetables', ru: 'овощи' }, one: { az: 'tərəvəz deyil', en: 'not a vegetable', ru: 'не овощ' } },
  animal: { e: ['🐶', '🐱', '🐰', '🐻', '🐮', '🐴', '🐷', '🐸'], many: { az: 'heyvanlar', en: 'animals', ru: 'животные' }, one: { az: 'heyvan deyil', en: 'not an animal', ru: 'не животное' } },
  vehicle: { e: ['🚗', '🚌', '🚲', '🚂', '✈️', '🚀', '⛵', '🚜'], many: { az: 'nəqliyyat vasitələri', en: 'things that carry people', ru: 'транспорт' }, one: { az: 'nəqliyyat vasitəsi deyil', en: 'not a vehicle', ru: 'не транспорт' } },
  clothes: { e: ['👕', '👖', '👗', '🧦', '🧥', '👟', '🧢', '🎩'], many: { az: 'geyimlər', en: 'clothes', ru: 'одежда' }, one: { az: 'geyim deyil', en: 'not something you wear', ru: 'не одежда' } },
  ball: { e: ['⚽', '🏀', '🎾', '🏈', '⚾', '🏐'], many: { az: 'toplar', en: 'balls', ru: 'мячи' }, one: { az: 'top deyil', en: 'not a ball', ru: 'не мяч' } },
  weather: { e: ['☀️', '🌧️', '❄️', '⛈️', '🌈', '☁️'], many: { az: 'hava hadisələri', en: 'kinds of weather', ru: 'явления погоды' }, one: { az: 'hava hadisəsi deyil', en: 'not weather', ru: 'не погода' } },
  music: { e: ['🎸', '🥁', '🎺', '🎻', '🎹'], many: { az: 'musiqi alətləri', en: 'musical instruments', ru: 'музыкальные инструменты' }, one: { az: 'musiqi aləti deyil', en: 'not an instrument', ru: 'не инструмент' } },
  sweet: { e: ['🍰', '🍭', '🍩', '🍪', '🍫', '🍬'], many: { az: 'şirniyyatlar', en: 'sweets', ru: 'сладости' }, one: { az: 'şirniyyat deyil', en: 'not a sweet', ru: 'не сладость' } }
};
/* the close calls: a hard question takes its odd one from a neighbouring group */
EQD.GROUP_NEAR = { fruit: ['veg', 'sweet'], veg: ['fruit'], sweet: ['fruit'] };

EQD._qOdd = function (ri, hard, noEasier) {
  const keys = Object.keys(EQD.GROUPS);
  const gk = EQD._pick(ri, EQD._deck('odd', noEasier), hard ? Object.keys(EQD.GROUP_NEAR) : keys);
  const near = EQD.GROUP_NEAR[gk];
  const far = keys.filter(k => k !== gk && (near || []).indexOf(k) < 0);
  const from = hard && near ? near : far;
  const ok = from[ri(0, from.length - 1)];
  const G = EQD.GROUPS[gk], O = EQD.GROUPS[ok];
  const three = EQD._shuffleAns(ri, G.e).slice(0, 3);
  const odd = O.e[ri(0, O.e.length - 1)];
  const answers = EQD._shuffleAns(ri, three.concat([odd]));
  const q = Object.assign(EQD._rBase('odd'), {
    name: { az: 'Yad qonaq', en: 'The stranger', ru: 'Чужак' },
    cardTitle: { az: 'Artığı tap', en: 'Find the odd one', ru: 'Найди лишнее' },
    title: {
      az: 'Qala qapısında dörd şəkil var.<br>Hansı artıqdır?',
      en: 'Four pictures guard the castle door.<br>Which one does not belong?',
      ru: 'На воротах замка четыре картинки.<br>Какая из них лишняя?'
    },
    visual: () => '',
    answers: answers, correct: odd,
    tip: {
      az: 'Hər şəklin adını de. Hansı üçü bir ailədəndir?',
      en: 'Name each picture. Which three belong to one family?',
      ru: 'Назови каждую картинку. Какие три из одной семьи?'
    },
    successLine: { az: `${odd} artıqdır!`, en: `${odd} is the odd one out!`, ru: `${odd} — лишний!` },
    praise: {
      az: `Qalan üçü — ${G.many.az}. Qrupu tapdın!`,
      en: `The other three are ${G.many.en} — you found the group!`,
      ru: `Остальные три — ${G.many.ru}. Ты нашёл группу!`
    },
    hint: {
      heading: { az: 'Az qaldı! Qrupu axtaraq.', en: 'Almost! Let’s look for the group.', ru: 'Почти! Поищем группу.' },
      sub: {
        az: 'Bu ikisi bir ailədəndir. Onlara bənzəyən üçüncünü tap — qalan artıqdır.',
        en: 'These two belong together. Find the third one like them — the one left over is the stranger.',
        ru: 'Эти двое из одной семьи. Найди третьего похожего — оставшийся и есть лишний.'
      },
      panelTitle: { az: 'Qrupu tap', en: 'Find the group', ru: 'Найди группу' },
      body: () => EQD.vSeq([three[0], three[1], '?'], true),
      note: { az: 'Meyvə? Heyvan? Geyim? Qrupun adını de.', en: 'Fruit? Animal? Clothes? Name the group.', ru: 'Фрукты? Животные? Одежда? Назови группу.' }
    },
    explain: {
      title: { az: 'Artığı tapmaq — qrupu tapmaqdır.', en: 'Finding the odd one means finding the group.', ru: 'Найти лишнее — значит найти группу.' },
      text: {
        az: `${three.join(' ')} — hamısı ${G.many.az}. ${odd} isə ${O.many.az} dəstəsindəndir.`,
        en: `${three.join(' ')} are all ${G.many.en}. ${odd} is ${G.one.en}, so it does not belong.`,
        ru: `${three.join(' ')} — это ${G.many.ru}. ${odd} — ${G.one.ru}, поэтому он лишний.`
      },
      why: {
        az: 'Şeyləri qruplara ayırmaq fikri qaydaya salır.',
        en: 'Sorting things into groups keeps your thinking tidy.',
        ru: 'Раскладывать вещи по группам — значит думать по порядку.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:12px"><div style="flex:1;display:flex;gap:6px;padding:8px;border-radius:16px;background:rgba(92,227,155,0.18);justify-content:center;font-size:30px;line-height:1">${three.join('')}</div><div style="flex:none;width:58px;height:58px;border-radius:16px;background:rgba(255,138,76,0.25);display:flex;align-items:center;justify-content:center;font-size:32px;line-height:1">${odd}</div></div>`
    }
  });
  if (!noEasier) q.easier = EQD._qOdd(ri, false, true);
  return q;
};

/* ── Şəkil naxışları: 🔴🔵🔴🔵🔴🔵 ? ── */
EQD.SEQ_SETS = [['🔴', '🔵', '⚪'], ['⭐', '🌙', '☀️'], ['🍎', '🍋', '🍇'], ['🐶', '🐱', '🐭'], ['❤️', '💙', '💚'], ['🔺', '🔷', '🔶'], ['🌸', '🍀', '🍄']];
EQD.SEQ_RULES = { easy: [[0, 1], [0, 0, 1]], hard: [[0, 1, 2], [0, 1, 1], [0, 0, 1, 1], [0, 1, 2, 1]] };

EQD._qSeq = function (ri, hard, noEasier) {
  const set = EQD._pick(ri, EQD._deck('seq', noEasier), EQD.SEQ_SETS);
  const rules = hard ? EQD.SEQ_RULES.hard : EQD.SEQ_RULES.easy;
  const rule = rules[ri(0, rules.length - 1)];
  const syms = EQD._shuffleAns(ri, set);
  const seq = [];
  for (let i = 0; i < 6; i++) seq.push(syms[rule[i % rule.length]]);
  const ans = syms[rule[6 % rule.length]];
  const unit = rule.map(k => syms[k]).join('');
  const q = Object.assign(EQD._rBase('seq'), {
    name: { az: 'Kilidin naxışı', en: 'The pattern lock', ru: 'Узорный замок' },
    cardTitle: { az: 'Naxışlı kilid', en: 'The pattern lock', ru: 'Узорный замок' },
    title: {
      az: 'Qala kilidindəki naxışa bax.<br>Növbəti hansı şəkil gəlir?',
      en: 'Look at the pattern on the castle lock.<br>Which picture comes next?',
      ru: 'Посмотри на узор на замке.<br>Какая картинка будет дальше?'
    },
    visual: () => EQD.vSeq(seq.concat(['?']), true),
    answers: EQD._shuffleAns(ri, set.slice()), correct: ans,
    tip: {
      az: 'Hansı hissə təkrarlanır? Barmağınla izlə.',
      en: 'Which part keeps repeating? Follow it with your finger.',
      ru: 'Какая часть повторяется? Проследи её пальцем.'
    },
    successLine: { az: 'Kilid açıldı!', en: 'The lock clicks open!', ru: 'Замок открылся!' },
    praise: {
      az: `Naxışda ${unit} təkrarlanır — sən onu tapdın!`,
      en: `The pattern repeats ${unit} — you cracked it!`,
      ru: `В узоре повторяется ${unit} — ты его разгадал!`
    },
    hint: {
      heading: { az: 'Az qaldı! Təkrarı tapaq.', en: 'Almost! Let’s find the repeat.', ru: 'Почти! Найдём повтор.' },
      sub: {
        az: `Təkrarlanan hissə budur: ${unit}. Onu sona qədər davam etdir.`,
        en: `This is the part that repeats: ${unit}. Keep it going to the end.`,
        ru: `Вот повторяющаяся часть: ${unit}. Продолжи её до конца.`
      },
      panelTitle: { az: 'Təkrarlanan hissə', en: 'The repeating part', ru: 'Повторяющаяся часть' },
      body: () => EQD.vSeq(rule.map(k => syms[k]), false),
      note: { az: 'Hissə bitəndə yenidən başlayır…', en: 'When the part ends, it starts again…', ru: 'Когда часть заканчивается, она начинается снова…' }
    },
    explain: {
      title: { az: 'Naxışlar təkrarlanır.', en: 'Patterns repeat.', ru: 'Узоры повторяются.' },
      text: {
        az: `Bu naxışda ${unit} təkrarlanır. Təkrarı davam etdirsən, növbəti ${ans} gəlir.`,
        en: `This pattern repeats ${unit}. Keep the repeat going and ${ans} comes next.`,
        ru: `В этом узоре повторяется ${unit}. Продолжи повтор — и дальше будет ${ans}.`
      },
      why: {
        az: 'Naxışı görən növbəti addımı təxmin etmir — bilir.',
        en: 'Once you see the pattern, you don’t guess the next step — you know it.',
        ru: 'Когда видишь узор, не гадаешь — ты знаешь следующий шаг.'
      },
      visual: () => `<div style="display:flex;gap:5px;justify-content:center;font-size:26px;line-height:1">${seq.concat([ans]).map((x, i) => `<span style="padding:5px;border-radius:10px;background:${i === 6 ? 'rgba(255,194,75,0.35)' : 'rgba(255,255,255,0.10)'}">${x}</span>`).join('')}</div>`
    }
  });
  if (!noEasier) q.easier = EQD._qSeq(ri, false, true);
  return q;
};

/* ── registration ──
   Appended to the same registry the daily set and the missions draw from, so every
   region topic is also a mission a grown-up can approve. Appending (never inserting)
   keeps the existing topics' mission seeds where they were. */
Object.assign(EQD.TOPIC_GEN, {
  letter: (ri, hard) => EQD._qLetter(ri, hard),
  word: (ri, hard, alt) => EQD._qWord(ri, hard, alt),
  missing: (ri, hard) => EQD._qMissing(ri, hard),
  build: (ri, hard) => EQD._qBuild(ri, hard),
  animals: (ri, hard) => EQD._qFact('animals', ri, hard),
  body: (ri, hard) => EQD._qFact('body', ri, hard),
  nature: (ri, hard) => EQD._qFact('nature', ri, hard),
  matter: (ri, hard) => EQD._qFact('matter', ri, hard),
  planets: (ri, hard) => EQD._qFact('planets', ri, hard),
  sky: (ri, hard) => EQD._qFact('sky', ri, hard),
  astro: (ri, hard) => EQD._qFact('astro', ri, hard),
  odd: (ri, hard) => EQD._qOdd(ri, hard),
  riddle: (ri, hard) => EQD._qFact('riddle', ri, hard),
  seq: (ri, hard) => EQD._qSeq(ri, hard)
});
/* reading words also come as a pairing board on alternate days */
EQD.ALT_TOPICS.word = 1;

/* ── one round in a region ──
   Five questions from the region's own topics, in the order the adaptive plan chose
   (EQT.plan over just those topics). Seeded by region + day + round, so leaving in the
   middle and coming back continues the same five, and a second round the same day is
   genuinely new practice. */
EQD._regionCache = {};
EQD.regionSet = function (region, key, plan) {
  const R = EQD.REGIONS[region];
  if (!R) return null;
  const topics = (plan && plan.length ? plan : R.topics.concat(R.topics)).slice(0, EQD.REGION_LEN);
  const ck = region + '|' + key + '|' + topics.join(',');
  if (EQD._regionCache[ck]) return EQD._regionCache[ck];
  let h = (EQD.REGION_ORDER.indexOf(region) + 1) * 7919;
  const s = String(key || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  const rnd = EQD.mulberry(h);
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const hard = t => (typeof EQT !== 'undefined' && EQT.hardFor) ? EQT.hardFor(t) : false;
  const set = {
    region: region, key: key, plan: topics.slice(),
    questions: topics.map((t, i) => EQD.TOPIC_GEN[t](ri, hard(t), EQD.formatFor(t, key, i)))
  };
  EQD._regionCache[ck] = set;
  return set;
};
