import { LanguageCode } from '../context/LanguageContext';

interface UIStrings {
    appTitle: string;
    appSubtitle: string;
    searchPlaceholder: string;
    verses: string;
    notFound: string;
    surahNotFound: string;
    // Milestone 1 strings
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
    // Milestone 2 strings - Audio
    play: string;
    pause: string;
    nextAyah: string;
    prevAyah: string;
    playbackSpeed: string;
    repeatNone: string;
    repeatAyah: string;
    repeatSurah: string;
    reciter: string;
    selectReciter: string;
    playAyah: string;
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
        play: 'Oynat',
        pause: 'Duraklat',
        nextAyah: 'Sonraki Ayet',
        prevAyah: 'Önceki Ayet',
        playbackSpeed: 'Oynatma Hızı',
        repeatNone: 'Tekrar Yok',
        repeatAyah: 'Ayet Tekrar',
        repeatSurah: 'Sure Tekrar',
        reciter: 'Kâri',
        selectReciter: 'Kâri Seç',
        playAyah: 'Ayeti Dinle',
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
        play: 'Play',
        pause: 'Pause',
        nextAyah: 'Next Verse',
        prevAyah: 'Previous Verse',
        playbackSpeed: 'Playback Speed',
        repeatNone: 'No Repeat',
        repeatAyah: 'Repeat Verse',
        repeatSurah: 'Repeat Surah',
        reciter: 'Reciter',
        selectReciter: 'Select Reciter',
        playAyah: 'Play Verse',
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
        play: 'Abspielen',
        pause: 'Pause',
        nextAyah: 'Nächster Vers',
        prevAyah: 'Vorheriger Vers',
        playbackSpeed: 'Wiedergabegeschwindigkeit',
        repeatNone: 'Keine Wiederholung',
        repeatAyah: 'Vers wiederholen',
        repeatSurah: 'Sure wiederholen',
        reciter: 'Rezitator',
        selectReciter: 'Rezitator auswählen',
        playAyah: 'Vers abspielen',
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
        play: 'Lecture',
        pause: 'Pause',
        nextAyah: 'Verset suivant',
        prevAyah: 'Verset précédent',
        playbackSpeed: 'Vitesse de lecture',
        repeatNone: 'Pas de répétition',
        repeatAyah: 'Répéter le verset',
        repeatSurah: 'Répéter la sourate',
        reciter: 'Récitateur',
        selectReciter: 'Choisir un récitateur',
        playAyah: 'Écouter le verset',
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
        play: '播放',
        pause: '暂停',
        nextAyah: '下一节',
        prevAyah: '上一节',
        playbackSpeed: '播放速度',
        repeatNone: '不重复',
        repeatAyah: '重复节',
        repeatSurah: '重复章',
        reciter: '诵读者',
        selectReciter: '选择诵读者',
        playAyah: '播放经文',
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
        play: 'تشغيل',
        pause: 'إيقاف مؤقت',
        nextAyah: 'الآية التالية',
        prevAyah: 'الآية السابقة',
        playbackSpeed: 'سرعة التشغيل',
        repeatNone: 'بدون تكرار',
        repeatAyah: 'تكرار الآية',
        repeatSurah: 'تكرار السورة',
        reciter: 'القارئ',
        selectReciter: 'اختر القارئ',
        playAyah: 'استمع للآية',
    },
};

export function getUIStrings(lang: LanguageCode): UIStrings {
    return translations[lang];
}
