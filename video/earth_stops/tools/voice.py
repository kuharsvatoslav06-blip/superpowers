# Russian narration: synthesises every line of story.json (RHVoice, male "aleksandr-hq"),
# places it on the timeline, estimates word timings for karaoke subtitles and exports SRT/VTT.
#   python3 tools/voice.py
# To use a recorded or third-party voice for a line, drop a file at voice_override/<sceneid>_<n>.wav
# (n = line index from 1); its real duration is used for timing.
import json, os, re, subprocess, hashlib, wave, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, 'build'); CACHE = os.path.join(BUILD, 'voice_cache'); OVR = os.path.join(ROOT, 'voice_override')
os.makedirs(CACHE, exist_ok=True)
SR = 48000
story = json.load(open(os.path.join(ROOT, 'story.json')))
V = story['voice']

# pronunciation fixes: stress marks / spelled-out forms for the synthesiser only (subtitles keep the original)
SAY = [(r'\bвсё\b', 'всё'), (r'—', ','), (r'(\d)\s(\d)', r'\1\2')]


def synth(text, out):
    say = text
    for a, b in SAY: say = re.sub(a, b, say)
    raw = out + '.raw.wav'
    subprocess.run(['RHVoice-test', '-p', V['profile'], '-r', str(int(V['rate'] * 100)), '-o', raw], input=say.encode(), check=True, capture_output=True)
    af = (f"rubberband=pitch={V['pitch']}:formant=preserved,"
          "highpass=f=75,equalizer=f=180:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.2:g=2.5,equalizer=f=7000:t=q:w=1:g=-2,"
          "acompressor=threshold=-22dB:ratio=3:attack=4:release=90:makeup=2,"
          "aecho=0.8:0.5:55|110:0.1|0.05,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), '-ac', '1', out], check=True)
    os.remove(raw)


def read(path):
    with wave.open(path) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        return x if w.getframerate() == SR else np.interp(np.arange(int(len(x) * SR / w.getframerate())) * w.getframerate() / SR, np.arange(len(x)), x)


def to_wav(src):
    out = os.path.join(CACHE, 'ovr_' + hashlib.md5(open(src, 'rb').read()).hexdigest()[:10] + '.wav')
    if not os.path.exists(out): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ar', str(SR), '-ac', '1', out], check=True)
    return out


def vowels(w): return max(1, len(re.findall(r'[аеёиоуыэюяaeiouy]', w.lower()))) + 0.3 * len(re.findall(r'\d', w))


def word_times(text, x, start):
    """Distribute words over the audio; phrase boundaries snap to detected pauses."""
    words = text.split()
    hop = int(SR * 0.01); env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    thr = max(1e-4, np.percentile(env, 60) * 0.12); quiet = env < thr
    gaps = []; i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if j - i >= 12 and i > 5 and j < len(quiet) - 5: gaps.append(((i + j) / 2 * 0.01, (j - i) * 0.01, i * 0.01, j * 0.01))
            i = j
        else: i += 1
    # phrases split after punctuation
    phrases, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r'[,.;:!?—…]$', w): phrases.append(cur); cur = []
    if cur: phrases.append(cur)
    dur = len(x) / SR
    bounds = [0.0]
    if len(phrases) > 1 and len(gaps) >= len(phrases) - 1:
        best = sorted(sorted(gaps, key=lambda g: -g[1])[:len(phrases) - 1], key=lambda g: g[0])
        for g in best: bounds += [g[2], g[3]]
    else:
        tot = sum(vowels(w) for w in words); acc = 0
        for p in phrases[:-1]:
            acc += sum(vowels(w) for w in p); b = acc / tot * dur; bounds += [b, b]
    bounds.append(dur)
    out = []
    for k, p in enumerate(phrases):
        a, b = bounds[2 * k], bounds[2 * k + 1]; tot = sum(vowels(w) for w in p); acc = 0
        for w in p:
            s = a + acc / tot * (b - a); acc += vowels(w); e = a + acc / tot * (b - a)
            out.append({'w': w, 's': round(start + s, 3), 'e': round(start + e, 3)})
    return out


def ts(t, sep=','):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f'{h:02d}:{m:02d}:{int(s):02d}{sep}{int(round((s - int(s)) * 1000)):03d}'


def main():
    total = sum(s['dur'] for s in story['scenes'])
    track = np.zeros(int(SR * (total + 2)), np.float32)
    lines, t0, prev_end, warn = [], 0.0, 0.0, []
    for sc in story['scenes']:
        for n, L in enumerate(sc.get('lines', []), 1):
            ovr = os.path.join(OVR, f"{sc['id']}_{n}.wav")
            if os.path.exists(ovr): f = to_wav(ovr)
            else:
                key = hashlib.md5(json.dumps([L['text'], V], ensure_ascii=False).encode()).hexdigest()[:12]
                f = os.path.join(CACHE, key + '.wav')
                if not os.path.exists(f): synth(L['text'], f)
            x = read(f)
            start = t0 + L['at']
            if start < prev_end + 0.3:
                warn.append(f"{sc['id']} line {n}: moved {prev_end + 0.3 - start:.2f}s later (previous line still speaking)")
                start = prev_end + 0.3
            end = start + len(x) / SR
            scene_end = t0 + sc['dur']
            if end > scene_end + 0.5: warn.append(f"{sc['id']} line {n}: runs {end - scene_end:.2f}s past scene end")
            i = int(start * SR); track[i:i + len(x)] += x
            lines.append({'scene': sc['id'], 'n': n, 'text': L['text'], 'start': round(start, 3), 'end': round(end, 3), 'words': word_times(L['text'], x, start)})
            prev_end = end
            print(f"{sc['id']}#{n} {start:7.2f}-{end:7.2f} ({end - start:4.1f}s) {L['text'][:60]}")
        t0 += sc['dur']
    for w in warn: print('WARN', w)
    pk = np.max(np.abs(track)) or 1; track = track / pk * 0.89
    with wave.open(os.path.join(BUILD, 'narration.wav'), 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((track * 32767).astype(np.int16).tobytes())
    json.dump({'total': total, 'lines': lines}, open(os.path.join(BUILD, 'timing.json'), 'w'), ensure_ascii=False, indent=1)
    # subtitles: one cue per ~44 character chunk (same split as on-screen captions)
    srt, vtt, k = [], ['WEBVTT', ''], 1
    for L in lines:
        chunks, cur = [], []
        for i, wd in enumerate(L['words']):
            cur.append(wd); ln = len(' '.join(c['w'] for c in cur))
            nxt = L['words'][i + 1] if i + 1 < len(L['words']) else None
            if not nxt or ln > 44 or (re.search(r'[,.;:!?—…]$', wd['w']) and ln > 22) or (nxt and ln + len(nxt['w']) > 52): chunks.append(cur); cur = []
        for j, c in enumerate(chunks):
            s, e = c[0]['s'], (chunks[j + 1][0]['s'] if j + 1 < len(chunks) else L['end'] + 0.25)
            txt = ' '.join(x['w'] for x in c)
            srt += [str(k), f'{ts(s)} --> {ts(e)}', txt, '']; vtt += [f"{ts(s, '.')} --> {ts(e, '.')}", txt, '']; k += 1
    open(os.path.join(BUILD, 'subtitles.srt'), 'w').write('\n'.join(srt))
    open(os.path.join(BUILD, 'subtitles.vtt'), 'w').write('\n'.join(vtt))
    print(f'{len(lines)} lines, total {total}s')


if __name__ == '__main__':
    main()
