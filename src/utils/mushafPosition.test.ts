import { describe, it, expect } from 'vitest';
import { resolveInitialAyah, resolveInitialPage, canAutoSavePosition } from './mushafPosition';
import { ReadingPosition } from '../storage/types';

const mark: ReadingPosition = {
    surahId: 2,
    ayahId: 0,
    ayahNumber: 45,
    surahName: 'Bakara',
    page: 7,
    manual: true,
};

describe('mushaf position helpers', () => {
    it('restores the saved ayah when reopening the same surah', () => {
        expect(resolveInitialAyah(2, mark)).toBe(45);
    });

    it('starts from ayah 1 for a different surah or empty history', () => {
        expect(resolveInitialAyah(3, mark)).toBe(1);
        expect(resolveInitialAyah(2, null)).toBe(1);
        expect(resolveInitialAyah(2, undefined)).toBe(1);
    });

    it('restores the exact saved page when it belongs to the surah', () => {
        expect(resolveInitialPage(2, mark, 1)).toBe(7);
        expect(resolveInitialPage(3, mark, 4)).toBe(4);
        expect(resolveInitialPage(2, { ...mark, page: undefined }, 4)).toBe(4);
        expect(resolveInitialPage(2, null, 4)).toBe(4);
    });

    it('blocks automatic saves while a manual mark is set', () => {
        expect(canAutoSavePosition(mark)).toBe(false);
        expect(canAutoSavePosition({ ...mark, manual: undefined })).toBe(true);
        expect(canAutoSavePosition(null)).toBe(true);
        expect(canAutoSavePosition(undefined)).toBe(true);
    });
});
