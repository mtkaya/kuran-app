import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EDITIONS = {
    tr: 'tr.diyanet',      // Turkish
    en: 'en.sahih',        // English
    de: 'de.aburida',      // German  
    fr: 'fr.hamidullah',   // French
    zh: 'zh.majian'        // Chinese
};

async function fetchAndSave(langCode, edition) {
    console.log(`Fetching ${langCode} (${edition})...`);
    try {
        const response = await fetch(`http://api.alquran.cloud/v1/quran/${edition}`);
        const data = await response.json();

        if (data.code !== 200) {
            console.error(`Failed to fetch ${langCode}`);
            return null;
        }

        const outputPath = path.join(__dirname, 'src', 'data', `${langCode}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Saved: ${outputPath}`);
        return data;
    } catch (err) {
        console.error(`Error fetching ${langCode}:`, err.message);
        return null;
    }
}

async function main() {
    // First fetch Arabic (base text)
    console.log('Fetching Arabic base text...');
    const arabicRes = await fetch('http://api.alquran.cloud/v1/quran/quran-uthmani');
    const arabicData = await arabicRes.json();

    if (arabicData.code !== 200) {
        console.error('Failed to fetch Arabic text');
        return;
    }

    fs.writeFileSync(
        path.join(__dirname, 'src', 'data', 'ar.json'),
        JSON.stringify(arabicData, null, 2)
    );
    console.log('Arabic saved');

    // Fetch all translations
    for (const [langCode, edition] of Object.entries(EDITIONS)) {
        await fetchAndSave(langCode, edition);
    }

    console.log('\\nAll languages downloaded!');
}

main().catch(console.error);
