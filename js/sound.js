/* EduQuest — everything the game sounds like: the effect cues (SFX) and the forest
   music (EQM). Two parent switches, and they are separate on purpose:

     · settings.sfx   — the taps, the right/wrong chimes, the fanfares
     · settings.music — a quiet forest melody under the adventure

   Why this file exists: the parent settings used to show "Music · Forest theme · 40%"
   when the game had no music at all — the switch actually silenced the effect cues. A
   grown-up turning the "music" off was switching every sound off, and one leaving it on
   was promised a melody that never played. Both are real now, and each does only what
   its own line says.

   There are no audio files. The melody is a handful of notes played by the same tiny
   WebAudio synth as the effects, so it is offline, weighs nothing, and cannot fail to
   download. The rules it keeps:
     · 40% means 40%: the music bus sits at 0.4 of the effect cues' loudness (0.2 in calm
       mode, which also slows it down). The subtitle under the switch says which.
     · Nothing plays before the first touch — browsers refuse sound until a gesture, and
       a context made before one would only sit there suspended.
     · The rest screen is silent: Questy is saying goodnight, not playing a tune over it.
       A hidden tab or a locked phone is silent too, and so is anything with the switch
       off — and when nothing is playing, the audio context is suspended, so a quiet
       game costs the battery nothing.
     · The melody steps back while Questy reads a question aloud (js/speech.js).
     · One wake-up per phrase (~6 s): the notes of a phrase are handed to the audio
       clock at once, never ticked by a timer. */

/* ── tiny synth — every cue has a silent visual twin ── */
const SFX = {
  ctx: null,
  ac() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } }
    return this.ctx;
  },
  off() { return !EQ.s.settings.sfx; },
  /* calm mode: "softer sounds" — the cues play at half their loudness */
  soft() { return EQ.s && EQ.s.settings.calm ? 0.5 : 1; },
  note(freq, at, dur, type, vol, dest) {
    const c = this.ac(); if (!c) return;
    try { /* a sound that cannot play must never stop the game */
      if (c.state === 'suspended' && c.resume) c.resume();
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      const t = c.currentTime + at;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime((vol || 0.07) * (dest ? 1 : this.soft()), t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest || c.destination);
      o.start(t); o.stop(t + dur + 0.05);
      if (!dest) this.busy = Math.max(this.busy || 0, t + dur + 0.1); /* a cue still ringing */
    } catch (e) { return; }
    if (!dest) this.sleep();
  },
  /* no melody and no cue still sounding → suspend the context, so the audio hardware
     (and the battery) rests between taps instead of idling on a silent stream */
  sleep() {
    clearTimeout(this.nap);
    this.nap = setTimeout(() => {
      const c = this.ctx;
      if (!c || !c.suspend || c.state !== 'running') return;
      if (typeof EQM !== 'undefined' && EQM.playing) return;
      if (c.currentTime < (this.busy || 0)) return this.sleep();
      try { c.suspend(); } catch (e) { /* fine */ }
    }, 1500);
  },
  correct() { if (this.off()) return; this.note(523, 0, 0.22); this.note(659, 0.12, 0.3); this.note(1046, 0.2, 0.18, 'sine', 0.03); },
  wrong() { if (this.off()) return; this.note(220, 0, 0.16, 'triangle', 0.06); this.note(196, 0.14, 0.22, 'triangle', 0.05); },
  tap() { if (this.off()) return; this.note(660, 0, 0.06, 'sine', 0.025); },
  fanfare() { if (this.off()) return; [523, 659, 784, 1046].forEach((f, i) => this.note(f, i * 0.11, 0.32, 'sine', 0.06)); }
};

/* ── the forest melody ── */
const EQM = {
  VOL: 0.4,       /* of the effect cues' loudness — the "40%" in the settings */
  CALM: 0.5,      /* calm mode halves it again (→ 20%) */
  DUCK: 0.35,     /* while Questy is reading a question aloud */
  BPM: 80, BPM_CALM: 66,
  /* screens where the music never plays */
  QUIET: ['restday'],
  /* C-major pentatonic over C · Am · F · G — nothing in it can clash, and nothing in it
     is catchy enough to hum over a sum. [midi, beats]; 0 is a rest. Each phrase is 8 beats. */
  TUNE: [
    { m: [[76, 1], [79, 1], [81, 1], [79, 1], [76, 1], [74, 1], [72, 2]], b: [[48, 4], [43, 4]] },
    { m: [[74, 1], [76, 1], [79, 2], [81, 1], [79, 1], [76, 2]], b: [[45, 4], [40, 4]] },
    { m: [[81, 1], [84, 1], [81, 1], [79, 1], [0, 1], [76, 1], [74, 2]], b: [[41, 4], [48, 4]] },
    { m: [[72, 1], [74, 1], [76, 1], [79, 1], [76, 1], [74, 1], [72, 2]], b: [[43, 4], [48, 4]] }
  ],

  unlocked: false, /* a touch has happened, so the browser will let us play */
  playing: false,
  ducked: false,
  bus: null,       /* the gain node the melody runs through */
  timer: null,
  phrase: 0,
  next: 0,         /* audio-clock time the next phrase starts at */
  gen: 0,          /* bumped by every stop, so a late timer from an old run dies */

  hz(m) { return 440 * Math.pow(2, (m - 69) / 12); },
  s() { return (typeof EQ !== 'undefined' && EQ.s && EQ.s.settings) || {}; },
  hidden() { return typeof document !== 'undefined' && !!document.hidden; },

  /* should the melody be playing right now? */
  want() {
    const st = this.s();
    if (!this.unlocked || !st.music || this.hidden()) return false;
    const cur = typeof EQ !== 'undefined' ? EQ.current : null;
    return this.QUIET.indexOf(cur) === -1;
  },
  /* the bus level the melody should sit at */
  level() {
    const st = this.s();
    return this.VOL * (st.calm ? this.CALM : 1) * (this.ducked ? this.DUCK : 1);
  },
  bpm() { return this.s().calm ? this.BPM_CALM : this.BPM; },

  /* wired once at boot: the first touch anywhere unlocks sound */
  init() {
    if (typeof document === 'undefined' || !document.addEventListener) return;
    const go = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      const c = SFX.ac();
      if (c && c.state === 'suspended' && c.resume) { try { c.resume(); } catch (e) { /* still locked */ } }
      this.update();
    };
    ['pointerdown', 'touchend', 'keydown'].forEach(ev => document.addEventListener(ev, go, { passive: true }));
  },

  /* bring the sound in line with the switches, the screen and the tab — called after
     every navigation, switch, profile swap and visibility change */
  update() {
    if (this.want()) {
      if (!this.playing) this.start();
      else this.ramp(this.level(), 0.6);
    } else if (this.playing) this.stop();
  },

  start() {
    const c = SFX.ac(); if (!c) return;
    if (c.state === 'suspended' && c.resume) { try { c.resume(); } catch (e) { return; } }
    this.gen++;
    this.playing = true;
    this.bus = c.createGain();
    this.bus.gain.setValueAtTime(0.0001, c.currentTime);
    this.bus.connect(c.destination);
    this.ramp(this.level(), 1.5); /* fades in, never starts on a jolt */
    this.phrase = 0;
    this.next = c.currentTime + 0.1;
    this.queue(this.gen);
  },

  /* hand one phrase to the audio clock, then sleep until just before it ends */
  queue(gen) {
    if (gen !== this.gen || !this.playing) return;
    const c = SFX.ac(); if (!c || !this.bus) return;
    const beat = 60 / this.bpm();
    const p = this.TUNE[this.phrase % this.TUNE.length];
    let t = 0;
    p.m.forEach(([m, n]) => {
      if (m) SFX.note(this.hz(m), this.next - c.currentTime + t, n * beat * 0.95, 'sine', 0.07, this.bus);
      t += n * beat;
    });
    let u = 0;
    p.b.forEach(([m, n]) => {
      SFX.note(this.hz(m), this.next - c.currentTime + u, n * beat, 'triangle', 0.05, this.bus);
      u += n * beat;
    });
    this.next += t;
    this.phrase++;
    const wait = Math.max(0.2, this.next - c.currentTime - 0.4);
    this.timer = setTimeout(() => this.queue(gen), wait * 1000);
  },

  stop() {
    this.gen++;
    this.playing = false;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    const c = SFX.ctx, bus = this.bus;
    this.bus = null;
    if (!c || !bus) return;
    try {
      bus.gain.cancelScheduledValues(c.currentTime);
      bus.gain.setTargetAtTime(0.0001, c.currentTime, 0.12);
    } catch (e) { /* already gone */ }
    /* once the fade is done: cut the notes already queued, then let the audio hardware sleep */
    setTimeout(() => { try { bus.disconnect(); } catch (e) { /* fine */ } }, 600);
    SFX.sleep();
  },

  /* Questy is reading aloud (true) or has finished (false) */
  duck(on) {
    if (this.ducked === !!on) return;
    this.ducked = !!on;
    if (this.playing) this.ramp(this.level(), 0.25);
  },

  ramp(to, secs) {
    const c = SFX.ctx; if (!c || !this.bus) return;
    try {
      this.bus.gain.cancelScheduledValues(c.currentTime);
      this.bus.gain.setTargetAtTime(Math.max(0.0001, to), c.currentTime, secs / 3);
    } catch (e) { /* fine */ }
  }
};
