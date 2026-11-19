# Voice-over script for ElevenLabs

**Voice:** one male narrator, about 20–30 years old, American English, friendly YouTube-gamer tone (the hero narrates his own story).
Narration lines are a bit faster and more confident. Dialogue lines are livelier and more emotional.
The `s7c` line is the "entity": record it slowly, low and calm (the project additionally lowers the pitch and adds echo automatically).

**ElevenLabs settings (starting point):**
- Model: Eleven v3 (supports the tags in [brackets]). On Multilingual v2, delete the [tags] and keep only `<break time="…"/>`.
- Stability ≈ 40% (Creative/Natural on v3), Similarity ≈ 75%, Style ≈ 30–45%, Speaker boost on.
- Generate each line separately and save it as `voice/<ID>.mp3` (for example `voice/s1a.mp3`).

**Max** is the maximum line length in seconds before the next line or scene starts. Lines marked ⚠ are tight; read them briskly.

| ID | Time | Max | Type | Text for ElevenLabs |
|----|------|-----|------|---------------------|
| c1 | 0:00 | 2.5 ⚠ | narration | [mysterious] Everyone says Minecraft is relaxing. |
| c2 | 0:03 | 1.5 ⚠ | narration | [ominous] Nobody warned me about *this*. |
| s1a | 0:08 | 3.0 ⚠ | narration | [upbeat] Day one. A brand-new Minecraft world. |
| s1b | 0:11 | 6.5 | narration | No tools, no shelter, <break time="0.2s"/> and absolutely *no idea* what I'm doing. |
| s1c | 0:18 | 5.0 | dialogue | [in pain] Ow. <break time="0.4s"/> [confused] Also... why is the tree *floating?* |
| s1d | 0:26 | 2.5 | dialogue | [smug] Nailed it. |
| s1e | 0:30 | 3.0 ⚠ | dialogue | [puzzled] Huh. <break time="0.3s"/> The sun's... not moving. |
| s1f | 0:33 | 3.5 | dialogue | [skeptical, flat] That can't be right. |
| s1g | 0:39 | 3.5 | dialogue | [nervous, quick] Okay. Shelter. Shelter would be good. |
| s2a | 0:43 | 5.0 | narration | Rule number one: <break time="0.2s"/> *never* stay outside at night. |
| s2b | 0:53 | 5.0 | dialogue | [tired, content] Okay. Bed. Skip the night. Easy. |
| s2c | 0:59 | 2.0 | dialogue | [annoyed groan] Oh, come *on.* |
| s2d | 1:10 | 1.5 | dialogue | [scared, firm] Nope. |
| s2e | 1:15 | 3.0 | whisper | [whispers, terrified] Who *knocks* in Minecraft? |
| s2f | 1:27 | 4.0 | dialogue | [deadpan, to camera] Well... <break time="0.4s"/> that's *exactly* where I'm going. |
| s2g | 1:32 | 4.0 | narration | [dry, self-ironic] Because apparently, I have *zero* survival instincts. |
| s3a | 1:37 | 3.5 ⚠ | narration | Day two. <break time="0.2s"/> Probably. The sun never came back. |
| s3b | 1:40 | 7.0 | narration | I needed iron. Iron means armor. <break time="0.2s"/> Armor means fewer *embarrassing* deaths. |
| s3c | 1:53 | 2.5 | dialogue | [excited] Iron! Finally! |
| s3d | 2:02 | 4.0 | dialogue | [uneasy, slow] I *definitely* placed those torches. |
| s3e | 2:22 | 2.0 | whisper | [whispers, trembling] Hello? |
| s3f | 2:27 | 4.0 | whisper | [whispers, nervous] Hey... buddy? <break time="0.3s"/> You lost? |
| s3g | 2:42 | 3.5 | dialogue | [sarcastic, nervous] Sure. Secret tunnel. Totally fine. |
| s4a | 2:47 | 6.0 | narration | [low, mysterious] Someone *built* this room. <break time="0.3s"/> Someone who knew I'd come. |
| s4b | 3:02 | 3.4 ⚠ | dialogue | [amazed] A *diamond* pickaxe? On day *two?!* |
| s4c | 3:05 | 5.0 | dialogue | [suspicious] Okay. This is either a gift... <break time="0.4s"/> or a *trap*. |
| s4d | 3:11 | 6.0 | reading | [reading slowly, unsettled] "If you're reading this... <break time="0.5s"/> the world has already noticed you." |
| s4e | 3:32 | 3.0 ⚠ | dialogue | [panicked, fast] Nope. Nope, nope, *nope.* |
| s4f | 3:36 | 5.0 | dialogue | [rising panic] Why is there a red dot... <break time="0.3s"/> and why is it *moving?* |
| s5a | 3:47 | 6.0 | narration | [breathless] I made it out. <break time="0.3s"/> But the world... the world was *breaking*. |
| s5b | 4:02 | 3.0 | dialogue | [deadpan disbelief] Water does *not* do that. |
| s5c | 4:11 | 4.0 | dialogue | [flat, done with it] Nope. Not dealing with flying pigs today. |
| s5d | 4:30 | 5.5 | dialogue | [heartbroken, yelling] My house! I built that! <break time="0.4s"/> [quieter] ...Badly, but still! |
| s5e | 4:39 | 3.0 | whisper | [whispers, chilled] Not the first... <break time="0.4s"/> what? |
| s5f | 4:51 | 4.0 | dialogue | [resigned sigh] A portal. Of course. <break time="0.2s"/> Why not. |
| s6a | 4:58 | 6.0 | narration | [awed, quiet] That wasn't the Nether. <break time="0.4s"/> That wasn't... anything. |
| s6b | 5:15 | 5.0 | dialogue | [sarcastic, shaky] Okay. Giant computer in the void. Totally normal. |
| s6c | 5:25 | 3.0 ⚠ | dialogue | [frustrated shout] Why can't I *hit* it?! |
| s6d | 5:28 | 3.0 | dialogue | [shocked, hopeful] Reset world?! |
| s7a | 5:45 | 4.5 | dialogue | [relieved, happy sigh] Finally. <break time="0.3s"/> A *normal* Minecraft world. |
| s7b | 5:50 | 2.0 | whisper | [whispers, sudden dread] Wait. |
| s7c | 5:59 | 6.0 | entity | [slow, calm, menacing] You reset the world. <break time="0.8s"/> You didn't reset *me.* |

Words between asterisks (*…*) are where the stress goes. Do not paste the asterisks into ElevenLabs.

## Putting the voice into the video

```bash
# after putting all files into voice/ (missing IDs fall back to the built-in TTS):
npm run tts      # checks lengths and prints WARN for lines that don't fit
npm run audio    # rebuilds the soundtrack with the new voice
rm -rf build/frames && npm run render   # subtitles follow the new durations, so re-render the frames
```

If a line gets a WARN (it is too long), regenerate it faster or shift its time `t` in `src/story/script.js`.
