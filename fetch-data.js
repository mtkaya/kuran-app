import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fetchQuranData() {
    console.log('Fetching Arabic text...');
    const arabicResponse = await fetch('http://api.alquran.cloud/v1/quran/quran-uthmani');
    const arabicData = await arabicResponse.json();

    console.log('Fetching Turkish translation...');
    const turkishResponse = await fetch('http://api.alquran.cloud/v1/quran/tr.diyanet');
    const turkishData = await turkishResponse.json();

    if (arabicData.code !== 200 || turkishData.code !== 200) {
        throw new Error('Failed to fetch data');
    }

    console.log('Merging data...');
    const surahs = arabicData.data.surahs.map((surah, surahIndex) => {
        const turkishSurah = turkishData.data.surahs[surahIndex];

        return {
            id: surah.number,
            name_arabic: surah.name,
            name_turkish: turkishSurah.englishName, // API returns transliterated name in englishName field for tr edition usually, or we use a mapping. Let's check.
            // Actually 'englishName' in Turkish edition might be the same. 
            // Let's rely on a predefined Turkish name list if needed, but for now use what matches.
            // Better: use the 'englishName' from the Arabic endpoint which is usually standard transliteration (Fatiha, Baqarah).
            // Or 'englishNameTranslation' which is the meaning.
            // Let's keep it simple: Use 'englishName' from Arabic response as the display name (e.g. Al-Fatiha).
            // And maybe 'name' from Arabic response is the Arabic script.
            verse_count: surah.ayahs.length,
            ayahs: surah.ayahs.map((ayah, ayahIndex) => {
                const turkishAyah = turkishSurah.ayahs[ayahIndex];
                return {
                    id: ayah.number, // Global ayah number
                    surah_id: surah.number,
                    ayah_number: ayah.numberInSurah,
                    text_arabic: ayah.text,
                    text_meal: turkishAyah.text
                };
            })
        };
    });

    // Turkish Surah Names Mapping (Optional, for better UX)
    // We can patch this later. For now 'Al-Fatiha' style is fine.

    const outputPath = path.join(__dirname, 'src', 'data', 'quran-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(surahs, null, 2));
    console.log(`Data written to ${outputPath}`);
}

fetchQuranData().catch(console.error);
