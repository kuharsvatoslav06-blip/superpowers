import React from 'react';
import {H, W} from '../config';
import type {FxDef} from '../types';
import {noise1, rng} from '../animations/noise';

/** Пылинки: детерминированные, дрейфуют по ветру. */
export const Dust: React.FC<{density: number; t: number; color?: string}> = ({density, t, color = '#ffe2b0'}) => {
  const n = Math.round(70 * density);
  const r = rng(77);
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const bx = r() * W;
        const by = r() * H;
        const sp = 10 + r() * 36;
        const sz = 1.4 + r() * 3.6;
        const x = (((bx + t * sp * 2.2) % (W + 80)) + W + 80) % (W + 80) - 40;
        const y = (((by + Math.sin(t * 0.6 + i) * 20 - t * sp * 0.3) % H) + H) % H;
        return <circle key={i} cx={x} cy={y} r={sz} fill={color} opacity={0.12 + r() * 0.3} />;
      })}
    </g>
  );
};

export const Embers: React.FC<{density: number; t: number}> = ({density, t}) => {
  const n = Math.round(34 * density);
  const r = rng(31);
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const bx = r() * W;
        const sp = 60 + r() * 120;
        const ph = r() * H;
        const y = H - (((ph + t * sp) % (H + 100)) + (H + 100)) % (H + 100) + 50;
        const x = bx + Math.sin(t * 1.4 + i) * 40 + (H - y) * 0.25;
        return <circle key={i} cx={x % (W + 60)} cy={y} r={2 + r() * 3} fill={i % 3 ? '#ff8a3c' : '#ffd27a'} opacity={0.35 + r() * 0.5} />;
      })}
    </g>
  );
};

export const SunRays: React.FC<{x: number; y: number; opacity: number; t: number}> = ({x, y, opacity, t}) => (
  <g style={{mixBlendMode: 'screen'}}>
    <defs>
      <linearGradient id="rayg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffd08a" stopOpacity={opacity} />
        <stop offset="1" stopColor="#ffd08a" stopOpacity={0} />
      </linearGradient>
    </defs>
    {Array.from({length: 9}).map((_, i) => {
      const a = 18 + i * 14 + Math.sin(t * 0.5 + i) * 3;
      const w = 5 + (i % 3) * 3;
      return (
        <g key={i} transform={`translate(${x},${y}) rotate(${a})`}>
          <path d={`M 0 0 L 2400 ${-w * 24} L 2400 ${w * 24} Z`} fill="url(#rayg)" opacity={0.4 + 0.3 * noise1(t * 0.7 + i, 5)} />
        </g>
      );
    })}
  </g>
);

export const HeatFilter: React.FC<{id: string; amount: number; f: number}> = ({id, amount, f}) => (
  // фильтр ограничен полосой у горизонта (мир. координаты): так он в разы дешевле, чем на всю сцену
  <filter id={id} filterUnits="userSpaceOnUse" x={-560} y={720} width={2200} height={640}>
    <feTurbulence type="turbulence" baseFrequency={`0.006 ${0.02 + Math.sin(f * 0.03) * 0.004}`} numOctaves={1} seed={3} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale={16 * amount} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

export const GlitchBars: React.FC<{t: number; at: number[]}> = ({t, at}) => {
  const hit = at.find((a) => t >= a && t <= a + 0.32);
  if (hit === undefined) return null;
  const k = Math.floor((t - hit) * 30);
  const r = rng(k * 13 + 5);
  return (
    <g>
      {Array.from({length: 9}).map((_, i) => {
        const y = r() * H;
        const h = 8 + r() * 70;
        const c = ['#46d4ff', '#ff3b5c', '#ffffff', '#101018'][Math.floor(r() * 4)];
        return <rect key={i} x={(r() - 0.3) * 120} y={y} width={W + 160} height={h} fill={c} opacity={0.25 + r() * 0.4} style={{mixBlendMode: 'screen'}} />;
      })}
    </g>
  );
};

/** Все экранные эффекты сцены (поверх картинки, в экранных координатах). */
export const FxOverlay: React.FC<{fx?: FxDef; t: number; f: number}> = ({fx, t, f}) => {
  if (!fx) fx = {};
  const flick = fx.flicker ? 1 - 0.28 * (noise1(f * 0.5, 7) < 0.14 ? 1 : 0) - 0.05 * noise1(f * 1.2, 9) : 1;
  const alarm = fx.alarm ? 0.16 + 0.26 * Math.max(0, Math.sin(t * 7)) : 0;
  const flash = (fx.flashAt ?? []).reduce((m, a) => (t >= a ? Math.max(m, Math.exp(-(t - a) * 9)) : m), 0);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <defs>
        <radialGradient id="vig" cx="50%" cy="50%" r="75%">
          <stop offset="0.45" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={1} />
        </radialGradient>
        <linearGradient id="scanline" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0.26} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </linearGradient>
        <pattern id="scanpat" width="4" height="6" patternUnits="userSpaceOnUse">
          <rect width="4" height="2" fill="#000" opacity={0.18} />
        </pattern>
      </defs>
      {fx.rays && <SunRays x={fx.rays.x} y={fx.rays.y} opacity={fx.rays.opacity ?? 0.32} t={t} />}
      {fx.dust ? <Dust density={fx.dust} t={t} /> : null}
      {fx.embers ? <Embers density={fx.embers} t={t} /> : null}
      {fx.tint && <rect width={W} height={H} fill={fx.tint.color} opacity={fx.tint.opacity} />}
      {fx.flicker && <rect width={W} height={H} fill="#000" opacity={1 - flick} />}
      {alarm > 0 && <rect width={W} height={H} fill="#ff1d1d" opacity={alarm} style={{mixBlendMode: 'multiply'}} />}
      {alarm > 0 && <rect width={W} height={H} fill="#ff2a1a" opacity={alarm * 0.35} style={{mixBlendMode: 'screen'}} />}
      {fx.scan && <rect width={W} height={H} fill="url(#scanpat)" />}
      <rect width={W} height={H} fill="url(#vig)" opacity={fx.vignette ?? 0.55} />
      {fx.glitchAt && <GlitchBars t={t} at={fx.glitchAt} />}
      {flash > 0.01 && <rect width={W} height={H} fill="#fff" opacity={flash} />}
    </svg>
  );
};
