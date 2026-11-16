import React from 'react';
import { Composition } from 'remotion';
import { EpisodeComp } from './Episode';
import type { Episode, EpisodeProps } from './types';
import day01 from '../episodes/day01.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Episode"
    component={EpisodeComp as unknown as React.FC<Record<string, unknown>>}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={30}
    defaultProps={{ episode: day01 as Episode, voiceSrc: null, availableSfx: [], musicSrc: null } satisfies EpisodeProps}
    calculateMetadata={({ props }) => {
      const ep = (props as unknown as EpisodeProps).episode;
      const total = ep.scenes.reduce((a, s) => a + s.duration, 0);
      return { durationInFrames: Math.round(total * ep.fps), fps: ep.fps, width: ep.width, height: ep.height };
    }}
  />
);
