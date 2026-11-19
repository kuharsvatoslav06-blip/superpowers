// SceneManager: owns the renderer, builds stages and scenes, and renders any global time t to the output canvas.
import * as THREE from 'three';
import { CameraController } from './CameraController.js';
import { PostFX } from './PostFX.js';
import { SubtitleSystem, speaking } from './SubtitleSystem.js';
import { StoryTimeline } from './StoryTimeline.js';
import { WIDTH, HEIGHT } from '../story/script.js';

export class SceneManager {
  constructor({ canvas, output, stages, sceneFactories }) {
    this.W = WIDTH; this.H = HEIGHT;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1); this.renderer.setSize(this.W, this.H, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.post = new PostFX(this.renderer, this.W, this.H);
    this.cam = new CameraController(this.W / this.H);
    this.subs = new SubtitleSystem();
    this.output = output; this.ctx = output.getContext('2d');
    this.stages = stages; for (const s of Object.values(stages)) s.cam = this.cam.camera;
    const W = { stages, cam: this.cam, talk: (who) => (t) => speaking(t, who) };
    this.scenes = {}; for (const [id, f] of Object.entries(sceneFactories)) this.scenes[id] = f(W);
    W.scenes = this.scenes;
    this.timeline = new StoryTimeline(this.scenes);
    this.showSubtitles = true;
  }
  /** Render one frame at global time t (seconds). */
  frame(t) {
    const { s, lt } = this.timeline.locate(t);
    const res = s.impl.update(lt, { t, cam: this.cam }) || {};
    const stage = res.stage; const post = { ...(res.post || {}) };
    const tr = this.timeline.transition(t);
    for (const [k, v] of Object.entries(tr)) post[k] = Array.isArray(v) ? v : Math.max(post[k] ?? 0, v);
    if (stage) { stage.particles.update(lt, this.H); stage.glowParticles.update(lt, this.H); }
    this.post.render(stage ? stage.scene : null, this.cam.camera, post, t);
    const ctx = this.ctx; ctx.clearRect(0, 0, this.W, this.H); ctx.drawImage(this.renderer.domElement, 0, 0, this.W, this.H);
    this.subs.draw(ctx, t, { subtitles: this.showSubtitles && !res.noSubs });
    return { scene: s.id, lt };
  }
  cues() { return this.timeline.cues(this.subs.cues()); }
}
