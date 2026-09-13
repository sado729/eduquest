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

  /* ── state ── */
  init(s) {
    if (!s.track || typeof s.track !== 'object') s.track = {};
    if (!s.track.days || typeof s.track.days !== 'object') s.track.days = {};
    if (!s.track.start) s.track.start = EQ.dayKey();
    if (!Array.isArray(s.parentQuests)) s.parentQuests = [];
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

  weekMins(weeksBack) {
    return this.lastDays(7, (weeksBack || 0) * 7).reduce((t, x) => t + this.minutes(x.d), 0);
  },

  sumDays(n, field) {
    return this.lastDays(n).reduce((t, x) => t + ((x.d && x.d[field]) || 0), 0);
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
