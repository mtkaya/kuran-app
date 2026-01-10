import React, { useState, useEffect, useMemo } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { MushafTextView } from './MushafTextView';
import { getPageForAyah } from '../data/pageMapping';
import { useAudioStore } from '../store/audioStore';
import { useSettingsStore } from '../store/settingsStore';
import { useLanguage } from '../context/LanguageContext';
import { getQuranData } from '../data/quran';
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

    const { arabicFont } = useSettingsStore();
    const { currentLanguage } = useLanguage();

    // State
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Page Content State for translation panel
    const [pageAyahs, setPageAyahs] = useState<any[]>([]);

    // Get full Quran data for lookups
    const quranData = useMemo(() => getQuranData(currentLanguage), [currentLanguage]);
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
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                    <h3 className="font-semibold text-foreground">{ui.pageTranslation}</h3>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {pageAyahs.length} {ui.verses}
                    </span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {pageAyahs.map((ayah) => {
                        const isActive = currentAyahId === ayah.id;
                        return (
                            <div
                                key={ayah.id}
                                onClick={() => handleAyahClick(ayah)}
                                className={`p-4 rounded-xl transition-all cursor-pointer border ${isActive
                                    ? 'bg-primary/10 border-primary shadow-md ring-1 ring-primary/30'
                                    : 'bg-background hover:bg-secondary/50 border-transparent hover:border-border'
                                    }`}
                            >
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                                        }`}>
                                        {ayah.surah_id}:{ayah.ayah_number}
                                    </span>
                                    <p
                                        className="font-arabic text-xl text-right flex-1 leading-loose"
                                        dir="rtl"
                                        style={{ fontFamily: arabicFont }}
                                    >
                                        {ayah.text_arabic}
                                    </p>
                                </div>
                                <p className={`text-sm leading-relaxed ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                                    }`}>
                                    {ayah.text_meal}
                                </p>
                            </div>
                        );
                    })}

                    {pageAyahs.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            {ui.loading}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
