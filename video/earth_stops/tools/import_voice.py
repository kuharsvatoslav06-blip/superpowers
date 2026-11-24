# Imports a recorded narration (e.g. ElevenLabs) and splits it into the story's lines.
#   python3 tools/import_voice.py voiceover.mp3            whole script in one file
#   python3 tools/import_voice.py s01.mp3 s02.mp3 ...      one file per scene (name starts with the scene id)
#   python3 tools/import_voice.py folder/                  folder with per-scene files, or 41 per-line files
# Lines are separated at the ~1.5 s pauses from voiceover_*.txt. If the voice ignored those pauses,
# cut points are chosen among the short pauses so that each line's length matches its text
# (reliable for one scene = 2-6 lines; for a whole script it refuses instead of guessing).
# Writes voice_override/<scene>_<n>.wav; then run ./build.sh (voice.py picks the overrides up).
import json, os, re, sys, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'voice_override'); SR = 48000
story = json.load(open(os.path.join(ROOT, 'story.json')))
SCENES = {sc['id']: [L['text'] for L in sc['lines']] for sc in story['scenes']}
ALL = [(sc['id'], n, L['text']) for sc in story['scenes'] for n, L in enumerate(sc['lines'], 1)]
AUDIO = ('.mp3', '.wav', '.m4a', '.ogg', '.flac')
vowels = lambda s: len(re.findall('[аеёиоуыэюяАЕЁИОУЫЭЮЯ]', s))


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def save(x, path):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af',
                    'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,afade=t=in:d=0.01',
                    path], input=(np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes(), check=True)


def pauses(x, min_len=0.18):
    hop = SR // 100
    e = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, 'same')[::hop]) + 1e-9)
    q = e < max(-45, np.percentile(e, 90) - 28); g, i = [], 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            if j - i >= min_len * 100 and i > 0 and j < len(q): g.append((i / 100, j / 100))
            i = j
        else: i += 1
    return g


def split(x, texts, allow_fit):
    """returns (clips, method)"""
    n, T = len(texts), len(x) / SR
    if n == 1: return [x], 'одна реплика'
    g = pauses(x)
    big = sorted(g, key=lambda p: p[0] - p[1])[:n - 1]           # longest n-1 pauses
    if len(g) >= n - 1 and min(b - a for a, b in big) >= 0.9:
        cuts = sorted((a + b) / 2 for a, b in big); method = 'по паузам'
    else:
        if not allow_fit: return None, None
        # dynamic programming over short pauses: line length ~ number of vowels
        pts = [0.0] + [(a + b) / 2 for a, b in g] + [T]; m = len(pts)
        speech = lambda t0, t1: (t1 - t0) - sum(max(0, min(b, t1) - max(a, t0)) for a, b in g)
        v = np.array([vowels(t) for t in texts], float); rate = speech(0, T) / v.sum()
        INF = 1e18; C = np.full((n + 1, m), INF); B = np.zeros((n + 1, m), int); C[0, 0] = 0
        for k in range(1, n + 1):
            for j in range(1, m):
                if (k == n) != (j == m - 1): continue
                for i in range(j):
                    if C[k - 1, i] >= INF: continue
                    e = np.log((speech(pts[i], pts[j]) + 0.2) / (v[k - 1] * rate + 0.2)) ** 2 - (0.15 * (g[j - 1][1] - g[j - 1][0]) if j < m - 1 else 0)
                    if C[k - 1, i] + e < C[k, j]: C[k, j] = C[k - 1, i] + e; B[k, j] = i
        j, cuts = m - 1, []
        for k in range(n, 1, -1): j = B[k, j]; cuts.append(pts[j])
        cuts = sorted(cuts); method = 'по длине текста (паузы 1,5 с не найдены)'
    b = [0] + [int(c * SR) for c in cuts] + [len(x)]
    return [x[b[k]:b[k + 1]] for k in range(n)], method


def main():
    args = sys.argv[1:]
    if len(args) == 1 and os.path.isdir(args[0]):
        args = [os.path.join(args[0], f) for f in sorted(os.listdir(args[0])) if f.lower().endswith(AUDIO)]
    os.makedirs(OUT, exist_ok=True)
    jobs = []   # (scene ids covered, file)
    if len(args) == len(ALL) and not any(re.match(r's\d\d', os.path.basename(a)) for a in args):
        jobs = [([k], a) for k, a in zip(ALL, args)]
    else:
        for a in args:
            m = re.match(r'(s\d\d)', os.path.basename(a))
            if m and m.group(1) in SCENES: jobs.append((m.group(1), a))
            elif len(args) == 1: jobs.append(('ALL', a))
            else: sys.exit(f'не понимаю, к какой сцене относится {a}: имя должно начинаться с s01..s12')
    print(' реплика  длит.  зн/с  текст')
    for sid, path in jobs:
        x = load(path)
        if isinstance(sid, list): keys, clips, how = sid, [x], 'отдельный файл'
        else:
            keys = ALL if sid == 'ALL' else [(sid, n, t) for n, t in enumerate(SCENES[sid], 1)]
            clips, how = split(x, [k[2] for k in keys], allow_fit=sid != 'ALL')
            if clips is None:
                sys.exit('В записи нет пауз ~1,5 с между репликами, а для всего сценария сразу подбирать границы ненадёжно.\n'
                         'Озвучьте сцены отдельными файлами (voiceover_parts/s01.txt … s12.txt) и передайте их сюда.')
        print(f'-- {os.path.basename(path)}: {how}')
        for (s, n, text), c in zip(keys, clips):
            out = os.path.join(OUT, f'{s}_{n}.wav'); save(c, out)
            d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout)
            flag = '  <-- проверить' if not 7 < len(text) / d < 22 else ''
            print(f' {s}_{n:<2d}  {d:5.1f}s {len(text) / d:5.1f}  {text[:55]}{flag}')
    done = sorted(f[:-4] for f in os.listdir(OUT))
    missing = [f'{s}_{n}' for s, n, _ in ALL if f'{s}_{n}' not in done]
    print(f'\nготово: {len(ALL) - len(missing)} из {len(ALL)} реплик в {OUT}' + (f'; без записи: {", ".join(missing)}' if missing else '. Дальше: ./build.sh'))


if __name__ == '__main__':
    main()
