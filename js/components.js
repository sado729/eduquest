/* EduQuest — shared SVG components (ported from Hero.dc.html / Questy.dc.html / HudBar.dc.html / NavBar.dc.html) */
const EQC = {};

EQC.fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* ── Hero ─────────────────────────────────────────────── */
EQC.hero = function (h, style) {
  h = h || {};
  const skin = h.skin || '#F2C49B';
  const hairColor = h.hairColor || '#4A2E20';
  const outfit = h.outfit || '#3DBE6E';
  const outfitDark = h.outfitDark || '#2A9455';
  const shoe = h.shoe || '#5B3FD6';
  const hairPaths = {
    bob:   'M32 42 q0-30 28-30 q28 0 28 30 q-4-12 -12-14 q-8 8 -32 4 q-8 2 -12 10 Z',
    curly: 'M31 40 a10 10 0 0 1 4-18 a11 11 0 0 1 18-9 a12 12 0 0 1 16 3 a11 11 0 0 1 15 12 a10 10 0 0 1 5 12 q-14-12 -58 0 Z',
    spiky: 'M32 40 l4-16 6 8 4-16 7 12 7-14 6 14 7-10 5 22 q-26-8 -46 0 Z',
    long:  'M30 44 q0-32 30-32 q30 0 30 32 l-3 40 q-8 4 -10-4 l-3-30 q-14 6 -28 0 l-3 30 q-2 8 -10 4 Z',
    braids:'M32 42 q0-30 28-30 q28 0 28 30 l-2 6 q-6-16 -12-16 q-10 8 -28 4 q-6 2 -12 10 Z M26 46 a6 6 0 1 1 12 0 l0 22 a6 6 0 1 1 -12 0 Z M82 46 a6 6 0 1 1 12 0 l0 22 a6 6 0 1 1 -12 0 Z'
  };
  const hairPath = hairPaths[h.hair || 'bob'] || hairPaths.bob;
  const hat = h.hat || 'none';
  let hatSvg = '';
  if (hat === 'explorer') hatSvg = `<g><ellipse cx="60" cy="26" rx="34" ry="8" fill="#C98A4B"></ellipse><path d="M40 26 q0-18 20-18 q20 0 20 18 Z" fill="#E0A365"></path><rect x="39" y="22" width="42" height="7" rx="3.5" fill="#7B5CFF"></rect></g>`;
  if (hat === 'wizard') hatSvg = `<g><path d="M60 -12 L84 28 L36 28 Z" fill="#7B5CFF"></path><ellipse cx="60" cy="28" rx="28" ry="7" fill="#5B3FD6"></ellipse><path d="M60 4 l3-6 3 6 6 2 -6 2.4 -3 6 -3-6 -6-2.4 Z" fill="#FFE9A8"></path></g>`;
  if (hat === 'crown') hatSvg = `<path d="M40 22 L47 8 L54 18 L60 4 L66 18 L73 8 L80 22 Z" fill="#FFC24B"></path>`;
  return `<svg viewBox="0 0 120 160" style="overflow:visible;${style || ''}" preserveAspectRatio="xMidYMax meet">
    <ellipse cx="60" cy="154" rx="30" ry="5" fill="#2A1F45" opacity="0.13"></ellipse>
    <rect x="42" y="132" width="15" height="18" rx="7" fill="${shoe}"></rect>
    <rect x="63" y="132" width="15" height="18" rx="7" fill="${shoe}"></rect>
    <rect x="45" y="112" width="10" height="24" rx="5" fill="${skin}"></rect>
    <rect x="65" y="112" width="10" height="24" rx="5" fill="${skin}"></rect>
    <path d="M38 76 q22-8 44 0 l4 34 q-26 8 -52 0 Z" fill="${outfit}"></path>
    <path d="M38 100 q26 7 48 0 l1 8 q-25 7 -50 0 Z" fill="${outfitDark}"></path>
    <circle cx="60" cy="105" r="4" fill="#FFE9A8"></circle>
    <rect x="26" y="78" width="11" height="30" rx="5.5" fill="${skin}" transform="rotate(-8 31 92)"></rect>
    <rect x="83" y="78" width="11" height="30" rx="5.5" fill="${skin}" transform="rotate(8 88 92)"></rect>
    <path d="M38 78 q10-10 22-10 q12 0 22 10 q-22-4 -44 0 Z" fill="${outfitDark}"></path>
    <circle cx="60" cy="44" r="28" fill="${skin}"></circle>
    <path d="${hairPath}" fill="${hairColor}"></path>
    <ellipse cx="49" cy="46" rx="4.2" ry="5" fill="#3A2A4E"></ellipse>
    <ellipse cx="71" cy="46" rx="4.2" ry="5" fill="#3A2A4E"></ellipse>
    <circle cx="50.4" cy="44" r="1.5" fill="#fff"></circle>
    <circle cx="72.4" cy="44" r="1.5" fill="#fff"></circle>
    <ellipse cx="41" cy="55" rx="5" ry="3.4" fill="#FF8FA6" opacity="0.5"></ellipse>
    <ellipse cx="79" cy="55" rx="5" ry="3.4" fill="#FF8FA6" opacity="0.5"></ellipse>
    <path d="M53 57 q7 7 14 0" stroke="#3A2A4E" stroke-width="2.6" fill="none" stroke-linecap="round"></path>
    ${hatSvg}
  </svg>`;
};

/* ── Questy ───────────────────────────────────────────── */
EQC.questy = function (mood, style, fur, furDark) {
  fur = fur || '#FF9243';
  furDark = furDark || '#F0762A';
  const M = {
    happy:       { eyes:'open', mouth:'smile', tilt:0,  arm:0,   sparks:false, bulb:false, q:false },
    excited:     { eyes:'joy',  mouth:'open',  tilt:-4, arm:-30, sparks:true,  bulb:false, q:false },
    thinking:    { eyes:'up',   mouth:'small', tilt:6,  arm:0,   sparks:false, bulb:false, q:true  },
    confused:    { eyes:'open', mouth:'wave',  tilt:12, arm:0,   sparks:false, bulb:false, q:true  },
    celebrating: { eyes:'joy',  mouth:'open',  tilt:0,  arm:-46, sparks:true,  bulb:false, q:false },
    encouraging: { eyes:'wink', mouth:'smile', tilt:-6, arm:-18, sparks:false, bulb:false, q:false },
    hint:        { eyes:'open', mouth:'smile', tilt:-3, arm:-24, sparks:true,  bulb:true,  q:false }
  }[mood || 'happy'] || {};
  const mouths = {
    smile: 'M50 68 q10 8 20 0',
    open:  'M50 66 q10 14 20 0 q-10 4 -20 0',
    small: 'M55 69 q5 4 10 0',
    wave:  'M50 69 q5-5 10 0 q5 5 10 0'
  };
  const mouth = mouths[M.mouth] || mouths.smile;
  const mouthFill = M.mouth === 'open' ? '#3A2A4E' : 'none';
  let eyes = '';
  if (M.eyes === 'open') eyes = `<g><ellipse cx="47" cy="45" rx="7" ry="7.6" fill="#3A2A4E"></ellipse><ellipse cx="73" cy="45" rx="7" ry="7.6" fill="#3A2A4E"></ellipse><circle cx="49.4" cy="42.4" r="2.4" fill="#fff"></circle><circle cx="75.4" cy="42.4" r="2.4" fill="#fff"></circle></g>`;
  if (M.eyes === 'up') eyes = `<g><ellipse cx="47" cy="45" rx="7" ry="7.6" fill="#3A2A4E"></ellipse><ellipse cx="73" cy="45" rx="7" ry="7.6" fill="#3A2A4E"></ellipse><circle cx="48" cy="40.6" r="2.6" fill="#fff"></circle><circle cx="74" cy="40.6" r="2.6" fill="#fff"></circle><path d="M39 33 q8-5 16 0" stroke="#3A2A4E" stroke-width="2.6" fill="none" stroke-linecap="round"></path><path d="M65 33 q8-5 16 0" stroke="#3A2A4E" stroke-width="2.6" fill="none" stroke-linecap="round"></path></g>`;
  if (M.eyes === 'wink') eyes = `<g><path d="M40 45 q7-7 14 0" stroke="#3A2A4E" stroke-width="3.4" fill="none" stroke-linecap="round"></path><ellipse cx="73" cy="45" rx="7" ry="7.6" fill="#3A2A4E"></ellipse><circle cx="75.4" cy="42.4" r="2.4" fill="#fff"></circle></g>`;
  if (M.eyes === 'joy') eyes = `<g><path d="M39 47 q8-10 16 0" stroke="#3A2A4E" stroke-width="3.4" fill="none" stroke-linecap="round"></path><path d="M65 47 q8-10 16 0" stroke="#3A2A4E" stroke-width="3.4" fill="none" stroke-linecap="round"></path></g>`;
  const sparks = M.sparks ? `<g><path d="M14 26 l2.6-5 2.6 5 5 2.2 -5 2.2 -2.6 5 -2.6-5 -5-2.2 Z" fill="#FFC24B"></path><path d="M100 16 l2-4 2 4 4 1.8 -4 1.8 -2 4 -2-4 -4-1.8 Z" fill="#9BE8C0"></path><circle cx="106" cy="46" r="3" fill="#7B5CFF"></circle><circle cx="16" cy="60" r="2.4" fill="#45C6F0"></circle></g>` : '';
  const bulb = M.bulb ? `<g transform="translate(84,4)"><circle cx="14" cy="14" r="13" fill="#FFC24B" opacity="0.28"></circle><circle cx="14" cy="13" r="8.4" fill="#FFD86E"></circle><rect x="10.4" y="20" width="7.2" height="5" rx="2" fill="#E39B1C"></rect><path d="M14 6.4 v3 M6.6 13 h3 M18.4 13 h3" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.9"></path></g>` : '';
  const qmark = M.q ? `<text x="96" y="26" font-family="'Baloo 2', system-ui" font-size="30" font-weight="800" fill="#7B5CFF">?</text>` : '';
  return `<svg viewBox="0 0 120 132" style="overflow:visible;${style || ''}" preserveAspectRatio="xMidYMax meet">
    <ellipse cx="60" cy="126" rx="30" ry="5" fill="#2A1F45" opacity="0.13"></ellipse>
    <g transform="rotate(${M.tilt || 0} 60 90)">
      <path d="M36 92 C18 96 8 106 6 118 C4 126 12 128 16 122 C22 112 30 104 40 102 Z" fill="${furDark}"></path>
      <path d="M10 116 l4-7 4 7 7 2 -7 3 -3 7 -4-7 -7-3 Z" fill="#FFE9A8"></path>
      <ellipse cx="60" cy="98" rx="27" ry="25" fill="${fur}"></ellipse>
      <ellipse cx="60" cy="103" rx="17" ry="18" fill="#FFF3DF"></ellipse>
      <rect x="42" y="115" width="14" height="12" rx="6" fill="${furDark}"></rect>
      <rect x="64" y="115" width="14" height="12" rx="6" fill="${furDark}"></rect>
      <g transform="rotate(${M.arm || 0} 34 96)">
        <ellipse cx="30" cy="98" rx="8" ry="10" fill="${furDark}" transform="rotate(-14 30 98)"></ellipse>
      </g>
      <ellipse cx="90" cy="98" rx="8" ry="10" fill="${furDark}" transform="rotate(14 90 98)"></ellipse>
      <path d="M40 80 C44 90 76 90 80 80 C74 74 46 74 40 80 Z" fill="#7B5CFF"></path>
      <path d="M60 74 l3.2-5.6 3.2 5.6 6 1.6 -6 2.4 -2.4 5.6 -3.2-5.6 -6-2.4 Z" fill="#FFE9A8" transform="translate(-3,2)"></path>
      <path d="M28 34 L42 12 L52 34 Z" fill="${fur}"></path>
      <path d="M32 33 L42 19 L48 33 Z" fill="#FFB9C6"></path>
      <path d="M92 34 L78 12 L68 34 Z" fill="${fur}"></path>
      <path d="M88 33 L78 19 L72 33 Z" fill="#FFB9C6"></path>
      <ellipse cx="60" cy="52" rx="34" ry="30" fill="${fur}"></ellipse>
      <path d="M60 24 C54 32 54 38 60 42 C66 38 66 32 60 24 Z" fill="#FFF3DF"></path>
      <ellipse cx="60" cy="64" rx="18" ry="13" fill="#FFF3DF"></ellipse>
      <ellipse cx="33" cy="62" rx="6.5" ry="4.5" fill="#FF8FA6" opacity="0.55"></ellipse>
      <ellipse cx="87" cy="62" rx="6.5" ry="4.5" fill="#FF8FA6" opacity="0.55"></ellipse>
      <ellipse cx="60" cy="57" rx="5.4" ry="3.8" fill="#3A2A4E"></ellipse>
      ${eyes}
      <path d="${mouth}" stroke="#3A2A4E" stroke-width="2.8" fill="${mouthFill}" stroke-linecap="round" stroke-linejoin="round"></path>
    </g>
    ${sparks}${bulb}${qmark}
  </svg>`;
};

/* ── small icon helpers ───────────────────────────────── */
EQC.coin = (sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 26 26"><circle cx="13" cy="13" r="11" fill="#E39B1C"></circle><circle cx="13" cy="11.6" r="9.4" fill="#FFC24B"></circle><path d="M13 6.4 l1.7 3.5 3.8 0.5 -2.8 2.7 0.7 3.8 -3.4-1.8 -3.4 1.8 0.7-3.8 -2.8-2.7 3.8-0.5 Z" fill="#FFE9A8"></path></svg>`;
EQC.flame = (sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><path d="M12 21 c5-2.6 7-6 7-9.4 C19 8 16.6 5.6 14.6 2 c0 4-2.6 4.6-4.6 7 -1.6 2 -3 3.6 -3 5.4 C7 17.4 9 19.6 12 21 Z" fill="#FF8A4C"></path><path d="M12 20 c2.6-1.6 3.6-3.4 3.6-5.2 C15.6 12.6 14 11 13 9 c0 2.4-1.6 2.8-2.6 4.2 -0.8 1.2 -1.4 2.2 -1.4 3.2 C9 18.2 10.4 19.2 12 20 Z" fill="#FFC24B"></path></svg>`;
EQC.lock = (color, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="3" fill="${color}"></rect><path d="M8.5 10 V7.5 a3.5 3.5 0 0 1 7 0 V10" fill="none" stroke="${color}" stroke-width="2.2"></path></svg>`;
EQC.check = (color, sz, sw) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><path d="M5 12.6 L10 17.6 L19.4 7.6" fill="none" stroke="${color}" stroke-width="${sw || 3.2}" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
EQC.arrowR = (color, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><path d="M5 12 h13 M13 6 l6 6 -6 6" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
EQC.chevL = (color, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><path d="M14.5 5 L8 12 l6.5 7" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round"></path></svg>`;
EQC.chevR = (color, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><path d="M9.5 5 L16 12 l-6.5 7" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round"></path></svg>`;
EQC.xIcon = (color, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><path d="M6 6 l12 12 M18 6 l-12 12" stroke="${color}" stroke-width="3" stroke-linecap="round"></path></svg>`;
EQC.playIcon = (color, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><path d="M8 5.4 L19 12 L8 18.6 Z" fill="${color}"></path></svg>`;
EQC.bulb = (color, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><circle cx="12" cy="10" r="5.6" fill="${color}"></circle><rect x="9.4" y="15.4" width="5.2" height="4" rx="1.6" fill="${color}"></rect></svg>`;
EQC.heart = (filled, sz) => filled
  ? `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><path d="M12 20.4 C6 16.4 3 13.4 3 9.8 A4.8 4.8 0 0 1 12 7 a4.8 4.8 0 0 1 9 2.8 c0 3.6-3 6.6-9 10.6 Z" fill="#FF5D73"></path></svg>`
  : `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><path d="M12 20.4 C6 16.4 3 13.4 3 9.8 A4.8 4.8 0 0 1 12 7 a4.8 4.8 0 0 1 9 2.8 c0 3.6-3 6.6-9 10.6 Z" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"></path></svg>`;
EQC.trophy = (color, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><path d="M7.4 4 h9.2 v5.4 a4.6 4.6 0 0 1 -9.2 0 Z" fill="${color}"></path><path d="M12 14.4 V17 M8.4 20 h7.2" stroke="${color}" stroke-width="2.4" stroke-linecap="round"></path></svg>`;
EQC.logo = (sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="26" fill="#7B5CFF" opacity="0.35"></circle>
  <path d="M32 25 C24 18 14 19 9 22 v25 c5-3 15-2 23 4 Z" fill="#FFF7EA"></path>
  <path d="M32 25 C40 18 50 19 55 22 v25 c-5-3 -15-2 -23 4 Z" fill="#FBE9CC"></path>
  <path d="M32 25 v29" stroke="#DDB588" stroke-width="2" stroke-linecap="round"></path>
  <path d="M32 2 l4 9.6 9.6 4 -9.6 4 -4 9.6 -4-9.6 -9.6-4 9.6-4 Z" fill="#FFC24B"></path>
</svg>`;

/* apples used by the maths visuals */
EQC.apple = (x, y) => `<g transform="translate(${x},${y})"><circle cx="0" cy="0" r="9" fill="#FF5D73"></circle><path d="M0 -8 q5-7 9-5 q-2 6 -9 6 Z" fill="#3DBE6E"></path><path d="M-3 -3 a4 4 0 0 1 4-3" stroke="#fff" stroke-width="1.6" fill="none" opacity="0.7"></path></g>`;
EQC.appleBox = (n) => {
  const pos = [];
  const perRow = 5;
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / perRow), col = i % perRow;
    const rowCount = Math.min(perRow, n - row * perRow);
    const startX = 75 - (rowCount - 1) * 12;
    pos.push(EQC.apple(startX + col * 24, 14 + row * 22));
  }
  return `<svg viewBox="0 0 150 46" width="100%" height="46">${pos.join('')}</svg>`;
};

/* ── HUD bar (ported from HudBar.dc.html) ─────────────── */
EQC.hud = function (s, style) {
  const need = 1500;
  const pct = Math.min(100, Math.round(s.xp / need * 100));
  return `<div style="${style || ''};padding:0 14px;display:flex;align-items:center;gap:10px">
    <div class="press" onclick="EQ.go('wardrobe')" style="position:relative;width:56px;height:56px;flex:none">
      <div style="position:absolute;inset:0;border-radius:50%;background:#FFC24B;box-shadow:0 4px 0 #E39B1C, 0 8px 16px -4px rgba(20,10,40,0.45)"></div>
      <div style="position:absolute;inset:4px;border-radius:50%;background:#FFF3DF;overflow:hidden">
        ${EQC.hero(s.hero, 'position:absolute;left:-20px;top:-9px;width:96px')}
      </div>
      <div style="position:absolute;right:-4px;bottom:-3px;min-width:24px;height:22px;padding:0 5px;border-radius:11px;background:#7B5CFF;box-shadow:0 3px 0 #5B3FD6;display:flex;align-items:center;justify-content:center;font:800 12px 'Baloo 2', system-ui;color:#fff">${s.level}</div>
    </div>
    <div style="flex:1;min-width:0;height:46px;border-radius:23px;background:rgba(30,21,54,0.86);box-shadow:0 3px 0 rgba(12,6,28,0.5), 0 0 0 1.5px rgba(255,255,255,0.10) inset;padding:0 14px;display:flex;flex-direction:column;justify-content:center;gap:4px">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <span style="font:800 11px Nunito, system-ui;color:#fff;letter-spacing:0.4px;text-transform:uppercase">${EQ.rank(s.level)}</span>
        <span style="font:700 10px Nunito, system-ui;color:#C6B9EE">${EQC.fmt(s.xp)} / ${EQC.fmt(need)} XP</span>
      </div>
      <div style="height:9px;border-radius:5px;background:rgba(255,255,255,0.16);overflow:hidden">
        <div style="height:100%;border-radius:5px;background:#5CE39B;box-shadow:0 0 10px rgba(92,227,155,0.6);width:${pct}%"></div>
      </div>
    </div>
    <div style="flex:none;height:46px;border-radius:23px;background:rgba(30,21,54,0.86);box-shadow:0 3px 0 rgba(12,6,28,0.5), 0 0 0 1.5px rgba(255,255,255,0.10) inset;padding:0 12px 0 8px;display:flex;align-items:center;gap:7px">
      ${EQC.coin(26)}
      <span style="font:800 16px 'Baloo 2', system-ui;color:#fff">${s.coins}</span>
    </div>
  </div>`;
};

/* ── bottom navigation (ported from NavBar.dc.html) ───── */
EQC.nav = function (active) {
  const icons = {
    world: `<svg width="24" height="24" viewBox="0 0 24 24" style="position:relative"><path d="M3 6.5 L9 4 L15 6.5 L21 4 V17.5 L15 20 L9 17.5 L3 20 Z" fill="none" stroke="#fff" stroke-width="1.9" stroke-linejoin="round"></path><path d="M9 4 V17.5 M15 6.5 V20" stroke="#fff" stroke-width="1.9" stroke-linejoin="round"></path></svg>`,
    quests: `<svg width="24" height="24" viewBox="0 0 24 24" style="position:relative"><circle cx="12" cy="12" r="8.6" fill="none" stroke="#fff" stroke-width="1.9"></circle><circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" stroke-width="1.9"></circle><circle cx="12" cy="12" r="1.6" fill="#fff"></circle></svg>`,
    hero: `<svg width="24" height="24" viewBox="0 0 24 24" style="position:relative"><circle cx="12" cy="8" r="4.2" fill="none" stroke="#fff" stroke-width="1.9"></circle><path d="M4.6 20 q1.6-6.4 7.4-6.4 q5.8 0 7.4 6.4" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round"></path></svg>`,
    awards: `<svg width="24" height="24" viewBox="0 0 24 24" style="position:relative"><path d="M7.4 4 h9.2 v5.4 a4.6 4.6 0 0 1 -9.2 0 Z" fill="none" stroke="#fff" stroke-width="1.9" stroke-linejoin="round"></path><path d="M7.4 5.4 H4.6 a3 3 0 0 0 3 4.4 M16.6 5.4 H19.4 a3 3 0 0 1 -3 4.4" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"></path><path d="M12 14.4 V17 M8.4 20 h7.2" stroke="#fff" stroke-width="1.9" stroke-linecap="round"></path></svg>`,
    bag: `<svg width="24" height="24" viewBox="0 0 24 24" style="position:relative"><path d="M5.4 9.4 a6.6 6.6 0 0 1 13.2 0 V19 a1.6 1.6 0 0 1 -1.6 1.6 H7 A1.6 1.6 0 0 1 5.4 19 Z" fill="none" stroke="#fff" stroke-width="1.9"></path><path d="M9 9 V6.6 a3 3 0 0 1 6 0 V9 M9.4 14.6 h5.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"></path></svg>`
  };
  const labels = {
    world: TX({ az: 'Dünya', en: 'World', ru: 'Мир' }),
    quests: TX({ az: 'Tapşırıqlar', en: 'Quests', ru: 'Задания' }),
    hero: TX({ az: 'Qəhrəman', en: 'Hero', ru: 'Герой' }),
    awards: TX({ az: 'Mükafatlar', en: 'Awards', ru: 'Награды' }),
    bag: TX({ az: 'Çanta', en: 'Bag', ru: 'Сумка' })
  };
  const tabs = ['world', 'quests', 'hero', 'awards', 'bag'].map(k => `
    <div class="press" onclick="EQ.nav('${k}')" style="flex:1;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;height:72px">
      ${active === k ? `<div style="position:absolute;top:8px;left:8px;right:8px;height:56px;border-radius:20px;background:#7B5CFF;box-shadow:0 4px 0 #5B3FD6"></div>` : ''}
      ${icons[k]}
      <div style="position:relative;font:800 10px Nunito, system-ui;color:#fff;letter-spacing:0.2px">${labels[k]}</div>
    </div>`).join('');
  return `<div style="position:absolute;left:0;right:0;bottom:0;padding:0 12px 26px;display:flex;justify-content:center;z-index:40">
    <div style="width:100%;height:72px;border-radius:30px;background:rgba(30,21,54,0.94);box-shadow:0 -2px 0 rgba(255,255,255,0.10) inset, 0 14px 30px -8px rgba(12,6,28,0.7);display:flex;align-items:center;padding:0 6px">
      ${tabs}
    </div>
  </div>`;
};

/* Questy speech bubble (Questy always speaks from the lower left) */
EQC.bubble = function (mood, text, opts) {
  opts = opts || {};
  const w = opts.w || 76;
  const dark = opts.dark;
  const bg = dark ? 'rgba(30,21,54,0.9)' : '#FFF7EA';
  const fg = dark ? '#fff' : '#3E3160';
  const shadow = dark ? '' : 'box-shadow:0 4px 0 #E8D0A8;';
  return `<div style="display:flex;align-items:flex-end;gap:10px;${opts.style || ''}">
    ${EQC.questy(mood, `width:${w}px;flex:none`, EQ.s.questyFur, EQ.s.questyFurDark)}
    <div style="flex:1;background:${bg};border-radius:22px;border-bottom-left-radius:8px;padding:14px 16px;${shadow}">
      <div style="font:700 14px Nunito;color:${fg};line-height:1.5">${text}</div>
    </div>
  </div>`;
};
