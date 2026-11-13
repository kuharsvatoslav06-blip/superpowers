import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, H, W} from '../config';
import type {EpisodeDef, SceneDef} from '../types';
import {Camera} from './Camera';
import {ActorsLayer} from './Actors';
import {FxOverlay, GlitchBars, HeatFilter} from './Fx';
import {InsertLayer} from './InsertLayer';
import {Subtitles} from './Subtitles';
import {SceneAudio} from './SceneAudio';
import {LIGHT, LocationView} from '../locations';
import {resolveLines, sceneSeconds, speakerOf} from '../episodes/timing';
import {noise1} from '../animations/noise';
import {easeOut, progress} from '../animations/ease';

const Transition: React.FC<{name: SceneDef['tIn']; t: number}> = ({name, t}) => {
  switch (name) {
    case 'fade':
      return <AbsoluteFill style={{background: '#000', opacity: 1 - progress(t, 0, 0.45)}} />;
    case 'dip':
      return <AbsoluteFill style={{background: '#000', opacity: 1 - progress(t, 0, 0.16)}} />;
    case 'flash':
      return <AbsoluteFill style={{background: '#fff', opacity: Math.exp(-t * 9) * (t < 0.4 ? 1 : 0)}} />;
    case 'glitch':
      return t < 0.34 ? (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <GlitchBars t={t} at={[0]} />
        </svg>
      ) : null;
    default:
      return null;
  }
};

export const SceneRenderer: React.FC<{ep: EpisodeDef; scene: SceneDef; last?: boolean}> = ({ep, scene, last}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const dur = sceneSeconds(ep.id, scene);
  const lines = resolveLines(ep.id, scene);
  const light = LIGHT[scene.loc.id];
  const active = [...lines].reverse().find((l) => !l.noLip && t >= l.at && t <= l.at + l.dur);
  const speaking = active && active.speaker !== 'narrator' ? active.speaker : null;
  const fx = scene.fx ?? {};
  const tIn = scene.tIn ?? 'cut';

  let wrapStyle: React.CSSProperties = {};
  if (tIn === 'whip' && t < 0.3) {
    const k = 1 - easeOut(progress(t, 0, 0.3));
    wrapStyle = {transform: `translateX(${k * 260}px)`, filter: `blur(${k * 26}px)`};
  }
  if (tIn === 'glitch' && t < 0.3) {
    wrapStyle = {transform: `translateX(${(noise1(f * 3, 4) - 0.5) * 50}px)`, filter: `saturate(${1.6})`};
  }
  if (fx.jitter) {
    wrapStyle = {
      ...wrapStyle,
      transform: `${wrapStyle.transform ?? ''} translate(${(noise1(f * 0.9, 1) - 0.5) * fx.jitter}px,${(noise1(f * 0.9, 2) - 0.5) * fx.jitter}px)`,
    };
  }
  const outFade = last ? 1 - progress(t, dur - 0.25, dur) * 1 : 1;

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={wrapStyle}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <defs>{fx.heat ? <HeatFilter id="heatfx" amount={fx.heat} f={f} /> : null}</defs>
          <Camera cam={scene.cam} t={t} dur={dur}>
            <LocationView id={scene.loc.id} variant={scene.loc.variant} heat={scene.loc.heat} f={f} />
            {fx.heat ? (
              <g filter="url(#heatfx)">
                <LocationView id={scene.loc.id} variant={scene.loc.variant} heat={scene.loc.heat} f={f} />
              </g>
            ) : null}
            <ActorsLayer actors={scene.actors ?? []} front={false} t={t} f={f} speaking={speaking} light={light} />
            <ActorsLayer actors={scene.actors ?? []} front={true} t={t} f={f} speaking={speaking} light={light} />
          </Camera>
        </svg>
        <FxOverlay fx={fx} t={t} f={f} />
        <InsertLayer inserts={scene.inserts ?? []} t={t} f={f} />
      </AbsoluteFill>
      <Subtitles lines={lines} t={t} />
      <Transition name={tIn} t={t} />
      {last && <AbsoluteFill style={{background: '#000', opacity: 1 - outFade}} />}
      <SceneAudio scene={scene} lines={lines} />
    </AbsoluteFill>
  );
};

export {speakerOf};
