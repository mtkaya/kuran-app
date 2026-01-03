// Storage Layer with Versioning
import { StorageSchema, DEFAULT_STORAGE, Bookmark, ReadingPosition, UserSettings } from './types';

const STORAGE_KEY = 'kuran-app-data';

// Load data from localStorage
function loadStorage(): StorageSchema {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_STORAGE;

        const data = JSON.parse(raw) as StorageSchema;

        // Version migration (future-proofing)
        if (data.version < DEFAULT_STORAGE.version) {
            return migrateStorage(data);
        }

        return data;
    } catch {
        return DEFAULT_STORAGE;
    }
}

// Save data to localStorage
function saveStorage(data: StorageSchema): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save storage:', e);
    }
}

// Migration function for future schema changes
function migrateStorage(oldData: StorageSchema): StorageSchema {
    // Currently no migrations needed
    return { ...DEFAULT_STORAGE, ...oldData, version: DEFAULT_STORAGE.version };
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
