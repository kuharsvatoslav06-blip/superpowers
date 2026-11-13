import React from 'react';
import {Composition, Folder} from 'remotion';
import {FPS, H, W} from './config';
import {Episode} from './Episode';
import {EPISODES} from './episodes';
import {episodeTiming} from './episodes/timing';

export const Root: React.FC = () => (
  <Folder name="Season-1">
    {EPISODES.map((ep) => (
      <Composition
        key={ep.id}
        id={ep.id}
        component={Episode}
        durationInFrames={episodeTiming(ep).total}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{ep}}
      />
    ))}
  </Folder>
);
