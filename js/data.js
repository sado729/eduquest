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
    boss: [EQD._qGroups(ri, true), EQD._qDouble(ri, true), EQD._qTakeAway(ri), EQD._qAdd(ri, true)]
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
        boss: EQD.BOSS
      };
    }
    return EQD._day0;
  }
  return EQD.genDay(day);
};
