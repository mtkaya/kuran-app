// Storage Layer with Versioning
import { StorageSchema, DEFAULT_STORAGE, DEFAULT_SETTINGS, Bookmark, Note, ReadingPosition, UserSettings } from './types';

const STORAGE_KEY = 'kuran-app-data';
// One-slot backup of an unreadable payload, kept so recovery can never
// destroy user data beyond retrieval
export const CORRUPT_BACKUP_KEY = 'kuran-app-data-corrupt';

// Validation helper functions
function isValidBookmark(obj: unknown): obj is Bookmark {
    if (!obj || typeof obj !== 'object') return false;
    const b = obj as Record<string, unknown>;
    return (
        typeof b.surahId === 'number' &&
        typeof b.ayahId === 'number' &&
        typeof b.surahName === 'string' &&
        typeof b.ayahNumber === 'number' &&
        typeof b.timestamp === 'number'
    );
}

function isValidNote(obj: unknown): obj is Note {
    if (!obj || typeof obj !== 'object') return false;
    const n = obj as Record<string, unknown>;
    return (
        typeof n.id === 'string' &&
        typeof n.surahId === 'number' &&
        typeof n.ayahId === 'number' &&
        typeof n.ayahNumber === 'number' &&
        typeof n.surahName === 'string' &&
        typeof n.content === 'string' &&
        typeof n.createdAt === 'number' &&
        typeof n.updatedAt === 'number'
    );
}

function isValidReadingPosition(obj: unknown): obj is ReadingPosition {
    if (!obj || typeof obj !== 'object') return false;
    const p = obj as Record<string, unknown>;
    return (
        typeof p.surahId === 'number' &&
        typeof p.ayahId === 'number' &&
        typeof p.ayahNumber === 'number' &&
        typeof p.surahName === 'string'
    );
}

const READING_MODES: ReadonlyArray<UserSettings['readingMode']> = ['normal', 'mushaf', 'digital'];

// Field-by-field settings recovery: every valid field survives, everything
// else falls back to its default. Also migrates the legacy v1 `mushafMode`
// flag to the v2 `readingMode` enum.
function sanitizeSettings(obj: unknown): UserSettings {
    const s = (obj && typeof obj === 'object' ? obj : {}) as Record<string, unknown>;
    const legacyDigital = s.mushafMode === true;
    return {
        theme: s.theme === 'light' || s.theme === 'dark' || s.theme === 'system' ? s.theme : DEFAULT_SETTINGS.theme,
        arabicFontSize: typeof s.arabicFontSize === 'number' && Number.isFinite(s.arabicFontSize) ? s.arabicFontSize : DEFAULT_SETTINGS.arabicFontSize,
        mealFontSize: typeof s.mealFontSize === 'number' && Number.isFinite(s.mealFontSize) ? s.mealFontSize : DEFAULT_SETTINGS.mealFontSize,
        showTransliteration: typeof s.showTransliteration === 'boolean' ? s.showTransliteration : DEFAULT_SETTINGS.showTransliteration,
        showTajweed: typeof s.showTajweed === 'boolean' ? s.showTajweed : DEFAULT_SETTINGS.showTajweed,
        memorizationMode: typeof s.memorizationMode === 'boolean' ? s.memorizationMode : DEFAULT_SETTINGS.memorizationMode,
        readingMode: READING_MODES.includes(s.readingMode as UserSettings['readingMode'])
            ? (s.readingMode as UserSettings['readingMode'])
            : legacyDigital ? 'digital' : DEFAULT_SETTINGS.readingMode,
        arabicFont: typeof s.arabicFont === 'string' ? s.arabicFont : DEFAULT_SETTINGS.arabicFont,
        mushafEdition: typeof s.mushafEdition === 'string' ? s.mushafEdition : DEFAULT_SETTINGS.mushafEdition,
        hasSeenTutorial: typeof s.hasSeenTutorial === 'boolean' ? s.hasSeenTutorial : DEFAULT_SETTINGS.hasSeenTutorial,
    };
}

function freshDefaults(): StorageSchema {
    return {
        version: DEFAULT_STORAGE.version,
        settings: { ...DEFAULT_SETTINGS },
        bookmarks: [],
        notes: [],
        lastRead: null,
    };
}

function backupCorruptPayload(raw: string): void {
    try {
        if (!localStorage.getItem(CORRUPT_BACKUP_KEY)) {
            localStorage.setItem(CORRUPT_BACKUP_KEY, raw);
        }
    } catch {
        // Quota exceeded — nothing else we can do
    }
}

// Load data from localStorage. Recovery is per-field: one corrupt bookmark
// must never wipe settings, notes, or the reading position, and a later
// write must never persist that loss.
function loadStorage(): StorageSchema {
    let raw: string | null = null;
    try {
        raw = localStorage.getItem(STORAGE_KEY);
    } catch {
        return freshDefaults();
    }
    if (!raw) return freshDefaults();

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        backupCorruptPayload(raw);
        return freshDefaults();
    }
    if (!parsed || typeof parsed !== 'object') {
        backupCorruptPayload(raw);
        return freshDefaults();
    }

    const data = parsed as Record<string, unknown>;
    const bookmarks = Array.isArray(data.bookmarks) ? data.bookmarks.filter(isValidBookmark) : [];
    const notes = Array.isArray(data.notes) ? data.notes.filter(isValidNote) : [];

    const droppedEntries =
        (Array.isArray(data.bookmarks) ? data.bookmarks.length - bookmarks.length : 0) +
        (Array.isArray(data.notes) ? data.notes.length - notes.length : 0);
    if (droppedEntries > 0) {
        backupCorruptPayload(raw);
    }

    return {
        version: DEFAULT_STORAGE.version,
        settings: sanitizeSettings(data.settings),
        bookmarks,
        notes,
        lastRead: isValidReadingPosition(data.lastRead) ? data.lastRead : null,
    };
}

// Save data to localStorage
function saveStorage(data: StorageSchema): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save storage:', e);
    }
}

// Settings
export function getSettings(): UserSettings {
    return loadStorage().settings;
}

export function saveSettings(settings: UserSettings): void {
    const data = loadStorage();
    data.settings = settings;
    saveStorage(data);
}

// Bookmarks
export function getBookmarks(): Bookmark[] {
    return loadStorage().bookmarks;
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
    const data = loadStorage();
    data.bookmarks = bookmarks;
    saveStorage(data);
}

// Last Read Position
export function getLastRead(): ReadingPosition | null {
    return loadStorage().lastRead;
}

export function saveLastRead(position: ReadingPosition | null): void {
    const data = loadStorage();
    data.lastRead = position;
    saveStorage(data);
}

// Clear all data
export function clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
}
