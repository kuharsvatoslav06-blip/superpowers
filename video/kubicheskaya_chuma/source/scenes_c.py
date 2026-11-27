# -*- coding: utf-8 -*-
"""Act 3 (5:30-8:00): Pixel."""
from common import *
from scenes_b import cube_bg

music(330, 350, "action", 0.9)
music(350, 370, "tender", 0.85)
music(370, 390, "sad_piano", 0.8)
music(390, 410, "hope", 0.85)
music(410, 440, "tension_low", 0.85)
music(440, 455, "suspense_bass", 0.9)
music(455, 475, "action", 1.0)
music(475, 480, "silence_wind", 0.5)

HARGS = dict(sq={"f": 1}, pix={"af": 0.3}, bracelet="f")


def cave_bg(cr, camx, camy, zoom):
    cr.identity_matrix()
    rect(cr, 0, 0, W, H, rgb('#1a1a20'))
    camera(cr, camx * 0.85, camy, zoom)
    B = 64
    x0 = int((camx - W / zoom) // B) * B
    for j in range(-14, 2):
        for i in range(int(2 * W / zoom / B) + 3):
            bx = x0 + i * B
            kind = "stone" if hsh(bx / B + j * 31, 5) > 0.08 else "purple"
            block(cr, bx, j * B, B, kind, 0.55, outline=False)
    rect(cr, x0, -14 * B, 40 * B, 16 * B, (0.02, 0.02, 0.05), 0.35)
    # torches with flicker
    for tx, ty in [(-700, -300), (100, -330), (900, -300)]:
        fl = 0.85 + 0.15 * math.sin(G["t"] * 17 + tx) * math.sin(G["t"] * 7)
        glow(cr, tx, ty - 50, 380 * fl, rgb('#ffb347'), 0.35)
        cr.save()
        cr.translate(tx, ty)
        cr.rotate(0.25)
        rect(cr, -6, -10, 12, 70, WOOD_D)
        rect(cr, -8, -26, 16, 18, rgb('#ffcf4a'))
        rect(cr, -5, -36 - 4 * fl, 10, 12, rgb('#fff1a0'))
        cr.restore()
    camera(cr, camx, camy, zoom)
    for i in range(int(2 * W / zoom / B) + 3):
        bx = x0 + i * B
        block(cr, bx, 0, B, "stone", 1, outline=True)
        block(cr, bx, B, B, "stone", 1, outline=False)


@shot(330, 350)
def s21(cr, t):
    zoom = 1.25
    camx = lerp(-150, -250, eio(t, 0, 20))
    cave_bg(cr, camx, -300, zoom)
    # kitten cornered on the left
    KX = -560
    tremble = 1.0 if t < 10 else 0.3
    kitten(cr, KX, 0, 1.15, 1, eyes="wide", ears_down=1.0, purr=tremble * 3, look=(1, 0) if t < 9 else (1, -0.5))
    # spider
    if t < 6.9:
        sx = lerp(-150, -280, eio(t, 0, 6.5))
        spider(cr, sx, 0, 1.4, -1, ph=t * 6, moving=1 if t < 6.5 else 0.3)
    else:
        k = seg(t, 6.9, 9.0)
        sx = lerp(-280, -900, k)
        sy = -900 * math.sin(math.pi * k * 0.7) - 200 * k
        spider(cr, sx, sy, 1.4, -1, ph=t * 20, moving=1, rot=k * 12, hurt=1)
    # hero bursts in from the right
    if t < 6.2:
        hx = lerp(800, -130, eio(t, 3.8, 6.2))
        P = run_pose(t * 14) if t > 3.8 else idle_pose(t)
        stickman(cr, hx, 0, 1.3, -1, P, eyes="angry", mouth="flat", **HARGS)
    elif t < 7.6:
        k = eio(t, 6.2, 6.85)
        P = lerp_pose(pose(lean=20, ua_f=-30, la_f=10, th_f=40, sh_f=10, th_b=-30, sh_b=-40),
                      pose(lean=-6, ua_f=170, la_f=175, th_f=20, sh_f=0, th_b=-20, sh_b=-30, y=14), k)
        J = stickman(cr, -130, 0, 1.3, -1, P, eyes="angry", mouth="grin", **HARGS)
        impact_burst(cr, J["hf"][0], J["hf"][1], seg(t, 6.85, 7.5), 1.3)
    else:
        hx = -130
        k = eio(t, 9.5, 11)
        J0 = stick_joints(hx, 0, 1.3, -1, pose())
        P = reach(hx, 0, 1.3, -1, pose(), (J0["head"][0] - 85, J0["head"][1] + 10 * (1 - k) + 40 * (1 - k)), "f") if t > 9.5 else \
            pose(ua_f=170, la_f=175, y=0)
        eyes, mouth = ("wide", "o") if t < 15 else ("happy", "smile")
        J = stickman(cr, hx, 0, 1.3, -1, P, eyes=eyes, mouth=mouth, look=(1, -0.3), **HARGS)
        if 11 < t < 14:
            surprise_lines(cr, J["head"][0], J["head"][1] - 60, 1.3, c=(1, 1, 1))
    vignette(cr, 0.55)
    fade(cr, 1 - seg(t, 0, 0.8))


cue(330.0, "cave_drip", 0.6, dur=20)
cue(330.5, "spider_hiss", 0.8)
cue(332.0, "meow_weak", 0.9)
cue(333.8, "footsteps_fast", 0.7, dur=2.4)
cue(336.85, "punch", 1.0)
cue(337.0, "spider_squeal", 0.9)
cue(339.4, "thud_far", 0.6)
cue(341.5, "hm", 0.7)


@shot(350, 370)
def s22(cr, t):
    zoom = lerp(1.35, 1.7, eio(t, 0, 12))
    camx = lerp(-380, -420, eio(t, 0, 12))
    cave_bg(cr, camx, -240, zoom)
    # kitten
    if t < 4:
        kx = lerp(-560, -620, eio(t, 0, 2))
        kitten(cr, kx, 0, 1.15, 1, eyes="wide", ears_down=0.8, purr=1.5)
    elif t < 7:
        q = math.floor((t - 4) / 0.5) * 0.5
        kx = lerp(-620, -470, q / 3)
        kitten(cr, kx, 0, 1.15, 1, eyes="normal", ears_down=0.3, tilt=0.12 * math.sin(t * 2), ph=q * 6, moving=1)
    else:
        rub = math.sin(t * 4) * 10 * seg(t, 10.5, 11.5)
        kx = -470 + rub
        e = "wide" if t < 9.5 else "happy"
        kitten(cr, kx, 0, 1.15, 1, eyes=e, ears_down=0, purr=1.0 if t > 10.5 else 0, tilt=0.15 * seg(t, 10.5, 11) * math.sin(t * 4))
        if t > 10.5:
            for i in range(4):
                ph = ((t - 10.5) * 0.4 + i * 0.25) % 1
                heart(cr, kx + 30 + math.sin(ph * 6 + i) * 30, -190 - ph * 160, 1.2, a=1 - ph)
    # hero kneels and offers the square hand
    HX = -230
    crouch = eio(t, 1, 3)
    base = pose(lean=35 * crouch, th_f=60 * crouch, sh_f=-30 * crouch, th_b=-10 * crouch, sh_b=-60 * crouch)
    if t > 7:
        k = eio(t, 7, 9.5)
        tgt = (lerp(-280, -330, k), lerp(-150, -120, k))
        if t > 10.5:
            tgt = (-330 + math.sin(t * 4) * 8, -120)
        P = reach(HX, 0, 1.3, -1, base, tgt, "f")
    else:
        P = base
    eyes = "normal" if t < 10.5 else "happy"
    stickman(cr, HX, 0, 1.3, -1, P, eyes=eyes, mouth="smile", look=(1, 0.4), **HARGS)
    vignette(cr, 0.5)


cue(350.5, "meow_weak", 0.6)
cue(354.0, "step8", 0.4)
cue(354.5, "step8", 0.4)
cue(355.0, "step8", 0.4)
cue(355.5, "sniff", 0.6)
cue(359.5, "meow_happy", 0.9)
cue(360.5, "purr", 0.9, dur=9)


def cliff_scene(cr, camx, camy, zoom, sunset=0.35, crack=(820, -360, 380), crack_open=1.0, edge=1000, night=0.0, shake=0.0):
    cube_sky(cr, night, sunset)
    camera(cr, camx * 0.1, camy * 0.2, zoom)
    square_sun(cr, -200, -650, 70, 1.0 - night)
    camera(cr, camx * 0.2, camy * 0.3, zoom)
    for i in range(5):
        pix_cloud(cr, -1300 + i * 640 + (G["t"] * 10) % 600, -780 + (i % 2) * 90, 1.0, 0.9, night)
    camera(cr, camx * 0.4, camy * 0.5, zoom)
    mountains(cr, 0, 260, mix(rgb('#b7a6d9'), rgb('#1c2a66'), night), seed=7, h=300, B=40, x0=-3000, x1=4000)
    # clouds below the cliff
    camera(cr, camx * 0.7, camy * 0.8, zoom)
    for i in range(6):
        pix_cloud(cr, 900 + i * 300, 180 + (i % 2) * 60, 1.3, 0.85, night)
    camera(cr, camx, camy, zoom, shake=shake)
    grass_world_ground(cr, camx - W / zoom, edge, 0, 48)
    if crack:
        sky_crack(cr, crack[0], crack[1], crack[2], crack_open, inner="paper", seed=4)


def tipped_blocks(cr, prints=True):
    iso_block(cr, 520, -40, 80, rot=0.5)
    iso_block(cr, 640, -36, 72, rot=-0.3)
    iso_block(cr, 420, -30, 60, rot=0.9)
    if prints:
        for i, (px, py) in enumerate([(606, -66), (626, -58), (650, -70), (668, -62)]):
            rect(cr, px, py, 9, 7, rgb('#3a2414'), 0.85)
            rect(cr, px - 4, py - 6, 4, 4, rgb('#3a2414'), 0.85)
            rect(cr, px + 9, py - 6, 4, 4, rgb('#3a2414'), 0.85)


@shot(370, 390)
def s23(cr, t):
    if t < 9.5:
        camx = lerp(-300, 400, eio(t, 0, 8))
        zoom = 1.0
        camy = -300
    elif t < 14:
        camx, camy, zoom = lerp(400, 620, eio(t, 9.5, 10.5)), lerp(-300, -120, eio(t, 9.5, 10.5)), lerp(1.0, 2.4, eio(t, 9.5, 10.5))
    else:
        camx, camy, zoom = lerp(620, 380, eio(t, 14, 15)), lerp(-120, -260, eio(t, 14, 15)), lerp(2.4, 1.35, eio(t, 14, 15))
    cliff_scene(cr, camx, camy, zoom)
    tipped_blocks(cr)
    q = math.floor(t / 0.3) * 0.3
    kx = lerp(-500, 330, seg(q, 0.5, 7))
    guilty = eio(t, 10.5, 11.5)
    kitten(cr, kx, 0, 1.0, 1 if t < 9 else (-1 if t > 11 else 1), ph=q * 6, moving=1 if 0.5 < t < 7 else 0,
           eyes="sad" if t > 11 else "normal", ears_down=guilty, look=(1, 0.5) if t > 11 else (1, 0), nod=0.5 * guilty)
    hx = lerp(-760, 120, eio(t, 1, 8.5))
    walking = 1 < t < 8.5
    P = walk_pose(t * 6, 0.8) if walking else idle_pose(t)
    eyes, mouth, look = "normal", "flat", (1, 0)
    if 8.5 < t < 14:
        eyes, look, mouth = "wide", (1, -0.6), "o"
    if t > 15:
        eyes, look, mouth = "sad", (1, 0.4), "flat"
    J = stickman(cr, hx, 0, 1.3, 1, P, eyes=eyes, mouth=mouth, look=look, **HARGS)
    if 8.6 < t < 9.8:
        excl(cr, J["head"][0] + 10, J["head"][1] - 90, 1.2)
    if 16 < t < 18.5:
        sweat(cr, J["head"][0] - 40, J["head"][1] - 30, 1.1)


cue(370.0, "wind", 0.5, dur=20)
for i in range(22):
    cue(370.5 + i * 0.3, "step8", 0.3)
cue(378.6, "realize", 0.8)
cue(381.0, "meow_sad", 0.9)
cue(386.0, "sigh", 0.6)


@shot(390, 410)
def s24(cr, t):
    camx = lerp(240, 380, eio(t, 12, 18))
    cliff_scene(cr, camx, -260, 1.35)
    tipped_blocks(cr)
    push = eio(t, 13.5, 19)
    hx = 120 + 260 * push
    kx = 330 if t < 13 else lerp(330, 40, eio(t, 12.5, 13.5)) + 260 * push
    # kitten
    if t < 8:
        kitten(cr, 330, 0, 1.0, -1, eyes="normal", look=(1, 0), ears_down=0.6)
    elif t < 11:
        kitten(cr, 330, 0, 1.0, -1, eyes="sad", ears_down=1.0, nod=eio(t, 8, 9))
    elif t < 13:
        kitten(cr, 330, 0, 1.0, -1, eyes="normal", ears_down=0, headshake=t - 11)
    else:
        kitten(cr, kx, 0, 1.0, 1, eyes="normal", ears_down=0, ph=t * 8, moving=1 if push < 1 else 0, tilt=-0.1 * (push < 1))
    # hero gestures
    J0 = stick_joints(hx, 0, 1.3, 1, pose())
    if t < 3:
        P = reach(hx, 0, 1.3, 1, idle_pose(t), (hx + 120, -40 + 10 * math.sin(t * 5)), "f")
        eyes, mouth = "sad", "frown"
    elif t < 8:
        P = pose(ua_f=60 + 20 * math.sin(t * 5), la_f=120, ua_b=-50, la_b=-100 + 20 * math.sin(t * 5))
        eyes, mouth = "sad", "o"
    elif t < 13:
        P = idle_pose(t)
        eyes, mouth = "sad", "flat"
    else:
        P = walk_pose(t * 6, 0.7) if push < 1 else idle_pose(t)
        P["lean"] = -12 if push < 1 else 0
        eyes, mouth = ("wide", "o") if t < 15 else ("happy", "smile")
    J = stickman(cr, hx, 0, 1.3, 1, P, eyes=eyes, mouth=mouth, look=(1, 0.3) if t < 3 else (1, 0), **HARGS)
    # thought bubble: home being eaten by cubes
    bk = eio(t, 2.5, 3.1) * (1 - eio(t, 8.5, 9.0))
    if bk > 0:
        bx, by = J["head"][0] + 230, J["head"][1] - 230
        thought_bubble(cr, bx, by, 380, 260, bk, seed=7)
        if bk > 0.95:
            cr.save()
            cr.translate(bx, by + 60)
            cr.scale(0.55, 0.55)
            flat_house(cr, -120, 200, 170, 2, 1.0, 0, seed=4)
            cube_house(cr, 150, 200, 170, 0, 1.0, seg(t, 3.5, 7.5))
            dog(cr, -320, 0, 0.9, 1, cube=1, tail_cube=1, eyes="sad", sit=1)
            pline(cr, [(-420, 0), (300, 0)], 5, PENCIL, 1, seed=3)
            cr.restore()


cue(392.5, "pop", 0.6)
cue(394.0, "sigh", 0.7)
cue(398.0, "meow_sad", 0.7)
cue(401.0, "meow_determined", 0.9)
cue(403.5, "scuffle", 0.6, dur=5)


@shot(410, 440)
def s25(cr, t):
    op = 1.0 + 0.7 * eio(t, 0, 5) - 0.05 * seg(t, 12, 15) + 0.1 * seg(t, 16, 16.3)
    camx, camy, zoom = 560, -330, 1.3
    sh = 6 if (16 < t < 16.6 or 21.2 < t < 21.8) else (3 if t < 5 else 0)
    cliff_scene(cr, camx, camy, zoom, crack=(820, -400, 380), crack_open=op, shake=sh)
    tipped_blocks(cr)
    # blocks get sucked into the crack
    for i in range(5):
        k = seg(t, 0.6 + i * 0.9, 2.0 + i * 0.9)
        if 0 < k < 1:
            bx = lerp(620 + i * 30, 820, ease(k))
            by = lerp(-30, -400, ease(k))
            iso_block(cr, bx, by, 50 * (1 - k * 0.8), rot=k * 5)
    kitten(cr, 260, 0, 1.0, 1, eyes="wide" if t < 6 else ("normal" if t < 26 else "normal"), ears_down=0.5 if t < 6 else 0,
           tilt=0.25 * eio(t, 26, 27), look=(1, -0.5))
    HX = 520
    P = idle_pose(t)
    eyes, mouth, look = "wide", "o", (1, -0.4)
    pencil = False
    # needle & thread drawn in the air
    ndl = [(610, -560), (700, -470)]
    eye_pts = ellipse_pts(605, -566, 10, 6, 0, 2 * math.pi, 16)
    thread = [(600, -572), (560, -600), (520, -560), (560, -520)]
    if 6 < t < 12:
        f = seg(t, 6.3, 10.5)
        tip = pencil_path(cr, ndl + eye_pts, seg(f, 0, 0.6), 5, rgb('#8a8a92'), seed=1)
        if f > 0.6:
            tip = pencil_path(cr, thread, seg(f, 0.6, 1.0), 4, rgb('#e03b3b'), seed=2)
        P = reach(HX, 0, 1.3, 1, P, tip, "f")
        pencil = f < 1
        eyes, mouth = "angry", "flat"
    elif 12 <= t < 24:
        # sewing tries: zigzag motion; snaps at 16.0 and 21.2
        tries = [(12, 16.0), (17.5, 21.2)]
        n_st = 0
        snap = None
        for (a, b) in tries:
            if a <= t < b:
                n_st = int((t - a) / 0.8) + 1
            if b <= t < b + 1.2:
                snap = seg(t, b, b + 1.2)
        ph = (t * 1.25) % 1
        hand = (lerp(760, 880, ph if int(t * 1.25) % 2 == 0 else 1 - ph), -470 + n_st * 30)
        if n_st:
            for i in range(n_st):
                yy = -520 + i * 30
                stroke_poly(cr, [(770, yy - 10), (870, yy + 10)], rgb('#d62828'), 9)
            stroke_poly(cr, [(780, -520 + (n_st - 1) * 30 + 8), hand], rgb('#e03b3b'), 3)
            P = reach(HX, 0, 1.3, 1, pose(lean=12), hand, "f")
            cr.save()
            cr.translate(hand[0], hand[1])
            cr.rotate(-0.7)
            stroke_poly(cr, [(-30, 0), (30, 0)], rgb('#8a8a92'), 5)
            cr.restore()
            eyes, mouth = "angry", "flat"
        if snap is not None:
            for i in range(6):
                yy = -520 + i * 30
                dx = 160 * snap * (1 if i % 2 else -1)
                stroke_poly(cr, [(780 - dx, yy - 8 + 300 * snap * snap), (800 - dx, yy + 300 * snap * snap)], rgb('#e03b3b'), 4, a=1 - snap)
                stroke_poly(cr, [(840 + dx, yy + 300 * snap * snap), (860 + dx, yy + 8 + 300 * snap * snap)], rgb('#e03b3b'), 4, a=1 - snap)
            impact_burst(cr, 820, -440, snap, 1.0)
            eyes, mouth = "wide", "o"
            P = pose(lean=-14, ua_f=60, la_f=90)
    else:
        # explains: needs someone on the other side
        P = pose(ua_f=80 + 30 * math.sin(t * 3), la_f=100, ua_b=-80, la_b=-60 + 30 * math.sin(t * 3 + 1))
        eyes, mouth = "normal", "flat"
        bk = eio(t, 24.5, 25.1)
        J0 = stick_joints(HX, 0, 1.3, 1, P)
        bx, by = J0["head"][0] - 260, J0["head"][1] - 210
        thought_bubble(cr, bx, by, 360, 240, bk, seed=9)
        if bk > 0.95:
            pline(cr, stairify([(bx, by - 90), (bx + 10, by - 30), (bx - 8, by + 30), (bx + 4, by + 90)], 8), 5, CRACK, 1)
            stickman(cr, bx - 70, by + 80, 0.45, 1, pose(ua_f=90, la_f=90), eyes=None, hat="none")
            box(cr, bx + 40, by + 30, 50, 34, KIT)
            box(cr, bx + 70, by + 4, 34, 30, KIT)
            pline(cr, [(bx - 40, by - 40), (bx + 40, by - 40)], 4, rgb('#e03b3b'), 1, seed=4)
    stickman(cr, HX, 0, 1.3, 1, P, eyes=eyes, mouth=mouth, look=look, pencil=pencil, **HARGS)


cue(410.0, "rumble", 0.9, dur=6)
for i in range(5):
    cue(410.6 + i * 0.9, "pixel_click", 0.6)
scribble_cue(416.3, 4.2)
for i in range(5):
    cue(422.0 + i * 0.8, "stitch", 0.7)
    cue(427.5 + i * 0.8, "stitch", 0.7)
cue(426.0, "thread_snap", 1.0)
cue(431.2, "thread_snap", 1.0)
cue(432.0, "sigh", 0.8)
cue(434.5, "pop", 0.5)
cue(436.0, "hm", 0.6)


@shot(440, 455)
def s26(cr, t):
    camx = lerp(500, 300, eio(t, 0, 4))
    cliff_scene(cr, camx, -320, 1.15, crack=(820, -400, 380), crack_open=1.7)
    # dark woods on the left
    for tx in (-700, -420, -150):
        cube_tree_big(cr, tx, 0, 48, 7, leaf="leaf", seed=int(tx))
    camera(cr, camx, -320, 1.15)
    g = cairo.LinearGradient(-900, 0, 100, 0)
    g.add_color_stop_rgba(0, 0.02, 0.03, 0.05, 0.85)
    g.add_color_stop_rgba(1, 0.02, 0.03, 0.05, 0.0)
    cr.set_source(g)
    cr.rectangle(-2000, -1500, 2100, 2000)
    cr.fill()
    hx_ = lerp(-700, 100, seg(t, 0.5, 15))
    lit = clamp((hx_ + 400) / 400)
    hisser(cr, hx_, 0, 1.3, 1, ph=t * 5, moving=1, alpha=0.35 + 0.65 * lit)
    tipped_blocks(cr)
    kitten(cr, 520, 0, 1.0, -1 if t > 4.5 else 1, eyes="wide" if t > 4.5 else "normal", ears_down=1 if t > 4.5 else 0, purr=2 if t > 5 else 0)
    HX = 700
    P = idle_pose(t)
    if t > 7:
        P = pose(ua_f=100, la_f=150, ua_b=-20, la_b=40, lean=8)
    stickman(cr, HX, 0, 1.3, -1 if t > 4.5 else 1, P, eyes="wide" if t > 4.5 else "normal", mouth="o" if t > 4.5 else "flat", **HARGS)
    vignette(cr, 0.35 + 0.2 * seg(t, 0, 10))


cue(440.5, "hiss", 0.9, dur=3)
cue(444.6, "gasp", 0.7)
cue(445.2, "meow_scared", 0.8)
cue(448.0, "hiss", 1.0, dur=4)
cue(447.0, "heartbeat", 0.8, dur=8)


def paper_plane(cr, x, y, ang, s=1.0, a=1.0):
    cr.save()
    cr.translate(x, y)
    cr.rotate(ang)
    cr.scale(s, s)
    fill_poly(cr, [(60, 0), (-50, -30), (-30, 0)], (1, 1, 1), a)
    fill_poly(cr, [(60, 0), (-50, 28), (-30, 0)], (0.9, 0.9, 0.92), a)
    pline(cr, [(60, 0), (-50, -30), (-30, 0), (-50, 28), (60, 0)], 3, PENCIL, a, amp=0.5)
    pline(cr, [(60, 0), (-30, 0)], 2.5, PENCIL, a, amp=0.4)
    # cap tip + square hand stamp so we know it is him
    cr.arc(-30, -12, 12, math.pi, 2 * math.pi)
    src(cr, CAP, a)
    cr.fill()
    rect(cr, 10, -6, 12, 12, INK, a)
    cr.restore()


@shot(455, 475)
def s27(cr, t):
    shk = 22 * (1 - seg(t, 11.5, 13)) if t > 11.5 else 0
    camx = lerp(300, 380, eio(t, 0, 10))
    zoom = 1.05
    if t > 12:
        zoom = lerp(1.05, 0.7, eio(t, 12, 14))
        camx = lerp(380, 300, eio(t, 12, 14))
    cliff_scene(cr, camx, -360, zoom, crack=(820, -400, 380), crack_open=1.7, shake=shk)
    camera(cr, camx, -360, zoom, shake=shk)
    # ditch: blocks removed one by one between mob and crack
    B = 48
    ditch = [(312, 0), (360, 0), (408, 0), (456, 0), (504, 0), (360, 48), (408, 48), (456, 48)]
    for i, (dx, dy) in enumerate(ditch):
        k = seg(t, 3.5 + i * 0.55, 3.8 + i * 0.55)
        if k > 0:
            rect(cr, dx, dy, B, B, rgb('#1d140c'))
            debris(cr, dx + 24, dy, seg(t, 3.5 + i * 0.55, 4.6 + i * 0.55), n=4, s=0.8, seed=i)
    if t > 11.5:
        cr.save()
        cr.arc(408, 40, 160 * eout(seg(t, 11.5, 12.2)), 0, 2 * math.pi)
        src(cr, rgb('#1d140c'), 1)
        cr.fill()
        cr.restore()
    # hisser
    if t < 9.0:
        mx = lerp(-150, 330, seg(t, 0, 9.0))
        face = 1 if math.sin(t * 2.4) > -0.3 else -1
        hisser(cr, mx, 0, 1.15, face, ph=t * 5, moving=1)
    elif t < 11.5:
        k = seg(t, 9.0, 9.6)
        my = 90 * ein(k)
        sw = eio(t, 9.6, 11.4)
        fl = 0.7 * (math.sin(t * 30) > 0) * seg(t, 10, 11.4)
        hisser(cr, 400, my, 1.15, 1, ph=0, moving=0, swell=sw, flash=fl)
    elif t < 13:
        k = seg(t, 11.5, 13)
        glow(cr, 408, -40, 900 * eout(k), (1, 1, 0.9), 1 - k)
        debris(cr, 408, -20, k, n=22, s=1.4, kinds=("grass", "dirt", "creep", "stone"), seed=5)
    # kitten hops around to distract
    if t < 9:
        kx = lerp(-80, 260, seg(t, 0, 9)) + 120 * math.sin(t * 2.4)
        kj = abs(math.sin(t * 4.8)) * 90
        kitten(cr, kx, 0, 0.9, -1 if math.cos(t * 2.4) < 0 else 1, jump=kj, eyes="normal", ph=t * 8, moving=1)
    else:
        kx = -260
        kitten(cr, kx, 0, 0.9, 1, eyes="wide" if t < 17 else "happy", ears_down=0.6 if t < 14 else 0)
    # hero: punching the ditch, then blown up, paper plane
    if t < 11.5:
        hx = 560
        if 3.4 < t < 8.0:
            ph = ((t - 3.4) % 0.7) / 0.7
            P = reach(hx, 0, 1.25, -1, pose(lean=45, th_f=50, sh_f=-20, th_b=-10, sh_b=-50), (lerp(500, 430, ph), -60 + 70 * math.sin(math.pi * ph)), "f")
            eyes, mouth = "angry", "grin"
        else:
            P = idle_pose(t)
            eyes, mouth = ("wide", "o") if t > 9 else ("angry", "flat")
        stickman(cr, hx, 0, 1.25, -1, P, eyes=eyes, mouth=mouth, **HARGS)
    elif t < 13:
        k = seg(t, 11.5, 13)
        hx = lerp(560, 900, k)
        hy = -700 * math.sin(math.pi * k * 0.9)
        stickman(cr, hx, hy, 1.25, -1, pose(ua_f=150, la_f=170, ua_b=-150, la_b=-170, th_f=30, th_b=-30), eyes="wide", mouth="o",
                 rot=k * 9, **HARGS)
    elif t < 18:
        k = seg(t, 13, 18)
        # fold into a plane, glide back in a wide arc
        px = lerp(900, -200, ease(k))
        py = -640 + 180 * math.sin(k * math.pi * 2) * (1 - k) + 600 * k * k
        ang = math.pi + 0.25 * math.cos(k * math.pi * 2)
        fold = seg(t, 13, 13.5)
        if fold < 1:
            stickman(cr, px, py, 1.25, -1, pose(), eyes="wide", squash=1 - fold, **HARGS)
        if fold > 0.01:
            paper_plane(cr, px, py - 150, ang, 1.6 * fold, fold)
    else:
        k = seg(t, 18, 19)
        stickman(cr, -160, 0, 1.25, 1, pose(ua_f=60, la_f=90, ua_b=-60, la_b=-90), eyes="happy", mouth="grin", squash=max(0.05, k), **HARGS)


cue(455.0, "hiss", 0.8, dur=2)
for i in range(8):
    cue(455.3 + i * 1.0, "meow_tease", 0.5)
for i in range(8):
    cue(458.5 + i * 0.55, "punch_block", 0.9)
cue(464.0, "fall_in", 0.8)
cue(464.6, "fuse", 1.0, dur=1.8)
cue(466.5, "explosion", 1.0)
cue(467.0, "yelp", 0.7)
cue(468.0, "paper_fold", 0.9)
cue(468.4, "plane_whistle", 0.9, dur=4.5)
cue(473.2, "paper_unfold", 0.8)


@shot(475, 480)
def s28(cr, t):
    cliff_scene(cr, -150, -200, 1.6, crack=None)
    camera(cr, -150, -200, 1.6)
    shake_h = math.sin(t * 28) * 0.06
    stickman(cr, -80, 0, 1.2, 1, pose(ua_f=40, la_f=80, ua_b=-30, la_b=-60, th_f=10, th_b=-10), eyes="happy", mouth="grin",
             seat=-52, rot=-math.pi / 2 + shake_h, **HARGS)
    kitten(cr, -360, -122, 0.9, 1, eyes="happy", mouth="open", tilt=math.pi + 0.06 * math.sin(t * 30), paw_up=1)


cue(475.0, "wind", 0.5, dur=5)
