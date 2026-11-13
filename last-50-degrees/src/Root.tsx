import React from 'react';
import {Composition, Folder} from 'remotion';
import {FPS, H, W} from './config';
import {Episode} from './Episode';
import {EPISODES} from './episodes';
import {episodeTiming} from './episodes/timing';
import {CastSheet} from './CastSheet';

export const Root: React.FC = () => (
  <>
  <Folder name="Design">
    <Composition id="cast-sheet" component={CastSheet} durationInFrames={90} fps={FPS} width={W} height={H} />
  </Folder>
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
  </>
);
