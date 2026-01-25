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

// Available Mushaf editions
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
    {
        id: 'madina',
        name: 'Medine Mushafı',
        nameArabic: 'مصحف المدينة المنورة',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        flag: '🇸🇦',
        description: 'Kral Fahd Kur\'an Basım Kompleksi - Medine-i Münevvere',
        pageCount: 604,
        baseUrl: 'https://cdn.islamic.network/quran/images/mushaf-madinah',
        filePattern: 'page{page}.png',
        coverOffset: 0,
        isLocal: false,
    },
    {
        id: 'indopak',
        name: 'Indo-Pak Mushafı',
        nameArabic: 'مصحف باكستاني',
        country: 'Pakistan',
        countryCode: 'PK',
        flag: '🇵🇰',
        description: 'Güney Asya\'da yaygın olarak kullanılan Nastaliq yazı stili',
        pageCount: 604,
        baseUrl: 'https://cdn.islamic.network/quran/images/mushaf-indopak',
        filePattern: 'page{page}.png',
        coverOffset: 0,
        isLocal: false,
    },
    {
        id: 'tajweed',
        name: 'Tecvidli Mushaf',
        nameArabic: 'مصحف التجويد',
        country: 'Suriye',
        countryCode: 'SY',
        flag: '🇸🇾',
        description: 'Renkli tecvid kuralları işaretli Mushaf - Dar al-Maarifa',
        pageCount: 604,
        baseUrl: 'https://cdn.islamic.network/quran/images/mushaf-tajweed',
        filePattern: 'page{page}.png',
        coverOffset: 0,
        isLocal: false,
    },
    {
        id: 'warsh',
        name: 'Verş Kıraati',
        nameArabic: 'مصحف ورش',
        country: 'Fas / Kuzey Afrika',
        countryCode: 'MA',
        flag: '🇲🇦',
        description: 'Kuzey ve Batı Afrika\'da yaygın Verş kıraati',
        pageCount: 604,
        baseUrl: 'https://cdn.islamic.network/quran/images/mushaf-warsh',
        filePattern: 'page{page}.png',
        coverOffset: 0,
        isLocal: false,
    },
    {
        id: 'qaloon',
        name: 'Kalun Kıraati',
        nameArabic: 'مصحف قالون',
        country: 'Libya / Tunus',
        countryCode: 'LY',
        flag: '🇱🇾',
        description: 'Libya ve Tunus\'ta yaygın Kalun kıraati',
        pageCount: 604,
        baseUrl: 'https://cdn.islamic.network/quran/images/mushaf-qaloon',
        filePattern: 'page{page}.png',
        coverOffset: 0,
        isLocal: false,
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

    if (edition.isLocal) {
        return `${edition.baseUrl}/${fileName}`;
    }

    return `${edition.baseUrl}/${fileName}`;
}

/**
 * Get all available Mushaf editions grouped by region
 */
export function getMushafEditionsByRegion(): Record<string, MushafEdition[]> {
    return {
        'Türkiye': MUSHAF_EDITIONS.filter(e => e.countryCode === 'TR'),
        'Ortadoğu': MUSHAF_EDITIONS.filter(e => ['SA', 'SY'].includes(e.countryCode)),
        'Kuzey Afrika': MUSHAF_EDITIONS.filter(e => ['MA', 'LY'].includes(e.countryCode)),
        'Güney Asya': MUSHAF_EDITIONS.filter(e => e.countryCode === 'PK'),
    };
}
