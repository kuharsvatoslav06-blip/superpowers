import React from 'react';
import {Audio, Sequence} from 'remotion';
import {FPS} from '../config';
import type {SceneDef} from '../types';
import type {ResolvedLine} from '../episodes/timing';
import {sfxUrl, voiceUrl} from '../audio/resolve';

/** Звуковые эффекты и озвучка сцены. Отсутствующие файлы пропускаются (см. README → «Недостающие ресурсы»). */
export const SceneAudio: React.FC<{scene: SceneDef; lines: ResolvedLine[]}> = ({scene, lines}) => (
  <>
    {(scene.sfx ?? []).map((c, i) => {
      const src = sfxUrl(c.name);
      if (!src) return null;
      return (
        <Sequence key={`s${i}`} from={Math.round(c.t * FPS)} layout="none">
          <Audio src={src} volume={c.vol ?? 0.8} />
        </Sequence>
      );
    })}
    {lines.map((l) => {
      const src = voiceUrl(l.id);
      if (!src) return null;
      return (
        <Sequence key={l.id} from={Math.round(l.at * FPS)} layout="none">
          <Audio src={src} volume={1} />
        </Sequence>
      );
    })}
  </>
);
