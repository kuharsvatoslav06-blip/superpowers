// ============ globe: orthographic sphere rendered per pixel from equirectangular textures ============
const TEX = {};
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function loadGlobeTextures() {
  for (const [k, f] of [['day', 'assets/earth_day.jpg'], ['night', 'assets/earth_night.png'], ['cloud', 'assets/clouds.png']]) {
    const img = await loadImg(f), c = mk(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0);
    TEX[k] = { w: img.width, h: img.height, d: g.getImageData(0, 0, img.width, img.height).data };
  }
  // ocean mask from day texture (blue dominant)
  const d = TEX.day.d, n = TEX.day.w * TEX.day.h, m = new Uint8Array(n);
  for (let i = 0; i < n; i++) m[i] = d[i * 4 + 2] > d[i * 4] + 40 && d[i * 4 + 2] > d[i * 4 + 1] ? 1 : 0;
  TEX.ocean = m;
}
let GBUF = null;
// opts: rot (rad, longitude at centre, increases => Earth turns eastward), lat0 (tilt toward viewer, rad),
// roll (axial tilt on screen), cloudRot, cloudA, sun [x,y,z] view-space, night (city lights strength),
// res (pixel step), tint {col,a}, storm (0..1 extra cloud swirl), flood (0..1 coastal water creep)
function drawGlobe(ctx, cx, cy, R, o = {}) {
  const res = o.res || 2;
  const bx0 = Math.max(0, Math.floor(cx - R)), by0 = Math.max(0, Math.floor(cy - R)), bx1 = Math.min(W, Math.ceil(cx + R)), by1 = Math.min(H, Math.ceil(cy + R));
  if (bx1 <= bx0 || by1 <= by0) return;
  const bw = Math.ceil((bx1 - bx0) / res), bh = Math.ceil((by1 - by0) / res);
  if (!GBUF || GBUF.width < bw || GBUF.height < bh) { GBUF = mk(Math.max(bw, 980), Math.max(bh, 560)); }
  const g = GBUF.getContext('2d'); const img = g.createImageData(bw, bh), out = img.data;
  const D = TEX.day, N = TEX.night, C = TEX.cloud, OM = TEX.ocean, tw = D.w, th = D.h;
  const rot = o.rot || 0, lat0 = o.lat0 ?? 0.35, roll = o.roll || 0, crot = o.cloudRot ?? rot, cA = o.cloudA ?? 0.9, night = o.night ?? 1;
  let sun = o.sun || [-0.6, -0.35, 0.72]; const sl = Math.hypot(...sun); sun = sun.map(v => v / sl);
  const cl = Math.cos(lat0), sL = Math.sin(lat0), cr = Math.cos(roll), sr = Math.sin(roll);
  const ambient = o.ambient ?? 0.06, storm = o.storm || 0, ct = o.t || 0;
  for (let j = 0; j < bh; j++) {
    const py = by0 + j * res + res / 2;
    for (let i = 0; i < bw; i++) {
      const px = bx0 + i * res + res / 2;
      let x = (px - cx) / R, y = -(py - cy) / R; const r2 = x * x + y * y; const k = (j * bw + i) * 4;
      if (r2 >= 1) { out[k + 3] = 0; continue; }
      const z = Math.sqrt(1 - r2);
      // screen roll
      const xr = x * cr - y * sr, yr = x * sr + y * cr;
      // tilt toward viewer around x axis
      const y2 = yr * cl + z * sL, z2 = -yr * sL + z * cl;
      const lat = Math.asin(Math.max(-1, Math.min(1, y2))), lon = Math.atan2(xr, z2);
      const v = Math.min(th - 1, Math.max(0, ((0.5 - lat / PI) * th) | 0));
      const ul = lon + rot; let u = (((ul / TAU + 0.5) % 1) + 1) % 1; const ui = (u * tw) | 0;
      const ti = (v * tw + ui) * 4;
      let r = D.d[ti], gg = D.d[ti + 1], b = D.d[ti + 2];
      // lighting
      const sy = -y, ndl = x * sun[0] + sy * sun[1] + z * sun[2];
      const day = Math.max(0, Math.min(1, ndl * 2.2 + 0.25));
      let lum = ambient + (1 - ambient) * day * (0.55 + 0.45 * Math.max(0, ndl));
      // ocean specular
      if (OM[v * tw + ui]) { const hx = sun[0], hy = sun[1], hz = sun[2] + 1, hl = Math.hypot(hx, hy, hz); const sp = Math.pow(Math.max(0, (x * hx + sy * hy + z * hz) / hl), 60) * 0.5 * day; r += sp * 255; gg += sp * 240; b += sp * 220; }
      r *= lum; gg *= lum; b *= lum;
      // city lights on night side
      if (night > 0) { const nl = N.d[ti + 3] / 255 * (1 - day) * night; r += 255 * nl; gg += 200 * nl; b += 120 * nl; }
      // clouds
      if (cA > 0) {
        let uc = (((lon + crot) / TAU + 0.5) % 1 + 1) % 1; let vc = v;
        if (storm) { uc = (uc + Math.sin(lat * 9 + ct) * 0.01 * storm + 1) % 1; }
        const ci = (vc * tw + ((uc * tw) | 0)) * 4; let ca = C.d[ci + 3] / 255 * cA;
        if (storm) { const u2 = (uc + 0.37 + ct * 0.004) % 1, v2 = (v + 37) % th; ca = Math.min(1, ca * (1 + storm * 0.5) + C.d[(v2 * tw + ((u2 * tw) | 0)) * 4 + 3] / 255 * storm * 0.8); }
        const cl2 = (0.08 + 0.92 * day) * 255; r = r * (1 - ca) + cl2 * ca; gg = gg * (1 - ca) + cl2 * ca; b = b * (1 - ca) + (cl2 * 1.02) * ca;
      }
      // limb darkening + atmosphere tint at edge
      const rim = Math.pow(1 - z, 3);
      r = r * (1 - rim * 0.5) + 90 * rim * day; gg = gg * (1 - rim * 0.5) + 160 * rim * day; b = b * (1 - rim * 0.3) + 255 * rim * day;
      if (o.tint) { const ta = o.tint.a; r = r * (1 - ta) + o.tint.c[0] * ta; gg = gg * (1 - ta) + o.tint.c[1] * ta; b = b * (1 - ta) + o.tint.c[2] * ta; }
      out[k] = r > 255 ? 255 : r; out[k + 1] = gg > 255 ? 255 : gg; out[k + 2] = b > 255 ? 255 : b; out[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  // atmosphere halo
  const ha = o.halo ?? 1;
  if (ha > 0) { ctx.globalAlpha = ha; ctx.fillStyle = radial(ctx, cx, cy, R * 1.12, [[0, 'rgba(80,160,255,0)'], [0.86, 'rgba(80,160,255,0)'], [0.9, 'rgba(110,180,255,0.55)'], [1, 'rgba(80,160,255,0)']]); circ(ctx, cx, cy, R * 1.12); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
  ctx.drawImage(GBUF, 0, 0, bw, bh, bx0, by0, bw * res, bh * res);
  ctx.restore();
  // thin bright atmosphere line on the lit limb
  ctx.save(); ctx.strokeStyle = 'rgba(150,205,255,0.5)'; ctx.lineWidth = Math.max(2, R * 0.012); circ(ctx, cx, cy, R * 1.004); ctx.stroke(); ctx.restore();
}
// project lat/lon to screen for overlays (returns [x, y, visible z])
function globePt(cx, cy, R, lat, lon, o = {}) {
  const rot = o.rot || 0, lat0 = o.lat0 ?? 0.35, roll = o.roll || 0;
  const la = lat * PI / 180, lo = lon * PI / 180 - rot;  // texture lookup uses geoLon = screenLon + rot
  const x = Math.cos(la) * Math.sin(lo), y2 = Math.sin(la), z2 = Math.cos(la) * Math.cos(lo);
  const cl = Math.cos(lat0), sL = Math.sin(lat0);
  const yr = y2 * cl - z2 * sL, z = y2 * sL + z2 * cl;
  const cr = Math.cos(roll), sr = Math.sin(roll);
  const xs = x * cr + yr * sr, ys = -x * sr + yr * cr;
  return [cx + xs * R, cy - ys * R, z];
}
function spaceBg(ctx, t, a = 1) { ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, W, H); glow(ctx, W * 0.2, H * 0.3, 900, 'rgba(60,40,120,0.25)', a); glow(ctx, W * 0.85, H * 0.8, 800, 'rgba(20,70,140,0.22)', a); stars(ctx, 420, 77, t, a); }
