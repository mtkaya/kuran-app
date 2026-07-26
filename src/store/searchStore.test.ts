// Search store error handling tests
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../data/quran', () => ({
    getQuranDataAsync: vi.fn(),
}));

import { getQuranDataAsync } from '../data/quran';
import { useSearchStore } from './searchStore';
import { LanguageCode } from '../context/LanguageContext';

const TR = 'tr' as LanguageCode;

describe('searchStore', () => {
    beforeEach(() => {
        useSearchStore.setState({ query: '', filter: 'all', results: [], isSearching: false });
        vi.mocked(getQuranDataAsync).mockReset();
    });

    it('clears the searching flag when data loading fails', async () => {
        vi.mocked(getQuranDataAsync).mockRejectedValue(new Error('offline'));

        useSearchStore.getState().setQuery('rahman');
        useSearchStore.getState().search(TR);
        expect(useSearchStore.getState().isSearching).toBe(true);

        await vi.waitFor(() => {
            expect(useSearchStore.getState().isSearching).toBe(false);
        });
        expect(useSearchStore.getState().results).toEqual([]);
    });

    it('finds matches once data resolves', async () => {
        vi.mocked(getQuranDataAsync).mockResolvedValue([
            {
                id: 1,
                name_turkish: 'Fatiha',
                name_arabic: 'الفاتحة',
                verse_count: 1,
                ayahs: [
                    { id: 1, ayah_number: 1, text_arabic: 'x', text_meal: 'Rahman ve Rahim olan Allah' },
                ],
            },
        ] as never);

        useSearchStore.getState().setQuery('rahman');
        useSearchStore.getState().search(TR);

        await vi.waitFor(() => {
            expect(useSearchStore.getState().isSearching).toBe(false);
        });
        expect(useSearchStore.getState().results.length).toBeGreaterThan(0);
    });
});
