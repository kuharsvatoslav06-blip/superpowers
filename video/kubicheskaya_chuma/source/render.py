# -*- coding: utf-8 -*-
"""Render all frames in parallel chunks to H.264 parts: python3 render.py outdir [workers]"""
import os, sys, subprocess, multiprocessing as mp
from engine import W, H, FPS
DUR = 600.0


def worker(args):
    k, f0, f1, outdir = args
    import preview
    out = os.path.join(outdir, "part_%02d.mp4" % k)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", "%dx%d" % (W, H), "-r", str(FPS),
           "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-tune", "animation", "-pix_fmt", "yuv420p", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in range(f0, f1):
        s = preview.render_at(f / FPS)
        s.flush()
        p.stdin.write(bytes(s.get_data()))
        if (f - f0) % 240 == 0:
            print("worker %d: %d/%d" % (k, f - f0, f1 - f0), flush=True)
    p.stdin.close()
    p.wait()
    return out


if __name__ == "__main__":
    outdir = sys.argv[1]
    nw = int(sys.argv[2]) if len(sys.argv) > 2 else 4
    os.makedirs(outdir, exist_ok=True)
    total = int(DUR * FPS)
    nchunks = 12
    step = total // nchunks
    jobs = [(k, k * step, total if k == nchunks - 1 else (k + 1) * step, outdir) for k in range(nchunks)]
    if len(sys.argv) > 3:
        only = {int(v) for v in sys.argv[3].split(",")}
        jobs = [j for j in jobs if j[0] in only]
    with mp.Pool(nw) as pool:
        parts = pool.map(worker, jobs, chunksize=1)
    with open(os.path.join(outdir, "parts.txt"), "w") as f:
        for k in range(nchunks):
            f.write("file '%s'\n" % os.path.abspath(os.path.join(outdir, "part_%02d.mp4" % k)))
    print("done")
