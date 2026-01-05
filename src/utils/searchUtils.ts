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

/**
 * Create a regex that matches text with flexible diacritics (for Arabic)
 * or standard normalization (for others)
 */
function createSearchRegex(query: string, isArabic: boolean): RegExp {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (isArabic) {
        // For Arabic, we want to match the base characters even if diacritics are present
        // 1. Normalize the query to base characters first
        const normalizedQuery = normalizeArabic(escaped);

        // 2. Create a pattern that allows diacritics between characters
        // Ranges taken from normalizeArabic
        const diacritics = '[\\u064B-\\u065F\\u0610-\\u061A\\u06D6-\\u06DC\\u06DF-\\u06E8\\u06EA-\\u06ED]*';

        // Join characters with optional diacritics
        const pattern = normalizedQuery.split('').join(diacritics);
        return new RegExp(pattern, 'gi');
    }

    // For other languages, simpler matching (case insensitive)
    return new RegExp(escaped, 'gi');
}

/**
 * Highlight matching text in a string
 * Supports multiple matches and Arabic diacritic handling
 */
export function highlightMatch(text: string, query: string): { text: string; highlighted: boolean }[] {
    if (!query.trim()) {
        return [{ text, highlighted: false }];
    }

    const hasArabic = /[\u0600-\u06FF]/.test(text);
    // Use regex for finding matches to handle Arabic diacritics correctly
    // or standard case-insensitive matching for others (via regex flag 'i')

    // Note: For Turkish, we still need normalization logic if we want strict "i" vs "ı" handling 
    // that isn't covered by standard RegExp 'i' flag. 
    // However, recreating exact Turkish normalization in Regex is complex.
    // For now, we'll try a direct regex match which works for most cases, 
    // but relies on the input text.

    let regex: RegExp;

    if (hasArabic) {
        regex = createSearchRegex(query, true);
    }
    // For non-Arabic, we will fall through to the normalization logic below


    // New Strategy:
    // 1. If Arabic, use the smart Regex (best for diacritics).
    // 2. If valid Regex match found, use it.
    // 3. If not, fallback to normalized string index mapping (for Turkish).

    const result: { text: string; highlighted: boolean }[] = [];

    if (hasArabic) {
        regex = createSearchRegex(query, true);
        let lastIndex = 0;
        let match;

        // Reset lastIndex because we might reuse regex (though we create new one here)
        regex.lastIndex = 0;

        while ((match = regex.exec(text)) !== null) {
            // Text before match
            if (match.index > lastIndex) {
                result.push({ text: text.slice(lastIndex, match.index), highlighted: false });
            }

            // Matched text
            result.push({ text: match[0], highlighted: true });

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            result.push({ text: text.slice(lastIndex), highlighted: false });
        }

        // If we found matches, return. If not (maybe normalization differed too much), return original.
        if (result.length > 0) return result;
    }

    // Fallback or Non-Arabic (Turkish) loop
    // We normalize both and find indices in the normalized string.
    // WARNING: This assumes normalized string length == original string length.
    // normalizeTurkish preserves length. normalizeText (for others) might not? 
    // normalizeText calls normalizeTurkish or normalizeArabic.

    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);

    if (!normalizedText.includes(normalizedQuery)) {
        return [{ text, highlighted: false }];
    }

    let lastIndex = 0;
    let currentIndex = normalizedText.indexOf(normalizedQuery);

    while (currentIndex !== -1) {
        if (currentIndex > lastIndex) {
            result.push({ text: text.slice(lastIndex, currentIndex), highlighted: false });
        }

        result.push({ text: text.slice(currentIndex, currentIndex + query.length), highlighted: true });

        lastIndex = currentIndex + query.length;
        currentIndex = normalizedText.indexOf(normalizedQuery, lastIndex);
    }

    if (lastIndex < text.length) {
        result.push({ text: text.slice(lastIndex), highlighted: false });
    }

    return result;
}

