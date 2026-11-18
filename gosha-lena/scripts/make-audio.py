#!/usr/bin/env python3
"""Синтез музыки и звуковых эффектов для сериала (только numpy + ffmpeg, без чужих сэмплов).

    python3 scripts/make-audio.py            # всё: assets/music/theme.mp3 + assets/sfx/*.wav
    python3 scripts/make-audio.py --sfx      # только эффекты

Музыка: весёлый «комедийный» бит, 112 BPM, до мажор (C–Am–F–G):
щипковый бас, гитарные «плаки» на слабые доли, колокольчики-мелодия, лёгкие бочка/щелчки/шейкер.
Длина ~64 с, ролик подрезает лишнее.
"""
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, a=0.003, d=None, rate=6.0):
    t = np.arange(n) / SR
    e = np.exp(-t * rate)
    att = np.clip(t / a, 0, 1) if a > 0 else 1
    return e * att


def fft_filter(x, lo=None, hi=None, order=4):
    n = len(x)
    nf = 1 << (n - 1).bit_length()
    X = np.fft.rfft(x, nf)
    f = np.fft.rfftfreq(nf, 1 / SR) + 1e-6
    g = np.ones_like(f)
    if hi:
        g /= 1 + (f / hi) ** order
    if lo:
        g /= 1 + (lo / f) ** order
    return np.fft.irfft(X * g, nf)[:n]


def write_wav(path, x, stereo=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    x = np.asarray(x, dtype=np.float64)
    peak = np.max(np.abs(x)) or 1
    x = x / peak * 0.89  # пик ≈ −1 dBFS
    if stereo and x.ndim == 2:
        data = (x.T * 32767).astype('<i2').tobytes()
        ch = 2
    else:
        data = (x * 32767).astype('<i2').tobytes()
        ch = 1
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(ch)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data)


def add(buf, at, s, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    s = np.array(s[: len(buf) - i], dtype=np.float64)
    k = min(len(s), int(0.012 * SR))  # 12 мс затухания в конце ноты — без щелчков
    if k > 0:
        s[-k:] *= np.linspace(1, 0, k)
    buf[i: i + len(s)] += s * gain


# ---------------------------------------------------------------- инструменты
def pluck(f, dur=0.5, bright=1.0):
    t = t_(dur)
    s = sum(np.sin(2 * np.pi * k * f * t) / k ** 1.3 * np.exp(-t * (4 + k * 3.0 / bright)) for k in range(1, 9))
    return s * np.clip(t / 0.003, 0, 1)


def pizz_bass(f, dur=0.35):
    t = t_(dur)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return s * np.exp(-t * 7) * np.clip(t / 0.004, 0, 1)


def glock(f, dur=0.6):
    t = t_(dur)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 10) + 0.1 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 18)
    return s * np.exp(-t * 4.5) * np.clip(t / 0.002, 0, 1)


def kick(dur=0.3):
    t = t_(dur)
    f = 45 + 80 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)


def snap(dur=0.12):
    t = t_(dur)
    n = rng.standard_normal(len(t))
    return fft_filter(n, lo=1200, hi=6000) * np.exp(-t * 45) * np.clip(t / 0.002, 0, 1)


def shaker(dur=0.06):
    t = t_(dur)
    return fft_filter(rng.standard_normal(len(t)), lo=5000, hi=11000) * np.exp(-t * 70) * np.clip(t / 0.01, 0, 1)


def saw(f, t, n=12):
    return sum(np.sin(2 * np.pi * k * f * t) / k for k in range(1, n + 1))


# ---------------------------------------------------------------- музыка
def make_music(length=64.0):
    BPM = 112
    B = 60 / BPM
    BAR = 4 * B
    N = int(length * SR)
    L = np.zeros(N)
    R = np.zeros(N)
    drums = np.zeros(N)

    C, Am, F, G = (48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [55, 59, 62])
    prog = [C, Am, F, G]
    melA = [
        [(0, 76, 1), (1, 79, 0.5), (1.5, 76, 0.5), (2, 72, 1), (3, 74, 1)],
        [(0, 72, 1), (1, 76, 0.5), (1.5, 72, 0.5), (2, 69, 1), (3, 71, 1)],
        [(0, 69, 0.5), (0.5, 72, 0.5), (1, 77, 1), (2, 76, 1), (3, 74, 1)],
        [(0, 74, 1), (1, 71, 0.5), (1.5, 74, 0.5), (2, 79, 1.5), (3.5, 77, 0.5)],
    ]
    melB = [
        [(0, 84, 2), (2, 79, 1), (3, 81, 1)],
        [(0, 81, 2), (2, 76, 2)],
        [(0, 77, 1), (1, 81, 1), (2, 84, 2)],
        [(0, 83, 1), (1, 79, 1), (2, 74, 1), (3, 71, 1)],
    ]
    nbars = int(length / BAR) + 1
    for bar in range(nbars):
        t0 = bar * BAR
        root, triad = prog[bar % 4]
        intro = bar < 2
        breakdown = 16 <= bar < 18
        # бас: прыгающий корень-квинта
        for (pos, iv) in [(0, 0), (1, 7), (1.5, 12), (2, 0), (3, 7), (3.5, 5)]:
            if intro and pos not in (0, 2):
                continue
            s = pizz_bass(hz(root + iv), 0.3)
            add(L, t0 + pos * B, s, 0.55)
            add(R, t0 + pos * B, s, 0.55)
        # «гитара» на слабые доли
        for pos in (0.5, 1.5, 2.5, 3.5):
            ch = sum(pluck(hz(m), 0.45) for m in triad)
            add(L, t0 + pos * B, ch, 0.22)
            add(R, t0 + pos * B, ch, 0.12)
        # мелодия-колокольчики
        if not intro and not breakdown:
            mel = (melA if (bar // 4) % 2 == 0 else melB)[bar % 4]
            for pos, m, ln in mel:
                s = glock(hz(m), 0.25 + ln * B)
                add(L, t0 + pos * B, s, 0.10)
                add(R, t0 + pos * B, s, 0.20)
        # барабаны
        if not intro:
            for pos in (0, 2):
                add(drums, t0 + pos * B, kick(), 0.7 if not breakdown else 0.3)
            if bar % 2 == 1:
                add(drums, t0 + 3.5 * B, kick(), 0.45)
            for pos in (1, 3):
                add(drums, t0 + pos * B, snap(), 0.45)
            for i in range(8):
                add(drums, t0 + i * 0.5 * B, shaker(), 0.18 if i % 2 else 0.1)
    L += drums
    R += drums
    # мягкий «потолок» и лёгкий хай-пасс
    L = np.tanh(fft_filter(L, lo=35) * 1.2)
    R = np.tanh(fft_filter(R, lo=35) * 1.2)
    fade = np.clip((N - np.arange(N)) / (SR * 1.5), 0, 1)
    out = np.stack([L * fade, R * fade])
    wav = ROOT / 'assets/music/theme.wav'
    write_wav(wav, out, stereo=True)
    mp3 = ROOT / 'assets/music/theme.mp3'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-c:a', 'libmp3lame', '-b:a', '192k', str(mp3)], check=True)
    wav.unlink()
    print('→', mp3)


# ---------------------------------------------------------------- эффекты
def sfx_pop():
    t = t_(0.12)
    f = 350 + 900 * (1 - np.exp(-t * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35)
    return s + 0.3 * fft_filter(rng.standard_normal(len(t)), lo=2000) * np.exp(-t * 200)


def sfx_message():
    out = np.zeros(int(0.5 * SR))
    for at, m in [(0, 88), (0.11, 93)]:
        t = t_(0.38)
        f = hz(m)
        s = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 9) * np.clip(t / 0.002, 0, 1)
        add(out, at, s, 0.8)
    return out


def sfx_punch():
    t = t_(0.6)
    f = 40 + 140 * np.exp(-t * 25)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    crack = fft_filter(rng.standard_normal(len(t)), lo=800, hi=6000) * np.exp(-t * 60)
    wood = sum(np.sin(2 * np.pi * fr * t) * np.exp(-t * dc) for fr, dc in [(180, 18), (410, 25), (730, 35)])
    rattle = fft_filter(rng.standard_normal(len(t)), lo=3000) * (np.exp(-((t - 0.12) / 0.05) ** 2) * 0.4)
    return np.tanh(body * 1.6 + crack * 0.9 + wood * 0.35 + rattle)


def sfx_buzz(dur=2.6):
    t = t_(dur)
    f = 210 + 25 * np.sin(2 * np.pi * 6.5 * t) + 18 * np.sin(2 * np.pi * 1.3 * t)
    ph = np.cumsum(f) / SR
    s = sum(np.sin(2 * np.pi * k * ph) / k for k in range(1, 20))
    s = fft_filter(s, lo=250, hi=3500)
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 0.9 * t + 1) * np.sin(2 * np.pi * 0.37 * t)
    return s * am * np.clip(t / 0.15, 0, 1) * np.clip((dur - t) / 0.3, 0, 1)


def sfx_whoosh(dur=0.55):
    t = t_(dur)
    n = rng.standard_normal(len(t))
    # «проезд» фильтра снизу вверх: сумма полос с разными окнами
    s = np.zeros(len(t))
    bands = [(300, 700), (700, 1500), (1500, 3000), (3000, 6000)]
    for i, (lo, hi) in enumerate(bands):
        c = (i + 0.5) / len(bands) * dur * 0.7
        s += fft_filter(n, lo=lo, hi=hi) * np.exp(-((t - c) / (dur * 0.22)) ** 2)
    return s


def sfx_boing(dur=0.45):
    t = t_(dur)
    f = 180 + 120 * np.exp(-t * 6) * (1 + 0.5 * np.sin(2 * np.pi * 14 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * np.clip(t / 0.003, 0, 1)


def sfx_shock():
    """«Дан-дан-ДАААН»: два коротких удара и долгий тревожный аккорд."""
    out = np.zeros(int(2.6 * SR))
    hits = [(0.0, [38, 50, 53, 57], 0.22), (0.26, [38, 50, 53, 57], 0.22), (0.58, [37, 49, 52, 55, 58], 1.9)]
    for at, notes, ln in hits:
        t = t_(ln)
        trem = 1 + (0.25 * np.sin(2 * np.pi * 9 * t) if ln > 1 else 0)
        s = sum(saw(hz(m) * (1 + 0.002 * i), t, 14) for i, m in enumerate(notes))
        s = fft_filter(s, hi=2500) * np.exp(-t * (1.2 if ln > 1 else 6)) * np.clip(t / 0.005, 0, 1) * trem
        hit = kick(0.4) * 1.5
        add(out, at, s, 0.35)
        add(out, at, hit, 0.8)
    return np.tanh(out * 1.3)


def sfx_fail():
    """Грустный тромбон «вау-вау-вау-ваааа»."""
    out = np.zeros(int(2.8 * SR))
    notes = [(0.0, 58, 0.42), (0.45, 57, 0.42), (0.9, 56, 0.42), (1.35, 55, 1.3)]
    for at, m, ln in notes:
        t = t_(ln)
        vib = 1 + (0.012 * np.sin(2 * np.pi * 6 * t) * np.clip((t - 0.25) / 0.2, 0, 1) if ln > 1 else 0)
        f = hz(m) * vib * (1 - 0.03 * np.exp(-t * 20))
        ph = np.cumsum(f) / SR
        s = sum(np.sin(2 * np.pi * k * ph) / k ** 0.9 for k in range(1, 16))
        wah = 0.35 + 0.65 * np.clip(t / 0.08, 0, 1) * np.exp(-t * (0.8 if ln > 1 else 2.5))
        s = fft_filter(s, hi=1800) * wah * np.clip((ln - t) / 0.06, 0, 1)
        add(out, at, s, 0.5)
    return out


def sfx_stamp():
    t = t_(0.35)
    thud = np.sin(2 * np.pi * np.cumsum(70 + 90 * np.exp(-t * 40)) / SR) * np.exp(-t * 14)
    slap = fft_filter(rng.standard_normal(len(t)), lo=600, hi=5000) * np.exp(-t * 40)
    return np.tanh(thud * 1.4 + slap * 0.8)


def make_sfx():
    fx = {
        'pop': sfx_pop(), 'message': sfx_message(), 'punch': sfx_punch(), 'buzz': sfx_buzz(),
        'whoosh': sfx_whoosh(), 'boing': sfx_boing(), 'shock': sfx_shock(), 'fail': sfx_fail(), 'stamp': sfx_stamp(),
    }
    for name, s in fx.items():
        p = ROOT / 'assets/sfx' / f'{name}.wav'
        write_wav(p, s)
        print('→', p)


if __name__ == '__main__':
    make_sfx()
    if '--sfx' not in sys.argv:
        make_music()
