import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {CharId, Expr, Pose} from '../types';
import {ROSTER, type Look} from './roster';
import {clamp} from '../animations/ease';

/* Локальные координаты: ноги стоят в (0,0), персонаж смотрит вправо (+x), рост ≈ 430. */

const L1 = 88; // бедро
const L2 = 86; // голень
const HIP_Y = -(L1 + L2) + 2;
const SHOULDER_Y = -308;
const HEAD_Y = -372;
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

/** Двухсуставная обратная кинематика: возвращает углы бедра/колена (в градусах, «вперёд — плюс»). */
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
  headLook: number;
}

function poseParams(pose: Pose, f: number): PoseParams {
  const breathe = Math.sin(f * 0.07);
  const base: PoseParams = {
    nSh: 5 + breathe * 1.5,
    nEl: 8,
    fSh: 3,
    fEl: 6,
    lean: 0,
    bob: breathe * 2,
    drop: 0,
    footN: {x: 7, y: 0},
    footF: {x: -9, y: 0},
    headTilt: breathe * 0.8,
    headLook: 0,
  };
  switch (pose) {
    case 'walk':
    case 'run': {
      const run = pose === 'run';
      const p = f * (run ? 0.3 : 0.13);
      const stride = run ? 80 : 48;
      const lift = run ? 58 : 30;
      const s = Math.sin(p);
      const c = Math.cos(p);
      const swing = run ? 58 : 26;
      return {
        ...base,
        nSh: -swing * s + 6,
        nEl: (run ? 80 : 14) + (run ? 8 : 18) * Math.max(0, -s),
        fSh: swing * s + 6,
        fEl: (run ? 80 : 14) + (run ? 8 : 18) * Math.max(0, s),
        lean: run ? 11 : 2,
        bob: -(run ? 12 : 6) * Math.cos(2 * p) - (run ? 6 : 0),
        footN: {x: stride * s, y: -lift * Math.max(0, c)},
        footF: {x: -stride * s, y: -lift * Math.max(0, -c)},
        headTilt: run ? 3 : 1,
      };
    }
    case 'reach': {
      const press = Math.sin(f * 0.25) * 2;
      return {...base, nSh: 78 + press, nEl: 14, fSh: 6, fEl: 10, lean: 4, headTilt: 3};
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
        drop: 74,
        lean: 16,
        nSh: 50,
        nEl: 44,
        fSh: 40,
        fEl: 40,
        footN: {x: 36, y: 0},
        footF: {x: 4, y: 0},
        headTilt: 4,
      };
    case 'sit':
      return {
        ...base,
        drop: 78,
        lean: 2,
        nSh: 24,
        nEl: 70,
        fSh: 18,
        fEl: 74,
        footN: {x: 126, y: 0},
        footF: {x: 100, y: 0},
      };
    case 'slump':
      return {
        ...base,
        lean: 7,
        nSh: 10,
        nEl: 14,
        fSh: 6,
        fEl: 10,
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

const HairFront: React.FC<{look: Look; f: number}> = ({look, f}) => {
  const c = look.hairColor;
  switch (look.hair) {
    case 'messy':
      return (
        <g fill={c}>
          <path d="M -59 10 C -70 -42 -30 -74 6 -68 C 42 -68 66 -42 59 -10 L 45 -24 L 41 -4 L 27 -28 L 14 -6 L 3 -32 L -9 -8 L -22 -32 L -31 -4 L -41 -22 L -47 8 Z" />
          <path d="M -22 -64 L -30 -80 L -8 -68 Z M 8 -68 L 12 -84 L 26 -66 Z M 32 -60 L 46 -72 L 50 -52 Z" />
        </g>
      );
    case 'ponytail': {
      return (
        <path
          fill={c}
          d="M -59 10 C -66 -46 -26 -70 8 -67 C 46 -65 66 -36 59 -12 C 44 -36 12 -42 -12 -30 C -30 -22 -44 -6 -50 12 Z"
        />
      );
    }
    case 'short':
      return (
        <g fill={c}>
          <path d="M -58 6 C -68 -42 -28 -70 8 -66 C 44 -64 64 -38 58 -8 L 44 -26 L 36 -14 L 22 -32 L 8 -20 L -6 -34 L -20 -18 L -34 -26 L -46 -6 Z" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          {/* чёлка из-под шапки */}
          <path fill={c} d="M -42 -14 C -30 4 -10 -4 -2 -12 C 12 -2 30 4 44 -12 L 44 -22 L -42 -22 Z" />
          <path fill={look.beanie} d="M -62 -2 C -66 -52 -30 -82 4 -82 C 40 -82 66 -52 62 -2 Z" />
          <rect x={-63} y={-20} width={126} height={20} rx={9} fill="#1b1d23" />
          <circle cx={2} cy={-86} r={9} fill={look.beanie} />
        </g>
      );
    case 'long':
      return (
        <path
          fill={c}
          d="M -60 20 C -70 -44 -30 -72 6 -68 C 44 -66 66 -38 59 -8 C 40 -34 8 -42 -14 -28 C -32 -18 -44 0 -48 22 Z"
        />
      );
  }
};

const HairBack: React.FC<{look: Look; f: number}> = ({look, f}) => {
  if (look.hair === 'ponytail') {
    const sway = Math.sin(f * 0.1) * 5;
    return (
      <g transform={`translate(-52,-28) rotate(${sway})`}>
        <path
          fill={look.hairColor}
          d="M 6 -4 C -38 -14 -70 22 -52 84 C -44 50 -26 26 6 20 Z"
        />
        <rect x={-6} y={-8} width={14} height={26} rx={5} fill={look.accent} />
      </g>
    );
  }
  if (look.hair === 'long') {
    return (
      <path
        fill={look.hairColor}
        d="M -56 -20 C -78 20 -76 90 -52 118 L 12 118 C 4 70 -6 34 6 -10 Z"
      />
    );
  }
  if (look.hair === 'beanie') {
    return <path fill={look.hairColor} d="M -58 0 C -68 30 -60 58 -44 62 L -36 18 Z" />;
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
  const eyeY = 4;
  const dark = '#15110f';
  const b = (f + seed * 37) % 118;
  const blink = b < 5 ? Math.max(0.12, Math.abs(b - 2.5) / 2.5) : 1;
  const tired = expr === 'tired' ? 0.58 : 1;
  const wide = expr === 'shocked';
  const eyeR = wide ? 8.5 : 7;

  // брови
  let backRot = 0;
  let frontRot = 0;
  let browY = -14;
  switch (expr) {
    case 'worried':
    case 'sad':
      backRot = -16;
      frontRot = 16;
      browY = -16;
      break;
    case 'determined':
      backRot = 14;
      frontRot = -14;
      browY = -11;
      break;
    case 'shocked':
      browY = -22;
      backRot = -6;
      frontRot = 6;
      break;
    case 'suspicious':
      backRot = 10;
      frontRot = -4;
      browY = -13;
      break;
    case 'tired':
      browY = -11;
      backRot = -5;
      frontRot = 5;
      break;
    case 'smile':
      browY = -16;
      break;
  }

  const mouthOpen = talking ? 2.5 + Math.abs(Math.sin(f * 0.85 + seed)) * 8 : 0;
  let mouth: React.ReactNode;
  const my = 28;
  if (mouthOpen > 0.5 && expr !== 'shocked') {
    mouth = <ellipse cx={fx + 4} cy={my} rx={7.5} ry={mouthOpen} fill="#2a0f0d" />;
  } else {
    let d = 'M -10 0 Q 0 2 10 0';
    switch (expr) {
      case 'smile':
        d = 'M -12 -2 Q 0 12 12 -2';
        break;
      case 'worried':
      case 'sad':
        d = 'M -10 5 Q 0 -5 10 5';
        break;
      case 'determined':
        d = 'M -10 2 L 10 -1';
        break;
      case 'tired':
        d = 'M -8 2 L 8 2';
        break;
      case 'suspicious':
        d = 'M -10 3 Q 0 0 10 -3';
        break;
    }
    mouth =
      expr === 'shocked' ? (
        <ellipse cx={fx + 4} cy={my + 2} rx={8} ry={11} fill="#2a0f0d" />
      ) : (
        <path
          d={d}
          transform={`translate(${fx + 4},${my})`}
          stroke="#2a0f0d"
          strokeWidth={4.2}
          strokeLinecap="round"
          fill="none"
        />
      );
  }

  const eye = (cx: number) => (
    <g transform={`translate(${cx},${eyeY}) scale(1,${blink * tired})`}>
      {wide && <circle r={11.5} fill="#f3eee6" />}
      <circle r={wide ? 5 : eyeR} fill={dark} />
      {!wide && <circle cx={2} cy={-2.4} r={2.1} fill="#f3eee6" opacity={0.85} />}
    </g>
  );

  return (
    <g>
      {eye(fx - 20)}
      {eye(fx + 18)}
      <g stroke={look.hairColor} strokeWidth={5} strokeLinecap="round">
        <line x1={-9} y1={0} x2={9} y2={0} transform={`translate(${fx - 20},${browY}) rotate(${backRot})`} />
        <line x1={-9} y1={0} x2={9} y2={0} transform={`translate(${fx + 18},${browY}) rotate(${frontRot})`} />
      </g>
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
          opacity={0.38}
        />
      )}
      {look.wrinkles && (
        <g stroke={look.skinShade} strokeWidth={2.4} strokeLinecap="round" fill="none">
          <path d={`M ${fx - 34} ${eyeY + 8} q 4 4 8 5`} />
          <path d={`M ${fx + 34} ${eyeY + 8} q -4 4 -8 5`} />
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
  rim?: string;
  rimAmount?: number;
}> = ({x, sh, el, look, far, rim, rimAmount = 0}) => {
  const col = far ? look.topShade : look.topColor;
  return (
    <g transform={`translate(${x},${SHOULDER_Y + 6}) rotate(${-sh})`}>
      <line x1={0} y1={0} x2={0} y2={76} stroke={col} strokeWidth={31} strokeLinecap="round" />
      <g transform={`translate(0,76) rotate(${-el})`}>
        <line x1={0} y1={0} x2={0} y2={66} stroke={col} strokeWidth={28} strokeLinecap="round" />
        <rect x={-15} y={56} width={30} height={9} rx={4} fill={look.accent} opacity={far ? 0.45 : 0.7} />
        <circle cx={0} cy={78} r={14.5} fill={far ? look.skinShade : look.skin} />
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
}> = ({x, foot, hipY, look, far}) => {
  const r = ik({x: 0, y: hipY}, foot);
  const col = far ? '#14161c' : look.pants;
  const shoe = far ? '#050507' : look.shoes;
  return (
    <g transform={`translate(${x},${hipY}) rotate(${-r.thigh})`}>
      <line x1={0} y1={0} x2={0} y2={L1} stroke={col} strokeWidth={36} strokeLinecap="round" />
      <g transform={`translate(0,${L1}) rotate(${r.knee})`}>
        <line x1={0} y1={0} x2={0} y2={L2 - 6} stroke={col} strokeWidth={31} strokeLinecap="round" />
        {/* стопа: компенсируем поворот цепочки, чтобы подошва оставалась ровной */}
        <g transform={`translate(0,${L2 - 4}) rotate(${r.shin})`}>
          <path d="M -15 -8 L 14 -8 C 38 -6 46 4 46 12 L -17 12 Z" fill={shoe} />
          <rect x={-17} y={9} width={64} height={5} rx={2} fill={far ? '#000' : '#26272d'} opacity={0.8} />
        </g>
      </g>
    </g>
  );
};

const Backpack: React.FC<{look: Look; kind: 'big' | 'small'; hipDrop: number}> = ({look, kind, hipDrop}) => {
  const c = look.backpackColor ?? '#3b3f35';
  const big = kind === 'big';
  return (
    <g>
      <rect x={big ? -88 : -76} y={SHOULDER_Y + 14} width={big ? 56 : 42} height={big ? 130 : 92} rx={16} fill={c} />
      <rect x={big ? -88 : -76} y={SHOULDER_Y + 14} width={big ? 56 : 42} height={20} rx={10} fill="#00000033" />
      <rect x={big ? -78 : -68} y={SHOULDER_Y + 70} width={big ? 36 : 24} height={big ? 44 : 30} rx={8} fill="#00000040" />
    </g>
  );
};

const Torso: React.FC<{look: Look; rim?: string; rimAmount?: number; f: number}> = ({look, rim, rimAmount = 0, f}) => {
  const body = 'M -56 -318 Q -58 -318 -58 -300 L -52 -176 Q -52 -164 -40 -164 L 40 -164 Q 52 -164 52 -176 L 58 -300 Q 58 -318 56 -318 Z';
  return (
    <g>
      {look.top === 'hoodie' && <ellipse cx={-8} cy={SHOULDER_Y - 6} rx={60} ry={30} fill={look.topShade} />}
      <path d={body} fill={look.topColor} />
      {/* тень снизу */}
      <path d="M -52 -214 L 52 -214 L 55 -176 Q 52 -164 40 -164 L -40 -164 Q -52 -164 -52 -176 Z" fill="#00000026" />
      {look.top === 'hoodie' && (
        <g>
          <path d="M -34 -236 L 34 -236 L 40 -196 L -40 -196 Z" fill={look.topShade} opacity={0.85} />
          <line x1={-10} y1={-312} x2={-12} y2={-262} stroke={look.accent} strokeWidth={3} strokeLinecap="round" />
          <line x1={12} y1={-312} x2={14} y2={-258} stroke={look.accent} strokeWidth={3} strokeLinecap="round" />
        </g>
      )}
      {look.top === 'jacket' && (
        <g>
          <path d="M -26 -320 L 0 -286 L 26 -320 Z" fill={look.topShade} />
          <line x1={0} y1={-286} x2={0} y2={-166} stroke={look.accent} strokeWidth={3.5} strokeLinecap="round" opacity={0.85} />
          <rect x={-56} y={-186} width={112} height={8} fill={look.accent} opacity={0.25} />
        </g>
      )}
      {look.top === 'cardigan' && (
        <g>
          <path d="M -22 -320 L 0 -270 L 22 -320 Z" fill={look.accent} opacity={0.9} />
          <line x1={0} y1={-270} x2={0} y2={-166} stroke={look.topShade} strokeWidth={3} />
        </g>
      )}
      {rim && (
        <path d="M -56 -314 Q -58 -314 -58 -300 L -52 -182" stroke={rim} strokeWidth={3} fill="none" strokeLinecap="round" opacity={rimAmount} />
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
  rimAmount = 0.8,
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

  const body = (
    <g>
      <Arm x={-8} sh={P.fSh} el={P.fEl} look={L} far />
      <Leg x={-4} foot={P.footF} hipY={hipY} look={L} far />
      {bp && <g transform={`translate(0,${hipY - HIP_Y}) rotate(${P.lean} 0 ${HIP_Y})`}><Backpack look={L} kind={bpKind} hipDrop={P.drop} /></g>}
      <Leg x={6} foot={P.footN} hipY={hipY} look={L} />
      <g transform={`translate(0,${hipY - HIP_Y}) rotate(${P.lean} 0 ${HIP_Y})`}>
        <Torso look={L} rim={rim} rimAmount={rimAmount} f={f} />
        {/* шея */}
        <rect x={-14} y={-336} width={30} height={30} rx={8} fill={L.skinShade} />
        {/* голова */}
        <g transform={`translate(0,${HEAD_Y}) rotate(${headRot} 0 40) scale(${kid ? 1.28 : 1})`}>
          <HairBack look={L} f={f} />
          <circle r={56} fill={L.skin} />
          {rim && (
            <circle
              r={56}
              fill="none"
              stroke={rim}
              strokeWidth={3.2}
              strokeLinecap="round"
              opacity={rimAmount}
              strokeDasharray="88 400"
              transform="rotate(168)"
            />
          )}
          {/* ухо */}
          <ellipse cx={-30} cy={10} rx={8} ry={11} fill={L.skinShade} />
          <Face look={L} expr={expr} lookDir={lookDir} talking={talking} f={f} seed={seed} />
          <HairFront look={L} f={f} />
          {L.goggles && (
            <g>
              <path d="M -56 -22 Q 0 -44 58 -22" stroke="#1d1f24" strokeWidth={9} fill="none" strokeLinecap="round" />
              <circle cx={8} cy={-44} r={17} fill="#1d1f24" />
              <circle cx={36} cy={-40} r={15} fill="#1d1f24" />
              <circle cx={8} cy={-44} r={11} fill="#7ec8e3" opacity={0.85} />
              <circle cx={36} cy={-40} r={9.5} fill="#7ec8e3" opacity={0.85} />
            </g>
          )}
        </g>
      </g>
      <g transform={`translate(0,${hipY - HIP_Y}) rotate(${P.lean} 0 ${HIP_Y})`}>
        <Arm x={8} sh={P.nSh} el={P.nEl} look={L} rim={rim} rimAmount={rimAmount} />
      </g>
    </g>
  );

  const k = (L.size ?? 1) * (kid ? 0.62 : 1);
  return (
    <g transform={`scale(${k})`}>
      {body}
    </g>
  );
};
