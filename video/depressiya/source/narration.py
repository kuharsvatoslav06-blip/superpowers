# Cut the ElevenLabs narration into phrases and place each at its caption time.
import sys, json, subprocess, wave, os
import numpy as np

SR = 44100
N = int(SR * 96)
src, out_wav, out_json = sys.argv[1:4]
tmp = os.path.dirname(out_wav)

# (src_start, src_end, place_at, tempo)
CLIPS = [
    (0.00, 1.43, 0.15, 1.0),    # Что такое депрессия?
    (1.87, 5.17, 3.30, 1.0),    # Это не лень...
    (5.51, 9.20, 8.35, 1.0),    # Не грусть пару дней
    (9.52, 13.96, 14.35, 1.0),  # ангедония
    (14.31, 20.02, 20.30, 1.0), # Сил нет... сон
    (20.38, 25.07, 26.35, 1.0), # Миндалина... негатив
    (25.40, 29.36, 32.35, 1.0), # Лобная кора
    (29.65, 35.79, 38.25, 1.06),# кортизол
    (36.07, 40.27, 44.35, 1.0), # нейроны / серотонин
    (40.64, 43.61, 50.35, 1.0), # отменяет встречи
    (43.96, 49.17, 55.85, 1.03),# петля
    (49.57, 55.34, 61.30, 1.10),# мысли / симптом
    (55.70, 60.92, 66.85, 1.03),# 280 млн
    (61.24, 64.72, 72.35, 1.0), # лечится
    (64.97, 71.25, 77.80, 1.04),# психотерапия
    (71.55, 77.61, 84.30, 1.07),# маленькие шаги
    (77.95, 82.72, 90.40, 1.0), # 112
]

nar = np.zeros(N)
spans = []
for i, (a, b, at, tempo) in enumerate(CLIPS):
    f = f'{tmp}/clip{i:02d}.wav'
    pad_a = max(0, a - 0.03)
    af = f"atrim={pad_a}:{b + 0.08},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b + 0.08 - pad_a - 0.06}:d=0.06"
    if tempo != 1.0: af += f",atempo={tempo}"
    af += ",highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80,aecho=0.85:0.5:70|160:0.12|0.07,apad=pad_dur=0.4"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', af, '-ar', str(SR), '-ac', '1', f], check=True)
    with wave.open(f) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    i0 = int(at * SR); j = min(N, i0 + len(x))
    nar[i0:j] += x[:j - i0]
    dur = (b - a) / tempo
    spans.append([round(at, 3), round(at + dur, 3)])
    print(f'{i+1:2d} {at:6.2f} -> {at + dur:6.2f}  ({dur:.2f}s)')

with open(out_json, 'w') as fh: json.dump(spans, fh)
with wave.open(out_wav, 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(nar, -1, 1) * 32767).astype(np.int16).tobytes())
