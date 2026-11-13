import React from 'react';
import {Character} from '../characters/Character';
import {track, step} from '../animations/ease';
import type {Actor, Expr, Pose, Speaker} from '../types';
import {speakerOf} from '../episodes/timing';
import {GROUND_Y} from '../config';
import {Layer} from '../locations/shared';
import type {LightDef} from '../locations';

export const ActorView: React.FC<{
  actor: Actor;
  t: number;
  f: number;
  speaking: Speaker | null;
  light: LightDef;
  index: number;
}> = ({actor, t, f, speaking, light, index}) => {
  const k = actor.keys;
  const x = track(k, t, 'x', 540);
  const y = track(k, t, 'y', GROUND_Y);
  const scale = track(k, t, 'scale', 1.25);
  const rot = track(k, t, 'rot', 0);
  const look = track(k, t, 'look', 0.6);
  const tilt = track(k, t, 'tilt', 0);
  const opacity = track(k, t, 'opacity', 1);
  const pose = step<(typeof k)[number], Pose>(k, t, 'pose', 'idle');
  const expr = step<(typeof k)[number], Expr>(k, t, 'expr', 'neutral');
  const flip = step<(typeof k)[number], boolean>(k, t, 'flip', false);
  const backpack = step<(typeof k)[number], boolean | undefined>(k, t, 'backpack', undefined);
  const talking = speaking !== null && speaking === speakerOf(actor.char);
  const sy = Math.max(0.3, (y - GROUND_Y) / 400);
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={opacity}>
      <ellipse cx={0} cy={6} rx={92 * scale * (1 - sy * 0.1)} ry={13 * scale} fill="#000" opacity={0.32} />
      <g transform={`scale(${flip ? -scale : scale},${scale})`} style={{filter: light.filter}}>
        <Character
          char={actor.char}
          pose={pose}
          expr={expr}
          look={look}
          tilt={tilt}
          talking={talking}
          backpack={backpack}
          frame={f}
          seed={index + 1}
          rim={light.rim}
          rimAmount={light.rimAmount}
        />
      </g>
    </g>
  );
};

export const ActorsLayer: React.FC<{
  actors: Actor[];
  front: boolean;
  t: number;
  f: number;
  speaking: Speaker | null;
  light: LightDef;
}> = ({actors, front, t, f, speaking, light}) => (
  <Layer depth={1}>
    {actors.map((a, i) =>
      !!a.front === front ? <ActorView key={a.id} actor={a} t={t} f={f} speaking={speaking} light={light} index={i} /> : null,
    )}
  </Layer>
);
