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

const shocked = { eyes: 'shock', mouth: 'open', antenna: 'up', sweat: true } as const;

/** Обложка 1080×1920 — TikTok / Reels / Shorts. Главное держим в центре 3:4 (y 240–1680): так обложку обрезает сетка профиля TikTok. */
export const CoverVertical: React.FC<EpisodeProps> = ({ episode }) => {
  useFonts();
  const c = { ...defaults, ...(episode.cover ?? {}) };
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <style>{FONT_CSS}</style>
      <Rays color={c.color as 'blue'} time={0} cx={540} cy={1000} />
      <Sticker text={c.badge} x={540} y={300} color="#FFD23A" textColor={INK} size={72} rot={-3} time={T} at={0} />
      <BigText text={c.title} x={540} y={480} size={190} color="#FFD23A" rot={-2} time={T} at={0} />
      <BigText text={c.subtitle} x={540} y={700} size={88} color="#fff" rot={-2} time={T} at={0} />
      {/* Гоша в шоке */}
      <div style={{ position: 'absolute', left: 30, top: 880, width: 760, height: 1000 }}>
        <Gosha crop="bust" {...shocked} showMug={false} antennaWiggle={-6} />
      </div>
      <Fly size={90} wing={20} style={{ position: 'absolute', left: 90, top: 905 }} />
      <Exclaim x={120} y={1080} size={150} rot={-14} time={T} at={0} />
      {/* фото «это я» */}
      <BeachPhoto x={850} y={1060} w={360} rot={9} caption={c.photoCaption} stamp={c.stamp} stampAt={0} time={T} at={0} />
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
        <Gosha crop="bust" {...shocked} showMug={false} antennaWiggle={-6} />
      </div>
      <Fly size={70} wing={20} style={{ position: 'absolute', left: 70, top: 70 }} />
      <Exclaim x={515} y={300} size={110} rot={12} time={T} at={0} />
      {/* текст справа */}
      <Sticker text={c.badge} x={905} y={80} color="#FFD23A" textColor={INK} size={46} rot={-3} time={T} at={0} />
      <BigText text={c.title} x={905} y={210} size={150} color="#FFD23A" rot={-2} time={T} at={0} />
      <BigText text={c.subtitle} x={880} y={378} size={68} color="#fff" rot={-2} time={T} at={0} />
      <BeachPhoto x={1145} y={596} w={200} rot={8} caption={c.photoCaption} stamp={c.stamp} stampAt={0} time={T} at={0} />
      <div style={{ position: 'absolute', left: 560, top: 548, width: 400 }}>
        <Bubble x={0} y={0} w={420} text={c.bubble} avatar={78} font={30} />
      </div>
    </AbsoluteFill>
  );
};
