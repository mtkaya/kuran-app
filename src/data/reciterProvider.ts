// Reciter Provider - Audio URL generation and reciter manifest
// Using EveryAyah.com CDN (CORS-friendly)

export interface Reciter {
    id: string;
    name: string;
    arabicName: string;
    identifier: string; // EveryAyah folder name
    style?: string;
}

// EveryAyah.com reciters - these have CORS enabled
export const RECITERS: Reciter[] = [
    {
        id: 'alafasy',
        name: 'Mishary Al-Afasy',
        arabicName: 'مشاري العفاسي',
        identifier: 'Alafasy_128kbps',
        style: 'Murattal',
    },
    {
        id: 'abdulbasit-murattal',
        name: 'Abdul Basit (Murattal)',
        arabicName: 'عبد الباسط عبد الصمد',
        identifier: 'Abdul_Basit_Murattal_192kbps',
        style: 'Murattal',
    },
    {
        id: 'husary',
        name: 'Mahmoud Khalil Al-Husary',
        arabicName: 'محمود خليل الحصري',
        identifier: 'Husary_128kbps',
        style: 'Murattal',
    },
    {
        id: 'sudais',
        name: 'Abdur-Rahman As-Sudais',
        arabicName: 'عبدالرحمن السديس',
        identifier: 'Abdurrahmaan_As-Sudais_192kbps',
        style: 'Murattal',
    },
    {
        id: 'minshawi',
        name: 'Mohamed Siddiq Al-Minshawi',
        arabicName: 'محمد صديق المنشاوي',
        identifier: 'Minshawy_Murattal_128kbps',
        style: 'Murattal',
    },
    {
        id: 'ghamadi',
        name: 'Saad Al-Ghamdi',
        arabicName: 'سعد الغامدي',
        identifier: 'Ghamadi_40kbps',
        style: 'Murattal',
    },
];

const CDN_BASE = 'https://everyayah.com/data';

/**
 * Get audio URL for a specific ayah
 * @param reciterFolder - Reciter folder name on EveryAyah
 * @param surahNumber - Surah number (1-114)
 * @param ayahNumber - Ayah number within the surah
 * @returns Audio URL string
 * 
 * Format: https://everyayah.com/data/[reciter]/SSSAAA.mp3
 */
export function getAudioUrl(
    reciterFolder: string,
    surahNumber: number,
    ayahNumber: number
): string {
    // Format: 001001 (surah 3 digits + ayah 3 digits)
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
