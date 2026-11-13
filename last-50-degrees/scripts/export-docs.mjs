#!/usr/bin/env node
/**
 * Генерирует документацию из данных серий (src/episodes):
 *   docs/voiceover/epNN.md  — текст озвучки с id реплик (имена файлов для public/voiceover/epNN/<id>.mp3)
 *   docs/voiceover/README.md — режиссура голосов
 *   docs/shotlist.md        — шотлист: сцены, локации, персонажи, вставки, звуки, длительности
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {ROOT, loadEpisodes} from './lib.mjs';

const {EPISODES, resolveLines, sceneSeconds, episodeTiming} = await loadEpisodes();
const NAMES = {narrator: 'Рассказчик', marc: 'Марк', lina: 'Лина', jake: 'Джейк', mia: 'Мия', father: 'Отец', mother: 'Мать', terra: 'ТЕРРА (ИИ)', radio: 'Радио'};
const f1 = (x) => x.toFixed(1);
const clean = (s) => s.replace(/\*/g, '');

const vdir = path.join(ROOT, 'docs/voiceover');
mkdirSync(vdir, {recursive: true});

let shot = '# Шотлист сезона 1 «Последние 50 градусов»\n\n_Файл создан автоматически: `npm run docs`. Источник правды — `src/episodes/epNN.ts`._\n\n';
let totalSec = 0;

for (const ep of EPISODES) {
  const tm = episodeTiming(ep);
  totalSec += tm.total / 30;
  let md = `# Серия ${ep.n} · «${ep.title}» — озвучка\n\n`;
  md += `Длительность серии: **${f1(tm.total / 30)} с**. Файлы озвучки кладите в \`public/voiceover/${ep.id}/<id>.mp3\` (или .wav/.ogg) — они подхватятся автоматически (\`npm run audio:check\`).\n\n`;
  md += '| id (имя файла) | Кто | Старт, с | ~Длит., с | Текст | Интонация |\n|---|---|---|---|---|---|\n';
  shot += `## Серия ${ep.n} · «${ep.title}» — ${f1(tm.total / 30)} с\n\n| Сцена | Длит. | Локация | Персонажи | Вставки | Звук/эффекты |\n|---|---|---|---|---|---|\n`;
  ep.scenes.forEach((s, i) => {
    for (const l of resolveLines(ep.id, s)) {
      const start = tm.starts[i] / 30 + l.at;
      md += `| \`${l.id}\` | ${NAMES[l.speaker]} | ${f1(start)} | ${f1(l.dur)} | ${clean(l.text)}${l.hidden ? ' _(только озвучка, без субтитра)_' : ''}${l.noLip ? ' _(голос из записи)_' : ''} | ${l.note ?? ''} |\n`;
    }
    const actors = [...new Set((s.actors ?? []).map((a) => a.char))].join(', ') || '—';
    const ins = (s.inserts ?? []).map((x) => x.type).join(', ') || '—';
    const sfx = [...new Set((s.sfx ?? []).map((x) => x.name))].join(', ') || '—';
    shot += `| ${s.id} | ${f1(sceneSeconds(ep.id, s))} с | ${s.loc.id}${s.loc.variant ? '/' + s.loc.variant : ''} | ${actors} | ${ins} | ${sfx} |\n`;
  });
  writeFileSync(path.join(vdir, `${ep.id}.md`), md + '\n');
  shot += `\nМузыка: \`${ep.music}\`. Финал серии: ${ep.finale ? 'финал сезона' : 'сюжетный поворот → «Продолжение следует»'}.\n\n`;
}
shot += `**Итого сезон:** ${f1(totalSec)} с (${f1(totalSec / 60)} мин).\n`;
writeFileSync(path.join(ROOT, 'docs/shotlist.md'), shot);

writeFileSync(
  path.join(vdir, 'README.md'),
  `# Режиссура озвучки\n\nГолоса не подключены (нет внешнего TTS и записанных дорожек) — структура готова.\nЧтобы озвучить реплику: запишите/сгенерируйте файл и назовите его по \`id\` из таблицы серии, положите в \`public/voiceover/<epNN>/\`. Тайминг субтитров задаётся в данных серии (\`at\`/\`dur\`); если дорожка длиннее — увеличьте \`dur\` у реплики или сцены.\n\n| Голос | Характер |\n|---|---|\n| Рассказчик | спокойный, слегка напряжённый; эмоциональнее в ключевых моментах, без театральности |\n| Марк | тихий, сдержанный, наблюдательный; недоверчивый тон к незнакомцам |\n| Лина | сухой, умный, осторожный; прячет часть правды |\n| Джейк | бодрый, общительный, шутит |\n| Мия | настороженная, жёсткая, решительная |\n| Отец (запись) | спокойный, как завещание |\n| ТЕРРА | ровный, «тёплый и пугающий» — без эмоций, но не механический робот |\n| Радио | плоский голос диктора сквозь помехи |\n`,
);
console.log(`Документация: docs/shotlist.md, docs/voiceover/*.md (всего ${f1(totalSec)} с)`);
