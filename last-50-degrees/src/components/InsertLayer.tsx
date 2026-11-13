import React from 'react';
import {H, W} from '../config';
import type {Insert} from '../types';
import {TerminalInsert, ThermoInsert, BigTextInsert, CountdownInsert, ChoiceInsert, ItemsInsert, RadioInsert} from './inserts/Interface';
import {GlobeInsert, PhotoInsert, CalendarInsert, DossierInsert, VersionsInsert, VideoInsert, TerraInsert} from './inserts/Documents';
import {easeOut, easeOutBack, clamp, progress} from '../animations/ease';
import {noise1} from '../animations/noise';

const DEFAULT_Y: Partial<Record<Insert['type'], number>> = {
  thermo: 340,
  terminal: 640,
  globe: 640,
  photo: 700,
  calendar: 660,
  dossier: 640,
  versions: 640,
  countdown: 560,
  choice: 700,
  video: 700,
  bigtext: 640,
  terra: 620,
  items: 560,
  radio: 520,
};

const Body: React.FC<{ins: Insert; t: number; f: number}> = ({ins, t, f}) => {
  switch (ins.type) {
    case 'terminal':
      return <TerminalInsert ins={ins} t={t} />;
    case 'thermo':
      return <ThermoInsert ins={ins} t={t} />;
    case 'globe':
      return <GlobeInsert ins={ins} t={t} />;
    case 'photo':
      return <PhotoInsert ins={ins} t={t} />;
    case 'calendar':
      return <CalendarInsert ins={ins} t={t} />;
    case 'dossier':
      return <DossierInsert ins={ins} t={t} />;
    case 'versions':
      return <VersionsInsert ins={ins} t={t} />;
    case 'countdown':
      return <CountdownInsert ins={ins} t={t} />;
    case 'choice':
      return <ChoiceInsert ins={ins} t={t} />;
    case 'video':
      return <VideoInsert ins={ins} t={t} f={f} />;
    case 'bigtext':
      return <BigTextInsert ins={ins} t={t} />;
    case 'terra':
      return <TerraInsert ins={ins} t={t} f={f} />;
    case 'items':
      return <ItemsInsert ins={ins} t={t} />;
    case 'radio':
      return <RadioInsert ins={ins} t={t} />;
  }
};

export const InsertLayer: React.FC<{inserts: Insert[]; t: number; f: number}> = ({inserts, t, f}) => (
  <>
    {inserts.map((ins, i) => {
      const lt = t - ins.at;
      if (lt < -0.001 || lt > ins.dur + 0.001) return null;
      const inP = progress(lt, 0, 0.28);
      const outP = progress(lt, ins.dur - 0.22, ins.dur);
      const enter = ins.enter ?? 'pop';
      const op = clamp(inP) * (1 - outP);
      let tf = '';
      if (enter === 'pop') tf = `scale(${0.82 + 0.18 * easeOutBack(inP)})`;
      else if (enter === 'slide') tf = `translateY(${(1 - easeOut(inP)) * 120}px)`;
      else if (enter === 'glitch') tf = `translateX(${noise1(lt * 60, 3) > 0.5 && lt < 0.4 ? (noise1(lt * 90, 1) - 0.5) * 60 : 0}px)`;
      const y = ins.y ?? DEFAULT_Y[ins.type] ?? 640;
      return (
        <React.Fragment key={i}>
          {ins.dim ? <div style={{position: 'absolute', inset: 0, background: '#000', opacity: ins.dim * op}} /> : null}
          <div
            style={{
              position: 'absolute',
              left: (ins.x ?? W / 2) - W / 2,
              top: y - H / 2,
              width: W,
              height: H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: op,
              transform: `${tf} scale(${ins.scale ?? 1})`,
              pointerEvents: 'none',
            }}
          >
            <Body ins={ins} t={lt} f={f} />
          </div>
        </React.Fragment>
      );
    })}
  </>
);
