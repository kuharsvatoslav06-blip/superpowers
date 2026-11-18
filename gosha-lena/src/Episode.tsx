import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import type { EpisodeProps, Layer, Scene } from './types';
import { Rays, Room } from './components/Backgrounds';
import { ArrowLabel, BigText, Exclaim, Hud, Impact, Question, Sticker, Subtitles } from './components/Overlay';
import { BeachPhoto, Choice, Comment, Desk, Gosha, Phone, ProgressBar } from './components/Props';
import { Fly, VIEWBOX } from './characters/Gosha';
import { clamp, easeInOut, lerp, noise, popScale } from './anim';

/* ---------- шрифты ---------- */
export const FONT_CSS = `
@font-face { font-family: 'Oswald'; font-weight: 700; src: url('${staticFile('fonts/oswald-cyrillic-700-normal.woff2')}') format('woff2'); unicode-range: U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116; }
@font-face { font-family: 'Oswald'; font-weight: 700; src: url('${staticFile('fonts/oswald-latin-700-normal.woff2')}') format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 900; src: url('${staticFile('fonts/Inter-Black.otf')}') format('opentype'); }
@font-face { font-family: 'Inter'; font-weight: 800; src: url('${staticFile('fonts/Inter-ExtraBold.otf')}') format('opentype'); }
`;

export const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load("700 40px 'Oswald'", 'АБВ abc'),
      document.fonts.load("900 40px 'Inter'", 'АБВ abc'),
      document.fonts.load("800 40px 'Inter'", 'АБВ abc'),
    ]).then(() => continueRender(handle), () => continueRender(handle));
  }, [handle]);
};

/* ---------- утилиты сцены ---------- */
const sceneStarts = (scenes: Scene[]) => {
  const out: number[] = [];
  let acc = 0;
  for (const s of scenes) {
    out.push(acc);
    acc += s.duration;
  }
  return out;
};

const cameraAt = (scene: Scene, t: number) => {
  const keys = scene.camera?.length ? scene.camera : [{ t: 0, zoom: 1, x: 540, y: 960 }];
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b.t) {
      const k = easeInOut(clamp((t - a.t) / (b.t - a.t)));
      return { t, zoom: lerp(a.zoom, b.zoom, k), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
    }
  }
  return keys[keys.length - 1];
};

const shakeAt = (scene: Scene, t: number) => {
  let dx = 0, dy = 0, r = 0;
  for (const s of scene.shake ?? []) {
    const d = t - s.t;
    if (d >= 0 && d <= s.dur) {
      const fall = 1 - d / s.dur;
      dx += noise(t * 30, 1) * s.amp * fall;
      dy += noise(t * 30, 2) * s.amp * fall;
      r += noise(t * 20, 3) * s.amp * 0.08 * fall;
    }
  }
  return { dx, dy, r };
};

/* ---------- слои ---------- */
const GoshaLayer: React.FC<{ l: Extract<Layer, { type: 'gosha' }>; t: number }> = ({ l, t }) => {
  const crop = l.crop ?? 'full';
  const vb = VIEWBOX[crop].split(' ').map(Number);
  const w = (l.h * vb[2]) / vb[3];
  const poses = l.poses ?? [];
  const pose = poses.filter((p) => p.t <= t).reduce((acc, p) => ({ ...acc, ...p }), {} as Partial<typeof poses[number]>);
  const shockAge = (() => {
    const p = [...poses].reverse().find((p) => p.t <= t && p.eyes === 'shock');
    return p ? t - p.t : 99;
  })();
  const s = l.pop ? popScale(t, l.t ?? 0) : 1;
  // моргание раз в ~3 с
  const bt = (t + 0.7) % 3.1;
  const blink = pose.eyes === 'shock' || pose.eyes === 'happy' ? 0 : bt < 0.12 ? 1 : 0;
  const antennaWiggle = pose.antenna === 'up' ? Math.sin(t * 45) * 6 * Math.max(0.3, 1 - shockAge) : Math.sin(t * 2.2) * 5;
  const breathe = 1 + Math.sin(t * 2.4) * 0.008;
  const armSwing = l.wave ? Math.sin(t * 9) * 14 : 0;
  // подпрыгивание при шоке
  const jump = shockAge < 0.35 ? -Math.sin((shockAge / 0.35) * Math.PI) * 40 : 0;
  return (
    <div style={{ position: 'absolute', left: l.x - w / 2, top: l.y + jump, width: w, height: l.h, transform: `scale(${s}) scaleX(${l.flip ? -1 : 1}) scaleY(${breathe})`, transformOrigin: '50% 100%' }}>
      <Gosha
        crop={crop}
        eyes={pose.eyes}
        mouth={pose.mouth}
        antenna={pose.antenna}
        sweat={pose.sweat}
        leftArm={pose.leftArm}
        armSwing={armSwing}
        antennaWiggle={antennaWiggle}
        blink={blink}
        showMug={l.mug ?? true}
        showStink={l.stink}
        style={{ position: 'absolute', inset: 0 }}
      />
      {l.stink && (
        <svg viewBox={VIEWBOX[crop]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {/* дополнительные «пульсирующие» волны запаха */}
          {[0, 1, 2].map((i) => {
            const ph = (t * 0.7 + i / 3) % 1;
            return (
              <path
                key={i}
                d={`M ${i === 1 ? 960 : 100} ${1150 - ph * 260} c 20 25 -20 45 0 70 c 20 25 -20 45 0 70`}
                fill="none" stroke="#7FB04E" strokeWidth={9} strokeLinecap="round" opacity={Math.sin(ph * Math.PI)}
                transform={`translate(${i === 2 ? 820 : 0} ${i === 2 ? -350 : 0})`}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
};

const FlyLayer: React.FC<{ l: Extract<Layer, { type: 'fly' }>; t: number }> = ({ l, t }) => {
  const { cx, cy, rx, ry, speed = 2.2 } = l.orbit;
  const orbitPos = (tt: number) => ({
    x: cx + Math.cos(tt * speed) * rx + noise(tt * 3, 7) * 25,
    y: cy + Math.sin(tt * speed * 1.7) * ry + noise(tt * 3, 9) * 25,
  });
  let p = orbitPos(t);
  let landed = false;
  if (l.land) {
    const t0 = l.land.t - 0.6;
    if (t >= l.land.t) {
      p = { x: l.land.x, y: l.land.y };
      landed = true;
    } else if (t > t0) {
      const k = easeInOut((t - t0) / 0.6);
      const o = orbitPos(t0);
      p = { x: lerp(o.x, l.land.x, k), y: lerp(o.y, l.land.y, k) };
    }
  }
  const wing = landed ? 0 : Math.sin(t * 80) * 25;
  const size = l.size ?? 80;
  return <Fly size={size} wing={wing} style={{ position: 'absolute', left: p.x - size / 2, top: p.y - size * 0.375 }} />;
};

const LayerView: React.FC<{ l: Layer; t: number }> = ({ l, t }) => {
  const at = l.t ?? 0;
  if (t < at && l.type === 'gosha') return null;
  if (l.until !== undefined && t > l.until) return null;
  switch (l.type) {
    case 'gosha': return <GoshaLayer l={l} t={t} />;
    case 'fly': return t >= at ? <FlyLayer l={l} t={t} /> : null;
    case 'sticker': return <Sticker {...l} time={t} at={at} />;
    case 'arrowLabel': return <ArrowLabel {...l} time={t} at={at} />;
    case 'bigText': return <BigText {...l} time={t} at={at} />;
    case 'exclaim': return <Exclaim {...l} time={t} at={at} />;
    case 'question': return <Question {...l} time={t} at={at} />;
    case 'phone': return <Phone {...l} time={t} at={at} />;
    case 'beachPhoto': return <BeachPhoto {...l} time={t} at={at} />;
    case 'desk': return <Desk {...l} time={t} />;
    case 'progressBar': return <ProgressBar {...l} time={t} at={at} />;
    case 'choice': return <Choice {...l} time={t} at={at} />;
    case 'comment': return <Comment {...l} time={t} at={at} />;
    case 'impact': return <Impact {...l} time={t} at={at} />;
  }
};

const SceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = cameraAt(scene, t);
  const sh = shakeAt(scene, t);
  const enter = interpolate(t, [0, 0.25], [1.06, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const world = scene.layers.filter((l) => !l.screen);
  const screen = scene.layers.filter((l) => l.screen);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', transform: `translate(${sh.dx}px, ${sh.dy}px) rotate(${sh.r}deg) scale(${enter})` }}>
      <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${cam.zoom}) translate(${-cam.x}px, ${-cam.y}px)` }}>
        {scene.bg.type === 'room' ? <Room time={t} /> : <Rays color={scene.bg.color} time={t} />}
        {world.map((l, i) => <LayerView key={i} l={l} t={t} />)}
      </AbsoluteFill>
      {screen.map((l, i) => <LayerView key={i} l={l} t={t} />)}
      {scene.caption && <Subtitles caption={scene.caption} time={t} />}
    </AbsoluteFill>
  );
};

/* ---------- HUD поверх сцен ---------- */
const HudTrack: React.FC<{ props: EpisodeProps; starts: number[] }> = ({ props, starts }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { scenes, hud } = props.episode;
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) if (t >= starts[i]) idx = i;
  // значения: от предыдущей сцены к текущей за 0.8 с
  const valueAt = (i: number) => {
    let days = hud.days, progress = hud.progress;
    for (let j = 0; j <= i; j++) {
      const h = scenes[j].hud;
      if (h && typeof h === 'object') {
        if (h.days !== undefined) days = h.days;
        if (h.progress !== undefined) progress = h.progress;
      }
    }
    return { days, progress };
  };
  const cur = valueAt(idx);
  const prev = idx > 0 ? valueAt(idx - 1) : cur;
  const k = easeInOut(clamp((t - starts[idx] - 0.3) / 0.8));
  const visible = scenes[idx].hud !== false;
  return <Hud days={lerp(prev.days, cur.days, k)} progress={lerp(prev.progress, cur.progress, k)} opacity={visible ? 1 : 0} />;
};

/* ---------- звуковые эффекты: из слоёв сцены + явные scene.sfx ---------- */
type Fx = { t: number; name: string; volume?: number };
const autoSfx = (scene: Scene, index: number): Fx[] => {
  const out: Fx[] = [...(scene.sfx ?? [])];
  if (index > 0) out.push({ t: -0.05, name: 'whoosh', volume: 0.3 }); // смена сцены
  // наезд камеры
  const cam = scene.camera ?? [];
  for (let i = 0; i < cam.length - 1; i++) if (cam[i + 1].zoom - cam[i].zoom >= 0.3) out.push({ t: cam[i].t, name: 'whoosh', volume: 0.55 });
  for (const l of scene.layers) {
    const at = l.t ?? 0;
    switch (l.type) {
      case 'sticker': case 'arrowLabel': case 'choice': case 'bigText': case 'comment': case 'progressBar':
        out.push({ t: at, name: 'pop', volume: 0.5 }); break;
      case 'question': out.push({ t: at, name: 'boing', volume: 0.4 }); break;
      case 'phone': l.messages.forEach((m) => m.t >= 0 && out.push({ t: m.t, name: 'message', volume: 0.6 })); break;
      case 'desk': out.push({ t: l.punchAt, name: 'punch', volume: 1 }); break;
      case 'fly': out.push({ t: at, name: 'buzz', volume: 0.3 }); break;
      case 'beachPhoto':
        out.push({ t: at, name: 'whoosh', volume: 0.5 });
        if (l.stamp && l.stampAt !== undefined) out.push({ t: l.stampAt, name: 'stamp', volume: 0.8 });
        break;
      case 'gosha':
        if (l.pop) out.push({ t: at, name: 'boing', volume: 0.45 });
        (l.poses ?? []).forEach((p) => p.eyes === 'shock' && out.push({ t: p.t, name: 'shock', volume: 0.5 }));
        break;
    }
  }
  return out;
};

/* ---------- музыка: приглушение под голосом и паузы ---------- */
const voiceSpans = (scenes: Scene[], starts: number[]) =>
  scenes.flatMap((s, i) => {
    if (!s.voice || !s.caption) return [];
    const parts = s.caption.parts ?? [{ start: s.caption.start ?? 0, end: s.caption.end ?? 0 }];
    return parts.map((p) => [starts[i] + p.start, starts[i] + p.end] as const);
  });

const musicVolume = (t: number, base: number, duck: number, spans: (readonly [number, number])[], stops: { t: number; dur: number }[]) => {
  let near = 0;
  for (const [a, b] of spans) {
    const d = t < a ? a - t : t > b ? t - b : 0;
    near = Math.max(near, 1 - clamp(d / 0.3)); // плавно 0.3 с до/после фразы
  }
  let stop = 1;
  for (const st of stops) {
    if (t >= st.t && t <= st.t + st.dur) {
      const fadeOut = 1 - clamp((t - st.t) / 0.08); // глушим за 0.08 с
      const fadeIn = clamp((t - (st.t + st.dur - 0.6)) / 0.6); // возвращаем за последние 0.6 с
      stop = Math.min(stop, Math.max(fadeOut, fadeIn));
    }
  }
  return base * (1 - duck * near) * stop;
};

export const EpisodeComp: React.FC<EpisodeProps> = (props) => {
  useFonts();
  const { fps } = useVideoConfig();
  const { episode } = props;
  const starts = sceneStarts(episode.scenes);
  const sfxFiles = new Set(props.availableSfx ?? []);
  const spans = voiceSpans(episode.scenes, starts);
  const stops = episode.scenes.flatMap((s, i) => (s.musicStop ?? []).map((m) => ({ t: starts[i] + m.t, dur: m.dur })));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <style>{FONT_CSS}</style>
      {episode.scenes.map((s, i) => (
        <Sequence key={s.id} from={Math.round(starts[i] * fps)} durationInFrames={Math.round(s.duration * fps)} name={s.id}>
          <SceneView scene={s} />
          {props.voiceSrc && s.voice && (
            <Sequence from={Math.round(s.voice.at * fps)} name="voice">
              <Audio src={staticFile(props.voiceSrc)} trimBefore={Math.round(s.voice.from * fps)} trimAfter={Math.round(s.voice.to * fps)} volume={episode.voice.volume ?? 1} />
            </Sequence>
          )}
        </Sequence>
      ))}
      <HudTrack props={props} starts={starts} />
      {/* эффекты в глобальном времени — длинные звуки не обрезаются на смене сцены */}
      {episode.scenes.flatMap((s, i) => autoSfx(s, i).map((fx, j) => {
        const file = [...sfxFiles].find((f) => f.replace(/\.[a-z0-9]+$/, '') === fx.name);
        if (!file) return null;
        return (
          <Sequence key={`${s.id}-${j}`} from={Math.max(0, Math.round((starts[i] + fx.t) * fps))} name={`sfx:${fx.name}`}>
            <Audio src={staticFile(`sfx/${file}`)} volume={(fx.volume ?? 1) * (episode.sfxVolume ?? 0.5)} />
          </Sequence>
        );
      }))}
      {/* без нарезки по сценам — файл озвучки целиком (или тишина-заглушка) */}
      {!(props.voiceSrc && episode.scenes.some((s) => s.voice)) && <Audio src={staticFile(props.voiceSrc ?? episode.voice.stub)} volume={episode.voice.volume ?? 1} />}
      {props.musicSrc && (
        <Audio
          src={staticFile(props.musicSrc)}
          loop
          volume={(f) => musicVolume(f / fps, episode.music?.volume ?? 0.15, episode.music?.duck ?? 0.5, spans, stops)}
        />
      )}
    </AbsoluteFill>
  );
};
