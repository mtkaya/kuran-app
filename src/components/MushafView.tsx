import React, { useState, useEffect, useMemo } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { MushafTextView } from './MushafTextView';
import { MushafTranslationPanel } from './MushafTranslationPanel';
import { getPageForAyah } from '../data/pageMapping';
import { useAudioStore } from '../store/audioStore';
import { useLanguage } from '../context/LanguageContext';
import { useQuranData } from '../hooks/useQuranData';
import { getUIStrings } from '../i18n/strings';

interface MushafViewProps {
    surahId: number;
    initialAyahId?: number;
    onPageChange?: (page: number) => void;
}

export const MushafView: React.FC<MushafViewProps> = ({ surahId, onPageChange }) => {
    const {
        currentAyahId,
        currentSurahId,
        currentAyahNumber,
        play,
    } = useAudioStore();

    const { currentLanguage } = useLanguage();

    // State
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Page Content State for translation panel
    const [pageAyahs, setPageAyahs] = useState<any[]>([]);

    // Get full Quran data for lookups
    const { quranData } = useQuranData(currentLanguage);
    const ui = useMemo(() => getUIStrings(currentLanguage), [currentLanguage]);

    // Initialize Page based on surah
    useEffect(() => {
        if (surahId) {
            const page = getPageForAyah(surahId, 1);
            setCurrentPage(page);
        }
    }, [surahId]);

    // Sync with Audio
    useEffect(() => {
        if (currentSurahId && currentAyahNumber) {
            const surah = quranData.find(s => s.id === currentSurahId);
            const ayah = surah?.ayahs.find(a => a.ayah_number === currentAyahNumber);

            if (ayah?.page && ayah.page !== currentPage) {
                setCurrentPage(ayah.page);
            }
        }
    }, [currentSurahId, currentAyahNumber, quranData, currentPage]);

    // Handle page change from MushafTextView
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        onPageChange?.(page);

        // Load translations for this page
        loadPageTranslations(page);
    };

    // Load translations for page
    const loadPageTranslations = async (page: number) => {
        // Try to get ayahs for this page from our local data
        const ayahs: any[] = [];
        for (const surah of quranData) {
            const surahAyahs = surah.ayahs.filter(a => a.page === page);
            ayahs.push(...surahAyahs);
        }
        setPageAyahs(ayahs);
    };

    useEffect(() => {
        loadPageTranslations(currentPage);
    }, [currentPage, quranData]);

    const handleAyahClick = (ayah: any) => {
        const surah = quranData.find(s => s.id === ayah.surah_id);
        if (surah) {
            play(ayah.surah_id, ayah.id, ayah.ayah_number, surah.name_turkish, surah.verse_count);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Mushaf Text View */}
            <div className={`relative transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
                {/* Fullscreen Toggle */}
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="absolute top-2 right-2 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>

                <MushafTextView
                    initialPage={currentPage}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Translation Panel */}
            <MushafTranslationPanel
                pageAyahs={pageAyahs}
                currentAyahId={currentAyahId}
                onAyahClick={handleAyahClick}
                ui={ui}
            />
        </div>
    );
};
