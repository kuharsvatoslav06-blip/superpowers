# Cut the ElevenLabs narration into phrases and place each at its caption time.
import sys, json, subprocess, wave, os
import numpy as np

SR = 44100
N = int(SR * 93)
src, out_wav, out_json = sys.argv[1:4]
tmp = os.path.dirname(out_wav)

# (src_start, src_end, place_at, tempo)
CLIPS = [
    (0.00, 3.89, 0.12, 1.0),    # Это не сердце...
    (4.31, 6.60, 4.35, 1.0),    # Ничего не случилось
    (7.11, 12.09, 9.80, 1.0),   # Миндалина, зона страха
    (12.46, 16.30, 16.30, 1.0), # Сигнал идёт в гипоталамус
    (16.56, 18.48, 22.30, 1.0), # В кровь выбрасывается адреналин
    (18.81, 22.85, 27.80, 1.0), # Пульс растёт
    (23.19, 27.93, 33.80, 1.0), # Из-за перераспределения
    (28.29, 33.26, 40.30, 1.0), # Частое дыхание
    (33.59, 37.06, 46.30, 1.0), # Тело реагирует
    (37.40, 42.92, 52.30, 1.0), # Мысль «со мной...»
    (43.19, 48.46, 58.80, 1.0), # Миндалина перевозбуждена
    (48.88, 54.74, 65.15, 1.04),# Пик обычно...
    (55.12, 60.84, 71.25, 1.04),# Организм не может...
    (61.30, 68.12, 77.25, 1.05),# Что помогает
    (68.57, 72.77, 84.15, 1.03),# КПТ
    (73.29, 76.32, 88.70, 1.0), # Если боль в груди
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
