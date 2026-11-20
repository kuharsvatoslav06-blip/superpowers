# I Survived 100 Days in Minecraft, But Something Was Wrong

A complete animated YouTube video (1920×1080, 30 fps, ~6:20) rendered by a real-time 3D engine:
Minecraft-inspired voxel worlds built with **Three.js**, an expressive stickman rig, procedural
sound design and music, offline TTS voice-over, animated subtitles, and an offline frame renderer.

All textures, models, music and sound effects are generated procedurally in code. No game assets are used.

## Quick start

```bash
npm install                  # three.js + fonts
npm run preview              # open http://localhost:8080 (scrub, play, jump to scenes)
```

The preview player renders live in the browser. With a GPU it runs in real time; sound plays once
`build/soundtrack.wav` exists (see below).

## Episodes

| Episode | Title | Preview | Build |
|---------|-------|---------|-------|
| 1 | I Survived 100 Days in Minecraft, But Something Was Wrong | `http://localhost:8080/` | `npm run build` → `build/video.mp4` |
| 2 | I Survived 100 Days in a Minecraft World That Remembered Me | `http://localhost:8080/?ep=2` | `npm run build:ep2` → `build/ep2/video.mp4` |

Every tool takes the episode from the `EP` environment variable (default 1), e.g. `EP=2 node tools/render.js --from 100 --to 160`.
Episode data lives in `src/story/ep<N>/` (script, stages, index) and `src/scenes/ep2/`; voice clips in `voice/` (ep1) and `voice/ep2/`.

## Producing the final video

```bash
# one-time: offline TTS voices (Debian/Ubuntu)
sudo apt-get install festival festvox-us2 festvox-kallpc16k ffmpeg

npm run tts      # voice lines  -> build/voice/*.wav + src/generated/voice.js (durations for subtitles)
npm run audio    # soundtrack   -> build/soundtrack.wav (music, ambience, ~670 synced SFX cues, voice, ducking)
npm run render   # frames + mux -> build/video.mp4 (H.264 CRF 19, AAC 192k, loudness -14 LUFS) + build/subtitles.srt
```

`render` is resumable (finished frames in `build/frames/` are skipped) and accepts options:

```bash
node tools/render.js --from 95 --to 165 --out build/mines.mp4   # render only a time range
node tools/render.js --workers 4                                 # parallel browser workers
node tools/render.js --encode-only                               # re-mux after changing audio
node tools/probe.js build/probe s3:50 s4:37 120.5                # single frames for checking (scene:local or seconds)
```

Rendering uses headless Chromium (Playwright). On a machine without a GPU, Chromium falls back to
software WebGL (SwiftShader): about 0.4 s per frame, ~75 minutes for the whole video.

**Better voice:** the bundled voice is an offline robotic-style TTS. To use a real voice actor, record
each line from `src/story/script.js` and save it as `voice/<line id>.wav` (e.g. `voice/s1a.wav`), then run
`npm run tts && npm run audio && node tools/render.js --encode-only`. Subtitle timing follows the new durations
automatically (re-render frames if a line got much longer).

## Structure

```
src/
  story/script.js          StoryTimeline data: scenes, durations, transitions, voice lines, music moods, ambience, UI overlays
  story/stages.js          the 3D sets: overworld, cave + secret room, the void, the reset world
  story/props.js           torch, sign, chest, door, bed, portal, giant computer, reset button
  scenes/*.js              one file per scene: actors, camera shots, effects, sound cues (cold open + 7 scenes)
  engine/
    AnimationSystem.js     easing, keyframe tracks, deterministic noise, pose library, facial expressions
    CharacterController.js stickman rig (procedural face, limbs, held items) + Actor timeline (paths, actions, footsteps)
    CameraController.js    keyframed shots, follow helpers, shake, handheld drift
    EnvironmentManager.js  procedural pixel textures, voxel mesher with ambient occlusion, terrain, sky, lighting presets
    Mobs.js                zombie, ender-creature, animals, birds
    Particles.js           analytic (stateless) particle effects
    PostFX.js              FXAA, grading, vignette, grain, glitch, flashes, block-wipe / warp transitions, letterbox
    SubtitleSystem.js      word-by-word animated subtitles + all screen overlays (title, crafting, chest, book, map, countdown...)
    SceneManager.js        renders any time t: scene -> camera -> post -> overlays
    StoryTimeline.js       time -> scene lookup, transitions, cue collection for audio
    AudioManager.js        preview playback of the soundtrack
tools/
  server.js  tts.js  audio.js  render.js  probe.js  sheet.sh
```

Every frame is a pure function of time (`window.frame(t)`), so the renderer can draw frames in any
order and in parallel, and the audio tool asks the running animation for its exact cue list
(footsteps come from the walk cycle, punches from the swing phase, UI clicks from the overlays),
which keeps picture and sound in sync.

## Scenes

| Time | Scene |
|------|-------|
| 0:00 | Cold open: flash-forward montage + title slam |
| 0:07 | 1. Spawn — punching trees, crafting, the frozen sun, DAY 1 — 11:59 PM |
| 0:43 | 2. Something Is Watching — speed build, "You may not rest now", three zombies, three knocks, the sign |
| 1:36 | 3. The Mines — iron, torches going out, phantom footsteps, chase, the silhouette, the hidden tunnel |
| 2:46 | 4. The Secret Room — chest, the book, the ender-creature's stare, the red dot |
| 3:46 | 5. World Collapse — vanishing trees, floating water, flying pigs, disappearing ground, sky crack, the other stickman |
| 4:56 | 6. The Void — the giant computer, PLAYER DETECTED, countdown, RESET WORLD |
| 5:35 | 7. The Twist — a normal world... the book is still there. THE END? |

Edit timings in `src/story/script.js` and the per-scene `BEATS` constants at the top of each scene file.
