#!/usr/bin/env bash
# Full pipeline. Usage: ./build.sh [from_sec] [to_sec] [output.mp4]
#   ./build.sh                 -> whole film      -> build/earth_stops_full.mp4
#   ./build.sh 0 60 out.mp4    -> just a range (e.g. the prototype)
set -euo pipefail
cd "$(dirname "$0")"
FROM=${1:-0}; TO=${2:-}; OUT=${3:-build/earth_stops_full.mp4}
mkdir -p build
python3 tools/voice.py                      # narration.wav, timing.json, subtitles.srt/.vtt
node render.js plan                         # scene/shot/cue plan for the audio
if [ -z "$TO" ]; then TO=$(python3 -c "import json;p=json.load(open('build/plan.json'));print(p[-1]['start']+p[-1]['dur'])"); fi
python3 tools/audio.py "$FROM" "$TO"        # mix.wav (score + sfx + voice, -14 LUFS)
node render.js video build/frames.mp4 "$FROM" "$TO" "${WORKERS:-4}"
# subtitles shifted to the range start, muxed as a selectable track (burned-in captions are already in the picture)
python3 - "$FROM" <<'EOF'
import re, sys
off = float(sys.argv[1])
def sh(m):
    t = int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3]) + int(m[4]) / 1000 - off
    t = max(0, t); return f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round((t % 1) * 1000)) % 1000:03d}"
s = open('build/subtitles.srt').read()
open('build/subs_range.srt', 'w').write(re.sub(r'(\d+):(\d+):(\d+),(\d+)', sh, s))
EOF
ffmpeg -v error -y -i build/frames.mp4 -i build/mix.wav -i build/subs_range.srt \
  -map 0:v -map 1:a -map 2 -c:v copy -c:a aac -b:a 192k -c:s mov_text -metadata:s:s:0 language=rus \
  -shortest -movflags +faststart "$OUT"
echo "-> $OUT"
