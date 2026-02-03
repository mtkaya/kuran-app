// Storage Types for Kuran App
// Version: 2

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
    page?: number;
    // Marker position as percentage (0-100) for custom placement on Mushaf
    markerX?: number;
    markerY?: number;
    timestamp?: number;
}

export interface Note {
    id: string;
    surahId: number;
    ayahId: number;
    ayahNumber: number;
    surahName: string;
    content: string;
    createdAt: number;
    updatedAt: number;
}

export type ReadingMode = 'normal' | 'mushaf' | 'digital';

export interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    arabicFontSize: number;  // 20-48
    mealFontSize: number;    // 14-28
    showTransliteration: boolean;
    showTajweed: boolean;
    memorizationMode: boolean;
    readingMode: ReadingMode;
    arabicFont: string;
    mushafEdition: string;   // Mushaf edition ID (diyanet, madina, indopak, etc.)
    hasSeenTutorial: boolean; // Tutorial overlay shown status
}

export interface StorageSchema {
    version: number;
    settings: UserSettings;
    bookmarks: Bookmark[];
    notes: Note[];
    lastRead: ReadingPosition | null;
}

export const DEFAULT_SETTINGS: UserSettings = {
    theme: 'system',
    arabicFontSize: 28,
    mealFontSize: 18,
    showTransliteration: false,
    showTajweed: false,
    memorizationMode: false,
    readingMode: 'normal',
    arabicFont: 'Amiri Quran',
    mushafEdition: 'diyanet',
    hasSeenTutorial: false,
};

export const DEFAULT_STORAGE: StorageSchema = {
    version: 2,
    settings: DEFAULT_SETTINGS,
    bookmarks: [],
    notes: [],
    lastRead: null,
};

