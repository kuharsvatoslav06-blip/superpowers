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
BASS_ON = [(0, 0), (2.9, 0), (3.0, 0.55), (8, 0.8), (26, 0.8), (47.6, 1.0), (47.7, 0), (48, 1), (53.4, 1), (53.5, 0), (58.9, 0), (59, 0.9), (70, 0.9), (70.01, 0.65), (88, 0.6), (90, 0.3)]
BASS_CUT = [(0, 300), (8, 380), (26, 420), (47, 1500), (48, 700), (59, 800), (70, 900), (90, 900)]
ARP_ON = [(0, 0), (8, 0), (8.01, 0.6), (26, 0.8), (47.6, 1), (47.7, 0), (48, 0.9), (53.4, 0.9), (53.5, 0.35), (59, 0.9), (70, 0.9), (90, 0.8)]
ARP_CUT = [(0, 900), (8, 1100), (26, 1300), (47, 4000), (48, 1800), (59, 2000), (70, 2600), (90, 2200)]
BELL_ON = [(0, 0.5), (8, 0.7), (26, 0.7), (47.6, 0.9), (47.7, 0), (48, 0.8), (70, 1.0), (90, 0.8)]
HAT_ON = [(0, 0), (31.5, 0), (32, 0.4), (47.6, 1), (47.7, 0), (48, 0.7), (53.5, 0), (59, 0), (59.1, 0.6), (70, 0.9), (70.01, 0.35), (90, 0.3)]
CLAP_ON = [(0, 0), (37, 0), (37.01, 0.7), (47.6, 1), (47.7, 0), (48, 0.9), (53.5, 0), (59, 0), (64.5, 0), (64.51, 0.8), (70, 0.8), (70.01, 0), (90, 0)]

# chord per bar (root midi of bass, triad tones for arp/pad)
DM, BB, C, A_, F, GM = (38, [62, 65, 69]), (34, [58, 62, 65]), (36, [60, 64, 67]), (33, [57, 61, 64]), (41, [65, 69, 72]), (31, [55, 58, 62])
def chord_at(tt):
    if tt < 26:  prog = [DM, DM, C, BB, DM, DM, C, A_]
    elif tt < 48: prog = [DM, BB, C, A_]
    elif tt < 70: prog = [DM, DM, (39, [63, 67, 70]), DM]   # Eb for dread
    else: prog = [F, C, DM, BB]
    return prog[int(tt // BAR) % len(prog)]


# ---- bass: pumping 8ths (16ths in builds) ----
tt = 0.0
while tt < 90:
    on = k(BASS_ON, tt)
    sixteenth = (40 <= tt < 47.6) or (64.5 <= tt < 70)
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

# ---- pad: dark detuned saws, chord per bar ----
PAD_ON = [(0, 0.6), (3, 0.5), (8, 0.55), (26, 0.5), (47.6, 0.9), (47.7, 0.3), (48, 0.6), (53.5, 0.9), (59, 0.6), (70, 0.7), (88, 0.8), (90, 0.4)]
for b in range(int(90 / BAR) + 1):
    t0 = b * BAR; root, tri = chord_at(t0 + 0.01)
    notes = [root + 12] + [x - 12 for x in tri]
    n = int((BAR + 0.6) * SR); tau = np.arange(n) / SR
    e = np.minimum(1, tau / 0.25) * np.where(tau < BAR, 1, np.exp(-(tau - BAR) / 0.15))
    s = np.zeros(n)
    for m in notes:
        for d in (-0.006, 0.0, 0.007):
            s += wt(SAW, hz(m) * (1 + d) * (1 + 0.002 * np.sin(2 * np.pi * 0.3 * tau)), n)
    s = lp_short(s, 700 if t0 < 70 else 1100) * e / (3 * len(notes))
    a = k(PAD_ON, t0)
    if 53.5 <= t0 < 59:  # breakdown: warped pad
        s = lp_short(s * (1 + 0.5 * np.sin(2 * np.pi * 5 * tau)), 900)
    put(SL, SR_, t0, s * a * 0.55, 0.35 + 0.3 * (b % 2))

# ---- triplet pluck arp ----
TRIP = BEAT * 2 / 3
tt = 0.0; i = 0
while tt < 90:
    on = k(ARP_ON, tt)
    if on > 0:
        root, tri = chord_at(tt)
        seq = [tri[0], tri[1], tri[2], tri[1] + 12, tri[2], tri[0] + 12]
        m = seq[i % len(seq)] - (12 if tt < 48 else 0)
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
    if t0 < 8 or 47.5 < t0 < 48.5 or t0 > 88: continue
    root, tri = chord_at(t0)
    base = hz(tri[2] + 12) if t0 < 70 else hz(tri[1] + 12)
    dur = BAR * 1.3; n = int(dur * SR); tau = np.arange(n) / SR
    glide = np.where(tau < 0.25, 2 ** (-(1 - tau / 0.25) * 3 / 12), 1.0) * np.where(tau > dur - 0.5, 2 ** (-((tau - (dur - 0.5)) / 0.5) * 5 / 12), 1.0)
    f = base * glide * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * tau) * np.minimum(1, tau / 0.6))
    s = wt(SAW, f, n) * 0.3 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.7
    s = lp_short(s, 2500) * np.minimum(1, tau / 0.15) * np.minimum(1, (dur - tau) / 0.3)
    a = 0.6 if t0 < 26 else 0.75 if t0 < 48 else 0.85 if t0 < 70 else 0.6
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
    if (37 <= tt < 47.6 or 59 <= tt < 70) and j % 8 == 0: kick(tt, 0.8)
    tt += S16 * 2; j += 1
for r in range(16):  # snare-roll into the drop at 48
    clap(45.6 + r * (2.0 / 16), 0.3 + r * 0.04)

# riser noise into 48 and 70
for t0, t1, a in ((42.0, 47.65, 0.06), (66.0, 69.9, 0.04)):
    n = int((t1 - t0) * SR); tau = np.arange(n) / SR
    s = fft_filter(rs.standard_normal(n), lo=1500, hi=9000) * (tau / (t1 - t0)) ** 3
    put(KL, KR, t0, s * a, 0.5)
