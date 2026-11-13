import React from 'react';
import {SUBTITLE_Y} from '../config';
import {SPEAKER_COLOR, SPEAKER_NAME} from '../styles/palette';
import {SANS, MONO} from '../styles/fonts';
import type {ResolvedLine} from '../episodes/timing';
import {clamp, easeOut, progress} from '../animations/ease';

interface Word {
  text: string;
  em: boolean;
  /** Знак препинания сразу после выделенного слова — без отступа. */
  glue?: boolean;
}

/** Разбор «обычное *акцент* обычное» на слова с признаком выделения. */
export function parseWords(text: string): Word[] {
  const out: Word[] = [];
  text.split('*').forEach((seg, i) => {
    const glueFirst = i > 0 && out.length > 0 && !/^\s/.test(seg);
    seg
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w, j) => out.push({text: w, em: i % 2 === 1, glue: j === 0 && glueFirst}));
  });
  return out;
}

export const Subtitles: React.FC<{lines: ResolvedLine[]; t: number}> = ({lines, t}) => {
  // показываем последнюю начавшуюся реплику, пока она «жива»
  const active = [...lines].reverse().find((l) => !l.hidden && t >= l.at - 0.02 && t <= l.at + l.dur + 0.2);
  if (!active) return null;
  const words = parseWords(active.text);
  const color = SPEAKER_COLOR[active.speaker] ?? '#fff';
  const terra = active.speaker === 'terra';
  const name = SPEAKER_NAME[active.speaker];
  const pIn = easeOut(progress(t, active.at, active.at + 0.18));
  const pOut = 1 - progress(t, active.at + active.dur, active.at + active.dur + 0.2);
  const revealSpan = Math.max(0.5, active.dur * 0.72);
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 150,
        top: SUBTITLE_Y,
        transform: `translateY(-50%) translateY(${(1 - pIn) * 24}px)`,
        opacity: clamp(pIn) * clamp(pOut),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {name && (
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: 4,
            color: '#0a0a0f',
            background: color,
            padding: '4px 18px',
            borderRadius: 8,
          }}
        >
          {name}
        </div>
      )}
      <div
        style={{
          fontFamily: terra ? MONO : SANS,
          fontWeight: terra ? 700 : 800,
          fontSize: terra ? 52 : 60,
          lineHeight: 1.14,
          textAlign: 'center',
          color: terra ? '#46d4ff' : '#fff',
          fontStyle: active.speaker === 'narrator' ? 'normal' : 'normal',
          WebkitTextStroke: '9px #07070b',
          paintOrder: 'stroke fill',
          textShadow: '0 4px 14px rgba(0,0,0,0.7)',
          maxWidth: 880,
        }}
      >
        {words.map((w, i) => {
          const at = active.at + (i / Math.max(1, words.length)) * revealSpan;
          const p = easeOut(progress(t, at, at + 0.14));
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: w.glue ? '0 0.14em 0 0' : '0 0.14em',
                opacity: p,
                transform: `translateY(${(1 - p) * 14}px) scale(${w.em ? 1 + (1 - p) * 0.25 : 1})`,
                color: w.em ? (terra ? '#ff5a4a' : '#ffd447') : undefined,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
