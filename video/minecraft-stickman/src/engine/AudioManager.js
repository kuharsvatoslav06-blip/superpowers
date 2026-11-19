// AudioManager (browser side): plays the pre-mixed soundtrack in sync with the preview player.
// The soundtrack itself is synthesized offline by tools/audio.js from the same story data and cue list.
export class AudioManager {
  constructor(src = '/build/soundtrack.wav') {
    this.el = new Audio(); this.el.preload = 'auto'; this.el.src = src; this.ok = false;
    this.el.addEventListener('canplay', () => { this.ok = true; });
    this.el.addEventListener('error', () => { this.ok = false; });
  }
  get time() { return this.el.currentTime; }
  play(t) { if (!this.ok) return false; this.el.currentTime = t; this.el.play().catch(() => {}); return true; }
  pause() { this.el.pause(); }
  seek(t) { if (this.ok) this.el.currentTime = t; }
  set muted(m) { this.el.muted = m; }
}
