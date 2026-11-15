# Cinematic score (strings, piano, taiko) + the original SFX layer unchanged.
import sys, wave
import numpy as np
from timeline import beat_times, bpm_at

SR = 44100
DUR = 90.0
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
# SFX layer — identical to the previous version (same seed and order)
# =====================================================================
def sfx_layer(voice):
    rs = np.random.default_rng(7)
    L = np.zeros(N); R = np.zeros(N)
    # consume RNG exactly like the old script so noises are identical
    rs.standard_normal(N)            # old sub rumble
    rs.standard_normal(N)            # old ch2 noise
    for t0, t1, step in ((48.2, 53.4, 0.25), (64.6, 69.9, 0.5)):
        for i, tt in enumerate(np.arange(t0, t1, step)):
            n = int(0.03 * SR); tk = rs.standard_normal(n) * np.exp(-np.arange(n) / SR / 0.004)
            tk = np.convolve(tk, np.ones(3) / 3, 'same') * (0.05 if i % 2 else 0.035)
            add_at(L, tt, tk * 0.8); add_at(R, tt, tk)
    hb_amp_pts = [(0, 0.55), (8, 0.5), (26, 0.6), (48, 0.85), (70, 0.85), (78, 0.55), (88, 0.4), (90, 0.2)]
    for b in beat_times():
        bpm = bpm_at(b); a = float(np.interp(b, *zip(*hb_amp_pts)))
        for off, f0, aa in ((0, 52, 1.0), (max(0.17, 0.33 * 60 / bpm), 64, 0.62)):
            n = int(0.35 * SR); tau = np.arange(n) / SR
            f = f0 + 40 * np.exp(-tau / 0.015)
            s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tau / 0.085) * (1 - np.exp(-tau / 0.003))
            s = np.tanh(s * 2.2) / np.tanh(2.2)
            add_at(L, b + off, s * a * aa * 0.42); add_at(R, b + off, s * a * aa * 0.42)
    for b in beat_times():
        if 42.7 < b < 46.5:
            n = int(0.09 * SR); tau = np.arange(n) / SR
            s = np.sin(2 * np.pi * 988 * tau) * np.minimum(1, (n - np.arange(n)) / 400) * 0.028
            add_at(L, b, s); add_at(R, b, s)
    fl = env_pts([(0, 0), (46.6, 0), (46.7, 1), (47.6, 1), (47.85, 0), (90, 0)])
    s = np.sin(2 * np.pi * 988 * t) * fl * 0.028
    L += s; R += s

    def boom(at, amp):
        n = int(2.0 * SR); tau = np.arange(n) / SR
        f = 32 + 70 * np.exp(-tau / 0.06)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tau / 0.55)
        nb = fft_filter(rs.standard_normal(n), hi=900) * np.exp(-tau / 0.08)
        s = np.tanh((s + norm(nb) * 0.4) * 1.8) * amp
        add_at(L, at, s); add_at(R, at, s)
    for at, a in ((0.0, 0.55), (8.0, 0.4), (26.0, 0.45), (48.0, 0.6), (70.0, 0.35)):
        boom(at, a)
    for c in [3, 14, 20, 31.5, 37, 42.5, 53.5, 59, 64.5, 75, 79.5, 85]:
        n = int(0.7 * SR); tau = np.arange(n) / SR
        wsh = fft_filter(rs.standard_normal(n), lo=300, hi=3000)
        envw = np.sin(np.pi * tau / 0.7) ** 3
        s = norm(wsh) * envw * 0.045
        add_at(L, c - 0.45, s); add_at(R, c - 0.45, np.roll(s, 200))
    add_at(L, 0.25, voice); add_at(R, 0.25, voice)
    return L, R



exec(open(__file__.replace('music3.py', 'score_synth.py')).read())
# sidechain-style pumping on pad+bass, quarter notes
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
scale = 0.5 / max(np.max(np.abs(mL)), np.max(np.abs(mR)))
mL *= scale; mR *= scale
duck = 1 - 0.45 * env_pts([(0, 0), (0.2, 1), (2.8, 1), (3.3, 0), (90, 0)])
mL *= duck; mR *= duck

# ---- voice + sfx ----
with wave.open(sys.argv[1]) as wf:
    v = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(float) / 32768
    if wf.getnchannels() == 2: v = v.reshape(-1, 2).mean(1)
v = v / (np.max(np.abs(v)) + 1e-9) * 0.75
xL, xR = sfx_layer(v)

# ---- narration (optional) ----
if len(sys.argv) > 4:
    import json
    spans = json.load(open(sys.argv[4]))
    act = np.zeros(N, bool)
    pts = [(0, 0)]
    for a, b in spans:
        pts += [(a - 0.25, 0), (a - 0.05, 1), (b + 0.2, 1), (b + 0.5, 0)]
        act[int(a * SR):int(b * SR)] = True
    pts.append((90, 0))
    g = np.clip(env_pts(pts), 0, 1)
    mL *= 1 - 0.25 * g; mR *= 1 - 0.25 * g
    xL *= 1 - 0.25 * g; xR *= 1 - 0.25 * g
    with wave.open(sys.argv[3]) as wf:
        nar = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(float) / 32768
    nar = np.pad(nar, (0, max(0, N - len(nar))))[:N]
    hook = np.zeros(N); add_at(hook, 0.25, v)
    def arms(x): x = x[np.abs(x) > 0.02]; return np.sqrt((x ** 2).mean())
    nar *= arms(hook) / arms(nar)
    bg = (mL + xL)[act]; vv = nar[act]
    print('voice/bg dB before', 20*np.log10(np.sqrt((vv**2).mean())/np.sqrt((bg**2).mean())))
    target = float(sys.argv[5]) if len(sys.argv) > 5 else 9.0
    k = 10 ** (target / 20) * np.sqrt((bg ** 2).mean()) / np.sqrt((vv ** 2).mean())
    nar *= k
    xL += nar; xR += nar
    # bring the opening line to the same voice/bed ratio
    ha = np.abs(hook) > 0.02
    hb = (mL + xL - hook)[ha]
    kh = 10 ** (target / 20) * np.sqrt((hb ** 2).mean()) / np.sqrt((hook[ha] ** 2).mean())
    print('hook gain', kh, 'nar gain', k)
    if kh > 1: xL += hook * (kh - 1); xR += hook * (kh - 1)

L = mL + xL; R = mR + xR
fade = env_pts([(0, 1), (88.7, 1), (90, 0)])
L *= fade; R *= fade
st = np.stack([L, R], 1)
st = np.tanh(st * 1.15) / np.tanh(1.15)
st = st / np.max(np.abs(st)) * 0.92
with wave.open(sys.argv[2], 'w') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok')
