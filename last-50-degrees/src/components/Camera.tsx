import React from 'react';
import {W, H} from '../config';
import type {CameraDef} from '../types';
import {ease, lerp, progress} from '../animations/ease';
import {noise1} from '../animations/noise';
import {ParallaxContext} from '../locations/shared';

export const DEFAULT_CAM = {x: W / 2, y: H / 2, zoom: 1};

export function cameraAt(cam: CameraDef | undefined, t: number, dur: number) {
  if (!cam) return {x: W / 2, y: H / 2, zoom: 1, sx: 0, sy: 0};
  const to = cam.to ?? cam.from;
  const p = ease(cam.ease ?? 'inOut', progress(t, 0, dur));
  let zoom = lerp(cam.from.zoom, to.zoom, p);
  const x = lerp(cam.from.x, to.x, p);
  const y = lerp(cam.from.y, to.y, p);
  let sx = 0;
  let sy = 0;
  if (cam.shake) {
    const [a, b] = cam.shakeAt ?? [0, dur];
    if (t >= a && t <= b) {
      const k = Math.min(1, (t - a) / 0.12, (b - t) / 0.2 + 0.001);
      sx = (noise1(t * 22, 1) - 0.5) * 2 * cam.shake * k;
      sy = (noise1(t * 24, 2) - 0.5) * 2 * cam.shake * k;
    }
  }
  for (const pt of cam.punch ?? []) {
    if (t >= pt) zoom += 0.07 * Math.exp(-(t - pt) * 7);
  }
  return {x, y, zoom, sx, sy};
}

/** Камера: центрирует точку фокуса, масштабирует, добавляет тряску и параллакс. */
export const Camera: React.FC<{cam?: CameraDef; t: number; dur: number; children: React.ReactNode}> = ({
  cam,
  t,
  dur,
  children,
}) => {
  const c = cameraAt(cam, t, dur);
  return (
    <ParallaxContext.Provider value={{dx: c.x - W / 2, dy: c.y - H / 2}}>
      <g transform={`translate(${W / 2 + c.sx},${H / 2 + c.sy}) scale(${c.zoom}) translate(${-c.x},${-c.y})`}>
        {children}
      </g>
    </ParallaxContext.Provider>
  );
};
