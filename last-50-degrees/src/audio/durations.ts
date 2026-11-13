import available from './available.json';

/** Реальная длительность озвучки реплики (сек) — из src/audio/available.json (его пишет scripts/check-assets.mjs). */
const D = ((available as {voiceDur?: Record<string, number>}).voiceDur ?? {}) as Record<string, number>;
export const voiceDuration = (lineId: string): number | undefined => D[lineId];
