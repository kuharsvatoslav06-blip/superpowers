// Экспорт Гоши в самостоятельные SVG: npx tsx scripts/export-svgs.tsx
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { Gosha, GoshaProps } from '../src/characters/Gosha';

const out = (name: string, p: GoshaProps, w: number, h: number) => {
  const svg = renderToStaticMarkup(<Gosha {...p} width={w} height={h} />);
  writeFileSync(`assets/characters/${name}`, '<?xml version="1.0" encoding="UTF-8"?>\n' + svg);
  console.log('wrote', name);
};
const extra = process.argv[2];
if (extra) {
  out(extra, JSON.parse(process.argv[3] || '{}'), 800, 1680);
} else {
  out('gosha_skuf2_fullbody.svg', { crop: 'full', showStink: true }, 800, 1680);
  out('gosha_skuf2.svg', { crop: 'bust' }, 760, 1000);
}
