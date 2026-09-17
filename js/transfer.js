/* EduQuest — moving an adventure to another phone.
   There is no server and there will not be one, so the grown-up carries the data across
   themselves: a QR code the new phone's own camera opens, or a file they save and send.
   Nothing here touches the network. The QR is drawn on the device, and the payload rides
   in the URL fragment — the part of a link a browser never sends to the host — so even
   opening the link tells our web host nothing about the child.

   Two shapes, because a QR holds about a kilobyte and a file holds everything:
     · code  — one child, packed small (progress always, as much history as fits)
     · file  — every child on the device, complete, as readable JSON */

const EQX = {
  QR_MAX: 900,                 /* URL characters that still scan comfortably off a screen */
  HOME: 'https://sado729.github.io/eduquest/',

  HAIR: ['bob', 'curly', 'spiky', 'long', 'braids'],
  HAT: ['none', 'explorer', 'wizard', 'crown'],
  LANGS: ['az', 'en', 'ru'],
  SUBJ: ['math', 'logic', 'reading', 'science'],
  TOPIC: ['add', 'pattern', 'groups', 'take', 'double'],

  /* ── small helpers ── */
  b(n) { return Math.max(0, Math.round(Number(n) || 0)).toString(36); },
  n(s) { const v = parseInt(s, 36); return isNaN(v) ? 0 : v; },
  /* a date key as a plain day count, so every date in a code costs two or three characters */
  dayNo(key) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ''));
    return m ? Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5) : null;
  },
  dayKey(no) {
    const d = new Date(no * 864e5);
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
  },
  /* hero names are free text, so they are escaped down to the delimiters we use */
  esc(t) { return encodeURIComponent(String(t == null ? '' : t)).replace(/[._~-]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()); },
  unesc(t) { try { return decodeURIComponent(t); } catch (e) { return ''; } },

  /* the album is 24 known stickers, so which ones a child owns packs into one bitmask
     — five base-36 characters instead of a list of names, and order never matters */
  stickerMask(ids) {
    let m = 0;
    (ids || []).forEach(id => {
      const i = EQD.STICKERS.findIndex(x => x.id === id);
      if (i >= 0 && i < 31) m |= (1 << i);
    });
    return m;
  },
  stickerIds(mask) {
    const out = [];
    EQD.STICKERS.forEach((st, i) => { if (i < 31 && (mask & (1 << i))) out.push(st.id); });
    return out;
  },

  /* today's care is at most three known items, so it packs into one base-36 digit
     the same way the album packs into five */
  careMask(ids) {
    let m = 0;
    (ids || []).forEach(id => {
      const i = EQD.CARE.findIndex(c => c.id === id);
      if (i >= 0 && i < 31) m |= (1 << i);
    });
    return m;
  },
  careIds(mask) {
    const out = [];
    EQD.CARE.forEach((c, i) => { if (i < 31 && (mask & (1 << i))) out.push(c.id); });
    return out;
  },

  /* the day's quest title is one of the fixed themes — store which, not the three strings */
  themeNo(title) {
    if (!title || !title.en) return 0;
    const T = EQD.THEMES || [];
    for (let i = 0; i < T.length; i++) if (T[i].title && T[i].title.en === title.en) return i + 1;
    const d0 = EQD.questSet(0);
    if (d0 && d0.title && d0.title.en === title.en) return T.length + 1;
    return 0;
  },
  themeTitle(no) {
    const T = EQD.THEMES || [];
    if (no >= 1 && no <= T.length) return T[no - 1].title;
    if (no === T.length + 1) { const d0 = EQD.questSet(0); return d0 ? d0.title : null; }
    return null;
  },

  /* ── pack one child into URL-safe text ──
     groups split by '_', fields by '.', day rows by '-'; every number is base 36 */
  pack(s, maxDays) {
    const keys = Object.keys((s.track && s.track.days) || {}).filter(k => this.dayNo(k) !== null).sort();
    const keep = maxDays > 0 ? keys.slice(-maxDays) : [];
    const dates = keep.map(k => this.dayNo(k));
    const start = this.dayNo(s.track && s.track.start);
    const last = this.dayNo(s.lastDay);
    const played = (s.playedDays || []).map(k => this.dayNo(k)).filter(v => v !== null);
    const bonus = this.dayNo(s.settings.bonusDay);
    const careDay = this.dayNo(s.careDay);
    const pq = (s.parentQuests || []).filter(m => this.TOPIC.indexOf(m.t) >= 0 && this.dayNo(m.day) !== null);
    const all = dates.concat(played, [start, last, bonus, careDay].filter(v => v !== null), pq.map(m => this.dayNo(m.day)));
    const base = all.length ? Math.min.apply(null, all) : this.dayNo(EQ.dayKey());
    const off = v => (v === null ? '' : this.b(v - base));

    const h = s.hero, hx = c => String(c || '').replace('#', '');
    const flags = (s.onboarded ? 1 : 0) | (s.bossBeaten ? 2 : 0) | (s.chestReady ? 4 : 0) | (s.chestOpened ? 8 : 0)
      | (s.wizardHatOwned ? 16 : 0) | (s.crownOwned ? 32 : 0) | (s.trophyPlaced ? 64 : 0) | (s.pendingLevelUp ? 128 : 0);
    const st = s.settings;
    const sflags = (st.readAloud ? 1 : 0) | (st.bigText ? 2 : 0) | (st.calm ? 4 : 0) | (st.music ? 8 : 0) | (st.bedtime ? 16 : 0);

    const rows = keep.map((k, i) => {
      const d = s.track.days[k];
      const f = [dates[i] - base, d.secs, d.secsQ, d.secsB, d.a, d.c, d.done, d.hg, d.hints, d.boss, d.bossWin, this.themeNo(d.title)];
      this.SUBJ.forEach(x => { const v = (d.subj || {})[x]; f.push(v ? v.a : 0, v ? v.c : 0); });
      this.TOPIC.forEach(x => { const v = (d.topics || {})[x]; f.push(v ? v.a : 0, v ? v.c : 0, v ? v.h : 0); });
      while (f.length > 1 && f[f.length - 1] === 0) f.pop(); /* trailing zeros cost nothing */
      return f.map(v => this.b(v)).join('.');
    });

    return [
      '1',
      this.esc(s.heroName),
      [hx(h.skin), hx(h.hairColor), hx(h.outfit), hx(h.outfitDark), hx(h.shoe),
        this.b(Math.max(0, this.HAIR.indexOf(h.hair))), this.b(Math.max(0, this.HAT.indexOf(h.hat)))].join('.'),
      hx(s.questyFur) + '.' + hx(s.questyFurDark),
      [s.xp, s.level, s.coins, s.streak, s.bestStreak, s.xpToday, s.coinsToday, s.challengesDone,
        s.bossHits, s.mathSolved, s.hintSparks, s.stickers, s.trophiesEarned, s.questDay,
        this.stickerMask(s.stickerIds), this.careMask(s.careGiven), s.careTotal].map(v => this.b(v)).join('.'),
      this.b(flags),
      [this.b(sflags), this.b(st.limit), this.b(st.bedMin), this.b(Math.max(0, this.LANGS.indexOf(st.lang))), this.b(st.bonusMins)].join('.'),
      [this.b(base), off(start), off(last), off(bonus), off(careDay)].join('.'),
      played.map(v => off(v)).join('.'),
      /* topic.day[.progress] — progress is how many of the mission's questions the child
         has answered, with MISSION_LEN meaning finished. A code written before missions
         were playable has only two fields, so the reader defaults it to 0. */
      pq.map(m => {
        const n = m.done ? EQD.MISSION_LEN : Math.min(EQD.MISSION_LEN, Math.max(0, m.n || 0));
        const head = this.b(this.TOPIC.indexOf(m.t)) + '.' + off(this.dayNo(m.day));
        return n > 0 ? head + '.' + this.b(n) : head;
      }).join('-'),
      rows.join('-')
    ].join('_');
  },

  /* ── read one child back out of packed text (returns a raw object, still to be cleaned) ── */
  unpack(text) {
    const g = String(text || '').split('_');
    if (g[0] !== '1' || g.length < 11) return null;
    const N = i => this.n(i);
    const f4 = g[4].split('.').map(N);
    const hero = g[2].split('.'), fur = g[3].split('.');
    const sf = g[6].split('.').map(N), dt = g[7].split('.');
    const flags = this.n(g[5]), base = this.n(dt[0]);
    const at = i => (dt[i] === '' || dt[i] == null ? null : this.dayKey(base + this.n(dt[i])));
    const s = {
      heroName: this.unesc(g[1]),
      hero: {
        skin: '#' + hero[0], hairColor: '#' + hero[1], outfit: '#' + hero[2],
        outfitDark: '#' + hero[3], shoe: '#' + hero[4],
        hair: this.HAIR[this.n(hero[5])], hat: this.HAT[this.n(hero[6])]
      },
      questyFur: '#' + fur[0], questyFurDark: '#' + fur[1],
      xp: f4[0], level: f4[1], coins: f4[2], streak: f4[3], bestStreak: f4[4],
      xpToday: f4[5], coinsToday: f4[6], challengesDone: f4[7], bossHits: f4[8],
      mathSolved: f4[9], hintSparks: f4[10], stickers: f4[11], trophiesEarned: f4[12], questDay: f4[13],
      stickerIds: g[4].split('.').length > 14 ? this.stickerIds(f4[14]) : null,
      /* care rides at the end of the counters group and of the date group: a code
         written before Questy's care simply has neither, and reads as "never cared" */
      careGiven: g[4].split('.').length > 15 ? this.careIds(f4[15]) : [],
      careTotal: f4[16] || 0,
      careDay: dt.length > 4 ? at(4) : null,
      onboarded: !!(flags & 1), bossBeaten: !!(flags & 2), chestReady: !!(flags & 4), chestOpened: !!(flags & 8),
      wizardHatOwned: !!(flags & 16), crownOwned: !!(flags & 32), trophyPlaced: !!(flags & 64), pendingLevelUp: !!(flags & 128),
      settings: {
        readAloud: !!(sf[0] & 1), bigText: !!(sf[0] & 2), calm: !!(sf[0] & 4), music: !!(sf[0] & 8), bedtime: !!(sf[0] & 16),
        limit: sf[1], bedMin: sf[2], lang: this.LANGS[sf[3]], bonusMins: sf[4], bonusDay: at(3)
      },
      lastDay: at(2),
      playedDays: (g[8] ? g[8].split('.') : []).map(v => this.dayKey(base + this.n(v))),
      parentQuests: (g[9] ? g[9].split('-') : []).map(p => {
        const [t, d, n] = p.split('.');
        const got = n == null || n === '' ? 0 : this.n(n);
        return {
          t: this.TOPIC[this.n(t)],
          day: this.dayKey(base + this.n(d)),
          n: Math.min(EQD.MISSION_LEN, Math.max(0, got)),
          done: got >= EQD.MISSION_LEN
        };
      }),
      track: { start: at(1) || this.dayKey(base), days: {} }
    };
    (g[10] ? g[10].split('-') : []).forEach(row => {
      const f = row.split('.').map(N);
      const d = {
        secs: f[1] || 0, secsQ: f[2] || 0, secsB: f[3] || 0, a: f[4] || 0, c: f[5] || 0,
        done: f[6] || 0, hg: f[7] || 0, hints: f[8] || 0, boss: f[9] || 0, bossWin: f[10] || 0,
        subj: {}, topics: {}
      };
      const title = this.themeTitle(f[11] || 0);
      if (title) d.title = title;
      this.SUBJ.forEach((x, i) => { const a = f[12 + i * 2] || 0, c = f[13 + i * 2] || 0; if (a || c) d.subj[x] = { a, c }; });
      this.TOPIC.forEach((x, i) => {
        const a = f[20 + i * 3] || 0, c = f[21 + i * 3] || 0, h = f[22 + i * 3] || 0;
        if (a || c || h) d.topics[x] = { a, c, h };
      });
      s.track.days[this.dayKey(base + f[0])] = d;
    });
    return s;
  },

  /* ── everything that arrives from a link or a file is rebuilt field by field ──
     the app writes these values straight into markup, so nothing unchecked may pass */
  clean(raw) {
    const r = raw || {};
    const out = JSON.parse(JSON.stringify(EQ_DEFAULTS));
    const int = (v, lo, hi, fb) => { const n = Math.round(Number(v)); return isNaN(n) ? fb : Math.min(hi, Math.max(lo, n)); };
    const hex = (v, fb) => (/^#[0-9A-Fa-f]{6}$/.test(String(v)) ? String(v) : fb);
    const one = (v, list, fb) => (list.indexOf(v) >= 0 ? v : fb);
    const date = (v, fb) => (this.dayNo(v) !== null ? String(v) : fb);
    const text = (v, max) => String(v == null ? '' : v).replace(/[<>&"'`\\]/g, '').trim().slice(0, max);

    out.heroName = text(r.heroName, 14) || EQ_DEFAULTS.heroName;
    const h = r.hero || {};
    out.hero = {
      skin: hex(h.skin, out.hero.skin), hairColor: hex(h.hairColor, out.hero.hairColor),
      outfit: hex(h.outfit, out.hero.outfit), outfitDark: hex(h.outfitDark, out.hero.outfitDark),
      shoe: hex(h.shoe, out.hero.shoe),
      hair: one(h.hair, this.HAIR, out.hero.hair), hat: one(h.hat, this.HAT, out.hero.hat)
    };
    out.questyFur = hex(r.questyFur, out.questyFur);
    out.questyFurDark = hex(r.questyFurDark, out.questyFurDark);

    out.xp = int(r.xp, 0, 9e6, 0);
    out.level = int(r.level, 1, 999, 1);
    out.coins = int(r.coins, 0, 9e6, 0);
    out.streak = int(r.streak, 1, 9999, 1);
    out.bestStreak = Math.max(out.streak, int(r.bestStreak, 1, 9999, 1));
    out.xpToday = int(r.xpToday, 0, 9e5, 0);
    out.coinsToday = int(r.coinsToday, 0, 9e5, 0);
    out.challengesDone = int(r.challengesDone, 0, 5, 0);
    out.bossHits = int(r.bossHits, 0, 4, 0);
    out.mathSolved = int(r.mathSolved, 0, 9e6, 0);
    out.hintSparks = int(r.hintSparks, 0, 9e6, 0);
    out.stickers = int(r.stickers, 0, 9e6, 0);
    /* the same cleaner the loader uses: unknown ids dropped, a bare count expanded */
    out.stickerIds = EQ.cleanStickers(r.stickerIds, out.stickers);
    out.stickers = out.stickerIds.length;
    out.trophiesEarned = int(r.trophiesEarned, 0, 9e6, 0);
    /* care: only known ids, no duplicates, and only if they belong to a real day.
       A careDay that is not a date makes today's care simply unspent — never a crash,
       and never a day the child is locked out of caring. */
    out.careDay = date(r.careDay, null);
    out.careGiven = out.careDay
      ? (Array.isArray(r.careGiven) ? r.careGiven : [])
        .filter((id, i, a) => EQD.CARE_BY_ID[id] && a.indexOf(id) === i)
      : [];
    out.careTotal = Math.max(out.careGiven.length, int(r.careTotal, 0, 9e6, 0));
    out.questDay = int(r.questDay, 0, 99999, 0);
    ['onboarded', 'bossBeaten', 'chestReady', 'chestOpened', 'wizardHatOwned', 'crownOwned', 'trophyPlaced', 'pendingLevelUp']
      .forEach(k => { out[k] = !!r[k]; });

    const st = r.settings || {}, o = out.settings;
    o.readAloud = !!st.readAloud; o.bigText = !!st.bigText; o.calm = !!st.calm;
    o.music = !!st.music; o.bedtime = !!st.bedtime;
    o.limit = int(st.limit, 0, 180, o.limit);
    o.bedMin = int(st.bedMin, 0, 1439, o.bedMin);
    o.bonusMins = int(st.bonusMins, 0, 180, 0);
    o.bonusDay = date(st.bonusDay, null);
    o.lang = one(st.lang, this.LANGS, 'az');

    out.lastVisit = null;
    out.lastDay = date(r.lastDay, null);
    out.playedDays = (Array.isArray(r.playedDays) ? r.playedDays : []).map(v => date(v, null)).filter(Boolean).slice(-14);
    out.parentQuests = (Array.isArray(r.parentQuests) ? r.parentQuests : [])
      .filter(m => m && this.TOPIC.indexOf(m.t) >= 0 && this.dayNo(m.day) !== null)
      .slice(-40).map(m => {
        const n = int(m.n, 0, EQD.MISSION_LEN, 0);
        return { t: m.t, day: String(m.day), n: n, done: !!m.done || n >= EQD.MISSION_LEN };
      });

    const tr = r.track || {};
    out.track = { start: date(tr.start, EQ.dayKey()), days: {} };
    const src = tr.days && typeof tr.days === 'object' ? tr.days : {};
    Object.keys(src).filter(k => this.dayNo(k) !== null).sort().slice(-70).forEach(k => {
      const d = src[k] || {};
      const day = {
        secs: int(d.secs, 0, 86400, 0), secsQ: int(d.secsQ, 0, 86400, 0), secsB: int(d.secsB, 0, 86400, 0),
        a: int(d.a, 0, 9999, 0), c: int(d.c, 0, 9999, 0), done: int(d.done, 0, 9999, 0),
        hg: int(d.hg, 0, 9999, 0), hints: int(d.hints, 0, 9999, 0),
        boss: int(d.boss, 0, 9999, 0), bossWin: int(d.bossWin, 0, 9999, 0),
        subj: {}, topics: {}
      };
      const t = d.title;
      if (t && typeof t === 'object') day.title = { az: text(t.az, 60), en: text(t.en, 60), ru: text(t.ru, 60) };
      /* empty buckets are dropped: the tracker only ever creates one by recording something,
         and leaving them out keeps a packed code and a file describing the same day */
      this.SUBJ.forEach(x => {
        const v = (d.subj || {})[x];
        const a = int(v && v.a, 0, 9999, 0), c = int(v && v.c, 0, 9999, 0);
        if (a || c) day.subj[x] = { a, c };
      });
      this.TOPIC.forEach(x => {
        const v = (d.topics || {})[x];
        const a = int(v && v.a, 0, 9999, 0), c = int(v && v.c, 0, 9999, 0), h = int(v && v.h, 0, 9999, 0);
        if (a || c || h) day.topics[x] = { a, c, h };
      });
      out.track.days[k] = day;
    });
    return out;
  },

  /* ── deflate, when the browser has it: it roughly triples the history a code carries ── */
  can() { return typeof CompressionStream === 'function' && typeof DecompressionStream === 'function'; },
  /* the writer is fed and forgotten — a bad payload surfaces on the reading side,
     which the caller is already guarding */
  pump(stream, bytes) {
    const w = stream.writable.getWriter();
    w.write(bytes).catch(() => { });
    w.close().catch(() => { });
    return new Response(stream.readable).arrayBuffer();
  },
  async squeeze(text) {
    const buf = await this.pump(new CompressionStream('deflate-raw'), new TextEncoder().encode(text));
    return this.toB64(new Uint8Array(buf));
  },
  async swell(b64) {
    return new TextDecoder().decode(await this.pump(new DecompressionStream('deflate-raw'), this.fromB64(b64)));
  },
  toB64(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 4096) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 4096));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  fromB64(b64) {
    const s = atob(String(b64).replace(/-/g, '+').replace(/_/g, '/'));
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  },

  /* ── the transfer link ── */
  home() {
    if (/^https?:$/.test(location.protocol)) return location.origin + location.pathname.replace(/[^/]*$/, '');
    return this.HOME;
  },
  /* the biggest slice of history that still fits in a scannable code.
     Progress always travels; the day-by-day history is what gets trimmed, newest kept. */
  async link(s) {
    const home = this.home();
    const total = Object.keys((s.track && s.track.days) || {}).length;
    const make = async (d) => {
      const packed = this.pack(s, d);
      return home + '#eq=' + (this.can() ? 'z' + await this.squeeze(packed) : packed);
    };
    const whole = await make(total);
    if (whole.length <= this.QR_MAX) return { url: whole, days: total, all: true };
    let lo = 0, hi = total, url = null, days = 0;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const u = await make(mid);
      if (u.length <= this.QR_MAX) { url = u; days = mid; lo = mid + 1; } else hi = mid - 1;
    }
    if (!url) url = await make(0);
    return { url, days, all: days >= total };
  },
  /* anything at all may arrive here — a truncated scan, someone else's QR, a typo.
     Never throws: null simply means "that was not an EduQuest transfer code". */
  async read(body) {
    try {
      const t = String(body || '');
      const packed = t.charAt(0) === 'z' ? await this.swell(t.slice(1)) : t;
      const raw = this.unpack(packed);
      return raw ? this.clean(raw) : null;
    } catch (e) { return null; }
  },

  /* ── the file: every child, nothing left out, readable by anyone who opens it ── */
  bundle() {
    EQT.tick();
    if (EQ.s) EQ.save();
    return {
      app: 'eduquest', v: 1, made: new Date().toISOString(),
      profiles: EQP.ids.map(id => ({ id, state: EQP.peek(id) }))
    };
  },
  /* a file name a parent can recognise in a downloads list, in plain ASCII so every
     phone, mail app and file manager keeps it intact */
  fileName() {
    const plain = { 'ə': 'e', 'ı': 'i', 'Ə': 'E', 'I': 'I' };
    const names = EQP.ids.map(id => EQP.label(EQP.peek(id))).join('-')
      .replace(/[əıƏ]/g, c => plain[c] || c)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 24).toLowerCase();
    return 'eduquest-' + (names.replace(/^-|-$/g, '') || 'backup') + '-' + EQ.dayKey() + '.json';
  },
  readBundle(text) {
    let b = null;
    try { b = JSON.parse(text); } catch (e) { return null; }
    if (!b || b.app !== 'eduquest' || !Array.isArray(b.profiles) || !b.profiles.length) return null;
    const states = b.profiles.slice(0, EQP_MAX)
      .map(p => this.clean(p && p.state))
      .filter((s, i) => s.onboarded || i === 0); /* half-finished extra profiles are not worth carrying */
    return states.length ? { made: typeof b.made === 'string' ? b.made : null, states } : null;
  },

  /* ── where an arriving child fits on this device ── */
  plan(state) {
    const mine = EQP.ids.map(id => ({ id, s: EQP.peek(id) }));
    if (mine.length === 1 && !mine[0].s.onboarded) return { mode: 'fresh', id: mine[0].id };
    const same = mine.filter(p => p.s.heroName === state.heroName
      && ((p.s.track && p.s.track.start) || '') === ((state.track && state.track.start) || ''))[0];
    if (same) return { mode: 'same', id: same.id, name: same.s.heroName };
    if (!EQP.full()) return { mode: 'new', id: EQP.nextId() };
    return { mode: 'full' };
  },

  /* ── writing it down ── the page reloads straight after, so EQ.frozen keeps the
     old in-memory state from being saved over what we just wrote */
  put(id, state) {
    try { localStorage.setItem(EQP.key(id), JSON.stringify(state)); return true; }
    catch (e) { return false; }
  },
  applyOne(state, plan) {
    if (!plan || plan.mode === 'full') return false;
    EQ.frozen = true;
    if (!this.put(plan.id, state)) { EQ.frozen = false; return false; }
    if (EQP.ids.indexOf(plan.id) === -1) EQP.ids.push(plan.id);
    EQP.active = plan.id;
    EQP.save();
    return true;
  },
  applyBundle(states) {
    EQ.frozen = true;
    const ids = states.map((s, i) => 'p' + (i + 1));
    EQP.ids.forEach(id => { if (ids.indexOf(id) === -1) { try { localStorage.removeItem(EQP.key(id)); } catch (e) { /* private mode */ } } });
    ids.forEach((id, i) => this.put(id, states[i]));
    EQP.ids = ids;
    EQP.active = ids[0];
    EQP.save();
    return true;
  },

  /* ── what an import is about to bring in, for the confirmation screen ── */
  stats(s) {
    const days = Object.keys((s.track && s.track.days) || {});
    let secs = 0, done = 0;
    days.forEach(k => { secs += s.track.days[k].secs || 0; done += s.track.days[k].done || 0; });
    return { name: s.heroName, level: s.level, xp: s.xp, streak: s.streak, days: days.length, mins: Math.round(secs / 60), done };
  }
};
