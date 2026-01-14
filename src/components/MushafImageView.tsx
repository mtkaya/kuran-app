// MushafImageView - Display real Mushaf page images with zoom support
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { getPageImageUrl, getPageForAyah, PAGE_COUNT, getPageFirstAyah } from '../data/pageMapping';
import { useAudioStore } from '../store/audioStore';

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

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const lastTouchDistance = useRef<number>(0);

    const { currentSurahId, currentAyahNumber, isPlaying } = useAudioStore();

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
                    <span className="text-xs font-medium w-10 text-center">
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

                <div className="text-center min-w-[80px]">
                    <span className="text-xs font-medium">
                        {currentPage} / {PAGE_COUNT}
                    </span>
                    {pageInfo && (
                        <p className="text-[10px] text-muted-foreground">
                            Sure {pageInfo.surah}:{pageInfo.ayah}
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
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {imageError ? (
                    <div className="text-center text-muted-foreground p-8">
                        <p>Sayfa yüklenemedi</p>
                        <button
                            onClick={() => {
                                setImageError(false);
                                setIsLoading(true);
                            }}
                            className="mt-2 text-primary hover:underline"
                        >
                            Tekrar dene
                        </button>
                    </div>
                ) : (
                    <img
                        ref={imageRef}
                        src={getPageImageUrl(currentPage)}
                        alt={`Kur'an sayfa ${currentPage}`}
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

            {/* Zoom hint for first-time users */}
            {zoom === 1 && !isLoading && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full opacity-60 pointer-events-none">
                    Çift tıkla veya kaydır ile yakınlaştır
                </div>
            )}
        </div>
    );
};
