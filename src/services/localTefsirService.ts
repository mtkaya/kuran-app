/**
 * Local Tefsir Service - Loads tefsir data from local JSON files
 */

import { TefsirContent } from '../types/content';

// Import tefsir data statically for bundling
import diyanetTefsirTr from '../data/tefsir/diyanet-tefsir-tr.json';

interface TefsirData {
    providerId: string;
    language: string;
    name: string;
    surahs: {
        [surahId: string]: {
            name: string;
            ayahs: {
                [ayahNumber: string]: {
                    text: string;
                    references?: string[];
                };
            };
        };
    };
}

// Static tefsir data registry
const tefsirRegistry: Record<string, TefsirData> = {
    'diyanet-tefsir-tr': diyanetTefsirTr as unknown as TefsirData,
};

/**
 * Load tefsir data for a provider
 */
export function loadTefsirData(providerId: string): TefsirData | null {
    return tefsirRegistry[providerId] || null;
}

/**
 * Get tefsir content for a specific ayah
 */
export async function getLocalTefsir(
    providerId: string,
    surahId: number,
    ayahNumber: number
): Promise<TefsirContent | null> {
    const tefsirData = loadTefsirData(providerId);
    if (!tefsirData) {
        return null;
    }

    const surah = tefsirData.surahs[surahId.toString()];
    if (!surah) {
        return null;
    }

    const ayah = surah.ayahs[ayahNumber.toString()];
    if (!ayah) {
        return null;
    }

    return {
        ayahId: surahId * 1000 + ayahNumber,
        surahId,
        ayahNumber,
        text: ayah.text,
        providerId,
        references: ayah.references,
    };
}

/**
 * Check if a tefsir provider has local data available
 */
export function hasLocalTefsir(providerId: string): boolean {
    return providerId in tefsirRegistry;
}

/**
 * Get list of surahs available for a provider
 */
export function getAvailableSurahs(providerId: string): number[] {
    const tefsirData = loadTefsirData(providerId);
    if (!tefsirData) {
        return [];
    }

    return Object.keys(tefsirData.surahs).map(Number);
}
