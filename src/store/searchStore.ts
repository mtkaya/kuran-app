// Search Store
import { create } from 'zustand';
import { Surah, Ayah } from '../types';
import { getQuranDataAsync } from '../data/quran';
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

        // Cancel any pending search if possible? 
        // In a real app we might use an AbortController or a ref to the current search ID.
        // For now, simpler implementation:

        if (!query.trim() || query.length < 2) {
            set({ results: [], isSearching: false });
            return;
        }

        set({ isSearching: true, results: [] });

        // Load data asynchronously
        getQuranDataAsync(language).then((quranData) => {
            // Verify query hasn't changed
            if (get().query !== query) return;

            const results: SearchResult[] = [];
            let surahIndex = 0;

            // Time-slicing search
            const processBatch = () => {
                // Check if search was cancelled or query changed (basic check)
                if (get().query !== query) return;

                const startTime = performance.now();

                // Process for up to 12ms to maintain 60fps
                while (surahIndex < quranData.length && performance.now() - startTime < 12) {
                    const surah = quranData[surahIndex];

                    // Search in surah name
                    if (matchesQuery(surah.name_turkish, query) || matchesQuery(surah.name_arabic, query)) {
                        if (surah.ayahs.length > 0) {
                            results.push({
                                surah,
                                ayah: surah.ayahs[0],
                                matchType: 'surah_name',
                            });
                        }
                    }

                    // Search in ayahs
                    // Inner loop optimization: also break if time budget exceeded?
                    // Surahs can be large (Bakara 286 ayahs).
                    // Ideally we should process fewer ayahs if needed. 
                    // But processing one surah at a time is usually okay unless it's very large.
                    // Improve: loop ayahs manually?
                    // For simplicity, we process one Surah fully. 

                    for (const ayah of surah.ayahs) {
                        // Check limiting
                        if (results.length >= 50) break;

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

                    if (results.length >= 50) break;
                    surahIndex++;
                }

                if (results.length >= 50 || surahIndex >= quranData.length) {
                    set({ results, isSearching: false });
                } else {
                    // Continue in next frame
                    setTimeout(processBatch, 0);
                }
            };

            // Start processing
            setTimeout(processBatch, 0);
        });
    },

    clearSearch: () => {
        set({ query: '', results: [], isSearching: false });
    },
}));
