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
# SFX for «Паника»
# =====================================================================
def sfx_layer():
    rs = np.random.default_rng(7)
    L = np.zeros(N); R = np.zeros(N)
    def noise(n): return rs.standard_normal(n)
    # metro rumble (low filtered noise with clack rhythm), calm at start, back at dawn
    rum = fft_filter(noise(N), lo=30, hi=220); rum = norm(rum)
    clack = np.zeros(N)
    for tt in np.arange(0.4, 90, 1.15):
        for off in (0, 0.14):
            n = int(0.12 * SR); tau = np.arange(n) / SR
            add_at(clack, tt + off, fft_filter(noise(n), lo=200, hi=1500) * np.exp(-tau / 0.02) * 0.6)
    me = env_pts([(0, 0.0), (0.3, 1), (9.5, 0.9), (12, 0.25), (22, 0.1), (65, 0.1), (77, 0.4), (87, 0.6), (90, 0)])
    L += (rum * 0.09 + clack * 0.05) * me; R += (np.roll(rum, 800) * 0.09 + np.roll(clack, 300) * 0.05) * me
    # door chime + doors closing
    for at, f in ((4.35, 880), (4.75, 698.5)):
        n = int(0.9 * SR); tau = np.arange(n) / SR
        s = (np.sin(2 * np.pi * f * tau) + 0.3 * np.sin(2 * np.pi * 2 * f * tau)) * np.exp(-tau / 0.35) * 0.06
        add_at(L, at, s); add_at(R, at, s)
    n = int(0.5 * SR); tau = np.arange(n) / SR
    thud = (np.sin(2 * np.pi * (60 + 80 * np.exp(-tau / 0.02)) * tau) * np.exp(-tau / 0.09) + fft_filter(noise(n), hi=2000) * np.exp(-tau / 0.03) * 0.5) * 0.18
    add_at(L, 5.6, thud); add_at(R, 5.6, thud)
    # heartbeat follows the pulse curve
    hb_amp_pts = [(0, 0.45), (4, 0.5), (16, 0.6), (22, 0.75), (46, 0.9), (65, 0.9), (73, 0.6), (80, 0.45), (90, 0.3)]
    for b in beat_times():
        bpm = bpm_at(b); a = float(np.interp(b, *zip(*hb_amp_pts)))
        for off, f0, aa in ((0, 52, 1.0), (max(0.17, 0.33 * 60 / bpm), 64, 0.62)):
            n = int(0.35 * SR); tau = np.arange(n) / SR
            f = f0 + 40 * np.exp(-tau / 0.015)
            s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tau / 0.085) * (1 - np.exp(-tau / 0.003))
            s = np.tanh(s * 2.2) / np.tanh(2.2)
            add_at(L, b + off, s * a * aa * 0.42); add_at(R, b + off, s * a * aa * 0.42)
    # fast breathing during ТЕЛО
    tt = 27.6
    while tt < 45.8:
        rate = np.interp(tt, [27.5, 46], [1.1, 0.6])
        for off, d, a in ((0, rate * 0.45, 0.05), (rate * 0.5, rate * 0.45, 0.06)):
            n = int(d * SR); tau = np.arange(n) / SR
            s = fft_filter(noise(n), lo=500, hi=3500) * np.sin(np.pi * tau / d) ** 2 * a
            add_at(L, tt + off, s); add_at(R, tt + off, s)
        tt += rate
    # slow breath in the exhale scene (inhale 2 s, exhale 3 s, cycle starts at 77.8)
    for c0 in (77.8, 82.8):
        for off, d, a, hi in ((0, 2.0, 0.04, 3000), (2.0, 3.0, 0.06, 1800)):
            n = int(d * SR); tau = np.arange(n) / SR
            s = fft_filter(noise(n), lo=200, hi=hi) * np.sin(np.pi * tau / d) ** 1.5 * a
            add_at(L, c0 + off, s); add_at(R, c0 + off, s)
    # clock ticks
    for i, tt in enumerate(np.arange(65.2, 70.9, 0.5)):
        n = int(0.03 * SR); tk = noise(n) * np.exp(-np.arange(n) / SR / 0.004)
        tk = np.convolve(tk, np.ones(3) / 3, 'same') * (0.06 if i % 2 else 0.045)
        add_at(L, tt, tk * 0.8); add_at(R, tt, tk)
    # impacts and whooshes
    def boom(at, amp):
        n = int(2.0 * SR); tau = np.arange(n) / SR
        f = 32 + 70 * np.exp(-tau / 0.06)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tau / 0.55)
        nb = fft_filter(noise(n), hi=900) * np.exp(-tau / 0.08)
        s = np.tanh((s + norm(nb) * 0.4) * 1.8) * amp
        add_at(L, at, s); add_at(R, at, s)
    for at, a in ((0.0, 0.3), (4.0, 0.35), (16.0, 0.5), (22.0, 0.55), (46.0, 0.6), (65.0, 0.35)):
        boom(at, a)
    for c in [9.5, 27.5, 33.5, 40, 52, 58.5, 71, 77, 83, 87]:
        n = int(0.7 * SR); tau = np.arange(n) / SR
        s = norm(fft_filter(noise(n), lo=300, hi=3000)) * np.sin(np.pi * tau / 0.7) ** 3 * 0.045
        add_at(L, c - 0.45, s); add_at(R, c - 0.45, np.roll(s, 200))
    return L, R


exec(open(__file__.replace('music_panic.py', 'score_panic.py')).read())
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
    pts.append((90, 0))
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
fade = env_pts([(0, 1), (88.7, 1), (90, 0)])
L *= fade; R *= fade
st = np.stack([L, R], 1)
st = np.tanh(st * 1.15) / np.tanh(1.15)
st = st / np.max(np.abs(st)) * 0.92
with wave.open(sys.argv[1], 'w') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok')
