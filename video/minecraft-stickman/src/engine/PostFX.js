// PostFX: renders the 3D scene into an MSAA render target, then a single full-screen shader pass applies
// grading, vignette, grain, glitch, flash, fades, block-wipe transitions, portal warp and letterbox.
import * as THREE from 'three';

const FS = `
uniform sampler2D tDiffuse; uniform vec2 res; uniform float time;
uniform float vignette, grain, glitch, rgb, flash, fade, wipe, warp, letterbox, saturation, contrast, brightness, tintAmt, zoomBlur, scan, invert;
uniform vec3 tint, wipeColor, flashColor;
varying vec2 vUv;
float h1(float n){ return fract(sin(n*127.1)*43758.5453); }
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
void main(){
  vec2 uv = vUv; float tt = floor(time*24.0);
  // portal warp: swirl toward the center
  if (warp > 0.001) { vec2 c = uv - 0.5; c.x *= res.x/res.y; float r = length(c); float a = atan(c.y, c.x) + warp * 7.0 * (1.0 - smoothstep(0.0, 0.9, r)) + warp*time*2.0;
    r *= 1.0 - warp*0.35*sin(r*20.0 - time*8.0)*0.1; c = vec2(cos(a), sin(a)) * r; c.x /= res.x/res.y; uv = c + 0.5; }
  // glitch: horizontal slice displacement and blocky offsets
  if (glitch > 0.001) {
    float band = floor(uv.y * (12.0 + h1(tt)*30.0)); float j = h2(vec2(band, tt));
    if (j < glitch * 0.6) uv.x += (h2(vec2(band*3.1, tt)) - 0.5) * 0.18 * glitch;
    vec2 blk = floor(uv * vec2(16.0, 9.0)); if (h2(blk + tt) < glitch * 0.12) uv += (vec2(h2(blk*1.7+tt), h2(blk*2.3+tt)) - 0.5) * 0.06;
  }
  vec3 col;
  float split = rgb * 0.012 + glitch * 0.01;
  if (zoomBlur > 0.001) { vec3 acc = vec3(0.0); for (int i=0;i<8;i++){ float s = 1.0 - float(i)*zoomBlur*0.02; acc += texture2D(tDiffuse, (uv-0.5)*s+0.5).rgb; } col = acc/8.0; }
  else if (split > 0.0001) { col.r = texture2D(tDiffuse, uv + vec2(split, 0.0)).r; col.g = texture2D(tDiffuse, uv).g; col.b = texture2D(tDiffuse, uv - vec2(split, 0.0)).b; }
  else col = texture2D(tDiffuse, uv).rgb;
  if (glitch > 0.5 && h2(vec2(floor(uv.y*40.0), tt)) < (glitch-0.5)*0.15) col = vec3(col.r*0.2, col.g, 1.0-col.b);
  // grading
  col = (col - 0.5) * contrast + 0.5 + brightness;
  float l = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(vec3(l), col, saturation);
  col = mix(col, col * tint * 1.6, tintAmt);
  if (invert > 0.0) col = mix(col, 1.0 - col, invert);
  // scanlines (screen / glitch moments)
  col *= 1.0 - scan * 0.25 * (0.5 + 0.5*sin(gl_FragCoord.y * 3.14159));
  // vignette
  vec2 q = vUv - 0.5; float v = 1.0 - dot(q, q) * 1.6 * vignette; col *= clamp(v, 0.0, 1.0);
  // grain
  col += (h2(vUv * res + tt) - 0.5) * grain;
  // flash and fade
  col = mix(col, flashColor, clamp(flash, 0.0, 1.0));
  col *= 1.0 - clamp(fade, 0.0, 1.0);
  // blocky wipe transition (Minecraft-style pixel blocks)
  if (wipe > 0.0) { vec2 cell = floor(gl_FragCoord.xy / 72.0); vec2 cells = res / 72.0; float diag = (cell.x / cells.x * 0.6 + (1.0 - cell.y / cells.y) * 0.4);
    float th = diag * 0.7 + h2(cell) * 0.3; if (wipe * 1.02 > th) col = wipeColor; }
  // letterbox bars
  if (letterbox > 0.0) { float b = letterbox * 0.12; if (vUv.y < b || vUv.y > 1.0 - b) col = vec3(0.0); }
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  #include <colorspace_fragment>
}`;
const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export const POST_DEFAULTS = { vignette: 0.55, grain: 0.035, glitch: 0, rgb: 0, flash: 0, fade: 0, wipe: 0, warp: 0, letterbox: 0, saturation: 1.08, contrast: 1.06,
  brightness: 0, tintAmt: 0, zoomBlur: 0, scan: 0, invert: 0, tint: [1, 1, 1], wipeColor: [0, 0, 0], flashColor: [1, 1, 1] };

export class PostFX {
  constructor(renderer, w, h) {
    this.renderer = renderer;
    this.rt = new THREE.WebGLRenderTarget(w, h, { samples: 4, type: THREE.UnsignedByteType, colorSpace: THREE.SRGBColorSpace });
    const u = { tDiffuse: { value: this.rt.texture }, res: { value: new THREE.Vector2(w, h) }, time: { value: 0 } };
    for (const [k, v] of Object.entries(POST_DEFAULTS)) u[k] = { value: Array.isArray(v) ? new THREE.Vector3(...v) : v };
    this.uniforms = u;
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS, fragmentShader: FS, depthTest: false, depthWrite: false }));
    this.scene = new THREE.Scene(); this.scene.add(this.quad); this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  render(scene, camera, params, time) {
    const u = this.uniforms; u.time.value = time;
    for (const [k, d] of Object.entries(POST_DEFAULTS)) { const v = params[k] ?? d; if (Array.isArray(d)) u[k].value.set(...v); else u[k].value = v; }
    this.renderer.setRenderTarget(this.rt); this.renderer.clear(); if (scene) this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null); this.renderer.render(this.scene, this.cam);
  }
}
