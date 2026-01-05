import { Surah } from '../types';
import { LanguageCode } from '../context/LanguageContext';

// Import all language data
import arData from './ar.json';
import trData from './tr.json';
import enData from './en.json';
import deData from './de.json';
import frData from './fr.json';
import zhData from './zh.json';

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

const dataMap: Record<LanguageCode, RawApiData> = {
    ar: arData as RawApiData,
    tr: trData as RawApiData,
    en: enData as RawApiData,
    de: deData as RawApiData,
    fr: frData as RawApiData,
    zh: zhData as RawApiData,
};

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

export function getQuranData(lang: LanguageCode): Surah[] {
    const arabicRaw = dataMap.ar;
    const translationRaw = dataMap[lang];

    return arabicRaw.data.surahs.map((surah, surahIndex) => {
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
}

// Default export for backward compatibility
export const quranData: Surah[] = getQuranData('tr');
