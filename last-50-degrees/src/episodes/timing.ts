import {END_CARD_SEC, END_PAUSE_SEC, FPS} from '../config';
import type {EpisodeDef, Line, SceneDef} from '../types';

export interface ResolvedLine extends Line {
  at: number;
  dur: number;
  /** Стабильный id реплики: ep01-s03-l1 — по нему подключаются файлы озвучки. */
  id: string;
}

/** Оценка длительности произнесения: ~14 символов/сек + небольшая пауза. */
export const estimateDur = (text: string) => Math.max(1.1, text.replace(/\*/g, '').length / 14.5 + 0.25);

export function resolveLines(epId: string, scene: SceneDef): ResolvedLine[] {
  let cursor = scene.lead ?? 0.35;
  return (scene.lines ?? []).map((l, i) => {
    const at = l.at ?? cursor + (l.gap ?? 0.12);
    const dur = l.dur ?? estimateDur(l.text);
    cursor = at + dur;
    return {...l, at, dur, id: `${epId}-${scene.id}-l${i + 1}`};
  });
}

export function sceneSeconds(epId: string, scene: SceneDef): number {
  if (scene.dur) return scene.dur;
  const lines = resolveLines(epId, scene);
  const lineEnd = lines.reduce((m, l) => Math.max(m, l.at + l.dur), 0);
  const insEnd = (scene.inserts ?? []).reduce((m, i) => Math.max(m, i.at + i.dur), 0);
  return Math.max(2, lineEnd + 0.7, insEnd + 0.3);
}

export interface EpisodeTiming {
  starts: number[];
  frames: number[];
  scenesEnd: number;
  endCardStart: number;
  total: number;
}

export function episodeTiming(ep: EpisodeDef): EpisodeTiming {
  const starts: number[] = [];
  const frames: number[] = [];
  let cur = 0;
  for (const s of ep.scenes) {
    const n = Math.round(sceneSeconds(ep.id, s) * FPS);
    starts.push(cur);
    frames.push(n);
    cur += n;
  }
  const endCardStart = cur + Math.round(END_PAUSE_SEC * FPS);
  return {starts, frames, scenesEnd: cur, endCardStart, total: endCardStart + Math.round(END_CARD_SEC * FPS)};
}

export const speakerOf = (char: string) => (char.startsWith('marc') ? 'marc' : char);
