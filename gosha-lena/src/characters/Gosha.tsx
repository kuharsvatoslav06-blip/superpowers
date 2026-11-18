import React from 'react';

/**
 * Гоша (скуф v2) — векторная копия референса gosha_skuf2_fullbody_bg.png,
 * разобранная на группы для программных эмоций.
 * Система координат: 1029 x 2000 (как у референса, уменьшенного до 1029 px).
 */

export type Eyes = 'sleepy' | 'shock' | 'happy' | 'angry' | 'worried';
export type Mouth = 'flat' | 'open' | 'smile' | 'grit' | 'o';
export type Antenna = 'curl' | 'up';
export type ArmPose = 'down' | 'wave' | 'raise';

export type GoshaProps = {
  eyes?: Eyes;
  mouth?: Mouth;
  antenna?: Antenna;
  sweat?: boolean;
  leftArm?: ArmPose;
  /** угол взмаха руки в градусах (добавляется к позе) */
  armSwing?: number;
  /** поворот антенны в градусах (подёргивание) */
  antennaWiggle?: number;
  /** 0..1 — моргание (1 = глаза закрыты) */
  blink?: number;
  showMug?: boolean;
  showStink?: boolean;
  /** 'full' — в полный рост, 'bust' — по пояс */
  crop?: 'full' | 'bust' | 'head';
  /** борода: full — как в 1 серии, stubble — щетина после бритья, none — гладко */
  beard?: 'full' | 'stubble' | 'none';
  /** волосы: long — до плеч, short — после барбера */
  hair?: 'long' | 'short';
  /** накидка парикмахера */
  cape?: boolean;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
};

export const INK = '#1E1E2A';
const SKIN = '#F4C6A0';
const SKIN_D = '#E9AE8A';
const HAIR = '#3B281D';
const BEARD = '#7A4A28';
const BEARD_D = '#5A341C';
const BLUE = '#2F6FD6';
const SHIRT = '#E4E0D4';
const PANTS = '#6E7280';
const SW = 10; // толщина контура

export const VIEWBOX = {
  full: '150 300 800 1680',
  bust: '170 300 760 1000',
  head: '270 300 500 640',
};

const Pimple: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 9 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.6} fill="#E86A72" opacity={0.35} />
    <circle cx={x} cy={y} r={r} fill="#E0333F" stroke="#B3202C" strokeWidth={2} />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff" />
  </g>
);

const PIMPLES: [number, number, number?][] = [
  [513, 605, 10], [567, 598, 8], [360, 660, 8], [372, 694, 11], [393, 722, 9], [425, 703, 6],
  [536, 703, 7], [604, 700, 6], [656, 692, 11], [668, 657, 8], [638, 722, 9],
];

const STUBBLE: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let y = 748; y <= 885; y += 13)
    for (let x = 372; x <= 660; x += 15) {
      const j = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const r = j - Math.floor(j);
      const xx = x + ((y / 13) % 2 ? 7 : 0) + (r - 0.5) * 9;
      const dx = (xx - 515) / 165, dy = (y - 700) / 200;
      if (dx * dx + dy * dy < 1 && r > 0.18 && !(Math.abs(xx - 515) < 60 && y > 770 && y < 820)) out.push([xx, y + (r - 0.5) * 7]);
    }
  return out;
})();

const CURLS: [number, number][] = [
  [397, 745], [455, 738], [575, 735], [612, 748], [390, 785], [440, 792], [640, 785], [600, 806],
  [520, 815], [545, 820], [580, 820], [630, 818], [470, 862], [495, 852], [520, 875], [520, 890],
  [565, 852], [405, 868], [435, 888], [625, 872], [470, 830],
];

const BELLY_HAIR: [number, number, number][] = [
  [297, 1287, 30], [335, 1345, 30], [307, 1365, 30], [383, 1333, -30], [365, 1378, -30], [415, 1305, 30],
  [413, 1345, -30], [438, 1352, -30], [455, 1365, 30], [482, 1293, -30], [487, 1308, -30], [520, 1293, 30],
  [527, 1355, -30], [552, 1308, 30], [580, 1288, 30], [637, 1300, 30], [688, 1295, -30], [740, 1285, 30],
  [603, 1390, 30], [648, 1378, 30], [382, 1424, 30], [395, 1452, -30], [427, 1430, -30], [447, 1430, 30],
  [483, 1418, -30], [520, 1415, -30], [568, 1440, 30], [612, 1420, 30], [660, 1462, 30], [518, 1465, -30],
  [445, 1488, 30], [582, 1488, 30],
];

export const Gosha: React.FC<GoshaProps> = ({
  eyes = 'sleepy',
  mouth = 'flat',
  antenna = 'curl',
  sweat = false,
  leftArm = 'down',
  armSwing = 0,
  antennaWiggle = 0,
  blink = 0,
  showMug = true,
  showStink = false,
  crop = 'full',
  beard = 'full',
  hair = 'long',
  cape = false,
  style,
  width = '100%',
  height = '100%',
}) => {
  const armAngle = (leftArm === 'wave' ? 160 : leftArm === 'raise' ? 120 : 0) + armSwing;
  const lidDrop = eyes === 'sleepy' || eyes === 'angry' ? 0.45 : eyes === 'worried' ? 0.2 : 0;

  const eye = (cx: number, side: -1 | 1) => {
    const cy = 645;
    if (eyes === 'happy') {
      return (
        <g key={side}>
          <path d={`M ${cx - 38} ${cy + 8} Q ${cx} ${cy - 34} ${cx + 38} ${cy + 8}`} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
        </g>
      );
    }
    const shock = eyes === 'shock';
    const rx = shock ? 56 : 46;
    const ry = shock ? 52 : 36;
    const pr = shock ? 8 : 14;
    const lidY = cy - ry + (2 * ry) * Math.max(lidDrop, blink);
    const clipId = `eyeclip${side}`;
    return (
      <g key={side}>
        <defs>
          <clipPath id={clipId}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
          </clipPath>
        </defs>
        {/* мешки под глазами */}
        <path d={`M ${cx - 45} ${cy + 28} Q ${cx} ${cy + 62} ${cx + 45} ${cy + 28}`} fill="none" stroke="#B48BB4" strokeWidth={14} strokeLinecap="round" opacity={0.6} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" />
        <g clipPath={`url(#${clipId})`}>
          <circle cx={cx + (shock ? 0 : 3)} cy={cy + (shock ? 0 : 5)} r={pr} fill={INK} />
          <circle cx={cx + (shock ? -2 : 0)} cy={cy + (shock ? -2 : 0)} r={pr * 0.3} fill="#fff" />
          {/* веко */}
          {(lidDrop > 0 || blink > 0) && (
            <>
              <rect x={cx - rx - 5} y={cy - ry - 10} width={rx * 2 + 10} height={lidY - (cy - ry - 10)} fill={SKIN} />
              <line x1={cx - rx - 5} y1={lidY} x2={cx + rx + 5} y2={lidY} stroke={INK} strokeWidth={10} />
            </>
          )}
        </g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={12} />
        {eyes === 'angry' && (
          <path d={side < 0 ? `M ${cx - 55} ${cy - 62} L ${cx + 45} ${cy - 30}` : `M ${cx + 55} ${cy - 62} L ${cx - 45} ${cy - 30}`} stroke={INK} strokeWidth={18} strokeLinecap="round" />
        )}
        {eyes === 'worried' && (
          <path d={side < 0 ? `M ${cx - 50} ${cy - 40} L ${cx + 40} ${cy - 66}` : `M ${cx + 50} ${cy - 40} L ${cx - 40} ${cy - 66}`} stroke={HAIR} strokeWidth={16} strokeLinecap="round" />
        )}
      </g>
    );
  };

  const mouthEl = (() => {
    switch (mouth) {
      case 'open':
        return (
          <g>
            <ellipse cx={515} cy={812} rx={42} ry={40} fill="#6B1A1F" stroke={INK} strokeWidth={9} />
            <ellipse cx={515} cy={834} rx={24} ry={12} fill="#D9606A" />
            <rect x={502} y={776} width={16} height={16} rx={2} fill="#F2D27A" stroke={INK} strokeWidth={3} />
          </g>
        );
      case 'o':
        return <ellipse cx={515} cy={800} rx={20} ry={22} fill="#6B1A1F" stroke={INK} strokeWidth={8} />;
      case 'smile':
        return (
          <g>
            <path d="M 462 788 Q 515 845 568 788 Z" fill="#6B1A1F" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
            <rect x={503} y={789} width={14} height={13} rx={2} fill="#F2D27A" stroke={INK} strokeWidth={3} />
          </g>
        );
      case 'grit':
        return (
          <g>
            <rect x={466} y={784} width={98} height={30} rx={10} fill="#fff" stroke={INK} strokeWidth={8} />
            <line x1={466} y1={799} x2={564} y2={799} stroke={INK} strokeWidth={4} />
            {[490, 515, 540].map((x) => (
              <line key={x} x1={x} y1={786} x2={x} y2={812} stroke={INK} strokeWidth={4} />
            ))}
          </g>
        );
      default:
        return (
          <g>
            <path d="M 467 795 Q 515 780 563 795 Q 515 812 467 795 Z" fill="#6B1A1F" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
            <rect x={503} y={790} width={13} height={10} rx={1} fill="#F2D27A" />
          </g>
        );
    }
  })();

  const antennaPath = antenna === 'up'
    ? 'M 513 410 L 520 360 L 500 330 L 525 290 L 505 250'
    : 'M 513 408 C 505 360 520 325 555 322 C 585 322 585 352 563 356 C 548 358 545 340 558 336';

  return (
    <svg viewBox={VIEWBOX[crop]} width={width} height={height} style={{ overflow: 'visible', ...style }} xmlns="http://www.w3.org/2000/svg">
      {/* тень под ногами */}
      {crop === 'full' && <ellipse cx={515} cy={1948} rx={340} ry={32} fill="#000" opacity={0.18} />}

      {/* ========== НОГИ ========== */}
      <g id="legs">
        <path d="M 248 1470 L 225 1872 L 488 1872 L 507 1600 L 522 1600 L 545 1872 L 805 1872 L 782 1470 Z" fill={PANTS} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M 515 1550 L 515 1600" stroke={INK} strokeWidth={8} />
        {/* дырка на колене */}
        <ellipse cx={360} cy={1712} rx={45} ry={33} fill={SKIN} stroke={INK} strokeWidth={8} />
        <path d="M 345 1700 l -8 12 M 375 1708 l -8 12" stroke="#8A5A3A" strokeWidth={4} strokeLinecap="round" />
        <path d="M 706 1632 Q 730 1618 745 1652" fill="none" stroke="#B9BCC6" strokeWidth={7} strokeLinecap="round" />
        {/* синий тапок */}
        <path d="M 205 1862 L 485 1862 Q 500 1895 490 1915 Q 478 1945 440 1945 L 215 1945 Q 190 1945 192 1905 Q 194 1872 205 1862 Z" fill={BLUE} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <line x1={256} y1={1897} x2={442} y2={1897} stroke="#DCE6FA" strokeWidth={9} strokeLinecap="round" />
        {/* зелёный дырявый носок */}
        <path d="M 545 1862 L 805 1862 Q 840 1872 840 1905 Q 838 1945 800 1945 L 548 1945 Q 528 1905 545 1862 Z" fill="#7CC36A" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <line x1={590} y1={1882} x2={762} y2={1882} stroke="#5DA34E" strokeWidth={8} />
        <ellipse cx={806} cy={1905} rx={22} ry={17} fill={SKIN} stroke={INK} strokeWidth={6} />
      </g>

      {/* ========== РУКИ (за пузом) ========== */}
      <g id="arm-left" transform={`rotate(${armAngle} 268 1000)`}>
        <ellipse cx={262} cy={1015} rx={50} ry={46} fill={SKIN} stroke={INK} strokeWidth={SW} />
        <path d="M 248 975 C 205 1050 160 1180 152 1300 C 148 1380 152 1440 160 1470 L 238 1470 C 230 1400 232 1290 245 1200 C 255 1120 280 1050 300 1000 Z" fill={SKIN} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <circle cx={198} cy={1485} r={45} fill={SKIN} stroke={INK} strokeWidth={SW} />
        <path d="M 176 1500 Q 198 1518 220 1500" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      </g>
      <g id="arm-right">
        <ellipse cx={766} cy={1015} rx={50} ry={46} fill={SKIN} stroke={INK} strokeWidth={SW} />
        <path d="M 780 975 C 830 1050 870 1180 878 1320 L 878 1380 L 800 1380 C 800 1290 790 1200 780 1150 C 770 1100 750 1040 730 1000 Z" fill={SKIN} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      </g>

      {/* ========== ВОЛОСЫ СЗАДИ ========== */}
      {hair === 'short' ? (
        <path id="hair-back" d="M 305 662 C 285 450 395 360 515 360 C 640 360 748 450 728 662 Z" fill={HAIR} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      ) : (
      <path
        id="hair-back"
        d="M 298 640 C 280 450 390 358 515 358 C 640 358 748 450 735 640 C 732 720 742 800 735 860 C 730 890 718 915 708 930 L 690 880 L 668 935 L 640 885 L 615 935 L 515 940 L 418 935 L 395 885 L 372 935 L 350 880 L 326 930 C 310 900 298 860 295 800 C 292 740 300 700 298 640 Z"
        fill={HAIR} stroke={INK} strokeWidth={SW} strokeLinejoin="round"
      />
      )}

      {/* ========== МАЙКА ========== */}
      <g id="shirt">
        <path d="M 333 945 L 700 945 C 745 1010 775 1100 785 1195 L 245 1195 C 255 1100 285 1010 333 945 Z" fill={SHIRT} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        {/* шея и горловина */}
        <path d="M 385 945 Q 400 1012 515 1012 Q 630 1012 642 945 Z" fill={SKIN_D} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M 445 850 L 440 958 Q 515 990 590 958 L 585 850 Z" fill={SKIN_D} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        {[[462, 985], [478, 995], [520, 995], [535, 1000], [550, 1010], [568, 1005], [485, 1015], [545, 1020]].map(([x, y], i) => (
          <line key={i} x1={x} y1={y} x2={x + (i % 2 ? 7 : -7)} y2={y + 14} stroke="#6B3E22" strokeWidth={4} strokeLinecap="round" />
        ))}
        <ellipse cx={342} cy={1090} rx={33} ry={25} fill="#DCC06A" />
        <ellipse cx={625} cy={1067} rx={32} ry={26} fill="#CF5A4C" />
        <circle cx={470} cy={1117} r={18} fill="#AE9A7E" />
        <circle cx={690} cy={1132} r={11} fill="#AE9A7E" />
      </g>

      {/* ========== ПУЗО ========== */}
      <g id="belly">
        <ellipse cx={515} cy={1362} rx={320} ry={198} fill={SKIN} stroke={INK} strokeWidth={SW} />
        <path d="M 278 1432 Q 515 1580 752 1432" fill="none" stroke="#E7A985" strokeWidth={12} strokeLinecap="round" />
        {BELLY_HAIR.map(([x, y, a], i) => (
          <line key={i} x1={x} y1={y - 10} x2={x + (a > 0 ? 6 : -6)} y2={y + 10} stroke="#8A5A3A" strokeWidth={4} strokeLinecap="round" />
        ))}
        <path d="M 503 1398 C 498 1385 515 1378 525 1386 C 532 1394 522 1408 508 1405" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      </g>

      {/* ========== НАКИДКА ПАРИКМАХЕРА ========== */}
      {cape && (
        <g id="cape">
          <path d="M 400 930 Q 515 975 630 930 C 760 990 860 1150 900 1600 L 130 1600 C 170 1150 270 990 400 930 Z" fill="#F4F6FA" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          {[260, 380, 515, 650, 770].map((x) => (
            <path key={x} d={`M ${x} 1050 L ${x + (x - 515) * 0.25} 1600`} stroke="#C8D3E6" strokeWidth={14} />
          ))}
          <path d="M 400 930 Q 515 975 630 930" fill="none" stroke={INK} strokeWidth={SW} />
        </g>
      )}

      {/* ========== ГОЛОВА ========== */}
      <g id="head">
        {/* лицо */}
        {beard === 'full' ? (
          <>
            <path d="M 340 650 C 340 545 420 500 515 500 C 610 500 695 545 695 650 C 695 700 690 730 680 750 L 350 750 C 342 730 340 700 340 650 Z" fill={SKIN} stroke={INK} strokeWidth={SW} />
            {/* борода */}
            <path
              id="beard"
              d="M 345 700 C 360 720 380 740 405 742 C 440 745 470 730 515 728 C 560 730 600 745 630 742 C 655 740 675 720 690 700 C 690 820 620 925 515 925 C 410 925 345 820 345 700 Z"
              fill={BEARD} stroke={INK} strokeWidth={SW} strokeLinejoin="round"
            />
            {CURLS.map(([x, y], i) => (
              <path key={i} d={`M ${x - 8} ${y} q 8 12 16 0`} fill="none" stroke={BEARD_D} strokeWidth={5} strokeLinecap="round" />
            ))}
          </>
        ) : (
          <>
            <path id="face" d="M 340 650 C 340 545 420 500 515 500 C 610 500 695 545 695 650 C 695 800 625 905 515 905 C 405 905 340 800 340 650 Z" fill={SKIN} stroke={INK} strokeWidth={SW} />
            {/* подбородок и щёки */}
            <path d="M 470 880 Q 515 892 560 880" fill="none" stroke={SKIN_D} strokeWidth={8} strokeLinecap="round" />
            {beard === 'stubble' && (
              <g id="stubble" fill="#7D7487" opacity={0.55}>
                {STUBBLE.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.2} />)}
              </g>
            )}
          </>
        )}
        {/* пот */}
        {sweat && (
          <g id="sweat">
            {[[360, 610, 1], [672, 600, 1.2], [690, 690, 0.9]].map(([x, y, s], i) => (
              <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M 0 -26 C 10 -10 16 0 16 8 C 16 18 8 24 0 24 C -8 24 -16 18 -16 8 C -16 0 -10 -10 0 -26 Z" fill="#8FD3FF" stroke={INK} strokeWidth={5} />
            ))}
          </g>
        )}
        {/* глаза */}
        <g id="eyes">
          {eye(448, -1)}
          {eye(583, 1)}
        </g>
        {/* прыщи */}
        <g id="pimples">{PIMPLES.map(([x, y, r], i) => <Pimple key={i} x={x} y={y} r={r} />)}</g>
        {/* нос картошкой */}
        <path id="nose" d="M 515 660 C 500 680 482 702 487 720 C 492 740 538 740 543 720 C 548 702 530 680 515 660 Z" fill="#E8877A" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <Pimple x={536} y={703} r={7} />
        {/* усы */}
        {beard === 'full' && <path id="mustache" d="M 432 776 C 450 750 495 748 515 765 C 535 748 580 750 598 776 C 575 770 545 772 515 782 C 485 772 455 770 432 776 Z" fill={BEARD_D} stroke={INK} strokeWidth={8} strokeLinejoin="round" />}
        <g id="mouth">{mouthEl}</g>

        {/* чёлка и верх волос */}
        {hair === 'short' ? (
          <path
            id="hair-front"
            d="M 330 640 C 320 520 410 470 515 470 C 625 470 712 520 705 640 C 692 600 660 572 610 566 C 570 562 548 582 515 580 C 478 578 452 556 410 566 C 372 576 345 602 330 640 Z"
            fill={HAIR} stroke={INK} strokeWidth={SW} strokeLinejoin="round"
          />
        ) : (
          <>
        <path
          id="hair-front"
          d="M 330 640 C 320 520 410 470 515 470 C 625 470 712 520 705 640 C 700 620 690 600 680 580 C 670 610 650 610 640 590 C 625 580 610 595 600 575 C 585 565 570 590 560 565 C 545 555 530 575 520 565 C 505 555 490 580 480 565 C 465 560 455 585 445 570 C 430 590 420 590 405 600 C 395 580 375 570 360 580 C 350 600 340 620 330 640 Z"
          fill={HAIR} stroke={INK} strokeWidth={SW} strokeLinejoin="round"
        />
        {/* прядь на брови */}
        <path d="M 425 575 C 430 590 438 600 452 606 C 442 592 440 584 445 572 Z" fill={HAIR} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          </>
        )}
        {/* блики на волосах */}
        <path d="M 415 445 Q 450 430 490 432" fill="none" stroke="#6E4A36" strokeWidth={8} strokeLinecap="round" />
        <path d="M 550 437 Q 595 445 625 465" fill="none" stroke="#6E4A36" strokeWidth={8} strokeLinecap="round" />
        {/* дуга наушников */}
        <path d="M 312 625 C 300 520 400 470 515 470 C 630 470 730 520 718 625" fill="none" stroke={INK} strokeWidth={44} strokeLinecap="round" />
        <path d="M 312 625 C 300 520 400 470 515 470 C 630 470 730 520 718 625" fill="none" stroke={BLUE} strokeWidth={26} strokeLinecap="round" />
        <rect x={283} y={605} width={67} height={107} rx={22} fill={BLUE} stroke={INK} strokeWidth={SW} />
        <rect x={680} y={605} width={67} height={107} rx={22} fill={BLUE} stroke={INK} strokeWidth={SW} />
        {/* антенна */}
        <g id="antenna" transform={`rotate(${antennaWiggle} 513 410)`}>
          <path d={antennaPath} fill="none" stroke={INK} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
          <path d={antennaPath} fill="none" stroke="#4A3224" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* ========== КРУЖКА «НЕ БУДИТЬ» + правая кисть ========== */}
      {showMug && (
        <g id="mug" transform="rotate(-5 845 1410)">
          <path d="M 905 1370 C 945 1370 945 1450 905 1450" fill="none" stroke={INK} strokeWidth={14} />
          <rect x={780} y={1328} width={128} height={160} rx={14} fill="#F2F2F2" stroke={INK} strokeWidth={SW} />
          <path d="M 845 1385 Q 870 1392 890 1382" fill="none" stroke="#A88A5A" strokeWidth={6} strokeLinecap="round" />
          <text x={858} y={1427} fontFamily="Inter, sans-serif" fontWeight={900} fontSize={24} fill={INK} textAnchor="middle">НЕ</text>
          <text x={845} y={1460} fontFamily="Inter, sans-serif" fontWeight={900} fontSize={24} fill="#C9302C" textAnchor="middle">БУДИТЬ</text>
        </g>
      )}
      <circle cx={800} cy={1395} r={45} fill={SKIN} stroke={INK} strokeWidth={SW} />

      {/* волны запаха */}
      {showStink && (
        <g id="stink" fill="none" stroke="#7FB04E" strokeWidth={9} strokeLinecap="round">
          <path d="M 130 1132 C 150 1160 110 1180 130 1210 C 150 1240 110 1260 130 1292" />
          <path d="M 925 1042 C 945 1070 905 1090 925 1120 C 945 1150 905 1170 925 1205" />
          <path d="M 897 1522 C 912 1545 885 1560 895 1588" />
        </g>
      )}
    </svg>
  );
};

/** Муха */
export const Fly: React.FC<{ size?: number; wing?: number; style?: React.CSSProperties }> = ({ size = 70, wing = 0, style }) => (
  <svg viewBox="-40 -30 80 60" width={size} height={size * 0.75} style={{ overflow: 'visible', ...style }}>
    <ellipse cx={-14} cy={-10} rx={16} ry={10} fill="#fff" stroke={INK} strokeWidth={4} transform={`rotate(${-15 - wing} -4 0)`} />
    <ellipse cx={14} cy={-10} rx={16} ry={10} fill="#fff" stroke={INK} strokeWidth={4} transform={`rotate(${15 + wing} 4 0)`} />
    <circle cx={0} cy={4} r={13} fill={INK} />
  </svg>
);
