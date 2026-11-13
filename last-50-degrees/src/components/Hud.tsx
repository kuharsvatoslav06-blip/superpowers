import React from 'react';
import type {HudDef} from '../types';
import {MONO, SANS} from '../styles/fonts';
import {clamp, easeOut, lerp, progress} from '../animations/ease';
import {tempColor} from './inserts/common';

const TONE = {ok: '#6be39b', warn: '#ffb347', alert: '#ff4a3a', none: '#f6f1e7'} as const;

const toMin = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

const Icon: React.FC<{kind: 'pin' | 'clock' | 'thermo'; color: string}> = ({kind, color}) => {
  const p = {width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  if (kind === 'pin')
    return (
      <svg {...p}>
        <path d="M12 21s-7-6.2-7-11.2A7 7 0 0 1 19 9.8C19 14.8 12 21 12 21z" />
        <circle cx={12} cy={10} r={2.6} />
      </svg>
    );
  if (kind === 'clock')
    return (
      <svg {...p}>
        <circle cx={12} cy={12} r={9} />
        <path d="M12 7v5l3.5 2" />
      </svg>
    );
  return (
    <svg {...p}>
      <path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z" />
      <path d="M12 9v7" />
    </svg>
  );
};

const Pill: React.FC<{color: string; children: React.ReactNode}> = ({color, children}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 54,
      padding: '0 16px',
      borderRadius: 14,
      background: 'rgba(8,10,18,0.74)',
      border: `2px solid ${color}`,
      boxShadow: `0 0 18px ${color}44`,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

/** Верхняя информационная полоса. Не перекрывает плашку «СЕРИЯ N» (она уходит через 3,5 с). */
export const Hud: React.FC<{hud: HudDef; t: number; dur: number}> = ({hud, t, dur}) => {
  const at = hud.at ?? 0.3;
  const inP = easeOut(progress(t, at, at + 0.4));
  const outP = progress(t, dur - 0.3, dur);
  const op = clamp(inP) * (1 - outP);
  if (op <= 0.01) return null;

  const colonOn = Math.floor(t * 2) % 2 === 0;
  let time: string | null = null;
  if (hud.time) {
    const a = toMin(hud.time[0]);
    const b = hud.time[1] ? toMin(hud.time[1]) : a;
    const m = Math.round(lerp(a, b, progress(t, 0, dur)));
    time = `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }
  let temp: number | null = null;
  if (hud.temp) temp = Math.round(lerp(hud.temp[0], hud.temp[1] ?? hud.temp[0], progress(t, 0, dur)));
  const tc = temp !== null ? tempColor(temp) : '#fff';

  // оценка ширины ленты: если не помещается в кадр (1000 px), пропорционально уменьшаем
  let est = 0;
  if (hud.place) est += hud.place.length * 17 + 80;
  if (time) est += 170;
  if (temp !== null) est += 150 + (hud.tempLabel ? hud.tempLabel.length * 11 : 0);
  for (const c of hud.chips ?? []) est += c.label.length * 11 + c.value.length * 17 + 56;
  est += 10 * 4;
  const k = Math.min(1, 1000 / Math.max(est, 1));

  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: 214,
        display: 'flex',
        gap: 10,
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        opacity: op,
        transform: `translateY(${(1 - inP) * -28}px) scale(${k})`,
        transformOrigin: 'left top',
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: 26,
        color: '#f6f1e7',
        pointerEvents: 'none',
      }}
    >
      {hud.place && (
        <Pill color="#8d9bb5">
          <Icon kind="pin" color="#cfd8ea" />
          <span style={{letterSpacing: 1}}>{hud.place}</span>
        </Pill>
      )}
      {time && (
        <Pill color="#46d4ff">
          <Icon kind="clock" color="#46d4ff" />
          <span style={{fontFamily: MONO, fontSize: 30, color: '#c9f3ff', letterSpacing: 1}}>
            {time.slice(0, 2)}
            <span style={{opacity: colonOn ? 1 : 0.15}}>:</span>
            {time.slice(3)}
          </span>
        </Pill>
      )}
      {temp !== null && (
        <Pill color={tc}>
          <Icon kind="thermo" color={tc} />
          <span style={{fontFamily: MONO, fontSize: 30, color: tc}}>{temp}°C</span>
          {hud.tempLabel && <span style={{fontSize: 18, opacity: 0.75, letterSpacing: 1}}>{hud.tempLabel}</span>}
        </Pill>
      )}
      {(hud.chips ?? []).map((c, i) => {
        const col = TONE[c.tone ?? 'none'];
        return (
          <Pill key={i} color={c.tone ? col : '#8d9bb5'}>
            <span style={{fontSize: 17, opacity: 0.7, letterSpacing: 1}}>{c.label}</span>
            <span style={{fontFamily: MONO, fontSize: 26, color: col}}>{c.value}</span>
          </Pill>
        );
      })}
    </div>
  );
};
