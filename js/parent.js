/* EduQuest — parent mode (design screens 22–27). Same brand, adult register, gated.
   Screens 23–26 read real play data recorded in EQ.s.track (see js/tracking.js). */

/* parent tab bar */
EQS.ptabs = function (active) {
  const item = (key, screen, label, icon) => `
    <div class="press" onclick="EQ.go('${screen}')" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px">
      ${icon(active === key ? '#7B5CFF' : '#A197BC')}
      <span style="font:800 9.5px Nunito;color:${active === key ? '#7B5CFF' : '#A197BC'}">${label}</span>
    </div>`;
  const grid = c => `<svg width="21" height="21" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="2" fill="${c === '#7B5CFF' ? '#7B5CFF' : '#C8B4FF'}"></rect><rect x="13" y="4" width="7" height="7" rx="2" fill="#C8B4FF"></rect><rect x="4" y="13" width="7" height="7" rx="2" fill="#C8B4FF"></rect><rect x="13" y="13" width="7" height="7" rx="2" fill="#C8B4FF"></rect></svg>`;
  const bars = c => `<svg width="21" height="21" viewBox="0 0 24 24"><path d="M4 18 V10 M10 18 V5 M16 18 v-6 M22 18 V8" stroke="${c}" stroke-width="2.6" stroke-linecap="round"></path></svg>`;
  const star = c => c === '#7B5CFF'
    ? `<svg width="21" height="21" viewBox="0 0 24 24"><path d="M12 3 l2.6 6.4 6.8 0.6 -5.2 4.6 1.6 6.8 -5.8-3.6 -5.8 3.6 1.6-6.8 -5.2-4.6 6.8-0.6 Z" fill="#7B5CFF"></path></svg>`
    : `<svg width="21" height="21" viewBox="0 0 24 24"><path d="M12 3 l2.6 6.4 6.8 0.6 -5.2 4.6 1.6 6.8 -5.8-3.6 -5.8 3.6 1.6-6.8 -5.2-4.6 6.8-0.6 Z" fill="none" stroke="${c}" stroke-width="2"></path></svg>`;
  const gear = c => `<svg width="21" height="21" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.4" fill="none" stroke="${c}" stroke-width="2"></circle><path d="M12 3.6 v3 M12 17.4 v3 M3.6 12 h3 M17.4 12 h3" stroke="${c}" stroke-width="2" stroke-linecap="round"></path></svg>`;
  /* fixed, not absolute: inside a scrolling screen an absolute bar scrolls with the
     content and parks itself on top of whatever sits 82px above the fold */
  return `<div style="position:fixed;bottom:0;left:0;right:0;height:82px;background:#fff;box-shadow:0 -1px 0 #E4DDF4;display:flex;padding:0 8px 14px;z-index:40">
    ${item('overview', 'parent_dashboard', TX({ az: 'İcmal', en: 'Overview', ru: 'Обзор' }), grid)}
    ${item('progress', 'parent_progress', TX({ az: 'İnkişaf', en: 'Progress', ru: 'Прогресс' }), bars)}
    ${item('quests', 'parent_quests', TX({ az: 'Tapşırıqlar', en: 'Quests', ru: 'Задания' }), star)}
    ${item('settings', 'parent_settings', TX({ az: 'Tənzimləmələr', en: 'Settings', ru: 'Настройки' }), gear)}
  </div>`;
};

EQS.ptoggle = function (key, on) {
  return on
    ? `<div class="press" onclick="EQ.ptoggle('${key}')" style="width:52px;height:30px;border-radius:15px;background:#7B5CFF;position:relative;flex:none"><div style="position:absolute;top:3px;right:3px;width:24px;height:24px;border-radius:12px;background:#fff"></div></div>`
    : `<div class="press" onclick="EQ.ptoggle('${key}')" style="width:52px;height:30px;border-radius:15px;background:#E0D8F2;position:relative;flex:none"><div style="position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:12px;background:#fff"></div></div>`;
};

/* 22 · Parent gate */
EQS.meta.parent_gate = { light: true };
EQS.screens.parent_gate = function (s) {
  const input = EQ.session.gateInput || '';
  const slot = i => {
    const ch = input[i] || '';
    const active = i === input.length;
    return `<div style="flex:1;height:54px;border-radius:16px;background:#F4F1FA;box-shadow:0 0 0 2px ${active ? '#7B5CFF' : '#E0D8F2'} inset;display:flex;align-items:center;justify-content:center;font:800 26px 'Baloo 2';color:${ch ? '#2A1F45' : '#C4BBD8'}">${ch || '–'}</div>`;
  };
  const key = n => `<div class="press" onclick="EQ.gateKey('${n}')" style="height:50px;border-radius:15px;background:#fff;box-shadow:0 3px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;font:800 21px 'Baloo 2';color:#2A1F45">${n}</div>`;
  return `<div class="scr" style="background:#F4F1FA">
    <div style="position:absolute;top:0;left:0;right:0;height:300px;background:#2C1F52;border-radius:0 0 40px 40px;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(220px 200px at 50% 40%, rgba(123,92,255,0.45), rgba(44,31,82,0) 72%)"></div>
      <div class="press" onclick="EQ.exitParent()" style="position:absolute;top:62px;left:16px;width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center">${EQC.chevL('#fff', 19)}</div>
      <div style="position:absolute;top:132px;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:14px">
        <div style="width:74px;height:74px;border-radius:26px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center"><svg width="36" height="36" viewBox="0 0 24 24"><rect x="4.6" y="10" width="14.8" height="10.4" rx="3.4" fill="#C8B4FF"></rect><path d="M8.4 10 V7.4 a3.6 3.6 0 0 1 7.2 0 V10" fill="none" stroke="#C8B4FF" stroke-width="2.4"></path></svg></div>
        <div style="text-align:center"><div style="font:800 26px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Valideyn bölməsi', en: 'Parent area', ru: 'Раздел для родителей' })}</div><div style="font:700 13px Nunito;color:#A896E0;margin-top:6px">${TX({ az: 'İnkişaf, limitlər və alışlar buradadır', en: 'Progress, limits and purchases live here', ru: 'Прогресс, лимиты и покупки находятся здесь' })}</div></div>
      </div>
    </div>
    <div id="gate-card" style="position:absolute;top:314px;left:20px;right:20px;background:#fff;border-radius:28px;padding:18px;box-shadow:0 10px 24px -14px rgba(42,31,69,0.35)">
      <div style="font:700 11px Nunito;color:#8878A8;letter-spacing:1.6px">${TX({ az: 'BÖYÜKLƏR ÜÇÜN YOXLAMA', en: 'GROWN-UP CHECK', ru: 'ПРОВЕРКА ДЛЯ ВЗРОСЛЫХ' })}</div>
      <div style="font:800 26px 'Baloo 2', system-ui;color:#2A1F45;margin-top:10px">${TX({ az: '12 × 4 neçə edir?', en: 'What is 12 × 4?', ru: 'Сколько будет 12 × 4?' })}</div>
      <div style="display:flex;gap:10px;margin-top:18px">${slot(0)}${slot(1)}${slot(2)}</div>
    </div>
    <div style="position:absolute;top:492px;left:20px;right:20px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      ${key(1)}${key(2)}${key(3)}${key(4)}${key(5)}${key(6)}${key(7)}${key(8)}${key(9)}
      <div class="press" onclick="EQ.gateBack()" style="height:50px;border-radius:15px;background:#EFEAF9;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M9 6 h11 v12 H9 L3 12 Z" fill="none" stroke="#8878A8" stroke-width="2.2" stroke-linejoin="round"></path><path d="M12 10 l5 4 M17 10 l-5 4" stroke="#8878A8" stroke-width="2.2" stroke-linecap="round"></path></svg></div>
      ${key(0)}
      <div class="press" onclick="EQ.gateSubmit()" style="height:50px;border-radius:15px;background:#7B5CFF;box-shadow:0 3px 0 #5B3FD6;display:flex;align-items:center;justify-content:center">${EQC.arrowR('#fff', 22)}</div>
    </div>
    <div style="position:absolute;bottom:84px;left:20px;right:20px;border-radius:20px;background:#EFEAF9;padding:13px 16px;display:flex;gap:10px;align-items:flex-start">
      <svg width="18" height="18" viewBox="0 0 24 24" style="margin-top:1px;flex:none"><path d="M12 3 l8 4 v6 c0 5-3.6 7.4-8 8.6 -4.4-1.2 -8-3.6 -8-8.6 V7 Z" fill="none" stroke="#7B5CFF" stroke-width="2"></path></svg>
      <div style="font:700 12.5px Nunito;color:#5C4E7E;line-height:1.5">${TX({ az: 'Nə söhbət, nə reklam, nə də oyundaxili mağaza var. Alışlar yalnız buradan edilir.', en: 'No chat, no ads, no in-game store. Purchases are only ever made here.', ru: 'Ни чата, ни рекламы, ни внутриигрового магазина. Покупки совершаются только здесь.' })}</div>
    </div>
    <div class="press" onclick="EQ.exitParent()" style="position:absolute;bottom:40px;left:0;right:0;text-align:center;font:800 14px 'Baloo 2';color:#8878A8">${TX({ az: 'Macəraya qayıt', en: 'Back to the adventure', ru: 'Вернуться к приключению' })}</div>
  </div>`;
};

/* 23 · Parent dashboard — real numbers from EQ.s.track */
EQS.meta.parent_dashboard = { light: false };
EQS.screens.parent_dashboard = function (s) {
  /* everything on this screen reads one range: the week by default, a fortnight or a
     month if the grown-up taps the picker. `prev` is always the same span just before it. */
  const R = EQT.range(EQ.session.range);
  const N = R.days;
  const rangeName = TX({
    week: { az: 'Bu həftə', en: 'This week', ru: 'Эта неделя' },
    fort: { az: '2 həftə', en: '2 weeks', ru: '2 недели' },
    month: { az: '30 gün', en: '30 days', ru: '30 дней' }
  }[R.key]);
  const rangeSub = TX({
    week: { az: 'son 7 gün', en: 'last 7 days', ru: 'последние 7 дней' },
    fort: { az: 'son 14 gün', en: 'last 14 days', ru: 'последние 14 дней' },
    month: { az: 'son 30 gün', en: 'last 30 days', ru: 'последние 30 дней' }
  }[R.key]);
  const vsPrev = TX({
    week: { az: 'keçən həftəyə görə', en: 'vs last week', ru: 'к прошлой неделе' },
    fort: { az: 'əvvəlki 2 həftəyə görə', en: 'vs previous 2 weeks', ru: 'к прошлым 2 неделям' },
    month: { az: 'əvvəlki 30 günə görə', en: 'vs previous 30 days', ru: 'к прошлым 30 дням' }
  }[R.key]);
  const firstActive = TX({
    week: { az: 'ilk aktiv həftə', en: 'first active week', ru: 'первая активная неделя' },
    fort: { az: 'ilk aktiv 2 həftə', en: 'first active 2 weeks', ru: 'первые активные 2 недели' },
    month: { az: 'ilk aktiv 30 gün', en: 'first active 30 days', ru: 'первые активные 30 дней' }
  }[R.key]);

  const span = EQT.lastDays(N);
  const todayKey = EQ.dayKey();
  const mins7 = EQT.rangeMins(R.key, 0);
  const minsPrev = EQT.rangeMins(R.key, 1);
  const a7 = EQT.sumDays(N, 'a');
  const c7 = EQT.sumDays(N, 'c');

  /* learning-time delta line */
  let deltaLine, deltaColor;
  if (mins7 === 0 && minsPrev === 0) {
    deltaLine = TX({ az: 'hələ oyun vaxtı yoxdur', en: 'no play time yet', ru: 'времени игры пока нет' }); deltaColor = '#8878A8';
  } else if (minsPrev === 0) {
    deltaLine = firstActive; deltaColor = '#2A9455';
  } else {
    const dl = mins7 - minsPrev;
    deltaLine = (dl >= 0 ? '+' : '−') + EQT.fmtMin(Math.abs(dl)) + ' ' + vsPrev;
    deltaColor = dl >= 0 ? '#2A9455' : '#8878A8';
  }

  /* challenges card */
  const chLine = a7 > 0
    ? Math.round(c7 / a7 * 100) + '% ' + TX({ az: 'ilk cəhddə düz', en: 'first-try correct', ru: 'верно с первой попытки' })
    : TX({ az: 'hələ sınaq yoxdur', en: 'no challenges yet', ru: 'испытаний пока нет' });
  const chColor = a7 > 0 ? '#2A9455' : '#8878A8';

  /* daily-limit card — today's state first, the rest of the range behind it */
  const bonusNow = EQ.bonusMins();
  const limitToday = s.settings.limit + bonusNow;
  const minsToday = Math.round(EQ.playedToday());
  const limitHit = span.filter(x => EQT.minutes(x.d) >= s.settings.limit).length;
  const limitFull = minsToday >= limitToday;
  const limitLine = limitFull
    ? TX({ az: `bu gün dolub${bonusNow ? ` · +${bonusNow} dəq verildi` : ''}`, en: `reached today${bonusNow ? ` · +${bonusNow} min given` : ''}`, ru: `сегодня достигнут${bonusNow ? ` · выдано +${bonusNow} мин` : ''}` })
    : minsToday > 0
      ? TX({ az: `bu gün ${minsToday}/${limitToday} dəq`, en: `today ${minsToday}/${limitToday} min`, ru: `сегодня ${minsToday}/${limitToday} мин` })
      : limitHit > 0
        ? TX({ az: `${N} gündə ${limitHit}-ində dolub`, en: `Reached ${limitHit} of ${N} days`, ru: `Достигнут в ${limitHit} из ${N} дней` })
        : TX({ az: `son ${N} gündə dolmayıb`, en: `not reached in ${N} days`, ru: `не достигнут за ${N} дней` });

  /* minutes bars, oldest left — one per day for a week, one per block for longer ranges */
  const blocks = EQT.buckets(R.key);
  const maxM = Math.max(1, ...blocks.map(b => b.mins));
  const gap = blocks.length > 10 ? 5 : 9;
  const bars = blocks.map(b => {
    const m = b.mins;
    const isNow = b.k === todayKey; /* the block the child is in right now */
    const h = m > 0 ? Math.max(12, Math.round(m / maxM * 84)) : 6;
    const bg = isNow ? '#7B5CFF' : (m > 0 ? '#C8B4FF' : '#E4DDF4');
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;justify-content:flex-end"><div style="width:100%;height:${h}px;border-radius:8px;background:${bg}" title="${m}"></div><span style="font:700 9.5px Nunito;color:${isNow ? '#5C4E7E' : '#8878A8'}">${EQT.bucketLabel(b)}</span></div>`;
  }).join('');

  /* where the time went (over the chosen range, split by screen type) */
  const secQ = span.reduce((t, x) => t + ((x.d && x.d.secsQ) || 0), 0);
  const secB = span.reduce((t, x) => t + ((x.d && x.d.secsB) || 0), 0);
  const secT = span.reduce((t, x) => t + ((x.d && x.d.secs) || 0), 0);
  const secE = Math.max(0, secT - secQ - secB);
  const splitRow = (icon, iconBg, label, secs, barColor) => {
    const pct = secT > 0 ? Math.round(secs / secT * 100) : 0;
    return `<div style="display:flex;align-items:center;gap:12px"><div style="width:34px;height:34px;border-radius:12px;background:${iconBg};display:flex;align-items:center;justify-content:center;flex:none">${icon}</div><div style="flex:1"><div style="font:800 12.5px Nunito;color:#2A1F45">${label}</div><div style="height:7px;border-radius:4px;background:#EFEAF9;margin-top:5px"><div style="width:${pct}%;height:100%;border-radius:4px;background:${barColor}"></div></div></div><span style="font:800 12px 'Baloo 2';color:#5C4E7E">${EQT.fmtMin(Math.round(secs / 60))}</span></div>`;
  };
  const splitBody = secT >= 30
    ? splitRow(`<svg width="18" height="18" viewBox="0 0 36 36"><circle cx="17" cy="15" r="12" fill="#3DBE6E"></circle><path d="M15 26 h4 v7 h-4 Z" fill="#8A5A34"></path></svg>`, '#E8FBF1', TX({ az: 'Gündəlik sınaqlar', en: 'Daily challenges', ru: 'Ежедневные испытания' }), secQ, '#3DBE6E')
      + splitRow(EQC.trophy('#FFC24B', 18), '#FFF3D6', TX({ az: 'Boss döyüşləri', en: 'Boss battles', ru: 'Битвы с боссами' }), secB, '#FFC24B')
      + splitRow(`<svg width="18" height="18" viewBox="0 0 36 36"><path d="M5 9 q7-3 13 2 v20 q-6-5 -13-2 Z" fill="#45C6F0"></path><path d="M31 9 q-7-3 -13 2 v20 q6-5 13-2 Z" fill="#7B5CFF"></path></svg>`, '#EFE7FF', TX({ az: 'Xəritə və kolleksiya', en: 'Map & collection', ru: 'Карта и коллекция' }), secE, '#7B5CFF')
    : `<div style="font:700 12.5px Nunito;color:#8878A8;line-height:1.5">${TX({ az: 'İlk sessiyadan sonra vaxtın bölgüsü burada görünəcək.', en: 'After the first session, the time split will appear here.', ru: 'После первого занятия здесь появится распределение времени.' })}</div>`;

  return `<div class="scr" style="background:#F4F1FA">
    <div style="position:absolute;top:56px;left:20px;right:20px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.exitParent()" style="position:relative;width:52px;height:52px;flex:none">
        <div style="position:absolute;inset:0;border-radius:50%;background:#FFC24B"></div>
        <div style="position:absolute;inset:3px;border-radius:50%;background:#FFF3DF;overflow:hidden">${EQC.hero(s.hero, 'position:absolute;left:-19px;top:-8px;width:88px')}</div>
      </div>
      <div style="flex:1"><div style="font:800 20px 'Baloo 2', system-ui;color:#2A1F45">${s.heroName}</div><div style="font:700 12px Nunito;color:#8878A8">${TX({ az: `Səviyyə ${s.level} · ${EQ.rank(s.level)}`, en: `Level ${s.level} · ${EQ.rank(s.level)}`, ru: `Уровень ${s.level} · ${EQ.rank(s.level)}` })}</div></div>
      <div class="press" onclick="EQ.cycleRange()" style="height:38px;padding:0 12px;border-radius:14px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;gap:6px;font:800 12px Nunito;color:#5C4E7E">${rangeName}<svg width="12" height="12" viewBox="0 0 24 24"><path d="M6 9.5 L12 15.5 L18 9.5" fill="none" stroke="#5C4E7E" stroke-width="2.6" stroke-linecap="round"></path></svg></div>
    </div>
    <div style="position:absolute;top:124px;left:20px;right:20px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div style="border-radius:24px;background:#fff;padding:15px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)"><div style="font:700 10.5px Nunito;color:#8878A8;letter-spacing:1.2px">${TX({ az: 'ÖYRƏNMƏ VAXTI', en: 'LEARNING TIME', ru: 'ВРЕМЯ УЧЁБЫ' })}</div><div style="font:800 28px 'Baloo 2';color:#2A1F45;margin-top:6px">${EQT.fmtMin(mins7)}</div><div style="font:700 11px Nunito;color:${deltaColor}">${deltaLine}</div></div>
      <div style="border-radius:24px;background:#fff;padding:15px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)"><div style="font:700 10.5px Nunito;color:#8878A8;letter-spacing:1.2px">${TX({ az: 'SINAQLAR', en: 'CHALLENGES', ru: 'ИСПЫТАНИЯ' })}</div><div style="font:800 28px 'Baloo 2';color:#2A1F45;margin-top:6px">${a7}</div><div style="font:700 11px Nunito;color:${chColor}">${chLine}</div></div>
      <div style="border-radius:24px;background:#fff;padding:15px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)"><div style="font:700 10.5px Nunito;color:#8878A8;letter-spacing:1.2px">${TX({ az: 'SERİYA', en: 'STREAK', ru: 'СЕРИЯ' })}</div><div style="font:800 28px 'Baloo 2';color:#2A1F45;margin-top:6px">${TX({ az: `${s.streak} gün`, en: `${s.streak} days`, ru: `${s.streak} ${RUP(s.streak, 'день', 'дня', 'дней')}` })}</div><div style="font:700 11px Nunito;color:#8878A8">${TX({ az: `Ən uzunu: ${Math.max(s.bestStreak || 1, s.streak)}`, en: `Longest: ${Math.max(s.bestStreak || 1, s.streak)}`, ru: `Рекорд: ${Math.max(s.bestStreak || 1, s.streak)}` })}</div></div>
      <div style="border-radius:24px;background:#fff;padding:15px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)"><div style="font:700 10.5px Nunito;color:#8878A8;letter-spacing:1.2px">${TX({ az: 'GÜNLÜK LİMİT', en: 'DAILY LIMIT', ru: 'ДНЕВНОЙ ЛИМИТ' })}</div><div style="font:800 28px 'Baloo 2';color:#2A1F45;margin-top:6px">${s.settings.limit}${TX({ az: 'd', en: 'm', ru: 'м' })}</div><div style="font:700 11px Nunito;color:${limitFull || minsToday > 0 || limitHit > 0 ? '#7B5CFF' : '#8878A8'}">${limitLine}</div></div>
    </div>
    <div style="position:absolute;top:368px;left:20px;right:20px;border-radius:26px;background:#fff;padding:16px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)">
      <div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font:800 15px 'Baloo 2';color:#2A1F45">${TX({ az: 'Oynanılan dəqiqələr', en: 'Minutes played', ru: 'Сыгранные минуты' })}</div><div style="font:700 11px Nunito;color:#8878A8">${rangeSub}</div></div>
      <div style="display:flex;align-items:flex-end;gap:${gap}px;height:86px;margin-top:12px">${bars}</div>
    </div>
    <div style="position:absolute;top:518px;left:20px;right:20px;border-radius:26px;background:#fff;padding:14px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3);display:flex;flex-direction:column;gap:11px">
      <div style="font:800 15px 'Baloo 2';color:#2A1F45">${TX({ az: 'Vaxt hara gedib', en: 'Where the time went', ru: 'Куда ушло время' })}</div>
      ${splitBody}
    </div>
    <div class="press" onclick="EQ.go('parent_quests')" style="position:absolute;bottom:100px;left:20px;right:20px;height:58px;border-radius:20px;background:#7B5CFF;box-shadow:0 4px 0 #5B3FD6;display:flex;align-items:center;justify-content:center;gap:9px;font:800 17px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Öyrənmə tapşırığı yarat', en: 'Create a learning quest', ru: 'Создать учебное задание' })}</div>
    ${EQS.ptabs('overview')}
  </div>`;
};

/* 24 · Child progress — real weekly skills, session history and Questy's note */
EQS.meta.parent_progress = { light: false };
EQS.screens.parent_progress = function (s) {
  /* "new this week" chips from the last 7 days of topic stats */
  const t7 = EQT.topicStats(7);
  const chips = Object.keys(EQT.TOPICS).filter(k => t7[k] && t7[k].a > 0).map(k => {
    const st = t7[k];
    const solid = st.a >= 2 && st.c / st.a >= 0.75;
    const label = TX(EQT.TOPICS[k].name) + (solid ? '' : ' · ' + TX({ az: 'başlanıb', en: 'started', ru: 'начато' }));
    const bg = solid ? 'rgba(92,227,155,0.18)' : 'rgba(255,194,75,0.18)';
    const fg = solid ? '#8FE0B6' : '#FFD98A';
    return `<div style="padding:8px 12px;border-radius:14px;background:${bg};font:800 12px Nunito;color:${fg}">${label}</div>`;
  }).join('');
  const chipsBody = chips || `<div style="padding:8px 12px;border-radius:14px;background:rgba(255,255,255,0.08);font:700 12px Nunito;color:#A896E0">${TX({ az: 'İlk sınaqlardan sonra yeni bacarıqlar burada görünəcək', en: 'New skills will appear here after the first challenges', ru: 'Новые навыки появятся здесь после первых испытаний' })}</div>`;

  /* session history: last 7 calendar days, newest first, not before first install */
  const startKey = (s.track && s.track.start) || EQ.dayKey();
  const todayKey = EQ.dayKey();
  const days = EQT.lastDays(7).reverse().filter(x => x.k >= startKey);
  const anyActivity = days.some(x => x.d && (x.d.a > 0 || EQT.minutes(x.d) >= 1));
  const rows = anyActivity ? days.map(x => {
    const badge = EQT.dayBadge(x.date);
    const active = x.d && (x.d.a > 0 || EQT.minutes(x.d) >= 1);
    if (!active) {
      const isToday = x.k === todayKey;
      const title = isToday ? TX({ az: 'Bu gün', en: 'Today', ru: 'Сегодня' }) : TX({ az: 'İstirahət günü', en: 'Day off', ru: 'Выходной' });
      const sub = isToday
        ? TX({ az: 'Hələ oynamayıb', en: 'No play yet', ru: 'Ещё не играл(а)' })
        : TX({ az: 'Seriya qorundu — çatdırma təzyiqi yoxdur', en: 'Streak protected — no catch-up pressure', ru: 'Серия сохранена — без давления навёрстывать' });
      return `<div style="border-radius:22px;background:#fff;padding:13px;box-shadow:0 5px 16px -12px rgba(42,31,69,0.3);display:flex;gap:12px;align-items:flex-start">
        <div style="width:44px;height:44px;border-radius:15px;background:#F4F1FA;display:flex;align-items:center;justify-content:center;flex:none"><span style="font:800 13px 'Baloo 2';color:#A197BC">${badge}</span></div>
        <div style="flex:1"><div style="font:800 14.5px Nunito;color:#8878A8">${title}</div><div style="font:700 12px Nunito;color:#A197BC;margin-top:3px">${sub}</div></div>
      </div>`;
    }
    const d = x.d;
    const mins = EQT.minutes(d);
    const qTitle = d.title ? TX(d.title) : TX({ az: 'Məşq sessiyası', en: 'Practice session', ru: 'Тренировка' });
    const title = d.bossWin > 1
      ? TX({ az: `${d.bossWin} macəra tamamlandı`, en: `Cleared ${d.bossWin} adventures`, ru: `Пройдено приключений: ${d.bossWin}` })
      : d.bossWin
        ? TX({ az: `«${qTitle}» tamamlandı`, en: `Cleared “${qTitle}”`, ru: `Пройдено: «${qTitle}»` })
        : qTitle;
    const bits = [
      TX({ az: `${mins} dəq`, en: `${mins} min`, ru: `${mins} мин` }),
      TX({ az: `${d.a} sınaq`, en: `${d.a} challenge${d.a === 1 ? '' : 's'}`, ru: `${d.a} ${RUP(d.a, 'испытание', 'испытания', 'испытаний')}` }),
      TX({ az: `ilk cəhddə ${d.c} düz`, en: `${d.c} right first try`, ru: `${d.c} верно с первой попытки` })
    ];
    if (d.hints > 0) bits.push(TX({ az: `${d.hints} ipucu`, en: `${d.hints} hint${d.hints === 1 ? '' : 's'}`, ru: `${d.hints} ${RUP(d.hints, 'подсказка', 'подсказки', 'подсказок')}` }));
    const subjChips = Object.keys(d.subj || {}).filter(k => EQT.SUBJECTS[k]).map(k => {
      const sj = EQT.SUBJECTS[k];
      return `<span style="padding:4px 8px;border-radius:9px;background:${sj.bg};font:800 10px Nunito;color:${sj.fg}">${TX(sj.name)}</span>`;
    });
    if (d.a >= 3 && d.c / d.a < 0.6) subjChips.push(`<span style="padding:4px 8px;border-radius:9px;background:#FFF3D6;font:800 10px Nunito;color:#8A5A0A">${TX({ az: 'Məşq lazımdır', en: 'Needs practice', ru: 'Нужна практика' })}</span>`);
    return `<div style="border-radius:22px;background:#fff;padding:13px;box-shadow:0 5px 16px -12px rgba(42,31,69,0.3);display:flex;gap:12px;align-items:flex-start">
      <div style="width:44px;height:44px;border-radius:15px;background:#EFE7FF;display:flex;align-items:center;justify-content:center;flex:none"><span style="font:800 13px 'Baloo 2';color:#5B3FD6">${badge}</span></div>
      <div style="flex:1"><div style="font:800 14.5px Nunito;color:#2A1F45">${title}</div><div style="font:700 12px Nunito;color:#8878A8;margin-top:3px;line-height:1.45">${bits.join(' · ')}</div>${subjChips.length ? `<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">${subjChips.join('')}</div>` : ''}</div>
    </div>`;
  }).join('') : `<div style="border-radius:22px;background:#fff;padding:18px;box-shadow:0 5px 16px -12px rgba(42,31,69,0.3);display:flex;gap:12px;align-items:center">
      <div style="width:44px;height:44px;border-radius:15px;background:#EFE7FF;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;flex:none">${EQC.questy('happy', 'width:38px', s.questyFur, s.questyFurDark)}</div>
      <div style="font:700 12.5px Nunito;color:#5C4E7E;line-height:1.5">${TX({ az: `Hələ sessiya yoxdur — ${s.heroName} ilk macərasını oynayanda tarixçə burada görünəcək.`, en: `No sessions yet — the history will appear here once ${s.heroName} plays the first adventure.`, ru: `Занятий пока нет — история появится здесь после первого приключения.` })}</div>
    </div>`;

  return `<div class="scr" style="background:#F4F1FA">
    <div style="position:absolute;top:56px;left:20px;right:20px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.go('parent_dashboard')" style="width:42px;height:42px;border-radius:15px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#2A1F45', 18)}</div>
      <div style="flex:1"><div style="font:800 20px 'Baloo 2', system-ui;color:#2A1F45">${TX({ az: `${s.heroName} — inkişaf`, en: `${s.heroName}'s progress`, ru: `Прогресс: ${s.heroName}` })}</div><div style="font:700 12px Nunito;color:#8878A8">${TX({ az: 'Son 7 gün', en: 'Last 7 days', ru: 'Последние 7 дней' })}</div></div>
      <div class="press" onclick="EQ.go('parent_analytics')" style="height:38px;padding:0 12px;border-radius:14px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;gap:6px;font:800 12px Nunito;color:#7B5CFF">${TX({ az: 'Analitika', en: 'Analytics', ru: 'Аналитика' })}${EQC.chevR('#7B5CFF', 12)}</div>
    </div>
    <div style="position:absolute;top:120px;left:20px;right:20px;border-radius:26px;background:#2C1F52;padding:18px">
      <div style="font:700 10.5px Nunito;color:#A896E0;letter-spacing:1.4px">${TX({ az: 'BU HƏFTƏ YENİ', en: 'NEW THIS WEEK', ru: 'НОВОЕ НА ЭТОЙ НЕДЕЛЕ' })}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">${chipsBody}</div>
    </div>
    <div style="position:absolute;top:276px;left:20px;right:20px;font:800 13px 'Baloo 2';color:#5C4E7E">${TX({ az: 'Sessiya tarixçəsi', en: 'Session history', ru: 'История занятий' })}</div>
    <div style="position:absolute;top:304px;left:20px;right:20px;bottom:200px;display:flex;flex-direction:column;gap:9px" class="vscroll">
      ${rows}
    </div>
    <div style="position:absolute;bottom:96px;left:20px;right:20px;border-radius:22px;background:#EFEAF9;padding:13px;display:flex;gap:11px;align-items:center">
      <div style="width:42px;height:42px;border-radius:15px;background:#fff;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;flex:none">${EQC.questy('happy', 'width:38px', s.questyFur, s.questyFurDark)}</div>
      <div style="font:700 12.5px Nunito;color:#5C4E7E;line-height:1.5">${EQT.insight(s)}</div>
    </div>
    ${EQS.ptabs('progress')}
  </div>`;
};

/* 25 · Learning analytics — real subject accuracy, weekly trend, strengths & gaps */
EQS.meta.parent_analytics = { light: false };
EQS.screens.parent_analytics = function (s) {
  const st = EQT.subjStats(42);
  const row = (key) => {
    const sj = EQT.SUBJECTS[key];
    const has = st[key] && st[key].a > 0;
    const pct = has ? Math.round(st[key].c / st[key].a * 100) : null;
    return `
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:44px;height:44px;border-radius:15px;background:${sj.bg};display:flex;align-items:center;justify-content:center;flex:none;font:800 15px 'Baloo 2';color:${sj.fg}">${TX(sj.letter)}</div>
      <div style="flex:1"><div style="display:flex;justify-content:space-between"><span style="font:800 13.5px Nunito;color:#2A1F45">${TX(sj.name)}</span><span style="font:800 13.5px 'Baloo 2';color:${has ? sj.fg : '#A197BC'}">${has ? pct + '%' : '—'}</span></div><div style="height:10px;border-radius:5px;background:#EFEAF9;margin-top:6px"><div style="width:${has ? pct : 0}%;height:100%;border-radius:5px;background:${sj.bar}"></div></div></div>
    </div>`;
  };

  /* weekly first-try accuracy, oldest → newest */
  const wa = EQT.weeklyAcc(6);
  const pts = wa.map((w, i) => ({ i, rate: w.rate })).filter(p => p.rate != null)
    .map(p => ({ x: Math.round(8 + p.i * 60.8), y: Math.round(78 - p.rate * 56) }));
  let chart;
  if (pts.length >= 2) {
    const path = 'M' + pts.map(p => `${p.x} ${p.y}`).join(' L');
    const dots = pts.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="${i === pts.length - 1 ? 6 : 5}" fill="${i === pts.length - 1 ? '#5B3FD6' : '#7B5CFF'}"></circle>`).join('');
    chart = `<svg viewBox="0 0 320 96" width="100%" height="96" style="margin-top:10px">
        <g stroke="#EFEAF9" stroke-width="1.4"><path d="M0 20 H320"></path><path d="M0 48 H320"></path><path d="M0 76 H320"></path></g>
        <path d="${path}" fill="none" stroke="#7B5CFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
        ${dots}
      </svg>`;
  } else {
    const single = pts.length === 1 ? `<circle cx="${pts[0].x}" cy="${pts[0].y}" r="6" fill="#5B3FD6"></circle>` : '';
    chart = `<svg viewBox="0 0 320 96" width="100%" height="96" style="margin-top:10px">
        <g stroke="#EFEAF9" stroke-width="1.4"><path d="M0 20 H320"></path><path d="M0 48 H320"></path><path d="M0 76 H320"></path></g>
        ${single}
        <text x="160" y="52" text-anchor="middle" style="font:700 12px Nunito" fill="#A197BC">${TX({ az: 'Qrafik üçün bir neçə həftə məlumat lazımdır', en: 'The trend needs a few weeks of data', ru: 'Для графика нужно несколько недель данных' })}</text>
      </svg>`;
  }
  const trendUp = pts.length >= 2 && pts[pts.length - 1].y <= pts[0].y;
  const chartTitle = trendUp
    ? TX({ az: 'Getdikcə sabitləşir', en: 'Getting steadier', ru: 'Становится стабильнее' })
    : TX({ az: 'Həftəlik dəqiqlik', en: 'Weekly accuracy', ru: 'Точность по неделям' });

  /* strengths & needs-practice from topic stats */
  const ts = EQT.topicStats(42);
  const entries = Object.keys(EQT.TOPICS).filter(k => ts[k] && ts[k].a >= 2).map(k => {
    const t = ts[k];
    return { k, rate: t.c / t.a, rough: ((t.a - t.c) + t.h) / t.a };
  });
  const strengths = entries.filter(e => e.rate >= 0.7).sort((a, b) => b.rate - a.rate).slice(0, 3);
  const needs = entries.filter(e => e.rate < 0.7 || (ts[e.k].h >= 2)).sort((a, b) => b.rough - a.rough).slice(0, 3);
  const nameList = (arr, color) => arr.length
    ? arr.map(e => `<div style="font:800 12.5px Nunito;color:${color}">${TX(EQT.TOPICS[e.k].name)}</div>`).join('')
    : `<div style="font:700 12px Nunito;color:${color};opacity:0.65">${TX({ az: 'Məlumat toplanır…', en: 'Collecting data…', ru: 'Данные собираются…' })}</div>`;

  return `<div class="scr" style="background:#F4F1FA">
    <div style="position:absolute;top:56px;left:20px;right:20px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.go('parent_progress')" style="width:42px;height:42px;border-radius:15px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#2A1F45', 18)}</div>
      <div style="flex:1"><div style="font:800 20px 'Baloo 2', system-ui;color:#2A1F45">${TX({ az: 'Öyrənmə inkişafı', en: 'Learning progress', ru: 'Учебный прогресс' })}</div><div style="font:700 12px Nunito;color:#8878A8">${TX({ az: 'Son 6 həftə · ilk cəhd dəqiqliyi', en: 'Last 6 weeks · first-try accuracy', ru: 'Последние 6 недель · точность с первой попытки' })}</div></div>
    </div>
    <div style="position:absolute;top:120px;left:20px;right:20px;border-radius:26px;background:#fff;padding:16px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3);display:flex;flex-direction:column;gap:13px">
      ${row('math')}
      ${row('logic')}
      ${row('reading')}
      ${row('science')}
    </div>
    <div style="position:absolute;top:372px;left:20px;right:20px;border-radius:26px;background:#fff;padding:16px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)">
      <div style="font:800 15px 'Baloo 2';color:#2A1F45">${chartTitle}</div>
      ${chart}
      <div style="display:flex;justify-content:space-between;font:700 10px Nunito;color:#A197BC"><span>${TX({ az: '6 həftə əvvəl', en: '6 wks ago', ru: '6 нед. назад' })}</span><span>${TX({ az: 'bu həftə', en: 'this week', ru: 'эта неделя' })}</span></div>
    </div>
    <div style="position:absolute;top:556px;left:20px;right:20px;display:flex;gap:12px">
      <div style="flex:1;border-radius:24px;background:#E8FBF1;padding:16px">
        <div style="font:700 10px Nunito;color:#2A9455;letter-spacing:1.2px">${TX({ az: 'GÜCLÜ TƏRƏFLƏR', en: 'STRENGTHS', ru: 'СИЛЬНЫЕ СТОРОНЫ' })}</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">${nameList(strengths, '#1F6E42')}</div>
      </div>
      <div style="flex:1;border-radius:24px;background:#FFF3D6;padding:16px">
        <div style="font:700 10px Nunito;color:#8A5A0A;letter-spacing:1.2px">${TX({ az: 'MƏŞQ LAZIMDIR', en: 'NEEDS PRACTICE', ru: 'НУЖНА ПРАКТИКА' })}</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">${nameList(needs, '#6B4406')}</div>
      </div>
    </div>
    <div class="press" onclick="EQ.go('parent_quests')" style="position:absolute;bottom:100px;left:20px;right:20px;height:58px;border-radius:20px;background:#7B5CFF;box-shadow:0 4px 0 #5B3FD6;display:flex;align-items:center;justify-content:center;font:800 17px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Questy nə təklif edir — bax', en: 'See what Questy suggests', ru: 'Посмотреть советы Квести' })}</div>
    ${EQS.ptabs('progress')}
  </div>`;
};

/* 26 · AI recommendations — generated from the child's real struggle data */
EQS.meta.parent_quests = { light: false };
EQS.screens.parent_quests = function (s) {
  const list = EQT.recommend();
  const main = list[0];
  const alts = list.slice(1, 3);
  const todayKey = EQ.dayKey();
  const addedToday = k => s.parentQuests.some(m => m.t === k && m.day === todayKey);

  let heroCard;
  if (!main) {
    heroCard = `<div style="position:absolute;top:120px;left:20px;right:20px;border-radius:28px;background:#2C1F52;padding:22px;font:700 13.5px Nunito;color:#C9BCEF;line-height:1.6">${TX({ az: 'Bu seans üçün bütün təkliflərə baxdınız — Questy sabah yenilərini hazırlayacaq.', en: 'You have seen every suggestion for this session — Questy will prepare new ones tomorrow.', ru: 'Вы просмотрели все предложения — завтра Квести подготовит новые.' })}</div>`;
  } else {
    const topicName = TX(EQT.TOPICS[main.k].name);
    const mission = EQT.MISSIONS[main.k];
    const st = main.st;
    let why;
    if (main.struggle > 0) {
      why = TX({
        az: `${s.heroName} «${topicName}» mövzusunda ${st.a} sualdan yalnız ${st.c} sualı ilk cəhddə düz cavablandırıb${st.h > 0 ? ` və ${st.h} dəfə ipucu istəyib` : ''}. Qısa, fokuslu məşq adətən bunu yoluna qoyur.`,
        en: `${s.heroName} got ${st.c} of the last ${st.a} “${topicName}” questions right on the first try${st.h > 0 ? ` and asked for ${st.h} hint${st.h === 1 ? '' : 's'}` : ''}. Short, focused practice usually settles it.`,
        ru: `${s.heroName} решил(а) ${st.c} из ${st.a} вопросов темы «${topicName}» с первой попытки${st.h > 0 ? ` и попросил(а) ${st.h} ${RUP(st.h, 'подсказку', 'подсказки', 'подсказок')}` : ''}. Короткая сфокусированная практика обычно закрепляет тему.`
      });
    } else if (main.tried > 0) {
      why = TX({
        az: `«${topicName}» bu dövrdə ən az məşq olunan mövzudur (${st.a} sınaq). Onu genişləndirmək inkişafı tarazlı saxlayır.`,
        en: `“${topicName}” is the least practised topic lately (${st.a} challenge${st.a === 1 ? '' : 's'}). Growing it keeps progress balanced.`,
        ru: `«${topicName}» — наименее отработанная тема за это время (${st.a} ${RUP(st.a, 'испытание', 'испытания', 'испытаний')}). Её развитие сохраняет баланс прогресса.`
      });
    } else {
      why = TX({
        az: `${s.heroName} oynadıqca Questy tövsiyələri onun real nəticələrinə uyğunlaşdıracaq. Başlanğıc üçün «${topicName}» yaxşı seçimdir.`,
        en: `As ${s.heroName} plays, Questy will tune these suggestions to real results. “${topicName}” is a good place to start.`,
        ru: `Пока ребёнок играет, Квести настроит рекомендации по реальным результатам. «${topicName}» — хорошее начало.`
      });
    }
    const added = addedToday(main.k);
    heroCard = `<div style="position:absolute;top:120px;left:20px;right:20px;border-radius:28px;background:#2C1F52;padding:18px;overflow:hidden">
      <div style="display:flex;gap:14px;align-items:flex-start">
        <div style="width:56px;height:56px;border-radius:20px;background:rgba(255,255,255,0.12);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;flex:none">${EQC.questy('hint', 'width:52px', s.questyFur, s.questyFurDark)}</div>
        <div style="flex:1">
          <div style="font:700 10px Nunito;color:#A896E0;letter-spacing:1.4px">${TX({ az: 'NİYƏ MƏHZ BU', en: 'WHY THIS', ru: 'ПОЧЕМУ ИМЕННО ЭТО' })}</div>
          <div style="font:700 14px Nunito;color:#fff;margin-top:6px;line-height:1.55">${why}</div>
        </div>
      </div>
      <div style="margin-top:16px;background:rgba(255,255,255,0.08);border-radius:22px;padding:16px;display:flex;gap:14px;align-items:center">
        <div style="width:60px;height:60px;border-radius:20px;background:rgba(255,194,75,0.2);display:flex;align-items:center;justify-content:center;flex:none"><svg width="36" height="36" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#FFC24B"></circle><path d="M50 50 L50 6 A44 44 0 0 1 94 50 Z" fill="#FF8A4C"></path><path d="M50 6 V94 M6 50 H94" stroke="#FFF7EA" stroke-width="5"></path></svg></div>
        <div style="flex:1"><div style="font:700 10px Nunito;color:#FFD98A;letter-spacing:1.2px">${TX({ az: 'YARADILMIŞ MİSSİYA', en: 'GENERATED MISSION', ru: 'СОЗДАННАЯ МИССИЯ' })}</div><div style="font:800 18px 'Baloo 2';color:#fff;line-height:1.2">${TX(mission.name)}</div><div style="font:700 12px Nunito;color:#C9BCEF;margin-top:4px">${TX(mission.detail)}</div></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px">
        ${added
          ? `<div style="flex:1;height:56px;border-radius:20px;background:rgba(92,227,155,0.2);display:flex;align-items:center;justify-content:center;gap:8px;font:800 16px 'Baloo 2';color:#8FE0B6">${EQC.check('#8FE0B6', 18)}${TX({ az: 'Tapşırıq siyahısına əlavə olundu', en: 'Added to the quest list', ru: 'Добавлено в список заданий' })}</div>`
          : `<div class="press" onclick="EQ.addMission('${main.k}')" style="flex:1;height:56px;border-radius:20px;background:#5CE39B;box-shadow:0 4px 0 #2FA76D;display:flex;align-items:center;justify-content:center;font:800 16px 'Baloo 2';color:#0B3D25">${TX({ az: `${s.heroName} üçün tapşırıqlara əlavə et`, en: `Add to ${s.heroName}'s quests`, ru: `Добавить в задания (${s.heroName})` })}</div>`}
        <div class="press" onclick="EQ.dismissRec('${main.k}')" style="width:56px;height:56px;border-radius:20px;background:rgba(255,255,255,0.10);display:flex;align-items:center;justify-content:center">${EQC.xIcon('#C9BCEF', 20)}</div>
      </div>
    </div>`;
  }

  const altRow = alt => {
    const topic = EQT.TOPICS[alt.k];
    const mission = EQT.MISSIONS[alt.k];
    const sj = EQT.SUBJECTS[topic.subj];
    const sub = TX(topic.name) + ' · ' + (alt.tried > 0
      ? TX({ az: 'davam etdir', en: 'keep it going', ru: 'продолжить' })
      : TX({ az: 'yeni mövzu', en: 'new topic', ru: 'новая тема' }));
    const btn = addedToday(alt.k)
      ? `<div style="width:36px;height:36px;border-radius:14px;background:#E8FBF1;display:flex;align-items:center;justify-content:center;flex:none">${EQC.check('#2A9455', 16)}</div>`
      : `<div class="press" onclick="EQ.addMission('${alt.k}')" style="width:36px;height:36px;border-radius:14px;background:#EFEAF9;display:flex;align-items:center;justify-content:center;flex:none"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 5 v14 M5 12 h14" stroke="#7B5CFF" stroke-width="3" stroke-linecap="round"></path></svg></div>`;
    return `<div style="border-radius:24px;background:#fff;padding:16px;box-shadow:0 5px 16px -12px rgba(42,31,69,0.3);display:flex;gap:13px;align-items:center;flex:none">
      <div style="width:48px;height:48px;border-radius:17px;background:${sj.bg};display:flex;align-items:center;justify-content:center;flex:none;font:800 17px 'Baloo 2';color:${sj.fg}">${TX(sj.letter)}</div>
      <div style="flex:1"><div style="font:800 15px 'Baloo 2';color:#2A1F45">${TX(mission.name)}</div><div style="font:700 11.5px Nunito;color:#8878A8;margin-top:2px">${sub}</div></div>
      ${btn}
    </div>`;
  };

  return `<div class="scr" style="background:#F4F1FA">
    <div style="position:absolute;top:56px;left:20px;right:20px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.go('parent_dashboard')" style="width:42px;height:42px;border-radius:15px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#2A1F45', 18)}</div>
      <div style="flex:1"><div style="font:800 20px 'Baloo 2', system-ui;color:#2A1F45">${TX({ az: 'Bu həftə tövsiyə olunur', en: 'Recommended this week', ru: 'Рекомендации недели' })}</div><div style="font:700 12px Nunito;color:#8878A8">${TX({ az: 'Siz təsdiqləyirsiniz, sonra uşağın dünyasında görünür', en: `You approve, then it appears in ${EQ.pron(s)} world`, ru: 'Вы одобряете — и задание появляется в мире ребёнка' })}</div></div>
    </div>
    ${heroCard}
    <div class="vscroll" style="position:absolute;top:502px;left:20px;right:20px;bottom:94px;display:flex;flex-direction:column;gap:11px">
      ${alts.length ? `<div style="font:800 13px 'Baloo 2';color:#5C4E7E;flex:none">${TX({ az: 'Bunları da yoxlamağa dəyər', en: 'Also worth a try', ru: 'Тоже стоит попробовать' })}</div>${alts.map(altRow).join('')}` : ''}
      <div style="border-radius:20px;background:#EFEAF9;padding:14px 16px;display:flex;gap:10px;align-items:flex-start;flex:none;margin-top:auto">
        <svg width="18" height="18" viewBox="0 0 24 24" style="flex:none;margin-top:1px"><path d="M12 3 l8 4 v6 c0 5-3.6 7.4-8 8.6 -4.4-1.2 -8-3.6 -8-8.6 V7 Z" fill="none" stroke="#7B5CFF" stroke-width="2"></path></svg>
        <div style="font:700 12.5px Nunito;color:#5C4E7E;line-height:1.5">${TX({ az: 'Təkliflər uşağın öz oyun məlumatlarına əsaslanır. Bu cihazdan kənara heç nə ötürülmür.', en: `Suggestions come from ${EQ.pron(s)} own play data. Nothing is shared outside this device.`, ru: 'Рекомендации строятся на игровых данных ребёнка. Ничего не передаётся за пределы этого устройства.' })}</div>
      </div>
    </div>
    ${EQS.ptabs('quests')}
  </div>`;
};

/* 27 · Settings */
EQS.meta.parent_settings = { light: false };
EQS.screens.parent_settings = function (s) {
  const st = s.settings;
  const pct = Math.round((st.limit - 15) / (90 - 15) * 100);
  const bedT = EQ.fmtTime(st.bedMin || 1200);
  const bonus = EQ.bonusMins();
  const langBtn = (l, label) => `<div class="press" onclick="EQ.setLang('${l}')" style="flex:1;height:40px;border-radius:14px;background:${EQI.lang === l ? '#7B5CFF' : '#EFEAF9'};box-shadow:${EQI.lang === l ? '0 3px 0 #5B3FD6' : 'none'};display:flex;align-items:center;justify-content:center;font:800 12.5px Nunito;color:${EQI.lang === l ? '#fff' : '#5C4E7E'}">${label}</div>`;
  return `<div class="scr vscroll" style="background:#F4F1FA">
    <div style="position:absolute;top:56px;left:20px;right:20px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.go('parent_dashboard')" style="width:42px;height:42px;border-radius:15px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#2A1F45', 18)}</div>
      <div style="flex:1;font:800 20px 'Baloo 2', system-ui;color:#2A1F45">${TX({ az: 'Tənzimləmələr', en: 'Settings', ru: 'Настройки' })}</div>
    </div>
    <div style="position:absolute;top:114px;left:20px;right:20px;border-radius:26px;background:#fff;padding:16px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)">
      <div style="font:800 15px 'Baloo 2';color:#2A1F45">${TX({ az: 'Oyun dili', en: 'Game language', ru: 'Язык игры' })}</div>
      <div style="display:flex;gap:8px;margin-top:12px">${langBtn('az', 'Azərbaycanca')}${langBtn('en', 'English')}${langBtn('ru', 'Русский')}</div>
    </div>
    <div style="position:absolute;top:222px;left:20px;right:20px;border-radius:26px;background:#fff;padding:16px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)">
      <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font:800 15px 'Baloo 2';color:#2A1F45">${TX({ az: 'Günlük oyun limiti', en: 'Daily play limit', ru: 'Дневной лимит игры' })}</span><span style="font:800 15px 'Baloo 2';color:#7B5CFF">${st.limit} ${TX({ az: 'dəq', en: 'min', ru: 'мин' })}</span></div>
      <div class="press" onclick="EQ.cycleLimit()" style="margin-top:16px;height:10px;border-radius:5px;background:#EFEAF9;position:relative"><div style="width:${pct}%;height:100%;border-radius:5px;background:#7B5CFF"></div><div style="position:absolute;left:${pct}%;top:-8px;width:26px;height:26px;border-radius:13px;background:#fff;box-shadow:0 2px 8px rgba(42,31,69,0.3), 0 0 0 3px #7B5CFF;transform:translateX(-13px)"></div></div>
      <div style="display:flex;justify-content:space-between;font:700 10.5px Nunito;color:#A197BC;margin-top:10px"><span>15 ${TX({ az: 'dəq', en: 'min', ru: 'мин' })}</span><span>90 ${TX({ az: 'dəq', en: 'min', ru: 'мин' })}</span></div>
      <div style="margin-top:16px;padding-top:16px;border-top:1.5px solid #EFEAF9;display:flex;align-items:center;gap:10px">
        <div style="flex:1"><div style="font:800 13.5px Nunito;color:#2A1F45">${TX({ az: 'Yuxu fasiləsi', en: 'Bedtime pause', ru: 'Пауза перед сном' })}</div><div style="font:700 11.5px Nunito;color:#8878A8">${TX({ az: `Axşam ${bedT} · Questy gecəniz xeyrə deyir`, en: `At ${bedT} Questy says goodnight`, ru: `В ${bedT} Квести желает спокойной ночи` })}</div></div>
        <div class="press" onclick="EQ.cycleBedtime()" style="height:34px;padding:0 12px;border-radius:13px;background:${st.bedtime ? '#EFE7FF' : '#F4F1FA'};display:flex;align-items:center;font:800 13px 'Baloo 2';color:${st.bedtime ? '#5B3FD6' : '#A197BC'};flex:none">${bedT}</div>
        ${EQS.ptoggle('bedtime', st.bedtime)}
      </div>
      <div style="margin-top:14px;padding-top:14px;border-top:1.5px solid #EFEAF9;display:flex;align-items:center;gap:10px">
        <div style="flex:1"><div style="font:800 13.5px Nunito;color:#2A1F45">${TX({ az: 'Bu gün üçün əlavə vaxt', en: 'Extra time for today', ru: 'Дополнительное время на сегодня' })}</div><div style="font:700 11.5px Nunito;color:#8878A8">${bonus > 0
          ? TX({ az: `Bu gün: ${st.limit + bonus} dəq · yuxu ${EQ.fmtTime(EQ.bedStart())}`, en: `Today: ${st.limit + bonus} min · bedtime ${EQ.fmtTime(EQ.bedStart())}`, ru: `Сегодня: ${st.limit + bonus} мин · сон в ${EQ.fmtTime(EQ.bedStart())}` })
          : TX({ az: 'Bir toxunuş = +15 dəqiqə, yalnız bu gün', en: 'One tap = +15 minutes, today only', ru: 'Одно нажатие = +15 минут, только сегодня' })}</div></div>
        <div class="press" onclick="EQ.grantBonus()" style="height:36px;padding:0 13px;border-radius:14px;background:${bonus > 0 ? '#7B5CFF' : '#EFEAF9'};box-shadow:${bonus > 0 ? '0 3px 0 #5B3FD6' : 'none'};display:flex;align-items:center;font:800 12.5px Nunito;color:${bonus > 0 ? '#fff' : '#5C4E7E'};flex:none">${bonus > 0 ? `+${bonus} ${TX({ az: 'dəq', en: 'min', ru: 'мин' })}` : `+15 ${TX({ az: 'dəq', en: 'min', ru: 'мин' })}`}</div>
      </div>
    </div>
    <div style="position:absolute;top:490px;left:20px;right:20px;border-radius:26px;background:#fff;padding:2px 18px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)">
      <div style="padding:13px 0;border-bottom:1.5px solid #EFEAF9;display:flex;align-items:center;justify-content:space-between"><div><div style="font:800 13.5px Nunito;color:#2A1F45">${TX({ az: 'Sualları səsli oxu', en: 'Read questions aloud', ru: 'Читать вопросы вслух' })}</div><div style="font:700 11.5px Nunito;color:#8878A8">${TX({ az: 'Questy hər sualı səsləndirir', en: 'Questy voices every question', ru: 'Квести озвучивает каждый вопрос' })}</div></div>${EQS.ptoggle('readAloud', st.readAloud)}</div>
      <div style="padding:13px 0;border-bottom:1.5px solid #EFEAF9;display:flex;align-items:center;justify-content:space-between"><div><div style="font:800 13.5px Nunito;color:#2A1F45">${TX({ az: 'Daha böyük mətn', en: 'Bigger text', ru: 'Крупный текст' })}</div><div style="font:700 11.5px Nunito;color:#8878A8">${TX({ az: 'Daha iri yazılar və cavablar', en: 'Larger labels and answers', ru: 'Более крупные надписи и ответы' })}</div></div>${EQS.ptoggle('bigText', st.bigText)}</div>
      <div style="padding:13px 0;border-bottom:1.5px solid #EFEAF9;display:flex;align-items:center;justify-content:space-between"><div><div style="font:800 13.5px Nunito;color:#2A1F45">${TX({ az: 'Sakit rejim', en: 'Calm mode', ru: 'Спокойный режим' })}</div><div style="font:700 11.5px Nunito;color:#8878A8">${TX({ az: 'Daha az effekt, daha yumşaq səslər', en: 'Fewer effects, softer sounds', ru: 'Меньше эффектов, мягче звуки' })}</div></div>${EQS.ptoggle('calm', st.calm)}</div>
      <div style="padding:16px 0;display:flex;align-items:center;justify-content:space-between"><div><div style="font:800 13.5px Nunito;color:#2A1F45">${TX({ az: 'Musiqi', en: 'Music', ru: 'Музыка' })}</div><div style="font:700 11.5px Nunito;color:#8878A8">${TX({ az: 'Meşə mövzusu · 40%', en: 'Forest theme · 40%', ru: 'Лесная тема · 40%' })}</div></div>${EQS.ptoggle('music', st.music)}</div>
    </div>
    <div style="position:absolute;top:774px;left:20px;right:20px;border-radius:26px;background:#fff;padding:2px 18px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)">
      <div class="press" onclick="EQ.toast(TX({az:'Bütün məlumatlar bu cihazda qalır — heç nə paylaşılmır',en:'All data stays on this device — nothing is shared',ru:'Все данные остаются на этом устройстве — ничего не передаётся'}))" style="padding:14px 0;border-bottom:1.5px solid #EFEAF9;display:flex;align-items:center;gap:12px"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 3 l8 4 v6 c0 5-3.6 7.4-8 8.6 -4.4-1.2 -8-3.6 -8-8.6 V7 Z" fill="none" stroke="#7B5CFF" stroke-width="2"></path></svg><div style="flex:1;font:800 13.5px Nunito;color:#2A1F45">${TX({ az: 'Məxfilik və məlumatlar', en: 'Privacy &amp; data', ru: 'Приватность и данные' })}</div>${EQC.chevR('#A197BC', 16)}</div>
      <div class="press" onclick="EQ.go('parent_transfer')" style="padding:14px 0;border-bottom:1.5px solid #EFEAF9;display:flex;align-items:center;gap:12px"><svg width="20" height="20" viewBox="0 0 24 24"><rect x="4" y="2.5" width="11" height="19" rx="2.6" fill="none" stroke="#7B5CFF" stroke-width="2"></rect><path d="M17 8 h5 M19.5 5.5 L22 8 l-2.5 2.5" fill="none" stroke="#7B5CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg><div style="flex:1"><div style="font:800 13.5px Nunito;color:#2A1F45">${TX({ az: 'Yeni telefona keçid', en: 'Moving to a new phone', ru: 'Переход на новый телефон' })}</div><div style="font:700 11.5px Nunito;color:#8878A8">${TX({ az: 'QR kod və ya fayl · server olmadan', en: 'QR code or file · no server involved', ru: 'QR-код или файл · без сервера' })}</div></div>${EQC.chevR('#A197BC', 16)}</div>
      <div class="press" onclick="EQ.toast(TX({az:'Yalnız kosmetika · uşağa heç vaxt göstərilmir',en:'Cosmetics only · never shown to the child',ru:'Только косметика · ребёнку никогда не показывается'}))" style="padding:14px 0;border-bottom:1.5px solid #EFEAF9;display:flex;align-items:center;gap:12px"><svg width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="3" fill="none" stroke="#7B5CFF" stroke-width="2"></rect><path d="M3 10 h18" stroke="#7B5CFF" stroke-width="2"></path></svg><div style="flex:1"><div style="font:800 13.5px Nunito;color:#2A1F45">${TX({ az: 'Alışlar', en: 'Purchases', ru: 'Покупки' })}</div><div style="font:700 11.5px Nunito;color:#8878A8">${TX({ az: `Yalnız kosmetika · ${s.heroName} heç vaxt görmür`, en: `Cosmetics only · never shown to ${s.heroName}`, ru: `Только косметика · ${s.heroName} их не видит` })}</div></div>${EQC.chevR('#A197BC', 16)}</div>
      <div class="press" onclick="EQ.go('parent_profiles')" style="padding:16px 0;display:flex;align-items:center;gap:12px"><svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" fill="none" stroke="#7B5CFF" stroke-width="2"></circle><path d="M5 20 q1.6-6 7-6 q5.4 0 7 6" fill="none" stroke="#7B5CFF" stroke-width="2" stroke-linecap="round"></path></svg><div style="flex:1"><div style="font:800 13.5px Nunito;color:#2A1F45">${TX({ az: 'Uşaqlar', en: 'Children', ru: 'Дети' })}</div><div style="font:700 11.5px Nunito;color:#8878A8">${EQP.ids.length > 1
        ? TX({ az: `${EQP.ids.length} uşaq · indi ${s.heroName} oynayır`, en: `${EQP.ids.length} children · ${s.heroName} is playing now`, ru: `${EQP.ids.length} ребёнка · сейчас играет ${s.heroName}` })
        : TX({ az: 'Başqa uşaq əlavə et — hərənin öz macərası', en: 'Add another child — each with their own adventure', ru: 'Добавить ещё ребёнка — у каждого своё приключение' })}</div></div>${EQC.chevR('#A197BC', 16)}</div>
    </div>
    <div style="position:absolute;top:1034px;left:20px;right:20px;display:flex;gap:10px;padding-bottom:120px">
      <div class="press" onclick="EQ.exitParent()" style="flex:1;height:52px;border-radius:18px;background:#7B5CFF;box-shadow:0 3px 0 #5B3FD6;display:flex;align-items:center;justify-content:center;font:800 14px 'Baloo 2';color:#fff">${TX({ az: 'Macəraya qayıt', en: 'Back to the adventure', ru: 'Вернуться к приключению' })}</div>
      <div class="press" onclick="EQ.resetDemo()" style="flex:1;height:52px;border-radius:18px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;font:800 14px 'Baloo 2';color:#8878A8">${TX({ az: 'Macəranı sıfırla', en: 'Reset adventure', ru: 'Сбросить приключение' })}</div>
    </div>
    ${EQS.ptabs('settings')}
  </div>`;
};

/* ── 29 · The children on this phone ──
   One device, several children: each owns a full copy of the game state, so progress,
   streaks, settings and the parent statistics never mix (js/profiles.js). Switching is
   a grown-up action — the child never reaches this screen on their own. */
EQS.meta.parent_profiles = { light: false };
EQS.screens.parent_profiles = function () {
  const kids = EQP.list();
  const trash = `<svg width="17" height="17" viewBox="0 0 24 24"><path d="M5 7 h14 M10 7 V5 h4 v2 M7 7 l1 13 h8 l1-13" fill="none" stroke="#B49FD6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

  const row = (p) => {
    const st = p.s || {};
    const ready = !!st.onboarded;
    const mins = EQP.weekMins(st);
    const line = ready
      ? TX({
        az: `Səviyyə ${st.level || 1} · ${st.streak || 1} günlük seriya`,
        en: `Level ${st.level || 1} · ${st.streak || 1} day streak`,
        ru: `Уровень ${st.level || 1} · ${st.streak || 1} ${RUP(st.streak || 1, 'день', 'дня', 'дней')} подряд`
      })
      : TX({ az: 'Qəhrəman hələ yaradılmayıb', en: 'No hero made yet', ru: 'Герой ещё не создан' });
    const week = ready
      ? (mins > 0
        ? TX({ az: `bu həftə ${EQT.fmtMin(mins)}`, en: `${EQT.fmtMin(mins)} this week`, ru: `${EQT.fmtMin(mins)} на этой неделе` })
        : TX({ az: 'bu həftə oynamayıb', en: 'has not played this week', ru: 'на этой неделе не играл' }))
      : TX({ az: 'toxunun və birlikdə yaradın', en: 'tap to make one together', ru: 'нажмите и создайте вместе' });
    return `<div class="press" onclick="EQ.switchChild('${p.id}')" style="border-radius:24px;background:#fff;padding:14px;box-shadow:${p.active ? '0 0 0 2.5px #7B5CFF, 0 6px 18px -12px rgba(42,31,69,0.3)' : '0 6px 18px -12px rgba(42,31,69,0.3)'};display:flex;align-items:center;gap:13px">
      <div style="position:relative;width:52px;height:52px;flex:none">
        <div style="position:absolute;inset:0;border-radius:50%;background:${ready ? '#FFC24B' : '#E0D8F2'}"></div>
        <div style="position:absolute;inset:3px;border-radius:50%;background:#FFF3DF;overflow:hidden">${EQC.hero(st.hero, 'position:absolute;left:-19px;top:-8px;width:88px')}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:7px">
          <div style="font:800 16px 'Baloo 2';color:#2A1F45;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${EQP.label(st)}</div>
          ${p.active ? `<div style="height:20px;padding:0 8px;border-radius:8px;background:#EFE7FF;display:flex;align-items:center;font:800 9.5px Nunito;color:#5B3FD6;letter-spacing:0.4px;flex:none">${TX({ az: 'İNDİ OYNAYIR', en: 'PLAYING NOW', ru: 'ИГРАЕТ СЕЙЧАС' })}</div>` : ''}
        </div>
        <div style="font:700 11.5px Nunito;color:#5C4E7E;margin-top:2px">${line}</div>
        <div style="font:700 11px Nunito;color:#A197BC;margin-top:1px">${week}</div>
      </div>
      ${kids.length > 1
        ? `<div class="press" onclick="event.stopPropagation();EQ.removeChild('${p.id}')" style="width:36px;height:36px;border-radius:13px;background:#F4F1FA;display:flex;align-items:center;justify-content:center;flex:none">${trash}</div>`
        : EQC.chevR('#C4BBD8', 16)}
    </div>`;
  };

  const full = EQP.full();
  return `<div class="scr vscroll" style="background:#F4F1FA">
    <div style="position:absolute;top:56px;left:20px;right:20px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.go('parent_settings')" style="width:42px;height:42px;border-radius:15px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#2A1F45', 18)}</div>
      <div style="flex:1;font:800 20px 'Baloo 2', system-ui;color:#2A1F45">${TX({ az: 'Uşaqlar', en: 'Children', ru: 'Дети' })}</div>
    </div>

    <div style="position:absolute;top:114px;left:20px;right:20px;padding-bottom:130px">
      <div style="border-radius:20px;background:#EFEAF9;padding:14px 16px">
        <div style="font:700 12px Nunito;color:#5C4E7E;line-height:1.55">${TX({
          az: 'Hər uşağın öz macərası, seriyası və statistikası var — heç biri qarışmır. Bir toxunuş oynayanı dəyişir; valideyn səhifələri də həmin uşağı göstərir.',
          en: 'Every child has their own adventure, streak and statistics — nothing is mixed. One tap changes who is playing, and the parent pages follow that child.',
          ru: 'У каждого ребёнка своё приключение, своя серия и своя статистика — ничего не смешивается. Одно нажатие меняет играющего, и родительские страницы показывают именно его.'
        })}</div>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">${kids.map(row).join('')}</div>

      <div class="press" onclick="EQ.addChild()" style="margin-top:14px;height:56px;border-radius:20px;background:${full ? '#EFEAF9' : '#fff'};box-shadow:${full ? 'none' : '0 3px 0 #E0D8F2'};display:flex;align-items:center;justify-content:center;gap:9px;font:800 14.5px 'Baloo 2';color:${full ? '#A197BC' : '#5B3FD6'}">
        ${full ? '' : `<svg width="19" height="19" viewBox="0 0 24 24"><path d="M12 5 v14 M5 12 h14" stroke="#5B3FD6" stroke-width="2.6" stroke-linecap="round"></path></svg>`}
        ${full
          ? TX({ az: `Bu cihazda ən çoxu ${EQP_MAX} uşaq`, en: `Up to ${EQP_MAX} children on one device`, ru: `До ${EQP_MAX} детей на одном устройстве` })
          : TX({ az: 'Başqa uşaq əlavə et', en: 'Add another child', ru: 'Добавить ещё ребёнка' })}
      </div>

      <div style="margin-top:12px;font:700 11.5px Nunito;color:#A197BC;line-height:1.5;text-align:center">${TX({
        az: 'Uşağı silmək onun bütün irəliləyişini bu cihazdan silir. Əvvəlcə “Yeni telefona keçid” ilə nüsxə saxlaya bilərsiniz.',
        en: 'Removing a child erases all of their progress from this device. You can keep a copy first with “Moving to a new phone”.',
        ru: 'Удаление ребёнка стирает весь его прогресс с этого устройства. Сначала можно сохранить копию через «Переход на новый телефон».'
      })}</div>
    </div>
    ${EQS.ptabs('settings')}
  </div>`;
};

/* ── 30–32 · Moving to another phone ──
   The whole app keeps its promise here: no account, no server, no upload. The grown-up
   is the transport — a QR code the new phone's camera opens, or a file they save and
   send themselves. Both are made on the device and go only where the parent sends them. */

/* one row in the transfer lists */
EQS.xrow = function (opts) {
  const last = opts.last ? '' : 'border-bottom:1.5px solid #EFEAF9;';
  return `<div class="press" onclick="${opts.tap}" style="padding:15px 0;${last}display:flex;align-items:center;gap:12px">
    <div style="width:38px;height:38px;border-radius:14px;background:${opts.tint || '#EFE7FF'};display:flex;align-items:center;justify-content:center;flex:none">${opts.icon}</div>
    <div style="flex:1"><div style="font:800 13.5px Nunito;color:#2A1F45">${opts.title}</div><div style="font:700 11.5px Nunito;color:#8878A8;line-height:1.45">${opts.sub}</div></div>
    ${EQC.chevR('#A197BC', 16)}
  </div>`;
};

EQS.meta.parent_transfer = { light: false };
EQS.screens.parent_transfer = function (s) {
  const kids = EQP.ids.length;
  const qrIcon = `<svg width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.6" fill="none" stroke="#7B5CFF" stroke-width="2"></rect><rect x="14" y="3" width="7" height="7" rx="1.6" fill="none" stroke="#7B5CFF" stroke-width="2"></rect><rect x="3" y="14" width="7" height="7" rx="1.6" fill="none" stroke="#7B5CFF" stroke-width="2"></rect><rect x="14.5" y="14.5" width="3" height="3" fill="#7B5CFF"></rect><rect x="19" y="19" width="3" height="3" fill="#7B5CFF"></rect></svg>`;
  const fileIcon = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M6 3 h8 l4 4 v14 H6 Z" fill="none" stroke="#2A9455" stroke-width="2" stroke-linejoin="round"></path><path d="M12 10 v7 M9 14 l3 3 3-3" fill="none" stroke="#2A9455" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
  const inIcon = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M6 3 h8 l4 4 v14 H6 Z" fill="none" stroke="#C9762F" stroke-width="2" stroke-linejoin="round"></path><path d="M12 17 v-7 M9 13 l3-3 3 3" fill="none" stroke="#C9762F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
  return `<div class="scr vscroll" style="background:#F4F1FA">
    <div style="position:absolute;top:56px;left:20px;right:20px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.go('parent_settings')" style="width:42px;height:42px;border-radius:15px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#2A1F45', 18)}</div>
      <div style="flex:1;font:800 20px 'Baloo 2', system-ui;color:#2A1F45">${TX({ az: 'Yeni telefona keçid', en: 'Moving to a new phone', ru: 'Переход на новый телефон' })}</div>
    </div>

    <div style="position:absolute;top:114px;left:20px;right:20px;border-radius:26px;background:#2C1F52;padding:18px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.5)">
      <div style="display:flex;align-items:center;gap:10px">
        <svg width="22" height="22" viewBox="0 0 24 24" style="flex:none"><path d="M12 3 l8 4 v6 c0 5-3.6 7.4-8 8.6 -4.4-1.2 -8-3.6 -8-8.6 V7 Z" fill="none" stroke="#C8B4FF" stroke-width="2"></path></svg>
        <div style="font:800 15px 'Baloo 2';color:#fff">${TX({ az: 'Serverimiz yoxdur', en: 'We have no server', ru: 'У нас нет сервера' })}</div>
      </div>
      <div style="font:700 12.5px Nunito;color:#A896E0;line-height:1.55;margin-top:9px">${TX({
        az: 'Macəra yalnız bu telefonda saxlanılır — buludda nüsxəsi yoxdur. Ona görə köçürməni özünüz edirsiniz: kod və ya fayl yalnız sizin göndərdiyiniz yerə gedir.',
        en: 'The adventure lives on this phone only — there is no copy in a cloud. So you move it yourself: the code or the file goes nowhere except where you send it.',
        ru: 'Приключение хранится только на этом телефоне — копии в облаке нет. Поэтому перенос делаете вы сами: код или файл попадёт только туда, куда вы его отправите.'
      })}</div>
    </div>

    <div style="position:absolute;top:288px;left:20px;right:20px;border-radius:26px;background:#fff;padding:4px 18px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)">
      <div style="font:700 10.5px Nunito;color:#8878A8;letter-spacing:1.4px;padding:14px 0 2px">${TX({ az: 'BU TELEFONDAN GÖNDƏR', en: 'SEND FROM THIS PHONE', ru: 'ОТПРАВИТЬ С ЭТОГО ТЕЛЕФОНА' })}</div>
      ${EQS.xrow({
        tap: 'EQ.showCode()', icon: qrIcon,
        title: TX({ az: 'QR kod göstər', en: 'Show a QR code', ru: 'Показать QR-код' }),
        sub: TX({ az: 'Bir uşaq · yeni telefonun kamerası ilə oxunur', en: 'One child · read with the new phone’s camera', ru: 'Один ребёнок · читается камерой нового телефона' })
      })}
      ${EQS.xrow({
        tap: 'EQ.saveFile()', icon: fileIcon, tint: '#E8FBF1', last: true,
        title: TX({ az: 'Fayl olaraq saxla', en: 'Save as a file', ru: 'Сохранить файлом' }),
        sub: TX({
          az: `${kids > 1 ? `Bütün ${kids} uşaq` : 'Bütün məlumat'} · tam tarixçə ilə`,
          en: `${kids > 1 ? `All ${kids} children` : 'Everything'} · with the full history`,
          ru: `${kids > 1 ? `Все ${kids} ребёнка` : 'Все данные'} · с полной историей`
        })
      })}
    </div>

    <div style="position:absolute;top:472px;left:20px;right:20px;border-radius:26px;background:#fff;padding:4px 18px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)">
      <div style="font:700 10.5px Nunito;color:#8878A8;letter-spacing:1.4px;padding:14px 0 2px">${TX({ az: 'BU TELEFONA GƏTİR', en: 'BRING ONTO THIS PHONE', ru: 'ПЕРЕНЕСТИ НА ЭТОТ ТЕЛЕФОН' })}</div>
      ${EQS.xrow({
        tap: 'EQ.pickFile()', icon: inIcon, tint: '#FFF3D6', last: true,
        title: TX({ az: 'Fayldan bərpa et', en: 'Restore from a file', ru: 'Восстановить из файла' }),
        sub: TX({ az: 'Köhnə telefonda saxladığınız faylı seçin', en: 'Pick the file you saved on the old phone', ru: 'Выберите файл, сохранённый на старом телефоне' })
      })}
    </div>

    <div style="position:absolute;top:610px;left:20px;right:20px;border-radius:20px;background:#EFEAF9;padding:14px 16px">
      <div style="font:700 12px Nunito;color:#5C4E7E;line-height:1.55">${TX({
        az: 'QR kodu köhnə telefonun ekranında qalır, fayl isə sizin seçdiyiniz yerdə. Köçürmədən sonra köhnə telefonda “Macəranı sıfırla” ilə məlumatı silə bilərsiniz.',
        en: 'The QR code stays on the old phone’s screen and the file stays wherever you put it. Once the move is done you can wipe the old phone with “Reset adventure”.',
        ru: 'QR-код остаётся на экране старого телефона, а файл — там, куда вы его сохранили. После переноса старый телефон можно очистить через «Сбросить приключение».'
      })}</div>
    </div>
    ${EQS.ptabs('settings')}
  </div>`;
};

/* 31 · The code itself — drawn here, scanned by the other phone's own camera app */
EQS.meta.parent_code = { light: false };
EQS.screens.parent_code = function (s) {
  const code = EQ.session.code;
  if (!code) return EQS.screens.parent_transfer(s);
  const kid = EQP.peek(code.id);
  const name = EQP.label(kid);
  const qr = EQQR.svg(code.url, { px: 302, quiet: 2, fg: '#241A3F', bg: '#fff', style: 'display:block' })
    || `<div style="width:302px;padding:40px 16px;font:700 12.5px Nunito;color:#8878A8;line-height:1.55">${TX({ az: 'Bu macəra kod üçün çox böyükdür — fayl ilə köçürün.', en: 'This adventure is too big for a code — move it with the file instead.', ru: 'Это приключение слишком велико для кода — перенесите его файлом.' })}</div>`;
  const chip = p => `<div class="press" onclick="EQ.showCode('${p.id}')" style="height:34px;padding:0 14px;border-radius:13px;background:${p.id === code.id ? '#7B5CFF' : '#fff'};box-shadow:${p.id === code.id ? '0 3px 0 #5B3FD6' : '0 2px 0 #E0D8F2'};display:flex;align-items:center;font:800 12.5px Nunito;color:${p.id === code.id ? '#fff' : '#5C4E7E'};flex:none">${EQP.label(p.s)}</div>`;
  const picker = EQP.ids.length > 1
    ? `<div style="position:absolute;top:110px;left:20px;right:20px;display:flex;gap:8px;overflow-x:auto">${EQP.list().map(chip).join('')}</div>`
    : '';
  const top = EQP.ids.length > 1 ? 158 : 118;
  const carries = code.all
    ? TX({ az: 'Bütün irəliləyiş və tam tarixçə', en: 'All progress and the full history', ru: 'Весь прогресс и вся история' })
    : TX({
      az: `Bütün irəliləyiş · statistikanın son ${code.days} günü`,
      en: `All progress · the last ${code.days} days of statistics`,
      ru: `Весь прогресс · последние ${code.days} ${RUP(code.days, 'день', 'дня', 'дней')} статистики`
    });
  return `<div class="scr vscroll" style="background:#F4F1FA">
    <div style="position:absolute;top:56px;left:20px;right:20px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.go('parent_transfer')" style="width:42px;height:42px;border-radius:15px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#2A1F45', 18)}</div>
      <div style="flex:1;font:800 20px 'Baloo 2', system-ui;color:#2A1F45">${TX({ az: 'Köçürmə kodu', en: 'Transfer code', ru: 'Код переноса' })}</div>
    </div>
    ${picker}
    <div style="position:absolute;top:${top}px;left:20px;right:20px;border-radius:28px;background:#fff;padding:16px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3);text-align:center">
      <div style="font:800 16px 'Baloo 2';color:#2A1F45">${name}</div>
      <div style="font:700 11.5px Nunito;color:#8878A8;margin-top:3px">${carries}</div>
      <div style="display:flex;justify-content:center;margin-top:12px">${qr}</div>
    </div>
    <div style="position:absolute;top:${top + 400}px;left:20px;right:20px;border-radius:24px;background:#fff;padding:16px 18px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)">
      <div style="font:800 14px 'Baloo 2';color:#2A1F45">${TX({ az: 'Yeni telefonda', en: 'On the new phone', ru: 'На новом телефоне' })}</div>
      <div style="font:700 12.5px Nunito;color:#5C4E7E;line-height:1.65;margin-top:8px">${TX({
        az: '1. Kamera tətbiqini açın və bu koda tutun.<br>2. Çıxan linkə toxunun — EduQuest açılacaq.<br>3. Böyüklər yoxlamasından keçin və “Gətir”ə basın.',
        en: '1. Open the camera app and point it at this code.<br>2. Tap the link that appears — EduQuest opens.<br>3. Pass the grown-up check and tap “Bring it in”.',
        ru: '1. Откройте камеру и наведите её на этот код.<br>2. Нажмите появившуюся ссылку — откроется EduQuest.<br>3. Пройдите проверку для взрослых и нажмите «Перенести».'
      })}</div>
    </div>
    <div style="position:absolute;top:${top + 540}px;left:20px;right:20px;display:flex;gap:10px;padding-bottom:130px">
      <div class="press" onclick="EQ.copyCode()" style="flex:1;height:50px;border-radius:18px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;font:800 13.5px 'Baloo 2';color:#5C4E7E">${TX({ az: 'Linki kopyala', en: 'Copy the link', ru: 'Скопировать ссылку' })}</div>
      <div class="press" onclick="EQ.go('parent_transfer')" style="flex:1;height:50px;border-radius:18px;background:#7B5CFF;box-shadow:0 3px 0 #5B3FD6;display:flex;align-items:center;justify-content:center;font:800 13.5px 'Baloo 2';color:#fff">${TX({ az: 'Hazırdır', en: 'Done', ru: 'Готово' })}</div>
    </div>
  </div>`;
};

/* 32 · What arrived, and what it will do to this phone — nothing is written before this */
/* a date that reads the same in all three languages */
EQS.xdate = function (d) {
  return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
};

EQS.meta.parent_import = { light: false };
EQS.screens.parent_import = function (s) {
  const inc = EQ.session.inbox;
  if (!inc) return EQS.screens.parent_transfer(s);
  const stat = (v, l) => `<div style="flex:1;text-align:center"><div style="font:800 21px 'Baloo 2';color:#2A1F45">${v}</div><div style="font:700 10px Nunito;color:#8878A8;margin-top:2px">${l}</div></div>`;
  const heads = inc.list.map(x => x.name).join(', ');
  const first = inc.list[0];
  const what = inc.kind === 'file'
    ? TX({
      az: `Bu telefondakı bütün macəralar əvəz olunacaq və ${inc.list.length > 1 ? `${inc.list.length} uşaq` : heads} bərpa ediləcək.`,
      en: `Everything on this phone will be replaced by ${inc.list.length > 1 ? `these ${inc.list.length} children` : heads}.`,
      ru: `Все приключения на этом телефоне будут заменены: ${inc.list.length > 1 ? `${inc.list.length} ребёнка` : heads}.`
    })
    : {
      fresh: TX({ az: `${heads} bu telefonda macəraya davam edəcək.`, en: `${heads} will carry on the adventure on this phone.`, ru: `${heads} продолжит приключение на этом телефоне.` }),
      same: TX({ az: `${heads} bu telefonda artıq var — irəliləyiş gələn nüsxə ilə əvəz olunacaq.`, en: `${heads} is already on this phone — that progress will be replaced by the one arriving.`, ru: `${heads} уже есть на этом телефоне — прогресс будет заменён на переносимый.` }),
      new: TX({ az: `${heads} bu telefona yeni uşaq kimi əlavə olunacaq. Mövcud macəralara toxunulmur.`, en: `${heads} will be added as another child. The adventures already here are left alone.`, ru: `${heads} будет добавлен как ещё один ребёнок. Уже существующие приключения не изменятся.` }),
      full: TX({ az: `Bu telefonda artıq ${EQP_MAX} uşaq var. Əvvəlcə birini silin.`, en: `This phone already has ${EQP_MAX} children. Remove one first.`, ru: `На этом телефоне уже ${EQP_MAX} ребёнка. Сначала удалите одного.` })
    }[inc.plan.mode];
  const blocked = inc.kind === 'code' && inc.plan.mode === 'full';
  const made = inc.made ? new Date(inc.made) : null;
  /* the card grows with each child it lists, so the two blocks below follow it down */
  const cardEnd = 114 + (inc.list.length > 1 ? 121 + inc.list.length * 27 : 157);
  return `<div class="scr vscroll" style="background:#F4F1FA">
    <div style="position:absolute;top:56px;left:20px;right:20px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.dropImport()" style="width:42px;height:42px;border-radius:15px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#2A1F45', 18)}</div>
      <div style="flex:1;font:800 20px 'Baloo 2', system-ui;color:#2A1F45">${TX({ az: 'Macəra gəldi', en: 'An adventure arrived', ru: 'Приключение получено' })}</div>
    </div>

    <div style="position:absolute;top:114px;left:20px;right:20px;border-radius:28px;background:#fff;padding:18px;box-shadow:0 6px 18px -12px rgba(42,31,69,0.3)">
      <div style="display:flex;align-items:center;gap:13px">
        <div style="width:54px;height:54px;border-radius:20px;background:#EFE7FF;display:flex;align-items:center;justify-content:center;flex:none;font:800 22px 'Baloo 2';color:#5B3FD6">${heads.slice(0, 1).toUpperCase()}</div>
        <div style="flex:1">
          <div style="font:800 18px 'Baloo 2';color:#2A1F45">${heads}</div>
          <div style="font:700 11.5px Nunito;color:#8878A8">${inc.kind === 'file'
            ? TX({ az: 'Fayldan · tam tarixçə', en: 'From a file · full history', ru: 'Из файла · полная история' })
            : TX({ az: 'QR koddan', en: 'From a QR code', ru: 'Из QR-кода' })}${made ? ' · ' + EQS.xdate(made) : ''}</div>
        </div>
      </div>
      <div style="margin-top:16px;padding-top:15px;border-top:1.5px solid #EFEAF9">${inc.list.length > 1
        ? inc.list.map(x => `<div style="display:flex;align-items:baseline;gap:8px;padding:5px 0">
            <div style="flex:1;font:800 13.5px Nunito;color:#2A1F45">${x.name}</div>
            <div style="font:700 11.5px Nunito;color:#8878A8">${TX({ az: `${x.level}. səviyyə · ${x.days} gün`, en: `Level ${x.level} · ${x.days} days`, ru: `${x.level} уровень · ${x.days} ${RUP(x.days, 'день', 'дня', 'дней')}` })}</div>
          </div>`).join('')
        : `<div style="display:flex">
            ${stat(TX({ az: `${first.level}. səviyyə`, en: `Level ${first.level}`, ru: `${first.level} уровень` }), TX({ az: 'qəhrəman', en: 'hero', ru: 'герой' }))}
            ${stat(first.streak, TX({ az: 'günlük seriya', en: 'day streak', ru: 'дней подряд' }))}
            ${stat(first.days, TX({ az: 'gün statistika', en: 'days of stats', ru: 'дней статистики' }))}
          </div>`}</div>
    </div>

    <div style="position:absolute;top:${cardEnd + 16}px;left:20px;right:20px;padding-bottom:60px">
      <div style="border-radius:24px;background:${blocked ? '#FFEDE6' : '#EFEAF9'};padding:15px 17px">
        <div style="font:800 13px 'Baloo 2';color:${blocked ? '#B4421F' : '#2A1F45'}">${TX({ az: 'Nə baş verəcək', en: 'What will happen', ru: 'Что произойдёт' })}</div>
        <div style="font:700 12.5px Nunito;color:${blocked ? '#B4421F' : '#5C4E7E'};line-height:1.55;margin-top:6px">${what}</div>
      </div>
      ${blocked ? '' : `<div class="press" onclick="EQ.applyImport()" style="margin-top:22px;height:56px;border-radius:20px;background:#3DBE6E;box-shadow:0 4px 0 #2A9455;display:flex;align-items:center;justify-content:center;font:800 16px 'Baloo 2';color:#fff">${TX({ az: 'Gətir', en: 'Bring it in', ru: 'Перенести' })}</div>`}
      <div class="press" onclick="EQ.dropImport()" style="margin-top:10px;height:52px;border-radius:20px;background:#fff;box-shadow:0 2px 0 #E0D8F2;display:flex;align-items:center;justify-content:center;font:800 14px 'Baloo 2';color:#8878A8">${TX({ az: 'İmtina et', en: 'Not now', ru: 'Не сейчас' })}</div>
    </div>
  </div>`;
};
