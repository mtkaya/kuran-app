import { LanguageCode } from '../context/LanguageContext';

interface UIStrings {
    appTitle: string;
    appSubtitle: string;
    searchPlaceholder: string;
    verses: string;
    notFound: string;
    surahNotFound: string;
}

const translations: Record<LanguageCode, UIStrings> = {
    tr: {
        appTitle: 'Kuran App',
        appSubtitle: 'İndeksli Kuran Meali',
        searchPlaceholder: 'Sure ara...',
        verses: 'Ayet',
        notFound: 'Sonuç bulunamadı.',
        surahNotFound: 'Sure bulunamadı.',
    },
    en: {
        appTitle: 'Quran App',
        appSubtitle: 'Indexed Quran Translation',
        searchPlaceholder: 'Search surah...',
        verses: 'Verses',
        notFound: 'No results found.',
        surahNotFound: 'Surah not found.',
    },
    de: {
        appTitle: 'Koran App',
        appSubtitle: 'Indizierte Koran-Übersetzung',
        searchPlaceholder: 'Sure suchen...',
        verses: 'Verse',
        notFound: 'Keine Ergebnisse gefunden.',
        surahNotFound: 'Sure nicht gefunden.',
    },
    fr: {
        appTitle: 'Coran App',
        appSubtitle: 'Traduction du Coran indexée',
        searchPlaceholder: 'Rechercher une sourate...',
        verses: 'Versets',
        notFound: 'Aucun résultat trouvé.',
        surahNotFound: 'Sourate non trouvée.',
    },
    zh: {
        appTitle: '古兰经应用',
        appSubtitle: '索引古兰经翻译',
        searchPlaceholder: '搜索章节...',
        verses: '节',
        notFound: '未找到结果。',
        surahNotFound: '未找到章节。',
    },
    ar: {
        appTitle: 'تطبيق القرآن',
        appSubtitle: 'ترجمة القرآن المفهرسة',
        searchPlaceholder: 'بحث عن سورة...',
        verses: 'آية',
        notFound: 'لم يتم العثور على نتائج.',
        surahNotFound: 'لم يتم العثور على السورة.',
    },
};

export function getUIStrings(lang: LanguageCode): UIStrings {
    return translations[lang];
}
