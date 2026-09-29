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
    crown: `<svg width="34" height="34" viewBox="0 0 36 36"><path d="M6 24 L11 8 L18 16 L25 8 L30 24 Z" fill="#FFC24B"></path><circle cx="12" cy="19" r="2" fill="#FF5D73"></circle><circle cx="24" cy="19" r="2" fill="#45C6F0"></circle></svg>`,
    diver: `<svg width="34" height="34" viewBox="0 0 36 36"><rect x="15" y="2" width="6" height="4" rx="1.5" fill="#B7832A"></rect><circle cx="18" cy="17" r="12.5" fill="#D9A441"></circle><circle cx="18" cy="18" r="7" fill="#BDEBFF" stroke="#B7832A" stroke-width="2.2"></circle><rect x="7" y="27" width="22" height="5" rx="2.5" fill="#B7832A"></rect></svg>`,
    space: `<svg width="34" height="34" viewBox="0 0 36 36"><path d="M26 7 l3-4" stroke="#8FA3C4" stroke-width="1.8" stroke-linecap="round"></path><circle cx="29.5" cy="3" r="2.2" fill="#FF5D73"></circle><circle cx="18" cy="17" r="12.5" fill="#DDF3FF" stroke="#8FA3C4" stroke-width="2"></circle><path d="M10.5 13 q3-6 9-7" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"></path><rect x="7" y="27" width="22" height="5" rx="2.5" fill="#9B7CFF"></rect></svg>`
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
    /* the region helmets: earned by a region's first full round (EQ.earnHelms), and the
       card says exactly that — plus the region's level while it is still shut */
    grid += EQD.HELMS.map(hm => {
      const wearing = s.hero.hat === hm.key;
      if (s[hm.flag]) return `<div class="press" onclick="EQ.wearHat('${hm.key}')" style="${wearing ? cardOn : cardOff}">
        ${wearing ? wearBadge : ''}${hatIcon[hm.key]}
        <div style="font:800 12px 'Baloo 2';color:#2A1F45;margin-top:4px">${TX(hm.name)}</div>
        <div style="font:700 10px Nunito;color:${wearing ? '#3DBE6E' : '#8B7A55'}">${wearing ? wearingLbl : ownedLbl}</div>
      </div>`;
      const shut = !EQ.regionOpen(hm.region);
      const lv = EQD.REGIONS[hm.region].level;
      return `<div class="press" onclick="EQ.helmHow('${hm.key}')" style="${cardLock}">
        <div style="opacity:0.4">${hatIcon[hm.key]}</div>
        <div style="font:800 12px 'Baloo 2';color:#8878A8;margin-top:4px">${TX(hm.name)}</div>
        <div style="font:700 10px Nunito;color:#A197BC">${TX(hm.note)}</div>
        ${shut ? `<div style="font:800 10px Nunito;color:#A197BC;margin-top:1px">${TX({ az: `Səviyyə ${lv}`, en: `Level ${lv}`, ru: `Уровень ${lv}` })}</div>` : ''}
      </div>`;
    }).join('');
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

  /* the current chapter's relic: one piece per stage whose boss was actually beaten
     (EQ.relicNow). A stage the calendar moved past is named as such — never a loss, the
     chapter comes round again */
  const rl = EQ.relicNow(), R = rl.relic;
  const bars = [0, 1, 2].map(i => `<div style="width:38px;height:8px;border-radius:4px;background:${rl.mask & (1 << i) ? R.color : 'rgba(255,255,255,0.2)'}"></div>`).join('');
  const relicLine = rl.whole ? TX(R.done)
    : rl.missed ? TX(R.goal) + ' ' + TX({ az: 'Bir mərhələ boss-suz keçdi — bu fəsil yenidən gələndə onu da yığa bilərsən.', en: 'A stage passed without its boss — you can collect it when this chapter comes round again.', ru: 'Один этап прошёл без босса — соберёшь его, когда эта глава вернётся.' })
    : TX(R.goal);

  return `<div class="scr" style="background:#FFF7EA">
    <div style="position:absolute;top:0;left:0;right:0;height:250px;background:#2C1F52;border-radius:0 0 36px 36px;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(220px 200px at 74% 60%, ${R.glow}, rgba(44,31,82,0) 72%)"></div>
      <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
        <div class="press" onclick="EQ.go('map')" style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#fff', 19)}</div>
        <div style="flex:1;font:800 21px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Çantam', en: 'My bag', ru: 'Моя сумка' })}</div>
      </div>
      <div style="position:absolute;bottom:20px;left:16px;right:16px;display:flex;align-items:center;gap:14px">
        <div style="width:76px;height:76px;border-radius:26px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;flex:none"><svg width="44" height="44" viewBox="0 0 36 36"${rl.have ? '' : ' style="opacity:0.35"'}>${R.art}</svg></div>
        <div style="flex:1">
          <div id="relic-name" style="font:800 18px 'Baloo 2', system-ui;color:#fff">${TX(rl.whole ? R.whole : R.piece)} · ${rl.have}/${EQD.STAGES_PER_CHAPTER}</div>
          <div id="relic-line" style="font:700 12.5px Nunito;color:#A896E0;margin-top:4px;line-height:1.45">${relicLine}</div>
          <div id="relic-bars" style="display:flex;gap:6px;margin-top:8px">${bars}</div>
        </div>
      </div>
    </div>

    <div style="position:absolute;top:274px;left:16px;right:16px">
      <div style="font:800 11px Nunito;color:#A08A5E;letter-spacing:1.6px">${TX({ az: 'MACƏRA ƏŞYALARI', en: 'QUEST ITEMS', ru: 'ПРЕДМЕТЫ КВЕСТА' })}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-top:12px">
        <div id="relic-cell" style="aspect-ratio:1;border-radius:20px;background:${rl.have ? '#fff' : 'rgba(42,31,69,0.06)'};box-shadow:${rl.have ? `0 4px 0 #E0C79A, 0 0 0 3px ${R.color} inset` : 'none'};display:flex;align-items:center;justify-content:center;position:relative"><svg width="34" height="34" viewBox="0 0 36 36"${rl.have ? '' : ' style="opacity:0.3"'}>${R.art}</svg><div style="position:absolute;bottom:5px;right:7px;font:800 11px 'Baloo 2';color:#2A1F45">${rl.have}</div></div>
        <div style="aspect-ratio:1;border-radius:20px;background:rgba(42,31,69,0.06);display:flex;align-items:center;justify-content:center">${EQC.lock('#A197BC', 26)}</div>
      </div>
    </div>

    <div style="position:absolute;top:466px;left:16px;right:16px">
      <div style="font:800 11px Nunito;color:#A08A5E;letter-spacing:1.6px">${TX({ az: 'KÖMƏKÇİLƏR · YALNIZ QAZANILIR, ALINMIR', en: 'HELPERS · EARNED, NEVER BOUGHT', ru: 'ПОМОЩНИКИ · ТОЛЬКО ЗАРАБАТЫВАЮТСЯ' })}</div>
      <div id="spark-card" style="margin-top:12px;border-radius:22px;background:#fff;box-shadow:0 4px 0 #E0C79A;padding:14px;display:flex;align-items:center;gap:12px"><div style="width:40px;height:40px;border-radius:14px;background:#FFF3D6;display:flex;align-items:center;justify-content:center;flex:none">${EQC.bulb('#E39B1C', 20)}</div><div style="flex:1"><div style="font:800 14px 'Baloo 2';color:#2A1F45">${TX({ az: 'İpucu qığılcımı', en: 'Hint spark', ru: 'Искра-подсказка' })} · ×${s.hintSparks || 0}</div><div style="font:700 11px Nunito;color:#8B7A55;line-height:1.4;margin-top:2px">${TX({ az: 'İpucuna baxıb sonra həll etdiyin hər sual bir qığılcımdır. İpucu həmişə pulsuzdur.', en: 'Every question you solve after looking at its hint is a spark. Hints are always free.', ru: 'Каждый вопрос, решённый после подсказки, — это искра. Подсказки всегда бесплатны.' })}</div></div></div>
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

/* 17 · My home — the room is drawn from the save: every decoration in it is one the child
   owns, standing in the place they put it (EQD.HOME_SPOTS), and an empty place looks
   empty. A new room still looks lived in, because it comes with three starters that say
   they are starters. "Bəzə" opens decorating: tap one, then tap where it goes — the
   put-in-order panel's rule — and whatever is not in the room waits in the box below. */
EQS.meta.home = { light: false };
EQS.screens.home = function (s) {
  const ed = EQ.session.decor, edit = !!ed, pick = ed && ed.pick;
  const pickD = pick ? EQD.DECOR_BY_ID[pick.id] : null;
  const at = s.decorAt || {};
  const owned = s.decorIds || [];
  const pop = EQ.session.decorPop;
  const placed = EQD.HOME_SPOTS.filter(sp => at[sp.id]).length;
  const earnable = EQD.DECOR.filter(d => !d.start);
  const earned = earnable.filter(d => owned.indexOf(d.id) >= 0).length;
  const waiting = EQ.decorWaiting();

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

  /* one decoration drawn at the size of its place: the rug and the hanging ones are
     wide pictures, the rest square — standing on the shelf or floor, centred on a wall */
  const art = (d, sp) => {
    if (d.wide) return `<svg width="${sp.w}" height="${sp.h}" viewBox="${d.wide.vb}" preserveAspectRatio="xMidYMid meet" style="display:block">${d.wide.svg}</svg>`;
    const z = sp.kind === 'shelf' ? 46 : sp.kind === 'wall' ? Math.min(sp.w, sp.h) : Math.min(sp.w, sp.h) - 8;
    return `<svg width="${z}" height="${z}" viewBox="0 0 36 36" style="display:block">${d.art}</svg>`;
  };
  /* an empty place on the wall is a nail, an empty ceiling a hook — nothing pretends to be there */
  const nail = '<div style="width:9px;height:9px;border-radius:5px;background:#D8BC92;box-shadow:0 1.5px 0 #C4A57A"></div>';
  const hook = '<svg width="14" height="22" viewBox="0 0 14 22" style="align-self:flex-start"><path d="M7 0 V12 a4 4 0 1 1 -4 4" fill="none" stroke="#C4A57A" stroke-width="2.4" stroke-linecap="round"></path></svg>';
  const place = sp => {
    const d = at[sp.id] ? EQD.DECOR_BY_ID[at[sp.id]] : null;
    const up = pick && pick.from === sp.id;
    const cls = [!edit && d ? 'press' : '', pop === sp.id ? 'pop' : ''].filter(Boolean).join(' ');
    const align = sp.kind === 'wall' || sp.kind === 'hang' ? 'center' : 'flex-end';
    const inner = d ? art(d, sp) : edit ? '' : sp.kind === 'wall' ? nail : sp.kind === 'hang' ? hook : '';
    return `<div id="spot-${sp.id}"${cls ? ` class="${cls}"` : ''}${!edit && d ? ` onclick="EQ.decorPeek('${d.id}')"` : ''} data-decor="${d ? d.id : ''}" style="position:absolute;left:${sp.x}px;top:${sp.y}px;width:${sp.w}px;height:${sp.h}px;display:flex;align-items:${align};justify-content:center${up ? ';transform:translateY(-6px);filter:drop-shadow(0 6px 0 rgba(123,92,255,0.5))' : ''}">${inner}</div>`;
  };
  const kinds = k => EQD.HOME_SPOTS.filter(sp => sp.kind === k).map(place).join('');

  /* while decorating, every place is a target drawn over everything (the hero and Questy
     let taps through): the ones the decoration in hand fits glow green, the rest dim */
  const target = sp => {
    const mineHere = pick && pick.from === sp.id;
    const fits = !!(pickD && pickD.kind === sp.kind && !mineHere);
    const border = mineHere ? '3px solid #7B5CFF' : fits ? '2.5px dashed #2A9455' : '2px dashed rgba(42,31,69,0.30)';
    const bg = mineHere ? 'rgba(123,92,255,0.12)' : fits ? 'rgba(61,190,110,0.18)' : 'rgba(255,247,234,0.10)';
    const plus = at[sp.id] ? '' : `<div style="font:800 22px 'Baloo 2', system-ui;color:${fits ? '#2A9455' : 'rgba(42,31,69,0.34)'}">+</div>`;
    return `<div class="press" id="target-${sp.id}" onclick="EQ.decorSpot('${sp.id}')" style="position:absolute;left:${sp.x - 1}px;top:${sp.y - 1}px;width:${sp.w + 2}px;height:${sp.h + 2}px;border-radius:14px;border:${border};background:${bg};display:flex;align-items:center;justify-content:center${pickD && !fits && !mineHere ? ';opacity:0.4' : ''}">${plus}</div>`;
  };

  /* the card: a decoration earned and never put anywhere — one at a time, trophies first */
  let card = '';
  if (!edit && waiting.length) {
    const w = waiting[0], nm = TX(w.name), more = waiting.length - 1;
    const title = w.trophy
      ? TX({ az: `${nm} qazanıldı`, en: `${nm} earned`, ru: `${nm} — получен!` })
      : TX({ az: `Yeni bəzək: ${nm}`, en: `New decoration: ${nm}`, ru: `Новое украшение: ${nm}` });
    const sub = TX(w.trophy
      ? { az: 'Rəfə qoymaq üçün toxun', en: 'Tap to place it on your shelf', ru: 'Нажми, чтобы поставить на полку' }
      : { az: 'Otağa qoymaq üçün toxun', en: 'Tap to put it in your room', ru: 'Нажми, чтобы поставить в комнату' })
      + (more ? ' · ' + TX({ az: `daha ${more} gözləyir`, en: `${more} more waiting`, ru: `ещё ${more} ${RUP(more, 'ждёт', 'ждут', 'ждут')}` }) : '');
    card = `<div id="decor-card" class="press rise" onclick="EQ.placeNew('${w.id}')" style="position:absolute;bottom:112px;left:16px;right:16px;background:#FFF7EA;border-radius:24px;padding:12px 14px;box-shadow:0 5px 0 #D8BC92;display:flex;align-items:center;gap:12px;z-index:30">
      <div style="width:48px;height:48px;border-radius:16px;background:#EFE7FF;display:flex;align-items:center;justify-content:center;flex:none"><svg width="34" height="34" viewBox="0 0 36 36">${w.art}</svg></div>
      <div style="flex:1;min-width:0"><div style="font:800 14px 'Baloo 2';color:#2A1F45;line-height:1.2">${title}</div><div style="font:700 11.5px Nunito;color:#8B7A55;margin-top:2px">${sub}</div></div>
      <div style="width:36px;height:36px;border-radius:14px;background:#3DBE6E;box-shadow:0 3px 0 #2A9455;display:flex;align-items:center;justify-content:center;flex:none"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 5 v14 M5 12 h14" stroke="#fff" stroke-width="3" stroke-linecap="round"></path></svg></div>
    </div>`;
  }

  /* the box: what is owned and not in the room (the new ones first, badged), then the
     ones still to earn as silhouettes that say what they take */
  let drawer = '';
  if (edit) {
    const fresh = s.decorNew || [];
    const inBox = EQD.DECOR.filter(d => owned.indexOf(d.id) >= 0 && !EQ.decorSpotOf(d.id))
      .sort((a, b) => (fresh.indexOf(b.id) >= 0) - (fresh.indexOf(a.id) >= 0));
    const locked = EQD.DECOR.filter(d => owned.indexOf(d.id) < 0);
    const label = t => `<div style="font:800 9.5px Nunito;color:#D9CEFF;margin-top:5px;line-height:1.2;text-align:center;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2">${t}</div>`;
    const tile = d => {
      const on = pick && pick.id === d.id && !pick.from;
      const isNew = fresh.indexOf(d.id) >= 0;
      return `<div class="press" id="tile-${d.id}" onclick="EQ.decorPick('${d.id}')" style="flex:none;width:74px;position:relative">
        ${isNew ? `<div style="position:absolute;top:-6px;right:0;padding:0 6px;height:18px;border-radius:9px;background:#3DBE6E;box-shadow:0 2px 0 #2A9455;display:flex;align-items:center;font:800 8.5px Nunito;color:#fff;letter-spacing:0.4px;z-index:2">${TX({ az: 'YENİ', en: 'NEW', ru: 'НОВОЕ' })}</div>` : ''}
        <div style="width:64px;height:64px;margin:0 auto;border-radius:20px;background:${on ? '#EFE7FF' : '#FFF7EA'};box-shadow:${on ? '0 0 0 3px #7B5CFF, 0 6px 0 #5B3FD6' : '0 4px 0 #C9B48E'};display:flex;align-items:center;justify-content:center${on ? ';transform:translateY(-4px)' : ''}"><svg width="44" height="44" viewBox="0 0 36 36">${d.art}</svg></div>
        ${label(TX(d.name))}
      </div>`;
    };
    const lockTile = d => `<div class="press" onclick="EQ.decorPick('${d.id}')" style="flex:none;width:74px">
        <div style="width:64px;height:64px;margin:0 auto;border-radius:20px;background:rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;position:relative"><svg width="40" height="40" viewBox="0 0 36 36" style="opacity:0.2">${d.art}</svg><div style="position:absolute;bottom:5px;right:6px">${EQC.lock('#A896E0', 14)}</div></div>
        ${label(TX({ az: 'Hələ gizlidir', en: 'Still hidden', ru: 'Ещё скрыто' }))}
      </div>`;
    const back = pick && pick.from ? `<div class="press" id="tile-box" onclick="EQ.decorBox()" style="flex:none;width:74px">
        <div style="width:64px;height:64px;margin:0 auto;border-radius:20px;border:2.5px dashed #FFD98A;background:rgba(255,217,138,0.12);display:flex;align-items:center;justify-content:center"><svg width="34" height="34" viewBox="0 0 36 36"><path d="M5 14 h26 v16 a2 2 0 0 1 -2 2 H7 a2 2 0 0 1 -2 -2 Z" fill="#C9762F"></path><path d="M3 9 h30 v6 H3 Z" fill="#E0A365"></path><path d="M14 20 h8" stroke="#FFF7EA" stroke-width="2.4" stroke-linecap="round"></path></svg></div>
        ${label(TX({ az: 'Qutuya qoy', en: 'Put in the box', ru: 'Убрать в коробку' }))}
      </div>` : '';
    const empty = !inBox.length && !back ? `<div style="flex:none;width:118px;height:64px;border-radius:20px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;padding:0 10px;font:700 10.5px Nunito;color:#BFF0D3;text-align:center;line-height:1.3">${TX({ az: 'Qutu boşdur — hamısı otaqdadır!', en: 'The box is empty — it is all in the room!', ru: 'Коробка пуста — всё в комнате!' })}</div>` : '';
    drawer = `<div id="decor-box" style="position:absolute;left:12px;right:12px;bottom:26px;height:156px;border-radius:30px;background:rgba(30,21,54,0.96);box-shadow:0 -2px 0 rgba(255,255,255,0.10) inset, 0 14px 30px -8px rgba(12,6,28,0.7);z-index:40">
      <div style="display:flex;align-items:baseline;gap:8px;padding:13px 18px 0">
        <div style="font:800 11px Nunito;color:#FFD98A;letter-spacing:1.4px">${TX({ az: `QUTUDA ${inBox.length}`, en: `IN THE BOX · ${inBox.length}`, ru: `В КОРОБКЕ · ${inBox.length}` })}</div>
        <div style="font:700 10.5px Nunito;color:#A896E0">${TX({ az: `${locked.length} hələ qazanılmayıb`, en: `${locked.length} still to earn`, ru: `ещё не получено: ${locked.length}` })}</div>
      </div>
      <div class="vscroll" style="display:flex;gap:6px;overflow-x:auto;overflow-y:hidden;padding:12px 12px 10px">${back}${empty}${inBox.map(tile).join('')}${locked.map(lockTile).join('')}</div>
    </div>`;
  }

  const sub = edit
    ? (pickD
      ? TX({ az: `${TX(pickD.name)} — hara qoyaq? Yaşıl yerə toxun`, en: `${TX(pickD.name)} — where to? Tap a green place`, ru: `${TX(pickD.name)} — куда? Нажми на зелёное место` })
      : TX({ az: 'Bir bəzəyə toxun, sonra onun yerinə', en: 'Tap a decoration, then where it goes', ru: 'Нажми на украшение, потом — куда его поставить' }))
    : TX({ az: `Otaqda ${placed} bəzək · ${earned}/${earnable.length} qazanılıb`, en: `${placed} in the room · ${earned} of ${earnable.length} earned`, ru: `В комнате: ${placed} · получено ${earned} из ${earnable.length}` });
  const btn = edit
    ? `<div class="press" onclick="EQ.decorDone()" style="height:44px;padding:0 16px;border-radius:16px;background:#3DBE6E;box-shadow:0 4px 0 #2A9455;display:flex;align-items:center;gap:7px;font:800 13px 'Baloo 2';color:#fff;flex:none">${EQC.check('#fff', 15, 3.4)}${TX({ az: 'Hazır', en: 'Done', ru: 'Готово' })}</div>`
    : `<div class="press" onclick="EQ.decorEdit()" style="position:relative;height:44px;padding:0 14px;border-radius:16px;background:#7B5CFF;box-shadow:0 4px 0 #5B3FD6;display:flex;align-items:center;gap:7px;font:800 13px 'Baloo 2';color:#fff;flex:none">
        ${waiting.length ? `<div style="position:absolute;right:-6px;top:-7px;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:#FF5D73;box-shadow:0 3px 0 #D63A52;display:flex;align-items:center;justify-content:center;font:800 11.5px 'Baloo 2', system-ui;color:#fff">${waiting.length}</div>` : ''}
        <svg width="15" height="15" viewBox="0 0 24 24"><path d="M4 20 h4 L20 8 l-4-4 -12 12 Z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"></path></svg>${TX({ az: 'Bəzə', en: 'Decorate', ru: 'Украсить' })}</div>`;
  const still = edit ? ';pointer-events:none' : '';

  return `<div class="scr" style="background:#FBE9CC">
    <div style="position:absolute;inset:0">
      <div style="position:absolute;top:0;left:0;right:0;height:600px;background:#F6E0C0"></div>
      <div style="position:absolute;top:0;left:0;right:0;height:190px;background:#EFD3AC"></div>
      <div style="position:absolute;top:600px;left:0;right:0;bottom:0;background:#C99C63"></div>
      <div style="position:absolute;top:600px;left:0;right:0;height:12px;background:#B0834B"></div>
      <div style="position:absolute;top:206px;left:24px;width:126px;height:112px;border-radius:14px;background:#8FD8F5;box-shadow:0 0 0 8px #E0A365"></div>
      <div style="position:absolute;top:218px;left:36px;width:44px;height:36px;border-radius:22px;background:#FFF7EA;opacity:0.7"></div>
      <div style="position:absolute;top:286px;left:34px;width:106px;height:32px;background:#7FCFA0;border-radius:0 0 12px 12px"></div>
      ${[372, 452].map(y => `<div style="position:absolute;left:186px;top:${y}px;width:202px;height:9px;border-radius:4px;background:#C9762F;box-shadow:0 3px 0 #A8622A"></div><div style="position:absolute;left:204px;top:${y + 9}px;width:8px;height:13px;border-radius:0 0 4px 4px;background:#B0834B"></div><div style="position:absolute;left:362px;top:${y + 9}px;width:8px;height:13px;border-radius:0 0 4px 4px;background:#B0834B"></div>`).join('')}
    </div>

    ${kinds('hang')}${kinds('wall')}${kinds('shelf')}
    ${wallStickers}

    <div style="position:absolute;top:520px;left:20px;width:150px;height:90px">
      <div style="position:absolute;bottom:0;left:0;right:0;height:56px;border-radius:10px;background:#7B5CFF"></div>
      <div style="position:absolute;bottom:38px;left:8px;right:8px;height:30px;border-radius:10px;background:#FFF7EA"></div>
      <div style="position:absolute;bottom:56px;left:16px;width:36px;height:24px;border-radius:6px;background:#EFD3AC"></div>
    </div>

    ${kinds('rug')}${kinds('floor')}

    ${EQC.hero(s.hero, 'position:absolute;bottom:230px;left:150px;width:110px' + still)}
    <div class="press" onclick="EQ.go('care')" style="position:absolute;bottom:224px;left:248px;width:74px${still}">
      ${EQ.careLeft() && !edit ? `<div style="position:absolute;right:-6px;top:-6px;min-width:24px;height:24px;padding:0 6px;border-radius:12px;background:#FF5D73;box-shadow:0 3px 0 #D63A52;display:flex;align-items:center;justify-content:center;font:800 12px 'Baloo 2', system-ui;color:#fff;z-index:2">${EQ.careLeft()}</div>` : ''}
      ${EQC.questy(EQ.careMood(), 'width:74px', s.questyFur, s.questyFurDark)}
    </div>

    ${edit ? `<div style="position:absolute;inset:0;z-index:30">${EQD.HOME_SPOTS.map(target).join('')}</div>` : ''}

    <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:10px;z-index:35">
      <div class="press" onclick="EQ.go('map')" style="width:44px;height:44px;border-radius:16px;background:rgba(42,31,69,0.14);display:flex;align-items:center;justify-content:center;flex:none">${EQC.chevL('#2A1F45', 19)}</div>
      <div style="flex:1;min-width:0"><div style="font:800 20px 'Baloo 2', system-ui;color:#2A1F45">${TX({ az: 'Evim', en: 'My home', ru: 'Мой дом' })}</div><div id="home-sub" style="font:700 11px Nunito;color:#8B7A55;line-height:1.3">${sub}</div></div>
      ${btn}
    </div>

    ${card}
    ${edit ? drawer : EQC.nav('hero')}
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
  /* the six trophies and how far along each one is — the same table the shelf at home
     reads (EQ.TROPHY_RULES), so a trophy is on both or on neither */
  const trophies = EQD.TROPHIES.map(t => ({ t, p: EQ.TROPHY_RULES[t.id](s, EQ) }));
  const won = trophies.filter(x => x.p.have >= x.p.need).length;
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
  return `<div class="scr" style="background:#FFF7EA">
    <div style="position:absolute;top:0;left:0;right:0;height:284px;background:#2C1F52;border-radius:0 0 36px 36px;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(240px 200px at 76% 30%, rgba(255,138,76,0.35), rgba(44,31,82,0) 72%)"></div>
      <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
        <div style="flex:1"><div style="font:800 21px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Kubokların', en: 'Your trophies', ru: 'Твои кубки' })}</div><div style="font:700 11px Nunito;color:#A896E0">${TX({ az: `${won}/${trophies.length} kubok qazanılıb`, en: `${won} of ${trophies.length} earned`, ru: `Получено ${won} из ${trophies.length}` })}</div></div>
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
      ${trophies.map(x => EQS.trophyCard(x.t, x.p)).join('')}
    </div>
    ${EQC.nav('awards')}
  </div>`;
};

/* one trophy on the Awards screen: a one-step trophy is greyed until it is won, then
   ticked; a counted one is a goal card (EQS.goalCard) */
EQS.trophyCard = function (t, p) {
  if (p.need > 1) return EQS.goalCard(t.title, p.live || !t.shut ? t.how : t.shut, p.have, p.need, p.live, t.bg, t.ink, t.bar, t.icon);
  if (p.have >= p.need) return `<div style="border-radius:24px;background:#fff;box-shadow:0 5px 0 #E0C79A;padding:14px;display:flex;align-items:center;gap:13px">
        <div style="width:54px;height:54px;border-radius:20px;background:${t.bg};display:flex;align-items:center;justify-content:center;flex:none">${t.icon}</div>
        <div style="flex:1"><div style="font:800 16px 'Baloo 2';color:#2A1F45">${TX(t.title)}</div><div style="font:700 12px Nunito;color:#8B7A55">${TX(t.how)}</div></div>
        <div style="width:30px;height:30px;border-radius:15px;background:#3DBE6E;display:flex;align-items:center;justify-content:center;flex:none">${EQC.check('#fff', 15, 3.6)}</div>
      </div>`;
  return `<div style="border-radius:24px;background:rgba(42,31,69,0.06);padding:14px;display:flex;align-items:center;gap:13px">
        <div style="width:54px;height:54px;border-radius:20px;background:rgba(42,31,69,0.08);display:flex;align-items:center;justify-content:center;flex:none">${EQC.trophy('#A197BC', 30)}</div>
        <div style="flex:1"><div style="font:800 16px 'Baloo 2';color:#8878A8">${TX(t.title)}</div><div style="font:700 12px Nunito;color:#A197BC">${TX(t.how)}</div></div>
      </div>`;
};

/* a trophy with a counter: greyed with a lock until it can be worked on at all, then a
   progress bar, then a tick once the goal is met */
EQS.goalCard = function (title, sub, have, need, live, bg, ink, bar, icon) {
  const got = Math.min(have, need);
  if (!live) return `<div style="border-radius:24px;background:rgba(42,31,69,0.06);padding:14px;display:flex;align-items:center;gap:13px">
      <div style="width:54px;height:54px;border-radius:20px;background:rgba(42,31,69,0.08);display:flex;align-items:center;justify-content:center;flex:none">${EQC.lock('#A197BC', 24)}</div>
      <div style="flex:1"><div style="font:800 16px 'Baloo 2';color:#8878A8">${TX(title)}</div><div style="font:700 12px Nunito;color:#A197BC">${TX(sub)}</div></div>
    </div>`;
  const end = have >= need
    ? `<div style="width:30px;height:30px;border-radius:15px;background:#3DBE6E;display:flex;align-items:center;justify-content:center;flex:none">${EQC.check('#fff', 15, 3.6)}</div>`
    : `<div style="font:800 13px 'Baloo 2';color:${ink};flex:none">${got}/${need}</div>`;
  return `<div style="border-radius:24px;background:#fff;box-shadow:0 5px 0 #E0C79A;padding:14px;display:flex;align-items:center;gap:13px">
      <div style="width:54px;height:54px;border-radius:20px;background:${bg};display:flex;align-items:center;justify-content:center;flex:none">${icon}</div>
      <div style="flex:1"><div style="font:800 16px 'Baloo 2';color:#2A1F45">${TX(title)}</div><div style="font:700 12px Nunito;color:#8B7A55">${TX(sub)}</div><div style="height:9px;border-radius:5px;background:#EAD9BC;margin-top:7px;overflow:hidden"><div style="width:${Math.round(got / need * 100)}%;height:100%;background:${bar};border-radius:5px"></div></div></div>
      ${end}
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
  const justGot = EQ.session.justAdded || []; /* the stickers not yet looked at when the album opened */

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
    const isNew = justGot.indexOf(st.id) >= 0;
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
    ? TX({ az: 'Albomun boşdur — hər yerin altında onu necə qazanacağın yazılıb!', en: 'Your album is empty — under every slot it says how to earn it!', ru: 'Твой альбом пуст — под каждым местом написано, как её получить!' })
    : owned.length >= total
      ? TX({ az: '24-ün 24-ü! Albom tamamdır — sən əsl kolleksiyaçısan!', en: 'All 24! The album is full — you are a true collector!', ru: 'Все 24! Альбом полон — ты настоящий коллекционер!' })
      : TX({
        az: `Daha ${total - owned.length} stiker qaldı. Hər birini necə qazanacağın altında yazılıb!`,
        en: `${total - owned.length} sticker${total - owned.length === 1 ? '' : 's'} to go. Each one says how to earn it!`,
        ru: `Осталось ${total - owned.length} ${RUP(total - owned.length, 'наклейка', 'наклейки', 'наклеек')}. Под каждой написано, как её получить!`
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

/* 18c · Stickers just earned — the beat between the moment that earned them and the next
   screen. A chest sticker arrives here from the chest; every other one from whatever its
   `how` names (EQ.checkStickers), so the screen says which thing it was. Several can come
   at once — the first boss is three of them — and they are shown together, not one by one. */
EQS.meta.sticker = { light: false };
EQS.screens.sticker = function (s) {
  const fresh = (s.stickerNew || []).map(id => EQD.STICKER_BY_ID[id]).filter(Boolean);
  const st = fresh[0] || EQD.STICKERS[0];
  const more = fresh.slice(1);
  const why = st.chest && st.id !== 'leaf'
    ? TX({ az: 'Sandıqdan çıxdı', en: 'Out of the chest', ru: 'Из сундука' })
    : '✓ ' + TX(st.how);
  const set = EQD.STICKER_SETS.filter(x => x.id === st.set)[0] || EQD.STICKER_SETS[0];
  const owned = (s.stickerIds || []).length;
  const total = EQD.STICKERS.length;
  return `<div class="scr" style="background:#1E1338">
    <div style="position:absolute;inset:0;background:radial-gradient(300px 280px at 50% 34%, rgba(255,194,75,0.32), rgba(30,19,56,0) 70%)"></div>
    <div style="position:absolute;top:96px;left:20px;right:20px;text-align:center">
      <div style="font:800 11px Nunito;color:#FFD98A;letter-spacing:2.4px">${more.length
        ? TX({ az: `ALBOMUNA ${fresh.length} YENİ STİKER`, en: `${fresh.length} NEW STICKERS FOR YOUR ALBUM`, ru: `${fresh.length} ${RUP(fresh.length, 'НОВАЯ НАКЛЕЙКА', 'НОВЫЕ НАКЛЕЙКИ', 'НОВЫХ НАКЛЕЕК')} В АЛЬБОМ` })
        : TX({ az: 'ALBOMUNA YENİ STİKER', en: 'NEW STICKER FOR YOUR ALBUM', ru: 'НОВАЯ НАКЛЕЙКА В АЛЬБОМ' })}</div>
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
      <div style="font:800 13px Nunito;color:#7FE0AE;margin-top:6px">${why}</div>
      ${more.length ? `<div style="display:flex;justify-content:center;gap:8px;margin-top:12px">${more.slice(0, 5).map(x => `<div class="pop" style="width:40px;height:40px;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center"><svg width="28" height="28" viewBox="0 0 36 36">${x.art}</svg></div>`).join('')}${more.length > 5 ? `<div style="height:40px;display:flex;align-items:center;font:800 14px 'Baloo 2';color:#FFD98A">+${more.length - 5}</div>` : ''}</div>` : ''}
      <div style="display:inline-flex;align-items:center;gap:8px;margin-top:16px;padding:8px 16px;border-radius:18px;background:rgba(255,255,255,0.08)">
        <span style="font:800 13px 'Baloo 2';color:#FFD98A">${owned}/${total}</span>
        <span style="font:700 11.5px Nunito;color:#A896E0">${TX({ az: 'albomunda', en: 'in your album', ru: 'в твоём альбоме' })}</span>
      </div>
    </div>
    <div style="position:absolute;bottom:196px;left:20px;right:20px">
      ${EQC.bubble('excited', more.length ? TX({
        az: 'Hamısını albomuna yapışdırdım! İstədiyin vaxt çantandan baxa bilərsən.',
        en: 'I stuck them all in your album! You can look at them any time from your bag.',
        ru: 'Я вклеил их все в твой альбом! Можешь посмотреть в любой момент из сумки.'
      }) : TX({
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
