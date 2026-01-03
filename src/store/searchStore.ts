// Search Store
import { create } from 'zustand';
import { Surah, Ayah } from '../types';
import { getQuranData } from '../data/quran';
import { matchesQuery } from '../utils/searchUtils';
import { LanguageCode } from '../context/LanguageContext';

export type SearchFilter = 'all' | 'arabic' | 'translation';

export interface SearchResult {
    surah: Surah;
    ayah: Ayah;
    matchType: 'arabic' | 'translation' | 'surah_name';
}

interface SearchState {
    query: string;
    filter: SearchFilter;
    results: SearchResult[];
    isSearching: boolean;

    setQuery: (query: string) => void;
    setFilter: (filter: SearchFilter) => void;
    search: (language: LanguageCode) => void;
    clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
    query: '',
    filter: 'all',
    results: [],
    isSearching: false,

    setQuery: (query) => {
        set({ query });
    },

    setFilter: (filter) => {
        set({ filter });
    },

    search: (language) => {
        const { query, filter } = get();

        if (!query.trim() || query.length < 2) {
            set({ results: [], isSearching: false });
            return;
        }

        set({ isSearching: true });

        // Perform search asynchronously to not block UI
        setTimeout(() => {
            const quranData = getQuranData(language);
            const results: SearchResult[] = [];

            for (const surah of quranData) {
                // Search in surah name
                if (matchesQuery(surah.name_turkish, query) || matchesQuery(surah.name_arabic, query)) {
                    // Add first ayah of matching surah
                    if (surah.ayahs.length > 0) {
                        results.push({
                            surah,
                            ayah: surah.ayahs[0],
                            matchType: 'surah_name',
                        });
                    }
                }

                // Search in ayahs
                for (const ayah of surah.ayahs) {
                    // Check Arabic
                    if ((filter === 'all' || filter === 'arabic') && matchesQuery(ayah.text_arabic, query)) {
                        results.push({
                            surah,
                            ayah,
                            matchType: 'arabic',
                        });
                        continue; // Don't add duplicate
                    }

                    // Check translation
                    if ((filter === 'all' || filter === 'translation') && matchesQuery(ayah.text_meal, query)) {
                        results.push({
                            surah,
                            ayah,
                            matchType: 'translation',
                        });
                    }
                }

                // Limit results for performance
                if (results.length >= 50) break;
            }

            set({ results, isSearching: false });
        }, 0);
    },

    clearSearch: () => {
        set({ query: '', results: [], isSearching: false });
    },
}));
