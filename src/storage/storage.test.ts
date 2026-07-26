// Storage recovery tests: a single corrupt record must never wipe the rest
import { describe, it, expect, beforeEach } from 'vitest';
import { getBookmarks, getSettings, getLastRead, saveSettings, CORRUPT_BACKUP_KEY } from './storage';
import { DEFAULT_SETTINGS } from './types';

const KEY = 'kuran-app-data';

const validBookmark = { surahId: 2, ayahId: 10, surahName: 'Bakara', ayahNumber: 5, timestamp: 123 };
const validPosition = { surahId: 2, ayahId: 0, ayahNumber: 5, surahName: 'Bakara', page: 50, manual: true };

describe('storage recovery', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('keeps valid bookmarks, settings and position when one bookmark is corrupt', () => {
        localStorage.setItem(KEY, JSON.stringify({
            version: 2,
            settings: { ...DEFAULT_SETTINGS, theme: 'dark' },
            bookmarks: [validBookmark, { surahId: 3 }],
            notes: [],
            lastRead: validPosition,
        }));

        expect(getBookmarks()).toEqual([validBookmark]);
        expect(getSettings().theme).toBe('dark');
        expect(getLastRead()).toMatchObject({ surahId: 2, page: 50, manual: true });
    });

    it('does not wipe other fields when settings are corrupt', () => {
        localStorage.setItem(KEY, JSON.stringify({
            version: 2,
            settings: 'garbage',
            bookmarks: [validBookmark],
            notes: [],
            lastRead: null,
        }));

        expect(getBookmarks()).toEqual([validBookmark]);
        expect(getSettings()).toEqual(DEFAULT_SETTINGS);
    });

    it('deep-merges missing settings fields with defaults for a v1 payload', () => {
        localStorage.setItem(KEY, JSON.stringify({
            version: 1,
            settings: {
                theme: 'dark',
                arabicFontSize: 30,
                mealFontSize: 18,
                showTransliteration: true,
                showTajweed: false,
                memorizationMode: false,
                mushafMode: true,
            },
            bookmarks: [],
            lastRead: null,
        }));

        const s = getSettings();
        expect(s.theme).toBe('dark');
        expect(s.readingMode).toBe('digital'); // legacy mushafMode migrated
        expect(s.arabicFont).toBe(DEFAULT_SETTINGS.arabicFont);
        expect(s.mushafEdition).toBe(DEFAULT_SETTINGS.mushafEdition);
        expect(s.hasSeenTutorial).toBe(false);
    });

    it('backs up unparseable payloads before falling back to defaults', () => {
        localStorage.setItem(KEY, '{not json');

        expect(getBookmarks()).toEqual([]);
        expect(getSettings()).toEqual(DEFAULT_SETTINGS);
        expect(localStorage.getItem(CORRUPT_BACKUP_KEY)).toBe('{not json');
    });

    it('a settings write after partial corruption does not destroy surviving data', () => {
        localStorage.setItem(KEY, JSON.stringify({
            version: 2,
            settings: { ...DEFAULT_SETTINGS },
            bookmarks: [validBookmark, { bad: true }],
            notes: [],
            lastRead: validPosition,
        }));

        saveSettings({ ...DEFAULT_SETTINGS, theme: 'dark' });

        const persisted = JSON.parse(localStorage.getItem(KEY)!);
        expect(persisted.bookmarks).toEqual([validBookmark]);
        expect(persisted.lastRead).toMatchObject({ page: 50, manual: true });
        expect(persisted.settings.theme).toBe('dark');
    });

    it('drops an invalid lastRead without touching everything else', () => {
        localStorage.setItem(KEY, JSON.stringify({
            version: 2,
            settings: { ...DEFAULT_SETTINGS },
            bookmarks: [validBookmark],
            notes: [],
            lastRead: { surahId: 'two' },
        }));

        expect(getLastRead()).toBeNull();
        expect(getBookmarks()).toEqual([validBookmark]);
    });
});
