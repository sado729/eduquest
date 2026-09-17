/* EduQuest — world screens (design screens 05, 06, 07, 20, 19) */

/* 05 · Main world map */
EQS.meta.map = { light: false };
EQS.screens.map = function (s) {
  const done = s.challengesDone;
  let cardLabel = TX({ az: 'BUGÜNKÜ MACƏRA', en: "TODAY'S ADVENTURE", ru: 'ПРИКЛЮЧЕНИЕ ДНЯ' }), cardTitle = TX(EQ.qset().title), cardAction = "EQ.go('quest')", cardMood = 'excited';
  if (done >= 5 && !s.bossBeaten) { cardLabel = EQ.chapter().final ? TX({ az: 'FƏSLİN FİNALI', en: 'CHAPTER FINALE', ru: 'ФИНАЛ ГЛАВЫ' }) : TX({ az: 'BOSS DÖYÜŞÜ', en: 'BOSS BATTLE', ru: 'БИТВА С БОССОМ' }); cardTitle = TX(EQ.boss().face); cardAction = "EQ.go('boss')"; }
  else if (s.bossBeaten && s.chestReady && !s.chestOpened) { cardLabel = TX({ az: 'TAPŞIRIQ TAMAMLANDI', en: 'QUEST COMPLETE', ru: 'ЗАДАНИЕ ВЫПОЛНЕНО' }); cardTitle = TX({ az: 'Xəzinə sandığını aç!', en: 'Open your treasure chest!', ru: 'Открой сундук с сокровищами!' }); cardAction = "EQ.go('chest')"; }
  else if (s.bossBeaten) { cardLabel = TX({ az: 'MƏRHƏLƏ TAMAMLANDI', en: 'STAGE COMPLETE', ru: 'ЭТАП ПРОЙДЕН' }); cardTitle = TX({ az: 'Yeni macəraya başla!', en: 'Start a new adventure!', ru: 'Начни новое приключение!' }); cardMood = 'celebrating'; cardAction = "EQ.nextStage()"; }
  const pips = [0, 1, 2, 3, 4].map(i => `<div style="width:22px;height:7px;border-radius:4px;background:${i < done ? '#3DBE6E' : '#E8D0A8'}"></div>`).join('');
  const forestBadge = s.bossBeaten ? '' : `<div style="position:absolute;right:-8px;top:-8px;min-width:28px;height:28px;padding:0 7px;border-radius:14px;background:#FF5D73;box-shadow:0 3px 0 #D63A52;display:flex;align-items:center;justify-content:center;font:800 13px 'Baloo 2', system-ui;color:#fff">${Math.max(1, 5 - done)}</div>`;
  return `<div class="scr" style="background:#8FD8F5">
    <svg viewBox="0 0 402 874" width="402" height="874" style="position:absolute;inset:0">
      <defs>
        <linearGradient id="eqSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#63C6EC"></stop><stop offset="0.5" stop-color="#A5E4F7"></stop><stop offset="1" stop-color="#DCF4FB"></stop></linearGradient>
        <g id="eqTree"><path d="M9 20 h4 v8 h-4 Z" fill="#8A5A34"></path><circle cx="11" cy="12" r="11" fill="#3DBE6E"></circle><circle cx="11" cy="8" r="7.5" fill="#54D083"></circle></g>
      </defs>
      <rect width="402" height="874" fill="url(#eqSky)"></rect>
      <circle cx="338" cy="120" r="64" fill="#FFE9A8" opacity="0.5"></circle>
      <path d="M0 686 H402 V874 H0 Z" fill="#3BB6E8"></path>
      <path d="M0 686 H402 v20 H0 Z" fill="#6FD2F4"></path>
      <path d="M20 730 q40-16 66 2 q-30 14 -66-2 Z" fill="#9EE3FA" opacity="0.7"></path>
      <path d="M300 760 q40-16 66 2 q-30 14 -66-2 Z" fill="#9EE3FA" opacity="0.7"></path>
      <path d="M52 728 C16 688 24 604 68 572 C56 518 92 466 148 464 C162 406 234 388 278 420 C332 416 368 468 354 514 C390 558 382 656 338 700 C302 740 240 762 176 756 C114 750 74 754 52 728 Z" fill="#FBE9CC"></path>
      <path d="M62 716 C32 680 40 606 80 576 C68 526 102 478 152 476 C166 420 234 404 274 434 C324 430 358 478 344 520 C378 560 370 646 330 688 C296 722 238 742 178 736 C122 730 82 742 62 716 Z" fill="#5FCB86"></path>
      <path d="M92 700 C70 674 74 620 104 596 C96 556 126 522 164 522 C176 480 230 468 262 490 C302 488 328 524 318 556 C344 586 338 650 306 682 C280 708 236 722 190 718 C146 714 108 722 92 700 Z" fill="#6FD693" opacity="0.55"></path>
      <ellipse cx="196" cy="612" rx="34" ry="15" fill="#45C6F0" opacity="0.85"></ellipse>
      <ellipse cx="196" cy="609" rx="26" ry="10" fill="#8FE0FA" opacity="0.8"></ellipse>
      <path d="M100 616 C150 598 214 594 254 574" stroke="#E8D0A8" stroke-width="16" fill="none" stroke-linecap="round"></path>
      <path d="M100 616 C150 598 214 594 254 574" stroke="#FFF7EA" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="2 16"></path>
      <path d="M254 584 C220 552 150 536 118 490" stroke="#E8D0A8" stroke-width="16" fill="none" stroke-linecap="round"></path>
      <path d="M254 584 C220 552 150 536 118 490" stroke="#FFF7EA" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="2 16"></path>
      <path d="M118 490 C160 430 250 420 290 372" stroke="rgba(255,247,234,0.5)" stroke-width="11" fill="none" stroke-linecap="round" stroke-dasharray="2 18"></path>
      <path d="M290 372 C250 320 130 300 96 258" stroke="rgba(255,247,234,0.32)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="2 18"></path>
      <path d="M96 258 C150 210 250 214 296 186" stroke="rgba(255,247,234,0.22)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="2 18"></path>
      <use href="#eqTree" x="70" y="560"></use><use href="#eqTree" x="316" y="608"></use><use href="#eqTree" x="96" y="640"></use><use href="#eqTree" x="290" y="510"></use><use href="#eqTree" x="118" y="700"></use><use href="#eqTree" x="256" y="694"></use>
      <ellipse cx="296" cy="392" rx="62" ry="18" fill="#5FCB86"></ellipse><path d="M236 392 q18 34 60 40 q42-6 60-40 Z" fill="#8A6BB0"></path>
      <ellipse cx="96" cy="278" rx="58" ry="17" fill="#5FCB86"></ellipse><path d="M40 278 q16 32 56 38 q40-6 56-38 Z" fill="#7B5CA8"></path>
      <ellipse cx="300" cy="206" rx="52" ry="15" fill="#B9AEDD"></ellipse><path d="M250 206 q14 28 50 34 q36-6 50-34 Z" fill="#8579B8"></path>
      <g fill="#FFFFFF" opacity="0.92"><ellipse cx="70" cy="180" rx="34" ry="18"></ellipse><ellipse cx="96" cy="172" rx="26" ry="20"></ellipse><ellipse cx="118" cy="184" rx="24" ry="14"></ellipse></g>
      <g fill="#FFFFFF" opacity="0.86"><ellipse cx="300" cy="252" rx="40" ry="17"></ellipse><ellipse cx="330" cy="246" rx="26" ry="15"></ellipse></g>
      <g fill="#FFFFFF" opacity="0.8"><ellipse cx="336" cy="150" rx="34" ry="15"></ellipse><ellipse cx="304" cy="146" rx="24" ry="13"></ellipse></g>
    </svg>

    <div class="press" onclick="EQ.toast(TX({az:'Kosmik Stansiya 15-ci səviyyədə açılır — kəşfə davam! 🚀',en:'Space Station opens at Level 15 — keep exploring! 🚀',ru:'Космическая станция откроется на 15-м уровне — продолжай исследовать! 🚀'}))" style="position:absolute;left:244px;top:170px;width:86px;display:flex;flex-direction:column;align-items:center;gap:5px">
      <div style="position:relative;width:66px;height:66px;border-radius:24px;background:rgba(36,26,63,0.62);box-shadow:0 0 0 2px rgba(255,255,255,0.2) inset;display:flex;align-items:center;justify-content:center">
        <svg width="34" height="34" viewBox="0 0 34 34"><path d="M17 3 l4 8 h-8 Z" fill="#2A1F45"></path><rect x="12" y="10" width="10" height="16" rx="5" fill="#2A1F45"></rect><path d="M12 16 l-6 8 h6 Z M22 16 l6 8 h-6 Z" fill="#2A1F45"></path></svg>
        <div style="position:absolute;right:-6px;bottom:-6px;width:26px;height:26px;border-radius:13px;background:#241A3F;box-shadow:0 0 0 2px rgba(255,255,255,0.22) inset;display:flex;align-items:center;justify-content:center">${EQC.lock('#C6B9EE', 13)}</div>
      </div>
      <div style="padding:3px 9px;border-radius:9px;background:rgba(36,26,63,0.78);font:800 9.5px Nunito;color:#C6B9EE;white-space:nowrap">${TX({ az: 'Kosmik Stansiya · Səv 15', en: 'Space Station · Lv 15', ru: 'Космостанция · Ур 15' })}</div>
    </div>

    <div class="press" onclick="EQ.toast(TX({az:'Sirli Qala 20-ci səviyyədə açılır — hələ uzun yol var! 🏰',en:'Mystery Castle opens at Level 20 — a long journey away! 🏰',ru:'Таинственный замок откроется на 20-м уровне — путь ещё долгий! 🏰'}))" style="position:absolute;left:54px;top:222px;width:86px;display:flex;flex-direction:column;align-items:center;gap:5px">
      <div style="position:relative;width:68px;height:68px;border-radius:24px;background:rgba(36,26,63,0.55);box-shadow:0 0 0 2px rgba(255,255,255,0.2) inset;display:flex;align-items:center;justify-content:center">
        <svg width="36" height="36" viewBox="0 0 36 36"><path d="M6 32 V14 h5 V9 h4 v5 h4 V9 h4 v5 h5 v18 Z" fill="#2A1F45"></path><path d="M15 24 h6 v8 h-6 Z" fill="#5B3FD6"></path></svg>
        <div style="position:absolute;right:-6px;bottom:-6px;width:26px;height:26px;border-radius:13px;background:#241A3F;box-shadow:0 0 0 2px rgba(255,255,255,0.22) inset;display:flex;align-items:center;justify-content:center">${EQC.lock('#C6B9EE', 13)}</div>
      </div>
      <div style="padding:3px 9px;border-radius:9px;background:rgba(36,26,63,0.78);font:800 9.5px Nunito;color:#C6B9EE;white-space:nowrap">${TX({ az: 'Sirli Qala · Səv 20', en: 'Mystery Castle · Lv 20', ru: 'Замок Тайн · Ур 20' })}</div>
    </div>

    <div class="press" onclick="EQ.go('unlock')" style="position:absolute;left:252px;top:322px;width:88px;display:flex;flex-direction:column;align-items:center;gap:5px">
      <div style="position:relative;width:72px;height:72px;border-radius:26px;background:rgba(255,247,234,0.28);box-shadow:0 0 0 2px rgba(255,255,255,0.5) inset;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;inset:-8px;border-radius:32px;background:rgba(69,198,240,0.35);animation:eqPulse 2.8s ease-in-out infinite"></div>
        <svg width="38" height="38" viewBox="0 0 36 36" style="position:relative"><path d="M14 6 h8 v7 l7 14 a3 3 0 0 1 -2.6 4.4 H9.6 A3 3 0 0 1 7 27 l7-14 Z" fill="#EAF7FF" stroke="#2A1F45" stroke-width="2"></path><path d="M10.4 22 h15.2 l3 6 a3 3 0 0 1 -2.6 4 H10 a3 3 0 0 1 -2.6-4 Z" fill="#45C6F0"></path><circle cx="15" cy="27" r="2" fill="#EAF7FF"></circle><circle cx="21" cy="29" r="1.6" fill="#EAF7FF"></circle></svg>
        <div style="position:absolute;right:-7px;bottom:-7px;width:28px;height:28px;border-radius:14px;background:#FFC24B;box-shadow:0 3px 0 #E39B1C;display:flex;align-items:center;justify-content:center">${EQC.lock('#4A3208', 14)}</div>
      </div>
      <div style="padding:4px 10px;border-radius:10px;background:rgba(36,26,63,0.86);font:800 10px Nunito;color:#FFD98A;white-space:nowrap">${TX({ az: 'Elm Adası · Səv 10', en: 'Science Island · Lv 10', ru: 'Остров Науки · Ур 10' })}</div>
    </div>

    <div class="press" onclick="EQ.toast(TX({az:'Söz Vadisi bugünkü macəradan sonra açılır! 📖',en:'Word Valley opens after today’s adventure! 📖',ru:'Долина Слов откроется после сегодняшнего приключения! 📖'}))" style="position:absolute;left:74px;top:440px;width:92px;display:flex;flex-direction:column;align-items:center;gap:5px">
      <div style="position:relative;width:74px;height:74px;border-radius:26px;background:#FFF7EA;box-shadow:0 6px 0 #E0C79A, 0 12px 20px -8px rgba(20,10,40,0.4);display:flex;align-items:center;justify-content:center">
        <svg width="38" height="38" viewBox="0 0 36 36"><path d="M5 9 q7-3 13 2 v20 q-6-5 -13-2 Z" fill="#45C6F0"></path><path d="M31 9 q-7-3 -13 2 v20 q6-5 13-2 Z" fill="#7B5CFF"></path><path d="M18 11 v20" stroke="#2A1F45" stroke-width="1.8"></path></svg>
        <div style="position:absolute;right:-8px;top:-8px;min-width:26px;height:26px;padding:0 6px;border-radius:13px;background:#FF5D73;box-shadow:0 3px 0 #D63A52;display:flex;align-items:center;justify-content:center;font:800 12px 'Baloo 2', system-ui;color:#fff">2</div>
      </div>
      <div style="padding:4px 10px;border-radius:10px;background:rgba(36,26,63,0.86);font:800 10px Nunito;color:#fff;white-space:nowrap">${TX({ az: 'Söz Vadisi', en: 'Word Valley', ru: 'Долина Слов' })}</div>
    </div>

    <div class="press" onclick="EQ.go('details')" style="position:absolute;left:230px;top:520px;width:100px;display:flex;flex-direction:column;align-items:center;gap:5px">
      <div style="position:relative;width:82px;height:82px;border-radius:28px;background:#FFF7EA;box-shadow:0 7px 0 #E0C79A, 0 14px 24px -8px rgba(20,10,40,0.45);display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;inset:-10px;border-radius:36px;background:rgba(92,227,155,0.4);animation:eqPulse 2.8s ease-in-out infinite"></div>
        <svg width="46" height="46" viewBox="0 0 36 36" style="position:relative"><path d="M15 26 h4 v7 h-4 Z" fill="#8A5A34"></path><circle cx="17" cy="17" r="12" fill="#2A9455"></circle><circle cx="17" cy="13" r="9" fill="#3DBE6E"></circle><circle cx="17" cy="10" r="6" fill="#54D083"></circle><path d="M13 6 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4-3 -3-1.4 3-1.4 Z" fill="#FFE9A8"></path></svg>
        ${forestBadge}
      </div>
      <div style="padding:4px 11px;border-radius:11px;background:#3DBE6E;box-shadow:0 3px 0 #2A9455;font:800 11px Nunito;color:#fff;white-space:nowrap">${TX({ az: 'Bilik Meşəsi', en: 'Knowledge Forest', ru: 'Лес Знаний' })}</div>
    </div>

    <div class="press" onclick="EQ.openChestOrToast()" style="position:absolute;left:142px;top:520px;width:66px;height:66px;display:flex;align-items:center;justify-content:center">
      ${s.chestReady && !s.chestOpened ? '<div style="position:absolute;inset:8px;border-radius:20px;background:rgba(255,194,75,0.35);animation:eqPulse 2.8s ease-in-out infinite"></div>' : ''}
      <svg width="46" height="46" viewBox="0 0 40 40" style="position:relative"><path d="M6 16 h28 v16 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2-2 Z" fill="#C9762F"></path><path d="M6 16 q14-9 28 0 v6 H6 Z" fill="#E0A365"></path><rect x="17" y="18" width="6" height="12" rx="2" fill="#FFC24B"></rect><rect x="6" y="21" width="28" height="4" fill="#FFC24B"></rect></svg>
    </div>

    <div class="press" onclick="EQ.go('home')" style="position:absolute;left:52px;top:572px;width:96px;display:flex;flex-direction:column;align-items:center;gap:5px">
      <div style="position:relative;width:76px;height:76px;border-radius:26px;background:#FFF7EA;box-shadow:0 6px 0 #E0C79A, 0 12px 20px -8px rgba(20,10,40,0.4);display:flex;align-items:center;justify-content:center">
        <svg width="34" height="34" viewBox="0 0 36 36"><path d="M18 6 L33 18 h-4 v12 a2 2 0 0 1 -2 2 H9 a2 2 0 0 1 -2-2 V18 H3 Z" fill="#FF8A4C"></path><path d="M18 8.6 L30 18.4 V30 H6 V18.4 Z" fill="#FFF7EA"></path><rect x="14" y="21" width="8" height="9" rx="1.5" fill="#7B5CFF"></rect><path d="M9 13 h4 v4 Z" fill="#E06327"></path></svg>
      </div>
      <div style="padding:4px 10px;border-radius:10px;background:rgba(36,26,63,0.86);font:800 10px Nunito;color:#fff;white-space:nowrap">${TX({ az: 'Mənim Evim', en: 'My Home', ru: 'Мой Дом' })}</div>
    </div>

    <div class="press" onclick="EQ.go('details')" style="position:absolute;left:172px;top:552px;display:flex;flex-direction:column;align-items:center">
      <div style="background:#FFF7EA;border-radius:14px;padding:5px 11px;box-shadow:0 4px 0 rgba(20,10,40,0.25);font:800 14px 'Baloo 2', system-ui;color:#FF5D73">!</div>
      ${EQC.hero(s.hero, 'width:68px;margin-top:2px')}
    </div>
    <div class="press" onclick="EQ.questyChirp()" style="position:absolute;left:302px;top:618px;width:52px">${EQC.questy('happy', 'width:52px', s.questyFur, s.questyFurDark)}</div>

    ${EQC.hud(s, 'position:absolute;top:60px;left:0;right:0')}

    <div style="position:absolute;top:130px;left:14px;right:14px;display:flex;align-items:center;gap:8px">
      <div class="press" onclick="EQ.go('awards')" style="height:34px;padding:0 12px 0 8px;border-radius:17px;background:rgba(30,21,54,0.86);box-shadow:0 0 0 1.5px rgba(255,255,255,0.12) inset;display:flex;align-items:center;gap:6px">
        ${EQC.flame(18)}
        <span style="font:800 13px 'Baloo 2', system-ui;color:#fff">${s.streak}</span>
      </div>
      <div style="flex:1"></div>
      <div class="press" onclick="EQ.cycleLang()" style="height:34px;padding:0 11px 0 9px;border-radius:17px;background:rgba(30,21,54,0.86);box-shadow:0 0 0 1.5px rgba(255,255,255,0.12) inset;display:flex;align-items:center;gap:6px">
        <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6" fill="none" stroke="#fff" stroke-width="2"></circle><path d="M3.4 12 h17.2 M12 3.4 q4 8.6 0 17.2 q-4-8.6 0-17.2" stroke="#fff" stroke-width="2" fill="none"></path></svg>
        <span style="font:800 12px Nunito;color:#fff;letter-spacing:0.5px">${UPC(EQI.lang)}</span>
      </div>
      <div class="press" onclick="EQ.go('parent_gate')" style="width:34px;height:34px;border-radius:17px;background:rgba(30,21,54,0.86);box-shadow:0 0 0 1.5px rgba(255,255,255,0.12) inset;display:flex;align-items:center;justify-content:center"><svg width="17" height="17" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.4" fill="none" stroke="#fff" stroke-width="2"></circle><path d="M12 3.6 v3 M12 17.4 v3 M3.6 12 h3 M17.4 12 h3 M6.2 6.2 l2.1 2.1 M15.7 15.7 l2.1 2.1 M17.8 6.2 l-2.1 2.1 M8.3 15.7 l-2.1 2.1" stroke="#fff" stroke-width="2" stroke-linecap="round"></path></svg></div>
    </div>

    <div class="press" onclick="${cardAction}" style="position:absolute;left:14px;right:14px;bottom:104px;height:80px;border-radius:28px;background:#FFF7EA;box-shadow:0 6px 0 #E0C79A, 0 18px 30px -12px rgba(20,10,40,0.55);display:flex;align-items:center;gap:12px;padding:0 14px">
      <div style="width:54px;height:54px;border-radius:20px;background:#FBE9CC;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;flex:none">${EQC.questy(cardMood, 'width:50px', s.questyFur, s.questyFurDark)}</div>
      <div style="flex:1;min-width:0">
        <div style="font:700 10px Nunito;color:#A08A5E;letter-spacing:1.4px">${cardLabel}</div>
        <div style="font:800 16px 'Baloo 2', system-ui;color:#2A1F45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${cardTitle}</div>
        <div style="display:flex;gap:4px;margin-top:5px">${pips}</div>
      </div>
      <div style="width:58px;height:58px;border-radius:22px;background:#3DBE6E;box-shadow:0 5px 0 #2A9455;display:flex;align-items:center;justify-content:center;flex:none">${EQC.playIcon('#fff', 24)}</div>
    </div>
    ${EQC.nav('world')}
  </div>`;
};

/* 06 · Daily quest */
EQS.meta.quest = { light: true };
EQS.screens.quest = function (s) {
  const set = EQ.qset();
  const done = s.challengesDone;
  const pct = Math.round(done / 5 * 100);
  const doneWord = TX({ az: 'hazır', en: 'done', ru: 'готово' });
  const rows = [];
  for (let i = 0; i < 5; i++) {
    const q = set.questions[i];
    if (i < done) {
      rows.push(`<div style="height:58px;border-radius:20px;background:#EFE4D2;display:flex;align-items:center;gap:12px;padding:0 14px;opacity:0.85">
        <div style="width:44px;height:44px;border-radius:16px;background:#3DBE6E;display:flex;align-items:center;justify-content:center;flex:none">${EQC.check('#fff', 22)}</div>
        <div style="flex:1"><div style="font:800 15px 'Baloo 2';color:#6B5C40">${TX(q.name)}</div><div style="font:700 11px Nunito;color:#9C8C6E">${TX(q.subject)} · ${doneWord}</div></div>
        <div style="font:800 13px 'Baloo 2';color:#9C8C6E">+10 XP</div>
      </div>`);
    } else if (i === done && !s.bossBeaten) {
      rows.push(`<div class="rise" style="border-radius:26px;background:#fff;box-shadow:0 6px 0 #E8D0A8, 0 16px 26px -14px rgba(42,31,69,0.4);padding:14px;display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:52px;height:52px;border-radius:18px;background:#45C6F0;display:flex;align-items:center;justify-content:center;flex:none;box-shadow:0 4px 0 #2196C9"><svg width="26" height="26" viewBox="0 0 24 24"><path d="M5 8 h14 M5 12 h14 M5 16 h8" stroke="#fff" stroke-width="2.6" stroke-linecap="round"></path><circle cx="17.5" cy="16.5" r="3" fill="#fff"></circle></svg></div>
          <div style="flex:1"><div style="font:700 10px Nunito;color:#7A8DA0;letter-spacing:1.2px">${TX({ az: `${UPC(TX(q.subject))} SINAĞI · NÖVBƏTİ`, en: `${UPC(TX(q.subject))} CHALLENGE · NEXT`, ru: `${UPC(TX(q.subject))} · СЛЕДУЮЩЕЕ` })}</div><div style="font:800 18px 'Baloo 2';color:#2A1F45;line-height:1.2">${TX(q.cardTitle || q.name)}</div></div>
        </div>
        <div style="font:700 13.5px Nunito;color:#5C4E7E;line-height:1.45">${q.cardStory ? TX(q.cardStory) : TX({ az: 'Questy qarşıdakı cığırda gözləyir.', en: 'Questy is waiting on the path ahead.', ru: 'Квести ждёт на тропинке впереди.' })}</div>
        <div class="press" onclick="EQ.startChallenge()" style="height:54px;border-radius:18px;background:#FFC24B;box-shadow:0 5px 0 #E39B1C;display:flex;align-items:center;justify-content:center;gap:8px;font:800 17px 'Baloo 2';color:#4A3208">${TX({ az: 'Sınağı oyna', en: 'Play challenge', ru: 'Начать испытание' })}${EQC.arrowR('#4A3208', 18)}</div>
      </div>`);
    } else if (!s.bossBeaten) {
      rows.push(`<div style="height:52px;border-radius:18px;background:rgba(42,31,69,0.07);display:flex;align-items:center;gap:10px;padding:0 14px">
        <div style="width:36px;height:36px;border-radius:13px;background:rgba(42,31,69,0.14);display:flex;align-items:center;justify-content:center;flex:none">${EQC.lock('#8878A8', 17)}</div>
        <div style="flex:1"><div style="font:800 14px 'Baloo 2';color:#8878A8">${TX(q.name)}</div><div style="font:700 10.5px Nunito;color:#A197BC">${TX(q.subject)} · ${TX({ az: 'növbəti açılır', en: 'unlocks next', ru: 'откроется дальше' })}</div></div>
      </div>`);
    } else {
      rows.push(`<div style="height:58px;border-radius:20px;background:#EFE4D2;display:flex;align-items:center;gap:12px;padding:0 14px;opacity:0.85">
        <div style="width:44px;height:44px;border-radius:16px;background:#3DBE6E;display:flex;align-items:center;justify-content:center;flex:none">${EQC.check('#fff', 22)}</div>
        <div style="flex:1"><div style="font:800 15px 'Baloo 2';color:#6B5C40">${TX(q.name)}</div><div style="font:700 11px Nunito;color:#9C8C6E">${TX(q.subject)} · ${doneWord}</div></div>
        <div style="font:800 13px 'Baloo 2';color:#9C8C6E">+10 XP</div>
      </div>`);
    }
  }
  /* the parent-approved mission sits above the day's five challenges: it is extra
     practice a grown-up asked for, so it is visible first and never blocks the
     adventure. Only the next open one is shown — a stack of cards would turn a
     helpful nudge into a chore list. */
  let missionRow = '';
  const mis = EQT.nextMission(s);
  if (mis) {
    const info = EQT.MISSIONS[mis.t];
    const open = EQT.openMissions(s).length;
    const sub = mis.n > 0
      ? TX({ az: `${mis.n} / ${EQD.MISSION_LEN} sual hazırdır`, en: `${mis.n} of ${EQD.MISSION_LEN} questions done`, ru: `${mis.n} из ${EQD.MISSION_LEN} вопросов готово` })
      : TX(info.detail);
    missionRow = `<div class="press rise" onclick="EQ.startNextMission()" style="border-radius:26px;background:#2C1F52;box-shadow:0 6px 0 #1C1338, 0 16px 26px -14px rgba(42,31,69,0.5);padding:14px;display:flex;align-items:center;gap:12px">
      <div style="width:52px;height:52px;border-radius:18px;background:rgba(255,194,75,0.2);display:flex;align-items:center;justify-content:center;flex:none"><svg width="30" height="30" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#FFC24B"></circle><path d="M50 50 L50 6 A44 44 0 0 1 94 50 Z" fill="#FF8A4C"></path><path d="M50 6 V94 M6 50 H94" stroke="#FFF7EA" stroke-width="5"></path></svg></div>
      <div style="flex:1">
        <div style="font:700 10px Nunito;color:#FFD98A;letter-spacing:1.2px">${TX({ az: 'VALİDEYNDƏN XÜSUSİ MİSSİYA', en: 'SPECIAL MISSION FROM A GROWN-UP', ru: 'ОСОБАЯ МИССИЯ ОТ ВЗРОСЛОГО' })}${open > 1 ? ` · ${open}` : ''}</div>
        <div style="font:800 18px 'Baloo 2';color:#fff;line-height:1.2">${TX(info.name)}</div>
        <div style="font:700 11.5px Nunito;color:#C9BCEF;margin-top:3px">${sub}</div>
      </div>
      <div style="width:44px;height:44px;border-radius:16px;background:#FFC24B;box-shadow:0 4px 0 #E39B1C;display:flex;align-items:center;justify-content:center;flex:none">${EQC.playIcon('#4A3208', 18)}</div>
    </div>`;
  }

  let bossRow = '';
  if (done >= 5 && !s.bossBeaten) {
    bossRow = `<div class="press rise" onclick="EQ.go('boss')" style="border-radius:26px;background:#2C1F52;box-shadow:0 6px 0 #1C1338;padding:14px;display:flex;align-items:center;gap:12px">
      <div style="width:52px;height:52px;border-radius:18px;background:rgba(255,138,76,0.22);display:flex;align-items:center;justify-content:center;flex:none">${EQC.trophy('#FF8A4C', 26)}</div>
      <div style="flex:1"><div style="font:700 10px Nunito;color:#FFB08A;letter-spacing:1.2px">${EQ.chapter().final ? TX({ az: 'FƏSLİN FİNALI · HAZIRDIR', en: 'CHAPTER FINALE · READY', ru: 'ФИНАЛ ГЛАВЫ · ГОТОВ' }) : TX({ az: 'BOSS · HAZIRDIR', en: 'BOSS · READY', ru: 'БОСС · ГОТОВ' })}</div><div style="font:800 18px 'Baloo 2';color:#fff;line-height:1.2">${TX(EQ.boss().awaits)}</div></div>
      <div style="width:44px;height:44px;border-radius:16px;background:#FF8A4C;box-shadow:0 4px 0 #E06327;display:flex;align-items:center;justify-content:center;flex:none">${EQC.playIcon('#fff', 18)}</div>
    </div>`;
  } else if (s.bossBeaten) {
    bossRow = s.chestReady && !s.chestOpened
      ? `<div class="press rise" onclick="EQ.go('chest')" style="border-radius:26px;background:#2C1F52;padding:14px;display:flex;align-items:center;gap:12px">
          <div style="width:52px;height:52px;border-radius:18px;background:rgba(255,194,75,0.2);display:flex;align-items:center;justify-content:center;flex:none"><svg width="28" height="28" viewBox="0 0 40 40"><path d="M6 16 h28 v16 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2-2 Z" fill="#C9762F"></path><path d="M6 16 q14-9 28 0 v6 H6 Z" fill="#E0A365"></path><rect x="17" y="18" width="6" height="12" rx="2" fill="#FFC24B"></rect></svg></div>
          <div style="flex:1"><div style="font:700 10px Nunito;color:#FFD98A;letter-spacing:1.2px">${TX({ az: 'TAPŞIRIQ TAMAMLANDI', en: 'QUEST COMPLETE', ru: 'ЗАДАНИЕ ВЫПОЛНЕНО' })}</div><div style="font:800 18px 'Baloo 2';color:#fff;line-height:1.2">${TX({ az: 'Sandığın səni gözləyir', en: 'Your chest is waiting', ru: 'Твой сундук ждёт' })}</div></div>
          ${EQC.arrowR('#FFD98A', 20)}
        </div>`
      : `<div class="press rise" onclick="EQ.nextStage()" style="border-radius:26px;background:#2C1F52;box-shadow:0 6px 0 #1C1338;padding:14px;display:flex;align-items:center;gap:12px">
          <div style="width:52px;height:52px;border-radius:18px;background:rgba(255,255,255,0.12);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;flex:none">${EQC.questy('celebrating', 'width:46px', s.questyFur, s.questyFurDark)}</div>
          <div style="flex:1"><div style="font:700 10px Nunito;color:#7FE0AE;letter-spacing:1.2px">${TX({ az: 'MƏRHƏLƏ TAMAMLANDI', en: 'STAGE COMPLETE', ru: 'ЭТАП ПРОЙДЕН' })}</div><div style="font:800 18px 'Baloo 2';color:#fff;line-height:1.2">${TX({ az: 'Yeni macəraya başla', en: 'Start a new adventure', ru: 'Начни новое приключение' })}</div></div>
          <div style="width:44px;height:44px;border-radius:16px;background:#5CE39B;box-shadow:0 4px 0 #2FA76D;display:flex;align-items:center;justify-content:center;flex:none">${EQC.playIcon('#0B3D25', 18)}</div>
        </div>`;
  }
  return `<div class="scr vscroll" style="background:#FFF7EA">
    <div style="position:absolute;top:0;left:0;right:0;height:306px;background:#2C1F52;border-radius:0 0 40px 40px;overflow:hidden">
      <div style="position:absolute;width:340px;height:340px;border-radius:50%;background:rgba(123,92,255,0.35);left:-40px;top:-90px"></div>
      <div style="position:absolute;right:18px;bottom:0;width:150px;height:190px">
        <svg width="150" height="190" viewBox="0 0 150 190"><path d="M28 190 V60 a47 47 0 0 1 94 0 v130 Z" fill="#4A3A7A"></path><path d="M40 190 V62 a35 35 0 0 1 70 0 v128 Z" fill="#3A2C63"></path><path d="M75 96 l4 9 9 4 -9 4 -4 9 -4-9 -9-4 9-4 Z" fill="#FFC24B" opacity="0.9"></path><path d="M36 190 V150 h78 v40 Z" fill="#5B4A8E"></path></svg>
      </div>
      <div style="position:absolute;top:62px;left:20px;display:flex;align-items:center;gap:12px">
        <div class="press" onclick="EQ.go('map')" style="width:42px;height:42px;border-radius:15px;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center">${EQC.chevL('#fff', 19)}</div>
        <div><div style="font:700 10px Nunito;color:#A896E0;letter-spacing:1.6px">${TX({ az: `SERİYANIN ${s.streak}-Cİ GÜNÜ`, en: `DAY ${s.streak} OF YOUR STREAK`, ru: `ДЕНЬ ${s.streak} ТВОЕЙ СЕРИИ` })}</div><div style="font:800 24px 'Baloo 2', system-ui;color:#fff;line-height:1.2">${TX({ az: 'Bugünkü Macəra', en: "Today's Adventure", ru: 'Приключение Дня' })}</div></div>
      </div>
      <div style="position:absolute;left:20px;bottom:74px;width:210px">
        <div style="font:800 19px 'Baloo 2', system-ui;color:#FFD98A;line-height:1.3">${TX(set.headline)}</div>
        <div style="font:700 13px Nunito;color:#C9BCEF;margin-top:7px;line-height:1.5">${set.progressLine(done)}</div>
      </div>
      <div style="position:absolute;left:20px;bottom:26px;right:150px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><span style="font:800 11px Nunito;color:#fff">${TX({ az: `${done} / 5 sınaq`, en: `${done} / 5 challenges`, ru: `${done} / 5 испытаний` })}</span><span style="font:700 11px Nunito;color:#A896E0">${pct}%</span></div>
        <div style="height:12px;border-radius:6px;background:rgba(255,255,255,0.16);overflow:hidden"><div style="width:${pct}%;height:100%;border-radius:6px;background:#5CE39B;box-shadow:0 0 12px rgba(92,227,155,0.7)"></div></div>
      </div>
      ${EQC.questy('excited', 'position:absolute;right:112px;bottom:16px;width:84px', s.questyFur, s.questyFurDark)}
    </div>

    <div style="position:absolute;top:320px;left:16px;right:16px;display:flex;gap:10px">
      <div style="flex:1;height:56px;border-radius:18px;background:#FBE9CC;display:flex;align-items:center;justify-content:center;gap:7px"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 2.6 l2.6 6.4 6.8 0.6 -5.2 4.6 1.6 6.8 -5.8-3.6 -5.8 3.6 1.6-6.8 -5.2-4.6 6.8-0.6 Z" fill="#5CE39B"></path></svg><div><div style="font:800 15px 'Baloo 2';color:#2A1F45">+50</div><div style="font:700 9px Nunito;color:#8B7A55;letter-spacing:0.6px">XP</div></div></div>
      <div style="flex:1;height:56px;border-radius:18px;background:#FBE9CC;display:flex;align-items:center;justify-content:center;gap:7px">${EQC.coin(22)}<div><div style="font:800 15px 'Baloo 2';color:#2A1F45">+20</div><div style="font:700 9px Nunito;color:#8B7A55;letter-spacing:0.6px">${TX({ az: 'SİKKƏ', en: 'COINS', ru: 'МОНЕТЫ' })}</div></div></div>
      <div style="flex:1;height:56px;border-radius:18px;background:#FBE9CC;display:flex;align-items:center;justify-content:center;gap:7px"><svg width="24" height="24" viewBox="0 0 40 40"><path d="M6 16 h28 v16 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2-2 Z" fill="#C9762F"></path><path d="M6 16 q14-9 28 0 v6 H6 Z" fill="#E0A365"></path><rect x="17" y="18" width="6" height="12" rx="2" fill="#FFC24B"></rect></svg><div><div style="font:800 15px 'Baloo 2';color:#2A1F45">${TX({ az: 'Sandıq', en: 'Chest', ru: 'Сундук' })}</div><div style="font:700 9px Nunito;color:#8B7A55;letter-spacing:0.6px">${TX({ az: '5/5 OLANDA', en: 'AT 5/5', ru: 'ПРИ 5/5' })}</div></div></div>
    </div>

    <div style="position:absolute;top:384px;left:16px;right:16px;bottom:110px;display:flex;flex-direction:column;gap:8px" class="vscroll">
      ${missionRow}
      ${rows.join('')}
      ${bossRow}
    </div>
    ${EQC.nav('quests')}
  </div>`;
};


/* 06b · Parent-approved mission —
   the other end of the promise screen 26 makes to a grown-up. This is the mission's own
   small world: who sent it, what it practises, how far through it the child is, and the
   one button that plays the next question. It deliberately borrows nothing from the boss
   ladder — a mission has no fight at the end, only the eight questions and a thank-you. */
EQS.meta.mission = { light: false };
EQS.screens.mission = function (s) {
  const m = EQ.missionEntry();
  /* the mission finished on the last answer: this screen is then its closing beat */
  if (!m) {
    const last = (s.parentQuests || []).filter(x => x.done).slice(-1)[0];
    const nm = last && EQT.MISSIONS[last.t] ? TX(EQT.MISSIONS[last.t].name) : TX({ az: 'Missiya', en: 'Mission', ru: 'Миссия' });
    const more = EQT.nextMission(s);
    return `<div class="scr" style="background:#2C1F52">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 30%, rgba(123,92,255,0.5), transparent 62%)"></div>
      <div class="spark" style="top:150px;left:54px;font-size:22px">✦</div>
      <div class="spark" style="top:196px;right:58px;font-size:16px;animation-delay:.5s">✦</div>
      <div style="position:absolute;top:150px;left:24px;right:24px;text-align:center">
        <div style="font:700 11px Nunito;color:#A896E0;letter-spacing:1.6px">${TX({ az: 'MİSSİYA TAMAMLANDI', en: 'MISSION COMPLETE', ru: 'МИССИЯ ВЫПОЛНЕНА' })}</div>
        <div class="pop" style="font:800 32px 'Baloo 2', system-ui;color:#fff;line-height:1.15;margin-top:10px">${nm}</div>
      </div>
      <div style="position:absolute;top:300px;left:0;right:0;display:flex;justify-content:center">${EQC.questy('celebrating', 'width:150px', s.questyFur, s.questyFurDark)}</div>
      <div style="position:absolute;top:472px;left:24px;right:24px;border-radius:26px;background:rgba(255,255,255,0.10);padding:18px;text-align:center">
        <div style="font:700 14px Nunito;color:#E6DEFF;line-height:1.6">${TX({
          az: `Bütün ${EQD.MISSION_LEN} sual bitdi. Səni bu missiyaya göndərən böyüyün bunu görəcək.`,
          en: `All ${EQD.MISSION_LEN} questions done. The grown-up who sent this mission will see it.`,
          ru: `Все ${EQD.MISSION_LEN} вопросов пройдены. Взрослый, отправивший эту миссию, это увидит.`
        })}</div>
        <div style="display:flex;justify-content:center;gap:10px;margin-top:14px">
          <div style="padding:8px 14px;border-radius:16px;background:rgba(255,194,75,0.2);font:800 15px 'Baloo 2';color:#FFD98A">${TX({ az: '+40 sikkə bonus', en: '+40 coin bonus', ru: '+40 монет бонус' })}</div>
        </div>
      </div>
      <div class="press" onclick="EQ.leaveMission()" style="position:absolute;bottom:52px;left:24px;right:24px;height:66px;border-radius:24px;background:#5CE39B;box-shadow:0 6px 0 #2FA76D;display:flex;align-items:center;justify-content:center;gap:10px;font:800 20px 'Baloo 2', system-ui;color:#0B3D25">${more ? TX({ az: 'Tapşırıqlara qayıt', en: 'Back to your quests', ru: 'Назад к заданиям' }) : TX({ az: 'Macəraya qayıt', en: 'Back to the adventure', ru: 'Назад к приключению' })}${EQC.arrowR('#0B3D25', 20)}</div>
    </div>`;
  }

  const info = EQT.MISSIONS[m.t];
  const topic = EQT.TOPICS[m.t];
  const subj = EQT.SUBJECTS[topic.subj];
  const pct = Math.round(m.n / EQD.MISSION_LEN * 100);
  const started = m.n > 0;
  const pips = [];
  for (let i = 0; i < EQD.MISSION_LEN; i++) {
    pips.push(`<div style="flex:1;height:10px;border-radius:5px;background:${i < m.n ? '#5CE39B' : 'rgba(255,255,255,0.18)'}"></div>`);
  }

  return `<div class="scr" style="background:#2C1F52">
    <div style="position:absolute;top:0;left:0;right:0;height:300px;overflow:hidden">
      <div style="position:absolute;width:340px;height:340px;border-radius:50%;background:rgba(123,92,255,0.34);left:-60px;top:-110px"></div>
      <div style="position:absolute;width:220px;height:220px;border-radius:50%;background:rgba(255,194,75,0.14);right:-50px;top:40px"></div>
    </div>
    <div style="position:absolute;top:62px;left:20px;right:20px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.leaveMission()" style="width:42px;height:42px;border-radius:15px;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#fff', 19)}</div>
      <div><div style="font:700 10px Nunito;color:#A896E0;letter-spacing:1.6px">${TX({ az: 'VALİDEYNDƏN XÜSUSİ MİSSİYA', en: 'SPECIAL MISSION FROM A GROWN-UP', ru: 'ОСОБАЯ МИССИЯ ОТ ВЗРОСЛОГО' })}</div><div style="font:800 22px 'Baloo 2', system-ui;color:#fff;line-height:1.2">${TX(info.name)}</div></div>
    </div>

    <div style="position:absolute;top:158px;left:20px;right:20px;display:flex;gap:14px;align-items:flex-end">
      ${EQC.questy('excited', 'width:92px;flex:none', s.questyFur, s.questyFurDark)}
      <div style="flex:1;background:rgba(255,255,255,0.10);border-radius:24px;border-bottom-left-radius:8px;padding:15px 17px">
        <div style="font:700 14px Nunito;color:#fff;line-height:1.55">${started
          ? TX({ az: `Qaldığın yerdən davam edirik — ${EQD.MISSION_LEN - m.n} sual qalıb.`, en: `We pick up where you left off — ${EQD.MISSION_LEN - m.n} question${EQD.MISSION_LEN - m.n === 1 ? '' : 's'} to go.`, ru: `Продолжаем с того места, где остановились — осталось ${EQD.MISSION_LEN - m.n} ${RUP(EQD.MISSION_LEN - m.n, 'вопрос', 'вопроса', 'вопросов')}.` })
          : TX({ az: 'Bunu sənin üçün böyüyün seçdi. Birlikdə məşq edək!', en: 'A grown-up picked this one just for you. Let’s practise together!', ru: 'Взрослый выбрал это специально для тебя. Потренируемся вместе!' })}</div>
      </div>
    </div>

    <div style="position:absolute;top:304px;left:20px;right:20px;border-radius:28px;background:rgba(255,255,255,0.08);padding:18px">
      <div style="display:flex;gap:14px;align-items:center">
        <div style="width:58px;height:58px;border-radius:20px;background:${subj.bg};display:flex;align-items:center;justify-content:center;flex:none;font:800 26px 'Baloo 2';color:${subj.fg}">${TX(subj.letter)}</div>
        <div style="flex:1">
          <div style="font:700 10px Nunito;color:#A896E0;letter-spacing:1.2px">${UPC(TX(subj.name))} · ${UPC(TX(topic.name))}</div>
          <div style="font:700 13.5px Nunito;color:#E6DEFF;margin-top:5px;line-height:1.5">${TX(info.detail)}</div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin:16px 0 8px">
        <span style="font:800 11px Nunito;color:#fff">${TX({ az: `${m.n} / ${EQD.MISSION_LEN} sual`, en: `${m.n} / ${EQD.MISSION_LEN} questions`, ru: `${m.n} / ${EQD.MISSION_LEN} вопросов` })}</span>
        <span style="font:700 11px Nunito;color:#A896E0">${pct}%</span>
      </div>
      <div style="display:flex;gap:5px">${pips.join('')}</div>
    </div>

    <div style="position:absolute;top:498px;left:20px;right:20px;display:flex;gap:12px">
      <div style="flex:1;height:64px;border-radius:20px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;gap:8px"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2.6 l2.6 6.4 6.8 0.6 -5.2 4.6 1.6 6.8 -5.8-3.6 -5.8 3.6 1.6-6.8 -5.2-4.6 6.8-0.6 Z" fill="#5CE39B"></path></svg><div><div style="font:800 15px 'Baloo 2';color:#fff">+25</div><div style="font:700 9px Nunito;color:#A896E0;letter-spacing:0.6px">${TX({ az: 'HƏR SUAL', en: 'EACH', ru: 'ЗА ВОПРОС' })}</div></div></div>
      <div style="flex:1;height:64px;border-radius:20px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;gap:8px">${EQC.coin(20)}<div><div style="font:800 15px 'Baloo 2';color:#fff">+40</div><div style="font:700 9px Nunito;color:#A896E0;letter-spacing:0.6px">${TX({ az: 'SONDA', en: 'AT THE END', ru: 'В КОНЦЕ' })}</div></div></div>
    </div>

    <div class="press rise" onclick="EQ.startMissionQuestion()" style="position:absolute;bottom:52px;left:20px;right:20px;height:70px;border-radius:24px;background:#FFC24B;box-shadow:0 6px 0 #E39B1C, 0 16px 26px -12px rgba(227,155,28,0.6);display:flex;align-items:center;justify-content:center;gap:10px;font:800 21px 'Baloo 2', system-ui;color:#4A3208">${started ? TX({ az: 'Davam et', en: 'Keep going', ru: 'Продолжить' }) : TX({ az: 'Missiyaya başla', en: 'Start the mission', ru: 'Начать миссию' })}${EQC.arrowR('#4A3208', 20)}</div>
  </div>`;
};

/* 07 · Quest details / story */
EQS.meta.details = { light: true };
EQS.screens.details = function (s) {
  const done = s.challengesDone;
  const cp = EQ.chapter();
  /* The three rows are the chapter's three stages. Stages before this one are
     already behind the child (the chapter advances only when a stage is cleared),
     the current stage shows its live 5-challenges → boss progress, and later
     stages stay locked with their beat named so the chapter reads as a whole. */
  const stageRows = cp.ch.beats.map((beat, i) => {
    const no = i + 1;
    const isFinal = no === cp.stages;
    const tail = isFinal
      ? TX({ az: 'Fəslin finalı', en: 'Chapter finale', ru: 'Финал главы' })
      : TX({ az: 'Boss', en: 'Boss', ru: 'Босс' });
    if (no < cp.stageNo || (no === cp.stageNo && s.bossBeaten)) {
      return `<div style="display:flex;align-items:center;gap:12px;height:50px;border-radius:18px;background:#EFE4D2;padding:0 14px">
        <div style="width:34px;height:34px;border-radius:12px;background:#3DBE6E;display:flex;align-items:center;justify-content:center;flex:none">${EQC.check('#fff', 17)}</div>
        <div style="flex:1;font:800 14px 'Baloo 2';color:#6B5C40">${no} · ${TX(beat)}</div>
        <div style="font:700 11px Nunito;color:#9C8C6E">${TX({ az: 'Hazır', en: 'Done', ru: 'Готово' })}</div>
      </div>`;
    }
    if (no > cp.stageNo) {
      return `<div style="display:flex;align-items:center;gap:12px;height:50px;border-radius:18px;background:rgba(42,31,69,0.07);padding:0 14px">
        <div style="width:34px;height:34px;border-radius:12px;background:rgba(42,31,69,0.14);display:flex;align-items:center;justify-content:center;flex:none">${EQC.lock('#8878A8', 16)}</div>
        <div style="flex:1;font:800 14px 'Baloo 2';color:#8878A8">${no} · ${TX(beat)}</div>
        <div style="font:700 11px Nunito;color:#A197BC">${isFinal ? tail : ''}</div>
      </div>`;
    }
    /* the stage being played right now */
    if (done < 5) {
      return `<div class="press" onclick="EQ.startChallenge()" style="display:flex;align-items:center;gap:12px;height:58px;border-radius:20px;background:#fff;padding:0 14px;box-shadow:0 5px 0 #E8D0A8, 0 0 0 2.5px #FFC24B inset">
        <div style="width:38px;height:38px;border-radius:14px;background:#FFC24B;display:flex;align-items:center;justify-content:center;flex:none;font:800 16px 'Baloo 2';color:#4A3208">${no}</div>
        <div style="flex:1"><div style="font:800 15px 'Baloo 2';color:#2A1F45">${TX(beat)}</div><div style="font:700 10.5px Nunito;color:#8B7A55">${TX({ az: `${5 - done} sınaq · riyaziyyat və məntiq`, en: `${5 - done} challenge${5 - done === 1 ? '' : 's'} · math &amp; logic`, ru: `${5 - done} ${RUP(5 - done, 'испытание', 'испытания', 'испытаний')} · математика и логика` })}</div></div>
        <div style="width:36px;height:36px;border-radius:14px;background:#3DBE6E;box-shadow:0 3px 0 #2A9455;display:flex;align-items:center;justify-content:center;flex:none">${EQC.playIcon('#fff', 16)}</div>
      </div>`;
    }
    /* five challenges cleared — the stage's boss is what is left */
    const bc = isFinal ? '#9B7CFF' : '#FF8A4C';
    return `<div class="press" onclick="EQ.go('boss')" style="display:flex;align-items:center;gap:12px;height:58px;border-radius:20px;background:#fff;padding:0 14px;box-shadow:0 5px 0 #E8D0A8, 0 0 0 2.5px ${bc} inset">
      <div style="width:38px;height:38px;border-radius:14px;background:${bc};display:flex;align-items:center;justify-content:center;flex:none;font:800 16px 'Baloo 2';color:#fff">${no}</div>
      <div style="flex:1"><div style="font:800 15px 'Baloo 2';color:#2A1F45">${TX(cp.boss.awaits)}</div><div style="font:700 10.5px Nunito;color:#8B7A55">${tail} · ${TX({ az: `${cp.boss.hits} zərbə · taymer yoxdur`, en: `${cp.boss.hits} hits · no timer`, ru: `${cp.boss.hits} ${RUP(cp.boss.hits, 'удар', 'удара', 'ударов')} · без таймера` })}</div></div>
      <div style="width:36px;height:36px;border-radius:14px;background:#3DBE6E;box-shadow:0 3px 0 #2A9455;display:flex;align-items:center;justify-content:center;flex:none">${EQC.playIcon('#fff', 16)}</div>
    </div>`;
  }).join('');
  return `<div class="scr" style="background:#FFF7EA">
    <div style="position:absolute;top:0;left:0;right:0;height:370px;overflow:hidden;border-radius:0 0 44px 44px">
      <svg viewBox="0 0 402 400" width="402" height="400" style="position:absolute;inset:0"><rect width="402" height="400" fill="#1E3527"></rect><path d="M0 400 V300 q60-40 120-10 q70 34 130-6 q70-46 152 6 v110 Z" fill="#16281C"></path><g fill="#0E1A12"><path d="M20 400 V240 l26-40 26 40 v160 Z"></path><path d="M330 400 V214 l30-46 30 46 v186 Z"></path><path d="M110 400 V270 l22-34 22 34 v130 Z"></path></g><circle cx="201" cy="176" r="78" fill="#7B5CFF" opacity="0.28"></circle><circle cx="201" cy="176" r="46" fill="#9B7CFF" opacity="0.34"></circle><g fill="#FFF7EA" opacity="0.85"><circle cx="70" cy="120" r="2.4"></circle><circle cx="330" cy="90" r="2"></circle><circle cx="140" cy="70" r="1.8"></circle><circle cx="270" cy="140" r="2.2"></circle></g></svg>
      <div class="press" onclick="EQ.go('map')" style="position:absolute;top:66px;left:20px;width:42px;height:42px;border-radius:15px;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center">${EQC.chevL('#fff', 19)}</div>
      <div class="float" style="position:absolute;top:150px;left:0;right:0;display:flex;justify-content:center"><svg width="88" height="88" viewBox="0 0 60 60"><path d="M30 4 L46 22 L38 52 H22 L14 22 Z" fill="#9B7CFF" opacity="0.9"></path><path d="M30 4 L46 22 L30 30 Z" fill="#C8B4FF"></path><path d="M30 30 L38 52 H22 Z" fill="#7B5CFF"></path></svg></div>
      <div style="position:absolute;bottom:34px;left:24px;right:24px">
        <div style="display:inline-flex;padding:5px 11px;border-radius:11px;background:rgba(92,227,155,0.22);font:800 10px Nunito;color:#7FE0AE;letter-spacing:1.4px">${TX({ az: `${TX(cp.ch.region)} · FƏSİL ${cp.chapterNo} · MƏRHƏLƏ ${cp.stageNo} / ${cp.stages}`, en: `${TX(cp.ch.region)} · CHAPTER ${cp.chapterNo} · STAGE ${cp.stageNo} OF ${cp.stages}`, ru: `${TX(cp.ch.region)} · ГЛАВА ${cp.chapterNo} · ЭТАП ${cp.stageNo} ИЗ ${cp.stages}` })}</div>
        <div style="font:800 30px 'Baloo 2', system-ui;color:#FFF7EA;line-height:1.15;margin-top:12px">${TX(cp.ch.title)}</div>
      </div>
    </div>

    <div style="position:absolute;top:390px;left:16px;right:16px;display:flex;gap:12px;align-items:flex-start">
      <div style="width:64px;height:64px;border-radius:22px;background:#FBE9CC;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;flex:none">${EQC.questy('thinking', 'width:58px', s.questyFur, s.questyFurDark)}</div>
      <div style="flex:1;background:#fff;border-radius:22px;border-bottom-left-radius:8px;padding:14px 16px;box-shadow:0 4px 0 #E8D0A8">
        <div style="font:700 14.5px Nunito;color:#3E3160;line-height:1.55">${TX(cp.ch.hook)}</div>
      </div>
    </div>

    <div style="position:absolute;top:496px;left:16px;right:16px;border-radius:24px;background:#2C1F52;padding:14px 18px">
      <div style="font:700 10px Nunito;color:#A896E0;letter-spacing:1.6px">${TX({ az: 'SƏNİN MİSSİYAN', en: 'YOUR MISSION', ru: 'ТВОЯ МИССИЯ' })}</div>
      <div style="font:800 19px 'Baloo 2', system-ui;color:#fff;margin-top:6px;line-height:1.25">${TX(cp.ch.mission)}</div>
    </div>

    <div style="position:absolute;top:584px;left:16px;right:16px;display:flex;flex-direction:column;gap:8px">
      ${stageRows}
    </div>

    <div class="press" onclick="EQ.go('story')" style="position:absolute;bottom:36px;left:16px;right:16px;height:64px;border-radius:24px;background:#7B5CFF;box-shadow:0 6px 0 #5B3FD6, 0 16px 26px -12px rgba(91,63,214,0.6);display:flex;align-items:center;justify-content:center;gap:10px;font:800 21px 'Baloo 2', system-ui;color:#fff">${TX({ az: `Fəsil ${cp.chapterNo}-yə davam et`, en: `Continue chapter ${cp.chapterNo}`, ru: `Продолжить главу ${cp.chapterNo}` })}${EQC.arrowR('#fff', 20)}</div>
  </div>`;
};

/* 20 · Story chapter */
EQS.meta.story = { light: true };
EQS.screens.story = function (s) {
  const cp = EQ.chapter();
  const cta = s.bossBeaten
    ? `<div class="press" onclick="EQ.go('map')" style="position:absolute;bottom:44px;left:16px;right:16px;height:66px;border-radius:22px;background:#3DBE6E;box-shadow:0 6px 0 #2A9455;display:flex;align-items:center;justify-content:center;gap:10px;font:800 20px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Xəritəyə qayıt', en: 'Back to the map', ru: 'Назад к карте' })}${EQC.arrowR('#fff', 20)}</div>`
    : `<div class="press" onclick="EQ.continueQuest()" style="position:absolute;bottom:44px;left:16px;right:16px;height:66px;border-radius:22px;background:#3DBE6E;box-shadow:0 6px 0 #2A9455;display:flex;align-items:center;justify-content:center;gap:10px;font:800 20px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Ləpirlərin izi ilə get', en: 'Follow the footprints', ru: 'Иди по следам' })}${EQC.arrowR('#fff', 20)}</div>`;
  return `<div class="scr" style="background:#16281C">
    <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;justify-content:space-between">
      <div style="padding:6px 12px;border-radius:12px;background:rgba(255,255,255,0.10);font:800 11px Nunito;color:#7FE0AE;letter-spacing:1.4px">${TX({ az: `FƏSİL ${cp.chapterNo} · ${TX(cp.ch.name).toUpperCase()}`, en: `CHAPTER ${cp.chapterNo} · ${TX(cp.ch.name).toUpperCase()}`, ru: `ГЛАВА ${cp.chapterNo} · ${TX(cp.ch.name).toUpperCase()}` })}</div>
      <div class="press" onclick="EQ.continueQuest()" style="font:800 12px Nunito;color:#7E9E88;padding:6px 8px">${TX({ az: 'Ötür', en: 'Skip', ru: 'Пропустить' })}</div>
    </div>
    <div class="rise" style="position:absolute;top:116px;left:16px;right:16px;height:210px;border-radius:26px;overflow:hidden;box-shadow:0 6px 0 rgba(0,0,0,0.35)">
      <svg viewBox="0 0 370 210" width="100%" height="210"><rect width="370" height="210" fill="#1E3527"></rect><path d="M0 210 V150 q60-28 120-6 q70 26 130-4 q60-26 120 8 v62 Z" fill="#16281C"></path><g fill="#0E1A12"><path d="M30 210 V120 l20-30 20 30 v90 Z"></path><path d="M300 210 V100 l24-34 24 34 v110 Z"></path></g><ellipse cx="185" cy="150" rx="44" ry="12" fill="#2C4A34"></ellipse><rect x="170" y="108" width="30" height="44" rx="6" fill="#3E5C46"></rect><path d="M164 108 h42 v8 h-42 Z" fill="#54754F"></path><g fill="#FFF7EA" opacity="0.8"><circle cx="80" cy="40" r="2"></circle><circle cx="280" cy="30" r="1.6"></circle><circle cx="200" cy="52" r="1.8"></circle></g></svg>
      <div style="position:absolute;left:14px;bottom:12px;font:800 15px 'Baloo 2';color:#FFF7EA">${TX({ az: 'Postament boşdur.', en: 'The pedestal is empty.', ru: 'Пьедестал пуст.' })}</div>
    </div>
    <div style="position:absolute;top:346px;left:16px;right:16px;display:flex;gap:12px;align-items:flex-start">
      <div style="width:70px;height:70px;border-radius:24px;background:rgba(255,255,255,0.10);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;flex:none">${EQC.questy('confused', 'width:64px', s.questyFur, s.questyFurDark)}</div>
      <div style="flex:1;background:#FFF7EA;border-radius:24px;border-bottom-left-radius:8px;padding:16px;box-shadow:0 5px 0 rgba(0,0,0,0.3)"><div style="font:700 15px Nunito;color:#3E3160;line-height:1.55">${TX({ az: '«Dünən gecə buradaydı, söz verirəm! Onsuz ağaclar susub qalıb…»', en: '"It was here last night, I promise! The trees have gone quiet without it…"', ru: '«Он был здесь вчера вечером, честное слово! Без него деревья притихли…»' })}</div></div>
    </div>
    <div class="rise" style="position:absolute;top:470px;left:16px;right:16px;height:170px;border-radius:26px;overflow:hidden;box-shadow:0 6px 0 rgba(0,0,0,0.35);animation-delay:120ms">
      <svg viewBox="0 0 370 170" width="100%" height="170"><rect width="370" height="170" fill="#243D2B"></rect><path d="M0 170 q90-40 180-10 q100 34 190-14 v194 H0 Z" fill="#1A2E20"></path><g fill="#FFC24B" opacity="0.85"><ellipse cx="80" cy="120" rx="9" ry="6" transform="rotate(-16 80 120)"></ellipse><ellipse cx="120" cy="108" rx="9" ry="6" transform="rotate(-16 120 108)"></ellipse><ellipse cx="162" cy="98" rx="9" ry="6" transform="rotate(-16 162 98)"></ellipse><ellipse cx="204" cy="90" rx="9" ry="6" transform="rotate(-16 204 90)"></ellipse></g><path d="M250 90 q30-14 54 6 q-26 4 -54-6 Z" fill="#0E1A12"></path><ellipse cx="316" cy="84" rx="30" ry="24" fill="#0E1A12"></ellipse><circle cx="306" cy="80" r="4" fill="#FF8A4C"></circle><circle cx="322" cy="78" r="4" fill="#FF8A4C"></circle></svg>
      <div style="position:absolute;left:14px;bottom:12px;font:800 15px 'Baloo 2';color:#FFF7EA">${TX({ az: 'Parlayan ləpirlər körpüyə aparır…', en: 'Glowing footprints lead to the bridge…', ru: 'Светящиеся следы ведут к мосту…' })}</div>
    </div>
    <div style="position:absolute;top:656px;left:16px;right:16px;background:rgba(255,255,255,0.08);border-radius:24px;padding:14px">
      <div style="font:700 10px Nunito;color:#7FE0AE;letter-spacing:1.6px">${TX({ az: 'BU FƏSİLDƏ', en: 'THIS CHAPTER', ru: 'В ЭТОЙ ГЛАВЕ' })}</div>
      <div style="font:800 17px 'Baloo 2';color:#fff;margin-top:6px;line-height:1.3">${TX({ az: `${cp.stages} mərhələ · ${cp.stages - 1} keşikçi · 1 fəsil finalı: ${TX(cp.ch.finale.name)}`, en: `${cp.stages} stages · ${cp.stages - 1} guardians · 1 chapter finale: ${TX(cp.ch.finale.name)}`, ru: `${cp.stages} ${RUP(cp.stages, 'этап', 'этапа', 'этапов')} · ${cp.stages - 1} ${RUP(cp.stages - 1, 'страж', 'стража', 'стражей')} · финал главы: ${TX(cp.ch.finale.name)}` })}</div>
    </div>
    ${cta}
    <div style="position:absolute;bottom:26px;left:0;right:0;display:flex;justify-content:center;gap:6px">${Array.from({ length: cp.stages }, (_, i) => `<div style="width:${i === cp.stageNo - 1 ? 24 : 8}px;height:6px;border-radius:3px;background:${i <= cp.stageNo - 1 ? '#5CE39B' : 'rgba(255,255,255,0.25)'}"></div>`).join('')}</div>
  </div>`;
};

/* 19 · World unlock (Science Island) */
EQS.meta.unlock = { light: true };
EQS.screens.unlock = function (s) {
  const ready = s.level >= 10;
  const ctaText = ready
    ? TX({ az: 'Adaya üz', en: 'Sail to the island', ru: 'Плыви к острову' })
    : TX({ az: `Səviyyə 10-da açılır — sən hələ Səviyyə ${s.level}`, en: `Opens at Level 10 — you're Level ${s.level}`, ru: `Откроется на 10-м уровне — у тебя ${s.level}-й` });
  const chirp = ready
    ? TX({ az: 'Səviyyə 10-a çatdın — bərə hazır olanda yola düşürük.', en: 'You reached Level 10 — the ferry is ready when you are.', ru: 'Ты на 10-м уровне — паром готов, когда будешь готов ты.' })
    : TX({ az: 'Səviyyə 10-a çat, bərə dalımızca gələcək. Az qalıb!', en: `Reach Level 10 and the ferry will come for us. You're close!`, ru: 'Дойди до 10-го уровня — и паром приплывёт за нами. Уже близко!' });
  return `<div class="scr" style="background:#0E2A38">
    <div style="position:absolute;inset:0;background:radial-gradient(320px 300px at 50% 30%, rgba(69,198,240,0.45), rgba(14,42,56,0) 72%)"></div>
    <div class="press" onclick="EQ.go('map')" style="position:absolute;top:62px;left:16px;width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;z-index:5">${EQC.xIcon('#fff', 17)}</div>
    <div style="position:absolute;top:150px;left:0;right:0;display:flex;justify-content:center">
      <div style="position:relative;width:250px;height:290px">
        <div style="position:absolute;inset:0;border-radius:125px 125px 30px 30px;background:radial-gradient(circle at 50% 44%, rgba(255,255,255,0.9), rgba(69,198,240,0.7) 42%, rgba(14,42,56,0) 76%)"></div>
        <svg width="250" height="290" viewBox="0 0 250 290" style="position:absolute;inset:0"><path d="M125 40 a86 86 0 0 1 86 86 v150 h-172 V126 a86 86 0 0 1 86-86 Z" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="6"></path><path d="M125 66 a62 62 0 0 1 62 62 v148 h-124 V128 a62 62 0 0 1 62-62 Z" fill="rgba(255,255,255,0.14)"></path></svg>
        <div class="float" style="position:absolute;left:50%;top:120px;transform:translateX(-50%)"><svg width="96" height="96" viewBox="0 0 36 36"><path d="M14 6 h8 v7 l7 14 a3 3 0 0 1 -2.6 4.4 H9.6 A3 3 0 0 1 7 27 l7-14 Z" fill="#EAF7FF"></path><path d="M10.4 22 h15.2 l3 6 a3 3 0 0 1 -2.6 4 H10 a3 3 0 0 1 -2.6-4 Z" fill="#45C6F0"></path><circle cx="15" cy="27" r="2" fill="#EAF7FF"></circle><circle cx="21" cy="29" r="1.6" fill="#EAF7FF"></circle></svg></div>
      </div>
    </div>
    <div style="position:absolute;top:70px;left:0;right:0;text-align:center">
      <div style="font:800 13px Nunito;color:#8FDCF7;letter-spacing:3px">${ready ? TX({ az: 'YENİ DÜNYA AÇILIR', en: 'A NEW WORLD OPENS', ru: 'ОТКРЫВАЕТСЯ НОВЫЙ МИР' }) : TX({ az: 'ZƏHMƏTƏ DƏYƏN DÜNYA', en: 'A WORLD WORTH THE CLIMB', ru: 'МИР, РАДИ КОТОРОГО СТОИТ РАСТИ' })}</div>
    </div>
    <div style="position:absolute;top:474px;left:20px;right:20px;text-align:center">
      <div style="font:800 40px 'Baloo 2', system-ui;color:#fff;line-height:1.1">${TX({ az: 'Elm Adası', en: 'Science Island', ru: 'Остров Науки' })}</div>
      <div style="font:700 15px Nunito;color:#A5DCF0;margin-top:10px;line-height:1.55">${TX({ az: 'Qaynayan iksirlər, maraqlı heyvanlar və yalnız sən tapanda işləyən maşınlar.', en: 'Bubbling potions, curious animals and machines that only work when you figure them out.', ru: 'Бурлящие зелья, любопытные звери и машины, которые работают, только когда ты их разгадаешь.' })}</div>
    </div>
    <div style="position:absolute;top:592px;left:20px;right:20px;display:flex;gap:10px">
      <div style="flex:1;border-radius:20px;background:rgba(255,255,255,0.10);padding:14px 10px;text-align:center"><div style="font:800 16px 'Baloo 2';color:#fff">12</div><div style="font:700 10px Nunito;color:#8FDCF7;letter-spacing:0.8px">${TX({ az: 'TAPŞIRIQ', en: 'QUESTS', ru: 'ЗАДАНИЙ' })}</div></div>
      <div style="flex:1;border-radius:20px;background:rgba(255,255,255,0.10);padding:14px 10px;text-align:center"><div style="font:800 16px 'Baloo 2';color:#fff">${TX({ az: 'Elm', en: 'Science', ru: 'Наука' })}</div><div style="font:700 10px Nunito;color:#8FDCF7;letter-spacing:0.8px">${TX({ az: '+ MƏNTİQ', en: '+ LOGIC', ru: '+ ЛОГИКА' })}</div></div>
      <div style="flex:1;border-radius:20px;background:rgba(255,255,255,0.10);padding:14px 10px;text-align:center"><div style="font:800 16px 'Baloo 2';color:#fff">1</div><div style="font:700 10px Nunito;color:#8FDCF7;letter-spacing:0.8px">${TX({ az: 'YENİ BOSS', en: 'NEW BOSS', ru: 'НОВЫЙ БОСС' })}</div></div>
    </div>
    <div style="position:absolute;bottom:146px;left:20px;right:20px;display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.08);border-radius:22px;padding:12px 16px">
      <div style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;flex:none">${EQC.questy('excited', 'width:40px', s.questyFur, s.questyFurDark)}</div>
      <div style="font:700 13.5px Nunito;color:#CFEFFA;line-height:1.5">${chirp}</div>
    </div>
    <div class="press" onclick="${ready ? `EQ.toast(TX({az:'Bərə növbəti fəsildə yola düşür! ⛵',en:'The ferry sets sail in the next chapter! ⛵',ru:'Паром отплывает в следующей главе! ⛵'}))` : `EQ.toast(TX({az:'Davam et — hər sınaq Səviyyə 10-a doğru XP qazandırır!',en:'Keep questing — every challenge earns XP toward Level 10!',ru:'Продолжай — каждое испытание даёт XP на пути к 10-му уровню!'}))`}" style="position:absolute;bottom:44px;left:20px;right:20px;height:70px;border-radius:24px;background:${ready ? '#45C6F0' : 'rgba(69,198,240,0.5)'};box-shadow:0 6px 0 #2196C9, 0 16px 26px -12px rgba(33,150,201,0.6);display:flex;align-items:center;justify-content:center;gap:10px;font:800 ${ready ? 23 : 18}px 'Baloo 2', system-ui;color:#06303F">${ctaText}${EQC.arrowR('#06303F', 20)}</div>
  </div>`;
};
