// Reciter Provider - Audio URL generation and reciter manifest
// Using EveryAyah.com CDN (CORS-friendly)

export interface Reciter {
    id: string;
    name: string;
    nameLocal: string;  // Türkçe/local isim
    arabicName: string;
    identifier: string; // EveryAyah folder name
    style: 'Murattal' | 'Mujawwad' | 'Muallim';
    country?: string;
    qiraat?: 'Hafs' | 'Warsh' | 'Qalun';
    audioType?: 'arabic' | 'translation';
    audioLanguage?: string;
}

// EveryAyah.com reciters - organized by popularity
export const RECITERS: Reciter[] = [
    // ⭐ En Popüler Kariler (Hafs)
    {
        id: 'alafasy',
        name: 'Mishary Al-Afasy',
        nameLocal: 'Mişari Raşid el-Afasi',
        arabicName: 'مشاري العفاسي',
        identifier: 'Alafasy_128kbps',
        style: 'Murattal',
        country: '🇰🇼',
        qiraat: 'Hafs',
    },
    {
        id: 'abdulbasit-murattal',
        name: 'Abdul Basit (Murattal)',
        nameLocal: 'Abdulbasit Abdussamed',
        arabicName: 'عبد الباسط عبد الصمد',
        identifier: 'Abdul_Basit_Murattal_192kbps',
        style: 'Murattal',
        country: '🇪🇬',
        qiraat: 'Hafs',
    },
    {
        id: 'abdulbasit-mujawwad',
        name: 'Abdul Basit (Mujawwad)',
        nameLocal: 'Abdulbasit Abdussamed (Tecvidli)',
        arabicName: 'عبد الباسط عبد الصمد',
        identifier: 'Abdul_Basit_Mujawwad_128kbps',
        style: 'Mujawwad',
        country: '🇪🇬',
        qiraat: 'Hafs',
    },
    {
        id: 'sudais',
        name: 'Abdur-Rahman As-Sudais',
        nameLocal: 'Abdurrahman es-Sudeys',
        arabicName: 'عبدالرحمن السديس',
        identifier: 'Abdurrahmaan_As-Sudais_192kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Hafs',
    },
    {
        id: 'shuraym',
        name: 'Saud Ash-Shuraym',
        nameLocal: 'Suud eş-Şureym',
        arabicName: 'سعود الشريم',
        identifier: 'Saood_ash-Shuraym_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Hafs',
    },
    // 🎙️ Klasik Ustalar
    {
        id: 'husary',
        name: 'Mahmoud Khalil Al-Husary',
        nameLocal: 'Mahmud Halil el-Husari',
        arabicName: 'محمود خليل الحصري',
        identifier: 'Husary_128kbps',
        style: 'Murattal',
        country: '🇪🇬',
        qiraat: 'Hafs',
    },
    {
        id: 'husary-muallim',
        name: 'Al-Husary (Muallim)',
        nameLocal: 'El-Husari (Öğretici)',
        arabicName: 'محمود خليل الحصري',
        identifier: 'Husary_Muallim_128kbps',
        style: 'Muallim',
        country: '🇪🇬',
        qiraat: 'Hafs',
    },
    {
        id: 'minshawi-murattal',
        name: 'Al-Minshawi (Murattal)',
        nameLocal: 'Muhammed Sıddık el-Minşavi',
        arabicName: 'محمد صديق المنشاوي',
        identifier: 'Minshawy_Murattal_128kbps',
        style: 'Murattal',
        country: '🇪🇬',
        qiraat: 'Hafs',
    },
    {
        id: 'minshawi-mujawwad',
        name: 'Al-Minshawi (Mujawwad)',
        nameLocal: 'El-Minşavi (Tecvidli)',
        arabicName: 'محمد صديق المنشاوي',
        identifier: 'Minshawy_Mujawwad_192kbps',
        style: 'Mujawwad',
        country: '🇪🇬',
        qiraat: 'Hafs',
    },
    // 🕌 Harem İmamları
    {
        id: 'maher-muaiqly',
        name: 'Maher Al-Muaiqly',
        nameLocal: 'Mahir el-Muaykıli',
        arabicName: 'ماهر المعيقلي',
        identifier: 'MaherAlMuaiqly128kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Hafs',
    },
    {
        id: 'shatri',
        name: 'Abu Bakr Ash-Shatri',
        nameLocal: 'Ebu Bekir eş-Şatri',
        arabicName: 'أبو بكر الشاطري',
        identifier: 'Abu_Bakr_Ash-Shaatree_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Hafs',
    },
    {
        id: 'ghamadi',
        name: 'Saad Al-Ghamdi',
        nameLocal: 'Saad el-Gamidi',
        arabicName: 'سعد الغامدي',
        identifier: 'Ghamadi_40kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Hafs',
    },
    // 🌟 Diğer Popüler Kariler
    {
        id: 'hudhaify',
        name: 'Ali Al-Hudhaify',
        nameLocal: 'Ali el-Huzeyfi',
        arabicName: 'علي الحذيفي',
        identifier: 'Hudhaify_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Hafs',
    },
    {
        id: 'ayyoub',
        name: 'Muhammad Ayyub',
        nameLocal: 'Muhammed Eyyub',
        arabicName: 'محمد أيوب',
        identifier: 'Muhammad_Ayyoub_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Hafs',
    },
    {
        id: 'basfar',
        name: 'Abdullah Basfar',
        nameLocal: 'Abdullah Basfar',
        arabicName: 'عبد الله بصفر',
        identifier: 'Abdullah_Basfar_192kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Hafs',
    },
    {
        id: 'dussary',
        name: 'Yasser Ad-Dussary',
        nameLocal: 'Yasir ed-Devserî',
        arabicName: 'ياسر الدوسري',
        identifier: 'Yasser_Ad-Dussary_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Hafs',
    },
    {
        id: 'qatami',
        name: 'Nasser Al-Qatami',
        nameLocal: 'Nasır el-Katami',
        arabicName: 'ناصر القطامي',
        identifier: 'Nasser_Alqatami_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Hafs',
    },
    {
        id: 'budair',
        name: 'Salah Al-Budair',
        nameLocal: 'Salih el-Budeyr',
        arabicName: 'صالح البدير',
        identifier: 'Salah_Al_Budair_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Hafs',
    },
    // 📜 Warsh Kıraati
    {
        id: 'abdulbasit-warsh',
        name: 'Abdul Basit (Warsh)',
        nameLocal: 'Abdulbasit Abdussamed (Verş)',
        arabicName: 'عبد الباسط عبد الصمد',
        identifier: 'warsh/warsh_Abdul_Basit_128kbps',
        style: 'Murattal',
        country: '🇪🇬',
        qiraat: 'Warsh',
    },
    {
        id: 'dosary-warsh',
        name: 'Ibrahim Al-Dosary (Warsh)',
        nameLocal: 'İbrahim ed-Devseri (Verş)',
        arabicName: 'إبراهيم الدوسري',
        identifier: 'warsh/warsh_ibrahim_aldosary_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
        qiraat: 'Warsh',
    },
    {
        id: 'jazaery-warsh',
        name: 'Yassin Al-Jazaery (Warsh)',
        nameLocal: 'Yasin el-Cezayirî (Verş)',
        arabicName: 'ياسين الجزائري',
        identifier: 'warsh/warsh_yassin_al_jazaery_64kbps',
        style: 'Murattal',
        country: '🇩🇿',
        qiraat: 'Warsh',
    },
    // 🌍 Çeviri Sesleri (Translation Audio)
    {
        id: 'ibrahim-walk-en',
        name: 'Ibrahim Walk (English)',
        nameLocal: 'İngilizce Meal Sesi',
        arabicName: '',
        identifier: 'English/Sahih_Intnl_Ibrahim_Walk_192kbps',
        style: 'Murattal',
        country: '🇬🇧',
        qiraat: 'Hafs',
        audioType: 'translation',
        audioLanguage: 'en',
    },
];

const CDN_BASE = 'https://everyayah.com/data';

// Allowed reciter identifiers whitelist for security
const ALLOWED_RECITER_FOLDERS = new Set(RECITERS.map(r => r.identifier));

/**
 * Get audio URL for a specific ayah
 */
export function getAudioUrl(
    reciterFolder: string,
    surahNumber: number,
    ayahNumber: number
): string {
    // Validate reciterFolder against whitelist to prevent path traversal
    if (!ALLOWED_RECITER_FOLDERS.has(reciterFolder)) {
        console.warn(`Invalid reciter folder: ${reciterFolder}, using default`);
        reciterFolder = getDefaultReciter().identifier;
    }

    const surahPadded = String(surahNumber).padStart(3, '0');
    const ayahPadded = String(ayahNumber).padStart(3, '0');
    return `${CDN_BASE}/${reciterFolder}/${surahPadded}${ayahPadded}.mp3`;
}

/**
 * Get reciter by ID
 */
export function getReciterById(id: string): Reciter | undefined {
    return RECITERS.find(r => r.id === id);
}

/**
 * Get reciter by identifier (folder name)
 */
export function getReciterByIdentifier(identifier: string): Reciter | undefined {
    return RECITERS.find(r => r.identifier === identifier);
}

/**
 * Get default reciter
 */
export function getDefaultReciter(): Reciter {
    return RECITERS[0]; // Mishary Al-Afasy
}

/**
 * Get reciters by style
 */
export function getRecitersByStyle(style: Reciter['style']): Reciter[] {
    return RECITERS.filter(r => r.style === style);
}

/**
 * Get reciters by qiraat
 */
export function getRecitersByQiraat(qiraat: 'Hafs' | 'Warsh' | 'Qalun'): Reciter[] {
    return RECITERS.filter(r => r.qiraat === qiraat);
}

/**
 * Get reciters by audio type
 */
export function getRecitersByAudioType(audioType: 'arabic' | 'translation'): Reciter[] {
    if (audioType === 'arabic') {
        return RECITERS.filter(r => !r.audioType || r.audioType === 'arabic');
    }
    return RECITERS.filter(r => r.audioType === audioType);
}

/**
 * Get Arabic reciters only (default behavior)
 */
export function getArabicReciters(): Reciter[] {
    return RECITERS.filter(r => !r.audioType || r.audioType === 'arabic');
}

/**
 * Get translation audio reciters
 */
export function getTranslationReciters(): Reciter[] {
    return RECITERS.filter(r => r.audioType === 'translation');
}
