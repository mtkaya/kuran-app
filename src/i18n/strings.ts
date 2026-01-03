import { LanguageCode } from '../context/LanguageContext';

interface UIStrings {
    appTitle: string;
    appSubtitle: string;
    searchPlaceholder: string;
    verses: string;
    notFound: string;
    surahNotFound: string;
    // New strings for Milestone 1
    settings: string;
    theme: string;
    lightMode: string;
    darkMode: string;
    systemMode: string;
    arabicFontSize: string;
    mealFontSize: string;
    bookmarks: string;
    addBookmark: string;
    removeBookmark: string;
    continueReading: string;
    copied: string;
    copyVerse: string;
}

const translations: Record<LanguageCode, UIStrings> = {
    tr: {
        appTitle: 'Kuran App',
        appSubtitle: 'İndeksli Kuran Meali',
        searchPlaceholder: 'Sure ara...',
        verses: 'Ayet',
        notFound: 'Sonuç bulunamadı.',
        surahNotFound: 'Sure bulunamadı.',
        settings: 'Ayarlar',
        theme: 'Tema',
        lightMode: 'Açık',
        darkMode: 'Koyu',
        systemMode: 'Sistem',
        arabicFontSize: 'Arapça Yazı Boyutu',
        mealFontSize: 'Meal Yazı Boyutu',
        bookmarks: 'Yer İmleri',
        addBookmark: 'Yer İmi Ekle',
        removeBookmark: 'Yer İmini Kaldır',
        continueReading: 'Kaldığın Yerden Devam Et',
        copied: 'Kopyalandı!',
        copyVerse: 'Ayeti Kopyala',
    },
    en: {
        appTitle: 'Quran App',
        appSubtitle: 'Indexed Quran Translation',
        searchPlaceholder: 'Search surah...',
        verses: 'Verses',
        notFound: 'No results found.',
        surahNotFound: 'Surah not found.',
        settings: 'Settings',
        theme: 'Theme',
        lightMode: 'Light',
        darkMode: 'Dark',
        systemMode: 'System',
        arabicFontSize: 'Arabic Font Size',
        mealFontSize: 'Translation Font Size',
        bookmarks: 'Bookmarks',
        addBookmark: 'Add Bookmark',
        removeBookmark: 'Remove Bookmark',
        continueReading: 'Continue Reading',
        copied: 'Copied!',
        copyVerse: 'Copy Verse',
    },
    de: {
        appTitle: 'Koran App',
        appSubtitle: 'Indizierte Koran-Übersetzung',
        searchPlaceholder: 'Sure suchen...',
        verses: 'Verse',
        notFound: 'Keine Ergebnisse gefunden.',
        surahNotFound: 'Sure nicht gefunden.',
        settings: 'Einstellungen',
        theme: 'Thema',
        lightMode: 'Hell',
        darkMode: 'Dunkel',
        systemMode: 'System',
        arabicFontSize: 'Arabische Schriftgröße',
        mealFontSize: 'Übersetzungs-Schriftgröße',
        bookmarks: 'Lesezeichen',
        addBookmark: 'Lesezeichen hinzufügen',
        removeBookmark: 'Lesezeichen entfernen',
        continueReading: 'Weiterlesen',
        copied: 'Kopiert!',
        copyVerse: 'Vers kopieren',
    },
    fr: {
        appTitle: 'Coran App',
        appSubtitle: 'Traduction du Coran indexée',
        searchPlaceholder: 'Rechercher une sourate...',
        verses: 'Versets',
        notFound: 'Aucun résultat trouvé.',
        surahNotFound: 'Sourate non trouvée.',
        settings: 'Paramètres',
        theme: 'Thème',
        lightMode: 'Clair',
        darkMode: 'Sombre',
        systemMode: 'Système',
        arabicFontSize: 'Taille police arabe',
        mealFontSize: 'Taille police traduction',
        bookmarks: 'Signets',
        addBookmark: 'Ajouter un signet',
        removeBookmark: 'Supprimer le signet',
        continueReading: 'Continuer la lecture',
        copied: 'Copié!',
        copyVerse: 'Copier le verset',
    },
    zh: {
        appTitle: '古兰经应用',
        appSubtitle: '索引古兰经翻译',
        searchPlaceholder: '搜索章节...',
        verses: '节',
        notFound: '未找到结果。',
        surahNotFound: '未找到章节。',
        settings: '设置',
        theme: '主题',
        lightMode: '浅色',
        darkMode: '深色',
        systemMode: '系统',
        arabicFontSize: '阿拉伯语字体大小',
        mealFontSize: '翻译字体大小',
        bookmarks: '书签',
        addBookmark: '添加书签',
        removeBookmark: '移除书签',
        continueReading: '继续阅读',
        copied: '已复制！',
        copyVerse: '复制经文',
    },
    ar: {
        appTitle: 'تطبيق القرآن',
        appSubtitle: 'ترجمة القرآن المفهرسة',
        searchPlaceholder: 'بحث عن سورة...',
        verses: 'آية',
        notFound: 'لم يتم العثور على نتائج.',
        surahNotFound: 'لم يتم العثور على السورة.',
        settings: 'الإعدادات',
        theme: 'السمة',
        lightMode: 'فاتح',
        darkMode: 'داكن',
        systemMode: 'النظام',
        arabicFontSize: 'حجم الخط العربي',
        mealFontSize: 'حجم خط الترجمة',
        bookmarks: 'الإشارات المرجعية',
        addBookmark: 'إضافة إشارة',
        removeBookmark: 'إزالة الإشارة',
        continueReading: 'متابعة القراءة',
        copied: 'تم النسخ!',
        copyVerse: 'نسخ الآية',
    },
};

export function getUIStrings(lang: LanguageCode): UIStrings {
    return translations[lang];
}
