# -*- coding: utf-8 -*-
"""Drawing engine for "Кубическая чума": helpers, characters, both worlds."""
import math, random
import cairo
import numpy as np

W, H = 1920, 1080
FPS = 24

# ----------------------------------------------------------------- globals
G = {"t": 0.0, "boil": 0}          # global time / pencil boil frame


def set_time(t):
    G["t"] = t
    G["boil"] = int(t * 8)


# ----------------------------------------------------------------- math
def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def lerp(a, b, k):
    return a + (b - a) * k


def seg(t, a, b):
    if b == a:
        return 1.0 if t >= b else 0.0
    return clamp((t - a) / (b - a))


def ease(k):
    k = clamp(k)
    return k * k * (3 - 2 * k)


def eio(t, a, b):
    return ease(seg(t, a, b))


def eout(k):
    k = clamp(k)
    return 1 - (1 - k) ** 3


def ein(k):
    k = clamp(k)
    return k ** 3


def eback(k):
    k = clamp(k)
    c1 = 1.70158
    c3 = c1 + 1
    return 1 + c3 * (k - 1) ** 3 + c1 * (k - 1) ** 2


def hsh(i, s=0):
    v = math.sin(i * 127.1 + s * 311.7 + 0.5) * 43758.5453
    return v - math.floor(v)


def vnoise(x, s=0):
    i = math.floor(x)
    f = x - i
    a, b = hsh(i, s), hsh(i + 1, s)
    f = f * f * (3 - 2 * f)
    return a + (b - a) * f - 0.5


def rad(d):
    return d * math.pi / 180.0


def rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def mix(c1, c2, k):
    return tuple(lerp(a, b, k) for a, b in zip(c1, c2))


def shade(c, k):
    return tuple(clamp(x * k) for x in c)


# ----------------------------------------------------------------- palette
INK = (0.07, 0.07, 0.09)
PAPER = rgb('#f7f2e6')
PENCIL = (0.22, 0.22, 0.26)
CAP = rgb('#ffcc1a')
CAPD = rgb('#d99a00')
GRASS = rgb('#5fb33a')
GRASS_D = rgb('#3f8a28')
DIRT = rgb('#8a5a35')
DIRT_D = rgb('#6b4426')
STONE = rgb('#7d7d82')
STONE_D = rgb('#5e5e63')
SKY_DAY = (rgb('#5aa9f0'), rgb('#a9d8ff'))
SKY_NIGHT = (rgb('#101a4a'), rgb('#25307a'))
WOOD = rgb('#b98a52')
WOOD_D = rgb('#8a6236')
LEAF = rgb('#3f9a35')
LEAF_D = rgb('#2c7426')
CRACK = rgb('#bff6ff')
KIT = rgb('#ff9f43')
KIT_D = rgb('#d9772a')
CREEP = rgb('#4fbf55')


def src(cr, c, a=1.0):
    if len(c) == 4:
        cr.set_source_rgba(*c)
    else:
        cr.set_source_rgba(c[0], c[1], c[2], a)


# ----------------------------------------------------------------- paths
def poly(cr, pts, close=False):
    cr.move_to(*pts[0])
    for p in pts[1:]:
        cr.line_to(*p)
    if close:
        cr.close_path()


def resample(pts, step):
    out = [pts[0]]
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        d = math.hypot(x2 - x1, y2 - y1)
        n = max(1, int(d / step))
        for i in range(1, n + 1):
            out.append((x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n))
    return out


def plen(pts):
    return sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:]))


def partial(pts, f):
    """first fraction f of a polyline"""
    if f >= 1:
        return pts
    L = plen(pts) * max(f, 0)
    out = [pts[0]]
    acc = 0
    for a, b in zip(pts, pts[1:]):
        d = math.hypot(b[0] - a[0], b[1] - a[1])
        if acc + d >= L:
            k = (L - acc) / d if d else 0
            out.append((a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k))
            return out
        out.append(b)
        acc += d
    return out


def stairify(pts, g, origin=None):
    """turn a polyline into an orthogonal staircase on a grid of size g"""
    if g < 1.5:
        return pts
    ox, oy = origin if origin else pts[0]
    rs = resample(pts, g * 0.4)
    q = []
    for x, y in rs:
        p = (ox + round((x - ox) / g) * g, oy + round((y - oy) / g) * g)
        if not q or q[-1] != p:
            q.append(p)
    out = [q[0]]
    for p in q[1:]:
        a = out[-1]
        if a[0] != p[0] and a[1] != p[1]:
            out.append((p[0], a[1]))
        out.append(p)
    return out


def wobble(pts, amp=1.6, seed=0, step=14):
    if amp <= 0:
        return pts
    rs = resample(pts, step)
    b = G["boil"]
    out = []
    for i, (x, y) in enumerate(rs):
        out.append((x + amp * vnoise(i * 0.7, seed + b * 13), y + amp * vnoise(i * 0.7, seed + 77 + b * 13)))
    return out


def pline(cr, pts, w=4.0, c=PENCIL, a=1.0, seed=0, amp=1.4, close=False):
    """pencil line: wobbly double stroke"""
    if close:
        pts = list(pts) + [pts[0]]
    cr.set_line_cap(cairo.LINE_CAP_ROUND)
    cr.set_line_join(cairo.LINE_JOIN_ROUND)
    pp = wobble(pts, amp, seed)
    poly(cr, pp)
    src(cr, c, a)
    cr.set_line_width(w)
    cr.stroke()
    pp = wobble(pts, amp * 1.3, seed + 5)
    poly(cr, pp)
    src(cr, c, a * 0.35)
    cr.set_line_width(w * 0.5)
    cr.stroke()


def ellipse_pts(cx, cy, rx, ry, a0=0, a1=2 * math.pi, n=48):
    return [(cx + rx * math.cos(a0 + (a1 - a0) * i / n), cy + ry * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


def fill_poly(cr, pts, c, a=1.0):
    poly(cr, pts, True)
    src(cr, c, a)
    cr.fill()


def stroke_poly(cr, pts, c, w, a=1.0, close=False):
    cr.set_line_cap(cairo.LINE_CAP_ROUND)
    cr.set_line_join(cairo.LINE_JOIN_ROUND)
    poly(cr, pts, close)
    src(cr, c, a)
    cr.set_line_width(w)
    cr.stroke()


def circle(cr, x, y, r, c, a=1.0):
    cr.arc(x, y, r, 0, 2 * math.pi)
    src(cr, c, a)
    cr.fill()


def rect(cr, x, y, w, h, c, a=1.0):
    cr.rectangle(x, y, w, h)
    src(cr, c, a)
    cr.fill()


def glow(cr, x, y, r, c, a=1.0):
    g = cairo.RadialGradient(x, y, 0, x, y, r)
    g.add_color_stop_rgba(0, c[0], c[1], c[2], a)
    g.add_color_stop_rgba(1, c[0], c[1], c[2], 0)
    cr.set_source(g)
    cr.arc(x, y, r, 0, 2 * math.pi)
    cr.fill()


# ----------------------------------------------------------------- textures
_cache = {}


def surf_from_np(arr):
    """arr HxWx4 float rgba 0..1 -> cairo surface (premultiplied BGRA)"""
    h, w = arr.shape[:2]
    a = arr[..., 3:4]
    pm = np.concatenate([arr[..., 2:3] * a, arr[..., 1:2] * a, arr[..., 0:1] * a, a], axis=2)
    buf = np.ascontiguousarray((pm * 255).clip(0, 255).astype(np.uint8))
    s = cairo.ImageSurface(cairo.FORMAT_ARGB32, w, h)
    stride = s.get_stride()
    data = np.ndarray(shape=(h, stride // 4, 4), dtype=np.uint8, buffer=s.get_data())
    data[:, :w, :] = buf
    s.mark_dirty()
    return s


def paper_surface():
    if "paper" in _cache:
        return _cache["paper"]
    rng = np.random.default_rng(3)
    n = rng.normal(0, 1, (H // 4, W // 4))
    n = np.kron(n, np.ones((4, 4)))[:H, :W]
    fine = rng.normal(0, 1, (H, W))
    base = np.array(PAPER)
    v = (n * 0.012 + fine * 0.012)[..., None]
    yy = np.linspace(0, 1, H)[:, None, None]
    col = base[None, None, :] + v - (0.03 * (np.abs(np.linspace(-1, 1, W))[None, :, None] ** 3))
    col = col - 0.02 * yy
    arr = np.concatenate([np.clip(col, 0, 1), np.ones((H, W, 1))], axis=2)
    s = surf_from_np(arr)
    _cache["paper"] = s
    return s


def pix_tile(base, seed, n=8, size=64, var=0.10, spots=None):
    key = ("tile", base, seed, n, size, var, spots)
    if key in _cache:
        return _cache[key]
    rng = np.random.default_rng(seed)
    cells = 1 + rng.uniform(-var, var, (n, n))
    arr = np.ones((n, n, 4))
    arr[..., :3] = np.array(base)[None, None, :] * cells[..., None]
    if spots:
        sc, prob = spots
        m = rng.uniform(0, 1, (n, n)) < prob
        arr[m, :3] = np.array(sc)
    k = size // n
    arr = np.kron(arr, np.ones((k, k, 1)))
    s = surf_from_np(np.clip(arr, 0, 1))
    _cache[key] = s
    return s


def grass_tile(size=64, snow=False):
    key = ("grass", size)
    if key in _cache:
        return _cache[key]
    rng = np.random.default_rng(11)
    n = 8
    arr = np.ones((n, n, 4))
    d = np.array(DIRT)[None, None, :] * (1 + rng.uniform(-0.12, 0.12, (n, n)))[..., None]
    arr[..., :3] = d
    m = rng.uniform(0, 1, (n, n)) < 0.18
    arr[m, :3] = np.array(DIRT_D)
    g = np.array(GRASS)[None, :] * (1 + rng.uniform(-0.1, 0.1, (n, 1)))
    arr[0, :, :3] = g
    arr[1, :, :3] = np.array(GRASS)[None, :] * (1 + rng.uniform(-0.1, 0.1, (n, 1)))
    drip = rng.uniform(0, 1, n) < 0.45
    arr[2, drip, :3] = np.array(GRASS_D)
    k = size // n
    arr = np.kron(arr, np.ones((k, k, 1)))
    s = surf_from_np(np.clip(arr, 0, 1))
    _cache[key] = s
    return s


def tile_fill(cr, surf, x, y, w, h, ox=0, oy=0, a=1.0):
    cr.save()
    cr.rectangle(x, y, w, h)
    cr.clip()
    p = cairo.SurfacePattern(surf)
    p.set_extend(cairo.EXTEND_REPEAT)
    p.set_filter(cairo.FILTER_NEAREST)
    m = cairo.Matrix()
    m.translate(-ox, -oy)
    p.set_matrix(m)
    cr.set_source(p)
    cr.paint_with_alpha(a)
    cr.restore()


def block(cr, x, y, s, kind="grass", a=1.0, outline=True):
    """a single cube block, top-left at x,y, size s (front face)"""
    surf = {"grass": grass_tile(), "dirt": pix_tile(DIRT, 4, spots=(DIRT_D, 0.15)),
            "stone": pix_tile(STONE, 5, spots=(STONE_D, 0.2)), "wood": pix_tile(WOOD, 6),
            "leaf": pix_tile(LEAF, 7, spots=(LEAF_D, 0.3)), "plank": pix_tile(WOOD, 8, var=0.05),
            "black": pix_tile(INK, 9, var=0.4), "water": pix_tile(rgb('#3d7fe0'), 10, spots=(rgb('#6aa6ff'), 0.2)),
            "sand": pix_tile(rgb('#e3d08a'), 12), "gray": pix_tile(rgb('#c9c9c9'), 13),
            "lamp": pix_tile(rgb('#ffe27a'), 14, spots=(rgb('#fff6c8'), 0.3)),
            "red": pix_tile(rgb('#c0392b'), 15), "kit": pix_tile(KIT, 16, spots=(KIT_D, 0.2)),
            "creep": pix_tile(CREEP, 17, spots=(rgb('#2e8a3a'), 0.35)),
            "dark": pix_tile(rgb('#3a3a40'), 18), "purple": pix_tile(rgb('#7b4fbf'), 19),
            "zomb": pix_tile(rgb('#6f9b6a'), 20, spots=(rgb('#557f52'), 0.2)),
            "pink": pix_tile(rgb('#f3a5b8'), 21), "white": pix_tile(rgb('#f2f2f2'), 22),
            }[kind]
    cr.save()
    cr.translate(x, y)
    cr.scale(s / 64.0, s / 64.0)
    tile_fill(cr, surf, 0, 0, 64, 64, a=a)
    if outline:
        cr.rectangle(0, 0, 64, 64)
        cr.set_source_rgba(0, 0, 0, 0.25 * a)
        cr.set_line_width(2)
        cr.stroke()
    cr.restore()


def box(cr, x, y, w, h, c, a=1.0, edge=True, tex_seed=None):
    if tex_seed is not None:
        tile_fill(cr, pix_tile(c, tex_seed, var=0.12), x, y, w, h, ox=x, oy=y, a=a)
    else:
        rect(cr, x, y, w, h, c, a)
    if edge:
        u = max(2, min(w, h) * 0.1)
        rect(cr, x, y, w, u, (1, 1, 1), 0.18 * a)
        rect(cr, x, y + h - u, w, u, (0, 0, 0), 0.22 * a)
        cr.rectangle(x, y, w, h)
        cr.set_source_rgba(0, 0, 0, 0.35 * a)
        cr.set_line_width(2)
        cr.stroke()


# ----------------------------------------------------------------- stickman
DEF_POSE = dict(lean=0, ua_f=8, la_f=4, ua_b=-8, la_b=-4, th_f=6, sh_f=6, th_b=-6, sh_b=-6, hx=0, hy=0, y=0)


def pose(**kw):
    p = dict(DEF_POSE)
    p.update(kw)
    return p


def lerp_pose(a, b, k):
    return {key: lerp(a.get(key, DEF_POSE.get(key, 0)), b.get(key, DEF_POSE.get(key, 0)), k) for key in set(a) | set(b)}


def walk_pose(ph, amp=1.0):
    s = math.sin(ph)
    th_f = 26 * s * amp
    th_b = -26 * s * amp
    sh_f = th_f - 34 * max(0, math.cos(ph)) * amp
    sh_b = th_b - 34 * max(0, -math.cos(ph)) * amp
    return pose(lean=4 * amp, th_f=th_f, sh_f=sh_f, th_b=th_b, sh_b=sh_b,
                ua_f=-22 * s * amp, la_f=-22 * s * amp + 14, ua_b=22 * s * amp, la_b=22 * s * amp + 14,
                y=3 * abs(math.cos(ph)) * amp)


def run_pose(ph, amp=1.0):
    s = math.sin(ph)
    th_f = 48 * s * amp
    th_b = -48 * s * amp
    sh_f = th_f - 75 * max(0, math.cos(ph)) * amp - 10
    sh_b = th_b - 75 * max(0, -math.cos(ph)) * amp - 10
    return pose(lean=16 * amp, th_f=th_f, sh_f=sh_f, th_b=th_b, sh_b=sh_b,
                ua_f=-55 * s * amp, la_f=-55 * s * amp + 80, ua_b=55 * s * amp, la_b=55 * s * amp + 80,
                y=14 * abs(math.sin(ph)) * amp)


def idle_pose(t, k=1.0):
    b = math.sin(t * 2.2) * k
    return pose(ua_f=8 + b * 2, la_f=4 + b * 3, ua_b=-8 - b * 2, la_b=-4 - b * 3, hy=b * 1.5)


SCALE_BASE = dict(hr=34, torso=78, th=50, sh=50, ua=40, la=40, lw=13)


def lim(p, ang, L, face):
    a = rad(ang)
    return (p[0] + math.sin(a) * L * face, p[1] + math.cos(a) * L)


def stick_joints(x, gy, s, face, P, seat=None):
    d = SCALE_BASE
    TH, SH = d["th"] * s, d["sh"] * s
    ef = math.cos(rad(P["th_f"])) * TH + math.cos(rad(P["sh_f"])) * SH
    eb = math.cos(rad(P["th_b"])) * TH + math.cos(rad(P["sh_b"])) * SH
    hip_y = (gy - max(ef, eb) - P["y"] * s) if seat is None else seat
    hip = (x, hip_y)
    lean = rad(P["lean"])
    T = d["torso"] * s
    neck = (hip[0] + math.sin(lean) * T * face, hip[1] - math.cos(lean) * T)
    sho = (lerp(neck[0], hip[0], 0.08), lerp(neck[1], hip[1], 0.08))
    hr = d["hr"] * s
    head = (neck[0] + math.sin(lean) * (hr + 5 * s) * face + P["hx"] * s * face,
            neck[1] - math.cos(lean) * (hr + 5 * s) + P["hy"] * s)
    J = dict(hip=hip, neck=neck, sho=sho, head=head, hr=hr)
    J["kf"] = lim(hip, P["th_f"], TH, face)
    J["ff"] = lim(J["kf"], P["sh_f"], SH, face)
    J["kb"] = lim(hip, P["th_b"], TH, face)
    J["fb"] = lim(J["kb"], P["sh_b"], SH, face)
    UA, LA = d["ua"] * s, d["la"] * s
    J["ef"] = lim(sho, P["ua_f"], UA, face)
    J["hf"] = lim(J["ef"], P["la_f"], LA, face)
    J["eb"] = lim(sho, P["ua_b"], UA, face)
    J["hb"] = lim(J["eb"], P["la_b"], LA, face)
    return J


def draw_limb(cr, pts, lw, c, pixf=0.0, g=None, a=1.0):
    """draw limb polyline; last fraction pixf turned into stairs"""
    if pixf <= 0.001:
        stroke_poly(cr, pts, c, lw, a)
        return
    L = plen(pts)
    k = 1 - pixf
    sm = partial(pts, k)
    stroke_poly(cr, sm, c, lw, a)
    # remainder
    rem_start = sm[-1]
    rem = [rem_start]
    acc = 0
    target = L * k
    for p0, p1 in zip(pts, pts[1:]):
        d = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
        if acc + d > target:
            rem.append(p1)
        acc += d
    st = stairify(rem, g or lw * 1.25, origin=rem_start)
    cr.set_line_cap(cairo.LINE_CAP_SQUARE)
    cr.set_line_join(cairo.LINE_JOIN_MITER)
    poly(cr, st)
    src(cr, c, a)
    cr.set_line_width(lw)
    cr.stroke()


def eyes_on(cr, hx, hy, r, face, mode="normal", look=(1, 0), squarish=False, a=1.0):
    """white eyes on a black head"""
    if mode is None:
        return
    W_ = (1, 1, 1)
    ex = [hx + face * r * 0.1, hx + face * r * 0.55]
    ey = hy + r * 0.22
    er = r * 0.2
    lx, ly = look
    for i, x in enumerate(ex):
        rr = er * (0.85 if i == 0 else 1.0)
        if mode == "closed":
            stroke_poly(cr, [(x - rr, ey), (x + rr, ey)], W_, r * 0.09, a)
            continue
        if mode == "happy":
            cr.set_line_width(r * 0.1)
            cr.arc(x, ey + rr * 0.4, rr, math.pi * 1.1, math.pi * 1.9)
            src(cr, W_, a)
            cr.stroke()
            continue
        sy = 1.0
        if mode == "wide":
            rr *= 1.35
        if mode == "sad":
            sy = 0.7
        if mode == "squint":
            sy = 0.45
        cr.save()
        cr.translate(x, ey)
        cr.scale(1, 1.15 * sy)
        if squarish:
            rect(cr, -rr, -rr, 2 * rr, 2 * rr, W_, a)
        else:
            circle(cr, 0, 0, rr, W_, a)
        pr = rr * (0.32 if mode == "wide" else 0.55)
        px, py = lx * face * rr * 0.4, ly * rr * 0.35
        if squarish:
            rect(cr, px - pr, py - pr, 2 * pr, 2 * pr, INK, a)
        else:
            circle(cr, px, py, pr, INK, a)
        cr.restore()
        if mode == "sad":
            stroke_poly(cr, [(x - rr * 1.2, ey - rr * 1.1 + (0 if i else rr * 0.5) * 0), (x + rr * 1.1, ey - rr * 1.3 - (rr * 0.5 if i == 0 else -rr * 0.3))], W_, r * 0.07, a)
        if mode == "angry":
            stroke_poly(cr, [(x - rr * 1.1, ey - rr * 1.5 - (0 if i else 0)), (x + rr * 1.1, ey - rr * 1.0)] if face * (1 if i else -1) > 0 else
                        [(x - rr * 1.1, ey - rr * 1.0), (x + rr * 1.1, ey - rr * 1.5)], W_, r * 0.07, a)


def mouth_on(cr, hx, hy, r, face, mode=None, a=1.0, k=0.0):
    if not mode:
        return
    mx = hx + face * r * 0.4
    my = hy + r * 0.62
    W_ = (1, 1, 1)
    cr.set_line_width(r * 0.08)
    if mode == "smile":
        cr.arc(mx, my - r * 0.18, r * 0.22, math.pi * 0.2, math.pi * 0.8)
        src(cr, W_, a)
        cr.stroke()
    elif mode == "grin":
        cr.save()
        cr.translate(mx, my - r * 0.05)
        cr.scale(1, 0.7)
        cr.arc(0, 0, r * 0.28, 0, math.pi)
        cr.close_path()
        cr.restore()
        src(cr, W_, a)
        cr.fill()
    elif mode == "o":
        cr.save()
        cr.translate(mx, my)
        cr.scale(0.8, 1.0 + 0.3 * k)
        cr.arc(0, 0, r * 0.16, 0, 2 * math.pi)
        cr.restore()
        src(cr, W_, a)
        cr.fill()
    elif mode == "frown":
        cr.arc(mx, my + r * 0.12, r * 0.2, math.pi * 1.2, math.pi * 1.8)
        src(cr, W_, a)
        cr.stroke()
    elif mode == "flat":
        stroke_poly(cr, [(mx - r * 0.18, my), (mx + r * 0.18, my)], W_, r * 0.08, a)
    elif mode == "wavy":
        pts = [(mx - r * 0.25 + i * r * 0.05, my + math.sin(i * 1.6) * r * 0.05) for i in range(11)]
        stroke_poly(cr, pts, W_, r * 0.07, a)


def draw_cap(cr, hx, hy, r, face, a=1.0, tilt=0.0, small=False):
    cr.save()
    cr.translate(hx, hy - r * 0.22)
    cr.rotate(tilt * face)
    # dome
    cr.arc(0, -r * 0.05, r * 1.04, math.pi * 1.0, math.pi * 2.0)
    cr.close_path()
    src(cr, CAP, a)
    cr.fill()
    # button
    circle(cr, 0, -r * 1.07, r * 0.13, CAPD, a)
    # stripe
    cr.arc(0, -r * 0.05, r * 1.04, math.pi * 1.0, math.pi * 2.0)
    src(cr, CAPD, a)
    cr.set_line_width(r * 0.06)
    cr.stroke()
    # brim
    cr.move_to(face * r * 0.2, -r * 0.1)
    cr.line_to(face * r * 1.75, -r * 0.02)
    cr.line_to(face * r * 1.7, r * 0.12)
    cr.line_to(face * r * 0.2, r * 0.07)
    cr.close_path()
    src(cr, CAPD, a)
    cr.fill()
    cr.restore()


def draw_pencil(cr, x, y, ang, s=1.0, a=1.0):
    cr.save()
    cr.translate(x, y)
    cr.rotate(ang)
    L = 70 * s
    w = 11 * s
    rect(cr, -L * 0.75, -w / 2, L * 0.75, w, rgb('#ffcf3a'), a)
    rect(cr, -L * 0.75, -w / 2, L * 0.75, w * 0.33, rgb('#ffe27a'), a)
    rect(cr, -L * 0.9, -w / 2, L * 0.15, w, rgb('#f29bb0'), a)
    rect(cr, -L * 0.77, -w / 2, L * 0.05, w, rgb('#bbbbbb'), a)
    fill_poly(cr, [(0, -w / 2), (L * 0.22, 0), (0, w / 2)], rgb('#f4d9a6'), a)
    fill_poly(cr, [(L * 0.14, -w * 0.18), (L * 0.22, 0), (L * 0.14, w * 0.18)], INK, a)
    cr.restore()


def stickman(cr, x, gy, s=1.0, face=1, P=None, eyes="normal", look=(1, 0), mouth=None, mouthk=0.0,
             hat="cap", cap_a=1.0, pix=None, sq=None, bracelet=False, pencil=False, alpha=1.0,
             squash=1.0, rot=0.0, seat=None, color=INK, cube=0.0, hat_tilt=0.0):
    """Main stickman. pix: dict limb->fraction staircase; sq: dict 'f'/'b' -> square hand amount.
    Returns joints."""
    P = P or DEF_POSE
    P = dict(DEF_POSE, **P)
    J = stick_joints(x, gy, s, face, P, seat)
    pix = pix or {}
    sq = sq or {}
    lw = SCALE_BASE["lw"] * s
    cr.save()
    if squash != 1.0 or rot:
        cr.translate(J["hip"][0], J["hip"][1])
        cr.rotate(rot)
        cr.scale(max(squash, 0.002), 1)
        cr.translate(-J["hip"][0], -J["hip"][1])
    g = lw * 1.3
    if cube > 0:
        g = lw * (1 + cube * 1.2)
    limbs = [("ab", [J["sho"], J["eb"], J["hb"]]), ("lb", [J["hip"], J["kb"], J["fb"]]),
             ("t", [J["hip"], J["neck"]]), ("lf", [J["hip"], J["kf"], J["ff"]]),
             ("af", [J["sho"], J["ef"], J["hf"]])]
    for name, pts in limbs:
        pf = max(pix.get(name, 0), cube)
        if name[0] == "a":
            pf = max(pf, sq.get(name[1], 0) * 0.42)
        draw_limb(cr, pts, lw, color, pf, g, alpha)
        if name[0] == "a" and sq.get(name[1], 0) > 0:
            k = sq[name[1]]
            hx_, hy_ = J["h" + name[1]]
            bs = lw * 1.9 * k
            rect(cr, hx_ - bs / 2, hy_ - bs / 2, bs, bs, color, alpha)
            # pixel highlight
            rect(cr, hx_ - bs / 2 + bs * 0.12, hy_ - bs / 2 + bs * 0.12, bs * 0.25, bs * 0.25, (0.35, 0.35, 0.4), alpha * k)
        if name[0] == "a" and bracelet and name[1] == bracelet:
            e, h = J["e" + name[1]], J["h" + name[1]]
            wx, wy = lerp(e[0], h[0], 0.62), lerp(e[1], h[1], 0.62)
            ang = math.atan2(h[1] - e[1], h[0] - e[0])
            cr.save()
            cr.translate(wx, wy)
            cr.rotate(ang)
            cr.scale(0.45, 1)
            cr.arc(0, 0, lw * 0.95, 0, 2 * math.pi)
            cr.restore()
            src(cr, rgb('#ff5a36'), alpha)
            cr.set_line_width(lw * 0.38)
            cr.stroke()
    hx, hy = J["head"]
    hr = J["hr"]
    if cube > 0.5:
        rect(cr, hx - hr, hy - hr, 2 * hr, 2 * hr, color, alpha)
    else:
        circle(cr, hx, hy, hr, color, alpha)
        if cube > 0:
            cr.save()
            cr.rectangle(hx - hr, hy - hr, 2 * hr, 2 * hr)
            src(cr, color, alpha * cube * 2)
            cr.fill()
            cr.restore()
    if pencil:
        hxp, hyp = J["hf"]
        ex_, ey_ = J["ef"]
        ang = math.atan2(hyp - ey_, hxp - ex_)
        draw_pencil(cr, hxp, hyp, ang - 0.3 * face, s * 0.9, alpha)
    if eyes:
        eyes_on(cr, hx, hy, hr, face, eyes, look, squarish=cube > 0.5, a=alpha)
    mouth_on(cr, hx, hy, hr, face, mouth, alpha, mouthk)
    if hat == "cap" and cap_a > 0:
        draw_cap(cr, hx, hy, hr, face, alpha * cap_a, hat_tilt)
    elif hat == "bow":
        bx, by = hx - face * hr * 0.5, hy - hr * 0.9
        fill_poly(cr, [(bx, by), (bx - hr * 0.5, by - hr * 0.3), (bx - hr * 0.5, by + hr * 0.3)], rgb('#e84a6f'), alpha)
        fill_poly(cr, [(bx, by), (bx + hr * 0.5, by - hr * 0.3), (bx + hr * 0.5, by + hr * 0.3)], rgb('#e84a6f'), alpha)
        circle(cr, bx, by, hr * 0.14, rgb('#b8304f'), alpha)
    elif hat == "top":
        rect(cr, hx - hr * 0.7, hy - hr * 1.9, hr * 1.4, hr * 1.1, INK, alpha)
        rect(cr, hx - hr * 1.1, hy - hr * 0.9, hr * 2.2, hr * 0.18, INK, alpha)
        rect(cr, hx - hr * 0.7, hy - hr * 1.05, hr * 1.4, hr * 0.15, rgb('#c0392b'), alpha)
    elif hat == "scarf":
        nx, ny = J["neck"]
        stroke_poly(cr, [(nx - hr * 0.6, ny + 2), (nx + hr * 0.6, ny + 2)], rgb('#3fa7d6'), lw * 0.9, alpha)
        stroke_poly(cr, [(nx - face * hr * 0.3, ny + 2), (nx - face * hr * 0.9, ny + hr * 0.9)], rgb('#3fa7d6'), lw * 0.7, alpha)
    elif hat == "beanie":
        cr.arc(hx, hy - hr * 0.1, hr * 1.02, math.pi, 2 * math.pi)
        cr.close_path()
        src(cr, rgb('#8e5bd6'), alpha)
        cr.fill()
        circle(cr, hx, hy - hr * 1.15, hr * 0.22, rgb('#c9a7ff'), alpha)
    cr.restore()
    return J


# ----------------------------------------------------------------- emotes
def surprise_lines(cr, x, y, s=1.0, a=1.0, c=INK, k=1.0):
    for i, ang in enumerate([-55, -20, 15]):
        r0, r1 = 0, 34 * s * k
        an = rad(ang - 90)
        dx, dy = math.cos(an), math.sin(an)
        stroke_poly(cr, [(x + dx * 10 * s, y + dy * 10 * s), (x + dx * (10 * s + r1), y + dy * (10 * s + r1))], c, 6 * s, a)


def sweat(cr, x, y, s=1.0, a=1.0):
    cr.save()
    cr.translate(x, y)
    cr.scale(s, s)
    cr.move_to(0, -14)
    cr.curve_to(8, -2, 9, 8, 0, 9)
    cr.curve_to(-9, 8, -8, -2, 0, -14)
    src(cr, rgb('#7cc6ff'), a)
    cr.fill_preserve()
    src(cr, rgb('#2a6fb0'), a)
    cr.set_line_width(2)
    cr.stroke()
    cr.restore()


def heart(cr, x, y, s=1.0, a=1.0, c=None):
    c = c or rgb('#ff4f7a')
    # pixel heart
    pat = ["01100110", "11111111", "11111111", "01111110", "00111100", "00011000"]
    u = 5 * s
    for j, row in enumerate(pat):
        for i, ch in enumerate(row):
            if ch == "1":
                rect(cr, x + (i - 4) * u, y + (j - 3) * u, u + 0.5, u + 0.5, c, a)


def qmark(cr, x, y, s=1.0, a=1.0, c=INK):
    cr.save()
    cr.translate(x, y)
    cr.scale(s, s)
    cr.set_line_width(7)
    cr.set_line_cap(cairo.LINE_CAP_ROUND)
    cr.arc(0, -14, 13, math.pi * 1.05, math.pi * 2.35)
    cr.line_to(0, 8)
    src(cr, c, a)
    cr.stroke()
    circle(cr, 0, 22, 4.5, c, a)
    cr.restore()


def excl(cr, x, y, s=1.0, a=1.0, c=INK):
    stroke_poly(cr, [(x, y - 26 * s), (x, y + 4 * s)], c, 8 * s, a)
    circle(cr, x, y + 18 * s, 5 * s, c, a)


# ----------------------------------------------------------------- dog (Точка)
def dog(cr, x, gy, s=1.0, face=1, ph=0.0, moving=0.0, cube=0.0, tail_cube=0.0, eyes="normal",
        look=(1, 0), sit=0.0, jump=0.0, shake=0.0, alpha=1.0, mouth=None, tail_wag=1.0, sniff=0.0, ears=0.0, paw=0.0):
    cr.save()
    cr.translate(x, gy - jump * s)
    cr.scale(face * s, s)
    if shake:
        cr.translate(math.sin(shake * 40) * 6 * min(1, shake * 3), 0)
    lw = 8
    t = G["t"]
    legL = 26
    body_y = -legL - 8 + sit * 6
    head_x = 34 + sniff * 10
    head_y = body_y - 22 + sit * -6 + sniff * 26
    hr = 17
    if cube < 0.999:
        a = alpha * (1 - cube)
        # legs
        for i, (lx, phase) in enumerate([(-24, 0), (-14, math.pi), (16, math.pi), (26, 0)]):
            sw = math.sin(ph + phase) * 22 * moving
            if lx == 26 and paw > 0:
                sw = lerp(sw, -75, paw)
            if sit > 0 and lx < 0:
                pts = [(lx, body_y + 2), (lx + 10 * sit, -4), (lx + 18 * sit, -2)]
            else:
                pts = [(lx, body_y), (lx + math.sin(rad(sw)) * legL, body_y + math.cos(rad(sw)) * legL + 6)]
            stroke_poly(cr, pts, INK, lw, a)
        # body
        stroke_poly(cr, [(-28, body_y + sit * 8), (24, body_y - sit * 10)], INK, lw * 1.5, a)
        # neck
        stroke_poly(cr, [(22, body_y - sit * 10), (head_x - 6, head_y + 6)], INK, lw, a)
        # tail
        wag = math.sin(t * 14) * 18 * tail_wag
        tb = (-28, body_y + sit * 8)
        tpts = [tb, (tb[0] - 12, tb[1] - 10 - wag * 0.2), (tb[0] - 14 + wag * 0.3, tb[1] - 26)]
        tpts = resample(tpts, 3)
        if tail_cube > 0:
            draw_limb(cr, tpts, lw, INK, tail_cube, 9, a)
            if tail_cube > 0.95:
                rect(cr, tpts[-1][0] - 7, tpts[-1][1] - 7, 14, 14, INK, a)
        else:
            stroke_poly(cr, tpts, INK, lw, a)
        # head
        circle(cr, head_x, head_y, hr, INK, a)
        # ears
        fill_poly(cr, [(head_x - 10, head_y - 10), (head_x - 16 - ears * 6, head_y - 26 + ears * 16), (head_x - 2, head_y - 15)], INK, a)
        fill_poly(cr, [(head_x + 2, head_y - 15), (head_x + 4 - ears * 4, head_y - 30 + ears * 18), (head_x + 12, head_y - 11)], INK, a)
        # snout
        circle(cr, head_x + 15, head_y + 5, 7, INK, a)
        circle(cr, head_x + 21, head_y + 2, 3.2, (0.3, 0.3, 0.33), a)
        # collar
        stroke_poly(cr, [(head_x - 10, head_y + 13), (head_x + 2, head_y + 17)], rgb('#e03b3b'), 6, a)
        if eyes:
            eyes_on(cr, head_x - 2, head_y + 1, hr, 1, eyes, look, a=a)
        if mouth == "tongue":
            fill_poly(cr, [(head_x + 12, head_y + 11), (head_x + 18, head_y + 11), (head_x + 15, head_y + 20)], rgb('#ff6f91'), a)
    if cube > 0.001:
        a = alpha * cube
        jit = (1 - cube) * 6
        u = 10
        # legs as blocks
        for i, (lx, phase) in enumerate([(-28, 0), (-16, math.pi), (12, math.pi), (24, 0)]):
            step = math.floor(math.sin(ph + phase) * 2 * moving + 0.5) * 4
            lh = 22 if not (sit > 0 and lx < 0) else 8
            if lx == 24 and paw > 0:
                rect(cr, lx, body_y - 2, 26 * paw + u, u, INK, a)
                continue
            rect(cr, lx + step - u / 2, body_y + 6 + (22 - lh), u, lh, INK, a)
        rect(cr, -32, body_y - 12, 62, 22, INK, a)
        rect(cr, -26, body_y - 9, 14, 5, (0.3, 0.3, 0.34), a)
        # tail blocks
        wq = math.floor(math.sin(t * 6) * 1.5 * tail_wag + 0.5) * 5
        rect(cr, -42, body_y - 20, 12, 12, INK, a)
        rect(cr, -48 + wq, body_y - 32, 12, 12, INK, a)
        # head block
        hx0, hy0 = head_x - 18, head_y - 18
        rect(cr, hx0, hy0, 36, 34, INK, a)
        rect(cr, hx0 + 30, hy0 + 14, 14, 14, INK, a)  # snout
        rect(cr, hx0 + 40, hy0 + 14, 5, 5, (0.3, 0.3, 0.33), a)
        rect(cr, hx0 + 2, hy0 - 10 + ears * 8, 9, 12, INK, a)
        rect(cr, hx0 + 20, hy0 - 12 + ears * 9, 9, 13, INK, a)
        rect(cr, hx0 + 2, hy0 + 32, 26, 5, rgb('#e03b3b'), a)
        if eyes:
            eyes_on(cr, head_x - 2, head_y, hr, 1, eyes, look, squarish=True, a=a)
        if mouth == "tongue":
            rect(cr, hx0 + 34, hy0 + 27, 7, 9, rgb('#ff6f91'), a)
    cr.restore()


# ----------------------------------------------------------------- kitten (Пиксель)
def kitten(cr, x, gy, s=1.0, face=1, ph=0.0, moving=0.0, eyes="normal", look=(1, 0), ears_down=0.0,
           cap=0.0, blink=False, alpha=1.0, jump=0.0, tilt=0.0, purr=0.0, nod=0.0, mouth=None, headshake=0.0,
           paw_up=0.0):
    cr.save()
    cr.translate(x, gy - jump * s)
    cr.scale(face * s, s)
    cr.rotate(tilt)
    if purr:
        cr.translate(0, math.sin(G["t"] * 50) * 1.2 * purr)
    a = alpha
    # tail
    tw = math.floor(math.sin(G["t"] * 3) * 1.5 + 0.5) * 6
    box(cr, -58, -60, 14, 14, KIT, a)
    box(cr, -66 + tw * 0.5, -76, 14, 18, KIT, a)
    box(cr, -70 + tw, -94, 14, 18, KIT_D, a)
    # legs
    for lx, phs in [(-42, 0), (-26, math.pi), (14, math.pi), (30, 0)]:
        st = math.floor(math.sin(ph + phs) * 1.6 * moving + 0.5) * 5
        lift = paw_up * 22 if lx == 30 else 0
        box(cr, lx + st, -24 - lift, 14, 24, KIT_D if lx in (-26, 14) else KIT, a)
    # body
    box(cr, -50, -62, 98, 40, KIT, a, tex_seed=31)
    for sx in (-30, -10, 10):
        rect(cr, sx, -62, 8, 14, KIT_D, a)
    rect(cr, -10, -30, 50, 8, rgb('#ffd7a8'), a * 0.9)
    # head
    hb = nod * 10
    hsx = math.sin(headshake * 30) * 10 * min(1, headshake * 4) if headshake else 0
    hx, hy = 30 + hsx, -112 + hb
    ed = ears_down
    # ears
    cr.save()
    cr.translate(hx + 8, hy + 6)
    cr.rotate(-ed * 1.1)
    box(cr, -2, -20, 16, 20, KIT_D, a)
    rect(cr, 2, -14, 8, 10, rgb('#f3a5b8'), a)
    cr.restore()
    cr.save()
    cr.translate(hx + 50, hy + 6)
    cr.rotate(ed * 1.1)
    box(cr, -14, -20, 16, 20, KIT_D, a)
    rect(cr, -10, -14, 8, 10, rgb('#f3a5b8'), a)
    cr.restore()
    box(cr, hx, hy, 66, 56, KIT, a, tex_seed=32)
    rect(cr, hx + 4, hy + 2, 6, 6, KIT_D, a)
    rect(cr, hx + 28, hy + 2, 10, 8, KIT_D, a)
    # muzzle
    rect(cr, hx + 22, hy + 34, 26, 16, rgb('#ffe3c2'), a)
    rect(cr, hx + 31, hy + 34, 8, 6, rgb('#ff7fa0'), a)
    if mouth == "open":
        rect(cr, hx + 30, hy + 42, 10, 6, rgb('#6a2633'), a)
    # eyes: big
    lx, ly = look
    for ex in (hx + 8, hx + 42):
        if blink or eyes == "closed":
            rect(cr, ex, hy + 22, 18, 4, INK, a)
            continue
        if eyes == "happy":
            rect(cr, ex, hy + 22, 6, 4, INK, a)
            rect(cr, ex + 6, hy + 18, 6, 4, INK, a)
            rect(cr, ex + 12, hy + 22, 6, 4, INK, a)
            continue
        eh = 22 if eyes != "sad" else 16
        ey0 = hy + 12 + (22 - eh)
        rect(cr, ex, ey0, 18, eh, (1, 1, 1), a)
        pw = 10 if eyes != "wide" else 6
        px = ex + 4 + lx * 3 + (2 if eyes == "wide" else 0)
        py = ey0 + 6 + ly * 3
        rect(cr, px, py, pw, 12 if eyes != "sad" else 9, INK, a)
        rect(cr, px + 1, py + 1, 4, 4, (1, 1, 1), a)
        if eyes == "sad":
            rect(cr, ex - 2, ey0 - 5, 20, 4, KIT_D, a)
    if cap > 0:
        # tiny yellow cap on top of the head
        cx, cy = hx + 33, hy - 2
        cr.save()
        cr.translate(cx, cy)
        cr.rotate(-0.12)
        cr.scale(0.62, 0.62)
        cr.arc(0, 0, 30, math.pi, 2 * math.pi)
        cr.close_path()
        src(cr, CAP, a * cap)
        cr.fill()
        circle(cr, 0, -31, 4, CAPD, a * cap)
        fill_poly(cr, [(6, -4), (56, 0), (54, 7), (6, 4)], CAPD, a * cap)
        cr.restore()
    cr.restore()
    return (x + face * s * (hx + 33), gy - jump * s + s * (hy + 28))


# ----------------------------------------------------------------- mobs (own style)
def zombie(cr, x, gy, s=1.0, face=1, ph=0.0, moving=1.0, alpha=1.0, glow_eyes=False):
    cr.save()
    cr.translate(x, gy)
    cr.scale(face * s, s)
    a = alpha
    st = math.sin(ph)
    # legs
    box(cr, -22 + st * 8 * moving, -70, 20, 70, rgb('#4a3f6b'), a)
    box(cr, 2 - st * 8 * moving, -70, 20, 70, rgb('#3c3358'), a)
    # torso: ragged purple shirt
    box(cr, -26, -150, 52, 82, rgb('#7d4fa0'), a, tex_seed=40)
    fill_poly(cr, [(-26, -72), (-18, -62), (-10, -72), (0, -60), (10, -72), (20, -62), (26, -72)], rgb('#7d4fa0'), a)
    # arms forward
    sw = math.sin(ph * 0.5) * 4
    box(cr, 10, -146 + sw, 70, 18, rgb('#6f9b6a'), a)
    box(cr, -6, -126 - sw, 70, 18, rgb('#5f8a5a'), a)
    # head
    box(cr, -24, -206, 52, 54, rgb('#6f9b6a'), a, tex_seed=41)
    rect(cr, 8, -188, 14, 12, INK, a)
    rect(cr, -10, -186, 9, 8, INK, a)
    if glow_eyes:
        rect(cr, 12, -185, 6, 5, rgb('#ffef7a'), a)
        rect(cr, -7, -184, 4, 4, rgb('#ffef7a'), a)
    rect(cr, -4, -166, 26, 6, rgb('#2f4a2c'), a)
    rect(cr, -24, -206, 52, 8, rgb('#3a5a37'), a)
    cr.restore()


def spider(cr, x, gy, s=1.0, face=1, ph=0.0, moving=1.0, alpha=1.0, rot=0.0, hurt=0.0):
    cr.save()
    cr.translate(x, gy)
    cr.scale(face * s, s)
    cr.rotate(rot)
    a = alpha
    body = rgb('#2b2530')
    # legs (4 visible pairs)
    for i in range(4):
        lx = -40 + i * 26
        k = math.sin(ph + i * 1.3) * 10 * moving
        for side, col in ((1, rgb('#1d1820')), (-1, rgb('#3a3240'))):
            st = [(lx, -50), (lx + side * 22 + k * side * 0.5, -92), (lx + side * 44 + k, -0)]
            cr.set_line_cap(cairo.LINE_CAP_SQUARE)
            cr.set_line_join(cairo.LINE_JOIN_MITER)
            poly(cr, st)
            src(cr, col, a)
            cr.set_line_width(9)
            cr.stroke()
    box(cr, -70, -80, 80, 54, body, a, tex_seed=42)
    box(cr, 4, -84, 60, 58, rgb('#352d3b'), a, tex_seed=43)
    # many red eyes
    for ex, ey, sz in [(40, -70, 9), (52, -70, 9), (30, -58, 6), (46, -56, 7), (56, -58, 5), (36, -46, 5)]:
        rect(cr, ex, ey, sz, sz, rgb('#ff3030') if not hurt else (1, 1, 1), a)
    cr.restore()


def hisser(cr, x, gy, s=1.0, face=1, ph=0.0, moving=1.0, alpha=1.0, swell=0.0, flash=0.0):
    """green hissing mob, own design: bushy block body on four stubby legs, slit eyes, zigzag mouth"""
    cr.save()
    cr.translate(x, gy)
    sc = 1 + swell * 0.25
    cr.scale(face * s * sc, s * sc)
    a = alpha
    st = math.floor(math.sin(ph) * 1.5 * moving + 0.5) * 5
    for lx, sg in [(-40, 1), (-16, -1), (12, 1), (34, -1)]:
        box(cr, lx + st * sg, -34, 18, 34, rgb('#3e9a46'), a)
    box(cr, -46, -150, 100, 120, CREEP, a, tex_seed=44)
    # leafy tufts on top
    for i, tx in enumerate([-46, -26, -6, 14, 34]):
        h = 10 + (i % 2) * 8
        box(cr, tx, -150 - h, 20, h, rgb('#3fae47') if i % 2 else CREEP, a)
    # face: slit eyes + zigzag mouth (distinct design)
    rect(cr, -24, -116, 26, 8, INK, a)
    rect(cr, 14, -116, 26, 8, INK, a)
    rect(cr, -16, -112, 8, 6, rgb('#ffe066'), a)
    rect(cr, 24, -112, 8, 6, rgb('#ffe066'), a)
    zz = [(-26, -78), (-16, -88), (-6, -78), (4, -88), (14, -78), (24, -88), (34, -78)]
    stroke_poly(cr, zz, INK, 7, a)
    if flash > 0:
        rect(cr, -48, -170, 104, 172, (1, 1, 1), a * flash)
    cr.restore()


def cow(cr, x, gy, s=1.0, face=1, ph=0.0, moving=1.0, alpha=1.0):
    cr.save()
    cr.translate(x, gy)
    cr.scale(face * s, s)
    a = alpha
    st = math.floor(math.sin(ph) * 1.5 * moving + 0.5) * 5
    for lx, sg in [(-70, 1), (-46, -1), (36, 1), (60, -1)]:
        box(cr, lx + st * sg, -60, 22, 60, rgb('#e8e4dc'), a)
        rect(cr, lx + st * sg, -10, 22, 10, rgb('#4a3a2e'), a)
    box(cr, -84, -150, 170, 92, rgb('#f2eee6'), a)
    for (bx, by, bw, bh) in [(-70, -150, 50, 40), (10, -120, 46, 40), (-40, -100, 30, 30)]:
        rect(cr, bx, by, bw, bh, rgb('#5a3b2a'), a)
    box(cr, 70, -186, 64, 64, rgb('#f2eee6'), a)
    rect(cr, 70, -186, 30, 30, rgb('#5a3b2a'), a)
    box(cr, 100, -146, 40, 26, rgb('#f0b8a8'), a)
    rect(cr, 108, -138, 6, 6, INK, a)
    rect(cr, 126, -138, 6, 6, INK, a)
    rect(cr, 84, -170, 10, 12, INK, a)
    rect(cr, 112, -170, 10, 12, INK, a)
    box(cr, 64, -198, 12, 14, rgb('#d9d2b5'), a)
    box(cr, 128, -198, 12, 14, rgb('#d9d2b5'), a)
    rect(cr, -40, -62, 26, 10, rgb('#f0b8a8'), a)
    cr.restore()


# ----------------------------------------------------------------- flat (paper) world
def paper_bg(cr, tint=None, a=1.0):
    cr.save()
    cr.identity_matrix()
    cr.set_source_surface(paper_surface(), 0, 0)
    cr.paint_with_alpha(a)
    if tint:
        rect(cr, 0, 0, W, H, tint[:3], tint[3])
    cr.restore()


def flat_sun(cr, x, y, r=70, a=1.0):
    circle(cr, x, y, r, rgb('#ffe9a3'), a * 0.9)
    pline(cr, ellipse_pts(x, y, r, r), 4, rgb('#e0a52a'), a, seed=3)
    for i in range(10):
        an = i * math.pi / 5 + G["t"] * 0.15
        pline(cr, [(x + math.cos(an) * (r + 16), y + math.sin(an) * (r + 16)),
                   (x + math.cos(an) * (r + 46), y + math.sin(an) * (r + 46))], 4, rgb('#e0a52a'), a, seed=10 + i)


def flat_cloud(cr, x, y, s=1.0, a=1.0, seed=0):
    pts = []
    bumps = [(0, 0, 40), (45, -18, 48), (95, -6, 40), (130, 8, 30)]
    for bx, by, br in bumps:
        circle(cr, x + bx * s, y + by * s, br * s, (1, 1, 1), a * 0.85)
    for bx, by, br in bumps:
        pline(cr, ellipse_pts(x + bx * s, y + by * s, br * s, br * s, math.pi * 0.95, math.pi * 2.05, 18), 3, PENCIL, a * 0.7, seed=seed + bx)
    pline(cr, [(x - 40 * s, y + 18 * s), (x + 160 * s, y + 18 * s)], 3, PENCIL, a * 0.6, seed=seed + 9)


HOUSE_COLS = [rgb('#f6c9a8'), rgb('#bfe0f2'), rgb('#f7e39b'), rgb('#d7c6f2'), rgb('#c9ecc0'), rgb('#f4b6c2')]
ROOF_COLS = [rgb('#d0604a'), rgb('#4a7ec9'), rgb('#c98a3a'), rgb('#7a5ac0'), rgb('#4f9a4a'), rgb('#c94a6a')]


def flat_house_pts(x, w, h):
    body = [(x - w / 2, 0), (x - w / 2, -h), (x + w / 2, -h), (x + w / 2, 0)]
    roof = [(x - w / 2 - 18, -h), (x, -h - w * 0.45), (x + w / 2 + 18, -h)]
    return body, roof


def flat_house(cr, x, w, h, ci, a=1.0, g=0.0, seed=0):
    body, roof = flat_house_pts(x, w, h)
    st = (lambda p, close=False: stairify(p + ([p[0]] if close else []), g, origin=(x, 0)) if g > 1.5 else (p + ([p[0]] if close else [])))
    fill_poly(cr, st(body, True), HOUSE_COLS[ci % 6], a * 0.75)
    fill_poly(cr, st(roof, True), ROOF_COLS[ci % 6], a * 0.55)
    pline(cr, st(body), 4.5, PENCIL, a, seed=seed, amp=1.4 if g < 1.5 else 0)
    pline(cr, st(roof), 4.5, PENCIL, a, seed=seed + 1, amp=1.4 if g < 1.5 else 0)
    # door & windows
    dw, dh = w * 0.18, h * 0.38
    door = [(x - dw / 2, 0), (x - dw / 2, -dh), (x + dw / 2, -dh), (x + dw / 2, 0)]
    fill_poly(cr, st(door), rgb('#a8784f'), a * 0.6)
    pline(cr, st(door), 3.5, PENCIL, a, seed=seed + 2, amp=1.2 if g < 1.5 else 0)
    for wx in (x - w * 0.3, x + w * 0.3):
        win = [(wx - 20, -h * 0.55), (wx + 20, -h * 0.55), (wx + 20, -h * 0.55 - 34), (wx - 20, -h * 0.55 - 34)]
        fill_poly(cr, st(win, True), rgb('#e9f6ff'), a * 0.9)
        pline(cr, st(win, True), 3.5, PENCIL, a, seed=seed + 3 + int(wx), amp=1.2 if g < 1.5 else 0)
        pline(cr, st([(wx, -h * 0.55), (wx, -h * 0.55 - 34)]), 2.5, PENCIL, a, seed=seed + 5, amp=1 if g < 1.5 else 0)


def cube_house(cr, x, w, h, ci, a=1.0, grow=1.0):
    B = 32
    nx = max(3, int(round(w / B)))
    ny = max(3, int(round(h / B)))
    x0 = x - nx * B / 2
    rows = int(math.ceil(ny * grow))
    for j in range(rows):
        for i in range(nx):
            block(cr, x0 + i * B, -(j + 1) * B, B, "plank" if (i + j) % 7 else "wood", a, outline=False)
    if grow >= 1:
        # roof stairs
        rc = ROOF_COLS[ci % 6]
        for k in range(nx // 2 + 2):
            ww = nx + 2 - 2 * k
            if ww <= 0:
                break
            box(cr, x0 - B + k * B, -(ny + 1 + k) * B, ww * B, B, shade(rc, 0.9), a, tex_seed=50 + ci)
        # door / windows
        box(cr, x - B / 2, -2 * B, B, 2 * B, rgb('#5a3b22'), a)
        for wx in (x0 + B * 0.5, x0 + (nx - 1.5) * B):
            box(cr, wx, -(ny * 0.6 + 1) * B, B, B, rgb('#9fd3ff'), a)


def flat_tree(cr, x, h, a=1.0, g=0.0, seed=0, sway=0.0):
    st = (lambda p: stairify(p, g, origin=(x, 0)) if g > 1.5 else p)
    cy = -h
    rr = h * 0.36
    crown = ellipse_pts(x + sway, cy, rr, rr * 0.95, n=40)
    fill_poly(cr, st(crown), rgb('#a8d98a'), a * 0.7)
    pline(cr, st([(x - 9, 0), (x - 7, cy + rr * 0.7)]), 4.5, PENCIL, a, seed=seed, amp=1.2 if g < 1.5 else 0)
    pline(cr, st([(x + 9, 0), (x + 7, cy + rr * 0.7)]), 4.5, PENCIL, a, seed=seed + 1, amp=1.2 if g < 1.5 else 0)
    pline(cr, st(crown), 4.5, PENCIL, a, seed=seed + 2, amp=1.4 if g < 1.5 else 0)
    if g < 1.5:
        for i in range(4):
            an = i * 1.5 + seed
            pline(cr, ellipse_pts(x + sway + math.cos(an) * rr * 0.45, cy + math.sin(an) * rr * 0.4, rr * 0.18, rr * 0.12, 3.6, 5.8, 8), 3, PENCIL, a * 0.6, seed=seed + 7 + i)


def cube_tree(cr, x, h, a=1.0, grow=1.0):
    B = 32
    tn = max(2, int(h * 0.55 / B))
    for j in range(tn):
        block(cr, x - B / 2, -(j + 1) * B, B, "wood", a)
    if grow > 0.4:
        top = -(tn + 1) * B
        for (i, j) in [(-2, 0), (-1, 0), (0, 0), (1, 0), (2, 0), (-2, -1), (-1, -1), (0, -1), (1, -1), (2, -1), (-1, -2), (0, -2), (1, -2), (0, -3)]:
            block(cr, x - B / 2 + i * B, top + j * B, B, "leaf", a)


def flat_lamp(cr, x, a=1.0, g=0.0, seed=0):
    st = (lambda p: stairify(p, g, origin=(x, 0)) if g > 1.5 else p)
    pline(cr, st([(x, 0), (x, -230), (x + 30, -250), (x + 55, -240)]), 5, PENCIL, a, seed=seed, amp=1.2 if g < 1.5 else 0)
    shade_ = [(x + 40, -240), (x + 70, -240), (x + 64, -222), (x + 46, -222)]
    fill_poly(cr, st(shade_ + [shade_[0]]), rgb('#ffe99a'), a * 0.8)
    pline(cr, st(shade_ + [shade_[0]]), 3.5, PENCIL, a, seed=seed + 1, amp=1 if g < 1.5 else 0)


def cube_lamp(cr, x, a=1.0):
    B = 24
    for j in range(9):
        block(cr, x - B / 2, -(j + 1) * B, B, "dark", a, outline=False)
    box(cr, x - B / 2, -10 * B, 3 * B, B, rgb('#3a3a40'), a)
    block(cr, x + B, -9 * B, B, "lamp", a)


def flat_bench(cr, x, a=1.0, g=0.0, seed=0):
    st = (lambda p: stairify(p, g, origin=(x, 0)) if g > 1.5 else p)
    for p in ([(x - 70, -50), (x + 70, -50)], [(x - 70, -80), (x + 70, -80)], [(x - 60, 0), (x - 60, -50)], [(x + 60, 0), (x + 60, -50)],
              [(x - 60, -50), (x - 60, -80)], [(x + 60, -50), (x + 60, -80)]):
        pline(cr, st(p), 5, PENCIL, a, seed=seed + int(p[0][0] - x), amp=1.2 if g < 1.5 else 0)


def cube_bench(cr, x, a=1.0):
    B = 24
    for i in range(-3, 3):
        block(cr, x + i * B, -2 * B, B, "wood", a, outline=True)
        block(cr, x + i * B, -4 * B, B, "plank", a, outline=True)
    block(cr, x - 3 * B, -B, B, "wood", a)
    block(cr, x + 2 * B, -B, B, "wood", a)
    block(cr, x - 3 * B, -3 * B, B, "wood", a)
    block(cr, x + 2 * B, -3 * B, B, "wood", a)


def flat_fence(cr, x, n=6, a=1.0, g=0.0, seed=0):
    st = (lambda p: stairify(p, g, origin=(x, 0)) if g > 1.5 else p)
    for i in range(n):
        px = x + i * 34
        pline(cr, st([(px, 0), (px, -70), (px + 8, -82), (px + 16, -70), (px + 16, 0)]), 3.5, PENCIL, a, seed=seed + i, amp=1 if g < 1.5 else 0)
    pline(cr, st([(x - 6, -48), (x + n * 34, -48)]), 3.5, PENCIL, a, seed=seed + 40, amp=1 if g < 1.5 else 0)


def cube_fence(cr, x, n=6, a=1.0):
    for i in range(n):
        block(cr, x + i * 34, -80, 18, "wood", a)
        for j in range(4):
            block(cr, x + i * 34, -62 + j * 16, 16, "wood", a, outline=False)
    box(cr, x - 6, -54, n * 34 + 6, 12, WOOD, a)


def glitch_squares(cr, x, y, w, h, k, seed=0, c=None, n=14):
    if k <= 0 or k >= 1:
        return
    b = G["boil"]
    for i in range(n):
        if hsh(i + b * 31, seed) > 0.55:
            continue
        sx = x + hsh(i, seed + 1) * w
        sy = y + hsh(i, seed + 2) * h
        sz = 6 + hsh(i, seed + 3) * 18
        col = c or [GRASS, (0, 0, 0), rgb('#7ef0a0'), (1, 1, 1)][int(hsh(i + b, seed + 4) * 4)]
        rect(cr, sx, sy, sz, sz, col, 0.85 * (1 - abs(k - 0.5) * 2) + 0.15)


# ----------------------------------------------------------------- flat city model
class City:
    """flat city strip: objects with x positions; infection front from origin; protected circles."""

    def __init__(self, seed=1):
        rnd = random.Random(seed)
        self.objs = []
        x = -2600
        ci = 0
        while x < 3400:
            kind = rnd.choice(["house", "house", "tree", "tree", "lamp", "bench", "fence"])
            if kind == "house":
                w, h = rnd.randint(200, 280), rnd.randint(170, 250)
                self.objs.append(dict(k="house", x=x + w / 2, w=w, h=h, ci=ci))
                ci += 1
                x += w + rnd.randint(40, 90)
            elif kind == "tree":
                self.objs.append(dict(k="tree", x=x + 50, h=rnd.randint(190, 260)))
                x += rnd.randint(110, 170)
            elif kind == "lamp":
                self.objs.append(dict(k="lamp", x=x + 20))
                x += 110
            elif kind == "bench":
                self.objs.append(dict(k="bench", x=x + 70))
                x += 190
            else:
                self.objs.append(dict(k="fence", x=x, n=5))
                x += 200
        # keep the landing site (x ~ 0) open: remove objects near it, place special set
        self.objs = [o for o in self.objs if not (-380 < o["x"] < 520)]
        self.objs += [dict(k="tree", x=330, h=230), dict(k="bench", x=-260), dict(k="lamp", x=470)]
        self.objs.sort(key=lambda o: o["x"])
        self.bg = []
        for i in range(40):
            bx = -3200 + i * 170 + rnd.randint(-40, 40)
            self.bg.append((bx, rnd.randint(120, 260), rnd.randint(100, 200)))

    def draw_bg(self, cr, inf_fn, a=1.0):
        for bx, w, h in self.bg:
            p = inf_fn(bx)
            if p < 0.95:
                pts = [(bx - w / 2, 0), (bx - w / 2, -h), (bx - w / 4, -h - 40), (bx + w / 4, -h - 40), (bx + w / 2, -h), (bx + w / 2, 0)]
                g = 18 * p
                if g > 1.5:
                    pts = stairify(pts, g, origin=(bx, 0))
                fill_poly(cr, pts, rgb('#e9e2d2'), a * (1 - p))
                pline(cr, pts, 3, (0.55, 0.55, 0.6), a * 0.8 * (1 - p), seed=int(bx), amp=1 if g < 1.5 else 0)
            if p > 0.05:
                B = 40
                nx = int(w / B)
                ny = int(h / B)
                for j in range(int(ny * min(1, p * 1.2))):
                    for i in range(nx):
                        block(cr, bx - nx * B / 2 + i * B, -(j + 1) * B, B, ["stone", "plank", "sand", "gray"][int(abs(bx)) % 4], a * min(1, p) * 0.75, outline=False)

    def draw(self, cr, inf_fn, prot=(), xmin=-1e9, xmax=1e9, a=1.0):
        for o in self.objs:
            if o["x"] < xmin - 400 or o["x"] > xmax + 400:
                continue
            p = inf_fn(o["x"])
            for (px, py, pr, pk) in prot:
                if abs(o["x"] - px) < pr and pk > 0.99:
                    p = min(p, o.get("pinf", 0))
            k = o["k"]
            seed = int(o["x"])
            if p < 0.999:
                g = 22 * ease(p)
                fa = a * (1 - ease(seg(p, 0.5, 1)))
                if k == "house":
                    flat_house(cr, o["x"], o["w"], o["h"], o["ci"], fa, g, seed)
                elif k == "tree":
                    flat_tree(cr, o["x"], o["h"], fa, g, seed, sway=math.sin(G["t"] * 1.3 + seed) * 3 * (1 - p))
                elif k == "lamp":
                    flat_lamp(cr, o["x"], fa, g, seed)
                elif k == "bench":
                    flat_bench(cr, o["x"], fa, g, seed)
                elif k == "fence":
                    flat_fence(cr, o["x"], o["n"], fa, g, seed)
            if p > 0.3:
                ca = a * ease(seg(p, 0.3, 0.9))
                gr = seg(p, 0.3, 1.0)
                if k == "house":
                    cube_house(cr, o["x"], o["w"], o["h"], o["ci"], ca, gr)
                elif k == "tree":
                    cube_tree(cr, o["x"], o["h"], ca, gr)
                elif k == "lamp":
                    cube_lamp(cr, o["x"], ca)
                elif k == "bench":
                    cube_bench(cr, o["x"], ca)
                elif k == "fence":
                    cube_fence(cr, o["x"], o["n"], ca)
            if 0.05 < p < 0.95:
                hh = o.get("h", 120) + 80
                glitch_squares(cr, o["x"] - 120, -hh, 240, hh, p, seed)


def flat_ground(cr, x0, x1, a=1.0, seed=0):
    pline(cr, [(x0, 0), (x1, 0)], 5, PENCIL, a, seed=seed, amp=1.2)
    # hatching under the line
    step = 46
    s0 = int(x0 // step) * step
    for i in range(int((x1 - s0) / step) + 1):
        hx = s0 + i * step
        pline(cr, [(hx, 14), (hx - 22, 38)], 2.5, PENCIL, a * 0.35, seed=seed + i, amp=0.6)
    # grass tufts
    for i in range(int((x1 - s0) / 140) + 1):
        gx = s0 + i * 140 + 37
        pline(cr, [(gx, 0), (gx + 3, -10)], 2.5, rgb('#4a8a3a'), a * 0.7, seed=seed + 300 + i, amp=0.4)
        pline(cr, [(gx + 6, 0), (gx + 11, -14)], 2.5, rgb('#4a8a3a'), a * 0.7, seed=seed + 400 + i, amp=0.4)


def cube_ground(cr, x0, x1, y=0, B=40, a=1.0, depth=8):
    x0 = math.floor(x0 / B) * B
    tile_fill_blocks(cr, x0, x1, y, B, a, depth)


def tile_fill_blocks(cr, x0, x1, y, B, a, depth):
    # grass row
    cr.save()
    cr.translate(0, y)
    sc = B / 64.0
    cr.scale(sc, sc)
    tile_fill(cr, grass_tile(), x0 / sc, 0, (x1 - x0) / sc, 64, a=a)
    tile_fill(cr, pix_tile(DIRT, 4, spots=(DIRT_D, 0.15)), x0 / sc, 64, (x1 - x0) / sc, 64 * (depth - 1), a=a)
    cr.restore()


def infected_ground(cr, xa, xb, a=1.0, B=40, front_cracks=True, seed=0, dirmask=(True, True)):
    """grass-block strip between xa and xb, plus pixel cracks ahead of fronts"""
    if xb <= xa:
        return
    xa_q = math.floor(xa / B) * B
    xb_q = math.ceil(xb / B) * B
    cr.save()
    cr.rectangle(xa, -2, xb - xa, 2000)
    cr.clip()
    tile_fill_blocks(cr, xa_q, xb_q, 0, B, a, 3)
    cr.restore()
    # ragged lower edge: a few stray blocks seeping down
    for i in range(int((xb_q - xa_q) / B)):
        bx = xa_q + i * B
        if bx < xa or bx + B > xb:
            continue
        r = hsh(bx / B, 77)
        if r < 0.55:
            block(cr, bx, 3 * B, B, "dirt", a, outline=False)
        if r < 0.2:
            block(cr, bx, 4 * B, B, "stone", a, outline=False)
    if front_cracks:
        for side, fx in ((-1, xa), (1, xb)):
            if not dirmask[0 if side < 0 else 1]:
                continue
            for i in range(5):
                L = 40 + hsh(i, seed + fx // 50) * 120
                yy = 6 + i * 9
                pts = [(fx, yy)]
                cx, cy = fx, yy
                for j in range(6):
                    cx += side * L / 6
                    cy += (hsh(i * 7 + j, seed) - 0.5) * 16
                    pts.append((cx, cy))
                st = stairify(pts, 8, origin=(fx, yy))
                stroke_poly(cr, st, rgb('#2c6a2a'), 3, a * 0.8)
            # also on the surface line
            pts = [(fx, -1)]
            cx = fx
            for j in range(5):
                cx += side * 22
                pts.append((cx, -1 - (8 if j % 2 else 0)))
            stroke_poly(cr, stairify(pts, 8), GRASS_D, 4, a)


# ----------------------------------------------------------------- crack in the sky
def sky_crack(cr, x, y, L=260, open_=1.0, a=1.0, inner="cube", seed=1, wobble_t=None):
    """jagged vertical crack with glow; inner shows the other world"""
    if open_ <= 0.01:
        return
    t = G["t"]
    n = 9
    left, right = [], []
    for i in range(n + 1):
        yy = y - L / 2 + L * i / n
        mid = x + (hsh(i, seed) - 0.5) * L * 0.18
        wd = math.sin(math.pi * i / n) * L * 0.09 * open_ * (1 + 0.06 * math.sin(t * 3 + i))
        if i in (0, n):
            wd = 0
        left.append((mid - wd, yy))
        right.append((mid + wd, yy))
    shape = left + right[::-1]
    shape_s = stairify(shape + [shape[0]], 6)
    glow(cr, x, y, L * 0.8, CRACK, a * 0.35 * open_)
    glow(cr, x, y, L * 0.4, (1, 1, 1), a * 0.3 * open_)
    cr.save()
    poly(cr, shape_s, True)
    cr.clip()
    if inner == "cube":
        g = cairo.LinearGradient(0, y - L / 2, 0, y + L / 2)
        g.add_color_stop_rgb(0, *SKY_DAY[0])
        g.add_color_stop_rgb(1, *SKY_DAY[1])
        cr.set_source(g)
        cr.paint_with_alpha(a)
        rect(cr, x - 30, y - L * 0.25, 40, 40, rgb('#fff3a0'), a)
        block(cr, x - 40, y + L * 0.2, 40, "grass", a)
        block(cr, x, y + L * 0.2, 40, "grass", a)
    else:
        cr.set_source_surface(paper_surface(), 0, 0)
        cr.paint_with_alpha(a)
        pline(cr, [(x - 100, y + 20), (x + 100, y + 10)], 3, PENCIL, a, seed=5)
        pline(cr, ellipse_pts(x + 10, y - 40, 24, 24), 3, PENCIL, a * 0.8, seed=6)
    cr.restore()
    poly(cr, shape_s, True)
    src(cr, (1, 1, 1), a * 0.9)
    cr.set_line_width(4)
    cr.stroke()
    # sparkles
    for i in range(10):
        ph = (t * 0.6 + hsh(i, seed)) % 1
        sx = x + (hsh(i, seed + 3) - 0.5) * L * 0.5
        sy = y + (hsh(i, seed + 4) - 0.5) * L
        sz = 6 * (1 - ph)
        rect(cr, sx + (hsh(i, 9) - 0.5) * 60 * ph, sy - 40 * ph, sz, sz, CRACK, a * (1 - ph))


# ----------------------------------------------------------------- cube world
def cube_sky(cr, night=0.0, sunset=0.0, purple=0.0):
    cr.save()
    cr.identity_matrix()
    top = mix(SKY_DAY[0], SKY_NIGHT[0], night)
    bot = mix(SKY_DAY[1], SKY_NIGHT[1], night)
    if sunset:
        top = mix(top, rgb('#6a4a9a'), sunset)
        bot = mix(bot, rgb('#ff9a4a'), sunset)
    if purple:
        top = mix(top, rgb('#2a124a'), purple)
        bot = mix(bot, rgb('#7a3fc0'), purple)
    g = cairo.LinearGradient(0, 0, 0, H)
    g.add_color_stop_rgb(0, *top)
    g.add_color_stop_rgb(1, *bot)
    cr.set_source(g)
    cr.paint()
    cr.restore()


def pix_cloud(cr, x, y, s=1.0, a=1.0, night=0.0):
    c = mix((1, 1, 1), rgb('#3a4a9a'), night)
    u = 26 * s
    pat = ["0011110000", "0111111100", "1111111111"]
    for j, row in enumerate(pat):
        for i, ch in enumerate(row):
            if ch == "1":
                rect(cr, x + i * u, y + j * u, u + 0.6, u + 0.6, c, a * 0.95)


def square_sun(cr, x, y, r=70, a=1.0, moon=False):
    if moon:
        glow(cr, x, y, r * 2.4, (0.8, 0.85, 1), a * 0.25)
        rect(cr, x - r, y - r, 2 * r, 2 * r, rgb('#e8ecf5'), a)
        rect(cr, x - r * 0.5, y - r * 0.4, r * 0.4, r * 0.4, rgb('#c9cfdd'), a)
        rect(cr, x + r * 0.2, y + r * 0.2, r * 0.5, r * 0.3, rgb('#c9cfdd'), a)
    else:
        glow(cr, x, y, r * 2.6, rgb('#fff3a0'), a * 0.5)
        rect(cr, x - r * 1.2, y - r * 1.2, 2.4 * r, 2.4 * r, rgb('#ffe680'), a * 0.5)
        rect(cr, x - r, y - r, 2 * r, 2 * r, rgb('#fff6c8'), a)


def mountains(cr, x_off, base_y, color, seed=0, h=300, B=40, a=1.0, x0=-2000, x1=4000):
    x = math.floor((x0 - x_off) / B) * B
    while x < x1 - x_off:
        hh = h * (0.5 + 0.5 * math.sin(x * 0.002 + seed) * math.cos(x * 0.0007 + seed * 2)) + h * 0.3
        hh = round(hh / B) * B
        rect(cr, x + x_off, base_y - hh, B + 0.5, hh + 1000, color, a)
        x += B


def cube_tree_big(cr, x, gy, B=48, h=6, a=1.0, leaf="leaf", seed=0):
    for j in range(h):
        block(cr, x - B / 2, gy - (j + 1) * B, B, "wood", a)
    top = gy - (h + 1) * B
    cells = [(-2, 1), (-1, 1), (0, 1), (1, 1), (2, 1), (-2, 0), (-1, 0), (0, 0), (1, 0), (2, 0), (-1, -1), (0, -1), (1, -1), (0, -2), (-3, 1), (3, 1)]
    for (i, j) in cells:
        if hsh(i * 5 + j, seed) < 0.12 and abs(i) == 3:
            continue
        block(cr, x - B / 2 + i * B, top + j * B, B, leaf, a)


def grass_world_ground(cr, x0, x1, gy, B=48, a=1.0, depth=10):
    x0 = math.floor(x0 / B) * B
    cr.save()
    cr.translate(0, gy)
    sc = B / 64.0
    cr.scale(sc, sc)
    tile_fill(cr, grass_tile(), x0 / sc, 0, (x1 - x0) / sc, 64, a=a)
    tile_fill(cr, pix_tile(DIRT, 4, spots=(DIRT_D, 0.15)), x0 / sc, 64, (x1 - x0) / sc, 64 * 3, a=a)
    tile_fill(cr, pix_tile(STONE, 5, spots=(STONE_D, 0.2)), x0 / sc, 64 * 4, (x1 - x0) / sc, 64 * (depth - 4), a=a)
    cr.restore()


def night_overlay(cr, k):
    if k <= 0:
        return
    cr.save()
    cr.identity_matrix()
    rect(cr, 0, 0, W, H, rgb('#0a1440'), 0.45 * k)
    cr.restore()


def vignette(cr, k=0.5):
    cr.save()
    cr.identity_matrix()
    g = cairo.RadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05)
    g.add_color_stop_rgba(0, 0, 0, 0, 0)
    g.add_color_stop_rgba(1, 0, 0, 0, k)
    cr.set_source(g)
    cr.paint()
    cr.restore()


def fade(cr, k, c=(0, 0, 0)):
    if k <= 0:
        return
    cr.save()
    cr.identity_matrix()
    rect(cr, 0, 0, W, H, c, clamp(k))
    cr.restore()


def camera(cr, cx, cy, zoom=1.0, rot=0.0, shake=0.0):
    cr.identity_matrix()
    sx = sy = 0
    if shake:
        t = G["t"]
        sx = vnoise(t * 30, 1) * shake * 2
        sy = vnoise(t * 30, 2) * shake * 2
    cr.translate(W / 2 + sx, H / 2 + sy)
    cr.rotate(rot)
    cr.scale(zoom, zoom)
    cr.translate(-cx, -cy)


def pixel_text(cr, text, cx, cy, height, c=(1, 1, 1), a=1.0, outline=INK, px=8):
    """text rendered tiny then upscaled nearest -> pixel-font look"""
    key = ("ptext", text, px)
    if key not in _cache:
        tmp = cairo.ImageSurface(cairo.FORMAT_ARGB32, 10, 10)
        c2 = cairo.Context(tmp)
        c2.select_font_face("DejaVu Sans", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
        c2.set_font_size(px * 2)
        ext = c2.text_extents(text)
        w, h = int(ext.width + 8), int(px * 2.6)
        s = cairo.ImageSurface(cairo.FORMAT_ARGB32, w, h)
        c3 = cairo.Context(s)
        c3.set_antialias(cairo.ANTIALIAS_NONE)
        fo = cairo.FontOptions()
        fo.set_antialias(cairo.ANTIALIAS_NONE)
        c3.set_font_options(fo)
        c3.select_font_face("DejaVu Sans", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
        c3.set_font_size(px * 2)
        c3.move_to(4 - ext.x_bearing, px * 2)
        c3.set_source_rgb(1, 1, 1)
        c3.show_text(text)
        _cache[key] = s
    s = _cache[key]
    sc = height / s.get_height()
    w = s.get_width() * sc
    for dx, dy, col in [(sc * 0.6, sc * 0.6, outline), (0, 0, c)]:
        cr.save()
        cr.translate(cx - w / 2 + dx, cy - height / 2 + dy)
        cr.scale(sc, sc)
        p = cairo.SurfacePattern(s)
        p.set_filter(cairo.FILTER_NEAREST)
        src(cr, col, a)
        cr.mask(p)
        cr.restore()
