import React from 'react';
import {Cracks, Floor, Glow, Layer, LocProps, VGrad, X0, X1} from './shared';
import {noise1} from '../animations/noise';
import {TerraCore} from '../characters/Terra';

const BG: React.FC<{id: string; top: string; bottom: string}> = ({id, top, bottom}) => (
  <g>
    <defs>
      <VGrad id={id} stops={[[0, top], [1, bottom]]} />
    </defs>
    <rect x={X0} y={-500} width={X1 - X0} height={1900} fill={`url(#${id})`} />
  </g>
);

/* ───────────────────────── Исследовательский комплекс ───────────────────────── */

export const Complex: React.FC<LocProps> = ({f, variant}) => {
  if (variant === 'lift') {
    const off = (f * 14) % 220;
    return (
      <g>
        <BG id="lift-bg" top="#16243a" bottom="#2a3b57" />
        <Layer depth={0.9}>
          {/* уходящие вверх световые полосы шахты */}
          {Array.from({length: 12}).map((_, i) => (
            <g key={i}>
              <rect x={150} y={-200 + i * 220 - off} width={14} height={120} fill="#46d4ff" opacity={0.45} />
              <rect x={916} y={-200 + i * 220 - off} width={14} height={120} fill="#46d4ff" opacity={0.45} />
            </g>
          ))}
        </Layer>
        
        {/* кабина лифта: стены и панель */}
        <rect x={-100} y={-100} width={260} height={1500} fill="#2c3a55" />
        <rect x={920} y={-100} width={260} height={1500} fill="#2c3a55" />
        <rect x={-100} y={-100} width={1280} height={300} fill="#3a4a68" />
        <rect x={400} y={140} width={280} height={34} rx={6} fill="#46d4ff" opacity={0.7 + 0.2 * Math.sin(f * 0.2)} />
        <Floor y={1340} top="#3a4a68" bottom="#141c2c" id="lift-floor" />
        <rect x={930} y={640} width={90} height={260} rx={10} fill="#10151f" stroke="#3a465c" strokeWidth={4} />
        {Array.from({length: 6}).map((_, i) => (
          <circle key={i} cx={975} cy={680 + i * 36} r={9} fill={i === 5 ? '#ff6b3d' : '#46d4ff'} opacity={0.6 + 0.4 * Math.sin(f * 0.15 + i)} />
        ))}
      </g>
    );
  }
  return (
    <g>
      <BG id="cx-bg" top="#050810" bottom="#10192b" />
      <Layer depth={0.45}>
        {/* дальние колонны и шахты света */}
        {Array.from({length: 10}).map((_, i) => (
          <rect key={i} x={-500 + i * 240} y={300} width={70} height={1060} fill="#0c1424" />
        ))}
        {[200, 620, 960].map((x) => (
          <path key={x} d={`M ${x - 30} -100 L ${x - 160} 1340 L ${x + 160} 1340 L ${x + 30} -100 Z`} fill="#46d4ff" opacity={0.045} />
        ))}
      </Layer>
      <Layer depth={0.7}>
        {/* шестигранная гермодверь */}
        <polygon points="540,420 720,520 720,740 540,840 360,740 360,520" fill="#16203a" stroke="#2a3d66" strokeWidth={12} />
        <polygon points="540,490 660,556 660,704 540,770 420,704 420,556" fill="#0b1326" stroke="#46d4ff" strokeWidth={4} opacity={0.9} />
        <text x={540} y={660} textAnchor="middle" fill="#46d4ff" fontSize={64} fontFamily="Sans, sans-serif" fontWeight={800} opacity={0.5 + 0.4 * noise1(f * 0.2, 8)}>
          ТЕРРА
        </text>
        {/* переход */}
        <rect x={X0} y={900} width={X1 - X0} height={20} fill="#1f2c48" />
        {Array.from({length: 20}).map((_, i) => (
          <rect key={i} x={X0 + i * 120} y={920} width={8} height={420} fill="#101a30" />
        ))}
      </Layer>
      <Floor y={1340} top="#16213a" bottom="#070b14" id="cx-floor" />
      <Layer depth={1}>
        <rect x={X0} y={1336} width={X1 - X0} height={6} fill="#46d4ff" opacity={0.35} />
        {Array.from({length: 12}).map((_, i) => (
          <rect key={i} x={-540 + i * 190} y={1600} width={90} height={6} fill="#46d4ff" opacity={0.1} />
        ))}
        <Cracks seed={44} y0={1420} y1={1860} color="#05070d" n={6} />
      </Layer>
    </g>
  );
};

/* ───────────────────────── Подземная лаборатория ───────────────────────── */

const Rack: React.FC<{x: number; y: number; w: number; h: number; f: number; seed: number}> = ({x, y, w, h, f, seed}) => (
  <g transform={`translate(${x},${y})`}>
    <rect width={w} height={h} fill="#0d1526" stroke="#1f2f4d" strokeWidth={3} />
    {Array.from({length: Math.floor(h / 40)}).map((_, i) => (
      <g key={i}>
        <rect x={10} y={10 + i * 40} width={w - 20} height={26} fill="#091020" />
        {Array.from({length: 4}).map((_, j) => {
          const on = noise1(f * 0.12 + i * 3 + j * 7, seed) > 0.45;
          return <circle key={j} cx={22 + j * 14} cy={23 + i * 40} r={3.5} fill={on ? '#46d4ff' : '#1b3350'} />;
        })}
      </g>
    ))}
  </g>
);

export const Lab: React.FC<LocProps> = ({f, variant}) => {
  const hostile = variant === 'hostile';
  return (
    <g>
      <BG id="lab-bg" top="#04070d" bottom="#0d1628" />
      {/* ядро ТЕРРА в нише */}
      <Layer depth={0.55}>
        <circle cx={540} cy={620} r={330} fill="#07101e" stroke="#1f2f4d" strokeWidth={10} />
        <g transform="translate(240,320)">
          <TerraCore size={600} f={f} mode={hostile ? 'hostile' : 'calm'} id="labcore" />
        </g>
      </Layer>
      <Layer depth={0.75}>
        {[-380, -160, 780, 1000].map((x, i) => (
          <Rack key={x} x={x} y={560 - (i % 2) * 40} w={170} h={780 + (i % 2) * 40} f={f} seed={i + 1} />
        ))}
      </Layer>
      <Floor y={1340} top="#101b30" bottom="#05080f" id="lab-floor" />
      <Layer depth={1}>
        <rect x={X0} y={1336} width={X1 - X0} height={5} fill={hostile ? '#ff4a3a' : '#46d4ff'} opacity={0.4} />
        {/* центральный пульт */}
        <rect x={160} y={1160} width={760} height={30} rx={6} fill="#1a2740" />
        <rect x={190} y={1190} width={20} height={152} fill="#0e1729" />
        <rect x={870} y={1190} width={20} height={152} fill="#0e1729" />
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${230 + i * 230},1160)`}>
              <rect x={0} y={-170} width={190} height={140} rx={8} fill="#0a1222" stroke="#2a3d66" strokeWidth={4} />
              <rect x={12} y={-158} width={166} height={116} rx={4} fill="#0e2a44" opacity={0.9} />
              {[0, 1, 2, 3].map((j) => (
                <rect key={j} x={24} y={-146 + j * 24} width={60 + ((i * 37 + j * 23) % 80)} height={9} rx={3} fill="#46d4ff" opacity={0.55} />
              ))}
            </g>
          ))}
        </g>
        <Glow x={160} y={980} w={760} h={190} color={hostile ? '#ff4a3a' : '#46d4ff'} opacity={0.1} blur={60} />
      </Layer>
    </g>
  );
};
