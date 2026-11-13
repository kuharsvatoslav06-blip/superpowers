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

/** Столб дыма над руинами: поднимающиеся и расширяющиеся клубы. */
const Plume: React.FC<{x: number; y: number; f: number; s?: number; color?: string}> = ({x, y, f, s = 1, color = '#5a1c1c'}) => (
  <g>
    {Array.from({length: 9}).map((_, i) => {
      const k = ((f * 0.006 + i / 9) % 1 + 1) % 1;
      return (
        <ellipse
          key={i}
          cx={x + Math.sin(k * 6 + i) * 26 * s + k * 90 * s}
          cy={y - k * 520 * s}
          rx={(26 + k * 70) * s}
          ry={(22 + k * 54) * s}
          fill={color}
          opacity={0.5 * (1 - k)}
        />
      );
    })}
  </g>
);

/** Стая птиц (вороны) пересекает небо. */
const Birds: React.FC<{f: number}> = ({f}) => (
  <g fill="none" stroke="#2a0a14" strokeWidth={5} strokeLinecap="round">
    {Array.from({length: 6}).map((_, i) => {
      const x = (((f * 1.6 + i * 230) % 2000) + 2000) % 2000 - 360;
      const y = 330 + (i % 3) * 70 + Math.sin(f * 0.04 + i) * 22;
      const flap = Math.sin(f * 0.35 + i * 1.3) * 14;
      return <path key={i} d={`M ${x - 24} ${y - flap} Q ${x - 8} ${y - 8} ${x} ${y} Q ${x + 8} ${y - 8} ${x + 24} ${y - flap}`} />;
    })}
  </g>
);

/** Электрические столбы с провисшими проводами. */
const PowerLines: React.FC = () => (
  <g>
    {Array.from({length: 6}).map((_, i) => {
      const x = -460 + i * 400;
      return (
        <g key={i}>
          <rect x={x - 6} y={760} width={12} height={580} fill="#2a1020" />
          <rect x={x - 70} y={790} width={140} height={10} fill="#2a1020" />
          <rect x={x - 54} y={850} width={108} height={8} fill="#2a1020" />
          {[-60, 0, 60].map((dx) => (
            <path key={dx} d={`M ${x + dx} 796 Q ${x + dx + 200} 900 ${x + dx + 400} 796`} stroke="#2a1020" strokeWidth={3} fill="none" />
          ))}
        </g>
      );
    })}
  </g>
);

const Billboard: React.FC<{f: number}> = ({f}) => {
  const flick = noise1(f * 0.2, 11) > 0.12 ? 1 : 0.55;
  return (
    <g transform="translate(-330,700)">
      <rect x={20} y={150} width={14} height={440} fill="#2a1428" />
      <rect x={250} y={150} width={14} height={440} fill="#2a1428" />
      <rect x={0} y={0} width={290} height={170} rx={8} fill="#1c3e48" stroke="#0c1a22" strokeWidth={8} />
      <rect x={10} y={10} width={270} height={150} rx={4} fill="#2a8fa3" opacity={0.9 * flick} />
      <text x={145} y={86} textAnchor="middle" fontFamily="Sans, sans-serif" fontWeight={800} fontSize={58} fill="#eafcff" opacity={flick}>ОАЗИС</text>
      <text x={145} y={124} textAnchor="middle" fontFamily="Sans, sans-serif" fontWeight={600} fontSize={22} fill="#d6f4fa" opacity={flick}>прохлада каждый день</text>
      <path d="M 40 150 L 80 100 L 60 160 Z M 210 20 L 250 60 L 232 30 Z" fill="#12303a" opacity={0.7} />
    </g>
  );
};

export const City: React.FC<LocProps> = ({f, variant, heat = 0.5}) => {
  const t = variant === 'terminal';
  const blink = noise1(f * 0.25, 4) > 0.2 ? 1 : 0.55;
  return (
    <g>
      <Sky
        id="city"
        f={f}
        sunX={720}
        sunY={620}
        sunR={140}
        heat={heat}
        stops={[
          [0, '#2a0a2c'],
          [0.3, '#9a1f34'],
          [0.55, '#ec5a2a'],
          [0.78, '#ffa13c'],
          [1, '#ffd884'],
        ]}
      />
      <Layer depth={0.2}>
        <Skyline seed={11} base={1190} minH={160} maxH={420} minW={90} maxW={190} color="#d4623c" ruin={0.4} />
        <Plume x={120} y={1100} f={f} s={0.9} color="#8a2a30" />
        <Plume x={760} y={1090} f={f + 40} s={0.7} color="#8a2a30" />
      </Layer>
      <Layer depth={0.4}>
        <Skyline seed={23} base={1250} minH={260} maxH={640} minW={110} maxW={230} color="#8c2a36" windows="#5e1a28" ruin={0.6} winOn="#ffcf6a" />
      </Layer>
      <Layer depth={0.55}>
        <Billboard f={f} />
        <PowerLines />
      </Layer>
      <Layer depth={0.65}>
        <Skyline seed={37} base={1330} minH={380} maxH={860} minW={150} maxW={290} color="#4a1634" windows="#2a0e22" ruin={0.8} winOn="#ffc25a" />
        <Plume x={420} y={900} f={f + 90} s={1.1} color="#4a1830" />
      </Layer>
      <Layer depth={0.3}>
        <Birds f={f} />
      </Layer>
      {/* дымка у горизонта */}
      <Layer depth={0.7}>
        <rect x={X0} y={1050} width={X1 - X0} height={300} fill="#ff9a3c" opacity={0.2} />
      </Layer>
      <Floor y={1338} top="#4a2a2a" bottom="#1c1018" id="city-floor" />
      <Layer depth={1}>
        <rect x={X0} y={1338} width={X1 - X0} height={22} fill="#7a5048" />
        <rect x={X0} y={1352} width={X1 - X0} height={8} fill="#ffb070" opacity={0.25} />
        <rect x={X0} y={1360} width={X1 - X0} height={6} fill="#0c0806" opacity={0.5} />
        <Cracks seed={5} y0={1400} y1={1880} color="#0d0807" n={18} />
        {Array.from({length: 9}).map((_, i) => (
          <rect key={i} x={-480 + i * 260} y={1640} width={130} height={14} rx={4} fill="#e0b870" opacity={0.35} />
        ))}
        {/* люк, лужа расплавленного асфальта, сухие кусты */}
        <ellipse cx={420} cy={1500} rx={64} ry={14} fill="#1a0d0d" />
        <ellipse cx={420} cy={1498} rx={52} ry={9} fill="#3a1c1c" />
        <ellipse cx={-80} cy={1700} rx={150} ry={22} fill="#ff7a3c" opacity={0.12} />
        {Array.from({length: 5}).map((_, i) => (
          <g key={i} transform={`translate(${-420 + i * 340},1352)`} stroke="#4a2410" strokeWidth={4} strokeLinecap="round" fill="none">
            <path d="M 0 0 L -14 -34 M 0 0 L 2 -44 M 0 0 L 16 -30 M 0 0 L 30 -18" />
          </g>
        ))}
        {/* брошенная машина (теперь ржавая, с бликом) */}
        <g transform="translate(-130,1350)">
          <rect x={0} y={-82} width={250} height={62} rx={14} fill="#4a2420" />
          <path d="M 40 -82 L 70 -128 L 176 -128 L 210 -82 Z" fill="#5a2a24" />
          <path d="M 80 -86 L 96 -120 L 130 -120 L 130 -86 Z M 140 -86 L 140 -120 L 170 -120 L 192 -86 Z" fill="#ffb070" opacity={0.35} />
          <rect x={4} y={-80} width={242} height={8} rx={4} fill="#ffc27a" opacity={0.45} />
          <circle cx={52} cy={-18} r={26} fill="#0b0807" />
          <circle cx={198} cy={-18} r={26} fill="#0b0807" />
        </g>
        {/* светофор: красный горит */}
        <g transform="translate(-300,1350)">
          <rect x={-5} y={-330} width={10} height={330} fill="#241018" />
          <rect x={-24} y={-390} width={48} height={92} rx={8} fill="#241018" />
          <circle cx={0} cy={-366} r={11} fill="#ff3b3b" opacity={0.7 + 0.3 * blink} />
          <circle cx={0} cy={-366} r={26} fill="#ff3b3b" opacity={0.15 * blink} />
          <circle cx={0} cy={-340} r={11} fill="#3a2a10" />
          <circle cx={0} cy={-314} r={11} fill="#10301a" />
        </g>
        {/* погнутый фонарь */}
        <g transform="translate(980,1350)">
          <path d="M 0 0 L 0 -420 Q 0 -470 -60 -480 L -110 -470" stroke="#2a1520" strokeWidth={16} fill="none" strokeLinecap="round" />
          <rect x={-130} y={-480} width={46} height={16} rx={6} fill="#2a1520" transform="rotate(14 -110 -470)" />
        </g>
        {t && (
          <g transform="translate(760,1352)">
            <ellipse cx={80} cy={8} rx={110} ry={14} fill="#000" opacity={0.35} />
            <Glow x={10} y={-340} w={130} h={170} color="#46d4ff" opacity={0.7 * blink} blur={56} />
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

/** Передний план города: тёмные обломки, арматура и провода — перекрывают край кадра и дают глубину. */
export const CityFront: React.FC<{f: number}> = ({f}) => (
  <Layer depth={1.28}>
    <g fill="#1a0a16">
      <path d="M -560 1500 L -420 1420 L -360 1470 L -250 1400 L -150 1470 L -60 1450 L -20 1700 L -560 1700 Z" />
      <path d="M 1100 1480 L 1180 1400 L 1260 1450 L 1340 1380 L 1460 1470 L 1640 1500 L 1640 1700 L 1100 1700 Z" />
    </g>
    <g stroke="#1a0a16" strokeWidth={5} strokeLinecap="round" fill="none">
      <path d="M -300 1410 L -318 1330 M -250 1400 L -246 1300 M 1180 1400 L 1198 1310 M 1340 1380 L 1330 1290" />
    </g>
    <path d="M -560 -60 Q 100 140 700 40 T 1640 120" stroke="#1a0a16" strokeWidth={4} fill="none" opacity={0.8} transform={`translate(0,${Math.sin(f * 0.03) * 4})`} />
  </Layer>
);

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
