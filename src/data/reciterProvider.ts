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
}

// EveryAyah.com reciters - organized by popularity
export const RECITERS: Reciter[] = [
    // ⭐ En Popüler Kariler
    {
        id: 'alafasy',
        name: 'Mishary Al-Afasy',
        nameLocal: 'Mişari Raşid el-Afasi',
        arabicName: 'مشاري العفاسي',
        identifier: 'Alafasy_128kbps',
        style: 'Murattal',
        country: '🇰🇼',
    },
    {
        id: 'abdulbasit-murattal',
        name: 'Abdul Basit (Murattal)',
        nameLocal: 'Abdulbasit Abdussamed',
        arabicName: 'عبد الباسط عبد الصمد',
        identifier: 'Abdul_Basit_Murattal_192kbps',
        style: 'Murattal',
        country: '🇪🇬',
    },
    {
        id: 'abdulbasit-mujawwad',
        name: 'Abdul Basit (Mujawwad)',
        nameLocal: 'Abdulbasit Abdussamed (Tecvidli)',
        arabicName: 'عبد الباسط عبد الصمد',
        identifier: 'Abdul_Basit_Mujawwad_128kbps',
        style: 'Mujawwad',
        country: '🇪🇬',
    },
    {
        id: 'sudais',
        name: 'Abdur-Rahman As-Sudais',
        nameLocal: 'Abdurrahman es-Sudeys',
        arabicName: 'عبدالرحمن السديس',
        identifier: 'Abdurrahmaan_As-Sudais_192kbps',
        style: 'Murattal',
        country: '🇸🇦',
    },
    {
        id: 'shuraym',
        name: 'Saud Ash-Shuraym',
        nameLocal: 'Suud eş-Şureym',
        arabicName: 'سعود الشريم',
        identifier: 'Saood_ash-Shuraym_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
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
    },
    {
        id: 'husary-muallim',
        name: 'Al-Husary (Muallim)',
        nameLocal: 'El-Husari (Öğretici)',
        arabicName: 'محمود خليل الحصري',
        identifier: 'Husary_Muallim_128kbps',
        style: 'Muallim',
        country: '🇪🇬',
    },
    {
        id: 'minshawi-murattal',
        name: 'Al-Minshawi (Murattal)',
        nameLocal: 'Muhammed Sıddık el-Minşavi',
        arabicName: 'محمد صديق المنشاوي',
        identifier: 'Minshawy_Murattal_128kbps',
        style: 'Murattal',
        country: '🇪🇬',
    },
    {
        id: 'minshawi-mujawwad',
        name: 'Al-Minshawi (Mujawwad)',
        nameLocal: 'El-Minşavi (Tecvidli)',
        arabicName: 'محمد صديق المنشاوي',
        identifier: 'Minshawy_Mujawwad_192kbps',
        style: 'Mujawwad',
        country: '🇪🇬',
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
    },
    {
        id: 'shatri',
        name: 'Abu Bakr Ash-Shatri',
        nameLocal: 'Ebu Bekir eş-Şatri',
        arabicName: 'أبو بكر الشاطري',
        identifier: 'Abu_Bakr_Ash-Shaatree_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
    },
    {
        id: 'ghamadi',
        name: 'Saad Al-Ghamdi',
        nameLocal: 'Saad el-Gamidi',
        arabicName: 'سعد الغامدي',
        identifier: 'Ghamadi_40kbps',
        style: 'Murattal',
        country: '🇸🇦',
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
    },
    {
        id: 'ayyoub',
        name: 'Muhammad Ayyub',
        nameLocal: 'Muhammed Eyyub',
        arabicName: 'محمد أيوب',
        identifier: 'Muhammad_Ayyoub_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
    },
    {
        id: 'basfar',
        name: 'Abdullah Basfar',
        nameLocal: 'Abdullah Basfar',
        arabicName: 'عبد الله بصفر',
        identifier: 'Abdullah_Basfar_192kbps',
        style: 'Murattal',
        country: '🇸🇦',
    },
    {
        id: 'dussary',
        name: 'Yasser Ad-Dussary',
        nameLocal: 'Yasir ed-Devserî',
        arabicName: 'ياسر الدوسري',
        identifier: 'Yasser_Ad-Dussary_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
    },
    {
        id: 'qatami',
        name: 'Nasser Al-Qatami',
        nameLocal: 'Nasır el-Katami',
        arabicName: 'ناصر القطامي',
        identifier: 'Nasser_Alqatami_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
    },
    {
        id: 'budair',
        name: 'Salah Al-Budair',
        nameLocal: 'Salih el-Budeyr',
        arabicName: 'صالح البدير',
        identifier: 'Salah_Al_Budair_128kbps',
        style: 'Murattal',
        country: '🇸🇦',
    },
];

const CDN_BASE = 'https://everyayah.com/data';

/**
 * Get audio URL for a specific ayah
 */
export function getAudioUrl(
    reciterFolder: string,
    surahNumber: number,
    ayahNumber: number
): string {
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
