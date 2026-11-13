import React from 'react';
import {Cracks, Floor, Glow, HangingLamp, Layer, LocProps, Radial, VGrad, X0, X1} from './shared';
import {noise1, rng} from '../animations/noise';

const Wall: React.FC<{id: string; top: string; bottom: string; y1?: number}> = ({id, top, bottom, y1 = 1340}) => (
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
    <rect x={X0} y={-400} width={X1 - X0} height={y1 + 400} fill={`url(#${id})`} />
  </g>
);

/* ───────────────────────── Квартира Марка ───────────────────────── */

export const Apartment: React.FC<LocProps> = ({f, variant, heat = 0.5}) => {
  const cool = variant === 'cool';
  const wob = noise1(f * 0.3, 2) > 0.08 ? 1 : 0.7;
  return (
    <g>
      <Wall id="apt-wall" top={cool ? '#1c2b3b' : '#33241f'} bottom={cool ? '#142030' : '#241915'} />
      <Layer depth={0.7}>
        {/* окно */}
        <rect x={590} y={360} width={360} height={720} fill="#120d0b" />
        <defs>
          <VGrad
            id="apt-out"
            stops={[
              [0, '#7a2412'],
              [0.5, '#e0602a'],
              [1, '#ffc27a'],
            ]}
          />
          <clipPath id="apt-win">
            <rect x={604} y={374} width={332} height={692} />
          </clipPath>
        </defs>
        <g clipPath="url(#apt-win)">
          <rect x={604} y={374} width={332} height={692} fill="url(#apt-out)" opacity={cool ? 0.55 : 1} />
          <circle cx={800} cy={640} r={70} fill="#fff1c9" opacity={0.9} />
          <path d="M 604 1066 L 604 930 L 650 930 L 650 840 L 700 840 L 700 960 L 760 960 L 760 900 L 830 900 L 830 780 L 880 780 L 880 1000 L 936 1000 L 936 1066 Z" fill="#40160e" />
          {/* жалюзи */}
          {Array.from({length: 19}).map((_, i) => (
            <rect key={i} x={604} y={374 + i * 38} width={332} height={cool ? 30 : 12} fill="#0d0907" opacity={cool ? 0.96 : 0.85} />
          ))}
        </g>
        <rect x={590} y={360} width={360} height={720} fill="none" stroke="#0e0a09" strokeWidth={18} />
        <line x1={770} y1={360} x2={770} y2={1080} stroke="#0e0a09" strokeWidth={10} />
      </Layer>
      {/* полосы света на полу и стене */}
      <Layer depth={0.9}>
        <path d="M 600 1080 L 940 1080 L 760 1340 L 300 1340 Z" fill={cool ? '#ffb070' : '#ffa04a'} opacity={cool ? 0.07 : 0.16} />
        {!cool &&
          Array.from({length: 6}).map((_, i) => (
            <path key={i} d={`M ${340 + i * 52} 1340 L ${610 + i * 52} 1080 L ${650 + i * 52} 1080 L ${384 + i * 52} 1340 Z`} fill="#ffa04a" opacity={0.07} />
          ))}
      </Layer>
      <Floor y={1340} top={cool ? '#1d2a38' : '#2b1e19'} bottom={cool ? '#0e1620' : '#140d0b'} id="apt-floor" />
      <rect x={X0} y={1318} width={X1 - X0} height={26} fill={cool ? '#0d1520' : '#18100d'} />
      {!cool && (
        <Layer depth={1}>
          {/* кровать */}
          <rect x={-90} y={1262} width={500} height={84} rx={8} fill="#1c1411" />
          <rect x={-70} y={1190} width={470} height={86} rx={22} fill="#566179" />
          <path d="M -70 1250 L 400 1250 L 400 1276 Q 160 1300 -70 1276 Z" fill="#434c60" />
          <rect x={-60} y={1160} width={150} height={50} rx={24} fill="#d9d2c4" />
          <rect x={-100} y={1100} width={30} height={246} rx={8} fill="#120c0a" />
          {/* стол с радио */}
          <rect x={690} y={1182} width={460} height={22} rx={4} fill="#3a2a22" />
          <rect x={720} y={1204} width={20} height={142} fill="#2a1d17" />
          <rect x={1100} y={1204} width={20} height={142} fill="#2a1d17" />
          <g transform="translate(760,1182)">
            <rect x={0} y={-110} width={190} height={110} rx={12} fill="#2d3340" />
            <rect x={12} y={-98} width={90} height={86} rx={8} fill="#171b24" />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={22} y1={-88 + i * 20} x2={92} y2={-88 + i * 20} stroke="#3a4152" strokeWidth={5} strokeLinecap="round" />
            ))}
            <rect x={116} y={-92} width={62} height={26} rx={4} fill="#c9a24a" opacity={0.8 * wob} />
            <line x1={124} y1={-79} x2={170} y2={-79} stroke="#3a2a10" strokeWidth={2} />
            <circle cx={128} cy={-38} r={14} fill="#161922" />
            <circle cx={164} cy={-38} r={14} fill="#161922" />
            <circle cx={172} cy={-104} r={4} fill="#ff3b3b" opacity={wob} />
            <line x1={160} y1={-110} x2={250} y2={-230} stroke="#8a8f9a" strokeWidth={4} strokeLinecap="round" />
          </g>
          {/* термометр на стене */}
          <g transform="translate(470,640)">
            <rect x={-26} y={-150} width={52} height={300} rx={26} fill="#dcd4c6" opacity={0.92} />
            <rect x={-8} y={-120} width={16} height={230} rx={8} fill="#3a1410" />
            <rect x={-8} y={-40} width={16} height={150} rx={8} fill="#e8412b" />
            <circle cx={0} cy={118} r={20} fill="#e8412b" />
          </g>
        </Layer>
      )}
      {cool && (
        <Layer depth={1}>
          {/* кондиционеры */}
          <g transform="translate(70,430)">
            <rect x={0} y={0} width={330} height={96} rx={16} fill="#cfd7df" />
            <rect x={16} y={62} width={298} height={20} rx={6} fill="#8d99a6" />
            <circle cx={296} cy={26} r={6} fill="#46d4ff" />
            {Array.from({length: 7}).map((_, i) => (
              <path key={i} d={`M ${40 + i * 40} 100 q ${(i % 2) * 14 - 7} 40 0 90`} stroke="#9fe8ff" strokeWidth={3} fill="none" opacity={0.28 + 0.14 * Math.sin(f * 0.1 + i)} />
            ))}
          </g>
          {/* календарь и фото на стене */}
          <g transform="translate(170,760)">
            <rect x={0} y={0} width={110} height={140} rx={6} fill="#e9e3d6" />
            <rect x={0} y={0} width={110} height={34} rx={6} fill="#b9362a" />
            <text x={55} y={92} textAnchor="middle" fill="#2a2420" fontSize={50} fontFamily="Sans, sans-serif" fontWeight={800}>
              12
            </text>
          </g>
          <g transform="translate(330,760)">
            <rect x={0} y={0} width={150} height={118} rx={4} fill="#15110f" />
            <rect x={10} y={10} width={130} height={98} fill="#586a82" />
            <circle cx={50} cy={50} r={14} fill="#d9a584" />
            <circle cx={78} cy={44} r={14} fill="#d9a584" />
            <circle cx={106} cy={52} r={14} fill="#d9a584" />
            <rect x={36} y={66} width={28} height={42} fill="#30394a" />
            <rect x={64} y={60} width={28} height={48} fill="#30394a" />
            <rect x={92} y={68} width={28} height={40} fill="#30394a" />
          </g>
          {/* стол с чашкой */}
          <rect x={720} y={1190} width={380} height={20} rx={4} fill="#425468" />
          <rect x={750} y={1210} width={18} height={136} fill="#2c3a4b" />
          <rect x={1050} y={1210} width={18} height={136} fill="#2c3a4b" />
          <g transform="translate(900,1190)">
            <path d="M -30 -50 L 30 -50 L 24 0 L -24 0 Z" fill="#e9e3d6" />
            <path d="M 30 -38 q 26 4 20 24 q -4 10 -24 10" stroke="#e9e3d6" strokeWidth={8} fill="none" />
            <ellipse cx={0} cy={-50} rx={30} ry={7} fill="#4a2c1d" />
            {[0, 1, 2].map((i) => {
              const t = (f * 0.03 + i / 3) % 1;
              return <path key={i} d={`M ${-8 + i * 8} ${-56 - t * 90} q 14 -20 0 -40`} stroke="#d9eef7" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.55 * (1 - t)} />;
            })}
          </g>
          {/* диван */}
          <rect x={-120} y={1170} width={360} height={170} rx={26} fill="#34465c" />
          <rect x={-120} y={1130} width={360} height={80} rx={30} fill="#3e526a" />
        </Layer>
      )}
      {/* лампа */}
      <HangingLamp
        x={cool ? 480 : 250}
        y={cool ? 300 : 360}
        f={f}
        gid="apt-lamp"
        color={cool ? '#d9f0ff' : '#ffc857'}
        coneH={cool ? 900 : 760}
        coneW={cool ? 260 : 180}
        flicker={cool ? 0 : 0.35}
        seed={3}
      />
      <Glow x={590} y={360} w={360} h={720} color={cool ? '#ffa04a' : '#ff7a2a'} opacity={cool ? 0.08 : 0.2} blur={80} />
    </g>
  );
};

/* ───────────────────────── Подземное убежище ───────────────────────── */

export const Shelter: React.FC<LocProps> = ({f, variant}) => {
  const door = variant === 'door';
  const lamps = [160, 520, 880];
  return (
    <g>
      <Wall id="sh-wall" top="#0b1320" bottom="#142034" />
      <Layer depth={0.8}>
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={-520 + i * 170} y={-100} width={6} height={1440} fill="#0a101a" opacity={0.8} />
        ))}
        {/* трубы под потолком */}
        {[120, 176, 222].map((y, i) => (
          <g key={y}>
            <rect x={X0} y={y} width={X1 - X0} height={20 - i * 3} fill="#2a3547" />
            <rect x={X0} y={y} width={X1 - X0} height={5} fill="#4a5870" opacity={0.7} />
          </g>
        ))}
        {Array.from({length: 8}).map((_, i) => (
          <rect key={i} x={-420 + i * 290} y={110} width={14} height={130} fill="#1d2735" />
        ))}
        {/* вывеска */}
        <rect x={380} y={330} width={320} height={96} rx={8} fill="#1b2434" stroke="#3a465c" strokeWidth={4} />
        <text x={540} y={394} textAnchor="middle" fill="#ffc857" fontSize={52} fontFamily="Sans, sans-serif" fontWeight={800} opacity={0.9 - 0.2 * noise1(f * 0.4, 9)}>
          УБЕЖИЩЕ 4
        </text>
      </Layer>
      <Floor y={1340} top="#1a2435" bottom="#090d15" id="sh-floor" />
      <rect x={X0} y={1318} width={X1 - X0} height={24} fill="#0d1420" />
      {door ? (
        <Layer depth={1}>
          <g transform="translate(540,1344)">
            <rect x={-250} y={-700} width={500} height={700} rx={30} fill="#232d3d" />
            <circle cx={0} cy={-350} r={190} fill="#2d394d" stroke="#566176" strokeWidth={14} />
            <circle cx={0} cy={-350} r={140} fill="#1d2634" />
            {[0, 60, 120].map((a) => (
              <line key={a} x1={-110} y1={0} x2={110} y2={0} stroke="#7a869a" strokeWidth={14} strokeLinecap="round" transform={`translate(0,-350) rotate(${a})`} />
            ))}
            <circle cx={0} cy={-350} r={26} fill="#566176" />
            <rect x={-190} y={-640} width={14} height={14} fill="#ff3b3b" opacity={Math.floor(f / 12) % 2 ? 1 : 0.2} />
          </g>
        </Layer>
      ) : (
        <Layer depth={1}>
          {/* двухъярусная кровать */}
          <g transform="translate(-40,1344)">
            <rect x={0} y={-330} width={16} height={330} fill="#252f40" />
            <rect x={300} y={-330} width={16} height={330} fill="#252f40" />
            <rect x={0} y={-210} width={316} height={14} fill="#3a465c" />
            <rect x={6} y={-246} width={304} height={38} rx={10} fill="#5a5a48" />
            <rect x={0} y={-90} width={316} height={14} fill="#3a465c" />
            <rect x={6} y={-126} width={304} height={38} rx={10} fill="#3f5a56" />
          </g>
          {/* ящики */}
          <g transform="translate(760,1344)">
            <rect x={0} y={-130} width={170} height={130} fill="#4a4030" />
            <rect x={0} y={-130} width={170} height={14} fill="#5d5240" />
            <rect x={90} y={-250} width={140} height={120} fill="#3d3628" />
            <line x1={0} y1={-65} x2={170} y2={-65} stroke="#2a251a" strokeWidth={5} />
          </g>
          {/* дверной проём справа */}
          <rect x={980} y={880} width={200} height={460} fill="#05080d" />
        </Layer>
      )}
      {lamps.map((x, i) => (
        <HangingLamp key={x} x={x} y={300} f={f} gid={`sh-lamp-${i}`} coneH={900} coneW={220} flicker={0.7} seed={i * 3 + 1} />
      ))}
    </g>
  );
};

/* ───────────────────────── Теплица в убежище ───────────────────────── */

const Plant: React.FC<{x: number; y: number; s: number; seed: number; f: number; color?: string}> = ({x, y, s, seed, f, color = '#4fbf6b'}) => {
  const r = rng(seed);
  const leaves = 5 + Math.floor(r() * 3);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <line x1={0} y1={0} x2={0} y2={-70} stroke="#2f8f4a" strokeWidth={6} strokeLinecap="round" />
      {Array.from({length: leaves}).map((_, i) => {
        const a = -70 + (i * 140) / (leaves - 1) + Math.sin(f * 0.04 + i + seed) * 3;
        const len = 46 + r() * 30;
        return (
          <g key={i} transform={`translate(0,${-24 - r() * 44}) rotate(${a})`}>
            <ellipse cx={0} cy={-len / 2} rx={11} ry={len / 2} fill={color} opacity={0.92} />
            <line x1={0} y1={0} x2={0} y2={-len * 0.8} stroke="#2f8f4a" strokeWidth={2} />
          </g>
        );
      })}
    </g>
  );
};

export const Greenhouse: React.FC<LocProps> = ({f, variant}) => {
  const sprout = variant === 'sprout';
  return (
    <g>
      <Wall id="gh-wall" top="#08140f" bottom="#12261c" />
      <Layer depth={0.75}>
        {/* арки */}
        {Array.from({length: 8}).map((_, i) => (
          <path key={i} d={`M ${-500 + i * 300} 1340 L ${-500 + i * 300} 500 Q ${-350 + i * 300} 240 ${-200 + i * 300} 500 L ${-200 + i * 300} 1340`} stroke="#1f3a2d" strokeWidth={10} fill="none" />
        ))}
        {/* лампы для растений */}
        {[100, 540, 980].map((x, i) => (
          <g key={x}>
            <Glow x={x - 100} y={270} w={200} h={14} color={i % 2 ? '#ffd3a0' : '#ff7ad0'} opacity={0.65} blur={26} />
            <rect x={x - 110} y={268} width={220} height={16} rx={6} fill="#cbd3dc" />
          </g>
        ))}
        {/* полки с растениями */}
        {[560, 760, 960].map((y, row) => (
          <g key={y}>
            <rect x={X0} y={y} width={X1 - X0} height={14} fill="#2a3a36" />
            {Array.from({length: 11}).map((_, i) => (
              <Plant key={i} x={-500 + i * 200 + (row % 2) * 80} y={y} s={0.5 + (i % 3) * 0.08} seed={row * 20 + i} f={f} color={i % 4 === 0 ? '#8ed05a' : '#4fbf6b'} />
            ))}
          </g>
        ))}
      </Layer>
      <Floor y={1340} top="#1c2f26" bottom="#0a140f" id="gh-floor" />
      <Layer depth={1}>
        {/* грядка */}
        <rect x={-300} y={1290} width={1700} height={58} rx={8} fill="#3a2a1e" />
        <rect x={-300} y={1290} width={1700} height={12} fill="#5a4230" />
        {sprout ? (
          <Plant x={540} y={1290} s={1.7} seed={77} f={f} color="#7fe07a" />
        ) : (
          Array.from({length: 8}).map((_, i) => <Plant key={i} x={-200 + i * 220} y={1290} s={0.9} seed={i + 3} f={f} />)
        )}
      </Layer>
      {sprout && <Glow x={440} y={1000} w={200} h={300} color="#a6ff9a" opacity={0.28} blur={70} />}
    </g>
  );
};

/* ───────────────────────── Метеостанция внутри ───────────────────────── */

export const WeatherInside: React.FC<LocProps> = ({f}) => {
  const flick = noise1(f * 0.4, 6) > 0.1 ? 1 : 0.4;
  return (
    <g>
      <Wall id="wsi-wall" top="#2a2622" bottom="#1a1714" />
      <Layer depth={0.75}>
        {/* окно со столбами солнечного света */}
        <rect x={80} y={380} width={300} height={440} fill="#20120c" />
        <defs>
          <VGrad id="wsi-out" stops={[[0, '#c24b22'], [1, '#ffcf8a']]} />
          <VGrad id="wsi-beam" stops={[[0, '#ffc77a', 0.55], [1, '#ffc77a', 0]]} />
        </defs>
        <rect x={96} y={396} width={268} height={408} fill="url(#wsi-out)" />
        <line x1={230} y1={380} x2={230} y2={820} stroke="#20120c" strokeWidth={10} />
        <line x1={80} y1={600} x2={380} y2={600} stroke="#20120c" strokeWidth={10} />
        <path d="M 96 804 L 364 804 L 760 1340 L 160 1340 Z" fill="url(#wsi-beam)" opacity={0.5} />
        {/* карта/графики на стене */}
        <rect x={560} y={400} width={300} height={200} fill="#3a342e" />
        <path d="M 580 560 L 640 500 L 700 540 L 760 450 L 840 500" stroke="#c86a3a" strokeWidth={5} fill="none" />
        <rect x={560} y={640} width={150} height={120} fill="#3a342e" />
        <rect x={730} y={640} width={130} height={120} fill="#3a342e" />
        <circle cx={795} cy={700} r={40} fill="none" stroke="#7a6a58" strokeWidth={6} />
        <line x1={795} y1={700} x2={822} y2={680} stroke="#c86a3a" strokeWidth={4} />
      </Layer>
      <Floor y={1340} top="#2a231e" bottom="#120f0d" id="wsi-floor" />
      <Layer depth={1}>
        {/* консоль с мониторами */}
        <rect x={420} y={1130} width={740} height={26} fill="#3a342e" />
        <rect x={440} y={1156} width={20} height={190} fill="#26211d" />
        <rect x={1120} y={1156} width={20} height={190} fill="#26211d" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${500 + i * 200},1130)`}>
            <rect x={0} y={-190} width={170} height={150} rx={10} fill="#1a1816" />
            <rect x={12} y={-178} width={146} height={118} rx={6} fill="#10181d" />
            {i === 1 && <rect x={12} y={-178} width={146} height={118} rx={6} fill="#46d4ff" opacity={0.08 * flick} />}
            <rect x={60} y={-40} width={50} height={18} fill="#1a1816" />
          </g>
        ))}
        {/* пыль на поверхностях */}
        <rect x={420} y={1128} width={740} height={6} fill="#b8a48c" opacity={0.18} />
        {/* стеллаж */}
        <rect x={-120} y={900} width={230} height={440} fill="#1d1a17" />
        {[1000, 1100, 1200].map((y) => (
          <rect key={y} x={-120} y={y} width={230} height={8} fill="#3a342e" />
        ))}
        <Cracks seed={3} y0={1400} y1={1880} color="#0e0b09" n={8} />
      </Layer>
    </g>
  );
};
