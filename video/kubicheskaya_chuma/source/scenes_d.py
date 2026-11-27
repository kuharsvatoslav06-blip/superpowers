# -*- coding: utf-8 -*-
"""Act 4 (8:00-9:30), finale (9:30-9:50), end screen (9:50-10:00)."""
import os
from common import *
from scenes_c import cliff_scene, tipped_blocks, HARGS

music(480, 500, "hope", 0.85)
music(500, 520, "warm", 0.9)
music(520, 540, "sewing_build", 1.0)
music(540, 555, "sewing_final", 1.0)
music(555, 570, "joy", 1.0)
music(570, 585, "piano_evening", 0.9)
music(585, 589.3, "piano_evening_end", 0.8)
music(590, 600, "theme", 1.0)

CRK = (820, -400, 380)
NOCAP = dict(hat="none")


def big_needle(cr, x, y, ang, s=1.0, a=1.0, f=1.0):
    pts = [(-90, 0), (90, 0)]
    cr.save()
    cr.translate(x, y)
    cr.rotate(ang)
    cr.scale(s, s)
    if f >= 1:
        stroke_poly(cr, [(-90, 0), (80, 0)], rgb('#9aa0aa'), 12, a)
        fill_poly(cr, [(80, -6), (110, 0), (80, 6)], rgb('#9aa0aa'), a)
        cr.rectangle(-84, -5, 26, 10)
        src(cr, (1, 1, 1), a)
        cr.fill()
        box(cr, -120, -16, 34, 32, KIT, a)
    else:
        pencil_path(cr, [(-120, -16), (-86, -16), (-86, 16), (-120, 16), (-120, -16), (-86, 0), (110, 0)], f, 5, PENCIL, seed=3, a=a)
    cr.restore()


@shot(480, 500)
def s29(cr, t):
    cliff_scene(cr, 420, -320, 1.4, crack=CRK, crack_open=1.7)
    tipped_blocks(cr, prints=False)
    camera(cr, 420, -320, 1.4)
    HX, KX = 300, 560
    P = idle_pose(t)
    eyes, mouth = "normal", "smile"
    pencil = False
    nf = seg(t, 1.0, 5.0)
    if t < 5.2:
        tip_pts = [(250, -330), (300, -330), (300, -300), (250, -300), (250, -330), (300, -315), (520, -315)]
        tip = partial(tip_pts, nf)[-1] if nf > 0 else tip_pts[0]
        big_needle(cr, 390, -315, 0, 1.0, 1.0, nf)
        P = reach(HX, 0, 1.3, 1, P, tip, "f")
        pencil = True
        eyes = "angry"
    elif t < 8:
        k = eio(t, 5.2, 7)
        nx = lerp(390, KX - 40, k)
        ny = lerp(-315, -150, k)
        big_needle(cr, nx, ny, lerp(0, -0.9, k), lerp(1, 0.8, k))
        P = reach(HX, 0, 1.3, 1, P, (nx - 90, ny), "f")
    else:
        big_needle(cr, KX - 30, -150 + 4 * math.sin(t * 3), -0.9, 0.8)
        # plan bubble
        bk = eio(t, 8.5, 9.1) * (1 - eio(t, 17.5, 18))
        P = pose(ua_f=100 + 20 * math.sin(t * 3), la_f=130, ua_b=-40, la_b=-60)
        J0 = stick_joints(HX, 0, 1.3, 1, P)
        bx, by = J0["head"][0] - 230, J0["head"][1] - 230
        thought_bubble(cr, bx, by, 420, 300, bk, seed=11)
        if bk > 0.95:
            stroke_poly(cr, [(bx - 180, by), (bx + 180, by)], INK, 4)
            rect(cr, bx - 178, by - 120, 356, 118, rgb('#8fd0ff'), 0.6)
            rect(cr, bx - 178, by + 2, 356, 110, PAPER, 1)
            pline(cr, stairify([(bx, by - 110), (bx + 8, by - 40), (bx - 6, by + 40), (bx + 4, by + 105)], 8), 5, CRACK, 1)
            box(cr, bx - 90, by - 60, 54, 34, KIT)
            box(cr, bx - 60, by - 86, 36, 30, KIT)
            pk = seg(t, 10, 17)
            stickman(cr, bx - 60, by + 100, 0.33, 1, pose(ua_f=90 + 30 * math.sin(t * 6), la_f=80), eyes=None, hat="cap")
            for i in range(int(pk * 5)):
                yy = by - 90 + i * 40
                stroke_poly(cr, [(bx - 16, yy - 6), (bx + 16, yy + 6)], rgb('#d62828'), 5)
    J = stickman(cr, HX, 0, 1.3, 1, P, eyes=eyes, mouth=mouth, pencil=pencil, **HARGS)
    kitten(cr, KX, 0, 1.0, -1, eyes="normal" if t < 18 else "happy", nod=abs(math.sin((t - 17.5) * 6)) if 17.5 < t < 19.5 else 0,
           paw_up=1 if 7 < t else 0, tilt=0.12 * math.sin(t) if 9 < t < 17 else 0)


scribble_cue(481.0, 4.0)
cue(486.5, "pop", 0.6)
cue(488.5, "pop", 0.6)
cue(497.6, "meow_happy", 0.8)


@shot(500, 520)
def s30(cr, t):
    zoom = lerp(1.6, 1.3, eio(t, 9, 12))
    cx = lerp(430, 560, eio(t, 9, 12))
    cliff_scene(cr, cx, -280, zoom, crack=CRK, crack_open=1.7)
    camera(cr, cx, -280, zoom)
    HX, KX = 340, 520
    # cap transfer 0..6
    J0 = stick_joints(HX, 0, 1.3, 1, pose())
    head = J0["head"]
    k_head = eio(t, 1.0, 2.2)
    k_move = eio(t, 2.4, 4.6)
    cap_on_hero = t < 1.6
    P = idle_pose(t)
    eyes, mouth = "normal", "smile"
    kcap = 0.0
    capx = capy = None
    if 0.8 < t < 5.0:
        if k_move <= 0:
            tgt = (head[0] + 30, head[1] - 40 * k_head - 20)
        else:
            kh = (KX + 33 * 1.0, -112 * 1.0 - 4)
            tgt = (lerp(head[0] + 30, kh[0] - 20, k_move), lerp(head[1] - 60, kh[1] - 70 + 50 * k_move, k_move) - 60 * math.sin(math.pi * k_move))
        P = reach(HX, 0, 1.3, 1, pose(lean=20 * k_move), tgt, "f")
        capx, capy = tgt[0] + 10, tgt[1] - 6
        eyes = "happy"
    if t >= 4.6:
        kcap = 1.0
        capx = None
    if t > 6:
        eyes, mouth = "happy", "grin"
    hero_hat = "cap" if cap_on_hero else "none"
    # waving goodbye & leaving through the crack
    x = HX
    squash = 1.0
    alpha = 1.0
    if t > 11:
        x = lerp(HX, 700, eio(t, 11, 14))
        P = walk_pose(t * 5, 0.7) if t < 14 else pose(ua_b=-150 + 20 * math.sin(t * 9), la_b=-170)
        if t < 14:
            P["ua_b"] = -150 + 20 * math.sin(t * 9)
            P["la_b"] = -170
        eyes, mouth = ("happy", "smile") if t < 16 else ("sad", "smile")
    if t > 16:
        steps = [16.0, 16.6, 17.2]
        targets = [0.5, 0.22, 0.05]
        for i, st in enumerate(steps):
            if t > st:
                squash = lerp(squash, targets[i], seg(t, st, st + 0.2))
        sl = eio(t, 17.6, 18.8)
        x = lerp(700, CRK[0], sl)
        alpha = 1 - seg(t, 18.4, 18.8)
    yb = lerp(0, CRK[1] + 140, eio(t, 17.6, 18.8)) if t > 17.6 else 0
    if alpha > 0:
        stickman(cr, x, yb, 1.3, 1 if t < 14 else -1, P, eyes=eyes, mouth=mouth, hat=hero_hat, squash=squash, alpha=alpha, **HARGS)
    if capx is not None and not cap_on_hero:
        draw_cap(cr, capx, capy, 34 * 1.3, 1)
    kitten(cr, KX, 0, 1.0, -1, eyes="happy" if 4.6 < t < 16 else ("normal" if t < 4.6 else "sad"), cap=kcap, look=(0, -1) if 4.6 < t < 7 else (1, 0),
           paw_up=1 if 13 < t < 19 and math.sin(t * 9) > 0 else 0, ears_down=0.6 if t > 16 else 0)
    if 5 < t < 9:
        for i in range(3):
            ph = ((t - 5) * 0.45 + i * 0.33) % 1
            heart(cr, KX - 30 + math.sin(ph * 6 + i) * 24, -190 - ph * 140, 1.1, a=1 - ph)


cue(501.0, "cap_tug", 0.8)
cue(504.6, "pop", 0.8)
cue(505.0, "meow_happy", 1.0)
cue(506.5, "giggle", 0.6, dur=1.5)
cue(513.0, "meow_sad", 0.6)
for i, st in enumerate([16.0, 16.6, 17.2]):
    cue(500 + st, "paper_fold", 0.9)
cue(517.6, "paper_slide", 0.9)


def split_frame(cr, t, opn, stitches, top_fn=None, bottom_fn=None, divider=True):
    """top half: cube side; bottom half: paper side. crack vertical in the middle of each"""
    # top
    cr.save()
    cr.identity_matrix()
    cr.rectangle(0, 0, W, H / 2)
    cr.clip()
    cube_sky(cr, 0, 0.3)
    camera(cr, 0, -150, 1.0)
    cr.translate(0, -270)
    grass_world_ground(cr, -1200, 1200, 60, 48)
    sky_crack(cr, 0, -180, 420, opn, inner="paper", seed=4)
    for i in range(stitches):
        yy = -340 + i * 34
        stroke_poly(cr, [(-50, yy - 10), (50, yy + 10)], rgb('#d62828'), 9)
    if top_fn:
        top_fn(cr)
    cr.restore()
    # bottom
    cr.save()
    cr.identity_matrix()
    cr.rectangle(0, H / 2, W, H / 2)
    cr.clip()
    paper_bg(cr)
    camera(cr, 0, -150, 1.0)
    cr.translate(0, 270)
    sky_crack(cr, 0, -150, 420, opn, inner="cube", seed=4)
    for i in range(stitches):
        yy = -310 + i * 34
        stroke_poly(cr, [(-50, yy + 10), (50, yy - 10)], rgb('#d62828'), 9)
    if bottom_fn:
        bottom_fn(cr)
    cr.restore()
    if divider:
        cr.identity_matrix()
        rect(cr, 0, H / 2 - 5, W, 10, INK)


@shot(520, 540)
def s31(cr, t):
    opn = lerp(1.7, 0.35, seg(t, 1, 19))
    n = int(clamp((t - 1) / 18) * 9)
    ph = (t * 1.1) % 1

    def top(cr):
        kitten(cr, -125 + 6 * math.sin(t * 2), 60, 1.1, 1, cap=1, paw_up=1, eyes="normal", look=(1, -0.3))
        # paws holding the edges
        rect(cr, -46, -200 + 20 * math.sin(t * 2), 24, 24, KIT)
        rect(cr, -46, -120 + 20 * math.sin(t * 2), 24, 24, KIT)

    def bottom(cr):
        hx = 260
        hand = (lerp(-40, 50, ph if int(t * 1.1) % 2 == 0 else 1 - ph), -310 + n * 34)
        P = reach(hx, 40, 1.15, -1, pose(lean=10), hand, "f")
        stickman(cr, hx, 40, 1.15, -1, P, eyes="angry", mouth="flat", hat="none", sq={"f": 1}, pix={"af": 0.3}, bracelet="f", pencil=False)
        cr.save()
        cr.translate(hand[0], hand[1])
        cr.rotate(0.6)
        stroke_poly(cr, [(-26, 0), (26, 0)], rgb('#8a8a92'), 5)
        cr.restore()
        stroke_poly(cr, [(0, -310 + max(0, n - 1) * 34), hand], rgb('#d62828'), 3)
        # he stands on the topmost floating block
        iso_block(cr, hx, 96, 110)

    split_frame(cr, t, opn, n, top, bottom)
    fade(cr, 1 - seg(t, 0, 0.6), (1, 1, 1))


for i in range(20):
    cue(521.0 + i * 0.91, "stitch", 0.8)


@shot(540, 555)
def s32(cr, t):
    opn = lerp(0.35, 0.18, seg(t, 0, 3)) if t < 8 else lerp(0.18, 0.0, seg(t, 8, 8.6))
    n = 9
    blk = seg(t, 1.0, 3.2)

    def top(cr):
        kx = lerp(-150, -110, seg(t, 0.5, 1.5))
        kitten(cr, kx, 60, 1.1, 1, cap=1, paw_up=1 if t < 3 or t > 8.5 else 0, eyes="happy" if t > 9 else "normal",
               nod=abs(math.sin((t - 5) * 6)) if 5 < t < 7 else 0, ears_down=0.5 if t > 10 else 0)
        if blk < 1:
            iso_block(cr, lerp(-40, 0, blk), lerp(-60, -150, blk), 40)

    def bottom(cr):
        hx = 260
        if blk >= 1:
            # block pops out below, he catches it with the square hand
            bx = lerp(0, 150, eio(t, 3.2, 4.2))
            by = lerp(-150, -60, eio(t, 3.2, 4.2))
            P = reach(hx, 40, 1.15, -1, pose(), (bx + 20, by + 10), "f")
            iso_block(cr, bx, by, 40)
            if t > 4.6:
                pk = seg(t, 4.6, 6.0)
                pts = ellipse_pts(bx, by, 50, 40, -math.pi / 2, -math.pi / 2 + 2 * math.pi * pk, 40)
                if pk > 0:
                    pline(cr, pts, 4, PENCIL, 1, seed=6)
                if pk < 1:
                    P = reach(hx, 40, 1.15, -1, P, pts[-1] if len(pts) else (bx, by), "b")
        else:
            P = idle_pose(t)
        eyes = "happy" if 5.5 < t < 8 else ("sad" if t > 11 else "normal")
        if t > 8.5:
            P = pose(ua_b=-150 + 20 * math.sin(t * 8), la_b=-170)
        stickman(cr, hx, 40, 1.15, -1, P, eyes=eyes, mouth="smile", hat="none", sq={"f": 1}, pix={"af": 0.3}, bracelet="f",
                 pencil=4.6 < t < 6.0, look=(1, -0.5))
        iso_block(cr, hx, 96, 110)
        if 8.6 < t < 9.6:
            glow(cr, 0, -150, 400, (1, 1, 1), 1 - seg(t, 8.6, 9.6))

    split_frame(cr, t, opn, n, top, bottom)
    if 8.6 < t < 9.2:
        fade(cr, 0.6 * (1 - seg(t, 8.6, 9.2)), (1, 1, 1))
    fade(cr, seg(t, 14.2, 15), (1, 1, 1))


cue(541.0, "push_block", 0.8)
cue(543.3, "pop", 0.9)
scribble_cue(544.6, 1.4)
cue(545.0, "meow_happy", 0.6)
cue(548.6, "stitch_final", 1.0)
cue(548.7, "chord_resolve", 1.0)


@shot(555, 570)
def s33(cr, t):
    if t < 8:
        # cubes fall off the city like autumn leaves
        cx = lerp(-200, 600, eio(t, 0, 8))

        def tstart(x):
            return 0.3 + (x + 1800) / 4200 * 4.5

        def inf(x):
            return 1 - eio(t, tstart(x), tstart(x) + 1.6)

        flat_world(cr, cx, -420, 0.55, inf, [], prot=[], sun=(-500, -780))
        camera(cr, cx, -420, 0.55)
        # remaining cubic ground strip shrinking from left to right
        xa = -2600 + (t - 0.3) / 4.5 * 4200
        if xa < 4000:
            infected_ground(cr, max(-2600, xa), 6000, a=1 - seg(t, 5.5, 7.5), front_cracks=False)
        for o in CITY.objs:
            ts = tstart(o["x"])
            k = seg(t, ts, ts + 3.0)
            if 0 < k < 1:
                hh = o.get("h", 150)
                for i in range(7):
                    sx0 = o["x"] + (hsh(i, o["x"]) - 0.5) * 200
                    sy0 = -hsh(i, o["x"] + 1) * hh - 40
                    fall = k * (hh + 200)
                    sx = sx0 + math.sin(k * 7 + i) * 50
                    sy = sy0 + fall
                    if sy < 10:
                        cr.save()
                        cr.translate(sx, sy)
                        cr.rotate(math.sin(k * 6 + i) * 0.8)
                        block(cr, -14, -14, 28, ["leaf", "plank", "grass", "wood"][i % 4], 1 - k)
                        cr.restore()
    else:
        tt = t - 8
        flat_world(cr, -150, -230, 1.5, sun=(-600, -720))
        camera(cr, -150, -230, 1.5)
        cube_k = 1 - eio(tt, 1.0, 3.2)
        dog(cr, -60, 0, 1.3, -1, cube=cube_k, tail_cube=1, shake=tt if 0.6 < tt < 3.4 else 0, eyes="closed" if tt < 3.4 else "happy",
            mouth="tongue" if tt > 3.4 else None, tail_wag=1.5, jump=abs(math.sin(tt * 6)) * 20 if tt > 4 else 0)
        if 0.6 < tt < 3.4:
            for i in range(14):
                ph = ((tt - 0.6) * 1.3 + hsh(i, 3)) % 1
                an = hsh(i, 4) * math.pi * 2
                rect(cr, -60 + math.cos(an) * 120 * ph, -60 + math.sin(an) * 80 * ph + 100 * ph * ph, 10, 10, INK, 1 - ph)
        P = pose(ua_f=150 + 15 * math.sin(tt * 8), la_f=170, ua_b=-150 - 15 * math.sin(tt * 8), la_b=-170, y=8 * abs(math.sin(tt * 6))) \
            if tt > 3.6 else idle_pose(tt)
        stickman(cr, -330, 0, 1.4, 1, P, eyes="happy" if tt > 3.4 else "wide", mouth="grin" if tt > 3.4 else "o", hat="none",
                 sq={"f": 1}, pix={"af": 0.3}, bracelet="f")
    fade(cr, 1 - seg(t, 0, 0.8), (1, 1, 1))


cue(555.3, "leaves_fall", 1.0, dur=7.5)
cue(563.6, "shake_dog", 1.0, dur=2.8)
cue(566.6, "bark", 1.0)
cue(567.2, "bark", 0.9)
cue(567.4, "giggle", 0.6, dur=2)


@shot(570, 585)
def s34(cr, t):
    tint = (rgb('#ff9a5a'), 0.16)
    paper_bg(cr, (tint[0][0], tint[0][1], tint[0][2], 0.18))
    cr.identity_matrix()
    g = cairo.LinearGradient(0, 0, 0, H)
    g.add_color_stop_rgba(0, 0.45, 0.3, 0.6, 0.25)
    g.add_color_stop_rgba(0.6, 1.0, 0.6, 0.35, 0.12)
    g.add_color_stop_rgba(1, 1.0, 0.6, 0.35, 0.0)
    cr.set_source(g)
    cr.paint()
    zoom = lerp(1.25, 1.55, eio(t, 0, 15))
    camera(cr, -40, -260, zoom)
    flat_ground(cr, -1200, 1200)
    # porch: big house front
    HX0 = -300
    fill_poly(cr, [(HX0 - 400, 0), (HX0 - 400, -520), (HX0 + 380, -520), (HX0 + 380, 0)], HOUSE_COLS[2], 0.7)
    pline(cr, [(HX0 - 400, 0), (HX0 - 400, -520), (HX0 + 380, -520), (HX0 + 380, 0)], 5, PENCIL, 1, seed=1)
    # door
    fill_poly(cr, [(HX0 - 300, 0), (HX0 - 300, -260), (HX0 - 170, -260), (HX0 - 170, 0)], rgb('#a8784f'), 0.7)
    pline(cr, [(HX0 - 300, 0), (HX0 - 300, -260), (HX0 - 170, -260), (HX0 - 170, 0)], 4, PENCIL, 1, seed=2)
    # window with warm light + sill
    WX, WY = HX0 + 120, -330
    fill_poly(cr, [(WX - 110, WY), (WX + 110, WY), (WX + 110, WY - 150), (WX - 110, WY - 150)], rgb('#ffd98a'), 0.9)
    pline(cr, [(WX - 110, WY), (WX + 110, WY), (WX + 110, WY - 150), (WX - 110, WY - 150), (WX - 110, WY)], 4, PENCIL, 1, seed=3)
    pline(cr, [(WX, WY), (WX, WY - 150)], 3, PENCIL, 1, seed=4)
    pline(cr, [(WX - 130, WY + 6), (WX + 130, WY + 6)], 6, PENCIL, 1, seed=5)
    # grass block in a circle on the sill, a pixel flower growing
    pline(cr, ellipse_pts(WX + 50, WY - 20, 46, 40), 3.5, PENCIL, 1, seed=6)
    iso_block(cr, WX + 50, WY - 18, 36)
    fk = eio(t, 3, 8)
    if fk > 0:
        stem_h = int(fk * 6)
        for i in range(stem_h):
            rect(cr, WX + 47, WY - 44 - i * 7, 6, 7, rgb('#3f9a35'))
        if fk > 0.7:
            fy = WY - 44 - stem_h * 7
            bloom = seg(fk, 0.7, 1.0)
            for dx, dy in [(-7, 0), (7, 0), (0, -7), (0, 7)]:
                rect(cr, WX + 47 + dx * bloom, fy + dy * bloom - 4, 7, 7, rgb('#ff4f6a'))
            rect(cr, WX + 47, fy - 4, 7, 7, rgb('#ffd23a'))
            if fk > 0.95:
                rect(cr, WX + 54, WY - 60, 7, 5, rgb('#3f9a35'))
    # steps
    for i in range(3):
        fill_poly(cr, [(HX0 - 330 - i * 20, -i * 30), (HX0 - 140 + i * 20, -i * 30), (HX0 - 140 + i * 20, -i * 30 - 30), (HX0 - 330 - i * 20, -i * 30 - 30)][::-1],
                  rgb('#d9c4a0'), 0.9)
    pline(cr, [(HX0 - 380, 0), (HX0 - 380, -30), (HX0 - 90, -30), (HX0 - 90, 0)], 4, PENCIL, 1, seed=7)
    pline(cr, [(HX0 - 360, -30), (HX0 - 360, -60), (HX0 - 110, -60), (HX0 - 110, -30)], 4, PENCIL, 1, seed=8)
    # hero sitting on the step, dog beside
    br = math.sin(t * 1.5) * 1.5
    base = pose(lean=8 + br, th_f=85, sh_f=5, th_b=80, sh_b=0, ua_b=10, la_b=40)
    hipx, hipy = HX0 - 140, -95
    if t > 9:
        J0 = stick_joints(hipx, 0, 1.3, 1, base, seat=hipy)
        k = eio(t, 9, 10.5)
        tgt = (J0["head"][0] + 90, lerp(J0["head"][1] + 120, J0["head"][1] + 30, k))
        P = dict(base)
        # simple IK with seat
        sx, sy = J0["sho"]
        UA, LA = SCALE_BASE["ua"] * 1.3, SCALE_BASE["la"] * 1.3
        dx, dy = tgt[0] - sx, tgt[1] - sy
        d = clamp(math.hypot(dx, dy), 1, UA + LA - 0.5)
        th = math.atan2(dx, dy)
        al = math.acos(clamp((UA * UA + d * d - LA * LA) / (2 * UA * d), -1, 1))
        ua = th + al
        la = math.atan2(dx - math.sin(ua) * UA, dy - math.cos(ua) * UA)
        P["ua_f"], P["la_f"] = math.degrees(ua), math.degrees(la)
    else:
        P = dict(base, ua_f=30, la_f=70)
    eyes = "normal" if t < 11 else "happy"
    stickman(cr, hipx, 0, 1.3, 1, P, seat=hipy, eyes=eyes, mouth="smile", hat="none", sq={"f": 1}, pix={"af": 0.3}, bracelet="f",
             look=(1, 0.3) if t < 9 else (1, -0.1))
    dog(cr, HX0 + 30, 0, 1.25, -1, sit=1, eyes="closed" if 5 < t < 9 else "happy", tail_cube=1, tail_wag=0.6)
    # fireflies
    for i in range(8):
        fx = -900 + hsh(i, 2) * 1800 + math.sin(t * 0.7 + i) * 40
        fy = -500 + hsh(i, 3) * 400 + math.cos(t * 0.9 + i) * 30
        glow(cr, fx, fy, 22, rgb('#fff3a0'), 0.5 + 0.4 * math.sin(t * 3 + i))
    vignette(cr, 0.35)
    fade(cr, 1 - seg(t, 0, 1.0))


cue(570.0, "crickets", 0.5, dur=15)
cue(573.0, "sparkle", 0.6)
cue(578.0, "sparkle", 0.6)
cue(581.0, "sigh_content", 0.6)


@shot(585, 590)
def s35(cr, t):
    paper_bg(cr, (0.12, 0.13, 0.3, 0.72))
    camera(cr, 0, -300, 1.4)
    for i in range(30):
        x = -900 + hsh(i, 5) * 1800
        y = -900 + hsh(i, 6) * 700
        pline(cr, [(x - 6, y), (x + 6, y)], 2.5, (1, 1, 0.85), 0.7, seed=i, amp=0.3)
        pline(cr, [(x, y - 6), (x, y + 6)], 2.5, (1, 1, 0.85), 0.7, seed=i + 50, amp=0.3)
    pline(cr, ellipse_pts(-600, -700, 60, 60), 4, (1, 1, 0.85), 0.9, seed=3)
    # the seam
    for i in range(9):
        yy = -560 + i * 34
        stroke_poly(cr, [(-50, yy + 10), (50, yy - 10)], rgb('#d62828'), 9)
    pline(cr, stairify([(0, -580), (8, -470), (-6, -380), (4, -270)], 8), 3, (0.8, 0.85, 1), 0.7)
    k = eout(seg(t, 1.5, 1.9))
    if k > 0:
        # small slit opens; a big Pixel eye under the visor of a yellow cap
        cr.save()
        cr.rectangle(-110 * k, -470, 220 * k, 110)
        cr.clip()
        rect(cr, -120, -480, 240, 130, KIT)
        rect(cr, -60, -450, 90, 70, (1, 1, 1))
        lx = math.sin(t * 2) * 8
        rect(cr, -40 + lx, -440, 44, 52, INK)
        rect(cr, -36 + lx, -436, 14, 14, (1, 1, 1))
        fill_poly(cr, [(-120, -475), (120, -475), (130, -450), (-130, -450)], CAPD)
        rect(cr, -120, -480, 240, 8, CAP)
        cr.restore()
        stroke_poly(cr, [(-110 * k, -470), (110 * k, -470), (110 * k, -360), (-110 * k, -360), (-110 * k, -470)], CRACK, 4)
        glow(cr, 0, -415, 300, CRACK, 0.3 * k)
    blink = 2.9 < t < 3.05
    if blink and k > 0:
        rect(cr, -70, -455, 110, 80, KIT)
    fade(cr, seg(t, 4.3, 4.6))


cue(586.5, "pixel_click", 1.0)
cue(587.1, "meow_happy", 0.9)
cue(589.3, "music_cut", 1.0)

REF_PANELS = None


def ref_panels():
    global REF_PANELS
    if REF_PANELS is None:
        p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reference_art.png")
        s = cairo.ImageSurface.create_from_png(p)
        w, h = s.get_width(), s.get_height()
        pw, ph = w // 2, h // 3
        REF_PANELS = []
        for j in range(3):
            for i in range(2):
                REF_PANELS.append((s, i * pw + 6, j * ph + 6, pw - 12, ph - 12))
    return REF_PANELS


@shot(590, 600)
def s36(cr, t):
    cr.identity_matrix()
    g = cairo.LinearGradient(0, 0, W, H)
    g.add_color_stop_rgb(0, *rgb('#151a3a'))
    g.add_color_stop_rgb(1, *rgb('#2a1450'))
    cr.set_source(g)
    cr.paint()
    for i in range(40):
        ph = (t * 0.08 + hsh(i, 1)) % 1
        rect(cr, hsh(i, 2) * W, H - ph * H * 1.2, 10 + hsh(i, 3) * 16, 10 + hsh(i, 3) * 16, GRASS, 0.18)
    # preview window: next episode built from the reference drawings
    PX, PY, PW, PH = 150, 190, 980, 552
    rect(cr, PX - 14, PY - 14, PW + 28, PH + 28, (1, 1, 1), 0.95)
    panels = ref_panels()
    idx = int(t / 1.65) % len(panels)
    k = (t % 1.65) / 1.65
    for j, kk in ((idx, 1.0), ((idx + 1) % len(panels), seg(k, 0.82, 1.0))):
        s, sx, sy, sw, sh = panels[j]
        cr.save()
        cr.rectangle(PX, PY, PW, PH)
        cr.clip()
        zz = 1.0 + 0.08 * (k if j == idx else 0)
        sc = max(PW / sw, PH / sh) * zz
        cr.translate(PX + PW / 2, PY + PH / 2)
        cr.scale(sc, sc)
        cr.translate(-(sx + sw / 2), -(sy + sh / 2))
        cr.set_source_surface(s, 0, 0)
        cr.paint_with_alpha(kk)
        cr.restore()
    # "next" play badge
    fill_poly(cr, [(PX + 30, PY + 30), (PX + 30, PY + 90), (PX + 80, PY + 60)], (1, 1, 1), 0.85)
    # subscribe button with bell
    pulse = 1 + 0.05 * math.sin(t * 5)
    cr.save()
    cr.translate(1530, 430)
    cr.scale(pulse, pulse)
    bw, bh = 520, 130
    cr.new_path()
    r = 30
    cr.arc(-bw / 2 + r, -bh / 2 + r, r, math.pi, 1.5 * math.pi)
    cr.arc(bw / 2 - r, -bh / 2 + r, r, 1.5 * math.pi, 2 * math.pi)
    cr.arc(bw / 2 - r, bh / 2 - r, r, 0, 0.5 * math.pi)
    cr.arc(-bw / 2 + r, bh / 2 - r, r, 0.5 * math.pi, math.pi)
    cr.close_path()
    src(cr, rgb('#e62117'))
    cr.fill()
    pixel_text(cr, "ПОДПИСАТЬСЯ", 44, 4, 56, c=(1, 1, 1), outline=rgb('#8a0f0a'), px=9)
    # bell
    bx, by = -bw / 2 + 62, 0
    sw_ = math.sin(t * 8) * 0.25 * (math.sin(t * 1.3) > 0.3)
    cr.save()
    cr.translate(bx, by - 26)
    cr.rotate(sw_)
    cr.move_to(-24, 30)
    cr.curve_to(-24, -10, -18, -26, 0, -26)
    cr.curve_to(18, -26, 24, -10, 24, 30)
    cr.close_path()
    src(cr, (1, 1, 1))
    cr.fill()
    rect(cr, -30, 28, 60, 8, (1, 1, 1))
    circle(cr, 0, 42, 7, (1, 1, 1))
    cr.restore()
    cr.restore()
    # heroes wave goodbye
    cr.identity_matrix()
    cr.save()
    cr.rectangle(1240, 600, 600, 400)
    cr.clip()
    cr.set_source_surface(paper_surface(), 0, 0)
    cr.paint()
    cr.restore()
    stroke_poly(cr, [(1240, 600), (1840, 600), (1840, 1000), (1240, 1000), (1240, 600)], (1, 1, 1), 8)
    camera(cr, 220, -360, 1.0)
    cr.save()
    cr.translate(0, 0)
    flat_ground(cr, 540, 1100)
    cr.restore()
    stickman(cr, 880, 0, 0.95, -1, pose(ua_f=150 + 20 * math.sin(t * 8), la_f=170), eyes="happy", mouth="grin", hat="none",
             sq={"f": 1}, bracelet="f", color=INK)
    dog(cr, 690, 0, 1.0, 1, tail_cube=1, eyes="happy", mouth="tongue", jump=abs(math.sin(t * 5)) * 14)
    kitten(cr, 1030, 0, 0.75, -1, cap=1, eyes="happy", paw_up=1 if math.sin(t * 8) > 0 else 0)
    fade(cr, 1 - seg(t, 0, 0.6))
    fade(cr, seg(t, 9.4, 10.0))


cue(590.0, "subscribe_ding", 0.6)
