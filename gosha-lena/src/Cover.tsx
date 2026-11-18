import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { FONT_CSS, useFonts } from './Episode';
import { Rays } from './components/Backgrounds';
import { BigText, Exclaim, Sticker } from './components/Overlay';
import { BeachPhoto } from './components/Props';
import { Gosha, Fly } from './characters/Gosha';
import { INK } from './anim';
import type { EpisodeProps } from './types';

const T = 10; // «время» для статичных элементов: все пружинки уже доиграли

const defaults = {
  badge: 'ДЕНЬ 1 / 30',
  title: '30 ДНЕЙ',
  subtitle: 'ЧТОБЫ СТАТЬ\nКАК НА ФОТО',
  bubble: 'Ты же как на фото? 😄',
  photoCaption: 'это я',
  stamp: '(НЕТ)',
  color: 'blue',
};

const Bubble: React.FC<{ x: number; y: number; w: number; text: string; avatar: number; font: number }> = ({ x, y, w, text, avatar, font }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, display: 'flex', alignItems: 'flex-end', gap: avatar * 0.18 }}>
    <Img src={staticFile('characters/lena_avatar.png')} style={{ flex: 'none', width: avatar, height: avatar, borderRadius: avatar / 2, border: `${avatar * 0.06}px solid ${INK}`, background: '#fff' }} />
    <div style={{ background: '#fff', border: `${font * 0.16}px solid ${INK}`, borderRadius: font * 0.9, borderBottomLeftRadius: font * 0.2, padding: `${font * 0.45}px ${font * 0.6}px`, fontFamily: 'Inter, Noto Color Emoji', fontWeight: 800, fontSize: font, lineHeight: 1.15, color: '#111', boxShadow: `0 ${font * 0.18}px 0 rgba(0,0,0,0.3)` }}>{text}</div>
  </div>
);

/** Подбор размера заголовка под ширину: при необходимости делим на 2 строки */
const fitTitle = (text: string, maxW: number, maxSize: number) => {
  const w = (line: string) => line.length * 0.74; // ширина строки в «размерах шрифта» для Inter Black
  const one = Math.min(maxSize, maxW / w(text));
  const sp = text.indexOf(' ');
  if (text.includes('\n') || sp < 0 || one >= maxSize * 0.8) return { text, size: Math.min(maxSize, maxW / Math.max(...text.split('\n').map(w))) };
  // делим по пробелу, ближайшему к середине
  let best = sp;
  for (let i = 0; i < text.length; i++) if (text[i] === ' ' && Math.abs(i - text.length / 2) < Math.abs(best - text.length / 2)) best = i;
  const lines = [text.slice(0, best), text.slice(best + 1)];
  return { text: lines.join('\n'), size: Math.min(maxSize * 0.85, maxW / Math.max(...lines.map(w))) };
};

const shocked = { eyes: 'shock', mouth: 'open', antenna: 'up', sweat: true } as const;

/** Полароид «ДО» со старым Гошей — вместо фото качка, когда cover.before = true */
const BeforePhoto: React.FC<{ x: number; y: number; w: number; rot: number }> = ({ x, y, w, rot }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y - w * 0.6, width: w, height: w * 1.2, transform: `rotate(${rot}deg)` }}>
    <div style={{ position: 'absolute', inset: 0, background: '#FBFBF5', border: `${w * 0.02}px solid ${INK}`, borderRadius: w * 0.04, boxShadow: '0 14px 0 rgba(0,0,0,0.3)' }} />
    <div style={{ position: 'absolute', left: w * 0.06, top: w * 0.06, width: w * 0.88, height: w * 0.88, background: '#5B6BEE', border: `${w * 0.014}px solid ${INK}`, overflow: 'hidden', boxSizing: 'border-box' }}>
      <Gosha crop="head" showMug={false} />
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: w * 0.02, textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, fontSize: w * 0.17, color: '#FF3B47' }}>ДО</div>
  </div>
);

/** Обложка 1080×1920 — TikTok / Reels / Shorts. Главное держим в центре 3:4 (y 240–1680): так обложку обрезает сетка профиля TikTok. */
export const CoverVertical: React.FC<EpisodeProps> = ({ episode }) => {
  useFonts();
  const c = { ...defaults, ...(episode.cover ?? {}) };
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <style>{FONT_CSS}</style>
      <Rays color={c.color as 'blue'} time={0} cx={540} cy={1000} />
      <Sticker text={c.badge} x={540} y={300} color="#FFD23A" textColor={INK} size={72} rot={-3} time={T} at={0} />
      {(() => {
        const f = fitTitle(c.title, 960, 190);
        const two = f.text.includes('\n');
        return (
          <>
            <BigText text={f.text} x={540} y={two ? 505 : 480} size={f.size} color="#FFD23A" rot={-2} time={T} at={0} />
            <BigText text={c.subtitle} x={540} y={two ? 755 : 700} size={two ? 74 : 88} color="#fff" rot={-2} time={T} at={0} />
          </>
        );
      })()}
      {/* Гоша в шоке */}
      <div style={{ position: 'absolute', left: 30, top: 880, width: 760, height: 1000 }}>
        <Gosha crop="bust" {...(c.gosha ?? shocked)} showMug={false} antennaWiggle={-6} />
      </div>
      {c.fly !== false && <Fly size={90} wing={20} style={{ position: 'absolute', left: 90, top: 905 }} />}
      {c.exclaim !== false && <Exclaim x={120} y={1080} size={150} rot={-14} time={T} at={0} />}
      {/* фото «это я» */}
      {c.before ? <BeforePhoto x={850} y={1060} w={340} rot={9} /> : <BeachPhoto x={850} y={1060} w={360} rot={9} caption={c.photoCaption} stamp={c.stamp} stampAt={0} time={T} at={0} />}
      <Bubble x={470} y={1505} w={590} text={c.bubble} avatar={110} font={46} />
    </AbsoluteFill>
  );
};

/** Обложка 1280×720 — YouTube. Правый нижний угол (таймкод) оставляем свободным от главного. */
export const CoverYouTube: React.FC<EpisodeProps> = ({ episode }) => {
  useFonts();
  const c = { ...defaults, ...(episode.cover ?? {}) };
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <style>{FONT_CSS}</style>
      <Rays color={c.color as 'blue'} time={0} w={1280} h={720} cx={360} cy={380} />
      {/* Гоша в шоке слева */}
      <div style={{ position: 'absolute', left: -10, top: 30, width: 600, height: 790 }}>
        <Gosha crop="bust" {...(c.gosha ?? shocked)} showMug={false} antennaWiggle={-6} />
      </div>
      {c.fly !== false && <Fly size={70} wing={20} style={{ position: 'absolute', left: 70, top: 70 }} />}
      {c.exclaim !== false && <Exclaim x={515} y={300} size={110} rot={12} time={T} at={0} />}
      {/* текст справа */}
      <Sticker text={c.badge} x={905} y={80} color="#FFD23A" textColor={INK} size={46} rot={-3} time={T} at={0} />
      {(() => {
        const f = fitTitle(c.title, 640, 150);
        const two = f.text.includes('\n');
        return (
          <>
            <BigText text={f.text} x={905} y={two ? 250 : 210} size={f.size} color="#FFD23A" rot={-2} time={T} at={0} />
            <BigText text={c.subtitle} x={880} y={two ? 430 : 378} size={two ? 54 : 68} color="#fff" rot={-2} time={T} at={0} />
          </>
        );
      })()}
      {c.before ? <BeforePhoto x={1150} y={590} w={190} rot={8} /> : <BeachPhoto x={1145} y={596} w={200} rot={8} caption={c.photoCaption} stamp={c.stamp} stampAt={0} time={T} at={0} />}
      <div style={{ position: 'absolute', left: 560, top: 548, width: 400 }}>
        <Bubble x={0} y={0} w={420} text={c.bubble} avatar={78} font={30} />
      </div>
    </AbsoluteFill>
  );
};
