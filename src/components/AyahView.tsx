import React from 'react';
import { Ayah } from '../types';
import { Share2, Bookmark, BookmarkCheck, Play, Pause } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';
import { useSettingsStore } from '../store/settingsStore';
import { useAudioStore } from '../store/audioStore';
import { useLanguage } from '../context/LanguageContext';
import { getUIStrings } from '../i18n/strings';

interface AyahViewProps {
    ayah: Ayah;
    surahName: string;
    totalAyahs: number;
    onCopy?: (text: string) => void;
}

export const AyahView: React.FC<AyahViewProps> = ({ ayah, surahName, totalAyahs, onCopy }) => {
    const { isBookmarked, toggleBookmark } = useBookmarkStore();
    const { arabicFontSize, mealFontSize } = useSettingsStore();
    const { isPlaying, currentAyahId, play, pause, resume, initAudio } = useAudioStore();
    const { currentLanguage } = useLanguage();
    const ui = getUIStrings(currentLanguage);

    const bookmarked = isBookmarked(ayah.surah_id, ayah.id);
    const isCurrentlyPlaying = isPlaying && currentAyahId === ayah.id;

    const handleBookmark = () => {
        toggleBookmark({
            surahId: ayah.surah_id,
            ayahId: ayah.id,
            surahName,
            ayahNumber: ayah.ayah_number,
        });
    };

    const handleShare = async () => {
        const text = `${ayah.text_arabic}\n\n${ayah.text_meal}\n\n— ${surahName}: ${ayah.ayah_number}`;

        try {
            await navigator.clipboard.writeText(text);
            onCopy?.(ui.copied);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            onCopy?.(ui.copied);
        }
    };

    const handlePlay = () => {
        // Initialize audio on first interaction
        initAudio();

        if (isCurrentlyPlaying) {
            pause();
        } else if (currentAyahId === ayah.id) {
            resume();
        } else {
            play(ayah.surah_id, ayah.id, ayah.ayah_number, surahName, totalAyahs);
        }
    };

    return (
        <div
            id={`ayah-${ayah.id}`}
            className={`py-6 border-b last:border-0 transition-colors ${isCurrentlyPlaying
                    ? 'bg-primary/5 border-l-4 border-l-primary pl-4 -ml-4'
                    : 'hover:bg-accent/5'
                }`}
        >
            {/* Arabic Text (Right Aligned) */}
            <div className="text-right mb-4">
                <p
                    className="font-arabic leading-loose font-medium"
                    dir="rtl"
                    style={{ fontSize: `${arabicFontSize}px`, lineHeight: '2' }}
                >
                    {ayah.text_arabic}
                    <span className="inline-flex items-center justify-center w-8 h-8 mr-2 text-sm border border-primary rounded-full text-primary number-font">
                        {ayah.ayah_number}
                    </span>
                </p>
            </div>

            {/* Meal (Left Aligned) */}
            <div className="space-y-2">
                <p
                    className="text-foreground/90 leading-relaxed font-sans"
                    style={{ fontSize: `${mealFontSize}px` }}
                >
                    {ayah.text_meal}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-2">
                {/* Play Button */}
                <button
                    onClick={handlePlay}
                    className={`p-2 rounded-lg transition-colors ${isCurrentlyPlaying
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                        }`}
                    aria-label={isCurrentlyPlaying ? ui.pause : ui.playAyah}
                >
                    {isCurrentlyPlaying ? (
                        <Pause className="w-5 h-5" />
                    ) : (
                        <Play className="w-5 h-5" />
                    )}
                </button>

                {/* Bookmark Button */}
                <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-lg transition-colors ${bookmarked
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                        }`}
                    aria-label={bookmarked ? ui.removeBookmark : ui.addBookmark}
                >
                    {bookmarked ? (
                        <BookmarkCheck className="w-5 h-5" />
                    ) : (
                        <Bookmark className="w-5 h-5" />
                    )}
                </button>

                {/* Share Button */}
                <button
                    onClick={handleShare}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                    aria-label={ui.copyVerse}
                >
                    <Share2 className="w-5 h-5" />
                </button>

                {/* Related Verses Placeholder */}
                {ayah.related_ayahs && (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md self-center ml-auto">
                        Bağlantılı Ayetler
                    </span>
                )}
            </div>
        </div>
    );
};
