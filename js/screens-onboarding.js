/* EduQuest — onboarding + return screens (design screens 01–04, 28) */
const EQS = { screens: {}, meta: {} };

/* language picker chips (welcome screen + parent settings reuse) */
EQS.langChips = function (style) {
  const chip = (l, label) => `<div class="press" onclick="EQ.setLang('${l}')" style="height:34px;padding:0 13px;border-radius:17px;background:${EQI.lang === l ? '#7B5CFF' : 'rgba(42,31,69,0.10)'};box-shadow:${EQI.lang === l ? '0 3px 0 #5B3FD6' : 'none'};display:flex;align-items:center;font:800 12px Nunito;color:${EQI.lang === l ? '#fff' : '#5C4E7E'}">${label}</div>`;
  return `<div style="display:flex;gap:7px;${style || ''}">${chip('az', 'AZ')}${chip('en', 'EN')}${chip('ru', 'RU')}</div>`;
};

/* 01 · Splash */
EQS.meta.splash = { light: true };
EQS.screens.splash = function (s) {
  setTimeout(() => { if (EQ.current === 'splash') EQ.go(s.onboarded ? 'map' : 'welcome'); }, 1600);
  return `<div class="scr" onclick="EQ.go(EQ.s.onboarded ? 'map' : 'welcome')" style="background:#241A3F;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px">
    <div style="position:absolute;width:520px;height:520px;border-radius:50%;background:rgba(123,92,255,0.30);top:170px;left:-60px;opacity:0.9"></div>
    <div class="spark" style="width:8px;height:8px;border-radius:50%;background:#FFF7EA;top:120px;left:70px"></div>
    <div class="spark" style="width:5px;height:5px;border-radius:50%;background:#5CE39B;top:200px;left:320px;animation-delay:.4s"></div>
    <div class="spark" style="width:6px;height:6px;border-radius:50%;background:#45C6F0;top:640px;left:56px;animation-delay:.8s"></div>
    <div class="spark" style="width:7px;height:7px;border-radius:50%;background:#FFC24B;top:700px;left:330px;animation-delay:.2s"></div>
    <div style="position:relative;animation:eqFloat 4s ease-in-out infinite">${EQC.logo(150)}</div>
    <div style="position:relative;text-align:center">
      <div style="font:800 54px 'Baloo 2', system-ui;line-height:1"><span style="color:#FFF7EA">Edu</span><span style="color:#FFC24B">Quest</span></div>
      <div style="font:700 15px Nunito;color:#A896E0;margin-top:10px;letter-spacing:1px">${TX({ az: 'Macəra ilə öyrən', en: 'Learn by adventure', ru: 'Учись через приключения' })}</div>
    </div>
    <div style="position:absolute;bottom:96px;display:flex;gap:9px">
      <div style="width:11px;height:11px;border-radius:50%;background:#FFC24B"></div>
      <div style="width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,0.3)"></div>
      <div style="width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,0.3)"></div>
    </div>
    <div style="position:absolute;bottom:56px;font:700 12px Nunito;color:#7E6DB8">${TX({ az: 'Meşə oyanır…', en: 'Waking up the forest…', ru: 'Лес просыпается…' })}</div>
  </div>`;
};

/* 02 · Welcome */
EQS.meta.welcome = { light: false };
EQS.screens.welcome = function (s) {
  return `<div class="scr" style="background:#8FD8F5">
    <div style="position:absolute;inset:0;background:linear-gradient(#8FD8F5 0%, #CFEFFA 46%, #FFF7EA 74%)"></div>
    <div style="position:absolute;width:190px;height:190px;border-radius:50%;background:#FFE9A8;top:80px;right:-40px;opacity:.85"></div>
    <div style="position:absolute;bottom:230px;left:-60px;width:280px;height:190px;border-radius:50%;background:#5FCB86"></div>
    <div style="position:absolute;bottom:238px;right:-70px;width:300px;height:200px;border-radius:50%;background:#3DBE6E"></div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:270px;background:#FFF7EA;border-radius:44px 44px 0 0;box-shadow:0 -10px 30px -14px rgba(42,31,69,0.35)"></div>
    ${EQS.langChips('position:absolute;top:60px;left:0;right:0;justify-content:center')}
    <div class="bob" style="position:absolute;top:210px;left:0;right:0;display:flex;justify-content:center">
      ${EQC.questy('excited', 'width:210px', s.questyFur, s.questyFurDark)}
    </div>
    <div style="position:absolute;top:106px;left:32px;right:32px;text-align:center">
      <div style="font:800 34px 'Baloo 2', system-ui;color:#2A1F45;line-height:1.1">${TX({ az: 'Macəraya hazırsan?', en: 'Ready for an adventure?', ru: 'Готовы к приключению?' })}</div>
      <div style="font:700 15px Nunito;color:#5C4E7E;margin-top:10px;line-height:1.5">${TX({ az: 'Səni bütöv bir tapşırıqlar dünyası gözləyir.<br>Questy sənə yolu göstərəcək.', en: 'A whole world of quests is waiting.<br>Questy will show you the way.', ru: 'Тебя ждёт целый мир приключений.<br>Квести покажет дорогу.' })}</div>
    </div>
    <div style="position:absolute;bottom:126px;left:26px;right:26px;display:flex;flex-direction:column;gap:14px">
      <div class="press" onclick="EQ.go('create')" style="height:66px;border-radius:24px;background:#3DBE6E;box-shadow:0 6px 0 #2A9455, 0 14px 22px -10px rgba(42,148,85,0.6);display:flex;align-items:center;justify-content:center;font:800 22px 'Baloo 2', system-ui;color:#fff;position:relative;overflow:hidden">${TX({ az: 'Macəraya başla', en: 'Start my adventure', ru: 'Начать приключение' })}</div>
      <div class="press" onclick="EQ.haveHero()" style="height:58px;border-radius:22px;background:#FBE9CC;box-shadow:0 5px 0 #E8D0A8;display:flex;align-items:center;justify-content:center;font:800 17px 'Baloo 2', system-ui;color:#7A6438">${TX({ az: 'Artıq qəhrəmanım var', en: 'I already have a hero', ru: 'У меня уже есть герой' })}</div>
      <div class="press" onclick="EQ.go('parent_gate')" style="display:flex;align-items:center;justify-content:center;gap:7px;margin-top:2px">
        <svg width="15" height="15" viewBox="0 0 24 24"><path d="M12 3 l8 4 v6 c0 5-3.6 7.4-8 8.6 -4.4-1.2 -8-3.6 -8-8.6 V7 Z" fill="none" stroke="#8878A8" stroke-width="2"></path></svg>
        <span style="font:800 13px Nunito;color:#8878A8">${TX({ az: 'Valideyn bölməsi', en: 'Parent area', ru: 'Раздел для родителей' })}</span>
      </div>
    </div>
  </div>`;
};

/* 03 · Create your hero */
EQS.meta.create = { light: true };
EQS.screens.create = function (s) {
  const cat = EQ.session.createCat || 'skin';
  const hero = s.hero;
  const cats = [
    { key: 'skin', label: TX({ az: 'Dəri', en: 'Skin', ru: 'Кожа' }), icon: '🖐' },
    { key: 'hair', label: TX({ az: 'Saç', en: 'Hair', ru: 'Волосы' }), icon: '💇' },
    { key: 'hairColor', label: TX({ az: 'Rəng', en: 'Colour', ru: 'Цвет' }), icon: '🎨' },
    { key: 'outfit', label: TX({ az: 'Geyim', en: 'Outfit', ru: 'Наряд' }), icon: '👕' },
    { key: 'hat', label: TX({ az: 'Papaq', en: 'Hat', ru: 'Шляпа' }), icon: '🎩' }
  ];
  const hairNames = {
    bob: { az: 'Bob', en: 'Bob', ru: 'Каре' },
    curly: { az: 'Buruq', en: 'Curls', ru: 'Кудри' },
    spiky: { az: 'Biz-biz', en: 'Spiky', ru: 'Ёжик' },
    long: { az: 'Uzun', en: 'Long', ru: 'Длинные' },
    braids: { az: 'Hörük', en: 'Braids', ru: 'Косички' }
  };
  const hatNames = {
    none: { az: 'Yoxdur', en: 'None', ru: 'Нет' },
    explorer: { az: 'Kəşfiyyatçı', en: 'Scout', ru: 'Скаут' },
    wizard: { az: 'Sehrbaz', en: 'Wizard', ru: 'Волшебник' },
    crown: { az: 'Tac', en: 'Crown', ru: 'Корона' }
  };
  const sets = {
    skin: ['#FBDCC0', '#F2C49B', '#C98B62', '#8D5A3B', '#5E3A26'].map(c => ({ bg: c, label: '', fg: '#2A1F45', on: hero.skin === c, apply: { skin: c } })),
    hair: ['bob', 'curly', 'spiky', 'long', 'braids'].map(h => ({ bg: hero.hairColor, label: TX(hairNames[h]), fg: '#FFF7EA', on: hero.hair === h, apply: { hair: h } })),
    hairColor: ['#2B2027', '#4A2E20', '#C9762F', '#F0C24B', '#7B5CFF'].map(c => ({ bg: c, label: '', fg: '#fff', on: hero.hairColor === c, apply: { hairColor: c } })),
    outfit: EQD.OUTFITS.map(p => ({ bg: p[0], label: '', fg: '#fff', on: hero.outfit === p[0], apply: { outfit: p[0], outfitDark: p[1] } })),
    hat: ['none', 'explorer', 'wizard', 'crown'].map(h => ({ bg: '#FBE9CC', label: TX(hatNames[h]), fg: '#7A6438', on: hero.hat === h, apply: { hat: h } }))
  };
  const catChips = cats.map(c => `
    <div class="press" onclick="EQ.createCat('${c.key}')" style="flex:1;height:70px;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:${cat === c.key ? '#7B5CFF' : '#FBE9CC'};box-shadow:${cat === c.key ? '0 5px 0 #5B3FD6' : '0 4px 0 #E8D0A8'}">
      <div style="font-size:22px;line-height:1">${c.icon}</div>
      <div style="font:800 10px Nunito;color:${cat === c.key ? '#FFFFFF' : '#7A6438'};letter-spacing:0.3px">${c.label}</div>
    </div>`).join('');
  const options = sets[cat].map((o, i) => `
    <div class="press" onclick="EQ.createPick('${cat}',${i})" style="width:62px;height:62px;border-radius:22px;display:flex;align-items:center;justify-content:center;background:${o.bg};box-shadow:${o.on ? '0 0 0 4px #FFC24B, 0 4px 0 rgba(42,31,69,0.18)' : '0 0 0 2px rgba(42,31,69,0.12), 0 4px 0 rgba(42,31,69,0.10)'}">
      <div style="font:800 13px Nunito;color:${o.fg};text-align:center;line-height:1.1">${o.label}</div>
    </div>`).join('');
  return `<div class="scr" style="background:#2C1F52">
    <div style="position:absolute;top:0;left:0;right:0;height:520px;background:radial-gradient(280px 240px at 50% 46%, rgba(123,92,255,0.55), rgba(44,31,82,0) 70%)"></div>
    <div style="position:absolute;top:66px;left:20px;right:20px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.go('welcome')" style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center">${EQC.chevL('#fff', 20)}</div>
      <div style="flex:1;text-align:center"><div style="font:800 21px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Qəhrəmanını yarat', en: 'Create your hero', ru: 'Создай героя' })}</div><div style="font:700 11px Nunito;color:#A896E0;letter-spacing:1px">${TX({ az: 'ADDIM 2 / 3', en: 'STEP 2 OF 3', ru: 'ШАГ 2 ИЗ 3' })}</div></div>
      <div style="width:44px"></div>
    </div>
    <div style="position:absolute;top:126px;left:26px;right:26px;height:8px;border-radius:4px;background:rgba(255,255,255,0.14)"><div style="width:66%;height:100%;border-radius:4px;background:#5CE39B"></div></div>
    <div style="position:absolute;top:186px;left:0;right:0;display:flex;justify-content:center">
      <div style="position:relative;width:250px;height:250px;border-radius:50%;background:rgba(123,92,255,0.30);box-shadow:0 0 0 14px rgba(123,92,255,0.14)"></div>
    </div>
    <div style="position:absolute;top:170px;left:0;right:0;display:flex;justify-content:center">
      ${EQC.hero(hero, 'width:230px')}
    </div>
    <div style="position:absolute;top:470px;left:0;right:0;display:flex;justify-content:center;gap:10px">
      <div style="height:34px;padding:0 16px;border-radius:17px;background:rgba(255,255,255,0.12);display:flex;align-items:center;font:800 13px Nunito;color:#fff">${s.heroName}</div>
      <div class="press" onclick="EQ.renameHero()" style="height:34px;width:34px;border-radius:17px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M4 20 h4 L20 8 l-4-4 -12 12 Z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"></path></svg></div>
    </div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:340px;background:#FFF7EA;border-radius:36px 36px 0 0;padding:22px 22px 0">
      <div style="display:flex;gap:8px;justify-content:space-between">${catChips}</div>
      <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center">${options}</div>
      <div class="press" onclick="EQ.go('meet')" style="position:absolute;bottom:52px;left:22px;right:22px;height:66px;border-radius:24px;background:#7B5CFF;box-shadow:0 6px 0 #5B3FD6, 0 14px 22px -10px rgba(91,63,214,0.6);display:flex;align-items:center;justify-content:center;gap:10px;font:800 21px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Əla görünür!', en: 'Looks great!', ru: 'Отлично выглядит!' })}${EQC.arrowR('#fff', 20)}</div>
    </div>
  </div>`;
};

/* 04a · Meet Questy */
EQS.meta.meet = { light: true };
EQS.screens.meet = function (s) {
  return `<div class="scr" style="background:#1C2E22">
    <div style="position:absolute;inset:0;background:linear-gradient(#132118 0%, #1E3527 52%, #2C4A34 100%)"></div>
    <div style="position:absolute;left:0;right:0;top:300px;display:flex;justify-content:center"><div style="width:250px;height:340px;border-radius:125px 125px 40px 40px;background:radial-gradient(circle at 50% 40%, rgba(123,92,255,0.85), rgba(69,198,240,0.35) 60%, rgba(28,46,34,0) 78%)"></div></div>
    <div style="position:absolute;bottom:0;left:-30px;width:150px;height:300px;background:#0E1A12;border-radius:60% 40% 0 0"></div>
    <div style="position:absolute;bottom:0;right:-40px;width:170px;height:340px;background:#0E1A12;border-radius:40% 60% 0 0"></div>
    <div style="position:absolute;top:78px;left:26px;right:26px;text-align:center">
      <div style="font:700 12px Nunito;color:#7FE0AE;letter-spacing:2.4px;text-transform:uppercase">${TX({ az: 'Sənin yoldaşın', en: 'Your companion', ru: 'Твой спутник' })}</div>
      <div style="font:800 36px 'Baloo 2', system-ui;color:#FFF7EA;margin-top:8px;line-height:1.1">${TX({ az: 'Questy ilə tanış ol', en: 'Meet Questy', ru: 'Знакомься — Квести' })}</div>
    </div>
    <div class="float" style="position:absolute;top:330px;left:0;right:0;display:flex;justify-content:center">
      ${EQC.questy('happy', 'width:220px', s.questyFur, s.questyFurDark)}
    </div>
    <div style="position:absolute;bottom:200px;left:24px;right:24px">
      <div style="position:relative;background:#FFF7EA;border-radius:28px;padding:22px 24px;box-shadow:0 8px 0 rgba(0,0,0,0.18)">
        <div style="position:absolute;top:-11px;left:44px;width:26px;height:26px;background:#FFF7EA;border-radius:6px;transform:rotate(45deg)"></div>
        <div style="font:800 19px 'Baloo 2', system-ui;color:#2A1F45;position:relative">${TX({ az: 'Salam! Mən Questy-yəm 🦊', en: 'Hi! I&#39;m Questy 🦊', ru: 'Привет! Я Квести 🦊' })}</div>
        <div style="font:700 15px Nunito;color:#5C4E7E;margin-top:8px;line-height:1.55;position:relative">${TX({ az: 'Bu dünyadakı hər cığırı tanıyıram. Yolu bir tapmaca kəsəndə onu birlikdə həll edəcəyik — düşünməyə həmişə kömək edəcəyəm.', en: 'I know every path in this world. When a puzzle blocks the way, we&#39;ll solve it together — I&#39;ll always help you think it through.', ru: 'Я знаю здесь каждую тропинку. Когда путь преградит загадка, мы решим её вместе — я всегда помогу тебе подумать.' })}</div>
      </div>
    </div>
    <div class="press" onclick="EQ.go('begin')" style="position:absolute;bottom:110px;left:26px;right:26px;height:66px;border-radius:24px;background:#FFC24B;box-shadow:0 6px 0 #E39B1C, 0 14px 22px -10px rgba(227,155,28,0.55);display:flex;align-items:center;justify-content:center;font:800 21px 'Baloo 2', system-ui;color:#4A3208">${TX({ az: 'Gedək, Questy!', en: 'Let&#39;s go, Questy!', ru: 'Вперёд, Квести!' })}</div>
    <div style="position:absolute;bottom:70px;left:0;right:0;text-align:center;font:700 12px Nunito;color:#7FE0AE">${TX({ az: 'Macəran başlayır!', en: 'Your adventure begins!', ru: 'Твоё приключение начинается!' })}</div>
  </div>`;
};

/* 04b · Adventure begins */
EQS.meta.begin = { light: true };
EQS.screens.begin = function (s) {
  return `<div class="scr" style="background:#241A3F;display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div class="rays" style="position:absolute;width:640px;height:640px;border-radius:50%;background:repeating-conic-gradient(from 0deg, rgba(255,194,75,0.22) 0 5deg, rgba(255,194,75,0) 5deg 24deg);mask-image:radial-gradient(closest-side, rgba(0,0,0,0.9) 20%, transparent 72%);-webkit-mask-image:radial-gradient(closest-side, rgba(0,0,0,0.9) 20%, transparent 72%);opacity:0.9"></div>
    <div class="pop" style="position:relative;display:flex;align-items:flex-end;gap:6px">
      ${EQC.hero(s.hero, 'width:190px')}
      ${EQC.questy('celebrating', 'width:140px', s.questyFur, s.questyFurDark)}
    </div>
    <div style="position:relative;text-align:center;margin-top:26px">
      <div style="font:800 40px 'Baloo 2', system-ui;color:#FFF7EA;line-height:1.1">${TX({ az: 'Macəran<br>başlayır!', en: 'Your adventure<br>begins!', ru: 'Приключение<br>начинается!' })}</div>
      <div style="font:700 15px Nunito;color:#A896E0;margin-top:12px">${TX({ az: 'Bilik Meşəsi səni gözləyir', en: 'Knowledge Forest is waiting for you', ru: 'Лес Знаний ждёт тебя' })}</div>
    </div>
    <div class="press" onclick="EQ.finishOnboarding()" style="position:absolute;bottom:112px;left:26px;right:26px;height:66px;border-radius:24px;background:#3DBE6E;box-shadow:0 6px 0 #2A9455;display:flex;align-items:center;justify-content:center;font:800 21px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Dünyaya daxil ol', en: 'Enter the world', ru: 'Войти в мир' })}</div>
  </div>`;
};

/* 28 · Welcome back */
EQS.meta.welcomeback = { light: false };
EQS.screens.welcomeback = function (s) {
  return `<div class="scr" style="background:#8FD8F5">
    <div style="position:absolute;inset:0;background:linear-gradient(#7FD1F2 0%, #C3EBFA 44%, #FFF7EA 76%)"></div>
    <div style="position:absolute;top:96px;right:-30px;width:170px;height:170px;border-radius:50%;background:#FFE9A8;opacity:0.75"></div>
    <div style="position:absolute;bottom:250px;left:-70px;width:280px;height:180px;border-radius:50%;background:#5FCB86"></div>
    <div style="position:absolute;bottom:258px;right:-80px;width:300px;height:190px;border-radius:50%;background:#3DBE6E"></div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:290px;background:#FFF7EA;border-radius:44px 44px 0 0"></div>
    <div style="position:absolute;top:76px;left:24px;right:24px">
      <div style="font:800 32px 'Baloo 2', system-ui;color:#2A1F45;line-height:1.15">${TX({ az: `Xoş gəldin,<br>${EQ.rank(s.level)}!`, en: `Welcome back,<br>${EQ.rank(s.level)}!`, ru: `С возвращением,<br>${EQ.rank(s.level)}!` })}</div>
      <div style="font:700 14.5px Nunito;color:#4E5F70;margin-top:8px">${TX({ az: 'Sən yoxkən meşə yerini qorudu.', en: 'The forest kept your place while you were away.', ru: 'Лес сохранил твоё место, пока тебя не было.' })}</div>
    </div>
    <div style="position:absolute;top:212px;left:16px;display:flex;align-items:flex-end;gap:8px">
      ${EQC.questy('excited', 'width:130px', s.questyFur, s.questyFurDark)}
      <div style="background:#FFF7EA;border-radius:22px;border-bottom-left-radius:8px;padding:14px 16px;box-shadow:0 5px 0 rgba(42,31,69,0.18);max-width:210px;margin-bottom:14px"><div style="font:700 14px Nunito;color:#3E3160;line-height:1.5">${TX({ az: 'Sənsiz darıxdıq! Yeni macəra gözləyir.', en: 'We missed you! A new adventure is waiting.', ru: 'Мы скучали! Тебя ждёт новое приключение.' })}</div></div>
    </div>
    <div style="position:absolute;bottom:270px;left:16px;right:16px;height:44px;border-radius:22px;background:rgba(255,138,76,0.16);display:flex;align-items:center;gap:8px;padding:0 14px">
      ${EQC.flame(20)}
      <span style="font:800 13px Nunito;color:#B4551F">${TX({ az: `${s.streak} günlük seriyan qorunur`, en: `Your ${s.streak} day streak is safe`, ru: `Твоя серия из ${s.streak} ${RUP(s.streak, 'дня', 'дней', 'дней')} в безопасности` })}</span>
    </div>
    <div style="position:absolute;bottom:150px;left:16px;right:16px;display:flex;gap:11px">
      <div class="press" onclick="EQ.go('quest')" style="flex:1;border-radius:24px;background:#fff;box-shadow:0 5px 0 #E0C79A;padding:14px 10px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:7px">
        <svg width="30" height="30" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6" fill="none" stroke="#45C6F0" stroke-width="2.6"></circle><circle cx="12" cy="12" r="4" fill="#45C6F0"></circle></svg>
        <div style="font:800 13px 'Baloo 2';color:#2A1F45;line-height:1.2">${TX({ az: 'Bugünkü<br>tapşırıq', en: 'Today&#39;s<br>quest', ru: 'Задание<br>дня' })}</div>
        <div style="font:700 10px Nunito;color:#8B7A55">${TX({ az: `${Math.max(0, 5 - s.challengesDone)} qalıb`, en: `${Math.max(0, 5 - s.challengesDone)} left`, ru: `Осталось ${Math.max(0, 5 - s.challengesDone)}` })}</div>
      </div>
      <div class="press" onclick="EQ.openChestOrToast()" style="flex:1;border-radius:24px;background:#fff;box-shadow:0 5px 0 #E0C79A;padding:14px 10px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:7px;position:relative">
        ${s.chestReady && !s.chestOpened ? `<div style="position:absolute;top:-6px;right:-4px;width:22px;height:22px;border-radius:11px;background:#FF5D73;box-shadow:0 3px 0 #D63A52;display:flex;align-items:center;justify-content:center;font:800 11px 'Baloo 2';color:#fff">1</div>` : ''}
        <svg width="30" height="30" viewBox="0 0 40 40"><path d="M6 16 h28 v16 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2-2 Z" fill="#C9762F"></path><path d="M6 16 q14-9 28 0 v6 H6 Z" fill="#E0A365"></path><rect x="17" y="18" width="6" height="12" rx="2" fill="#FFC24B"></rect></svg>
        <div style="font:800 13px 'Baloo 2';color:#2A1F45;line-height:1.2">${TX({ az: 'Mükafat<br>gözləyir', en: 'Reward<br>waiting', ru: 'Награда<br>ждёт' })}</div>
        <div style="font:700 10px Nunito;color:#8B7A55">${s.chestReady && !s.chestOpened ? TX({ az: 'Pulsuz sandıq', en: 'Free chest', ru: 'Сундук готов' }) : TX({ az: 'Qazanmalısan', en: 'Earn one', ru: 'Заработай его' })}</div>
      </div>
      <div class="press" onclick="EQ.go('unlock')" style="flex:1;border-radius:24px;background:#fff;box-shadow:0 5px 0 #E0C79A;padding:14px 10px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:7px">
        <svg width="30" height="30" viewBox="0 0 36 36"><path d="M14 6 h8 v7 l7 14 a3 3 0 0 1 -2.6 4.4 H9.6 A3 3 0 0 1 7 27 l7-14 Z" fill="#CFEFFA"></path><path d="M10.4 22 h15.2 l3 6 a3 3 0 0 1 -2.6 4 H10 a3 3 0 0 1 -2.6-4 Z" fill="#45C6F0"></path></svg>
        <div style="font:800 13px 'Baloo 2';color:#2A1F45;line-height:1.2">${TX({ az: 'Yeni<br>məkan', en: 'New<br>location', ru: 'Новое<br>место' })}</div>
        <div style="font:700 10px Nunito;color:#8B7A55">${TX({ az: 'Bax gör', en: 'Peek at it', ru: 'Взгляни' })}</div>
      </div>
    </div>
    <div class="press" onclick="EQ.go('map')" style="position:absolute;bottom:52px;left:16px;right:16px;height:72px;border-radius:24px;background:#3DBE6E;box-shadow:0 6px 0 #2A9455, 0 16px 26px -12px rgba(42,148,85,0.5);display:flex;align-items:center;justify-content:center;font:800 22px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Macəraya davam et', en: 'Continue my adventure', ru: 'Продолжить приключение' })}</div>
  </div>`;
};
