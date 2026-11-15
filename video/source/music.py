import sys, wave
import numpy as np
from timeline import beat_times, bpm_at

SR = 44100
DUR = 90.0
N = int(SR * DUR)
t = np.arange(N) / SR
rs = np.random.default_rng(7)


def env_pts(pts):
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** 4)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


def add_at(buf, start, sig):
    i = int(start * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[:j - i]


L = np.zeros(N)
R = np.zeros(N)

# ---- drone: filtered additive saw on A1 with slowly moving cutoff ----
cut = env_pts([(0, 180), (8, 220), (26, 260), (47.5, 950), (48, 380), (53, 520), (59, 700), (70, 420), (78, 900), (90, 600)])
cut = cut * (1 + 0.15 * np.sin(2 * np.pi * 0.07 * t))
drone_amp = env_pts([(0, 0.0), (0.4, 0.75), (8, 0.8), (26, 0.85), (47, 1.0), (47.8, 0.2), (48.05, 1.0), (70, 0.9), (76, 0.55), (88, 0.4), (90, 0)])
for det, side in ((1.0, 0), (1.004, 1), (0.997, 2)):
    f0 = 55 * det
    sig = np.zeros(N)
    for k in range(1, 26):
        g = 1 / (1 + (k * f0 / cut) ** 4) / k
        sig += np.sin(2 * np.pi * k * f0 * t + k * 1.3 + side) * g
    if side == 0: L += sig * 0.5; R += sig * 0.5
    elif side == 1: L += sig * 0.45
    else: R += sig * 0.45
L *= drone_amp * 0.11
R *= drone_amp * 0.11

# minor third / fifth colour per chapter
third = env_pts([(0, 0), (48, 0), (49, 1), (69, 1), (71, 0), (90, 0)])
fifth = env_pts([(0, 0.4), (26, 0.4), (48, 0.6), (70, 0.6), (90, 0.6)])
col = (np.sin(2 * np.pi * 65.41 * t) * third * 0.03 + np.sin(2 * np.pi * 82.41 * t) * fifth * 0.025) * drone_amp
L += col; R += col

# ---- sub rumble (brown noise) ----
br = np.cumsum(rs.standard_normal(N)); br = fft_filter(br, lo=20, hi=140); br = norm(br)
rum = env_pts([(0, 0.05), (26, 0.06), (47.5, 0.16), (48, 0.08), (70, 0.08), (76, 0.02), (90, 0)])
L += br * rum; R += np.roll(br, 900) * rum

# ---- chapter 2 build: rising tones + noise swell ----
b2 = env_pts([(0, 0), (26, 0), (30, 0.2), (44, 0.8), (47.6, 1.0), (47.8, 0), (90, 0)])
lt = np.clip(t - 26, 0, 22)
for base, pan in ((110, 0.3), (164.8, 0.7), (220, 0.5)):
    fr = base * 2 ** (lt / 22 * 1.0)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * (2 + lt * 0.4) * t)
    s = np.sin(ph) * trem * b2 * 0.035
    L += s * (1 - pan); R += s * pan
nz = fft_filter(rs.standard_normal(N), lo=600, hi=4000); nz = norm(nz)
L += nz * b2 * 0.035; R += np.roll(nz, 3000) * b2 * 0.035

# ---- chapter 3: eerie high dissonance ----
b3 = env_pts([(0, 0), (48, 0), (50, 1), (68, 1), (70.5, 0), (90, 0)])
vib = np.sin(2 * np.pi * 5.2 * t) * 4
e = (np.sin(2 * np.pi * (880 + vib) * t) + np.sin(2 * np.pi * (932 - vib) * t) * 0.8 + np.sin(2 * np.pi * 1318 * t) * 0.3) * b3 * 0.012
L += e; R += np.roll(e, 600)
# hallucination warble 53.5-59
hw = env_pts([(0, 0), (53.5, 0), (55, 0.7), (58.6, 1), (59, 0), (90, 0)])
wf = 300 + 120 * np.sin(2 * np.pi * 3.3 * t) + 60 * np.sin(2 * np.pi * 0.7 * t)
w = np.sin(2 * np.pi * np.cumsum(wf) / SR) * hw * 0.04
L += w * (0.5 + 0.5 * np.sin(2 * np.pi * 0.5 * t)); R += w * (0.5 - 0.5 * np.sin(2 * np.pi * 0.5 * t))
# clock ticks (counter 48-53.5 and hourglass 64.5-70)
for t0, t1, step in ((48.2, 53.4, 0.25), (64.6, 69.9, 0.5)):
    for i, tt in enumerate(np.arange(t0, t1, step)):
        n = int(0.03 * SR); tk = rs.standard_normal(n) * np.exp(-np.arange(n) / SR / 0.004)
        tk = np.convolve(tk, np.ones(3) / 3, 'same') * (0.05 if i % 2 else 0.035)
        add_at(L, tt, tk * 0.8); add_at(R, tt, tk)

# ---- chapter 4: bright pad + plucks ----
b4 = env_pts([(0, 0), (70, 0), (74, 0.6), (80, 1), (88, 1), (90, 0)])
for f, a in ((110, 1), (138.59, 0.8), (164.81, 0.8), (220, 0.6), (277.18, 0.4), (329.63, 0.35)):
    s = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * a * (1 + 0.2 * np.sin(2 * np.pi * 0.2 * t + f))
    L += s * b4 * 0.018; R += np.roll(s, 400) * b4 * 0.018
notes = [440, 554.37, 659.26, 493.88, 554.37, 659.26, 880, 659.26]
for i, tt in enumerate(np.arange(74, 89.2, 0.55)):
    f = notes[i % len(notes)]; n = int(1.6 * SR); tau = np.arange(n) / SR
    p = (np.sin(2 * np.pi * f * tau) + 0.25 * np.sin(2 * np.pi * 2 * f * tau) + 0.1 * np.sin(2 * np.pi * 3 * f * tau)) * np.exp(-tau / 0.45) * (1 - np.exp(-tau / 0.004))
    a = 0.035 * np.interp(tt, [74, 78, 88, 89.5], [0.3, 1, 1, 0.3])
    add_at(L, tt, p * a * (0.6 + 0.4 * (i % 2))); add_at(R, tt + 0.012, p * a * (1 - 0.4 * (i % 2)))

# ---- heartbeat ----
hb_amp_pts = [(0, 0.55), (8, 0.5), (26, 0.6), (48, 0.85), (70, 0.85), (78, 0.55), (88, 0.4), (90, 0.2)]
for b in beat_times():
    bpm = bpm_at(b); a = float(np.interp(b, *zip(*hb_amp_pts)))
    for off, f0, aa in ((0, 52, 1.0), (max(0.17, 0.33 * 60 / bpm), 64, 0.62)):
        n = int(0.35 * SR); tau = np.arange(n) / SR
        f = f0 + 40 * np.exp(-tau / 0.015)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tau / 0.085) * (1 - np.exp(-tau / 0.003))
        s = np.tanh(s * 2.2) / np.tanh(2.2)
        add_at(L, b + off, s * a * aa * 0.42); add_at(R, b + off, s * a * aa * 0.42)

# EEG monitor beeps then flatline (scene 42.5-48, flat at ~46.7)
for b in beat_times():
    if 42.7 < b < 46.5:
        n = int(0.09 * SR); tau = np.arange(n) / SR
        s = np.sin(2 * np.pi * 988 * tau) * np.minimum(1, (n - np.arange(n)) / 400) * 0.028
        add_at(L, b, s); add_at(R, b, s)
fl = env_pts([(0, 0), (46.6, 0), (46.7, 1), (47.6, 1), (47.85, 0), (90, 0)])
s = np.sin(2 * np.pi * 988 * t) * fl * 0.028
L += s; R += s

# ---- impacts & whooshes ----
def boom(at, amp):
    n = int(2.0 * SR); tau = np.arange(n) / SR
    f = 32 + 70 * np.exp(-tau / 0.06)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tau / 0.55)
    nb = fft_filter(rs.standard_normal(n), hi=900) * np.exp(-tau / 0.08)
    s = np.tanh((s + norm(nb) * 0.4) * 1.8) * amp
    add_at(L, at, s); add_at(R, at, s)

for at, a in ((0.0, 0.55), (8.0, 0.4), (26.0, 0.45), (48.0, 0.6), (70.0, 0.35)):
    boom(at, a)
scene_cuts = [3, 14, 20, 31.5, 37, 42.5, 53.5, 59, 64.5, 75, 79.5, 85]
for c in scene_cuts:
    n = int(0.7 * SR); tau = np.arange(n) / SR
    wsh = fft_filter(rs.standard_normal(n), lo=300, hi=3000)
    envw = np.sin(np.pi * tau / 0.7) ** 3
    s = norm(wsh) * envw * 0.045
    add_at(L, c - 0.45, s); add_at(R, c - 0.45, np.roll(s, 200))

# ---- voice ----
with wave.open(sys.argv[1]) as wf:
    v = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(float) / 32768
    if wf.getnchannels() == 2: v = v.reshape(-1, 2).mean(1)
v = v / (np.max(np.abs(v)) + 1e-9) * 0.75
# duck music under the voice
duck = 1 - 0.45 * env_pts([(0, 0), (0.2, 1), (2.8, 1), (3.3, 0), (90, 0)])
L *= duck; R *= duck
add_at(L, 0.25, v); add_at(R, 0.25, v)

# ---- master ----
fade = env_pts([(0, 1), (88.2, 1), (90, 0)])
L *= fade; R *= fade
st = np.stack([L, R], 1)
st = np.tanh(st * 1.15) / np.tanh(1.15)
st = st / np.max(np.abs(st)) * 0.92
with wave.open(sys.argv[2], 'w') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok')
