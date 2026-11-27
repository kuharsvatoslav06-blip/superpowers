# -*- coding: utf-8 -*-
"""Hook (0:00-0:40) and Act 1 (0:40-3:00)."""
from common import *

# ====================================================================== HOOK
music(0, 5, "glitch_tense", 0.8)
music(12, 26.6, "piano_morning", 0.9)
music(28.5, 37.4, "suspense_quiet", 0.5)
music(37.4, 40, "title_hit", 1.0)
music(40, 60, "piano_comic", 0.8)
music(60, 80, "tension_low", 0.8)
music(80, 110, "panic", 0.9)
music(110, 130, "tension_low", 0.9)
music(130, 145, "suspense_quiet", 0.6)
music(145, 165, "panic_fast", 0.9)
music(165, 180, "resolve", 0.9)


def hero_face_hand(cr, t, sqk=1.0, pixk=0.5, zoom=2.6, cx=-200, cy=-300, inf=None, iv=None, crack=None):
    flat_world(cr, cx, cy, zoom, inf or inf_range(-50, 4000), iv or [(-50, 5000)], crack=crack)
    P = idle_pose(t)
    P = reach(-200, 0, 1.4, -1, P, (-320, -330), "f")
    J = stickman(cr, -200, 0, 1.4, -1, P, eyes="wide", look=(1, 0.2), mouth="o", mouthk=0.3 * math.sin(t * 9),
                 sq={"f": sqk}, pix={"af": pixk})
    return J


@shot(0, 5)
def s01(cr, t):
    if t < 3.4:
        # extreme close-up of the hand: fingers break into steps one by one
        paper_bg(cr)
        cr.identity_matrix()
        for i in range(30):
            gx = hsh(i, 3) * W
            gy = hsh(i, 4) * H
            sz = 20 + hsh(i, 5) * 50
            rect(cr, gx, gy, sz, sz, GRASS, 0.08 + 0.05 * math.sin(t * 3 + i))
        tr = 4 + 10 * seg(t, 1.0, 3.2)
        ox, oy = vnoise(t * 22, 1) * tr, vnoise(t * 22, 2) * tr
        cr.translate(ox, oy)
        palm = (930, 610)
        stroke_poly(cr, [(250, 1250), (palm[0] - 30, palm[1] + 40)], INK, 78)
        circle(cr, palm[0], palm[1], 72, INK)
        angs = [-150, -100, -78, -56, -34]
        lens = [170, 230, 250, 235, 190]
        for i, (an, L) in enumerate(zip(angs, lens)):
            a0 = rad(an)
            base = (palm[0] + math.cos(a0) * 40, palm[1] + math.sin(a0) * 40)
            mid = (base[0] + math.cos(a0 + 0.1) * L * 0.55, base[1] + math.sin(a0 + 0.1) * L * 0.55)
            tip = (mid[0] + math.cos(a0 + 0.2) * L * 0.45, mid[1] + math.sin(a0 + 0.2) * L * 0.45)
            k = eio(t, 0.35 + i * 0.5, 0.75 + i * 0.5)
            draw_limb(cr, [base, mid, tip], 40, INK, k * 0.95, 40)
            if 0.02 < k < 0.98:
                glitch_squares(cr, tip[0] - 70, tip[1] - 70, 140, 140, k, seed=i * 7, n=10)
        if t > 2.5:
            k = seg(t, 2.5, 3.4)
            circle(cr, palm[0], palm[1], 1, INK)
            cr.save()
            cr.rectangle(palm[0] - 80, palm[1] - 80, 160, 160)
            src(cr, INK, k)
            cr.fill()
            cr.restore()
        vignette(cr, 0.45)
        fade(cr, 1 - seg(t, 0, 0.25))
    else:
        tt = t - 3.4
        hero_face_hand(cr, t, 1.0, 0.5, zoom=2.6 - 0.1 * tt)
        camera(cr, -200, -300, 2.6 - 0.1 * tt)
        J = stick_joints(-200, 0, 1.4, -1, idle_pose(t))
        sweat(cr, J["head"][0] + 40, J["head"][1] - 30 + tt * 10, 1.2)
        surprise_lines(cr, J["head"][0], J["head"][1] - 55, 1.3, k=eout(seg(tt, 0, 0.3)))
        vignette(cr, 0.4)


for i in range(5):
    cue(0.35 + i * 0.5, "pixel_crunch", 0.9)
cue(0.0, "glitch", 0.9)
cue(3.4, "glitch", 0.6)
cue(3.45, "gasp", 0.8)


@shot(5, 10)
def s02(cr, t):
    k = eio(t, 0.0, 4.2)
    zoom = lerp(2.5, 0.42, k)
    cx = lerp(-200, 500, k)
    cy = lerp(-300, -620, k)
    flat_world(cr, cx, cy, zoom, inf_range(-50, 4000), [(-50, 5000)], crack=(1050, -1450, 520),
               shake=2 * seg(t, 3, 5))
    P = idle_pose(t)
    look_back = eio(t, 1.6, 2.4)
    P = reach(-200, 0, 1.4, -1, P, (-320, -330 + 80 * look_back), "f")
    J = stickman(cr, -200, 0, 1.4, -1 if look_back < 0.5 else 1, P, eyes="wide",
                 look=(1, -0.3 if look_back > 0.5 else 0.2), mouth="o", sq={"f": 1}, pix={"af": 0.5})
    # a cubic Точка sits behind him, sad
    dog(cr, -420, 0, 1.4, 1, cube=1, sit=1, eyes="sad", tail_cube=1, tail_wag=0.2)
    vignette(cr, 0.35)


cue(5.0, "music_cut", 1.0)
cue(5.1, "drone_low", 0.8, dur=4.8)
cue(7.0, "wind", 0.5, dur=3)


@shot(10, 12)
def s03(cr, t):
    # rewind: replay hook backwards
    tt = 10 - (t / 2.0) * 10
    set_time(tt)
    if tt >= 5:
        s02(cr, tt - 5)
    else:
        s01(cr, max(tt, 3.5))
    set_time(10 + t)
    rewind_overlay(cr, 1.0)
    fade(cr, seg(t, 1.75, 2.0), (1, 1, 1))


cue(10.0, "rewind", 1.0, dur=2.0)


# ---------------------------------------------------------------- morning
def ball_draw(cr, x, y, r=28, f=1.0, a=1.0):
    pts = ellipse_pts(x, y, r, r, -math.pi / 2, 1.5 * math.pi, 40)
    if f >= 1:
        circle(cr, x, y, r, rgb('#ff6b5a'), a * 0.85)
        pline(cr, [(x - r, y), (x + r, y)], 3, PENCIL, a, seed=4, amp=0.6)
        pline(cr, ellipse_pts(x, y, r * 0.4, r, -math.pi / 2, math.pi / 2, 16), 3, PENCIL, a, seed=5, amp=0.6)
    return pencil_path(cr, pts, f, 4, PENCIL, seed=3, a=a)


@shot(12, 25)
def s04(cr, t):
    T0 = 12
    HX = -250
    # ball & dog choreography
    ball = None
    dogx, dogface, dogjump, dogmove, dogph, sit = -80, 1, abs(math.sin(t * 6)) * 18, 0.0, 0, 0
    mouth_ball = False
    if t < 2.5:
        pass
    elif t < 5.6:
        dogjump = abs(math.sin(t * 5)) * 10
    elif t < 7.55:
        k = seg(t, 5.8, 7.3)
        dogx = lerp(-80, 560, ease(k))
        dogmove = 1 if t < 7.3 else 0
        dogph = t * 18
        dogjump = 0 if t < 7.25 else 60 * math.sin(math.pi * seg(t, 7.25, 7.9))
    elif t < 10.3:
        k = seg(t, 7.9, 10.2)
        dogjump = 60 * math.sin(math.pi * seg(t, 7.25, 7.9)) if t < 7.9 else 0
        dogx = lerp(560, -110, ease(k))
        dogface = -1 if t > 7.9 else 1
        dogmove = 1 if 7.9 < t < 10.2 else 0
        dogph = t * 18
        mouth_ball = True
    else:
        dogx, dogface, sit = -110, -1, eio(t, 10.3, 10.8)
        dogjump = 0
        mouth_ball = t < 10.9
    # camera
    if t < 2.5:
        cx = lerp(500, -40, eio(t, 0, 2.5))
    elif t < 5.7:
        cx = -40
    elif t < 7.9:
        cx = lerp(-40, 300, eio(t, 5.7, 7.6))
    else:
        cx = lerp(300, -150, eio(t, 7.9, 10.0))
    zoom = 1.0 if t < 10.3 else lerp(1.0, 1.35, eio(t, 10.3, 12.5))
    flat_world(cr, cx, -330, zoom)
    camera(cr, cx * 0.25, -330, zoom)
    birds(cr, -400, -800, t)
    camera(cr, cx, -330, zoom)
    # hero
    P = idle_pose(t)
    eyes, mouth, look = "normal", "smile", (1, 0)
    pencil = False
    if 2.4 < t < 4.4:
        f = seg(t, 2.6, 4.2)
        tip = ball_draw(cr, -150, -360, 28, f)
        P = reach(HX, 0, 1.4, 1, P, (tip[0] - 20, tip[1] + 15), "f")
        pencil = True
        look = (1, -0.4)
    elif 4.4 <= t < 5.6:
        k = eio(t, 4.9, 5.6)
        bx, by = lerp(-150, -330, k), lerp(-360, -390, k)
        ball = (bx, by)
        P = reach(HX, 0, 1.4, 1, pose(lean=-8 * k), (bx - 10, by + 10), "f")
        look = (1, -0.3)
    elif 5.6 <= t < 7.6:
        k = seg(t, 5.6, 7.55)
        bx = lerp(-150, 610, k)
        by = lerp(-380, -150, k) - 520 * 4 * k * (1 - k)
        ball = (bx, by)
        P = lerp_pose(pose(lean=12, ua_f=160, la_f=150), idle_pose(t), eio(t, 5.8, 6.6))
        look = (1, -0.5 * (1 - k))
        eyes = "happy"
        mouth = "grin"
    elif 7.6 <= t < 10.3:
        P = pose(ua_f=150 + 10 * math.sin(t * 10), la_f=170, ua_b=-150 - 10 * math.sin(t * 10), la_b=-170, y=10 * abs(math.sin(t * 6)))
        eyes, mouth = "happy", "grin"
    else:
        dxh = dogx + dogface * 1.3 * 40
        P = reach(HX, 0, 1.4, 1, pose(lean=28, th_f=40, sh_f=-10, th_b=-20, sh_b=-30), (dxh + 10, -95 + 6 * math.sin(t * 8)), "f")
        eyes, mouth = "happy", "smile"
    stickman(cr, HX, 0, 1.4, 1, P, eyes=eyes, look=look, mouth=mouth, pencil=pencil)
    dog(cr, dogx, 0, 1.3, dogface, ph=dogph, moving=dogmove, jump=dogjump, sit=sit, eyes="happy" if t > 7.9 else "normal",
        mouth="tongue" if not mouth_ball else None, tail_wag=1.5)
    if 4.2 <= t < 4.4:
        ball_draw(cr, -150, -360, 28, 1.0)
    if ball:
        ball_draw(cr, ball[0], ball[1], 28, 1.0)
    if mouth_ball:
        hx = dogx + dogface * 1.3 * 56
        hy = -(26 + 8 + 22) * 1.3 - dogjump * 1.3 + 10
        ball_draw(cr, hx, hy, 24, 1.0)
    elif t >= 10.9:
        k = seg(t, 10.9, 11.3)
        ball_draw(cr, -110 - 1.3 * 56, lerp(-60, -26, ein(k)), 24, 1.0)
    fade(cr, 1 - seg(t, 0, 0.3), (1, 1, 1))


scribble_cue(12 + 2.6, 1.6)
cue(12 + 5.6, "whoosh", 0.6)
cue(12 + 7.6, "bark", 0.9)
cue(12 + 9.0, "bark", 0.7)
cue(12 + 10.9, "boing", 0.5)
cue(12 + 0.5, "bark", 0.6)


@shot(25, 35)
def s05(cr, t):
    land = 1.6
    BX, BY, BS = X0, -28, 84
    up = eio(t, 0.2, 1.0) * (1 - eio(t, 1.5, 1.9))
    if t < 4.5:
        cx, cy, zoom = lerp(-60, 0, up), lerp(-330, -620, up), lerp(1.0, 0.8, up)
    else:
        k = eio(t, 4.5, 10)
        cx, cy, zoom = lerp(-60, 60, k), lerp(-330, -180, k), lerp(1.0, 1.55, k)
    sh = 14 * (1 - seg(t, land, land + 0.5)) if t > land else 0
    flat_world(cr, cx, cy, zoom, shake=sh)
    # falling block
    if t < land:
        k = seg(t, 0.1, land)
        bx = lerp(700, BX, k)
        by = lerp(-1900, BY, ein(k) * 0.4 + k * 0.6)
        iso_block(cr, bx, by, BS, rot=t * 5, glow_k=0.3)
        for i in range(4):
            pline(cr, [(bx + (i - 1.5) * 22, by - 70), (bx + (i - 1.5) * 22 + 60, by - 260)], 3, PENCIL, 0.6, seed=i)
    else:
        # ground cracks around impact
        for i, an in enumerate([-160, -130, -40, -15, 200]):
            L = 70 + 30 * (i % 2)
            k = eout(seg(t, land, land + 0.3))
            a0 = rad(an)
            pline(cr, [(BX + math.cos(a0) * 50, 0), (BX + math.cos(a0) * (50 + L * k), abs(math.sin(a0)) * L * k * 0.2 + 4)], 3, PENCIL, 1, seed=i)
        dust_puff(cr, BX, 0, seg(t, land, land + 0.9), 1.3)
        iso_block(cr, BX, BY, BS, rot=0.22, glow_k=0.15 + 0.1 * math.sin(t * 3))
    # characters
    HX = -150 if t < 4.5 else lerp(-150, -20, eio(t, 4.8, 9.0))
    walking = 4.8 < t < 9.0
    jumpk = math.sin(math.pi * seg(t, land, land + 0.45)) if t > land else 0
    P = idle_pose(t)
    if walking:
        P = walk_pose(t * 5, 0.5)
        P["lean"] = -4
    P["y"] = P.get("y", 0) + 40 * jumpk
    look = (0.6, -1) if t < land + 0.3 else (1, 0.2)
    eyes = "wide" if t > land else "normal"
    stickman(cr, HX, 0, 1.4, 1, P, eyes=eyes, look=look, mouth="o" if land < t < 4 else "flat")
    if land < t < 3.5:
        J = stick_joints(HX, 0, 1.4, 1, P)
        surprise_lines(cr, J["head"][0], J["head"][1] - 55, 1.3, k=eout(seg(t, land, land + 0.2)))
    if 3.0 < t < 8.0:
        J = stick_joints(HX, 0, 1.4, 1, P)
        qa = seg(t, 3.0, 3.3) * (1 - seg(t, 7.5, 8.0))
        qmark(cr, J["head"][0] + 10, J["head"][1] - 110, 1.6, qa)
    DX = -60 if t < 4.5 else lerp(-60, 0, eio(t, 4.8, 9.5))
    dog(cr, DX, 0, 1.3, 1, ph=t * 6, moving=0.5 if 4.8 < t < 9.5 else 0, sit=1 - seg(t, 4.0, 4.6) if t < 4.6 else 0,
        jump=50 * jumpk, eyes="wide" if t > land else "normal", look=look, ears=-0.3 if t > land else 0,
        sniff=0.4 * seg(t, 6, 9) * (0.5 + 0.5 * math.sin(t * 9)), tail_wag=0.3 if t > land else 1.2)


cue(25.0, "whistle", 1.0, dur=1.6)
cue(25 + 1.6, "thud", 1.0)
cue(25 + 1.62, "music_cut", 1.0)
cue(25 + 3.0, "hm", 0.7)
cue(25 + 5.0, "footsteps_soft", 0.4, dur=4)


@shot(35, 40)
def s06(cr, t):
    BX, BY, BS = X0, -28, 84
    zoom = 2.3 + 0.1 * t
    flat_world(cr, 80, -70, zoom)
    iso_block(cr, BX, BY, BS, rot=0.22, glow_k=0.15)
    paw = eio(t, 1.0, 1.35) * (1 - eio(t, 1.9, 2.3))
    sniff = (0.5 + 0.5 * math.sin(t * 14)) * (1 - seg(t, 1.0, 1.3))
    frozen = 1.4 < t < 2.4
    tc = eio(t, 2.4, 2.8)
    dog(cr, 22, 0, 1.3, 1, sniff=sniff, paw=paw, eyes="wide" if t > 2.4 else "normal",
        look=(1, 0.3) if t < 2.4 else (-1, 0), tail_cube=tc, tail_wag=0 if t > 1.4 else 1.0)
    if 2.3 < t < 3.0:
        glitch_squares(cr, -60, -110, 70, 80, seg(t, 2.3, 3.0), seed=4, n=8)
    if t > 2.95:
        k = seg(t, 2.95, 3.25)
        fade(cr, 0.55 * k)
        cr.identity_matrix()
        s = eback(seg(t, 2.95, 3.4))
        cr.save()
        cr.translate(W / 2, H / 2 - 40)
        cr.scale(s, s)
        pixel_text(cr, "КУБИЧЕСКАЯ ЧУМА", 0, 0, 190, c=GRASS, outline=INK, px=10)
        cr.restore()
        for i in range(22):
            ph = (t * 0.5 + hsh(i, 7)) % 1
            rect(cr, hsh(i, 8) * W, ph * H, 14 + hsh(i, 9) * 18, 14 + hsh(i, 9) * 18, GRASS, 0.6 * k)
        fade(cr, seg(t, 4.6, 5.0))


cue(35.0, "sniff", 0.8)
cue(35 + 1.35, "pixel_click", 1.0)
cue(35 + 2.45, "pixel_crunch", 1.0)
cue(35 + 2.95, "title_stamp", 1.0)


# ====================================================================== ACT 1
@shot(40, 60)
def s07(cr, t):
    flat_world(cr, 0, -230, 1.55)
    iso_block(cr, X0, -28, 84, rot=0.22)
    cube = eio(t, 0.2, 3.2)
    # dog jerky running
    dx, dface, dmove, dph = 30, 1, 0, 0
    if 5 < t < 11:
        q = math.floor((t - 5) / 0.2) * 0.2
        u = q / 3.0
        tri = 1 - abs((u % 2) - 1)
        dx = 30 + 300 * tri
        dface = 1 if (u % 2) < 1 else -1
        dmove = 1
        dph = math.floor((t - 5) / 0.2) * math.pi / 2
    elif t >= 11:
        dx, dface = 60, -1
    deyes = "wide" if t < 5 else "normal"
    if 11 < t < 15.5:
        deyes = "squint"
    if t > 15.5:
        dface = 1
        deyes = "closed"
    dog(cr, dx, 0, 1.3, dface, ph=dph, moving=dmove, cube=cube, tail_cube=1, eyes=deyes, look=(0.3, 1) if 3.5 < t < 5 else (1, 0),
        ears=0.6 if 11 < t < 15.5 else 0, tail_wag=0.5 if t < 15.5 else 0)
    if 0.1 < t < 3.4:
        glitch_squares(cr, dx - 80, -120, 160, 120, seg(t, 0.1, 3.4), seed=11, n=16)
    # hero
    HX = -230
    P = idle_pose(t)
    eyes, mouth, look = "wide", "o", (1, 0)
    if t < 4:
        P = pose(lean=-14 * eio(t, 0.3, 1.0), ua_f=40, la_f=70, ua_b=-30, la_b=10)
    elif t < 9:
        P = pose(lean=-6, ua_f=20, la_f=40)
        look = (1 if dx > HX else -1, 0)
    elif t < 14:
        k = eio(t, 9, 9.5)
        J0 = stick_joints(HX, 0, 1.4, 1, pose(lean=8))
        P = reach(HX, 0, 1.4, 1, pose(lean=8 + 6 * math.sin(t * 20) * k, hx=2 * math.sin(t * 30)), (J0["head"][0] + 40, J0["head"][1] + 20), "f")
        if t > 11.5:
            P = pose(lean=-14 + 5 * math.sin(t * 18), ua_f=60, la_f=110 + 10 * math.sin(t * 18), ua_b=-40, la_b=-60, y=4 * abs(math.sin(t * 18)))
        eyes, mouth = "happy", ("flat" if t < 11.5 else "grin")
    else:
        P = pose(ua_f=150, la_f=200, ua_b=-10)
        eyes, mouth = "sad", "wavy"
    J = stickman(cr, HX, 0, 1.4, 1, P, eyes=eyes, look=look, mouth=mouth)
    if t > 14:
        sweat(cr, J["head"][0] - 30, J["head"][1] - 40 + (t - 14) * 6, 1.3)
    if 0.3 < t < 2.5:
        surprise_lines(cr, J["head"][0], J["head"][1] - 55, 1.3)


cue(40.2, "pixel_spread", 0.9, dur=3.0)
for i in range(30):
    cue(45 + i * 0.2, "step8", 0.5)
cue(49.2, "snort", 0.8)
cue(51.5, "giggle", 0.8, dur=2.5)
cue(51.0, "hmph", 0.6)
cue(55.6, "hmph", 0.7)
cue(54.3, "sigh", 0.5)


@shot(60, 80)
def s08(cr, t):
    R = max(0, (t - 6) * 52)
    tree_p = eio(t, 3.6, 5.8)

    def inf(x):
        base = inf_range(X0 - R, X0 + R)(x) if R > 0 else 0
        if abs(x - 330) < 2:
            return max(tree_p, base)
        return base

    zoom = lerp(1.05, 0.62, eio(t, 6, 20))
    cx = lerp(240, 100, eio(t, 6, 20))
    cy = lerp(-300, -380, eio(t, 6, 20))
    iv = [(X0 - R, X0 + R)] if R > 0 else []
    flat_world(cr, cx, cy, zoom, inf, iv)
    iso_block(cr, X0, -28, 84, rot=0.22)
    # dog walks to the tree, jerky
    if t < 3.6:
        q = math.floor(t / 0.25) * 0.25
        dx = lerp(150, 262, seg(q, 0.5, 3.4))
        dog(cr, dx, 0, 1.3, 1, ph=q * 8, moving=1 if t > 0.5 else 0, cube=1, tail_cube=1, paw=eio(t, 3.2, 3.6))
    else:
        dog(cr, 262, 0, 1.3, 1 if t < 7 else -1, cube=1, tail_cube=1, paw=1 - eio(t, 4.2, 4.6), eyes="wide" if t > 3.8 else "normal",
            ears=0.5 if t > 4 else 0, sit=eio(t, 7, 7.5))
    # hero backs away
    HX = lerp(-120, -560, eio(t, 6.5, 18))
    walking = 6.5 < t < 18
    P = walk_pose(-t * 4, 0.6) if walking else idle_pose(t)
    P["lean"] = -8
    J = stickman(cr, HX, 0, 1.4, 1, P, eyes="wide", look=(1, 0.2), mouth="o" if t > 4 else "flat")
    if 3.8 < t < 5.5:
        surprise_lines(cr, J["head"][0], J["head"][1] - 55, 1.3)
    if t > 9:
        sweat(cr, J["head"][0] - 34, J["head"][1] - 30, 1.2, a=0.9)


cue(60.3, "step8", 0.4)
cue(60.8, "step8", 0.4)
cue(61.3, "step8", 0.4)
cue(61.8, "step8", 0.4)
cue(63.6, "pixel_crunch", 0.9)
cue(63.8, "pixel_spread", 0.8, dur=2.0)
cue(66.0, "crackle", 0.8, dur=14.0)


def bystander(cr, x, s, face, t, hat, run=True, panic=True, ph0=0.0, pix=None, cube=0.0, quant=False):
    ph = t * 13 + ph0
    if quant:
        ph = math.floor(ph / (math.pi / 2)) * (math.pi / 2)
    P = run_pose(ph) if run else idle_pose(t)
    if panic and run:
        P["ua_f"] = 160 + 15 * math.sin(ph * 1.3)
        P["la_f"] = 170
        P["ua_b"] = -160 - 15 * math.sin(ph * 1.3)
        P["la_b"] = -175
    return stickman(cr, x, 0, s, face, P, eyes="wide", mouth="wavy" if panic else "smile", hat=hat, pix=pix, cube=cube,
                    look=(-1, 0))


@shot(80, 110)
def s09(cr, t):
    if t < 7:
        xf = 2400 - 70 * t
        flat_world(cr, 1500, -420, 0.72, inf_range(xf, 6000), [(xf, 7000)])
        hats = ["bow", "top", "scarf", "beanie", "none"]
        for i in range(5):
            x = 1750 + i * 260 - (330 + 25 * ((i * 3) % 5)) * t
            bystander(cr, x, 1.2, -1, t, hats[i], ph0=i * 1.7)
    elif t < 15:
        tt = t - 7
        rx = 1500 - 280 * tt
        xf = rx + 380 - 30 * tt
        flat_world(cr, rx - 120, -300, 1.55, inf_range(xf, 6000), [(xf, 7000)])
        pk = [eio(tt, 1.2 + i * 0.6, 2.0 + i * 0.6) for i in range(5)]
        pix = {"af": pk[0], "ab": pk[1], "lf": pk[2], "lb": pk[3], "t": pk[4]}
        cube = eio(tt, 4.5, 5.3)
        q = tt > 2.6
        yq = 0
        if q:
            yq = math.floor(((tt * 6) % 2)) * 8
        bystander(cr, rx, 1.4, -1, tt, "top", pix=pix, cube=cube, quant=q)
        if 1.2 < tt < 5.5:
            J = stick_joints(rx, 0, 1.4, -1, run_pose(tt * 13))
            glitch_squares(cr, rx - 90, -330, 180, 330, seg(tt, 1.2, 5.5), seed=21, n=12)
    elif t < 23:
        tt = t - 15
        PX = 700
        flat_world(cr, PX, -220, 1.5, inf_range(PX + 420 - 120 * seg(tt, 2.5, 6) * 4, 6000),
                   [(PX + 420 - 480 * seg(tt, 2.5, 6), 7000)], city=True)
        # puddle pit
        water_k = eio(tt, 3.2, 5.5)
        pw = 320
        cr.save()
        rect(cr, PX - pw / 2, -2, pw, 140, PAPER)
        fill_poly(cr, [(PX - pw / 2, 0)] + [(PX - pw / 2 + i * pw / 20, 4 * math.sin(i * 1.3 + t * 5) * (1 - water_k)) for i in range(21)] +
                  [(PX + pw / 2, 140), (PX - pw / 2, 140)], rgb('#8cc8ff'), 0.85 * (1 - water_k))
        pline(cr, [(PX - pw / 2, 0), (PX - pw / 2, 140), (PX + pw / 2, 140), (PX + pw / 2, 0)], 4, PENCIL, 1, seed=8)
        if water_k > 0:
            B = 40
            for j in range(4):
                for i in range(8):
                    cxb = PX - pw / 2 + i * B
                    if (PX + pw / 2 - cxb) / pw < water_k * 1.2:
                        block(cr, cxb, j * B - 20 + 20, B, "water", water_k)
        cr.restore()
        # stickman jumps in
        if tt < 1.6:
            sx = lerp(PX + 520, PX + 60, seg(tt, 0, 1.6))
            jump = 140 * math.sin(math.pi * seg(tt, 1.0, 1.6))
            P = run_pose(tt * 13)
            P["y"] += jump / 1.3
            stickman(cr, sx, 0, 1.3, -1, P, eyes="wide", mouth="wavy", hat="bow")
        else:
            sink = 120 * eout(seg(tt, 1.6, 2.1))
            P = pose(ua_f=120 + 30 * math.sin(tt * 9), la_f=150, ua_b=-120 - 30 * math.sin(tt * 9), la_b=-150)
            if tt > 4.5:
                P = pose(ua_f=40 + 10 * math.sin(tt * 14), la_f=10, ua_b=-40, la_b=-10, lean=10 * math.sin(tt * 7))
            cr.save()
            cr.rectangle(PX - 1000, -2000, 2000, 2000 - 2 + 0)
            cr.clip()
            J = stickman(cr, PX + 60, sink, 1.3, -1, P, eyes="wide" if tt < 4.5 else "sad", mouth="o" if tt < 4.5 else "frown", hat="bow")
            cr.restore()
            if tt > 4.8:
                sweat(cr, J["head"][0] + 40, J["head"][1] - 30, 1.2)
            if 1.6 < tt < 2.4:
                for i in range(8):
                    k = seg(tt, 1.6, 2.4)
                    an = -math.pi / 2 + (i - 3.5) * 0.3
                    circle(cr, PX + 60 + math.cos(an) * 160 * k, -20 + math.sin(an) * 200 * k + 300 * k * k, 9 * (1 - k), rgb('#6ab6ff'))
    else:
        tt = t - 23
        flat_world(cr, 500, -520, 0.5, inf_range(-200, 6000), [(-200, 7000)])
        hats = ["bow", "top", "scarf", "beanie", "none", "cap2", "bow", "top"]
        for i in range(8):
            d = -1 if i % 2 else 1
            x = (-900 if d > 0 else 1900) + d * (240 + 30 * i) * tt + i * 37
            if i in (2, 3) and tt > 3.2:
                # collision
                x = 500 + (i - 2.5) * 60 - (i - 2.5) * 100 * seg(tt, 3.2, 3.6)
                rotk = eout(seg(tt, 3.2, 3.8))
                stickman(cr, x, 0, 1.2, d, pose(lean=0), eyes="closed", rot=-d * rad(90) * rotk, hat=hats[i] if hats[i] != "cap2" else "none", look=(1, 0))
                continue
            if i in (2, 3):
                x = 500 + (i - 2.5) * 60 - d * 240 * (3.2 - tt)
            bystander(cr, x, 1.2, d, tt, hats[i] if hats[i] != "cap2" else "none", ph0=i)
        if 3.2 < tt < 4.2:
            impact_burst(cr, 500, -260, seg(tt, 3.2, 4.2), 1.6, c=INK)


cue(80.0, "crowd_panic", 0.7, dur=7)
cue(87.0, "footsteps_fast", 0.5, dur=8)
cue(88.2, "pixel_spread", 0.7, dur=4)
cue(96.6, "splash", 1.0)
cue(98.2, "pixel_crunch", 0.8)
cue(98.4, "freeze_blocks", 0.9)
cue(100.0, "sigh", 0.6)
cue(103.0, "crowd_panic", 0.6, dur=7)
cue(106.2, "bonk", 1.0)


@shot(110, 130)
def s10(cr, t):
    # front of infection approaches from the right
    if t < 8:
        xf = lerp(500, -60, eio(t, 2.5, 6.8))
        if t > 6.8:
            xf = lerp(-60, -160, eio(t, 6.8, 8))
    else:
        xf = lerp(-160, -330, eio(t, 9.5, 13.2))
        if t > 13.2:
            xf = lerp(-330, -380, seg(t, 13.2, 20))
    cx = -260
    flat_world(cr, cx, -280, 1.15, inf_range(xf, 6000), [(xf, 7000)], city=True)
    dog(cr, -720, 0, 1.3, 1, cube=1, tail_cube=1, sit=1, eyes="sad", tail_wag=0)
    HX = lerp(-330, -470, eio(t, 6.5, 8.5))
    P = idle_pose(t)
    pencil = False
    eyes, mouth = "wide", "flat"
    # wall
    WX = -100
    wall = [(WX, 0), (WX, -330), (WX + 46, -330), (WX + 46, 0)]
    if t < 7.2:
        f = seg(t, 0.4, 3.6)
        tip = pencil_path(cr, wall, f, 6, seed=2)
        if f >= 1:
            for j in range(10):
                yy = -16 - j * 32
                pline(cr, [(WX, yy), (WX + 46, yy)], 3, PENCIL, seg(t, 3.6 + j * 0.05, 3.8 + j * 0.05), seed=j)
        if t < 3.9:
            P = reach(HX, 0, 1.4, 1, pose(lean=10), tip, "f")
            pencil = True
            eyes = "angry"
        if 6.6 < t < 7.2:
            glitch_squares(cr, WX - 40, -340, 120, 340, seg(t, 6.6, 7.2), seed=5)
    else:
        k = seg(t, 7.2, 8.4)
        for j in range(10):
            yy = -16 - j * 32
            ang = (hsh(j, 1) - 0.5) * 4 * k
            ox = 300 * k * hsh(j, 2)
            oy = 400 * k * k
            cr.save()
            cr.translate(WX + 23 - ox, yy + oy)
            cr.rotate(ang)
            pline(cr, [(-23, -16), (23, -16), (23, 16), (-23, 16)], 4, PENCIL, 1 - k, seed=j, close=True)
            cr.restore()
        debris(cr, WX + 23, -150, seg(t, 7.2, 8.4), n=10, s=1.0)
    # water
    if t > 8.5:
        WX0, WX1 = -420 + 60, -150
        WX0, WX1 = -330 - 60, -200
        f = seg(t, 9.0, 11.6)
        wave = [(WX0 + (WX1 - WX0) * i / 30, -4 - 10 * math.sin(i * 0.9 + t * 4)) for i in range(31)]
        wk = eio(t, 13.0, 14.6)
        if f > 0:
            pp = partial(wave, f)
            if wk < 1:
                fill_poly(cr, pp + [(pp[-1][0], 70), (WX0, 70)], rgb('#8cc8ff'), 0.8 * (1 - wk))
            tip = pencil_path(cr, wave, f, 5, rgb('#2a6fb0'), seed=4, a=1 - wk)
            if t < 11.8:
                P = reach(HX, 0, 1.4, 1, pose(lean=30, th_f=30, sh_f=-10), tip, "f")
                pencil = True
                eyes = "angry"
        if wk > 0:
            B = 34
            for i in range(int((WX1 - WX0) / B) + 1):
                if (WX1 - (WX0 + i * B)) / (WX1 - WX0) <= wk * 1.1:
                    block(cr, WX0 + i * B, -30, B, "water", 1)
                    block(cr, WX0 + i * B, 4, B, "water", 1)
    if t > 15:
        J0 = stick_joints(HX, 0, 1.4, 1, pose(lean=6))
        P = reach(HX, 0, 1.4, 1, pose(lean=6, hy=4), (J0["head"][0] + 30, J0["head"][1]), "f")
        eyes, mouth = "closed", "frown"
    J = stickman(cr, HX, 0, 1.4, 1, P, eyes=eyes, mouth=mouth, pencil=pencil, look=(1, 0.3))
    if t > 15.5:
        sweat(cr, J["head"][0] - 30, J["head"][1] - 40, 1.3)


scribble_cue(110.4, 3.2)
cue(116.6, "pixel_crunch", 0.9)
cue(117.2, "wall_break", 1.0)
scribble_cue(119.0, 2.6)
cue(123.0, "freeze_blocks", 0.9)
cue(125.2, "sigh", 0.8)


@shot(130, 145)
def s11(cr, t):
    DXc = -500
    pk = eio(t, 4.0, 7.4)
    front = lerp(-120, DXc + 135, eio(t, 6.5, 9.5))
    prot = [(DXc, 0, 135, pk)]
    flat_world(cr, -420, -260, 1.25, inf_range(front, 6000), [(front, 7000)], prot=[], city=True)
    # the circle (drawn manually, with front/back halves)
    pts = ellipse_pts(DXc, 6, 135, 38, math.pi / 2, math.pi / 2 + 2 * math.pi * pk, 70)
    if pk > 0:
        pline(cr, pts, 6, PENCIL, 1, seed=3)
    dog(cr, DXc, 0, 1.3, 1, cube=1, tail_cube=1, sit=1, eyes="sad" if t < 9.6 else "wide", tail_wag=0 if t < 9.6 else 1)
    # hero runs around the dog while drawing
    if t < 4:
        HX, face = -700, 1
        P = idle_pose(t)
        eyes, mouth = "sad", "frown"
        J = stickman(cr, HX, 0, 1.4, face, P, eyes=eyes, mouth=mouth)
    elif t < 7.4:
        th = math.pi / 2 + 2 * math.pi * pk
        HX = DXc + 175 * math.cos(th)
        gy = 6 + 50 * math.sin(th)
        face = -1 if math.sin(th) > 0 else 1
        tip = (DXc + 135 * math.cos(th), 6 + 38 * math.sin(th))
        P = reach(HX, gy, 1.4, face, run_pose(t * 14, 0.6) | dict(lean=35), tip, "f")
        J = stickman(cr, HX, gy, 1.4, face, P, eyes="angry", mouth="flat", pencil=True)
    else:
        HX = -700 + 40 * eio(t, 7.4, 8)
        P = idle_pose(t)
        eyes, mouth = "wide", "o"
        if t > 11:
            P = reach(HX, 0, 1.4, 1, P, (HX + 70, -260), "f")
            eyes, mouth = "wide", "flat"
        if t > 12.5:
            eyes, mouth = "happy", "grin"
        J = stickman(cr, HX, 0, 1.4, 1, P, eyes=eyes, mouth=mouth, pencil=t > 11, look=(1, -0.5) if t > 11 else (1, 0))
        if 9.6 < t < 11:
            surprise_lines(cr, J["head"][0], J["head"][1] - 55, 1.3)
        if 12 < t < 13.5:
            excl(cr, J["head"][0] + 10, J["head"][1] - 110, 1.6)
    # sparks where infection meets the line
    if t > 9.4:
        k = (t - 9.4) % 0.6 / 0.6
        for i in range(6):
            an = -math.pi / 2 + (i - 2.5) * 0.35
            sx = DXc + 135 + math.cos(an) * 60 * k
            sy = math.sin(an) * 60 * k
            rect(cr, sx, sy, 8 * (1 - k), 8 * (1 - k), rgb('#ffe066'), 1 - k)
        if t < 10.2:
            glow(cr, DXc + 135, 0, 120, rgb('#fff6a0'), 0.6 * (1 - seg(t, 9.4, 10.2)))


cue(130.0, "sigh", 0.6)
scribble_cue(134.0, 3.4, 0.9)
cue(136.5, "crackle", 0.7, dur=3.0)
cue(139.5, "ding", 1.0)
cue(142.0, "hm", 0.7)


@shot(145, 165)
def s12(cr, t):
    xk = 1300 - 150 * t
    xf = 1650 - 165 * t
    cx = lerp(1000, -1500, eio(t, 0, 20))
    houses = [o for o in CITY.objs if o["k"] == "house" and -1700 < o["x"] < 1300]
    prot = []
    for h in houses:
        th_ = (1300 - h["x"]) / 150 - 0.2
        if th_ > 17.5:
            continue  # too late: he could not reach these
        pk = seg(t, th_, th_ + 0.45)
        if pk > 0:
            prot.append((h["x"], 0, h["w"] / 2 + 40, pk))
    flat_world(cr, cx, -380, 0.6, inf_range(xf, 7000), [(xf, 8000)], prot=prot)
    # people inside some circles waving
    for i, h in enumerate(houses[::2]):
        th_ = (1300 - h["x"]) / 150 - 0.2
        if th_ < t and th_ < 17.5:
            stickman(cr, h["x"] + h["w"] / 2 + 10, 0, 1.0, -1, pose(ua_f=150 + 20 * math.sin(t * 8 + i), la_f=170), eyes="happy", mouth="smile",
                     hat=["bow", "top", "scarf", "beanie"][i % 4])
    if t < 18.5:
        tip_y = 0
        P = run_pose(t * 15)
        P = reach(xk, 0, 1.3, -1, P | dict(lean=30), (xk - 60, 6), "f")
        stickman(cr, xk, 0, 1.3, -1, P, eyes="angry", mouth="flat", pencil=True)
    else:
        P = pose(lean=25 + 4 * math.sin(t * 10), ua_f=20, la_f=10, ua_b=-10, y=0)
        J = stickman(cr, xk + 150 * (t - 18.5), 0, 1.3, 1, P, eyes="sad", mouth="o", look=(1, 0))
        sweat(cr, J["head"][0] - 40, J["head"][1] - 30, 1.2)


for i in range(16):
    cue(145 + 0.6 + i * 1.08, "pencil", 0.55, dur=0.45)
cue(145, "footsteps_fast", 0.5, dur=18)
cue(145, "crackle", 0.5, dur=20)
cue(163.6, "pant", 0.7, dur=3)


@shot(165, 180)
def s13(cr, t):
    HX = -1500
    up = eio(t, 3.0, 6.5) * (1 - eio(t, 8.5, 10.0))
    zoom = lerp(1.35, 0.42, up)
    if t > 10:
        zoom = lerp(1.35, 1.9, eio(t, 10, 15))
    cx = lerp(HX + 60, -700, up)
    cy = lerp(-300, -1050, up)
    if t > 10:
        cy = lerp(-300, -340, eio(t, 10, 15))
    flat_world(cr, cx, cy, zoom, inf_range(-900, 7000), [(-900, 8000)], prot=[(-1700, 0, 160, 1)], sun=None)
    # crack and floating trail of blocks (main layer)
    CX, CY = 200, -1700
    sky_crack(cr, CX, CY, 520, 1.0)
    for i in range(14):
        k = i / 13
        bx = lerp(-650, CX - 120, k) + math.sin(k * 5) * 120
        by = lerp(-130, CY + 150, k ** 0.9)
        by += math.sin(G["t"] * 1.5 + i) * 10
        iso_block(cr, bx, by, 64 - 18 * k, rot=math.sin(G["t"] + i) * 0.15)
    P = idle_pose(t)
    eyes, mouth, look = "sad", "o", (1, 0)
    if t < 3:
        P = pose(lean=22 + 4 * math.sin(t * 9), ua_f=15, la_f=10)
    elif t < 10:
        P = pose(lean=-12, hy=-3)
        eyes, look, mouth = "wide", (0.6, -1), "o"
    else:
        J0 = stick_joints(HX, 0, 1.4, 1, pose())
        tug = eio(t, 11, 11.6) * (1 - eio(t, 12.6, 13.1))
        P = reach(HX, 0, 1.4, 1, pose(), (J0["head"][0] + 50, J0["head"][1] - 25 + 8 * tug), "f")
        eyes, mouth, look = "angry", "flat", (1, 0)
    J = stickman(cr, HX, 0, 1.4, 1, P, eyes=eyes, mouth=mouth, look=look,
                 hat_tilt=0.15 * (eio(t, 11, 11.6) * (1 - eio(t, 12.6, 13.1))))
    if t < 3:
        sweat(cr, J["head"][0] - 40, J["head"][1] - 30, 1.2)


cue(165, "pant", 0.6, dur=3)
cue(168, "low_hum", 0.8, dur=7)
cue(176.0, "cap_tug", 0.8)
cue(176.3, "chord_resolve", 1.0)
