import type { Eyes, Mouth, Antenna, ArmPose, GoshaProps } from './characters/Gosha';

export type Accent = 'red' | 'green' | 'blue' | 'pink' | 'yellow';

/** Время во всех полях `t`, `start`, `end` — секунды от начала сцены */
export type Pose = {
  t: number;
  eyes?: Eyes;
  mouth?: Mouth;
  antenna?: Antenna;
  sweat?: boolean;
  leftArm?: ArmPose;
};

type Base = { t?: number; screen?: boolean; until?: number };

export type Layer = Base & (
  | { type: 'gosha'; x: number; y: number; h: number; crop?: 'full' | 'bust' | 'head'; poses?: Pose[]; wave?: boolean; stink?: boolean; mug?: boolean; pop?: boolean; flip?: boolean; beard?: 'full' | 'stubble' | 'none'; hair?: 'long' | 'short'; cape?: boolean }
  | { type: 'fly'; orbit: { cx: number; cy: number; rx: number; ry: number; speed?: number }; land?: { t: number; x: number; y: number }; leave?: { t: number; x: number; y: number }; size?: number }
  | { type: 'sticker'; text: string; x: number; y: number; color?: string; textColor?: string; rot?: number; size?: number; pad?: number; maxWidth?: number }
  | { type: 'arrowLabel'; text: string; x: number; y: number; tx: number; ty: number; color?: string; rot?: number; size?: number }
  | { type: 'bigText'; text: string; x: number; y: number; size?: number; color?: string; rot?: number; shake?: number }
  | { type: 'exclaim'; x: number; y: number; size?: number; rot?: number }
  | { type: 'question'; x: number; y: number; size?: number }
  | { type: 'phone'; contact: string; avatar: string; status: string; messages: { t: number; from: 'her' | 'me'; text: string; time?: string }[]; typing?: number[] }
  | { type: 'beachPhoto'; x: number; y: number; w: number; rot?: number; caption?: string; stamp?: string; stampAt?: number }
  | { type: 'desk'; punchAt: number; fistX: number }
  | { type: 'progressBar'; x: number; y: number; w: number; value: number; from?: number; label?: string }
  | { type: 'icon'; name: 'razor' | 'razorBroken' | 'scissors' | 'comb'; x: number; y: number; size?: number; rot?: number; wiggle?: number }
  | { type: 'particles'; kind: 'hair' | 'sparkle'; x: number; y: number; w: number; h: number; count?: number; dur?: number }
  | { type: 'choice'; x: number; y: number; w: number; text: string; color: string; num: string; rot?: number }
  | { type: 'comment'; x: number; y: number; w: number; name: string; text: string; likes: number; avatarColor?: string }
  | { type: 'impact'; x: number; y: number; size?: number }
);

/** Субтитр: либо одна фраза text/start/end, либо куски parts (каждый со своим таймингом) */
export type Caption = { accent: Accent; text?: string; start?: number; end?: number; parts?: { text: string; start: number; end: number }[] };

export type CameraKey = { t: number; zoom: number; x: number; y: number };

export type Scene = {
  id: string;
  duration: number;
  bg: { type: 'room' } | { type: 'bathroom' } | { type: 'rays'; color: 'blue' | 'pink' | 'purple' | 'green' | 'orange' | 'dark' };
  hud?: boolean | { days?: number; progress?: number };
  camera?: CameraKey[];
  shake?: { t: number; dur: number; amp: number }[];
  caption?: Caption;
  /** отрезок файла озвучки [from, to] (с), звучит с секунды `at` сцены — пишет scripts/sync-voice.mjs */
  voice?: { from: number; to: number; at: number };
  layers: Layer[];
  sfx?: { t: number; name: string; volume?: number }[];
  /** пауза музыки (с, от начала сцены): глушится за 0.08 с, возвращается за 0.6 с */
  musicStop?: { t: number; dur: number }[];
};

export type Episode = {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  voice: { src: string; stub: string; volume?: number };
  music?: { src: string; volume?: number; duck?: number } | null;
  sfxVolume?: number;
  hud: { days: number; progress: number };
  /** тексты обложек TikTok/YouTube (scripts/render-covers.mjs) */
  cover?: {
    badge?: string; title?: string; subtitle?: string; bubble?: string; photoCaption?: string; stamp?: string; color?: string;
    /** облик Гоши на обложке (по умолчанию — шок) */
    gosha?: Partial<Pick<GoshaProps, 'eyes' | 'mouth' | 'antenna' | 'sweat' | 'beard' | 'hair'>>;
    /** вместо фото качка — полароид «ДО» со старым Гошей */
    before?: boolean;
    /** показывать муху и «!!» (по умолчанию да) */
    fly?: boolean;
    exclaim?: boolean;
  };
  scenes: Scene[];
};

export type EpisodeProps = {
  episode: Episode;
  /** заполняется скриптом рендера: реально существующие файлы */
  voiceSrc?: string | null;
  availableSfx?: string[];
  musicSrc?: string | null;
};
