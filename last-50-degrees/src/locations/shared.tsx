import React, {createContext, useContext} from 'react';
import {noise1, rng} from '../animations/noise';

/** Смещение камеры относительно центра кадра (px) — основа параллакса. */
export interface ParallaxState {
  dx: number;
  dy: number;
}
export const ParallaxContext = createContext<ParallaxState>({dx: 0, dy: 0});

/**
 * Слой с глубиной: 0 — бесконечно далеко (не двигается вместе с камерой),
 * 1 — на плоскости персонажей, >1 — передний план.
 */
export const Layer: React.FC<{depth: number; children: React.ReactNode}> = ({depth, children}) => {
  const {dx, dy} = useContext(ParallaxContext);
  return <g transform={`translate(${dx * (1 - depth)},${dy * (1 - depth) * 0.55})`}>{children}</g>;
};

export interface LocProps {
  f: number;
  variant?: string;
  heat?: number;
}

export const X0 = -560;
export const X1 = 1640;

/** Вертикальный градиент по списку остановок. */
export const VGrad: React.FC<{id: string; stops: [number, string, number?][]; x2?: number}> = ({id, stops, x2 = 0}) => (
  <linearGradient id={id} x1="0" y1="0" x2={x2} y2="1">
    {stops.map(([o, c, a], i) => (
      <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />
    ))}
  </linearGradient>
);

export const Radial: React.FC<{id: string; stops: [number, string, number][]}> = ({id, stops}) => (
  <radialGradient id={id}>
    {stops.map(([o, c, a], i) => (
      <stop key={i} offset={o} stopColor={c} stopOpacity={a} />
    ))}
  </radialGradient>
);

interface SkylineProps {
  seed: number;
  base: number;
  minH: number;
  maxH: number;
  minW: number;
  maxW: number;
  color: string;
  x0?: number;
  x1?: number;
  windows?: string;
  winOn?: string;
  /** 0..1 — насколько «обгрызены» крыши. */
  ruin?: number;
  f?: number;
}

/** Силуэт разрушенного города: детерминированный набор зданий с рваными крышами. */
export const Skyline: React.FC<SkylineProps> = ({
  seed,
  base,
  minH,
  maxH,
  minW,
  maxW,
  color,
  x0 = X0,
  x1 = X1,
  windows,
  winOn,
  ruin = 0.6,
  f = 0,
}) => {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const w = minW + r() * (maxW - minW);
    const h = minH + r() * (maxH - minH);
    const cutL = r() * ruin * 120;
    const cutR = r() * ruin * 160;
    const notchX = x + w * (0.3 + r() * 0.4);
    const notch = r() > 0.55 ? 20 + r() * 50 : 0;
    const top = base - h;
    out.push(
      <path
        key={`b${i}`}
        fill={color}
        d={`M ${x} ${base + 4} L ${x} ${top + cutL} L ${x + w * 0.3} ${top + cutL * 0.4} L ${notchX} ${top} L ${notchX + 14} ${top + notch} L ${x + w * 0.8} ${top + cutR * 0.5} L ${x + w} ${top + cutR} L ${x + w} ${base + 4} Z`}
      />,
    );
    if (windows) {
      const cols = Math.max(1, Math.floor(w / 44));
      const rows = Math.floor((h - 60) / 64);
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const v = r();
          if (v < 0.42) {
            const wx = x + 14 + cx * ((w - 28) / cols);
            const wy = top + cutL + 40 + cy * 64;
            if (wy < base - 40)
              out.push(
                <rect
                  key={`w${i}-${cx}-${cy}`}
                  x={wx}
                  y={wy}
                  width={16}
                  height={26}
                  rx={2}
                  fill={winOn && v < 0.03 ? winOn : windows}
                />,
              );
          }
        }
      }
    }
    x += w - 4 + r() * 10;
    i++;
  }
  return <g>{out}</g>;
};

/** Подвесная лампа с конусом света и мерцанием. */
export const HangingLamp: React.FC<{
  x: number;
  y: number;
  f: number;
  color?: string;
  coneH?: number;
  coneW?: number;
  flicker?: number;
  seed?: number;
  gid: string;
}> = ({x, y, f, color = '#ffc857', coneH = 620, coneW = 150, flicker = 0.25, seed = 1, gid}) => {
  const n = noise1(f * 0.35, seed);
  const dip = n < 0.18 ? 0.35 : 1;
  const k = 1 - flicker * (1 - dip) - (flicker * 0.3 * noise1(f * 0.9, seed + 3));
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.5 * k} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`M ${x - 22} ${y + 20} L ${x - coneW} ${y + coneH} L ${x + coneW} ${y + coneH} L ${x + 22} ${y + 20} Z`} fill={`url(#${gid})`} />
      <line x1={x} y1={y - 400} x2={x} y2={y} stroke="#0a0d14" strokeWidth={4} />
      <path d={`M ${x - 26} ${y + 22} L ${x - 16} ${y} L ${x + 16} ${y} L ${x + 26} ${y + 22} Z`} fill="#1a1f2b" />
      <ellipse cx={x} cy={y + 24} rx={20} ry={8} fill={color} opacity={0.5 + 0.5 * k} />
    </g>
  );
};

/** Светящееся окно/экран: мягкое свечение вокруг прямоугольника. */
export const Glow: React.FC<{x: number; y: number; w: number; h: number; color: string; opacity?: number; blur?: number}> = ({
  x,
  y,
  w,
  h,
  color,
  opacity = 0.5,
  blur = 40,
}) => (
  <g opacity={opacity} style={{filter: `blur(${blur}px)`}}>
    <rect x={x - 20} y={y - 20} width={w + 40} height={h + 40} fill={color} />
  </g>
);

/** Контрастная земля/пол с мягкой тенью под ногами. */
export const Floor: React.FC<{y: number; top: string; bottom: string; id: string; x0?: number; x1?: number}> = ({
  y,
  top,
  bottom,
  id,
  x0 = X0,
  x1 = X1,
}) => (
  <g>
    <defs>
      <VGrad
        id={id}
        stops={[
          [0, top],
          [1, bottom],
        ]}
      />
    </defs>
    <rect x={x0} y={y} width={x1 - x0} height={2200 - y} fill={`url(#${id})`} />
  </g>
);

export const Cracks: React.FC<{seed: number; y0: number; y1: number; color: string; n?: number}> = ({seed, y0, y1, color, n = 14}) => {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    let x = X0 + r() * (X1 - X0);
    let y = y0 + r() * (y1 - y0);
    let d = `M ${x} ${y}`;
    const len = 3 + Math.floor(r() * 4);
    for (let j = 0; j < len; j++) {
      x += (r() - 0.4) * 80;
      y += (r() - 0.5) * 26;
      d += ` L ${x} ${y}`;
    }
    out.push(<path key={i} d={d} stroke={color} strokeWidth={2 + r() * 3} fill="none" strokeLinecap="round" opacity={0.7} />);
  }
  return <g>{out}</g>;
};
