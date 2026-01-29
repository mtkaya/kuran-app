import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, ChevronDown, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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

    // Zoom state
    const [zoom, setZoom] = useState(1);
    const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);
    const MIN_ZOOM = 0.8;
    const MAX_ZOOM = 2.5;
    const ZOOM_STEP = 0.1;

    const { arabicFont, arabicFontSize } = useSettingsStore();
    const { currentSurahId, currentAyahNumber, isPlaying } = useAudioStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const onPageChangeRef = useRef(onPageChange);
    const activeLineRef = useRef<HTMLDivElement>(null);

    // Keep ref updated
    useEffect(() => {
        onPageChangeRef.current = onPageChange;
    }, [onPageChange]);

    // Sync with parent's page if it changes (e.g., from audio playback)
    useEffect(() => {
        if (initialPage && initialPage !== currentPage) {
            setCurrentPage(initialPage);
        }
    }, [initialPage]);

    // Current playing verse key (e.g., "1:5")
    const currentVerseKey = useMemo(() => {
        if (currentSurahId && currentAyahNumber) {
            return `${currentSurahId}:${currentAyahNumber}`;
        }
        return null;
    }, [currentSurahId, currentAyahNumber]);

    // Find line containing current verse
    const activeLineNumber = useMemo(() => {
        if (!pageData || !currentVerseKey) return null;

        for (const line of pageData.lines) {
            for (const word of line.words) {
                if (word.verseKey === currentVerseKey) {
                    return line.lineNumber;
                }
            }
        }
        return null;
    }, [pageData, currentVerseKey]);

    // Scroll to active line when it changes
    useEffect(() => {
        if (activeLineRef.current && isPlaying) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeLineNumber, isPlaying]);

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

    // Zoom handlers
    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
    }, []);

    const resetZoom = useCallback(() => {
        setZoom(1);
    }, []);

    // Pinch-to-zoom handler
    const handlePinchZoom = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (lastPinchDistance !== null) {
                const scale = distance / lastPinchDistance;
                setZoom(prev => {
                    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * scale));
                    return newZoom;
                });
            }
            setLastPinchDistance(distance);
        }
    }, [lastPinchDistance]);

    const handleTouchEnd = useCallback(() => {
        setLastPinchDistance(null);
    }, []);

    // Touch/swipe handling with Refs for performance
    const touchStartRef = useRef<number | null>(null);
    const touchEndRef = useRef<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        touchEndRef.current = null;
        touchStartRef.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndRef.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStartRef.current || !touchEndRef.current) return;
        const distance = touchStartRef.current - touchEndRef.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) goToNextPage();
        if (isRightSwipe) goToPrevPage();
    };

    // Check if a line contains the current playing verse
    const isLineActive = (line: MushafLine) => {
        if (!currentVerseKey) return false;
        return line.words.some(word => word.verseKey === currentVerseKey);
    };

    // Render a single line
    const renderLine = (line: MushafLine) => {
        const isActive = isPlaying && isLineActive(line);

        return (
            <div
                key={line.lineNumber}
                ref={isActive ? activeLineRef : null}
                className={`mushaf-line relative flex flex-wrap justify-center items-baseline px-1 py-1 transition-all duration-300 overflow-hidden ${isActive ? 'bg-primary/10 rounded-lg' : ''
                    }`}
                style={{
                    fontFamily: arabicFont,
                    fontSize: `clamp(16px, ${arabicFontSize * 0.7}px, ${arabicFontSize}px)`,
                    lineHeight: '2.2',
                    maxWidth: '100%',
                }}
                dir="rtl"
            >
                {/* Tracking Arrow */}
                {isActive && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 animate-pulse">
                        <ChevronDown className="w-6 h-6 text-primary/50 rotate-[-90deg]" />
                    </div>
                )}

                {line.words.map((word, idx) => (
                    <span
                        key={word.id || idx}
                        className={`inline-block mx-0.5 ${word.isEndMarker
                            ? 'text-primary font-bold mx-1'
                            : ''
                            }`}
                    >
                        {word.isEndMarker ? (
                            /* Enhanced Ayah End Marker - Islamic Style */
                            <span className="inline-flex items-center justify-center relative group">
                                {/* Outer decorative ring */}
                                <span className="absolute inset-0 w-7 h-7 rounded-full border-2 border-primary/30 transform rotate-45" />
                                {/* Inner decorative ring */}
                                <span className="absolute inset-0.5 w-6 h-6 rounded-full border border-primary/20" />
                                {/* Background with gradient */}
                                <span className="relative w-7 h-7 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center shadow-sm">
                                    {/* Ayah number */}
                                    <span className="text-[10px] font-semibold text-primary/90 number-font leading-none">
                                        {word.text}
                                    </span>
                                </span>
                                {/* Optional glow effect on hover */}
                                <span className="absolute inset-0 w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 bg-primary/10 transition-opacity duration-300" />
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
            style={{ touchAction: 'pan-x pan-y' }} // Allow scroll but prevent browser zoom
            onTouchStart={(e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                } else {
                    onTouchStart(e);
                }
            }}
            onTouchMove={(e) => {
                if (e.touches.length === 2) {
                    handlePinchZoom(e);
                } else {
                    onTouchMove(e);
                }
            }}
            onTouchEnd={() => {
                handleTouchEnd();
                onTouchEnd();
            }}
        >
            {/* Zoom Controls - Top Right */}
            <div className="absolute top-2 right-2 z-30 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg border border-border">
                <button
                    onClick={handleZoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    className="p-1.5 rounded-full hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Uzaklaştır"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium w-10 text-center text-muted-foreground">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={handleZoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    className="p-1.5 rounded-full hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Yakınlaştır"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>
                {zoom !== 1 && (
                    <button
                        onClick={resetZoom}
                        className="p-1.5 rounded-full hover:bg-secondary transition-colors ml-1"
                        aria-label="Sıfırla"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Decorative Border */}
            <div className="absolute inset-2 border-2 border-primary/20 rounded-xl pointer-events-none" />
            <div className="absolute inset-4 border border-primary/10 rounded-lg pointer-events-none" />

            {/* Left Side Navigation - NEXT Page (RTL: Quran reads right-to-left) */}
            {currentPage < 604 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        goToNextPage();
                    }}
                    className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 z-20 flex items-center justify-start group transition-all duration-300 outline-none"
                    aria-label="Sonraki sayfa"
                >
                    {/* Full height gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Arrow icon - centered vertically */}
                    <div className="relative ml-2 flex items-center justify-center transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300">
                        <div className="p-2 rounded-full bg-background/80 shadow-lg border border-border">
                            <ChevronLeft className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </button>
            )}

            {/* Right Side Navigation - PREVIOUS Page (RTL: Quran reads right-to-left) */}
            {currentPage > 1 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        goToPrevPage();
                    }}
                    className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 z-20 flex items-center justify-end group transition-all duration-300 outline-none"
                    aria-label="Önceki sayfa"
                >
                    {/* Full height gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-l from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Arrow icon - centered vertically */}
                    <div className="relative mr-2 flex items-center justify-center transform translate-x-full group-hover:translate-x-0 transition-transform duration-300">
                        <div className="p-2 rounded-full bg-background/80 shadow-lg border border-border">
                            <ChevronRight className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </button>
            )}

            {/* Page Content - with zoom transform */}
            <div
                className="relative p-3 sm:p-6 min-h-[70vh] overflow-auto transition-transform duration-200 origin-top-center"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
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
