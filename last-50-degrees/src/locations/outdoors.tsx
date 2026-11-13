import React from 'react';
import {Cracks, Floor, Glow, Layer, LocProps, Radial, Skyline, VGrad, X0, X1} from './shared';
import {noise1, rng} from '../animations/noise';

/* ───────────────────────── Небо и солнце ───────────────────────── */

export const Sky: React.FC<{
  id: string;
  f: number;
  sunX: number;
  sunY: number;
  sunR?: number;
  heat?: number;
  stops?: [number, string][];
  haze?: string;
}> = ({id, f, sunX, sunY, sunR = 130, heat = 0, stops, haze = '#ff9a3c'}) => {
  const pulse = 1 + Math.sin(f * 0.035) * 0.015;
  const st: [number, string][] =
    stops ?? [
      [0, '#240806'],
      [0.35, heat > 0.5 ? '#9a1d10' : '#7a2412'],
      [0.62, '#d4521f'],
      [0.8, '#f08a3c'],
      [1, '#f9c27a'],
    ];
  return (
    <g>
      <defs>
        <VGrad id={`${id}-sky`} stops={st} />
        <Radial
          id={`${id}-glow`}
          stops={[
            [0, '#fff3cf', 0.95],
            [0.18, '#ffc268', 0.55],
            [0.55, haze, 0.18],
            [1, haze, 0],
          ]}
        />
      </defs>
      <Layer depth={0.02}>
        <rect x={X0} y={-500} width={X1 - X0} height={2000} fill={`url(#${id}-sky)`} />
      </Layer>
      <Layer depth={0.06}>
        <circle cx={sunX} cy={sunY} r={sunR * 4.4 * pulse} fill={`url(#${id}-glow)`} />
        <circle cx={sunX} cy={sunY} r={sunR * pulse} fill="#fff6dc" />
        <circle cx={sunX} cy={sunY} r={sunR * 0.82 * pulse} fill="#ffffff" opacity={0.7} />
      </Layer>
      {/* дымные полосы на небе */}
      <Layer depth={0.12}>
        {[0, 1, 2].map((i) => {
          const x = ((f * (0.3 + i * 0.15) + i * 420) % 2000) - 500;
          return (
            <ellipse key={i} cx={x} cy={420 + i * 150} rx={360} ry={26} fill="#3a0f0a" opacity={0.28 - i * 0.05} />
          );
        })}
      </Layer>
    </g>
  );
};

/* ───────────────────────── Разрушенный город ───────────────────────── */

export const City: React.FC<LocProps> = ({f, variant, heat = 0.5}) => {
  const t = variant === 'terminal';
  const blink = noise1(f * 0.25, 4) > 0.2 ? 1 : 0.55;
  return (
    <g>
      <Sky id="city" f={f} sunX={720} sunY={620} sunR={140} heat={heat} />
      <Layer depth={0.22}>
        <Skyline seed={11} base={1190} minH={160} maxH={420} minW={90} maxW={190} color="#c0552c" ruin={0.4} />
      </Layer>
      <Layer depth={0.4}>
        <Skyline seed={23} base={1250} minH={260} maxH={640} minW={110} maxW={230} color="#8a2e18" windows="#5a1a10" ruin={0.6} />
      </Layer>
      <Layer depth={0.65}>
        <Skyline seed={37} base={1330} minH={380} maxH={860} minW={150} maxW={290} color="#4a1b12" windows="#2a0e0a" ruin={0.8} winOn="#ffb25a" />
      </Layer>
      {/* дымка у горизонта */}
      <Layer depth={0.7}>
        <rect x={X0} y={1050} width={X1 - X0} height={300} fill="#f08a3c" opacity={0.14} />
      </Layer>
      <Floor y={1338} top="#3a2724" bottom="#1a1210" id="city-floor" />
      <Layer depth={1}>
        <rect x={X0} y={1338} width={X1 - X0} height={22} fill="#5c4540" />
        <rect x={X0} y={1360} width={X1 - X0} height={6} fill="#0c0806" opacity={0.5} />
        <Cracks seed={5} y0={1400} y1={1880} color="#0d0807" n={18} />
        {Array.from({length: 9}).map((_, i) => (
          <rect key={i} x={-480 + i * 260} y={1640} width={130} height={14} rx={4} fill="#c9a86a" opacity={0.28} />
        ))}
        {/* брошенная машина */}
        <g transform="translate(-130,1350)">
          <rect x={0} y={-82} width={250} height={62} rx={14} fill="#241513" />
          <path d="M 40 -82 L 70 -128 L 176 -128 L 210 -82 Z" fill="#2e1b17" />
          <path d="M 80 -86 L 96 -120 L 130 -120 L 130 -86 Z M 140 -86 L 140 -120 L 170 -120 L 192 -86 Z" fill="#4a2a20" opacity={0.7} />
          <circle cx={52} cy={-18} r={26} fill="#0b0807" />
          <circle cx={198} cy={-18} r={26} fill="#0b0807" />
        </g>
        {/* погнутый фонарь */}
        <g transform="translate(980,1350)">
          <path d="M 0 0 L 0 -420 Q 0 -470 -60 -480 L -110 -470" stroke="#1a100d" strokeWidth={16} fill="none" strokeLinecap="round" />
          <rect x={-130} y={-480} width={46} height={16} rx={6} fill="#1a100d" transform="rotate(14 -110 -470)" />
        </g>
        {t && (
          <g transform="translate(760,1352)">
            <ellipse cx={80} cy={8} rx={110} ry={14} fill="#000" opacity={0.35} />
            <Glow x={10} y={-340} w={130} h={170} color="#46d4ff" opacity={0.55 * blink} blur={50} />
            <rect x={0} y={-390} width={160} height={390} rx={16} fill="#1c222d" />
            <rect x={14} y={-360} width={132} height={176} rx={8} fill="#08141d" />
            <rect x={20} y={-354} width={120} height={164} rx={6} fill="#0e4766" opacity={blink} />
            <rect x={20} y={-354} width={120} height={22} fill="#46d4ff" opacity={0.25 * blink} />
            {[0, 1, 2].map((i) => (
              <rect key={i} x={30} y={-320 + i * 30} width={80 - i * 14} height={8} rx={3} fill="#9fe8ff" opacity={0.6 * blink} />
            ))}
            <rect x={14} y={-166} width={132} height={60} rx={8} fill="#11151c" />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={24 + i * 30} y={-150} width={22} height={14} rx={3} fill="#2c3646" />
            ))}
            <rect x={60} y={-396} width={40} height={10} rx={4} fill="#ff3b3b" opacity={blink} />
          </g>
        )}
      </Layer>
    </g>
  );
};

/* ───────────────────────── Пустыня ───────────────────────── */

const Dune: React.FC<{seed: number; base: number; amp: number; color: string; wl?: number}> = ({seed, base, amp, color, wl = 520}) => {
  const r = rng(seed);
  const p1 = r() * 6;
  const p2 = r() * 6;
  let d = `M ${X0} 2200 L ${X0} ${base}`;
  for (let x = X0; x <= X1; x += 40) {
    const y = base - Math.sin(x / wl + p1) * amp - Math.sin(x / (wl * 0.37) + p2) * amp * 0.35;
    d += ` L ${x} ${y}`;
  }
  d += ` L ${X1} 2200 Z`;
  return <path d={d} fill={color} />;
};

export const Desert: React.FC<LocProps> = ({f, heat = 0.6}) => (
  <g>
    <Sky id="desert" f={f} sunX={300} sunY={760} sunR={170} heat={heat} />
    {/* дальние столовые горы */}
    <Layer depth={0.2}>
      <path d="M -560 1150 L -420 1060 L -300 1060 L -240 1010 L -60 1010 L 0 1070 L 200 1070 L 300 1150 Z" fill="#b2492a" />
      <path d="M 520 1150 L 640 1040 L 700 1040 L 740 1000 L 900 1000 L 960 1060 L 1100 1060 L 1200 1150 Z" fill="#b2492a" />
    </Layer>
    <Layer depth={0.38}>
      <Dune seed={2} base={1230} amp={55} color="#cf7a3e" wl={620} />
    </Layer>
    <Layer depth={0.58}>
      <Dune seed={5} base={1300} amp={70} color="#b9632f" wl={480} />
    </Layer>
    <Layer depth={0.8}>
      <Dune seed={9} base={1352} amp={40} color="#8f4a26" wl={380} />
    </Layer>
    <Floor y={1352} top="#6e381d" bottom="#2c160c" id="desert-floor" />
    <Layer depth={1}>
      <Cracks seed={8} y0={1400} y1={1880} color="#1d0e07" n={22} />
      {/* покосившийся указатель */}
      <g transform="translate(900,1360) rotate(8)">
        <rect x={-8} y={-300} width={16} height={300} fill="#2a160d" />
        <path d="M -8 -300 L -150 -290 L -170 -260 L -8 -250 Z" fill="#3d2315" />
        <path d="M 8 -230 L 120 -220 L 140 -196 L 8 -188 Z" fill="#3d2315" />
      </g>
      {/* следы */}
      {Array.from({length: 7}).map((_, i) => (
        <ellipse key={i} cx={-300 + i * 120} cy={1560 + (i % 2) * 26} rx={22} ry={8} fill="#2a150b" opacity={0.5} />
      ))}
    </Layer>
  </g>
);

/* ───────────────────────── Заброшенная автомагистраль ───────────────────────── */

const Car: React.FC<{x: number; y: number; s?: number; color?: string; flip?: boolean}> = ({x, y, s = 1, color = '#1d1210', flip}) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
    <ellipse cx={120} cy={4} rx={150} ry={12} fill="#000" opacity={0.3} />
    <rect x={0} y={-82} width={250} height={62} rx={14} fill={color} />
    <path d="M 40 -82 L 70 -130 L 176 -130 L 210 -82 Z" fill={color} />
    <path d="M 80 -86 L 96 -122 L 130 -122 L 130 -86 Z M 140 -86 L 140 -122 L 170 -122 L 192 -86 Z" fill="#3a2118" opacity={0.8} />
    <circle cx={52} cy={-18} r={26} fill="#070505" />
    <circle cx={198} cy={-18} r={26} fill="#070505" />
  </g>
);

export const Highway: React.FC<LocProps> = ({f, heat = 0.5}) => (
  <g>
    <Sky
      id="hw"
      f={f}
      sunX={780}
      sunY={800}
      sunR={120}
      heat={heat}
      stops={[
        [0, '#1c0a10'],
        [0.4, '#6a1f22'],
        [0.7, '#c4482a'],
        [1, '#f3a456'],
      ]}
    />
    <Layer depth={0.25}>
      <Skyline seed={61} base={1170} minH={120} maxH={360} minW={80} maxW={170} color="#7e2a1a" ruin={0.5} />
    </Layer>
    <Layer depth={0.5}>
      <Skyline seed={73} base={1260} minH={90} maxH={300} minW={120} maxW={240} color="#3f160f" ruin={0.7} />
    </Layer>
    <Layer depth={0.8}>
      {/* опоры эстакады и столбы */}
      {Array.from({length: 8}).map((_, i) => (
        <g key={i} transform={`translate(${-520 + i * 300},1320)`}>
          <rect x={0} y={-340} width={10} height={340} fill="#1a0e0b" />
          <line x1={-60} y1={-330} x2={70} y2={-330} stroke="#1a0e0b" strokeWidth={8} />
        </g>
      ))}
      <path d={`M ${X0} 1190 Q 100 1250 700 1190 T ${X1} 1210`} stroke="#1a0e0b" strokeWidth={4} fill="none" />
    </Layer>
    <Floor y={1330} top="#2a1d1b" bottom="#120c0b" id="hw-floor" />
    <Layer depth={1}>
      {/* ограждение */}
      <rect x={X0} y={1318} width={X1 - X0} height={14} fill="#4a3a36" />
      {Array.from({length: 30}).map((_, i) => (
        <rect key={i} x={X0 + i * 80} y={1318} width={10} height={44} fill="#2a1f1c" />
      ))}
      {/* разметка */}
      <rect x={X0} y={1650} width={X1 - X0} height={8} fill="#d9b85c" opacity={0.35} />
      {Array.from({length: 18}).map((_, i) => (
        <rect key={i} x={-540 + i * 150} y={1536} width={86} height={10} rx={3} fill="#d9c9a0" opacity={0.3} />
      ))}
      <Cracks seed={41} y0={1400} y1={1880} color="#0a0605" n={10} />
      <Car x={-380} y={1480} s={1.1} />
      <Car x={560} y={1730} s={1.25} color="#26302f" flip />
      <Car x={1180} y={1470} s={1.1} color="#2a1713" />
    </Layer>
  </g>
);

/* ───────────────────────── Метеостанция снаружи / техстанция ───────────────────────── */

export const WeatherOutside: React.FC<LocProps> = ({f, heat = 0.4}) => {
  const spin = f * 3.2;
  return (
    <g>
      <Sky id="ws" f={f} sunX={220} sunY={640} sunR={140} heat={heat} />
      <Layer depth={0.3}>
        <Dune seed={14} base={1210} amp={80} color="#a9532c" wl={700} />
      </Layer>
      <Layer depth={0.6}>
        <Dune seed={21} base={1300} amp={60} color="#6f3920" wl={540} />
      </Layer>
      <Floor y={1346} top="#4a2616" bottom="#1d0f09" id="ws-floor" />
      <Layer depth={1}>
        {/* здание */}
        <rect x={360} y={1000} width={420} height={350} fill="#3c3430" />
        <rect x={360} y={990} width={420} height={18} fill="#2a2320" />
        <rect x={420} y={1100} width={110} height={250} fill="#17110f" />
        <rect x={580} y={1070} width={150} height={96} fill="#0c0a0a" />
        <path d="M 580 1070 L 730 1166" stroke="#4a403b" strokeWidth={5} />
        <path d="M 730 1070 L 580 1166" stroke="#4a403b" strokeWidth={5} />
        {/* радиокупол */}
        <path d="M 440 990 Q 440 880 530 880 Q 620 880 620 990 Z" fill="#6c625c" />
        <path d="M 440 990 Q 440 920 530 910" stroke="#a59a92" strokeWidth={5} fill="none" opacity={0.5} />
        {/* мачта с анемометром */}
        <rect x={715} y={760} width={9} height={230} fill="#2a2320" />
        <g transform={`translate(720,756)`}>
          {[0, 120, 240].map((a) => (
            <g key={a} transform={`rotate(${spin + a})`}>
              <line x1={0} y1={0} x2={48} y2={0} stroke="#2a2320" strokeWidth={5} />
              <circle cx={52} cy={0} r={10} fill="#4a403b" />
            </g>
          ))}
        </g>
        {/* вывеска */}
        <rect x={380} y={1020} width={150} height={44} rx={4} fill="#17110f" />
        <text x={455} y={1050} fill="#9d8e83" fontSize={22} fontFamily="Sans, sans-serif" fontWeight={800} textAnchor="middle">
          МЕТЕОСТАНЦИЯ
        </text>
        <Cracks seed={19} y0={1400} y1={1880} color="#150a06" n={14} />
    </Layer>
    </g>
  );
};

export const Tech: React.FC<LocProps> = ({f, variant, heat = 0.5}) => {
  const frozen = variant === 'frozen';
  const blink = Math.floor(f / 14) % 2 === 0 ? 1 : 0.25;
  return (
    <g>
      <Sky
        id="tech"
        f={f}
        sunX={860}
        sunY={700}
        sunR={frozen ? 90 : 130}
        heat={frozen ? 0 : heat}
        stops={frozen ? [[0, '#0b1626'], [0.5, '#27466a'], [0.85, '#7aa5c9'], [1, '#bcd9ea']] : undefined}
        haze={frozen ? '#9fd0ff' : '#ff9a3c'}
      />
      <Layer depth={0.3}>
        <Dune seed={31} base={1250} amp={50} color={frozen ? '#6d8aa6' : '#b5592c'} wl={600} />
      </Layer>
      <Layer depth={0.6}>
        <Dune seed={33} base={1318} amp={40} color={frozen ? '#4a6684' : '#76381d'} wl={500} />
      </Layer>
      <Floor y={1346} top={frozen ? '#31465e' : '#4b2816'} bottom={frozen ? '#111b28' : '#1d0e08'} id="tech-floor" />
      <Layer depth={1}>
        {/* водяной резервуар на опорах */}
        <g transform="translate(300,1350)">
          {[-120, 120].map((x) => (
            <g key={x}>
              <rect x={x - 12} y={-330} width={24} height={330} fill={frozen ? '#2a3b50' : '#2b1a12'} />
            </g>
          ))}
          <line x1={-120} y1={-250} x2={120} y2={-80} stroke={frozen ? '#2a3b50' : '#2b1a12'} strokeWidth={10} />
          <line x1={120} y1={-250} x2={-120} y2={-80} stroke={frozen ? '#2a3b50' : '#2b1a12'} strokeWidth={10} />
          <rect x={-190} y={-640} width={380} height={320} rx={26} fill={frozen ? '#8fb4d4' : '#6b4630'} />
          <rect x={-190} y={-640} width={380} height={60} rx={26} fill={frozen ? '#b9d6ec' : '#855a40'} />
          {[-480, -380, -300].map((y) => (
            <rect key={y} x={-190} y={y} width={380} height={9} fill={frozen ? '#5e86a8' : '#4a2e1e'} />
          ))}
          <rect x={150} y={-640} width={14} height={320} fill={frozen ? '#e3f2fb' : '#4a2e1e'} opacity={0.5} />
          {frozen &&
            Array.from({length: 9}).map((_, i) => (
              <path key={i} d={`M ${-170 + i * 42} -320 L ${-160 + i * 42} ${-250 - (i % 3) * 30} L ${-150 + i * 42} -320 Z`} fill="#eaf6ff" opacity={0.9} />
            ))}
        </g>
        {/* здание станции */}
        <rect x={620} y={1060} width={440} height={290} fill={frozen ? '#40566e' : '#46352d'} />
        <rect x={620} y={1048} width={440} height={16} fill={frozen ? '#22344a' : '#2a1d17'} />
        <rect x={690} y={1150} width={100} height={200} fill="#0d0a09" />
        <rect x={830} y={1120} width={180} height={80} fill="#0d0a09" />
        <Glow x={830} y={1120} w={180} h={80} color={frozen ? '#8fd0ff' : '#ffb347'} opacity={0.25} />
        {/* антенна */}
        <path d="M 1010 1050 L 1030 700 L 1050 1050" stroke="#2a1d17" strokeWidth={8} fill="none" />
        <line x1={1016} y1={900} x2={1044} y2={900} stroke="#2a1d17" strokeWidth={6} />
        <circle cx={1030} cy={700} r={9} fill="#ff3b3b" opacity={blink} />
        {/* трубы */}
        <path d="M 490 1300 L 620 1300" stroke={frozen ? '#324963' : '#2a1d17'} strokeWidth={26} />
        <path d="M 330 1350 L 330 1300 L 620 1300" stroke={frozen ? '#324963' : '#2a1d17'} strokeWidth={22} fill="none" />
        <Cracks seed={27} y0={1400} y1={1880} color={frozen ? '#0b1420' : '#150a06'} n={12} />
      </Layer>
    </g>
  );
};
