// MushafImageView - Display real Mushaf page images
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getPageImageUrl, getPageForAyah, PAGE_COUNT, getPageFirstAyah } from '../data/pageMapping';
import { useAudioStore } from '../store/audioStore';

interface MushafImageViewProps {
    surahId: number;
    initialAyah?: number;
}

export const MushafImageView: React.FC<MushafImageViewProps> = ({ surahId, initialAyah = 1 }) => {
    const [currentPage, setCurrentPage] = useState(() => getPageForAyah(surahId, initialAyah));
    const [isLoading, setIsLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

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

    // Reset loading state when page changes
    useEffect(() => {
        setIsLoading(true);
        setImageError(false);
    }, [currentPage]);

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
        <div className="flex flex-col h-full bg-[#FBF7F0] dark:bg-[#1a1a1a]">
            {/* Page Navigation Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-card/80 backdrop-blur-sm border-b border-border/30">
                <button
                    onClick={goToPrevPage}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-full hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Önceki sayfa"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="text-center">
                    <span className="text-sm font-medium">
                        Sayfa {currentPage} / {PAGE_COUNT}
                    </span>
                    {pageInfo && (
                        <p className="text-xs text-muted-foreground">
                            Sure {pageInfo.surah}, Ayet {pageInfo.ayah}
                        </p>
                    )}
                </div>

                <button
                    onClick={goToNextPage}
                    disabled={currentPage >= PAGE_COUNT}
                    className="p-2 rounded-full hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Sonraki sayfa"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Page Image */}
            <div className="flex-1 relative overflow-auto flex items-center justify-center p-2">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
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
                        src={getPageImageUrl(currentPage)}
                        alt={`Kur'an sayfa ${currentPage}`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        style={{
                            opacity: isLoading ? 0 : 1,
                            transition: 'opacity 0.3s ease'
                        }}
                    />
                )}
            </div>

            {/* Swipe hint */}
            <div className="text-center py-2 text-xs text-muted-foreground">
                ← Önceki / Sonraki →
            </div>
        </div>
    );
};
