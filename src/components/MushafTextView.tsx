import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchMushafPage, preloadAdjacentPages, MushafPageData, MushafLine } from '../data/mushafPageData';
import { useSettingsStore } from '../store/settingsStore';
import { useAudioStore } from '../store/audioStore';

interface MushafTextViewProps {
    initialPage?: number;
    onPageChange?: (page: number) => void;
}

export const MushafTextView: React.FC<MushafTextViewProps> = ({
    initialPage = 1,
    onPageChange,
}) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageData, setPageData] = useState<MushafPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { arabicFont, arabicFontSize } = useSettingsStore();
    const { currentAyahId } = useAudioStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const onPageChangeRef = useRef(onPageChange);

    // Keep ref updated
    useEffect(() => {
        onPageChangeRef.current = onPageChange;
    }, [onPageChange]);

    // Fetch page data - only depends on currentPage
    useEffect(() => {
        let isMounted = true;

        const loadPage = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchMushafPage(currentPage);
                if (isMounted) {
                    setPageData(data);
                    preloadAdjacentPages(currentPage);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Sayfa yüklenemedi');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadPage();

        // Notify parent of page change using ref
        onPageChangeRef.current?.(currentPage);

        return () => {
            isMounted = false;
        };
    }, [currentPage]);

    // Navigation handlers
    const goToNextPage = () => {
        if (currentPage < 604) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // Touch/swipe handling
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) goToNextPage();
        if (distance < -minSwipeDistance) goToPrevPage();
    };

    // Render a single line
    const renderLine = (line: MushafLine) => {
        return (
            <div
                key={line.lineNumber}
                className="mushaf-line flex justify-center items-baseline px-2 py-1"
                style={{
                    fontFamily: arabicFont,
                    fontSize: `${arabicFontSize}px`,
                    lineHeight: '2.2',
                }}
                dir="rtl"
            >
                {line.words.map((word, idx) => (
                    <span
                        key={word.id || idx}
                        className={`inline-block mx-0.5 ${word.isEndMarker
                            ? 'text-primary font-bold mx-1'
                            : ''
                            }`}
                    >
                        {word.isEndMarker ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 text-xs border border-primary/50 rounded-full">
                                {word.text}
                            </span>
                        ) : (
                            word.text
                        )}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            className="mushaf-text-container relative bg-[#fdf8f0] dark:bg-[#1a1814] rounded-2xl overflow-hidden shadow-lg border border-border/30"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Decorative Border */}
            <div className="absolute inset-2 border-2 border-primary/20 rounded-xl pointer-events-none" />
            <div className="absolute inset-4 border border-primary/10 rounded-lg pointer-events-none" />

            {/* Page Content */}
            <div className="relative p-6 min-h-[70vh]">
                {/* Surah Header */}
                {pageData?.surahInfo && pageData.surahInfo.length > 0 && (
                    <div className="text-center mb-6">
                        <div className="inline-block px-8 py-2 bg-gradient-to-r from-transparent via-primary/10 to-transparent rounded-full">
                            <span
                                className="text-2xl text-primary font-bold"
                                style={{ fontFamily: arabicFont }}
                            >
                                سُورَةُ {pageData.surahInfo[0].name}
                            </span>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12 text-destructive">
                        <p>{error}</p>
                        <button
                            onClick={() => setCurrentPage(currentPage)}
                            className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                )}

                {/* Lines */}
                {!isLoading && !error && pageData && (
                    <div className="space-y-1">
                        {pageData.lines.map(line => renderLine(line))}
                    </div>
                )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between p-4 border-t border-border/30 bg-secondary/30">
                <button
                    onClick={goToPrevPage}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-lg bg-primary/10 text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/20 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sayfa</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg">
                        {currentPage}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 604</span>
                </div>

                <button
                    onClick={goToNextPage}
                    disabled={currentPage >= 604}
                    className="p-2 rounded-lg bg-primary/10 text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/20 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
