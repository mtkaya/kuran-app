/**
 * Content Service - Hybrid content fetching with caching
 * Handles fetching tefsir, meal, and related content from local or API sources
 */

import {
    ContentProvider,
    ContentType,
    MealContent,
    TefsirContent,
    RelatedAyah,
    ContentApiResponse,
    SurahContentBatch,
} from '../types/content';
import { cacheService } from './cacheService';
import { getLocalTefsir, hasLocalTefsir } from './localTefsirService';

// API Base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_CONTENT_API_URL || '';

// Default content providers (bundled with app)
export const DEFAULT_PROVIDERS: ContentProvider[] = [
    {
        id: 'diyanet-meal-tr',
        name: 'Diyanet İşleri Meali',
        language: 'tr',
        type: 'meal',
        description: 'Türkiye Diyanet İşleri Başkanlığı resmi meali',
        isDefault: true,
        isOffline: true,
    },
    {
        id: 'elmalili-meal-tr',
        name: 'Elmalılı Hamdi Yazır',
        language: 'tr',
        type: 'meal',
        description: 'Hak Dini Kur\'an Dili - Klasik Türkçe meal',
        author: 'Elmalılı Muhammed Hamdi Yazır',
        isDefault: false,
        isOffline: true,
    },
    {
        id: 'sahih-intl-en',
        name: 'Sahih International',
        language: 'en',
        type: 'meal',
        description: 'Clear and accurate English translation',
        isDefault: false,
        isOffline: false,
        size: 2 * 1024 * 1024, // ~2MB
    },
    {
        id: 'diyanet-tefsir-tr',
        name: 'Diyanet Tefsiri',
        language: 'tr',
        type: 'tefsir',
        description: 'Kur\'an-ı Kerim tefsiri (örnek sureler)',
        isDefault: true,
        isOffline: true, // Now has local data
    },
    {
        id: 'ibn-kesir-tr',
        name: 'İbn Kesir Tefsiri',
        nameArabic: 'تفسير ابن كثير',
        language: 'tr',
        type: 'tefsir',
        description: 'Klasik tefsir kaynağı, Türkçe tercüme',
        author: 'İbn Kesir',
        isDefault: false,
        isOffline: false,
        size: 80 * 1024 * 1024, // ~80MB
    },
    {
        id: 'kurtubi-tr',
        name: 'Kurtubi Tefsiri',
        nameArabic: 'تفسير القرطبي',
        language: 'tr',
        type: 'tefsir',
        description: 'El-Camiu li-Ahkami\'l-Kur\'an, Türkçe tercüme',
        author: 'İmam Kurtubi',
        isDefault: false,
        isOffline: false,
        size: 100 * 1024 * 1024, // ~100MB
    },
];

class ContentService {
    private providers: ContentProvider[] = [...DEFAULT_PROVIDERS];

    /**
     * Get available content providers
     */
    getProviders(type?: ContentType, language?: string): ContentProvider[] {
        let filtered = this.providers;

        if (type) {
            filtered = filtered.filter((p) => p.type === type);
        }

        if (language) {
            filtered = filtered.filter((p) => p.language === language);
        }

        return filtered;
    }

    /**
     * Get default provider for a content type
     */
    getDefaultProvider(type: ContentType, language: string = 'tr'): ContentProvider | undefined {
        return this.providers.find(
            (p) => p.type === type && p.language === language && p.isDefault
        );
    }

    /**
     * Get provider by ID
     */
    getProvider(providerId: string): ContentProvider | undefined {
        return this.providers.find((p) => p.id === providerId);
    }

    /**
     * Fetch meal content for an ayah
     */
    async getMeal(
        providerId: string,
        surahId: number,
        ayahNumber: number
    ): Promise<ContentApiResponse<MealContent>> {
        const provider = this.getProvider(providerId);
        if (!provider) {
            return { success: false, error: 'Provider not found' };
        }

        // Check cache first
        const cached = await cacheService.get<MealContent>('meal', providerId, surahId, ayahNumber);
        if (cached) {
            return { success: true, data: cached, cached: true };
        }

        // If offline provider, content should be in local data
        if (provider.isOffline) {
            // Local content is handled by the main quranData hook
            // This is a fallback - normally local content wouldn't go through this path
            return { success: false, error: 'Local content should be accessed via quranData' };
        }

        // Fetch from API
        return this.fetchFromApi<MealContent>('meal', providerId, surahId, ayahNumber);
    }

    /**
     * Fetch tefsir content for an ayah
     */
    async getTefsir(
        providerId: string,
        surahId: number,
        ayahNumber: number
    ): Promise<ContentApiResponse<TefsirContent>> {
        const provider = this.getProvider(providerId);
        if (!provider) {
            return { success: false, error: 'Provider not found' };
        }

        // Check cache first
        const cached = await cacheService.get<TefsirContent>('tefsir', providerId, surahId, ayahNumber);
        if (cached) {
            return { success: true, data: cached, cached: true };
        }

        // Check for local tefsir data
        if (hasLocalTefsir(providerId)) {
            const localData = await getLocalTefsir(providerId, surahId, ayahNumber);
            if (localData) {
                // Cache for faster subsequent access
                await cacheService.set('tefsir', providerId, surahId, ayahNumber, localData);
                return { success: true, data: localData };
            }
            // Local data exists but not for this ayah - return placeholder
            return {
                success: true,
                data: {
                    ayahId: surahId * 1000 + ayahNumber,
                    surahId,
                    ayahNumber,
                    text: 'Bu ayet için tefsir verisi henüz eklenmemiştir. Yakında eklenecektir.',
                    providerId,
                }
            };
        }

        // Fetch from API
        return this.fetchFromApi<TefsirContent>('tefsir', providerId, surahId, ayahNumber);
    }

    /**
     * Fetch related ayahs
     */
    async getRelatedAyahs(
        surahId: number,
        ayahNumber: number
    ): Promise<ContentApiResponse<RelatedAyah[]>> {
        // Check cache first
        const cached = await cacheService.get<RelatedAyah[]>('related', 'system', surahId, ayahNumber);
        if (cached) {
            return { success: true, data: cached, cached: true };
        }

        // This could be AI-powered in the future
        // For now, return from API or local mapping
        if (!API_BASE_URL) {
            // No API configured - return empty for now
            return { success: true, data: [] };
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/related/${surahId}/${ayahNumber}`
            );
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();

            // Cache the result
            await cacheService.set('related', 'system', surahId, ayahNumber, data);

            return { success: true, data };
        } catch (error) {
            console.error('Failed to fetch related ayahs:', error);
            return { success: false, error: 'Failed to fetch related ayahs' };
        }
    }

    /**
     * Fetch entire surah content (batch)
     */
    async getSurahContent(
        type: ContentType,
        providerId: string,
        surahId: number
    ): Promise<ContentApiResponse<SurahContentBatch>> {
        // Check batch cache first
        const cached = await cacheService.getSurahBatch(type, providerId, surahId);
        if (cached) {
            return { success: true, data: cached, cached: true };
        }

        if (!API_BASE_URL) {
            return { success: false, error: 'No API configured' };
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/${type}/${providerId}/surah/${surahId}`
            );
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const contents = await response.json();

            const batch: SurahContentBatch = {
                surahId,
                providerId,
                type,
                contents,
                fetchedAt: Date.now(),
            };

            // Cache the batch
            await cacheService.setSurahBatch(batch);

            return { success: true, data: batch };
        } catch (error) {
            console.error('Failed to fetch surah content:', error);
            return { success: false, error: 'Failed to fetch content' };
        }
    }

    /**
     * Download all content for a provider (offline access)
     */
    async downloadProvider(
        providerId: string,
        onProgress?: (progress: number) => void
    ): Promise<boolean> {
        const provider = this.getProvider(providerId);
        if (!provider) {
            return false;
        }

        if (!API_BASE_URL) {
            console.warn('No API configured for downloading');
            return false;
        }

        try {
            // Fetch all surahs (1-114)
            const totalSurahs = 114;
            let completed = 0;

            for (let surahId = 1; surahId <= totalSurahs; surahId++) {
                await this.getSurahContent(provider.type, providerId, surahId);
                completed++;
                onProgress?.(Math.round((completed / totalSurahs) * 100));
            }

            // Mark as downloaded
            await cacheService.setProviderDownloaded(providerId, true);

            return true;
        } catch (error) {
            console.error('Failed to download provider:', error);
            return false;
        }
    }

    /**
     * Check if provider is available offline
     */
    async isProviderOffline(providerId: string): Promise<boolean> {
        const provider = this.getProvider(providerId);
        if (provider?.isOffline) {
            return true;
        }
        return cacheService.isProviderDownloaded(providerId);
    }

    /**
     * Delete downloaded content for a provider
     */
    async deleteProvider(providerId: string): Promise<void> {
        await cacheService.clearProvider(providerId);
    }

    /**
     * Internal: Fetch from API with caching
     */
    private async fetchFromApi<T>(
        type: string,
        providerId: string,
        surahId: number,
        ayahNumber: number
    ): Promise<ContentApiResponse<T>> {
        if (!API_BASE_URL) {
            return { success: false, error: 'No API configured' };
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/${type}/${providerId}/${surahId}/${ayahNumber}`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // Cache the result
            await cacheService.set(type, providerId, surahId, ayahNumber, data);

            return { success: true, data };
        } catch (error) {
            console.error(`Failed to fetch ${type}:`, error);
            return { success: false, error: `Failed to fetch ${type}` };
        }
    }
}

// Export singleton instance
export const contentService = new ContentService();
