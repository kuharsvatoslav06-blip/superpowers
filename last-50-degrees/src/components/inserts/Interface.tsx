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

/* ───────────── Запасы (инфографика) ───────────── */

const ItemIcon: React.FC<{kind: 'water' | 'food' | 'light' | 'map'; f: number}> = ({kind, f}) => {
  switch (kind) {
    case 'water':
      return (
        <svg width={120} height={150} viewBox="0 0 120 150">
          <rect x={44} y={6} width={32} height={20} rx={5} fill="#cfd6e2" />
          <path d="M 34 30 Q 34 22 44 22 L 76 22 Q 86 22 86 30 L 92 130 Q 92 144 78 144 L 42 144 Q 28 144 28 130 Z" fill="#1b3b52" stroke="#7fd8ff" strokeWidth={4} />
          <path d="M 31 64 Q 60 52 89 64 L 92 130 Q 92 144 78 144 L 42 144 Q 28 144 28 130 Z" fill="#46d4ff" opacity={0.85} />
          <circle cx={48} cy={96} r={5} fill="#fff" opacity={0.6} />
        </svg>
      );
    case 'food':
      return (
        <svg width={120} height={150} viewBox="0 0 120 150">
          <ellipse cx={60} cy={40} rx={38} ry={12} fill="#c9ced8" />
          <rect x={22} y={40} width={76} height={86} fill="#d9692a" />
          <rect x={22} y={64} width={76} height={36} fill="#f3d36a" />
          <text x={60} y={90} textAnchor="middle" fontFamily="Sans, sans-serif" fontWeight={800} fontSize={22} fill="#5a2a10">ЕДА</text>
          <ellipse cx={60} cy={126} rx={38} ry={12} fill="#a9aeb8" />
        </svg>
      );
    case 'light': {
      const glow = 0.55 + 0.25 * Math.sin(f * 0.15);
      return (
        <svg width={120} height={150} viewBox="0 0 120 150">
          <path d="M 60 70 L 8 8 L 112 8 Z" fill="#ffe27a" opacity={glow * 0.5} />
          <rect x={44} y={56} width={32} height={86} rx={8} fill="#3b4a66" stroke="#9fb4d8" strokeWidth={3} />
          <path d="M 34 36 L 86 36 L 76 62 L 44 62 Z" fill="#6f7f9f" />
          <ellipse cx={60} cy={36} rx={26} ry={6} fill="#fff6c8" />
        </svg>
      );
    }
    case 'map':
      return (
        <svg width={120} height={150} viewBox="0 0 120 150">
          <path d="M 12 30 L 44 20 L 76 32 L 108 22 L 108 120 L 76 130 L 44 118 L 12 128 Z" fill="#e8d9a8" stroke="#8a6a2a" strokeWidth={3} />
          <path d="M 44 20 L 44 118 M 76 32 L 76 130" stroke="#8a6a2a" strokeWidth={2} />
          <path d="M 22 100 Q 50 60 70 84 T 98 50" stroke="#c2352a" strokeWidth={4} fill="none" strokeDasharray="8 6" />
          <path d="M 92 44 l 12 12 m 0 -12 l -12 12" stroke="#c2352a" strokeWidth={5} strokeLinecap="round" />
        </svg>
      );
  }
};

export const ItemsInsert: React.FC<{ins: Of<'items'>; t: number}> = ({ins, t}) => (
  <div style={{width: 940}}>
    {ins.title && (
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 32, color: '#ffd447', letterSpacing: 6, textAlign: 'center', marginBottom: 18, textShadow: '0 3px 10px #000'}}>
        {ins.title}
      </div>
    )}
    <div style={{display: 'flex', gap: 18, justifyContent: 'center'}}>
      {ins.items.map((it, i) => {
        const p = easeOutBack(progress(t, 0.15 + i * 0.7, 0.55 + i * 0.7));
        const tick = progress(t, 0.7 + i * 0.7, 0.95 + i * 0.7);
        return (
          <div
            key={i}
            style={{
              width: 212,
              padding: '22px 8px 16px',
              borderRadius: 22,
              background: 'linear-gradient(160deg, rgba(40,52,78,0.92), rgba(16,20,34,0.92))',
              border: '3px solid #ffb347',
              boxShadow: '0 0 36px rgba(255,170,60,0.45)',
              textAlign: 'center',
              transform: `scale(${clamp(p, 0, 1.12)}) rotate(${(1 - clamp(p)) * -8}deg)`,
              opacity: clamp(p),
              position: 'relative',
            }}
          >
            <ItemIcon kind={it.icon} f={t * 30} />
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#fff', marginTop: 8}}>{it.label}</div>
            {it.sub && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, color: '#ffd447', marginTop: 2}}>{it.sub}</div>}
            <div style={{position: 'absolute', right: -10, top: -14, width: 46, height: 46, borderRadius: 23, background: '#6be39b', color: '#06210f', fontSize: 30, fontWeight: 800, lineHeight: '46px', transform: `scale(${easeOutBack(tick)})`, opacity: tick}}>
              ✓
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ───────────── Радио: поиск волны ───────────── */

export const RadioInsert: React.FC<{ins: Of<'radio'>; t: number}> = ({ins, t}) => {
  const lock = progress(t, 0.15, 1.65);
  const freq = lerp(ins.from, ins.to, easeInOut(lock));
  const locked = lock >= 1;
  return (
    <Panel w={860} theme="amber" title="РАДИОПРИЁМНИК · АВАРИЙНЫЙ КАНАЛ" t={t}>
      <div style={{padding: '22px 28px 28px'}}>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 14}}>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 120, color: '#ffc857', textShadow: '0 0 30px rgba(255,200,87,0.6)'}}>{freq.toFixed(1)}</div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 40, color: '#b9862b'}}>МГц</div>
        </div>
        {/* шкала */}
        <div style={{position: 'relative', height: 54, margin: '6px 0 14px', borderBottom: '3px solid #8a6420'}}>
          {Array.from({length: 41}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: `${(i / 40) * 100}%`, bottom: 0, width: 3, height: i % 5 === 0 ? 34 : 18, background: '#b9862b'}} />
          ))}
          <div style={{position: 'absolute', left: `${clamp((freq - ins.from) / (ins.to - ins.from || 1)) * 100}%`, bottom: -4, width: 6, height: 58, background: '#ff4a3a', boxShadow: '0 0 14px #ff4a3a', borderRadius: 3}} />
        </div>
        {/* сигнал: шум → ровная волна */}
        <div style={{display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', height: 90}}>
          {Array.from({length: 34}).map((_, i) => {
            const noise = noise1(t * 14 + i * 2.1, 3);
            const clean = 0.5 + 0.45 * Math.sin(t * 8 + i * 0.5);
            const v = lerp(noise, clean, locked ? 1 : lock * lock);
            return <div key={i} style={{width: 14, height: 8 + v * 80, borderRadius: 7, background: locked ? '#6be39b' : '#ffb347', opacity: 0.9}} />;
          })}
        </div>
        {ins.banner && locked && (
          <div style={{marginTop: 16, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 34, color: '#ff4a3a', letterSpacing: 3, opacity: 0.6 + 0.4 * Math.abs(Math.sin(t * 6))}}>
            ⚠ {ins.banner}
          </div>
        )}
      </div>
    </Panel>
  );
};
