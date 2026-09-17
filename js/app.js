/* EduQuest — app core: state, router, game logic */

/* one state blob per child — the key belongs to the active profile (js/profiles.js) */

/* ── rest screen (daily limit + bedtime pause) ──
   Screens the pause never takes over: the grown-up area, the first-run flow, and the
   reward beats a child has already earned — they finish the moment, then Questy rests. */
const EQ_REST_FREE = ['restday', 'splash', 'welcome', 'create', 'meet', 'begin', 'success', 'victory', 'levelup', 'chest', 'sticker'];
/* calm screens where the heartbeat may bring the rest screen up on its own
   (never mid-question: a challenge already started is always allowed to finish) */
const EQ_REST_NUDGE = ['map', 'quest', 'mission', 'details', 'story', 'home', 'awards', 'bag', 'album', 'care', 'wardrobe', 'unlock', 'welcomeback'];
const EQ_REST_MORNING = 5 * 60; /* the bedtime window closes at 05:00 */

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
  mathSolved: 0, hintSparks: 0, stickers: 0, stickerIds: [], trophiesEarned: 0,
  /* Questy'nin qulluğu: bugünkü verilmiş qulluqlar və ümumi say (bax: EQ.careGive) */
  careDay: null, careGiven: [], careTotal: 0,
  trophyPlaced: false, pendingLevelUp: false,
  lastVisit: null,
  lastDay: null, questDay: 0, playedDays: [], bestStreak: 1,
  settings: { readAloud: true, bigText: false, calm: false, music: true, bedtime: true, bedMin: 1200, limit: 45, bonusDay: null, bonusMins: 0, lang: 'az' }
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
  frozen: false, /* set while an import is being written: nothing may save over it */
  session: { createCat: 'skin', wardrobeCat: 'hats', albumSet: 'forest', newSticker: null, justAdded: null, gateInput: '', streakRow: 0, q: null, qIdx: -1, ctx: 'daily', mission: null, tutorWhy: false, missionAdded: false, answering: false, bossBeam: false, attempted: false, hinted: false, recSkips: [], range: 'week' },

  rank(level) { return TX(EQD.RANKS[level] || (level >= 13 ? EQD.RANK_LEGEND : EQD.RANK_DEFAULT)); },
  pron() { return 'their'; },
  qset() { return EQD.questSet(this.s.questDay || 0); },
  /* where the current stage sits in the chapter structure (3 stages = 1 chapter) */
  chapter() { return EQD.chapterAt(this.s.questDay || 0); },
  /* the boss closing this stage: the chapter finale on stage 3, the guardian otherwise */
  boss() { return this.chapter().boss; },
  bossHitsNeeded() { return this.boss().hits; },

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
    /* a fresh day gets a fresh plan, built from everything played up to now */
    EQT.replan(this.s.questDay);
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
    const safe = ['map', 'quest', 'mission', 'details', 'story', 'home', 'awards', 'bag', 'album', 'care', 'wardrobe', 'unlock', 'welcome', 'welcomeback', 'splash', 'restday'];
    if (!fromResume && safe.indexOf(this.current) === -1) return false;
    this.newDay(today);
    this.session.q = null; this.session.qIdx = -1;
    this.save();
    this.go(this.s.onboarded ? 'welcomeback' : this.current);
    return true;
  },

  /* ── daily limit + bedtime pause ──
     EQT already measures real play time; this turns it into Questy's soft rest screen.
     restState() → 'limit' | 'bed' | null. Bonus minutes a parent grants today push both back. */
  bonusMins() {
    const st = this.s.settings;
    return st.bonusDay === this.dayKey() ? (st.bonusMins || 0) : 0;
  },
  bedStart() { return Math.min((this.s.settings.bedMin || 1200) + this.bonusMins(), 1439); },
  fmtTime(mins) { return Math.floor(mins / 60) + ':' + String(mins % 60).padStart(2, '0'); },
  /* today's play minutes, read straight from the tracker (never creates a day bucket) */
  playedToday() {
    const d = (this.s.track && this.s.track.days && this.s.track.days[this.dayKey()]) || null;
    return d ? (d.secs || 0) / 60 : 0;
  },
  restState() {
    if (!this.s || !this.s.onboarded) return null;
    const st = this.s.settings;
    if (st.limit > 0 && this.playedToday() >= st.limit + this.bonusMins()) return 'limit';
    if (st.bedtime) {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      if (mins >= this.bedStart() || mins < EQ_REST_MORNING) return 'bed';
    }
    return null;
  },
  /* may this screen open right now? (called by the router for every navigation) */
  restGuard(name) {
    if (!this.s || !this.s.onboarded) return false;
    if (name.indexOf('parent') === 0 || EQ_REST_FREE.indexOf(name) >= 0) return false;
    return !!this.restState();
  },
  /* heartbeat / resume: bring the rest screen up while the child is just browsing */
  restNudge() {
    if (EQ_REST_NUDGE.indexOf(this.current) === -1 || !this.restState()) return false;
    this.go('restday');
    return true;
  },
  restWave() {
    SFX.tap();
    this.session.restWaved = true;
    this.render();
  },

  load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(EQP.key())); } catch (e) { /* fresh start */ }
    this.s = Object.assign({}, EQ_DEFAULTS, s || {});
    this.s.hero = Object.assign({}, EQ_DEFAULTS.hero, (s && s.hero) || {});
    this.s.settings = Object.assign({}, EQ_DEFAULTS.settings, (s && s.settings) || {});
    this.s.stickerIds = this.cleanStickers(s && s.stickerIds, this.s.stickers);
    this.s.stickers = this.s.stickerIds.length;
    EQT.init(this.s);
  },
  save() {
    if (this.frozen) return; /* an import has just replaced storage; the page is reloading */
    try { localStorage.setItem(EQP.key(), JSON.stringify(this.s)); } catch (e) { /* private mode */ }
  },

  /* ── router ── */
  go(name) {
    EQT.tick(); /* attribute elapsed time to the screen being left */
    if (this.current === 'album' && name !== 'album') this.leaveAlbum();
    if (this.restGuard(name)) name = 'restday'; /* limit reached / bedtime — Questy takes over */
    /* a mission in progress owns the challenge screen: its own eight questions, its
       own counter, and no boss at the end — so the daily redirect must not fire */
    if (name === 'challenge' && this.session.ctx === 'mission' && this.missionEntry()) {
      const m = this.missionEntry();
      if (m.n >= EQD.MISSION_LEN) name = 'mission';
      else {
        const mq = this.missionSet().questions[m.n];
        if (this.session.qIdx !== m.n || this.session.q !== mq) {
          this.session.q = mq;
          this.session.qIdx = m.n;
          this.session.attempted = false; this.session.hinted = false;
        }
      }
    } else if (name === 'challenge') {
      if (this.s.challengesDone >= 5) name = 'boss';
      else {
        this.session.ctx = 'daily';
        if (!this.session.q || this.session.qIdx !== this.s.challengesDone) {
          this.session.q = this.qset().questions[Math.min(4, this.s.challengesDone)];
          this.session.qIdx = this.s.challengesDone;
          this.session.attempted = false; this.session.hinted = false;
        }
      }
    }
    /* leaving the mission for anywhere that isn't part of playing it drops the pointer,
       so the daily quest never inherits a mission's context or its question */
    if (name !== 'challenge' && name !== 'mission' && name !== 'hint' && name !== 'tutor'
      && name !== 'success' && name !== 'restday' && this.session.ctx === 'mission') {
      this.session.ctx = 'daily';
      this.session.mission = null;
      this.session.q = null; this.session.qIdx = -1;
    }
    if (name === 'boss') {
      if (this.s.bossBeaten) name = 'victory';
      else {
        this.session.ctx = 'boss';
        const pool = this.qset().boss;
        const bq = pool[Math.min(pool.length - 1, this.s.bossHits)];
        if (this.session.q !== bq) { this.session.q = bq; this.session.attempted = false; this.session.hinted = false; }
      }
    }
    if ((name === 'success' || name === 'hint' || name === 'tutor') && !this.session.q) {
      if (this.session.ctx === 'mission' && this.missionEntry()) {
        const m = this.missionEntry();
        this.session.q = this.missionSet().questions[Math.min(EQD.MISSION_LEN - 1, m.n)];
        this.session.qIdx = m.n;
      } else {
        this.session.q = this.qset().questions[Math.min(4, this.s.challengesDone)] || this.qset().questions[3];
        this.session.qIdx = this.s.challengesDone;
      }
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

  /* ── parent-approved missions ──
     The grown-up approves one on screen 26 and it is promised to appear "in the child's
     world". It appears on the quest list as its own card, and playing it is the same
     loop as a daily challenge — same challenge screen, same hint, same tutor — over the
     eight questions of the approved topic. It has no boss and does not touch the daily
     5/5: a mission is extra practice beside the adventure, never in place of it. */

  /* the mission the session is currently playing, re-read from state every time so a
     stale session pointer can never keep a finished mission alive */
  missionEntry() {
    const p = this.session.mission;
    if (!p) return null;
    const m = EQT.findMission(this.s, p.t, p.day);
    return m && !m.done ? m : null;
  },
  missionSet() {
    const m = this.missionEntry();
    return m ? EQD.missionSet(m.t, m.day) : null;
  },
  /* open the mission's own screen (its card, its progress, its start button) */
  openMission(topic, day) {
    const m = EQT.findMission(this.s, topic, day);
    if (!m || m.done) return;
    SFX.tap();
    this.session.mission = { t: m.t, day: m.day };
    this.session.ctx = 'mission';
    this.session.q = null; this.session.qIdx = -1;
    this.go('mission');
  },
  /* the next unplayed mission, which is what the card on the quest list points at */
  startNextMission() {
    const m = EQT.nextMission(this.s);
    if (m) this.openMission(m.t, m.day);
  },
  startMissionQuestion() {
    if (!this.missionEntry()) return;
    SFX.tap();
    this.session.ctx = 'mission';
    this.go('challenge');
  },
  /* one mission question answered correctly: advance the mission, then either the next
     question or the finish. The reward is smaller than a daily challenge on purpose —
     practice a grown-up asked for should not become the fastest way to farm coins. */
  missionAdvance() {
    const m = this.missionEntry();
    if (!m) { this.go('quest'); return; }
    m.n = Math.min(EQD.MISSION_LEN, (m.n || 0) + 1);
    this.grant(25, 5);
    if (m.n >= EQD.MISSION_LEN) {
      m.done = true;
      this.s.coins += 40; this.s.coinsToday += 40;
    }
    this.save();
  },
  /* the button under a mission's success screen */
  continueMission() {
    const m = this.missionEntry();
    const next = m ? 'challenge' : 'mission';
    if (this.s.pendingLevelUp) { this.session.afterLevel = next; this.go('levelup'); }
    else this.go(next);
  },
  /* leaving a finished mission (or one the child put down) goes back to the quest list */
  leaveMission() {
    SFX.tap();
    this.go('quest');
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
    /* the next stage is a new set, so it is planned from the set just finished */
    EQT.replan(this.s.questDay);
    this.save();
    this.go('quest');
    /* crossing a chapter boundary is a bigger moment than the next stage of the same one */
    const now = this.chapter();
    if (now.stageNo === 1) {
      this.toast(TX({
        az: `Fəsil ${now.chapterNo} başlayır: ${TX(now.ch.name)}! 📖`,
        en: `Chapter ${now.chapterNo} begins: ${TX(now.ch.name)}! 📖`,
        ru: `Начинается глава ${now.chapterNo}: ${TX(now.ch.name)}! 📖`
      }));
    } else {
      this.toast(TX({ az: 'Yeni macəra açıldı! 🎉', en: 'A new adventure is open! 🎉', ru: 'Новое приключение открыто! 🎉' }));
    }
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
    /* the first try is the one that counts, both for the stats and for the spacing:
       a topic recalled unaided moves out to a longer gap, a miss brings it straight
       back. Later tries on the same question are practice, not evidence. */
    if (!this.session.attempted) {
      this.session.attempted = true;
      EQT.attempt(q, correct);
      EQT.review(q, correct, this.session.hinted);
    }
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
          if (this.s.bossHits >= this.bossHitsNeeded()) {
            this.s.bossBeaten = true;
            this.s.chestReady = true;
            this.s.trophiesEarned++;
            /* a chapter finale is the longer fight, so it pays the larger purse */
            const fin = this.chapter().final;
            this.grant(fin ? 400 : 250, fin ? 160 : 100);
            EQT.bossWin();
            this.save();
            SFX.fanfare();
            this.go('victory');
          } else {
            this.session.bossBeam = true;
            this.save();
            this.go('boss');
          }
        } else if (this.session.ctx === 'mission') {
          if (q.subj === 'math') this.s.mathSolved = Math.min(100, this.s.mathSolved + 1);
          EQT.done(q, this.session.hinted);
          this.missionAdvance();
          this.go('success');
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
    if (this.session.ctx === 'mission') return this.continueMission();
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
    const got = this.awardSticker();
    this.s.chestOpened = true; this.s.chestReady = false;
    this.save();
    SFX.fanfare();
    if (this.s.pendingLevelUp) { this.session.afterLevel = 'map'; this.go('levelup'); }
    else if (got) { this.session.newSticker = got.id; this.go('sticker'); }
    else { this.go('map'); this.toast(TX({ az: '+100 sikkə · Sehrbaz Papağı qarderobuna əlavə olundu!', en: '+100 coins · Wizard Hat added to your wardrobe!', ru: '+100 монет · Шляпа Волшебника добавлена в гардероб!' })); }
  },

  /* ── sticker album ──
     The album remembers *which* stickers a child owns; `s.stickers` is only ever the
     length of that list. A save from before the album existed carries a count and no
     ids, so the first `n` stickers of the album are handed over — the child keeps
     everything they earned, and the counter they have been watching does not move. */
  cleanStickers(ids, count) {
    const out = [];
    (Array.isArray(ids) ? ids : []).forEach(id => {
      if (EQD.STICKER_BY_ID[id] && out.indexOf(id) < 0) out.push(id);
    });
    if (!out.length) {
      const n = Math.max(0, Math.min(EQD.STICKERS.length, Math.floor(count) || 0));
      for (let i = 0; i < n; i++) out.push(EQD.STICKERS[i].id);
    }
    return out;
  },
  hasSticker(id) { return (this.s.stickerIds || []).indexOf(id) >= 0; },
  /* give the next sticker in album order; returns it, or null when the album is full */
  awardSticker(id) {
    const st = id ? EQD.STICKER_BY_ID[id] : EQD.nextSticker(this.s.stickerIds);
    if (!st || this.hasSticker(st.id)) return null;
    this.s.stickerIds.push(st.id);
    this.s.stickers = this.s.stickerIds.length;
    return st;
  },
  /* open the album on the page a sticker lives on (the reveal screen links here).
     The sticker just earned is flagged so the album opens with it badged — otherwise
     arriving from the reveal screen looks no different from opening the album cold. */
  openAlbum(setId) {
    SFX.tap();
    if (setId) this.session.albumSet = setId;
    this.session.justAdded = this.session.newSticker || null;
    this.session.newSticker = null;
    this.go('album');
  },
  albumSet(setId) {
    if (this.session.albumSet === setId) return;
    SFX.tap();
    this.session.albumSet = setId;
    this.render();
  },
  /* the "NEW" badge belongs to the trip in from the chest, so it does not survive
     leaving the album — the next visit is an ordinary one */
  leaveAlbum() { this.session.justAdded = null; },
  /* a locked slot says what to do instead of nothing at all */
  stickerPeek(id) {
    const st = EQD.STICKER_BY_ID[id];
    if (!st) return;
    SFX.tap();
    if (this.hasSticker(id)) this.toast(TX(st.name) + ' · ' + TX({ az: 'sənindir!', en: 'yours!', ru: 'твоя!' }));
    else this.toast(TX({ az: 'Hələ bağlıdır — ', en: 'Still locked — ', ru: 'Пока закрыта — ' }) + TX(st.how));
  },
  /* from the reveal screen back into the adventure */
  afterSticker() {
    SFX.tap();
    this.session.newSticker = null;
    this.go('map');
    this.toast(TX({ az: '+100 sikkə · Sehrbaz Papağı qarderobuna əlavə olundu!', en: '+100 coins · Wizard Hat added to your wardrobe!', ru: '+100 монет · Шляпа Волшебника добавлена в гардероб!' }));
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

  /* ── Questy'nin qulluğu ──
     Sikkənin gündəlik xərclənmə yeri. Tac bir dəfəlik alışdır; qulluq hər gün təkrarlanır.

     Üç qayda, hər üçü uşağın xeyrinə:
       1. gün ərzində heç nə azalmır. Questy ac qalmır, kədərlənmir, "səni gözləyir"
          demir — uşaq oynamadığı üçün cəzalandırılmır. Qulluq yalnız əlavə edir.
       2. hər qulluq gündə bir dəfə. İkinci dəfə toxunmaq sikkə aparmır: sadəcə mehriban
          bir cavab qayıdır ("Questy doydu — sabah yenə acacaq!").
       3. sikkə çatmırsa, nə qədər çatmadığı deyilir — sındırıcı deyil, hədəf verən cavab.

     Gün dəyişimi `careDay` ilə tutulur: resetDaily deyil, çünki qulluq təqvim gününə
     bağlıdır və oyunçu gün ərzində neçə dəfə girsə də eyni qalmalıdır. */
  careToday() {
    if (this.s.careDay !== this.dayKey()) return [];
    return Array.isArray(this.s.careGiven) ? this.s.careGiven : [];
  },
  caredWith(id) { return this.careToday().indexOf(id) >= 0; },
  careLeft() { return EQD.CARE.filter(c => !this.caredWith(c.id)).length; },
  /* bugünkü qulluqdan sonra Questy hansı ovqatda görünür (sonuncu verilən qulluq) */
  careMood() {
    const given = this.careToday();
    if (!given.length) return 'happy';
    const last = EQD.CARE_BY_ID[given[given.length - 1]];
    return (last && last.mood) || 'happy';
  },
  careGive(id) {
    const item = EQD.CARE_BY_ID[id];
    if (!item) return;
    if (this.caredWith(id)) { this.toast(TX(item.again)); return; }
    if (this.s.coins < EQD.CARE_COST) {
      const need = EQD.CARE_COST - this.s.coins;
      this.toast(TX({
        az: `${TX(item.name)} ${EQD.CARE_COST} sikkədir — ${need} sikkə çatmır. Bir sınaq həll et!`,
        en: `${TX(item.name)} costs ${EQD.CARE_COST} coins — ${need} to go. Solve a challenge!`,
        ru: `${TX(item.name)} стоит ${EQD.CARE_COST} монет — не хватает ${need}. Реши испытание!`
      }));
      return;
    }
    if (this.s.careDay !== this.dayKey()) { this.s.careDay = this.dayKey(); this.s.careGiven = []; }
    this.s.coins -= EQD.CARE_COST;
    this.s.careGiven = this.s.careGiven.concat([id]);
    this.s.careTotal = (this.s.careTotal || 0) + 1;
    this.save();
    SFX.correct();
    this.render();
    this.toast(TX(item.done));
  },

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
      const next = this.session.gateNext; /* a transfer link waits behind the gate */
      this.session.gateNext = null;
      this.go(next && EQS.screens[next] ? next : 'parent_dashboard');
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
    this.session.gateNext = null;
    this.session.code = null; this.session.inbox = null; /* nothing half-transferred is left behind */
    this.session.range = 'week'; /* the dashboard opens on the week every visit */
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
  cycleBedtime() {
    SFX.tap();
    const steps = [1140, 1170, 1200, 1230, 1260]; /* 19:00 → 21:00 */
    const idx = steps.indexOf(this.s.settings.bedMin);
    this.s.settings.bedMin = steps[(idx + 1) % steps.length];
    this.save(); this.render();
  },
  /* one tap = +15 min for today only (pushes both the limit and bedtime back) */
  grantBonus() {
    SFX.tap();
    const st = this.s.settings;
    const today = this.dayKey();
    if (st.bonusDay !== today) { st.bonusDay = today; st.bonusMins = 0; }
    st.bonusMins = (st.bonusMins || 0) >= 45 ? 0 : (st.bonusMins || 0) + 15;
    this.save(); this.render();
    this.toast(st.bonusMins > 0
      ? TX({ az: `Bu gün üçün +${st.bonusMins} dəqiqə`, en: `+${st.bonusMins} minutes for today`, ru: `+${st.bonusMins} минут на сегодня` })
      : TX({ az: 'Əlavə vaxt ləğv edildi', en: 'Extra time cleared', ru: 'Дополнительное время снято' }));
  },
  addMission(topic) {
    if (!EQT.MISSIONS[topic]) return;
    const today = this.dayKey();
    if (this.s.parentQuests.some(m => m.t === topic && m.day === today)) return;
    SFX.correct();
    /* `n` and `done` are the child's side of it — the entry is born unplayed, and the
       mission card appears on the quest list the next time the child opens it */
    this.s.parentQuests.push({ t: topic, day: today, n: 0, done: false });
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
    const many = EQP.ids.length > 1;
    const ask = many
      ? TX({ az: `${this.s.heroName} üçün macəra sıfırlansın? Yalnız bu uşağın irəliləyişi itəcək.`, en: `Reset the adventure for ${this.s.heroName}? Only this child's progress will be lost.`, ru: `Сбросить приключение для ${this.s.heroName}? Будет потерян прогресс только этого ребёнка.` })
      : TX({ az: 'Bütün macəra sıfırlansın? Bütün irəliləyiş itəcək.', en: 'Reset the whole adventure? All progress will be lost.', ru: 'Сбросить всё приключение? Весь прогресс будет потерян.' });
    if (confirm(ask)) {
      this.frozen = true; /* the unload save would otherwise put it all straight back */
      localStorage.removeItem(EQP.key());
      location.reload();
    }
  },

  /* the dashboard range is a way of looking, not a setting: it cycles on tap and goes
     back to the week when the grown-up leaves, so the next visit opens on the default */
  cycleRange() {
    SFX.tap();
    this.session.range = EQT.nextRange(this.session.range);
    this.render();
  },

  /* ── child profiles (grown-up area only — the child can never switch alone) ── */
  switchChild(id) {
    if (id === EQP.active || EQP.ids.indexOf(id) === -1) return;
    SFX.tap();
    EQP.swap(id);
    this.go(this.s.onboarded ? 'parent_profiles' : 'create');
    this.toast(TX({ az: `İndi ${this.s.heroName} oynayır`, en: `${this.s.heroName} is playing now`, ru: `Сейчас играет ${this.s.heroName}` }));
  },
  addChild() {
    if (EQP.full()) {
      this.toast(TX({ az: `Bu cihazda ən çoxu ${EQP_MAX} uşaq ola bilər`, en: `Up to ${EQP_MAX} children fit on one device`, ru: `На одном устройстве помещается до ${EQP_MAX} детей` }));
      return;
    }
    SFX.correct();
    EQP.add(EQI.lang);
    this.go('create');
    this.toast(TX({ az: 'Yeni qəhrəman — birlikdə yaradın! 👧👦', en: 'A new hero — make it together! 👧👦', ru: 'Новый герой — создайте его вместе! 👧👦' }));
  },
  removeChild(id) {
    const name = EQP.label(EQP.peek(id));
    if (!confirm(TX({
      az: `${name} silinsin? Bu uşağın bütün irəliləyişi itəcək.`,
      en: `Remove ${name}? All of this child's progress will be lost.`,
      ru: `Удалить ${name}? Весь прогресс этого ребёнка будет потерян.`
    }))) return;
    if (!EQP.remove(id)) return;
    this.go('parent_profiles');
    this.toast(TX({ az: `${name} silindi`, en: `${name} removed`, ru: `${name} удалён` }));
  },

  /* ── moving to another phone (js/transfer.js) ──
     Export is always the grown-up's own action: a code drawn on this screen, or a file
     handed to the share sheet. Import never writes anything until it has been confirmed
     on screen 32, and everything arriving is rebuilt field by field before it is trusted. */
  async showCode(id) {
    SFX.tap();
    id = EQP.ids.indexOf(id) >= 0 ? id : EQP.active;
    try {
      const code = await EQX.link(EQX.clean(EQP.peek(id)));
      this.session.code = { id: id, url: code.url, days: code.days, all: code.all };
      this.go('parent_code');
    } catch (e) {
      this.toast(TX({ az: 'Kod yaradıla bilmədi — faylla cəhd edin', en: 'The code could not be made — try the file instead', ru: 'Код не удалось создать — попробуйте файл' }));
    }
  },
  copyCode() {
    const c = this.session.code;
    if (!c) return;
    const failed = () => this.toast(TX({ az: 'Kopyalamaq alınmadı — QR kodu oxudun', en: 'Copying failed — scan the QR code instead', ru: 'Скопировать не удалось — отсканируйте QR-код' }));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(c.url).then(
        () => this.toast(TX({ az: 'Link kopyalandı', en: 'Link copied', ru: 'Ссылка скопирована' })),
        failed);
    } else failed();
  },
  saveFile() {
    SFX.tap();
    let text;
    try { text = JSON.stringify(EQX.bundle(), null, 1); } catch (e) { text = null; }
    if (!text) { this.toast(TX({ az: 'Fayl hazırlana bilmədi', en: 'The file could not be made', ru: 'Файл не удалось создать' })); return; }
    const name = EQX.fileName();
    const blob = new Blob([text], { type: 'application/json' });
    /* the share sheet is how a phone sends a file anywhere; a download is the fallback */
    try {
      const file = new File([blob], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'EduQuest' }).catch(() => { /* the parent closed the sheet */ });
        return;
      }
    } catch (e) { /* no file sharing here — save it instead */ }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    this.toast(TX({ az: 'Fayl saxlanıldı', en: 'File saved', ru: 'Файл сохранён' }));
  },
  pickFile() {
    SFX.tap();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';
    input.onchange = () => {
      const f = input.files && input.files[0];
      input.remove();
      if (!f) return;
      const r = new FileReader();
      r.onload = () => this.takeFile(String(r.result));
      r.onerror = () => this.toast(TX({ az: 'Fayl oxunmadı', en: 'The file could not be read', ru: 'Файл не удалось прочитать' }));
      r.readAsText(f);
    };
    document.body.appendChild(input);
    input.click();
  },
  badTransfer() {
    SFX.wrong();
    this.toast(TX({ az: 'Bu EduQuest köçürməsi deyil', en: 'That is not an EduQuest transfer', ru: 'Это не перенос EduQuest' }));
  },
  takeFile(text) {
    const b = EQX.readBundle(text);
    if (!b) return this.badTransfer();
    this.session.inbox = { kind: 'file', made: b.made, states: b.states, list: b.states.map(x => EQX.stats(x)) };
    this.go('parent_import');
  },
  takeCode(state) {
    this.session.inbox = { kind: 'code', made: null, states: [state], list: [EQX.stats(state)], plan: EQX.plan(state) };
  },
  applyImport() {
    const inc = this.session.inbox;
    if (!inc) return;
    const ok = inc.kind === 'file' ? EQX.applyBundle(inc.states) : EQX.applyOne(inc.states[0], inc.plan);
    if (!ok) { SFX.wrong(); this.toast(TX({ az: 'Yazmaq alınmadı — yaddaş dolu ola bilər', en: 'Could not write it — storage may be full', ru: 'Не удалось записать — возможно, нет места' })); return; }
    SFX.fanfare();
    this.session.inbox = null;
    location.reload(); /* the cleanest way back in: boot reads the child we just wrote */
  },
  dropImport() {
    SFX.tap();
    this.session.inbox = null;
    this.go(this.s.onboarded ? 'parent_transfer' : 'welcome');
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
    EQP.load();
    this.load();
    EQI.set(this.s.settings.lang || 'az');
    this.applyCalm();
    this.fit();
    window.addEventListener('resize', () => this.fit());
    EQT._t = Date.now();
    setInterval(() => {
      EQT.tick(); this.save(); /* heartbeat: accumulate play time and persist it */
      if (this.checkNewDay(false)) return;
      if (this.restNudge()) return;
      const m = EQS.meta[this.current] || { light: true };
      this.paintChrome(m.light);
    }, 30000);
    /* app resumed after being backgrounded — roll the day if it changed */
    document.addEventListener('visibilitychange', () => {
      EQT.tick();
      if (document.hidden) this.save();
      else if (!this.checkNewDay(true)) this.restNudge();
    });
    window.addEventListener('focus', () => { if (!this.checkNewDay(true)) this.restNudge(); });
    window.addEventListener('pagehide', () => { EQT.tick(); this.save(); });

    const params = new URLSearchParams(location.search);

    /* dev-only: force a language with ?lang=az|en|ru */
    const devLang = params.get('lang');
    if (devLang && EQI.langs.indexOf(devLang) >= 0) { this.s.settings.lang = devLang; EQI.set(devLang); }

    /* dev-only: force a quest day with ?day=N */
    const devDay = parseInt(params.get('day'), 10);
    if (!isNaN(devDay)) { this.s.questDay = devDay; this.resetDaily(); EQT.replan(devDay); }

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

    /* a transfer link (#eq=…): the fragment stays on the device — browsers never send it
       to the host — so opening it tells our web host nothing about the child */
    const code = /[#&]eq=([^&]+)/.exec(location.hash || '');
    if (code) {
      history.replaceState(null, '', location.pathname + location.search);
      EQX.read(code[1]).then(state => {
        if (!state) return this.badTransfer();
        this.takeCode(state);
        this.session.gateNext = 'parent_import';
        this.go('parent_gate');
      });
    }

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
      else if (this.current === 'sticker') this.afterSticker();
      else if (this.current === 'levelup') { document.title = 'AUTOTEST-DONE level=' + (this.s.level + 1) + ' xp=' + this.s.xp + ' coins=' + this.s.coins; clearInterval(this.autoTimer); return; }
      else if (this.current === 'map') { document.title = 'AUTOTEST-DONE-MAP xp=' + this.s.xp; clearInterval(this.autoTimer); return; }
    };
    this.autoTimer = setInterval(step, 1400);
  }
};

window.addEventListener('DOMContentLoaded', () => EQ.boot());
