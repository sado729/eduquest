/* EduQuest — hands-on question formats (drag-to-count, pair-matching, put-in-order)

   Why this file exists: every question in the game used to be the same three buttons.
   That is a fine way to *check* an answer and a poor way to *build* one — a six-year-old
   who taps "12" has either counted or guessed, and the game cannot tell which. Dragging
   nine apples into a basket, matching each lantern to its double, or pushing four numbers
   into order all make the child do the thinking with their hands, and leave a trace the
   game can actually read.

   What they share with the old format is everything that matters downstream. A question
   here is still a question object: same tag, same subj, same hint, same explain, same
   `easier`, same spaced-repetition topic. It is still judged once, and it still ends in
   EQ.resolve(), so XP, coins, boss hits, mission steps and the adaptive schedule all
   behave exactly as they do for multiple choice. The only new field is `kind`, which
   tells the play screen to render an interactive panel instead of three buttons.

   The contract a format implements:
     render(q, s)  -> HTML for the answer area (id-namespaced under `eqi-`)
     mount(q)      -> wire up listeners after the HTML is in the DOM; may be omitted
     check(q)      -> called by the format when the child commits; returns true/false
   A format decides *when* the child has committed. Drag-to-count commits when the basket
   is full, pairing when the last pair is joined, ordering when the child presses Done.
   Until then the child may move things around freely: rearranging is not a wrong answer,
   and nothing is recorded until they say they are finished. */

const EQI_FMT = {};
const EQIX = {
  /* the live working state of the panel on screen — rebuilt on every render, never
     saved, because a half-dragged basket is not progress worth restoring */
  st: null,

  /* a format's question is judged exactly once; after that the panel is inert and the
     shared resolve() owns the screen */
  done: false,

  /* listeners a format hung on `document` (the drag panel does), dropped on the way out */
  teardown: null,

  unmount() {
    if (this.teardown) { try { this.teardown(); } catch (_) {} }
    this.teardown = null;
    this.st = null;
  },

  reset() { this.unmount(); this.done = false; },

  fmt(q) { return q && q.kind ? EQI_FMT[q.kind] : null; },

  render(q, s) {
    const f = this.fmt(q);
    if (!f) return '';
    this.st = f.init(q);
    this.done = false;
    return f.render(q, this.st, s);
  },

  /* a format that has already been judged must not accept another answer: the screen
     is re-rendered after a wrong try (the hint screen, then back here), and without
     this a second commit would double-count the attempt. */
  live() { return !this.done; },

  mount(q) {
    const f = this.fmt(q);
    if (f && f.mount && this.st) f.mount(q, this.st);
  },

  /* the single way any format reports a finished answer */
  commit(q, correct, paint) {
    if (this.done) return;
    this.done = true;
    EQ.resolve(correct, paint);
  },

  el(id) { return document.getElementById('eqi-' + id); }
};

/* ── 1 · drag-to-count ────────────────────────────────────────────────────────
   "Put 9 apples in the basket." A tray of loose items, a basket, and a counter that
   ticks up as items land. The child commits by pressing Done, not by reaching the
   target: stopping automatically at the right number would make the basket tell them
   the answer, and a child who dragged seven and thought it was nine should see that
   they were wrong, not be quietly corrected mid-drag.

   Items already in the basket can be dragged back out. Miscounting and fixing it is
   the skill being practised, so the panel never punishes a correction. */
EQI_FMT.drag = {
  init(q) {
    return { placed: [], n: q.drag.total };
  },

  render(q, st) {
    const tray = [];
    for (let i = 0; i < st.n; i++) {
      tray.push(`<div class="eqi-item" data-i="${i}" style="width:44px;height:44px;border-radius:14px;background:${q.drag.color};box-shadow:0 3px 0 rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;font-size:22px;touch-action:none;cursor:grab">${q.drag.icon}</div>`);
    }
    return `<div style="margin-top:14px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="font:700 12px Nunito;color:#A08A5E;flex:1">${TX(q.drag.trayLabel)}</div>
        <div id="eqi-count" style="padding:5px 12px;border-radius:12px;background:#EFE7FF;font:800 15px 'Baloo 2';color:#5B3FD6">0</div>
      </div>
      <div id="eqi-tray" style="min-height:56px;background:#FBE9CC;border-radius:18px;padding:10px;display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start">${tray.join('')}</div>
      <div id="eqi-basket" style="margin-top:12px;min-height:84px;background:#EAF7EF;border:2.5px dashed #7FCFA0;border-radius:20px;padding:10px;display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start;align-items:center;justify-content:center">
        <div id="eqi-hintline" style="font:700 13px Nunito;color:#5AA97B">${TX(q.drag.dropLabel)}</div>
      </div>
      <div id="eqi-done" class="press" style="margin-top:12px;height:56px;border-radius:20px;background:#FFC24B;box-shadow:0 5px 0 #E39B1C;display:flex;align-items:center;justify-content:center;font:800 18px 'Baloo 2';color:#4A3208">${TX(q.drag.doneLabel)}</div>
    </div>`;
  },

  mount(q, st) {
    const tray = EQIX.el('tray'), basket = EQIX.el('basket'), count = EQIX.el('count');
    if (!tray || !basket) return;

    const refresh = () => {
      const n = basket.querySelectorAll('.eqi-item').length;
      if (count) count.textContent = n;
      const hint = EQIX.el('hintline');
      if (hint) hint.style.display = n ? 'none' : 'block';
      st.placed = n;
    };

    /* one pointer drag, written by hand rather than with the HTML5 drag API, which
       does not fire on touch devices — and a tablet is where this game is played */
    let drag = null;
    const onDown = e => {
      const item = e.target.closest ? e.target.closest('.eqi-item') : null;
      if (!item || EQIX.done) return;
      e.preventDefault();
      const r = item.getBoundingClientRect();
      drag = { item: item, dx: e.clientX - r.left, dy: e.clientY - r.top };
      item.style.position = 'fixed';
      item.style.zIndex = '90';
      item.style.left = r.left + 'px';
      item.style.top = r.top + 'px';
      item.style.pointerEvents = 'none';
      if (item.setPointerCapture) { try { item.setPointerCapture(e.pointerId); } catch (_) {} }
    };
    const onMove = e => {
      if (!drag) return;
      drag.item.style.left = (e.clientX - drag.dx) + 'px';
      drag.item.style.top = (e.clientY - drag.dy) + 'px';
    };
    const onUp = e => {
      if (!drag) return;
      const item = drag.item;
      const b = basket.getBoundingClientRect();
      const inBasket = e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
      item.style.position = ''; item.style.zIndex = ''; item.style.left = '';
      item.style.top = ''; item.style.pointerEvents = '';
      const to = inBasket ? basket : tray;
      const moved = item.parentNode !== to;
      to.appendChild(item);
      drag = null;
      refresh();
      /* a chirp only when the apple actually changed place — picking one up and setting
         it straight back down is not an action worth a sound */
      if (moved && typeof SFX !== 'undefined' && SFX.tap) SFX.tap();
    };

    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    EQIX.teardown = () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    const done = EQIX.el('done');
    if (done) done.onclick = () => {
      if (EQIX.done) return;
      const n = basket.querySelectorAll('.eqi-item').length;
      EQIX.commit(q, n === q.correct, () => {
        basket.style.borderColor = n === q.correct ? '#3DBE6E' : '#E8A33D';
        basket.style.background = n === q.correct ? '#DCF5E6' : '#FFF3D6';
      });
    };
    refresh();
  },

  /* the headless answer, for the autotest driver and the test suite */
  solve(q) { return q.correct; }
};

/* ── 2 · pair matching ────────────────────────────────────────────────────────
   "Match each lantern to its double." Two columns; tap one on the left, then one on
   the right, and the pair locks in if it is right. A wrong pair shakes loose and can
   be tried again — the format is a working surface, not a test with three guesses.

   The question is judged on the whole board, once, when the last pair is joined: the
   child is right if they matched everything without a single mis-pair, and wrong the
   moment they join two that do not belong. That is deliberate. A format where the
   child can brute-force their way to a green screen teaches guessing, and the hint the
   game then shows would be answering a question the child never really asked. */
EQI_FMT.pair = {
  init(q) {
    return { sel: null, joined: 0, missed: false, n: q.pair.left.length };
  },

  render(q, st) {
    const col = (side, items) => items.map((it, i) =>
      `<div class="eqi-p" id="eqi-${side}${i}" data-side="${side}" data-i="${i}" style="height:52px;border-radius:16px;background:#fff;box-shadow:0 4px 0 #C9BCA6;display:flex;align-items:center;justify-content:center;font:800 22px 'Baloo 2';color:#2A1F45">${it}</div>`
    ).join('');
    return `<div style="margin-top:14px">
      <div style="font:700 12px Nunito;color:#A08A5E;margin-bottom:10px">${TX(q.pair.label)}</div>
      <div style="display:flex;gap:14px">
        <div style="flex:1;display:flex;flex-direction:column;gap:9px">${col('L', q.pair.left)}</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:9px">${col('R', q.pair.rightShown)}</div>
      </div>
    </div>`;
  },

  mount(q, st) {
    const cells = document.querySelectorAll ? document.querySelectorAll('.eqi-p') : [];
    const lock = (a, b) => {
      [a, b].forEach(el => {
        el.style.background = '#DCF5E6';
        el.style.boxShadow = '0 4px 0 #7FCFA0';
        el.style.color = '#2A7A4C';
        el.dataset.locked = '1';
      });
    };
    const clear = el => {
      if (!el || el.dataset.locked) return;
      el.style.background = '#fff';
      el.style.boxShadow = '0 4px 0 #C9BCA6';
      el.style.color = '#2A1F45';
    };
    const pick = el => {
      el.style.background = '#EFE7FF';
      el.style.boxShadow = '0 4px 0 #7B5CFF';
      el.style.color = '#5B3FD6';
    };

    for (let k = 0; k < cells.length; k++) {
      cells[k].onclick = function () {
        if (EQIX.done || this.dataset.locked) return;
        const side = this.dataset.side, i = +this.dataset.i;
        if (!st.sel) { st.sel = { side: side, i: i, el: this }; pick(this); return; }
        if (st.sel.side === side) { clear(st.sel.el); st.sel = { side: side, i: i, el: this }; pick(this); return; }

        const li = side === 'L' ? i : st.sel.i;
        const ri = side === 'R' ? i : st.sel.i;
        const right = q.pair.match[li] === ri;
        const first = st.sel.el, second = this;
        st.sel = null;

        if (right) {
          lock(first, second);
          st.joined++;
          if (typeof SFX !== 'undefined' && SFX.tap) SFX.tap();
          if (st.joined >= st.n) EQIX.commit(q, !st.missed);
        } else {
          st.missed = true;
          [first, second].forEach(el => {
            el.style.background = '#FFF3D6';
            el.style.boxShadow = '0 4px 0 #E8D0A8';
            el.style.color = '#8A5A0A';
            el.classList.add('eqi-shake');
          });
          setTimeout(() => {
            [first, second].forEach(el => { el.classList.remove('eqi-shake'); clear(el); });
          }, 420);
          EQIX.commit(q, false);
        }
      };
    }
  },

  solve(q) { return true; }
};

/* ── 3 · put in order ─────────────────────────────────────────────────────────
   "Put these in order, smallest first." Four tiles the child moves with a tap: tap a
   tile, tap where it should go, and the row closes up around it. Tapping rather than
   dragging is on purpose here — ordering asks a child to hold four numbers in mind at
   once, and fighting a drag while doing it costs them the thought.

   Committed with Done, and judged on the row as a whole. Order is the one format where
   a nearly-right answer is genuinely common (two tiles swapped), so the hint for these
   questions talks about the comparison, not the arithmetic. */
EQI_FMT.order = {
  init(q) {
    return { cur: q.order.shown.slice(), sel: -1 };
  },

  render(q, st) {
    return `<div style="margin-top:14px">
      <div style="font:700 12px Nunito;color:#A08A5E;margin-bottom:10px">${TX(q.order.label)}</div>
      <div id="eqi-row" style="display:flex;gap:8px">${this.tiles(st)}</div>
      <div id="eqi-done" class="press" style="margin-top:14px;height:56px;border-radius:20px;background:#FFC24B;box-shadow:0 5px 0 #E39B1C;display:flex;align-items:center;justify-content:center;font:800 18px 'Baloo 2';color:#4A3208">${TX(q.order.doneLabel)}</div>
    </div>`;
  },

  tiles(st) {
    return st.cur.map((v, i) => {
      const on = i === st.sel;
      return `<div class="eqi-t press" data-i="${i}" style="flex:1;height:68px;border-radius:18px;background:${on ? '#EFE7FF' : '#fff'};box-shadow:0 5px 0 ${on ? '#7B5CFF' : '#C9BCA6'};display:flex;align-items:center;justify-content:center;font:800 26px 'Baloo 2';color:${on ? '#5B3FD6' : '#2A1F45'}">${v}</div>`;
    }).join('');
  },

  mount(q, st) {
    const row = EQIX.el('row');
    if (!row) return;
    const paint = () => {
      row.innerHTML = this.tiles(st);
      wire();
    };
    const wire = () => {
      const ts = row.querySelectorAll('.eqi-t');
      for (let k = 0; k < ts.length; k++) {
        ts[k].onclick = function () {
          if (EQIX.done) return;
          const i = +this.dataset.i;
          if (st.sel < 0) { st.sel = i; paint(); return; }
          if (st.sel === i) { st.sel = -1; paint(); return; }
          /* move the picked tile into the tapped slot, sliding the rest along */
          const moved = st.cur.splice(st.sel, 1)[0];
          st.cur.splice(i, 0, moved);
          st.sel = -1;
          if (typeof SFX !== 'undefined' && SFX.tap) SFX.tap();
          paint();
        };
      }
    };
    wire();

    const done = EQIX.el('done');
    if (done) done.onclick = () => {
      if (EQIX.done) return;
      const want = q.order.sorted;
      const ok = st.cur.length === want.length && st.cur.every((v, i) => v === want[i]);
      EQIX.commit(q, ok, () => {
        const ts = row.querySelectorAll('.eqi-t');
        for (let k = 0; k < ts.length; k++) {
          const good = st.cur[k] === want[k];
          ts[k].style.background = good ? '#DCF5E6' : '#FFF3D6';
          ts[k].style.boxShadow = '0 5px 0 ' + (good ? '#7FCFA0' : '#E8D0A8');
          ts[k].style.color = good ? '#2A7A4C' : '#8A5A0A';
        }
      });
    };
  },

  solve(q) { return q.order.sorted; }
};
