import React from 'react';
import {noise1} from '../animations/noise';

/**
 * ТЕРРА — ИИ, управляющий климатом. Не человек: «ядро» из колец и геометрического интерфейса.
 * mode="hostile" — красный, быстрее вращение, нервные помехи.
 */
export const TerraCore: React.FC<{size?: number; f: number; mode?: 'calm' | 'hostile'; id?: string}> = ({
  size = 600,
  f,
  mode = 'calm',
  id = 'terra',
}) => {
  const hostile = mode === 'hostile';
  const col = hostile ? '#ff4a3a' : '#46d4ff';
  const dim = hostile ? '#7a1c16' : '#1b6d8f';
  const speed = hostile ? 2.2 : 1;
  const jit = hostile ? (noise1(f * 0.8, 3) - 0.5) * 8 : 0;
  const pulse = 1 + Math.sin(f * (hostile ? 0.22 : 0.08)) * 0.06;
  const R = size / 2;
  const ticks = Array.from({length: 48});
  const seg = Array.from({length: 6});
  return (
    <svg width={size} height={size} viewBox={`${-R} ${-R} ${size} ${size}`} style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id={`${id}-g`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="0.25" stopColor={col} stopOpacity={0.85} />
          <stop offset="1" stopColor={col} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={R * 0.98} fill={`url(#${id}-g)`} opacity={0.22} />
      <g transform={`translate(${jit},0)`}>
        <g transform={`rotate(${f * 0.5 * speed})`}>
          <circle r={R * 0.92} fill="none" stroke={dim} strokeWidth={3} />
          {seg.map((_, i) => (
            <path
              key={i}
              d={`M ${R * 0.92} 0 A ${R * 0.92} ${R * 0.92} 0 0 1 ${R * 0.92 * Math.cos(0.7)} ${R * 0.92 * Math.sin(0.7)}`}
              transform={`rotate(${i * 60})`}
              stroke={col}
              strokeWidth={9}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </g>
        <g transform={`rotate(${-f * 0.9 * speed})`}>
          <circle r={R * 0.76} fill="none" stroke={dim} strokeWidth={2} />
          {ticks.map((_, i) => (
            <line key={i} x1={R * 0.7} y1={0} x2={R * (i % 4 === 0 ? 0.82 : 0.76)} y2={0} stroke={col} strokeWidth={i % 4 === 0 ? 4 : 2} transform={`rotate(${(i * 360) / 48})`} opacity={0.8} />
          ))}
        </g>
        <g transform={`rotate(${f * 1.4 * speed})`}>
          <polygon
            points={Array.from({length: 6})
              .map((_, i) => `${Math.cos((i * Math.PI) / 3) * R * 0.55},${Math.sin((i * Math.PI) / 3) * R * 0.55}`)
              .join(' ')}
            fill="none"
            stroke={col}
            strokeWidth={4}
            opacity={0.9}
          />
        </g>
        {/* «глаз» */}
        <circle r={R * 0.34 * pulse} fill="#04121a" stroke={col} strokeWidth={5} />
        <circle r={R * 0.2 * pulse} fill={`url(#${id}-g)`} />
        <circle r={R * 0.07} fill="#ffffff" />
        <line x1={-R * 0.34} y1={0} x2={R * 0.34} y2={0} stroke={col} strokeWidth={2} opacity={0.5} transform={`rotate(${f * 2})`} />
      </g>
    </svg>
  );
};

/**
 * Облик ТЕРРА по референсу: фигура в плаще с кубической головой и круглым «глазом», рядом плавающие панели.
 * Используется поверх колец TerraCore (вставка `terra`).
 */
export const TerraAvatar: React.FC<{f: number; mode?: 'calm' | 'hostile'; height?: number}> = ({f, mode = 'calm', height = 560}) => {
  const col = mode === 'hostile' ? '#ff4a3a' : '#46d4ff';
  const pulse = 1 + Math.sin(f * (mode === 'hostile' ? 0.25 : 0.09)) * 0.08;
  const bob = Math.sin(f * 0.05) * 6;
  return (
    <svg width={height * 0.9} height={height} viewBox="-230 -300 460 560" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="tv-cloak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#222838" />
          <stop offset="1" stopColor="#0a0c13" />
        </linearGradient>
      </defs>
      <g transform={`translate(0,${bob})`}>
        {/* плащ */}
        <path d="M -48 -70 L 48 -70 L 150 240 L 78 262 L 30 222 L -22 262 L -80 226 L -150 240 Z" fill="url(#tv-cloak)" stroke={col} strokeWidth={3} strokeOpacity={0.55} strokeLinejoin="round" />
        <path d="M -48 -70 L 0 -30 L 48 -70" fill="#151a27" />
        <path d="M 0 -30 L 0 220" stroke={col} strokeWidth={2} opacity={0.35} />
        {/* руки */}
        <path d="M -48 -60 L -92 40 L -70 52 L -36 -20 Z" fill="#161b28" stroke={col} strokeWidth={2} strokeOpacity={0.4} />
        <circle cx={-76} cy={58} r={17} fill="#2b3142" />
        <path d="M 48 -60 L 96 30 L 74 46 L 36 -20 Z" fill="#161b28" stroke={col} strokeWidth={2} strokeOpacity={0.4} />
        <circle cx={84} cy={50} r={17} fill="#2b3142" />
        {/* кубическая голова */}
        <rect x={-46} y={-176} width={92} height={96} rx={9} fill="#2d3344" />
        <rect x={-46} y={-176} width={92} height={20} rx={9} fill="#3c4458" />
        <rect x={30} y={-176} width={16} height={96} rx={6} fill="#1c2130" />
        <circle cx={-6} cy={-124} r={22 * pulse} fill="#05101a" stroke={col} strokeWidth={5} />
        <circle cx={-6} cy={-124} r={8 * pulse} fill={col} />
        <rect x={-46} y={-176} width={92} height={96} rx={9} fill="none" stroke={col} strokeWidth={2.5} opacity={0.5} />
      </g>
      {/* плавающие панели */}
      <g transform={`translate(-215,${-150 + Math.sin(f * 0.07) * 8})`}>
        <rect width={74} height={116} rx={8} fill="#08141f" stroke={col} strokeWidth={3} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={10} y={16 + i * 20} width={i % 2 ? 40 : 54} height={7} rx={3} fill={col} opacity={0.6} />
        ))}
      </g>
      <g transform={`translate(145,${-70 + Math.sin(f * 0.06 + 2) * 8})`}>
        <rect width={86} height={140} rx={8} fill="#08141f" stroke={col} strokeWidth={3} />
        <rect x={10} y={12} width={30} height={30} rx={4} fill="none" stroke={col} strokeWidth={3} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={10} y={54 + i * 14} width={i % 2 ? 44 : 62} height={6} rx={3} fill={col} opacity={0.55} />
        ))}
      </g>
    </svg>
  );
};
