import React, {useState} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {END_CARD_SEC, FPS, SERIES_TITLE} from './config';
import type {EpisodeDef} from './types';
import {SceneRenderer} from './components/SceneRenderer';
import {episodeTiming} from './episodes/timing';
import {loadFonts, MONO, SANS} from './styles/fonts';
import {musicUrl} from './audio/resolve';
import {easeOut, progress} from './animations/ease';

/** Плашка серии: короткая, в верхней безопасной зоне — не мешает крючку. */
const EpisodeChip: React.FC<{ep: EpisodeDef}> = ({ep}) => {
  const t = useCurrentFrame() / FPS;
  const inP = easeOut(progress(t, 0.15, 0.55));
  const outP = progress(t, 3.0, 3.5);
  if (t > 3.6) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        top: 210,
        opacity: inP * (1 - outP),
        transform: `translateX(${(1 - inP) * -60}px)`,
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
      }}
    >
      <div style={{background: '#ff6b3d', color: '#0a0a0f', fontFamily: SANS, fontWeight: 800, fontSize: 30, padding: '10px 18px', letterSpacing: 2, borderRadius: '10px 0 0 10px'}}>
        СЕРИЯ {ep.n}
      </div>
      <div style={{background: 'rgba(8,8,12,0.82)', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 30, padding: '10px 20px', letterSpacing: 1, borderRadius: '0 10px 10px 0'}}>
        {ep.title}
      </div>
    </div>
  );
};

const EndCard: React.FC<{ep: EpisodeDef}> = ({ep}) => {
  const t = useCurrentFrame() / FPS;
  const inP = easeOut(progress(t, 0.05, 0.5));
  const lineP = easeOut(progress(t, 0.3, 1.1));
  const arrow = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', opacity: 1}}>
      <div style={{textAlign: 'center', opacity: inP, transform: `translateY(${(1 - inP) * 30}px)`}}>
        {ep.finale && (
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, color: '#46d4ff', letterSpacing: 8, marginBottom: 26}}>КОНЕЦ ПЕРВОГО СЕЗОНА</div>
        )}
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 96, color: '#f6f1e7', lineHeight: 1.08, letterSpacing: 2}}>
          ПРОДОЛЖЕНИЕ
          <br />
          СЛЕДУЕТ
        </div>
        <div style={{height: 8, width: 520 * lineP, background: '#ff6b3d', margin: '34px auto 0', borderRadius: 4}} />
        {ep.nextTitle && !ep.finale && (
          <div style={{marginTop: 54, fontFamily: MONO, fontWeight: 700, fontSize: 34, color: '#9aa3b2', letterSpacing: 3}}>
            СЛЕДУЮЩАЯ СЕРИЯ
            <div style={{color: '#ffd447', fontSize: 44, marginTop: 10}}>{ep.nextTitle}</div>
          </div>
        )}
        <div style={{marginTop: 70, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#5c6270', letterSpacing: 6}}>{SERIES_TITLE}</div>
        <div style={{marginTop: 40, fontSize: 56, color: '#ff6b3d', opacity: arrow}}>▼</div>
      </div>
    </AbsoluteFill>
  );
};

export const Episode: React.FC<{ep: EpisodeDef}> = ({ep}) => {
  useState(() => {
    loadFonts();
    return 0;
  });
  const {durationInFrames} = useVideoConfig();
  const timing = episodeTiming(ep);
  const music = musicUrl(ep.music);
  const vol = ep.musicVol ?? 0.38;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {ep.scenes.map((s, i) => (
        <Sequence key={s.id} from={timing.starts[i]} durationInFrames={timing.frames[i]} name={`${s.id}`}>
          <SceneRenderer ep={ep} scene={s} last={i === ep.scenes.length - 1} />
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={timing.frames[0]} name="chip">
        <EpisodeChip ep={ep} />
      </Sequence>
      <Sequence from={timing.endCardStart} durationInFrames={Math.round(END_CARD_SEC * FPS)} name="end-card">
        <EndCard ep={ep} />
      </Sequence>
      {music && (
        <Audio
          src={music}
          loop
          volume={(f) =>
            vol *
            interpolate(f, [0, 20, durationInFrames - 40, durationInFrames], [0, 1, 1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      )}
    </AbsoluteFill>
  );
};
