// MushafImageView - Display real Mushaf page images with zoom support
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2, ArrowLeft, Settings, ZoomIn, ZoomOut, Flag } from 'lucide-react';
import { getPageForAyah, PAGE_COUNT } from '../data/pageMapping';
import { getMushafPageUrl, MUSHAF_EDITIONS, getMushafEdition } from '../data/mushafProvider';
import { useAudioStore } from '../store/audioStore';
import { useSettingsStore } from '../store/settingsStore';
import { useReadingStore } from '../store/readingStore';
import { useOrientation } from '../hooks/useOrientation';
import { MushafNavigator } from './MushafNavigator';
import { getPageFirstAyah } from '../data/pageMapping';
import { getJuzForAyah } from '../data/juzData';
import { useQuranData } from '../hooks/useQuranData';
import { useLanguage } from '../context/LanguageContext';

interface MushafImageViewProps {
    surahId: number;
    initialAyah?: number;
    onOpenSettings?: () => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const LONG_PRESS_DURATION = 600; // ms

export const MushafImageView: React.FC<MushafImageViewProps> = ({ surahId, initialAyah, onOpenSettings }) => {
    const [currentPage, setCurrentPage] = useState(() => getPageForAyah(surahId, initialAyah || 1));
    const [isLoading, setIsLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    // Zoom and pan state
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // UI state
    const [showEditionSelector, setShowEditionSelector] = useState(false);
    const [isDualPageMode, setIsDualPageMode] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);

    // Marker position state (percentage based)
    const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(null);
    const [showMarkerFeedback, setShowMarkerFeedback] = useState(false);

    // Context for data
    const { currentLanguage } = useLanguage();
    const { quranData } = useQuranData(currentLanguage);

    // Orientation detection
    const { isLandscape } = useOrientation();
    const navigate = useNavigate();

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const lastTouchDistance = useRef<number>(0);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const longPressPosition = useRef<{ x: number; y: number } | null>(null);

    const { currentSurahId, currentAyahNumber, isPlaying } = useAudioStore();
    const { mushafEdition, setMushafEdition } = useSettingsStore();
    const { lastRead, setLastRead } = useReadingStore();
    const currentEdition = getMushafEdition(mushafEdition) || MUSHAF_EDITIONS[0];

    // Track initial last read page and marker position (captured once on mount)
    const [initialLastReadPage, setInitialLastReadPage] = useState<number | null>(null);
    const [initialMarkerPosition, setInitialMarkerPosition] = useState<{ x: number; y: number } | null>(null);

    // Capture the initial last read page and marker position on first render
    useEffect(() => {
        if (initialLastReadPage === null && lastRead?.page) {
            setInitialLastReadPage(lastRead.page);
            // Also capture initial marker position if available
            if (lastRead.markerX !== undefined && lastRead.markerY !== undefined) {
                setInitialMarkerPosition({ x: lastRead.markerX, y: lastRead.markerY });
                setMarkerPosition({ x: lastRead.markerX, y: lastRead.markerY });
            }
        }
    }, [lastRead, initialLastReadPage]);

    // Check if current page is the initial last read page (only show ribbon once, on that specific page)
    const isLastReadPage = initialLastReadPage !== null && initialLastReadPage === currentPage;

    // Auto-enable dual page mode in landscape on tablets/desktop
    useEffect(() => {
        if (isLandscape && window.innerWidth >= 768) {
            setIsDualPageMode(true);
        } else {
            setIsDualPageMode(false);
        }
    }, [isLandscape]);

    // Calculate left and right page numbers for dual-page mode (Quran style: right page is lower number)
    const rightPage = isDualPageMode ? (currentPage % 2 === 0 ? currentPage : currentPage - 1) : currentPage;
    const leftPage = isDualPageMode ? rightPage + 1 : currentPage;

    // Ensure valid page numbers
    const displayRightPage = Math.max(1, Math.min(PAGE_COUNT, rightPage));
    const displayLeftPage = Math.min(PAGE_COUNT, leftPage);

    // Save last read position when page changes
    useEffect(() => {
        const pageInfo = getPageFirstAyah(currentPage);
        if (pageInfo) {
            const surah = quranData.find(s => s.id === pageInfo.surah);
            if (surah) {
                setLastRead({
                    surahId: pageInfo.surah,
                    ayahId: 0,
                    ayahNumber: pageInfo.ayah,
                    surahName: surah.name_turkish,
                    page: currentPage,
                });
            }
        }
    }, [currentPage, quranData, setLastRead]);

    // Sync page with audio playback
    useEffect(() => {
        if (isPlaying && currentSurahId && currentAyahNumber) {
            const targetPage = getPageForAyah(currentSurahId, currentAyahNumber);
            if (targetPage !== currentPage) {
                setCurrentPage(targetPage);
            }
        }
    }, [currentSurahId, currentAyahNumber, isPlaying, currentPage]);

    // Reset loading state and zoom when page changes
    useEffect(() => {
        setIsLoading(true);
        setImageError(false);
        resetZoom();
    }, [currentPage]);

    const resetZoom = useCallback(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    // Double-click to zoom
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        if (zoom >= 2) {
            resetZoom();
        } else {
            setZoom(2);
            // Center zoom on click position
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * -0.5;
                const y = (e.clientY - rect.top - rect.height / 2) * -0.5;
                setPosition({ x, y });
            }
        }
    }, [zoom, resetZoom]);

    // Mouse wheel zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom(prev => {
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta));
            if (newZoom <= 1) {
                setPosition({ x: 0, y: 0 });
            }
            return newZoom;
        });
    }, []);

    // Mouse drag for panning when zoomed
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    }, [zoom, position]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    }, [isDragging, zoom, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch events for pinch-to-zoom
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Clear long press timer on multi-touch
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            lastTouchDistance.current = distance;
        } else if (e.touches.length === 1) {
            const touch = e.touches[0];
            const container = containerRef.current;

            // Store touch position for long press
            if (container) {
                const rect = container.getBoundingClientRect();
                const x = ((touch.clientX - rect.left) / rect.width) * 100;
                const y = ((touch.clientY - rect.top) / rect.height) * 100;
                longPressPosition.current = { x, y };
            }

            // Start long press timer
            longPressTimer.current = setTimeout(() => {
                if (longPressPosition.current && zoom === 1) {
                    // Long press triggered - place marker
                    setMarkerPosition(longPressPosition.current);
                    setShowMarkerFeedback(true);

                    // Save marker position to storage
                    const pageInfo = getPageFirstAyah(currentPage);
                    if (pageInfo) {
                        const surah = quranData.find(s => s.id === pageInfo.surah);
                        if (surah) {
                            setLastRead({
                                surahId: pageInfo.surah,
                                ayahId: 0,
                                ayahNumber: pageInfo.ayah,
                                surahName: surah.name_turkish,
                                page: currentPage,
                                markerX: longPressPosition.current.x,
                                markerY: longPressPosition.current.y,
                            });
                        }
                    }

                    // Haptic feedback (vibration)
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }

                    // Hide feedback after animation
                    setTimeout(() => setShowMarkerFeedback(false), 1500);
                }
            }, LONG_PRESS_DURATION);

            // Handle panning if zoomed
            if (zoom > 1) {
                setIsDragging(true);
                setDragStart({
                    x: touch.clientX - position.x,
                    y: touch.clientY - position.y
                });
            }
        }
    }, [zoom, position, currentPage, quranData, setLastRead]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        // Cancel long press on move
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        if (e.touches.length === 2) {
            e.preventDefault();
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );

            if (lastTouchDistance.current > 0) {
                const scale = distance / lastTouchDistance.current;
                setZoom(prev => {
                    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * scale));
                    if (newZoom <= 1) {
                        setPosition({ x: 0, y: 0 });
                    }
                    return newZoom;
                });
            }
            lastTouchDistance.current = distance;
        } else if (e.touches.length === 1 && isDragging && zoom > 1) {
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        }
    }, [isDragging, zoom, dragStart]);

    const handleTouchEnd = useCallback(() => {
        // Clear long press timer
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        longPressPosition.current = null;
        lastTouchDistance.current = 0;
        setIsDragging(false);
    }, []);

    const goToPrevPage = () => {
        const step = isDualPageMode ? 2 : 1;
        if (currentPage > 1) {
            setCurrentPage(Math.max(1, currentPage - step));
        }
    };

    const goToNextPage = () => {
        const step = isDualPageMode ? 2 : 1;
        if (currentPage < PAGE_COUNT) {
            setCurrentPage(Math.min(PAGE_COUNT, currentPage + step));
        }
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setImageError(true);
    };

    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoom(prev => Math.min(MAX_ZOOM, prev + 0.5));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoom(prev => {
            const newZoom = Math.max(MIN_ZOOM, prev - 0.5);
            if (newZoom <= 1) setPosition({ x: 0, y: 0 });
            return newZoom;
        });
    };



    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* Floating Toggle Button - Always visible when controls hidden */}
            {/* Floating Toggle Button removed - Use tap to toggle */}

            {/* Minimal Header - Only Back & Settings */}
            {/* Minimal Header - Custom Layout */}
            {/* Minimal Header - Custom Layout */}
            <div
                className={`absolute top-0 left-0 right-0 z-50 flex items-start justify-between px-4 py-3 transition-all duration-300 pointer-events-none ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                    }`}
                style={{ paddingTop: 'calc(env(safe-area-inset-top, 50px) + 1.5rem)' }}
            >
                {/* Left: Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="pointer-events-auto p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                {/* Center: Info Button (Opens Navigator) */}
                <button
                    onClick={() => setIsNavigatorOpen(true)}
                    className="pointer-events-auto flex flex-col items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-6 py-2 text-white hover:bg-black/60 transition-all active:scale-95 shadow-sm mx-2"
                >
                    <span className="text-[10px] text-white/70 font-medium tracking-wide uppercase">
                        {(() => {
                            const pageInfo = getPageFirstAyah(currentPage);
                            if (!pageInfo) return 'Cüz 1';
                            const juz = getJuzForAyah(pageInfo.surah, pageInfo.ayah);
                            return `${juz}. Cüz • Sayfa ${currentPage}`;
                        })()}
                    </span>
                    <span className="font-semibold text-sm">
                        {(() => {
                            const pageInfo = getPageFirstAyah(currentPage);
                            if (!pageInfo) return 'Kuran-ı Kerim';
                            const surah = quranData.find(s => s.id === pageInfo.surah);
                            return surah ? surah.name_turkish : '...';
                        })()}
                    </span>
                </button>

                {/* Right: Actions */}
                <div className="flex gap-2 pointer-events-auto">
                    {/* Save Last Read Position Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const pageInfo = getPageFirstAyah(currentPage);
                            if (pageInfo) {
                                const surah = quranData.find(s => s.id === pageInfo.surah);
                                if (surah) {
                                    // Save current position as last read
                                    setLastRead({
                                        surahId: pageInfo.surah,
                                        ayahId: 0,
                                        ayahNumber: pageInfo.ayah,
                                        surahName: surah.name_turkish,
                                        page: currentPage,
                                        markerX: markerPosition?.x,
                                        markerY: markerPosition?.y,
                                    });

                                    // Update initial values so ribbon shows immediately
                                    setInitialLastReadPage(currentPage);
                                    if (markerPosition) {
                                        setInitialMarkerPosition(markerPosition);
                                    }

                                    // Show feedback
                                    setShowMarkerFeedback(true);
                                    setTimeout(() => setShowMarkerFeedback(false), 1500);

                                    // Haptic feedback
                                    if (navigator.vibrate) {
                                        navigator.vibrate(50);
                                    }
                                }
                            }
                        }}
                        className={`p-3 rounded-full backdrop-blur-md transition-all shadow-sm ${isLastReadPage
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-black/40 text-white hover:bg-black/60'
                            }`}
                        title="Son okunan yeri kaydet"
                    >
                        <Flag className={`w-6 h-6 ${isLastReadPage ? 'fill-white' : ''}`} />
                    </button>

                    {/* Settings Button */}
                    <button
                        onClick={onOpenSettings}
                        className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors shadow-sm"
                    >
                        <Settings className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Bottom Navigation Buttons - Visible when controls shown */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-40 px-6 pb-6 pt-4 flex items-end justify-between transition-all duration-300 pointer-events-none ${showControls && !isNavigatorOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                    }`}
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 1.5rem)' }}
            >
                {/* Previous Page Button (Left) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        goToNextPage();
                    }}
                    disabled={currentPage >= PAGE_COUNT}
                    className="pointer-events-auto flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 transition-all active:scale-95 disabled:opacity-0 shadow-lg"
                >
                    <ChevronLeft className="w-7 h-7 lg:w-8 lg:h-8 mr-0.5" />
                </button>

                {/* Center: Zoom Controls */}
                <div className="pointer-events-auto flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1.5 shadow-lg mb-1">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoom <= MIN_ZOOM}
                        className="p-2.5 rounded-full hover:bg-white/10 text-white transition-colors disabled:opacity-30 active:scale-95"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <div className="w-px h-4 bg-white/20" />
                    <button
                        onClick={handleZoomIn}
                        disabled={zoom >= MAX_ZOOM}
                        className="p-2.5 rounded-full hover:bg-white/10 text-white transition-colors disabled:opacity-30 active:scale-95"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>

                {/* Next Page Button (Right) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        goToPrevPage();
                    }}
                    disabled={currentPage <= 1}
                    className="pointer-events-auto flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 transition-all active:scale-95 disabled:opacity-0 shadow-lg"
                >
                    <ChevronRight className="w-7 h-7 lg:w-8 lg:h-8 ml-0.5" />
                </button>
            </div>

            {/* Navigator Sheet */}
            <MushafNavigator
                isOpen={isNavigatorOpen}
                onClose={() => setIsNavigatorOpen(false)}
                currentPage={currentPage}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    // Also close controls after navigating
                    setShowControls(false);
                }}
                surahId={getPageFirstAyah(currentPage)?.surah}
            />

            {/* Mushaf Edition Selector Dropdown */}
            {
                showEditionSelector && (
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-xl shadow-xl p-2 min-w-[280px] max-h-[60vh] overflow-y-auto">
                        <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                            Mushaf Seçin
                        </div>
                        {MUSHAF_EDITIONS.map((edition) => (
                            <button
                                key={edition.id}
                                onClick={() => {
                                    setMushafEdition(edition.id);
                                    setShowEditionSelector(false);
                                    setIsLoading(true);
                                    setImageError(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${mushafEdition === edition.id
                                    ? 'bg-primary/10 border border-primary/30'
                                    : 'hover:bg-secondary'
                                    }`}
                            >
                                <span className="text-2xl">{edition.flag}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{edition.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{edition.description}</div>
                                </div>
                                {!edition.isLocal && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded">Online</span>
                                )}
                            </button>
                        ))}
                    </div>
                )
            }

            {/* Click outside to close dropdown */}
            {
                showEditionSelector && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowEditionSelector(false)}
                    />
                )
            }

            {/* Page Image - fills remaining space */}
            <div
                ref={containerRef}
                className="flex-1 relative overflow-hidden flex items-center justify-center"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDoubleClick={handleDoubleClick}
                style={{
                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    touchAction: 'none'
                }}
                onClick={() => {
                    // Only toggle if not dragging and not double clicking
                    if (!isDragging && zoom === 1) {
                        setShowControls(prev => !prev);
                    }
                }}
            >
                {/* Son Okunan Marker - Shows at custom position or default top-right */}
                {isLastReadPage && (
                    <div
                        className="absolute z-30 pointer-events-none animate-in fade-in slide-in-from-top duration-500"
                        style={{
                            // Use custom marker position if available, otherwise default to top-right
                            ...(markerPosition || initialMarkerPosition ? {
                                left: `${(markerPosition || initialMarkerPosition)!.x}%`,
                                top: `${(markerPosition || initialMarkerPosition)!.y}%`,
                                transform: 'translate(-50%, -100%)'
                            } : {
                                top: '1rem',
                                right: '1rem'
                            })
                        }}
                    >
                        {/* Ribbon shape */}
                        <div className="relative">
                            {/* Ribbon body */}
                            <div className="bg-gradient-to-b from-red-500 to-red-600 text-white px-3 py-2 rounded-t-lg shadow-lg border-l-2 border-r-2 border-t-2 border-red-400/50">
                                <div className="flex items-center gap-1.5">
                                    <Flag className="w-3.5 h-3.5 fill-white" />
                                    <span className="text-[10px] font-bold tracking-wide">SON OKUNAN</span>
                                </div>
                            </div>
                            {/* Ribbon tail */}
                            <div className="flex justify-center">
                                <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-600" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Long Press Feedback - Shows when marker is being placed */}
                {showMarkerFeedback && markerPosition && (
                    <div
                        className="absolute z-40 pointer-events-none animate-in zoom-in fade-in duration-300"
                        style={{
                            left: `${markerPosition.x}%`,
                            top: `${markerPosition.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {/* Pulsing circle effect */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping" style={{ width: '60px', height: '60px', marginLeft: '-30px', marginTop: '-30px' }} />
                            <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg border-2 border-white" />
                        </div>
                    </div>
                )}

                {/* Left Side Navigation - NEXT Page (RTL: Quran reads right-to-left) */}
                {currentPage < PAGE_COUNT && zoom === 1 && (
                    <button
                        onClick={goToNextPage}
                        className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 z-20 flex items-center justify-start group transition-all duration-300"
                        aria-label="Sonraki sayfa"
                    >
                        {/* Full height gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent opacity-30 group-hover:opacity-80 group-active:opacity-100 transition-opacity duration-300" />

                        {/* Vertical line indicator */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 group-hover:bg-primary group-hover:w-1.5 transition-all duration-300" />

                        {/* Arrow icon - centered vertically */}
                        <div className="relative ml-2 sm:ml-3 flex items-center justify-center opacity-50 group-hover:opacity-100 group-hover:scale-110 group-active:scale-95 transition-all duration-200">
                            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" strokeWidth={2.5} />
                        </div>

                        {/* Page number tooltip - appears on hover */}
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg">
                            <span className="font-medium">{currentPage + 1}</span>
                            <span className="text-white/60 ml-1">/ {PAGE_COUNT}</span>
                        </div>
                    </button>
                )}

                {/* Right Side Navigation - PREVIOUS Page (RTL: Quran reads right-to-left) */}
                {currentPage > 1 && zoom === 1 && (
                    <button
                        onClick={goToPrevPage}
                        className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 z-20 flex items-center justify-end group transition-all duration-300"
                        aria-label="Önceki sayfa"
                    >
                        {/* Full height gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-black/20 to-transparent opacity-30 group-hover:opacity-80 group-active:opacity-100 transition-opacity duration-300" />

                        {/* Vertical line indicator */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 group-hover:bg-primary group-hover:w-1.5 transition-all duration-300" />

                        {/* Arrow icon - centered vertically */}
                        <div className="relative mr-2 sm:mr-3 flex items-center justify-center opacity-50 group-hover:opacity-100 group-hover:scale-110 group-active:scale-95 transition-all duration-200">
                            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" strokeWidth={2.5} />
                        </div>

                        {/* Page number tooltip - appears on hover */}
                        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg">
                            <span className="font-medium">{currentPage - 1}</span>
                            <span className="text-white/60 ml-1">/ {PAGE_COUNT}</span>
                        </div>
                    </button>
                )}

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="text-xs text-muted-foreground">{currentEdition.name}</span>
                        </div>
                    </div>
                )}

                {imageError ? (
                    <div className="text-center text-muted-foreground p-8">
                        <p className="mb-2">Sayfa yüklenemedi</p>
                        <p className="text-xs mb-3">{currentEdition.name}</p>
                        <button
                            onClick={() => {
                                setImageError(false);
                                setIsLoading(true);
                            }}
                            className="text-primary hover:underline text-sm"
                        >
                            Tekrar dene
                        </button>
                    </div>
                ) : isDualPageMode ? (
                    /* Dual Page Mode - Two pages side by side like a real book */
                    <div className="flex items-center justify-center gap-1 md:gap-2 lg:gap-4 h-full px-2">
                        {/* Left Page (higher page number in Quran) */}
                        {displayLeftPage <= PAGE_COUNT && (
                            <div className="flex-1 h-full flex items-center justify-center max-w-[48%]">
                                <img
                                    src={getMushafPageUrl(mushafEdition, displayLeftPage)}
                                    alt={`Kur'an sayfa ${displayLeftPage} - ${currentEdition.name}`}
                                    onLoad={() => { }} // Loading tracked globally
                                    onError={handleImageError}
                                    draggable={false}
                                    className="max-w-full max-h-full object-contain select-none shadow-lg rounded-sm"
                                    style={{
                                        opacity: isLoading ? 0 : 1,
                                        transition: 'opacity 0.3s ease'
                                    }}
                                />
                            </div>
                        )}
                        {/* Page Divider / Binding Effect */}
                        <div className="w-px md:w-1 h-[80%] bg-gradient-to-b from-transparent via-border to-transparent opacity-50" />
                        {/* Right Page (lower page number in Quran) */}
                        <div className="flex-1 h-full flex items-center justify-center max-w-[48%]">
                            <img
                                ref={imageRef}
                                src={getMushafPageUrl(mushafEdition, displayRightPage)}
                                alt={`Kur'an sayfa ${displayRightPage} - ${currentEdition.name}`}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                                draggable={false}
                                className="max-w-full max-h-full object-contain select-none shadow-lg rounded-sm"
                                style={{
                                    opacity: isLoading ? 0 : 1,
                                    transition: 'opacity 0.3s ease'
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    /* Single Page Mode */
                    <img
                        ref={imageRef}
                        src={getMushafPageUrl(mushafEdition, currentPage)}
                        alt={`Kur'an sayfa ${currentPage} - ${currentEdition.name}`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        draggable={false}
                        className="max-w-full max-h-full object-contain select-none"
                        style={{
                            opacity: isLoading ? 0 : 1,
                            transition: isDragging ? 'none' : 'transform 0.2s ease, opacity 0.3s ease',
                            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                            transformOrigin: 'center center'
                        }}
                    />
                )}
            </div>

            {/* Bottom Info Removed for clean view */}
        </div >
    );
};
