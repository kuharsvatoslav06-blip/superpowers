import React from 'react';
import { INK } from '../anim';

const RAYS: Record<string, [string, string]> = {
  blue: ['#5B6BEE', '#4D5CE0'],
  pink: ['#E3668C', '#D5587F'],
  purple: ['#3A1E5C', '#2C164A'],
  green: ['#33B061', '#2A9E55'],
  orange: ['#F7943A', '#EC832A'],
  dark: ['#1F1C33', '#17152A'],
};

export const Rays: React.FC<{ color: keyof typeof RAYS; time: number; w?: number; h?: number; cx?: number; cy?: number }> = ({ color, time, w = 1080, h = 1920, cx = 540, cy = 860 }) => {
  const [a, b] = RAYS[color] ?? RAYS.blue;
  const n = 18;
  const rot = time * 4;
  const R = 2400;
  const wedges = [];
  for (let i = 0; i < n; i++) {
    const a0 = ((i / n) * 2 * Math.PI);
    const a1 = (((i + 0.5) / n) * 2 * Math.PI);
    wedges.push(
      <path key={i} d={`M 0 0 L ${R * Math.cos(a0)} ${R * Math.sin(a0)} L ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z`} fill={b} />,
    );
  }
  return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id={`vig-${color}`} cx="50%" cy="45%" r="75%">
          <stop offset="55%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.35} />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill={a} />
      <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>{wedges}</g>
      <rect width={w} height={h} fill={`url(#vig-${color})`} />
    </svg>
  );
};

/** Тёмная комната: окно со звёздами, стол с монитором, коробки от пиццы, мусор */
export const Room: React.FC<{ time: number }> = ({ time }) => {
  const stars: [number, number, number][] = [
    [690, 330, 4], [760, 300, 3], [850, 360, 5], [905, 420, 3], [720, 450, 3], [800, 500, 4], [880, 540, 3], [740, 590, 4], [660, 520, 3], [830, 610, 3],
  ];
  const trash: [number, number, number, string][] = [
    [140, 1560, 20, '#F2C94C'], [960, 1620, -30, '#E35A4C'], [610, 1760, 15, '#7CC36A'], [90, 1800, 40, '#F2C94C'], [430, 1835, -15, '#E0E0E0'], [1000, 1840, 25, '#7CC36A'], [770, 1690, 60, '#E0E0E0'],
  ];
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      {/* стена */}
      <rect width={1080} height={1920} fill="#272A57" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={i * 140 - 20} y={0} width={70} height={1500} fill="#2B2F5F" />
      ))}
      {/* окно */}
      <rect x={630} y={270} width={330} height={400} rx={10} fill="#0E1030" stroke={INK} strokeWidth={14} />
      {stars.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r * (0.8 + 0.3 * Math.sin(time * 3 + i))} fill="#FFF7C2" />
      ))}
      <circle cx={900} cy={320} r={28} fill="#FFF3B0" />
      <circle cx={912} cy={312} r={24} fill="#0E1030" />
      <line x1={795} y1={270} x2={795} y2={670} stroke={INK} strokeWidth={10} />
      <line x1={630} y1={470} x2={960} y2={470} stroke={INK} strokeWidth={10} />
      {/* постер */}
      <rect x={110} y={330} width={170} height={230} rx={6} fill="#E35A4C" stroke={INK} strokeWidth={10} transform="rotate(-4 195 445)" />
      <path d="M 150 500 L 195 400 L 240 500 Z" fill="#F2C94C" stroke={INK} strokeWidth={8} transform="rotate(-4 195 445)" />
      {/* пол */}
      <rect x={0} y={1500} width={1080} height={420} fill="#4A3B3F" />
      {[1560, 1640, 1740, 1860].map((y) => (
        <line key={y} x1={0} y1={y} x2={1080} y2={y} stroke="#3C2F33" strokeWidth={6} />
      ))}
      <line x1={0} y1={1500} x2={1080} y2={1500} stroke={INK} strokeWidth={10} />
      {/* стол с монитором */}
      <rect x={760} y={1030} width={300} height={24} fill="#7A5236" stroke={INK} strokeWidth={8} />
      <rect x={790} y={1054} width={20} height={460} fill="#6A452C" stroke={INK} strokeWidth={6} />
      <rect x={1010} y={1054} width={20} height={460} fill="#6A452C" stroke={INK} strokeWidth={6} />
      <rect x={800} y={830} width={250} height={170} rx={10} fill="#111" stroke={INK} strokeWidth={10} />
      <rect x={814} y={844} width={222} height={142} rx={4} fill="#3F7BE0" />
      <path d="M 814 986 L 880 910 L 930 960 L 970 925 L 1036 986 Z" fill="#6FCF6F" />
      <circle cx={990} cy={880} r={16} fill="#FFE06A" />
      <rect x={905} y={1000} width={40} height={30} fill="#222" stroke={INK} strokeWidth={6} />
      {/* коробки от пиццы */}
      <g transform="rotate(-6 210 1610)">
        <rect x={60} y={1570} width={300} height={56} rx={6} fill="#D9A866" stroke={INK} strokeWidth={8} />
        <rect x={80} y={1520} width={280} height={52} rx={6} fill="#E3B677" stroke={INK} strokeWidth={8} />
        <text x={220} y={1556} fontFamily="Oswald" fontSize={30} fontWeight={700} fill="#A0472E" textAnchor="middle">ПИЦЦА</text>
      </g>
      {/* мусор */}
      {trash.map(([x, y, r, c], i) => (
        <rect key={i} x={x - 16} y={y - 10} width={32} height={20} rx={4} fill={c} stroke={INK} strokeWidth={5} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <g transform="rotate(80 880 1780)">
        <rect x={850} y={1755} width={60} height={34} rx={8} fill="#5BAE5B" stroke={INK} strokeWidth={6} />
      </g>
      <circle cx={300} cy={1720} r={22} fill="#EDEDED" stroke={INK} strokeWidth={6} />
    </svg>
  );
};

/** Ванная: плитка, зеркало, раковина */
export const Bathroom: React.FC<{ time: number }> = () => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
    <rect width={1080} height={1920} fill="#BFE3E8" />
    {Array.from({ length: 12 }).map((_, i) => <line key={'v' + i} x1={i * 100} y1={0} x2={i * 100} y2={1500} stroke="#A6D0D6" strokeWidth={6} />)}
    {Array.from({ length: 16 }).map((_, i) => <line key={'h' + i} x1={0} y1={i * 100} x2={1080} y2={i * 100} stroke="#A6D0D6" strokeWidth={6} />)}
    {/* зеркало */}
    <rect x={250} y={250} width={580} height={520} rx={30} fill="#E9F6F8" stroke={INK} strokeWidth={14} />
    <path d="M 330 330 L 450 290 M 330 420 L 560 330" stroke="#fff" strokeWidth={22} strokeLinecap="round" opacity={0.8} />
    {/* полка с пеной */}
    <rect x={250} y={790} width={580} height={26} rx={8} fill="#fff" stroke={INK} strokeWidth={8} />
    <rect x={300} y={700} width={60} height={92} rx={12} fill="#E3477E" stroke={INK} strokeWidth={8} />
    <rect x={720} y={720} width={50} height={72} rx={10} fill="#2F6FD6" stroke={INK} strokeWidth={8} />
    {/* пол */}
    <rect x={0} y={1500} width={1080} height={420} fill="#E6E9EE" />
    {Array.from({ length: 8 }).map((_, i) => <line key={'f' + i} x1={i * 160} y1={1500} x2={i * 160 - 200} y2={1920} stroke="#CDD2DA" strokeWidth={6} />)}
    <line x1={0} y1={1500} x2={1080} y2={1500} stroke={INK} strokeWidth={10} />
  </svg>
);

/** Кухня: открытый холодильник с «содержимым» */
export const Kitchen: React.FC<{ time: number }> = ({ time }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
    <rect width={1080} height={1920} fill="#F2E3C6" />
    {Array.from({ length: 12 }).map((_, i) => <line key={'v' + i} x1={i * 90} y1={0} x2={i * 90} y2={1500} stroke="#E6D3AE" strokeWidth={5} />)}
    {Array.from({ length: 17 }).map((_, i) => <line key={'h' + i} x1={0} y1={i * 90} x2={1080} y2={i * 90} stroke="#E6D3AE" strokeWidth={5} />)}
    {/* холодильник */}
    <rect x={560} y={330} width={420} height={1180} rx={30} fill="#FFFFFF" stroke={INK} strokeWidth={14} />
    <rect x={590} y={360} width={360} height={1120} rx={14} fill="#DDF1FA" stroke={INK} strokeWidth={8} />
    <rect x={590} y={360} width={360} height={1120} rx={14} fill="#FFFBE0" opacity={0.25 + 0.1 * Math.sin(time * 3)} />
    {[640, 900, 1160].map((y) => <rect key={y} x={590} y={y} width={360} height={14} fill="#B9DCEB" stroke={INK} strokeWidth={6} />)}
    {/* пицца */}
    <path d="M 620 630 L 760 560 L 780 630 Z" fill="#F2C94C" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <circle cx={720} cy={605} r={10} fill="#E35A4C" /><circle cx={752} cy={612} r={8} fill="#E35A4C" />
    {/* майонез */}
    <rect x={820} y={520} width={90} height={120} rx={16} fill="#FFF7D6" stroke={INK} strokeWidth={8} />
    <rect x={832} y={505} width={66} height={24} rx={6} fill="#2F6FD6" stroke={INK} strokeWidth={6} />
    <text x={865} y={590} fontFamily="Oswald" fontWeight={700} fontSize={20} fill="#C9302C" textAnchor="middle">МАЙОНЕЗ</text>
    {/* торт */}
    <path d="M 630 900 L 630 820 L 800 820 L 800 900 Z" fill="#F6B8CF" stroke={INK} strokeWidth={8} />
    <path d="M 630 820 Q 715 790 800 820" fill="#fff" stroke={INK} strokeWidth={8} />
    <circle cx={715} cy={800} r={14} fill="#E35A4C" stroke={INK} strokeWidth={5} />
    {/* плесень */}
    <ellipse cx={780} cy={1135} rx={120} ry={30} fill="#9BBF5A" stroke={INK} strokeWidth={8} />
    {[730, 790, 840].map((x, i) => <circle key={x} cx={x} cy={1110 - i * 4} r={18 + i * 3} fill="#7FA845" stroke={INK} strokeWidth={6} />)}
    {/* стол */}
    <rect x={-20} y={1260} width={560} height={30} fill="#B07A4F" stroke={INK} strokeWidth={10} />
    <rect x={20} y={1290} width={30} height={220} fill="#9A6842" stroke={INK} strokeWidth={8} />
    <rect x={460} y={1290} width={30} height={220} fill="#9A6842" stroke={INK} strokeWidth={8} />
    {/* пол */}
    <rect x={0} y={1500} width={1080} height={420} fill="#C9A27A" />
    {Array.from({ length: 9 }).map((_, i) => <line key={'f' + i} x1={i * 140} y1={1500} x2={i * 140 - 160} y2={1920} stroke="#B48B63" strokeWidth={6} />)}
    <line x1={0} y1={1500} x2={1080} y2={1500} stroke={INK} strokeWidth={10} />
  </svg>
);
