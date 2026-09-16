/* EduQuest — collect / decorate / come back (design screens 15, 16, 17, 18) */

/* 15 · Wardrobe */
EQS.meta.wardrobe = { light: true };
EQS.screens.wardrobe = function (s) {
  const cat = EQ.session.wardrobeCat || 'hats';
  const chip = (key, label) => `<div class="press" onclick="EQ.wardrobeCat('${key}')" style="padding:0 14px;height:44px;border-radius:16px;background:${cat === key ? '#7B5CFF' : '#FBE9CC'};box-shadow:0 4px 0 ${cat === key ? '#5B3FD6' : '#E8D0A8'};display:flex;align-items:center;font:800 13px 'Baloo 2';color:${cat === key ? '#fff' : '#7A6438'};flex:none">${label}</div>`;

  const hatIcon = {
    none: `<svg width="34" height="34" viewBox="0 0 36 36"><circle cx="18" cy="18" r="12" fill="none" stroke="#C9BCA6" stroke-width="3" stroke-dasharray="5 6"></circle></svg>`,
    explorer: `<svg width="34" height="34" viewBox="0 0 36 36"><ellipse cx="18" cy="24" rx="16" ry="4" fill="#C98A4B"></ellipse><path d="M8 24 q0-14 10-14 q10 0 10 14 Z" fill="#E0A365"></path><rect x="7" y="20" width="22" height="5" rx="2.5" fill="#7B5CFF"></rect></svg>`,
    wizard: `<svg width="34" height="34" viewBox="0 0 36 36"><ellipse cx="18" cy="26" rx="15" ry="4" fill="#8A6BE0"></ellipse><path d="M18 4 L30 24 H6 Z" fill="#7B5CFF"></path><path d="M18 12 l2.4 5 5 2.4 -5 2 -2.4 5 -2.4-5 -5-2 5-2.4 Z" fill="#FFE9A8"></path></svg>`,
    crown: `<svg width="34" height="34" viewBox="0 0 36 36"><path d="M6 24 L11 8 L18 16 L25 8 L30 24 Z" fill="#FFC24B"></path><circle cx="12" cy="19" r="2" fill="#FF5D73"></circle><circle cx="24" cy="19" r="2" fill="#45C6F0"></circle></svg>`
  };
  const cardOn = 'border-radius:22px;background:#fff;box-shadow:0 5px 0 #E0C79A, 0 0 0 3px #3DBE6E inset;padding:9px 6px;text-align:center;position:relative';
  const cardOff = 'border-radius:22px;background:#fff;box-shadow:0 5px 0 #E0C79A;padding:9px 6px;text-align:center;position:relative';
  const cardLock = 'border-radius:22px;background:rgba(42,31,69,0.06);padding:9px 6px;text-align:center';
  const wearBadge = `<div style="position:absolute;top:-6px;right:-6px;width:26px;height:26px;border-radius:13px;background:#3DBE6E;box-shadow:0 3px 0 #2A9455;display:flex;align-items:center;justify-content:center">${EQC.check('#fff', 13, 3.6)}</div>`;
  const wearingLbl = TX({ az: 'Geyinilib', en: 'Wearing', ru: 'Надето' });
  const ownedLbl = TX({ az: 'Sənindir', en: 'Owned', ru: 'Твоё' });

  let grid = '';
  if (cat === 'hats') {
    const hats = [
      { key: 'none', name: TX({ az: 'Papaqsız', en: 'No hat', ru: 'Без шляпы' }), owned: true },
      { key: 'explorer', name: TX({ az: 'Kəşfiyyatçı Papağı', en: 'Scout Hat', ru: 'Шляпа Скаута' }), owned: true },
      { key: 'wizard', name: TX({ az: 'Sehrbaz Papağı', en: 'Wizard Hat', ru: 'Шляпа Волшебника' }), owned: s.wizardHatOwned, lockNote: TX({ az: 'Qədim Qapı sandığı', en: 'Ancient Gate chest', ru: 'Сундук Древних Врат' }) },
      { key: 'crown', name: TX({ az: 'Ulduz Tacı', en: 'Star Crown', ru: 'Звёздная Корона' }), owned: s.crownOwned, price: 250 }
    ];
    grid = hats.map(hh => {
      const wearing = s.hero.hat === hh.key;
      if (hh.owned) return `<div class="press" onclick="EQ.wearHat('${hh.key}')" style="${wearing ? cardOn : cardOff}">
        ${wearing ? wearBadge : ''}${hatIcon[hh.key]}
        <div style="font:800 12px 'Baloo 2';color:#2A1F45;margin-top:4px">${hh.name}</div>
        <div style="font:700 10px Nunito;color:${wearing ? '#3DBE6E' : '#8B7A55'}">${wearing ? wearingLbl : ownedLbl}</div>
      </div>`;
      if (hh.price) return `<div class="press" onclick="EQ.buyCrown()" style="${cardOff}">
        ${hatIcon[hh.key]}
        <div style="font:800 12px 'Baloo 2';color:#2A1F45;margin-top:4px">${hh.name}</div>
        <div style="display:inline-flex;align-items:center;gap:4px;margin-top:2px;padding:2px 8px;border-radius:9px;background:#FFF3D6">${EQC.coin(12)}<span style="font:800 10px Nunito;color:#8A5A0A">${hh.price}</span></div>
      </div>`;
      return `<div class="press" onclick="EQ.toast(TX({az:'Sehrbaz Papağını qazanmaq üçün mərhələnin bossunu məğlub et! 🐉',en:'Beat the stage boss to earn the Wizard Hat! 🐉',ru:'Победи босса этапа, чтобы получить Шляпу Волшебника! 🐉'}))" style="${cardLock}">
        <div style="opacity:0.4">${hatIcon[hh.key]}</div>
        <div style="font:800 12px 'Baloo 2';color:#8878A8;margin-top:4px">${hh.name}</div>
        <div style="font:700 10px Nunito;color:#A197BC">${hh.lockNote}</div>
      </div>`;
    }).join('');
    grid += `
      <div class="press" onclick="EQ.toast(TX({az:'Dalğıc Dəbilqəsi Elm Adasında açılır 🌊',en:'Diver Helm unlocks in Science Island 🌊',ru:'Шлем Водолаза откроется на Острове Науки 🌊'}))" style="${cardLock}">
        <svg width="34" height="34" viewBox="0 0 36 36" opacity="0.4"><path d="M6 26 h24 l-3-8 H9 Z" fill="#8878A8"></path><path d="M12 18 q6-12 12 0 Z" fill="#8878A8"></path></svg>
        <div style="font:800 12px 'Baloo 2';color:#8878A8;margin-top:4px">${TX({ az: 'Dalğıc Dəbilqəsi', en: 'Diver Helm', ru: 'Шлем Водолаза' })}</div>
        <div style="font:700 10px Nunito;color:#A197BC">${TX({ az: 'Elm Adası', en: 'Science Island', ru: 'Остров Науки' })}</div>
      </div>
      <div class="press" onclick="EQ.toast(TX({az:'Kosmik Dəbilqə 15-ci səviyyədə açılır 🚀',en:'Space Helm unlocks at Level 15 🚀',ru:'Космический шлем откроется на 15-м уровне 🚀'}))" style="${cardLock}">
        <svg width="34" height="34" viewBox="0 0 36 36" opacity="0.4"><ellipse cx="18" cy="24" rx="14" ry="4" fill="#8878A8"></ellipse><path d="M9 24 q2-16 9-16 q7 0 9 16 Z" fill="#8878A8"></path></svg>
        <div style="font:800 12px 'Baloo 2';color:#8878A8;margin-top:4px">${TX({ az: 'Kosmik Dəbilqə', en: 'Space Helm', ru: 'Космошлем' })}</div>
        <div style="font:700 10px Nunito;color:#A197BC">${TX({ az: 'Səviyyə 15-ə çat', en: 'Reach Level 15', ru: 'Достигни 15 уровня' })}</div>
      </div>`;
  } else if (cat === 'outfits') {
    grid = EQD.OUTFITS.map(p => {
      const wearing = s.hero.outfit === p[0];
      return `<div class="press" onclick="EQ.wearOutfit('${p[0]}','${p[1]}')" style="${wearing ? cardOn : cardOff}">
        ${wearing ? wearBadge : ''}
        <svg width="34" height="34" viewBox="0 0 36 36"><path d="M12 8 h12 l6 6 -4 4 -2-2 v12 H12 V16 l-2 2 -4-4 Z" fill="${p[0]}"></path></svg>
        <div style="font:800 12px 'Baloo 2';color:#2A1F45;margin-top:4px">${TX(p[2])}</div>
        <div style="font:700 10px Nunito;color:${wearing ? '#3DBE6E' : '#8B7A55'}">${wearing ? wearingLbl : ownedLbl}</div>
      </div>`;
    }).join('');
  } else if (cat === 'shoes') {
    grid = EQD.SHOES.map(p => {
      const wearing = s.hero.shoe === p[0];
      return `<div class="press" onclick="EQ.wearShoes('${p[0]}')" style="${wearing ? cardOn : cardOff}">
        ${wearing ? wearBadge : ''}
        <svg width="34" height="34" viewBox="0 0 36 36"><path d="M6 22 q0-6 6-6 h6 q4 0 8 4 l4 2 q2 1 2 3 v3 H6 Z" fill="${p[0]}"></path></svg>
        <div style="font:800 12px 'Baloo 2';color:#2A1F45;margin-top:4px">${TX(p[1])}</div>
        <div style="font:700 10px Nunito;color:${wearing ? '#3DBE6E' : '#8B7A55'}">${wearing ? wearingLbl : ownedLbl}</div>
      </div>`;
    }).join('');
  } else {
    grid = EQD.FURS.map(p => {
      const wearing = s.questyFur === p[0];
      return `<div class="press" onclick="EQ.wearFur('${p[0]}','${p[1]}')" style="${wearing ? cardOn : cardOff}">
        ${wearing ? wearBadge : ''}
        <div style="display:flex;justify-content:center">${EQC.questy('happy', 'width:38px', p[0], p[1])}</div>
        <div style="font:800 12px 'Baloo 2';color:#2A1F45;margin-top:4px">${TX(p[2])}</div>
        <div style="font:700 10px Nunito;color:${wearing ? '#3DBE6E' : '#8B7A55'}">${wearing ? wearingLbl : ownedLbl}</div>
      </div>`;
    }).join('');
  }

  const preview = cat === 'questy'
    ? EQC.questy('happy', 'width:210px', s.questyFur, s.questyFurDark)
    : EQC.hero(s.hero, 'width:230px');

  return `<div class="scr" style="background:#FFF7EA">
    <div style="position:absolute;top:0;left:0;right:0;height:430px;background:#2C1F52;border-radius:0 0 40px 40px;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(240px 220px at 50% 52%, rgba(123,92,255,0.55), rgba(44,31,82,0) 72%)"></div>
      <div style="position:absolute;bottom:44px;left:50%;transform:translateX(-50%);width:210px;height:34px;border-radius:50%;background:rgba(123,92,255,0.5)"></div>
      <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
        <div class="press" onclick="EQ.go('map')" style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#fff', 19)}</div>
        <div style="flex:1;font:800 21px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Qarderob', en: 'Wardrobe', ru: 'Гардероб' })}</div>
        <div style="height:40px;padding:0 12px 0 8px;border-radius:20px;background:rgba(255,255,255,0.12);display:flex;align-items:center;gap:7px">${EQC.coin(22)}<span style="font:800 15px 'Baloo 2';color:#fff">${s.coins}</span></div>
      </div>
      <div style="position:absolute;bottom:20px;left:0;right:0;display:flex;justify-content:center">${preview}</div>
      <div class="press" onclick="EQ.cycleHat(-1)" style="position:absolute;left:18px;top:250px;width:40px;height:40px;border-radius:20px;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center">${EQC.chevL('#fff', 16)}</div>
      <div class="press" onclick="EQ.cycleHat(1)" style="position:absolute;right:18px;top:250px;width:40px;height:40px;border-radius:20px;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center">${EQC.chevR('#fff', 16)}</div>
    </div>

    <div style="position:absolute;top:444px;left:16px;right:16px;display:flex;gap:8px;overflow:hidden">
      ${chip('hats', TX({ az: 'Papaqlar', en: 'Hats', ru: 'Шляпы' }))}${chip('outfits', TX({ az: 'Geyimlər', en: 'Outfits', ru: 'Наряды' }))}${chip('shoes', TX({ az: 'Ayaqqabılar', en: 'Shoes', ru: 'Обувь' }))}${chip('questy', 'Questy')}
    </div>

    <div style="position:absolute;top:494px;left:16px;right:16px;bottom:170px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;align-content:start" class="vscroll">
      ${grid}
    </div>

    <div class="press" onclick="EQ.saveLook()" style="position:absolute;bottom:102px;left:16px;right:16px;height:56px;border-radius:20px;background:#3DBE6E;box-shadow:0 5px 0 #2A9455;display:flex;align-items:center;justify-content:center;font:800 18px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Bu görkəmi yadda saxla', en: 'Save this look', ru: 'Сохранить этот образ' })}</div>
    ${EQC.nav('hero')}
  </div>`;
};

/* 16 · Inventory (My bag) */
EQS.meta.bag = { light: true };
EQS.screens.bag = function (s) {
  const stickerCells = `
    <div style="aspect-ratio:1;border-radius:16px;background:#FFE1E6;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 20 C6 16 3 13 3 9.8 A4.8 4.8 0 0 1 12 7 a4.8 4.8 0 0 1 9 2.8 C21 13 18 16 12 20 Z" fill="#FF5D73"></path></svg></div>
    <div style="aspect-ratio:1;border-radius:16px;background:#E4F6FF;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#45C6F0"></circle></svg></div>
    <div style="aspect-ratio:1;border-radius:16px;background:#FFF3D6;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 3 l2.6 6.6 7 0.4 -5.4 4.6 1.8 6.8 -6-3.8 -6 3.8 1.8-6.8 -5.4-4.6 7-0.4 Z" fill="#FFC24B"></path></svg></div>
    <div style="aspect-ratio:1;border-radius:16px;background:#E8FBF1;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 4 q6 6 6 10 a6 6 0 0 1 -12 0 q0-4 6-10 Z" fill="#3DBE6E"></path></svg></div>
    <div style="aspect-ratio:1;border-radius:16px;background:#EFE7FF;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M5 18 L12 5 L19 18 Z" fill="#7B5CFF"></path></svg></div>
    ${s.stickers > 5 ? `<div style="aspect-ratio:1;border-radius:16px;background:#E8FBF1;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 36 36"><rect x="5" y="7" width="26" height="22" rx="6" fill="#5CE39B"></rect><path d="M11 20 q7-9 14 0" stroke="#0B3D25" stroke-width="2.6" fill="none" stroke-linecap="round"></path><circle cx="13" cy="14" r="2" fill="#0B3D25"></circle><circle cx="23" cy="14" r="2" fill="#0B3D25"></circle></svg></div>` : ''}
    <div style="aspect-ratio:1;border-radius:16px;background:rgba(42,31,69,0.06);display:flex;align-items:center;justify-content:center;font:800 13px 'Baloo 2';color:#A197BC">+${24 - s.stickers}</div>`;
  return `<div class="scr" style="background:#FFF7EA">
    <div style="position:absolute;top:0;left:0;right:0;height:250px;background:#2C1F52;border-radius:0 0 36px 36px;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(220px 200px at 74% 60%, rgba(92,227,155,0.35), rgba(44,31,82,0) 72%)"></div>
      <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
        <div class="press" onclick="EQ.go('map')" style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#fff', 19)}</div>
        <div style="flex:1;font:800 21px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Çantam', en: 'My bag', ru: 'Моя сумка' })}</div>
      </div>
      <div style="position:absolute;bottom:20px;left:16px;right:16px;display:flex;align-items:center;gap:14px">
        <div style="width:76px;height:76px;border-radius:26px;background:rgba(92,227,155,0.18);display:flex;align-items:center;justify-content:center;flex:none"><svg width="44" height="44" viewBox="0 0 36 36"><path d="M18 3 L27 14 L22 32 H14 L9 14 Z" fill="#7FE0AE"></path><path d="M18 3 L27 14 L18 18 Z" fill="#C8FFE4"></path><path d="M18 18 L22 32 H14 Z" fill="#5CE39B"></path></svg></div>
        <div style="flex:1">
          <div style="font:800 18px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Kristal Qəlpəsi', en: 'Crystal Shard', ru: 'Осколок Кристалла' })}</div>
          <div style="font:700 12.5px Nunito;color:#A896E0;margin-top:4px;line-height:1.45">${TX({ az: 'Bilik Kristalını bərpa etmək üçün 3 dənə topla.', en: 'Collect 3 to rebuild the Knowledge Crystal.', ru: 'Собери 3, чтобы восстановить Кристалл Знаний.' })}</div>
          <div style="display:flex;gap:6px;margin-top:8px">
            <div style="width:38px;height:8px;border-radius:4px;background:#5CE39B"></div>
            <div style="width:38px;height:8px;border-radius:4px;background:${s.bossBeaten ? '#5CE39B' : 'rgba(255,255,255,0.2)'}"></div>
            <div style="width:38px;height:8px;border-radius:4px;background:rgba(255,255,255,0.2)"></div>
          </div>
        </div>
      </div>
    </div>

    <div style="position:absolute;top:274px;left:16px;right:16px">
      <div style="font:800 11px Nunito;color:#A08A5E;letter-spacing:1.6px">${TX({ az: 'MACƏRA ƏŞYALARI', en: 'QUEST ITEMS', ru: 'ПРЕДМЕТЫ КВЕСТА' })}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-top:12px">
        <div style="aspect-ratio:1;border-radius:20px;background:#fff;box-shadow:0 4px 0 #E0C79A, 0 0 0 3px #5CE39B inset;display:flex;align-items:center;justify-content:center;position:relative"><svg width="34" height="34" viewBox="0 0 36 36"><path d="M18 3 L27 14 L22 32 H14 L9 14 Z" fill="#7FE0AE"></path><path d="M18 3 L27 14 L18 18 Z" fill="#C8FFE4"></path></svg><div style="position:absolute;bottom:5px;right:7px;font:800 11px 'Baloo 2';color:#2A9455">${s.bossBeaten ? 2 : 1}</div></div>
        <div style="aspect-ratio:1;border-radius:20px;background:#fff;box-shadow:0 4px 0 #E0C79A;display:flex;align-items:center;justify-content:center;position:relative"><svg width="34" height="34" viewBox="0 0 36 36"><path d="M6 8 q8-3 12 2 q4-5 12-2 v20 q-8-3 -12 2 q-4-5 -12-2 Z" fill="#FBE9CC" stroke="#C9762F" stroke-width="1.6"></path><path d="M14 14 l3 3 5-6" stroke="#FF5D73" stroke-width="2" fill="none"></path></svg><div style="position:absolute;bottom:5px;right:7px;font:800 11px 'Baloo 2';color:#8B7A55">1</div></div>
        <div style="aspect-ratio:1;border-radius:20px;background:#fff;box-shadow:0 4px 0 #E0C79A;display:flex;align-items:center;justify-content:center;position:relative"><svg width="32" height="32" viewBox="0 0 36 36"><circle cx="13" cy="13" r="8" fill="none" stroke="#FFC24B" stroke-width="4"></circle><path d="M18 18 L30 30 l-4 4 -12-12 Z" fill="#FFC24B"></path></svg><div style="position:absolute;bottom:5px;right:7px;font:800 11px 'Baloo 2';color:#8B7A55">3</div></div>
        <div style="aspect-ratio:1;border-radius:20px;background:rgba(42,31,69,0.06);display:flex;align-items:center;justify-content:center">${EQC.lock('#A197BC', 26)}</div>
      </div>
    </div>

    <div style="position:absolute;top:466px;left:16px;right:16px">
      <div style="font:800 11px Nunito;color:#A08A5E;letter-spacing:1.6px">${TX({ az: 'KÖMƏKÇİLƏR · YALNIZ QAZANILIR, ALINMIR', en: 'HELPERS · EARNED, NEVER BOUGHT', ru: 'ПОМОЩНИКИ · ТОЛЬКО ЗАРАБАТЫВАЮТСЯ' })}</div>
      <div style="display:flex;gap:11px;margin-top:12px">
        <div style="flex:1;border-radius:22px;background:#fff;box-shadow:0 4px 0 #E0C79A;padding:14px;display:flex;align-items:center;gap:10px"><div style="width:40px;height:40px;border-radius:14px;background:#FFF3D6;display:flex;align-items:center;justify-content:center">${EQC.bulb('#E39B1C', 20)}</div><div><div style="font:800 14px 'Baloo 2';color:#2A1F45">${TX({ az: 'İpucu qığılcımı', en: 'Hint spark', ru: 'Искра-подсказка' })}</div><div style="font:700 11px Nunito;color:#8B7A55">×${s.hintSparks}</div></div></div>
        <div style="flex:1;border-radius:22px;background:#fff;box-shadow:0 4px 0 #E0C79A;padding:14px;display:flex;align-items:center;gap:10px"><div style="width:40px;height:40px;border-radius:14px;background:#E8FBF1;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 3 l2.4 6.4 6.6 0.4 -5 4.4 1.6 6.4 -5.6-3.4 -5.6 3.4 1.6-6.4 -5-4.4 6.6-0.4 Z" fill="#2A9455"></path></svg></div><div><div style="font:800 14px 'Baloo 2';color:#2A1F45">${TX({ az: 'İkiqat XP', en: 'Double XP', ru: 'Двойной XP' })}</div><div style="font:700 11px Nunito;color:#8B7A55">×1</div></div></div>
      </div>
    </div>

    <div style="position:absolute;top:608px;left:16px;right:16px">
      <div style="font:800 11px Nunito;color:#A08A5E;letter-spacing:1.6px">${TX({ az: `OTAĞIN ÜÇÜN STİKERLƏR · 24-DƏN ${s.stickers}`, en: `STICKERS FOR YOUR ROOM · ${s.stickers} OF 24`, ru: `НАКЛЕЙКИ ДЛЯ КОМНАТЫ · ${s.stickers} ИЗ 24` })}</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:9px;margin-top:12px">${stickerCells}</div>
    </div>
    ${EQC.nav('bag')}
  </div>`;
};

/* 17 · My home */
EQS.meta.home = { light: false };
EQS.screens.home = function (s) {
  const shelfTrophy = s.trophyPlaced
    ? `<div class="pop" style="position:absolute;bottom:56px;left:64px">${EQC.trophy('#7B5CFF', 34)}</div>`
    : '';
  const trophyCard = s.trophyPlaced ? '' : `
    <div class="press" onclick="EQ.placeTrophy()" style="position:absolute;bottom:112px;left:16px;right:16px;background:#FFF7EA;border-radius:24px;padding:14px 16px;box-shadow:0 5px 0 #D8BC92;display:flex;align-items:center;gap:12px">
      <div style="width:44px;height:44px;border-radius:16px;background:#EFE7FF;display:flex;align-items:center;justify-content:center;flex:none">${EQC.trophy('#7B5CFF', 22)}</div>
      <div style="flex:1"><div style="font:800 14px 'Baloo 2';color:#2A1F45">${TX({ az: 'Riyaziyyat Ustası kuboku qazanıldı', en: 'Math Master trophy earned', ru: 'Получен кубок Мастера Математики' })}</div><div style="font:700 11.5px Nunito;color:#8B7A55">${TX({ az: 'Rəfə qoymaq üçün toxun', en: 'Tap to place it on your shelf', ru: 'Нажми, чтобы поставить на полку' })}</div></div>
      <div style="width:36px;height:36px;border-radius:14px;background:#3DBE6E;box-shadow:0 3px 0 #2A9455;display:flex;align-items:center;justify-content:center;flex:none"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 5 v14 M5 12 h14" stroke="#fff" stroke-width="3" stroke-linecap="round"></path></svg></div>
    </div>`;
  return `<div class="scr" style="background:#FBE9CC">
    <div style="position:absolute;inset:0">
      <div style="position:absolute;top:0;left:0;right:0;height:600px;background:#F6E0C0"></div>
      <div style="position:absolute;top:0;left:0;right:0;height:190px;background:#EFD3AC"></div>
      <div style="position:absolute;top:600px;left:0;right:0;bottom:0;background:#C99C63"></div>
      <div style="position:absolute;top:600px;left:0;right:0;height:12px;background:#B0834B"></div>
      <div style="position:absolute;top:250px;left:24px;width:126px;height:112px;border-radius:14px;background:#8FD8F5;box-shadow:0 0 0 8px #E0A365"></div>
      <div style="position:absolute;top:262px;left:36px;width:44px;height:36px;border-radius:22px;background:#FFF7EA;opacity:0.7"></div>
      <div style="position:absolute;top:330px;left:34px;width:106px;height:34px;background:#7FCFA0;border-radius:0 0 12px 12px"></div>
    </div>
    <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
      <div class="press" onclick="EQ.go('map')" style="width:44px;height:44px;border-radius:16px;background:rgba(42,31,69,0.14);display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#2A1F45', 19)}</div>
      <div style="flex:1"><div style="font:800 20px 'Baloo 2', system-ui;color:#2A1F45">${TX({ az: 'Evim', en: 'My home', ru: 'Мой дом' })}</div><div style="font:700 11px Nunito;color:#8B7A55">${TX({ az: `18 bəzəkdən ${s.trophyPlaced ? 7 : 6}-i yerləşdirilib`, en: `${s.trophyPlaced ? 7 : 6} of 18 decorations placed`, ru: `Расставлено украшений: ${s.trophyPlaced ? 7 : 6} из 18` })}</div></div>
      <div class="press" onclick="EQ.toast(TX({az:'Bəzəmə rejimi növbəti sandıqla açılır! 🛋️',en:'Decorating mode opens with the next chest! 🛋️',ru:'Режим украшения откроется со следующим сундуком! 🛋️'}))" style="height:44px;padding:0 14px;border-radius:16px;background:#7B5CFF;box-shadow:0 4px 0 #5B3FD6;display:flex;align-items:center;gap:7px;font:800 13px 'Baloo 2';color:#fff"><svg width="15" height="15" viewBox="0 0 24 24"><path d="M4 20 h4 L20 8 l-4-4 -12 12 Z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"></path></svg>${TX({ az: 'Bəzə', en: 'Decorate', ru: 'Украсить' })}</div>
    </div>

    <div style="position:absolute;top:432px;left:186px;width:190px;height:172px">
      <div style="position:absolute;bottom:0;left:0;right:0;height:150px;background:#C9762F;border-radius:8px"></div>
      <div style="position:absolute;bottom:0;left:6px;right:6px;height:142px;background:#E0A365;border-radius:6px"></div>
      <div style="position:absolute;bottom:100px;left:14px;right:14px;height:8px;background:#C9762F"></div>
      <div style="position:absolute;bottom:48px;left:14px;right:14px;height:8px;background:#C9762F"></div>
      <div style="position:absolute;bottom:108px;left:22px;display:flex;gap:4px;align-items:flex-end">
        <div style="width:12px;height:30px;background:#FF5D73;border-radius:2px"></div><div style="width:10px;height:34px;background:#45C6F0;border-radius:2px"></div><div style="width:12px;height:28px;background:#3DBE6E;border-radius:2px"></div><div style="width:9px;height:32px;background:#7B5CFF;border-radius:2px"></div>
      </div>
      <div style="position:absolute;bottom:108px;right:20px">${EQC.trophy('#FFC24B', 40)}</div>
      <div style="position:absolute;bottom:56px;left:20px;right:20px;display:flex;gap:8px;align-items:flex-end"><div style="flex:1;height:34px;border-radius:6px;background:#FFF7EA;display:flex;align-items:center;justify-content:center;font:800 9px Nunito;color:#8B7A55;text-align:center;line-height:1.1">${TX({ az: 'RİYAZİYYAT<br>USTASI', en: 'MATH<br>MASTER', ru: 'МАСТЕР<br>МАТЕМАТИКИ' })}</div><div style="flex:1;height:30px;border-radius:6px;background:#EFE7FF"></div><div style="flex:1;height:38px;border-radius:6px;background:#E8FBF1"></div></div>
      ${shelfTrophy}
    </div>

    <div style="position:absolute;top:392px;left:24px;width:130px;height:96px;border-radius:12px;background:#FFF7EA;box-shadow:0 5px 0 #D8BC92;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px">
      <svg width="34" height="34" viewBox="0 0 36 36"><path d="M6 8 q9-4 12 2 q3-6 12-2 v20 q-9-4 -12 2 q-3-6 -12-2 Z" fill="#45C6F0"></path></svg>
      <div style="font:800 10px Nunito;color:#2A1F45;text-align:center;letter-spacing:0.4px">${TX({ az: 'OXU ÇEMPİONU', en: 'READING CHAMPION', ru: 'ЧЕМПИОН ЧТЕНИЯ' })}</div>
    </div>

    <div style="position:absolute;top:520px;left:20px;width:150px;height:90px">
      <div style="position:absolute;bottom:0;left:0;right:0;height:56px;border-radius:10px;background:#7B5CFF"></div>
      <div style="position:absolute;bottom:38px;left:8px;right:8px;height:30px;border-radius:10px;background:#FFF7EA"></div>
      <div style="position:absolute;bottom:56px;left:16px;width:36px;height:24px;border-radius:6px;background:#EFD3AC"></div>
    </div>

    <div style="position:absolute;top:590px;right:26px;width:70px;height:96px">
      <div style="position:absolute;bottom:0;left:14px;width:42px;height:38px;border-radius:8px 8px 14px 14px;background:#C9762F"></div>
      <svg width="70" height="70" viewBox="0 0 70 70" style="position:absolute;top:0;left:0"><path d="M35 56 q-22-6 -24-26 q14 4 24 14 Z" fill="#3DBE6E"></path><path d="M35 56 q22-6 24-26 q-14 4 -24 14 Z" fill="#54D083"></path><path d="M35 56 V26" stroke="#2A9455" stroke-width="3"></path></svg>
    </div>

    ${EQC.hero(s.hero, 'position:absolute;bottom:230px;left:150px;width:110px')}
    ${EQC.questy('happy', 'position:absolute;bottom:224px;left:248px;width:74px', s.questyFur, s.questyFurDark)}

    ${trophyCard}
    ${EQC.nav('hero')}
  </div>`;
};

/* 18 · Achievements & streak */
EQS.meta.awards = { light: true };
EQS.screens.awards = function (s) {
  const dayCell = (state, label, labelColor) => {
    let inner = '';
    if (state === 'done') inner = `<div style="width:32px;height:32px;border-radius:12px;background:#5CE39B;display:flex;align-items:center;justify-content:center">${EQC.check('#0B3D25', 15, 3.6)}</div>`;
    else if (state === 'miss') inner = `<div style="width:32px;height:32px;border-radius:12px;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center"><span style="font:800 12px 'Baloo 2';color:#C9BCEF">—</span></div>`;
    else if (state === 'today') inner = `<div style="width:32px;height:32px;border-radius:12px;background:#FFC24B;display:flex;align-items:center;justify-content:center"><svg width="15" height="15" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#4A3208"></circle></svg></div>`;
    else inner = `<div style="width:32px;height:32px;border-radius:12px;background:rgba(255,255,255,0.08)"></div>`;
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px">${inner}<span style="font:700 9.5px Nunito;color:${labelColor}">${label}</span></div>`;
  };
  const mathPct = Math.min(100, Math.round(s.mathSolved / 100 * 100));
  const played = s.playedDays || [];
  const firstPlayed = played[0] || EQ.dayKey();
  const names = TX({
    az: ['BAZ', 'B.E', 'Ç.A', 'ÇƏR', 'C.A', 'CÜM', 'ŞƏN'],
    en: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    ru: ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
  });
  const todayLbl = TX({ az: 'BU GÜN', en: 'TODAY', ru: 'СЕГОДНЯ' });
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = EQ.dayKey(d);
    let state = 'off';
    if (i === 0) state = 'today';
    else if (played.indexOf(key) >= 0) state = 'done';
    else if (key >= firstPlayed) state = 'miss';
    week.push(dayCell(state, i === 0 ? todayLbl : names[d.getDay()], i === 0 ? '#FFD98A' : (state === 'off' ? '#7E6DB8' : '#A896E0')));
  }
  const best = Math.max(s.bestStreak || 1, s.streak);
  const firstQuestDone = s.challengesDone > 0 || s.bossBeaten || s.mathSolved > 0;
  return `<div class="scr" style="background:#FFF7EA">
    <div style="position:absolute;top:0;left:0;right:0;height:284px;background:#2C1F52;border-radius:0 0 36px 36px;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(240px 200px at 76% 30%, rgba(255,138,76,0.35), rgba(44,31,82,0) 72%)"></div>
      <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
        <div style="flex:1"><div style="font:800 21px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Kubokların', en: 'Your trophies', ru: 'Твои кубки' })}</div><div style="font:700 11px Nunito;color:#A896E0">${TX({ az: `40-dan ${s.trophiesEarned}-i qazanılıb`, en: `${s.trophiesEarned} of 40 earned`, ru: `Получено ${s.trophiesEarned} из 40` })}</div></div>
        <div style="height:40px;padding:0 12px 0 8px;border-radius:20px;background:rgba(255,138,76,0.22);display:flex;align-items:center;gap:6px">${EQC.flame(20)}<span style="font:800 15px 'Baloo 2';color:#fff">${s.streak}</span></div>
      </div>
      <div style="position:absolute;bottom:22px;left:16px;right:16px;background:rgba(255,255,255,0.08);border-radius:24px;padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font:800 13px 'Baloo 2';color:#fff">${TX({ az: `${s.streak} günlük seriya`, en: `${s.streak} day streak`, ru: `Серия: ${s.streak} ${RUP(s.streak, 'день', 'дня', 'дней')}` })}</span><span style="font:700 11px Nunito;color:#A896E0">${TX({ az: `Rekord: ${best} gün`, en: `Best: ${best} day${best === 1 ? '' : 's'}`, ru: `Рекорд: ${best} ${RUP(best, 'день', 'дня', 'дней')}` })}</span></div>
        <div style="display:flex;gap:7px;margin-top:12px">
          ${week.join('')}
        </div>
        <div style="font:700 11.5px Nunito;color:#BFF0D3;margin-top:12px">${TX({ az: 'Bir günü ötürdün? Problem deyil — seriyan yerində qalır.', en: 'Missed a day? No problem — your streak keeps its place.', ru: 'Пропустил день? Не беда — твоя серия остаётся на месте.' })}</div>
      </div>
    </div>

    <div style="position:absolute;top:306px;left:16px;right:16px;bottom:110px;display:flex;flex-direction:column;gap:11px" class="vscroll">
      ${firstQuestDone ? `
      <div style="border-radius:24px;background:#fff;box-shadow:0 5px 0 #E0C79A;padding:14px;display:flex;align-items:center;gap:13px">
        <div style="width:54px;height:54px;border-radius:20px;background:#FFF3D6;display:flex;align-items:center;justify-content:center;flex:none">${EQC.trophy('#FFC24B', 30)}</div>
        <div style="flex:1"><div style="font:800 16px 'Baloo 2';color:#2A1F45">${TX({ az: 'İlk Tapşırıq', en: 'First Quest', ru: 'Первый Квест' })}</div><div style="font:700 12px Nunito;color:#8B7A55">${TX({ az: 'İlk missiyanı tamamla', en: 'Complete your first mission', ru: 'Выполни свою первую миссию' })}</div></div>
        <div style="width:30px;height:30px;border-radius:15px;background:#3DBE6E;display:flex;align-items:center;justify-content:center;flex:none">${EQC.check('#fff', 15, 3.6)}</div>
      </div>` : `
      <div style="border-radius:24px;background:rgba(42,31,69,0.06);padding:14px;display:flex;align-items:center;gap:13px">
        <div style="width:54px;height:54px;border-radius:20px;background:rgba(42,31,69,0.08);display:flex;align-items:center;justify-content:center;flex:none">${EQC.trophy('#A197BC', 30)}</div>
        <div style="flex:1"><div style="font:800 16px 'Baloo 2';color:#8878A8">${TX({ az: 'İlk Tapşırıq', en: 'First Quest', ru: 'Первый Квест' })}</div><div style="font:700 12px Nunito;color:#A197BC">${TX({ az: 'İlk missiyanı tamamla', en: 'Complete your first mission', ru: 'Выполни свою первую миссию' })}</div></div>
      </div>`}
      ${s.bossBeaten ? `
      <div class="rise" style="border-radius:24px;background:#fff;box-shadow:0 5px 0 #E0C79A;padding:14px;display:flex;align-items:center;gap:13px">
        <div style="width:54px;height:54px;border-radius:20px;background:#FFF3D6;display:flex;align-items:center;justify-content:center;flex:none">${EQC.trophy('#E39B1C', 30)}</div>
        <div style="flex:1"><div style="font:800 16px 'Baloo 2';color:#2A1F45">${TX({ az: 'Körpü Keşikçisi', en: 'Bridge Keeper', ru: 'Хранитель Моста' })}</div><div style="font:700 12px Nunito;color:#8B7A55">${TX({ az: 'Bilik Meşəsində ilk boss məğlub edildi', en: 'First boss cleared in Knowledge Forest', ru: 'Первый босс Леса Знаний побеждён' })}</div></div>
        <div style="width:30px;height:30px;border-radius:15px;background:#3DBE6E;display:flex;align-items:center;justify-content:center;flex:none">${EQC.check('#fff', 15, 3.6)}</div>
      </div>` : ''}
      <div style="border-radius:24px;background:#fff;box-shadow:0 5px 0 #E0C79A;padding:14px;display:flex;align-items:center;gap:13px">
        <div style="width:54px;height:54px;border-radius:20px;background:#E8FBF1;display:flex;align-items:center;justify-content:center;flex:none"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 3 a9 9 0 1 0 0.01 0 Z" fill="#3DBE6E"></path><path d="M12 7 v5 l3.4 2" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"></path></svg></div>
        <div style="flex:1"><div style="font:800 16px 'Baloo 2';color:#2A1F45">${TX({ az: '7 Günlük Kaşif', en: '7 Day Explorer', ru: 'Исследователь 7 Дней' })}</div><div style="font:700 12px Nunito;color:#8B7A55">${TX({ az: 'Dalbadal 7 gün oyna', en: 'Play 7 days in a row', ru: 'Играй 7 дней подряд' })}</div><div style="height:9px;border-radius:5px;background:#EAD9BC;margin-top:7px;overflow:hidden"><div style="width:${Math.round(s.streak / 7 * 100)}%;height:100%;background:#3DBE6E;border-radius:5px"></div></div></div>
        <div style="font:800 13px 'Baloo 2';color:#2A9455;flex:none">${s.streak}/7</div>
      </div>
      <div style="border-radius:24px;background:#fff;box-shadow:0 5px 0 #E0C79A;padding:14px;display:flex;align-items:center;gap:13px">
        <div style="width:54px;height:54px;border-radius:20px;background:#EFE7FF;display:flex;align-items:center;justify-content:center;flex:none"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 4 a6 6 0 0 1 6 6 c0 3-2 4-2 6 h-8 c0-2-2-3-2-6 a6 6 0 0 1 6-6 Z" fill="#7B5CFF"></path><path d="M9.4 19 h5.2" stroke="#7B5CFF" stroke-width="2.4" stroke-linecap="round"></path></svg></div>
        <div style="flex:1"><div style="font:800 16px 'Baloo 2';color:#2A1F45">${TX({ az: 'Riyaziyyat Ustası', en: 'Math Master', ru: 'Мастер Математики' })}</div><div style="font:700 12px Nunito;color:#8B7A55">${TX({ az: '100 riyaziyyat sınağı həll et', en: 'Solve 100 math challenges', ru: 'Реши 100 математических испытаний' })}</div><div style="height:9px;border-radius:5px;background:#EAD9BC;margin-top:7px;overflow:hidden"><div style="width:${mathPct}%;height:100%;background:#7B5CFF;border-radius:5px"></div></div></div>
        <div style="font:800 13px 'Baloo 2';color:#5B3FD6;flex:none">${s.mathSolved}/100</div>
      </div>
      <div style="border-radius:24px;background:rgba(42,31,69,0.06);padding:14px;display:flex;align-items:center;gap:13px">
        <div style="width:54px;height:54px;border-radius:20px;background:rgba(42,31,69,0.08);display:flex;align-items:center;justify-content:center;flex:none">${EQC.lock('#A197BC', 24)}</div>
        <div style="flex:1"><div style="font:800 16px 'Baloo 2';color:#8878A8">${TX({ az: 'Kitab Kaşifi', en: 'Book Explorer', ru: 'Книжный Исследователь' })}</div><div style="font:700 12px Nunito;color:#A197BC">${TX({ az: '20 oxu tapşırığı bitir · Söz Vadisi', en: 'Finish 20 reading quests · Word Valley', ru: 'Пройди 20 квестов чтения · Долина Слов' })}</div></div>
      </div>
      <div style="border-radius:24px;background:rgba(42,31,69,0.06);padding:14px;display:flex;align-items:center;gap:13px">
        <div style="width:54px;height:54px;border-radius:20px;background:rgba(42,31,69,0.08);display:flex;align-items:center;justify-content:center;flex:none"><svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6" fill="none" stroke="#A197BC" stroke-width="2.2"></circle><path d="M3.4 12 h17.2 M12 3.4 q4 8.6 0 17.2 q-4-8.6 0-17.2" stroke="#A197BC" stroke-width="2.2" fill="none"></path></svg></div>
        <div style="flex:1"><div style="font:800 16px 'Baloo 2';color:#8878A8">${TX({ az: 'Dünya Kaşifi', en: 'World Explorer', ru: 'Исследователь Миров' })}</div><div style="font:700 12px Nunito;color:#A197BC">${TX({ az: '3 dünya aç · 3-dən 2-si', en: 'Unlock 3 worlds · 2 of 3', ru: 'Открой 3 мира · 2 из 3' })}</div></div>
      </div>
    </div>
    ${EQC.nav('awards')}
  </div>`;
};
