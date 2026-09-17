/* EduQuest — game data (trilingual az / en / ru; leaves are {az,en,ru} objects resolved via TX at render) */
const EQD = {};

EQD.RANKS = {
  1: { az: 'Toxumcuq', en: 'Seedling', ru: 'Росточек' },
  2: { az: 'Cücərti', en: 'Sprout', ru: 'Росток' },
  3: { az: 'Səyyah', en: 'Wanderer', ru: 'Странник' },
  4: { az: 'Kəşfiyyatçı', en: 'Scout', ru: 'Скаут' },
  5: { az: 'Macəraçı', en: 'Adventurer', ru: 'Искатель' },
  6: { az: 'Macəraçı', en: 'Adventurer', ru: 'Искатель' },
  7: { az: 'Kaşif', en: 'Explorer', ru: 'Исследователь' },
  8: { az: 'Yol Tapan', en: 'Pathfinder', ru: 'Следопыт' },
  9: { az: 'İz Salan', en: 'Trailblazer', ru: 'Первопроходец' },
  10: { az: 'Səyahətçi', en: 'Voyager', ru: 'Путешественник' },
  11: { az: 'Səyahətçi', en: 'Voyager', ru: 'Путешественник' },
  12: { az: 'Reyncer', en: 'Ranger', ru: 'Рейнджер' }
};
EQD.RANK_LEGEND = { az: 'Əfsanə', en: 'Legend', ru: 'Легенда' };
EQD.RANK_DEFAULT = { az: 'Macəraçı', en: 'Adventurer', ru: 'Искатель' };
EQD.XP_PER_LEVEL = 1500;

/* visual builders */
EQD.vGrid = function (rows, cols, color) {
  let out = '';
  for (let r = 0; r < rows; r++) {
    let row = '';
    for (let c = 0; c < cols; c++) row += `<div style="width:22px;height:22px;border-radius:7px;background:${color}"></div>`;
    out += `<div style="display:flex;gap:9px">${row}</div>`;
  }
  return `<div style="margin-top:12px;background:#FBE9CC;border-radius:20px;padding:12px;display:flex;flex-direction:column;gap:7px;align-items:center">${out}</div>`;
};

EQD.vApples = function (a, b) {
  return `<div style="margin-top:16px;display:flex;align-items:center;gap:10px">
    <div style="flex:1;background:#FBE9CC;border-radius:20px;padding:12px 10px">${EQC.appleBox(a)}<div style="text-align:center;font:800 16px 'Baloo 2';color:#8B7A55;margin-top:2px">${a}</div></div>
    <div style="font:800 26px 'Baloo 2';color:#8B7A55">+</div>
    <div style="flex:1;background:#FBE9CC;border-radius:20px;padding:12px 10px">${EQC.appleBox(b)}<div style="text-align:center;font:800 16px 'Baloo 2';color:#8B7A55;margin-top:2px">${b}</div></div>
  </div>`;
};

EQD.vNumberRow = function (nums, highlightLast) {
  const cells = nums.map((n, i) => {
    const last = i === nums.length - 1;
    if (last && highlightLast) return `<div style="flex:1;height:56px;border-radius:18px;background:rgba(123,92,255,0.18);box-shadow:0 0 0 2.5px #7B5CFF inset;display:flex;align-items:center;justify-content:center;font:800 20px 'Baloo 2';color:#7B5CFF">?</div>`;
    return `<div style="flex:1;height:56px;border-radius:18px;background:#7B5CFF;box-shadow:0 4px 0 #5B3FD6;display:flex;align-items:center;justify-content:center;font:800 20px 'Baloo 2';color:#fff">${n}</div>`;
  }).join('');
  return `<div style="margin-top:16px;display:flex;gap:7px">${cells}</div>`;
};

/* count-on hint strip (screen 10) */
EQD.hintCountOn = function (start, hops) {
  let cells = `<div style="width:52px;height:56px;border-radius:18px;background:#EAD9BC;display:flex;align-items:center;justify-content:center;font:800 22px 'Baloo 2';color:#8B7A55">${start}</div>`;
  let inner = '';
  for (let i = 1; i <= hops; i++) {
    if (i === hops) inner += `<div style="flex:1;height:56px;border-radius:18px;background:rgba(123,92,255,0.18);box-shadow:0 0 0 2.5px #7B5CFF inset;display:flex;align-items:center;justify-content:center;font:800 20px 'Baloo 2';color:#7B5CFF">?</div>`;
    else inner += `<div style="flex:1;height:56px;border-radius:18px;background:${i === hops - 1 ? '#9B7CFF' : '#7B5CFF'};box-shadow:0 4px 0 #5B3FD6;display:flex;align-items:center;justify-content:center;font:800 20px 'Baloo 2';color:#fff">${start + i}</div>`;
  }
  return `<div style="margin-top:18px;display:flex;gap:7px;align-items:flex-end">${cells}<div style="flex:1;display:flex;gap:6px">${inner}</div></div>`;
};

/* ── the day-0 quest: Open the Ancient Gate (hand-authored challenges 4–5) ── */
EQD.QUESTIONS = [
  { name: { az: 'İşıldaquşları say', en: 'Count the fireflies', ru: 'Сосчитай светлячков' }, subject: { az: 'Riyaziyyat', en: 'Math', ru: 'Математика' } },
  { name: { az: 'Meşə cığırını tap', en: 'Find the forest path', ru: 'Найди лесную тропу' }, subject: { az: 'Məntiq', en: 'Logic', ru: 'Логика' } },
  { name: { az: 'Fənərləri yandır', en: 'Light the lanterns', ru: 'Зажги фонарики' }, subject: { az: 'Riyaziyyat', en: 'Math', ru: 'Математика' } },
  {
    name: { az: 'Əjdahanın alma sayı', en: 'The dragon’s apple count', ru: 'Яблоки дракона' },
    subject: { az: 'Riyaziyyat', en: 'Math', ru: 'Математика' },
    subj: 'math',
    tag: { az: 'RİYAZİYYAT · ÜSTÜNƏ SAYMA', en: 'MATH · ADDING ON', ru: 'МАТЕМАТИКА · ПРИСЧИТЫВАНИЕ' },
    cardTitle: { az: 'Əjdahanın alma sayı', en: 'The dragon’s apple count', ru: 'Яблоки дракона' },
    cardStory: {
      az: 'Ac əjdaha körpünü qoruyur — almalarını say, o da səni keçməyə buraxsın.',
      en: 'A hungry dragon guards the bridge — count his apples and he’ll let you cross.',
      ru: 'Голодный дракон охраняет мост — сосчитай его яблоки, и он пропустит тебя.'
    },
    title: {
      az: 'Əjdahanın 7 alması var idi. Sən ona daha 5 alma verirsən.<br>İndi neçə alma var?',
      en: 'The dragon had 7 apples. You give him 5 more.<br>How many apples now?',
      ru: 'У дракона было 7 яблок. Ты даёшь ему ещё 5.<br>Сколько яблок теперь?'
    },
    visual: () => EQD.vApples(7, 5),
    answers: [11, 12, 13], correct: 12,
    tip: {
      az: 'Tələsmə. Yeddidən üstünə say — mən burada gözləyirəm.',
      en: 'Take your time. Count on from seven — I’ll wait right here.',
      ru: 'Не спеши. Считай дальше от семи — я подожду здесь.'
    },
    successLine: { az: '12 alma — əjdaha doydu!', en: '12 apples — the dragon is full', ru: '12 яблок — дракон сыт!' },
    praise: {
      az: 'Yeddidən üstünə saydın. Bu, ən sürətli yoldur!',
      en: 'You counted on from seven. That’s the fast way!',
      ru: 'Присчитывать от семи — самый быстрый способ, и у тебя получилось!'
    },
    hint: {
      heading: { az: 'Az qaldı! Gəl başqa yolla yoxlayaq.', en: 'Almost! Let’s try another way.', ru: 'Почти! Давай попробуем по-другому.' },
      sub: { az: '7-dən başla və mənimlə beş dəfə hoppan.', en: 'Start at 7 and hop five times with me.', ru: 'Начни с 7 и сделай со мной пять прыжков.' },
      panelTitle: { az: 'Mənimlə üstünə say', en: 'Count on with me', ru: 'Считай дальше со мной' },
      body: () => EQD.hintCountOn(7, 5),
      note: { az: 'Dörd hoppanış oldu. Biri qaldı.', en: 'Four hops done. One more to go.', ru: 'Четыре прыжка сделано. Остался один.' }
    },
    explain: {
      title: { az: 'Gəl bunu birlikdə həll edək.', en: 'Let’s figure this out together.', ru: 'Давай разберёмся вместе.' },
      text: {
        az: 'Üstünə saymaq birdən başlamamaq deməkdir. Əjdahanın artıq 7 alması var, ona görə «yeddi» deyirik və yenilərini sayırıq: 8, 9, 10, 11, 12.',
        en: 'Adding on means we don’t start from one. The dragon already has 7 apples, so we say “seven” and count the new ones: 8, 9, 10, 11, 12.',
        ru: 'Присчитывание значит, что мы не начинаем с единицы. У дракона уже 7 яблок, поэтому говорим «семь» и считаем новые: 8, 9, 10, 11, 12.'
      },
      why: {
        az: 'Böyük ədəddən başlamaq ilk 7 almanı yenidən saymaqdan xilas edir — cavab eynidir, yol isə qısadır.',
        en: 'Starting from the bigger number saves you counting the first 7 all over again — the answer is the same, the trip is shorter.',
        ru: 'Если начать с большего числа, не придётся заново считать первые 7 яблок — ответ тот же, а путь короче.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px">
        <svg width="96" height="96" viewBox="0 0 150 96">${EQC.apple(30, 26)}${EQC.apple(66, 22)}${EQC.apple(102, 28)}${EQC.apple(48, 60)}${EQC.apple(86, 62)}</svg>
        <div style="flex:1"><div style="font:800 15px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Beş təzə alma', en: 'Five new apples', ru: 'Пять новых яблок' })}</div><div style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: '«Yeddi» de, sonra sayaraq hər təzə almaya toxun.', en: 'Say “seven”, then touch each new apple as you count up.', ru: 'Скажи «семь», а потом касайся каждого нового яблока и считай дальше.' })}</div></div>
      </div>`
    },
    easier: {
      subj: 'math',
      tag: { az: 'RİYAZİYYAT · ÜSTÜNƏ SAYMA', en: 'MATH · ADDING ON', ru: 'МАТЕМАТИКА · ПРИСЧИТЫВАНИЕ' },
      subject: { az: 'Riyaziyyat', en: 'Math', ru: 'Математика' },
      cardTitle: { az: 'Daha kiçik qəlyanaltı', en: 'A smaller snack', ru: 'Перекус поменьше' },
      title: {
        az: 'Əjdahanın 5 alması var idi. Sən ona daha 2 alma verirsən.<br>İndi neçə alma var?',
        en: 'The dragon had 5 apples. You give him 2 more.<br>How many apples now?',
        ru: 'У дракона было 5 яблок. Ты даёшь ему ещё 2.<br>Сколько яблок теперь?'
      },
      visual: () => EQD.vApples(5, 2),
      answers: [6, 7, 8], correct: 7,
      tip: { az: '«Beş» de, sonra iki təzəni say.', en: 'Say “five”, then count the two new ones.', ru: 'Скажи «пять», потом сосчитай два новых.' },
      successLine: { az: '7 alma — əla məşq!', en: '7 apples — great warm-up!', ru: '7 яблок — отличная разминка!' },
      praise: { az: 'Gördün? Üstünə sayma həmişə işləyir.', en: 'See? Counting on works every time.', ru: 'Видишь? Присчитывание работает всегда.' },
      hint: {
        heading: { az: 'Az qaldı! Gəl birlikdə hoppanaq.', en: 'Almost! Let’s hop together.', ru: 'Почти! Давай прыгать вместе.' },
        sub: { az: '5-dən başla və mənimlə iki dəfə hoppan.', en: 'Start at 5 and hop two times with me.', ru: 'Начни с 5 и сделай со мной два прыжка.' },
        panelTitle: { az: 'Mənimlə üstünə say', en: 'Count on with me', ru: 'Считай дальше со мной' },
        body: () => EQD.hintCountOn(5, 2),
        note: { az: 'Bir hoppanış oldu. Biri qaldı.', en: 'One hop done. One more to go.', ru: 'Один прыжок сделан. Остался ещё один.' }
      }
    }
  },
  {
    name: { az: 'Naxış Möhürü', en: 'Seal of Patterns', ru: 'Печать Узоров' },
    subject: { az: 'Məntiq', en: 'Logic', ru: 'Логика' },
    subj: 'logic',
    tag: { az: 'MƏNTİQ · NAXIŞLAR', en: 'LOGIC · PATTERNS', ru: 'ЛОГИКА · УЗОРЫ' },
    cardTitle: { az: 'Naxış Möhürü', en: 'Seal of Patterns', ru: 'Печать Узоров' },
    cardStory: {
      az: 'Sonuncu möhür ritmlə işıq saçır: 2, 4, 6, 8… onu qırmaq üçün növbəti ədədi de.',
      en: 'The last seal glows in a rhythm: 2, 4, 6, 8… say the next number to break it.',
      ru: 'Последняя печать светится в ритме: 2, 4, 6, 8… назови следующее число, чтобы снять её.'
    },
    title: {
      az: 'Qapının işıqları 2, 4, 6, 8… yanır.<br>Növbəti hansı ədəd yanacaq?',
      en: 'The gate lights glow 2, 4, 6, 8…<br>Which number glows next?',
      ru: 'Огни ворот светятся: 2, 4, 6, 8…<br>Какое число загорится следующим?'
    },
    visual: () => EQD.vNumberRow([2, 4, 6, 8, '?'], true),
    answers: [9, 10, 12], correct: 10,
    tip: {
      az: 'İşıqlar addım-addım sayır. Hər sıçrayış eyni ölçüdədir.',
      en: 'The lights are skip counting. Each jump is the same size.',
      ru: 'Огни считают через число. Каждый прыжок одинаковый.'
    },
    successLine: { az: '10! Sonuncu möhür qırıldı', en: '10! The last seal is broken', ru: '10! Последняя печать снята' },
    praise: { az: 'İki-iki sıçrayışı tapdın. Naxış ustası!', en: 'You spotted the jump of two. Pattern master!', ru: 'Прыжки по два разгаданы. Мастер узоров!' },
    hint: {
      heading: { az: 'Az qaldı! Sıçrayışlara bax.', en: 'Almost! Look at the jumps.', ru: 'Почти! Посмотри на прыжки.' },
      sub: {
        az: '2-dən 4-ə sıçrayış 2-dir. 4-dən 6-ya da elə. Sıçramağa davam et.',
        en: 'From 2 to 4 is a jump of 2. From 4 to 6 too. Keep jumping.',
        ru: 'От 2 до 4 — прыжок на 2. От 4 до 6 — тоже. Продолжай прыгать.'
      },
      panelTitle: { az: 'İki-iki sıçra', en: 'Jump by two', ru: 'Прыгай по два' },
      body: () => EQD.vNumberRow([2, 4, 6, 8, '?'], true),
      note: { az: '8-dən sonra daha bir 2-lik sıçrayış…', en: 'One more jump of 2 after 8…', ru: 'Ещё один прыжок на 2 после 8…' }
    },
    explain: {
      title: { az: 'Naxışlar eyni hərəkəti təkrarlayır.', en: 'Patterns repeat the same move.', ru: 'Узоры повторяют одно и то же движение.' },
      text: {
        az: 'Bu naxış hər dəfə 2 əlavə edir: 2, 4, 6, 8. Sonuncu ədəd nə olursa olsun, növbəti sadəcə «üstəgəl iki»dir.',
        en: 'This pattern adds 2 every time: 2, 4, 6, 8. Whatever the last number is, the next one is just “plus two”.',
        ru: 'Этот узор каждый раз добавляет 2: 2, 4, 6, 8. Каким бы ни было последнее число, следующее — просто «плюс два».'
      },
      why: {
        az: 'Qaydanı biləndə heç vaxt təxmin etməli olmursan — naxışı sonsuza qədər davam etdirə bilərsən.',
        en: 'When you know the rule, you never have to guess — you can keep the pattern going forever.',
        ru: 'Когда знаешь правило, не нужно угадывать — узор можно продолжать бесконечно.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px">
        <svg width="96" height="80" viewBox="0 0 120 80"><g fill="#FFC24B"><circle cx="16" cy="56" r="10"></circle><circle cx="44" cy="44" r="10"></circle><circle cx="72" cy="32" r="10"></circle><circle cx="100" cy="20" r="10"></circle></g><path d="M22 48 q8-10 16 0 M50 36 q8-10 16 0 M78 24 q8-10 16 0" stroke="#5CE39B" stroke-width="3" fill="none" stroke-linecap="round"></path></svg>
        <div style="flex:1"><div style="font:800 15px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Eyni ölçülü sıçrayışlar', en: 'Same-size jumps', ru: 'Одинаковые прыжки' })}</div><div style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: 'Hər hoppanış ikilik qalxır. 8-dən bir dəfə də hoppan.', en: 'Every hop climbs by two. Hop once more from 8.', ru: 'Каждый прыжок поднимает на два. Прыгни ещё раз от 8.' })}</div></div>
      </div>`
    },
    easier: {
      subj: 'logic',
      tag: { az: 'MƏNTİQ · NAXIŞLAR', en: 'LOGIC · PATTERNS', ru: 'ЛОГИКА · УЗОРЫ' },
      subject: { az: 'Məntiq', en: 'Logic', ru: 'Логика' },
      cardTitle: { az: 'Daha sakit ritm', en: 'A gentler rhythm', ru: 'Ритм попроще' },
      title: {
        az: 'İşıqlar 1, 2, 3, 4… yanır.<br>Növbəti hansı ədəd yanacaq?',
        en: 'The lights glow 1, 2, 3, 4…<br>Which number glows next?',
        ru: 'Огни светятся: 1, 2, 3, 4…<br>Какое число загорится следующим?'
      },
      visual: () => EQD.vNumberRow([1, 2, 3, 4, '?'], true),
      answers: [5, 6, 7], correct: 5,
      tip: { az: 'Bu, hər dəfə bir addım qalxır.', en: 'This one climbs one step at a time.', ru: 'Здесь числа растут по одному.' },
      successLine: { az: '5! Ritmi qorudun', en: '5! You kept the rhythm', ru: '5! Ритм сохранён' },
      praise: { az: 'Addım-addım — naxış elə budur.', en: 'One step at a time — that’s all a pattern is.', ru: 'Шаг за шагом — в этом весь узор.' },
      hint: {
        heading: { az: 'Az qaldı! Addım-addım.', en: 'Almost! One step at a time.', ru: 'Почти! Шаг за шагом.' },
        sub: { az: 'Hər işıq əvvəlkindən bir çoxdur.', en: 'Each light is one more than the last.', ru: 'Каждый огонёк на один больше предыдущего.' },
        panelTitle: { az: 'Bir-bir addımla', en: 'Step by one', ru: 'Шагай по одному' },
        body: () => EQD.vNumberRow([1, 2, 3, 4, '?'], true),
        note: { az: '4-dən dərhal sonra nə gəlir?', en: 'What comes right after 4?', ru: 'Что идёт сразу после 4?' }
      }
    }
  }
];

/* ── boss: the Math Dragon (4 knowledge hits) ── */
EQD.BOSS = [
  {
    subj: 'math',
    tag: { az: 'RİYAZİYYAT · QRUPLARLA', en: 'MATH · GROUPS OF', ru: 'МАТЕМАТИКА · ГРУППЫ' },
    meta: { az: 'Nə qədər istəsən vaxt ayır', en: 'Take as long as you like', ru: 'Времени сколько угодно' },
    title: {
      az: 'Möhürdə 4 kristaldan ibarət 3 sıra var.<br>Cəmi neçə kristal var?',
      en: 'The seal shows 3 rows of 4 crystals.<br>How many crystals in all?',
      ru: 'На печати 3 ряда по 4 кристалла.<br>Сколько всего кристаллов?'
    },
    visual: () => EQD.vGrid(3, 4, '#7B5CFF'),
    answers: [7, 12, 16], correct: 12,
    successLine: { az: '3 sıra × 4 = 12!', en: '3 rows of 4 make 12!', ru: '3 ряда по 4 — это 12!' },
    hint: {
      heading: { az: 'Az qaldı! Sıra-sıra say.', en: 'Almost! Count row by row.', ru: 'Почти! Считай ряд за рядом.' },
      sub: { az: 'Hər sırada 4 kristal var. 4… 8… de və davam et.', en: 'Each row holds 4 crystals. Say 4… 8… and keep going.', ru: 'В каждом ряду 4 кристалла. Скажи 4… 8… и продолжай.' },
      panelTitle: { az: 'Dörd-dörd say', en: 'Count by fours', ru: 'Считай по четыре' },
      body: () => EQD.vNumberRow([4, 8, '?'], true),
      note: { az: 'İki sıra sayıldı. 4-lük bir sıra qaldı.', en: 'Two rows counted. One row of 4 to go.', ru: 'Два ряда сосчитаны. Остался один ряд из 4.' }
    },
    explain: {
      title: { az: 'Sıralar saymağı sürətləndirir.', en: 'Rows make counting fast.', ru: 'Ряды ускоряют счёт.' },
      text: {
        az: 'Hər kristala toxunmaq əvəzinə bütöv sıranı birdən say: 4, sonra 8, sonra 12. Dördlük üç sıra — dördlük üç sıçrayışdır.',
        en: 'Instead of touching every crystal, count a whole row at once: 4, then 8, then 12. Three rows of four is three jumps of four.',
        ru: 'Вместо того чтобы трогать каждый кристалл, считай сразу целый ряд: 4, потом 8, потом 12. Три ряда по четыре — это три прыжка по четыре.'
      },
      why: {
        az: 'Qruplar böyük şeyləri tez saymağa imkan verir — vurma elə budur.',
        en: 'Groups let you count big things quickly — that’s what multiplying is.',
        ru: 'Группы позволяют быстро считать большое — это и есть умножение.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="transform:scale(0.8);transform-origin:left center">${EQD.vGrid(3, 4, '#C8B4FF')}</div><div style="flex:1"><div style="font:800 15px 'Baloo 2', system-ui;color:#fff">4 + 4 + 4</div><div style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: 'Üç bərabər sıra. Dörd-dörd, üç dəfə sıçra.', en: 'Three equal rows. Jump by four, three times.', ru: 'Три равных ряда. Прыгай по четыре, три раза.' })}</div></div></div>`
    }
  },
  {
    subj: 'math',
    tag: { az: 'RİYAZİYYAT · ÜSTÜNƏ SAYMA', en: 'MATH · ADDING ON', ru: 'МАТЕМАТИКА · ПРИСЧИТЫВАНИЕ' },
    meta: { az: 'Taymer yoxdur, tələsmə', en: 'No timer, no rush', ru: 'Без таймера, без спешки' },
    title: {
      az: 'Əjdaha 6 tüstü halqası buraxır,<br>sonra daha 6. Cəmi neçə halqa?',
      en: 'The dragon breathes 6 smoke rings,<br>then 6 more. How many rings?',
      ru: 'Дракон выдыхает 6 колец дыма,<br>потом ещё 6. Сколько колец?'
    },
    visual: () => EQD.vGrid(2, 6, '#45C6F0'),
    answers: [10, 12, 14], correct: 12,
    successLine: { az: '12 halqa — qoşalar sürətlidir!', en: '12 rings — doubles are quick!', ru: '12 колец — удвоение работает быстро!' },
    hint: {
      heading: { az: 'Az qaldı! Burada qoşalar kömək edir.', en: 'Almost! Doubles help here.', ru: 'Почти! Здесь помогают двойные.' },
      sub: { az: '6 və 6 qoşadır. Altıdan üstünə say: 7, 8, 9…', en: '6 and 6 is a double. Count on from six: 7, 8, 9…', ru: '6 и 6 — это двойное. Считай дальше от шести: 7, 8, 9…' },
      panelTitle: { az: 'Altıdan üstünə say', en: 'Count on from six', ru: 'Считай дальше от шести' },
      body: () => EQD.hintCountOn(6, 6),
      note: { az: 'Beş hoppanış oldu. Biri qaldı.', en: 'Five hops done. One more to go.', ru: 'Пять прыжков сделано. Остался один.' }
    },
    explain: {
      title: { az: 'Qoşalar qısayoldur.', en: 'Doubles are a shortcut.', ru: 'Двойные — это короткий путь.' },
      text: {
        az: 'Hər iki qrup eyni ölçüdə olanda cavabı bir fakt kimi öyrənə bilərsən: 6 + 6 = 12. Bir dəfə bildinsə, saymağa ehtiyac yoxdur.',
        en: 'When both groups are the same size, you can learn the answer as one fact: 6 + 6 = 12. No counting needed once you know it.',
        ru: 'Когда обе группы одинаковые, ответ можно запомнить как один факт: 6 + 6 = 12. Знаешь его — считать не нужно.'
      },
      why: {
        az: 'Qoşalar tez-tez qarşına çıxır — onları bilmək böyük cəmləri asanlaşdırır.',
        en: 'Doubles come up all the time — knowing them makes bigger sums easy.',
        ru: 'Двойные встречаются постоянно — зная их, легче складывать большие числа.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="transform:scale(0.8);transform-origin:left center">${EQD.vGrid(2, 6, '#8FDCF7')}</div><div style="flex:1"><div style="font:800 15px 'Baloo 2', system-ui;color:#fff">6 + 6</div><div style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: 'İki bərabər halqa sırası — yadda saxlaya biləcəyin qoşa.', en: 'Two equal rows of rings — a double you can remember.', ru: 'Два равных ряда колец — двойное, которое легко запомнить.' })}</div></div></div>`
    }
  },
  {
    subj: 'math',
    tag: { az: 'RİYAZİYYAT · ÇIXMA', en: 'MATH · TAKING AWAY', ru: 'МАТЕМАТИКА · ВЫЧИТАНИЕ' },
    meta: { az: 'Nə qədər istəsən vaxt ayır', en: 'Take as long as you like', ru: 'Времени сколько угодно' },
    title: {
      az: 'Körpünün 15 taxtası var.<br>Artıq 6 taxta düzəldilib. Neçəsi qalıb?',
      en: 'The bridge has 15 planks.<br>6 are already fixed. How many left?',
      ru: 'У моста 15 досок.<br>6 уже починены. Сколько осталось?'
    },
    visual: () => EQD.vGrid(3, 5, '#C9762F'),
    answers: [8, 9, 11], correct: 9,
    successLine: { az: '9 taxta qalıb — az qala keçdik!', en: '9 planks to go — nearly across!', ru: 'Осталось 9 досок — почти перешли!' },
    hint: {
      heading: { az: 'Az qaldı! 15-dən geriyə say.', en: 'Almost! Count back from 15.', ru: 'Почти! Считай назад от 15.' },
      sub: { az: 'Düzəldilmiş 6 taxtanı bir-bir çıx: 14, 13, 12…', en: 'Take the 6 fixed planks away one at a time: 14, 13, 12…', ru: 'Убирай 6 починенных досок по одной: 14, 13, 12…' },
      panelTitle: { az: 'Mənimlə geriyə say', en: 'Count back with me', ru: 'Считай назад со мной' },
      body: () => EQD.vNumberRow([14, 13, 12, 11, 10, '?'], true),
      note: { az: 'Beş addım geriyə. Bir addım da…', en: 'Five steps back. One more step…', ru: 'Пять шагов назад. Ещё один шаг…' }
    },
    explain: {
      title: { az: 'Çıxmaq geriyə saymaqdır.', en: 'Taking away is counting back.', ru: 'Вычитать — значит считать назад.' },
      text: {
        az: '15-dən başla və 6 dəfə geriyə addımla: 14, 13, 12, 11, 10, 9. Düşdüyün ədəd qalan saydır.',
        en: 'Start at 15 and step backwards 6 times: 14, 13, 12, 11, 10, 9. The number you land on is what’s left.',
        ru: 'Начни с 15 и сделай 6 шагов назад: 14, 13, 12, 11, 10, 9. Число, на котором остановишься, — то, что осталось.'
      },
      why: {
        az: 'Geriyə sayma istənilən «neçəsi qalıb?» sualında işləyir.',
        en: 'Counting back works for any “how many are left?” question.',
        ru: 'Счёт назад работает для любого вопроса «сколько осталось?».'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="transform:scale(0.8);transform-origin:left center">${EQD.vGrid(3, 5, '#E0A365')}</div><div style="flex:1"><div style="font:800 15px 'Baloo 2', system-ui;color:#fff">15 − 6</div><div style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: 'Altı taxta hazırdır — on beşdən altı addım geriyə get.', en: 'Six planks are done — step back six from fifteen.', ru: 'Шесть досок готовы — отступи на шесть от пятнадцати.' })}</div></div></div>`
    }
  },
  {
    subj: 'math',
    tag: { az: 'RİYAZİYYAT · QRUPLARLA', en: 'MATH · GROUPS OF', ru: 'МАТЕМАТИКА · ГРУППЫ' },
    meta: { az: 'Sonuncudur — bacaracaqsan!', en: 'Last one — you’ve got this', ru: 'Последний — у тебя получится!' },
    title: {
      az: 'Əjdahanın hər tərəfində 4 qanadı var.<br>Cəmi neçə qanad var?',
      en: 'The dragon has 4 wings on each side.<br>How many wings in all?',
      ru: 'У дракона по 4 крыла с каждой стороны.<br>Сколько всего крыльев?'
    },
    visual: () => EQD.vGrid(2, 4, '#FF8A4C'),
    answers: [6, 8, 10], correct: 8,
    successLine: { az: '8 qanad — körpü açıldı!', en: '8 wings — the bridge is open!', ru: '8 крыльев — мост открыт!' },
    hint: {
      heading: { az: 'Az qaldı! İki bərabər qrup.', en: 'Almost! Two equal groups.', ru: 'Почти! Две равные группы.' },
      sub: { az: 'Bir tərəfdə 4, o biri tərəfdə 4. Dörddən üstünə say.', en: '4 on one side, 4 on the other. Count on from four.', ru: '4 с одной стороны, 4 с другой. Считай дальше от четырёх.' },
      panelTitle: { az: 'Dörddən üstünə say', en: 'Count on from four', ru: 'Считай дальше от четырёх' },
      body: () => EQD.hintCountOn(4, 4),
      note: { az: 'Üç hoppanış oldu. Biri qaldı.', en: 'Three hops done. One more to go.', ru: 'Три прыжка сделано. Остался один.' }
    },
    explain: {
      title: { az: 'Dördlük iki qrup.', en: 'Two groups of four.', ru: 'Две группы по четыре.' },
      text: { az: 'Hər tərəfdə 4 qanad var. 4 + 4 daha bir qoşadır: 8.', en: 'Each side has 4 wings. 4 + 4 is another double: 8.', ru: 'С каждой стороны 4 крыла. 4 + 4 — ещё одно двойное: 8.' },
      why: {
        az: 'Eyni ölçülü qruplar bir-bir saymaq əvəzinə ikiqat etməyə imkan verir.',
        en: 'Same-size groups mean you can double instead of counting one by one.',
        ru: 'Равные группы позволяют удваивать, а не считать по одному.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="transform:scale(0.8);transform-origin:left center">${EQD.vGrid(2, 4, '#FFB08A')}</div><div style="flex:1"><div style="font:800 15px 'Baloo 2', system-ui;color:#fff">4 + 4</div><div style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: 'Bir tərəf, sonra o biri. İkiqat elə.', en: 'One side, then the other. Double it.', ru: 'Одна сторона, потом другая. Удвой.' })}</div></div></div>`
    }
  }
];

/* ── wardrobe ── */
EQD.OUTFITS = [
  ['#3DBE6E', '#2A9455', { az: 'Yarpaq', en: 'Leaf', ru: 'Лист' }],
  ['#45C6F0', '#2196C9', { az: 'Səma', en: 'Sky', ru: 'Небо' }],
  ['#7B5CFF', '#5B3FD6', { az: 'Sehr', en: 'Magic', ru: 'Магия' }],
  ['#FF8A4C', '#E06327', { az: 'Mərcan', en: 'Coral', ru: 'Коралл' }],
  ['#FF5D73', '#D63A52', { az: 'Giləmeyvə', en: 'Berry', ru: 'Ягода' }]
];
EQD.SHOES = [
  ['#5B3FD6', { az: 'Bənövşə', en: 'Violet', ru: 'Фиалка' }],
  ['#2A9455', { az: 'Meşə', en: 'Forest', ru: 'Лес' }],
  ['#E06327', { az: 'Köz', en: 'Ember', ru: 'Уголёк' }],
  ['#3A2A4E', { az: 'Gecə', en: 'Night', ru: 'Ночь' }]
];
EQD.FURS = [
  ['#FF9243', '#F0762A', { az: 'Tülkü', en: 'Fox', ru: 'Лис' }],
  ['#7B5CFF', '#5B3FD6', { az: 'Sehr', en: 'Magic', ru: 'Магия' }],
  ['#45C6F0', '#2196C9', { az: 'Səma', en: 'Sky', ru: 'Небо' }],
  ['#3DBE6E', '#2A9455', { az: 'Yarpaq', en: 'Leaf', ru: 'Лист' }]
];

/* ══════════════════════════════════════════════════════════
   Daily quest generator — a new quest set every calendar day,
   seeded by day number so the same day always shows the same
   questions. No backend needed. All text carries az/en/ru;
   TX() picks the active language at render time, so a language
   switch applies instantly even to cached sets.
   ══════════════════════════════════════════════════════════ */

EQD.THEMES = [
  {
    title: { az: 'Yatmış Ağacları Oyat', en: 'Wake the Sleeping Trees', ru: 'Разбуди Спящие Деревья' },
    headline: { az: 'Questy-yə yatmış ağacları oyatmağa kömək et!', en: 'Help Questy wake the sleeping trees!', ru: 'Помоги Квести разбудить спящие деревья!' },
    chestTitle: { az: 'Yuxulu Meşəliyin<br>Xəzinəsi', en: 'Sleeping Grove<br>Treasure', ru: 'Сокровище<br>Сонной Рощи' },
    progressLine: (done) => done >= 5
      ? TX({ az: 'Bütün ağaclar oyandı!', en: 'All trees are done!', ru: 'Все деревья разбужены!' })
      : TX({ az: `${done} ağac oyandı. ${5 - done} qaldı.`, en: `${done} of 5 trees done. ${5 - done} to go.`, ru: `Разбужено деревьев: ${done} из 5. Осталось ${5 - done}.` })
  },
  {
    title: { az: 'İşıldaquş Fənərlərini Yandır', en: 'Light the Firefly Lanterns', ru: 'Зажги Фонарики Светлячков' },
    headline: { az: 'Questy-yə işıldaquş fənərlərini yandırmağa kömək et!', en: 'Help Questy light the firefly lanterns!', ru: 'Помоги Квести зажечь фонарики светлячков!' },
    chestTitle: { az: 'Fənərli Meşəliyin<br>Xəzinəsi', en: 'Lantern Grove<br>Treasure', ru: 'Сокровище<br>Фонарной Рощи' },
    progressLine: (done) => done >= 5
      ? TX({ az: 'Bütün fənərlər yandı!', en: 'All lanterns are done!', ru: 'Все фонарики зажжены!' })
      : TX({ az: `${done} fənər yandı. ${5 - done} qaldı.`, en: `${done} of 5 lanterns done. ${5 - done} to go.`, ru: `Зажжено фонариков: ${done} из 5. Осталось ${5 - done}.` })
  },
  {
    title: { az: 'Göy Qurşağı Körpüsünü Düzəlt', en: 'Fix the Rainbow Bridge', ru: 'Почини Радужный Мост' },
    headline: { az: 'Questy-yə göy qurşağı körpüsünü düzəltməyə kömək et!', en: 'Help Questy fix the rainbow bridge!', ru: 'Помоги Квести починить радужный мост!' },
    chestTitle: { az: 'Göy Qurşağı Körpüsünün<br>Xəzinəsi', en: 'Rainbow Bridge<br>Treasure', ru: 'Сокровище<br>Радужного Моста' },
    progressLine: (done) => done >= 5
      ? TX({ az: 'Bütün taxtalar hazırdır!', en: 'All planks are done!', ru: 'Все доски починены!' })
      : TX({ az: `${done} taxta düzəldi. ${5 - done} qaldı.`, en: `${done} of 5 planks done. ${5 - done} to go.`, ru: `Починено досок: ${done} из 5. Осталось ${5 - done}.` })
  },
  {
    title: { az: 'İtmiş Ulduzu Tap', en: 'Find the Lost Star', ru: 'Найди Потерянную Звезду' },
    headline: { az: 'Questy-yə itmiş ulduzu tapmağa kömək et!', en: 'Help Questy find the lost star!', ru: 'Помоги Квести найти потерянную звезду!' },
    chestTitle: { az: 'Düşən Ulduzun<br>Xəzinəsi', en: 'Fallen Star<br>Treasure', ru: 'Сокровище<br>Упавшей Звезды' },
    progressLine: (done) => done >= 5
      ? TX({ az: 'Bütün ipucları tapıldı!', en: 'All clues are done!', ru: 'Все подсказки найдены!' })
      : TX({ az: `${done} ipucu tapıldı. ${5 - done} qaldı.`, en: `${done} of 5 clues done. ${5 - done} to go.`, ru: `Найдено подсказок: ${done} из 5. Осталось ${5 - done}.` })
  },
  {
    title: { az: 'Oxuyan Çayı Azad Et', en: 'Free the Singing River', ru: 'Освободи Поющую Реку' },
    headline: { az: 'Questy-yə oxuyan çayı azad etməyə kömək et!', en: 'Help Questy free the singing river!', ru: 'Помоги Квести освободить поющую реку!' },
    chestTitle: { az: 'Oxuyan Çayın<br>Xəzinəsi', en: 'Singing River<br>Treasure', ru: 'Сокровище<br>Поющей Реки' },
    progressLine: (done) => done >= 5
      ? TX({ az: 'Bütün daşlar açıldı!', en: 'All stones are done!', ru: 'Все камни освобождены!' })
      : TX({ az: `${done} daş açıldı. ${5 - done} qaldı.`, en: `${done} of 5 stones done. ${5 - done} to go.`, ru: `Освобождено камней: ${done} из 5. Осталось ${5 - done}.` })
  }
];

/* ── chapters ──
   A chapter is 3 stages. Stages 1–2 close with the chapter's ordinary guardian;
   stage 3 closes with the chapter finale — a named boss with its own arena, its
   own colours and a longer fight (6 hits instead of 4). Chapters loop, so a child
   who plays past the last one starts the cycle again with the numbering carried on. */
EQD.STAGES_PER_CHAPTER = 3;

EQD.CHAPTERS = [
  {
    id: 'forest',
    region: { az: 'BİLİK MEŞƏSİ', en: 'KNOWLEDGE FOREST', ru: 'ЛЕС ЗНАНИЙ' },
    name: { az: 'Pıçıldayan Meşəlik', en: 'The Whispering Grove', ru: 'Шепчущая Роща' },
    title: { az: 'İtmiş Bilik Kristalı', en: 'The Missing Knowledge Crystal', ru: 'Пропавший Кристалл Знаний' },
    /* Questy's line on the details screen */
    hook: {
      az: '«Kristal dünən gecə yoxa çıxdı. Onsuz ağaclar böyüməyi unudur — onu evə qaytarmalıyıq.»',
      en: '"The crystal vanished last night. Without it the trees forget how to grow — we have to bring it home."',
      ru: '«Кристалл исчез прошлой ночью. Без него деревья забывают, как расти, — мы должны вернуть его домой.»'
    },
    mission: { az: 'Kristalı tap və meşəni oyat', en: 'Find the crystal and wake the forest', ru: 'Найди кристалл и разбуди лес' },
    /* the ordinary guardian of stages 1–2 */
    guardian: {
      name: { az: 'Riyaziyyat Əjdahası', en: 'Math Dragon', ru: 'Дракон Математики' },
      role: { az: 'KÖRPÜNÜN KEŞİKÇİSİ', en: 'GUARDIAN OF THE BRIDGE', ru: 'ХРАНИТЕЛЬ МОСТА' },
      awaits: { az: 'Riyaziyyat Əjdahası gözləyir', en: 'The Math Dragon awaits', ru: 'Дракон Математики ждёт' },
      face: { az: 'Riyaziyyat Əjdahası ilə üzləş', en: 'Face the Math Dragon', ru: 'Сразись с Драконом Математики' },
      befriended: { az: 'Riyaziyyat Əjdahası artıq sənin dostundur', en: 'The Math Dragon is your friend now', ru: 'Дракон Математики теперь твой друг' },
      done: { az: 'Riyaziyyat Əjdahası ilə dost olduq', en: 'The Math Dragon befriended', ru: 'Дракон Математики стал другом' },
      banner: { az: 'KÖRPÜ AÇIQDIR', en: 'BRIDGE OPEN', ru: 'МОСТ ОТКРЫТ' },
      badge: { az: 'Körpü Keşikçisi', en: 'Bridge Keeper', ru: 'Хранитель Моста' },
      badgeNote: { az: 'Bilik Meşəsində boss məğlub edildi', en: 'Boss cleared in Knowledge Forest', ru: 'Босс Леса Знаний побеждён' },
      hits: 4, sky: '#2A1B4A', floor: '#1E1338', glow: 'rgba(255,138,76,0.30)', accent: '#FF8A4C', accentSoft: '#FFB08A'
    },
    /* the chapter finale — stage 3 only */
    finale: {
      name: { az: 'Kristal Kölgəsi', en: 'The Crystal Shade', ru: 'Кристальная Тень' },
      role: { az: 'FƏSLİN FİNALI · KRİSTALI OĞURLAYAN', en: 'CHAPTER FINALE · THE CRYSTAL THIEF', ru: 'ФИНАЛ ГЛАВЫ · ПОХИТИТЕЛЬ КРИСТАЛЛА' },
      awaits: { az: 'Kristal Kölgəsi fəslin sonunda gözləyir', en: 'The Crystal Shade awaits at the chapter’s end', ru: 'Кристальная Тень ждёт в конце главы' },
      face: { az: 'Kristal Kölgəsi ilə üzləş', en: 'Face the Crystal Shade', ru: 'Сразись с Кристальной Тенью' },
      befriended: { az: 'Kölgə dağıldı — kristal evinə döndü', en: 'The Shade is undone — the crystal is home', ru: 'Тень рассеялась — кристалл вернулся домой' },
      done: { az: 'Kristal Kölgəsi məğlub edildi', en: 'The Crystal Shade defeated', ru: 'Кристальная Тень побеждена' },
      banner: { az: 'FƏSİL TAMAMLANDI', en: 'CHAPTER COMPLETE', ru: 'ГЛАВА ЗАВЕРШЕНА' },
      badge: { az: 'Kristal Qoruyucusu', en: 'Crystal Keeper', ru: 'Хранитель Кристалла' },
      badgeNote: { az: 'Pıçıldayan Meşəlik fəsli tamamlandı', en: 'The Whispering Grove chapter complete', ru: 'Глава «Шепчущая Роща» завершена' },
      hits: 6, sky: '#241033', floor: '#180B24', glow: 'rgba(123,92,255,0.34)', accent: '#9B7CFF', accentSoft: '#C8B4FF'
    },
    /* the three stage beats, shown on details as steps 1–3 of the chapter */
    beats: [
      { az: 'İşıldaquş izini izlə', en: 'Follow the firefly trail', ru: 'Иди по следу светлячков' },
      { az: 'Əjdahanın körpüsündən keç', en: 'Cross the dragon’s bridge', ru: 'Перейди мост дракона' },
      { az: 'Kölgəni postamentdə qarşıla', en: 'Meet the Shade at the pedestal', ru: 'Встреть Тень у пьедестала' }
    ]
  },
  {
    id: 'river',
    region: { az: 'BİLİK MEŞƏSİ', en: 'KNOWLEDGE FOREST', ru: 'ЛЕС ЗНАНИЙ' },
    name: { az: 'Oxuyan Çay', en: 'The Singing River', ru: 'Поющая Река' },
    title: { az: 'Susmuş Suların Sirri', en: 'The Secret of the Silent Water', ru: 'Тайна Умолкшей Воды' },
    hook: {
      az: '«Çay həmişə oxuyurdu. İndi isə səssizdir — kimsə mahnını daşların altında gizlədib.»',
      en: '"The river always sang. Now it is silent — someone hid the song under the stones."',
      ru: '«Река всегда пела. Теперь она молчит — кто-то спрятал песню под камнями.»'
    },
    mission: { az: 'Daşları aç və çayın mahnısını qaytar', en: 'Free the stones and return the river’s song', ru: 'Освободи камни и верни песню реки' },
    guardian: {
      name: { az: 'Daş Kirpisi', en: 'The Stone Urchin', ru: 'Каменный Ёж' },
      role: { az: 'AYRIMIN KEŞİKÇİSİ', en: 'GUARDIAN OF THE FORD', ru: 'ХРАНИТЕЛЬ БРОДА' },
      awaits: { az: 'Daş Kirpisi gözləyir', en: 'The Stone Urchin awaits', ru: 'Каменный Ёж ждёт' },
      face: { az: 'Daş Kirpisi ilə üzləş', en: 'Face the Stone Urchin', ru: 'Сразись с Каменным Ежом' },
      befriended: { az: 'Daş Kirpisi artıq sənin dostundur', en: 'The Stone Urchin is your friend now', ru: 'Каменный Ёж теперь твой друг' },
      done: { az: 'Daş Kirpisi ilə dost olduq', en: 'The Stone Urchin befriended', ru: 'Каменный Ёж стал другом' },
      banner: { az: 'AYRIM AÇIQDIR', en: 'FORD OPEN', ru: 'БРОД ОТКРЫТ' },
      badge: { az: 'Ayrım Keşikçisi', en: 'Ford Keeper', ru: 'Хранитель Брода' },
      badgeNote: { az: 'Oxuyan Çayda boss məğlub edildi', en: 'Boss cleared at the Singing River', ru: 'Босс Поющей Реки побеждён' },
      hits: 4, sky: '#12303A', floor: '#0C222A', glow: 'rgba(69,198,240,0.30)', accent: '#45C6F0', accentSoft: '#8FDCF7'
    },
    finale: {
      name: { az: 'Sükut Burulğanı', en: 'The Hush Whirlpool', ru: 'Водоворот Тишины' },
      role: { az: 'FƏSLİN FİNALI · MAHNINI UDAN', en: 'CHAPTER FINALE · SWALLOWER OF SONGS', ru: 'ФИНАЛ ГЛАВЫ · ПОГЛОТИТЕЛЬ ПЕСЕН' },
      awaits: { az: 'Sükut Burulğanı fəslin sonunda gözləyir', en: 'The Hush Whirlpool awaits at the chapter’s end', ru: 'Водоворот Тишины ждёт в конце главы' },
      face: { az: 'Sükut Burulğanı ilə üzləş', en: 'Face the Hush Whirlpool', ru: 'Сразись с Водоворотом Тишины' },
      befriended: { az: 'Burulğan sakitləşdi — çay yenidən oxuyur', en: 'The whirlpool is calm — the river sings again', ru: 'Водоворот утих — река снова поёт' },
      done: { az: 'Sükut Burulğanı məğlub edildi', en: 'The Hush Whirlpool defeated', ru: 'Водоворот Тишины побеждён' },
      banner: { az: 'FƏSİL TAMAMLANDI', en: 'CHAPTER COMPLETE', ru: 'ГЛАВА ЗАВЕРШЕНА' },
      badge: { az: 'Mahnı Qoruyucusu', en: 'Song Keeper', ru: 'Хранитель Песни' },
      badgeNote: { az: 'Oxuyan Çay fəsli tamamlandı', en: 'The Singing River chapter complete', ru: 'Глава «Поющая Река» завершена' },
      hits: 6, sky: '#0B2A38', floor: '#071C26', glow: 'rgba(92,227,155,0.32)', accent: '#5CE39B', accentSoft: '#8FE0B6'
    },
    beats: [
      { az: 'Sahil boyu daşları say', en: 'Count the stones along the bank', ru: 'Сосчитай камни вдоль берега' },
      { az: 'Kirpinin ayrımından keç', en: 'Cross the urchin’s ford', ru: 'Перейди брод ежа' },
      { az: 'Burulğanın mərkəzinə en', en: 'Descend into the whirlpool’s heart', ru: 'Спустись в сердце водоворота' }
    ]
  },
  {
    id: 'sky',
    region: { az: 'BİLİK MEŞƏSİ', en: 'KNOWLEDGE FOREST', ru: 'ЛЕС ЗНАНИЙ' },
    name: { az: 'Göy Qurşağı Zirvəsi', en: 'The Rainbow Ridge', ru: 'Радужный Хребет' },
    title: { az: 'Düşən Ulduzun İzi', en: 'The Trail of the Fallen Star', ru: 'След Упавшей Звезды' },
    hook: {
      az: '«Bir ulduz zirvənin arxasına düşdü. Onu tapmasaq, gecə xəritəsi əskik qalacaq.»',
      en: '"A star fell behind the ridge. If we do not find it, the night map stays incomplete."',
      ru: '«За хребтом упала звезда. Если мы её не найдём, ночная карта останется неполной.»'
    },
    mission: { az: 'Ulduzu tap və gecə xəritəsini tamamla', en: 'Find the star and complete the night map', ru: 'Найди звезду и заверши ночную карту' },
    guardian: {
      name: { az: 'Bulud Keşikçisi', en: 'The Cloud Warden', ru: 'Облачный Страж' },
      role: { az: 'ZİRVƏNİN KEŞİKÇİSİ', en: 'GUARDIAN OF THE RIDGE', ru: 'ХРАНИТЕЛЬ ХРЕБТА' },
      awaits: { az: 'Bulud Keşikçisi gözləyir', en: 'The Cloud Warden awaits', ru: 'Облачный Страж ждёт' },
      face: { az: 'Bulud Keşikçisi ilə üzləş', en: 'Face the Cloud Warden', ru: 'Сразись с Облачным Стражем' },
      befriended: { az: 'Bulud Keşikçisi artıq sənin dostundur', en: 'The Cloud Warden is your friend now', ru: 'Облачный Страж теперь твой друг' },
      done: { az: 'Bulud Keşikçisi ilə dost olduq', en: 'The Cloud Warden befriended', ru: 'Облачный Страж стал другом' },
      banner: { az: 'ZİRVƏ AÇIQDIR', en: 'RIDGE OPEN', ru: 'ХРЕБЕТ ОТКРЫТ' },
      badge: { az: 'Zirvə Keşikçisi', en: 'Ridge Keeper', ru: 'Хранитель Хребта' },
      badgeNote: { az: 'Göy Qurşağı Zirvəsində boss məğlub edildi', en: 'Boss cleared on the Rainbow Ridge', ru: 'Босс Радужного Хребта побеждён' },
      hits: 4, sky: '#2C2350', floor: '#1E1838', glow: 'rgba(255,194,75,0.28)', accent: '#FFC24B', accentSoft: '#FFD98A'
    },
    finale: {
      name: { az: 'Gecə Toxucusu', en: 'The Night Weaver', ru: 'Ночной Ткач' },
      role: { az: 'FƏSLİN FİNALI · ULDUZLARI GİZLƏDƏN', en: 'CHAPTER FINALE · HIDER OF STARS', ru: 'ФИНАЛ ГЛАВЫ · СКРЫВАЮЩИЙ ЗВЁЗДЫ' },
      awaits: { az: 'Gecə Toxucusu fəslin sonunda gözləyir', en: 'The Night Weaver awaits at the chapter’s end', ru: 'Ночной Ткач ждёт в конце главы' },
      face: { az: 'Gecə Toxucusu ilə üzləş', en: 'Face the Night Weaver', ru: 'Сразись с Ночным Ткачом' },
      befriended: { az: 'Toxuma açıldı — ulduz göyə qayıtdı', en: 'The weave unravels — the star is back in the sky', ru: 'Ткань распустилась — звезда вернулась на небо' },
      done: { az: 'Gecə Toxucusu məğlub edildi', en: 'The Night Weaver defeated', ru: 'Ночной Ткач побеждён' },
      banner: { az: 'FƏSİL TAMAMLANDI', en: 'CHAPTER COMPLETE', ru: 'ГЛАВА ЗАВЕРШЕНА' },
      badge: { az: 'Ulduz Qoruyucusu', en: 'Star Keeper', ru: 'Хранитель Звезды' },
      badgeNote: { az: 'Göy Qurşağı Zirvəsi fəsli tamamlandı', en: 'The Rainbow Ridge chapter complete', ru: 'Глава «Радужный Хребет» завершена' },
      hits: 6, sky: '#1A1540', floor: '#100C2C', glow: 'rgba(200,180,255,0.30)', accent: '#C8B4FF', accentSoft: '#E4DAFF'
    },
    beats: [
      { az: 'Buludların pillələrini qaldır', en: 'Raise the steps of cloud', ru: 'Подними ступени из облаков' },
      { az: 'Keşikçinin zirvəsini aş', en: 'Climb past the warden’s ridge', ru: 'Преодолей хребет стража' },
      { az: 'Toxumanı gecə səmasında sök', en: 'Unravel the weave in the night sky', ru: 'Распусти ткань в ночном небе' }
    ]
  }
];

/* stage number (0-based questDay) → where it sits in the chapter structure.
   chapterNo / stageNo are 1-based for display; `final` marks the chapter's last stage. */
EQD.chapterAt = function (day) {
  const d = Math.max(0, day || 0);
  const per = EQD.STAGES_PER_CHAPTER;
  const idx = Math.floor(d / per);
  const ch = EQD.CHAPTERS[idx % EQD.CHAPTERS.length];
  const stageNo = (d % per) + 1;
  const final = stageNo === per;
  return {
    ch: ch,
    chapterNo: idx + 1,
    stageNo: stageNo,
    stages: per,
    final: final,
    /* the boss this stage ends on: the finale only on the last stage */
    boss: final ? ch.finale : ch.guardian,
    beat: ch.beats[stageNo - 1] || ch.beats[ch.beats.length - 1]
  };
};

EQD.mulberry = function (seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

/* seeded shuffle so the correct answer lands in a different slot each question */
EQD._shuffleAns = function (ri, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = ri(0, i);
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
};

EQD._answers = function (ri, c, spread) {
  const d = spread || 1;
  return EQD._shuffleAns(ri, [c - d, c, c + d]);
};

EQD._subjMath = { az: 'Riyaziyyat', en: 'Math', ru: 'Математика' };
EQD._subjLogic = { az: 'Məntiq', en: 'Logic', ru: 'Логика' };
EQD._tagAdd = { az: 'RİYAZİYYAT · ÜSTÜNƏ SAYMA', en: 'MATH · ADDING ON', ru: 'МАТЕМАТИКА · ПРИСЧИТЫВАНИЕ' };
EQD._tagPattern = { az: 'MƏNTİQ · NAXIŞLAR', en: 'LOGIC · PATTERNS', ru: 'ЛОГИКА · УЗОРЫ' };
EQD._tagGroups = { az: 'RİYAZİYYAT · QRUPLARLA', en: 'MATH · GROUPS OF', ru: 'МАТЕМАТИКА · ГРУППЫ' };
EQD._tagTake = { az: 'RİYAZİYYAT · ÇIXMA', en: 'MATH · TAKING AWAY', ru: 'МАТЕМАТИКА · ВЫЧИТАНИЕ' };
EQD._tagDouble = { az: 'RİYAZİYYAT · QOŞALAR', en: 'MATH · DOUBLES', ru: 'МАТЕМАТИКА · ДВОЙНЫЕ' };
EQD._metaCalm = { az: 'Nə qədər istəsən vaxt ayır', en: 'Take as long as you like', ru: 'Времени сколько угодно' };
EQD._metaNoRush = { az: 'Taymer yoxdur, tələsmə', en: 'No timer, no rush', ru: 'Без таймера, без спешки' };
EQD._metaLast = { az: 'Sonuncudur — bacaracaqsan!', en: 'Last one — you’ve got this', ru: 'Последний — у тебя получится!' };

EQD._qAdd = function (ri, hard) {
  const a = ri(hard ? 6 : 4, 9), b = ri(3, hard ? 6 : 5), c = a + b;
  return {
    name: { az: 'Əjdaha üçün almalar', en: 'Apples for the dragon', ru: 'Яблоки для дракона' },
    subject: EQD._subjMath, subj: 'math', tag: EQD._tagAdd,
    cardTitle: { az: 'Əjdaha üçün almalar', en: 'Apples for the dragon', ru: 'Яблоки для дракона' },
    cardStory: {
      az: 'Əjdaha yenə acdır — almaları say, o da səni buraxsın.',
      en: 'The dragon is hungry again — count the apples and he’ll wave you through.',
      ru: 'Дракон снова голоден — сосчитай яблоки, и он пропустит тебя.'
    },
    meta: EQD._metaCalm,
    title: {
      az: `Əjdahanın ${a} alması var idi. Sən ona daha ${b} alma verirsən.<br>İndi neçə alma var?`,
      en: `The dragon had ${a} apples. You give him ${b} more.<br>How many apples now?`,
      ru: `У дракона было ${a} ${RUP(a, 'яблоко', 'яблока', 'яблок')}. Ты даёшь ему ещё ${b}.<br>Сколько яблок теперь?`
    },
    visual: () => EQD.vApples(a, b),
    answers: EQD._answers(ri, c), correct: c,
    tip: {
      az: `Tələsmə. ${a}-${AZD(a)} üstünə say — mən burada gözləyirəm.`,
      en: `Take your time. Count on from ${a} — I’ll wait right here.`,
      ru: `Не спеши. Считай дальше от ${a} — я подожду здесь.`
    },
    successLine: { az: `${c} alma — əjdaha doydu!`, en: `${c} apples — the dragon is full`, ru: `${c} ${RUP(c, 'яблоко', 'яблока', 'яблок')} — дракон сыт!` },
    praise: {
      az: `${a}-${AZD(a)} üstünə saydın. Bu, ən sürətli yoldur!`,
      en: `You counted on from ${a}. That’s the fast way!`,
      ru: `Присчитывать от ${a} — самый быстрый способ, и у тебя получилось!`
    },
    hint: {
      heading: { az: 'Az qaldı! Gəl başqa yolla yoxlayaq.', en: 'Almost! Let’s try another way.', ru: 'Почти! Давай попробуем по-другому.' },
      sub: { az: `${a}-${AZD(a)} başla və mənimlə ${b} dəfə hoppan.`, en: `Start at ${a} and hop ${b} times with me.`, ru: `Начни с ${a} и сделай со мной ${b} ${RUP(b, 'прыжок', 'прыжка', 'прыжков')}.` },
      panelTitle: { az: 'Mənimlə üstünə say', en: 'Count on with me', ru: 'Считай дальше со мной' },
      body: () => EQD.hintCountOn(a, b),
      note: {
        az: `${b - 1} hoppanış oldu. Biri qaldı.`,
        en: `${b - 1} hop${b - 1 === 1 ? '' : 's'} done. One more to go.`,
        ru: `${b - 1} ${RUP(b - 1, 'прыжок сделан', 'прыжка сделано', 'прыжков сделано')}. Остался один.`
      }
    },
    explain: {
      title: { az: 'Gəl bunu birlikdə həll edək.', en: 'Let’s figure this out together.', ru: 'Давай разберёмся вместе.' },
      text: {
        az: `Üstünə saymaq birdən başlamamaq deməkdir. Əjdahanın artıq ${a} alması var — «${a}» deyirik və təzələrini sayırıq: cavab ${c} olur.`,
        en: `Adding on means we don’t start from one. The dragon already has ${a} apples, so we say “${a}” and count the new ones up to ${c}.`,
        ru: `Присчитывание значит, что мы не начинаем с единицы. У дракона уже ${a} ${RUP(a, 'яблоко', 'яблока', 'яблок')}, поэтому говорим «${a}» и считаем новые до ${c}.`
      },
      why: {
        az: `Böyük ədəddən başlamaq ilk ${a} almanı yenidən saymaqdan xilas edir — cavab eynidir, yol qısadır.`,
        en: `Starting from the bigger number saves you counting the first ${a} all over again — same answer, shorter trip.`,
        ru: `Начав с большего числа, не придётся заново считать первые ${a} ${RUP(a, 'яблоко', 'яблока', 'яблок')} — ответ тот же, путь короче.`
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="flex:none;width:120px">${EQC.appleBox(b)}</div><div style="flex:1"><div style="font:800 15px 'Baloo 2', system-ui;color:#fff">${TX({ az: `${b} təzə alma`, en: `${b} new apples`, ru: `${b} ${RUP(b, 'новое яблоко', 'новых яблока', 'новых яблок')}` })}</div><div style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: `«${a}» de, sonra sayaraq hər təzə almaya toxun.`, en: `Say “${a}”, then touch each new apple as you count up.`, ru: `Скажи «${a}», а потом касайся каждого нового яблока и считай дальше.` })}</div></div></div>`
    },
    easier: EQD._qAddEasy(ri)
  };
};

EQD._qAddEasy = function (ri) {
  const a = ri(3, 5), b = 2, c = a + b;
  return {
    tag: EQD._tagAdd, subject: EQD._subjMath, subj: 'math',
    cardTitle: { az: 'Daha kiçik qəlyanaltı', en: 'A smaller snack', ru: 'Перекус поменьше' },
    title: {
      az: `Əjdahanın ${a} alması var idi. Sən ona daha ${b} alma verirsən.<br>İndi neçə alma var?`,
      en: `The dragon had ${a} apples. You give him ${b} more.<br>How many apples now?`,
      ru: `У дракона было ${a} ${RUP(a, 'яблоко', 'яблока', 'яблок')}. Ты даёшь ему ещё ${b}.<br>Сколько яблок теперь?`
    },
    visual: () => EQD.vApples(a, b),
    answers: EQD._answers(ri, c), correct: c,
    tip: { az: `«${a}» de, sonra iki təzəni say.`, en: `Say “${a}”, then count the two new ones.`, ru: `Скажи «${a}», потом сосчитай два новых.` },
    successLine: { az: `${c} alma — əla məşq!`, en: `${c} apples — great warm-up!`, ru: `${c} ${RUP(c, 'яблоко', 'яблока', 'яблок')} — отличная разминка!` },
    praise: { az: 'Gördün? Üstünə sayma həmişə işləyir.', en: 'See? Counting on works every time.', ru: 'Видишь? Присчитывание работает всегда.' },
    hint: {
      heading: { az: 'Az qaldı! Gəl birlikdə hoppanaq.', en: 'Almost! Let’s hop together.', ru: 'Почти! Давай прыгать вместе.' },
      sub: { az: `${a}-${AZD(a)} başla və mənimlə iki dəfə hoppan.`, en: `Start at ${a} and hop two times with me.`, ru: `Начни с ${a} и сделай со мной два прыжка.` },
      panelTitle: { az: 'Mənimlə üstünə say', en: 'Count on with me', ru: 'Считай дальше со мной' },
      body: () => EQD.hintCountOn(a, b),
      note: { az: 'Bir hoppanış oldu. Biri qaldı.', en: 'One hop done. One more to go.', ru: 'Один прыжок сделан. Остался ещё один.' }
    }
  };
};

EQD._qPattern = function (ri) {
  const step = [2, 3, 5][ri(0, 2)];
  const seq = [step, step * 2, step * 3, step * 4];
  const c = step * 5;
  return {
    name: { az: 'Parlayan naxış', en: 'The glowing pattern', ru: 'Светящийся узор' },
    subject: EQD._subjLogic, subj: 'logic', tag: EQD._tagPattern,
    cardTitle: { az: 'Parlayan naxış', en: 'The glowing pattern', ru: 'Светящийся узор' },
    cardStory: {
      az: `Meşə işıqları ritmlə yanır: ${seq.join(', ')}… keçmək üçün növbəti ədədi de.`,
      en: `The forest lights glow in a rhythm: ${seq.join(', ')}… say the next number to pass.`,
      ru: `Лесные огни светятся в ритме: ${seq.join(', ')}… назови следующее число, чтобы пройти.`
    },
    meta: EQD._metaNoRush,
    title: {
      az: `İşıqlar ${seq.join(', ')}… yanır.<br>Növbəti hansı ədəd yanacaq?`,
      en: `The lights glow ${seq.join(', ')}…<br>Which number glows next?`,
      ru: `Огни светятся: ${seq.join(', ')}…<br>Какое число загорится следующим?`
    },
    visual: () => EQD.vNumberRow(seq.concat(['?']), true),
    answers: EQD._answers(ri, c), correct: c,
    tip: {
      az: 'İşıqlar addım-addım sayır. Hər sıçrayış eyni ölçüdədir.',
      en: 'The lights are skip counting. Each jump is the same size.',
      ru: 'Огни считают через число. Каждый прыжок одинаковый.'
    },
    successLine: { az: `${c}! Ritmi qorudun`, en: `${c}! You kept the rhythm`, ru: `${c}! Ритм сохранён` },
    praise: { az: `Sıçrayışın ${step} olduğunu tapdın. Naxış ustası!`, en: `You spotted the jump of ${step}. Pattern master!`, ru: `Прыжок на ${step} разгадан. Мастер узоров!` },
    hint: {
      heading: { az: 'Az qaldı! Sıçrayışlara bax.', en: 'Almost! Look at the jumps.', ru: 'Почти! Посмотри на прыжки.' },
      sub: {
        az: `Bax: ${seq[0]}, sonra ${seq[1]} — hər dəfə ${step} əlavə olunur. Davam et.`,
        en: `From ${seq[0]} to ${seq[1]} is a jump of ${step}. Keep jumping.`,
        ru: `От ${seq[0]} до ${seq[1]} — прыжок на ${step}. Продолжай прыгать.`
      },
      panelTitle: { az: `Hər dəfə ${step} əlavə et`, en: `Jump by ${step}`, ru: `Прыгай по ${step}` },
      body: () => EQD.vNumberRow(seq.concat(['?']), true),
      note: { az: `${seq[3]}-${AZD(seq[3])} sonra bir sıçrayış da…`, en: `One more jump of ${step} after ${seq[3]}…`, ru: `Ещё один прыжок на ${step} после ${seq[3]}…` }
    },
    explain: {
      title: { az: 'Naxışlar eyni hərəkəti təkrarlayır.', en: 'Patterns repeat the same move.', ru: 'Узоры повторяют одно и то же движение.' },
      text: {
        az: `Bu naxış hər dəfə ${step} əlavə edir: ${seq.join(', ')}. Sonuncu ədəd nə olursa olsun, növbəti sadəcə «üstəgəl ${step}» olur.`,
        en: `This pattern adds ${step} every time: ${seq.join(', ')}. Whatever the last number is, the next one is just “plus ${step}”.`,
        ru: `Этот узор каждый раз добавляет ${step}: ${seq.join(', ')}. Каким бы ни было последнее число, следующее — просто «плюс ${step}».`
      },
      why: {
        az: 'Qaydanı biləndə heç vaxt təxmin etməli olmursan — naxışı sonsuza qədər davam etdirə bilərsən.',
        en: 'When you know the rule, you never have to guess — you can keep the pattern going forever.',
        ru: 'Когда знаешь правило, не нужно угадывать — узор можно продолжать бесконечно.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><svg width="96" height="80" viewBox="0 0 120 80"><g fill="#FFC24B"><circle cx="16" cy="56" r="10"></circle><circle cx="44" cy="44" r="10"></circle><circle cx="72" cy="32" r="10"></circle><circle cx="100" cy="20" r="10"></circle></g><path d="M22 48 q8-10 16 0 M50 36 q8-10 16 0 M78 24 q8-10 16 0" stroke="#5CE39B" stroke-width="3" fill="none" stroke-linecap="round"></path></svg><div style="flex:1"><div style="font:800 15px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Eyni ölçülü sıçrayışlar', en: 'Same-size jumps', ru: 'Одинаковые прыжки' })}</div><div style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: `Hər hoppanış ${step} qalxır. ${seq[3]}-${AZD(seq[3])} bir dəfə də hoppan.`, en: `Every hop climbs by ${step}. Hop once more from ${seq[3]}.`, ru: `Каждый прыжок поднимает на ${step}. Прыгни ещё раз от ${seq[3]}.` })}</div></div></div>`
    },
    easier: {
      tag: EQD._tagPattern, subject: EQD._subjLogic, subj: 'logic',
      cardTitle: { az: 'Daha sakit ritm', en: 'A gentler rhythm', ru: 'Ритм попроще' },
      title: {
        az: 'İşıqlar 1, 2, 3, 4… yanır.<br>Növbəti hansı ədəd yanacaq?',
        en: 'The lights glow 1, 2, 3, 4…<br>Which number glows next?',
        ru: 'Огни светятся: 1, 2, 3, 4…<br>Какое число загорится следующим?'
      },
      visual: () => EQD.vNumberRow([1, 2, 3, 4, '?'], true),
      answers: EQD._shuffleAns(ri, [5, 6, 7]), correct: 5,
      tip: { az: 'Bu, hər dəfə bir addım qalxır.', en: 'This one climbs one step at a time.', ru: 'Здесь числа растут по одному.' },
      successLine: { az: '5! Ritmi qorudun', en: '5! You kept the rhythm', ru: '5! Ритм сохранён' },
      praise: { az: 'Addım-addım — naxış elə budur.', en: 'One step at a time — that’s all a pattern is.', ru: 'Шаг за шагом — в этом весь узор.' },
      hint: {
        heading: { az: 'Az qaldı! Addım-addım.', en: 'Almost! One step at a time.', ru: 'Почти! Шаг за шагом.' },
        sub: { az: 'Hər işıq əvvəlkindən bir çoxdur.', en: 'Each light is one more than the last.', ru: 'Каждый огонёк на один больше предыдущего.' },
        panelTitle: { az: 'Bir-bir addımla', en: 'Step by one', ru: 'Шагай по одному' },
        body: () => EQD.vNumberRow([1, 2, 3, 4, '?'], true),
        note: { az: '4-dən dərhal sonra nə gəlir?', en: 'What comes right after 4?', ru: 'Что идёт сразу после 4?' }
      }
    }
  };
};

EQD._qGroups = function (ri, hard) {
  const rows = ri(2, hard ? 4 : 3), cols = ri(3, hard ? 5 : 4), c = rows * cols;
  const multiples = []; for (let i = 1; i < rows; i++) multiples.push(cols * i); multiples.push('?');
  return {
    name: { az: 'Kristal sıraları', en: 'Rows of crystals', ru: 'Ряды кристаллов' },
    subject: EQD._subjMath, subj: 'math', tag: EQD._tagGroups,
    cardTitle: { az: 'Kristal sıraları', en: 'Rows of crystals', ru: 'Ряды кристаллов' },
    cardStory: {
      az: `Möhürdə hər birində ${cols} kristal olan ${rows} sıra var — hamısını say ki, qırılsın.`,
      en: `A seal shows ${rows} rows of ${cols} crystals — count them all to break it.`,
      ru: `На печати ${rows} ${RUP(rows, 'ряд', 'ряда', 'рядов')} по ${cols} ${RUP(cols, 'кристаллу', 'кристалла', 'кристаллов')} — сосчитай все, чтобы снять её.`
    },
    meta: EQD._metaCalm,
    title: {
      az: `Möhürdə hər birində ${cols} kristal olan ${rows} sıra var.<br>Cəmi neçə kristal var?`,
      en: `The seal shows ${rows} rows of ${cols} crystals.<br>How many crystals in all?`,
      ru: `На печати ${rows} ${RUP(rows, 'ряд', 'ряда', 'рядов')} по ${cols} ${RUP(cols, 'кристаллу', 'кристалла', 'кристаллов')}.<br>Сколько всего кристаллов?`
    },
    visual: () => EQD.vGrid(rows, cols, '#7B5CFF'),
    answers: EQD._answers(ri, c, 2), correct: c,
    tip: { az: `Bütöv sıranı birdən say: ${cols}, ${cols * 2}…`, en: `Count a whole row at once: ${cols}, ${cols * 2}…`, ru: `Считай сразу целый ряд: ${cols}, ${cols * 2}…` },
    successLine: { az: `${rows} sıra × ${cols} = ${c}!`, en: `${rows} rows of ${cols} make ${c}!`, ru: `${rows} ${RUP(rows, 'ряд', 'ряда', 'рядов')} по ${cols} — это ${c}!` },
    praise: { az: 'Sıra-sıra saymaq — elə vurma budur!', en: 'Counting by rows — that’s multiplying!', ru: 'Считать рядами — это и есть умножение!' },
    hint: {
      heading: { az: 'Az qaldı! Sıra-sıra say.', en: 'Almost! Count row by row.', ru: 'Почти! Считай ряд за рядом.' },
      sub: {
        az: `Hər sırada ${cols} kristal var. ${cols}… ${cols * 2}… de və davam et.`,
        en: `Each row holds ${cols} crystals. Say ${cols}… ${cols * 2}… and keep going.`,
        ru: `В каждом ряду ${cols} ${RUP(cols, 'кристалл', 'кристалла', 'кристаллов')}. Скажи ${cols}… ${cols * 2}… и продолжай.`
      },
      panelTitle: { az: `Hər dəfə ${cols} əlavə et`, en: `Count by ${cols}s`, ru: `Считай по ${cols}` },
      body: () => EQD.vNumberRow(multiples, true),
      note: {
        az: `${rows - 1} sıra sayıldı. Bir sıra qaldı.`,
        en: `${rows - 1} row${rows - 1 === 1 ? '' : 's'} counted. One row of ${cols} to go.`,
        ru: `${rows - 1} ${RUP(rows - 1, 'ряд сосчитан', 'ряда сосчитано', 'рядов сосчитано')}. Остался ряд из ${cols}.`
      }
    },
    explain: {
      title: { az: 'Sıralar saymağı sürətləndirir.', en: 'Rows make counting fast.', ru: 'Ряды ускоряют счёт.' },
      text: {
        az: `Hər kristala toxunmaq əvəzinə bütöv sıranı birdən say. Hər birində ${cols} olan ${rows} sıra — hər dəfə ${cols} olmaqla ${rows} sıçrayışdır.`,
        en: `Instead of touching every crystal, count a whole row at once. ${rows} rows of ${cols} is ${rows} jumps of ${cols}.`,
        ru: `Вместо того чтобы трогать каждый кристалл, считай сразу целый ряд. ${rows} ${RUP(rows, 'ряд', 'ряда', 'рядов')} по ${cols} — это ${rows} ${RUP(rows, 'прыжок', 'прыжка', 'прыжков')} по ${cols}.`
      },
      why: {
        az: 'Qruplar böyük şeyləri tez saymağa imkan verir — vurma elə budur.',
        en: 'Groups let you count big things quickly — that’s what multiplying is.',
        ru: 'Группы позволяют быстро считать большое — это и есть умножение.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="transform:scale(0.8);transform-origin:left center">${EQD.vGrid(rows, cols, '#C8B4FF')}</div><div style="flex:1"><div style="font:800 15px 'Baloo 2', system-ui;color:#fff">${Array(rows).fill(cols).join(' + ')}</div><div style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: `${rows} bərabər sıra. ${rows} dəfə, hər dəfə ${cols} sıçra.`, en: `${rows} equal rows. Jump by ${cols}, ${rows} times.`, ru: `${rows} ${RUP(rows, 'равный ряд', 'равных ряда', 'равных рядов')}. Прыгай по ${cols}, ${rows} ${RUP(rows, 'раз', 'раза', 'раз')}.` })}</div></div></div>`
    }
  };
};

EQD._qTakeAway = function (ri) {
  const take = ri(4, 6), left = ri(5, 9), total = take + left;
  const steps = []; for (let i = 1; i < take; i++) steps.push(total - i); steps.push('?');
  return {
    name: { az: 'Körpünün taxtaları', en: 'Planks on the bridge', ru: 'Доски на мосту' },
    subject: EQD._subjMath, subj: 'math', tag: EQD._tagTake,
    cardTitle: { az: 'Körpünün taxtaları', en: 'Planks on the bridge', ru: 'Доски на мосту' },
    cardStory: {
      az: `Körpüdə ${total} taxta var, ${take} taxta düzəldilib — neçəsi qalır?`,
      en: `The bridge has ${total} planks and ${take} are fixed — how many are left to mend?`,
      ru: `У моста ${total} ${RUP(total, 'доска', 'доски', 'досок')}, ${take} уже починены — сколько осталось чинить?`
    },
    meta: EQD._metaCalm,
    title: {
      az: `Körpünün ${total} taxtası var.<br>Artıq ${take} taxta düzəldilib. Neçəsi qalıb?`,
      en: `The bridge has ${total} planks.<br>${take} are already fixed. How many left?`,
      ru: `У моста ${total} ${RUP(total, 'доска', 'доски', 'досок')}.<br>${take} уже починены. Сколько осталось?`
    },
    visual: () => EQD.vGrid(2, Math.ceil(total / 2), '#C9762F'),
    answers: EQD._answers(ri, left), correct: left,
    tip: {
      az: `${total}-${AZD(total)} başla və ${take} addım geriyə say.`,
      en: `Start at ${total} and count back ${take} steps.`,
      ru: `Начни с ${total} и сосчитай ${take} ${RUP(take, 'шаг', 'шага', 'шагов')} назад.`
    },
    successLine: { az: `${left} taxta qalıb — az qala keçdik!`, en: `${left} planks to go — nearly across!`, ru: `Осталось ${left} ${RUP(left, 'доска', 'доски', 'досок')} — почти перешли!` },
    praise: { az: 'Geriyə saymaq — elə çıxma budur!', en: 'Counting back — that’s taking away!', ru: 'Считать назад — это и есть вычитание!' },
    hint: {
      heading: { az: `Az qaldı! ${total}-${AZD(total)} geriyə say.`, en: `Almost! Count back from ${total}.`, ru: `Почти! Считай назад от ${total}.` },
      sub: {
        az: `Düzəldilmiş ${take} taxtanı bir-bir çıx: ${total - 1}, ${total - 2}…`,
        en: `Take the ${take} fixed planks away one at a time: ${total - 1}, ${total - 2}…`,
        ru: `Убирай починенные доски по одной: ${total - 1}, ${total - 2}…`
      },
      panelTitle: { az: 'Mənimlə geriyə say', en: 'Count back with me', ru: 'Считай назад со мной' },
      body: () => EQD.vNumberRow(steps, true),
      note: { az: `${take - 1} addım geriyə. Bir addım da…`, en: `${take - 1} steps back. One more step…`, ru: `${take - 1} ${RUP(take - 1, 'шаг', 'шага', 'шагов')} назад. Ещё один шаг…` }
    },
    explain: {
      title: { az: 'Çıxmaq geriyə saymaqdır.', en: 'Taking away is counting back.', ru: 'Вычитать — значит считать назад.' },
      text: {
        az: `${total}-${AZD(total)} başla və ${take} dəfə geriyə addımla. Düşdüyün ədəd qalan saydır: ${left}.`,
        en: `Start at ${total} and step backwards ${take} times. The number you land on is what’s left: ${left}.`,
        ru: `Начни с ${total} и сделай ${take} ${RUP(take, 'шаг', 'шага', 'шагов')} назад. Число, на котором остановишься, — то, что осталось: ${left}.`
      },
      why: {
        az: 'Geriyə sayma istənilən «neçəsi qalıb?» sualında işləyir.',
        en: 'Counting back works for any “how many are left?” question.',
        ru: 'Счёт назад работает для любого вопроса «сколько осталось?».'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="transform:scale(0.8);transform-origin:left center">${EQD.vGrid(2, Math.ceil(total / 2), '#E0A365')}</div><div style="flex:1"><div style="font:800 15px 'Baloo 2', system-ui;color:#fff">${total} − ${take}</div><div style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: `${take} taxta hazırdır — ${total}-${AZD(total)} ${take} addım geriyə get.`, en: `${take} planks are done — step back ${take} from ${total}.`, ru: `${take} ${RUP(take, 'доска готова', 'доски готовы', 'досок готово')} — отступи на ${take} от ${total}.` })}</div></div></div>`
    }
  };
};

EQD._qDouble = function (ri, hard) {
  const n = ri(hard ? 6 : 4, hard ? 9 : 7), c = n * 2;
  return {
    name: { az: 'Əjdahanın tüstü halqaları', en: 'The dragon’s smoke rings', ru: 'Кольца дыма дракона' },
    subject: EQD._subjMath, subj: 'math', tag: EQD._tagDouble,
    cardTitle: { az: 'Əjdahanın tüstü halqaları', en: 'The dragon’s smoke rings', ru: 'Кольца дыма дракона' },
    cardStory: {
      az: `Əjdaha ${n} tüstü halqası buraxır, sonra daha ${n} — hamısını say!`,
      en: `The dragon breathes ${n} smoke rings, then ${n} more — count them all!`,
      ru: `Дракон выдыхает ${n} ${RUP(n, 'кольцо', 'кольца', 'колец')} дыма, потом ещё ${n} — сосчитай все!`
    },
    meta: hard ? EQD._metaLast : EQD._metaNoRush,
    title: {
      az: `Əjdaha ${n} tüstü halqası buraxır,<br>sonra daha ${n}. Cəmi neçə halqa?`,
      en: `The dragon breathes ${n} smoke rings,<br>then ${n} more. How many rings?`,
      ru: `Дракон выдыхает ${n} ${RUP(n, 'кольцо', 'кольца', 'колец')} дыма,<br>потом ещё ${n}. Сколько колец?`
    },
    visual: () => EQD.vGrid(2, n, '#45C6F0'),
    answers: EQD._answers(ri, c, 2), correct: c,
    tip: { az: `${n} və ${n} qoşadır — bəlkə artıq bilirsən!`, en: `${n} and ${n} is a double — maybe you already know it!`, ru: `${n} и ${n} — двойное. Может, ты уже знаешь ответ!` },
    successLine: { az: `${c} halqa — qoşalar sürətlidir!`, en: `${c} rings — doubles are quick!`, ru: `${c} ${RUP(c, 'кольцо', 'кольца', 'колец')} — удвоение работает быстро!` },
    praise: { az: `${n} + ${n} = ${c}. Artıq əzbər bildiyin qoşa!`, en: `${n} + ${n} = ${c}. A double you now know by heart!`, ru: `${n} + ${n} = ${c}. Теперь это двойное ты знаешь наизусть!` },
    hint: {
      heading: { az: 'Az qaldı! Burada qoşalar kömək edir.', en: 'Almost! Doubles help here.', ru: 'Почти! Здесь помогают двойные.' },
      sub: { az: `${n} və ${n} qoşadır. ${n}-${AZD(n)} üstünə say: ${n + 1}, ${n + 2}…`, en: `${n} and ${n} is a double. Count on from ${n}: ${n + 1}, ${n + 2}…`, ru: `${n} и ${n} — двойное. Считай дальше от ${n}: ${n + 1}, ${n + 2}…` },
      panelTitle: { az: `${n}-${AZD(n)} üstünə say`, en: `Count on from ${n}`, ru: `Считай дальше от ${n}` },
      body: () => EQD.hintCountOn(n, n),
      note: { az: `${n - 1} hoppanış oldu. Biri qaldı.`, en: `${n - 1} hops done. One more to go.`, ru: `${n - 1} ${RUP(n - 1, 'прыжок сделан', 'прыжка сделано', 'прыжков сделано')}. Остался один.` }
    },
    explain: {
      title: { az: 'Qoşalar qısayoldur.', en: 'Doubles are a shortcut.', ru: 'Двойные — это короткий путь.' },
      text: {
        az: `Hər iki qrup eyni ölçüdə olanda cavabı bir fakt kimi öyrənə bilərsən: ${n} + ${n} = ${c}. Bir dəfə bildinsə, saymağa ehtiyac yoxdur.`,
        en: `When both groups are the same size, you can learn the answer as one fact: ${n} + ${n} = ${c}. No counting needed once you know it.`,
        ru: `Когда обе группы одинаковые, ответ можно запомнить как один факт: ${n} + ${n} = ${c}. Знаешь его — считать не нужно.`
      },
      why: {
        az: 'Qoşalar tez-tez qarşına çıxır — onları bilmək böyük cəmləri asanlaşdırır.',
        en: 'Doubles come up all the time — knowing them makes bigger sums easy.',
        ru: 'Двойные встречаются постоянно — зная их, легче складывать большие числа.'
      },
      visual: () => `<div style="display:flex;align-items:center;gap:16px"><div style="transform:scale(0.8);transform-origin:left center">${EQD.vGrid(2, n, '#8FDCF7')}</div><div style="flex:1"><div style="font:800 15px 'Baloo 2', system-ui;color:#fff">${n} + ${n}</div><div style="font:700 13px Nunito;color:#C9BCEF;margin-top:5px;line-height:1.5">${TX({ az: 'İki bərabər halqa sırası — yadda saxlaya biləcəyin qoşa.', en: 'Two equal rows of rings — a double you can remember.', ru: 'Два равных ряда колец — двойное, которое легко запомнить.' })}</div></div></div>`
    }
  };
};

EQD._dayCache = null; EQD._dayCacheNo = -1;
EQD.genDay = function (day) {
  if (EQD._dayCacheNo === day && EQD._dayCache) return EQD._dayCache;
  const rnd = EQD.mulberry(day * 7919 + 13);
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const theme = EQD.THEMES[(day - 1) % EQD.THEMES.length];
  const set = {
    title: theme.title, headline: theme.headline, chestTitle: theme.chestTitle,
    progressLine: theme.progressLine,
    questions: [EQD._qAdd(ri, false), EQD._qPattern(ri), EQD._qGroups(ri, false), EQD._qTakeAway(ri), EQD._qDouble(ri, false)],
    /* six, so a chapter finale (6 hits) has its own question for every hit;
       an ordinary guardian simply stops after the first four */
    boss: [EQD._qGroups(ri, true), EQD._qDouble(ri, true), EQD._qTakeAway(ri), EQD._qAdd(ri, true), EQD._qPattern(ri), EQD._qGroups(ri, true)]
  };
  EQD._dayCache = set; EQD._dayCacheNo = day;
  return set;
};

/* day 0 = first play day: the design doc's hand-authored questions (dragon apples,
   Seal of Patterns) as challenges 4–5, generated warm-ups as 1–3 — all five playable */
EQD._day0 = null;
EQD.questSet = function (day) {
  if (!day || day <= 0) {
    if (!EQD._day0) {
      const rnd = EQD.mulberry(1013);
      const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
      /* the hand-authored questions keep their values but the correct answer
         moves to a seeded slot, so it isn't always the middle button */
      [EQD.QUESTIONS[3], EQD.QUESTIONS[3].easier, EQD.QUESTIONS[4], EQD.QUESTIONS[4].easier]
        .concat(EQD.BOSS)
        .forEach(q => { if (q && q.answers) q.answers = EQD._shuffleAns(ri, q.answers); });
      EQD._day0 = {
        title: { az: 'Qədim Qapını Aç', en: 'Open the Ancient Gate', ru: 'Открой Древние Врата' },
        headline: { az: 'Questy-yə Qədim Qapını açmağa kömək et!', en: 'Help Questy open the Ancient Gate!', ru: 'Помоги Квести открыть Древние Врата!' },
        chestTitle: { az: 'Qədim Qapının<br>Xəzinəsi', en: 'Ancient Gate<br>Treasure', ru: 'Сокровище<br>Древних Врат' },
        progressLine: (done) => done >= 5
          ? TX({ az: 'Bütün möhürlər qırıldı!', en: 'All seals are broken!', ru: 'Все печати сняты!' })
          : TX({
            az: `${done} möhür qırıldı. ${5 - done} qaldı.`,
            en: `${done} seal${done === 1 ? ' is' : 's are'} broken. ${5 - done} to go.`,
            ru: `${done} ${RUP(done, 'печать снята', 'печати сняты', 'печатей снято')}. Осталось ${5 - done}.`
          }),
        questions: [EQD._qDouble(ri, false), EQD._qGroups(ri, false), EQD._qTakeAway(ri), EQD.QUESTIONS[3], EQD.QUESTIONS[4]],
        boss: EQD.BOSS.concat([EQD._qPattern(ri), EQD._qAdd(ri, true)])
      };
    }
    return EQD._day0;
  }
  return EQD.genDay(day);
};

/* ── parent-approved missions (screen 26 → the child's quest list) ───────────
   A grown-up approves one practice mission on the recommendations screen and the
   promise made there is "you approve it, it shows up in the child's world". This
   is the set that shows up: eight questions on the single topic that was approved,
   built from the same per-topic generators the daily quest uses, so a mission is
   real practice and not a different, thinner game.

   Eight, because the mission card says eight — `EQT.MISSIONS[*].detail` has
   promised "8 challenges" in all three languages since the screen was designed.

   The seed is the topic plus the day it was approved, so a mission's questions are
   stable: a child who leaves halfway through and comes back gets the rest of the
   same mission, not eight fresh ones. Two missions approved on different days are
   different practice. The `hard` flag alternates so the set climbs a little rather
   than repeating one difficulty eight times. */
EQD.MISSION_LEN = 8;

EQD._missionGen = {
  add: (ri, hard) => EQD._qAdd(ri, hard),
  pattern: (ri) => EQD._qPattern(ri),
  groups: (ri, hard) => EQD._qGroups(ri, hard),
  take: (ri) => EQD._qTakeAway(ri),
  double: (ri, hard) => EQD._qDouble(ri, hard)
};

/* a stable small number from the approval day, so the seed changes day to day */
EQD._missionSeed = function (topic, day) {
  const keys = Object.keys(EQD._missionGen);
  let h = (keys.indexOf(topic) + 1) * 104729;
  const d = String(day || '');
  for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) | 0;
  return h;
};

EQD._missionCache = {};
EQD.missionSet = function (topic, day) {
  const gen = EQD._missionGen[topic];
  if (!gen) return null;
  const ck = topic + '|' + (day || '');
  if (EQD._missionCache[ck]) return EQD._missionCache[ck];
  const rnd = EQD.mulberry(EQD._missionSeed(topic, day));
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const questions = [];
  for (let i = 0; i < EQD.MISSION_LEN; i++) questions.push(gen(ri, i >= 3 && i % 2 === 1));
  const set = { topic: topic, day: day, questions: questions };
  EQD._missionCache[ck] = set;
  return set;
};

/* ── sticker album (24 stickers) ─────────────────────────────
   Every sticker has a stable id, because the album remembers *which* ones a child
   owns — `s.stickerIds` — not just how many. The counter `s.stickers` stays the
   length of that list, so everything already reading the count keeps working.

   `set` groups a page of the album; `how` is the one line a child reads on a still
   locked slot, and it has to name something they can actually go and do today. */
EQD.STICKER_SETS = [
  { id: 'forest', name: { az: 'Meşə Dostları', en: 'Forest Friends', ru: 'Лесные Друзья' }, bg: '#E8FBF1', ink: '#2A9455' },
  { id: 'brave', name: { az: 'Cəsarət Nişanları', en: 'Badges of Courage', ru: 'Знаки Отваги' }, bg: '#FFE1E6', ink: '#D63A52' },
  { id: 'sky', name: { az: 'Səma Xəzinələri', en: 'Sky Treasures', ru: 'Небесные Сокровища' }, bg: '#E4F6FF', ink: '#2196C9' },
  { id: 'magic', name: { az: 'Sehrli Şeylər', en: 'Magic Things', ru: 'Волшебные Вещи' }, bg: '#EFE7FF', ink: '#5B3FD6' }
];

/* svg bodies are drawn inside a 0 0 36 36 box so one helper can size them all */
EQD.STICKERS = [
  /* — Meşə Dostları — */
  { id: 'leaf', set: 'forest', name: { az: 'Xoşbəxt Yarpaq', en: 'Happy Leaf', ru: 'Счастливый Листок' },
    how: { az: 'İlk sandığını aç', en: 'Open your first chest', ru: 'Открой свой первый сундук' },
    art: '<path d="M18 4 q12 8 12 16 a12 12 0 0 1 -24 0 q0-8 12-16 Z" fill="#3DBE6E"></path><path d="M18 8 V30" stroke="#2A9455" stroke-width="2.2"></path><circle cx="14" cy="18" r="1.8" fill="#0B3D25"></circle><circle cx="22" cy="18" r="1.8" fill="#0B3D25"></circle><path d="M14 23 q4 3 8 0" stroke="#0B3D25" stroke-width="2" fill="none" stroke-linecap="round"></path>' },
  { id: 'acorn', set: 'forest', name: { az: 'Palıd Qozası', en: 'Little Acorn', ru: 'Жёлудь' },
    how: { az: 'Bir sınaq həll et', en: 'Solve one challenge', ru: 'Реши одно испытание' },
    art: '<path d="M10 16 q8 18 16 0 Z" fill="#C9762F"></path><rect x="8" y="9" width="20" height="8" rx="4" fill="#8A5A0A"></rect><path d="M18 5 v4" stroke="#8A5A0A" stroke-width="2.4" stroke-linecap="round"></path>' },
  { id: 'mushroom', set: 'forest', name: { az: 'Nöqtəli Göbələk', en: 'Spotty Mushroom', ru: 'Гриб в Крапинку' },
    how: { az: 'Bir mərhələni bitir', en: 'Finish one stage', ru: 'Заверши один этап' },
    art: '<rect x="14" y="19" width="8" height="12" rx="4" fill="#FBE9CC"></rect><path d="M5 20 q1-13 13-13 q12 0 13 13 Z" fill="#FF5D73"></path><circle cx="12" cy="15" r="2.4" fill="#FFF7EA"></circle><circle cx="23" cy="13" r="2" fill="#FFF7EA"></circle>' },
  { id: 'fox', set: 'forest', name: { az: 'Tülkü Balası', en: 'Fox Cub', ru: 'Лисёнок' },
    how: { az: 'Dalbadal 2 gün oyna', en: 'Play 2 days in a row', ru: 'Играй 2 дня подряд' },
    art: '<path d="M7 12 L10 22 L7 22 Z M29 12 L26 22 L29 22 Z" fill="#E06327"></path><path d="M18 9 q11 2 11 11 q0 10 -11 10 q-11 0 -11-10 q0-9 11-11 Z" fill="#FF8A4C"></path><path d="M18 22 q-7 0 -8-5 q4 3 8 3 q4 0 8-3 q-1 5 -8 5 Z" fill="#FFF7EA"></path><circle cx="13" cy="19" r="1.9" fill="#3B2410"></circle><circle cx="23" cy="19" r="1.9" fill="#3B2410"></circle><circle cx="18" cy="24" r="2.1" fill="#3B2410"></circle>' },
  { id: 'owl', set: 'forest', name: { az: 'Müdrik Bayquş', en: 'Wise Owl', ru: 'Мудрая Сова' },
    how: { az: 'İpucu olmadan 5 sual həll et', en: 'Solve 5 questions with no hint', ru: 'Реши 5 вопросов без подсказки' },
    art: '<path d="M8 14 q10-8 20 0 q3 16 -10 17 q-13-1 -10-17 Z" fill="#8A6BE0"></path><circle cx="13.5" cy="17" r="5" fill="#FFF7EA"></circle><circle cx="22.5" cy="17" r="5" fill="#FFF7EA"></circle><circle cx="13.5" cy="17" r="2.2" fill="#2A1F45"></circle><circle cx="22.5" cy="17" r="2.2" fill="#2A1F45"></circle><path d="M18 21 l-3 3 h6 Z" fill="#FFC24B"></path>' },
  { id: 'tree', set: 'forest', name: { az: 'Böyük Ağac', en: 'Great Tree', ru: 'Большое Дерево' },
    how: { az: '3-cü səviyyəyə çat', en: 'Reach level 3', ru: 'Достигни 3 уровня' },
    art: '<rect x="15" y="20" width="6" height="12" rx="2" fill="#8A5A0A"></rect><circle cx="18" cy="13" r="9" fill="#3DBE6E"></circle><circle cx="11" cy="18" r="6" fill="#54D083"></circle><circle cx="25" cy="18" r="6" fill="#2A9455"></circle>' },

  /* — Cəsarət Nişanları — */
  { id: 'shield', set: 'brave', name: { az: 'Cəsarət Qalxanı', en: 'Brave Shield', ru: 'Щит Отваги' },
    how: { az: 'Bir bossla üzləş', en: 'Face one boss', ru: 'Сразись с одним боссом' },
    art: '<path d="M18 4 L30 8 v10 q0 10 -12 14 q-12-4 -12-14 V8 Z" fill="#FF5D73"></path><path d="M12 18 l4 4 8-9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>' },
  { id: 'dragon', set: 'brave', name: { az: 'Dost Əjdaha', en: 'Friendly Dragon', ru: 'Дружелюбный Дракон' },
    how: { az: 'Riyaziyyat Əjdahası ilə dost ol', en: 'Befriend the Math Dragon', ru: 'Подружись с Драконом Математики' },
    art: '<path d="M6 22 q4-14 14-14 q10 0 10 9 q0 10 -10 11 q-10 1 -14-6 Z" fill="#FF8A4C"></path><path d="M13 9 L11 3 L17 7 Z M23 8 L25 2 L27 9 Z" fill="#E06327"></path><circle cx="24" cy="16" r="2.2" fill="#2A1F45"></circle><path d="M6 22 q-3 4 1 7 q3-3 5-4 Z" fill="#E06327"></path>' },
  { id: 'crystal', set: 'brave', name: { az: 'Bilik Kristalı', en: 'Knowledge Crystal', ru: 'Кристалл Знаний' },
    how: { az: 'Fəslin finalını bitir', en: 'Clear a chapter finale', ru: 'Пройди финал главы' },
    art: '<path d="M18 3 L28 14 L22 33 H14 L8 14 Z" fill="#7FE0AE"></path><path d="M18 3 L28 14 L18 18 Z" fill="#C8FFE4"></path><path d="M18 18 L22 33 H14 Z" fill="#5CE39B"></path>' },
  { id: 'sword', set: 'brave', name: { az: 'Bilik Qılıncı', en: 'Sword of Knowing', ru: 'Меч Знания' },
    how: { az: 'Bir bossu məğlub et', en: 'Defeat one boss', ru: 'Победи одного босса' },
    art: '<path d="M17 3 h2 l2 18 h-6 Z" fill="#C9BCA6"></path><rect x="9" y="21" width="18" height="4" rx="2" fill="#8A5A0A"></rect><rect x="15" y="25" width="6" height="9" rx="3" fill="#C9762F"></rect>' },
  { id: 'flame', set: 'brave', name: { az: 'Seriya Alovu', en: 'Streak Flame', ru: 'Огонь Серии' },
    how: { az: 'Dalbadal 3 gün oyna', en: 'Play 3 days in a row', ru: 'Играй 3 дня подряд' },
    art: '<path d="M18 3 q10 10 10 18 a10 10 0 0 1 -20 0 q0-8 10-18 Z" fill="#FF8A4C"></path><path d="M18 15 q5 6 5 10 a5 5 0 0 1 -10 0 q0-4 5-10 Z" fill="#FFC24B"></path>' },
  { id: 'medal', set: 'brave', name: { az: 'Qızıl Medal', en: 'Gold Medal', ru: 'Золотая Медаль' },
    how: { az: 'Bir mərhələni səhvsiz bitir', en: 'Finish a stage with no mistakes', ru: 'Пройди этап без ошибок' },
    art: '<path d="M12 3 L16 15 h4 L24 3 Z" fill="#45C6F0"></path><circle cx="18" cy="23" r="10" fill="#FFC24B"></circle><circle cx="18" cy="23" r="6.5" fill="#E39B1C"></circle><path d="M18 18 l1.6 3.4 3.6 0.4 -2.8 2.4 0.8 3.6 -3.2-2 -3.2 2 0.8-3.6 -2.8-2.4 3.6-0.4 Z" fill="#FFF3D6"></path>' },

  /* — Səma Xəzinələri — */
  { id: 'star', set: 'sky', name: { az: 'Parlaq Ulduz', en: 'Bright Star', ru: 'Яркая Звезда' },
    how: { az: '500 XP topla', en: 'Collect 500 XP', ru: 'Собери 500 XP' },
    art: '<path d="M18 3 l4 11 11.5 0.6 -9 7.4 3 11.4 -9.5-6.4 -9.5 6.4 3-11.4 -9-7.4 11.5-0.6 Z" fill="#FFC24B"></path>' },
  { id: 'moon', set: 'sky', name: { az: 'Yuxulu Ay', en: 'Sleepy Moon', ru: 'Сонная Луна' },
    how: { az: 'Questy dincəlməyi deyəndə fasilə ver', en: 'Take a break when Questy asks', ru: 'Сделай перерыв, когда Квести попросит' },
    art: '<path d="M25 4 a14 14 0 1 0 7 22 a12 12 0 0 1 -7-22 Z" fill="#FFE9A8"></path><circle cx="20" cy="14" r="1.8" fill="#E39B1C"></circle><circle cx="16" cy="22" r="1.4" fill="#E39B1C"></circle>' },
  { id: 'rainbow', set: 'sky', name: { az: 'Göy Qurşağı', en: 'Rainbow', ru: 'Радуга' },
    how: { az: 'Bir səviyyə qaldır', en: 'Gain one level', ru: 'Поднимись на один уровень' },
    art: '<path d="M4 28 a14 14 0 0 1 28 0" fill="none" stroke="#FF5D73" stroke-width="4"></path><path d="M8 28 a10 10 0 0 1 20 0" fill="none" stroke="#FFC24B" stroke-width="4"></path><path d="M12 28 a6 6 0 0 1 12 0" fill="none" stroke="#45C6F0" stroke-width="4"></path>' },
  { id: 'cloud', set: 'sky', name: { az: 'Yumşaq Bulud', en: 'Soft Cloud', ru: 'Мягкое Облако' },
    how: { az: 'Bir tapşırıq gününü tamamla', en: 'Complete one quest day', ru: 'Заверши один день квеста' },
    art: '<path d="M10 25 a6 6 0 0 1 0.6-12 a8 8 0 0 1 15 -1 a6 6 0 0 1 1.4 13 Z" fill="#E4F6FF" stroke="#8FD8F5" stroke-width="2"></path>' },
  { id: 'rocket', set: 'sky', name: { az: 'Kiçik Raket', en: 'Little Rocket', ru: 'Маленькая Ракета' },
    how: { az: '5-ci səviyyəyə çat', en: 'Reach level 5', ru: 'Достигни 5 уровня' },
    art: '<path d="M18 3 q7 8 7 17 h-14 q0-9 7-17 Z" fill="#FFF7EA" stroke="#C9BCA6" stroke-width="1.6"></path><circle cx="18" cy="13" r="3.4" fill="#45C6F0"></circle><path d="M11 20 L6 27 h5 Z M25 20 L30 27 h-5 Z" fill="#FF5D73"></path><path d="M15 21 q3 8 3 12 q0-4 3-12 Z" fill="#FF8A4C"></path>' },
  { id: 'comet', set: 'sky', name: { az: 'Quyruqlu Ulduz', en: 'Comet', ru: 'Комета' },
    how: { az: 'Bir gündə 3 sınaq həll et', en: 'Solve 3 challenges in one day', ru: 'Реши 3 испытания за один день' },
    art: '<path d="M4 30 L20 14 l4 4 Z" fill="#8FD8F5"></path><circle cx="25" cy="11" r="7" fill="#FFE9A8"></circle><circle cx="25" cy="11" r="3.4" fill="#FFC24B"></circle>' },

  /* — Sehrli Şeylər — */
  { id: 'wand', set: 'magic', name: { az: 'Sehrli Çubuq', en: 'Magic Wand', ru: 'Волшебная Палочка' },
    how: { az: 'İpucu qığılcımı qazan', en: 'Earn a hint spark', ru: 'Получи искру-подсказку' },
    art: '<rect x="8" y="26" width="22" height="4" rx="2" transform="rotate(-40 19 28)" fill="#5B3FD6"></rect><path d="M25 4 l2.6 5.4 5.4 2.6 -5.4 2.6 -2.6 5.4 -2.6-5.4 -5.4-2.6 5.4-2.6 Z" fill="#FFE9A8"></path>' },
  { id: 'potion', set: 'magic', name: { az: 'Fikir İksiri', en: 'Idea Potion', ru: 'Зелье Идей' },
    how: { az: 'Bir çətin sualı asanı ilə həll et', en: 'Use an easier one to get unstuck', ru: 'Пройди трудный вопрос через лёгкий' },
    art: '<rect x="14" y="3" width="8" height="7" rx="2" fill="#C9BCA6"></rect><path d="M14 9 h8 l5 11 a9 9 0 0 1 -18 0 Z" fill="#E4F6FF" stroke="#8FD8F5" stroke-width="1.6"></path><path d="M11 19 h14 a9 9 0 0 1 -14 0 Z" fill="#7B5CFF"></path>' },
  { id: 'key', set: 'magic', name: { az: 'Qədim Açar', en: 'Ancient Key', ru: 'Древний Ключ' },
    how: { az: 'Qədim Qapını aç', en: 'Open the Ancient Gate', ru: 'Открой Древние Врата' },
    art: '<circle cx="12" cy="12" r="7.5" fill="none" stroke="#FFC24B" stroke-width="4"></circle><path d="M17 17 L30 30 M25 26 l3-3 M21 22 l3-3" stroke="#FFC24B" stroke-width="4" stroke-linecap="round"></path>' },
  { id: 'book', set: 'magic', name: { az: 'Söz Kitabı', en: 'Book of Words', ru: 'Книга Слов' },
    how: { az: 'Bir hekayəni sona qədər oxu', en: 'Read one story to the end', ru: 'Прочитай одну историю до конца' },
    art: '<path d="M5 7 q9-4 13 2 q4-6 13-2 v21 q-9-4 -13 2 q-4-6 -13-2 Z" fill="#FBE9CC" stroke="#C9762F" stroke-width="1.8"></path><path d="M18 9 V30" stroke="#C9762F" stroke-width="1.8"></path>' },
  { id: 'lantern', set: 'magic', name: { az: 'Yol Fənəri', en: 'Path Lantern', ru: 'Фонарь Пути' },
    how: { az: 'Yeni bir fəsil aç', en: 'Open a new chapter', ru: 'Открой новую главу' },
    art: '<path d="M18 2 v4" stroke="#8A5A0A" stroke-width="2.2" stroke-linecap="round"></path><rect x="9" y="6" width="18" height="4" rx="2" fill="#8A5A0A"></rect><path d="M11 10 h14 v16 a7 7 0 0 1 -14 0 Z" fill="#FFE9A8" stroke="#E39B1C" stroke-width="1.8"></path><circle cx="18" cy="19" r="4" fill="#FFC24B"></circle>' },
  { id: 'questy', set: 'magic', name: { az: 'Questy!', en: 'Questy!', ru: 'Квести!' },
    how: { az: 'Albomun qalanını doldur', en: 'Fill the rest of the album', ru: 'Заполни остальной альбом' },
    art: '<rect x="4" y="7" width="28" height="23" rx="7" fill="#5CE39B"></rect><path d="M11 21 q7-9 14 0" stroke="#0B3D25" stroke-width="2.8" fill="none" stroke-linecap="round"></path><circle cx="13" cy="15" r="2.2" fill="#0B3D25"></circle><circle cx="23" cy="15" r="2.2" fill="#0B3D25"></circle>' }
];

EQD.STICKER_BY_ID = {};
EQD.STICKERS.forEach((st, i) => { st.no = i + 1; EQD.STICKER_BY_ID[st.id] = st; });

/* the next sticker a child has not got yet, in album order — what a chest hands over */
EQD.nextSticker = function (owned) {
  const have = owned || [];
  for (let i = 0; i < EQD.STICKERS.length; i++) {
    if (have.indexOf(EQD.STICKERS[i].id) < 0) return EQD.STICKERS[i];
  }
  return null;
};
