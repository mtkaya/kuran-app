import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDownUp, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MushafTextView } from './MushafTextView';
import { MushafTranslationPanel } from './MushafTranslationPanel';
import { getPageForAyah } from '../data/pageMapping';
import { useAudioStore } from '../store/audioStore';
import { useReadingStore } from '../store/readingStore';
import { resolveInitialPage } from '../utils/mushafPosition';
import { useLanguage } from '../context/LanguageContext';
import { useQuranData } from '../hooks/useQuranData';
import { getUIStrings } from '../i18n/strings';

interface MushafViewProps {
    surahId: number;
    initialAyahId?: number;
    onPageChange?: (page: number) => void;
    onAyahSelect?: (ayah: any) => void;
}

export const MushafView: React.FC<MushafViewProps> = ({ surahId, onPageChange, onAyahSelect }) => {
    const {
        currentAyahId,
        currentSurahId,
        currentAyahNumber,
        play,
    } = useAudioStore();

    const { currentLanguage } = useLanguage();

    // State
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Page Content State for translation panel
    const [pageAyahs, setPageAyahs] = useState<any[]>([]);

    // Get full Quran data for lookups
    const { quranData } = useQuranData(currentLanguage);
    const ui = useMemo(() => getUIStrings(currentLanguage), [currentLanguage]);

    // Initialize page: restore the saved reading position when it belongs to
    // this surah, otherwise open the surah's first page
    useEffect(() => {
        if (surahId) {
            const lastRead = useReadingStore.getState().lastRead;
            setCurrentPage(resolveInitialPage(surahId, lastRead, getPageForAyah(surahId, 1)));
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
        // Notify parent about ayah selection for ContentPanel
        onAyahSelect?.(ayah);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Navigation Options - Quick Access to Nuzul/Juz */}
            <div className="flex gap-2">
                <Link
                    to="/revelation-order"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-card border border-border rounded-xl hover:bg-accent transition-colors text-sm font-medium"
                >
                    <ArrowDownUp className="w-4 h-4 text-emerald-500" />
                    <span>Nüzul Sırası</span>
                </Link>
                <Link
                    to="/juz"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-card border border-border rounded-xl hover:bg-accent transition-colors text-sm font-medium"
                >
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>Cüzler</span>
                </Link>
            </div>

            {/* Mushaf Text View */}
            <div className="relative">
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
