import React from 'react';
import {MONO, SANS} from '../../styles/fonts';
import {clamp} from '../../animations/ease';

export const typed = (text: string, t0: number, t: number, cps = 38) =>
  text.slice(0, Math.max(0, Math.floor((t - t0) * cps)));

export const THEME = {
  blue: {fg: '#46d4ff', dim: '#1b6d8f', bg: '#06141f', border: '#2a7fa6', glow: 'rgba(70,212,255,0.35)'},
  amber: {fg: '#ffc857', dim: '#8a6420', bg: '#171007', border: '#b9862b', glow: 'rgba(255,200,87,0.3)'},
  red: {fg: '#ff4a3a', dim: '#7a1c16', bg: '#190807', border: '#c2352a', glow: 'rgba(255,74,58,0.35)'},
} as const;
export type ThemeName = keyof typeof THEME;

export const tempColor = (v: number) => {
  if (v < 20) return '#46d4ff';
  if (v < 35) return '#ffd447';
  if (v < 55) return '#ff9a3c';
  return '#ff3b3b';
};

export const Panel: React.FC<{
  w: number;
  h?: number;
  theme?: ThemeName;
  title?: string;
  t: number;
  children: React.ReactNode;
  scan?: boolean;
}> = ({w, h, theme = 'blue', title, t, children, scan = true}) => {
  const th = THEME[theme];
  return (
    <div
      style={{
        width: w,
        height: h,
        background: th.bg,
        border: `4px solid ${th.border}`,
        borderRadius: 22,
        boxShadow: `0 0 60px ${th.glow}, inset 0 0 40px rgba(0,0,0,0.6)`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 22px',
            background: th.dim,
            color: '#fff',
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 2,
          }}
        >
          <span style={{width: 14, height: 14, borderRadius: 7, background: th.fg, opacity: Math.floor(t * 2) % 2 ? 1 : 0.3}} />
          {title}
        </div>
      )}
      {children}
      {scan && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 5px)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

export const label = (color = '#fff', size = 30): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: 800,
  fontSize: size,
  color,
  letterSpacing: 1,
});

export const pulse = (t: number, speed = 6, amp = 0.05) => 1 + Math.sin(t * speed) * amp;
export const fadeIO = (t: number, dur: number, a = 0.25, b = 0.25) => clamp(Math.min(t / a, (dur - t) / b));
