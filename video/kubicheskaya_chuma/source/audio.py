# -*- coding: utf-8 -*-
"""Procedural score + sound effects for "Кубическая чума". No voice-over, only wordless sounds.
python3 audio.py out.wav"""
import sys, math, wave
import numpy as np

SR = 44100
DUR = 600.0
rng = np.random.default_rng(7)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def tt(d):
    return np.arange(int(d * SR)) / SR


def env_adsr(n, a=0.01, d=0.1, s=0.7, r=0.2):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n)
    e[:na] = np.linspace(0, 1, na) if na else e[:na]
    nd2 = min(nd, n - na)
    if nd2 > 0:
        e[na:na + nd2] = np.linspace(1, s, nd2)
    nr = min(nr, n)
    if nr > 0:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lowpass(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


def highpass(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


def bandpass(x, lo, hi):
    return lowpass(highpass(x, lo), hi)


def noise(d):
    return rng.uniform(-1, 1, int(d * SR))


def glide(f0, f1, d, curve=1.0):
    n = int(d * SR)
    k = np.linspace(0, 1, n) ** curve
    f = f0 * (f1 / f0) ** k
    return np.cumsum(f) / SR * 2 * np.pi


# ------------------------------------------------------------------ instruments
def piano(f, d, vel=0.7):
    d = max(d, 0.25) + 0.6
    t = tt(d)
    out = np.zeros_like(t)
    for k, a in enumerate([1.0, 0.5, 0.28, 0.16, 0.09, 0.05], 1):
        dec = 2.2 + k * 0.9 + f / 900
        out += a * np.sin(2 * np.pi * f * k * 1.0005 ** k * t) * np.exp(-dec * t)
    out *= np.minimum(1, t / 0.004)
    out[-int(0.08 * SR):] *= np.linspace(1, 0, int(0.08 * SR))
    return out * vel * 0.32


def bell(f, d=1.8, vel=0.5):
    t = tt(d)
    mod = 2.0 * np.exp(-3 * t) * np.sin(2 * np.pi * f * 3.5 * t)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-2.6 * t) * vel * 0.25 * np.minimum(1, t / 0.003)


def square8(f, d, vel=0.5, duty=0.5):
    t = tt(d)
    ph = (f * t) % 1
    s = np.where(ph < duty, 1.0, -1.0)
    e = env_adsr(len(t), 0.003, 0.05, 0.6, min(0.05, d * 0.3))
    return s * e * vel * 0.10


def tri8(f, d, vel=0.5):
    t = tt(d)
    ph = (f * t) % 1
    s = 4 * np.abs(ph - 0.5) - 1
    return s * env_adsr(len(t), 0.003, 0.05, 0.8, 0.03) * vel * 0.22


def pad(freqs, d, vel=0.4, bright=1.0):
    t = tt(d)
    out = np.zeros_like(t)
    for f in freqs:
        for det in (-0.25, 0.0, 0.27):
            ff = f * 2 ** (det / 12)
            for k, a in enumerate([1.0, 0.35 * bright, 0.15 * bright], 1):
                out += a * np.sin(2 * np.pi * ff * k * t + rng.uniform(0, 6))
    out /= max(1, len(freqs) * 3)
    e = env_adsr(len(t), min(0.6, d * 0.3), 0.2, 0.9, min(0.8, d * 0.4))
    return out * e * vel * 0.5


def bass(f, d, vel=0.6):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sign(np.sin(2 * np.pi * f * t))
    return s * env_adsr(len(t), 0.005, 0.08, 0.7, min(0.06, d * 0.3)) * vel * 0.35


def kick(vel=0.8):
    d = 0.35
    t = tt(d)
    ph = glide(150, 45, d, 0.5)
    return np.sin(ph) * np.exp(-9 * t) * vel * 0.9


def snare(vel=0.6):
    d = 0.22
    t = tt(d)
    n = highpass(noise(d), 900) * np.exp(-16 * t)
    b = np.sin(2 * np.pi * 190 * t) * np.exp(-20 * t)
    return (n * 0.7 + b * 0.5) * vel * 0.6


def hat(vel=0.4, d=0.06):
    t = tt(d)
    return highpass(noise(d), 6000) * np.exp(-60 * t) * vel * 0.45


def tom(f=110, vel=0.6):
    d = 0.3
    t = tt(d)
    return np.sin(glide(f * 1.6, f, d, 0.4)) * np.exp(-10 * t) * vel * 0.7


# ------------------------------------------------------------------ voice-like (wordless) sounds
def formant_voice(f0_curve, d, formants, vel=0.5, breath=0.15):
    """additive harmonics weighted by formant envelope; f0_curve: array of f0 per sample"""
    n = int(d * SR)
    f0 = np.interp(np.linspace(0, 1, n), np.linspace(0, 1, len(f0_curve)), f0_curve)
    ph = np.cumsum(f0) / SR * 2 * np.pi
    out = np.zeros(n)
    fmean = float(np.mean(f0))
    for k in range(1, int(4000 / fmean)):
        fk = k * fmean
        a = sum(g * math.exp(-((fk - F) / bw) ** 2) for F, bw, g in formants) / k ** 0.3
        if a < 0.01:
            continue
        out += a * np.sin(k * ph)
    out /= max(1e-6, np.max(np.abs(out)))
    out += breath * bandpass(noise(d), 600, 4000)
    return out * vel


def vowel(v):
    return {"a": [(800, 150, 1.0), (1200, 200, 0.6), (2500, 300, 0.2)],
            "e": [(500, 120, 1.0), (1900, 250, 0.6), (2600, 300, 0.2)],
            "i": [(300, 100, 1.0), (2300, 300, 0.7), (3000, 300, 0.3)],
            "o": [(450, 120, 1.0), (850, 150, 0.6), (2500, 300, 0.15)],
            "u": [(320, 90, 1.0), (800, 120, 0.4), (2400, 300, 0.1)],
            "m": [(250, 80, 1.0), (1100, 200, 0.15), (2500, 300, 0.05)]}[v]


def shaped(x, a=0.01, r=0.1):
    return x * env_adsr(len(x), a, 0.05, 1.0, r)


SFX = {}


def sfx(name):
    def deco(fn):
        SFX[name] = fn
        return fn
    return deco


@sfx("pixel_crunch")
def _(d=0.35):
    t = tt(d)
    n = noise(d)
    hold = 40
    n = np.repeat(n[::hold], hold)[:len(t)]
    sq = np.sign(np.sin(glide(900, 180, d)))
    return (0.6 * n + 0.4 * sq) * np.exp(-9 * t) * 0.7


@sfx("glitch")
def _(d=0.6):
    out = np.zeros(int(d * SR))
    for i in range(12):
        s = int(rng.uniform(0, d - 0.05) * SR)
        f = rng.choice([220, 440, 880, 1320, 1760])
        x = square8(f, 0.04, 1.0) * 6
        out[s:s + len(x)] += x[:len(out) - s]
    return out * 0.6


@sfx("pixel_click")
def _(d=0.12):
    t = tt(d)
    return np.sign(np.sin(2 * np.pi * 1200 * t)) * np.exp(-40 * t) * 0.35


@sfx("pixel_spread")
def _(d=2.0):
    n = int(d * SR)
    out = np.zeros(n)
    k = 0
    while k < n - 3000:
        x = SFX["pixel_click"]() * rng.uniform(0.3, 0.9)
        f = rng.uniform(0.6, 1.8)
        idx = (np.arange(int(len(x) / f)) * f).astype(int)
        x = x[idx]
        out[k:k + len(x)] += x[:n - k]
        k += int(rng.uniform(0.03, 0.12) * SR)
    t = tt(d)
    out += 0.15 * np.sign(np.sin(glide(120, 260, d))) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3)
    return out * 0.8


@sfx("crackle")
def _(d=4.0):
    return SFX["pixel_spread"](d) * 0.6 + 0.08 * lowpass(noise(d), 300)


@sfx("freeze_blocks")
def _(d=1.2):
    out = np.zeros(int(d * SR))
    for i in range(8):
        s = int(i * 0.12 * SR)
        x = tom(rng.uniform(140, 260), 0.5)
        out[s:s + len(x)] += x[:len(out) - s]
    return out + SFX["pixel_crunch"](d) * 0.4


@sfx("step8")
def _(d=0.08):
    return square8(rng.choice([180, 200, 160]), d, 1.0, 0.25) * 4


@sfx("pencil")
def _(d=1.5):
    n = noise(d)
    t = tt(d)
    scr = bandpass(n, 2500, 9000)
    am = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 5.5 * t + 3 * np.sin(2 * np.pi * 0.7 * t)))
    return scr * am * env_adsr(len(t), 0.03, 0.05, 1, 0.08) * 0.55


@sfx("paper_fold")
def _(d=0.35):
    t = tt(d)
    return bandpass(noise(d), 800, 7000) * np.exp(-10 * t) * 0.9 + 0.3 * lowpass(noise(d), 400) * np.exp(-20 * t)


@sfx("paper_unfold")
def _(d=0.6):
    return SFX["paper_fold"](0.6)[::-1] * 0.8


@sfx("paper_slide")
def _(d=0.9):
    t = tt(d)
    return bandpass(noise(d), 1500, 6000) * np.sin(np.pi * t / d) * 0.5


@sfx("whoosh")
def _(d=0.6):
    t = tt(d)
    n = noise(d)
    return bandpass(n, 300, 2500) * np.sin(np.pi * t / d) ** 2 * 0.7


@sfx("whoosh_soft")
def _(d=1.0):
    return SFX["whoosh"](d) * 0.5


@sfx("whoosh_big")
def _(d=1.6):
    t = tt(d)
    return (bandpass(noise(d), 150, 3000) * np.sin(np.pi * t / d) ** 2 + 0.4 * np.sin(glide(200, 1200, d))) * 0.6


@sfx("whistle")
def _(d=1.6):
    t = tt(d)
    return np.sin(glide(2400, 500, d, 1.2)) * np.minimum(1, t / 0.1) * 0.25 + bandpass(noise(d), 1500, 4000) * 0.05


@sfx("thud")
def _(d=0.8):
    t = tt(d)
    return (np.sin(glide(110, 38, d, 0.4)) * np.exp(-5 * t) + 0.6 * lowpass(noise(d), 500) * np.exp(-12 * t)) * 1.0


@sfx("thud_far")
def _(d=0.6):
    return lowpass(SFX["thud"](d), 300) * 0.5


@sfx("bark")
def _(d=0.22):
    # tiny "pip" bark
    t = tt(d)
    f = glide(900, 1400, d * 0.4, 1)
    f = np.concatenate([f, f[-1] + np.cumsum(np.full(len(t) - len(f), 2 * np.pi * 1300 / SR))])
    x = np.sin(f) + 0.4 * np.sin(2 * f)
    return x * env_adsr(len(t), 0.005, 0.05, 0.6, 0.08) * 0.45


@sfx("boing")
def _(d=0.5):
    t = tt(d)
    return np.sin(glide(180, 420, d) + 3 * np.sin(2 * np.pi * 14 * t)) * np.exp(-5 * t) * 0.4


@sfx("sniff")
def _(d=0.8):
    out = np.zeros(int(d * SR))
    for i in range(3):
        s = int(i * 0.18 * SR)
        x = bandpass(noise(0.12), 1500, 6000) * np.sin(np.linspace(0, np.pi, int(0.12 * SR))) * 0.5
        out[s:s + len(x)] += x
    return out


@sfx("title_stamp")
def _(d=1.6):
    t = tt(d)
    out = kick(1.0)
    out = np.pad(out, (0, len(t) - len(out)))
    for m in (48, 55, 60, 64, 67):
        out += square8(mtof(m), d, 0.9, 0.3) * np.exp(-1.6 * t)
    return out * 0.8


@sfx("ding")
def _(d=2.0):
    return bell(mtof(88), d, 1.0) + bell(mtof(95), d, 0.5)


@sfx("subscribe_ding")
def _(d=1.5):
    return bell(mtof(84), d, 0.8)


@sfx("sparkle")
def _(d=1.2):
    out = np.zeros(int(d * SR))
    for i, m in enumerate([84, 88, 91, 96]):
        x = bell(mtof(m), 0.8, 0.5)
        s = int(i * 0.09 * SR)
        out[s:s + len(x)] += x[:len(out) - s]
    return out


@sfx("pop")
def _(d=0.15):
    t = tt(d)
    return np.sin(glide(300, 900, d)) * np.exp(-25 * t) * 0.5


@sfx("rewind")
def _(d=2.0):
    t = tt(d)
    x = np.sin(glide(300, 1500, d) + 6 * np.sin(2 * np.pi * 30 * t)) * 0.2
    x += bandpass(noise(d), 1000, 6000) * (0.4 + 0.3 * np.sin(2 * np.pi * 17 * t)) * 0.3
    return x


@sfx("drone_low")
def _(d=5.0):
    t = tt(d)
    x = np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 55.7 * t) + 0.3 * np.sin(2 * np.pi * 110.4 * t)
    return x * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 1.0) * 0.35


@sfx("low_hum")
def _(d=7.0):
    t = tt(d)
    x = SFX["drone_low"](d) + 0.2 * np.sin(2 * np.pi * 220 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.5 * t))
    return x


@sfx("hum_crack")
def _(d=15.0):
    t = tt(d)
    x = 0.3 * np.sin(2 * np.pi * 110 * t + 0.4 * np.sin(2 * np.pi * 0.3 * t)) + 0.15 * np.sin(2 * np.pi * 330.5 * t)
    x += 0.08 * bandpass(noise(d), 3000, 9000)
    return x * np.minimum(1, t / 2) * np.minimum(1, (d - t) / 2) * 0.6


@sfx("wind")
def _(d=3.0):
    t = tt(d)
    n = lowpass(noise(d), 700)
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t + 2 * np.sin(2 * np.pi * 0.07 * t))
    return n * am * np.minimum(1, t / 1) * np.minimum(1, (d - t) / 1) * 1.2


@sfx("night_fall")
def _(d=3.0):
    t = tt(d)
    return pad([mtof(40), mtof(47), mtof(52)], d, 0.9, 0.6)


@sfx("crickets")
def _(d=15.0):
    n = int(d * SR)
    out = np.zeros(n)
    t = tt(0.25)
    chirp = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 30 * t) > 0) * np.sin(np.pi * t / 0.25)
    k = 0
    while k < n - len(chirp):
        out[k:k + len(chirp)] += chirp * rng.uniform(0.1, 0.25)
        k += int(rng.uniform(0.4, 1.2) * SR)
    return out


@sfx("cave_drip")
def _(d=20.0):
    n = int(d * SR)
    out = np.zeros(n)
    k = int(0.5 * SR)
    while k < n - SR:
        x = np.sin(glide(1800, 900, 0.12)) * np.exp(-30 * tt(0.12)) * 0.3
        out[k:k + len(x)] += x
        k += int(rng.uniform(1.0, 2.5) * SR)
    return out + 0.05 * lowpass(noise(d), 200)


@sfx("rumble")
def _(d=6.0):
    t = tt(d)
    return lowpass(noise(d), 120) * 2.5 * np.minimum(1, t / 1) * np.minimum(1, (d - t) / 1)


@sfx("wall_break")
def _(d=1.0):
    t = tt(d)
    out = lowpass(noise(d), 1500) * np.exp(-5 * t) * 0.7
    out += SFX["pixel_crunch"](d) * 0.6
    return out


@sfx("crumble")
def _(d=1.4):
    t = tt(d)
    out = lowpass(noise(d), 900) * np.exp(-3 * t) * 0.7
    for i in range(6):
        x = tom(rng.uniform(90, 160), 0.5)
        s = int(rng.uniform(0, 0.6) * SR)
        out[s:s + len(x)] += x[:len(out) - s]
    return out


@sfx("block_chip")
def _(d=0.5):
    x = np.zeros(int(d * SR))
    tm = tom(220, 0.9)
    x[:len(tm)] += tm[:len(x)]
    return x + SFX["pixel_crunch"](d) * 0.7


@sfx("punch")
def _(d=0.4):
    t = tt(d)
    return (np.sin(glide(180, 60, d, 0.3)) * np.exp(-12 * t) + lowpass(noise(d), 2500) * np.exp(-25 * t)) * 0.9


@sfx("punch_block")
def _(d=0.4):
    return SFX["punch"](d) * 0.6 + SFX["pixel_crunch"](d) * 0.5


@sfx("bonk")
def _(d=0.5):
    t = tt(d)
    return np.sin(2 * np.pi * 520 * t + 2 * np.exp(-8 * t) * np.sin(2 * np.pi * 760 * t)) * np.exp(-7 * t) * 0.6


@sfx("splash")
def _(d=1.0):
    t = tt(d)
    return bandpass(noise(d), 400, 6000) * np.exp(-4 * t) * 0.9


@sfx("grab")
def _(d=0.3):
    t = tt(d)
    return lowpass(noise(d), 1200) * np.exp(-18 * t) * 0.8


@sfx("jump")
def _(d=0.25):
    return square8(1, d, 0) + np.sin(glide(300, 700, d)) * np.exp(-6 * tt(d)) * 0.2


@sfx("land_block")
def _(d=0.25):
    return tom(150, 0.5)[:int(d * SR)]


@sfx("step_soft")
def _(d=0.12):
    return lowpass(noise(d), 600) * np.exp(-30 * tt(d)) * 0.5


@sfx("footsteps_soft")
def _(d=4.0):
    n = int(d * SR)
    out = np.zeros(n)
    for i in range(int(d / 0.55)):
        x = SFX["step_soft"]() * 0.7
        s = int(i * 0.55 * SR)
        out[s:s + len(x)] += x[:n - s]
    return out


@sfx("footsteps_fast")
def _(d=4.0):
    n = int(d * SR)
    out = np.zeros(n)
    for i in range(int(d / 0.17)):
        x = SFX["step_soft"]() * rng.uniform(0.5, 0.9)
        s = int(i * 0.17 * SR)
        out[s:s + len(x)] += x[:n - s]
    return out


@sfx("tiptoe")
def _(d=5.0):
    n = int(d * SR)
    out = np.zeros(n)
    for i in range(int(d / 0.5)):
        x = np.sin(2 * np.pi * 900 * tt(0.05)) * np.exp(-60 * tt(0.05)) * 0.15
        s = int(i * 0.5 * SR)
        out[s:s + len(x)] += x[:n - s]
    return out


@sfx("hoof_steps")
def _(d=9.0):
    n = int(d * SR)
    out = np.zeros(n)
    for i in range(int(d / 0.4)):
        x = tom(300 if i % 2 else 260, 0.35)
        s = int(i * 0.4 * SR)
        out[s:s + len(x)] += x[:n - s]
    return out * 0.6


@sfx("scuffle")
def _(d=5.0):
    return SFX["footsteps_fast"](d) * 0.6


@sfx("cap_tug")
def _(d=0.3):
    t = tt(d)
    return bandpass(noise(d), 500, 3000) * np.exp(-14 * t) * 0.5


@sfx("push_block")
def _(d=0.8):
    t = tt(d)
    return lowpass(noise(d), 500) * np.sin(np.pi * t / d) * 0.6


@sfx("stitch")
def _(d=0.25):
    t = tt(d)
    return bandpass(noise(d), 2000, 8000) * np.exp(-25 * t) * 0.5 + np.sin(2 * np.pi * 2400 * t) * np.exp(-40 * t) * 0.08


@sfx("stitch_final")
def _(d=1.5):
    return np.pad(SFX["stitch"](), (0, int(1.25 * SR))) + bell(mtof(91), 1.5, 0.8)


@sfx("thread_snap")
def _(d=1.0):
    t = tt(d)
    return (np.sin(2 * np.pi * 1900 * t) * np.exp(-6 * t) * 0.3 + highpass(noise(d), 3000) * np.exp(-30 * t) * 0.6) * \
        (1 + 0.5 * np.sin(2 * np.pi * 9 * t))


@sfx("fall_in")
def _(d=0.8):
    return np.sin(glide(500, 120, d)) * np.exp(-2 * tt(d)) * 0.3 + SFX["thud"](d) * 0.5


@sfx("fuse")
def _(d=1.8):
    t = tt(d)
    return highpass(noise(d), 3000) * (0.3 + 0.7 * t / d) * 0.6 + np.sin(glide(300, 900, d)) * 0.1


@sfx("explosion")
def _(d=3.0):
    t = tt(d)
    n = noise(d)
    n = np.repeat(n[::6], 6)[:len(t)]
    body = lowpass(n, 900) * np.exp(-1.6 * t) * 2.0
    sub = np.sin(glide(90, 30, d, 0.5)) * np.exp(-2 * t) * 1.2
    return body + sub


@sfx("plane_whistle")
def _(d=4.5):
    t = tt(d)
    return np.sin(glide(700, 1200, d) + 2 * np.sin(2 * np.pi * 1.1 * t)) * 0.08 + bandpass(noise(d), 600, 3000) * 0.12 * np.sin(np.pi * t / d)


@sfx("leaves_fall")
def _(d=7.5):
    n = int(d * SR)
    out = np.zeros(n)
    k = 0
    while k < n - SR:
        x = bandpass(noise(0.4), 2000, 7000) * np.sin(np.linspace(0, np.pi, int(0.4 * SR))) * rng.uniform(0.1, 0.25)
        out[k:k + len(x)] += x
        y = SFX["pixel_click"]() * rng.uniform(0.2, 0.5)
        out[k:k + len(y)] += y
        k += int(rng.uniform(0.08, 0.25) * SR)
    return out


@sfx("shake_dog")
def _(d=2.8):
    t = tt(d)
    return bandpass(noise(d), 800, 5000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * t))) * 0.4 + SFX["pixel_spread"](d) * 0.4


@sfx("heartbeat")
def _(d=8.0):
    n = int(d * SR)
    out = np.zeros(n)
    b = 0
    while b < d - 0.5:
        for off, v in ((0, 0.9), (0.22, 0.6)):
            x = lowpass(kick(v), 200)
            s = int((b + off) * SR)
            out[s:s + len(x)] += x[:n - s]
        b += 0.8
    return out


@sfx("chord_resolve")
def _(d=3.0):
    t = tt(d)
    return pad([mtof(m) for m in (50, 57, 62, 66, 69)], d, 1.2, 0.8)


# --- wordless "voice" sounds (cartoon, no words) -----------------
@sfx("gasp")
def _(d=0.45):
    t = tt(d)
    return bandpass(noise(d), 700, 3500) * np.sin(np.pi * t / d) ** 0.5 * np.exp(-2 * t) * 0.6


@sfx("sigh")
def _(d=1.3):
    t = tt(d)
    x = bandpass(noise(d), 400, 2500) * np.sin(np.pi * t / d) * 0.45
    v = formant_voice(np.array([180, 150, 120]), d, vowel("a"), 0.12, 0.0) * np.sin(np.pi * t / d)
    return x + v


@sfx("sigh_content")
def _(d=1.5):
    return SFX["sigh"](1.5) * 0.7


@sfx("hm")
def _(d=0.6):
    t = tt(d)
    return formant_voice(np.array([150, 150, 165, 205]), d, vowel("m"), 0.45, 0.02) * env_adsr(len(t), 0.03, 0.05, 1, 0.12)


@sfx("hmph")
def _(d=0.35):
    t = tt(d)
    return (formant_voice(np.array([190, 160]), d, vowel("m"), 0.35, 0.05) + bandpass(noise(d), 300, 1500) * 0.3) * np.exp(-6 * t)


@sfx("snort")
def _(d=0.35):
    t = tt(d)
    return (lowpass(noise(d), 600) * 1.4 + 0.3 * np.sign(np.sin(2 * np.pi * 70 * t))) * np.exp(-9 * t) * 0.6


@sfx("giggle")
def _(d=2.0):
    n = int(d * SR)
    out = np.zeros(n)
    k = 0
    i = 0
    while k < n - int(0.2 * SR):
        f = 260 + 40 * math.sin(i * 1.7)
        x = formant_voice(np.array([f, f * 1.08, f]), 0.12, vowel("i"), 0.35, 0.2) * np.sin(np.linspace(0, np.pi, int(0.12 * SR)))
        out[k:k + len(x)] += x
        k += int(0.17 * SR)
        i += 1
    return out


@sfx("pant")
def _(d=3.0):
    n = int(d * SR)
    out = np.zeros(n)
    k = 0
    while k < n - int(0.3 * SR):
        x = bandpass(noise(0.22), 600, 3000) * np.sin(np.linspace(0, np.pi, int(0.22 * SR))) * 0.35
        out[k:k + len(x)] += x
        k += int(0.38 * SR)
    return out


@sfx("nervous_breath")
def _(d=6.0):
    n = int(d * SR)
    out = np.zeros(n)
    k = 0
    while k < n - int(0.3 * SR):
        x = bandpass(noise(0.15), 900, 3500) * np.sin(np.linspace(0, np.pi, int(0.15 * SR))) * 0.25
        out[k:k + len(x)] += x
        k += int(rng.uniform(0.3, 0.6) * SR)
    return out


@sfx("yelp")
def _(d=0.4):
    return formant_voice(np.array([300, 520, 380]), d, vowel("a"), 0.45, 0.1) * env_adsr(int(d * SR), 0.01, 0.05, 1, 0.1)


@sfx("strain")
def _(d=1.2):
    t = tt(d)
    return formant_voice(np.array([140, 160, 150, 170]), d, vowel("m"), 0.3, 0.15) * np.sin(np.pi * t / d)


@sfx("gulp")
def _(d=0.3):
    t = tt(d)
    return np.sin(glide(300, 120, d)) * np.exp(-10 * t) * 0.4


@sfx("realize")
def _(d=0.7):
    t = tt(d)
    return formant_voice(np.array([170, 230, 200]), d, vowel("o"), 0.35, 0.05) * env_adsr(len(t), 0.02, 0.05, 1, 0.2) + bell(mtof(81), d, 0.3)


@sfx("squeeze")
def _(d=0.4):
    return lowpass(noise(d), 800) * np.exp(-8 * tt(d)) * 0.3


@sfx("crowd_panic")
def _(d=7.0):
    n = int(d * SR)
    out = np.zeros(n)
    k = 0
    while k < n - SR:
        f = rng.uniform(250, 500)
        dd = rng.uniform(0.25, 0.6)
        x = formant_voice(np.array([f, f * 1.3, f * 0.9]), dd, vowel(rng.choice(["a", "o", "i"])), rng.uniform(0.1, 0.22), 0.2)
        x *= np.sin(np.linspace(0, np.pi, len(x)))
        out[k:k + len(x)] += x
        k += int(rng.uniform(0.08, 0.3) * SR)
    return out + SFX["footsteps_fast"](d) * 0.5


# --- animals & mobs (own sounds) ---------------------------------
def meow(f0s, d, vel=0.5):
    t = tt(d)
    x = formant_voice(np.array(f0s), d, [(700, 200, 1.0), (1600, 300, 0.8), (3000, 400, 0.3)], vel, 0.05)
    return x * env_adsr(len(t), 0.03, 0.05, 1, 0.15)


@sfx("meow_weak")
def _(d=0.6):
    return meow([600, 750, 520], 0.6, 0.35)


@sfx("meow_happy")
def _(d=0.5):
    return meow([700, 900, 820], 0.5, 0.45)


@sfx("meow_sad")
def _(d=0.9):
    return meow([620, 560, 420], 0.9, 0.4)


@sfx("meow_scared")
def _(d=0.4):
    return meow([900, 1100, 950], 0.4, 0.45)


@sfx("meow_determined")
def _(d=0.4):
    return meow([520, 700], 0.4, 0.5)


@sfx("meow_tease")
def _(d=0.3):
    return meow([800, 950], 0.3, 0.3)


@sfx("purr")
def _(d=9.0):
    t = tt(d)
    x = lowpass(noise(d), 300) * (0.5 + 0.5 * np.sin(2 * np.pi * 26 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.45 * t))
    x += 0.15 * np.sign(np.sin(2 * np.pi * 52 * t)) * (0.5 + 0.5 * np.sin(2 * np.pi * 26 * t))
    return x * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.8) * 0.7


@sfx("moo")
def _(d=1.3):
    t = tt(d)
    return formant_voice(np.array([110, 120, 100, 90]), d, vowel("u"), 0.6, 0.05) * env_adsr(len(t), 0.1, 0.1, 1, 0.3)


@sfx("zombie_groan")
def _(d=1.6):
    t = tt(d)
    f0 = 85 + 10 * np.sin(np.linspace(0, 9, 40))
    return formant_voice(f0, d, vowel("o"), 0.5, 0.3) * env_adsr(len(t), 0.2, 0.1, 1, 0.4)


@sfx("spider_hiss")
def _(d=1.0):
    t = tt(d)
    return highpass(noise(d), 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 12 * t)) * np.sin(np.pi * t / d) * 0.5


@sfx("spider_squeal")
def _(d=0.6):
    t = tt(d)
    return np.sin(glide(1400, 2400, d) + 3 * np.sin(2 * np.pi * 40 * t)) * np.exp(-4 * t) * 0.25


@sfx("hiss")
def _(d=3.0):
    t = tt(d)
    return bandpass(noise(d), 3500, 11000) * np.minimum(1, t / 0.4) ** 1.5 * np.minimum(1, (d - t) / 0.2) * 0.75


SFX["music_cut"] = lambda d=0.1: np.zeros(int(0.1 * SR))


# ------------------------------------------------------------------ music
THEME = [(76, 1), (79, 1), (81, 1), (79, 1), (76, 1), (74, 1), (72, 2), (74, 1), (76, 1), (79, 1), (84, 1), (83, 1), (79, 1), (81, 2)]


def chord_notes(root, q):
    iv = {"maj": (0, 4, 7), "min": (0, 3, 7), "maj7": (0, 4, 7, 11), "min7": (0, 3, 7, 10), "sus": (0, 5, 7), "dom7": (0, 4, 7, 10)}[q]
    return [root + i for i in iv]


C = lambda r, q="maj": (r, q)
STYLES = {
    "glitch_tense": dict(bpm=90, prog=[C(57, "min")], layers=["drone", "glitch", "bass_pulse"]),
    "piano_morning": dict(bpm=100, prog=[C(60), C(55), C(57, "min"), C(53)], layers=["piano_arp", "theme_piano", "pad_soft"]),
    "title_hit": dict(bpm=120, prog=[C(60)], layers=["stab", "chip_arp"]),
    "piano_comic": dict(bpm=120, prog=[C(53), C(60), C(62, "min"), C(58)], layers=["oompah", "chip_mel"]),
    "tension_low": dict(bpm=80, prog=[C(50, "min"), C(46), C(55, "min"), C(57)], layers=["drone", "bass_pulse", "tremolo"]),
    "panic": dict(bpm=150, prog=[C(57, "min"), C(53), C(55), C(52)], layers=["perc_panic", "bass8", "chip_arp"]),
    "suspense_quiet": dict(bpm=70, prog=[C(57, "min"), C(53, "maj7")], layers=["pad_soft", "bells_sparse"]),
    "panic_fast": dict(bpm=165, prog=[C(57, "min"), C(53), C(55), C(52)], layers=["perc_panic", "bass8", "chip_arp", "drums"]),
    "resolve": dict(bpm=80, prog=[C(50, "min"), C(46), C(53), C(48, "sus")], layers=["pad", "piano_chord"]),
    "climb": dict(bpm=110, prog=[C(62), C(55), C(59, "min"), C(57)], layers=["bass_pulse", "piano_arp", "pad_soft", "hats"]),
    "danger": dict(bpm=100, prog=[C(52, "min"), C(48), C(57, "min"), C(59)], layers=["tremolo", "heart", "bass8"]),
    "sad_piano": dict(bpm=66, prog=[C(57, "min"), C(53), C(60), C(55)], layers=["piano_chord", "piano_mel_slow"]),
    "wonder": dict(bpm=72, prog=[C(60, "maj7"), C(53, "maj7"), C(57, "min7"), C(55)], layers=["pad", "bells", "chip_arp_soft"]),
    "ambient_day": dict(bpm=76, prog=[C(55, "maj7"), C(60, "maj7"), C(52, "min7"), C(50)], layers=["pad", "music_box", "drone"]),
    "ambient_night": dict(bpm=64, prog=[C(52, "min"), C(48, "maj7"), C(57, "min"), C(59)], layers=["pad_dark", "bells_sparse", "drone"]),
    "action": dict(bpm=140, prog=[C(52, "min"), C(48), C(50), C(59)], layers=["drums", "bass8", "chip_arp", "tremolo"]),
    "tender": dict(bpm=84, prog=[C(55), C(52, "min"), C(48), C(50)], layers=["music_box", "pad_soft", "piano_arp_soft"]),
    "hope": dict(bpm=92, prog=[C(60), C(55), C(57, "min"), C(53)], layers=["pad", "piano_arp", "theme_piano"]),
    "suspense_bass": dict(bpm=72, prog=[C(52, "min")], layers=["heart", "drone", "tremolo"]),
    "silence_wind": dict(bpm=60, prog=[C(52)], layers=[]),
    "warm": dict(bpm=80, prog=[C(53), C(57, "min"), C(58), C(60)], layers=["piano_arp", "pad_soft", "piano_mel"]),
    "sewing_build": dict(bpm=112, prog=[C(60), C(57, "min"), C(53), C(55)], layers=["piano_8ths", "pad", "build_drums", "theme_chip"]),
    "sewing_final": dict(bpm=112, prog=[C(53), C(55), C(57, "min"), C(60)], layers=["drums", "pad", "chip_arp", "piano_chord", "theme_chip"]),
    "joy": dict(bpm=128, prog=[C(60), C(53), C(55), C(60)], layers=["oompah", "theme_chip", "drums"]),
    "piano_evening": dict(bpm=70, prog=[C(53), C(52, "min"), C(50, "min"), C(58)], layers=["piano_arp_soft", "theme_piano_slow", "pad_soft"]),
    "piano_evening_end": dict(bpm=70, prog=[C(53), C(58)], layers=["piano_arp_soft", "pad_soft"]),
    "theme": dict(bpm=120, prog=[C(60), C(55), C(57, "min"), C(53)], layers=["theme_chip", "piano_arp", "drums", "pad_soft"]),
}


def render_section(a, b, style, vol):
    st = STYLES[style]
    d = b - a
    n = int(d * SR) + 3 * SR
    out = np.zeros((n, 2))
    beat = 60.0 / st["bpm"]
    bar = beat * 4
    prog = st["prog"]
    srng = np.random.default_rng(int(a * 10))

    def add(x, t0, pan=0.0, g=1.0):
        s = int(t0 * SR)
        if s >= n or s < 0:
            return
        x = x[:n - s] * g
        out[s:s + len(x), 0] += x * (1 - pan) * 0.8
        out[s:s + len(x), 1] += x * (1 + pan) * 0.8

    nbars = int(math.ceil(d / bar))
    theme_i = 0
    theme_t = 0.0
    for bi in range(nbars):
        root, q = prog[bi % len(prog)]
        notes = chord_notes(root, q)
        tb = bi * bar
        for L in st["layers"]:
            if L == "piano_arp" or L == "piano_arp_soft":
                g = 0.5 if L.endswith("soft") else 0.8
                seq = [notes[0] - 12, notes[1 % len(notes)], notes[2 % len(notes)], notes[0] + 12, notes[2 % len(notes)], notes[1 % len(notes)], notes[0], notes[2 % len(notes)]]
                for i, m in enumerate(seq):
                    add(piano(mtof(m), beat * 0.6, 0.5), tb + i * beat / 2, pan=0.2 * math.sin(i), g=g)
            elif L == "piano_8ths":
                for i in range(8):
                    m = notes[i % len(notes)] + (12 if i % 4 == 3 else 0)
                    add(piano(mtof(m), beat * 0.3, 0.45), tb + i * beat / 2, pan=-0.2, g=0.7)
            elif L == "piano_chord":
                for m in notes:
                    add(piano(mtof(m), bar, 0.55), tb, g=0.8)
                add(piano(mtof(notes[0] - 12), bar, 0.6), tb)
            elif L in ("piano_mel", "piano_mel_slow"):
                step = beat if L == "piano_mel" else beat * 2
                m = notes[0] + 12
                for i in range(int(bar / step)):
                    if srng.uniform() < 0.25:
                        continue
                    m = notes[srng.integers(len(notes))] + 12 + (12 if srng.uniform() < 0.2 else 0)
                    add(piano(mtof(m), step, 0.55), tb + i * step, pan=0.3)
            elif L in ("theme_piano", "theme_chip", "theme_piano_slow"):
                k = 2 if L == "theme_piano_slow" else 1
                while theme_t < tb + bar:
                    m, du = THEME[theme_i % len(THEME)]
                    dur = du * beat / 2 * k
                    if L == "theme_chip":
                        add(square8(mtof(m), dur * 0.9, 0.8, 0.25), theme_t, pan=0.1)
                    else:
                        add(piano(mtof(m), dur, 0.6), theme_t, pan=0.15)
                    theme_t += dur
                    theme_i += 1
            elif L in ("pad", "pad_soft", "pad_dark"):
                g = {"pad": 0.9, "pad_soft": 0.55, "pad_dark": 0.8}[L]
                br = 0.4 if L == "pad_dark" else 1.0
                fr = [mtof(m - (12 if L == "pad_dark" else 0)) for m in notes]
                add(pad(fr, bar + 0.8, 0.7, br), tb, g=g)
            elif L == "drone":
                if bi == 0:
                    tq = tt(d + 1)
                    f = mtof(prog[0][0] - 24)
                    x = (np.sin(2 * np.pi * f * tq) + 0.5 * np.sin(2 * np.pi * f * 1.006 * tq)) * 0.12
                    add(x * np.minimum(1, tq / 1.5) * np.minimum(1, (d + 1 - tq) / 1.5), 0)
            elif L == "bass_pulse":
                for i in range(4):
                    add(bass(mtof(notes[0] - 24), beat * 0.8, 0.7), tb + i * beat)
            elif L == "bass8":
                for i in range(8):
                    add(bass(mtof(notes[0] - 24 + (12 if i % 2 else 0)), beat * 0.4, 0.6), tb + i * beat / 2)
            elif L == "oompah":
                for i in range(4):
                    if i % 2 == 0:
                        add(bass(mtof(notes[0] - 24 + (7 if i == 2 else 0)), beat * 0.4, 0.7), tb + i * beat)
                    else:
                        for m in notes:
                            add(piano(mtof(m), beat * 0.25, 0.4), tb + i * beat, g=0.7)
            elif L == "chip_arp" or L == "chip_arp_soft":
                g = 0.45 if L.endswith("soft") else 0.8
                for i in range(16):
                    m = notes[i % len(notes)] + 12 * (1 + (i // len(notes)) % 2)
                    add(square8(mtof(m), beat / 4 * 0.9, 0.6, 0.125), tb + i * beat / 4, pan=-0.25, g=g)
            elif L == "chip_mel":
                for i in range(8):
                    if srng.uniform() < 0.3:
                        continue
                    m = notes[srng.integers(len(notes))] + 12
                    add(square8(mtof(m), beat / 2 * 0.8, 0.8, 0.25), tb + i * beat / 2, pan=0.2)
            elif L in ("bells", "bells_sparse"):
                for i in range(0, 4, 1 if L == "bells" else 4):
                    m = notes[(i + bi) % len(notes)] + 24
                    add(bell(mtof(m), 2.0, 0.5), tb + i * beat, pan=0.4 * math.sin(i + bi))
            elif L == "music_box":
                for i in range(8):
                    if srng.uniform() < 0.35:
                        continue
                    m = notes[srng.integers(len(notes))] + 24
                    add(bell(mtof(m), 1.4, 0.45), tb + i * beat / 2, pan=0.3)
            elif L == "tremolo":
                tq = tt(bar + 0.3)
                x = pad([mtof(m - 12) for m in notes], bar + 0.3, 0.6, 0.6) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tq))
                add(x, tb, g=0.8)
            elif L == "heart":
                for i in range(4):
                    add(lowpass(kick(0.8), 200), tb + i * beat)
                    add(lowpass(kick(0.5), 200), tb + i * beat + 0.2)
            elif L == "drums":
                for i in range(4):
                    if i % 2 == 0:
                        add(kick(0.7), tb + i * beat)
                    else:
                        add(snare(0.5), tb + i * beat)
                for i in range(8):
                    add(hat(0.3), tb + i * beat / 2, pan=0.3)
            elif L == "hats":
                for i in range(8):
                    add(hat(0.25), tb + i * beat / 2, pan=0.3)
            elif L == "build_drums":
                lvl = bi / max(1, nbars - 1)
                for i in range(8):
                    add(hat(0.25), tb + i * beat / 2, pan=0.3)
                if lvl > 0.3:
                    add(kick(0.6), tb)
                    add(kick(0.6), tb + 2 * beat)
                if lvl > 0.6:
                    add(snare(0.45), tb + beat)
                    add(snare(0.45), tb + 3 * beat)
            elif L == "perc_panic":
                for i in range(16):
                    if i % 4 == 0:
                        add(tom(90, 0.7), tb + i * beat / 4)
                    elif srng.uniform() < 0.5:
                        add(tom(srng.choice([130, 170, 210]), 0.4), tb + i * beat / 4, pan=srng.uniform(-0.5, 0.5))
                    add(hat(0.2), tb + i * beat / 4)
            elif L == "glitch":
                for i in range(8):
                    if srng.uniform() < 0.5:
                        add(SFX["glitch"](0.3) * 0.4, tb + i * beat / 2, pan=srng.uniform(-0.6, 0.6))
            elif L == "stab":
                if bi == 0:
                    for m in notes + [notes[0] - 12, notes[0] + 12]:
                        add(square8(mtof(m), 1.6, 0.9, 0.3), tb)
                    add(kick(1.0), tb)
    # section envelope
    total = int(d * SR)
    out = out[:total + int(1.0 * SR)]
    e = np.ones(len(out))
    fi = int(min(0.4, d / 4) * SR)
    e[:fi] = np.linspace(0, 1, fi)
    tail = len(out) - total
    fo = int(min(0.6, d / 4) * SR)
    e[total - fo:total] = np.linspace(1, 0.0, fo)
    e[total:] = 0
    return out * e[:, None] * vol


def reverb(x, secs=1.6, wet=0.22):
    n = int(secs * SR)
    t = np.arange(n) / SR
    ir = rng.normal(0, 1, (n, 2)) * np.exp(-4.0 * t)[:, None]
    ir[:200] *= np.linspace(0, 1, 200)[:, None]
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    out = np.zeros_like(x)
    L = len(x) + n
    N = 1 << (L - 1).bit_length()
    for c in range(2):
        X = np.fft.rfft(x[:, c], N)
        I = np.fft.rfft(ir[:, c], N)
        out[:, c] = np.fft.irfft(X * I, N)[:len(x)]
    return x * (1 - wet) + out * wet * 3


def build(out_path):
    import importlib
    sys.path.insert(0, ".")
    import common
    for m in ("scenes_a", "scenes_b", "scenes_c", "scenes_d"):
        importlib.import_module(m)
    N = int(DUR * SR)
    mus = np.zeros((N + 5 * SR, 2))
    for (a, b, style, vol) in common.MUSIC:
        x = render_section(a, b, style, vol)
        s = int(a * SR)
        mus[s:s + len(x)] += x[:len(mus) - s]
    mus = mus[:N]
    print("music done", flush=True)
    fx = np.zeros((N + 20 * SR, 2))
    missing = set()
    for (t0, name, vol, kw) in common.CUES:
        if name not in SFX:
            missing.add(name)
            continue
        fn = SFX[name]
        x = fn(kw["dur"]) if "dur" in kw else fn()
        x = np.asarray(x, dtype=float)
        if x.ndim != 1:
            x = x.ravel()
        s = int(t0 * SR)
        pan = 0.0
        fx[s:s + len(x), 0] += x * vol * (1 - pan)
        fx[s:s + len(x), 1] += x * vol * (1 + pan)
    if missing:
        print("missing sfx:", sorted(missing))
    fx = fx[:N]
    print("fx done", flush=True)
    mus = reverb(mus, 1.8, 0.25)
    fx = reverb(fx, 0.8, 0.12)
    mix = mus * 0.55 + fx * 0.75
    # gentle limiter
    peak = np.max(np.abs(mix))
    mix = np.tanh(mix / max(peak, 1e-6) * 1.6) / np.tanh(1.6) * 0.92
    data = (mix * 32767).astype(np.int16)
    with wave.open(out_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print("wrote", out_path)


if __name__ == "__main__":
    build(sys.argv[1])
