# -*- coding: utf-8 -*-
"""Shot registry, sound cues, and shared scene helpers."""
from engine import *

SHOTS = []      # (start, end, fn)
CUES = []       # (time, name, vol, kw)
MUSIC = []      # (start, end, style, vol)


def shot(start, end):
    def deco(fn):
        SHOTS.append((start, end, fn))
        fn.start, fn.end = start, end
        return fn
    return deco


def cue(t, name, vol=1.0, **kw):
    CUES.append((t, name, vol, kw))


def music(a, b, style, vol=1.0):
    MUSIC.append((a, b, style, vol))


CITY = City(1)
X0 = 150         # landing site of the grass block
CRACK_XY = (900, -1500)


def inf_range(xl, xr, soft=140):
    """infection active between xl..xr with soft edges"""
    def f(x):
        if x < xl:
            return clamp(1 - (xl - x) / soft)
        if x > xr:
            return clamp(1 - (x - xr) / soft)
        return 1.0
    return f


def no_inf(x):
    return 0.0


def flat_world(cr, cx, cy, zoom, inf=no_inf, inf_iv=None, prot=(), sun=(-700, -720), clouds=True,
               crack=None, crack_open=1.0, tint=None, rot=0.0, shake=0.0, city=True, ground=True,
               bg_city=True, front_cracks=True, hide=()):
    paper_bg(cr, tint)
    t = G["t"]
    # sky things (parallax 0.25)
    camera(cr, cx * 0.25, cy, zoom, rot, shake)
    if sun:
        flat_sun(cr, sun[0] + cx * 0.0, sun[1], 70)
    if clouds:
        for i, (x, y, s) in enumerate([(-900, -800, 1.0), (-100, -950, 0.8), (700, -820, 1.1), (1500, -900, 0.9), (-1700, -900, 1.0)]):
            flat_cloud(cr, x + (t * 8) % 4000 - 600, y, s, 1.0, seed=i * 31)
    if crack:
        camera(cr, cx * 0.6, cy, zoom, rot, shake)
        sky_crack(cr, crack[0], crack[1], crack[2] if len(crack) > 2 else 320, crack_open)
    if bg_city and city:
        camera(cr, cx * 0.55, cy, zoom, rot, shake)
        CITY.draw_bg(cr, inf)
    camera(cr, cx, cy, zoom, rot, shake)
    half = W / 2 / zoom + 200
    if ground:
        flat_ground(cr, cx - half, cx + half)
        if inf_iv:
            for iv in inf_iv:
                xa, xb = iv[0], iv[1]
                infected_ground(cr, xa, xb, front_cracks=front_cracks, dirmask=iv[2] if len(iv) > 2 else (True, True))
            for (px, py, pr, pk) in prot:
                if pk >= 0.99:
                    cr.save()
                    cr.rectangle(px - pr, -3, 2 * pr, 1200)
                    cr.clip()
                    m = cr.get_matrix()
                    cr.identity_matrix()
                    cr.set_source_surface(paper_surface(), 0, 0)
                    cr.paint()
                    cr.set_matrix(m)
                    flat_ground(cr, px - pr - 10, px + pr + 10, seed=int(px))
                    cr.restore()
    if city:
        CITY.draw(cr, inf, prot, cx - half, cx + half)
    for (px, py, pr, pk) in prot:
        if pk > 0:
            pts = ellipse_pts(px, py, pr, pr * 0.28, -math.pi / 2, -math.pi / 2 + 2 * math.pi * pk, 60)
            pline(cr, pts, 5, PENCIL, 1.0, seed=int(px))


def ground_iv_for(xl, xr):
    return [(xl, xr)]


def reach(x, gy, s, face, P, target, arm="f", bend=1):
    """two-bone IK: returns pose with arm reaching target"""
    P = dict(DEF_POSE, **P)
    J = stick_joints(x, gy, s, face, P)
    sx, sy = J["sho"]
    UA, LA = SCALE_BASE["ua"] * s, SCALE_BASE["la"] * s
    dx, dy = (target[0] - sx) * face, target[1] - sy
    d = clamp(math.hypot(dx, dy), 1, UA + LA - 0.5)
    th = math.atan2(dx, dy)
    cosA = clamp((UA * UA + d * d - LA * LA) / (2 * UA * d), -1, 1)
    al = math.acos(cosA)
    ua = th + al * bend
    ex, ey = math.sin(ua) * UA, math.cos(ua) * UA
    la = math.atan2(dx - ex, dy - ey)
    P["ua_" + arm] = math.degrees(ua)
    P["la_" + arm] = math.degrees(la)
    return P


def pencil_path(cr, pts, f, w=5, c=PENCIL, seed=0, a=1.0):
    """draw first fraction f of pts; returns tip point"""
    if f <= 0:
        return pts[0]
    pp = partial(pts, f)
    if len(pp) >= 2:
        pline(cr, pp, w, c, a, seed=seed, amp=1.2)
    return pp[-1]


def scribble_cue(t0, dur, vol=0.7):
    cue(t0, "pencil", vol, dur=dur)


def iso_block(cr, x, y, s, rot=0.0, a=1.0, glow_k=0.0):
    """grass block with visible top & side: looks alien in the flat world"""
    cr.save()
    cr.translate(x, y)
    cr.rotate(rot)
    d = s * 0.32
    if glow_k > 0:
        glow(cr, 0, 0, s * 1.6, rgb('#9dff9d'), glow_k * a)
    # top face
    cr.save()
    cr.move_to(-s / 2, -s / 2)
    cr.line_to(-s / 2 + d, -s / 2 - d)
    cr.line_to(s / 2 + d, -s / 2 - d)
    cr.line_to(s / 2, -s / 2)
    cr.close_path()
    cr.clip()
    tile_fill(cr, pix_tile(GRASS, 23, spots=(GRASS_D, 0.3)), -s, -s, 2 * s, s, a=a)
    rect(cr, -s, -s, 2 * s, s, (1, 1, 1), 0.15 * a)
    cr.restore()
    # side face
    cr.save()
    cr.move_to(s / 2, -s / 2)
    cr.line_to(s / 2 + d, -s / 2 - d)
    cr.line_to(s / 2 + d, s / 2 - d)
    cr.line_to(s / 2, s / 2)
    cr.close_path()
    cr.clip()
    cr.translate(s / 2, -s / 2 - d)
    cr.scale(d / s, 1)
    block(cr, 0, 0, s, "grass", a, outline=False)
    cr.restore()
    cr.save()
    cr.move_to(s / 2, -s / 2)
    cr.line_to(s / 2 + d, -s / 2 - d)
    cr.line_to(s / 2 + d, s / 2 - d)
    cr.line_to(s / 2, s / 2)
    cr.close_path()
    src(cr, (0, 0, 0), 0.28 * a)
    cr.fill()
    cr.restore()
    block(cr, -s / 2, -s / 2, s, "grass", a)
    cr.restore()


def thought_bubble(cr, x, y, w, h, k=1.0, a=1.0, seed=0):
    if k <= 0 or eback(k) < 0.01:
        return
    cr.save()
    cr.translate(x, y)
    cr.scale(eback(k), eback(k))
    pts = []
    n = 14
    for i in range(n):
        an = 2 * math.pi * i / n
        for j in range(5):
            aa = an + (2 * math.pi / n) * j / 4
            bulge = 1 + 0.08 * math.sin(math.pi * j / 4)
            pts.append((math.cos(aa) * w / 2 * bulge, math.sin(aa) * h / 2 * bulge))
    fill_poly(cr, pts, (1, 1, 1), 0.95 * a)
    pline(cr, pts, 4, PENCIL, a, seed=seed, close=True)
    for i, (dx, dy, r) in enumerate([(-w * 0.32, h * 0.62, 18), (-w * 0.42, h * 0.85, 11)]):
        circle(cr, dx, dy, r, (1, 1, 1), a)
        pline(cr, ellipse_pts(dx, dy, r, r), 3, PENCIL, a, seed=seed + i)
    cr.restore()


def impact_burst(cr, x, y, k, s=1.0, c=(1, 1, 1)):
    if k <= 0 or k >= 1:
        return
    for i in range(10):
        an = i * math.pi / 5 + 0.3
        r0 = 20 * s + k * 60 * s
        r1 = r0 + 40 * s * (1 - k)
        stroke_poly(cr, [(x + math.cos(an) * r0, y + math.sin(an) * r0), (x + math.cos(an) * r1, y + math.sin(an) * r1)], c, 8 * s * (1 - k), 1)
    for i in range(8):
        an = i * 0.8 + 0.2
        d = k * 140 * s
        sz = 14 * s * (1 - k)
        rect(cr, x + math.cos(an) * d - sz / 2, y + math.sin(an) * d - sz / 2, sz, sz, c, 1 - k)


def debris(cr, x, y, k, n=12, s=1.0, kinds=("grass", "dirt"), seed=0, spread=1.0):
    if k <= 0 or k >= 1:
        return
    for i in range(n):
        an = -math.pi / 2 + (hsh(i, seed) - 0.5) * 2.6 * spread
        v = 300 + hsh(i, seed + 1) * 500
        tt = k * 1.4
        px = x + math.cos(an) * v * tt * s
        py = y + (math.sin(an) * v * tt + 900 * tt * tt) * s
        sz = (14 + hsh(i, seed + 2) * 16) * s
        cr.save()
        cr.translate(px, py)
        cr.rotate(tt * 6 * (hsh(i, seed + 3) - 0.5))
        block(cr, -sz / 2, -sz / 2, sz, kinds[i % len(kinds)], 1 - k * 0.5)
        cr.restore()


def rewind_overlay(cr, k=1.0):
    cr.save()
    cr.identity_matrix()
    rect(cr, 0, 0, W, H, rgb('#c8a96a'), 0.22 * k)
    b = G["boil"]
    for i in range(7):
        yy = (hsh(i, b) * H)
        rect(cr, 0, yy, W, 3 + hsh(i, b + 1) * 10, (1, 1, 1), 0.35 * k)
    # rewind icon
    x, y = 120, 110
    for dx in (0, 60):
        fill_poly(cr, [(x + dx + 60, y - 40), (x + dx, y), (x + dx + 60, y + 40)], (1, 1, 1), 0.9 * k)
    cr.restore()


def dust_puff(cr, x, y, k, s=1.0, seed=0):
    if k <= 0 or k >= 1:
        return
    for i in range(6):
        an = math.pi + i * math.pi / 5
        d = (30 + 90 * k) * s
        r = (14 + 18 * k) * s
        px = x + math.cos(an) * d
        py = y + math.sin(an) * d * 0.35 - 10 * s
        pline(cr, ellipse_pts(px, py, r, r * 0.7), 3, PENCIL, 1 - k, seed=seed + i)


def birds(cr, x, y, t, n=3, a=0.8):
    for i in range(n):
        bx = x + i * 60 + t * 40
        by = y + math.sin(i * 2 + t) * 10 + i * 18
        f = math.sin(t * 8 + i) * 8
        pline(cr, [(bx - 16, by - f), (bx, by), (bx + 16, by - f)], 3, PENCIL, a, seed=i, amp=0.4)


def stitch_line(cr, x, y0, y1, n, zig=26, c=rgb('#e03b3b'), a=1.0, w=6):
    """zig-zag stitches crossing a vertical crack between y0..y1, first n stitches"""
    for i in range(int(n)):
        yy = lerp(y0, y1, (i + 0.5) / max(1, 9))
        stroke_poly(cr, [(x - zig, yy - 8), (x + zig, yy + 8)], c, w, a)
