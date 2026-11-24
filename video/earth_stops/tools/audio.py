# Original score + sound design, fully synthesised (no samples, no copyrighted material).
# Reads build/plan.json (scene cues exported by `node render.js plan`) and build/narration.wav.
#   python3 tools/audio.py [from_sec to_sec]   -> build/mix.wav (stereo 48 kHz, -14 LUFS)
import json, os, sys, wave, subprocess
import numpy as np
from scipy import signal

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, 'build')
SR = 48000
plan = json.load(open(os.path.join(BUILD, 'plan.json')))
TOTAL = plan[-1]['start'] + plan[-1]['dur']
N = int(SR * (TOTAL + 3))
rs = np.random.default_rng(1234)


def T(n): return np.arange(n) / SR
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def sos(kind, f, order=2): return signal.butter(order, f, kind, fs=SR, output='sos')
def filt(x, kind, f, order=2): return signal.sosfilt(sos(kind, f, order), x)
def noise(n): return rs.standard_normal(n)


class Bus:
    def __init__(s): s.L = np.zeros(N, np.float32); s.R = np.zeros(N, np.float32)
    def add(s, t, x, pan=0.0, g=1.0):
        if x.ndim == 2: l, r = x[0], x[1]
        else: l, r = x * np.sqrt((1 - pan) / 2) * 1.414, x * np.sqrt((1 + pan) / 2) * 1.414
        i = int(t * SR)
        if i < 0: l, r, i = l[-i:], r[-i:], 0
        j = min(N, i + len(l))
        if j <= i: return
        s.L[i:j] += (l[:j - i] * g).astype(np.float32); s.R[i:j] += (r[:j - i] * g).astype(np.float32)


def env(n, a=0.01, r=0.1, curve=1.0):
    e = np.ones(n); na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na) ** curve
    if nr: e[n - nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def edecay(n, tau): return np.exp(-T(n) / tau)


def saw(f, n, ph=None):
    ph = rs.random() if ph is None else ph
    p = (ph + np.cumsum(np.broadcast_to(f, (n,)).astype(float)) / SR) % 1
    return 2 * p - 1


def sine(f, n, ph=0):
    return np.sin(2 * np.pi * (ph + np.cumsum(np.broadcast_to(f, (n,)).astype(float)) / SR))


# ---------------- instruments ----------------
def pad(notes, dur, cut=1100, att=1.2, rel=1.6, det=0.12):
    n = int((dur + rel) * SR); x = np.zeros(n)
    for m in notes:
        for d in (-det, 0, det): x += saw(hz(m + d), n)
    x = filt(x, 'lowpass', cut) / (len(notes) * 3)
    return x * env(n, att, rel, 1.5)


def piano(m, dur=2.5, vel=0.5):
    n = int(dur * SR); f = hz(m); t = T(n); x = np.zeros(n)
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)
        if fk > SR / 2.2: break
        x += np.sin(2 * np.pi * fk * t) * (1 / k ** 1.4) * np.exp(-t * (0.9 + k * 0.7) * (f / 400) ** 0.3)
    x += noise(n) * np.exp(-t / 0.004) * 0.05
    return x * env(n, 0.003, 0.25) * vel


def bell(m, dur=3.0, vel=0.3):
    n = int(dur * SR); f = hz(m); t = T(n)
    return np.sin(2 * np.pi * f * t + 2.2 * np.exp(-t * 2) * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 1.4) * vel * env(n, 0.002, 0.3)


def bass(m, dur, vel=0.5, cut=320):
    n = int(dur * SR)
    return filt(saw(hz(m), n) + 0.5 * sine(hz(m - 12), n), 'lowpass', cut) * env(n, 0.01, min(0.2, dur / 3)) * vel


def stac(m, dur=0.14, vel=0.5):
    n = int((dur + 0.08) * SR); x = sum(saw(hz(m + d), n) for d in (-0.08, 0, 0.08))
    return filt(x, 'lowpass', 1600) * env(n, 0.004, 0.08) * edecay(n, dur * 0.8) * vel / 3


def brass(notes, dur, vel=0.4):
    n = int((dur + 0.5) * SR); x = np.zeros(n)
    for m in notes:
        for d in (-0.07, 0.07): x += saw(hz(m + d), n)
    lo, hi = filt(x, 'lowpass', 500), filt(x, 'lowpass', 2600)
    e = np.interp(T(n), [0, dur * 0.35, dur, dur + 0.5], [0, 1, 0.6, 0])
    return (lo * (1 - e) + hi * e) * e * vel / (2 * len(notes))


def strings(notes, dur, vel=0.3, cut=2200, trem=0):
    n = int((dur + 1.2) * SR); x = np.zeros(n); t = T(n)
    for m in notes:
        vib = hz(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * t + rs.random() * 6))
        for d in (-0.06, 0, 0.06): x += saw(vib * 2 ** (d / 12), n)
    x = filt(x, 'lowpass', cut) / (3 * len(notes))
    if trem: x *= 0.6 + 0.4 * np.sin(2 * np.pi * trem * t)
    return x * env(n, min(0.8, dur / 2), 1.2, 1.5) * vel


def taiko(vel=1.0, f0=95):
    n = int(0.9 * SR); t = T(n); f = f0 * (0.55 + 0.45 * np.exp(-t / 0.05))
    x = sine(f, n) * np.exp(-t / 0.28) + filt(noise(n), 'lowpass', 600) * np.exp(-t / 0.03) * 0.6
    return np.tanh(x * 1.5) * vel


def kick(vel=1.0):
    n = int(0.45 * SR); t = T(n)
    return np.tanh(sine(45 + 80 * np.exp(-t / 0.04), n) * np.exp(-t / 0.18) * 2) * vel


def hat(vel=0.3, dec=0.04):
    n = int(0.2 * SR); return filt(noise(n), 'highpass', 7000) * np.exp(-T(n) / dec) * vel


def timpani(m=38, vel=0.8, dur=2.5):
    n = int(dur * SR); t = T(n); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 3)) * np.exp(-t / 0.7) * vel + filt(noise(n), 'lowpass', 300) * np.exp(-t / 0.05) * 0.4 * vel


def swell(dur, vel=0.4, hp=3000):
    n = int(dur * SR); return filt(noise(n), 'highpass', hp) * (T(n) / dur) ** 3 * vel


def sweep_noise(dur, f0, f1, q=2.0, vel=0.5, shape=None):
    """band-passed noise whose centre glides f0 -> f1 (STFT-domain mask)"""
    n = int(dur * SR); x = noise(n)
    f, tt, Z = signal.stft(x, SR, nperseg=1024)
    fc = np.exp(np.interp(tt, [0, dur], [np.log(f0), np.log(f1)]))
    M = np.exp(-((np.log(np.maximum(f[:, None], 1)) - np.log(fc[None, :])) * q) ** 2)
    _, y = signal.istft(Z * M, SR, nperseg=1024); y = y[:n]
    e = shape(T(len(y)) / dur) if shape else np.sin(np.pi * np.clip(T(len(y)) / dur, 0, 1))
    return y / (np.max(np.abs(y)) + 1e-9) * e * vel


# ---------------- sound effects ----------------
def fx_boom(d=4.0, vel=1.0):
    n = int(d * SR); t = T(n)
    sub = sine(28 + 50 * np.exp(-t / 0.25), n) * np.exp(-t / 1.4)
    crack = filt(noise(n), 'lowpass', 2500) * np.exp(-t / 0.08)
    body = filt(noise(n), 'lowpass', 180) * np.exp(-t / 0.9)
    return np.tanh((sub * 1.4 + crack * 0.7 + body * 1.2) * 1.3) * vel


def fx_hit(vel=0.8):
    n = int(1.6 * SR); t = T(n)
    return np.tanh(sine(55 + 60 * np.exp(-t / 0.03), n) * np.exp(-t / 0.5) * 1.5 + filt(noise(n), 'bandpass', [200, 3000]) * np.exp(-t / 0.05) * 0.8) * vel


def fx_glass(d=1.2, vel=0.5, dens=60):
    n = int(d * SR); x = np.zeros(n)
    for _ in range(int(dens * d)):
        i = int(rs.random() * n * 0.8); m = int(0.25 * SR); tt = T(m); f = rs.uniform(2500, 9000)
        g = (np.sin(2 * np.pi * f * tt) * np.exp(-tt / rs.uniform(0.02, 0.12)) + noise(m) * np.exp(-tt / 0.004) * 0.6) * rs.uniform(0.2, 1)
        j = min(n, i + m); x[i:j] += g[:j - i]
    return filt(x, 'highpass', 1500) * vel * env(n, 0.001, 0.2) / 3


def fx_tick(vel=0.4, hi=True):
    n = int(0.05 * SR); return filt(noise(n), 'bandpass', [1800, 4500] if hi else [1000, 2500]) * np.exp(-T(n) / 0.006) * vel


def fx_screech(d=1.2, f=2300, vel=0.35):
    n = int(d * SR); t = T(n)
    tone = sine(f * (1 + 0.02 * np.sin(2 * np.pi * 23 * t)) * (1 - 0.1 * t / d), n) + 0.5 * sine(f * 1.51, n)
    return (tone * 0.4 + sweep_noise(d, f * 0.8, f * 0.6, 3, 0.6, lambda u: np.ones_like(u))) * env(n, 0.02, 0.3) * vel


def fx_pop(vel=0.4):
    n = int(0.25 * SR); t = T(n); return (sine(900 * np.exp(-t / 0.05) + 250, n) * np.exp(-t / 0.06) + noise(n) * np.exp(-t / 0.003) * 0.3) * vel


def fx_thud(vel=0.7):
    n = int(0.6 * SR); t = T(n); return np.tanh(sine(70 * np.exp(-t / 0.2) + 30, n) * np.exp(-t / 0.15) * 2 + filt(noise(n), 'lowpass', 400) * np.exp(-t / 0.03)) * vel


def fx_notify(vel=0.25):
    return np.concatenate([bell(88, 0.18, vel), bell(93, 0.6, vel)])


def fx_heartbeat(vel=0.8):
    out = np.zeros(int(0.8 * SR))
    for off, f0, a in ((0, 55, 1.0), (0.22, 65, 0.7)):
        n = int(0.3 * SR); t = T(n); x = sine(f0 + 30 * np.exp(-t / 0.02), n) * np.exp(-t / 0.08) * a
        i = int(off * SR); out[i:i + n] += x
    return np.tanh(out * 1.5) * vel


def fx_gull(vel=0.25):
    n = int(0.5 * SR); t = T(n); f = 1400 - 700 * (t / 0.5) + 200 * np.sin(2 * np.pi * 7 * t)
    return (sine(f, n) + 0.4 * sine(f * 2, n)) * np.sin(np.pi * t / 0.5) ** 0.5 * vel


def fx_chirp(vel=0.12):
    n = int(0.12 * SR); t = T(n); return sine(3500 + 2500 * np.sin(np.pi * t / 0.12), n) * np.sin(np.pi * t / 0.12) * vel


# ambience beds (duration d, strength g)
def amb(kind, d, g=1.0):
    n = int(d * SR); t = T(n); L = np.zeros(n); R = np.zeros(n)
    def both(x, a=1.0): nonlocal L, R; L += x * a; R += x * a
    if kind == 'city':
        both(filt(noise(n), 'lowpass', 500) * 0.25 + filt(noise(n), 'bandpass', [400, 2000]) * 0.03)
        for k in range(int(d / 1.6)):
            c = rs.uniform(0, d); w = rs.uniform(1.5, 3.0); i0 = int(max(0, c - w) * SR); i1 = min(n, int((c + w) * SR)); m = i1 - i0
            if m <= 0: continue
            x = filt(noise(m), 'bandpass', [80, rs.uniform(600, 1400)]) * np.sin(np.pi * np.arange(m) / m) ** 2 * rs.uniform(0.15, 0.35)
            p = np.linspace(-1, 1, m) * (1 if rs.random() < 0.5 else -1)
            L[i0:i1] += x * np.sqrt((1 - p) / 2); R[i0:i1] += x * np.sqrt((1 + p) / 2)
        for k in range(int(d * 1.2)):
            i = int(rs.uniform(0, d - 0.2) * SR); c = fx_chirp(rs.uniform(0.04, 0.09)); j = min(n, i + len(c))
            (L if rs.random() < 0.5 else R)[i:j] += c[:j - i]
        if d > 4:
            i = int(rs.uniform(1, d - 2) * SR); m = int(0.5 * SR); h = filt(saw(392, m) + saw(494, m), 'lowpass', 2000) * env(m, 0.02, 0.1) * 0.05; L[i:i + m] += h[:len(L[i:i + m])]
    elif kind == 'beach':
        lfo = 0.55 + 0.45 * np.sin(2 * np.pi * t / 5.5) ** 2
        both(filt(noise(n), 'lowpass', 900) * lfo * 0.35 + filt(noise(n), 'highpass', 3000) * lfo ** 3 * 0.05)
        for k in range(int(d / 2)):
            i = int(rs.uniform(0, d - 0.6) * SR); c = fx_gull(0.06); j = min(n, i + len(c)); (L if k % 2 else R)[i:j] += c[:j - i]
    elif kind == 'jet':
        both(filt(noise(n), 'lowpass', 350) * 0.45 + sine(96, n) * 0.04 + filt(noise(n), 'bandpass', [2500, 4000]) * 0.02)
    elif kind == 'wind':
        gust = 0.5 + 0.5 * np.abs(np.convolve(noise(n // 2400 + 4), np.ones(4) / 4, 'same'))
        gust = np.interp(np.arange(n), np.linspace(0, n, len(gust)), gust)
        both(filt(noise(n), 'bandpass', [150, 900]) * gust * 0.5 + filt(noise(n), 'bandpass', [900, 2400]) * gust ** 2 * 0.08)
    elif kind == 'storm':
        gust = 0.6 + 0.4 * np.sin(2 * np.pi * t * 0.3) * np.sin(2 * np.pi * t * 0.13)
        x = filt(noise(n), 'bandpass', [60, 700]) * 0.8 + filt(noise(n), 'bandpass', [700, 2600]) * 0.15
        L += x * gust; R += np.roll(x, 3000) * gust
        both(filt(noise(n), 'lowpass', 70) * 0.9)
    elif kind == 'rumble':
        both(np.tanh(filt(noise(n), 'lowpass', 90) * 2.5) * 0.6)
    elif kind == 'space':
        both(sine(55, n) * 0.05 + sine(82.4, n) * 0.03 + filt(noise(n), 'lowpass', 200) * 0.05)
    elif kind == 'ocean_roar':
        both(filt(noise(n), 'lowpass', 400) * 0.8 + filt(noise(n), 'bandpass', [400, 3000]) * (0.4 + 0.3 * np.sin(2 * np.pi * t * 0.4)) * 0.3)
    elif kind == 'debris':
        for k in range(int(d * 6)):
            i = int(rs.uniform(0, d - 0.3) * SR); c = fx_thud(rs.uniform(0.05, 0.25)) if rs.random() < 0.6 else fx_glass(0.3, rs.uniform(0.1, 0.3), 30)
            j = min(n, i + len(c)); (L if rs.random() < 0.5 else R)[i:j] += c[:j - i]
    elif kind == 'engine':
        both(filt(saw(48 + 4 * np.sin(2 * np.pi * 0.5 * t), n), 'lowpass', 260) * 0.25 + filt(noise(n), 'lowpass', 300) * 0.15)
    elif kind == 'clock':
        for k in range(int(d)):
            c = fx_tick(0.35, k % 2 == 0); i = int(k * SR); L[i:i + len(c)] += c[:len(L[i:i + len(c)])]; R[i:i + len(c)] += c[:len(R[i:i + len(c)])]
    elif kind == 'tinnitus':
        both(sine(6200, n) * 0.035 * np.exp(-t / (d * 0.6)))
    elif kind == 'heartbeat':
        for k in range(int(d / 0.85)):
            c = fx_heartbeat(0.7); i = int(k * 0.85 * SR); j = min(n, i + len(c)); L[i:j] += c[:j - i]; R[i:j] += c[:j - i]
    elif kind == 'night':
        for k in range(int(d * 3)):
            i = int(rs.uniform(0, d - 0.2) * SR); m = int(0.15 * SR); c = sine(4300, m) * (np.sin(2 * np.pi * 30 * T(m)) > 0) * np.sin(np.pi * T(m) / 0.15) * 0.02
            (L if rs.random() < 0.5 else R)[i:i + m] += c[:len(L[i:i + m])]
        both(filt(noise(n), 'lowpass', 300) * 0.06)
    elif kind == 'siren':
        f = 700 + 250 * np.sin(2 * np.pi * t / 2.4); x = filt(saw(f, n), 'lowpass', 2500) * 0.06 * env(n, 1.5, 1.5); L += x * 0.6; R += x
    elif kind == 'crowd':
        x = filt(noise(n), 'bandpass', [250, 1600]) * (0.5 + 0.3 * np.sin(2 * np.pi * t * 0.7)) * 0.12; both(x)
    elif kind == 'construction':
        both(filt(noise(n), 'lowpass', 400) * 0.08)
        for k in range(int(d * 1.5)):
            i = int(rs.uniform(0, d - 0.2) * SR); m = int(0.12 * SR); c = (sine(rs.uniform(900, 1500), m) * 0.5 + noise(m) * 0.5) * np.exp(-T(m) / 0.02) * 0.2
            (L if rs.random() < 0.5 else R)[i:i + m] += c[:len(L[i:i + m])]
    elif kind == 'fire':
        both(filt(noise(n), 'lowpass', 1200) * 0.12 * (0.7 + 0.3 * np.abs(np.sin(2 * np.pi * t * 3.3))))
    elif kind == 'radio':
        both(filt(noise(n), 'bandpass', [800, 3500]) * 0.05 * (0.5 + 0.5 * (np.sin(2 * np.pi * t * 0.8) > 0)))
    e = env(n, min(0.6, d / 4), min(0.8, d / 4))
    return np.stack([L * e, R * e]) * g


def one_shot(c):
    k, v = c['type'], c.get('gain', 1.0); d = c.get('d', 1.0)
    if k == 'boom': return fx_boom(4.0, v)
    if k == 'hit': return fx_hit(v * 0.8)
    if k == 'whoosh': return sweep_noise(d or 0.8, 300, 3500, 2.5, 0.5 * v)
    if k == 'whoosh_down': return sweep_noise(d or 0.8, 3000, 200, 2.5, 0.5 * v)
    if k == 'riser': return sweep_noise(d, 200, 6000, 1.6, 0.35 * v, lambda u: u ** 2)
    if k == 'reverse': return swell(d, 0.45 * v)
    if k == 'glass': return fx_glass(d, 0.6 * v)
    if k == 'screech': return fx_screech(d, c.get('f', 2300), 0.35 * v)
    if k == 'pop': return fx_pop(0.35 * v)
    if k == 'thud': return fx_thud(0.7 * v)
    if k == 'notify': return fx_notify(0.25 * v)
    if k == 'tick': return fx_tick(0.4 * v)
    if k == 'gull': return fx_gull(0.25 * v)
    if k == 'slam': return np.tanh(fx_boom(3.0, 1.0) * 1.2 + np.pad(timpani(38, 0.8, 3.0), (0, 0))[:int(3.0 * SR)]) * 0.9 * v
    if k == 'sub': n = int(d * SR); tt = T(n); return sine(36 * (1 - 0.3 * tt / d), n) * env(n, 0.05, d * 0.6) * 0.7 * v
    return None


# ---------------- score ----------------
CH = {'Dm': [50, 53, 57], 'Bb': [46, 50, 53], 'F': [53, 57, 60], 'C': [48, 52, 55], 'Gm': [43, 46, 50], 'A': [45, 49, 52], 'Am': [45, 48, 52], 'Eb': [51, 55, 58]}
MOODS = {
    'calm':        dict(bpm=72, prog=['Dm', 'Bb', 'F', 'C']),
    'calm_quiet':  dict(bpm=72, prog=['Dm', 'Bb', 'F', 'C']),
    'tension':     dict(bpm=72, prog=['Dm', 'Bb', 'Gm', 'A']),
    'slowmo':      dict(bpm=40, prog=['Dm', 'Dm']),
    'catastrophe': dict(bpm=100, prog=['Dm', 'Bb', 'Gm', 'A']),
    'aftermath':   dict(bpm=60, prog=['Dm', 'Bb', 'Gm', 'Dm']),
    'emotional':   dict(bpm=66, prog=['Dm', 'Bb', 'F', 'C']),
    'hope':        dict(bpm=84, prog=['F', 'C', 'Dm', 'Bb']),
    'final':       dict(bpm=64, prog=['Bb', 'F', 'C', 'Dm']),
    'silence':     dict(bpm=60, prog=['Dm']),
}


def music(mood, dur):
    M = MOODS[mood]; beat = 60 / M['bpm']; bar = 4 * beat; n = int((dur + 3) * SR)
    L = np.zeros(n); R = np.zeros(n)
    def put(t, x, pan=0.0, g=1.0):
        i = int(t * SR)
        if i >= n: return
        j = min(n, i + len(x)); L[i:j] += x[:j - i] * g * np.sqrt((1 - pan) / 2) * 1.41; R[i:j] += x[:j - i] * g * np.sqrt((1 + pan) / 2) * 1.41
    if mood == 'silence': return np.stack([L, R])
    nb = int(np.ceil(dur / bar))
    for b in range(nb):
        t0 = b * bar; ch = CH[M['prog'][b % len(M['prog'])]]; root = ch[0]
        u = b / max(1, nb - 1)
        if mood in ('calm', 'calm_quiet'):
            put(t0, pad([m + 12 for m in ch], bar, 1000), 0, 0.10 if mood == 'calm' else 0.07)
            put(t0, bass(root - 12, bar * 0.95, 0.22, 220), 0, 1.0 if mood == 'calm' else 0.5)
            arp = [ch[0] + 24, ch[1] + 24, ch[2] + 24, ch[1] + 24]
            steps = 8 if mood == 'calm' else 4
            for s in range(steps):
                put(t0 + s * bar / steps, piano(arp[s % 4] + (12 if s == 5 else 0), 2.2, 0.16 * (0.8 + 0.4 * rs.random())), -0.3 + 0.6 * (s % 2), 1)
            if b % 2 == 1 and mood == 'calm': put(t0 + beat * 2, bell(ch[2] + 36, 3, 0.05), 0.4)
        elif mood == 'tension':
            put(t0, pad([m + 12 for m in ch] + [ch[0] + 25], bar, 900 + 1500 * u), 0, 0.09)
            for s in range(8): put(t0 + s * beat / 2, bass(root - 12, beat / 2 * 0.8, 0.3, 260 + 400 * u))
            for s in range(16): put(t0 + s * beat / 4, hat(0.05 + 0.08 * u, 0.03), 0.5 if s % 2 else -0.5)
            put(t0, timpani(root - 12, 0.5 + 0.4 * u), 0)
            put(t0, strings([74, 75], bar, 0.05 + 0.06 * u, 3500), 0.3)
        elif mood == 'slowmo':
            put(t0, pad([38, 45, 50], bar, 300, 1.5, 2.0), 0, 0.22)
            put(t0, strings([62, 63], bar, 0.05, 3000), 0)
        elif mood == 'catastrophe':
            for s in range(16):
                m = root - 12 + (12 if s % 4 == 2 else 0) + (7 if s % 8 == 7 else 0)
                put(t0 + s * beat / 4, stac(m, 0.12, 0.55 if s % 4 == 0 else 0.35), -0.2 + 0.4 * (s % 2))
            for p in (0, 1.5, 2, 3, 3.5): put(t0 + p * beat, taiko(0.9 if p in (0, 2) else 0.6, 90 if p in (0, 2) else 120), 0.15 * np.sin(p))
            put(t0, kick(0.7)); put(t0 + 2 * beat, kick(0.6))
            put(t0, brass([m for m in ch], bar * 0.9, 0.5), 0)
            put(t0, strings([m + 24 for m in ch], bar, 0.06, 4000, trem=12), 0)
            put(t0, bass(root - 12, bar, 0.35, 200))
            if b % 4 == 3: put(t0, swell(bar, 0.25), 0)
        elif mood == 'aftermath':
            put(t0, pad([38, 45], bar, 380, 2.0, 2.5), 0, 0.14)
            put(t0, pad([m + 12 for m in ch], bar, 700, 2.0, 2.5), 0, 0.06)
            for s in rs.choice(8, 3, replace=False):
                put(t0 + s * beat / 2, piano(ch[rs.integers(3)] + 24 + 12 * rs.integers(2), 4.0, 0.15), rs.uniform(-0.6, 0.6))
        elif mood == 'emotional':
            put(t0, strings([m + 12 for m in ch], bar, 0.12, 1800), 0)
            put(t0, bass(root - 12, bar * 0.95, 0.2, 200))
            arp = [ch[0] + 24, ch[1] + 24, ch[2] + 24, ch[0] + 36]
            for s in range(8): put(t0 + s * bar / 8, piano(arp[s % 4], 2.6, 0.14), -0.3 + 0.6 * (s % 2))
            put(t0, strings([ch[1] + 12], bar * 0.95, 0.08 + 0.06 * u, 1500), -0.2)
        elif mood == 'hope':
            put(t0, pad([m + 12 for m in ch], bar, 1600), 0, 0.09)
            put(t0, bass(root - 12, bar * 0.95, 0.25, 260))
            for s in range(8): put(t0 + s * beat / 2, piano([ch[0], ch[1], ch[2], ch[1]][s % 4] + 24 + (12 if s >= 4 else 0), 1.4, 0.12), -0.4 + 0.8 * (s % 2))
            put(t0, kick(0.25)); put(t0 + 2 * beat, kick(0.2))
            for s in range(8): put(t0 + s * beat / 2, hat(0.04), 0.3)
            if b % 2 == 0: put(t0 + beat, bell(ch[2] + 36, 2.5, 0.05), 0.3)
        elif mood == 'final':
            put(t0, pad([m + 12 for m in ch] + [ch[0]], bar, 1300, 1.6, 2.0), 0, 0.12)
            put(t0, strings([ch[2] + 12, ch[0] + 24], bar, 0.08 + 0.06 * np.sin(np.pi * u), 2000), 0)
            put(t0, bass(root - 12, bar * 0.95, 0.24, 200))
            for s in range(8): put(t0 + s * bar / 8, piano([ch[0], ch[1], ch[2], ch[1]][s % 4] + 24, 3.0, 0.12), -0.3 + 0.6 * (s % 2))
            if b % 4 == 0: put(t0, timpani(root - 12, 0.4), 0)
    return np.stack([L, R])


def reverb(x, secs=2.8, wet=0.25):
    n = int(secs * SR); t = T(n)
    ir = np.stack([filt(noise(n), 'lowpass', 5000) * np.exp(-t / (secs / 5)) for _ in range(2)]); ir /= np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))
    w = np.stack([signal.fftconvolve(x[i], ir[i])[:x.shape[1]] for i in range(2)])
    return x * (1 - wet) + w * wet * 0.6


def main():
    mus, sfx = Bus(), Bus()
    # music timeline from cues; each scene starts with its story mood unless a cue sits at its start
    segs = []
    for sc in plan:
        mc = sorted([c for c in sc['cues'] if 'music' in c], key=lambda c: c['t'])
        if not mc or mc[0]['t'] > sc['start'] + 0.05: segs.append((sc['start'], sc['music'], 1.2))
        for c in mc: segs.append((c['t'], c['music'], c.get('fade', 1.2)))
    segs.sort(key=lambda s: s[0])
    merged = []
    for s in segs:
        if merged and merged[-1][1] == s[1]: continue
        merged.append(s)
    for i, (t0, mood, fade) in enumerate(merged):
        t1 = merged[i + 1][0] if i + 1 < len(merged) else TOTAL
        nf = merged[i + 1][2] if i + 1 < len(merged) else 2.5
        x = music(mood, t1 - t0 + nf)
        n = x.shape[1]; e = np.ones(n)
        fi = int(fade * SR); e[:fi] = np.linspace(0, 1, fi) if fi else 1
        j1 = int((t1 - t0) * SR); fo = int(max(0.05, nf) * SR); e[j1:j1 + fo] = np.linspace(1, 0, len(e[j1:j1 + fo])); e[j1 + fo:] = 0
        mus.add(t0, x * e)
        print(f'music {t0:7.2f}-{t1:7.2f} {mood}')
    # effects
    for sc in plan:
        for c in sc['cues']:
            if 'music' in c: continue
            k = c['type']
            if k in ('city', 'beach', 'jet', 'wind', 'storm', 'rumble', 'space', 'ocean_roar', 'debris', 'engine', 'clock', 'tinnitus', 'heartbeat', 'night', 'siren', 'crowd', 'construction', 'fire', 'radio'):
                sfx.add(c['t'], amb(k, c.get('d', 4), c.get('gain', 1.0)))
            else:
                x = one_shot(c)
                if x is None: print('unknown cue', k); continue
                t = c['t'] - (c.get('d', 0) if k in ('riser', 'reverse') else 0)   # risers END at t
                sfx.add(t, x, c.get('pan', 0.0))
    M = reverb(np.stack([mus.L, mus.R]).astype(np.float64), 3.2, 0.3)
    S = reverb(np.stack([sfx.L, sfx.R]).astype(np.float64), 1.8, 0.15)
    # narration + ducking
    with wave.open(os.path.join(BUILD, 'narration.wav')) as w:
        v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    V = np.zeros(N); V[:min(N, len(v))] = v[:N]
    e = np.abs(V); e = signal.sosfilt(sos('lowpass', 6), e); e = e / (np.max(e) + 1e-9)
    e = np.clip(e * 4, 0, 1)
    duck = 1 - 0.5 * e
    duck = signal.sosfilt(sos('lowpass', 3), duck)
    mix = M * 0.55 * duck + S * 0.75 * (1 - 0.3 * e) + np.stack([V, V]) * 1.0
    a, b = (float(sys.argv[1]), float(sys.argv[2])) if len(sys.argv) > 2 else (0, TOTAL)
    mix = mix[:, int(a * SR):int(b * SR)]
    mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.95
    raw = os.path.join(BUILD, 'mix_raw.wav')
    with wave.open(raw, 'w') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), os.path.join(BUILD, 'mix.wav')], check=True)
    print('mix.wav', a, b)


if __name__ == '__main__':
    main()
