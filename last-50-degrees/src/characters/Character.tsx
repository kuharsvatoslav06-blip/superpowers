import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {CharId, Expr, Pose} from '../types';
import {ROSTER, type Look} from './roster';
import {clamp} from '../animations/ease';

/**
 * Дизайн по референс-листам (public/characters/reference): высокая тонкая фигура, маленькая круглая голова,
 * глаза-точки без рта и носа, широкие тёмные штаны, длинные рукава, крупные круглые кисти, тёплая контурная подсветка.
 *
 * Локальные координаты: ноги стоят в (0,0), персонаж смотрит вправо (+x), рост ≈ 470.
 */
const L1 = 100; // бедро
const L2 = 98; // голень
const HIP_Y = -(L1 + L2) + 2;
const TOP = -356; // линия плеч
const SHOULDER_Y = TOP + 12;
const HEAD_Y = -410;
const HEAD_S = 0.82; // голова рисуется в системе r=56, затем уменьшается до r≈46
const ARM1 = 84;
const ARM2 = 78;
const RAD = 180 / Math.PI;

export interface CharProps {
  char: CharId;
  pose?: Pose;
  expr?: Expr;
  /** -1 … 1: куда направлен взгляд / поворот головы. */
  look?: number;
  tilt?: number;
  talking?: boolean;
  backpack?: boolean;
  /** Локальное время (кадры). По умолчанию — текущий кадр композиции. */
  frame?: number;
  seed?: number;
  /** Цвет контурного света. */
  rim?: string;
  rimAmount?: number;
}

interface Vec {
  x: number;
  y: number;
}

/** Двухсуставная обратная кинематика: углы бедра/колена (градусы, «вперёд — плюс»). */
function ik(hip: Vec, foot: Vec) {
  const dx = foot.x - hip.x;
  const dy = foot.y - hip.y;
  let d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(L1 - L2) + 1, L1 + L2 - 0.5);
  const base = Math.atan2(dx, dy);
  const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const b = Math.acos(clamp((L2 * L2 + d * d - L1 * L1) / (2 * L2 * d), -1, 1));
  return {thigh: (base + a) * RAD, knee: (a + b) * RAD, shin: (base - b) * RAD};
}

interface PoseParams {
  nSh: number;
  nEl: number;
  fSh: number;
  fEl: number;
  lean: number;
  bob: number;
  drop: number;
  footN: Vec;
  footF: Vec;
  headTilt: number;
}

function poseParams(pose: Pose, f: number): PoseParams {
  const breathe = Math.sin(f * 0.07);
  const base: PoseParams = {
    nSh: 4 + breathe * 1.2,
    nEl: 6,
    fSh: 3,
    fEl: 5,
    lean: 0,
    bob: breathe * 2,
    drop: 0,
    footN: {x: 8, y: 0},
    footF: {x: -10, y: 0},
    headTilt: breathe * 0.8,
  };
  switch (pose) {
    case 'walk':
    case 'run': {
      const run = pose === 'run';
      const p = f * (run ? 0.3 : 0.13);
      const stride = run ? 84 : 52;
      const lift = run ? 60 : 32;
      const s = Math.sin(p);
      const c = Math.cos(p);
      const swing = run ? 58 : 24;
      return {
        ...base,
        nSh: -swing * s + 5,
        nEl: (run ? 80 : 12) + (run ? 8 : 16) * Math.max(0, -s),
        fSh: swing * s + 5,
        fEl: (run ? 80 : 12) + (run ? 8 : 16) * Math.max(0, s),
        lean: run ? 11 : 3,
        bob: -(run ? 12 : 6) * Math.cos(2 * p) - (run ? 6 : 0),
        footN: {x: stride * s, y: -lift * Math.max(0, c)},
        footF: {x: -stride * s, y: -lift * Math.max(0, -c)},
        headTilt: run ? 3 : 4,
      };
    }
    case 'reach': {
      const press = Math.sin(f * 0.25) * 2;
      return {...base, nSh: 78 + press, nEl: 12, fSh: 6, fEl: 10, lean: 4, headTilt: 3};
    }
    case 'point':
      return {...base, nSh: 100 + Math.sin(f * 0.1) * 2, nEl: 2, fSh: 4, lean: 3};
    case 'hold':
      return {...base, nSh: 50, nEl: 80, fSh: 42, fEl: 86, lean: 2, headTilt: 6};
    case 'shock': {
      const tr = Math.sin(f * 1.7) * 1.4;
      return {
        ...base,
        nSh: 32 + tr,
        nEl: 58,
        fSh: 26 - tr,
        fEl: 64,
        lean: -9,
        headTilt: -6,
        footN: {x: 14, y: 0},
        footF: {x: -16, y: 0},
      };
    }
    case 'crouch':
      return {
        ...base,
        drop: 78,
        lean: 16,
        nSh: 50,
        nEl: 44,
        fSh: 40,
        fEl: 40,
        footN: {x: 38, y: 0},
        footF: {x: 4, y: 0},
        headTilt: 4,
      };
    case 'sit':
      return {
        ...base,
        drop: 84,
        lean: 2,
        nSh: 24,
        nEl: 70,
        fSh: 18,
        fEl: 74,
        footN: {x: 132, y: 0},
        footF: {x: 104, y: 0},
      };
    case 'slump':
      return {
        ...base,
        lean: 7,
        nSh: 8,
        nEl: 12,
        fSh: 5,
        fEl: 9,
        headTilt: 12 + breathe,
        bob: breathe * 3,
        footN: {x: 10, y: 0},
        footF: {x: -12, y: 0},
      };
    case 'lookUp':
      return {...base, headTilt: -16, lean: -2};
    default:
      return base;
  }
}

/* ───────────────────────── Волосы ───────────────────────── */

const HairFront: React.FC<{look: Look}> = ({look}) => {
  const c = look.hairColor;
  switch (look.hair) {
    case 'messy':
      return (
        <g fill={c}>
          <path d="M -60 12 C -72 -44 -30 -76 6 -70 C 44 -70 68 -44 60 -8 L 46 -26 L 42 -4 L 28 -30 L 15 -6 L 3 -34 L -9 -8 L -23 -34 L -32 -4 L -42 -24 L -48 10 Z" />
          <path d="M -24 -66 L -36 -84 L -8 -70 Z M 8 -70 L 14 -90 L 28 -68 Z M 34 -62 L 52 -76 L 54 -52 Z M -50 -40 L -70 -52 L -58 -24 Z" />
        </g>
      );
    case 'ponytail':
      return (
        <g fill={c}>
          <path d="M -60 12 C -68 -48 -26 -72 8 -69 C 46 -67 68 -38 60 -12 C 46 -38 12 -44 -12 -32 C -30 -24 -46 -8 -52 14 Z" />
          <path d="M -30 -20 L -18 -4 L -8 -24 Z M 6 -36 L 18 -14 L 28 -38 Z" />
        </g>
      );
    case 'short':
      return (
        <g fill={c}>
          <path d="M -59 8 C -70 -44 -28 -72 8 -68 C 46 -66 66 -40 59 -8 L 46 -28 L 38 -14 L 22 -34 L 8 -20 L -6 -36 L -20 -18 L -34 -28 L -48 -6 Z" />
          <path d="M -26 -64 L -34 -80 L -10 -68 Z M 20 -66 L 30 -82 L 40 -62 Z" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path fill={c} d="M -44 -14 C -32 6 -10 -4 -2 -12 C 12 -2 30 6 46 -12 L 46 -24 L -44 -24 Z" />
          <path fill={look.beanie} d="M -63 -2 C -67 -54 -30 -84 4 -84 C 40 -84 68 -54 63 -2 Z" />
          <rect x={-64} y={-22} width={128} height={22} rx={9} fill="#1b1b20" />
          <circle cx={2} cy={-88} r={9} fill={look.beanie} />
        </g>
      );
    case 'long':
      return (
        <path
          fill={c}
          d="M -61 22 C -72 -46 -30 -74 6 -70 C 46 -68 68 -40 60 -8 C 40 -36 8 -44 -14 -30 C -33 -19 -45 0 -49 24 Z"
        />
      );
  }
};

const HairBack: React.FC<{look: Look; f: number}> = ({look, f}) => {
  if (look.hair === 'ponytail') {
    const sway = Math.sin(f * 0.1) * 5;
    return (
      <g transform={`translate(-54,-34) rotate(${sway})`}>
        <path fill={look.hairColor} d="M 8 -6 C -38 -22 -74 14 -56 90 C -46 52 -26 28 8 22 Z" />
        <rect x={-6} y={-10} width={14} height={28} rx={5} fill={look.accent} />
      </g>
    );
  }
  if (look.hair === 'long') {
    return <path fill={look.hairColor} d="M -58 -20 C -80 20 -78 92 -54 120 L 12 120 C 4 72 -6 34 6 -10 Z" />;
  }
  if (look.hair === 'beanie') {
    return <path fill={look.hairColor} d="M -60 0 C -72 34 -62 66 -42 72 L -34 20 Z" />;
  }
  return null;
};

/* ───────────────────────── Лицо ───────────────────────── */

const Face: React.FC<{
  look: Look;
  expr: Expr;
  lookDir: number;
  talking: boolean;
  f: number;
  seed: number;
}> = ({look, expr, lookDir, talking, f, seed}) => {
  const fx = 20 + lookDir * 15;
  const eyeY = 6;
  const dark = '#111014';
  const b = (f + seed * 37) % 118;
  const blink = b < 5 ? Math.max(0.12, Math.abs(b - 2.5) / 2.5) : 1;
  const tired = expr === 'tired' ? 0.5 : 1;
  const eyeR = expr === 'shocked' ? 8 : 7.4;

  // брови нужны только для эмоций; в нейтральном состоянии лицо — две точки (как в референсе)
  let brows: {back: number; front: number; y: number} | null = null;
  switch (expr) {
    case 'worried':
    case 'sad':
      brows = {back: -17, front: 17, y: -13};
      break;
    case 'determined':
      brows = {back: 17, front: -17, y: -10};
      break;
    case 'suspicious':
      brows = {back: 12, front: -6, y: -11};
      break;
    case 'shocked':
      brows = {back: -6, front: 6, y: -20};
      break;
  }

  const mouthOpen = talking ? 2.5 + Math.abs(Math.sin(f * 0.85 + seed)) * 8 : 0;
  let mouth: React.ReactNode = null;
  const my = 30;
  if (mouthOpen > 0.5 && expr !== 'shocked') {
    mouth = <ellipse cx={fx + 4} cy={my} rx={6.5} ry={mouthOpen} fill="#2a0f0d" />;
  } else if (expr === 'shocked') {
    mouth = <ellipse cx={fx + 4} cy={my + 2} rx={7} ry={10} fill="#2a0f0d" />;
  } else if (expr === 'smile') {
    mouth = <path d={`M ${fx - 8} ${my - 2} Q ${fx + 4} ${my + 12} ${fx + 16} ${my - 2}`} stroke="#2a0f0d" strokeWidth={4} strokeLinecap="round" fill="none" />;
  } else if (expr === 'sad') {
    mouth = <path d={`M ${fx - 6} ${my + 4} Q ${fx + 4} ${my - 4} ${fx + 14} ${my + 4}`} stroke="#2a0f0d" strokeWidth={3.5} strokeLinecap="round" fill="none" />;
  }

  const eye = (cx: number) => (
    <circle cx={cx} cy={eyeY} r={eyeR} fill={dark} transform={`translate(${cx},${eyeY}) scale(1,${blink * tired}) translate(${-cx},${-eyeY})`} />
  );

  return (
    <g>
      {eye(fx - 20)}
      {eye(fx + 18)}
      {brows && (
        <g stroke={look.hairColor} strokeWidth={5.5} strokeLinecap="round">
          <line x1={-9} y1={0} x2={9} y2={0} transform={`translate(${fx - 20},${brows.y}) rotate(${brows.back})`} />
          <line x1={-9} y1={0} x2={9} y2={0} transform={`translate(${fx + 18},${brows.y}) rotate(${brows.front})`} />
        </g>
      )}
      {expr === 'shocked' && (
        <g stroke="#ece4d4" strokeWidth={4.5} strokeLinecap="round" opacity={0.95}>
          <line x1={40} y1={-66} x2={48} y2={-80} />
          <line x1={54} y1={-54} x2={68} y2={-62} />
          <line x1={26} y1={-72} x2={28} y2={-88} />
        </g>
      )}
      {look.glasses && (
        <g fill="none" stroke="#c7ccd6" strokeWidth={3.2} opacity={0.9}>
          <circle cx={fx - 20} cy={eyeY} r={15} />
          <circle cx={fx + 18} cy={eyeY} r={15} />
          <line x1={fx - 5} y1={eyeY - 2} x2={fx + 3} y2={eyeY - 2} />
          <line x1={fx - 35} y1={eyeY - 2} x2={-54} y2={eyeY - 4} />
        </g>
      )}
      {mouth}
      {look.stubble && (
        <path
          d={`M ${fx - 14} 38 Q ${fx + 4} 54 ${fx + 24} 36 L ${fx + 22} 44 Q ${fx + 4} 62 ${fx - 14} 46 Z`}
          fill={look.hairColor}
          opacity={0.32}
        />
      )}
      {look.wrinkles && (
        <g stroke={look.skinShade} strokeWidth={2.4} strokeLinecap="round" fill="none">
          <path d={`M ${fx - 34} ${eyeY + 9} q 4 4 8 5`} />
          <path d={`M ${fx + 34} ${eyeY + 9} q -4 4 -8 5`} />
        </g>
      )}
    </g>
  );
};

/* ───────────────────────── Конечности ───────────────────────── */

const Arm: React.FC<{
  x: number;
  sh: number;
  el: number;
  look: Look;
  far?: boolean;
}> = ({x, sh, el, look, far}) => {
  const col = far ? look.topShade : look.topColor;
  return (
    <g transform={`translate(${x},${SHOULDER_Y + 4}) rotate(${-sh})`}>
      <line x1={0} y1={0} x2={0} y2={ARM1} stroke={col} strokeWidth={32} strokeLinecap="round" />
      <g transform={`translate(0,${ARM1}) rotate(${-el})`}>
        <line x1={0} y1={0} x2={0} y2={ARM2 - 6} stroke={col} strokeWidth={30} strokeLinecap="round" />
        <rect x={-16} y={ARM2 - 22} width={32} height={9} rx={4} fill={look.accent} opacity={far ? 0.3 : 0.5} />
        {/* крупная круглая кисть, как в референсе */}
        <circle cx={0} cy={ARM2 + 8} r={19} fill={far ? look.skinShade : look.skin} />
      </g>
    </g>
  );
};

const Leg: React.FC<{
  x: number;
  foot: Vec;
  hipY: number;
  look: Look;
  far?: boolean;
  rim?: string;
  rimAmount?: number;
}> = ({x, foot, hipY, look, far, rim, rimAmount = 0}) => {
  const r = ik({x: 0, y: hipY}, foot);
  const col = far ? '#0f0f14' : look.pants;
  const shoe = far ? '#050507' : look.shoes;
  return (
    <g transform={`translate(${x},${hipY}) rotate(${-r.thigh})`}>
      <line x1={0} y1={0} x2={0} y2={L1} stroke={col} strokeWidth={52} strokeLinecap="round" />
      {!far && rim && <line x1={25} y1={6} x2={25} y2={L1 - 2} stroke={rim} strokeWidth={2.6} strokeLinecap="round" opacity={rimAmount * 0.8} />}
      <g transform={`translate(0,${L1}) rotate(${r.knee})`}>
        <line x1={0} y1={0} x2={0} y2={L2 - 8} stroke={col} strokeWidth={50} strokeLinecap="round" />
        {!far && rim && <line x1={24} y1={0} x2={24} y2={L2 - 12} stroke={rim} strokeWidth={2.6} strokeLinecap="round" opacity={rimAmount * 0.8} />}
        {/* стопа: компенсируем поворот цепочки, чтобы подошва оставалась ровной */}
        <g transform={`translate(0,${L2 - 6}) rotate(${r.shin})`}>
          <path d="M -22 -12 L 18 -12 C 48 -10 60 4 60 18 L -24 18 Z" fill={shoe} />
          <rect x={-24} y={13} width={86} height={6} rx={3} fill={far ? '#000' : '#26262c'} opacity={0.85} />
        </g>
      </g>
    </g>
  );
};

const Backpack: React.FC<{look: Look; kind: 'big' | 'small'}> = ({look, kind}) => {
  const c = look.backpackColor ?? '#3b3f35';
  const big = kind === 'big';
  return (
    <g>
      <rect x={big ? -92 : -80} y={TOP + 14} width={big ? 58 : 44} height={big ? 140 : 100} rx={16} fill={c} />
      <rect x={big ? -92 : -80} y={TOP + 14} width={big ? 58 : 44} height={20} rx={10} fill="#00000033" />
      <rect x={big ? -82 : -72} y={TOP + 74} width={big ? 38 : 26} height={big ? 46 : 32} rx={8} fill="#00000040" />
    </g>
  );
};

const Torso: React.FC<{look: Look; rim?: string; rimAmount?: number}> = ({look, rim, rimAmount = 0}) => {
  const bottom = look.coat ? HIP_Y + 140 : HIP_Y + 30;
  const body = `M -52 ${TOP + 14} Q -52 ${TOP} -38 ${TOP} L 38 ${TOP} Q 52 ${TOP} 52 ${TOP + 14} L 57 ${bottom - 8} Q 57 ${bottom} 46 ${bottom} L -46 ${bottom} Q -57 ${bottom} -57 ${bottom - 8} Z`;
  return (
    <g>
      {look.top === 'hoodie' && <ellipse cx={-6} cy={TOP - 2} rx={62} ry={30} fill={look.topShade} />}
      {look.top === 'hoodie' && <ellipse cx={-6} cy={TOP - 2} rx={50} ry={22} fill="#000" opacity={0.18} />}
      <path d={body} fill={look.topColor} />
      <path d={`M -52 ${bottom - 60} L 52 ${bottom - 60} L 57 ${bottom - 8} Q 57 ${bottom} 46 ${bottom} L -46 ${bottom} Q -57 ${bottom} -57 ${bottom - 8} Z`} fill="#00000026" />
      {look.top === 'hoodie' && (
        <g>
          <path d={`M -34 ${TOP + 130} L 34 ${TOP + 130} L 40 ${TOP + 170} L -40 ${TOP + 170} Z`} fill={look.topShade} opacity={0.85} />
          <line x1={-10} y1={TOP + 6} x2={-12} y2={TOP + 58} stroke={look.accent} strokeWidth={3} strokeLinecap="round" />
          <line x1={12} y1={TOP + 6} x2={14} y2={TOP + 62} stroke={look.accent} strokeWidth={3} strokeLinecap="round" />
        </g>
      )}
      {look.top === 'jacket' && (
        <g>
          <path d={`M -26 ${TOP - 2} L 0 ${TOP + 34} L 26 ${TOP - 2} Z`} fill={look.topShade} />
          <line x1={0} y1={TOP + 34} x2={0} y2={bottom - 4} stroke={look.accent} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
          {/* накладные карманы, как у Лины/Джейка в референсе */}
          <rect x={-46} y={TOP + 96} width={32} height={34} rx={5} fill={look.topShade} opacity={0.9} />
          <rect x={14} y={TOP + 96} width={32} height={34} rx={5} fill={look.topShade} opacity={0.9} />
        </g>
      )}
      {look.top === 'cardigan' && (
        <g>
          <path d={`M -22 ${TOP - 2} L 0 ${TOP + 50} L 22 ${TOP - 2} Z`} fill={look.accent} opacity={0.9} />
          <line x1={0} y1={TOP + 50} x2={0} y2={bottom - 4} stroke={look.topShade} strokeWidth={3} />
        </g>
      )}
      {look.coat && <line x1={0} y1={bottom - 70} x2={0} y2={bottom} stroke="#00000055" strokeWidth={3} />}
      {rim && (
        <path
          d={`M 52 ${TOP + 14} Q 52 ${TOP + 2} 40 ${TOP + 1} M 52 ${TOP + 18} L 57 ${bottom - 10}`}
          stroke={rim}
          strokeWidth={3.2}
          fill="none"
          strokeLinecap="round"
          opacity={rimAmount}
        />
      )}
    </g>
  );
};

/* ───────────────────────── Персонаж ───────────────────────── */

export const Character: React.FC<CharProps> = ({
  char,
  pose = 'idle',
  expr = 'neutral',
  look: lookDir = 0.6,
  tilt = 0,
  talking = false,
  backpack,
  frame,
  seed = 1,
  rim,
  rimAmount = 0.9,
}) => {
  const current = useCurrentFrame();
  const f = (frame ?? current) + seed * 11;
  const L = ROSTER[char];
  const P = poseParams(pose, f);
  if (talking && (pose === 'idle' || pose === 'slump')) {
    // говорящий слегка жестикулирует и кивает
    const g = Math.abs(Math.sin(f * 0.11 + seed));
    P.nSh = 16 + g * 22;
    P.nEl = 36 + g * 30;
    P.headTilt += Math.sin(f * 0.17 + seed) * 2.2;
  }
  const hipY = HIP_Y + P.drop + P.bob;
  const headRot = P.headTilt + tilt + (expr === 'sad' ? 6 : 0);
  const kid = L.kid;
  const bp = backpack ?? !!L.backpack;
  const bpKind = L.backpack ?? 'small';
  const shift = hipY - HIP_Y;

  const body = (
    <g>
      <Arm x={-8} sh={P.fSh} el={P.fEl} look={L} far />
      <Leg x={-4} foot={P.footF} hipY={hipY} look={L} far />
      {bp && (
        <g transform={`translate(0,${shift}) rotate(${P.lean} 0 ${HIP_Y})`}>
          <Backpack look={L} kind={bpKind} />
        </g>
      )}
      <Leg x={6} foot={P.footN} hipY={hipY} look={L} rim={rim} rimAmount={rimAmount} />
      <g transform={`translate(0,${shift}) rotate(${P.lean} 0 ${HIP_Y})`}>
        <Torso look={L} rim={rim} rimAmount={rimAmount} />
        {/* тонкая шея */}
        <rect x={-9} y={TOP - 26} width={20} height={34} rx={7} fill={L.skinShade} />
        {/* голова */}
        <g transform={`translate(0,${HEAD_Y}) rotate(${headRot} 0 40) scale(${HEAD_S * (kid ? 1.28 : 1)})`}>
          <HairBack look={L} f={f} />
          <circle r={56} fill={L.skin} />
          {rim && (
            <circle
              r={56}
              fill="none"
              stroke={rim}
              strokeWidth={3.6}
              strokeLinecap="round"
              opacity={rimAmount}
              strokeDasharray="100 400"
              transform="rotate(-62)"
            />
          )}
          <Face look={L} expr={expr} lookDir={lookDir} talking={talking} f={f} seed={seed} />
          <HairFront look={L} />
          {L.goggles && (
            <g>
              <path d="M -58 -22 Q 0 -46 60 -22" stroke="#1d1f24" strokeWidth={9} fill="none" strokeLinecap="round" />
              <circle cx={8} cy={-46} r={17} fill="#1d1f24" />
              <circle cx={36} cy={-42} r={15} fill="#1d1f24" />
              <circle cx={8} cy={-46} r={11} fill="#7ec8e3" opacity={0.85} />
              <circle cx={36} cy={-42} r={9.5} fill="#7ec8e3" opacity={0.85} />
            </g>
          )}
        </g>
      </g>
      <g transform={`translate(0,${shift}) rotate(${P.lean} 0 ${HIP_Y})`}>
        <Arm x={8} sh={P.nSh} el={P.nEl} look={L} />
      </g>
    </g>
  );

  const k = (L.size ?? 1) * (kid ? 0.62 : 1);
  return <g transform={`scale(${k})`}>{body}</g>;
};
