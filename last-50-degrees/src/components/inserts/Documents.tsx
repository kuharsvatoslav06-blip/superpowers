import React from 'react';
import {MONO, SANS} from '../../styles/fonts';
import type {CharId, Insert} from '../../types';
import {Character} from '../../characters/Character';
import {TerraCore} from '../../characters/Terra';
import {Panel, THEME, typed} from './common';
import {clamp, easeOut, easeOutBack, progress} from '../../animations/ease';
import {noise1, rng} from '../../animations/noise';

type Of<T extends Insert['type']> = Extract<Insert, {type: T}>;

/** Крупный план «бюста»: голова и плечи персонажа в рамке. */
export const Bust: React.FC<{char: CharId; w: number; h: number; f: number; talking?: boolean; bg: string; expr?: 'neutral' | 'worried' | 'shocked' | 'sad' | 'tired'; id: string}> = ({
  char,
  w,
  h,
  f,
  talking,
  bg,
  expr = 'neutral',
  id,
}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
    <defs>
      <clipPath id={id}>
        <rect width={w} height={h} />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id})`}>
      <rect width={w} height={h} fill={bg} />
      <g transform={`translate(${w * 0.5},${h * 1.5}) scale(${h / 330})`}>
        <Character char={char} pose="idle" expr={expr} look={0.5} talking={talking} frame={f} seed={2} />
      </g>
    </g>
  </svg>
);

/* ───────────── Глобус ───────────── */

export const GlobeInsert: React.FC<{ins: Of<'globe'>; t: number}> = ({ins, t}) => {
  const R = 330;
  const schema = ins.mode === 'schema';
  const rot = t * 8;
  const spotP = ins.spotAt === undefined ? 1 : easeOut(progress(t, ins.spotAt, ins.spotAt + 0.5));
  const r = rng(12);
  const nodes = Array.from({length: 9}).map(() => ({a: r() * Math.PI * 2, d: 0.35 + r() * 0.5}));
  const spotA = ((ins.spot?.angle ?? 40) * Math.PI) / 180;
  const sx = Math.cos(spotA) * R * 0.5;
  const sy = Math.sin(spotA) * R * 0.5;
  return (
    <svg width={900} height={780} viewBox="-450 -390 900 780" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id="gl-body" cx="38%" cy="34%" r="80%">
          <stop offset="0" stopColor="#ff8a3c" />
          <stop offset="0.5" stopColor="#c8321c" />
          <stop offset="1" stopColor="#4a0f0a" />
        </radialGradient>
        <clipPath id="gl-clip">
          <circle r={R} />
        </clipPath>
        <radialGradient id="gl-halo">
          <stop offset="0.8" stopColor="#ff5a2a" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ff5a2a" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="gl-spot">
          <stop offset="0" stopColor="#46d4ff" stopOpacity={0.95} />
          <stop offset="1" stopColor="#46d4ff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={R * 1.25} fill="url(#gl-halo)" />
      <circle r={R} fill="url(#gl-body)" />
      <g clipPath="url(#gl-clip)">
        {/* «облака жары» — бегущие волны */}
        {Array.from({length: 9}).map((_, i) => (
          <path
            key={i}
            d={`M ${-R * 1.4} ${-R + i * 80} q 220 ${(i % 2 ? -1 : 1) * 40} 440 0 t 440 0 t 440 0`}
            transform={`translate(${((rot * (1 + (i % 3) * 0.4)) % 440) - 440},0)`}
            stroke={i % 2 ? '#ffb24a' : '#6b130c'}
            strokeWidth={14}
            fill="none"
            opacity={0.35}
          />
        ))}
        {/* широты/меридианы */}
        {[-0.66, -0.33, 0, 0.33, 0.66].map((k) => (
          <ellipse key={k} cx={0} cy={k * R} rx={R * Math.sqrt(1 - k * k)} ry={14} fill="none" stroke="#fff" strokeWidth={1.5} opacity={0.14} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} rx={R * Math.abs(Math.cos(((rot * 0.5 + i * 45) * Math.PI) / 180))} ry={R} fill="none" stroke="#fff" strokeWidth={1.5} opacity={0.14} />
        ))}
        {schema &&
          nodes.map((n, i) => {
            const x = Math.cos(n.a + t * 0.2) * R * n.d;
            const y = Math.sin(n.a + t * 0.2) * R * n.d;
            const pu = 0.5 + 0.5 * Math.sin(t * 4 + i * 1.7);
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <circle r={34 + pu * 10} fill="#ffe27a" opacity={0.12 + pu * 0.18} />
                <rect x={-14} y={-14} width={28} height={28} rx={4} fill="#1a0a06" stroke="#ffe27a" strokeWidth={3} />
                <rect x={-6} y={-6} width={12} height={12} fill="#ffe27a" opacity={0.6 + pu * 0.4} />
              </g>
            );
          })}
        {!schema && ins.spot && (
          <g transform={`translate(${sx},${sy})`} opacity={spotP}>
            <circle r={90 * (0.6 + 0.4 * spotP)} fill="url(#gl-spot)" />
            {[0, 1].map((i) => {
              const k = ((t * 0.9 + i * 0.5) % 1);
              return <circle key={i} r={20 + k * 70} fill="none" stroke="#46d4ff" strokeWidth={4} opacity={1 - k} />;
            })}
            <circle r={13} fill="#d8f6ff" />
          </g>
        )}
      </g>
      <circle r={R} fill="none" stroke="#ffb070" strokeWidth={3} opacity={0.7} />
      {!schema && ins.spot && (
        <g opacity={spotP} transform={`translate(${sx},${sy})`}>
          <line x1={0} y1={0} x2={Math.cos(spotA) >= 0 ? 190 : -190} y2={-(R * 0.5) + 10 - sy * 0.4} stroke="#d8f6ff" strokeWidth={3} />
          <g transform={`translate(${Math.cos(spotA) >= 0 ? 190 : -190},${-(R * 0.5) + 10 - sy * 0.4})`}>
            <rect x={Math.cos(spotA) >= 0 ? 0 : -250} y={-46} width={250} height={92} rx={14} fill="#06141f" stroke="#46d4ff" strokeWidth={4} />
            <text x={Math.cos(spotA) >= 0 ? 125 : -125} y={20} textAnchor="middle" fill="#46d4ff" fontFamily={SANS} fontWeight={800} fontSize={60}>
              {ins.spot.label}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ───────────── Фото ───────────── */

export const PhotoInsert: React.FC<{ins: Of<'photo'>; t: number}> = ({ins, t}) => {
  const flipP = ins.flipAt === undefined ? 0 : easeOut(progress(t, ins.flipAt, ins.flipAt + 0.6));
  const ang = flipP * 180;
  const n = ins.who.length;
  const card = (back: boolean) => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#ece6d8',
        borderRadius: 10,
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        backfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : undefined,
        padding: 34,
        boxSizing: 'border-box',
      }}
    >
      {!back ? (
        <>
          <svg width={572} height={560} viewBox="0 0 572 560">
            <rect width={572} height={560} fill="#7f93ad" />
            <rect y={400} width={572} height={160} fill="#5d6f48" />
            <circle cx={470} cy={90} r={46} fill="#ffe9a8" />
            {ins.who.map((c, i) => (
              <g key={i} transform={`translate(${(572 / (n + 1)) * (i + 1) + (i - (n - 1) / 2) * 10},520) scale(0.8)`}>
                <Character char={c} pose="idle" expr="smile" look={0.2} frame={10 + i * 30} seed={i + 4} />
              </g>
            ))}
          </svg>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: '#4a4338', textAlign: 'center', marginTop: 14}}>{ins.caption}</div>
        </>
      ) : (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: SANS,
            fontWeight: 800,
            fontStyle: 'italic',
            fontSize: 54,
            lineHeight: 1.25,
            textAlign: 'center',
            color: '#2a2d6a',
            transform: 'rotate(-3deg)',
          }}
        >
          {ins.back ? typed(ins.back, (ins.flipAt ?? 0) + 0.5, t, 22) : ''}
        </div>
      )}
    </div>
  );
  return (
    <div style={{width: 640, height: 700, position: 'relative', perspective: 1600}}>
      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${ang}deg) rotateZ(${-3 + flipP * 3}deg)`}}>
        {card(false)}
        {card(true)}
      </div>
    </div>
  );
};

/* ───────────── Календарь ───────────── */

export const CalendarInsert: React.FC<{ins: Of<'calendar'>; t: number}> = ({ins, t}) => (
  <div style={{width: 560, background: '#f1ebdd', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', transform: 'rotate(-2deg)'}}>
    <div style={{background: '#b9362a', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 56, padding: '18px 0', textAlign: 'center', letterSpacing: 6}}>
      {ins.month}
    </div>
    <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 260, lineHeight: 1.05, color: '#2a2420'}}>{ins.day}</div>
    <div style={{textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 70, color: '#7a6a58', paddingBottom: 22}}>{ins.year}</div>
    {ins.note && (
      <div style={{background: '#2a2420', color: '#ffc857', fontFamily: MONO, fontWeight: 700, fontSize: 34, padding: '16px 20px', textAlign: 'center'}}>{ins.note}</div>
    )}
  </div>
);

/* ───────────── Личное дело ───────────── */

export const DossierInsert: React.FC<{ins: Of<'dossier'>; t: number}> = ({ins, t}) => {
  const theme = ins.theme ?? 'blue';
  const th = THEME[theme];
  const stampAt = 0.4 + ins.fields.length * 0.7 + 0.5;
  const sp = easeOutBack(progress(t, stampAt, stampAt + 0.25));
  return (
    <Panel w={900} theme={theme} title={ins.title ?? 'ЛИЧНОЕ ДЕЛО'} t={t}>
      <div style={{padding: 28, display: 'flex', gap: 28, position: 'relative'}}>
        {ins.face && (
          <div style={{border: `3px solid ${th.border}`, borderRadius: 10, overflow: 'hidden', flex: '0 0 230px', height: 290}}>
            <Bust char={ins.face} w={230} h={290} f={t * 30} bg="#0b1a28" id="dos-bust" />
          </div>
        )}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16}}>
          {ins.fields.map(([k, v], i) => {
            const t0 = 0.4 + i * 0.7;
            if (t < t0) return null;
            return (
              <div key={i} style={{fontFamily: MONO, fontWeight: 700}}>
                <div style={{fontSize: 22, color: th.dim, letterSpacing: 2}}>{k}</div>
                <div style={{fontSize: 36, color: th.fg, lineHeight: 1.15}}>{typed(v, t0, t, 40)}</div>
              </div>
            );
          })}
        </div>
        {ins.stamp && t >= stampAt && (
          <div
            style={{
              position: 'absolute',
              right: 24,
              bottom: 26,
              border: '8px solid #ff3b3b',
              color: '#ff3b3b',
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 58,
              padding: '8px 22px',
              borderRadius: 12,
              transform: `rotate(-9deg) scale(${1.9 - 0.9 * sp})`,
              opacity: clamp(sp),
              background: 'rgba(25,8,7,0.7)',
              letterSpacing: 3,
            }}
          >
            {ins.stamp}
          </div>
        )}
      </div>
    </Panel>
  );
};

/* ───────────── Сетка «версий» ───────────── */

export const VersionsInsert: React.FC<{ins: Of<'versions'>; t: number}> = ({ins, t}) => {
  const cols = ins.cols ?? 3;
  const w = (940 - (cols - 1) * 16) / cols;
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, width: 940, justifyContent: 'center'}}>
      {ins.tiles.map((tile, i) => {
        const p = easeOutBack(progress(t, 0.2 + i * 0.16, 0.5 + i * 0.16));
        const last = i === ins.tiles.length - 1;
        const hot = last && ins.pickAt !== undefined && t >= ins.pickAt;
        const col = tile.color ?? '#ff6b3d';
        const glitch = hot && noise1(t * 20, i) > 0.6 ? (noise1(t * 50, 2) - 0.5) * 18 : 0;
        return (
          <div
            key={i}
            style={{
              width: w,
              background: '#0b1220',
              border: `3px solid ${hot ? '#ffffff' : col}`,
              borderRadius: 14,
              overflow: 'hidden',
              transform: `scale(${clamp(p) * (hot ? 1.06 : 1)}) translateX(${glitch}px)`,
              opacity: clamp(p),
              boxShadow: hot ? `0 0 40px ${col}` : 'none',
            }}
          >
            <div style={{height: w * 0.72}}>
              {tile.char ? (
                <Bust char={tile.char} w={w} h={w * 0.72} f={t * 30 + i * 9} bg={i % 2 ? '#1a2540' : '#2a1a1a'} id={`ver-${i}`} expr={tile.status.includes('ПОГИБ') ? 'sad' : 'tired'} />
              ) : (
                <div style={{width: '100%', height: '100%', background: '#10192c'}} />
              )}
            </div>
            <div style={{padding: '10px 12px', fontFamily: MONO, fontWeight: 700}}>
              <div style={{fontSize: 20, color: '#8fa3c4', letterSpacing: 1}}>{tile.label}</div>
              <div style={{fontSize: 24, color: col, lineHeight: 1.15}}>{tile.status}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ───────────── Видеозапись ───────────── */

export const VideoInsert: React.FC<{ins: Of<'video'>; t: number; f: number}> = ({ins, t, f}) => {
  const room = ins.room ?? 'station';
  const bg = room === 'lab' ? '#0b1a2e' : room === 'home' ? '#3a2a20' : '#3a3026';
  const tint = ins.tint ?? '#7fb8a0';
  const jit = noise1(f * 0.7, 2) > 0.9 ? (noise1(f * 3, 1) - 0.5) * 14 : 0;
  return (
    <div style={{width: 860, position: 'relative'}}>
      <div style={{background: '#0a0a0d', borderRadius: 26, padding: 22, border: '4px solid #2a2d38', boxShadow: '0 0 70px rgba(0,0,0,0.7)'}}>
        <div style={{position: 'relative', overflow: 'hidden', borderRadius: 10, transform: `translateX(${jit}px)`}}>
          <Bust char={ins.char} w={816} h={640} f={f} talking bg={bg} id="vid-bust" />
          <div style={{position: 'absolute', inset: 0, background: tint, opacity: 0.2, mixBlendMode: 'multiply'}} />
          <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 5px)'}} />
          <div style={{position: 'absolute', left: 20, top: 16, display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#fff'}}>
            <span style={{width: 18, height: 18, borderRadius: 9, background: '#ff3b3b', opacity: Math.floor(t * 2) % 2 ? 1 : 0.15}} />
            REC
          </div>
          <div style={{position: 'absolute', left: 20, bottom: 14, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: '#fff', textShadow: '0 2px 6px #000'}}>{ins.caption}</div>
        </div>
      </div>
    </div>
  );
};

/* ───────────── ТЕРРА ───────────── */

export const TerraInsert: React.FC<{ins: Of<'terra'>; t: number; f: number}> = ({ins, t, f}) => {
  const hostile = ins.mode === 'hostile';
  return (
    <div style={{textAlign: 'center'}}>
      <TerraCore size={820} f={f} mode={ins.mode ?? 'calm'} id="terra-ins" />
      {!ins.bare && (
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 54, letterSpacing: 14, color: hostile ? '#ff4a3a' : '#46d4ff', marginTop: -30, textShadow: `0 0 30px ${hostile ? '#ff4a3a' : '#46d4ff'}`}}>
          ТЕРРА
        </div>
      )}
    </div>
  );
};
