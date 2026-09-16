/* EduQuest — minimal QR encoder (byte mode, versions 1–40, ECC L/M).
   Self-contained on purpose: the app is an offline PWA, so nothing may come from a CDN.
   Produces a module matrix; EQQR.svg() draws it. Standard ISO/IEC 18004 construction —
   bit stream, Reed–Solomon blocks, function patterns, then the best of the eight masks. */

const EQQR = {
  /* error-correction codewords per block, and block count, indexed by version (1–40) */
  ECW: {
    L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28]
  },
  EBLK: {
    L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49]
  },
  FMT: { L: 1, M: 0 },

  /* ── capacity ── */
  rawModules(v) {
    let r = (16 * v + 128) * v + 64;
    if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; }
    if (v >= 7) r -= 36;
    return r;
  },
  rawBytes(v) { return Math.floor(this.rawModules(v) / 8); },
  dataBytes(v, ecl) { return this.rawBytes(v) - this.ECW[ecl][v] * this.EBLK[ecl][v]; },
  /* how many bytes of byte-mode payload a version holds (4 mode bits + 8/16 count bits) */
  capacity(v, ecl) { return Math.floor((this.dataBytes(v, ecl) * 8 - 4 - (v < 10 ? 8 : 16)) / 8); },

  /* ── GF(256) arithmetic, primitive polynomial 0x11D ── */
  _exp: null, _log: null,
  gf() {
    if (this._exp) return;
    const e = new Uint8Array(512), l = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) { e[i] = x; l[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11D; }
    for (let i = 255; i < 512; i++) e[i] = e[i - 255];
    this._exp = e; this._log = l;
  },
  gmul(a, b) { return (a === 0 || b === 0) ? 0 : this._exp[this._log[a] + this._log[b]]; },
  /* generator polynomial of the given degree */
  rsPoly(deg) {
    let p = [1];
    for (let i = 0; i < deg; i++) {
      const q = p.concat([0]);
      for (let j = 0; j < p.length; j++) q[j + 1] ^= this.gmul(p[j], this._exp[i]);
      p = q;
    }
    return p;
  },
  rsRemainder(data, deg) {
    const gen = this.rsPoly(deg), rem = new Uint8Array(deg);
    for (let i = 0; i < data.length; i++) {
      const factor = data[i] ^ rem[0];
      rem.copyWithin(0, 1); rem[deg - 1] = 0;
      for (let j = 0; j < deg; j++) rem[j] ^= this.gmul(gen[j + 1], factor);
    }
    return rem;
  },

  /* ── encode text → { size, mods } (mods[y][x] = 1 when dark), or null if too long ── */
  encode(text, ecl) {
    ecl = ecl || 'L';
    this.gf();
    const bytes = this.utf8(text);
    let ver = 0;
    for (let v = 1; v <= 40; v++) { if (this.capacity(v, ecl) >= bytes.length) { ver = v; break; } }
    if (!ver) return null;

    /* bit stream: mode 0100, character count, payload, terminator, pad bytes */
    const bits = [];
    const push = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    push(4, 4);
    push(bytes.length, ver < 10 ? 8 : 16);
    for (const b of bytes) push(b, 8);
    const cap = this.dataBytes(ver, ecl) * 8;
    push(0, Math.min(4, cap - bits.length));
    while (bits.length % 8 !== 0) bits.push(0);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      data.push(b);
    }
    for (let pad = 0xEC; data.length < cap / 8; pad ^= 0xEC ^ 0x11) data.push(pad);

    /* split into blocks, add Reed–Solomon codewords, interleave */
    const nBlk = this.EBLK[ecl][ver], ecLen = this.ECW[ecl][ver], rawCw = this.rawBytes(ver);
    const shortN = nBlk - rawCw % nBlk, shortLen = Math.floor(rawCw / nBlk) - ecLen;
    const blocks = [], eccs = [];
    for (let i = 0, off = 0; i < nBlk; i++) {
      const len = shortLen + (i < shortN ? 0 : 1);
      const blk = data.slice(off, off + len); off += len;
      blocks.push(blk); eccs.push(this.rsRemainder(blk, ecLen));
    }
    const out = [];
    for (let i = 0; i <= shortLen; i++) for (let b = 0; b < nBlk; b++) if (i < blocks[b].length) out.push(blocks[b][i]);
    for (let i = 0; i < ecLen; i++) for (let b = 0; b < nBlk; b++) out.push(eccs[b][i]);

    return this.matrix(ver, ecl, out);
  },

  utf8(t) { return Array.from(new TextEncoder().encode(t)); },

  /* ── module placement ── */
  matrix(ver, ecl, codewords) {
    const size = ver * 4 + 17;
    const mods = [], fn = [];
    for (let y = 0; y < size; y++) { mods.push(new Uint8Array(size)); fn.push(new Uint8Array(size)); }
    const setFn = (x, y, dark) => { if (x >= 0 && x < size && y >= 0 && y < size) { mods[y][x] = dark ? 1 : 0; fn[y][x] = 1; } };

    /* timing patterns first — the finder patterns below overwrite the ends of both */
    for (let i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
    /* finder patterns with their separators */
    for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        setFn(cx + dx, cy + dy, d !== 2 && d !== 4);
      }
    }
    /* alignment patterns (never on top of a finder) */
    const pos = this.alignPos(ver);
    for (let i = 0; i < pos.length; i++) for (let j = 0; j < pos.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        setFn(pos[j] + dx, pos[i] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
    /* version information (7 and up) */
    if (ver >= 7) {
      let rem = ver;
      for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      const bits = (ver << 12) | rem;
      for (let i = 0; i < 18; i++) {
        const bit = (bits >>> i) & 1, a = size - 11 + i % 3, b = Math.floor(i / 3);
        setFn(a, b, bit); setFn(b, a, bit);
      }
    }
    this.format(mods, fn, size, ecl, 0); /* reserve the format area before data placement */

    /* data: two-module-wide columns, right to left, snaking up and down */
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const up = ((right + 1) & 2) === 0;
          const y = up ? size - 1 - vert : vert;
          if (!fn[y][x] && i < codewords.length * 8) {
            mods[y][x] = (codewords[i >>> 3] >>> (7 - (i & 7))) & 1;
            i++;
          }
        }
      }
    }

    /* pick the mask with the lowest penalty */
    let best = 0, bestScore = Infinity;
    for (let m = 0; m < 8; m++) {
      this.applyMask(mods, fn, size, m);
      this.format(mods, fn, size, ecl, m);
      const sc = this.penalty(mods, size);
      if (sc < bestScore) { bestScore = sc; best = m; }
      this.applyMask(mods, fn, size, m); /* masking is its own inverse */
    }
    this.applyMask(mods, fn, size, best);
    this.format(mods, fn, size, ecl, best);
    return { size, mods, version: ver };
  },

  alignPos(ver) {
    if (ver === 1) return [];
    const n = Math.floor(ver / 7) + 2;
    const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
    const out = [6];
    for (let p = ver * 4 + 10; out.length < n; p -= step) out.splice(1, 0, p);
    return out;
  },

  format(mods, fn, size, ecl, mask) {
    const data = (this.FMT[ecl] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    const set = (x, y, b) => { mods[y][x] = b; fn[y][x] = 1; };
    const bit = i => (bits >>> i) & 1;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, 1); /* the always-dark module */
  },

  applyMask(mods, fn, size, m) {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      if (fn[y][x]) continue;
      let inv;
      switch (m) {
        case 0: inv = (x + y) % 2 === 0; break;
        case 1: inv = y % 2 === 0; break;
        case 2: inv = x % 3 === 0; break;
        case 3: inv = (x + y) % 3 === 0; break;
        case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
        case 5: inv = (x * y) % 2 + (x * y) % 3 === 0; break;
        case 6: inv = ((x * y) % 2 + (x * y) % 3) % 2 === 0; break;
        default: inv = ((x + y) % 2 + (x * y) % 3) % 2 === 0; break;
      }
      if (inv) mods[y][x] ^= 1;
    }
  },

  /* the four ISO penalty rules — the mask with the lowest score reads most reliably */
  penalty(m, size) {
    let res = 0;
    const N1 = 3, N2 = 3, N3 = 40, N4 = 10;
    /* a finder-like 1:1:3:1:1 run, with four light modules on one side, costs N3 */
    const addRun = (len, hist) => {
      if (hist[0] === 0) len += size; /* the quiet zone counts as light before the first run */
      hist.pop(); hist.unshift(len);
    };
    const countPatterns = (h) => {
      const n = h[1];
      const core = n > 0 && h[2] === n && h[3] === n * 3 && h[4] === n && h[5] === n;
      return (core && h[0] >= n * 4 && h[6] >= n ? 1 : 0) + (core && h[6] >= n * 4 && h[0] >= n ? 1 : 0);
    };
    const scanLine = (get) => {
      for (let a = 0; a < size; a++) {
        let color = 0, run = 0;
        const hist = [0, 0, 0, 0, 0, 0, 0];
        for (let b = 0; b < size; b++) {
          if (get(a, b) === color) {
            run++;
            if (run === 5) res += N1; else if (run > 5) res++;
          } else {
            addRun(run, hist);
            if (!color) res += countPatterns(hist) * N3;
            color = get(a, b); run = 1;
          }
        }
        if (color) { addRun(run, hist); run = 0; }
        addRun(run + size, hist);
        res += countPatterns(hist) * N3;
      }
    };
    scanLine((y, x) => m[y][x]);
    scanLine((x, y) => m[y][x]);
    /* 2×2 blocks of one colour */
    for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) res += N2;
    }
    /* overall balance of dark and light */
    let dark = 0;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) dark += m[y][x];
    const total = size * size;
    res += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * N4;
    return res;
  },

  /* ── draw ── one <path> of squares, so it stays crisp at any size */
  svg(text, opts) {
    const o = opts || {};
    const qr = this.encode(text, o.ecl || 'L');
    if (!qr) return null;
    const quiet = o.quiet == null ? 2 : o.quiet;
    const dim = qr.size + quiet * 2;
    let d = '';
    for (let y = 0; y < qr.size; y++) for (let x = 0; x < qr.size; x++) {
      if (qr.mods[y][x]) d += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
    return `<svg viewBox="0 0 ${dim} ${dim}" width="${o.px || 300}" height="${o.px || 300}" shape-rendering="crispEdges" style="${o.style || ''}">
      <rect width="${dim}" height="${dim}" fill="${o.bg || '#fff'}"></rect>
      <path d="${d}" fill="${o.fg || '#000'}"></path>
    </svg>`;
  }
};
