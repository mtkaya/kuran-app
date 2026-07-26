// Pure helpers for restoring and protecting the saved reading position
import { ReadingPosition } from '../storage/types';

// Ayah to open when entering a surah: the saved position if it belongs to
// this surah, otherwise the first ayah.
export function resolveInitialAyah(
    surahId: number,
    lastRead: ReadingPosition | null | undefined
): number {
    if (lastRead && lastRead.surahId === surahId && lastRead.ayahNumber >= 1) {
        return lastRead.ayahNumber;
    }
    return 1;
}

// Page to open in page-based mushaf views: prefer the exact saved page.
export function resolveInitialPage(
    surahId: number,
    lastRead: ReadingPosition | null | undefined,
    fallbackPage: number
): number {
    if (
        lastRead &&
        lastRead.surahId === surahId &&
        typeof lastRead.page === 'number' &&
        lastRead.page >= 1
    ) {
        return lastRead.page;
    }
    return fallbackPage;
}

// A manually placed mark acts like a physical ribbon: automatic position
// tracking must not overwrite it. The user moves it by marking again.
export function canAutoSavePosition(
    lastRead: ReadingPosition | null | undefined
): boolean {
    return lastRead?.manual !== true;
}
