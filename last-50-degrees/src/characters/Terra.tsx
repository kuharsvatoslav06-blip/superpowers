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
