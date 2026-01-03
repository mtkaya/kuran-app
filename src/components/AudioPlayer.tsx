// Audio Player Component - Sticky bottom mini player
import React from 'react';
import {
    Play, Pause, SkipBack, SkipForward, X,
    Repeat, Repeat1, Loader2
} from 'lucide-react';
import { useAudioStore, RepeatMode } from '../store/audioStore';
import { useLanguage } from '../context/LanguageContext';
import { getUIStrings } from '../i18n/strings';

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const AudioPlayer: React.FC = () => {
    const {
        isPlaying,
        isLoading,
        currentAyahNumber,
        surahName,
        progress,
        currentTime,
        duration,
        playbackRate,
        repeatMode,
        pause,
        resume,
        stop,
        nextAyah,
        prevAyah,
        seekTo,
        setPlaybackRate,
        setRepeatMode,
    } = useAudioStore();

    const { currentLanguage } = useLanguage();
    const ui = getUIStrings(currentLanguage);

    // Don't render if nothing is playing
    if (!surahName) return null;

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        seekTo(Math.max(0, Math.min(100, percent)));
    };

    const cyclePlaybackRate = () => {
        const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
        setPlaybackRate(PLAYBACK_RATES[nextIndex]);
    };

    const cycleRepeatMode = () => {
        const modes: RepeatMode[] = ['none', 'ayah', 'surah'];
        const currentIndex = modes.indexOf(repeatMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setRepeatMode(modes[nextIndex]);
    };

    const getRepeatIcon = () => {
        if (repeatMode === 'ayah') {
            return <Repeat1 className="w-4 h-4" />;
        }
        return <Repeat className="w-4 h-4" />;
    };

    const getRepeatLabel = () => {
        switch (repeatMode) {
            case 'ayah': return ui.repeatAyah;
            case 'surah': return ui.repeatSurah;
            default: return ui.repeatNone;
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg">
            {/* Progress Bar (clickable) */}
            <div
                className="h-1 bg-secondary cursor-pointer"
                onClick={handleProgressClick}
            >
                <div
                    className="h-full bg-primary transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="max-w-2xl mx-auto px-4 py-3">
                <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <button
                        onClick={isPlaying ? pause : resume}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        aria-label={isPlaying ? ui.pause : ui.play}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isPlaying ? (
                            <Pause className="w-5 h-5" />
                        ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                        )}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div className="truncate">
                                <span className="font-medium">{surahName}</span>
                                <span className="text-muted-foreground mx-1">•</span>
                                <span className="text-muted-foreground">{ui.verses} {currentAyahNumber}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1">
                        {/* Prev */}
                        <button
                            onClick={prevAyah}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            aria-label={ui.prevAyah}
                        >
                            <SkipBack className="w-4 h-4" />
                        </button>

                        {/* Next */}
                        <button
                            onClick={nextAyah}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            aria-label={ui.nextAyah}
                        >
                            <SkipForward className="w-4 h-4" />
                        </button>

                        {/* Speed */}
                        <button
                            onClick={cyclePlaybackRate}
                            className="px-2 py-1 rounded-lg hover:bg-secondary transition-colors text-xs font-medium min-w-[40px]"
                            aria-label={ui.playbackSpeed}
                        >
                            {playbackRate}x
                        </button>

                        {/* Repeat */}
                        <button
                            onClick={cycleRepeatMode}
                            className={`p-2 rounded-lg transition-colors ${repeatMode !== 'none'
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-secondary'
                                }`}
                            aria-label={getRepeatLabel()}
                            title={getRepeatLabel()}
                        >
                            {getRepeatIcon()}
                        </button>

                        {/* Close */}
                        <button
                            onClick={stop}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
