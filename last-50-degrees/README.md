# «Последние 50 градусов» — анимационный сериал (Remotion)

Вертикальный сериал для YouTube Shorts / TikTok: **10 серий по 1–2 минуты**, 1080×1920 (9:16), 30 FPS, экспорт в MP4 (H.264 + AAC).
Минималистичная 2D-анимация на SVG/React: персонажи, локации, камера с параллаксом, эффекты, субтитры — всё программное, без внешних картинок.

> Проект лежит в подпапке `last-50-degrees/` репозитория и полностью автономен (свой `package.json`). Файлы плагина Superpowers он не затрагивает.

## Быстрый старт

Нужны Node.js 18+ и `ffmpeg` (только для генерации заглушек звука; сам рендер использует встроенный).

```bash
cd last-50-degrees
npm install
npm run studio          # предпросмотр в браузере (Remotion Studio), композиции ep01 … ep10
```

## Рендер

```bash
npm run render -- ep01          # одна серия  → out/ep01.mp4
npm run render -- ep03 ep07     # несколько серий
npm run render:all              # все 10 серий → out/ep01.mp4 … out/ep10.mp4
npm run render -- ep01 --crf=18 # выше качество (файл больше); по умолчанию crf=20
npm run still -- ep01           # контрольные кадры по сценам → out/stills/
npm run still -- ep01 120 900   # стоп-кадры по номерам кадров
```

Серии рендерятся независимо друг от друга. Время: ~3–4 минуты на серию на 4 ядрах (софтверный рендер).
Браузер: скрипт сам находит предустановленный `chrome-headless-shell`; иначе Remotion скачает свой. Свой браузер — `REMOTION_BROWSER=/путь/к/chrome`.

## Структура

```
src/
  index.ts, Root.tsx        регистрация композиций ep01…ep10 (Remotion)
  Episode.tsx               сборка серии: сцены, плашка «СЕРИЯ N», финал «Продолжение следует», музыка
  config.ts                 формат (1080×1920, 30 FPS), линия земли, позиция субтитров
  types.ts                  язык описания сцен (персонажи, камера, вставки, реплики, звук)
  characters/               Character.tsx (единый параметрический персонаж), roster.ts (внешность), Terra.tsx (ИИ)
  locations/                10 локаций + LIGHT (освещение персонажей по локациям)
  components/               Camera, Actors, Fx (пыль, лучи, марево, мерцание, глитч), Subtitles,
                            InsertLayer + inserts/ (терминал, термометр, глобус, фото, календарь, дело, видео…)
  animations/               ease.ts (кривые, ключевые кадры), noise.ts (детерминированный шум)
  episodes/                 ep01.ts … ep10.ts — по файлу на серию; timing.ts — расчёт времени
  audio/                    resolve.ts + available.json (генерируется скриптом)
  styles/                   palette.ts, fonts.ts (шрифты из npm — рендер не зависит от системных)
public/
  characters/ backgrounds/  свои изображения-референсы (сейчас пусто — графика рисуется кодом)
  music/  sound-effects/    свои треки и эффекты (+ placeholder/ — временные заглушки)
  voiceover/epNN/           озвучка реплик (см. ниже)
scripts/                    render.mjs, check-assets.mjs, make-placeholder-audio.mjs, export-docs.mjs
docs/                       shotlist.md (шотлист), voiceover/epNN.md (тексты озвучки)
```

## Как устроена серия

Серия — это список сцен в `src/episodes/epNN.ts`. Сцена — данные, а не отдельный компонент:

```ts
{
  id: 's05',
  loc: {id: 'city', variant: 'terminal', heat: 0.8},          // локация и её вариант
  cam: {from: {x: 140, y: 1010, zoom: 1.12}, to: {x: 540, y: 1010, zoom: 1.12}, ease: 'linear'},
  fx: {heat: 0.8, dust: 1, embers: 0.7, vignette: 0.5, rays: {x: 720, y: 620}},
  actors: [A('marc', 'marc', [                                   // ключевые кадры персонажа (t — секунды)
    {t: 0,   x: -60, y: 1360, scale: 1.3, pose: 'walk', expr: 'worried', backpack: true},
    {t: 3.9, x: 480},
    {t: 4.3, pose: 'idle'},
  ])],
  inserts: [{type: 'thermo', at: 0.4, dur: 4.4, from: 54, to: 96, label: 'НА УЛИЦЕ'}],
  lines: [N('Асфальт *плавится* под ботинками.')],             // *акцент* в субтитрах
  sfx: [{t: 0, name: 'footsteps'}],
  tIn: 'flash',                                                // переход в сцену
}
```

- **Длительность сцены** считается по репликам и вставкам; её можно задать явно: `dur: 6`.
- **Позы**: `idle walk run reach point hold shock crouch sit slump lookUp`. **Эмоции**: `neutral worried shocked sad determined smile tired suspicious`. Говорящий персонаж шевелит ртом и жестикулирует сам (по полю `speaker` реплики).
- **Вставки**: `terminal thermo globe photo calendar dossier versions countdown choice video bigtext terra`.
- **Переходы**: `cut fade dip flash glitch whip`.
- **Локации** (`loc.id`): `city` (+`terminal`), `apartment` (+`cool`), `shelter` (+`door`), `weather` (+`outside`), `complex` (+`lift`), `lab` (+`hostile`), `desert`, `highway`, `tech` (+`frozen`), `greenhouse` (+`sprout`).
- **Персонажи** (`roster.ts`): `marc marcOld marcKid lina jake mia father mother`. Менять цвета/причёски нужно только там.
- Голос ТЕРРА — `TERRA(...)`; голос из записи без шевеления ртом персонажа в кадре — `noLip: true`.

После правки серий: `npm run docs` обновит шотлист и тексты озвучки.

## Звук и озвучка

Подключение файлов автоматическое (скрипт `check-assets` запускается перед `studio` и `render`):

| Что | Куда положить | Имена |
|---|---|---|
| Музыка | `public/music/<имя>.mp3` | `tension`, `dark`, `cold`, `hope` |
| Эффекты | `public/sound-effects/<имя>.mp3` | `siren beep impact whoosh hum static glitch wind heartbeat click door lift alarm footsteps radio stinger` |
| Озвучка | `public/voiceover/epNN/<id реплики>.mp3` | id смотрите в `docs/voiceover/epNN.md`, например `ep01-s02-l1.mp3` |

Расширения `.mp3 .wav .ogg .m4a`. Свой файл всегда приоритетнее заглушки. Проверить, что найдено: `npm run audio:check`.

## Недостающие ресурсы (честно)

1. **Озвучка — 0 файлов.** Голоса не подключены (нет TTS-сервиса и записей). Структура готова: тексты и id файлов — `docs/voiceover/`, режиссура голосов — `docs/voiceover/README.md`. Тайминг субтитров рассчитан по длине текста (~14 симв./сек); после записи подправьте `dur`/`at` у реплик.
2. **Музыка и эффекты — только синтетические заглушки** (`npm run audio:placeholders`, генерируются ffmpeg из синусоид/шума, лежат в `placeholder/` и не коммитятся). Это не саунд-дизайн: замените на настоящие 4 трека и 16 эффектов (имена выше).
3. **Референс-изображения не были приложены к задаче**, поэтому персонажи нарисованы по текстовому описанию (`src/characters/roster.ts`). Если у вас есть референсы — сверьте цвета/причёски и скорректируйте roster; положите изображения в `public/characters/` для справки.
4. Шрифты (Inter, JetBrains Mono) подключены из npm — отдельных файлов не нужно.

## Принятые решения по сценарию

- Заголовок серии 1 «Температура 96°C» при показании термометра «54°C» в комнате согласован так: 54° — воздух в квартире, 96° — поверхность на улице (счётчик в сцене выхода).
- Мия и Джейк добавлены камео в серию 2 (убежище); Мия мелькает в одной из «версий» серии 6. Основной сюжет не менялся.
- Серии 3–9 дополнены короткими связующими сценами (в рамках вашего сюжета), чтобы каждая серия укладывалась в 1–2 минуты вместе с плашкой «Продолжение следует».
- «Плашка серии» («СЕРИЯ N · название») показывается первые ~3 секунды в верхней безопасной зоне и не перекрывает крючок.

## Технические заметки

- Субтитры стоят выше нижних ~20% кадра (интерфейс TikTok/Shorts); константа `SUBTITLE_Y` в `src/config.ts`.
- Марево (`fx.heat`) — SVG-фильтр, ограниченный полосой у горизонта: так он в разы дешевле.
- Весь шум/частицы детерминированы — повторный рендер даёт идентичный результат.
