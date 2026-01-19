/**
 * Content Types for Hybrid Content Architecture
 * Supports multi-language translations, tafsir, and related content
 */

// Content Provider Types
export type ContentType = 'meal' | 'tefsir' | 'related';

export interface ContentProvider {
    id: string;
    name: string;
    nameArabic?: string;
    language: string;
    type: ContentType;
    description?: string;
    author?: string;
    isDefault?: boolean;
    isOffline?: boolean; // true if bundled with app
    size?: number; // in bytes, for download estimation
}

// Meal (Translation) Types
export interface MealContent {
    ayahId: number;
    surahId: number;
    ayahNumber: number;
    text: string;
    providerId: string;
}

// Tefsir (Exegesis) Types
export interface TefsirContent {
    ayahId: number;
    surahId: number;
    ayahNumber: number;
    text: string;
    providerId: string;
    references?: string[];
}

// Related Ayahs
export interface RelatedAyah {
    sourceAyahId: number;
    relatedAyahId: number;
    relatedSurahId: number;
    relatedAyahNumber: number;
    relationshipType: 'thematic' | 'linguistic' | 'contextual';
    description?: string;
}

// Cache Entry
export interface CacheEntry<T> {
    key: string;
    data: T;
    timestamp: number;
    expiresAt?: number;
    providerId: string;
}

// Download Progress
export interface DownloadProgress {
    providerId: string;
    downloaded: number;
    total: number;
    status: 'pending' | 'downloading' | 'completed' | 'error';
    error?: string;
}

// Content Panel State
export interface ContentPanelState {
    activeTab: ContentType;
    isExpanded: boolean;
    selectedMealProvider: string;
    selectedTefsirProvider: string;
    downloadedProviders: string[];
}

// API Response Types
export interface ContentApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    cached?: boolean;
}

// Surah-level content batch (for efficient loading)
export interface SurahContentBatch {
    surahId: number;
    providerId: string;
    type: ContentType;
    contents: (MealContent | TefsirContent)[];
    fetchedAt: number;
}
