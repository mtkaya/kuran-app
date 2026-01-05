// Storage Types for Kuran App
// Version: 1

export interface Bookmark {
    surahId: number;
    ayahId: number;
    surahName: string;
    ayahNumber: number;
    timestamp: number;
}

export interface ReadingPosition {
    surahId: number;
    ayahId: number;
    ayahNumber: number;
    surahName: string;
    timestamp?: number;
}

export interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    arabicFontSize: number;  // 20-48
    mealFontSize: number;    // 14-28
    showTransliteration: boolean;
    showTajweed: boolean;
    memorizationMode: boolean;
    mushafMode: boolean; // new toggle to show Mushaf page view
}

export interface StorageSchema {
    version: number;
    settings: UserSettings;
    bookmarks: Bookmark[];
    lastRead: ReadingPosition | null;
}

export const DEFAULT_SETTINGS: UserSettings = {
    theme: 'system',
    arabicFontSize: 28,
    mealFontSize: 18,
    showTransliteration: false,
    showTajweed: false,
    memorizationMode: false,
    mushafMode: false,
};

export const DEFAULT_STORAGE: StorageSchema = {
    version: 1,
    settings: DEFAULT_SETTINGS,
    bookmarks: [],
    lastRead: null,
};
