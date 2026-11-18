# Гоша и Лена — сериал на 30 серий

Вертикальные анимационные ролики 1080×1920, 30 fps. Стек: Remotion (React + TypeScript).

## Быстрый старт
```bash
npm install
node scripts/render.mjs day01          # → out/day01.mp4
node scripts/check-frames.mjs day01    # кадр из каждой сцены + лист с безопасными зонами
node scripts/check-frames.mjs day01 caption   # кадры в момент субтитров
npx remotion studio                     # живой предпросмотр
```

## Новая серия (День 2–30)
Скопируйте `episodes/day01.json` в `episodes/day02.json` и поменяйте данные: сцены, длительности, субтитры, слои, значения HUD (`hud.days`, `hud.progress`, а также `hud` внутри сцены для плавной смены). Код трогать не нужно. Рендер: `node scripts/render.mjs day02`.

### Слои сцены (`layers[].type`)
`gosha` (поза/эмоции по времени: `eyes` sleepy|shock|happy|angry|worried, `mouth` flat|open|smile|grit|o, `antenna` curl|up, `sweat`, `leftArm` down|wave|raise), `fly`, `sticker`, `arrowLabel`, `bigText`, `exclaim`, `question`, `phone`, `beachPhoto`, `desk`, `impact`, `progressBar`, `choice`, `comment`.
`screen: true` ставит слой поверх камеры (не масштабируется наездом). Все `t` — секунды от начала сцены. Камера: `camera: [{t, zoom, x, y}]`, где (x, y) — точка, которая окажется в центре кадра. Тряска: `shake: [{t, dur, amp}]`.
Субтитры: `caption.text`, ключевое слово в `**звёздочках**`, цвет `accent`: red|green|blue|pink|yellow.

## Обложки
```bash
node scripts/render-covers.mjs day01   # → out/day01_cover_tiktok.png (1080×1920), out/day01_cover_youtube.jpg (1280×720)
```
Тексты — в блоке `cover` файла серии: `badge`, `title`, `subtitle`, `bubble`, `photoCaption`, `stamp`, `color`.

## Озвучка
Текст для ElevenLabs: `episodes/day01_voiceover.txt`. Готовый файл положите в `assets/voice/day01.mp3`, затем:
```bash
node scripts/sync-voice.mjs day01   # находит фразы по паузам и подгоняет сцены и субтитры
node scripts/render.mjs day01
```
Пока файла нет, рендер подставляет тишину `assets/voice/day01_silence.mp3`.

## Звуки и музыка
Подхватываются автоматически, если положить файлы в `assets/sfx/` с именами `pop`, `message`, `punch`, `buzz` (mp3/wav/ogg) и музыку в `assets/music/theme.mp3`.

## Персонажи
`src/characters/Gosha.tsx` — векторный Гоша по референсу `assets/characters/gosha_skuf2_fullbody_bg.png`, разобранный на группы (глаза, веки, рот, антенна, пот, рука). `npx tsx scripts/export-svgs.tsx` выгружает `gosha_skuf2_fullbody.svg` и `gosha_skuf2.svg`. Аватарки `gosha_skuf2_avatar.png` и `lena_avatar.png` вырезаны из присланных картинок.
