# Shared timeline: pulse keyframes and heartbeat times (used by video and audio)
import json, sys
import numpy as np

BPMK = [(0, 62), (26, 66), (50, 72), (72, 70), (96, 62)]
DUR = 96.0


def bpm_at(t):
    xs = [k[0] for k in BPMK]
    ys = [k[1] for k in BPMK]
    return float(np.interp(t, xs, ys))


def beat_times():
    beats, phase, t, dt = [0.35], 0.0, 0.35, 0.001
    while t < DUR:
        phase += bpm_at(t) / 60.0 * dt
        t += dt
        if phase >= 1.0:
            phase -= 1.0
            beats.append(round(t, 4))
    return beats


if __name__ == '__main__':
    b = beat_times()
    with open(sys.argv[1], 'w') as f:
        f.write('window.BPMK=' + json.dumps(BPMK) + ';window.BEATS=' + json.dumps(b) + ';')
    print(len(b), 'beats')
