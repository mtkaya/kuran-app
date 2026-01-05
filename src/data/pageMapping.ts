// Quran Page Mapping - 604 Madani Mushaf Pages
// Data format: Each page contains [surah, startAyah, endAyah] tuples
// This is a compact representation fetched from Al Quran Cloud API

export interface PageBoundary {
    page: number;
    surah: number;
    startAyah: number;
    endAyah: number;
}

// Page data: [page: [surah, startAyah, endAyah][]]
// Some pages span multiple surahs, so they have multiple entries
// This will be populated by fetching from API or using a pre-generated dataset

// For now, we'll use real-time API calls or a simplified approach
// where we calculate page from ayah index

// Pre-calculated page boundaries (first ayah of each page)
// Format: pageStartAyahs[page-1] = { surah, ayah } (global ayah number can be calculated)
export const PAGE_COUNT = 604;

// This function fetches page data from Al Quran Cloud API
// For production, we should cache this data
export async function fetchPageData(pageNumber: number): Promise<PageBoundary[]> {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}`);
        const data = await response.json();

        if (data.code !== 200) return [];

        const ayahs = data.data.ayahs;
        const boundaries: PageBoundary[] = [];

        // Group ayahs by surah
        const surahGroups = new Map<number, number[]>();
        for (const ayah of ayahs) {
            const surahNum = ayah.surah.number;
            if (!surahGroups.has(surahNum)) {
                surahGroups.set(surahNum, []);
            }
            surahGroups.get(surahNum)!.push(ayah.numberInSurah);
        }

        for (const [surah, ayahNumbers] of surahGroups) {
            boundaries.push({
                page: pageNumber,
                surah,
                startAyah: Math.min(...ayahNumbers),
                endAyah: Math.max(...ayahNumbers),
            });
        }

        return boundaries;
    } catch (error) {
        console.error('Failed to fetch page data:', error);
        return [];
    }
}

// Hardcoded ayah-to-page mapping for common surahs
// This avoids API calls for frequently accessed pages
// Format: AYAH_PAGES[surah][ayah] = page number
export const AYAH_PAGES: Record<number, Record<number, number>> = {
    // Surah 1 (Al-Fatiha) - All 7 ayahs on page 1
    1: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 },

    // Surah 2 (Al-Baqara) - Key page boundaries
    2: {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 2,
        6: 3, 7: 3, 8: 3, 9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3,
        // More ayahs will be added or calculated dynamically
    },
};

// Surah start pages (first page of each surah)
export const SURAH_START_PAGES: Record<number, number> = {
    1: 1,   // Al-Fatiha
    2: 2,   // Al-Baqara
    3: 50,  // Ali 'Imran
    4: 77,  // An-Nisa
    5: 106, // Al-Ma'idah
    6: 128, // Al-An'am
    7: 151, // Al-A'raf
    8: 177, // Al-Anfal
    9: 187, // At-Tawbah
    10: 208, // Yunus
    11: 221, // Hud
    12: 235, // Yusuf
    13: 249, // Ar-Ra'd
    14: 255, // Ibrahim
    15: 262, // Al-Hijr
    16: 267, // An-Nahl
    17: 282, // Al-Isra
    18: 293, // Al-Kahf
    19: 305, // Maryam
    20: 312, // Taha
    21: 322, // Al-Anbiya
    22: 332, // Al-Hajj
    23: 342, // Al-Mu'minun
    24: 350, // An-Nur
    25: 359, // Al-Furqan
    26: 367, // Ash-Shu'ara
    27: 377, // An-Naml
    28: 385, // Al-Qasas
    29: 396, // Al-Ankabut
    30: 404, // Ar-Rum
    31: 411, // Luqman
    32: 415, // As-Sajdah
    33: 418, // Al-Ahzab
    34: 428, // Saba
    35: 434, // Fatir
    36: 440, // Ya-Sin
    37: 446, // As-Saffat
    38: 453, // Sad
    39: 458, // Az-Zumar
    40: 467, // Ghafir
    41: 477, // Fussilat
    42: 483, // Ash-Shuraa
    43: 489, // Az-Zukhruf
    44: 496, // Ad-Dukhan
    45: 499, // Al-Jathiyah
    46: 502, // Al-Ahqaf
    47: 507, // Muhammad
    48: 511, // Al-Fath
    49: 515, // Al-Hujurat
    50: 518, // Qaf
    51: 520, // Adh-Dhariyat
    52: 523, // At-Tur
    53: 526, // An-Najm
    54: 528, // Al-Qamar
    55: 531, // Ar-Rahman
    56: 534, // Al-Waqi'ah
    57: 537, // Al-Hadid
    58: 542, // Al-Mujadila
    59: 545, // Al-Hashr
    60: 549, // Al-Mumtahanah
    61: 551, // As-Saf
    62: 553, // Al-Jumu'ah
    63: 554, // Al-Munafiqun
    64: 556, // At-Taghabun
    65: 558, // At-Talaq
    66: 560, // At-Tahrim
    67: 562, // Al-Mulk
    68: 564, // Al-Qalam
    69: 566, // Al-Haqqah
    70: 568, // Al-Ma'arij
    71: 570, // Nuh
    72: 572, // Al-Jinn
    73: 574, // Al-Muzzammil
    74: 575, // Al-Muddaththir
    75: 577, // Al-Qiyamah
    76: 578, // Al-Insan
    77: 580, // Al-Mursalat
    78: 582, // An-Naba
    79: 583, // An-Nazi'at
    80: 585, // Abasa
    81: 586, // At-Takwir
    82: 587, // Al-Infitar
    83: 587, // Al-Mutaffifin
    84: 589, // Al-Inshiqaq
    85: 590, // Al-Buruj
    86: 591, // At-Tariq
    87: 591, // Al-A'la
    88: 592, // Al-Ghashiyah
    89: 593, // Al-Fajr
    90: 594, // Al-Balad
    91: 595, // Ash-Shams
    92: 595, // Al-Layl
    93: 596, // Ad-Duhaa
    94: 596, // Ash-Sharh
    95: 597, // At-Tin
    96: 597, // Al-Alaq
    97: 598, // Al-Qadr
    98: 598, // Al-Bayyinah
    99: 599, // Az-Zalzalah
    100: 599, // Al-Adiyat
    101: 600, // Al-Qari'ah
    102: 600, // At-Takathur
    103: 601, // Al-Asr
    104: 601, // Al-Humazah
    105: 601, // Al-Fil
    106: 602, // Quraysh
    107: 602, // Al-Ma'un
    108: 602, // Al-Kawthar
    109: 603, // Al-Kafirun
    110: 603, // An-Nasr
    111: 603, // Al-Masad
    112: 604, // Al-Ikhlas
    113: 604, // Al-Falaq
    114: 604, // An-Nas
};

// Number of ayahs per surah
export const SURAH_AYAH_COUNTS: Record<number, number> = {
    1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
    11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
    21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
    31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
    41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
    51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
    61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
    71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
    81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
    91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
    101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
    111: 5, 112: 4, 113: 5, 114: 6,
};

/**
 * Estimate the page number for a given surah and ayah
 * Uses surah start pages and interpolation
 */
export function getPageForAyah(surah: number, ayah: number): number {
    // Check cached values first
    if (AYAH_PAGES[surah]?.[ayah]) {
        return AYAH_PAGES[surah][ayah];
    }

    // Get surah start and end pages
    const startPage = SURAH_START_PAGES[surah] || 1;
    const nextSurah = surah + 1;
    const endPage = nextSurah <= 114
        ? (SURAH_START_PAGES[nextSurah] || 604) - 1
        : 604;

    // Calculate approximate page based on ayah position within surah
    const totalAyahs = SURAH_AYAH_COUNTS[surah] || 1;
    const pageSpan = endPage - startPage + 1;
    const progress = (ayah - 1) / totalAyahs;

    return Math.min(startPage + Math.floor(progress * pageSpan), 604);
}

/**
 * Get Mushaf page image URL
 * Uses Quran.com CDN for high-quality Madani Mushaf images
 */
export function getPageImageUrl(page: number): string {
    // Quran.com uses v2 words endpoint, for pages we use a different approach
    // Using Internet Archive Madani Mushaf as backup
    const paddedPage = page.toString().padStart(3, '0');

    // Primary: Quran.com (if allowed)
    // return `https://cdn.quran.com/images/pages/${paddedPage}.png`;

    // Primary: Quran Android (Official)
    return `https://android.quran.com/data/width_1024/page${paddedPage}.png`;
}

/**
 * Get the first ayah info for a specific page
 */
export function getPageFirstAyah(page: number): { surah: number; ayah: number } | null {
    // Find which surah this page belongs to
    for (let s = 114; s >= 1; s--) {
        if (SURAH_START_PAGES[s] && SURAH_START_PAGES[s] <= page) {
            // Found the surah, now estimate the ayah
            const startPage = SURAH_START_PAGES[s];
            const nextSurah = s + 1;
            const endPage = nextSurah <= 114
                ? (SURAH_START_PAGES[nextSurah] || 604) - 1
                : 604;

            const totalAyahs = SURAH_AYAH_COUNTS[s] || 1;
            const pageSpan = endPage - startPage + 1;
            const pageOffset = page - startPage;
            const estimatedAyah = Math.floor((pageOffset / pageSpan) * totalAyahs) + 1;

            return { surah: s, ayah: Math.min(estimatedAyah, totalAyahs) };
        }
    }

    return { surah: 1, ayah: 1 };
}
