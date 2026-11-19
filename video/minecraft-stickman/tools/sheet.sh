#!/usr/bin/env bash
# Make a 4-column contact sheet of every jpg in a directory: tools/sheet.sh <dir>
cd "$1" && ls *.jpg | grep -v sheet > l.txt && n=$(wc -l < l.txt)
ffmpeg -loglevel error -y $(for f in $(cat l.txt); do echo -i $f; done) -filter_complex "$(for i in $(seq 0 $((n-1))); do echo -n "[$i]scale=480:270[v$i];"; done)$(for i in $(seq 0 $((n-1))); do echo -n "[v$i]"; done)xstack=inputs=$n:layout=$(python3 -c "print('|'.join(f'{(i%4)*480}_{(i//4)*270}' for i in range($n)))")" sheet.jpg && tr '\n' ' ' < l.txt
