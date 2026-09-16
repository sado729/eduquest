/* EduQuest — child profiles.
   One device, several children: every child owns a full copy of the game state under its
   own localStorage key, so progress, streaks, settings and tracking never mix. The index
   below only remembers which profiles exist and who is playing right now.
   The first child keeps the original single-profile key, so an adventure that started
   before profiles existed is never copied or migrated — it simply becomes child 1. */

const EQP_INDEX_KEY = 'eduquest_profiles_v1';
const EQP_STATE_KEY = 'eduquest_state_v2';
const EQP_MAX = 4;

const EQP = {
  ids: ['p1'],
  active: 'p1',

  /* storage key of one profile (p1 === the pre-profiles key) */
  key(id) {
    id = id || this.active;
    return id === 'p1' ? EQP_STATE_KEY : EQP_STATE_KEY + '_' + id;
  },

  load() {
    let x = null;
    try { x = JSON.parse(localStorage.getItem(EQP_INDEX_KEY)); } catch (e) { /* first run */ }
    const ids = ((x && Array.isArray(x.ids)) ? x.ids : [])
      .filter(id => typeof id === 'string' && /^p[0-9]+$/.test(id))
      .slice(0, EQP_MAX);
    this.ids = ids.length ? ids : ['p1'];
    this.active = this.ids.indexOf(x && x.active) >= 0 ? x.active : this.ids[0];
  },
  save() {
    try { localStorage.setItem(EQP_INDEX_KEY, JSON.stringify({ v: 1, active: this.active, ids: this.ids })); } catch (e) { /* private mode */ }
  },

  full() { return this.ids.length >= EQP_MAX; },

  nextId() {
    for (let n = 1; n <= EQP_MAX + 1; n++) {
      const id = 'p' + n;
      if (this.ids.indexOf(id) === -1) return id;
    }
    return 'p' + (Date.now() % 100000);
  },

  /* read another child's stored state without disturbing the one that is playing */
  peek(id) {
    if (id === this.active && EQ.s) return EQ.s;
    let s = null;
    try { s = JSON.parse(localStorage.getItem(this.key(id))); } catch (e) { /* unreadable */ }
    return s || {};
  },

  list() {
    return this.ids.map(id => ({ id, s: this.peek(id), active: id === this.active }));
  },

  /* a profile that never finished the first run has no hero name yet */
  label(s) {
    return (s && s.heroName && s.onboarded) ? s.heroName : TX({ az: 'Yeni qəhrəman', en: 'New hero', ru: 'Новый герой' });
  },

  /* last-7-days play minutes read straight from one profile's own tracking data */
  weekMins(s) {
    const days = (s && s.track && s.track.days) || null;
    if (!days) return 0;
    let secs = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = days[EQ.dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i))];
      if (d) secs += d.secs || 0;
    }
    return Math.round(secs / 60);
  },

  /* park the child who is playing now, then bring another one in */
  swap(id) {
    EQT.tick();
    if (EQ.s) EQ.save();
    this.active = id;
    this.save();
    EQ.session.q = null; EQ.session.qIdx = -1; EQ.session.gateInput = '';
    EQ.session.recSkips = []; EQ.session.streakRow = 0;
    EQ.load();
    EQI.set(EQ.s.settings.lang || 'az');
    EQ.applyCalm();
  },

  /* new child: a clean state, opened in the language the grown-up is already reading */
  add(lang) {
    if (this.full()) return null;
    const id = this.nextId();
    try { localStorage.removeItem(this.key(id)); } catch (e) { /* private mode */ }
    this.ids.push(id);
    this.swap(id);
    if (lang && EQI.langs.indexOf(lang) >= 0) { EQ.s.settings.lang = lang; EQI.set(lang); }
    EQ.save();
    return id;
  },

  remove(id) {
    if (this.ids.length <= 1 || this.ids.indexOf(id) === -1) return false;
    if (id === this.active) {
      /* move out first: nothing must re-save the state we are about to erase */
      this.active = this.ids.filter(x => x !== id)[0];
      EQ.session.q = null; EQ.session.qIdx = -1;
      EQ.load();
      EQI.set(EQ.s.settings.lang || 'az');
      EQ.applyCalm();
    }
    this.ids = this.ids.filter(x => x !== id);
    this.save();
    try { localStorage.removeItem(this.key(id)); } catch (e) { /* private mode */ }
    return true;
  }
};
