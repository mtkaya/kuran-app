// MushafImageView - Display real Mushaf page images with zoom support
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, RotateCcw, BookOpen } from 'lucide-react';
import { getPageForAyah, PAGE_COUNT, getPageFirstAyah } from '../data/pageMapping';
import { getMushafPageUrl, MUSHAF_EDITIONS, getMushafEdition } from '../data/mushafProvider';
import { useAudioStore } from '../store/audioStore';
import { useSettingsStore } from '../store/settingsStore';

interface MushafImageViewProps {
    surahId: number;
    initialAyah?: number;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export const MushafImageView: React.FC<MushafImageViewProps> = ({ surahId, initialAyah = 1 }) => {
    const [currentPage, setCurrentPage] = useState(() => getPageForAyah(surahId, initialAyah));
    const [isLoading, setIsLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showEditionSelector, setShowEditionSelector] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const lastTouchDistance = useRef<number>(0);

    const { currentSurahId, currentAyahNumber, isPlaying } = useAudioStore();
    const { mushafEdition, setMushafEdition } = useSettingsStore();
    const currentEdition = getMushafEdition(mushafEdition) || MUSHAF_EDITIONS[0];

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

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => {
            const newZoom = Math.max(prev - ZOOM_STEP, MIN_ZOOM);
            if (newZoom <= 1) {
                setPosition({ x: 0, y: 0 });
            }
            return newZoom;
        });
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
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            lastTouchDistance.current = distance;
        } else if (e.touches.length === 1 && zoom > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y
            });
        }
    }, [zoom, position]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
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
        lastTouchDistance.current = 0;
        setIsDragging(false);
    }, []);

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < PAGE_COUNT) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setImageError(true);
    };

    const pageInfo = getPageFirstAyah(currentPage);

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Page Navigation Header */}
            <div className="flex items-center justify-between px-2 py-2 bg-card/80 backdrop-blur-sm border-b border-border/30">
                <button
                    onClick={goToPrevPage}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-full hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Önceki sayfa"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Mushaf Edition Selector */}
                <button
                    onClick={() => setShowEditionSelector(!showEditionSelector)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    aria-label="Mushaf Seç"
                >
                    <span className="text-sm">{currentEdition.flag}</span>
                    <BookOpen className="w-3.5 h-3.5" />
                </button>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoom <= MIN_ZOOM}
                        className="p-1.5 rounded-full hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Uzaklaştır"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium w-8 text-center">
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
                            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                            aria-label="Sıfırla"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="text-center min-w-[60px]">
                    <span className="text-xs font-medium">
                        {currentPage} / {PAGE_COUNT}
                    </span>
                    {pageInfo && (
                        <p className="text-[10px] text-muted-foreground">
                            {pageInfo.surah}:{pageInfo.ayah}
                        </p>
                    )}
                </div>

                <button
                    onClick={goToNextPage}
                    disabled={currentPage >= PAGE_COUNT}
                    className="p-2 rounded-full hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Sonraki sayfa"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Mushaf Edition Selector Dropdown */}
            {showEditionSelector && (
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
            )}

            {/* Click outside to close dropdown */}
            {showEditionSelector && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowEditionSelector(false)}
                />
            )}

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
            >
                {/* Left Side Navigation - Previous Page - Full Height */}
                {currentPage > 1 && zoom === 1 && (
                    <button
                        onClick={goToPrevPage}
                        className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 z-20 flex items-center justify-start group transition-all duration-300"
                        aria-label="Önceki sayfa"
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
                            <span className="font-medium">{currentPage - 1}</span>
                            <span className="text-white/60 ml-1">/ {PAGE_COUNT}</span>
                        </div>
                    </button>
                )}

                {/* Right Side Navigation - Next Page - Full Height */}
                {currentPage < PAGE_COUNT && zoom === 1 && (
                    <button
                        onClick={goToNextPage}
                        className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 z-20 flex items-center justify-end group transition-all duration-300"
                        aria-label="Sonraki sayfa"
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
                            <span className="font-medium">{currentPage + 1}</span>
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
                ) : (
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

            {/* Bottom Page Info & Quick Navigation */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 py-3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10">
                {/* Current Edition & Page Info */}
                <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full pointer-events-auto">
                    <span className="text-base">{currentEdition.flag}</span>
                    <div className="w-px h-4 bg-white/30" />
                    <span className="font-medium">{currentPage}</span>
                    <span className="text-white/60">/ {PAGE_COUNT}</span>
                </div>
            </div>
        </div>
    );
};
