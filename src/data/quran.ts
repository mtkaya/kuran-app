import { Surah } from '../types';
import { LanguageCode } from '../context/LanguageContext';

interface RawApiData {
    code: number;
    data: {
        surahs: {
            number: number;
            name: string;
            englishName: string;
            ayahs: {
                number: number;
                numberInSurah: number;
                text: string;
                page: number;
            }[];
        }[];
    };
}

// Cache for loaded language data
const dataCache: Partial<Record<LanguageCode, RawApiData>> = {};

// Dynamic import function
async function loadLanguageData(lang: LanguageCode): Promise<RawApiData> {
    if (dataCache[lang]) {
        return dataCache[lang]!;
    }

    let data: RawApiData;

    switch (lang) {
        case 'ar':
            data = (await import('./ar.json')).default as RawApiData;
            break;
        case 'tr':
            data = (await import('./tr.json')).default as RawApiData;
            break;
        case 'en':
            data = (await import('./en.json')).default as RawApiData;
            break;
        case 'de':
            data = (await import('./de.json')).default as RawApiData;
            break;
        case 'fr':
            data = (await import('./fr.json')).default as RawApiData;
            break;
        case 'zh':
            data = (await import('./zh.json')).default as RawApiData;
            break;
        case 'id':
            data = (await import('./id.json')).default as RawApiData;
            break;
        case 'ur':
            data = (await import('./ur.json')).default as RawApiData;
            break;
        case 'bn':
            data = (await import('./bn.json')).default as RawApiData;
            break;
        default:
            data = (await import('./tr.json')).default as RawApiData;
    }

    dataCache[lang] = data;
    return data;
}

// Turkish surah names for better UX
const turkishSurahNames: Record<number, string> = {
    1: "Fatiha", 2: "Bakara", 3: "Âl-i İmrân", 4: "Nisâ", 5: "Mâide",
    6: "En'âm", 7: "A'râf", 8: "Enfâl", 9: "Tevbe", 10: "Yûnus",
    11: "Hûd", 12: "Yûsuf", 13: "Ra'd", 14: "İbrâhîm", 15: "Hicr",
    16: "Nahl", 17: "İsrâ", 18: "Kehf", 19: "Meryem", 20: "Tâhâ",
    21: "Enbiyâ", 22: "Hac", 23: "Mü'minûn", 24: "Nûr", 25: "Furkân",
    26: "Şuarâ", 27: "Neml", 28: "Kasas", 29: "Ankebût", 30: "Rûm",
    31: "Lokmân", 32: "Secde", 33: "Ahzâb", 34: "Sebe", 35: "Fâtır",
    36: "Yâsîn", 37: "Sâffât", 38: "Sâd", 39: "Zümer", 40: "Mü'min",
    41: "Fussilet", 42: "Şûrâ", 43: "Zuhruf", 44: "Duhân", 45: "Câsiye",
    46: "Ahkâf", 47: "Muhammed", 48: "Fetih", 49: "Hucurât", 50: "Kâf",
    51: "Zâriyât", 52: "Tûr", 53: "Necm", 54: "Kamer", 55: "Rahmân",
    56: "Vâkıa", 57: "Hadîd", 58: "Mücâdele", 59: "Haşr", 60: "Mümtehine",
    61: "Saf", 62: "Cum'a", 63: "Münâfikûn", 64: "Teğâbün", 65: "Talâk",
    66: "Tahrîm", 67: "Mülk", 68: "Kalem", 69: "Hâkka", 70: "Meâric",
    71: "Nûh", 72: "Cin", 73: "Müzzemmil", 74: "Müddessir", 75: "Kıyâme",
    76: "İnsân", 77: "Mürselât", 78: "Nebe", 79: "Nâziât", 80: "Abese",
    81: "Tekvîr", 82: "İnfitâr", 83: "Mutaffifîn", 84: "İnşikâk", 85: "Bürûc",
    86: "Târık", 87: "A'lâ", 88: "Ğâşiye", 89: "Fecr", 90: "Beled",
    91: "Şems", 92: "Leyl", 93: "Duhâ", 94: "İnşirâh", 95: "Tîn",
    96: "Alak", 97: "Kadr", 98: "Beyyine", 99: "Zilzâl", 100: "Âdiyât",
    101: "Kâria", 102: "Tekâsür", 103: "Asr", 104: "Hümeze", 105: "Fîl",
    106: "Kureyş", 107: "Mâûn", 108: "Kevser", 109: "Kâfirûn", 110: "Nasr",
    111: "Tebbet", 112: "İhlâs", 113: "Felak", 114: "Nâs"
};

// Cached processed Quran data per language
const quranDataCache: Partial<Record<LanguageCode, Surah[]>> = {};

// Async version - use this for new code
export async function getQuranDataAsync(lang: LanguageCode): Promise<Surah[]> {
    if (quranDataCache[lang]) {
        return quranDataCache[lang]!;
    }

    const [arabicRaw, translationRaw] = await Promise.all([
        loadLanguageData('ar'),
        lang === 'ar' ? loadLanguageData('ar') : loadLanguageData(lang)
    ]);

    const result = arabicRaw.data.surahs.map((surah, surahIndex) => {
        const translationSurah = translationRaw.data.surahs[surahIndex];

        return {
            id: surah.number,
            name_arabic: surah.name,
            name_turkish: turkishSurahNames[surah.number] || surah.englishName,
            verse_count: surah.ayahs.length,
            ayahs: surah.ayahs.map((ayah, ayahIndex) => {
                const translationAyah = translationSurah.ayahs[ayahIndex];
                return {
                    id: ayah.number,
                    surah_id: surah.number,
                    ayah_number: ayah.numberInSurah,
                    text_arabic: ayah.text,
                    text_meal: lang === 'ar' ? ayah.text : translationAyah.text,
                    page: ayah.page,
                };
            }),
        };
    });

    quranDataCache[lang] = result;
    return result;
}

// Sync version - for backward compatibility (loads from cache only)
export function getQuranData(lang: LanguageCode): Surah[] {
    if (quranDataCache[lang]) {
        return quranDataCache[lang]!;
    }
    // Return empty array if not loaded yet - caller should use async version
    return [];
}

// Preload a specific language
export async function preloadLanguage(lang: LanguageCode): Promise<void> {
    await getQuranDataAsync(lang);
}

// Clear cache to free memory (e.g., when switching languages)
export function clearLanguageCache(exceptLang?: LanguageCode): void {
    for (const key of Object.keys(quranDataCache) as LanguageCode[]) {
        if (key !== exceptLang && key !== 'ar') {
            delete quranDataCache[key];
            delete dataCache[key];
        }
    }
}

// Default export for backward compatibility - empty initially
export const quranData: Surah[] = [];
