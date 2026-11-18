import React from 'react';
import { ACCENTS, INK, clamp, popScale } from '../anim';
import type { Caption } from '../types';

/* ---------------- HUD ---------------- */
export const Hud: React.FC<{ days: number; progress: number; opacity: number }> = ({ days, progress, opacity }) => {
  const plate: React.CSSProperties = {
    background: 'rgba(18,18,28,0.9)',
    border: `4px solid #000`,
    borderRadius: 18,
    padding: '10px 22px 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 150,
    boxShadow: '0 6px 0 rgba(0,0,0,0.25)',
  };
  const label: React.CSSProperties = { fontFamily: 'Oswald', fontWeight: 700, fontSize: 24, color: '#E8E8F0', letterSpacing: 1 };
  const value: React.CSSProperties = { fontFamily: 'Oswald', fontWeight: 700, fontSize: 64, lineHeight: '72px' };
  return (
    <div style={{ position: 'absolute', left: 44, top: 165, display: 'flex', gap: 14, opacity }}>
      <div style={plate}>
        <div style={label}>ДО ВСТРЕЧИ</div>
        <div style={{ ...value, color: '#FFD23A' }}>{Math.round(days)}</div>
      </div>
      <div style={plate}>
        <div style={label}>ПРОКАЧКА</div>
        <div style={{ ...value, color: '#4BE07F' }}>{Math.round(progress)}%</div>
      </div>
    </div>
  );
};

/* ---------------- Субтитры ---------------- */
type Word = { text: string; key: boolean; t: number };

/** Разбивает фразу на слова, раскладывает по времени пропорционально длине и режет на «чанки» по 1–3 слова */
export const layoutCaption = (text: string, start: number, end: number) => {
  const raw = text.split(/\s+/).filter(Boolean);
  const words = raw.map((w) => ({ text: w.replace(/\*\*/g, ''), key: w.includes('**') }));
  const weights = words.map((w) => w.text.length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  const timed: Word[] = words.map((w, i) => {
    const t = start + ((end - start) * acc) / total;
    acc += weights[i];
    return { ...w, t };
  });
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  for (const w of timed) {
    const len = cur.reduce((a, b) => a + b.text.length + 1, 0) + w.text.length;
    if (cur.length && (len > 14 || cur.length >= 3)) {
      chunks.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.!?…]$/.test(w.text)) {
      chunks.push(cur);
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur);
  return chunks;
};

export const Subtitles: React.FC<{ caption: Caption; time: number; y?: number }> = ({ caption, time, y = 1500 }) => {
  const parts = caption.parts ?? [{ text: caption.text ?? '', start: caption.start ?? 0, end: caption.end ?? 1 }];
  const start = parts[0].start, end = parts[parts.length - 1].end;
  if (time < start - 0.05 || time > end + 0.6) return null;
  const accent = caption.accent;
  const chunks = parts.flatMap((p) => layoutCaption(p.text, p.start, p.end));
  let idx = 0;
  for (let i = 0; i < chunks.length; i++) if (time >= chunks[i][0].t) idx = i;
  const chunk = chunks[idx];
  const color = ACCENTS[accent];
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: y - 80, height: 160, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '0 44px' }}>
      {chunk.map((w, i) => {
        const s = popScale(time, w.t);
        return (
          <span
            key={idx + '-' + i}
            style={{
              fontFamily: 'Inter',
              fontWeight: 900,
              fontSize: 96,
              lineHeight: '110px',
              textTransform: 'uppercase',
              color: w.key ? color : '#fff',
              WebkitTextStroke: `20px ${INK}`,
              paintOrder: 'stroke fill',
              textShadow: '0 8px 0 rgba(0,0,0,0.35)',
              display: 'inline-block',
              transform: `scale(${s})`,
              opacity: s > 0 ? 1 : 0,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

/* ---------------- Наклейка ---------------- */
export const Sticker: React.FC<{ text: string; x: number; y: number; color?: string; textColor?: string; rot?: number; size?: number; pad?: number; time: number; at: number; maxWidth?: number }> = ({
  text, x, y, color = '#2F6FD6', textColor = '#fff', rot = -3, size = 64, pad, time, at, maxWidth = 960,
}) => {
  const s = popScale(time, at);
  if (s <= 0) return null;
  const p = pad ?? size * 0.35;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})` }}>
      <div
        style={{
          background: color,
          border: `7px solid ${INK}`,
          borderRadius: 18,
          padding: `${p * 0.55}px ${p}px ${p * 0.45}px`,
          fontFamily: 'Oswald',
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.1,
          color: textColor,
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
          maxWidth,
          width: 'max-content',
          boxShadow: `0 10px 0 rgba(0,0,0,0.28)`,
          textShadow: '0 3px 0 rgba(0,0,0,0.25)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ---------------- Подпись со стрелкой ---------------- */
export const ArrowLabel: React.FC<{ text: string; x: number; y: number; tx: number; ty: number; color?: string; rot?: number; size?: number; time: number; at: number }> = ({ text, x, y, tx, ty, color = '#FF3B47', rot = -3, size = 52, time, at }) => {
  const d = time - at;
  if (d <= 0) return null;
  const k = clamp(d / 0.3);
  const ex = x + (tx - x) * k, ey = y + (ty - y) * k;
  const ang = Math.atan2(ty - y, tx - x);
  const ah = 34;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <line x1={x} y1={y} x2={ex} y2={ey} stroke={INK} strokeWidth={20} strokeLinecap="round" />
        <line x1={x} y1={y} x2={ex} y2={ey} stroke="#fff" strokeWidth={9} strokeLinecap="round" />
        {k >= 1 && (
          <path
            d={`M ${tx} ${ty} L ${tx - ah * Math.cos(ang - 0.5)} ${ty - ah * Math.sin(ang - 0.5)} L ${tx - ah * Math.cos(ang + 0.5)} ${ty - ah * Math.sin(ang + 0.5)} Z`}
            fill="#fff" stroke={INK} strokeWidth={7} strokeLinejoin="round"
          />
        )}
      </svg>
      <Sticker text={text} x={x} y={y} color={color} rot={rot} size={size} time={time} at={at} />
    </>
  );
};

/* ---------------- Крупный текст ---------------- */
export const BigText: React.FC<{ text: string; x: number; y: number; size?: number; color?: string; rot?: number; shake?: number; time: number; at: number }> = ({ text, x, y, size = 130, color = '#fff', rot = 0, shake = 0, time, at }) => {
  const s = popScale(time, at);
  if (s <= 0) return null;
  const jx = shake ? Math.sin(time * 70) * shake : 0;
  const jy = shake ? Math.cos(time * 53) * shake : 0;
  return (
    <div
      style={{
        position: 'absolute', left: x + jx, top: y + jy, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        fontFamily: 'Inter', fontWeight: 900, fontSize: size, color, whiteSpace: 'pre', textAlign: 'center', lineHeight: 1.05, wordSpacing: '0.15em',
        WebkitTextStroke: `${Math.round(size * 0.2)}px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.3)',
      }}
    >
      {text}
    </div>
  );
};

export const Exclaim: React.FC<{ x: number; y: number; size?: number; rot?: number; time: number; at: number }> = ({ x, y, size = 170, rot = 0, time, at }) => (
  <BigText text="!!" x={x} y={y} size={size} color="#FF3B47" rot={rot + Math.sin(time * 30) * 4} time={time} at={at} />
);

export const Question: React.FC<{ x: number; y: number; size?: number; time: number; at: number }> = ({ x, y, size = 150, time, at }) => (
  <BigText text="?" x={x} y={y + Math.sin(time * 4) * 10} size={size} color="#FFD23A" rot={Math.sin(time * 3) * 8} time={time} at={at} />
);

/* ---------------- Удар: звёздочка ---------------- */
export const Impact: React.FC<{ x: number; y: number; size?: number; time: number; at: number }> = ({ x, y, size = 260, time, at }) => {
  const d = time - at;
  if (d < 0 || d > 0.6) return null;
  const k = clamp(d / 0.12);
  const fade = 1 - clamp((d - 0.3) / 0.3);
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const r = (i % 2 ? 0.45 : 1) * size * 0.5 * (0.5 + 0.5 * k);
    const a = (i / 16) * Math.PI * 2;
    pts.push(`${x + r * Math.cos(a)},${y + r * Math.sin(a)}`);
  }
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: fade }}>
      <polygon points={pts.join(' ')} fill="#FFE14D" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    </svg>
  );
};
