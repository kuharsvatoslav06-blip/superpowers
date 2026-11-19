# Dark synth score in the style of the reference: 120 BPM, D minor,
# pumping 8th-note bass, triplet plucks, bar-long bell arps, gliding lead,
# hats/claps in the build, breakdown during the hallucination scene.
rs = np.random.default_rng(2026)
TAB = 4096
_ph = np.arange(TAB) / TAB
SAW = sum(np.sin(2 * np.pi * k * _ph) / k for k in range(1, 48)); SAW /= np.max(np.abs(SAW))
SQR = sum(np.sin(2 * np.pi * k * _ph) / k for k in range(1, 48, 2)); SQR /= np.max(np.abs(SQR))

SL = np.zeros(N); SR_ = np.zeros(N)   # pads + bass (gets 3.2k lowpass later)
PL = np.zeros(N); PR = np.zeros(N)    # plucks, bells, lead
KL = np.zeros(N); KR = np.zeros(N)    # drums

BPM = 120; BEAT = 60 / BPM; BAR = 4 * BEAT; S16 = BEAT / 4


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)


def wt(table, f, n, ph0=None):
    ph = ((rs.random() if ph0 is None else ph0) + np.cumsum(np.broadcast_to(f, (n,))) / SR) % 1
    idx = ph * TAB; i0 = idx.astype(int) % TAB; fr = idx - np.floor(idx)
    return table[i0] * (1 - fr) + table[(i0 + 1) % TAB] * fr


def lp_short(x, cut):
    """lowpass for short notes (FFT, zero padded)"""
    n = len(x); nf = 1 << (n + 2048 - 1).bit_length()
    X = np.fft.rfft(x, nf); f = np.fft.rfftfreq(nf, 1 / SR)
    return np.fft.irfft(X / (1 + (f / cut) ** 4), nf)[:n]


def put(bufL, bufR, at, s, pan=0.5):
    add_at(bufL, at, s * np.sqrt(1 - pan) * 1.41); add_at(bufR, at, s * np.sqrt(pan) * 1.41)


# --- section intensities (0..1) ---
def k(pts, x): xs, ys = zip(*pts); return float(np.interp(x, xs, ys))
BASS_ON = [(0, 0.45), (4, 0.6), (16, 0.75), (22, 0.9), (46, 1.0), (46.1, 0.8), (65, 0.7), (67, 0.45), (71, 0.2), (73, 0), (90, 0)]
BASS_CUT = [(0, 300), (16, 420), (22, 700), (40, 1300), (46, 800), (65, 700), (73, 500), (90, 500)]
ARP_ON = [(0, 0), (4, 0), (4.01, 0.5), (22, 0.8), (46, 1), (65, 0.8), (71, 0.4), (74, 0.15), (90, 0.1)]
ARP_CUT = [(0, 900), (16, 1200), (22, 1800), (46, 3500), (46.1, 1600), (65, 1400), (75, 1100), (90, 1100)]
BELL_ON = [(0, 0.5), (22, 0.7), (46, 0.8), (65, 0.7), (72, 0.9), (90, 0.9)]
HAT_ON = [(0, 0), (4, 0), (4.01, 0.25), (16, 0.4), (22, 0.6), (46, 1), (46.1, 0.5), (65, 0.4), (70, 0), (90, 0)]
CLAP_ON = [(0, 0), (27.5, 0), (27.51, 0.7), (46, 1), (46.1, 0), (90, 0)]

# chord per bar (root midi of bass, triad tones for arp/pad)
DM, BB, C, A_, F, GM = (38, [62, 65, 69]), (34, [58, 62, 65]), (36, [60, 64, 67]), (33, [57, 61, 64]), (41, [65, 69, 72]), (31, [55, 58, 62])
def chord_at(tt):
    if tt < 22:  prog = [DM, DM, BB, C]
    elif tt < 46: prog = [DM, BB, C, A_]
    elif tt < 65: prog = [DM, BB, GM, A_]
    else: prog = [F, C, BB, F]
    return prog[int(tt // BAR) % len(prog)]


# ---- bass: pumping 8ths (16ths in builds) ----
tt = 0.0
while tt < 90:
    on = k(BASS_ON, tt)
    sixteenth = (16 <= tt < 22) or (33.5 <= tt < 46)
    step = S16 if sixteenth else BEAT / 2
    if on > 0:
        root, _ = chord_at(tt)
        pos = round((tt % BAR) / step)
        m = root + (12 if (pos % 4 == 3 and not sixteenth) else 0)
        dur = step * 0.9; n = int((dur + 0.05) * SR); tau = np.arange(n) / SR
        s = 0.6 * wt(SAW, hz(m), n) + 0.5 * wt(SQR, hz(m) / 2, n) + 0.35 * np.sin(2 * np.pi * hz(m - 12) * tau)
        cut = k(BASS_CUT, tt)
        s = lp_short(s, cut) * 0.65 + lp_short(s, cut * 3) * 0.35 * np.exp(-tau / 0.04)
        e = (1 - np.exp(-tau / 0.004)) * np.exp(-tau / (dur * 0.7))
        acc = 1.0 if pos % 2 == 0 else 0.75
        put(SL, SR_, tt, s * e * on * acc * 0.32, 0.5)
    tt += step

def lerp_cut(x): return float(np.interp(x, [0, 22, 46, 65, 72, 90], [500, 800, 1300, 900, 1400, 1400]))
# ---- pad: dark detuned saws, chord per bar ----
PAD_ON = [(0, 0.55), (22, 0.6), (46, 0.8), (65, 0.6), (70, 0.9), (88, 1.0), (90, 0.5)]
for b in range(int(90 / BAR) + 1):
    t0 = b * BAR; root, tri = chord_at(t0 + 0.01)
    notes = [root + 12] + [x - 12 for x in tri]
    n = int((BAR + 0.6) * SR); tau = np.arange(n) / SR
    e = np.minimum(1, tau / 0.25) * np.where(tau < BAR, 1, np.exp(-(tau - BAR) / 0.15))
    s = np.zeros(n)
    for m in notes:
        for d in (-0.006, 0.0, 0.007):
            s += wt(SAW, hz(m) * (1 + d) * (1 + 0.002 * np.sin(2 * np.pi * 0.3 * tau)), n)
    s = lp_short(s, lerp_cut(t0)) * e / (3 * len(notes))
    a = k(PAD_ON, t0)
    put(SL, SR_, t0, s * a * 0.55, 0.35 + 0.3 * (b % 2))

# ---- triplet pluck arp ----
TRIP = BEAT * 2 / 3
tt = 0.0; i = 0
while tt < 90:
    on = k(ARP_ON, tt)
    if on > 0:
        root, tri = chord_at(tt)
        seq = [tri[0], tri[1], tri[2], tri[1] + 12, tri[2], tri[0] + 12]
        m = seq[i % len(seq)] - (12 if tt < 46 else 0)
        n = int(0.4 * SR); tau = np.arange(n) / SR
        s = wt(SAW, hz(m), n) * 0.6 + wt(SAW, hz(m) * 1.005, n) * 0.4
        cut = k(ARP_CUT, tt)
        s = lp_short(s, cut * 0.5) + (lp_short(s, cut * 2) - lp_short(s, cut * 0.5)) * np.exp(-tau / 0.03)
        e = (1 - np.exp(-tau / 0.002)) * np.exp(-tau / 0.13)
        put(PL, PR, tt, s * e * on * 0.11, 0.25 + 0.5 * (i % 2))
    tt += TRIP; i += 1

# ---- bells: FM, one 8-step pattern per bar ----
BELL_PAT = [0, None, 2, None, 1, None, 2, 3]
for b in range(int(90 / BAR) + 1):
    t0 = b * BAR; root, tri = chord_at(t0 + 0.01)
    tones = [tri[0] + 24, tri[1] + 24, tri[2] + 24, tri[0] + 36]
    for j, p in enumerate(BELL_PAT):
        if p is None: continue
        at = t0 + j * BEAT / 2; a = k(BELL_ON, at)
        if a <= 0 or (2.0 < at < 3.0): continue
        f = hz(tones[p]); n = int(1.2 * SR); tau = np.arange(n) / SR
        mod = np.sin(2 * np.pi * f * 3.5 * tau) * 2.2 * np.exp(-tau / 0.15)
        s = np.sin(2 * np.pi * f * tau + mod) * np.exp(-tau / 0.35) * (1 - np.exp(-tau / 0.001))
        put(PL, PR, at, s * a * 0.045, 0.3 + 0.4 * ((j // 2) % 2))

# ---- gliding lead (the "chirp" tone of the reference), every 2 bars ----
for b in range(0, int(90 / BAR), 2):
    t0 = b * BAR + BEAT
    if t0 < 4 or t0 > 86: continue
    root, tri = chord_at(t0)
    base = hz(tri[2] + 12) if t0 < 65 else hz(tri[1] + 12)
    dur = BAR * 1.3; n = int(dur * SR); tau = np.arange(n) / SR
    glide = np.where(tau < 0.25, 2 ** (-(1 - tau / 0.25) * 3 / 12), 1.0) 
    f = base * glide * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * tau) * np.minimum(1, tau / 0.6))
    s = wt(SAW, f, n) * 0.3 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.7
    s = lp_short(s, 2500) * np.minimum(1, tau / 0.15) * np.minimum(1, (dur - tau) / 0.3)
    a = 0.6 if t0 < 22 else 0.85 if t0 < 46 else 0.75 if t0 < 65 else 0.5
    put(PL, PR, t0, s * a * 0.05, 0.6)

# ---- drums: hats, claps, downbeat kick in builds ----
def hat(at, a, open_=False):
    n = int((0.25 if open_ else 0.06) * SR); tau = np.arange(n) / SR
    s = fft_filter(rs.standard_normal(n), lo=7000) * np.exp(-tau / (0.08 if open_ else 0.015))
    put(KL, KR, at, s * a * 0.05, 0.62)
def clap(at, a):
    n = int(0.3 * SR); tau = np.arange(n) / SR
    s = fft_filter(rs.standard_normal(n), lo=900, hi=3500)
    e = sum(np.exp(-np.maximum(0, tau - d) / 0.012) * (tau >= d) for d in (0, 0.01, 0.022)) * 0.5 + np.exp(-tau / 0.12) * 0.5
    put(KL, KR, at, s * e * a * 0.09, 0.45)
def kick(at, a):
    n = int(0.45 * SR); tau = np.arange(n) / SR
    f = 45 + 110 * np.exp(-tau / 0.025)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tau / 0.18)
    put(KL, KR, at, np.tanh(s * 1.5) * a * 0.35, 0.5)

tt = 0.0; j = 0
while tt < 90:
    ha = k(HAT_ON, tt)
    if ha > 0: hat(tt, ha * (1.0 if j % 4 == 2 else 0.55), open_=(j % 8 == 6))
    ca = k(CLAP_ON, tt)
    if ca > 0 and j % 8 == 4: clap(tt, ca)
    # kick on bar downbeats only in the build/night (heartbeat SFX carries the rest)
    if (22 <= tt < 46 and j % 4 == 0) or (46 <= tt < 65 and j % 8 == 0): kick(tt, 0.8)
    tt += S16 * 2; j += 1
for r in range(16):  # snare-roll into the peak at 22
    clap(20.0 + r * (2.0 / 16), 0.3 + r * 0.04)

# riser noise into 48 and 70
for t0, t1, a in ((16.5, 21.95, 0.06), (41.0, 45.95, 0.05)):
    n = int((t1 - t0) * SR); tau = np.arange(n) / SR
    s = fft_filter(rs.standard_normal(n), lo=1500, hi=9000) * (tau / (t1 - t0)) ** 3
    put(KL, KR, t0, s * a, 0.5)

# ---- low sustained drone (weight + tension), slowly swelling ----
DR = [(0, 0.6), (22, 0.8), (46, 1.0), (65, 0.9), (72, 0.4), (90, 0.3)]
n = N; tau = t
dr = (wt(SAW, hz(26), n) * 0.6 + np.sin(2 * np.pi * hz(26) * tau) * 0.6 + wt(SAW, hz(33) * 1.003, n) * 0.3)
dr = fft_filter(dr, lo=25, hi=260) * env_pts(DR) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.125 * tau))
SL += dr * 0.16; SR_ += dr * 0.16

# ---- light shimmer pad for ВЫХОД ----
SH = env_pts([(0, 0), (66, 0), (72, 1), (88, 1), (90, 0.4)])
for b in range(int(65 / BAR), int(90 / BAR) + 1):
    t0 = b * BAR; root, tri = chord_at(t0 + 0.01)
    n = int((BAR + 1.0) * SR); tau = np.arange(n) / SR
    e = np.minimum(1, tau / 0.8) * np.where(tau < BAR, 1, np.exp(-(tau - BAR) / 0.4))
    s = sum(np.sin(2 * np.pi * hz(m + 12) * (1 + d) * tau) for m in tri for d in (-0.003, 0.003)) / 6
    put(PL, PR, t0, s * e * float(np.interp(t0, [0, 66, 72, 90], [0, 0, 1, 1])) * 0.06, 0.5)
