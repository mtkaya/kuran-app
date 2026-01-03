// Reciter Provider - Audio URL generation and reciter manifest
// Using Al Quran Cloud CDN: https://cdn.islamic.network/quran/audio/

export interface Reciter {
    id: string;
    name: string;
    arabicName: string;
    identifier: string;
    style?: string;
}

export const RECITERS: Reciter[] = [
    {
        id: 'alafasy',
        name: 'Mishary Al-Afasy',
        arabicName: 'مشاري العفاسي',
        identifier: 'ar.alafasy',
        style: 'Murattal',
    },
    {
        id: 'abdulbasit-murattal',
        name: 'Abdul Basit (Murattal)',
        arabicName: 'عبد الباسط عبد الصمد',
        identifier: 'ar.abdulbasitmurattal',
        style: 'Murattal',
    },
    {
        id: 'husary',
        name: 'Mahmoud Khalil Al-Husary',
        arabicName: 'محمود خليل الحصري',
        identifier: 'ar.husary',
        style: 'Murattal',
    },
    {
        id: 'shatri',
        name: 'Abu Bakr Al-Shatri',
        arabicName: 'أبو بكر الشاطري',
        identifier: 'ar.shatri',
        style: 'Murattal',
    },
    {
        id: 'mahermuaiqly',
        name: 'Maher Al-Muaiqly',
        arabicName: 'ماهر المعيقلي',
        identifier: 'ar.mahermuaiqly',
        style: 'Murattal',
    },
    {
        id: 'minshawi-murattal',
        name: 'Mohamed Siddiq Al-Minshawi',
        arabicName: 'محمد صديق المنشاوي',
        identifier: 'ar.minshawi',
        style: 'Murattal',
    },
];

const CDN_BASE = 'https://cdn.islamic.network/quran/audio';
const BITRATE = '128'; // Options: 64, 128, 192

/**
 * Get audio URL for a specific ayah
 * @param reciterId - Reciter identifier (e.g., 'ar.alafasy')
 * @param surahNumber - Surah number (1-114)
 * @param ayahNumber - Ayah number within the surah
 * @returns Audio URL string
 */
export function getAudioUrl(
    reciterId: string,
    surahNumber: number,
    ayahNumber: number
): string {
    // Format: 001001 (surah 3 digits + ayah 3 digits)
    const surahPadded = String(surahNumber).padStart(3, '0');
    const ayahPadded = String(ayahNumber).padStart(3, '0');

    return `${CDN_BASE}/${BITRATE}/${reciterId}/${surahPadded}${ayahPadded}.mp3`;
}

/**
 * Get reciter by ID
 */
export function getReciterById(id: string): Reciter | undefined {
    return RECITERS.find(r => r.id === id);
}

/**
 * Get reciter by identifier
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
