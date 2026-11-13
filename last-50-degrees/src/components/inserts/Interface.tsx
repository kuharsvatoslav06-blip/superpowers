import React from 'react';
import {MONO, SANS} from '../../styles/fonts';
import type {Insert, TLine} from '../../types';
import {Panel, THEME, fadeIO, pulse, tempColor, typed} from './common';
import {lerp, progress, easeInOut, easeOut, easeOutBack, clamp} from '../../animations/ease';
import {noise1} from '../../animations/noise';

type Of<T extends Insert['type']> = Extract<Insert, {type: T}>;

/* ───────────── Терминал ───────────── */

const toneColor = (tone: TLine['tone'], theme: keyof typeof THEME) => {
  switch (tone) {
    case 'dim':
      return THEME[theme].dim;
    case 'warn':
      return '#ffb347';
    case 'alert':
      return '#ff4a3a';
    case 'ok':
      return '#6be39b';
    default:
      return THEME[theme].fg;
  }
};

export const TerminalInsert: React.FC<{ins: Of<'terminal'>; t: number}> = ({ins, t}) => {
  const theme = ins.theme ?? 'blue';
  return (
    <Panel w={ins.w ?? 900} h={ins.h} theme={theme} title={ins.title} t={t}>
      <div style={{padding: '26px 30px 30px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 200}}>
        {ins.lines.map((l, i) => {
          if (t < l.t) return null;
          const big = l.tone === 'big';
          const txt = typed(l.text, l.t, t, big ? 26 : 34);
          const done = txt.length >= l.text.length;
          const jit = l.glitch && done && noise1(t * 14 + i, 4) > 0.7 ? (noise1(t * 30, i) - 0.5) * 16 : 0;
          const isLast = i === ins.lines.length - 1 || t < ins.lines[i + 1].t;
          return (
            <div
              key={i}
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: big ? 62 : 38,
                lineHeight: 1.2,
                color: l.tone === 'big' ? '#ffffff' : toneColor(l.tone, theme),
                textShadow: `0 0 18px ${THEME[theme].glow}${l.glitch ? ', 3px 0 #ff3b5c, -3px 0 #46d4ff' : ''}`,
                transform: `translateX(${jit}px)`,
                wordBreak: 'break-word',
              }}
            >
              {txt}
              {isLast && (!done || Math.floor(t * 2.4) % 2 === 0) && <span style={{opacity: 0.8}}>▌</span>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

/* ───────────── Термометр ───────────── */

const Thermometer: React.FC<{value: number; h: number; color: string}> = ({value, h, color}) => {
  const fill = clamp(value / 110);
  return (
    <svg width={h * 0.32} height={h} viewBox="0 0 64 200">
      <rect x={18} y={4} width={28} height={150} rx={14} fill="#10131a" stroke="#cfd6e2" strokeWidth={4} />
      <circle cx={32} cy={166} r={26} fill={color} stroke="#cfd6e2" strokeWidth={4} />
      <rect x={25} y={154 - fill * 136} width={14} height={fill * 136 + 8} rx={7} fill={color} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={46} x2={54} y1={24 + i * 30} y2={24 + i * 30} stroke="#cfd6e2" strokeWidth={3} opacity={0.7} />
      ))}
    </svg>
  );
};

export const ThermoInsert: React.FC<{ins: Of<'thermo'>; t: number}> = ({ins, t}) => {
  const p = easeInOut(progress(t, 0.15, ins.dur - 0.3));
  const v = lerp(ins.from, ins.to, p);
  const c = tempColor(v);
  const big = ins.style === 'big';
  if (big) {
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 36, transform: `scale(${pulse(t, 7, 0.02)})`}}>
        <div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 250, lineHeight: 1, color: c, WebkitTextStroke: '10px #0a0a0f', paintOrder: 'stroke fill', textShadow: `0 0 50px ${c}`}}>
            {Math.round(v)}°
          </div>
          {ins.label && (
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, color: '#fff', letterSpacing: 3, marginTop: 6, textShadow: '0 3px 10px #000'}}>
              {ins.label}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '18px 34px 18px 24px',
        background: 'rgba(8,8,12,0.78)',
        border: `3px solid ${c}`,
        borderRadius: 26,
        boxShadow: `0 0 40px ${c}55`,
      }}
    >
      <Thermometer value={v} h={150} color={c} />
      <div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 112, color: c, lineHeight: 1}}>{Math.round(v)}°C</div>
        {ins.label && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: '#e8e8ee', letterSpacing: 2}}>{ins.label}</div>}
      </div>
    </div>
  );
};

/* ───────────── Крупный текст ───────────── */

export const BigTextInsert: React.FC<{ins: Of<'bigtext'>; t: number}> = ({ins, t}) => {
  const col = ins.color ?? '#fff';
  const g = ins.glitch && noise1(t * 12, 3) > 0.72;
  const off = g ? (noise1(t * 40, 1) - 0.5) * 26 : 0;
  return (
    <div style={{textAlign: 'center', width: 920}}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 118,
          lineHeight: 1.04,
          color: col,
          WebkitTextStroke: '12px #07070b',
          paintOrder: 'stroke fill',
          textShadow: g ? `${off}px 0 #ff3b5c, ${-off}px 0 #46d4ff` : `0 0 40px ${col}66`,
          transform: `translateX(${off}px)`,
          whiteSpace: 'pre-line',
        }}
      >
        {ins.text}
      </div>
      {ins.sub && (
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 22, letterSpacing: 4, textShadow: '0 3px 12px #000'}}>
          {ins.sub}
        </div>
      )}
    </div>
  );
};

/* ───────────── Обратный отсчёт ───────────── */

export const CountdownInsert: React.FC<{ins: Of<'countdown'>; t: number}> = ({ins, t}) => {
  const p = progress(t, 0, ins.dur);
  const s = Math.max(0, Math.ceil(lerp(ins.from, ins.to, p)));
  const hh = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  const clock = ins.from >= 3600 ? `${String(hh).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
  const beat = 1 + 0.06 * Math.exp(-((t * 1) % 1) * 8);
  return (
    <Panel w={820} theme="red" title="ТАЙМЕР ПЕРЕЗАПУСКА" t={t}>
      <div style={{padding: '28px 20px 34px', textAlign: 'center'}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: ins.from >= 3600 ? 130 : 168, color: '#ff4a3a', transform: `scale(${beat})`, textShadow: '0 0 50px #ff4a3a88', letterSpacing: 6}}>
          {clock}
        </div>
        {ins.label && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 32, color: '#ffb0a8', letterSpacing: 3}}>{ins.label}</div>}
      </div>
    </Panel>
  );
};

/* ───────────── Выбор ───────────── */

export const ChoiceInsert: React.FC<{ins: Of<'choice'>; t: number}> = ({ins, t}) => {
  const picked = ins.pick && ins.pickAt !== undefined && t >= ins.pickAt;
  const btn = (text: string, id: 'a' | 'b', disabled: boolean) => {
    const sel = picked && ins.pick === id;
    const press = sel ? 1 - 0.05 * Math.exp(-(t - (ins.pickAt ?? 0)) * 6) : 1;
    return (
      <div
        style={{
          padding: '34px 30px',
          borderRadius: 18,
          border: `4px solid ${disabled ? '#3a4150' : sel ? '#ffffff' : '#46d4ff'}`,
          background: disabled ? '#141821' : sel ? '#46d4ff' : '#0a2433',
          color: disabled ? '#566074' : sel ? '#04121a' : '#aef0ff',
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 44,
          textAlign: 'center',
          letterSpacing: 2,
          transform: `scale(${press})`,
          boxShadow: disabled ? 'none' : `0 0 ${sel ? 70 : 34}px rgba(70,212,255,0.5)`,
          position: 'relative',
        }}
      >
        {disabled && <span style={{marginRight: 14}}>🔒</span>}
        {text}
      </div>
    );
  };
  return (
    <Panel w={900} theme="blue" title="ТЕРРА › ВЫБОР ОПЕРАТОРА" t={t}>
      <div style={{padding: 30, display: 'flex', flexDirection: 'column', gap: 24}}>
        {btn(ins.a, 'a', !!ins.disabledA)}
        {btn(ins.b, 'b', false)}
        {ins.note && (
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 32, color: '#ff6b5c', textAlign: 'center', opacity: 0.55 + 0.45 * Math.abs(Math.sin(t * 3))}}>
            {ins.note}
          </div>
        )}
      </div>
    </Panel>
  );
};
