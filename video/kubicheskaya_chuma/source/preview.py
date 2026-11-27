# -*- coding: utf-8 -*-
"""Render still frames at given times into a contact sheet: python3 preview.py out.png t1 t2 ..."""
import sys, importlib
from engine import *
import common
for m in ("scenes_a", "scenes_b", "scenes_c", "scenes_d"):
    try:
        importlib.import_module(m)
    except ModuleNotFoundError as e:
        if e.name != m:
            raise


def render_at(T):
    s = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    cr = cairo.Context(s)
    set_time(T)
    for a, b, fn in common.SHOTS:
        if a <= T < b:
            fn(cr, T - a)
            break
    return s


if __name__ == "__main__":
    out = sys.argv[1]
    ts = [float(x) for x in sys.argv[2:]]
    cols = 3
    rows = (len(ts) + cols - 1) // cols
    sw, sh = W // 3, H // 3
    sheet = cairo.ImageSurface(cairo.FORMAT_ARGB32, sw * cols, sh * rows)
    c = cairo.Context(sheet)
    for i, T in enumerate(ts):
        s = render_at(T)
        c.save()
        c.translate((i % cols) * sw, (i // cols) * sh)
        c.scale(1 / 3, 1 / 3)
        c.set_source_surface(s, 0, 0)
        c.paint()
        c.restore()
        c.set_source_rgb(1, 0, 0)
        c.select_font_face("DejaVu Sans")
        c.set_font_size(18)
        c.move_to((i % cols) * sw + 6, (i // cols) * sh + 20)
        c.show_text("%.1f" % T)
    sheet.write_to_png(out)
