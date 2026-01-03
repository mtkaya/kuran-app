import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const arabicPath = path.join(__dirname, 'src', 'data', 'arabic.json');
const turkishPath = path.join(__dirname, 'src', 'data', 'turkish.json');
const outputPath = path.join(__dirname, 'src', 'data', 'quran-data.json');

try {
    if (!fs.existsSync(arabicPath) || !fs.existsSync(turkishPath)) {
        console.error('Error: Source files not found. Please download arabic.json and turkish.json first.');
        process.exit(1);
    }

    const arabicData = JSON.parse(fs.readFileSync(arabicPath, 'utf-8'));
    const turkishData = JSON.parse(fs.readFileSync(turkishPath, 'utf-8'));

    if (arabicData.code !== 200 || turkishData.code !== 200) {
        throw new Error('Invalid JSON data format (API code not 200)');
    }

    console.log('Merging generic data...');

    const surahs = arabicData.data.surahs.map((surah, surahIndex) => {
        const turkishSurah = turkishData.data.surahs[surahIndex];

        return {
            id: surah.number,
            name_arabic: surah.name,
            name_turkish: turkishSurah.englishName, // Using englishName for tr.diyanet usually gives Turkish transliteration
            verse_count: surah.ayahs.length,
            ayahs: surah.ayahs.map((ayah, ayahIndex) => {
                const turkishAyah = turkishSurah.ayahs[ayahIndex];
                return {
                    id: ayah.number,
                    surah_id: surah.number,
                    ayah_number: ayah.numberInSurah,
                    text_arabic: ayah.text,
                    text_meal: turkishAyah.text
                };
            })
        };
    });

    fs.writeFileSync(outputPath, JSON.stringify(surahs, null, 2));
    console.log(`Success! Full Quran data generated at: ${outputPath}`);

} catch (error) {
    console.error('An error occurred:', error);
}
