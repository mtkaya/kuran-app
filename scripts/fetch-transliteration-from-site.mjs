#!/usr/bin/env node
// Build the transliteration corpora from acikkuran.com's rendered pages.
//
//   node scripts/fetch-transliteration-from-site.mjs
//
// Why the site rather than the API: api.acikkuran.com's DNS record is gone, so
// neither the REST API nor the database is reachable any more. The Next.js
// frontend is still up, still renders every surah on the server, and still
// embeds the whole API payload in its __NEXT_DATA__ script tag — the same rows
// the API would have returned, straight from the database.
//
// Writes the two files src/data/transliteration.ts loads:
//   src/data/translit-tr.json  — Turkish reading (transcription)
//   src/data/translit-en.json  — Latin reading (transcription_en)
//
// Source:  https://acikkuran.com
// Licence: CC BY-NC-SA 4.0 — attribution required, non-commercial use only.
//          Keep the credit in the app's Sources screen, and drop this data if
//          the app ever carries ads or a paid tier.
//
// Flags:
//   --no-basmala   leave verse 1 exactly as the site returns it
//   --out DIR      write somewhere other than src/data
//   --keep-partial write a corpus even when it is short of 114/6236

import { writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => {
    const i = args.indexOf(name);
    return i === -1 ? null : args[i + 1];
};

const OUT_DIR = resolve(HERE, value('--out') ?? '../src/data');
const SITE = 'https://acikkuran.com';
const SURAH_COUNT = 114;
const EXPECTED_VERSES = 6236;
const ADD_BASMALA = !flag('--no-basmala');
const KEEP_PARTIAL = flag('--keep-partial');

// Surah 1's first verse already is the basmala and surah 9 has none, so those
// two are the only ones whose verse 1 must be left alone. This matches
// src/data/ar.json, where 113 of 114 surahs carry the basmala on ayah 1.
const NO_BASMALA_PREFIX = new Set([1, 9]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function describe(err) {
    const cause = err?.cause;
    if (!cause) return err?.message ?? String(err);
    const code = cause.code ? `${cause.code} ` : '';
    return `${err.message} — ${code}${cause.message ?? ''}`.trim();
}

// Spacing only — never a letter. The source has stray spaces before full stops
// ("rabbil alemin .") and the odd double space.
function tidy(text) {
    return String(text ?? '')
        .replace(/\s+/g, ' ')
        .replace(/\s+([.,;:!?])/g, '$1')
        .trim();
}

const NEXT_DATA = /<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]*?)<\/script>/;

async function getSurah(id, attempt = 1) {
    try {
        const res = await fetch(`${SITE}/${id}`, {
            headers: {
                // Identify the scraper rather than pretending to be a browser
                'User-Agent': 'kuran-app transliteration export (github.com/mtkaya/kuran-app)',
                'Accept-Language': 'tr',
            },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const html = await res.text();
        const match = html.match(NEXT_DATA);
        if (!match) throw new Error('__NEXT_DATA__ bulunamadı (sayfa düzeni değişmiş olabilir)');

        const props = JSON.parse(match[1])?.props?.pageProps;
        if (!props) throw new Error('pageProps yok');
        if (props.errorCode) throw new Error(`sayfa ${props.errorCode} döndü`);
        if (!Array.isArray(props.verses) || props.verses.length === 0) {
            throw new Error('verses dizisi boş');
        }
        return props;
    } catch (err) {
        if (attempt >= 4) {
            throw new Error(
                `Sure ${id} alınamadı: ${describe(err)}\n` +
                `  Denenen adres: ${SITE}/${id}\n` +
                `  Şunu deneyin: curl -sS -o /dev/null -w "%{http_code}\\n" ${SITE}/${id}`
            );
        }
        await sleep(attempt * 1500);
        return getSurah(id, attempt + 1);
    }
}

const tr = {};
const en = {};
let verseTotal = 0;
const missingTr = [];
const missingEn = [];

console.log('acikkuran.com — okunuş verisi çekiliyor...\n');

for (let id = 1; id <= SURAH_COUNT; id++) {
    const props = await getSurah(id);

    tr[id] = {};
    en[id] = {};

    for (const verse of props.verses) {
        const n = verse.number;
        verseTotal++;

        let turkish = tidy(verse.transcription);
        let latin = tidy(verse.transcription_en);

        // Our Arabic text carries the basmala inside ayah 1, so the reading has
        // to carry it too or the two lines will not line up.
        if (ADD_BASMALA && n === 1 && !NO_BASMALA_PREFIX.has(id) && props.zero) {
            const zeroTr = tidy(props.zero.transcription);
            const zeroEn = tidy(props.zero.transcription_en);
            if (turkish && zeroTr) turkish = `${zeroTr} ${turkish}`;
            if (latin && zeroEn) latin = `${zeroEn} ${latin}`;
        }

        if (turkish) tr[id][n] = turkish; else missingTr.push(`${id}:${n}`);
        if (latin) en[id][n] = latin; else missingEn.push(`${id}:${n}`);
    }

    process.stdout.write(`\r  ${id}/${SURAH_COUNT} sure — ${verseTotal} ayet`);
    await sleep(150); // be gentle, it is a live site
}

console.log('\n');

function report(label, corpus, missing) {
    const surahs = Object.keys(corpus).filter((id) => Object.keys(corpus[id]).length > 0).length;
    const verses = Object.values(corpus).reduce((n, s) => n + Object.keys(s).length, 0);
    const complete = surahs === SURAH_COUNT && verses === EXPECTED_VERSES && missing.length === 0;
    console.log(
        `${label.padEnd(8)}: ${surahs} sure, ${verses} ayet` +
        (complete ? ' ✓' : `  ← beklenen ${SURAH_COUNT} / ${EXPECTED_VERSES}`)
    );
    if (missing.length) {
        console.log(`          eksik ${missing.length}: ${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ' …' : ''}`);
    }
    return complete;
}

const trComplete = report('Türkçe', tr, missingTr);
const enComplete = report('Latin', en, missingEn);

console.log(`\nToplam çekilen ayet: ${verseTotal} (beklenen ${EXPECTED_VERSES})`);

// Write through a scratch file so a short corpus can never half-overwrite a
// good one that is already committed.
mkdirSync(OUT_DIR, { recursive: true });

function commit(label, corpus, complete, filename) {
    const target = resolve(OUT_DIR, filename);
    if (!complete && !KEEP_PARTIAL) {
        console.log(`\n${label}: eksik — ${filename} değiştirilmedi.`);
        console.log(`  Yine de yazmak için: node scripts/fetch-transliteration-from-site.mjs --keep-partial`);
        return false;
    }
    const tmp = `${target}.tmp`;
    writeFileSync(tmp, JSON.stringify(corpus));
    renameSync(tmp, target);
    console.log(`\n${label}: yazıldı → src/data/${filename}`);
    return true;
}

const wroteTr = commit('Türkçe', tr, trComplete, 'translit-tr.json');
const wroteEn = commit('Latin', en, enComplete, 'translit-en.json');

if (wroteTr || wroteEn) {
    console.log('\nSonraki adım:');
    console.log('  npm run test:run');
    console.log('  git add src/data/translit-*.json');
    console.log("  git commit -m 'data: Açık Kuran okunuş korpusu' && git push");
} else {
    process.exitCode = 1;
}
