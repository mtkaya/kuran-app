#!/usr/bin/env node
// Fetch Quran transliterations from the Açık Kuran API.
//
//   node scripts/fetch-transliteration.mjs
//
// Writes two files consumed by src/data/transliteration.ts:
//   src/data/translit-tr.json  — Turkish reading (transcription)
//   src/data/translit-en.json  — Latin reading (transcription_en)
//
// Source:  https://acikkuran.com  ·  https://github.com/acik-kuran/acikkuran-api
// Licence: CC BY-NC-SA 4.0 — attribution required, non-commercial use only.
//          Keep the credit in the app's Sources screen, and remove this data
//          if the app ever carries ads or a paid tier.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, '../src/data');
const API = 'https://api.acikkuran.com';
const SURAH_COUNT = 114;
const EXPECTED_VERSES = 6236;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Node wraps network failures as a bare "fetch failed"; the useful detail
// (DNS, TLS, refused connection) is on err.cause
function describe(err) {
    const cause = err?.cause;
    if (!cause) return err?.message ?? String(err);
    const code = cause.code ? `${cause.code} ` : '';
    return `${err.message} — ${code}${cause.message ?? ''}`.trim();
}

async function getSurah(id, attempt = 1) {
    try {
        const res = await fetch(`${API}/surah/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        if (attempt >= 4) {
            throw new Error(
                `Surah ${id} alınamadı: ${describe(err)}\n` +
                `  Denenen adres: ${API}/surah/${id}\n` +
                `  Şunu deneyin: curl -sS -o /dev/null -w "%{http_code}\\n" ${API}/surah/${id}`
            );
        }
        await sleep(attempt * 1000);
        return getSurah(id, attempt + 1);
    }
}

const tr = {};
const en = {};
let verseTotal = 0;
const missingTr = [];
const missingEn = [];

console.log('Açık Kuran API — okunuş verisi indiriliyor...');

for (let id = 1; id <= SURAH_COUNT; id++) {
    const payload = await getSurah(id);
    const verses = payload?.data?.verses ?? [];
    if (verses.length === 0) throw new Error(`Surah ${id} returned no verses`);

    tr[id] = {};
    en[id] = {};
    for (const verse of verses) {
        const n = verse.verse_number;
        verseTotal++;
        const turkish = (verse.transcription ?? '').trim();
        const latin = (verse.transcription_en ?? '').trim();
        if (turkish) tr[id][n] = turkish; else missingTr.push(`${id}:${n}`);
        if (latin) en[id][n] = latin; else missingEn.push(`${id}:${n}`);
    }

    process.stdout.write(`\r  ${id}/${SURAH_COUNT} sure — ${verseTotal} ayet`);
    await sleep(120); // be gentle with a free public API
}

console.log('\n');
console.log(`Sure            : ${Object.keys(tr).length} (beklenen ${SURAH_COUNT})`);
console.log(`Ayet            : ${verseTotal} (beklenen ${EXPECTED_VERSES})`);
console.log(`Türkçe eksik    : ${missingTr.length}${missingTr.length ? ' → ' + missingTr.slice(0, 10).join(', ') : ''}`);
console.log(`Latin eksik     : ${missingEn.length}${missingEn.length ? ' → ' + missingEn.slice(0, 10).join(', ') : ''}`);

if (verseTotal !== EXPECTED_VERSES) {
    console.error('\nUYARI: ayet sayısı beklenenden farklı. Dosyalar yine de yazıldı, ama kontrol et.');
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(resolve(OUT_DIR, 'translit-tr.json'), JSON.stringify(tr));
writeFileSync(resolve(OUT_DIR, 'translit-en.json'), JSON.stringify(en));

console.log('\nYazıldı:');
console.log('  src/data/translit-tr.json');
console.log('  src/data/translit-en.json');
console.log('\nŞimdi: npm run test:run && git add src/data/translit-*.json && commit + push');
