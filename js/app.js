/* EduQuest — app core: state, router, game logic */

/* one state blob per child — the key belongs to the active profile (js/profiles.js) */

/* ── rest screen (daily limit + bedtime pause) ──
   Screens the pause never takes over: the grown-up area, the first-run flow, and the
   reward beats a child has already earned — they finish the moment, then Questy rests. */
const EQ_REST_FREE = ['restday', 'splash', 'welcome', 'create', 'meet', 'begin', 'success', 'victory', 'levelup', 'chest', 'sticker'];
/* calm screens where the heartbeat may bring the rest screen up on its own
   (never mid-question: a challenge already started is always allowed to finish) */
/* screens calm enough to announce a newly earned helmet on (never mid-question) */
const EQ_HELM_TOLD = ['map', 'region', 'wardrobe', 'quest', 'bag', 'awards', 'home'];
const EQ_REST_NUDGE = ['map', 'quest', 'mission', 'region', 'details', 'story', 'home', 'awards', 'bag', 'album', 'care', 'wardrobe', 'unlock', 'welcomeback'];
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
  /* the region helmets — the first full round in Elm Adası / Kosmik Stansiya (EQD.HELMS) */
  diverHelmOwned: false, spaceHelmOwned: false,
  mathSolved: 0, hintSparks: 0, stickers: 0, stickerIds: [], trophiesEarned: 0,
  /* stickers earned but not yet shown on the reveal screen, and the few firsts a sticker
     rule needs that nothing else remembers (EQ.STICKER_RULES); stageSlip = a wrong answer
     somewhere in the stage being played, for the Gold Medal */
  stickerNew: [], feats: {}, stageSlip: false,
  /* the chapter relics: { chapterNo: bitmask of the stages whose boss was beaten } (EQ.earnRelic) */
  relics: {},
  /* Questy'nin qulluğu: bugünkü verilmiş qulluqlar və ümumi say (bax: EQ.careGive) */
  careDay: null, careGiven: [], careTotal: 0,
  /* the regions beyond the forest: today's round in each, plus a lifetime count (see EQ.region) */
  regions: {},
  /* my home: every decoration the child owns (starters included — only ever added to),
     which place in the room holds which (EQD.HOME_SPOTS), and the ones earned but never
     yet put anywhere, which the home card offers to place (EQ.placeNew) */
  decorIds: ['books', 'portrait', 'plant'], decorAt: { s1: 'books', d1: 'portrait', f2: 'plant' }, decorNew: [],
  pendingLevelUp: false,
  lastVisit: null,
  lastDay: null, questDay: 0, playedDays: [], bestStreak: 1,
  settings: { readAloud: true, bigText: false, calm: false, music: true, sfx: true, bedtime: true, bedMin: 1200, limit: 45, bonusDay: null, bonusMins: 0, lang: 'az' }
};

/* the sound (effect cues SFX and the forest music EQM) lives in js/sound.js */

const EQ = {
  s: null,
  current: null,
  frozen: false, /* set while an import is being written: nothing may save over it */
  session: { createCat: 'skin', wardrobeCat: 'hats', albumSet: 'forest', newSticker: null, justAdded: null, gateInput: '', streakRow: 0, q: null, qIdx: -1, qKey: null, ctx: 'daily', mission: null, region: null, unlockRegion: null, tutorWhy: false, missionAdded: false, helmNews: [], helmCard: null, decor: null, decorPop: null, decorNews: [], answering: false, bossBeam: false, attempted: false, hinted: false, sparked: false, recSkips: [], range: 'week' },

  rankOf(level) { return EQD.RANKS[level] || (level >= 13 ? EQD.RANK_LEGEND : EQD.RANK_DEFAULT); },
  rank(level) { return TX(this.rankOf(level)); },
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
    if (typeof EQV !== 'undefined') EQV.stop(); /* never finish a sentence in the old language */
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
    this.s.challengesDone = 0; this.s.bossHits = 0; this.s.bossBeaten = false; this.s.stageSlip = false;
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
    this.checkStickers();
    this.checkDecor(); /* a seventh day played is a trophy */
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
    const safe = ['map', 'quest', 'mission', 'region', 'details', 'story', 'home', 'awards', 'bag', 'album', 'care', 'wardrobe', 'unlock', 'welcome', 'welcomeback', 'splash', 'restday'];
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
    /* before the effects had a switch of their own, "music" silenced them — a child saved
       then with it off keeps a silent game, and hears the melody only if it was on */
    if (s && s.settings && typeof s.settings.sfx !== 'boolean') this.s.settings.sfx = !!this.s.settings.music;
    this.s.stickerIds = this.cleanStickers(s && s.stickerIds, this.s.stickers);
    this.s.stickers = this.s.stickerIds.length;
    this.s.regions = this.cleanRegions(s && s.regions);
    this.loadHelms(s);
    this.s.relics = this.cleanRelics(s && s.relics, this.s);
    EQT.init(this.s);
    this.loadStickerFeats(s);
    /* a child who already did what a sticker asks gets it now, and sees it on the way in */
    this.checkStickers();
    this.loadDecor(s);
  },
  save() {
    if (this.frozen) return; /* an import has just replaced storage; the page is reloading */
    try { localStorage.setItem(EQP.key(), JSON.stringify(this.s)); } catch (e) { /* private mode */ }
  },

  /* ── router ── */
  go(name) {
    EQT.tick(); /* attribute elapsed time to the screen being left */
    const from = this.current;
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
          this.session.attempted = false; this.session.hinted = false; this.session.sparked = false;
        }
      }
    } else if (name === 'challenge' && this.session.ctx === 'region' && this.regionCur()) {
      /* a region round owns the challenge screen the same way a mission does. The key
         names the exact question (region, day, round, slot), so the gentler question
         from the tutor survives this redirect — it keeps the key of the one it replaced */
      const r = this.regionCur();
      const e = this.region(r);
      if (e.n >= EQD.REGION_LEN) name = 'region';
      else {
        const key = r + '|' + e.day + '#' + e.round + '|' + e.n;
        if (this.session.qKey !== key || !this.session.q) {
          this.session.q = this.regionSet(r).questions[e.n];
          this.session.qIdx = e.n;
          this.session.qKey = key;
          this.session.attempted = false; this.session.hinted = false; this.session.sparked = false;
        }
      }
    } else if (name === 'challenge') {
      if (this.s.challengesDone >= 5) name = 'boss';
      else {
        this.session.ctx = 'daily';
        if (!this.session.q || this.session.qIdx !== this.s.challengesDone) {
          this.session.q = this.qset().questions[Math.min(4, this.s.challengesDone)];
          this.session.qIdx = this.s.challengesDone;
          this.session.attempted = false; this.session.hinted = false; this.session.sparked = false;
        }
      }
    }
    /* leaving the mission for anywhere that isn't part of playing it drops the pointer,
       so the daily quest never inherits a mission's context or its question */
    /* the level-up beat belongs to the play too: a level earned on a mission or region
       question returns to that question's context afterwards, not to the daily quest */
    const playing = ['challenge', 'hint', 'tutor', 'success', 'restday', 'levelup'];
    if (playing.indexOf(name) < 0 && name !== 'mission' && this.session.ctx === 'mission') {
      this.session.ctx = 'daily';
      this.session.mission = null;
      this.session.q = null; this.session.qIdx = -1;
    }
    if (playing.indexOf(name) < 0 && name !== 'region' && this.session.ctx === 'region') {
      this.session.ctx = 'daily';
      this.session.region = null;
      this.session.q = null; this.session.qIdx = -1; this.session.qKey = null;
      this.session.helmCard = null;
    }
    if (name === 'boss') {
      if (this.s.bossBeaten) name = 'victory';
      else {
        this.session.ctx = 'boss';
        const pool = this.qset().boss;
        const bq = pool[Math.min(pool.length - 1, this.s.bossHits)];
        if (this.session.q !== bq) { this.session.q = bq; this.session.attempted = false; this.session.hinted = false; this.session.sparked = false; }
      }
    }
    if ((name === 'success' || name === 'hint' || name === 'tutor') && !this.session.q) {
      if (this.session.ctx === 'mission' && this.missionEntry()) {
        const m = this.missionEntry();
        this.session.q = this.missionSet().questions[Math.min(EQD.MISSION_LEN - 1, m.n)];
        this.session.qIdx = m.n;
      } else if (this.session.ctx === 'region' && this.regionCur()) {
        const r = this.regionCur(), e = this.region(r);
        const i = Math.min(EQD.REGION_LEN - 1, e.n);
        this.session.q = this.regionSet(r).questions[i];
        this.session.qIdx = i;
        this.session.qKey = r + '|' + e.day + '#' + e.round + '|' + i;
      } else {
        this.session.q = this.qset().questions[Math.min(4, this.s.challengesDone)] || this.qset().questions[3];
        this.session.qIdx = this.s.challengesDone;
      }
      this.session.attempted = false; this.session.hinted = false; this.session.sparked = false;
    }
    if (name === 'hint' && this.session.q && !this.session.hinted) {
      this.session.hinted = true;
      EQT.hint(this.session.q);
    }
    if (this.current === 'tutor' && name !== 'tutor') this.session.tutorWhy = false;
    /* decorating belongs to the one visit: leaving the room puts the tools away (every
       move was already saved as it was made) */
    if (this.current === 'home' && name !== 'home') { this.session.decor = null; this.session.decorPop = null; }
    this.current = name;
    this.render();
    this.helmNotice(name);
    /* Questy's voice: every navigation silences the last screen (the rest screen too),
       and a question screen reads its question as it opens (js/speech.js) */
    if (typeof EQV !== 'undefined') EQV.route(from, name);
    if (typeof EQM !== 'undefined') EQM.update(); /* the rest screen is silent */
  },
  nav(tab) {
    SFX.tap();
    this.go({ world: 'map', quests: 'quest', hero: 'wardrobe', awards: 'awards', bag: 'bag' }[tab] || 'map');
  },
  render() {
    const fn = EQS.screens[this.current];
    if (!fn) { this.current = 'map'; return this.render(); }
    /* a hands-on panel hangs listeners on `document`, so the outgoing screen has to
       drop them before the new HTML lands — otherwise a drag handler from a question
       already answered goes on firing over whatever is drawn next */
    if (typeof EQIX !== 'undefined') EQIX.unmount();
    document.getElementById('screen').innerHTML = fn(this.s);
    /* the panel's markup exists only now, so its listeners are wired after the write */
    if (typeof EQIX !== 'undefined') EQIX.mount(this.session.q);
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
    /* long enough to read: a three-line "how to earn it" needs more than a "+100 coins" */
    this.toastTimer = setTimeout(() => t.classList.remove('on'), Math.max(2400, String(msg).length * 45));
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
    else this.goReveal(next);
  },
  /* leaving a finished mission (or one the child put down) goes back to the quest list */
  leaveMission() {
    SFX.tap();
    this.go('quest');
  },

  /* ── the regions beyond the forest (js/regions.js) ──
     Söz Vadisi opens after the first boss, the others at Levels 10 / 15 / 20. A region
     is played in rounds of five questions on its own topics — same challenge, hint,
     tutor and success screens as the forest, no boss. The first finished round of a
     day pays a coin bonus; more rounds are welcome, they just pay per question. Like a
     mission, a region never touches the daily 5/5: it is beside the adventure. */
  regionOpen(r) { return this.regionOpenAt(r, this.s && this.s.level); },
  /* the same test for a level the child is about to reach (the level-up screen) */
  regionOpenAt(r, level) {
    const R = EQD.REGIONS[r];
    if (!R || !this.s) return false;
    if (R.trophy && (this.s.trophiesEarned || 0) < R.trophy) return false;
    return (level || 1) >= R.level;
  },
  /* What reaching `level` really hands over — nothing is invented here. A level opens a
     region (Elm Adası 10, Kosmik Stansiya 15, Sirli Qala 20) and sometimes a new rank
     name. It gives no hat (the helmets are earned by a round inside their region). The
     level stickers (Göy Qurşağı 2, Böyük Ağac 3, Kiçik Raket 5) are not a card here:
     EQ.checkStickers awards them and the reveal screen right after says so. */
  levelGifts(level) {
    const regions = EQD.REGION_ORDER.filter(r => this.regionOpenAt(r, level) && !this.regionOpenAt(r, level - 1));
    const rank = this.rankOf(level).en !== this.rankOf(level - 1).en;
    return { regions, rank };
  },
  /* the nearest region still shut at `level`, and what really opens it: Söz Vadisi waits
     for the first boss, the others for a level. null once every region is open. */
  nextRegion(level) {
    const r = EQD.REGION_ORDER.filter(k => !this.regionOpenAt(k, level))[0];
    if (!r) return null;
    const R = EQD.REGIONS[r];
    const boss = !!(R.trophy && (this.s.trophiesEarned || 0) < R.trophy);
    return { r, R, boss, levels: boss ? 0 : Math.max(0, R.level - (level || 1)) };
  },
  regionsOpen() { return EQD.REGION_ORDER.filter(r => this.regionOpen(r)); },
  /* today's progress in a region, read without creating anything (for the map pins) */
  regionPeek(r) {
    const e = this.s.regions && this.s.regions[r];
    return e && e.day === this.dayKey() ? { n: e.n || 0, round: e.round || 0, paid: !!e.paid } : { n: 0, round: 0, paid: false };
  },
  /* the region the session is playing, if it is still a real, open region */
  regionCur() {
    const r = this.session.region;
    return r && this.regionOpen(r) ? r : null;
  },
  /* today's entry for a region — a new calendar day starts a fresh round 0 */
  region(r) {
    if (!this.s.regions || typeof this.s.regions !== 'object') this.s.regions = {};
    const today = this.dayKey();
    let e = this.s.regions[r];
    if (!e) e = this.s.regions[r] = { day: today, round: 0, n: 0, plan: null, paid: false, total: 0 };
    if (e.day !== today) { e.day = today; e.round = 0; e.n = 0; e.plan = null; e.paid = false; }
    return e;
  },
  /* the round's five topics, chosen once by the adaptive plan and then frozen, so an
     answer mid-round cannot reshuffle the questions still to come */
  regionPlan(r) {
    const e = this.region(r);
    const R = EQD.REGIONS[r];
    const good = Array.isArray(e.plan) && e.plan.length === EQD.REGION_LEN && e.plan.every(t => R.topics.indexOf(t) >= 0);
    if (!good) e.plan = EQT.plan(e.round, EQD.REGION_LEN, R.topics);
    return e.plan;
  },
  regionSet(r) {
    const e = this.region(r);
    return EQD.regionSet(r, e.day + '#' + e.round, this.regionPlan(r));
  },
  /* the map pin: into the region if it is open, otherwise to its unlock screen */
  openRegion(r) {
    if (!EQD.REGIONS[r]) return;
    SFX.tap();
    if (!this.regionOpen(r)) { this.session.unlockRegion = r; this.go('unlock'); return; }
    this.region(r);
    this.session.region = r;
    this.session.ctx = 'region';
    this.session.q = null; this.session.qIdx = -1; this.session.qKey = null;
    this.save();
    this.go('region');
  },
  startRegionQuestion() {
    const r = this.regionCur();
    if (!r || this.region(r).n >= EQD.REGION_LEN) return;
    SFX.tap();
    this.session.ctx = 'region';
    this.go('challenge');
  },
  /* one region question answered correctly */
  regionAdvance() {
    const r = this.regionCur();
    if (!r) return;
    const e = this.region(r);
    e.n = Math.min(EQD.REGION_LEN, (e.n || 0) + 1);
    e.total = (e.total || 0) + 1;
    this.grant(25, 5);
    if (e.n >= EQD.REGION_LEN && !e.paid) {
      e.paid = true;
      this.s.coins += EQD.REGION_BONUS; this.s.coinsToday += EQD.REGION_BONUS;
    }
    if (e.n >= EQD.REGION_LEN) {
      (this.s.feats || (this.s.feats = {}))[r] = true; /* a full round here (Söz Kitabı reads valley) */
      const got = this.earnHelm(r);
      if (got) this.session.helmCard = got.key; /* the round's end screen shows it on the hero */
    }
    this.save();
  },
  continueRegion() {
    const r = this.regionCur();
    const next = r && this.region(r).n < EQD.REGION_LEN ? 'challenge' : 'region';
    if (this.s.pendingLevelUp) { this.session.afterLevel = next; this.go('levelup'); }
    else this.goReveal(next);
  },
  /* another round the same day: new five questions, planned from what just happened */
  regionAgain() {
    const r = this.regionCur();
    if (!r) return;
    const e = this.region(r);
    if (e.n < EQD.REGION_LEN) return;
    SFX.tap();
    e.round++; e.n = 0; e.plan = null;
    this.session.helmCard = null;
    this.session.q = null; this.session.qIdx = -1; this.session.qKey = null;
    this.save();
    this.go('challenge');
  },
  leaveRegion() { SFX.tap(); this.go('map'); },

  /* ── the region helmets (EQD.HELMS in js/regions.js) ──
     A region's helmet is earned by its first full round: all five questions, not the
     first answer and not the day's bonus (a second round the same day earns it too, if
     the first was somehow left half-done). The child is told — a toast on the next calm
     screen and the helmet on the hero at the round's end — never a silent flag. */
  earnHelm(r) {
    const h = EQD.helmOf(r);
    if (!h || this.s[h.flag]) return null;
    this.s[h.flag] = true;
    this.session.helmNews.push(h.key);
    return h;
  },
  /* A save written before the helmets could be earned has no flag at all. Its rounds are
     not remembered one by one, but `total` counts every correct answer ever given in the
     region — five of them is a full round's worth, so that child gets the helmet (and is
     told). Only a missing flag is derived: once it is a boolean, rounds alone decide. */
  helmFromHistory(regions, h) {
    const e = regions && regions[h.region];
    return !!(e && e.total >= EQD.REGION_LEN);
  },
  loadHelms(raw) {
    this.session.helmNews = [];
    this.session.helmCard = null;
    /* helmets an imported backup derived (transfer.js clean) — told once, never saved */
    const tell = raw && Array.isArray(raw.helmTell) ? raw.helmTell : [];
    delete this.s.helmTell;
    EQD.HELMS.forEach(h => {
      if (raw && typeof raw[h.flag] === 'boolean') {
        this.s[h.flag] = raw[h.flag];
        if (raw[h.flag] && tell.indexOf(h.key) >= 0) this.session.helmNews.push(h.key);
        return;
      }
      this.s[h.flag] = this.helmFromHistory(this.s.regions, h);
      if (this.s[h.flag]) this.session.helmNews.push(h.key);
    });
    const worn = EQD.HELM_BY[this.s.hero.hat];
    if (worn && !this.s[worn.flag]) this.s.hero.hat = 'none';
  },
  /* A new helmet or decoration is told on the next calm screen — never over a question
     or a reward beat — in one toast, so one piece of news cannot hide another. */
  helmNotice(name) {
    if (EQ_HELM_TOLD.indexOf(name) < 0) return;
    const line = this.newsLine();
    if (line) this.toast(line);
  },
  /* the waiting news as one line, taken off the queue (empty string when there is none) */
  newsLine() {
    const helms = this.session.helmNews || [], deco = this.session.decorNews || [];
    this.session.helmNews = []; this.session.decorNews = [];
    const parts = helms.map(k => TX(EQD.HELM_BY[k].got));
    if (deco.length === 1) {
      const nm = TX(EQD.DECOR_BY_ID[deco[0]].name);
      parts.push(TX({ az: `Yeni bəzək: ${nm} — evində yerləşdir! 🏠`, en: `New decoration: ${nm} — place it at home! 🏠`, ru: `Новое украшение: ${nm} — поставь его дома! 🏠` }));
    } else if (deco.length > 1) {
      const n = deco.length;
      parts.push(TX({ az: `Evində ${n} yeni bəzək səni gözləyir! 🏠`, en: `${n} new decorations are waiting at home! 🏠`, ru: `Дома тебя ждут новые украшения: ${n}! 🏠` }));
    }
    return parts.join(' ');
  },
  /* a locked helmet card says how to earn it — with the level first while the region is shut */
  helmHow(key) {
    const h = EQD.HELM_BY[key];
    if (!h) return;
    this.toast(TX(this.regionOpen(h.region) ? h.how : h.shut));
  },
  /* ── hint sparks ──
     The hint is free and always will be; a spark takes nothing away from it. A spark is
     what a child *earns by using* one: a question solved after its hint was open (tapped,
     or shown after a miss) — in the daily quest, a mission, a region round or the boss
     fight, at most once per question. Sparks are not spent on anything: they are the
     bag's record that asking for help and then carrying on is part of winning. */
  earnSpark() {
    if (!this.session.hinted || this.session.sparked) return false;
    this.session.sparked = true;
    this.s.hintSparks = (this.s.hintSparks || 0) + 1;
    if (this.session.ctx === 'boss') this.toast(TX({ az: '+1 ipucu qığılcımı ✨', en: '+1 hint spark ✨', ru: '+1 искра-подсказка ✨' }));
    return true;
  },

  /* ── chapter relics (EQD.CHAPTERS[].relic) ──
     A chapter has three stages, and every stage whose boss the child actually beat puts
     one piece of that chapter's relic in the bag; three pieces rebuild it. The record is
     kept per chapter number (chapters loop, the numbering carries on) and is only ever
     added to. It has to be a record and not a sum over questDay: a new calendar day moves
     the adventure on to the next stage whether or not the last boss was beaten. */
  earnRelic() {
    const c = this.chapter();
    const r = this.s.relics || (this.s.relics = {});
    r[c.chapterNo] = (r[c.chapterNo] || 0) | (1 << (c.stageNo - 1));
  },
  /* the current chapter's relic as the bag shows it */
  relicNow() {
    const c = this.chapter();
    const mask = (this.s.relics || {})[c.chapterNo] || 0;
    const have = [0, 1, 2].filter(i => mask & (1 << i)).length;
    /* a stage before this one that ended without its piece — only a day passing does that */
    const missed = [0, 1, 2].filter(i => i < c.stageNo - 1 && !(mask & (1 << i))).length;
    return { relic: c.ch.relic, chapterNo: c.chapterNo, stageNo: c.stageNo, mask, have, missed, whole: have >= EQD.STAGES_PER_CHAPTER };
  },
  /* A save or code from before the relics has no record. Which earlier stages of the
     chapter were really won cannot be known, and the old bag counted them as won, so they
     are credited (nothing a child already saw in the bag disappears); the current stage
     counts only if its boss is beaten. Once there is a record, only the record decides. */
  cleanRelics(raw, s) {
    const out = {};
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      Object.keys(raw).filter(k => /^[1-9]\d{0,5}$/.test(k)).map(Number).sort((a, b) => a - b).slice(-12).forEach(k => {
        const m = Math.round(Number(raw[k])) & 7;
        if (m > 0) out[k] = m;
      });
      return out;
    }
    const c = EQD.chapterAt((s && s.questDay) || 0);
    const m = ((1 << (c.stageNo - 1)) - 1) | (s && s.bossBeaten ? 1 << (c.stageNo - 1) : 0);
    if (m) out[c.chapterNo] = m;
    return out;
  },

  /* rebuilt field by field on load and on import: the screens write these into markup */
  cleanRegions(raw) {
    const out = {};
    const src = raw && typeof raw === 'object' ? raw : {};
    const int = (v, lo, hi) => { const n = Math.round(Number(v)); return isNaN(n) ? lo : Math.min(hi, Math.max(lo, n)); };
    EQD.REGION_ORDER.forEach(r => {
      const e = src[r];
      if (!e || typeof e !== 'object') return;
      const day = /^\d{4}-\d{2}-\d{2}$/.test(String(e.day)) ? String(e.day) : null;
      const topics = EQD.REGIONS[r].topics;
      const plan = Array.isArray(e.plan) && e.plan.length === EQD.REGION_LEN && e.plan.every(t => topics.indexOf(t) >= 0) ? e.plan.slice() : null;
      out[r] = {
        day: day || '1970-01-01', round: day ? int(e.round, 0, 999) : 0, n: day ? int(e.n, 0, EQD.REGION_LEN) : 0,
        plan: day ? plan : null, paid: !!(day && e.paid), total: int(e.total, 0, 9e6)
      };
    });
    return out;
  },
  /* where the child is inside whatever they are playing: slot, length, exit screen */
  playPos() {
    const ctx = this.session.ctx;
    if (ctx === 'mission') {
      const m = this.missionEntry();
      if (m) return { idx: m.n, total: EQD.MISSION_LEN, exit: 'mission' };
    }
    if (ctx === 'region') {
      const r = this.regionCur();
      if (r) return { idx: this.region(r).n, total: EQD.REGION_LEN, exit: 'region', region: r };
    }
    return { idx: this.s.challengesDone, total: 5, exit: 'quest' };
  },

  /* ── quest flow ── */
  startChallenge() { SFX.tap(); this.go('challenge'); },
  /* the set is fully done (boss beaten, chest opened) → the next one opens right away,
     no waiting for tomorrow. Streak and the daily counters stay calendar-based. */
  nextStage() {
    if (!this.s.bossBeaten || (this.s.chestReady && !this.s.chestOpened)) return;
    SFX.fanfare();
    this.s.questDay = (this.s.questDay || 0) + 1;
    this.s.challengesDone = 0; this.s.bossHits = 0; this.s.bossBeaten = false; this.s.stageSlip = false;
    this.s.chestReady = false; this.s.chestOpened = false;
    this.session.q = null; this.session.qIdx = -1;
    /* the next stage is a new set, so it is planned from the set just finished */
    EQT.replan(this.s.questDay);
    this.checkStickers(); /* a new chapter opening is a sticker (Yol Fənəri) */
    this.checkDecor();
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
    if (this.s.xp >= EQD.XP_PER_LEVEL) this.s.pendingLevelUp = true;
  },
  /* Tapping one of the three answer buttons. Multiple choice is still the game's
     default question, so this stays the shortest possible path into resolve(): judge
     the tap, and say how to paint that one button. */
  answer(i) {
    if (this.session.answering) return;
    const q = this.session.q;
    /* a reading question's letters depend on the language, so the choices are resolved
       for the language on screen before the tap is judged (EQD.qa, js/regions.js) */
    const { answers, correct: want } = EQD.qa(q);
    const correct = answers[i] === want;
    this.resolve(correct, () => {
      const el = document.getElementById('ans-' + i);
      if (!el) return;
      if (correct) {
        el.classList.add('good');
        el.innerHTML = `${answers[i]} ${EQC.check('#fff', 26, 3.4)}`;
      } else {
        el.classList.add('warm');
        el.innerHTML = `${answers[i]}<span style="font:800 13px Nunito;margin-left:8px">${TX({ az: 'bir də yoxla', en: 'try again', ru: 'ещё раз' })}</span>`;
      }
    });
  },

  /* Everything that happens once a question has been judged — for every question
     format there is. The three-button tap and the drag, pair and order screens all end
     up here, because what a right answer *means* (the XP, the coin, the boss hit, the
     mission step, the spaced-repetition entry) is a property of the question, not of
     how the child touched the screen. Adding a format must never mean re-deriving any
     of that; a format that forked this path would drift out of step with the rest.

     `paint` is the one part a format owns: it marks up its own pieces before the
     shared pause. A format that has already shown its own feedback passes nothing. */
  resolve(correct, paint) {
    if (this.session.answering) return;
    const q = this.session.q;
    if (typeof EQV !== 'undefined') EQV.stop(); /* the child has answered — stop reading the question */
    /* the first try is the one that counts, both for the stats and for the spacing:
       a topic recalled unaided moves out to a longer gap, a miss brings it straight
       back. Later tries on the same question are practice, not evidence. */
    if (!this.session.attempted) {
      this.session.attempted = true;
      EQT.attempt(q, correct);
      EQT.review(q, correct, this.session.hinted);
    }
    const feats = this.s.feats || (this.s.feats = {});
    /* answering in a boss fight at all — right or wrong — is facing it */
    if (this.session.ctx === 'boss') feats.faced = true;
    /* a wrong answer in the daily set or its boss spoils the stage for the Gold Medal;
       a mission or a region is practice beside the stage, not part of it */
    if (!correct && (this.session.ctx === 'daily' || this.session.ctx === 'boss')) this.s.stageSlip = true;
    /* the gentler question from the tutor, solved: that is what Fikir İksiri is for */
    if (correct && q && this.session.stepQ === q) feats.easier = true;
    this.session.answering = true;
    if (paint) paint();
    if (correct) {
      SFX.correct();
      setTimeout(() => {
        this.session.answering = false;
        this.session.streakRow++;
        this.earnSpark();
        if (this.session.ctx === 'boss') {
          this.s.bossHits++;
          this.s.mathSolved = Math.min(100, this.s.mathSolved + 1);
          EQT.bossHit();
          if (this.s.bossHits >= this.bossHitsNeeded()) {
            this.s.bossBeaten = true;
            this.s.chestReady = true;
            this.s.trophiesEarned++;
            this.earnRelic();
            if (!this.s.stageSlip) feats.flawless = true;
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
        } else if (this.session.ctx === 'region') {
          EQT.done(q, this.session.hinted);
          this.regionAdvance();
          this.go('success');
        } else {
          if (q.subj === 'math') this.s.mathSolved = Math.min(100, this.s.mathSolved + 1);
          this.grant(50, 10);
          this.s.challengesDone = Math.min(5, this.s.challengesDone + 1);
          EQT.done(q, this.session.hinted);
          this.save();
          this.go('success');
        }
        /* stickers are revealed on the way out of success / victory (EQ.go); a decoration
           is told on the next calm screen and waits at home to be placed */
        if (this.checkStickers() + this.checkDecor()) this.save();
      }, 900);
    } else {
      SFX.wrong();
      this.session.streakRow = 0;
      this.checkStickers(); /* Cəsarət Qalxanı: a boss faced with a miss is still faced */
      this.save(); /* the slip has to survive a reload, or the Gold Medal could be had anyway */
      setTimeout(() => { this.session.answering = false; this.go('hint'); }, 950);
    }
  },
  continueAfterSuccess() {
    if (this.session.ctx === 'mission') return this.continueMission();
    if (this.session.ctx === 'region') return this.continueRegion();
    const next = this.s.challengesDone >= 5 ? 'boss' : 'challenge';
    if (this.s.pendingLevelUp) { this.session.afterLevel = next; this.go('levelup'); }
    else this.goReveal(next);
  },
  applyLevelUp() {
    this.s.level++;
    this.s.xp = Math.max(0, this.s.xp - EQD.XP_PER_LEVEL);
    /* more than a level's worth can be waiting (a level-up screen left by its back
       button while XP kept coming): each level gets its own screen, one after another,
       instead of the bar sitting full with nothing left to earn */
    this.s.pendingLevelUp = this.s.xp >= EQD.XP_PER_LEVEL;
    this.checkStickers();
    this.checkDecor(); /* a level can open a third world (Dünya Kaşifi) */
    this.save();
    if (this.s.pendingLevelUp) { this.go('levelup'); return; }
    const target = this.session.afterLevel || 'map';
    this.session.afterLevel = null;
    this.goReveal(target);
  },
  openChest() {
    /* one chest per beaten boss: the victory screen's button is drawn unconditionally,
       and a way back to it after opening must not pay out a second, unpreviewed chest */
    if (!this.s.chestReady || this.s.chestOpened) { this.go('map'); return; }
    this.s.coins += 100; this.s.coinsToday += 100;
    /* exactly what the chest screen showed: the hat only the first time, then the next
       chest decoration in its place (EQD.nextChestDecor), and the sticker from
       EQD.nextChestSticker — asked before the hat is handed over, as the screen asked */
    const hatNew = !this.s.wizardHatOwned;
    const deco = EQD.nextChestDecor(this.s);
    this.s.wizardHatOwned = true;
    if (deco) this.awardDecor(deco.id, true); /* the chest's own line tells it */
    const st = EQD.nextChestSticker(this.s.stickerIds);
    if (st) this.awardSticker(st.id);
    this.checkStickers(); /* the chest's sticker can be the one that finishes the album */
    this.s.chestOpened = true; this.s.chestReady = false;
    this.session.chestNote = this.chestLine(hatNew, deco);
    this.save();
    SFX.fanfare();
    if (this.s.pendingLevelUp) { this.session.afterLevel = 'map'; this.go('levelup'); }
    else if (this.s.stickerNew.length) { this.session.stickerNext = 'map'; this.go('sticker'); }
    else {
      /* one toast for everything: news taken first, so the map cannot show it and then
         have the chest's line replace it a moment later */
      const line = [this.session.chestNote, this.newsLine()].filter(Boolean).join(' ');
      this.session.chestNote = false;
      this.go('map');
      this.toast(line);
    }
  },
  /* what this chest really held — the hat is named only by the chest that gave it */
  chestLine(hatNew, deco) {
    const parts = [TX({ az: '+100 sikkə', en: '+100 coins', ru: '+100 монет' })];
    if (hatNew) parts.push(TX({ az: 'Sehrbaz Papağı qarderobuna əlavə olundu!', en: 'Wizard Hat added to your wardrobe!', ru: 'Шляпа Волшебника добавлена в гардероб!' }));
    if (deco) parts.push(TX({ az: `${TX(deco.name)} evində səni gözləyir! 🏠`, en: `${TX(deco.name)} is waiting at home! 🏠`, ru: `${TX(deco.name)} ждёт тебя дома! 🏠` }));
    return parts.join(' · ');
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
  /* put one named sticker in the album and queue it for the reveal screen; returns it,
     or null if it is unknown or already there (no sticker is ever given twice) */
  awardSticker(id) {
    const st = EQD.STICKER_BY_ID[id];
    if (!st || this.hasSticker(st.id)) return null;
    this.s.stickerIds.push(st.id);
    this.s.stickers = this.s.stickerIds.length;
    (this.s.stickerNew || (this.s.stickerNew = [])).push(st.id);
    return st;
  },
  /* Every sticker that is not a chest sticker is earned by exactly what its `how` says.
     Each rule reads the save as it stands, so the same check awards a sticker the moment
     it is earned *and* hands it to a child whose save predates the rule (EQ.load). The
     few things a save does not otherwise remember are kept in `s.feats`. */
  checkStickers() {
    let got = 0;
    EQD.STICKERS.forEach(st => {
      const rule = EQ.STICKER_RULES[st.id];
      if (!st.chest && rule && !this.hasSticker(st.id) && rule(this.s, this) && this.awardSticker(st.id)) got++;
    });
    return got; /* album order puts Questy! last, so it sees everything this pass gave */
  },
  trackSum(field) {
    const days = (this.s.track && this.s.track.days) || {};
    return Object.keys(days).reduce((n, k) => n + ((days[k] && Number(days[k][field])) || 0), 0);
  },
  /* stageSlip and feats as the save has them; a save from before them gets the honest
     default — a stage already under way counts as slipped (no one knows), and a Word
     Valley round is read from the region's lifetime count, as the helmets do */
  loadStickerFeats(raw) {
    const f = raw && raw.feats && typeof raw.feats === 'object' ? raw.feats : null;
    const out = {};
    ['faced', 'easier', 'flawless'].concat(EQD.REGION_ORDER).forEach(k => { if (f && f[k] === true) out[k] = true; });
    if (!f) {
      const v = this.s.regions.valley;
      if (v && v.total >= EQD.REGION_LEN) out.valley = true;
    }
    this.s.feats = out;
    this.s.stageSlip = raw && typeof raw.stageSlip === 'boolean' ? raw.stageSlip
      : !!(this.s.challengesDone > 0 || this.s.bossHits > 0);
    const q = Array.isArray(raw && raw.stickerNew) ? raw.stickerNew : [];
    this.s.stickerNew = q.filter((id, i) => this.hasSticker(id) && q.indexOf(id) === i);
  },
  /* open the album on the page a sticker lives on (the reveal screen links here).
     Stickers not yet looked at are flagged so the album opens with them badged —
     otherwise arriving from the reveal screen looks no different from opening it cold. */
  openAlbum(setId) {
    SFX.tap();
    if (setId) this.session.albumSet = setId;
    const fresh = (this.s.stickerNew || []).slice();
    this.session.justAdded = fresh.length ? fresh : null;
    this.s.stickerNew = [];
    this.session.stickerNext = null;
    this.session.chestNote = false;
    this.save();
    this.go('album');
  },
  albumSet(setId) {
    if (this.session.albumSet === setId) return;
    SFX.tap();
    this.session.albumSet = setId;
    this.render();
  },
  /* the "NEW" badge belongs to the visit that first shows a sticker, so it does not
     survive leaving the album — the next visit is an ordinary one */
  leaveAlbum() { this.session.justAdded = null; },
  /* a locked slot says what to do instead of nothing at all */
  stickerPeek(id) {
    const st = EQD.STICKER_BY_ID[id];
    if (!st) return;
    SFX.tap();
    if (this.hasSticker(id)) this.toast(TX(st.name) + ' · ' + TX({ az: 'sənindir!', en: 'yours!', ru: 'твоя!' }));
    else this.toast(TX({ az: 'Hələ bağlıdır — ', en: 'Still locked — ', ru: 'Пока закрыта — ' }) + TX(st.how));
  },
  /* The step out of a reward screen (success, victory, level-up, welcome back): stickers
     earned since the last reveal are shown first, then the child carries on to `next`.
     Only these calm steps reveal — never the middle of a fight or a question. */
  goReveal(next) {
    if (this.s.stickerNew && this.s.stickerNew.length) {
      this.session.stickerNext = next;
      this.go('sticker');
      return;
    }
    /* a chest opened with a level-up waiting went to the level-up screen first; its line
       ("+100 coins · … is waiting at home") is said here, on the way out — otherwise it
       would sit in the session and be toasted days later by some unrelated sticker */
    const chest = this.session.chestNote;
    if (!chest) { this.go(next); return; }
    this.session.chestNote = false;
    const line = [chest, EQ_HELM_TOLD.indexOf(next) >= 0 ? this.newsLine() : ''].filter(Boolean).join(' ');
    this.go(next);
    this.toast(line);
  },
  /* from the reveal screen back into the adventure */
  afterSticker() {
    SFX.tap();
    this.s.stickerNew = [];
    const next = this.session.stickerNext || 'map';
    const chest = this.session.chestNote;
    this.session.stickerNext = null;
    this.session.chestNote = false;
    this.save();
    const line = chest ? [chest, EQ_HELM_TOLD.indexOf(next) >= 0 ? this.newsLine() : ''].filter(Boolean).join(' ') : '';
    this.go(next);
    if (line) this.toast(line);
  },

  /* ── tutor ── */
  easierOne() {
    const q = this.session.q;
    if (q && q.easier) {
      this.session.q = q.easier;
      this.session.stepQ = q.easier;
      this.session.attempted = false; this.session.hinted = false; this.session.sparked = false;
      /* the gentler question is a question in its own right: if the one being stepped
         away from was a hands-on panel that had already been judged, that verdict must
         not carry over and lock the new one before it is even drawn */
      if (typeof EQIX !== 'undefined') EQIX.reset();
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
  wearHat(key) {
    if (this.ownedHats().indexOf(key) < 0) return; /* a locked card never dresses the hero */
    SFX.tap(); this.s.hero.hat = key; this.save(); this.render();
  },
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
    EQD.HELMS.forEach(h => { if (this.s[h.flag]) list.push(h.key); });
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

  /* ── my home (EQD.DECOR, EQD.HOME_SPOTS) ──
     The room used to be a picture: a gold cup, a "Math Master" plaque and a "Reading
     Champion" sign every child had from the first second, a "6 of 18 placed" typed in,
     and a card announcing the Math Master trophy to children who had solved nothing.
     Now every decoration in it is owned (a starter, or earned by the one thing its line
     says), every one stands in a real place the child chose, and what is not in the
     room waits in the box. Nothing is ever taken away: `decorIds` is only added to, and
     a move or a "put away" only changes which place holds what. */
  hasDecor(id) { return (this.s.decorIds || []).indexOf(id) >= 0; },
  /* the place a decoration stands in, or null when it is in the box */
  decorSpotOf(id) {
    const at = this.s.decorAt || {};
    return EQD.HOME_SPOTS.map(sp => sp.id).filter(k => at[k] === id)[0] || null;
  },
  /* the first empty place of that kind, or null */
  freeSpot(kind) {
    const at = this.s.decorAt || {};
    return EQD.HOME_SPOTS.filter(sp => sp.kind === kind && !at[sp.id])[0] || null;
  },
  /* the ones earned and never put anywhere yet, in catalogue order (trophies first) */
  decorWaiting() {
    const fresh = this.s.decorNew || [];
    return EQD.DECOR.filter(d => fresh.indexOf(d.id) >= 0);
  },
  /* give one decoration: it arrives in the box and on the home card; `quiet` when the
     moment that gave it already says so (the chest's own line) */
  awardDecor(id, quiet) {
    const d = EQD.DECOR_BY_ID[id];
    if (!d || this.hasDecor(id)) return null;
    this.s.decorIds.push(id);
    if (!d.start) this.s.decorNew.push(id);
    if (!quiet) this.session.decorNews.push(id);
    return d;
  },
  /* Every earned decoration that is not a chest's is a rule over the save, like the
     stickers: the same check gives it the moment it is earned and hands it to a child
     whose save predates the room (EQ.loadDecor). */
  checkDecor() {
    let got = 0;
    EQD.DECOR.forEach(d => {
      const rule = EQ.DECOR_RULES[d.id];
      if (rule && !this.hasDecor(d.id) && rule(this.s, this) && this.awardDecor(d.id)) got++;
    });
    return got;
  },
  /* A room as a save, a code or a file has it, rebuilt piece by piece: only known
     decorations, the starters always owned, every place holding one owned decoration of
     its own kind and no decoration in two places. `raw` with no decorIds at all is a
     room from before it was real — it starts as a new room does. */
  cleanDecor(raw) {
    const r = raw && typeof raw === 'object' ? raw : {};
    const real = Array.isArray(r.decorIds);
    const ids = [];
    const add = id => { if (typeof id === 'string' && EQD.DECOR_BY_ID.hasOwnProperty(id) && ids.indexOf(id) < 0) ids.push(id); };
    EQD.DECOR.filter(d => d.start).forEach(d => add(d.id));
    if (real) r.decorIds.forEach(add);
    const src = real ? (r.decorAt && typeof r.decorAt === 'object' ? r.decorAt : {}) : EQD.HOME_START;
    const at = {}, used = [];
    EQD.HOME_SPOTS.forEach(sp => {
      const id = Object.prototype.hasOwnProperty.call(src, sp.id) ? src[sp.id] : null;
      const d = typeof id === 'string' && EQD.DECOR_BY_ID.hasOwnProperty(id) ? EQD.DECOR_BY_ID[id] : null;
      if (d && d.kind === sp.kind && ids.indexOf(id) >= 0 && used.indexOf(id) < 0) { at[sp.id] = id; used.push(id); }
    });
    const q = real && Array.isArray(r.decorNew) ? r.decorNew : [];
    const fresh = q.filter((id, i) => ids.indexOf(id) >= 0 && used.indexOf(id) < 0 && q.indexOf(id) === i && !EQD.DECOR_BY_ID[id].start);
    return { ids, at, fresh };
  },
  /* The room on load. A save from before the room was real (no decorIds) starts as a new
     room, then gets what it has earned — as cards to place, and told once:
       · a region round is read from its lifetime count, as the helmets are (EQ.loadHelms);
       · the old card's `trophyPlaced` counts only if the Math Master trophy is really
         earned: then it is already on the shelf. Otherwise that tap was on a card every
         child saw from the first day, and it gives nothing;
       · no chest decoration: the chests already opened showed what was inside, and it
         was not this. */
  loadDecor(raw) {
    this.session.decor = null;
    this.session.decorPop = null;
    this.session.decorNews = [];
    const legacy = !(raw && Array.isArray(raw.decorIds));
    const d = this.cleanDecor(legacy ? null : raw);
    this.s.decorIds = d.ids; this.s.decorAt = d.at; this.s.decorNew = d.fresh;
    if (legacy) {
      EQD.DECOR.filter(x => x.region).forEach(x => {
        const e = this.s.regions && this.s.regions[x.region];
        if (e && e.total >= EQD.REGION_LEN) this.awardDecor(x.id);
      });
      if (raw && raw.trophyPlaced && EQ.DECOR_RULES.t_math(this.s, this) && this.awardDecor('t_math', true)) {
        const sp = this.freeSpot('shelf');
        if (sp) this.putDecor('t_math', sp.id);
      }
    }
    delete this.s.trophyPlaced;
    this.checkDecor();
  },
  /* The one move there is: put a decoration in a place of its kind. Whatever stood there
     takes the moved one's old place (same kind, so it always fits) — or, if the moved one
     came out of the box, goes into the box. Nothing leaves decorIds. */
  putDecor(id, spotId) {
    const d = EQD.DECOR_BY_ID[id], sp = EQD.SPOT_BY_ID[spotId];
    if (!d || !sp || d.kind !== sp.kind || !this.hasDecor(id)) return false;
    const at = this.s.decorAt;
    const from = this.decorSpotOf(id);
    if (from !== spotId) {
      const was = at[spotId];
      at[spotId] = id;
      if (from) { delete at[from]; if (was) at[from] = was; }
    }
    this.s.decorNew = this.s.decorNew.filter(x => x !== id);
    return true;
  },
  /* the home card: a decoration earned and never placed goes to the first empty place of
     its kind; with none left, decorating opens with it already in hand */
  placeNew(id) {
    const d = EQD.DECOR_BY_ID[id];
    if (!d || !this.hasDecor(id) || this.decorSpotOf(id)) return;
    const sp = this.freeSpot(d.kind);
    if (sp) {
      this.putDecor(id, sp.id);
      this.session.decorPop = sp.id;
      SFX.correct();
      this.save();
      this.render();
      return;
    }
    SFX.tap();
    this.session.decor = { pick: { id, from: null } };
    this.render();
    this.toast(TX(EQ.DECOR_FULL[d.kind]));
  },
  /* ── decorating: tap one, then tap where it goes (the put-in-order panel's rule) ── */
  decorEdit() { SFX.tap(); this.session.decor = { pick: null }; this.session.decorPop = null; this.render(); },
  decorDone() { SFX.correct(); this.session.decor = null; this.session.decorPop = null; this.save(); this.render(); },
  /* a tile in the box: pick it up, or put it back down; a locked one says what it takes */
  decorPick(id) {
    const d = EQD.DECOR_BY_ID[id];
    if (!d) return;
    if (!this.hasDecor(id)) { this.decorPeek(id); return; }
    const ed = this.session.decor || (this.session.decor = { pick: null });
    SFX.tap();
    this.session.decorPop = null;
    ed.pick = ed.pick && ed.pick.id === id ? null : { id, from: this.decorSpotOf(id) };
    this.render();
  },
  /* a place in the room, while decorating */
  decorSpot(spotId) {
    const ed = this.session.decor, sp = EQD.SPOT_BY_ID[spotId];
    if (!ed || !sp) return;
    const here = this.s.decorAt[spotId] || null;
    const pick = ed.pick;
    this.session.decorPop = null;
    if (!pick || pick.from === spotId || EQD.DECOR_BY_ID[pick.id].kind !== sp.kind) {
      /* nothing in hand, the same one again, or a place it does not fit: the tap picks up
         what stands here (or lets go), and an empty place just says what to do */
      if (pick && pick.from === spotId) { SFX.tap(); ed.pick = null; this.render(); return; }
      if (here) { SFX.tap(); ed.pick = { id: here, from: spotId }; this.render(); return; }
      this.toast(TX(pick
        ? { az: 'Bu bura sığmır — yaşıl yerlərdən birinə toxun', en: 'That does not fit here — tap one of the green places', ru: 'Сюда не подходит — нажми на одно из зелёных мест' }
        : { az: 'Əvvəlcə qutudan bir bəzək seç', en: 'Pick a decoration from the box first', ru: 'Сначала выбери украшение из коробки' }));
      return;
    }
    this.putDecor(pick.id, spotId);
    ed.pick = null;
    this.session.decorPop = spotId;
    SFX.correct();
    this.save();
    this.render();
  },
  /* the box tile: the one in hand leaves the room for the box — kept, not lost */
  decorBox() {
    const ed = this.session.decor;
    if (!ed || !ed.pick || !ed.pick.from) return;
    SFX.tap();
    delete this.s.decorAt[ed.pick.from];
    ed.pick = null;
    this.save();
    this.render();
  },
  /* tapping a decoration outside decorating, or a locked tile: its name and what it took */
  decorPeek(id) {
    const d = EQD.DECOR_BY_ID[id];
    if (!d) return;
    SFX.tap();
    if (!this.hasDecor(id)) this.toast(TX({ az: 'Hələ bağlıdır — ', en: 'Still locked — ', ru: 'Пока закрыто — ' }) + TX(d.how));
    else this.toast(TX(d.name) + ' · ' + (d.start ? TX(d.how) : '✓ ' + TX(d.how)));
  },

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
    this.applyBig();
    this.render();
    if (typeof EQM !== 'undefined') EQM.update(); /* music on/off, or calm's softer level */
    /* switched off: silent now, not after the sentence. Switched on: the grown-up hears
       exactly what the child will — or, with no voice for this language, nothing, which
       the subtitle under the switch now says plainly */
    if (key === 'readAloud' && typeof EQV !== 'undefined') {
      if (this.s.settings.readAloud) EQV.sample();
      else EQV.stop();
    }
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
  /* "Bigger text" (parent settings) — the same body-class switch as calm mode. The screens
     are fixed-px designs laid out with position:absolute, so the class does not scale
     anything wholesale: css/app.css grows only what the child reads (tagged .bt / .btf)
     and re-anchors the question cards so the larger text pushes them up, not under the
     answer buttons */
  applyBig() { document.body.classList.toggle('bigtext', !!this.s.settings.bigText); },
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
    this.applyBig();
    if (typeof EQV !== 'undefined') EQV.init();
    if (typeof EQM !== 'undefined') EQM.init(); /* the melody waits for the first touch */
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
      if (document.hidden && typeof EQV !== 'undefined') EQV.stop(); /* never talk from a hidden tab */
      if (typeof EQM !== 'undefined') EQM.update(); /* a hidden tab plays nothing */
      if (document.hidden) this.save();
      else if (!this.checkNewDay(true)) this.restNudge();
    });
    window.addEventListener('focus', () => { if (!this.checkNewDay(true)) this.restNudge(); });
    window.addEventListener('pagehide', () => { EQT.tick(); this.save(); if (typeof EQV !== 'undefined') EQV.stop(); if (typeof EQM !== 'undefined') EQM.stop(); });

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
        /* a hands-on question has no answer button to press, so the driver reports a
           correct answer straight to resolve() rather than trying to fake a drag */
        if (this.session.answering || !q) return;
        if (typeof EQIX !== 'undefined' && q.kind && EQIX.fmt(q)) EQIX.commit(q, true);
        else { const x = EQD.qa(q); this.answer(x.answers.indexOf(x.correct)); }
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

/* ── what each sticker's `how` promises, as a check on the save ──
   (chest stickers have no rule: leaf, moon, cloud, comet come from EQD.nextChestSticker) */
EQ.STICKER_RULES = {
  /* any question solved on the challenge screen — the daily set, a mission or a region */
  acorn: (s, e) => s.challengesDone >= 1 || s.trophiesEarned >= 1 || e.trackSum('done') >= 1,
  mushroom: s => s.challengesDone >= 5,
  /* s.streak is the game's count of days played (it is never reset), hence "2 gün oyna" */
  fox: s => Math.max(s.streak || 0, s.bestStreak || 0) >= 2,
  /* hg = solved after the hint was open (tapped or shown after a miss) */
  owl: (s, e) => e.trackSum('done') - e.trackSum('hg') >= 5,
  tree: s => s.level >= 3,
  shield: (s, e) => !!s.feats.faced || s.trophiesEarned >= 1 || s.bossHits >= 1 || e.trackSum('boss') >= 1,
  /* the Math Dragon guards stages 1–2 of every Knowledge Forest chapter */
  dragon: s => Object.keys(s.relics || {}).some(k => EQD.CHAPTERS[(k - 1) % EQD.CHAPTERS.length].id === 'forest' && (s.relics[k] & 3)),
  crystal: s => Object.keys(s.relics || {}).some(k => s.relics[k] & 4),
  sword: s => s.trophiesEarned >= 3,
  flame: s => Math.max(s.streak || 0, s.bestStreak || 0) >= 3,
  medal: s => !!s.feats.flawless,
  star: s => (s.level - 1) * EQD.XP_PER_LEVEL + s.xp >= 500,
  rainbow: s => s.level >= 2,
  rocket: s => s.level >= 5,
  wand: s => s.hintSparks >= 1,
  potion: s => !!s.feats.easier,
  /* the first gate a child opens: the day-0 Ancient Gate for most, but any first boss
     counts — the day-0 quest never comes back once its day has passed, and a Key tied to
     it alone would lock the Key, and with it the whole album, for good */
  key: s => !!((s.relics || {})[1] & 1) || s.trophiesEarned >= 1,
  book: s => !!s.feats.valley,
  lantern: s => EQD.chapterAt(s.questDay || 0).chapterNo >= 2,
  questy: s => EQD.STICKERS.every(st => st.id === 'questy' || (s.stickerIds || []).indexOf(st.id) >= 0)
};

/* ── what each trophy's line promises, as progress read off the save ──
   { have, need, live }: the Awards screen draws the bar from it, and have ≥ need is the
   trophy — on that screen and on the shelf at home alike (EQ.DECOR_RULES). `live` is
   whether it can be worked on yet (Söz Vadisi opens after the first boss). */
EQ.TROPHY_RULES = {
  /* any question solved on the challenge screen — the daily set, a mission or a region */
  first: (s, e) => ({ have: s.mathSolved > 0 || s.challengesDone > 0 || s.trophiesEarned >= 1 || e.trackSum('done') >= 1 ? 1 : 0, need: 1, live: true }),
  /* trophiesEarned counts bosses beaten and is never reset (bossBeaten is, every stage) */
  bridge: s => ({ have: Math.min(1, s.trophiesEarned || 0), need: 1, live: true }),
  /* s.streak is the game's count of days played (it is never reset), as for the fox sticker */
  week: s => ({ have: Math.max(s.streak || 0, s.bestStreak || 0), need: 7, live: true }),
  math: s => ({ have: s.mathSolved || 0, need: 100, live: true }),
  book: (s, e) => ({ have: (s.regions && s.regions.valley && s.regions.valley.total) || 0, need: 20, live: e.regionOpen('valley') }),
  world: (s, e) => ({ have: e.regionsOpen().length, need: 3, live: e.regionsOpen().length > 0 })
};
EQ.trophyHas = id => { const p = EQ.TROPHY_RULES[id](EQ.s, EQ); return p.have >= p.need; };

/* ── what each earned decoration's line promises (chest ones come from EQD.nextChestDecor) ── */
EQ.DECOR_RULES = {};
EQD.DECOR.forEach(d => {
  if (d.trophy) EQ.DECOR_RULES[d.id] = (s, e) => { const p = EQ.TROPHY_RULES[d.trophy](s, e); return p.have >= p.need; };
  /* the chapter's third-stage boss: bit 4 of that chapter's relic record (EQ.earnRelic) */
  else if (d.finale) EQ.DECOR_RULES[d.id] = s => Object.keys(s.relics || {}).some(k => EQD.CHAPTERS[(k - 1) % EQD.CHAPTERS.length].id === d.finale && (s.relics[k] & 4));
  /* a full round there — the moment the region's helmet is earned (EQ.regionAdvance) */
  else if (d.region) EQ.DECOR_RULES[d.id] = s => !!(s.feats && s.feats[d.region]);
});
/* what the card says when every place of that kind is taken */
EQ.DECOR_FULL = {
  shelf: { az: 'Rəfdə yer qalmayıb — hansının yerinə qoyaq? Birinə toxun.', en: 'The shelves are full — which one should it replace? Tap one.', ru: 'На полках нет места — вместо какого поставить? Нажми на него.' },
  wall: { az: 'Divarda yer qalmayıb — hansı şəklin yerinə? Birinə toxun.', en: 'The wall is full — which picture should it replace? Tap one.', ru: 'На стене нет места — вместо какой картины? Нажми на неё.' },
  floor: { az: 'Döşəmədə yer qalmayıb — hansının yerinə qoyaq? Birinə toxun.', en: 'The floor corners are full — which one should it replace? Tap one.', ru: 'Углы заняты — вместо чего поставить? Нажми на него.' },
  rug: { az: 'Xalça yeri doludur — köhnəsinin üstünə toxun.', en: 'There is a rug already — tap it to swap.', ru: 'Коврик уже лежит — нажми на него, чтобы поменять.' },
  hang: { az: 'Tavanda yer qalmayıb — asılanın üstünə toxun.', en: 'The ceiling hook is taken — tap what hangs there to swap.', ru: 'Крючок занят — нажми на то, что висит, чтобы поменять.' }
};

window.addEventListener('DOMContentLoaded', () => EQ.boot());
