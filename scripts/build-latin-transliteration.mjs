#!/usr/bin/env node
// Rebuild src/data/translit-en.json — the Latin reading shown to every
// language except Turkish.
//
//   npm pack quran-json && tar xzf quran-json-*.tgz
//   node scripts/build-latin-transliteration.mjs ./package/dist/chapters
//
// Text source: Tanzil.net (https://tanzil.net/trans/en.transliteration),
// obtained through the quran-json package which repackages it.
// Tanzil permits non-commercial use with attribution and without
// modification; the credit lives in the app's Sources section. Remove this
// data if the app ever carries ads or a paid tier.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../src/data/translit-en.json');
const SURAH_COUNT = 114;
const EXPECTED_VERSES = 6236;

const chaptersDir = process.argv[2];
if (!chaptersDir) {
    console.error('Kullanım: node scripts/build-latin-transliteration.mjs <quran-json chapters dizini>');
    process.exit(1);
}

const corpus = {};
let verses = 0;
const empty = [];

for (let id = 1; id <= SURAH_COUNT; id++) {
    const chapter = JSON.parse(readFileSync(resolve(chaptersDir, `${id}.json`), 'utf8'));
    corpus[id] = {};
    for (const verse of chapter.verses) {
        verses++;
        const text = (verse.transliteration ?? '').trim();
        if (!text) {
            empty.push(`${id}:${verse.id}`);
            continue;
        }
        corpus[id][verse.id] = text;
    }
}

console.log(`Sure : ${Object.keys(corpus).length} (beklenen ${SURAH_COUNT})`);
console.log(`Ayet : ${verses} (beklenen ${EXPECTED_VERSES})`);
console.log(`Boş  : ${empty.length}${empty.length ? ' → ' + empty.slice(0, 10).join(', ') : ''}`);

if (verses !== EXPECTED_VERSES || empty.length > 0) {
    console.error('\nKapsam beklendiği gibi değil, dosya yazılmadı.');
    process.exit(1);
}

writeFileSync(OUT, JSON.stringify(corpus));
console.log(`\nYazıldı: src/data/translit-en.json`);
