# -*- coding: utf-8 -*-
"""Act 2 (3:00-5:30): the climb, the price, the other world."""
from common import *

music(180, 210, "climb", 0.85)
music(210, 240, "danger", 0.85)
music(240, 260, "sad_piano", 0.8)
music(260, 280, "wonder", 0.85)
music(280, 300, "ambient_day", 0.9)
music(300, 320, "ambient_night", 0.9)
music(320, 330, "ambient_night", 0.7)

CITY_INF = inf_range(-2600, 8000)
CITY_IV = [(-2700, 9000)]

# floating block path: (x, top_y, size)
PATH = [(-300, -260, 126), (-60, -480, 120), (200, -680, 114), (260, -1100, 110), (520, -1280, 108), (760, -1460, 104),
        (800, -1900, 100), (1040, -2080, 98), (1270, -2260, 96)]
LADDERS = [(2, 3), (5, 6)]


def draw_path_blocks(cr, skip=(), t=0.0):
    for i, (x, y, s) in enumerate(PATH):
        if i in skip:
            continue
        bob = math.sin(t * 1.4 + i) * 4
        iso_block(cr, x, y + s / 2 + bob, s, rot=0)


def ladder_pts(i, j):
    x0, y0, s0 = PATH[i]
    x1, y1, s1 = PATH[j]
    a = (x0 + s0 * 0.25, y0)
    b = (x1 - s1 * 0.2, y1)
    return a, b


def draw_ladder(cr, i, j, f):
    a, b = ladder_pts(i, j)
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy)
    nx, ny = -dy / L * 22, dx / L * 22
    r1 = [(a[0] + nx, a[1] + ny), (b[0] + nx, b[1] + ny)]
    r2 = [(a[0] - nx, a[1] - ny), (b[0] - nx, b[1] - ny)]
    f1 = seg(f, 0, 0.35)
    f2 = seg(f, 0.35, 0.7)
    pencil_path(cr, r1, f1, 6, seed=i)
    tip = r1[0]
    if f1 < 1:
        tip = partial(r1, f1)[-1]
    else:
        pencil_path(cr, r2, f2, 6, seed=i + 1)
        tip = partial(r2, f2)[-1]
    n = int(L / 46)
    rf = seg(f, 0.7, 1.0)
    for k in range(int(n * rf)):
        u = (k + 0.5) / n
        p = (a[0] + dx * u, a[1] + dy * u)
        pline(cr, [(p[0] + nx, p[1] + ny), (p[0] - nx, p[1] - ny)], 5, PENCIL, 1, seed=k + 10 * i, amp=0.8)
        tip = (p[0] - nx, p[1] - ny)
    return tip


# timeline of the climb: list of (t0, t1, kind, from, to)
CLIMB = []
_t = 2.0
cur = (-560, 0)
for idx in range(len(PATH)):
    x, y, s = PATH[idx]
    if idx in (3, 6):
        CLIMB.append((_t, _t + 2.6, "draw", idx - 1, idx))
        _t += 2.8
        CLIMB.append((_t, _t + 3.0, "ladder", cur, (x, y)))
        _t += 3.2
    else:
        CLIMB.append((_t, _t + 0.8, "jump", cur, (x, y)))
        _t += 1.5
    cur = (x, y)


def climb_state(t):
    pos = (-560, 0)
    for (a, b, kind, p, q) in CLIMB:
        if t < a:
            return pos, "idle", None, 0
        if t < b:
            k = seg(t, a, b)
            if kind == "jump":
                x = lerp(p[0], q[0], k)
                y = lerp(p[1], q[1], k) - 150 * math.sin(math.pi * k)
                return (x, y), "jump", None, k
            if kind == "draw":
                return pos, "draw", (p, q), k
            if kind == "ladder":
                x = lerp(p[0], q[0], ease(k))
                y = lerp(p[1], q[1], ease(k))
                return (x, y), "ladder", None, k
        pos = q if kind != "draw" else pos
    return pos, "idle", None, 0


@shot(180, 210)
def s14(cr, t):
    (hx, hy), mode, extra, k = climb_state(t)
    if t < 22.5:
        zoom = 0.95
        cx, cy = hx + 120, hy - 200
    else:
        u = eio(t, 22.5, 25.5) * (1 - eio(t, 27.5, 29.5))
        zoom = lerp(0.95, 0.2, u)
        cx, cy = lerp(hx + 120, 300, u), lerp(hy - 200, -1300, u)
    flat_world(cr, cx, cy, zoom, CITY_INF, CITY_IV, sun=(-600, -2000), crack=(1300, -2600 * 0.6 - 500, 520))
    draw_path_blocks(cr, t=G["t"])
    for (a, b, kind, i, j) in CLIMB:
        if kind == "draw" and t > a:
            draw_ladder(cr, i, j, seg(t, a, b))
    face = 1
    pencil = False
    eyes, mouth = "normal", "flat"
    if mode == "idle":
        P = idle_pose(t)
        if t < 2:
            P = pose(lean=-10)
            eyes = "wide"
    elif mode == "jump":
        P = run_pose(1.2)
        P["y"] = 0
        eyes = "angry"
    elif mode == "draw":
        i, j = extra
        tip_t = None
        P = idle_pose(t)
        tip = (0, 0)
        cr.save()
        cr.set_source_rgba(0, 0, 0, 0)
        tip = draw_ladder(cr, i, j, k)
        cr.restore()
        P = reach(hx, hy, 1.2, 1, P, tip, "f")
        pencil = True
        eyes = "angry"
    else:
        ph = t * 6
        P = pose(lean=10, ua_f=150 + 20 * math.sin(ph), la_f=160, ua_b=150 - 20 * math.sin(ph), la_b=160,
                 th_f=40 * max(0, math.sin(ph)), sh_f=-10, th_b=40 * max(0, -math.sin(ph)), sh_b=-10)
        eyes = "angry"
    stickman(cr, hx, hy, 1.2, face, P, eyes=eyes, mouth=mouth, pencil=pencil, look=(1, -0.3))
    if 23 < t < 28:
        a = seg(t, 23, 24) * (1 - seg(t, 27, 28))
        J = stick_joints(hx, hy, 1.2, 1, P)
        sweat(cr, J["head"][0] - 40, J["head"][1] - 30, 1.6 / max(zoom, 0.3) * 0.5, a)


for (a, b, kind, p, q) in CLIMB:
    if kind == "jump":
        cue(180 + a, "jump", 0.6)
        cue(180 + b, "land_block", 0.6)
    elif kind == "draw":
        scribble_cue(180 + a, b - a)
    else:
        for i in range(6):
            cue(180 + a + i * 0.5, "step_soft", 0.5)
cue(180, "wind", 0.6, dur=30)
cue(203.5, "gulp", 0.7)


# ---------------------------------------------------------------- the fall / bracelet
BA = (0, 0, 90)     # block A: x, top y, size
BB = (230, -60, 84)


@shot(210, 240)
def s15(cr, t):
    # sky-high background: no ground visible
    if t < 5:
        zoom, cx, cy = 1.0, 120, -120
    elif t < 14:
        zoom = lerp(1.0, 2.4, eio(t, 5, 6.5))
        cx, cy = lerp(120, 50, eio(t, 5, 6.5)), lerp(-120, 20, eio(t, 5, 6.5))
    else:
        zoom = lerp(2.4, 1.7, eio(t, 14, 16))
        cx, cy = lerp(50, 20, eio(t, 14, 16)), lerp(20, -110, eio(t, 14, 16))
    flat_world(cr, cx, cy - 2400, zoom * 0.999, CITY_INF, CITY_IV, sun=(-500, -2900), city=False, ground=False)
    camera(cr, cx, cy, zoom, shake=10 * (seg(t, 2.6, 2.7) - seg(t, 2.7, 3.2)) if 2.6 < t < 3.2 else 0)
    # far city far below (tiny)
    iso_block(cr, BA[0], BA[1] + BA[2] / 2, BA[2])
    # block B: falls
    if t < 2.1:
        iso_block(cr, BB[0], BB[1] + BB[2] / 2, BB[2])
    else:
        k = seg(t, 2.1, 4.0)
        shake_ = math.sin(t * 60) * 4 * (1 - seg(t, 2.1, 2.3))
        iso_block(cr, BB[0] + shake_ + 40 * k, BB[1] + BB[2] / 2 + 1400 * ein(k), BB[2], rot=k * 3)
        debris(cr, BB[0], BB[1], seg(t, 2.25, 3.4), n=8, s=0.8)
    corner = (BA[0] + BA[2] / 2 - 6, BA[1] - 2)
    sqk = eio(t, 5.5, 7.5)
    pix_af = 0.15 + 0.6 * eio(t, 6.5, 11.5)
    if t > 13.4:
        pix_af = 0.15 + 0.6 * eio(13.4, 6.5, 11.5)
    bracelet_k = seg(t, 10.8, 13.4)
    if t < 1.6:
        P = idle_pose(t)
        stickman(cr, 0, BA[1], 1.2, 1, P, eyes="normal", look=(1, 0.3))
    elif t < 2.3:
        k = seg(t, 1.6, 2.1)
        x = lerp(0, BB[0], k)
        y = lerp(BA[1], BB[1], k) - 50 * math.sin(math.pi * k)
        stickman(cr, x, y, 1.2, 1, walk_pose(t * 8, 0.8), eyes="normal")
    elif t < 2.7:
        k = seg(t, 2.3, 2.7)
        x = lerp(BB[0], corner[0] + 40, k)
        y = lerp(BB[1], corner[1] + 230, k) + 60 * k * k
        stickman(cr, x, y, 1.2, -1, pose(ua_f=170, la_f=170, ua_b=150, la_b=170, th_f=20, th_b=-20), eyes="wide", mouth="o")
    elif t < 14.5:
        sway = math.sin(t * 2.2) * 6 * (1 - seg(t, 5, 7))
        hip = (corner[0] + 25 + sway, corner[1] + 165)
        P = pose(th_f=10 + 12 * math.sin(t * 5) * (1 - seg(t, 4, 5)), sh_f=0, th_b=-6 - 12 * math.sin(t * 5) * (1 - seg(t, 4, 5)), sh_b=-10,
                 lean=-18)
        P = reach_seat(hip, P, corner, "f")
        tip_b = None
        if 10.6 < t < 13.6:
            # back hand with pencil drawing the bracelet around the wrist
            J = stick_joints(hip[0], 0, 1.2, -1, P, seat=hip[1])
            e, h = J["ef"], J["hf"]
            wx, wy = lerp(e[0], h[0], 0.62), lerp(e[1], h[1], 0.62)
            an = 2 * math.pi * bracelet_k * 2
            tip_b = (wx + math.cos(an) * 18, wy + math.sin(an) * 9)
            P = reach_seat(hip, P, tip_b, "b")
        eyes, mouth, look = "wide", "o", (0.6, -1)
        if 2.7 < t < 5:
            eyes, mouth = "closed", "wavy"
        if t > 13.4:
            eyes, mouth = "sad", "flat"
        J = stickman(cr, hip[0], 0, 1.2, -1, P, seat=hip[1], eyes=eyes, mouth=mouth, look=look, sq={"f": sqk},
                     pix={"af": pix_af if t > 5.5 else 0}, pencil=False)
        if tip_b:
            draw_pencil(cr, J["hb"][0], J["hb"][1], -2.2, 0.9)
        # bracelet ring (progressive)
        if bracelet_k > 0:
            e, h = J["ef"], J["hf"]
            wx, wy = lerp(e[0], h[0], 0.62), lerp(e[1], h[1], 0.62)
            pts = ellipse_pts(wx, wy, 18, 9, 0, 2 * math.pi * min(1, bracelet_k * 2), 30)
            stroke_poly(cr, pts, rgb('#ff5a36'), 5)
        if 6.0 < t < 11:
            glitch_squares(cr, J["ef"][0] - 40, J["ef"][1] - 40, 80, 80, seg(t, 6, 11), seed=33, n=6)
        if 6.2 < t < 8:
            surprise_lines(cr, J["head"][0], J["head"][1] - 55, 1.2)
        if 13.4 < t < 14.2:
            glow(cr, J["ef"][0], J["ef"][1], 80, rgb('#fff6a0'), 0.7 * (1 - seg(t, 13.4, 14.2)))
    else:
        # pulls himself up and sits on block A
        k = eio(t, 14.5, 17.5)
        if k < 1:
            hip = (lerp(corner[0] + 30, 10, k), lerp(corner[1] + 175, BA[1] - 40, k))
            P = pose(lean=lerp(0, 60, math.sin(math.pi * k)), ua_f=lerp(180, 20, k), la_f=lerp(180, 40, k), ua_b=lerp(150, 30, k), la_b=60,
                     th_f=lerp(10, 80, k), sh_f=lerp(0, 10, k), th_b=lerp(-6, 85, k), sh_b=lerp(-10, 20, k))
            stickman(cr, hip[0], 0, 1.2, -1, P, seat=hip[1], eyes="angry", mouth="wavy", sq={"f": 1}, pix={"af": 0.3}, bracelet="f")
        else:
            br = math.sin(t * 5) * 2
            P = pose(lean=12 + br, ua_f=30, la_f=60, ua_b=10, la_b=40, th_f=80, sh_f=10, th_b=85, sh_b=20, hy=br)
            J = stickman(cr, 10, 0, 1.2, -1, P, seat=BA[1] - 40, eyes="closed" if t < 24 else "sad", mouth="o" if t < 24 else "flat",
                         sq={"f": 1}, pix={"af": 0.3}, bracelet="f", mouthk=math.sin(t * 5))
            if t < 24:
                sweat(cr, J["head"][0] + 40, J["head"][1] - 30 + (t % 2) * 10, 1.2)


def reach_seat(hip, P, target, arm):
    """IK when hip is fixed (seat)"""
    P = dict(DEF_POSE, **P)
    J = stick_joints(hip[0], 0, 1.2, -1, P, seat=hip[1])
    sx, sy = J["sho"]
    UA, LA = SCALE_BASE["ua"] * 1.2, SCALE_BASE["la"] * 1.2
    face = -1
    dx, dy = (target[0] - sx) * face, target[1] - sy
    d = clamp(math.hypot(dx, dy), 1, UA + LA - 0.5)
    th = math.atan2(dx, dy)
    al = math.acos(clamp((UA * UA + d * d - LA * LA) / (2 * UA * d), -1, 1))
    ua = th + al
    ex, ey = math.sin(ua) * UA, math.cos(ua) * UA
    la = math.atan2(dx - ex, dy - ey)
    P["ua_" + arm] = math.degrees(ua)
    P["la_" + arm] = math.degrees(la)
    return P


cue(210 + 2.1, "crumble", 1.0)
cue(210 + 2.4, "yelp", 0.9)
cue(210 + 2.7, "grab", 0.9)
cue(210 + 5.6, "pixel_spread", 0.9, dur=5.5)
cue(210 + 6.2, "gasp", 0.8)
scribble_cue(210 + 10.8, 2.6, 0.9)
cue(210 + 13.4, "ding", 1.0)
cue(210 + 14.6, "strain", 0.7)
cue(210 + 18.0, "pant", 0.6, dur=6)


@shot(240, 260)
def s16(cr, t):
    zoom = 2.2
    flat_world(cr, 40, -2600, zoom, CITY_INF, CITY_IV, sun=None, city=False, ground=False, clouds=True)
    camera(cr, 40, -200, zoom)
    iso_block(cr, BA[0], BA[1] + BA[2] / 2, BA[2] * 1.4)
    top = BA[1] - BA[2] * 0.2
    chips = (1 if t > 8.6 else 0) + (1 if t > 14.4 else 0)
    hip = (40, top - 40)
    br = math.sin(t * 3) * 1.5
    base = pose(lean=10 + br, ua_b=10, la_b=40, th_f=80, sh_f=10, th_b=85, sh_b=20, hy=br)
    J0 = stick_joints(hip[0], 0, 1.2, -1, base, seat=hip[1])
    eyes, mouth, look = "sad", "frown", (0.5, 0.2)
    sqk = 1.0
    if t < 7.5:
        tgt = (J0["head"][0] - 75, J0["head"][1] + 10 - 10 * eio(t, 0, 1.5))
        if t > 4.5:
            sqk = lerp(1, 0.8, eio(t, 4.5, 5.5))
    elif t < 9.5:
        k = eio(t, 7.5, 8.6)
        tgt = (lerp(J0["head"][0] - 75, 22, k), lerp(J0["head"][1], top - 4, k))
        sqk = 0.8
        if t > 8.6:
            eyes, mouth = "wide", "o"
    elif t < 13.5:
        tgt = (J0["head"][0] - 75, J0["head"][1] + 10)
        sqk = 0.8
        eyes, mouth, look = "wide", "o", (0.8, 0.4)
    elif t < 15:
        k = eio(t, 13.5, 14.4)
        tgt = (lerp(J0["head"][0] - 75, 50, k), lerp(J0["head"][1], top - 4, k))
        sqk = 0.8
        eyes, mouth = "wide", "o"
    else:
        tgt = (J0["head"][0] - 90 + 10 * math.sin(t * 6), J0["head"][1] - 40)
        sqk = 0.85
        eyes, mouth = "angry", "smile"
    P = reach_seat(hip, base, tgt, "f")
    J = stickman(cr, hip[0], 0, 1.2, -1, P, seat=hip[1], eyes=eyes, mouth=mouth, look=look, sq={"f": sqk}, pix={"af": 0.3}, bracelet="f")
    for c in range(chips):
        cx_ = 8 + c * 30
        rect(cr, cx_, top - 4, 28, 20, rgb('#2a1a10'), 0.9)
    debris(cr, 22, top - 8, seg(t, 8.6, 9.6), n=6, s=0.6, kinds=("grass", "dirt"), seed=3, spread=0.6)
    debris(cr, 50, top - 8, seg(t, 14.4, 15.4), n=6, s=0.6, kinds=("grass", "dirt"), seed=9, spread=0.6)
    impact_burst(cr, 22, top - 8, seg(t, 8.6, 9.2), 0.6, c=(1, 1, 1))
    impact_burst(cr, 50, top - 8, seg(t, 14.4, 15.0), 0.6, c=(1, 1, 1))
    if 9.8 < t < 13.4:
        qmark(cr, J["head"][0] + 10, J["head"][1] - 85, 1.1, seg(t, 9.8, 10.1))
    if 15.5 < t < 19:
        excl(cr, J["head"][0] + 10, J["head"][1] - 85, 1.1, seg(t, 15.5, 15.8))


cue(242.5, "sigh", 0.9)
cue(245.0, "squeeze", 0.5)
cue(248.6, "block_chip", 1.0)
cue(250.0, "hm", 0.9)
cue(254.4, "block_chip", 1.0)
cue(255.6, "giggle", 0.5, dur=1.2)


@shot(260, 280)
def s17(cr, t):
    CXc, CYc = 520, -320
    open_ = 1.0
    zoom = lerp(0.9, 1.5, eio(t, 0, 9))
    cx = lerp(150, 380, eio(t, 0, 9))
    cy = lerp(-200, -260, eio(t, 0, 9))
    flat_world(cr, cx, cy - 2600, zoom, CITY_INF, CITY_IV, sun=None, city=False, ground=False)
    camera(cr, cx, cy, zoom)
    glow(cr, CXc, CYc, 900, CRACK, 0.25)
    sky_crack(cr, CXc, CYc, 760, open_)
    iso_block(cr, 120, 42, 84)
    iso_block(cr, 300, 42, 84)
    # hero walks to crack, peeks, folds
    if t < 8:
        x = lerp(80, 320, eio(t, 1, 7.5))
        P = walk_pose(t * 5, 0.6) if 1 < t < 7.5 else idle_pose(t)
        stickman(cr, x, 0, 1.2, 1, P, eyes="wide", look=(1, -0.6), mouth="o", sq={"f": 1}, pix={"af": 0.3}, bracelet="f")
    elif t < 13:
        lean = 30 * eio(t, 8, 9.5)
        P = pose(lean=lean, hx=6)
        stickman(cr, 320, 0, 1.2, 1, P, eyes="wide", look=(1, -0.2), mouth="grin" if t > 10.5 else "o", sq={"f": 1}, pix={"af": 0.3},
                 bracelet="f")
        J = stick_joints(320, 0, 1.2, 1, P)
        glow(cr, J["head"][0] + 20, J["head"][1], 120, CRACK, 0.35)
    else:
        steps = [13.3, 14.3, 15.3]
        targets = [0.5, 0.22, 0.05]
        sq_ = 1.0
        for i, st in enumerate(steps):
            if t > st:
                sq_ = lerp(sq_, targets[i], seg(t, st, st + 0.25))
        slide = eio(t, 16.3, 17.5)
        x = lerp(320, CXc, slide)
        y = lerp(0, CYc + 140, slide)
        a = 1 - seg(t, 17.1, 17.5)
        if a > 0:
            stickman(cr, x, y, 1.2, 1, pose(), eyes="happy", mouth="smile", squash=sq_, sq={"f": 1}, pix={"af": 0.3}, bracelet="f", alpha=a)
            if t < 16.3:
                J = stick_joints(x, y, 1.2, 1, pose())
                for i in range(3):
                    if t > steps[i]:
                        pline(cr, [(x, J["head"][1] - 50), (x, 4)], 2, (0.5, 0.5, 0.55), 0.5 * (1 - seg(t, steps[i], steps[i] + 0.6)), seed=i)
    if t > 17.3:
        fade(cr, seg(t, 17.3, 18.0), (1, 1, 1))


cue(260, "hum_crack", 0.8, dur=15)
for st in (13.3, 14.3, 15.3):
    cue(260 + st, "paper_fold", 1.0)
cue(260 + 16.3, "paper_slide", 0.9)
cue(260 + 17.2, "whoosh_big", 1.0)


# ---------------------------------------------------------------- the cube world
def cube_bg(cr, camx, camy, zoom, night=0.0, orbit=0.0, sunset=0.0):
    cube_sky(cr, night, sunset)
    camera(cr, camx * 0.05 + orbit * 1600, camy * 0.2, zoom)
    if night < 0.5:
        square_sun(cr, 420, -760, 70, 1 - night * 2)
    if night > 0.2:
        square_sun(cr, -380, -700, 60, clamp((night - 0.2) / 0.5), moon=True)
        for i in range(40):
            rect(cr, -1500 + hsh(i, 1) * 3000, -1100 + hsh(i, 2) * 700, 5, 5, (1, 1, 1), clamp(night - 0.3) * (0.6 + 0.4 * math.sin(G["t"] * 2 + i)))
    camera(cr, camx * 0.15 + orbit * 1100, camy * 0.3, zoom)
    for i in range(6):
        pix_cloud(cr, -1400 + i * 620 + (G["t"] * 12) % 600, -820 + (i % 3) * 70, 1.0, 0.95, night)
    camera(cr, camx * 0.2 + orbit * 900, camy * 0.4, zoom)
    mountains(cr, 0, -40, mix(rgb('#8fb7d9'), rgb('#1c2a66'), night), seed=1, h=420, B=40, x0=-4000, x1=4000)
    camera(cr, camx * 0.45 + orbit * 500, camy * 0.6, zoom)
    mountains(cr, 300, 0, mix(rgb('#5f9e5a'), rgb('#16304a'), night), seed=4, h=260, B=48, x0=-4000, x1=4000)
    camera(cr, camx, camy, zoom)
    grass_world_ground(cr, camx - W / zoom, camx + W / zoom, 0, 48)


@shot(280, 300)
def s18(cr, t):
    orbit = eio(t, 6, 9.5) * (1 - eio(t, 15.5, 18))
    zoom = lerp(0.75, 1.15, eio(t, 0, 5))
    camx = lerp(-200, 0, eio(t, 0, 5)) + orbit * 120
    cube_bg(cr, camx, -330, zoom, orbit=orbit)
    camera(cr, camx, -330, zoom)
    # big trees
    for tx, th_, sd in [(-900, 7, 1), (-560, 9, 2), (700, 8, 3), (1100, 6, 4)]:
        cube_tree_big(cr, tx + orbit * 300, 0, 48, th_, seed=sd)
    squash = 1.0
    if t < 3:
        squash = lerp(0.02, 1.0, eio(t, 1.2, 2.8))
    squash *= max(0.03, math.cos(orbit * math.pi / 2))
    eyes, mouth, look = "wide", "o", (1, 0)
    face = 1
    if 3 < t < 6:
        face = 1 if math.sin(t * 2) > 0 else -1
        mouth = "grin"
    if t > 15.5:
        face = -1
        eyes, mouth = "normal", "flat"
    P = idle_pose(t)
    if t > 18:
        P = pose(ua_f=60, la_f=100, ua_b=-60, la_b=-100)
    stickman(cr, 0, 0, 1.3, face, P, eyes=eyes, mouth=mouth, look=look, squash=squash, sq={"f": 1}, pix={"af": 0.3}, bracelet="f",
             alpha=1 if t > 1.2 else seg(t, 0.8, 1.2))
    # cow passes in front
    if 9 < t < 20:
        k = seg(t, 9, 19)
        cx_ = lerp(900, -1100, k)
        cow(cr, cx_, 30, 1.25, -1, ph=t * 6, moving=1)
    fade(cr, 1 - seg(t, 0, 0.8), (1, 1, 1))


cue(280.8, "paper_unfold", 1.0)
cue(286.0, "whoosh_soft", 0.6)
cue(290.0, "hoof_steps", 0.6, dur=9)
cue(292.0, "moo", 0.9)
cue(296.0, "whoosh_soft", 0.5)


@shot(300, 320)
def s19(cr, t):
    night = eio(t, 0, 3)
    zoom = 1.2
    camx = 0
    cube_bg(cr, camx, -320, zoom, night=night)
    camera(cr, camx, -320, zoom)
    for tx, th_, sd in [(-820, 7, 5), (760, 8, 6)]:
        cube_tree_big(cr, tx, 0, 48, th_, seed=sd)
    night_overlay(cr, night * 0.6)
    camera(cr, camx, -320, zoom)
    # zombies
    z1 = lerp(-1300, 1300, seg(t, 3.5, 11.5))
    z2 = lerp(1300, -1300, seg(t, 11, 18.5))
    hide1 = 4.0 < t < 11.4
    hide2 = 11.2 < t < 18.2
    squash = 1.0
    if hide1 or hide2:
        squash = 0.05 + 0.02 * math.sin(t * 7)
    else:
        squash = 1.0
    # transitions
    if 3.6 < t < 4.2:
        squash = lerp(1, 0.05, seg(t, 3.7, 4.0))
    if 18.2 < t < 19:
        squash = lerp(0.05, 1, seg(t, 18.3, 18.8))
    # turns to follow the zombie (flip which side of the line faces)
    face = 1 if (hide1 and z1 < 0) or (hide2 and z2 < 0) else -1
    eyes = "wide"
    mouth = "wavy" if (hide1 or hide2) else "o"
    if t > 18.8:
        eyes, mouth = "closed", "smile"
    J = stickman(cr, 0, 0, 1.3, face, idle_pose(t), eyes=eyes, mouth=mouth, squash=squash, sq={"f": 1}, pix={"af": 0.3}, bracelet="f")
    if hide1 or hide2:
        for i in range(2):
            ph = ((t * 0.7 + i * 0.5) % 1)
            sweat(cr, 30 + i * 8, J["head"][1] - 30 + ph * 40, 0.9, a=1 - ph)
    for zx, zf, active, sd in ((z1, 1, 3.5 < t < 11.5, 0), (z2, -1, 11 < t < 18.5, 1)):
        if not active:
            continue
        # zombie stops and looks around when next to him
        pause = abs(zx) < 140
        zombie(cr, zx, 0, 1.4, zf if not (pause and math.sin(t * 3) > 0) else -zf, ph=t * 4, glow_eyes=True)


cue(300.0, "night_fall", 0.6, dur=3)
cue(303.5, "zombie_groan", 0.9)
cue(307.0, "zombie_groan", 0.7)
cue(304.0, "nervous_breath", 0.8, dur=7)
cue(311.5, "zombie_groan", 0.9)
cue(315.0, "zombie_groan", 0.6)
cue(312.0, "nervous_breath", 0.8, dur=6)
cue(318.8, "sigh", 0.9)


@shot(320, 330)
def s20(cr, t):
    zoom = 1.15
    camx = lerp(0, 300, eio(t, 4, 10))
    cube_bg(cr, camx, -320, zoom, night=1.0)
    camera(cr, camx, -320, zoom)
    # cave mouth on the right: stone hill with dark arch
    B = 48
    for j in range(9):
        for i in range(10 - max(0, j - 3)):
            block(cr, 560 + i * B + max(0, j - 3) * B * 0.5, -(j + 1) * B, B, "stone", 1, outline=False)
    rect(cr, 560 + B, -4 * B, 3 * B, 4 * B, rgb('#07070c'))
    rect(cr, 560 + B * 1.5, -5 * B, 2 * B, B, rgb('#07070c'))
    night_overlay(cr, 0.6)
    camera(cr, camx, -320, zoom)
    face = -1 if t < 2.0 else 1
    x = lerp(0, 520, eio(t, 4.5, 9.8))
    P = walk_pose(t * 4, 0.5) if 4.5 < t < 9.8 else idle_pose(t)
    if 4.5 < t < 9.8:
        P["lean"] = 14
        P["y"] += 6
    J = stickman(cr, x, 0, 1.3, face, P, eyes="wide" if t > 1.6 else "closed", mouth="o" if t > 1.6 else "smile",
                 look=(1, 0), sq={"f": 1}, pix={"af": 0.3}, bracelet="f")
    if 1.8 < t < 4:
        excl(cr, J["head"][0], J["head"][1] - 85, 1.2, seg(t, 1.8, 2.0), c=(1, 1, 1))
    fade(cr, seg(t, 9.0, 10))


cue(321.5, "meow_weak", 0.9)
cue(323.5, "meow_weak", 0.7)
cue(324.6, "tiptoe", 0.6, dur=5)
