// Mushaf Provider - Different Quran editions from various countries
// Provides image URLs for different Mushaf styles

export interface MushafEdition {
    id: string;
    name: string;
    nameArabic: string;
    country: string;
    countryCode: string;
    flag: string;
    description: string;
    pageCount: number;
    baseUrl: string;
    filePattern: string;
    coverOffset: number;
    isLocal: boolean;
}

// Available Mushaf editions - Only local editions that work reliably
export const MUSHAF_EDITIONS: MushafEdition[] = [
    {
        id: 'diyanet',
        name: 'Diyanet Mushafı',
        nameArabic: 'مصحف الديانة التركية',
        country: 'Türkiye',
        countryCode: 'TR',
        flag: '🇹🇷',
        description: 'Türkiye Diyanet İşleri Başkanlığı Mushafı',
        pageCount: 604,
        baseUrl: '/mushaf/diyanet-webp',
        filePattern: 'page-{page}.webp',
        coverOffset: 0,
        isLocal: true,
    },
];

// Default Mushaf edition
export const DEFAULT_MUSHAF_ID = 'diyanet';

/**
 * Get a Mushaf edition by ID
 */
export function getMushafEdition(id: string): MushafEdition | undefined {
    return MUSHAF_EDITIONS.find(edition => edition.id === id);
}

/**
 * Get page image URL for a specific Mushaf edition
 */
export function getMushafPageUrl(editionId: string, page: number): string {
    const edition = getMushafEdition(editionId);
    if (!edition) {
        // Fallback to default (Diyanet)
        const paddedPage = page.toString().padStart(3, '0');
        return `/mushaf/diyanet-webp/page-${paddedPage}.webp`;
    }

    const actualPage = page + edition.coverOffset;
    const paddedPage = actualPage.toString().padStart(3, '0');

    // Replace {page} placeholder with actual page number
    const fileName = edition.filePattern.replace('{page}', paddedPage);

    return `${edition.baseUrl}/${fileName}`;
}
