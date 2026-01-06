// Mushaf Page Data Provider
// Fetches and organizes Quran text by page and line from QuranFoundation API

export interface MushafWord {
    id: number;
    text: string;
    lineNumber: number;
    pageNumber: number;
    isEndMarker: boolean;
    verseKey: string;
}

export interface MushafLine {
    lineNumber: number;
    words: MushafWord[];
}

export interface MushafPageData {
    pageNumber: number;
    lines: MushafLine[];
    surahInfo?: { id: number; name: string }[];
}

// Cache for fetched pages
const pageCache = new Map<number, MushafPageData>();

/**
 * Fetch page data from QuranFoundation API and organize by lines
 * Falls back to local data if API fails
 */
export async function fetchMushafPage(pageNumber: number): Promise<MushafPageData> {
    // Check cache first
    if (pageCache.has(pageNumber)) {
        return pageCache.get(pageNumber)!;
    }

    try {
        const response = await fetch(
            `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=true&word_fields=text_uthmani,line_number`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch page ${pageNumber}`);
        }

        const data = await response.json();

        if (!data.verses || data.verses.length === 0) {
            throw new Error('No verses in response');
        }

        const pageData = organizeMushafPage(pageNumber, data.verses);

        // Cache the result
        pageCache.set(pageNumber, pageData);

        return pageData;
    } catch (error) {
        console.error('Error fetching Mushaf page from API:', error);
        console.log('Falling back to local data...');

        // Fallback: use local quran data
        return createFallbackPageData(pageNumber);
    }
}

/**
 * Create page data from local quran.ts when API fails
 */
async function createFallbackPageData(pageNumber: number): Promise<MushafPageData> {
    // Dynamic import to avoid circular dependency
    const { getQuranData } = await import('./quran');
    const quranData = getQuranData('tr');

    const pageAyahs: any[] = [];

    for (const surah of quranData) {
        const matchingAyahs = surah.ayahs.filter(a => a.page === pageNumber);
        for (const ayah of matchingAyahs) {
            pageAyahs.push({
                ...ayah,
                surahId: surah.id,
                surahName: surah.name_arabic,
            });
        }
    }

    // Convert to lines format (simple: one ayah per line)
    const lines: MushafLine[] = pageAyahs.map((ayah, index) => ({
        lineNumber: index + 1,
        words: [
            {
                id: ayah.id,
                text: ayah.text_arabic,
                lineNumber: index + 1,
                pageNumber: pageNumber,
                isEndMarker: false,
                verseKey: `${ayah.surahId}:${ayah.ayah_number}`,
            },
            {
                id: ayah.id * 1000,
                text: `۝${ayah.ayah_number}`,
                lineNumber: index + 1,
                pageNumber: pageNumber,
                isEndMarker: true,
                verseKey: `${ayah.surahId}:${ayah.ayah_number}`,
            },
        ],
    }));

    // Get unique surah IDs
    const surahIds = [...new Set(pageAyahs.map(a => a.surahId))];

    const pageData: MushafPageData = {
        pageNumber,
        lines,
        surahInfo: surahIds.map(id => {
            const surah = quranData.find(s => s.id === id);
            return { id, name: surah?.name_arabic || getSurahName(id) };
        }),
    };

    pageCache.set(pageNumber, pageData);
    return pageData;
}

/**
 * Organize API response into lines structure
 */
function organizeMushafPage(pageNumber: number, verses: any[]): MushafPageData {
    const linesMap = new Map<number, MushafWord[]>();
    const surahSet = new Set<number>();

    for (const verse of verses) {
        // Track which surahs are on this page
        const surahId = parseInt(verse.verse_key.split(':')[0]);
        surahSet.add(surahId);

        for (const word of verse.words) {
            const lineNumber = word.line_number;
            const mushafWord: MushafWord = {
                id: word.id,
                text: word.text_uthmani || word.text,
                lineNumber: lineNumber,
                pageNumber: pageNumber,
                isEndMarker: word.char_type_name === 'end',
                verseKey: verse.verse_key,
            };

            if (!linesMap.has(lineNumber)) {
                linesMap.set(lineNumber, []);
            }
            linesMap.get(lineNumber)!.push(mushafWord);
        }
    }

    // Convert map to sorted array of lines
    const lines: MushafLine[] = Array.from(linesMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([lineNumber, words]) => ({
            lineNumber,
            words,
        }));

    return {
        pageNumber,
        lines,
        surahInfo: Array.from(surahSet).map(id => ({ id, name: getSurahName(id) })),
    };
}

/**
 * Get Surah name by ID (simplified - can be expanded with full data)
 */
function getSurahName(surahId: number): string {
    const SURAH_NAMES: Record<number, string> = {
        1: 'الفاتحة',
        2: 'البقرة',
        3: 'آل عمران',
        4: 'النساء',
        5: 'المائدة',
        6: 'الأنعام',
        7: 'الأعراف',
        8: 'الأنفال',
        9: 'التوبة',
        10: 'يونس',
        // Add more as needed, or fetch from API
    };
    return SURAH_NAMES[surahId] || `سورة ${surahId}`;
}

// Preload adjacent pages for smoother navigation
export function preloadAdjacentPages(currentPage: number) {
    if (currentPage > 1) {
        fetchMushafPage(currentPage - 1).catch(() => { });
    }
    if (currentPage < 604) {
        fetchMushafPage(currentPage + 1).catch(() => { });
    }
}
