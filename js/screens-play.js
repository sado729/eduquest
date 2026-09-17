/* EduQuest — the play loop (design screens 08, 09, 10, 21, 11, 12, 13, 14) */

/* dragon meadow scene shared by daily challenges (from screen 08) */
EQS.dragonScene = function () {
  return `<svg viewBox="0 0 402 380" width="402" height="380" style="position:absolute;top:0;left:0">
    <rect width="402" height="380" fill="#A9E2FA"></rect>
    <circle cx="60" cy="86" r="40" fill="#FFE9A8" opacity="0.55"></circle>
    <g fill="#FFFFFF" opacity="0.9"><ellipse cx="300" cy="110" rx="40" ry="18"></ellipse><ellipse cx="332" cy="102" rx="26" ry="16"></ellipse></g>
    <path d="M0 250 q60-30 110-6 q60 30 120 0 q70-34 172 4 v132 H0 Z" fill="#7FCFA0"></path>
    <path d="M0 292 h402 v88 H0 Z" fill="#4B8F66"></path>
    <path d="M0 300 q90 26 200 0 q110-26 202 6 v74 H0 Z" fill="#3D7856"></path>
    <rect x="0" y="286" width="402" height="16" rx="8" fill="#C9762F"></rect>
    <rect x="0" y="292" width="402" height="8" fill="#A45C21"></rect>
    <g fill="#A45C21"><rect x="36" y="300" width="12" height="46" rx="4"></rect><rect x="150" y="300" width="12" height="46" rx="4"></rect><rect x="256" y="300" width="12" height="46" rx="4"></rect><rect x="356" y="300" width="12" height="46" rx="4"></rect></g>
    <g>
      <path d="M258 214 q-30-26 -42-6 q16 4 20 20 Z" fill="#7B5CFF"></path>
      <path d="M336 232 q34 4 38-22 q-2 20 -26 24 Z" fill="#2A9455"></path>
      <ellipse cx="292" cy="240" rx="58" ry="42" fill="#3DBE6E"></ellipse>
      <ellipse cx="296" cy="250" rx="38" ry="28" fill="#BFF0D3"></ellipse>
      <path d="M262 196 l8 14 h-16 Z M286 190 l8 14 h-16 Z M310 196 l8 14 h-16 Z" fill="#FFC24B"></path>
      <ellipse cx="272" cy="180" rx="42" ry="34" fill="#54D083"></ellipse>
      <ellipse cx="240" cy="192" rx="22" ry="15" fill="#6BDC96"></ellipse>
      <circle cx="232" cy="190" r="2.6" fill="#2A6B45"></circle><circle cx="240" cy="196" r="2.2" fill="#2A6B45"></circle>
      <path d="M256 146 l5-14 8 12 Z M288 144 l3-15 9 11 Z" fill="#FFE9A8"></path>
      <ellipse cx="256" cy="170" rx="11" ry="12" fill="#FFF7EA"></ellipse><ellipse cx="288" cy="168" rx="11" ry="12" fill="#FFF7EA"></ellipse>
      <circle cx="258" cy="172" r="6" fill="#2A1F45"></circle><circle cx="290" cy="170" r="6" fill="#2A1F45"></circle>
      <circle cx="260" cy="169" r="2" fill="#fff"></circle><circle cx="292" cy="167" r="2" fill="#fff"></circle>
      <path d="M248 202 q14 12 28 2" stroke="#2A6B45" stroke-width="3" fill="none" stroke-linecap="round"></path>
    </g>
  </svg>`;
};

EQS.progressPips = function (s, activeIdx, total) {
  const pips = [];
  for (let i = 0; i < (total || 5); i++) pips.push(i);
  return pips.map(i => {
    if (i < activeIdx) return `<div style="flex:1;height:12px;border-radius:6px;background:#5CE39B"></div>`;
    if (i === activeIdx) return `<div style="flex:1;height:12px;border-radius:6px;background:rgba(30,21,54,0.35);box-shadow:0 0 0 2px #FFC24B inset"></div>`;
    return `<div style="flex:1;height:12px;border-radius:6px;background:rgba(30,21,54,0.28)"></div>`;
  }).join('');
};

/* 08 · Educational challenge */
EQS.meta.challenge = { light: false };
EQS.screens.challenge = function (s) {
  const q = EQ.session.q;
  /* the same screen serves the daily quest and a parent-approved mission; only the
     counter, the exit and the badge above the question change */
  const mis = EQ.session.ctx === 'mission' ? EQ.missionEntry() : null;
  const total = mis ? EQD.MISSION_LEN : 5;
  const idx = mis ? mis.n : s.challengesDone;
  const exitTo = mis ? 'mission' : 'quest';
  const counter = mis
    ? TX({ az: `Missiya ${Math.min(total, idx + 1)} / ${total}`, en: `Mission ${Math.min(total, idx + 1)} of ${total}`, ru: `Миссия ${Math.min(total, idx + 1)} из ${total}` })
    : TX({ az: `Sınaq ${Math.min(5, s.challengesDone + 1)} / 5`, en: `Challenge ${Math.min(5, s.challengesDone + 1)} of 5`, ru: `Испытание ${Math.min(5, s.challengesDone + 1)} из 5` });
  const answers = q.answers.map((a, i) => `
    <div class="press ans" id="ans-${i}" onclick="EQ.answer(${i})" style="flex:1;height:96px;border-radius:26px;background:#fff;box-shadow:0 6px 0 #C9BCA6;display:flex;align-items:center;justify-content:center;font:800 38px 'Baloo 2', system-ui;color:#2A1F45">${a}</div>`).join('');
  return `<div class="scr" style="background:#BFE9FB">
    ${EQS.dragonScene()}
    ${EQC.hero(s.hero, 'position:absolute;left:34px;top:196px;width:78px')}
    <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
      <div class="press" onclick="EQ.go('${exitTo}')" style="width:44px;height:44px;border-radius:16px;background:rgba(30,21,54,0.82);display:flex;align-items:center;justify-content:center;flex:none">${EQC.xIcon('#fff', 17)}</div>
      <div style="flex:1;display:flex;gap:5px;align-items:center">${EQS.progressPips(s, idx, total)}</div>
      <div class="press" onclick="EQ.go('hint')" style="width:44px;height:44px;border-radius:16px;background:#FFC24B;box-shadow:0 4px 0 #E39B1C;display:flex;align-items:center;justify-content:center;flex:none">${EQC.bulb('#4A3208', 20)}</div>
    </div>
    <div class="rise" style="position:absolute;top:352px;left:16px;right:16px;background:#FFF7EA;border-radius:30px;padding:20px;box-shadow:0 7px 0 #E0C79A, 0 20px 34px -16px rgba(20,10,40,0.45)">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="padding:4px 10px;border-radius:10px;background:#E4F6FF;font:800 10px Nunito;color:#2196C9;letter-spacing:1.2px">${TX(q.tag)}</div>
        <div style="font:700 11px Nunito;color:#A08A5E">${counter}</div>
      </div>
      <div style="font:800 21px 'Baloo 2', system-ui;color:#2A1F45;margin-top:12px;line-height:1.25">${TX(q.title)}</div>
      ${q.visual()}
    </div>
    <div style="position:absolute;top:640px;left:16px;right:16px;display:flex;gap:12px">${answers}</div>
    <div style="position:absolute;bottom:44px;left:16px;right:16px;display:flex;align-items:flex-end;gap:10px">
      ${EQC.questy('thinking', 'width:76px', s.questyFur, s.questyFurDark)}
      <div style="flex:1;background:rgba(30,21,54,0.9);border-radius:22px;border-bottom-left-radius:8px;padding:14px 16px">
        <div style="font:700 14px Nunito;color:#fff;line-height:1.5">${q.tip ? TX(q.tip) : TX({ az: 'Tələsmə — mən burada gözləyirəm.', en: 'Take your time — I’ll wait right here.', ru: 'Не спеши — я подожду здесь.' })}</div>
      </div>
    </div>
  </div>`;
};

/* 09 · Correct answer */
EQS.meta.success = { light: false };
EQS.screens.success = function (s) {
  const q = EQ.session.q;
  const streakChip = EQ.session.streakRow >= 2
    ? TX({ az: `Dalbadal ${EQ.session.streakRow} dənə!`, en: `${EQ.session.streakRow} in a row!`, ru: `${EQ.session.streakRow} подряд!` })
    : TX({ az: 'Ağıllı fikirdir!', en: 'Nice thinking!', ru: 'Отлично соображаешь!' });
  const pct = Math.min(100, Math.round(s.xp / 1500 * 100));
  /* a mission question pays less than a daily challenge, so the two reward chips have
     to read the context rather than the fixed +50 / +10 of the adventure */
  const mis = EQ.session.ctx === 'mission' ? EQ.missionEntry() : null;
  const misDone = EQ.session.ctx === 'mission' && !mis;
  const gainXP = (mis || misDone) ? 25 : 50;
  const gainCoins = (mis || misDone) ? 5 : 10;
  let ctaText = TX({ az: 'Növbəti sınaq', en: 'Next challenge', ru: 'Следующее испытание' }), cta = "EQ.continueAfterSuccess()";
  if (EQ.session.ctx === 'boss') ctaText = s.bossHits >= EQ.bossHitsNeeded() ? TX({ az: 'Qələbəni götür', en: 'Claim your victory', ru: 'Забери свою победу' }) : TX({ az: 'Davam et', en: 'Keep going', ru: 'Продолжай' });
  else if (misDone) ctaText = TX({ az: 'Missiyanı bitir', en: 'Finish the mission', ru: 'Завершить миссию' });
  else if (mis) ctaText = TX({ az: 'Növbəti sual', en: 'Next question', ru: 'Следующий вопрос' });
  else if (s.challengesDone >= 5) ctaText = TX(EQ.boss().face);
  return `<div class="scr" style="background:#BFE9FB">
    <div style="position:absolute;inset:0;background:#A9E2FA"></div>
    <div class="rays" style="position:absolute;top:120px;left:-100px;right:-100px;height:600px;background:repeating-conic-gradient(from 0deg, rgba(255,255,255,0.5) 0 4deg, rgba(255,255,255,0) 4deg 22deg);mask-image:radial-gradient(closest-side, rgba(0,0,0,0.9) 24%, transparent 70%);-webkit-mask-image:radial-gradient(closest-side, rgba(0,0,0,0.9) 24%, transparent 70%);opacity:0.9"></div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:300px;background:#7FCFA0;border-radius:60% 40% 0 0 / 30px 30px 0 0"></div>
    <div class="spark" style="top:180px;left:50px;font-size:22px">✦</div>
    <div class="spark" style="top:150px;right:60px;font-size:16px;animation-delay:.5s">✦</div>
    <div class="spark" style="top:420px;left:30px;font-size:14px;animation-delay:.9s">✦</div>
    <div style="position:absolute;top:70px;left:16px;right:16px;display:flex;justify-content:center;gap:8px">
      <div class="pop" style="padding:8px 14px;border-radius:16px;background:rgba(30,21,54,0.82);font:800 12px Nunito;color:#5CE39B;letter-spacing:0.6px">${streakChip}</div>
    </div>
    <div style="position:absolute;top:130px;left:0;right:0;text-align:center">
      <div class="pop" style="font:800 46px 'Baloo 2', system-ui;color:#2A1F45;line-height:1.05">${TX({ az: 'Düz tapdın!', en: 'That&#39;s it!', ru: 'Точно!' })}</div>
      <div style="font:800 19px 'Baloo 2', system-ui;color:#3E8A5C;margin-top:8px">${q.successLine ? TX(q.successLine) : TX({ az: 'Əla düşündün!', en: 'Great thinking!', ru: 'Отличная мысль!' })}</div>
    </div>
    <div style="position:absolute;top:236px;left:0;right:0;display:flex;align-items:flex-end;justify-content:center;gap:0">
      ${EQC.hero(s.hero, 'width:150px')}
      ${EQC.questy('celebrating', 'width:124px;margin-bottom:6px', s.questyFur, s.questyFurDark)}
    </div>
    <div class="pop" style="position:absolute;top:250px;left:34px;padding:8px 14px;border-radius:18px;background:#5CE39B;box-shadow:0 5px 0 #2FA76D;font:800 18px 'Baloo 2', system-ui;color:#0B3D25">+${gainXP} XP</div>
    <div class="pop" style="position:absolute;top:320px;right:28px;padding:8px 14px;border-radius:18px;background:#FFC24B;box-shadow:0 5px 0 #E39B1C;font:800 18px 'Baloo 2', system-ui;color:#4A3208;animation-delay:120ms">${TX({ az: `+${gainCoins} sikkə`, en: `+${gainCoins} coins`, ru: `+${gainCoins} монет` })}</div>
    <div style="position:absolute;top:470px;left:22px;right:22px;background:#FFF7EA;border-radius:28px;padding:20px;box-shadow:0 7px 0 #E0C79A">
      <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font:800 12px Nunito;color:#8B7A55;letter-spacing:1.2px">${TX({ az: `SƏVİYYƏ ${s.level} · ${UPC(EQ.rank(s.level))}`, en: `LEVEL ${s.level} · ${UPC(EQ.rank(s.level))}`, ru: `УРОВЕНЬ ${s.level} · ${UPC(EQ.rank(s.level))}` })}</span><span style="font:800 13px Nunito;color:#2A9455">${EQC.fmt(s.xp)} / ${EQC.fmt(1500)}</span></div>
      <div style="height:16px;border-radius:8px;background:#EAD9BC;margin-top:10px;overflow:hidden;position:relative"><div style="width:${pct}%;height:100%;border-radius:8px;background:#5CE39B"></div><div style="position:absolute;left:${Math.max(0, pct - 8)}%;top:0;bottom:0;width:8%;background:rgba(255,255,255,0.55)"></div></div>
      <div style="display:flex;gap:10px;margin-top:16px">
        <div style="flex:1;border-radius:18px;background:#FBE9CC;padding:12px;text-align:center"><div style="font:800 20px 'Baloo 2';color:#2A1F45">${(mis || misDone) ? `${misDone ? EQD.MISSION_LEN : mis.n}/${EQD.MISSION_LEN}` : `${Math.min(5, s.challengesDone)}/5`}</div><div style="font:700 10px Nunito;color:#8B7A55;letter-spacing:0.8px">${(mis || misDone) ? TX({ az: 'MİSSİYA', en: 'MISSION', ru: 'МИССИЯ' }) : TX({ az: 'AÇILAN MÖHÜR', en: 'SEALS OPEN', ru: 'ПЕЧАТЕЙ СНЯТО' })}</div></div>
        <div style="flex:1;border-radius:18px;background:#FBE9CC;padding:12px;text-align:center"><div style="font:800 20px 'Baloo 2';color:#2A1F45">${Math.max(0, 1500 - s.xp)}</div><div style="font:700 10px Nunito;color:#8B7A55;letter-spacing:0.8px">${TX({ az: `SƏVİYYƏ ${s.level + 1}-Ə QALAN XP`, en: `XP TO LEVEL ${s.level + 1}`, ru: `XP ДО УРОВНЯ ${s.level + 1}` })}</div></div>
      </div>
    </div>
    <div style="position:absolute;bottom:150px;left:22px;right:22px;background:rgba(30,21,54,0.9);border-radius:24px;padding:16px 18px;display:flex;gap:12px;align-items:center">
      <div style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.14);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;flex:none">${EQC.questy('excited', 'width:40px', s.questyFur, s.questyFurDark)}</div>
      <div style="font:700 14px Nunito;color:#fff;line-height:1.5">${q.praise ? TX(q.praise) : TX({ az: 'Bunu tamamilə özün həll etdin!', en: 'You worked that out all by yourself!', ru: 'Ты справился с этим совершенно самостоятельно!' })}</div>
    </div>
    <div class="press" onclick="${cta}" style="position:absolute;bottom:52px;left:22px;right:22px;height:70px;border-radius:24px;background:#3DBE6E;box-shadow:0 6px 0 #2A9455, 0 16px 26px -12px rgba(42,148,85,0.6);display:flex;align-items:center;justify-content:center;gap:10px;font:800 22px 'Baloo 2', system-ui;color:#fff">${ctaText}${EQC.arrowR('#fff', 20)}</div>
  </div>`;
};

/* 10 · Hint (after a wrong answer, or the free hint button) */
EQS.meta.hint = { light: true };
EQS.screens.hint = function (s) {
  const q = EQ.session.q;
  const h = q.hint;
  const backTo = EQ.session.ctx === 'boss' ? 'boss' : 'challenge';
  return `<div class="scr" style="background:#A9E2FA">
    <div style="position:absolute;top:0;left:0;right:0;height:420px;overflow:hidden">
      <div style="position:absolute;inset:0;background:#A9E2FA"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:150px;background:#7FCFA0"></div>
      <div style="position:absolute;bottom:120px;left:0;right:0;height:16px;background:#C9762F"></div>
      <div style="position:absolute;bottom:60px;right:40px"><svg width="180" height="150" viewBox="0 0 200 150"><ellipse cx="112" cy="104" rx="54" ry="40" fill="#3DBE6E"></ellipse><ellipse cx="116" cy="112" rx="34" ry="26" fill="#BFF0D3"></ellipse><path d="M84 60 l7 13 h-14 Z M108 56 l7 13 h-14 Z" fill="#FFC24B"></path><ellipse cx="94" cy="52" rx="38" ry="32" fill="#54D083"></ellipse><ellipse cx="64" cy="64" rx="20" ry="14" fill="#6BDC96"></ellipse><ellipse cx="80" cy="44" rx="10" ry="11" fill="#FFF7EA"></ellipse><ellipse cx="108" cy="42" rx="10" ry="11" fill="#FFF7EA"></ellipse><circle cx="80" cy="46" r="5.4" fill="#2A1F45"></circle><circle cx="108" cy="44" r="5.4" fill="#2A1F45"></circle><path d="M74 74 q14 10 26 0" stroke="#2A6B45" stroke-width="3" fill="none" stroke-linecap="round"></path></svg></div>
      <div style="position:absolute;inset:0;background:rgba(30,21,54,0.55)"></div>
    </div>
    <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
      <div class="press" onclick="EQ.go('${backTo}')" style="width:44px;height:44px;border-radius:16px;background:rgba(30,21,54,0.82);display:flex;align-items:center;justify-content:center;flex:none">${EQC.xIcon('#fff', 17)}</div>
      <div style="flex:1;display:flex;gap:5px;align-items:center">${EQS.progressPips(s, Math.min(4, s.challengesDone))}</div>
      <div style="padding:0 12px;height:44px;border-radius:16px;background:rgba(92,227,155,0.22);display:flex;align-items:center;font:800 11px Nunito;color:#BFF0D3">${TX({ az: 'İpucular pulsuzdur', en: 'Hints are free', ru: 'Подсказки бесплатные' })}</div>
    </div>
    <div style="position:absolute;top:210px;left:20px;right:20px;display:flex;gap:12px;align-items:flex-start">
      <div style="width:82px;flex:none">${EQC.questy('encouraging', 'width:82px', s.questyFur, s.questyFurDark)}</div>
      <div class="rise" style="flex:1;background:#FFF7EA;border-radius:24px;border-bottom-left-radius:8px;padding:16px 18px;box-shadow:0 6px 0 rgba(20,10,40,0.35)">
        <div style="font:800 18px 'Baloo 2', system-ui;color:#2A1F45">${TX(h.heading)}</div>
        <div style="font:700 14px Nunito;color:#5C4E7E;margin-top:6px;line-height:1.5">${TX(h.sub)}</div>
      </div>
    </div>
    <div class="rise" style="position:absolute;top:440px;left:0;right:0;bottom:0;background:#FFF7EA;border-radius:36px 36px 0 0;padding:24px 20px">
      <div style="display:flex;align-items:center;gap:9px"><div style="width:34px;height:34px;border-radius:12px;background:#FFC24B;display:flex;align-items:center;justify-content:center">${EQC.bulb('#4A3208', 17)}</div><div style="font:800 18px 'Baloo 2', system-ui;color:#2A1F45">${TX(h.panelTitle)}</div></div>
      ${h.body()}
      <div style="margin-top:10px;font:700 12px Nunito;color:#8B7A55">${TX(h.note)}</div>
      <div style="margin-top:22px;display:flex;flex-direction:column;gap:11px">
        <div class="press" onclick="EQ.go('${backTo}')" style="height:64px;border-radius:22px;background:#3DBE6E;box-shadow:0 5px 0 #2A9455;display:flex;align-items:center;justify-content:center;font:800 19px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Yenidən yoxlayacağam', en: 'I&#39;ll try again', ru: 'Попробую ещё раз' })}</div>
        <div style="display:flex;gap:11px">
          <div class="press" onclick="EQ.go('tutor')" style="flex:1;height:58px;border-radius:20px;background:#FBE9CC;box-shadow:0 4px 0 #E8D0A8;display:flex;align-items:center;justify-content:center;gap:7px;font:800 15px 'Baloo 2';color:#7A6438"><svg width="17" height="17" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="3" fill="none" stroke="#7A6438" stroke-width="2.2"></rect><path d="M8 10 h8 M8 14 h5" stroke="#7A6438" stroke-width="2.2" stroke-linecap="round"></path></svg>${TX({ az: 'Nümunə göstər', en: 'Show example', ru: 'Покажи пример' })}</div>
          <div class="press" onclick="EQ.go('tutor')" style="flex:1;height:58px;border-radius:20px;background:#FBE9CC;box-shadow:0 4px 0 #E8D0A8;display:flex;align-items:center;justify-content:center;gap:7px;font:800 15px 'Baloo 2';color:#7A6438"><svg width="17" height="17" viewBox="0 0 24 24"><path d="M12 3 a9 9 0 1 0 0.01 0 Z" fill="none" stroke="#7A6438" stroke-width="2.2"></path><path d="M9.6 9.4 a2.6 2.6 0 1 1 3.4 2.4 v1.6 M12.4 17 h0.01" stroke="#7A6438" stroke-width="2.2" stroke-linecap="round"></path></svg>${TX({ az: 'İzah et', en: 'Explain it', ru: 'Объясни' })}</div>
        </div>
      </div>
    </div>
  </div>`;
};

/* 21 · AI tutor — the AI is Questy, never a chat window */
EQS.meta.tutor = { light: true };
EQS.screens.tutor = function (s) {
  const q = EQ.session.q;
  const ex = q.explain || {
    title: { az: 'Gəl bunu birlikdə həll edək.', en: 'Let’s figure this out together.', ru: 'Давай разберёмся вместе.' },
    text: q.hint.sub,
    why: { az: 'Anlamaq əzbərləməkdən üstündür — həmişə.', en: 'Understanding beats memorising — always.', ru: 'Понимать лучше, чем зубрить, — всегда.' },
    visual: () => ''
  };
  const backTo = EQ.session.ctx === 'boss' ? 'boss' : 'challenge';
  const whyBlock = EQ.session.tutorWhy ? `<div class="rise" style="margin-top:10px;padding:12px 14px;border-radius:16px;background:#FBE9CC;font:700 13px Nunito;color:#7A6438;line-height:1.5;position:relative">${TX(ex.why)}</div>` : '';
  const easierLabel = TX({ az: 'Daha asanını ver', en: 'An easier one', ru: 'Полегче' });
  const easierBtn = q.easier
    ? `<div class="press" onclick="EQ.easierOne()" style="height:58px;border-radius:20px;background:#FBE9CC;box-shadow:0 5px 0 #E8D0A8;display:flex;align-items:center;justify-content:center;gap:8px;font:800 15px 'Baloo 2';color:#7A6438">${easierLabel}</div>`
    : `<div class="press" onclick="EQ.toast(TX({az:'Bu elə asan olanıdır — bacararsan!',en:'This is the easy one — you can do it!',ru:'Это и есть лёгкое — у тебя получится!'}))" style="height:58px;border-radius:20px;background:#FBE9CC;box-shadow:0 5px 0 #E8D0A8;display:flex;align-items:center;justify-content:center;gap:8px;font:800 15px 'Baloo 2';color:#7A6438">${easierLabel}</div>`;
  const voiceToast = `EQ.toast(TX({az:'Danışmaq üçün basıb-saxlama səs dəstəyi ilə gəlir 🎤',en:'Hold to talk is coming with voice support 🎤',ru:'Удержание для разговора появится вместе с голосовой поддержкой 🎤'}))`;
  return `<div class="scr" style="background:#2C1F52">
    <div style="position:absolute;top:0;left:0;right:0;height:520px;background:radial-gradient(300px 260px at 50% 40%, rgba(123,92,255,0.55), rgba(44,31,82,0) 72%)"></div>
    <div style="position:absolute;top:62px;left:16px;right:16px;display:flex;align-items:center;gap:12px">
      <div class="press" onclick="EQ.go('hint')" style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center">${EQC.chevL('#fff', 19)}</div>
      <div style="flex:1"><div style="font:800 18px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Questy kömək edir', en: 'Questy helps', ru: 'Квести помогает' })}</div><div style="font:700 10px Nunito;color:#A896E0;letter-spacing:1px">${TX(q.tag)} · ${TX({ az: 'VALİDEYN TƏSDİQLİ', en: 'PARENT-APPROVED', ru: 'ОДОБРЕНО РОДИТЕЛЯМИ' })}</div></div>
      <div class="press" onclick="${voiceToast}" style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 4 a4 4 0 0 1 4 4 v3 a4 4 0 0 1 -8 0 V8 a4 4 0 0 1 4-4 Z" fill="#fff"></path><path d="M6 12 a6 6 0 0 0 12 0 M12 18 v3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"></path></svg></div>
    </div>
    <div class="float" style="position:absolute;top:150px;left:0;right:0;display:flex;justify-content:center">${EQC.questy('hint', 'width:170px', s.questyFur, s.questyFurDark)}</div>
    <div class="rise" id="tutor-card" style="position:absolute;top:346px;left:20px;right:20px;background:#FFF7EA;border-radius:28px;padding:18px;box-shadow:0 7px 0 rgba(0,0,0,0.28)">
      <div style="position:absolute;top:-11px;left:52px;width:24px;height:24px;background:#FFF7EA;border-radius:6px;transform:rotate(45deg)"></div>
      <div style="font:800 19px 'Baloo 2', system-ui;color:#2A1F45;position:relative">${TX(ex.title)}</div>
      <div style="font:700 14.5px Nunito;color:#5C4E7E;margin-top:8px;line-height:1.55;position:relative">${TX(ex.text)}</div>
      ${whyBlock}
    </div>
    <div style="position:absolute;top:${EQ.session.tutorWhy ? 560 : 500}px;left:20px;right:20px;background:rgba(255,255,255,0.09);border-radius:26px;padding:16px">
      ${ex.visual()}
    </div>
    <div style="position:absolute;bottom:110px;left:20px;right:20px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="press" onclick="EQ.tutorAgain()" style="height:58px;border-radius:20px;background:#FFF7EA;box-shadow:0 5px 0 #C9BCA6;display:flex;align-items:center;justify-content:center;gap:8px;font:800 15px 'Baloo 2';color:#2A1F45">${TX({ az: 'Bir də göstər', en: 'Show me again', ru: 'Покажи ещё раз' })}</div>
      <div class="press" onclick="EQ.tutorWhy()" style="height:58px;border-radius:20px;background:#FFF7EA;box-shadow:0 5px 0 #C9BCA6;display:flex;align-items:center;justify-content:center;gap:8px;font:800 15px 'Baloo 2';color:#2A1F45">${TX({ az: 'Niyə?', en: 'Why?', ru: 'Почему?' })}</div>
      ${easierBtn}
      <div class="press" onclick="EQ.go('${backTo}')" style="height:58px;border-radius:20px;background:#5CE39B;box-shadow:0 5px 0 #2FA76D;display:flex;align-items:center;justify-content:center;gap:8px;font:800 15px 'Baloo 2';color:#0B3D25">${TX({ az: 'Başa düşdüm!', en: 'I&#39;ve got it!', ru: 'Я понял!' })}</div>
    </div>
    <div class="press" onclick="${voiceToast}" style="position:absolute;bottom:28px;left:20px;right:20px;height:58px;border-radius:22px;background:rgba(255,255,255,0.09);display:flex;align-items:center;justify-content:center;gap:10px;font:800 14px Nunito;color:#C9BCEF"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 4 a4 4 0 0 1 4 4 v3 a4 4 0 0 1 -8 0 V8 a4 4 0 0 1 4-4 Z" fill="#C9BCEF"></path><path d="M6 12 a6 6 0 0 0 12 0 M12 18 v3" stroke="#C9BCEF" stroke-width="2" fill="none" stroke-linecap="round"></path></svg>${TX({ az: 'Questy ilə danışmaq üçün basıb saxla', en: 'Hold to talk to Questy', ru: 'Удерживай, чтобы поговорить с Квести' })}</div>
  </div>`;
};

/* 11 · Boss battle — the stage's guardian, or the chapter finale on the last stage */
EQS.meta.boss = { light: true };
EQS.screens.boss = function (s) {
  const q = EQ.session.q;
  const cp = EQ.chapter();
  const B = cp.boss;
  const need = B.hits;
  const left = Math.max(0, need - s.bossHits);
  /* a finale runs to 6 hits, so the hearts wrap onto a second row rather than shrink */
  const hearts = Array.from({ length: need }, (_, i) => EQC.heart(i < s.bossHits, need > 4 ? 28 : 34)).join('');
  const answers = q.answers.map((a, i) => `
    <div class="press ans" id="ans-${i}" onclick="EQ.answer(${i})" style="flex:1;height:84px;border-radius:26px;background:#fff;box-shadow:0 6px 0 #C9BCA6;display:flex;align-items:center;justify-content:center;font:800 34px 'Baloo 2', system-ui;color:#2A1F45">${a}</div>`).join('');
  const beam = EQ.session.bossBeam ? `
    <div class="pop" style="position:absolute;top:308px;left:18px;width:150px;height:80px">
      <div style="position:absolute;left:0;top:28px;right:0;height:18px;border-radius:9px;background:linear-gradient(90deg, rgba(92,227,155,0) 0%, rgba(92,227,155,0.9) 100%);box-shadow:0 0 22px rgba(92,227,155,0.8)"></div>
      <div style="position:absolute;left:96px;top:2px;font:800 14px 'Baloo 2';color:#5CE39B">${TX({ az: '+1 zərbə', en: '+1 hit', ru: '+1 удар' })}</div>
      <div style="position:absolute;left:60px;top:52px;width:9px;height:9px;border-radius:50%;background:#FFF7EA"></div>
    </div>` : '';
  if (EQ.session.bossBeam) EQ.session.bossBeam = false;
  /* the chapter guardian keeps the dragon silhouette (tinted per chapter);
     the finale gets its own shape so the last stage reads as a different fight */
  const creature = cp.final
    ? `<svg width="270" height="240" viewBox="0 0 270 240">
        <g opacity="0.5"><ellipse cx="140" cy="128" rx="104" ry="96" fill="${B.accent}"></ellipse></g>
        <path d="M140 24 q66 30 74 104 q8 74 -74 96 q-82-22 -74-96 q8-74 74-104 Z" fill="${B.floor}"></path>
        <path d="M140 42 q54 26 60 88 q6 60 -60 78 q-66-18 -60-78 q6-62 60-88 Z" fill="${B.accent}" opacity="0.32"></path>
        <g fill="${B.accentSoft}" opacity="0.9">
          <path d="M140 58 l12 26 28 4 -20 20 5 28 -25-14 -25 14 5-28 -20-20 28-4 Z"></path>
        </g>
        <ellipse cx="112" cy="140" rx="17" ry="20" fill="#FFF7EA"></ellipse>
        <ellipse cx="168" cy="140" rx="17" ry="20" fill="#FFF7EA"></ellipse>
        <circle cx="114" cy="144" r="9" fill="#1A0F2E"></circle><circle cx="170" cy="144" r="9" fill="#1A0F2E"></circle>
        <circle cx="118" cy="140" r="3" fill="#fff"></circle><circle cx="174" cy="140" r="3" fill="#fff"></circle>
        <path d="M116 180 q24 16 48 0" stroke="#1A0F2E" stroke-width="4" fill="none" stroke-linecap="round"></path>
        <g fill="${B.accentSoft}"><circle cx="54" cy="70" r="5"></circle><circle cx="226" cy="92" r="4"></circle><circle cx="78" cy="206" r="4"></circle><circle cx="214" cy="198" r="5"></circle></g>
      </svg>`
    : `<svg width="270" height="230" viewBox="0 0 270 230">
        <path d="M96 120 q-44-34 -60-8 q22 6 28 28 Z" fill="${B.accent}"></path>
        <path d="M212 150 q44 6 48-28 q-4 26 -34 32 Z" fill="${B.floor}"></path>
        <ellipse cx="152" cy="152" rx="74" ry="54" fill="#6B4BC4"></ellipse>
        <ellipse cx="156" cy="164" rx="48" ry="34" fill="${B.accentSoft}"></ellipse>
        <path d="M108 96 l10 18 h-20 Z M140 88 l10 18 h-20 Z M172 92 l10 18 h-20 Z" fill="${B.accent}"></path>
        <ellipse cx="128" cy="76" rx="54" ry="44" fill="#7B5CFF"></ellipse>
        <ellipse cx="86" cy="92" rx="28" ry="19" fill="#8A6BE0"></ellipse>
        <circle cx="74" cy="88" r="3" fill="#3A2A6E"></circle><circle cx="84" cy="96" r="2.6" fill="#3A2A6E"></circle>
        <path d="M100 30 l6-20 12 16 Z M148 26 l4-20 13 15 Z" fill="#FFC24B"></path>
        <ellipse cx="106" cy="62" rx="14" ry="15" fill="#FFF7EA"></ellipse><ellipse cx="146" cy="58" rx="14" ry="15" fill="#FFF7EA"></ellipse>
        <circle cx="109" cy="64" r="7.6" fill="#2A1F45"></circle><circle cx="149" cy="60" r="7.6" fill="#2A1F45"></circle>
        <circle cx="112" cy="60" r="2.6" fill="#fff"></circle><circle cx="152" cy="56" r="2.6" fill="#fff"></circle>
        <path d="M92 104 q20 14 38 2" stroke="#3A2A6E" stroke-width="3.4" fill="none" stroke-linecap="round"></path>
        <path d="M118 106 l4 8 -8 0 Z" fill="#FFF7EA"></path>
      </svg>`;
  return `<div class="scr" style="background:${B.sky}">
    <div style="position:absolute;inset:0;background:radial-gradient(320px 300px at 62% 34%, ${B.glow}, rgba(0,0,0,0) 70%)"></div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:290px;background:${B.floor};border-radius:50% 50% 0 0 / 60px 60px 0 0"></div>
    <div class="spark" style="bottom:240px;left:26px;width:9px;height:9px;border-radius:50%;background:#5CE39B"></div>
    <div class="spark" style="bottom:300px;right:36px;width:7px;height:7px;border-radius:50%;background:#FFC24B;animation-delay:.6s"></div>
    <div style="position:absolute;top:56px;left:16px;right:16px">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="press" onclick="EQ.go('quest')" style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;flex:none">${EQC.xIcon('#fff', 17)}</div>
        <div style="flex:1;text-align:center"><div style="font:800 ${cp.final ? 20 : 22}px 'Baloo 2', system-ui;color:#fff;line-height:1.1">${TX(B.name)}</div><div style="font:700 10px Nunito;color:${B.accentSoft};letter-spacing:1.6px">${TX(B.role)}</div></div>
        <div style="width:44px"></div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap">${hearts}</div>
      <div style="text-align:center;font:800 11px Nunito;color:#C9BCEF;margin-top:8px;letter-spacing:0.6px">${TX({ az: `${s.bossHits} bilik zərbəsi vuruldu · ${left} qaldı`, en: `${s.bossHits} knowledge hit${s.bossHits === 1 ? '' : 's'} landed · ${left} to go`, ru: `${s.bossHits} ${RUP(s.bossHits, 'удар знаний нанесён', 'удара знаний нанесено', 'ударов знаний нанесено')} · осталось ${left}` })}</div>
    </div>

    <div style="position:absolute;top:196px;right:6px">${creature}</div>
    ${beam}
    <div class="rise" style="position:absolute;top:400px;left:16px;right:16px;background:#FFF7EA;border-radius:30px;padding:16px;box-shadow:0 7px 0 #C9BCA6, 0 20px 34px -16px rgba(0,0,0,0.5)">
      <div style="display:flex;align-items:center;gap:8px"><div style="padding:4px 10px;border-radius:10px;background:#EFE7FF;font:800 10px Nunito;color:#5B3FD6;letter-spacing:1.2px">${TX(q.tag)}</div><div style="font:700 11px Nunito;color:#A08A5E">${TX(q.meta)}</div></div>
      <div style="font:800 20px 'Baloo 2', system-ui;color:#2A1F45;margin-top:12px;line-height:1.3">${TX(q.title)}</div>
      ${q.visual()}
    </div>
    <div style="position:absolute;top:648px;left:16px;right:16px;display:flex;gap:12px">${answers}</div>
    <div style="position:absolute;bottom:26px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
      ${EQC.hero(Object.assign({}, s.hero, { hat: s.hero.hat === 'none' && s.wizardHatOwned ? 'wizard' : s.hero.hat }), 'width:54px')}
      ${EQC.questy('thinking', 'width:46px', s.questyFur, s.questyFurDark)}
      <div class="press" onclick="EQ.go('hint')" style="flex:1;height:50px;border-radius:18px;background:rgba(255,255,255,0.10);display:flex;align-items:center;justify-content:center;gap:8px;font:800 14px 'Baloo 2';color:#FFD98A">${EQC.bulb('#FFD98A', 18)}${TX({ az: 'Questy-dən ipucu istə', en: 'Ask Questy for a hint', ru: 'Попроси у Квести подсказку' })}</div>
    </div>
  </div>`;
};

/* 12 · Boss victory */
EQS.meta.victory = { light: true };
EQS.screens.victory = function (s) {
  const cp = EQ.chapter();
  const B = cp.boss;
  return `<div class="scr" style="background:${cp.final ? '#1C1030' : '#241A3F'}">
    <div class="rays" style="position:absolute;top:-80px;left:-100px;right:-100px;height:760px;background:repeating-conic-gradient(from 0deg, rgba(255,194,75,0.20) 0 5deg, rgba(255,194,75,0) 5deg 24deg);mask-image:radial-gradient(closest-side, rgba(0,0,0,0.9) 18%, transparent 68%);-webkit-mask-image:radial-gradient(closest-side, rgba(0,0,0,0.9) 18%, transparent 68%);opacity:0.9"></div>
    <div style="position:absolute;top:96px;left:0;right:0;text-align:center">
      <div style="font:800 15px Nunito;color:#5CE39B;letter-spacing:3px">${TX(B.banner)}</div>
      <div class="pop" style="font:800 50px 'Baloo 2', system-ui;color:#FFF7EA;line-height:1.05;margin-top:8px">${TX({ az: 'Bacardın!', en: 'You did it!', ru: 'Получилось!' })}</div>
      <div style="font:800 18px 'Baloo 2', system-ui;color:#FFD98A;margin-top:10px">${TX(B.befriended)}</div>
      ${cp.final ? `<div style="font:700 12px Nunito;color:#A896E0;margin-top:8px;letter-spacing:1.4px">${TX({ az: `FƏSİL ${cp.chapterNo} · ${TX(cp.ch.name).toUpperCase()}`, en: `CHAPTER ${cp.chapterNo} · ${TX(cp.ch.name).toUpperCase()}`, ru: `ГЛАВА ${cp.chapterNo} · ${TX(cp.ch.name).toUpperCase()}` })}</div>` : ''}
    </div>
    <div style="position:absolute;top:270px;left:0;right:0;display:flex;align-items:flex-end;justify-content:center;gap:4px">
      ${EQC.questy('celebrating', 'width:104px', s.questyFur, s.questyFurDark)}
      <div style="position:relative">
        <svg width="182" height="162" viewBox="0 0 200 170"><path d="M62 108 q-38-26 -52-4 q20 6 24 24 Z" fill="#5B3FD6"></path><path d="M148 126 q36 4 40-22 q-4 22 -28 26 Z" fill="#5B3FD6"></path><ellipse cx="104" cy="118" rx="54" ry="38" fill="#6B4BC4"></ellipse><ellipse cx="106" cy="128" rx="34" ry="24" fill="#C8B4FF"></ellipse><path d="M74 74 l8 15 h-16 Z M100 70 l8 15 h-16 Z M126 76 l8 15 h-16 Z" fill="#FF8A4C"></path><ellipse cx="96" cy="60" rx="44" ry="36" fill="#8A6BE0"></ellipse><ellipse cx="60" cy="74" rx="22" ry="15" fill="#9B7CFF"></ellipse><circle cx="52" cy="72" r="2.6" fill="#4A2E9E"></circle><circle cx="60" cy="79" r="2.2" fill="#4A2E9E"></circle><path d="M74 18 l5-17 11 14 Z M112 14 l3-16 12 13 Z" fill="#FFC24B"></path><path d="M72 56 q10-11 20 0 M104 52 q10-11 20 0" stroke="#2A1F45" stroke-width="4" fill="none" stroke-linecap="round"></path><path d="M76 78 q22 18 42 2 q-20 8 -42-2 Z" fill="#3A2A6E"></path><path d="M96 88 l4 8 -9 1 Z" fill="#FFF7EA"></path><ellipse cx="66" cy="60" rx="9" ry="6" fill="#FF8FA6" opacity="0.55"></ellipse><ellipse cx="130" cy="56" rx="9" ry="6" fill="#FF8FA6" opacity="0.55"></ellipse></svg>
        <div class="spark" style="position:absolute;top:-6px;right:14px;font:800 20px 'Baloo 2';color:#FFC24B">✦</div>
      </div>
      ${EQC.hero(Object.assign({}, s.hero, { hat: s.hero.hat === 'none' ? 'wizard' : s.hero.hat }), 'width:130px')}
    </div>
    <div style="position:absolute;top:452px;left:20px;right:20px;background:rgba(255,255,255,0.07);border-radius:30px;padding:18px;box-shadow:0 0 0 1.5px rgba(255,255,255,0.10) inset">
      <div style="font:800 11px Nunito;color:#A896E0;letter-spacing:2px">${TX({ az: 'MÜKAFATLARIN', en: 'YOUR REWARDS', ru: 'ТВОИ НАГРАДЫ' })}</div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <div style="flex:1;border-radius:20px;background:rgba(92,227,155,0.16);padding:14px 10px;text-align:center"><div style="font:800 22px 'Baloo 2';color:#5CE39B">+${cp.final ? 400 : 250}</div><div style="font:700 10px Nunito;color:#8FE0B6;letter-spacing:1px">XP</div></div>
        <div style="flex:1;border-radius:20px;background:rgba(255,194,75,0.16);padding:14px 10px;text-align:center"><div style="font:800 22px 'Baloo 2';color:#FFC24B">+${cp.final ? 160 : 100}</div><div style="font:700 10px Nunito;color:#FFD98A;letter-spacing:1px">${TX({ az: 'SİKKƏ', en: 'COINS', ru: 'МОНЕТ' })}</div></div>
        <div style="flex:1;border-radius:20px;background:rgba(123,92,255,0.20);padding:14px 10px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px">
          ${EQC.trophy('#C8B4FF', 26)}
          <div style="font:700 10px Nunito;color:#C8B4FF;letter-spacing:1px">${TX({ az: 'NİŞAN', en: 'BADGE', ru: 'ЗНАЧОК' })}</div>
        </div>
      </div>
      <div style="margin-top:14px;display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.06);border-radius:20px;padding:12px 14px">
        <div style="width:44px;height:44px;border-radius:16px;background:#FFC24B;display:flex;align-items:center;justify-content:center;flex:none">${EQC.trophy('#4A3208', 24)}</div>
        <div><div style="font:800 15px 'Baloo 2';color:#fff">${TX(B.badge)}</div><div style="font:700 11.5px Nunito;color:#A896E0">${TX(B.badgeNote)}</div></div>
      </div>
    </div>
    <div class="press" onclick="EQ.go('chest')" style="position:absolute;bottom:110px;left:20px;right:20px;height:66px;border-radius:22px;background:#FFC24B;box-shadow:0 6px 0 #E39B1C, 0 16px 26px -12px rgba(227,155,28,0.55);display:flex;align-items:center;justify-content:center;font:800 21px 'Baloo 2', system-ui;color:#4A3208">${TX({ az: 'Sandığı aç', en: 'Open the chest', ru: 'Открыть сундук' })}</div>
    <div class="press" onclick="EQ.go('map')" style="position:absolute;bottom:56px;left:20px;right:20px;height:52px;border-radius:20px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font:800 15px 'Baloo 2';color:#C9BCEF">${TX({ az: 'Xəritəyə qayıt', en: 'Back to the map', ru: 'Назад к карте' })}</div>
  </div>`;
};

/* 13 · Level up */
EQS.meta.levelup = { light: true };
EQS.screens.levelup = function (s) {
  const newLevel = s.level + 1;
  return `<div class="scr" style="background:#1C1338">
    <div class="rays" style="position:absolute;top:40px;left:-120px;right:-120px;height:640px;background:repeating-conic-gradient(from 0deg, rgba(92,227,155,0.22) 0 4deg, rgba(92,227,155,0) 4deg 20deg);mask-image:radial-gradient(closest-side, rgba(0,0,0,0.9) 16%, transparent 66%);-webkit-mask-image:radial-gradient(closest-side, rgba(0,0,0,0.9) 16%, transparent 66%);opacity:0.9"></div>
    <div style="position:absolute;top:104px;left:0;right:0;text-align:center;font:800 16px Nunito;color:#5CE39B;letter-spacing:4px">${TX({ az: 'SƏVİYYƏ ARTDI!', en: 'LEVEL UP!', ru: 'НОВЫЙ УРОВЕНЬ!' })}</div>
    <div style="position:absolute;top:150px;left:0;right:0;display:flex;justify-content:center">
      <div class="pop" style="position:relative;width:186px;height:186px;display:flex;align-items:center;justify-content:center">
        <svg width="186" height="186" viewBox="0 0 100 100" style="position:absolute"><path d="M50 3 L61 16 L78 12 L80 30 L96 38 L86 52 L96 66 L80 74 L78 92 L61 88 L50 101 L39 88 L22 92 L20 74 L4 66 L14 52 L4 38 L20 30 L22 12 L39 16 Z" fill="#FFC24B"></path><path d="M50 12 L58 22 L72 19 L74 33 L86 39 L78 51 L86 63 L74 69 L72 83 L58 80 L50 90 L42 80 L28 83 L26 69 L14 63 L22 51 L14 39 L26 33 L28 19 L42 22 Z" fill="#FFE9A8"></path></svg>
        <div style="position:relative;font:800 62px 'Baloo 2', system-ui;color:#8A5A0A;line-height:1">${newLevel}</div>
      </div>
    </div>
    <div style="position:absolute;top:360px;left:0;right:0;text-align:center">
      <div style="font:800 30px 'Baloo 2', system-ui;color:#fff">${EQ.rank(newLevel)}</div>
      <div style="font:700 14px Nunito;color:#A896E0;margin-top:6px">${TX({ az: `${EQC.fmt(1500)} / ${EQC.fmt(1500)} XP · yeni rütbə açıldı`, en: `${EQC.fmt(1500)} / ${EQC.fmt(1500)} XP · new rank unlocked`, ru: `${EQC.fmt(1500)} / ${EQC.fmt(1500)} XP · новое звание открыто` })}</div>
    </div>
    <div style="position:absolute;top:452px;left:20px;right:20px;display:flex;gap:10px">
      <div style="flex:1;border-radius:22px;background:rgba(255,255,255,0.07);padding:16px 12px;text-align:center"><div style="font:800 20px 'Baloo 2';color:#5CE39B">+${s.xpToday}</div><div style="font:700 10px Nunito;color:#8FE0B6;letter-spacing:1px">${TX({ az: 'BUGÜNKÜ XP', en: 'XP TODAY', ru: 'XP ЗА ДЕНЬ' })}</div></div>
      <div style="flex:1;border-radius:22px;background:rgba(255,255,255,0.07);padding:16px 12px;text-align:center"><div style="font:800 20px 'Baloo 2';color:#FFC24B">+${s.coinsToday}</div><div style="font:700 10px Nunito;color:#FFD98A;letter-spacing:1px">${TX({ az: 'SİKKƏ', en: 'COINS', ru: 'МОНЕТ' })}</div></div>
      <div style="flex:1;border-radius:22px;background:rgba(255,255,255,0.07);padding:16px 12px;text-align:center"><div style="font:800 20px 'Baloo 2';color:#C8B4FF">${s.streak}</div><div style="font:700 10px Nunito;color:#C8B4FF;letter-spacing:1px">${TX({ az: 'GÜNLÜK SERİYA', en: 'DAY STREAK', ru: 'ДНЕЙ ПОДРЯД' })}</div></div>
    </div>
    <div style="position:absolute;top:556px;left:20px;right:20px;border-radius:26px;background:#FFF7EA;padding:15px;box-shadow:0 6px 0 #C9BCA6;display:flex;align-items:center;gap:14px">
      <div style="width:60px;height:60px;border-radius:20px;background:#FBE9CC;display:flex;align-items:center;justify-content:center;flex:none"><svg width="34" height="34" viewBox="0 0 36 36"><ellipse cx="18" cy="24" rx="16" ry="4" fill="#C98A4B"></ellipse><path d="M8 24 q0-14 10-14 q10 0 10 14 Z" fill="#E0A365"></path><rect x="7" y="20" width="22" height="5" rx="2.5" fill="#7B5CFF"></rect></svg></div>
      <div style="flex:1"><div style="font:700 10px Nunito;color:#A08A5E;letter-spacing:1.4px">${TX({ az: 'YENİ ƏŞYA AÇILDI', en: 'NEW ITEM UNLOCKED', ru: 'НОВЫЙ ПРЕДМЕТ ОТКРЫТ' })}</div><div style="font:800 18px 'Baloo 2';color:#2A1F45">${TX({ az: 'Kaşif Papağı', en: 'Explorer Hat', ru: 'Шляпа Исследователя' })}</div><div style="font:700 12px Nunito;color:#8B7A55">${TX({ az: 'Qarderobunda gözləyir', en: 'Waiting in your wardrobe', ru: 'Ждёт в твоём гардеробе' })}</div></div>
    </div>
    <div style="position:absolute;top:648px;left:20px;right:20px;border-radius:26px;background:rgba(69,198,240,0.14);padding:15px;box-shadow:0 0 0 1.5px rgba(69,198,240,0.35) inset;display:flex;align-items:center;gap:14px">
      <div style="width:60px;height:60px;border-radius:20px;background:rgba(69,198,240,0.25);display:flex;align-items:center;justify-content:center;flex:none"><svg width="32" height="32" viewBox="0 0 36 36"><path d="M14 6 h8 v7 l7 14 a3 3 0 0 1 -2.6 4.4 H9.6 A3 3 0 0 1 7 27 l7-14 Z" fill="#EAF7FF"></path><path d="M10.4 22 h15.2 l3 6 a3 3 0 0 1 -2.6 4 H10 a3 3 0 0 1 -2.6-4 Z" fill="#45C6F0"></path></svg></div>
      <div style="flex:1"><div style="font:700 10px Nunito;color:#8FDCF7;letter-spacing:1.4px">${TX({ az: `${Math.max(0, 10 - newLevel)} SƏVİYYƏ QALIB`, en: `${Math.max(0, 10 - newLevel)} LEVELS AWAY`, ru: `ЧЕРЕЗ ${Math.max(0, 10 - newLevel)} ${UPC(RUP(Math.max(0, 10 - newLevel), 'уровень', 'уровня', 'уровней'))}` })}</div><div style="font:800 18px 'Baloo 2';color:#fff">${TX({ az: 'Elm Adası', en: 'Science Island', ru: 'Остров Науки' })}</div><div style="font:700 12px Nunito;color:#A5DCF0">${TX({ az: 'Qaynayan təcrübələr və təbiət tapşırıqları', en: 'Bubbling experiments and nature quests', ru: 'Бурлящие опыты и задания о природе' })}</div></div>
    </div>
    <div class="press" onclick="EQ.applyLevelUp()" style="position:absolute;bottom:44px;left:20px;right:20px;height:68px;border-radius:24px;background:#3DBE6E;box-shadow:0 6px 0 #2A9455, 0 16px 26px -12px rgba(42,148,85,0.6);display:flex;align-items:center;justify-content:center;font:800 21px 'Baloo 2', system-ui;color:#fff">${TX({ az: 'Kəşfə davam et', en: 'Keep exploring', ru: 'Продолжить исследование' })}</div>
  </div>`;
};

/* 14 · Reward chest — contents shown before opening */
EQS.meta.chest = { light: true };
EQS.screens.chest = function (s) {
  /* the screen's own promise is "you always see what's inside before you open it", so the
     sticker slot shows the sticker this chest will really hand over, by name */
  const nextSticker = EQD.nextSticker(s.stickerIds);
  return `<div class="scr" style="background:#241A3F">
    <div style="position:absolute;inset:0;background:radial-gradient(300px 280px at 50% 34%, rgba(255,194,75,0.30), rgba(36,26,63,0) 70%)"></div>
    <div class="press" onclick="EQ.go('map')" style="position:absolute;top:62px;left:16px;width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;z-index:5">${EQC.xIcon('#fff', 17)}</div>
    <div style="position:absolute;top:88px;left:0;right:0;text-align:center">
      <div style="font:800 12px Nunito;color:#FFD98A;letter-spacing:3px">${TX({ az: 'TAPŞIRIQ TAMAMLANDI', en: 'QUEST COMPLETE', ru: 'ЗАДАНИЕ ВЫПОЛНЕНО' })}</div>
      <div style="font:800 36px 'Baloo 2', system-ui;color:#FFF7EA;margin-top:8px;line-height:1.1">${TX(EQ.qset().chestTitle)}</div>
    </div>
    <div class="float" style="position:absolute;top:246px;left:0;right:0;display:flex;justify-content:center">
      <svg width="216" height="180" viewBox="0 0 200 170">
        <ellipse cx="100" cy="158" rx="76" ry="10" fill="#000" opacity="0.25"></ellipse>
        <path d="M28 74 q72-58 144 0 v-8 q-72-58 -144 0 Z" fill="#E0A365"></path>
        <path d="M28 40 q72-56 144 0 v30 q-72-52 -144 0 Z" fill="#C9762F" transform="translate(0,-6)"></path>
        <rect x="24" y="78" width="152" height="72" rx="12" fill="#C9762F"></rect>
        <rect x="24" y="88" width="152" height="10" fill="#FFC24B"></rect>
        <rect x="86" y="76" width="28" height="42" rx="8" fill="#FFC24B"></rect>
        <circle cx="100" cy="98" r="6" fill="#8A5A0A"></circle>
        <path d="M50 34 l4 9 9 4 -9 4 -4 9 -4-9 -9-4 9-4 Z" fill="#FFE9A8" opacity="0.9"></path>
        <path d="M152 22 l3 7 7 3 -7 3 -3 7 -3-7 -7-3 7-3 Z" fill="#5CE39B" opacity="0.9"></path>
      </svg>
    </div>
    <div style="position:absolute;top:430px;left:20px;right:20px">
      <div style="font:800 11px Nunito;color:#A896E0;letter-spacing:2px;text-align:center">${TX({ az: 'BU SANDIĞIN İÇİNDƏ', en: 'INSIDE THIS CHEST', ru: 'ВНУТРИ ЭТОГО СУНДУКА' })}</div>
      <div style="display:flex;gap:12px;margin-top:16px;align-items:stretch">
        <div style="flex:1;border-radius:24px;background:rgba(255,255,255,0.08);padding:18px 12px 14px;text-align:center;box-shadow:0 0 0 1.5px rgba(255,255,255,0.10) inset">
          ${EQC.coin(40)}
          <div style="font:800 17px 'Baloo 2';color:#fff;margin-top:6px;min-height:38px;display:flex;align-items:center;justify-content:center">100</div>
          <div style="font:700 10px Nunito;color:#A896E0;letter-spacing:0.8px">${TX({ az: 'MACƏRA SİKKƏSİ', en: 'QUEST COINS', ru: 'МОНЕТ КВЕСТА' })}</div>
        </div>
        <div style="flex:1;border-radius:24px;background:rgba(255,255,255,0.08);padding:18px 12px;text-align:center;box-shadow:0 0 0 1.5px rgba(255,255,255,0.10) inset">
          <svg width="40" height="40" viewBox="0 0 36 36"><ellipse cx="18" cy="26" rx="15" ry="4" fill="#8A6BE0"></ellipse><path d="M18 4 L30 22 H6 Z" fill="#7B5CFF"></path><path d="M18 12 l2.6 5.4 5.4 2.6 -5.4 2 -2.6 5 -2.6-5 -5.4-2 5.4-2.6 Z" fill="#FFE9A8"></path></svg>
          <div style="font:800 15px 'Baloo 2';color:#fff;margin-top:6px;line-height:1.15;min-height:38px;display:flex;align-items:center;justify-content:center">${TX({ az: 'Sehrbaz Papağı', en: 'Wizard Hat', ru: 'Шляпа Волшебника' })}</div>
          <div style="font:700 10px Nunito;color:#A896E0;letter-spacing:0.8px">${TX({ az: 'QARDEROB', en: 'WARDROBE', ru: 'ГАРДЕРОБ' })}</div>
        </div>
        <div style="flex:1;border-radius:24px;background:rgba(255,255,255,0.08);padding:18px 12px;text-align:center;box-shadow:0 0 0 1.5px rgba(255,255,255,0.10) inset">
          <svg width="40" height="40" viewBox="0 0 36 36">${nextSticker ? nextSticker.art : '<rect x="5" y="7" width="26" height="22" rx="6" fill="#5CE39B"></rect><path d="M11 20 q7-9 14 0" stroke="#0B3D25" stroke-width="2.6" fill="none" stroke-linecap="round"></path><circle cx="13" cy="14" r="2" fill="#0B3D25"></circle><circle cx="23" cy="14" r="2" fill="#0B3D25"></circle>'}</svg>
          <div style="font:800 ${nextSticker && TX(nextSticker.name).length > 14 ? '12' : (nextSticker && TX(nextSticker.name).length > 10 ? '14' : '17')}px 'Baloo 2';color:#fff;margin-top:6px;line-height:1.15;min-height:38px;display:flex;align-items:center;justify-content:center">${nextSticker ? TX(nextSticker.name) : TX({ az: 'Stiker', en: 'Sticker', ru: 'Наклейка' })}</div>
          <div style="font:700 10px Nunito;color:#A896E0;letter-spacing:0.8px">${TX({ az: 'ALBOMUN ÜÇÜN', en: 'FOR YOUR ALBUM', ru: 'ДЛЯ ТВОЕГО АЛЬБОМА' })}</div>
        </div>
      </div>
    </div>
    <div style="position:absolute;bottom:186px;left:20px;right:20px;display:flex;align-items:center;gap:12px;background:rgba(92,227,155,0.14);border-radius:22px;padding:14px 16px">
      <div style="width:44px;height:44px;border-radius:16px;background:rgba(92,227,155,0.22);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;flex:none">${EQC.questy('excited', 'width:40px', s.questyFur, s.questyFurDark)}</div>
      <div style="font:700 13.5px Nunito;color:#BFF0D3;line-height:1.5">${TX({ az: 'Açmazdan əvvəl içində nə olduğunu həmişə görürsən.', en: 'You always see what&#39;s inside before you open it.', ru: 'Ты всегда видишь, что внутри, до того как открыть.' })}</div>
    </div>
    <div class="press" onclick="EQ.openChest()" style="position:absolute;bottom:56px;left:20px;right:20px;height:74px;border-radius:24px;background:#FFC24B;box-shadow:0 6px 0 #E39B1C, 0 16px 26px -12px rgba(227,155,28,0.55);display:flex;align-items:center;justify-content:center;gap:10px;font:800 23px 'Baloo 2', system-ui;color:#4A3208">${TX({ az: 'Aç görək!', en: 'Open it!', ru: 'Открыть!' })}</div>
  </div>`;
};
