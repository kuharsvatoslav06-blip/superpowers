# Cinematic score (strings, piano, taiko) + the original SFX layer unchanged.
import sys, wave
import numpy as np
from timeline import beat_times, bpm_at

SR = 44100
DUR = 96.0
N = int(SR * DUR)
t = np.arange(N) / SR


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
    if i >= len(buf) or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[:j - i]


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)


# =====================================================================
# SFX for «Паника»
# =====================================================================
def sfx_layer():
    rs = np.random.default_rng(7)
    L = np.zeros(N); R = np.zeros(N)
    def noise(n): return rs.standard_normal(n)
    def both(at, s, pan=0.5): add_at(L, at, s * (1 - pan) * 1.4); add_at(R, at, s * pan * 1.4)
    # phone vibration (3.5-7.5)
    for tt in np.arange(3.4, 7.6, 0.67):
        n = int(0.4 * SR); tau = np.arange(n) / SR
        both(tt, np.sign(np.sin(2 * np.pi * 150 * tau)) * np.sin(2 * np.pi * 9 * tau) ** 2 * 0.035, 0.7)
    # alarm clock ringing (8.3-10.7)
    n = int(2.4 * SR); tau = np.arange(n) / SR
    ring = np.sin(2 * np.pi * 2100 * tau) * (np.sin(2 * np.pi * 14 * tau) > 0) * np.minimum(1, (2.4 - tau) / 0.1) * 0.035
    both(8.3, ring, 0.7)
    # messenger: incoming dings, typing taps, send swoosh
    for at in (50.5, 51.0):
        n = int(0.5 * SR); tau = np.arange(n) / SR; both(at, (np.sin(2 * np.pi * 1320 * tau) + 0.5 * np.sin(2 * np.pi * 1760 * tau)) * np.exp(-tau / 0.12) * 0.05)
    for tt in np.arange(51.4, 53.0, 0.09):
        n = int(0.02 * SR); both(tt + rs.random() * 0.03, fft_filter(noise(n), lo=2000) * np.exp(-np.arange(n) / SR / 0.003) * 0.03)
    n = int(0.35 * SR); tau = np.arange(n) / SR; both(53.1, fft_filter(noise(n), lo=1500, hi=6000) * np.sin(np.pi * tau / 0.35) ** 2 * 0.06)
    # stamp «СИМПТОМ»
    n = int(0.6 * SR); tau = np.arange(n) / SR
    both(64.0, (np.sin(2 * np.pi * (70 + 60 * np.exp(-tau / 0.02)) * tau) * np.exp(-tau / 0.12) + fft_filter(noise(n), hi=2500) * np.exp(-tau / 0.03) * 0.6) * 0.3)
    # curtains swoosh
    n = int(1.6 * SR); tau = np.arange(n) / SR; both(72.4, fft_filter(noise(n), lo=400, hi=4000) * np.sin(np.pi * tau / 1.6) ** 2 * 0.05)
    # birds + footsteps on the walk
    for i, at in enumerate(np.arange(84.3, 89.8, 0.7)):
        n = int(0.25 * SR); tau = np.arange(n) / SR; f = 3200 + 900 * np.sin(2 * np.pi * 12 * tau) + rs.random() * 600
        both(at + rs.random() * 0.3, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tau / 0.25) * 0.02, 0.3 + 0.4 * (i % 2))
    for tt in np.arange(84.2, 89.9, 0.63):
        n = int(0.12 * SR); tau = np.arange(n) / SR; both(tt, fft_filter(noise(n), lo=150, hi=1500) * np.exp(-tau / 0.03) * 0.08)
    # slow, muffled heartbeat
    for b in beat_times():
        a = float(np.interp(b, [0, 26, 50, 72, 80, 96], [0.35, 0.4, 0.55, 0.55, 0.35, 0.3]))
        for off, f0, aa in ((0, 50, 1.0), (0.3, 60, 0.6)):
            n = int(0.35 * SR); tau = np.arange(n) / SR
            f = f0 + 30 * np.exp(-tau / 0.015)
            s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tau / 0.1) * (1 - np.exp(-tau / 0.004))
            add_at(L, b + off, s * a * aa * 0.4); add_at(R, b + off, s * a * aa * 0.4)
    def boom(at, amp):
        n = int(2.0 * SR); tau = np.arange(n) / SR
        f = 32 + 70 * np.exp(-tau / 0.06)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tau / 0.55)
        nb = fft_filter(noise(n), hi=900) * np.exp(-tau / 0.08)
        s = np.tanh((s + norm(nb) * 0.4) * 1.8) * amp
        add_at(L, at, s); add_at(R, at, s)
    for at, a in ((0.0, 0.45), (8.0, 0.35), (26.0, 0.45), (50.0, 0.5), (72.0, 0.3)):
        boom(at, a)
    for c in [3, 14, 20, 32, 38, 44, 55.5, 61, 66.5, 77.5, 84, 90]:
        n = int(0.7 * SR); tau = np.arange(n) / SR
        s = norm(fft_filter(noise(n), lo=300, hi=3000)) * np.sin(np.pi * tau / 0.7) ** 3 * 0.045
        add_at(L, c - 0.45, s); add_at(R, c - 0.45, np.roll(s, 200))
    return L, R


exec(open(__file__.replace('music_dep.py', 'score_dep.py')).read())
pump = 1 - 0.4 * np.exp(-(t % BEAT) / 0.11)
SL *= pump; SR_ *= pump

# --- strings bus: darken, reverb on everything ---
SL = fft_filter(SL, lo=35, hi=3200); SR_ = fft_filter(SR_, lo=35, hi=3200)
PL = fft_filter(PL, hi=6000); PR = fft_filter(PR, hi=6000)


def reverb(x, seed, length=2.8):
    r = np.random.default_rng(seed); n = int(length * SR); tau = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-tau / (length / 6.5)); ir = fft_filter(ir, hi=5000) if False else ir
    ir[:int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR)); ir /= np.sqrt(np.sum(ir ** 2))
    m = len(x) + n; nf = 1 << (m - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[:len(x)]
    return fft_filter(y, hi=4500)


mL = SL * 1.0 + PL * 1.0 + KL * 0.9
mR = SR_ * 1.0 + PR * 1.0 + KR * 0.9
wetL = reverb(SL * 0.8 + PL + KL * 0.5, 1); wetR = reverb(SR_ * 0.8 + PR + KR * 0.5, 2)
mL = mL + wetL * 0.35; mR = mR + wetR * 0.35
mL = np.tanh(mL / np.max(np.abs(mL)) * 2.2) / np.tanh(2.2); mR = np.tanh(mR / np.max(np.abs(mR)) * 2.2) / np.tanh(2.2)
scale = 0.5 / max(np.max(np.abs(mL)), np.max(np.abs(mR)))
mL *= scale; mR *= scale
xL, xR = sfx_layer()
# ---- narration (optional): out.wav nar.wav spans.json target_dB ----
if len(sys.argv) > 3:
    import json
    spans = json.load(open(sys.argv[3]))
    act = np.zeros(N, bool)
    pts = [(0, 0)]
    for a_, b_ in spans:
        pts += [(a_ - 0.25, 0), (a_ - 0.05, 1), (b_ + 0.2, 1), (b_ + 0.5, 0)]
        act[int(a_ * SR):int(b_ * SR)] = True
    pts.append((DUR, 0))
    g = np.clip(env_pts(pts), 0, 1)
    mL *= 1 - 0.1 * g; mR *= 1 - 0.1 * g
    xL *= 1 - 0.25 * g; xR *= 1 - 0.25 * g
    with wave.open(sys.argv[2]) as wf:
        nar = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(float) / 32768
    nar = np.pad(nar, (0, max(0, N - len(nar))))[:N]
    target = float(sys.argv[4]) if len(sys.argv) > 4 else 2.0
    bgr = (mL + xL)[act]; vv = nar[act]
    nar *= 10 ** (target / 20) * np.sqrt((bgr ** 2).mean()) / np.sqrt((vv ** 2).mean())
    xL += nar; xR += nar

L = mL + xL; R = mR + xR
fade = env_pts([(0, 1), (94.7, 1), (96, 0)])
L *= fade; R *= fade
st = np.stack([L, R], 1)
st = np.tanh(st * 1.15) / np.tanh(1.15)
st = st / np.max(np.abs(st)) * 0.92
with wave.open(sys.argv[1], 'w') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok')
