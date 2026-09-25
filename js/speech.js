/* EduQuest — Questy reads the questions aloud (settings.readAloud)

   Why this file exists: the parent settings carried a "Read questions aloud" switch that
   was on by default and did nothing — it was saved and carried in a transfer code, and
   no line of code ever spoke. The grown-up believed a child who cannot read yet was
   being read to. This is the voice behind that switch, and nothing else.

   It uses only the browser's own speech (window.speechSynthesis): no server, no audio
   files, so it works offline and in the Android TWA (Chrome) the same as in the PWA.

   The rules it keeps:
     · A question is read when its screen opens (challenge — which also serves missions
       and region rounds — and the boss). Hint and tutor are read only on a tap of the
       little speaker, never on their own.
     · The answer choices are never read. For the numbers it only makes the question
       three times longer; for letters it is the answer — hear "B, D, K" read in order
       and a child can pick the second button without recognising a single letter.
     · A reading question (Söz Vadisi) never speaks what the child is meant to read:
       the word on the card, the words on a pairing board, the spelling of a word being
       built. Every reading explanation states the answer in words, so in that region the
       tutor reads its heading and its "why", never the explanation itself.
     · Only a voice of the game's own language is used. No Azerbaijani voice on the
       device means Questy stays quiet and the setting says so — a Turkish voice would
       read ə, x and q with Turkish sounds, and in a region that teaches the sounds of
       the letters, a wrong sound is worse than none.
     · Leaving the screen, the rest screen, a hidden tab and switching it off all stop
       the voice at once. Calm mode reads slower and softer.
     · No speech API, no voices: every call is a quiet no-op. */

const EQV = {
  /* the region each language's voice should come from, when the device offers a choice */
  PREFER: { az: ['az-az'], en: ['en-us', 'en-gb'], ru: ['ru-ru'] },
  /* screens that read their question the moment they open */
  AUTO: ['challenge', 'boss'],
  /* screens with a speaker button (the question screens plus hint and tutor) */
  BUTTON: ['challenge', 'boss', 'hint', 'tutor'],

  voices: [],
  ready: false, /* the voice list has had its chance to load (Chrome fills it async) */
  seq: 0,       /* bumped by every stop, so a delayed start from an old screen dies */
  speaking: false,
  lastKey: null,

  api() {
    try {
      const w = typeof window !== 'undefined' ? window : null;
      if (!w || !w.speechSynthesis || typeof w.SpeechSynthesisUtterance !== 'function') return null;
      return w.speechSynthesis;
    } catch (e) { return null; }
  },

  init() {
    const a = this.api();
    if (!a) { this.ready = true; return; }
    const load = () => {
      let v = [];
      try { v = a.getVoices() || []; } catch (e) { v = []; }
      this.voices = Array.prototype.slice.call(v);
      if (this.voices.length) this.ready = true;
    };
    load();
    const changed = () => {
      load();
      this.ready = true;
      /* the settings subtitle depends on the list: redraw it once the voices arrive */
      if (typeof EQ !== 'undefined' && EQ.current === 'parent_settings') EQ.render();
    };
    try {
      if (a.addEventListener) a.addEventListener('voiceschanged', changed);
      else a.onvoiceschanged = changed;
    } catch (e) { /* an engine without the event: the timeout below decides */ }
    /* some engines never fire voiceschanged; after a moment an empty list is the answer */
    setTimeout(() => { if (!this.ready) { load(); this.ready = true; } }, 2000);
  },

  norm(tag) { return String(tag || '').replace(/_/g, '-').toLowerCase(); },

  /* the best voice for a language, or null — never a voice of another language */
  voiceFor(lang) {
    const pre = this.PREFER[lang] || [];
    const mine = this.voices.filter(v => this.norm(v.lang).split('-')[0] === lang);
    if (!mine.length) return null;
    const score = v => (v.localService ? 4 : 0) /* offline-first: a network voice dies without Wi-Fi */
      + (pre.indexOf(this.norm(v.lang)) >= 0 ? 2 : 0)
      + (v.default ? 1 : 0);
    return mine.slice().sort((a, b) => score(b) - score(a))[0];
  },

  /* 'ok' | 'novoice' | 'noapi' | 'loading' for the active language */
  status() {
    if (!this.api()) return 'noapi';
    if (this.voiceFor(EQI.lang)) return 'ok';
    return this.ready ? 'novoice' : 'loading';
  },
  on() { return !!(EQ.s && EQ.s.settings && EQ.s.settings.readAloud); },
  can() { return this.on() && this.status() === 'ok'; },

  /* HTML → something a voice can say: tags out (<br> becomes a pause), entities decoded,
     emoji removed, and CAPITAL WORDS lowered so BALIQ is read as a word, not spelled */
  clean(html) {
    let t = String(html == null ? '' : html);
    /* a line break is a pause — unless the line already ended on its own punctuation */
    t = t.replace(/([,;:.!?…])?\s*<br\s*\/?>\s*/gi, (m, p) => (p ? p + ' ' : '. ')).replace(/<[^>]*>/g, ' ');
    const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–' };
    t = t.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
      if (e[0] === '#') {
        const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        try { return String.fromCodePoint(n); } catch (_) { return ' '; }
      }
      const k = e.toLowerCase();
      return named[k] != null ? named[k] : m;
    });
    t = t.replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}︎️‍⃣]/gu, '');
    const loc = { az: 'az', en: 'en', ru: 'ru' }[EQI.lang] || 'en';
    t = t.replace(/[\p{Lu}]{2,}/gu, w => w.toLocaleLowerCase(loc));
    t = t.replace(/\s+([.,!?;:])/g, '$1').replace(/\s+/g, ' ').trim();
    return t.replace(/^[.,;:\s]+/, '');
  },

  /* ── what a screen says ── */
  reading(q) { return !!q && q.subj === 'reading'; },

  /* words a reading question must never say aloud, in the active language */
  hush(q) {
    if (!this.reading(q) || !q.hush) return [];
    return q.hush.map(h => TX(h)).filter(Boolean);
  },

  /* whole-word, case-blind: does this spoken line contain any of the hushed words? */
  leaks(line, hush) {
    if (!hush.length) return false;
    const loc = { az: 'az', en: 'en', ru: 'ru' }[EQI.lang] || 'en';
    const words = s => ' ' + String(s).toLocaleLowerCase(loc).normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim() + ' ';
    const hay = words(line);
    return hush.some(h => { const w = words(h); return w.trim() && hay.indexOf(w) >= 0; });
  },

  lines(screen, q) {
    if (!q) return [];
    const out = [];
    if (screen === 'challenge' || screen === 'boss') out.push(TX(q.title));
    else if (screen === 'hint' && q.hint) out.push(TX(q.hint.heading), TX(q.hint.sub), TX(q.hint.note));
    else if (screen === 'tutor') {
      const ex = q.explain || { title: { az: 'Gəl bunu birlikdə həll edək.', en: 'Let’s figure this out together.', ru: 'Давай разберёмся вместе.' }, text: q.hint && q.hint.sub };
      out.push(TX(ex.title));
      /* every reading explanation spells out the answer ("the gap needs the letter L") */
      if (!this.reading(q)) out.push(TX(ex.text));
      if (EQ.session.tutorWhy && ex.why) out.push(TX(ex.why));
    }
    const hush = this.hush(q);
    return out.map(x => this.clean(x)).filter(x => x && !this.leaks(x, hush));
  },

  /* ── speaking ── */
  stop() {
    this.seq++;
    this.speaking = false;
    this.duck();
    const a = this.api();
    if (a) { try { a.cancel(); } catch (e) { /* nothing to stop */ } }
  },

  say(text, force) {
    const a = this.api();
    const t = this.clean(text);
    this.stop();
    if (!a || !t || (!force && !this.on())) return false;
    const v = this.voiceFor(EQI.lang);
    if (!v) return false;
    const calm = !!(EQ.s && EQ.s.settings.calm);
    const my = this.seq;
    /* Chrome on Android can drop an utterance queued in the same tick as cancel() */
    setTimeout(() => {
      if (my !== this.seq) return; /* the screen changed while we waited */
      try {
        const u = new window.SpeechSynthesisUtterance(t);
        u.voice = v;
        u.lang = v.lang; /* set both: some Android builds ignore .voice and go by .lang */
        u.rate = calm ? 0.78 : 0.92;
        u.pitch = calm ? 1.0 : 1.1;
        u.volume = calm ? 0.75 : 1;
        u.onend = u.onerror = () => { if (my === this.seq) { this.speaking = false; this.duck(); this.paintBtn(); } };
        if (a.paused) a.resume();
        a.speak(u);
        this.speaking = true;
        this.duck();
        this.paintBtn();
      } catch (e) { this.speaking = false; }
    }, 60);
    return true;
  },

  /* the forest music steps back while a question is being read (js/sound.js) */
  duck() { if (typeof EQM !== 'undefined') EQM.duck(this.speaking); },

  /* read what the current screen says */
  read(screen) {
    const ls = this.lines(screen || EQ.current, EQ.session.q);
    return ls.length ? this.say(ls.join(' ')) : false;
  },

  /* the speaker button: tap to hear it, tap again to hush */
  tap() {
    if (this.speaking) { this.stop(); this.paintBtn(); return; }
    this.read();
  },

  /* called by the router after every navigation */
  route(from, to) {
    const key = to + '|' + (EQ.session.qKey || '') + '|' + (EQ.session.qIdx) + '|' + (EQ.session.q && TX(EQ.session.q.title));
    const same = from === to && key === this.lastKey;
    this.lastKey = key;
    if (same) return; /* a redraw of the same question keeps talking */
    this.stop();
    if (this.AUTO.indexOf(to) >= 0 && this.can()) this.read(to);
  },

  /* the parent just switched it on: let them hear what the child will hear */
  sample() {
    return this.say(TX({ az: 'Salam! Mən Questy-yəm. Sualları sənə oxuyacağam.', en: 'Hi! I’m Questy. I’ll read the questions to you.', ru: 'Привет! Я Квести. Я буду читать тебе вопросы.' }));
  },

  /* the honest subtitle under the parent switch */
  note() {
    const st = this.status();
    if (st === 'noapi') return { bad: true, text: TX({ az: 'Bu brauzer səsli oxumanı dəstəkləmir', en: 'This browser cannot read aloud', ru: 'Этот браузер не умеет читать вслух' }) };
    if (st === 'novoice') return { bad: true, text: TX({ az: 'Bu cihazda Azərbaycan səsi yoxdur — Questy susacaq', en: 'No English voice on this device — Questy stays quiet', ru: 'На этом устройстве нет русского голоса — Квести промолчит' }) };
    return { bad: false, text: TX({ az: 'Questy hər sualı səsləndirir', en: 'Questy voices every question', ru: 'Квести озвучивает каждый вопрос' }) };
  },

  /* ── the speaker button ── */
  btn(dark) {
    if (!this.can()) return '';
    const bg = dark ? 'rgba(255,255,255,0.14)' : '#E4F6FF';
    const fg = dark ? '#fff' : '#2196C9';
    return `<div class="press" id="eqv-btn" onclick="EQV.tap()" aria-label="${TX({ az: 'Səsli oxu', en: 'Read aloud', ru: 'Прочитать вслух' })}" style="margin-left:auto;width:34px;height:34px;border-radius:12px;background:${bg};display:flex;align-items:center;justify-content:center;flex:none;position:relative">
      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 9 h4 l5-4 v14 l-5-4 H4 Z" fill="${fg}"></path><path id="eqv-wave" d="M16 8.5 a4.5 4.5 0 0 1 0 7 M18.5 6 a8 8 0 0 1 0 12" stroke="${fg}" stroke-width="2" fill="none" stroke-linecap="round" opacity="${this.speaking ? 1 : 0.55}"></path></svg>
    </div>`;
  },
  paintBtn() {
    try {
      const w = document.getElementById('eqv-wave');
      if (w) w.setAttribute('opacity', this.speaking ? '1' : '0.55');
    } catch (e) { /* no DOM */ }
  }
};
