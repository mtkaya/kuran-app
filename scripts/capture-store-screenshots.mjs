#!/usr/bin/env node
// Capture App Store / Play Store screenshots from the production build.
//
//   npm run build
//   npx vite preview --port 4173 --host 127.0.0.1 &
//   npm i -D playwright && npx playwright install chromium
//   node scripts/capture-store-screenshots.mjs
//
// Playwright is deliberately NOT a devDependency: installing it pulls ~150 MB
// of browsers on every npm install, and this script runs a few times a year.
// Install it when you need screenshots, remove it after if you like.
//
// Output: screenshots/<name>.png at 1290×2796 (iPhone 6.7", the size Apple
// asks for and the one Play accepts for phone listings).
//
// Two things this script knows that are easy to get wrong:
//
//   1. It navigates by clicking, never by URL. The build uses relative asset
//      paths — correct for Capacitor's file:// loading — so opening
//      /surah/1 directly resolves assets to /surah/assets/… and 404s into a
//      blank page. Single-segment routes like /juz-list are fine.
//   2. Surah names carry circumflexes in the UI: Yâsîn, İhlâs. Searching for
//      "Yasin" finds nothing.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173';
const OUT = process.env.OUT_DIR ?? resolve(HERE, '../screenshots');

const VIEWPORT = { width: 430, height: 932 };   // ×3 = 1290×2796
const SCALE = 3;

const BASE_SETTINGS = {
    theme: 'light',
    arabicFontSize: 28,
    mealFontSize: 18,
    showTransliteration: true,
    showTajweed: false,
    memorizationMode: false,
    readingMode: 'normal',
    arabicFont: 'Amiri Quran',
    mushafEdition: 'diyanet',
    hasSeenTutorial: true,
};

const seed = (settings) => `
    localStorage.setItem('quran-app-language', 'tr');
    localStorage.setItem('kuran-app-data', ${JSON.stringify(JSON.stringify({
        version: 2, settings, bookmarks: [], notes: [], lastRead: null,
    }))});
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
`;

const SHOTS = [
    { name: '01-home', settings: BASE_SETTINGS },
    { name: '02-fatiha', settings: BASE_SETTINGS, surah: 'Fatiha' },
    { name: '03-bakara-okunus', settings: BASE_SETTINGS, surah: 'Bakara', scroll: 1100 },
    { name: '04-mushaf', settings: { ...BASE_SETTINGS, readingMode: 'mushaf' }, surah: 'Bakara' },
    { name: '05-ezber', settings: { ...BASE_SETTINGS, memorizationMode: true }, surah: 'Yâsîn', reveal: true },
    { name: '06-tecvid', settings: { ...BASE_SETTINGS, showTajweed: true }, surah: 'Fatiha' },
    { name: '07-ihlas-koyu', settings: { ...BASE_SETTINGS, theme: 'dark' }, surah: 'İhlâs', dark: true },
    { name: '08-cuz', settings: BASE_SETTINGS, url: '/juz-list' },
    { name: '09-ayet-karti', settings: BASE_SETTINGS, surah: 'İhlâs', verseCard: true },
];

async function openSurah(page, name) {
    const box = page.getByPlaceholder(/ara/i).first();
    if (await box.isVisible().catch(() => false)) {
        await box.fill(name);
        await page.waitForTimeout(700);
    }
    await page.getByText(name, { exact: false }).first().click({ timeout: 10000 });
    await page.waitForTimeout(2600);   // lazy transliteration chunk + fonts
}

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});

let failed = 0;

for (const shot of SHOTS) {
    const ctx = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: SCALE,
        isMobile: true,
        hasTouch: true,
        locale: 'tr-TR',
        colorScheme: shot.dark ? 'dark' : 'light',
    });
    await ctx.addInitScript(seed(shot.settings));

    const page = await ctx.newPage();
    const problems = [];
    page.on('pageerror', (e) => problems.push(e.message.slice(0, 70)));

    try {
        await page.goto(BASE + (shot.url ?? '/'), { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(2200);

        if (shot.surah) await openSurah(page, shot.surah);

        if (shot.verseCard) {
            await page.locator('[aria-label="Ayet Kartı"]').first().click({ timeout: 8000 });
            await page.waitForTimeout(2000);
            await page.evaluate(() => {
                document.querySelector('canvas')?.scrollIntoView({ block: 'start' });
                window.scrollBy(0, -120);
            });
            await page.waitForTimeout(1200);
        }

        if (shot.reveal) {
            await page.getByText('Görmek için dokun').first().click({ timeout: 8000 }).catch(() => {});
            await page.waitForTimeout(1200);
        }

        if (shot.scroll) {
            await page.evaluate((y) => window.scrollTo(0, y), shot.scroll);
            await page.waitForTimeout(900);
        }

        await page.screenshot({ path: `${OUT}/${shot.name}.png` });
        console.log(`  ${shot.name.padEnd(18)} ${problems.length ? '⚠ ' + problems[0] : 'ok'}`);
    } catch (err) {
        failed++;
        console.error(`  ${shot.name.padEnd(18)} HATA: ${err.message.split('\n')[0].slice(0, 90)}`);
    }

    await ctx.close();
}

await browser.close();

console.log(`\n${SHOTS.length - failed}/${SHOTS.length} kare → ${OUT}`);
if (failed) {
    console.error('\nBazı kareler alınamadı. Önizleme sunucusu ayakta mı?');
    console.error(`  curl -sS -o /dev/null -w "%{http_code}\\n" ${BASE}/`);
    process.exitCode = 1;
}
