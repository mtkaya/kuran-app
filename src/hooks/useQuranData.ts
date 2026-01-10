import { useState, useEffect } from 'react';
import { Surah } from '../types';
import { LanguageCode } from '../context/LanguageContext';
import { getQuranDataAsync, clearLanguageCache } from '../data/quran';

interface UseQuranDataResult {
    quranData: Surah[];
    isLoading: boolean;
    error: string | null;
}

export function useQuranData(language: LanguageCode): UseQuranDataResult {
    const [quranData, setQuranData] = useState<Surah[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);

        const loadData = async () => {
            try {
                const data = await getQuranDataAsync(language);
                if (isMounted) {
                    setQuranData(data);
                    setIsLoading(false);
                    // Clear other languages from cache to save memory
                    clearLanguageCache(language);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load Quran data');
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [language]);

    return { quranData, isLoading, error };
}
