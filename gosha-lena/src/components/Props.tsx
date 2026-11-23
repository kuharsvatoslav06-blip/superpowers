import React from 'react';
import { Img, staticFile } from 'remotion';
import { INK, clamp, popScale } from '../anim';
import { Gosha } from '../characters/Gosha';
import type { IconName } from '../types';

/* ---------------- Телефон с чатом ---------------- */
export const Phone: React.FC<{
  contact: string; avatar: string; status: string;
  messages: { t: number; from: 'her' | 'me'; text: string; time?: string }[];
  typing?: number[];
  time: number; at: number;
}> = ({ contact, avatar, status, messages, typing = [], time, at }) => {
  const s = popScale(time, at);
  if (s <= 0) return null;
  const typingOn = typing.some((t0, i) => i % 2 === 0 && time >= t0 && time < (typing[i + 1] ?? t0 + 1));
  return (
    <div style={{ position: 'absolute', left: 150, top: 330, width: 780, height: 1080, transform: `scale(${s})`, transformOrigin: '50% 60%' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#14141C', borderRadius: 80, border: `8px solid ${INK}`, boxShadow: '0 24px 0 rgba(0,0,0,0.3)' }} />
      <div style={{ position: 'absolute', left: 22, top: 22, right: 22, bottom: 22, borderRadius: 60, overflow: 'hidden', background: '#DDE8CF' }}>
        {/* узор фона чата */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.25 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <circle key={i} cx={(i * 137) % 740} cy={(i * 251) % 1040} r={10 + (i % 3) * 6} fill="none" stroke="#7A9A6A" strokeWidth={4} />
          ))}
        </svg>
        {/* шапка */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 170, background: '#fff', borderBottom: '3px solid #D8D8D8', display: 'flex', alignItems: 'center', padding: '40px 30px 0', gap: 22 }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 56, color: '#2F8BEA' }}>‹</div>
          <Img src={staticFile(avatar)} style={{ width: 96, height: 96, borderRadius: 48, border: `4px solid ${INK}` }} />
          <div>
            <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 42, color: '#111' }}>{contact} <span style={{ color: '#FF4F8B' }}>♥</span></div>
            <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 30, color: typingOn ? '#2F8BEA' : '#2F8BEA' }}>{typingOn ? 'печатает…' : status}</div>
          </div>
        </div>
        {/* время */}
        <div style={{ position: 'absolute', top: 10, left: 50, fontFamily: 'Inter', fontWeight: 800, fontSize: 26, color: '#111' }}>21:47</div>
        {/* сообщения */}
        <div style={{ position: 'absolute', left: 26, right: 26, top: 200, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {messages.map((m, i) => {
            const k = popScale(time, m.t);
            if (k <= 0) return null;
            const her = m.from === 'her';
            return (
              <div key={i} style={{ alignSelf: her ? 'flex-start' : 'flex-end', maxWidth: '82%', transform: `scale(${k})`, transformOrigin: her ? '0% 100%' : '100% 100%' }}>
                <div style={{ background: her ? '#fff' : '#D6F5B8', borderRadius: 34, borderBottomLeftRadius: her ? 8 : 34, borderBottomRightRadius: her ? 34 : 8, padding: '22px 30px 14px', border: `4px solid ${INK}`, boxShadow: '0 6px 0 rgba(0,0,0,0.15)' }}>
                  <div style={{ fontFamily: 'Inter, Noto Color Emoji', fontWeight: 600, fontSize: 42, lineHeight: 1.25, color: '#111' }}>{m.text}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: 22, color: '#8A8A8A', textAlign: 'right', marginTop: 4 }}>{m.time ?? '21:47'}{her ? '' : ' ✓✓'}</div>
                </div>
              </div>
            );
          })}
          {typingOn && (
            <div style={{ alignSelf: 'flex-start', background: '#fff', borderRadius: 34, padding: '24px 30px', border: `4px solid ${INK}`, display: 'flex', gap: 12 }}>
              {[0, 1, 2].map((d) => (
                <div key={d} style={{ width: 18, height: 18, borderRadius: 9, background: '#999', transform: `translateY(${Math.sin(time * 12 - d) * 6}px)` }} />
              ))}
            </div>
          )}
        </div>
        {/* поле ввода */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: '#fff', borderTop: '3px solid #D8D8D8', display: 'flex', alignItems: 'center', padding: '0 26px', gap: 18 }}>
          <div style={{ flex: 1, height: 70, borderRadius: 35, background: '#EFEFF2', fontFamily: 'Inter', fontSize: 30, color: '#9A9AA2', display: 'flex', alignItems: 'center', paddingLeft: 30 }}>Сообщение</div>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: '#2F8BEA', color: '#fff', fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>➤</div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Фото «с моря» (накачанный парень) ---------------- */
export const BeachPhoto: React.FC<{ x: number; y: number; w: number; rot?: number; caption?: string; stamp?: string; stampAt?: number; time: number; at: number }> = ({ x, y, w, rot = -4, caption, stamp, stampAt = 99, time, at }) => {
  const s = popScale(time, at);
  if (s <= 0) return null;
  const st = popScale(time, stampAt);
  const h = w * 1.18;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})` }}>
      <div style={{ position: 'absolute', inset: 0, background: '#FBFBF5', border: `7px solid ${INK}`, borderRadius: 14, boxShadow: '0 16px 0 rgba(0,0,0,0.3)' }} />
      <svg viewBox="0 0 400 400" style={{ position: 'absolute', left: w * 0.06, top: w * 0.06, width: w * 0.88, height: w * 0.88, border: `5px solid ${INK}`, boxSizing: 'border-box' }}>
        <rect width={400} height={400} fill="#7FD3F7" />
        <circle cx={320} cy={80} r={40} fill="#FFE066" />
        <rect y={220} width={400} height={80} fill="#2E9FD8" />
        <path d="M 0 232 Q 50 222 100 232 T 200 232 T 300 232 T 400 232" fill="none" stroke="#fff" strokeWidth={5} />
        <rect y={290} width={400} height={110} fill="#F4D58D" />
        {/* качок */}
        <g transform="translate(200 0)" stroke={INK} strokeWidth={5} strokeLinejoin="round">
          {/* ноги */}
          <rect x={-42} y={300} width={34} height={90} fill="#D9935F" />
          <rect x={8} y={300} width={34} height={90} fill="#D9935F" />
          {/* руки-бицепсы (согнуты) */}
          <path d="M -70 175 C -120 175 -140 150 -130 110 C -125 90 -105 88 -100 105 L -95 140 L -60 150 Z" fill="#E0A06A" />
          <path d="M 70 175 C 120 175 140 150 130 110 C 125 90 105 88 100 105 L 95 140 L 60 150 Z" fill="#E0A06A" />
          <circle cx={-112} cy={98} r={18} fill="#E0A06A" />
          <circle cx={112} cy={98} r={18} fill="#E0A06A" />
          {/* торс V */}
          <path d="M -85 160 C -85 140 -60 132 0 132 C 60 132 85 140 85 160 L 50 290 L -50 290 Z" fill="#E0A06A" />
          <path d="M -30 175 Q 0 190 30 175 M 0 190 L 0 280 M -22 215 L 22 215 M -20 245 L 20 245" fill="none" strokeWidth={4} stroke="#A9683C" />
          {/* шорты */}
          <path d="M -52 285 L 52 285 L 48 330 L 4 330 L 0 310 L -4 330 L -48 330 Z" fill="#E34B4B" />
          {/* голова */}
          <rect x={-14} y={110} width={28} height={28} fill="#E0A06A" />
          <ellipse cx={0} cy={88} rx={34} ry={40} fill="#E0A06A" />
          <path d="M -36 72 C -36 40 36 40 36 72 C 20 60 -20 60 -36 72 Z" fill="#3A2A1E" />
          <rect x={-32} y={80} width={64} height={18} rx={6} fill={INK} />
          <path d="M -12 112 Q 0 120 12 112" fill="none" strokeWidth={4} />
        </g>
      </svg>
      {caption && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: w * 0.03, textAlign: 'center', fontFamily: 'Inter', fontWeight: 800, fontStyle: 'italic', fontSize: w * 0.1, color: '#222' }}>{caption}</div>
      )}
      {stamp && st > 0 && (
        <div style={{ position: 'absolute', right: -w * 0.12, bottom: w * 0.22, transform: `rotate(-14deg) scale(${st})`, fontFamily: 'Oswald', fontWeight: 700, fontSize: w * 0.15, color: '#fff', background: '#FF3B47', border: `7px solid ${INK}`, borderRadius: 16, padding: '0 22px' }}>{stamp}</div>
      )}
    </div>
  );
};

/* ---------------- Стол + кулак + кружка ---------------- */
export const Desk: React.FC<{ punchAt: number; fistX: number; time: number }> = ({ punchAt, fistX, time }) => {
  const d = time - punchAt;
  // кулак: замах вверх, удар, отскок
  const fistY = d < -0.5 ? 900 : d < 0 ? 900 - 220 * Math.sin(((d + 0.5) / 0.5) * Math.PI * 0.5) : d < 0.12 ? 680 + (1060 - 680) * clamp(d / 0.08) : 1060;
  // кружка подпрыгивает
  const mugJump = d > 0 && d < 0.5 ? -Math.sin((d / 0.5) * Math.PI) * 130 : 0;
  const mugRot = d > 0 && d < 0.5 ? Math.sin((d / 0.5) * Math.PI * 2) * 18 : 0;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {/* столешница */}
      <rect x={-20} y={1150} width={1120} height={60} fill="#8A5A3A" stroke={INK} strokeWidth={10} />
      <rect x={-20} y={1210} width={1120} height={420} fill="#6E452B" stroke={INK} strokeWidth={10} />
      <rect x={60} y={1260} width={420} height={140} rx={10} fill="#7C4F33" stroke={INK} strokeWidth={8} />
      <rect x={600} y={1260} width={420} height={140} rx={10} fill="#7C4F33" stroke={INK} strokeWidth={8} />
      <rect x={240} y={1320} width={60} height={14} rx={6} fill={INK} />
      <rect x={780} y={1320} width={60} height={14} rx={6} fill={INK} />
      {/* кружка */}
      <g transform={`translate(0 ${mugJump}) rotate(${mugRot} 800 1080)`}>
        <path d="M 860 1030 C 900 1030 900 1100 860 1100" fill="none" stroke={INK} strokeWidth={14} />
        <rect x={740} y={1000} width={125} height={152} rx={14} fill="#F2F2F2" stroke={INK} strokeWidth={10} />
        <text x={802} y={1068} fontFamily="Inter" fontWeight={900} fontSize={30} fill={INK} textAnchor="middle">НЕ</text>
        <text x={802} y={1106} fontFamily="Inter" fontWeight={900} fontSize={28} fill="#C9302C" textAnchor="middle">БУДИТЬ</text>
      </g>
      {/* предплечье и кулак */}
      <g transform={`translate(${fistX} ${fistY})`}>
        <path d="M -70 40 L 70 40 L 90 700 L -90 700 Z" fill="#F4C6A0" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
        <rect x={-95} y={-90} width={190} height={150} rx={60} fill="#F4C6A0" stroke={INK} strokeWidth={10} />
        {[-45, 0, 45].map((dx) => (
          <path key={dx} d={`M ${dx} -88 L ${dx} -40`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        ))}
        <path d="M -95 -10 C -60 -30 -30 -10 -10 10" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      </g>
    </svg>
  );
};

/* ---------------- Полоска прогресса ---------------- */
export const ProgressBar: React.FC<{ x: number; y: number; w: number; value: number; from?: number; label?: string; time: number; at: number }> = ({ x, y, w, value: target, from, label, time, at }) => {
  const s = popScale(time, at);
  if (s <= 0) return null;
  // рост от from до value за 1.2 с после появления
  const k = clamp((time - at - 0.4) / 1.2);
  const value = Math.round(from === undefined ? target : from + (target - from) * (1 - Math.pow(1 - k, 3)));
  const blink = Math.floor(time * 3) % 2 === 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%,-50%) scale(${s})` }}>
      {label && (
        <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 120, color: '#fff', textAlign: 'center', WebkitTextStroke: `16px ${INK}`, paintOrder: 'stroke fill', lineHeight: 1 }}>{label}</div>
      )}
      <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 260, color: '#B8FFCB', textAlign: 'center', WebkitTextStroke: `22px ${INK}`, paintOrder: 'stroke fill', lineHeight: 1.05 }}>{value}%</div>
      <div style={{ height: 96, borderRadius: 48, background: '#123A22', border: `8px solid ${INK}`, overflow: 'hidden', position: 'relative', boxShadow: '0 10px 0 rgba(0,0,0,0.25)' }}>
        <div style={{ width: `${Math.max(value, 0)}%`, height: '100%', background: '#4BE07F' }} />
        <div style={{ position: 'absolute', left: 24, top: 16, width: 14, height: 48, borderRadius: 7, background: '#4BE07F', opacity: blink ? 1 : 0.2 }} />
      </div>
    </div>
  );
};

/* ---------------- Вариант выбора ---------------- */
export const Choice: React.FC<{ x: number; y: number; w: number; text: string; color: string; num: string; rot?: number; time: number; at: number }> = ({ x, y, w, text, color, num, rot = 0, time, at }) => {
  const s = popScale(time, at);
  if (s <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, border: `8px solid ${INK}`, borderRadius: 30, padding: '26px 30px', display: 'flex', alignItems: 'center', gap: 28, boxShadow: '0 12px 0 rgba(0,0,0,0.3)' }}>
      <div style={{ flex: 'none', width: 110, height: 110, borderRadius: 55, background: '#fff', border: `7px solid ${INK}`, fontFamily: 'Oswald', fontWeight: 700, fontSize: 76, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{num}</div>
      <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 64, lineHeight: 1.08, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.3)' }}>{text}</div>
    </div>
  );
};

/* ---------------- Комментарий ---------------- */
export const Comment: React.FC<{ x: number; y: number; w: number; name: string; text: string; likes: number; avatarColor?: string; time: number; at: number }> = ({ x, y, w, name, text, likes, avatarColor = '#F2994A', time, at }) => {
  const s = popScale(time, at);
  if (s <= 0) return null;
  const likeShown = Math.round(likes * clamp((time - at) / 1.2));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, transform: `scale(${s})`, transformOrigin: '0 50%', background: '#fff', border: `6px solid ${INK}`, borderRadius: 28, padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'center', boxShadow: '0 10px 0 rgba(0,0,0,0.25)' }}>
      <div style={{ flex: 'none', width: 76, height: 76, borderRadius: 38, background: avatarColor, border: `5px solid ${INK}` }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 26, color: '#8A8A95' }}>{name}</div>
        <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 38, color: '#15151F', lineHeight: 1.2 }}>{text}</div>
      </div>
      <div style={{ flex: 'none', textAlign: 'center', fontFamily: 'Inter', fontWeight: 800 }}>
        <div style={{ fontSize: 44, color: '#FF3B5C', lineHeight: 1 }}>♥</div>
        <div style={{ fontSize: 28, color: '#15151F' }}>{likeShown}</div>
      </div>
    </div>
  );
};

/* ---------------- Гоша как слой ---------------- */
export { Gosha };

/* ---------------- Иконки-предметы ---------------- */
export const Icon: React.FC<{ name: IconName; x: number; y: number; size?: number; rot?: number; wiggle?: number; label?: string; time: number; at: number }> = ({ name, x, y, size = 300, rot = 0, wiggle = 0, label, time, at }) => {
  const s = popScale(time, at);
  if (s <= 0) return null;
  const r = rot + (wiggle ? Math.sin(time * 18) * wiggle : 0);
  const body = (() => {
    switch (name) {
      case 'razor':
        return (
          <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
            <rect x={-18} y={-10} width={36} height={170} rx={16} fill="#2F6FD6" />
            <rect x={-80} y={-60} width={160} height={56} rx={14} fill="#E8EDF5" />
            <line x1={-66} y1={-32} x2={66} y2={-32} stroke="#9AA6B8" strokeWidth={6} />
            <rect x={-12} y={40} width={24} height={60} rx={8} fill="#4E8BEA" strokeWidth={0} />
          </g>
        );
      case 'razorBroken':
        return (
          <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
            <rect x={-18} y={20} width={36} height={140} rx={16} fill="#2F6FD6" transform="rotate(14 0 90)" />
            <path d="M -18 0 L -4 14 L 8 -2 L 18 12 L 18 -10 L -18 -10 Z" fill="#2F6FD6" transform="rotate(-8 0 0)" />
            <g transform="translate(-40 -60) rotate(-22)">
              <rect x={-80} y={-30} width={160} height={56} rx={14} fill="#E8EDF5" />
              <path d="M -60 -2 L -20 -2 M 10 -2 L 60 -2" stroke="#9AA6B8" strokeWidth={6} />
            </g>
            <path d="M 70 -40 l 30 -20 M 80 -10 l 36 0 M 60 -70 l 14 -30" stroke="#FFD23A" strokeWidth={10} strokeLinecap="round" />
          </g>
        );
      case 'scissors':
        return (
          <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
            <g transform={`rotate(${Math.sin(time * 22) * 10})`}>
              <path d="M 0 0 L 150 -26 L 150 -6 Z" fill="#DDE3EC" />
              <circle cx={-60} cy={34} r={30} fill="none" stroke="#E3477E" strokeWidth={16} />
              <path d="M 0 0 L -38 22" stroke="#E3477E" strokeWidth={16} strokeLinecap="round" />
            </g>
            <g transform={`rotate(${-Math.sin(time * 22) * 10})`}>
              <path d="M 0 0 L 150 26 L 150 6 Z" fill="#DDE3EC" />
              <circle cx={-60} cy={-34} r={30} fill="none" stroke="#E3477E" strokeWidth={16} />
              <path d="M 0 0 L -38 -22" stroke="#E3477E" strokeWidth={16} strokeLinecap="round" />
            </g>
            <circle cx={0} cy={0} r={9} fill={INK} />
          </g>
        );
      case 'broccoli': {
        const look = Math.sin(time * 1.3) * 6;
        return (
          <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
            <path d="M -34 40 L -44 150 Q 0 165 44 150 L 34 40 Z" fill="#9BD06A" />
            {[[-70, -10, 55], [0, -45, 65], [70, -10, 55], [-35, 30, 50], [35, 30, 50]].map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="#3FA34D" />
            ))}
            <circle cx={-30} cy={10} r={22} fill="#fff" />
            <circle cx={30} cy={10} r={22} fill="#fff" />
            <circle cx={-30 + look} cy={14} r={10} fill={INK} stroke="none" />
            <circle cx={30 + look} cy={14} r={10} fill={INK} stroke="none" />
            <path d="M -50 -22 L -12 -10 M 50 -22 L 12 -10" strokeWidth={9} strokeLinecap="round" />
          </g>
        );
      }
      case 'shawarma':
        return (
          <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
            <path d="M -60 -120 C -10 -150 40 -140 70 -110 L 40 150 L -30 150 Z" fill="#F2D49B" />
            <path d="M -55 -110 C -30 -60 30 -60 65 -105" fill="#7CC36A" />
            <path d="M -50 -95 C -20 -70 20 -75 55 -100" fill="none" stroke="#E35A4C" strokeWidth={12} />
            <path d="M -40 10 L 55 -20 M -35 70 L 48 40" fill="none" stroke="#D9B477" strokeWidth={6} />
            <rect x={-36} y={90} width={80} height={62} fill="#fff" />
          </g>
        );
      case 'scale':
        return (
          <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
            <rect x={-150} y={-60} width={300} height={150} rx={40} fill="#E8EDF5" />
            <rect x={-90} y={-40} width={180} height={60} rx={10} fill="#1E1E2A" />
            <text x={0} y={2} fontFamily="Oswald" fontWeight={700} fontSize={44} fill={Math.floor(time * 4) % 2 ? '#FF3B47' : '#FF8A8F'} textAnchor="middle" stroke="none">{label ?? '---'}</text>
            <rect x={-120} y={40} width={90} height={30} rx={10} fill="#C8D3E6" />
            <rect x={30} y={40} width={90} height={30} rx={10} fill="#C8D3E6" />
          </g>
        );
      default:
        return (
          <g stroke={INK} strokeWidth={8}>
            <rect x={-120} y={-24} width={240} height={40} rx={10} fill="#1E1E2A" />
            {Array.from({ length: 14 }).map((_, i) => <line key={i} x1={-108 + i * 17} y1={16} x2={-108 + i * 17} y2={64} strokeWidth={8} />)}
          </g>
        );
    }
  })();
  return (
    <svg width={size} height={size} viewBox="-170 -170 340 340" style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', transform: `rotate(${r}deg) scale(${s})` }}>
      {body}
    </svg>
  );
};

/* ---------------- Частицы: клочки волос / искры ---------------- */
export const Particles: React.FC<{ kind: 'hair' | 'sparkle'; x: number; y: number; w: number; h: number; count?: number; dur?: number; time: number; at: number }> = ({ kind, x, y, w, h, count = 24, dur = 99, time, at }) => {
  const d = time - at;
  if (d < 0 || d > dur) return null;
  const rnd = (i: number, k: number) => { const v = Math.sin(i * 91.7 + k * 13.3) * 43758.5; return v - Math.floor(v); };
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {Array.from({ length: count }).map((_, i) => {
        const delay = rnd(i, 1) * Math.min(dur, 2.5);
        const life = d - delay;
        if (life < 0) return null;
        if (kind === 'hair') {
          const px = x + rnd(i, 2) * w + Math.sin(life * 3 + i) * 30;
          const py = y + ((life * (180 + rnd(i, 3) * 160)) % h);
          const a = life * 120 * (rnd(i, 4) - 0.5) + rnd(i, 5) * 180;
          return <path key={i} d="M -26 0 C -10 -14 10 14 26 0" transform={`translate(${px} ${py}) rotate(${a})`} fill="none" stroke="#3B281D" strokeWidth={9} strokeLinecap="round" />;
        }
        const ph = (life * 1.4 + rnd(i, 6)) % 1;
        const sc = Math.sin(ph * Math.PI);
        const px = x + rnd(i, 2) * w, py = y + rnd(i, 3) * h;
        return <path key={i} d="M 0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" transform={`translate(${px} ${py}) scale(${sc})`} fill="#FFE14D" stroke={INK} strokeWidth={4} />;
      })}
    </svg>
  );
};
