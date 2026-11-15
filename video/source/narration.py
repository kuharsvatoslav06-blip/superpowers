# Cut the ElevenLabs narration into phrases and place each at its caption time.
import sys, json, subprocess, wave, os
import numpy as np

SR = 44100
N = int(SR * 90)
src, out_wav, out_json = sys.argv[1:4]
tmp = os.path.dirname(out_wav)

# (src_start, src_end, place_at, tempo)
CLIPS = [
    (0.00, 1.66, 3.30, 1.0),    # Это когда сон не приходит
    (2.06, 4.17, 5.72, 1.0),    # Но есть форма...
    (4.54, 8.94, 8.35, 1.0),    # Венеция, 1765. Первый известный случай
    (9.35, 11.03, 14.35, 1.0),  # Болезнь передаётся в семье
    (11.37, 16.34, 20.35, 1.0), # 1986 год. Лугарези
    (16.73, 20.03, 26.40, 1.0), # Таламус координирует...
    (20.37, 23.74, 31.85, 1.0), # Белок сломался...
    (23.94, 25.99, 37.35, 1.0), # Больные белки...
    (26.31, 28.74, 42.85, 1.0), # Таламус разрушен...
    (29.12, 32.90, 48.35, 1.0), # Сначала бессонница...
    (33.20, 34.65, 53.85, 1.0), # Дальше — галлюцинации
    (35.03, 38.94, 59.35, 1.0), # Обычно болезнь...
    (39.27, 42.80, 64.85, 1.0), # В среднем... 18 месяцев
    (43.20, 48.53, 70.20, 1.12),# К 2018 году...
    (48.95, 51.72, 75.40, 1.0), # Лекарства нет...
    (52.14, 53.72, 79.60, 1.0), # Но поиск не остановился
    (53.96, 57.71, 81.35, 1.06),# Фонд Prion Alliance...
    (58.12, 61.31, 85.35, 1.0), # Сон — это не роскошь...
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
