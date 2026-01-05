import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Maximize2, Minimize2, ImageOff } from 'lucide-react';
import { getPageForAyah, getPageImageUrl, fetchPageData } from '../data/pageMapping';
import { useAudioStore } from '../store/audioStore';
import { useLanguage } from '../context/LanguageContext';
import { getQuranData } from '../data/quran';

interface MushafViewProps {
    surahId: number;
    initialAyahId?: number;
    onPageChange?: (page: number) => void;
}

export const MushafView: React.FC<MushafViewProps> = ({ surahId, initialAyahId, onPageChange }) => {
    const {
        currentAyahId,
        currentSurahId,
        currentAyahNumber,
        play,
    } = useAudioStore();

    const { currentLanguage } = useLanguage();

    // State
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [hasError, setHasError] = useState(false);

    // Page Content State
    const [pageAyahs, setPageAyahs] = useState<any[]>([]);

    // Refs for scrolling
    const activeAyahRef = useRef<HTMLDivElement>(null);
    const translationContainerRef = useRef<HTMLDivElement>(null);

    // Get full Quran data for lookups
    const quranData = useMemo(() => getQuranData(currentLanguage), [currentLanguage]);

    // Initialize Page
    useEffect(() => {
        // If we have an initial ayah or surah, calculate the starting page
        if (surahId) {
            // Default to first ayah of the surah if no specific ayah provided
            const targetAyah = initialAyahId ? 1 : 1; // Simplified logic, ideally map global ID if provided
            const page = getPageForAyah(surahId, targetAyah);
            setCurrentPage(page);
        }
    }, [surahId, initialAyahId]);

    // Sync with Audio (Auto-Page Turn)
    useEffect(() => {
        if (currentSurahId && currentAyahNumber) {
            // Try to find exact page from data first
            const surah = quranData.find(s => s.id === currentSurahId);
            const ayah = surah?.ayahs.find(a => a.ayah_number === currentAyahNumber);

            if (ayah?.page) {
                if (ayah.page !== currentPage) {
                    setCurrentPage(ayah.page);
                }
            } else {
                // Fallback to estimation if data missing
                const page = getPageForAyah(currentSurahId, currentAyahNumber);
                if (page !== currentPage) {
                    setCurrentPage(page);
                }
            }
        }
    }, [currentSurahId, currentAyahNumber, quranData]);

    // Fetch Page Content (Ayahs & Translation)
    useEffect(() => {
        const loadPageContent = async () => {
            // We can use local calculation instead of API if possible, but API is reliable for boundaries
            // For now, let's try to map locally if we have the data, or fetch boundaries
            // Recalculating boundaries locally is hard without a map.
            // We'll use the fetchPageData function we saw earlier.

            const boundaries = await fetchPageData(currentPage);

            if (boundaries && boundaries.length > 0) {
                const ayahs: any[] = [];

                boundaries.forEach(boundary => {
                    const surah = quranData.find(s => s.id === boundary.surah);
                    if (surah) {
                        const surahAyahs = surah.ayahs.filter(
                            a => a.ayah_number >= boundary.startAyah && a.ayah_number <= boundary.endAyah
                        );
                        ayahs.push(...surahAyahs);
                    }
                });

                setPageAyahs(ayahs);
            }
        };

        loadPageContent();
        onPageChange?.(currentPage);
        setHasError(false);
        setIsLoading(true);
    }, [currentPage, quranData, onPageChange]);

    // Scroll to active ayah in translation view
    useEffect(() => {
        if (activeAyahRef.current) {
            activeAyahRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentAyahId]);

    // Handle Page Navigation
    const nextPage = () => {
        if (currentPage < 604) {
            setCurrentPage(prev => prev + 1);
            setIsLoading(true);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            setIsLoading(true);
        }
    };

    // Swipe Handling
    const minSwipeDistance = 50;
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextPage();
        }
        if (isRightSwipe) {
            prevPage();
        }
    };

    const handleAyahClick = (ayah: any) => {
        // Find surah name
        const surah = quranData.find(s => s.id === ayah.surah_id);
        if (surah) {
            play(
                ayah.surah_id,
                ayah.id,
                ayah.ayah_number,
                surah.name_turkish,
                surah.verse_count
            );
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Mushaf Page View */}
            <div
                className={`relative transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'w-full h-[60vh] sm:h-[70vh]'}`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Controls Overlay */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                </div>

                {/* Page Display */}
                <div className="w-full h-full flex items-center justify-center bg-[#fdf8f0] dark:bg-[#1a1a1a] rounded-lg overflow-hidden relative shadow-inner">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        </div>
                    )}

                    {!hasError ? (
                        <img
                            src={getPageImageUrl(currentPage)}
                            alt={`Page ${currentPage}`}
                            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                console.error('Failed to load page image');
                                setHasError(true);
                                setIsLoading(false);
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-6 text-center animate-fade-in">
                            <ImageOff className="w-12 h-12 mb-3 opacity-50" />
                            <p className="font-medium">Sayfa görseli yüklenemedi</p>
                            <p className="text-xs mt-1 opacity-70">İnternet bağlantınızı kontrol edin</p>
                            <button
                                onClick={() => { setHasError(false); setIsLoading(true); }}
                                className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    )}

                    {/* Navigation Zones (Desktop Click) */}
                    <div
                        className="absolute inset-y-0 left-0 w-1/4 cursor-pointer hover:bg-black/5 transition-colors"
                        onClick={nextPage}
                        title="Next Page"
                    />
                    <div
                        className="absolute inset-y-0 right-0 w-1/4 cursor-pointer hover:bg-black/5 transition-colors"
                        onClick={prevPage}
                        title="Previous Page"
                    />
                </div>

                {/* Page Number */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md text-white px-4 py-1 rounded-full text-sm font-medium">
                        Sayfa {currentPage}
                    </div>
                </div>
            </div>

            {/* Translation & Interactive List */}
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                    <h3 className="font-semibold text-foreground">Sayfa Meali</h3>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {pageAyahs.length} Ayet
                    </span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar" ref={translationContainerRef}>
                    {pageAyahs.map((ayah) => {
                        const isActive = currentAyahId === ayah.id;
                        return (
                            <div
                                key={ayah.id}
                                ref={isActive ? activeAyahRef : null}
                                onClick={() => handleAyahClick(ayah)}
                                className={`p-4 rounded-xl transition-all cursor-pointer border ${isActive
                                    ? 'bg-primary/10 border-primary shadow-md ring-1 ring-primary/30 transform scale-[1.01]'
                                    : 'bg-background hover:bg-secondary/50 border-transparent hover:border-border'
                                    }`}
                            >
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                                        }`}>
                                        {ayah.surah_id}:{ayah.ayah_number}
                                    </span>
                                    <p className="font-arabic text-xl text-right flex-1 leading-loose" dir="rtl">
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
                            Yükleniyor...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
