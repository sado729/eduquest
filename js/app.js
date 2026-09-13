/* EduQuest — app core: state, router, game logic */

const EQ_STORE_KEY = 'eduquest_state_v2';

const EQ_DEFAULTS = {
  onboarded: false,
  heroName: 'Nia',
  hero: { skin: '#F2C49B', hair: 'bob', hairColor: '#4A2E20', outfit: '#3DBE6E', outfitDark: '#2A9455', shoe: '#5B3FD6', hat: 'none' },
  questyFur: '#FF9243', questyFurDark: '#F0762A',
  xp: 0, level: 1, coins: 0, streak: 1,
  xpToday: 0, coinsToday: 0,
  challengesDone: 0,
  bossHits: 0, bossBeaten: false,
  chestReady: false, chestOpened: false,
  wizardHatOwned: false, crownOwned: false,
  mathSolved: 0, hintSparks: 0, stickers: 0, trophiesEarned: 0,
  trophyPlaced: false, pendingLevelUp: false,
  lastVisit: null,
  lastDay: null, questDay: 0, playedDays: [], bestStreak: 1,
  settings: { readAloud: true, bigText: false, calm: false, music: true, bedtime: true, limit: 45, lang: 'az' }
};

/* ── tiny synth — every cue has a silent visual twin ── */
const SFX = {
  ctx: null,
  ac() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } }
    return this.ctx;
  },
  off() { return !EQ.s.settings.music; },
  note(freq, at, dur, type, vol) {
    const c = this.ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    const t = c.currentTime + at;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.07, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  },
  correct() { if (this.off()) return; this.note(523, 0, 0.22); this.note(659, 0.12, 0.3); this.note(1046, 0.2, 0.18, 'sine', 0.03); },
  wrong() { if (this.off()) return; this.note(220, 0, 0.16, 'triangle', 0.06); this.note(196, 0.14, 0.22, 'triangle', 0.05); },
  tap() { if (this.off()) return; this.note(660, 0, 0.06, 'sine', 0.025); },
  fanfare() { if (this.off()) return; [523, 659, 784, 1046].forEach((f, i) => this.note(f, i * 0.11, 0.32, 'sine', 0.06)); }
};

const EQ = {
  s: null,
  current: null,
  session: { createCat: 'skin', wardrobeCat: 'hats', gateInput: '', streakRow: 0, q: null, qIdx: -1, ctx: 'daily', tutorWhy: false, missionAdded: false, answering: false, bossBeam: false, attempted: false, hinted: false, recSkips: [] },

  rank(level) { return TX(EQD.RANKS[level] || (level >= 13 ? EQD.RANK_LEGEND : EQD.RANK_DEFAULT)); },
  pron() { return 'their'; },
  qset() { return EQD.questSet(this.s.questDay || 0); },

  /* ── language (az / en / ru) ── */
  setLang(l) {
    if (EQI.langs.indexOf(l) === -1 || l === EQI.lang) return;
    SFX.tap();
    this.s.settings.lang = l;
    EQI.set(l);
    this.save();
    if (this.current) this.render();
  },
  cycleLang() {
    const next = EQI.langs[(EQI.langs.indexOf(EQI.lang) + 1) % EQI.langs.length];
    this.setLang(next);
    this.toast({ az: 'Dil: Azərbaycanca', en: 'Language: English', ru: 'Язык: Русский' }[next]);
  },

  /* ── daily loop (no backend: the device clock + localStorage) ── */
  dayKey(d) {
    const x = d || new Date();
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  },
  resetDaily() {
    this.s.challengesDone = 0; this.s.bossHits = 0; this.s.bossBeaten = false;
    this.s.chestReady = false; this.s.chestOpened = false;
    this.s.xpToday = 0; this.s.coinsToday = 0;
  },
  newDay(today) {
    this.s.questDay = (this.s.questDay || 0) + 1;
    this.resetDaily();
    this.s.streak++;
    this.s.bestStreak = Math.max(this.s.bestStreak || 0, this.s.streak);
    this.s.playedDays = (this.s.playedDays || []).concat([today]).slice(-14);
    this.s.lastDay = today;
  },
  seedWeek() {
    // first ever boot: today is the first played day — a clean start
    return [this.dayKey()];
  },
  /* rollover for a page that never reloads (installed PWA resumed from memory,
     tab left open across midnight). fromResume=true forces it; otherwise only
     on screens where interrupting is safe (never mid-question or mid-reward). */
  checkNewDay(fromResume) {
    const today = this.dayKey();
    if (!this.s || !this.s.lastDay || this.s.lastDay === today) return false;
    const safe = ['map', 'quest', 'details', 'story', 'home', 'awards', 'bag', 'wardrobe', 'unlock', 'welcome', 'welcomeback', 'splash'];
    if (!fromResume && safe.indexOf(this.current) === -1) return false;
    this.newDay(today);
    this.session.q = null; this.session.qIdx = -1;
    this.save();
    this.go(this.s.onboarded ? 'welcomeback' : this.current);
    return true;
  },

  load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(EQ_STORE_KEY)); } catch (e) { /* fresh start */ }
    this.s = Object.assign({}, EQ_DEFAULTS, s || {});
    this.s.hero = Object.assign({}, EQ_DEFAULTS.hero, (s && s.hero) || {});
    this.s.settings = Object.assign({}, EQ_DEFAULTS.settings, (s && s.settings) || {});
    EQT.init(this.s);
  },
  save() { try { localStorage.setItem(EQ_STORE_KEY, JSON.stringify(this.s)); } catch (e) { /* private mode */ } },

  /* ── router ── */
  go(name) {
    EQT.tick(); /* attribute elapsed time to the screen being left */
    if (name === 'challenge' && this.s.challengesDone >= 5) name = 'boss';
    if (name === 'challenge') {
      this.session.ctx = 'daily';
      if (!this.session.q || this.session.qIdx !== this.s.challengesDone) {
        this.session.q = this.qset().questions[Math.min(4, this.s.challengesDone)];
        this.session.qIdx = this.s.challengesDone;
        this.session.attempted = false; this.session.hinted = false;
      }
    }
    if (name === 'boss') {
      if (this.s.bossBeaten) name = 'victory';
      else {
        this.session.ctx = 'boss';
        const bq = this.qset().boss[Math.min(3, this.s.bossHits)];
        if (this.session.q !== bq) { this.session.q = bq; this.session.attempted = false; this.session.hinted = false; }
      }
    }
    if ((name === 'success' || name === 'hint' || name === 'tutor') && !this.session.q) {
      this.session.q = this.qset().questions[Math.min(4, this.s.challengesDone)] || this.qset().questions[3];
      this.session.qIdx = this.s.challengesDone;
      this.session.attempted = false; this.session.hinted = false;
    }
    if (name === 'hint' && this.session.q && !this.session.hinted) {
      this.session.hinted = true;
      EQT.hint(this.session.q);
    }
    if (this.current === 'tutor' && name !== 'tutor') this.session.tutorWhy = false;
    this.current = name;
    this.render();
  },
  nav(tab) {
    SFX.tap();
    this.go({ world: 'map', quests: 'quest', hero: 'wardrobe', awards: 'awards', bag: 'bag' }[tab] || 'map');
  },
  render() {
    const fn = EQS.screens[this.current];
    if (!fn) { this.current = 'map'; return this.render(); }
    document.getElementById('screen').innerHTML = fn(this.s);
    const meta = EQS.meta[this.current] || { light: true };
    this.paintChrome(meta.light);
  },
  paintChrome(light) {
    const c = light ? '#fff' : '#000';
    const sb = document.getElementById('statusbar');
    sb.innerHTML = `
      <span class="sb-time" style="color:${c}">${this.clock()}</span>
      <div style="display:flex;align-items:center;gap:7px">
        <svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill="${c}"/><rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill="${c}"/><rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill="${c}"/><rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill="${c}"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill="${c}"/><path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill="${c}"/><circle cx="8.5" cy="10.5" r="1.5" fill="${c}"/></svg>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="${c}" stroke-opacity="0.35" fill="none"/><rect x="2" y="2" width="20" height="9" rx="2" fill="${c}"/><path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill="${c}" fill-opacity="0.4"/></svg>
      </div>`;
    document.getElementById('homeind').innerHTML = `<div style="background:${light ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'}"></div>`;
  },
  clock() {
    const d = new Date();
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  },

  /* ── toast ── */
  toastTimer: null,
  toast(msg) {
    SFX.tap();
    const t = document.getElementById('toast');
    t.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" style="flex:none"><path d="M12 3 l2.4 6.4 6.6 0.4 -5 4.4 1.6 6.4 -5.6-3.4 -5.6 3.4 1.6-6.4 -5-4.4 6.6-0.4 Z" fill="#5CE39B"></path></svg><span>${msg}</span>`;
    t.classList.add('on');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.remove('on'), 2400);
  },

  /* ── onboarding ── */
  haveHero() {
    if (this.s.onboarded) this.go('map');
    else { this.toast(TX({ az: 'Hələ qəhrəman yoxdur — gəl birini yaradaq!', en: 'No hero here yet — let’s make one!', ru: 'Героя пока нет — давай создадим!' })); this.go('create'); }
  },
  createCat(key) { SFX.tap(); this.session.createCat = key; this.render(); },
  createPick(cat, i) {
    SFX.tap();
    const h = this.s.hero;
    const sets = {
      skin: ['#FBDCC0', '#F2C49B', '#C98B62', '#8D5A3B', '#5E3A26'].map(c => ({ skin: c })),
      hair: ['bob', 'curly', 'spiky', 'long', 'braids'].map(x => ({ hair: x })),
      hairColor: ['#2B2027', '#4A2E20', '#C9762F', '#F0C24B', '#7B5CFF'].map(c => ({ hairColor: c })),
      outfit: EQD.OUTFITS.map(p => ({ outfit: p[0], outfitDark: p[1] })),
      hat: ['none', 'explorer', 'wizard', 'crown'].map(x => ({ hat: x }))
    };
    Object.assign(h, sets[cat][i]);
    if (cat === 'hat' && (h.hat === 'wizard')) this.s.wizardHatOwned = true;
    if (cat === 'hat' && (h.hat === 'crown')) this.s.crownOwned = true;
    this.save(); this.render();
  },
  renameHero() {
    const name = prompt(TX({ az: 'Qəhrəmanının adı nədir?', en: 'What is your hero called?', ru: 'Как зовут твоего героя?' }), this.s.heroName);
    if (name && name.trim()) { this.s.heroName = name.trim().slice(0, 14); this.save(); this.render(); }
  },
  finishOnboarding() {
    this.s.onboarded = true;
    this.save();
    SFX.fanfare();
    this.go('map');
  },

  /* ── world map ── */
  questyChirp() {
    const lines = TX({
      az: ['Macəra hər yerdədir!', 'Qapı yaxındadır — hiss edirəm!', 'Bu gün əla gedirsən!', 'Meşəyə qədər yarışaq! 🦊'],
      en: ['Adventure is everywhere!', 'The gate is close — I can feel it!', 'You’re doing great today!', 'Race you to the forest! 🦊'],
      ru: ['Приключения повсюду!', 'Ворота близко — я чувствую!', 'Сегодня у тебя отлично получается!', 'Наперегонки до леса! 🦊']
    });
    this.toast(lines[Math.floor(Math.random() * lines.length)]);
  },
  openChestOrToast() {
    if (this.s.chestReady && !this.s.chestOpened) this.go('chest');
    else if (this.s.chestOpened) this.toast(TX({ az: 'Sandıq açılıb! Yenisi sabahkı macəra ilə gələcək.', en: 'Chest opened! A new one comes with tomorrow’s quest.', ru: 'Сундук открыт! Новый появится с завтрашним приключением.' }));
    else this.toast(TX({ az: 'Sandığı qazanmaq üçün bugünkü macəranı bitir! 🗝️', en: 'Finish today’s adventure to earn the chest! 🗝️', ru: 'Заверши сегодняшнее приключение, чтобы получить сундук! 🗝️' }));
  },

  /* ── quest flow ── */
  startChallenge() { SFX.tap(); this.go('challenge'); },
  /* the set is fully done (boss beaten, chest opened) → the next one opens right away,
     no waiting for tomorrow. Streak and the daily counters stay calendar-based. */
  nextStage() {
    if (!this.s.bossBeaten || (this.s.chestReady && !this.s.chestOpened)) return;
    SFX.fanfare();
    this.s.questDay = (this.s.questDay || 0) + 1;
    this.s.challengesDone = 0; this.s.bossHits = 0; this.s.bossBeaten = false;
    this.s.chestReady = false; this.s.chestOpened = false;
    this.session.q = null; this.session.qIdx = -1;
    this.save();
    this.go('quest');
    this.toast(TX({ az: 'Yeni macəra açıldı! 🎉', en: 'A new adventure is open! 🎉', ru: 'Новое приключение открыто! 🎉' }));
  },
  continueQuest() {
    if (this.s.challengesDone >= 5 && !this.s.bossBeaten) this.go('boss');
    else if (this.s.bossBeaten) this.go('map');
    else this.go('challenge');
  },
  grant(xp, coins) {
    this.s.xp += xp; this.s.xpToday += xp;
    this.s.coins += coins; this.s.coinsToday += coins;
    if (this.s.xp >= 1500) this.s.pendingLevelUp = true;
  },
  answer(i) {
    if (this.session.answering) return;
    const q = this.session.q;
    const el = document.getElementById('ans-' + i);
    const correct = q.answers[i] === q.correct;
    if (!this.session.attempted) { this.session.attempted = true; EQT.attempt(q, correct); }
    this.session.answering = true;
    if (correct) {
      if (el) { el.classList.add('good'); el.innerHTML = `${q.answers[i]} ${EQC.check('#fff', 26, 3.4)}`; }
      SFX.correct();
      setTimeout(() => {
        this.session.answering = false;
        this.session.streakRow++;
        if (this.session.ctx === 'boss') {
          this.s.bossHits++;
          this.s.mathSolved = Math.min(100, this.s.mathSolved + 1);
          EQT.bossHit();
          if (this.s.bossHits >= 4) {
            this.s.bossBeaten = true;
            this.s.chestReady = true;
            this.s.trophiesEarned++;
            this.grant(250, 100);
            EQT.bossWin();
            this.save();
            SFX.fanfare();
            this.go('victory');
          } else {
            this.session.bossBeam = true;
            this.save();
            this.go('boss');
          }
        } else {
          if (q.subj === 'math') this.s.mathSolved = Math.min(100, this.s.mathSolved + 1);
          this.grant(50, 10);
          this.s.challengesDone = Math.min(5, this.s.challengesDone + 1);
          EQT.done(q, this.session.hinted);
          this.save();
          this.go('success');
        }
      }, 900);
    } else {
      if (el) { el.classList.add('warm'); el.innerHTML = `${q.answers[i]}<span style="font:800 13px Nunito;margin-left:8px">${TX({ az: 'bir də yoxla', en: 'try again', ru: 'ещё раз' })}</span>`; }
      SFX.wrong();
      this.session.streakRow = 0;
      setTimeout(() => { this.session.answering = false; this.go('hint'); }, 950);
    }
  },
  continueAfterSuccess() {
    const next = this.s.challengesDone >= 5 ? 'boss' : 'challenge';
    if (this.s.pendingLevelUp) { this.session.afterLevel = next; this.go('levelup'); }
    else this.go(next);
  },
  applyLevelUp() {
    this.s.level++;
    this.s.xp = Math.max(0, this.s.xp - 1500);
    this.s.pendingLevelUp = false;
    this.save();
    const target = this.session.afterLevel || 'map';
    this.session.afterLevel = null;
    this.go(target);
  },
  openChest() {
    this.s.coins += 100; this.s.coinsToday += 100;
    this.s.wizardHatOwned = true;
    this.s.stickers = Math.min(24, this.s.stickers + 1);
    this.s.chestOpened = true; this.s.chestReady = false;
    this.save();
    SFX.fanfare();
    if (this.s.pendingLevelUp) { this.session.afterLevel = 'map'; this.go('levelup'); }
    else { this.go('map'); this.toast(TX({ az: '+100 sikkə · Sehrbaz Papağı qarderobuna əlavə olundu!', en: '+100 coins · Wizard Hat added to your wardrobe!', ru: '+100 монет · Шляпа Волшебника добавлена в гардероб!' })); }
  },

  /* ── tutor ── */
  easierOne() {
    const q = this.session.q;
    if (q && q.easier) {
      this.session.q = q.easier;
      this.session.attempted = false; this.session.hinted = false;
      SFX.tap();
      this.go(this.session.ctx === 'boss' ? 'boss' : 'challenge');
      this.toast(TX({ az: 'Əvvəlcə bir az asanı — eyni fikirdir!', en: 'A gentler one first — same idea!', ru: 'Сначала полегче — идея та же!' }));
    }
  },
  tutorAgain() {
    SFX.tap();
    const card = document.getElementById('tutor-card');
    if (card) { card.classList.remove('rise'); void card.offsetWidth; card.classList.add('rise'); }
  },
  tutorWhy() { SFX.tap(); this.session.tutorWhy = true; this.render(); },

  /* ── wardrobe ── */
  wardrobeCat(key) { SFX.tap(); this.session.wardrobeCat = key; this.render(); },
  wearHat(key) { SFX.tap(); this.s.hero.hat = key; this.save(); this.render(); },
  wearOutfit(c, d) { SFX.tap(); this.s.hero.outfit = c; this.s.hero.outfitDark = d; this.save(); this.render(); },
  wearShoes(c) { SFX.tap(); this.s.hero.shoe = c; this.save(); this.render(); },
  wearFur(f, fd) { SFX.tap(); this.s.questyFur = f; this.s.questyFurDark = fd; this.save(); this.render(); },
  buyCrown() {
    if (this.s.coins >= 250) {
      this.s.coins -= 250; this.s.crownOwned = true; this.s.hero.hat = 'crown';
      this.save(); SFX.fanfare(); this.render();
      this.toast(TX({ az: 'Ulduz Tacı sənindir! 👑', en: 'Star Crown is yours! 👑', ru: 'Звёздная Корона твоя! 👑' }));
    } else this.toast(TX({ az: `Ulduz Tacı 250 sikkədir — səndə ${this.s.coins} var.`, en: `The Star Crown costs 250 coins — you have ${this.s.coins}.`, ru: `Звёздная Корона стоит 250 монет — у тебя ${this.s.coins}.` }));
  },
  ownedHats() {
    const list = ['none', 'explorer'];
    if (this.s.wizardHatOwned) list.push('wizard');
    if (this.s.crownOwned) list.push('crown');
    return list;
  },
  cycleHat(dir) {
    SFX.tap();
    const hats = this.ownedHats();
    const idx = Math.max(0, hats.indexOf(this.s.hero.hat));
    this.s.hero.hat = hats[(idx + dir + hats.length) % hats.length];
    this.save(); this.render();
  },
  saveLook() { this.save(); SFX.correct(); this.toast(TX({ az: 'Görkəm yadda saxlanıldı — Questy bəyəndi!', en: 'Look saved — Questy loves it!', ru: 'Образ сохранён — Квести в восторге!' })); },

  /* ── home ── */
  placeTrophy() { SFX.correct(); this.s.trophyPlaced = true; this.save(); this.render(); },

  /* ── parent gate ── */
  gateKey(n) {
    SFX.tap();
    if ((this.session.gateInput || '').length < 3) {
      this.session.gateInput = (this.session.gateInput || '') + n;
      this.render();
    }
  },
  gateBack() { SFX.tap(); this.session.gateInput = (this.session.gateInput || '').slice(0, -1); this.render(); },
  gateSubmit() {
    if (parseInt(this.session.gateInput, 10) === 48) {
      this.session.gateInput = '';
      SFX.correct();
      this.go('parent_dashboard');
    } else {
      this.session.gateInput = '';
      SFX.wrong();
      this.render();
      const card = document.getElementById('gate-card');
      if (card) card.classList.add('wobble');
      this.toast(TX({ az: 'Hmm — bir cəhd də, böyük!', en: 'Hmm — one more try, grown-up!', ru: 'Хм — ещё одна попытка, взрослый!' }));
    }
  },
  exitParent() {
    this.session.gateInput = '';
    this.go(this.s.onboarded ? 'map' : 'welcome');
  },

  /* ── parent settings ── */
  ptoggle(key) {
    SFX.tap();
    this.s.settings[key] = !this.s.settings[key];
    this.save();
    this.applyCalm();
    this.render();
  },
  cycleLimit() {
    SFX.tap();
    const steps = [15, 30, 45, 60, 90];
    const idx = steps.indexOf(this.s.settings.limit);
    this.s.settings.limit = steps[(idx + 1) % steps.length];
    this.save(); this.render();
  },
  addMission(topic) {
    if (!EQT.MISSIONS[topic]) return;
    const today = this.dayKey();
    if (this.s.parentQuests.some(m => m.t === topic && m.day === today)) return;
    SFX.correct();
    this.s.parentQuests.push({ t: topic, day: today });
    this.save();
    this.render();
    const nm = TX(EQT.MISSIONS[topic].name);
    this.toast(TX({ az: `«${nm}» tapşırıq siyahısına əlavə olundu`, en: `“${nm}” added to the quest list`, ru: `«${nm}» добавлено в список заданий` }));
  },
  dismissRec(topic) {
    SFX.tap();
    this.session.recSkips.push(topic);
    this.render();
    this.toast(TX({ az: 'Rədd edildi — Questy yenisini təklif etdi', en: 'Dismissed — Questy suggested something new', ru: 'Отклонено — Квести предложил другое' }));
  },
  applyCalm() { document.body.classList.toggle('calm', !!this.s.settings.calm); },
  resetDemo() {
    if (confirm(TX({ az: 'Bütün macəra sıfırlansın? Bütün irəliləyiş itəcək.', en: 'Reset the whole adventure? All progress will be lost.', ru: 'Сбросить всё приключение? Весь прогресс будет потерян.' }))) {
      localStorage.removeItem(EQ_STORE_KEY);
      location.reload();
    }
  },

  /* ── stage scaling ── */
  fit() {
    const stage = document.getElementById('stage');
    const phone = document.getElementById('phone');
    const pad = window.innerWidth <= 500 ? 0 : 40;
    const scale = Math.min((window.innerWidth - pad) / 402, (window.innerHeight - pad) / 874);
    phone.style.transform = `scale(${Math.min(scale, 1.15)})`;
    stage.style.display = 'flex';
  },

  boot() {
    this.load();
    EQI.set(this.s.settings.lang || 'az');
    this.applyCalm();
    this.fit();
    window.addEventListener('resize', () => this.fit());
    EQT._t = Date.now();
    setInterval(() => {
      EQT.tick(); this.save(); /* heartbeat: accumulate play time and persist it */
      if (this.checkNewDay(false)) return;
      const m = EQS.meta[this.current] || { light: true };
      this.paintChrome(m.light);
    }, 30000);
    /* app resumed after being backgrounded — roll the day if it changed */
    document.addEventListener('visibilitychange', () => {
      EQT.tick();
      if (document.hidden) this.save();
      else this.checkNewDay(true);
    });
    window.addEventListener('focus', () => this.checkNewDay(true));
    window.addEventListener('pagehide', () => { EQT.tick(); this.save(); });

    const params = new URLSearchParams(location.search);

    /* dev-only: force a language with ?lang=az|en|ru */
    const devLang = params.get('lang');
    if (devLang && EQI.langs.indexOf(devLang) >= 0) { this.s.settings.lang = devLang; EQI.set(devLang); }

    /* dev-only: force a quest day with ?day=N */
    const devDay = parseInt(params.get('day'), 10);
    if (!isNaN(devDay)) { this.s.questDay = devDay; this.resetDaily(); }

    /* daily rollover: new calendar day → fresh quest set, streak +1 */
    const today = this.dayKey();
    let isNewDay = false;
    if (!this.s.lastDay) {
      this.s.lastDay = today;
      if (!this.s.playedDays || !this.s.playedDays.length) this.s.playedDays = this.seedWeek();
    } else if (this.s.lastDay !== today) {
      this.newDay(today);
      isNewDay = true;
    }

    let start = !this.s.onboarded ? 'splash'
      : (isNewDay ? 'welcomeback' : 'splash');
    const forced = params.get('screen');
    if (forced && EQS.screens[forced]) start = forced;
    this.s.lastVisit = Date.now();
    this.save();
    this.go(start);
    if (params.get('autotest')) this.autotest();
  },

  /* dev-only: drive the whole play loop (append ?autotest=1) */
  autotest() {
    this.go('challenge');
    const step = () => {
      const q = this.session.q;
      if (this.current === 'challenge' || this.current === 'boss') {
        if (!this.session.answering && q) this.answer(q.answers.indexOf(q.correct));
      } else if (this.current === 'success') this.continueAfterSuccess();
      else if (this.current === 'victory') this.go('chest');
      else if (this.current === 'chest') this.openChest();
      else if (this.current === 'levelup') { document.title = 'AUTOTEST-DONE level=' + (this.s.level + 1) + ' xp=' + this.s.xp + ' coins=' + this.s.coins; clearInterval(this.autoTimer); return; }
      else if (this.current === 'map') { document.title = 'AUTOTEST-DONE-MAP xp=' + this.s.xp; clearInterval(this.autoTimer); return; }
    };
    this.autoTimer = setInterval(step, 1400);
  }
};

window.addEventListener('DOMContentLoaded', () => EQ.boot());
