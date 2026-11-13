import type {EaseName} from './animations/ease';

/* ───────────────────────── Персонажи ───────────────────────── */

export type CharId =
  | 'marc'
  | 'marcOld'
  | 'marcKid'
  | 'lina'
  | 'jake'
  | 'mia'
  | 'father'
  | 'mother';

export type Expr =
  | 'neutral'
  | 'worried'
  | 'shocked'
  | 'sad'
  | 'determined'
  | 'smile'
  | 'tired'
  | 'suspicious';

export type Pose =
  | 'idle'
  | 'walk'
  | 'run'
  | 'reach' // рука вперёд: нажимает кнопки, показывает на экран
  | 'point' // указывает вперёд/вверх
  | 'hold' // держит что-то перед собой
  | 'shock' // отшатнулся
  | 'crouch'
  | 'sit'
  | 'slump' // уставший, опущенные плечи
  | 'lookUp';

/** Ключевой кадр персонажа. t — секунды от начала сцены. Числовые свойства интерполируются, остальные — «ступенькой». */
export interface ActorKey {
  t: number;
  x?: number;
  y?: number;
  scale?: number;
  rot?: number;
  /** Куда смотрит: -1 (в сторону затылка) … 0 … 1 (в сторону движения). */
  look?: number;
  /** Наклон головы, градусы. */
  tilt?: number;
  pose?: Pose;
  expr?: Expr;
  flip?: boolean;
  backpack?: boolean;
  opacity?: number;
  ease?: EaseName;
}

export interface Actor {
  /** Уникальный id в сцене. */
  id: string;
  char: CharId;
  keys: ActorKey[];
  /** Рисовать поверх переднего плана локации. */
  front?: boolean;
}

/* ───────────────────────── Камера ───────────────────────── */

export interface Cam {
  /** Точка мира в центре кадра. */
  x: number;
  y: number;
  zoom: number;
}
export interface CameraDef {
  from: Cam;
  to?: Cam;
  ease?: EaseName;
  /** Тряска камеры, пиксели. */
  shake?: number;
  /** Интервал тряски [с, с]; по умолчанию — вся сцена. */
  shakeAt?: [number, number];
  /** Дополнительные «удары» камеры (зум-пульс) в указанные моменты, секунды. */
  punch?: number[];
}

/* ───────────────────────── Локации и эффекты ───────────────────────── */

export type LocationId =
  | 'city'
  | 'apartment'
  | 'shelter'
  | 'weather'
  | 'complex'
  | 'lab'
  | 'desert'
  | 'highway'
  | 'tech'
  | 'greenhouse';

export interface LocationDef {
  id: LocationId;
  variant?: string;
  /** Смещение по времени суток / «жаре»: 0 — обычный, 1 — максимум. */
  heat?: number;
}

export interface FxDef {
  /** Пылинки в воздухе (0..1 — плотность). */
  dust?: number;
  /** Искры/пепел, летящие по ветру. */
  embers?: number;
  /** Солнечные лучи из точки экрана. */
  rays?: {x: number; y: number; opacity?: number};
  /** Марево над поверхностью (0..1). */
  heat?: number;
  /** Мерцание ламп. */
  flicker?: boolean;
  /** Аварийная красная пульсация. */
  alarm?: boolean;
  /** Затемнение краёв. */
  vignette?: number;
  /** Цветовой фильтр поверх сцены. */
  tint?: {color: string; opacity: number};
  /** Горизонтальные линии «экрана». */
  scan?: boolean;
  /** Всплески глитча в указанные моменты (секунды). */
  glitchAt?: number[];
  /** Белые вспышки в указанные моменты. */
  flashAt?: number[];
  /** Пар/дымок: позиция в мире. */
  steam?: {x: number; y: number};
  /** Дрожание картинки (px) на всю сцену. */
  jitter?: number;
}

export type TransitionName = 'cut' | 'fade' | 'flash' | 'glitch' | 'whip' | 'dip';

/* ───────────────────────── Вставки (интерфейсы, документы) ───────────────────────── */

export interface TLine {
  /** Секунды от начала вставки. */
  t: number;
  text: string;
  tone?: 'normal' | 'dim' | 'warn' | 'alert' | 'ok' | 'big';
  glitch?: boolean;
}

interface InsertBase {
  /** Секунды от начала сцены. */
  at: number;
  dur: number;
  x?: number;
  y?: number;
  scale?: number;
  enter?: 'pop' | 'fade' | 'slide' | 'glitch';
  /** Затемнить сцену за вставкой (0..1). */
  dim?: number;
}

export type Insert = InsertBase &
  (
    | {
        type: 'terminal';
        title?: string;
        theme?: 'blue' | 'amber' | 'red';
        lines: TLine[];
        w?: number;
        h?: number;
      }
    | {type: 'thermo'; from: number; to: number; label?: string; style?: 'hud' | 'big'; tintFrom?: number}
    | {
        type: 'globe';
        mode?: 'heat' | 'schema';
        spot?: {label: string; angle: number};
        spotAt?: number;
      }
    | {
        type: 'photo';
        who: CharId[];
        flipAt?: number;
        back?: string;
        caption?: string;
      }
    | {type: 'calendar'; day: string; month: string; year: string; note?: string}
    | {
        type: 'dossier';
        title?: string;
        fields: [string, string][];
        stamp?: string;
        face?: CharId;
        theme?: 'blue' | 'amber' | 'red';
      }
    | {
        type: 'versions';
        tiles: {label: string; status: string; color?: string; char?: CharId}[];
        cols?: number;
        pickAt?: number;
      }
    | {type: 'countdown'; from: number; to: number; label?: string}
    | {
        type: 'choice';
        a: string;
        b: string;
        disabledA?: boolean;
        note?: string;
        pick?: 'a' | 'b';
        pickAt?: number;
      }
    | {type: 'video'; char: CharId; caption: string; tint?: string; room?: 'station' | 'lab' | 'home'}
    | {type: 'bigtext'; text: string; sub?: string; color?: string; glitch?: boolean}
    | {type: 'terra'; mode?: 'calm' | 'hostile'; bare?: boolean}
  );

/* ───────────────────────── Реплики и звук ───────────────────────── */

export type Speaker =
  | 'narrator'
  | 'marc'
  | 'lina'
  | 'jake'
  | 'mia'
  | 'father'
  | 'mother'
  | 'terra'
  | 'radio';

export interface Line {
  speaker: Speaker;
  /** Текст. *Слово* — акцент в субтитрах. */
  text: string;
  /** Начало (с от начала сцены). Если не указано — сразу после предыдущей реплики. */
  at?: number;
  /** Длительность. Если не указана — оценивается по длине текста. */
  dur?: number;
  /** Сдвиг относительно «сразу после предыдущей» (пауза/перебивание). */
  gap?: number;
  /** Подпись для озвучки: интонация. */
  note?: string;
  /** Не показывать как субтитр (текст дублируется на экране интерфейсом). */
  hidden?: boolean;
  /** Голос «за кадром»/из записи: персонаж в сцене не шевелит ртом. */
  noLip?: boolean;
}

export interface SfxCue {
  /** Секунды от начала сцены. */
  t: number;
  name: SfxName;
  vol?: number;
}

export type SfxName =
  | 'siren'
  | 'beep'
  | 'impact'
  | 'whoosh'
  | 'hum'
  | 'static'
  | 'glitch'
  | 'wind'
  | 'heartbeat'
  | 'click'
  | 'door'
  | 'lift'
  | 'alarm'
  | 'footsteps'
  | 'radio'
  | 'stinger';

export type MusicName = 'tension' | 'dark' | 'cold' | 'hope';

/* ───────────────────────── Сцена и серия ───────────────────────── */

export interface SceneDef {
  id: string;
  /** Длительность в секундах. Если не указана — по последней реплике + хвост. */
  dur?: number;
  /** Задержка перед первой репликой. */
  lead?: number;
  loc: LocationDef;
  actors?: Actor[];
  cam?: CameraDef;
  fx?: FxDef;
  inserts?: Insert[];
  lines?: Line[];
  sfx?: SfxCue[];
  /** Переход в начало сцены. */
  tIn?: TransitionName;
  /** Короткая подпись «действие кадра» для раскадровки (не рендерится). */
  note?: string;
}

export interface EpisodeDef {
  n: number;
  /** id композиции Remotion: ep01 … ep10. */
  id: string;
  title: string;
  /** Подзаголовок для плашки. */
  hook?: string;
  music: MusicName;
  musicVol?: number;
  scenes: SceneDef[];
  /** Тизер следующей серии для финальной плашки. */
  nextTitle?: string;
  /** Финал сезона. */
  finale?: boolean;
}
