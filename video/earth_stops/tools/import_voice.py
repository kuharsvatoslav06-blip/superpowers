# Imports a recorded narration (e.g. ElevenLabs) and splits it into the story's lines.
#   python3 tools/import_voice.py voiceover.mp3      one file, lines separated by ~1.5 s pauses
#   python3 tools/import_voice.py folder/            or one file per line (sorted by name)
# Writes voice_override/<scene>_<n>.wav; then run ./build.sh (voice.py picks the overrides up).
import json, os, sys, subprocess, shutil
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'voice_override'); SR = 48000
story = json.load(open(os.path.join(ROOT, 'story.json')))
keys = [(sc['id'], n, L['text']) for sc in story['scenes'] for n, L in enumerate(sc['lines'], 1)]


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def save(x, path):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af',
                        'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,afade=t=in:d=0.01',
                        path], input=(np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes(), check=True)


def split(x, n):
    hop = int(SR * 0.01); env = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, 'same')[::hop])
    thr = max(1e-4, np.percentile(env, 70) * 0.05); quiet = env < thr
    gaps, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if i > 0 and j < len(quiet): gaps.append((j - i, (i + j) // 2))
            i = j
        else: i += 1
    if len(gaps) < n - 1: sys.exit(f'found only {len(gaps) + 1} phrases, expected {n}: check that the file has a pause between every line')
    cuts = sorted(c for _, c in sorted(gaps, reverse=True)[:n - 1])
    shortest = sorted(gaps, reverse=True)[n - 2][0] * 0.01
    if shortest < 0.6: print(f'WARNING: the shortest separating pause is only {shortest:.2f}s — check the result table')
    b = [0] + [c * hop for c in cuts] + [len(x)]
    return [x[b[k]:b[k + 1]] for k in range(n)]


def main():
    src = sys.argv[1]
    if os.path.exists(OUT): shutil.rmtree(OUT)
    os.makedirs(OUT)
    if os.path.isdir(src):
        files = sorted(f for f in os.listdir(src) if f.lower().endswith(('.mp3', '.wav', '.m4a', '.ogg', '.flac')))
        if len(files) != len(keys): sys.exit(f'{len(files)} files in folder, expected {len(keys)}')
        clips = [load(os.path.join(src, f)) for f in files]
    else:
        clips = split(load(src), len(keys))
    print(' #  line      dur  chars/s  text')
    for k, ((sid, n, text), c) in enumerate(zip(keys, clips), 1):
        out = os.path.join(OUT, f'{sid}_{n}.wav'); save(c, out)
        d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout)
        flag = '  <-- check' if not 7 < len(text) / d < 22 else ''
        print(f'{k:2d}  {sid}_{n:<2d} {d:5.1f}s {len(text) / d:6.1f}   {text[:55]}{flag}')
    print(f'\n{len(clips)} clips -> {OUT}. Next: ./build.sh')


if __name__ == '__main__':
    main()
