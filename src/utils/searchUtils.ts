// Search Utilities - Text normalization and matching

/**
 * Normalize Turkish text for search
 * Handles: İ/i, Ş/ş, Ğ/ğ, Ü/ü, Ö/ö, Ç/ç
 */
export function normalizeTurkish(text: string): string {
    return text
        .toLowerCase()
        .replace(/İ/g, 'i')
        .replace(/I/g, 'ı')
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/â/g, 'a')
        .replace(/î/g, 'i')
        .replace(/û/g, 'u');
}

/**
 * Normalize Arabic text for search
 * Removes diacritics (tashkeel): fatha, kasra, damma, sukun, shadda, etc.
 */
export function normalizeArabic(text: string): string {
    // Remove Arabic diacritics (tashkeel)
    return text
        .replace(/[\u064B-\u065F]/g, '') // Fathatan to Waslah
        .replace(/[\u0610-\u061A]/g, '') // Honorifics
        .replace(/[\u06D6-\u06DC]/g, '') // Quranic annotation
        .replace(/[\u06DF-\u06E8]/g, '') // More annotations
        .replace(/[\u06EA-\u06ED]/g, '') // More signs
        .replace(/ٱ/g, 'ا')              // Alef wasla to alef
        .replace(/ى/g, 'ي')              // Alef maqsura to ya
        .replace(/ة/g, 'ه');             // Ta marbuta to ha
}

/**
 * Normalize any text for search (auto-detects language)
 */
export function normalizeText(text: string): string {
    // Check if text contains Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(text);

    if (hasArabic) {
        return normalizeArabic(text).toLowerCase();
    }

    return normalizeTurkish(text);
}

/**
 * Check if a text matches a search query
 */
export function matchesQuery(text: string, query: string): boolean {
    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);

    return normalizedText.includes(normalizedQuery);
}

/**
 * Highlight matching text in a string
 */
export function highlightMatch(text: string, query: string): { text: string; highlighted: boolean }[] {
    if (!query.trim()) {
        return [{ text, highlighted: false }];
    }

    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);

    const index = normalizedText.indexOf(normalizedQuery);

    if (index === -1) {
        return [{ text, highlighted: false }];
    }

    const result: { text: string; highlighted: boolean }[] = [];

    if (index > 0) {
        result.push({ text: text.slice(0, index), highlighted: false });
    }

    result.push({ text: text.slice(index, index + query.length), highlighted: true });

    if (index + query.length < text.length) {
        result.push({ text: text.slice(index + query.length), highlighted: false });
    }

    return result;
}
