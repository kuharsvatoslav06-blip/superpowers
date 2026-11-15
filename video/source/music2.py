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


# =====================================================================
# Score
# =====================================================================
rs = np.random.default_rng(2026)
TAB = 4096
_ph = np.arange(TAB) / TAB
SAW = sum(np.sin(2 * np.pi * k * _ph) / k ** 1.15 for k in range(1, 40))
SAW /= np.max(np.abs(SAW))


def osc(freq, n, table=SAW, vib=0.0, vib_rate=5.2, phase0=0.0):
    tau = np.arange(n) / SR
    f = freq * (1 + vib * np.sin(2 * np.pi * vib_rate * tau + rs.random() * 6.28))
    ph = (phase0 + np.cumsum(f) / SR) % 1.0
    idx = ph * TAB
    i0 = idx.astype(int) % TAB
    fr = idx - np.floor(idx)
    return table[i0] * (1 - fr) + table[(i0 + 1) % TAB] * fr


SL = np.zeros(N); SR_ = np.zeros(N)       # strings
PL = np.zeros(N); PR = np.zeros(N)        # piano
KL = np.zeros(N); KR = np.zeros(N)        # percussion


def string_note(m, t0, t1, amp, att=0.8, rel=1.2, pan=0.5, voices=3, vib=0.004, bend=None):
    n = int((t1 - t0 + rel) * SR)
    tau = np.arange(n) / SR
    e = np.minimum(1, tau / att) ** 1.5 * np.where(tau < t1 - t0, 1, np.exp(-(tau - (t1 - t0)) / (rel / 3)))
    s = np.zeros(n)
    for v in range(voices):
        det = 1 + (v - (voices - 1) / 2) * 0.0035
        f = hz(m) * det
        if bend is not None: f = f * bend(t0 + tau)
        if np.ndim(f):
            ph = (rs.random() + np.cumsum(f * (1 + vib * np.sin(2 * np.pi * 5.1 * tau + v))) / SR) % 1
            idx = ph * TAB; i0 = idx.astype(int) % TAB; fr = idx - np.floor(idx)
            s += SAW[i0] * (1 - fr) + SAW[(i0 + 1) % TAB] * fr
        else:
            s += osc(f, n, vib=vib, phase0=rs.random())
    s *= e * amp / voices
    add_at(SL, t0, s * (1 - pan) * 2 ** 0.5); add_at(SR_, t0, s * pan * 2 ** 0.5)


def chord_strings(notes, t0, t1, amp, att=1.0, rel=1.5):
    for i, m in enumerate(notes):
        pan = 0.25 + 0.5 * i / max(1, len(notes) - 1)
        string_note(m, t0, t1, amp * (1.2 if i == 0 else 1), att, rel, pan)


def spiccato(m, at, amp, dur=0.16, pan=0.5):
    n = int((dur + 0.15) * SR); tau = np.arange(n) / SR
    e = (1 - np.exp(-tau / 0.008)) * np.exp(-tau / (dur * 0.45))
    s = (osc(hz(m), n) + osc(hz(m) * 1.004, n)) * 0.5 * e * amp
    add_at(SL, at, s * (1 - pan) * 1.4); add_at(SR_, at, s * pan * 1.4)


def tremolo(notes, t0, t1, amp, rate=11, att=1.5):
    for m in notes:
        n = int((t1 - t0 + 1.0) * SR); tau = np.arange(n) / SR
        e = np.minimum(1, tau / att) * np.where(tau < t1 - t0, 1, np.exp(-(tau - (t1 - t0)) / 0.3))
        trem = 0.55 + 0.45 * np.abs(np.sin(np.pi * rate * tau + rs.random()))
        s = osc(hz(m), n, vib=0.006) * e * trem * amp
        add_at(SL, t0, s * 0.8); add_at(SR_, t0, s * 1.1)


def piano(m, at, amp, length=3.5, pan=0.5):
    f0 = hz(m); n = int(length * SR); tau = np.arange(n) / SR
    B = 0.0004; s = np.zeros(n)
    dec = 2.2 * (440 / f0) ** 0.35
    for k in range(1, 9):
        fk = f0 * k * np.sqrt(1 + B * k * k)
        if fk > 9000: break
        ak = (1 / k ** 1.4) * (1.0 if k > 1 else 1.3)
        s += ak * np.sin(2 * np.pi * fk * tau + rs.random()) * np.exp(-tau / (dec / k ** 0.6))
    s += 0.12 * np.sin(2 * np.pi * f0 * tau) * np.exp(-tau / (dec * 2.5))
    s *= (1 - np.exp(-tau / 0.002))
    hn = int(0.01 * SR); s[:hn] += rs.standard_normal(hn) * np.exp(-np.arange(hn) / SR / 0.002) * 0.08
    s *= amp * np.minimum(1, (n - np.arange(n)) / 2000)
    add_at(PL, at, s * (1 - pan) * 1.4); add_at(PR, at, s * pan * 1.4)


def taiko(at, amp, pitch=55):
    n = int(1.4 * SR); tau = np.arange(n) / SR
    f = pitch + 60 * np.exp(-tau / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tau / 0.32)
    nb = fft_filter(rs.standard_normal(n), lo=80, hi=1200) * np.exp(-tau / 0.03)
    s = np.tanh((s + norm(nb) * 0.5) * 1.6) * amp
    add_at(KL, at, s); add_at(KR, at + 0.004, s)


def riser(t0, t1, amp):
    n = int((t1 - t0) * SR); tau = np.arange(n) / SR
    for m0 in (50, 57, 62, 69):
        f = hz(m0) * 2 ** (tau / (t1 - t0) * (12 / 12))
        ph = np.cumsum(f) / SR % 1; idx = ph * TAB; i0 = idx.astype(int) % TAB
        s = SAW[i0] * (tau / (t1 - t0)) ** 2.2 * amp
        add_at(SL, t0, s); add_at(SR_, t0, s)


D, Bb, F, C, Gm, A = ([38, 50, 53, 57, 62], [34, 46, 50, 53, 58], [41, 53, 57, 60, 65],
                      [36, 48, 52, 55, 60], [31, 43, 46, 50, 55], [33, 45, 49, 52, 57])

# --- 0-3 hook: low swell under the voice ---
chord_strings([26, 38, 45], 0.0, 3.0, 0.10, att=1.2, rel=1.2)
piano(26, 0.05, 0.35, 5)
# --- 3-8: piano motif over soft Dm ---
chord_strings([38, 50, 57], 3.0, 8.0, 0.07, att=1.5, rel=1.0)
for at, m in ((3.3, 69), (4.0, 65), (4.7, 64), (5.4, 62), (6.4, 57), (7.1, 60)):
    piano(m, at, 0.22, 4, pan=0.6)
piano(38, 3.3, 0.18, 5, 0.4)

# --- Chapter 1 (8-26): sad Dm-Bb-F-C, piano melody ---
prog1 = [(8, D), (12.5, Bb), (17, F), (21.5, C)]
mel1 = {8: [(0, 69), (1.5, 74), (2.25, 72), (3.0, 69)], 12.5: [(0, 70), (1.5, 74), (2.25, 77), (3.0, 74)],
        17: [(0, 72), (1.5, 69), (2.25, 65), (3.0, 69)], 21.5: [(0, 67), (1.5, 64), (2.25, 72), (3.0, 67)]}
for i, (t0, ch) in enumerate(prog1):
    chord_strings(ch, t0, t0 + 4.5, 0.075 + i * 0.01, att=1.2, rel=1.6)
    piano(ch[0] + 12, t0, 0.2, 4.5, 0.4)
    for off, m in mel1[t0]:
        piano(m, t0 + off, 0.24, 4, 0.62)
string_note(81, 17, 26, 0.03, att=3, rel=1.5, pan=0.7)   # high violin line
string_note(79, 21.5, 26, 0.03, att=2, rel=1.0, pan=0.7)

# --- Chapter 2 (26-48): ostinato build, taiko, crescendo, cut at 47.7 ---
bar = 2.75; beat = bar / 4; s16 = beat / 4
prog2 = [D, Bb, Gm, A, D, Bb, Gm, A]
for b, ch in enumerate(prog2):
    t0 = 26 + b * bar
    g = 0.35 + 0.65 * b / 7
    chord_strings(ch[1:], t0, t0 + bar, 0.05 + 0.05 * g, att=0.4 if b else 0.1, rel=0.4)
    string_note(ch[0], t0, t0 + bar, 0.10 * g + 0.04, att=0.2, rel=0.3, pan=0.45)
    pat = [0, 0, 12, 0, 0, 12, 7, 0, 0, 0, 12, 0, 7, 12, 7, 0]
    for k in range(16):
        tk = t0 + k * s16
        if tk >= 47.6: break
        spiccato(ch[0] + 12 + pat[k], tk, (0.07 + 0.09 * g) * (1.3 if k % 4 == 0 else 1), pan=0.35 + 0.3 * (k % 2))
    # taiko
    hits = [0, 2] if b < 2 else [0, 1.5, 2, 3] if b < 6 else [0, 1, 1.5, 2, 2.5, 3, 3.25, 3.5, 3.75]
    for h in hits:
        th = t0 + h * beat
        if th < 47.6: taiko(th, 0.25 + 0.35 * g, 50 if h == 0 else 62)
    if b >= 4:  # high violins
        string_note(ch[-1] + 12, t0, t0 + bar, 0.025 + 0.03 * g, att=0.5, rel=0.3, pan=0.7)
riser(41, 47.65, 0.05)
for k in range(12):  # final taiko roll
    taiko(46.0 + k * 0.13, 0.25 + k * 0.04, 70)

# --- Chapter 3 (48-70): dark, tense ---
string_note(26, 48, 70, 0.13, att=1.0, rel=1.5, pan=0.5)          # D1 pedal
string_note(38, 48, 70, 0.08, att=2.0, rel=1.5, pan=0.4)
tremolo([74, 75], 49, 53.5, 0.018)                                # D5/Eb5 tremolo
for k in range(int((70 - 48.3) / (beat))):                         # slow pulse
    tk = 48.3 + k * beat
    spiccato(38 if k % 4 != 3 else 39, tk, 0.10, dur=0.22, pan=0.5)
for at in (48.3, 51.05, 53.8, 59.3, 62.05, 64.8, 67.55):
    piano(26, at, 0.3, 4, 0.45); piano(27, at + 0.02, 0.22, 4, 0.55)
# hallucination: bending strings
bend = lambda tt: 2 ** ((0.9 * np.sin(2 * np.pi * 0.6 * tt) + 0.5 * np.sin(2 * np.pi * 1.7 * tt)) / 12)
for m, p in ((62, 0.3), (65, 0.7), (69, 0.5), (74, 0.6)):
    string_note(m, 53.5, 59, 0.04, att=1.8, rel=0.6, pan=p, bend=bend)
# age + hourglass: rising tension
chord_strings([50, 53, 56], 59, 64.5, 0.05, att=2, rel=0.8)
chord_strings([50, 53, 56, 63], 64.5, 70, 0.06, att=2, rel=0.6)
tremolo([81, 82], 64.5, 69.8, 0.016, rate=14, att=4)
riser(66, 69.8, 0.035)

# --- Chapter 4 (70-90): bright F major, piano melody ---
prog4 = [(70, F), (74.5, C), (79, [38, 50, 53, 57, 62]), (83.5, Bb)]
mel4 = {70: [(0.3, 69), (1.2, 72), (2.1, 77), (3.0, 76)], 74.5: [(0, 76), (0.9, 79), (1.8, 76), (2.7, 74)],
        79: [(0, 77), (0.9, 74), (1.8, 69), (2.7, 72)], 83.5: [(0, 74), (0.9, 77), (1.8, 70), (2.7, 74)]}
for i, (t0, ch) in enumerate(prog4):
    chord_strings(ch, t0, t0 + 4.5, 0.06 + 0.012 * i, att=1.5 if i == 0 else 0.9, rel=1.6)
    piano(ch[0] + 12, t0, 0.2, 4.5, 0.4)
    for k in range(6):  # gentle arpeggio
        piano(ch[1 + k % 4] + 12, t0 + 0.75 * k + 0.375, 0.08, 2.5, 0.55)
    for off, m in mel4[t0]:
        piano(m, t0 + off, 0.25, 4, 0.62)
string_note(77, 79, 88, 0.03, att=3, rel=1.5, pan=0.7)
chord_strings(F, 88, 90, 0.07, att=0.5, rel=1.0)
piano(65, 88.0, 0.28, 3, 0.6); piano(53, 88.0, 0.2, 3, 0.4); piano(41, 88.0, 0.2, 3, 0.4)

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
scale = 0.38 / max(np.max(np.abs(mL)), np.max(np.abs(mR)))
mL *= scale; mR *= scale
duck = 1 - 0.45 * env_pts([(0, 0), (0.2, 1), (2.8, 1), (3.3, 0), (90, 0)])
mL *= duck; mR *= duck

# ---- voice + sfx ----
with wave.open(sys.argv[1]) as wf:
    v = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(float) / 32768
    if wf.getnchannels() == 2: v = v.reshape(-1, 2).mean(1)
v = v / (np.max(np.abs(v)) + 1e-9) * 0.75
xL, xR = sfx_layer(v)

L = mL + xL; R = mR + xR
fade = env_pts([(0, 1), (88.2, 1), (90, 0)])
L *= fade; R *= fade
st = np.stack([L, R], 1)
st = np.tanh(st * 1.15) / np.tanh(1.15)
st = st / np.max(np.abs(st)) * 0.92
with wave.open(sys.argv[2], 'w') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok')
