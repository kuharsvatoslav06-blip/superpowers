import React from 'react';
import {Character} from './characters/Character';
import {ROSTER} from './characters/roster';
import type {CharId, Expr, Pose} from './types';
import {loadFonts, SANS} from './styles/fonts';

const CAST: {c: CharId; pose: Pose; expr: Expr}[] = [
  {c: 'marc', pose: 'idle', expr: 'neutral'},
  {c: 'marc', pose: 'walk', expr: 'worried'},
  {c: 'marc', pose: 'shock', expr: 'shocked'},
  {c: 'marc', pose: 'idle', expr: 'determined'},
  {c: 'lina', pose: 'idle', expr: 'determined'},
  {c: 'jake', pose: 'idle', expr: 'smile'},
  {c: 'mia', pose: 'idle', expr: 'suspicious'},
  {c: 'father', pose: 'idle', expr: 'tired'},
  {c: 'mother', pose: 'idle', expr: 'sad'},
  {c: 'marcOld', pose: 'idle', expr: 'tired'},
  {c: 'marcKid', pose: 'idle', expr: 'smile'},
  {c: 'marc', pose: 'sit', expr: 'sad'},
];

/** Лист персонажей — для сверки с референсами в public/characters/reference. */
export const CastSheet: React.FC = () => {
  loadFonts();
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{background: '#0c0c14'}}>
      {CAST.map(({c, pose, expr}, i) => (
        <g key={i} transform={`translate(${170 + (i % 3) * 370},${520 + Math.floor(i / 3) * 440}) scale(0.78)`}>
          <ellipse cx={0} cy={4} rx={80} ry={12} fill="#000" opacity={0.4} />
          <Character char={c} pose={pose} expr={expr} frame={40 + i * 7} rim="#e8924a" />
          <text y={52} fill="#d8d4cc" fontSize={30} fontFamily={SANS} textAnchor="middle">
            {ROSTER[c].name} · {pose}
          </text>
        </g>
      ))}
    </svg>
  );
};
