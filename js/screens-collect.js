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
  /* the first five slots of the album, then the door into it — the counter is no
     longer a dead end: everything it counts has a face and a place to be looked at */
  const owned = s.stickerIds || [];
  const total = EQD.STICKERS.length;
  const stickerCells = EQD.STICKERS.slice(0, 5).map(st => {
    const mine = owned.indexOf(st.id) >= 0;
    const bg = (EQD.STICKER_SETS.filter(g => g.id === st.set)[0] || {}).bg || '#E8FBF1';
    return `<div class="press" onclick="EQ.openAlbum('${st.set}')" style="aspect-ratio:1;border-radius:16px;background:${mine ? bg : 'rgba(42,31,69,0.06)'};display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 36 36"${mine ? '' : ' style="opacity:0.22"'}>${st.art}</svg></div>`;
  }).join('') +
    `<div class="press" onclick="EQ.openAlbum()" style="aspect-ratio:1;border-radius:16px;background:#7B5CFF;box-shadow:0 4px 0 #5B3FD6;display:flex;align-items:center;justify-content:center;font:800 12px 'Baloo 2';color:#fff">${owned.length >= total ? '★' : '+' + (total - owned.length)}</div>`;

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
      <div class="press" onclick="EQ.openAlbum()" style="display:flex;align-items:center;gap:6px">
        <div style="flex:1;font:800 11px Nunito;color:#A08A5E;letter-spacing:1.6px">${TX({ az: `STİKER ALBOMU · ${total}-DƏN ${owned.length}`, en: `STICKER ALBUM · ${owned.length} OF ${total}`, ru: `АЛЬБОМ НАКЛЕЕК · ${owned.length} ИЗ ${total}` })}</div>
        <div style="font:800 11px 'Baloo 2';color:#7B5CFF">${TX({ az: 'Aç', en: 'Open', ru: 'Открыть' })}</div>
        ${EQC.chevR('#7B5CFF', 14)}
      </div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:9px;margin-top:12px">${stickerCells}</div>
    </div>
    ${EQC.nav('bag')}
  </div>`;
};

/* 17 · My home */
EQS.meta.home = { light: false };
EQS.screens.home = function (s) {
  /* the stickers on the wall: the room is what the album is *for*, so the six most
     recent ones hang here, and the whole strip is a door into the album */
  const mine = (s.stickerIds || []).slice(-6).map(id => EQD.STICKER_BY_ID[id]).filter(Boolean);
  const wallStickers = `<div class="press" onclick="EQ.openAlbum()" style="position:absolute;top:212px;left:176px;right:20px;display:flex;flex-wrap:wrap;gap:7px;justify-content:flex-end">
    ${mine.map(st => {
      const bg = (EQD.STICKER_SETS.filter(g => g.id === st.set)[0] || {}).bg || '#E8FBF1';
      return `<div style="width:44px;height:44px;border-radius:15px;background:${bg};box-shadow:0 3px 0 rgba(42,31,69,0.14);display:flex;align-items:center;justify-content:center"><svg width="28" height="28" viewBox="0 0 36 36">${st.art}</svg></div>`;
    }).join('')}
    ${mine.length ? '' : `<div style="padding:8px 12px;border-radius:15px;background:rgba(255,247,234,0.75);font:700 10.5px Nunito;color:#8B7A55;text-align:center;line-height:1.3">${TX({ az: 'Divar stiker gözləyir', en: 'This wall is waiting for stickers', ru: 'Стена ждёт наклеек' })}</div>`}
  </div>`;

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

    ${wallStickers}

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
    <div class="press" onclick="EQ.go('care')" style="position:absolute;bottom:224px;left:248px;width:74px">
      ${EQ.careLeft() ? `<div style="position:absolute;right:-6px;top:-6px;min-width:24px;height:24px;padding:0 6px;border-radius:12px;background:#FF5D73;box-shadow:0 3px 0 #D63A52;display:flex;align-items:center;justify-content:center;font:800 12px 'Baloo 2', system-ui;color:#fff;z-index:2">${EQ.careLeft()}</div>` : ''}
      ${EQC.questy(EQ.careMood(), 'width:74px', s.questyFur, s.questyFurDark)}
    </div>

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

/* 18b · Sticker album — the collection screen the counter in the bag points at.
   A sticker a child cannot look at is not a collection, so every one of the 24 has a
   slot here from the first day: the owned ones in colour, the locked ones as a soft
   silhouette with the one thing to do to earn them. */
EQS.meta.album = { light: true };
EQS.screens.album = function (s) {
  const owned = s.stickerIds || [];
  const setId = EQ.session.albumSet || EQD.STICKER_SETS[0].id;
  const set = EQD.STICKER_SETS.filter(x => x.id === setId)[0] || EQD.STICKER_SETS[0];
  const total = EQD.STICKERS.length;
  const justGot = EQ.session.justAdded; /* badged only on the trip in from the chest */

  const pageTab = (g) => {
    const mine = EQD.STICKERS.filter(x => x.set === g.id);
    const have = mine.filter(x => owned.indexOf(x.id) >= 0).length;
    const on = g.id === set.id;
    return `<div class="press" onclick="EQ.albumSet('${g.id}')" style="flex:none;padding:0 14px;height:46px;border-radius:16px;background:${on ? '#7B5CFF' : '#FBE9CC'};box-shadow:0 4px 0 ${on ? '#5B3FD6' : '#E8D0A8'};display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div style="font:800 12.5px 'Baloo 2';color:${on ? '#fff' : '#7A6438'}">${TX(g.name)}</div>
      <div style="font:800 9.5px Nunito;color:${on ? '#D9CEFF' : '#A08A5E'}">${have}/${mine.length}</div>
    </div>`;
  };

  const cell = (st) => {
    const mine = owned.indexOf(st.id) >= 0;
    const isNew = st.id === justGot;
    if (mine) return `<div class="press ${isNew ? 'pop' : ''}" onclick="EQ.stickerPeek('${st.id}')" style="border-radius:22px;background:#fff;box-shadow:0 5px 0 #E0C79A${isNew ? ', 0 0 0 3px #3DBE6E inset' : ''};padding:10px 6px 8px;text-align:center;position:relative">
      ${isNew ? `<div style="position:absolute;top:-7px;right:-5px;padding:0 7px;height:20px;border-radius:10px;background:#3DBE6E;box-shadow:0 3px 0 #2A9455;display:flex;align-items:center;font:800 9px Nunito;color:#fff;letter-spacing:0.4px">${TX({ az: 'YENİ', en: 'NEW', ru: 'НОВОЕ' })}</div>` : ''}
      <div style="width:52px;height:52px;margin:0 auto;border-radius:18px;background:${set.bg};display:flex;align-items:center;justify-content:center"><svg width="34" height="34" viewBox="0 0 36 36">${st.art}</svg></div>
      <div style="font:800 11.5px 'Baloo 2';color:#2A1F45;margin-top:6px;line-height:1.2">${TX(st.name)}</div>
      <div style="font:800 9px Nunito;color:${set.ink};margin-top:2px">#${st.no}</div>
    </div>`;
    return `<div class="press" onclick="EQ.stickerPeek('${st.id}')" style="border-radius:22px;background:rgba(42,31,69,0.06);padding:10px 6px 8px;text-align:center">
      <div style="width:52px;height:52px;margin:0 auto;border-radius:18px;background:rgba(42,31,69,0.06);display:flex;align-items:center;justify-content:center"><svg width="34" height="34" viewBox="0 0 36 36" style="opacity:0.22">${st.art}</svg></div>
      <div style="font:800 11.5px 'Baloo 2';color:#8878A8;margin-top:6px;line-height:1.2">${TX({ az: 'Hələ gizlidir', en: 'Still hidden', ru: 'Ещё скрыта' })}</div>
      <div style="font:700 9px Nunito;color:#A197BC;margin-top:2px;line-height:1.25">${TX(st.how)}</div>
    </div>`;
  };

  const grid = EQD.STICKERS.filter(x => x.set === set.id).map(cell).join('');
  const pct = Math.round(owned.length / total * 100);
  const line = owned.length === 0
    ? TX({ az: 'Albomun boşdur — ilk stikerin növbəti sandıqda səni gözləyir!', en: 'Your album is empty — your first sticker is waiting in the next chest!', ru: 'Твой альбом пуст — первая наклейка ждёт в следующем сундуке!' })
    : owned.length >= total
      ? TX({ az: '24-ün 24-ü! Albom tamamdır — sən əsl kolleksiyaçısan!', en: 'All 24! The album is full — you are a true collector!', ru: 'Все 24! Альбом полон — ты настоящий коллекционер!' })
      : TX({
        az: `Daha ${total - owned.length} stiker qaldı. Hər sandıq bir dənə gətirir!`,
        en: `${total - owned.length} sticker${total - owned.length === 1 ? '' : 's'} to go. Every chest brings one!`,
        ru: `Осталось ${total - owned.length} ${RUP(total - owned.length, 'наклейка', 'наклейки', 'наклеек')}. Каждый сундук приносит одну!`
      });

  return `<div class="scr" style="background:#FFF7EA">
    <div style="position:absolute;top:0;left:0;right:0;height:250px;background:#2C1F52;border-radius:0 0 36px 36px;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(230px 200px at 72% 46%, rgba(255,194,75,0.30), rgba(44,31,82,0) 72%)"></div>
      <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
        <div class="press" onclick="EQ.go('bag')" style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#fff', 19)}</div>
        <div style="flex:1">
          <div style="font:800 21px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Stiker Albomu', en: 'Sticker Album', ru: 'Альбом Наклеек' })}</div>
          <div style="font:700 11px Nunito;color:#A896E0">${TX({ az: `${total}-dən ${owned.length}-i yığılıb`, en: `${owned.length} of ${total} collected`, ru: `Собрано ${owned.length} из ${total}` })}</div>
        </div>
      </div>
      <div style="position:absolute;bottom:22px;left:16px;right:16px;background:rgba(255,255,255,0.08);border-radius:24px;padding:16px">
        <div style="display:flex;align-items:baseline;justify-content:space-between">
          <span style="font:800 13px 'Baloo 2';color:#fff">${TX(set.name)}</span>
          <span style="font:800 12px 'Baloo 2';color:#FFD98A">${owned.length}/${total}</span>
        </div>
        <div style="height:10px;border-radius:5px;background:rgba(255,255,255,0.14);margin-top:10px;overflow:hidden"><div style="width:${pct}%;height:100%;background:#FFC24B;border-radius:5px"></div></div>
        <div style="font:700 11.5px Nunito;color:#BFF0D3;margin-top:11px;line-height:1.45">${line}</div>
      </div>
    </div>

    <div style="position:absolute;top:268px;left:16px;right:16px;display:flex;gap:8px;overflow-x:auto" class="vscroll">
      ${EQD.STICKER_SETS.map(pageTab).join('')}
    </div>

    <div style="position:absolute;top:328px;left:16px;right:16px;bottom:110px;display:grid;grid-template-columns:repeat(3,1fr);gap:11px;align-content:start" class="vscroll">
      ${grid}
    </div>
    ${EQC.nav('bag')}
  </div>`;
};

/* 18c · One sticker, just earned — the beat between the chest and the map */
EQS.meta.sticker = { light: false };
EQS.screens.sticker = function (s) {
  const st = EQD.STICKER_BY_ID[EQ.session.newSticker] || EQD.STICKERS[0];
  const set = EQD.STICKER_SETS.filter(x => x.id === st.set)[0] || EQD.STICKER_SETS[0];
  const owned = (s.stickerIds || []).length;
  const total = EQD.STICKERS.length;
  return `<div class="scr" style="background:#1E1338">
    <div style="position:absolute;inset:0;background:radial-gradient(300px 280px at 50% 34%, rgba(255,194,75,0.32), rgba(30,19,56,0) 70%)"></div>
    <div style="position:absolute;top:96px;left:20px;right:20px;text-align:center">
      <div style="font:800 11px Nunito;color:#FFD98A;letter-spacing:2.4px">${TX({ az: 'ALBOMUNA YENİ STİKER', en: 'NEW STICKER FOR YOUR ALBUM', ru: 'НОВАЯ НАКЛЕЙКА В АЛЬБОМ' })}</div>
    </div>
    <div class="pop" style="position:absolute;top:168px;left:0;right:0;display:flex;justify-content:center">
      <div style="width:196px;height:196px;border-radius:52px;background:#fff;box-shadow:0 10px 0 rgba(0,0,0,0.22);display:flex;align-items:center;justify-content:center;position:relative">
        <div style="position:absolute;inset:14px;border-radius:40px;background:${set.bg}"></div>
        <svg width="112" height="112" viewBox="0 0 36 36" style="position:relative">${st.art}</svg>
      </div>
    </div>
    <div style="position:absolute;top:396px;left:20px;right:20px;text-align:center">
      <div style="font:800 26px 'Baloo 2', system-ui;color:#fff">${TX(st.name)}</div>
      <div style="font:700 12.5px Nunito;color:#A896E0;margin-top:6px">${TX(set.name)} · #${st.no}</div>
      <div style="display:inline-flex;align-items:center;gap:8px;margin-top:16px;padding:8px 16px;border-radius:18px;background:rgba(255,255,255,0.08)">
        <span style="font:800 13px 'Baloo 2';color:#FFD98A">${owned}/${total}</span>
        <span style="font:700 11.5px Nunito;color:#A896E0">${TX({ az: 'albomunda', en: 'in your album', ru: 'в твоём альбоме' })}</span>
      </div>
    </div>
    <div style="position:absolute;bottom:196px;left:20px;right:20px">
      ${EQC.bubble('excited', TX({
        az: 'Bunu albomuna yapışdırdım! İstədiyin vaxt çantandan baxa bilərsən.',
        en: 'I stuck it in your album! You can look at it any time from your bag.',
        ru: 'Я вклеил её в твой альбом! Можешь посмотреть в любой момент из сумки.'
      }), { dark: true, w: 68 })}
    </div>
    <div class="press" onclick="EQ.openAlbum('${st.set}')" style="position:absolute;bottom:126px;left:20px;right:20px;height:60px;border-radius:22px;background:#FFC24B;box-shadow:0 6px 0 #E39B1C;display:flex;align-items:center;justify-content:center;font:800 19px 'Baloo 2', system-ui;color:#4A3208">${TX({ az: 'Albomuma bax', en: 'See my album', ru: 'Открыть альбом' })}</div>
    <div class="press" onclick="EQ.afterSticker()" style="position:absolute;bottom:56px;left:20px;right:20px;height:56px;border-radius:22px;background:rgba(255,255,255,0.10);display:flex;align-items:center;justify-content:center;font:800 17px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Macəraya davam', en: 'Back to the adventure', ru: 'Дальше в приключение' })}</div>
  </div>`;
};

/* 17b · Questy'nin qulluğu — sikkənin gündəlik xərclənmə yeri.
   Ekran qəsdən "boşalan zolaqlar" göstərmir: burada azalan heç nə yoxdur. Verilməmiş
   qulluq "gözləyir" kimi deyil, təklif kimi görünür; verilmiş qulluq isə bugünkü kiçik
   qələbədir. Uşaq oyuna qayıtmayanda Questy pisləşmir — sadəcə sabah yeni gün açılır. */
EQS.meta.care = { light: false };
EQS.screens.care = function (s) {
  const given = EQ.careToday();
  const left = EQ.careLeft();
  const mood = EQ.careMood();
  const allDone = left === 0;

  const bubble = allDone
    ? TX({ az: 'Bu gün hər şey əladır — sağ ol! 🧡', en: 'Today was perfect — thank you! 🧡', ru: 'Сегодня всё чудесно — спасибо! 🧡' })
    : (given.length
      ? TX({ az: 'Nə gözəl! Bəs bu?', en: 'That was lovely! And this one?', ru: 'Как здорово! А это?' })
      : TX({ az: 'Salam! Bu gün mənə nə gətirdin?', en: 'Hi! What did you bring me today?', ru: 'Привет! Что ты мне принёс сегодня?' }));

  const cards = EQD.CARE.map(item => {
    const done = EQ.caredWith(item.id);
    const afford = s.coins >= EQD.CARE_COST;
    const art = `<svg width="42" height="42" viewBox="0 0 36 36">${item.art}</svg>`;
    if (done) return `<div class="press" onclick="EQ.careGive('${item.id}')" style="border-radius:24px;background:#EAF7EF;box-shadow:0 5px 0 #C3E3D0;padding:13px 12px;display:flex;align-items:center;gap:12px;position:relative">
      <div style="width:56px;height:56px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;flex:none;opacity:0.65">${art}</div>
      <div style="flex:1;min-width:0">
        <div style="font:800 15px 'Baloo 2', system-ui;color:#2A9455">${TX(item.name)}</div>
        <div style="font:700 11.5px Nunito;color:#5C8A70">${TX({ az: 'Bu gün verildi', en: 'Given today', ru: 'Подарено сегодня' })}</div>
      </div>
      <div style="width:34px;height:34px;border-radius:14px;background:#3DBE6E;box-shadow:0 3px 0 #2A9455;display:flex;align-items:center;justify-content:center;flex:none">${EQC.check('#fff', 16, 3.6)}</div>
    </div>`;
    return `<div class="press" onclick="EQ.careGive('${item.id}')" style="border-radius:24px;background:#FFF7EA;box-shadow:0 5px 0 #D8BC92;padding:13px 12px;display:flex;align-items:center;gap:12px">
      <div style="width:56px;height:56px;border-radius:20px;background:#FBE9CC;display:flex;align-items:center;justify-content:center;flex:none">${art}</div>
      <div style="flex:1;min-width:0">
        <div style="font:800 15px 'Baloo 2', system-ui;color:#2A1F45">${TX(item.name)}</div>
        <div style="font:700 11.5px Nunito;color:#8B7A55">${TX(item.note)}</div>
      </div>
      <div style="flex:none;height:36px;padding:0 12px 0 9px;border-radius:15px;background:${afford ? '#FFC24B' : 'rgba(42,31,69,0.08)'};${afford ? 'box-shadow:0 3px 0 #E39B1C;' : ''}display:flex;align-items:center;gap:5px">
        ${EQC.coin(18)}<span style="font:800 14px 'Baloo 2', system-ui;color:${afford ? '#4A3208' : '#A197BC'}">${EQD.CARE_COST}</span>
      </div>
    </div>`;
  }).join('');

  return `<div class="scr" style="background:#3B2A6B">
    <div style="position:absolute;inset:0">
      <div style="position:absolute;top:0;left:0;right:0;height:380px;background:#4A3585;border-radius:0 0 40px 40px;overflow:hidden">
        <div style="position:absolute;inset:0;background:radial-gradient(260px 200px at 50% 74%, rgba(255,146,67,0.34), rgba(74,53,133,0) 72%)"></div>
        <div style="position:absolute;top:96px;left:34px;width:7px;height:7px;border-radius:4px;background:#FFE9A8;opacity:0.7"></div>
        <div style="position:absolute;top:140px;right:44px;width:9px;height:9px;border-radius:5px;background:#9BE8C0;opacity:0.6"></div>
        <div style="position:absolute;top:196px;left:58px;width:6px;height:6px;border-radius:3px;background:#8FD8F5;opacity:0.65"></div>
      </div>
    </div>

    <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
      <div class="press" onclick="EQ.go('map')" style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#fff', 19)}</div>
      <div style="flex:1">
        <div style="font:800 20px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Questy-yə qulluq', en: 'Care for Questy', ru: 'Забота о Квести' })}</div>
        <div style="font:700 11px Nunito;color:#C6B9EE">${allDone
          ? TX({ az: 'Bugünkü qulluq tamamlandı', en: 'Today’s care is complete', ru: 'Забота на сегодня завершена' })
          : TX({ az: `Bu gün ${left} qulluq qalıb`, en: `${left} to give today`, ru: `Сегодня осталось: ${left}` })}</div>
      </div>
      <div style="flex:none;height:40px;border-radius:20px;background:rgba(30,21,54,0.7);padding:0 12px 0 8px;display:flex;align-items:center;gap:6px">
        ${EQC.coin(22)}<span style="font:800 15px 'Baloo 2', system-ui;color:#fff">${s.coins}</span>
      </div>
    </div>

    <div style="position:absolute;top:132px;left:0;right:0;display:flex;flex-direction:column;align-items:center">
      <div style="max-width:250px;background:#FFF7EA;border-radius:20px;padding:10px 15px;box-shadow:0 5px 0 rgba(20,10,40,0.3);font:800 13.5px 'Baloo 2', system-ui;color:#2A1F45;text-align:center;line-height:1.35">${bubble}</div>
      <div style="width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:11px solid #FFF7EA;margin-top:-1px"></div>
      ${EQC.questy(mood, 'width:128px;margin-top:2px', s.questyFur, s.questyFurDark)}
    </div>

    <div style="position:absolute;top:398px;left:14px;right:14px;display:flex;flex-direction:column;gap:11px">
      ${cards}
    </div>

    <div style="position:absolute;top:680px;left:14px;right:14px;border-radius:22px;background:rgba(255,255,255,0.1);padding:12px 14px;display:flex;align-items:center;gap:11px">
      <div style="width:40px;height:40px;border-radius:15px;background:rgba(255,194,75,0.24);display:flex;align-items:center;justify-content:center;flex:none">${EQC.coin(22)}</div>
      <div style="flex:1;font:700 11.5px Nunito;color:#C6B9EE;line-height:1.45">${allDone
        ? TX({ az: 'Sabah üç qulluq yenidən açılır — sikkələri macərada qazan.', en: 'All three open again tomorrow — earn coins on the adventure.', ru: 'Завтра все три откроются снова — монеты зарабатываются в приключении.' })
        : TX({ az: 'Sikkələr bugünkü macəradan gəlir. Hər qulluq gündə bir dəfədir.', en: 'Coins come from today’s adventure. Each care is once a day.', ru: 'Монеты приходят из приключения. Каждая забота — раз в день.' })}</div>
    </div>

    ${EQC.nav('hero')}
  </div>`;
};
