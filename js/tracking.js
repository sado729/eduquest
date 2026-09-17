/* EduQuest — real play tracking + parent-mode analytics queries.
   Everything lives in EQ.s.track inside localStorage; nothing leaves the device.
   Recording happens through small hooks in app.js (tick / attempt / hint / done / boss). */

const EQT = {

  /* ── registries ── */
  SUBJECTS: {
    math:    { name: { az: 'Riyaziyyat', en: 'Math', ru: 'Математика' }, letter: { az: 'R', en: 'M', ru: 'М' }, bg: '#E8FBF1', fg: '#2A9455', bar: '#3DBE6E' },
    logic:   { name: { az: 'Məntiq', en: 'Logic', ru: 'Логика' }, letter: { az: 'M', en: 'L', ru: 'Л' }, bg: '#EFE7FF', fg: '#5B3FD6', bar: '#7B5CFF' },
    reading: { name: { az: 'Oxu', en: 'Reading', ru: 'Чтение' }, letter: { az: 'O', en: 'R', ru: 'Ч' }, bg: '#E4F6FF', fg: '#2196C9', bar: '#45C6F0' },
    science: { name: { az: 'Elm', en: 'Science', ru: 'Наука' }, letter: { az: 'E', en: 'S', ru: 'Н' }, bg: '#FFF3D6', fg: '#8A5A0A', bar: '#FFC24B' }
  },

  TOPICS: {
    add:     { subj: 'math',  name: { az: 'Üstünə sayma', en: 'Adding on', ru: 'Присчитывание' } },
    pattern: { subj: 'logic', name: { az: 'Naxışlar', en: 'Patterns', ru: 'Узоры' } },
    groups:  { subj: 'math',  name: { az: 'Qruplarla sayma', en: 'Groups of', ru: 'Счёт группами' } },
    take:    { subj: 'math',  name: { az: 'Çıxma', en: 'Taking away', ru: 'Вычитание' } },
    double:  { subj: 'math',  name: { az: 'Qoşalar', en: 'Doubles', ru: 'Двойные' } }
  },

  /* one generated practice mission per topic (parent approves it on screen 26) */
  MISSIONS: {
    add: {
      name: { az: 'Alma Körpüsünü tikdir', en: 'Build the Apple Bridge', ru: 'Построй Яблочный Мост' },
      detail: { az: 'Üstünə sayaraq taxtaları düz · 8 sınaq', en: 'Count on to place the planks · 8 challenges', ru: 'Присчитывай и укладывай доски · 8 испытаний' }
    },
    pattern: {
      name: { az: 'Naxış Qülləsini oyat', en: 'Wake the Pattern Tower', ru: 'Разбуди Башню Узоров' },
      detail: { az: 'Sıranı davam etdir, işıqlar yansın · 8 sınaq', en: 'Continue the sequence to light it up · 8 challenges', ru: 'Продолжи последовательность, чтобы зажечь огни · 8 испытаний' }
    },
    groups: {
      name: { az: 'Kristal Maşını', en: 'Crystal Machine', ru: 'Кристальная Машина' },
      detail: { az: 'Kristalları bərabər qruplara düz · 8 sınaq', en: 'Sort crystals into equal groups · 8 challenges', ru: 'Разложи кристаллы на равные группы · 8 испытаний' }
    },
    take: {
      name: { az: 'Bağ dovşanını izlə', en: 'Track the Garden Bunny', ru: 'Выследи Садового Кролика' },
      detail: { az: 'Çıx və neçəsinin qaldığını tap · 8 sınaq', en: 'Take away to see what is left · 8 challenges', ru: 'Вычитай и узнай, сколько осталось · 8 испытаний' }
    },
    double: {
      name: { az: 'Əkiz Fənərləri yandır', en: 'Light the Twin Lanterns', ru: 'Зажги Парные Фонари' },
      detail: { az: 'Hər fənərin qoşasını tap · 8 sınaq', en: 'Find the double of every lantern · 8 challenges', ru: 'Найди двойник каждого фонаря · 8 испытаний' }
    }
  },

  /* stable topic key from a question's tag (tags are the 5 fixed topic labels in data.js) */
  topicKey(q) {
    const t = (q && q.tag && q.tag.en) || '';
    if (t.indexOf('ADDING') >= 0) return 'add';
    if (t.indexOf('PATTERN') >= 0) return 'pattern';
    if (t.indexOf('GROUPS') >= 0) return 'groups';
    if (t.indexOf('TAKING') >= 0) return 'take';
    if (t.indexOf('DOUBLE') >= 0) return 'double';
    return null;
  },

  /* ── state ──
     A parent quest is `{ t: topic, day: approval day }` plus the progress the child
     has made through it: `n` questions answered and `done` once the set is finished.
     Only `t` and `day` travel in a transfer code, so an entry arriving from another
     device (or from a save written before missions were playable) has no progress
     fields at all — they are filled in here rather than at every read site. */
  init(s) {
    if (!s.track || typeof s.track !== 'object') s.track = {};
    if (!s.track.days || typeof s.track.days !== 'object') s.track.days = {};
    if (!s.track.start) s.track.start = EQ.dayKey();
    /* the spaced-repetition schedule; entries for topics that no longer exist are
       dropped so a renamed topic cannot hold a slot nothing can ever answer */
    if (!s.track.sched || typeof s.track.sched !== 'object') s.track.sched = {};
    /* the frozen plan for the quest day in progress (rebuilt on demand if absent) */
    if (s.track.plan && (typeof s.track.plan !== 'object' || !Array.isArray(s.track.plan.topics))) s.track.plan = null;
    for (const k in s.track.sched) {
      const e = s.track.sched[k];
      if (!this.TOPICS[k] || !e || typeof e !== 'object') { delete s.track.sched[k]; continue; }
      e.gap = Math.min(this.MAX_GAP, Math.max(0, parseInt(e.gap, 10) || 0));
      e.streak = Math.max(0, parseInt(e.streak, 10) || 0);
      if (typeof e.due !== 'string' || this.daysAgo(e.due) == null) e.due = EQ.dayKey();
    }
    if (!Array.isArray(s.parentQuests)) s.parentQuests = [];
    s.parentQuests = s.parentQuests
      .filter(m => m && this.MISSIONS[m.t] && m.day)
      .map(m => ({
        t: m.t,
        day: m.day,
        n: Math.min(EQD.MISSION_LEN, Math.max(0, parseInt(m.n, 10) || 0)),
        done: !!m.done
      }));
    /* a finished mission stays in the list as history for the grown-up, but only the
       most recent handful is worth carrying — the child's list shows the open ones */
    if (s.parentQuests.length > 40) s.parentQuests = s.parentQuests.slice(-40);
  },

  /* ── missions the child still has to play ──
     Oldest first: a mission approved on Monday is played before Tuesday's, so the
     card on the quest list is the one that has been waiting longest. */
  openMissions(s) {
    return (s.parentQuests || []).filter(m => !m.done && this.MISSIONS[m.t]);
  },
  nextMission(s) {
    return this.openMissions(s)[0] || null;
  },
  /* the entry for one approved mission (topic + approval day identify it) */
  findMission(s, topic, day) {
    return (s.parentQuests || []).filter(m => m.t === topic && m.day === day)[0] || null;
  },

  /* today's bucket (created lazily by the recorders, never by the queries) */
  day() {
    const k = EQ.dayKey();
    const days = EQ.s.track.days;
    if (!days[k]) {
      days[k] = { secs: 0, secsQ: 0, secsB: 0, a: 0, c: 0, done: 0, hg: 0, hints: 0, boss: 0, bossWin: 0, subj: {}, topics: {} };
      const keys = Object.keys(days).sort();
      while (keys.length > 70) delete days[keys.shift()];
    }
    return days[k];
  },

  /* remember which quest the day belongs to (title is a plain {az,en,ru} object) */
  stamp(d) {
    if (!d.title) {
      const set = EQ.qset();
      if (set && set.title) d.title = set.title;
    }
  },

  /* ── recorders (called from app.js) ── */
  attempt(q, correct) {
    const d = this.day(); this.stamp(d);
    d.a++; if (correct) d.c++;
    const sj = q.subj || 'math';
    const ss = d.subj[sj] || (d.subj[sj] = { a: 0, c: 0 });
    ss.a++; if (correct) ss.c++;
    const tk = this.topicKey(q);
    if (tk) {
      const ts = d.topics[tk] || (d.topics[tk] = { a: 0, c: 0, h: 0 });
      ts.a++; if (correct) ts.c++;
    }
  },

  hint(q) {
    const d = this.day(); this.stamp(d);
    d.hints++;
    const tk = this.topicKey(q);
    if (tk) {
      const ts = d.topics[tk] || (d.topics[tk] = { a: 0, c: 0, h: 0 });
      ts.h++;
    }
  },

  done(q, hinted) { const d = this.day(); d.done++; if (hinted) d.hg++; },
  bossHit() { this.day().boss++; },
  /* several sets can now be cleared in one day — count them, keep the latest title */
  bossWin() {
    const d = this.day();
    d.bossWin = (d.bossWin || 0) + 1;
    const set = EQ.qset();
    if (set && set.title) d.title = set.title;
  },

  /* ── active play time ──
     Called from the 30s heartbeat, every navigation, visibilitychange and pagehide.
     Attributes the elapsed slice to the screen being left; parent screens don't count. */
  _t: null,
  _vis: true,
  tick() {
    const now = Date.now();
    const last = this._t == null ? now : this._t;
    const wasVis = this._vis !== false;
    this._t = now;
    this._vis = !document.hidden;
    if (!EQ.s || !wasVis) return;
    const dt = (now - last) / 1000;
    if (dt <= 0 || dt > 90) return; /* idle / suspended gap — don't count it */
    const scr = EQ.current || '';
    if (scr.indexOf('parent') === 0) return; /* grown-up time is not play time */
    if (scr === 'restday') return;            /* the pause screen never adds to the limit */
    const d = this.day();
    d.secs += dt;
    if (scr === 'challenge' || scr === 'hint' || scr === 'tutor' || scr === 'success') d.secsQ += dt;
    else if (scr === 'boss' || scr === 'victory') d.secsB += dt;
  },

  /* ── queries (read-only; a missing day stays null) ── */
  lastDays(n, back) {
    back = back || 0;
    const out = [];
    const now = new Date();
    for (let i = n - 1 + back; i >= back; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const k = EQ.dayKey(dt);
      out.push({ k, date: dt, d: (EQ.s.track.days && EQ.s.track.days[k]) || null });
    }
    return out;
  },

  minutes(d) { return d ? Math.round((d.secs || 0) / 60) : 0; },

  /* ── the ranges the dashboard offers ──
     Every one is a whole number of days ending today, and each is compared against the
     same span immediately before it, so "vs the period before" always means a like-for-
     like window. 30 days is the longest offered because day buckets are pruned at 70
     (see day()), which leaves a 30-day range room for its own comparison period. */
  RANGES: [
    { key: 'week', days: 7, group: 1 },
    { key: 'fort', days: 14, group: 2 },
    { key: 'month', days: 30, group: 5 }
  ],

  range(key) {
    return this.RANGES.filter(r => r.key === key)[0] || this.RANGES[0];
  },

  /* the range after this one, wrapping — the picker is a cycle, not a menu */
  nextRange(key) {
    const i = this.RANGES.indexOf(this.range(key));
    return this.RANGES[(i + 1) % this.RANGES.length].key;
  },

  /* minutes over one whole range; `back` counts ranges backwards (1 = the period before) */
  rangeMins(key, back) {
    const n = this.range(key).days;
    return this.lastDays(n, (back || 0) * n).reduce((t, x) => t + this.minutes(x.d), 0);
  },

  weekMins(weeksBack) {
    return this.lastDays(7, (weeksBack || 0) * 7).reduce((t, x) => t + this.minutes(x.d), 0);
  },

  sumDays(n, field) {
    return this.lastDays(n).reduce((t, x) => t + ((x.d && x.d[field]) || 0), 0);
  },

  /* ── chart buckets ──
     A 30-day chart drawn as 30 bars is a picket fence on a phone, so longer ranges are
     grouped into equal blocks of days (5 for a month → 6 bars). The last block always
     ends today; a one-day block keeps the weekday letter, a wider one gets a date span. */
  buckets(key) {
    const r = this.range(key);
    const days = this.lastDays(r.days);
    if (r.group <= 1) return days.map(x => ({ mins: this.minutes(x.d), date: x.date, k: x.k, span: 1 }));
    const out = [];
    for (let i = 0; i < days.length; i += r.group) {
      const block = days.slice(i, i + r.group);
      out.push({
        mins: block.reduce((t, x) => t + this.minutes(x.d), 0),
        date: block[block.length - 1].date,
        from: block[0].date,
        k: block[block.length - 1].k,
        span: block.length
      });
    }
    return out;
  },

  /* the label under one bar: a weekday letter for a single day, else the block's end date */
  bucketLabel(b) {
    return b.span > 1 ? String(b.date.getDate()) : this.dayLetter(b.date);
  },

  subjStats(n) {
    const out = {};
    this.lastDays(n).forEach(x => {
      if (!x.d || !x.d.subj) return;
      for (const k in x.d.subj) {
        const o = out[k] || (out[k] = { a: 0, c: 0 });
        o.a += x.d.subj[k].a; o.c += x.d.subj[k].c;
      }
    });
    return out;
  },

  topicStats(n) {
    const out = {};
    this.lastDays(n).forEach(x => {
      if (!x.d || !x.d.topics) return;
      for (const k in x.d.topics) {
        const o = out[k] || (out[k] = { a: 0, c: 0, h: 0 });
        o.a += x.d.topics[k].a || 0; o.c += x.d.topics[k].c || 0; o.h += x.d.topics[k].h || 0;
      }
    });
    return out;
  },

  /* first-try accuracy per 7-day bucket, oldest → newest */
  weeklyAcc(weeks) {
    const out = [];
    for (let w = weeks - 1; w >= 0; w--) {
      let a = 0, c = 0;
      this.lastDays(7, w * 7).forEach(x => { if (x.d) { a += x.d.a || 0; c += x.d.c || 0; } });
      out.push({ a, c, rate: a > 0 ? c / a : null });
    }
    return out;
  },

  /* ── formatting ── */
  fmtMin(mins) {
    const u = TX({ az: ['s', 'd'], en: ['h', 'm'], ru: ['ч', 'м'] });
    if (mins >= 60) return Math.floor(mins / 60) + u[0] + ' ' + String(mins % 60).padStart(2, '0') + u[1];
    return mins + u[1];
  },

  dayLetter(date) {
    return TX({
      az: ['B', 'BE', 'ÇA', 'Ç', 'CA', 'C', 'Ş'],
      en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      ru: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С']
    })[date.getDay()];
  },

  dayBadge(date) {
    return TX({
      az: ['BAZ', 'B.E', 'Ç.A', 'ÇƏR', 'C.A', 'CÜM', 'ŞƏN'],
      en: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      ru: ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
    })[date.getDay()];
  },

  /* ── adaptive difficulty ────────────────────────────────────────────────────
     Everything above this line watches the child play. This is the part that lets
     what it saw change what comes next, which is the whole difference between a
     question booklet and a teacher: a booklet asks page 4 after page 3 no matter
     how page 3 went.

     Two forces decide tomorrow's five questions.

     WEAKNESS. Every topic carries a mastery score in [0,1] built from first-try
     accuracy and how often a hint was needed. A topic the child misses or leans on
     hints for scores low and is asked more often; a topic answered cleanly scores
     high and steps back. Recent days count for more than old ones (RECENCY_HALFLIFE),
     so a topic that has been fixed stops being punished for how it went two weeks ago
     — and one that has quietly decayed is caught before it becomes a wall.

     SPACING. A topic answered correctly is not finished, it is scheduled. It comes
     back after a gap that grows with each clean pass — 3 days, then 6, then 12, capped
     at MAX_GAP — which is the spacing effect: the review that lands just as recall
     starts to fade is worth several that land while it is still fresh. The 3-day first
     gap is the floor deliberately: sooner is wasted effort for a six-year-old, later
     and the first pass has usually gone. A wrong answer cancels the schedule and the
     topic is due again immediately, because a lapse means the interval was too long.

     What the two forces cannot do is make the day unrecognisable. A child who finds
     subtraction hard must not get five subtraction questions — that is a worksheet,
     and it is how a child learns that the game punishes being bad at something. So the
     plan below guarantees variety: MAX_REPEAT caps any one topic, and every topic in
     the rotation keeps appearing. Adaptivity here changes the *mix*, never the menu. */

  /* how long a day's evidence keeps half its weight (days) */
  RECENCY_HALFLIFE: 8,
  /* the window of play the mastery score is computed over (days) */
  MASTERY_WINDOW: 28,
  /* the smallest number of weighted attempts before a score is trusted at full strength */
  CONFIDENCE_N: 4,
  /* spaced repetition: first gap after a clean pass, then each gap multiplies */
  FIRST_GAP: 3,
  GAP_GROWTH: 2,
  MAX_GAP: 21,
  /* no topic may take more than this many of the five daily slots */
  MAX_REPEAT: 2,
  /* mastery at or below this is "weak"; at or above it is "solid" */
  WEAK_AT: 0.55,
  SOLID_AT: 0.8,

  /* how many days ago a day key was; null for anything unparseable */
  daysAgo(key, from) {
    const p = String(key || '').split('-');
    if (p.length !== 3) return null;
    const d = new Date(+p[0], +p[1] - 1, +p[2]);
    if (isNaN(d.getTime())) return null;
    const now = from || new Date();
    const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const b = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((a - b) / 86400000);
  },

  /* a day key `n` days from today, which is how a due date is stored */
  dayKeyIn(n) {
    const t = new Date();
    return EQ.dayKey(new Date(t.getFullYear(), t.getMonth(), t.getDate() + (n || 0)));
  },

  /* ── mastery ──
     Weighted first-try accuracy, with hints counted as partial misses: a child who
     answers correctly but needed the hint every time has not mastered the topic, and
     a score built on correctness alone would say they had. Returns one entry per topic
     in TOPICS, always — a topic never played yet scores null (unknown), not zero,
     because "never tried" and "always wrong" must not be treated the same. */
  mastery() {
    const out = {};
    for (const k in this.TOPICS) out[k] = { w: 0, score: null, a: 0, c: 0, h: 0 };
    const days = (EQ.s.track && EQ.s.track.days) || {};
    const now = new Date();
    for (const key in days) {
      const ago = this.daysAgo(key, now);
      if (ago == null || ago < 0 || ago >= this.MASTERY_WINDOW) continue;
      const topics = days[key].topics || {};
      const w = Math.pow(0.5, ago / this.RECENCY_HALFLIFE);
      for (const t in topics) {
        if (!out[t]) continue;
        const st = topics[t];
        const a = st.a || 0;
        if (a <= 0) continue;
        const c = st.c || 0;
        /* a hint is half a miss, and never drags one attempt below zero credit */
        const credit = Math.max(0, c - 0.5 * Math.min(st.h || 0, a));
        out[t].w += w * a;
        out[t].raw = (out[t].raw || 0) + w * credit;
        out[t].a += a; out[t].c += c; out[t].h += st.h || 0;
      }
    }
    for (const k in out) {
      const o = out[k];
      if (o.w <= 0) continue;
      const rate = (o.raw || 0) / o.w;
      /* thin evidence is pulled toward the middle rather than believed outright, so
         one unlucky miss on a new topic doesn't brand it as the child's weakest */
      const conf = Math.min(1, o.w / this.CONFIDENCE_N);
      o.score = rate * conf + 0.5 * (1 - conf);
      o.rate = rate;
    }
    return out;
  },

  /* ── the spaced-repetition schedule ──
     `s.track.sched[topic] = { due: dayKey, gap: days, streak: clean passes }`.
     A topic with no entry is due now — it has never been scheduled, so it should be
     asked. Written by review() below as answers come in. */
  sched(s) {
    const st = s || EQ.s;
    if (!st.track) this.init(st);
    if (!st.track.sched || typeof st.track.sched !== 'object') st.track.sched = {};
    return st.track.sched;
  },

  /* days until a topic is due; 0 or less means due now, and an unseen topic is due */
  dueIn(topic) {
    const e = this.sched()[topic];
    if (!e || !e.due) return 0;
    const ago = this.daysAgo(e.due);
    return ago == null ? 0 : -ago;
  },

  /* record what one answer does to a topic's schedule.
     Correct and unhinted → the gap grows and the topic goes away for a while.
     Wrong, or leaning on a hint → the schedule collapses back to "due now", because
     the last interval clearly outran what had actually stuck. */
  review(q, correct, hinted) {
    const t = this.topicKey(q);
    if (!t || !this.TOPICS[t]) return;
    const sc = this.sched();
    const e = sc[t] || (sc[t] = { due: EQ.dayKey(), gap: 0, streak: 0 });
    if (correct && !hinted) {
      e.streak = (e.streak || 0) + 1;
      e.gap = Math.min(this.MAX_GAP, e.gap > 0 ? e.gap * this.GAP_GROWTH : this.FIRST_GAP);
      e.due = this.dayKeyIn(e.gap);
    } else {
      e.streak = 0;
      e.gap = 0;
      e.due = EQ.dayKey();
    }
  },

  /* ── priority ──
     One number per topic deciding who gets the day's slots. Higher wins.
     Weak topics outrank due ones, and a topic that is both is the clearest case of
     all — it is failing *and* the schedule agrees it is time. Overdue days add a
     little each, so nothing can be starved out forever by a permanently weaker topic. */
  priority(topic, m) {
    const mm = (m || this.mastery())[topic] || { score: null };
    /* unknown topics sit just under genuinely weak ones: worth asking, not urgent */
    const score = mm.score == null ? 0.5 : mm.score;
    const weakness = 1 - score;
    const overdue = Math.max(0, -this.dueIn(topic));
    const due = this.dueIn(topic) <= 0 ? 1 : 0;
    return weakness * 2 + due * 0.6 + Math.min(overdue, 14) * 0.05;
  },

  /* ── the day's plan ──
     Five topic keys, in the order they will be asked. Weakest-and-due first, but
     never more than MAX_REPEAT of one topic, and the opener is deliberately not the
     child's worst topic — a session that begins with the hardest thing is a session
     a six-year-old quits. So the plan is built by priority and then *arranged*: a
     solid topic opens, the heavy ones sit in the middle, and a solid one closes it.

     Deterministic for a given day and a given history, so re-entering the quest does
     not reshuffle the questions underneath the child. */
  plan(day, n) {
    const size = n || 5;
    const keys = Object.keys(this.TOPICS);
    if (!keys.length) return [];
    const m = this.mastery();
    const ranked = keys
      .map(k => ({ k, p: this.priority(k, m), score: m[k] && m[k].score == null ? 0.5 : m[k].score }))
      .sort((x, y) => (y.p - x.p) || (x.k < y.k ? -1 : 1));

    /* fill the slots by priority, re-queuing each pick with a lowered score so the
       second slot for a topic only comes after every other topic has had its turn */
    const used = {};
    const picked = [];
    const pool = ranked.map(r => ({ k: r.k, p: r.p, n: 0 }));
    while (picked.length < size) {
      let best = null;
      for (const c of pool) {
        if ((used[c.k] || 0) >= this.MAX_REPEAT) continue;
        const eff = c.p - (used[c.k] || 0) * 1.5;
        if (!best || eff > best.eff) best = { c, eff };
      }
      if (!best) break; /* every topic is at its cap — the set is as full as it can be */
      used[best.c.k] = (used[best.c.k] || 0) + 1;
      picked.push(best.c.k);
    }
    /* fewer topics than slots (MAX_REPEAT * topics < size): cycle to fill the rest */
    for (let i = 0; picked.length < size; i++) picked.push(keys[i % keys.length]);

    return this.arrange(picked, m);
  },

  /* ── the plan the child is actually playing ──
     plan() is recomputed from live stats, and those stats change with every answer —
     so asking it twice inside one day can return two different sets. That would swap
     the questions under a child mid-adventure: they answer challenge 3, the topic
     reschedules, and challenge 4 silently becomes a different question than the one
     the set was counting on.

     So the plan is decided once per quest day and stored. Everything the child plays
     reads the stored one; it is recomputed only when the day rolls over (a new
     `questDay`, or the next stage opened early via nextStage). The adaptation from
     today's answers lands on tomorrow's set, which is where it belongs anyway —
     spacing is a between-sessions idea, not a within-session one. */
  todayPlan(day) {
    const s = EQ.s;
    if (!s.track) this.init(s);
    const d = day == null ? (s.questDay || 0) : day;
    const cur = s.track.plan;
    if (cur && cur.day === d && Array.isArray(cur.topics) && cur.topics.length) {
      /* a stored plan naming a topic that no longer exists is rebuilt, not trusted */
      if (cur.topics.every(t => this.TOPICS[t])) return cur.topics.slice();
    }
    const topics = this.plan(d, 5);
    s.track.plan = { day: d, topics: topics.slice() };
    return topics;
  },

  /* called when the quest day advances, so the next set is planned from what the
     child has just done rather than reusing the set they have already played */
  replan(day) {
    const s = EQ.s;
    if (!s.track) this.init(s);
    s.track.plan = null;
    return this.todayPlan(day);
  },

  /* put a confident topic first and last, the demanding ones in between */
  arrange(picked, m) {
    if (picked.length < 3) return picked.slice();
    const mm = m || this.mastery();
    const sc = k => { const v = mm[k] && mm[k].score; return v == null ? 0.5 : v; };
    const rest = picked.slice();
    /* the strongest topic present opens the set */
    let bi = 0;
    for (let i = 1; i < rest.length; i++) if (sc(rest[i]) > sc(rest[bi])) bi = i;
    const opener = rest.splice(bi, 1)[0];
    /* the strongest of what is left closes it, so the child finishes on a win */
    let ci = 0;
    for (let i = 1; i < rest.length; i++) if (sc(rest[i]) > sc(rest[ci])) ci = i;
    const closer = rest.splice(ci, 1)[0];
    return [opener].concat(rest, [closer]);
  },

  /* ── per-question difficulty ──
     The generators take a `hard` flag that widens the number ranges. A topic the
     child has mastered gets the harder variant — otherwise mastery means being asked
     the same easy question forever, which is its own kind of neglect. A weak topic
     always gets the gentler one. */
  hardFor(topic, m) {
    const mm = (m || this.mastery())[topic];
    return !!(mm && mm.score != null && mm.score >= this.SOLID_AT);
  },

  /* ── what the grown-up is told ──
     The dashboard already names weak topics. This says what the app *did* about them,
     because an adaptive system the parent cannot see looks exactly like a random one. */
  adaptSummary() {
    const m = this.mastery();
    const weak = [], solid = [], due = [];
    for (const k in this.TOPICS) {
      const s = m[k] && m[k].score;
      if (s == null) continue;
      if (s <= this.WEAK_AT) weak.push(k);
      else if (s >= this.SOLID_AT) solid.push(k);
      if (this.dueIn(k) <= 0 && this.sched()[k]) due.push(k);
    }
    return { mastery: m, weak, solid, due };
  },

  /* ── recommendation engine (screen 26) ──
     Priority: topics the child struggles with (missed first tries + hints per attempt),
     then the least practised topics as gentle growth suggestions. */
  recommend() {
    const stats = this.topicStats(42);
    const skips = (EQ.session && EQ.session.recSkips) || [];
    const list = Object.keys(this.TOPICS)
      .filter(k => skips.indexOf(k) === -1)
      .map(k => {
        const st = stats[k] || { a: 0, c: 0, h: 0 };
        const rough = (st.a - st.c) + st.h;
        return { k, st, tried: st.a, struggle: (st.a >= 2 && rough / st.a >= 0.34) ? rough / st.a : 0 };
      })
      .sort((x, y) => (y.struggle - x.struggle) || (x.tried - y.tried));
    return list;
  },

  /* ── Questy's observation for the progress screen ── */
  insight(s) {
    let a = 0, c = 0, hints = 0, hg = 0;
    this.lastDays(7).forEach(x => { if (x.d) { a += x.d.a || 0; c += x.d.c || 0; hints += x.d.hints || 0; hg += x.d.hg || 0; } });
    if (a === 0) return TX({
      az: `İlk sessiyadan sonra Questy-nin müşahidələri burada görünəcək.`,
      en: `After the first session, Questy's observations will appear here.`,
      ru: `После первого занятия здесь появятся наблюдения Квести.`
    });
    if (hints > 0 && hg > 0) return TX({
      az: `${s.heroName} ipucu istəyir və ondan sonra düz cavab verir — bu, yaxşı vərdişdir, narahatlıq üçün səbəb deyil.`,
      en: `${s.heroName} asks for hints and gets it right after — that is a good habit, not a red flag.`,
      ru: `${s.heroName} просит подсказку и после неё отвечает верно — это хорошая привычка, а не тревожный сигнал.`
    });
    if (c / a >= 0.8) return TX({
      az: `${s.heroName} sınaqların ${Math.round(c / a * 100)} faizini ilk cəhddə həll edir — çox sabit gedişdir.`,
      en: `${s.heroName} solves ${Math.round(c / a * 100)}% of challenges on the first try — a very steady pace.`,
      ru: `${s.heroName} решает ${Math.round(c / a * 100)}% испытаний с первой попытки — очень стабильный темп.`
    });
    const worst = this.recommend()[0];
    const tn = worst && worst.tried ? TX(this.TOPICS[worst.k].name) : null;
    return tn ? TX({
      az: `«${tn}» mövzusu hələ tam oturmayıb — qısa təkrar məşqlər kömək edəcək.`,
      en: `“${tn}” hasn't fully settled yet — short repeat practice will help.`,
      ru: `Тема «${tn}» ещё не закрепилась — помогут короткие повторные тренировки.`
    }) : TX({
      az: `${s.heroName} öz tempində irəliləyir — davamlılıq ən vacib göstəricidir.`,
      en: `${s.heroName} is moving at ${EQ.pron()} own pace — consistency is what matters most.`,
      ru: `${s.heroName} движется в своём темпе — главное здесь постоянство.`
    });
  }
};
