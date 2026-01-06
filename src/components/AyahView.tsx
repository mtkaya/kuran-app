import React, { useState } from 'react';
import { Ayah } from '../types';
import { Share2, Bookmark, BookmarkCheck, Play, Pause, FileText, X, Save } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';
import { useSettingsStore } from '../store/settingsStore';
import { useAudioStore } from '../store/audioStore';
import { useNotesStore } from '../store/notesStore';
import { useLanguage } from '../context/LanguageContext';
import { getUIStrings } from '../i18n/strings';
import { getTransliteration } from '../data/transliteration';

interface AyahViewProps {
    ayah: Ayah;
    surahName: string;
    totalAyahs: number;
    onCopy?: (text: string) => void;
}

export const AyahView: React.FC<AyahViewProps> = ({ ayah, surahName, totalAyahs, onCopy }) => {
    const { isBookmarked, toggleBookmark } = useBookmarkStore();
    const { arabicFontSize, mealFontSize, showTransliteration, memorizationMode, arabicFont } = useSettingsStore();
    const { isPlaying, currentAyahId, play, pause, resume, initAudio } = useAudioStore();
    const { notes, addNote, getNotesByAyah } = useNotesStore();
    const { currentLanguage } = useLanguage();
    const ui = getUIStrings(currentLanguage);

    // Memorization mode - track if this ayah is revealed
    const [revealed, setRevealed] = useState(false);

    // Note modal state
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteContent, setNoteContent] = useState('');

    const transliteration = showTransliteration ? getTransliteration(ayah.surah_id, ayah.ayah_number) : null;

    const bookmarked = isBookmarked(ayah.surah_id, ayah.id);
    const isCurrentlyPlaying = isPlaying && currentAyahId === ayah.id;
    const ayahNotes = getNotesByAyah(ayah.id);
    const hasNotes = ayahNotes.length > 0;

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

    const handleOpenNoteModal = () => {
        // Pre-fill with existing note if any
        if (ayahNotes.length > 0) {
            setNoteContent(ayahNotes[0].content);
        } else {
            setNoteContent('');
        }
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = () => {
        if (noteContent.trim()) {
            addNote(ayah.surah_id, ayah.id, ayah.ayah_number, surahName, noteContent.trim());
            setIsNoteModalOpen(false);
            setNoteContent('');
            onCopy?.('Not eklendi!');
        }
    };

    return (
        <>
            <div
                id={`ayah-${ayah.id}`}
                className={`py-6 border-b last:border-0 transition-colors ${isCurrentlyPlaying
                    ? 'bg-primary/5 border-l-4 border-l-primary pl-4 -ml-4'
                    : 'hover:bg-accent/5'
                    }`}
            >
                {/* Arabic Text (Right Aligned) */}
                <div
                    className={`text-right mb-4 ${memorizationMode && !revealed ? 'cursor-pointer' : ''}`}
                    onClick={() => memorizationMode && !revealed && setRevealed(true)}
                >
                    <p
                        className={`font-arabic leading-loose font-medium transition-all duration-300 ${memorizationMode && !revealed ? 'blur-md select-none' : ''
                            }`}
                        dir="rtl"
                        style={{ fontSize: `${arabicFontSize}px`, lineHeight: '2', fontFamily: arabicFont }}
                    >
                        {ayah.text_arabic}
                        <span className="inline-flex items-center justify-center w-8 h-8 mr-2 text-sm border border-primary rounded-full text-primary number-font blur-none">
                            {ayah.ayah_number}
                        </span>
                    </p>
                    {memorizationMode && !revealed && (
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                            {ui.tapToReveal}
                        </p>
                    )}
                </div>

                {/* Transliteration (if enabled) */}
                {transliteration && (
                    <div className="mb-4 py-2 px-3 bg-secondary/30 rounded-lg border-l-2 border-primary/50">
                        <p
                            className={`text-muted-foreground italic transition-all duration-300 ${memorizationMode && !revealed ? 'blur-md select-none' : ''
                                }`}
                            style={{ fontSize: `${mealFontSize - 2}px` }}
                        >
                            {transliteration}
                        </p>
                    </div>
                )}

                {/* Meal (Left Aligned) */}
                <div className="space-y-2">
                    <p
                        className={`text-foreground/90 leading-relaxed font-sans transition-all duration-300 ${memorizationMode && !revealed ? 'blur-md select-none' : ''
                            }`}
                        style={{ fontSize: `${mealFontSize}px` }}
                    >
                        {ayah.text_meal}
                    </p>
                </div>

                {/* Existing Notes Display */}
                {hasNotes && (
                    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Notum</span>
                        </div>
                        <p className="text-sm text-foreground/80">{ayahNotes[0].content}</p>
                    </div>
                )}

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

                    {/* Note Button */}
                    <button
                        onClick={handleOpenNoteModal}
                        className={`p-2 rounded-lg transition-colors ${hasNotes
                            ? 'text-amber-500 bg-amber-500/10'
                            : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-500/5'
                            }`}
                        aria-label="Not Ekle"
                    >
                        <FileText className="w-5 h-5" />
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

            {/* Note Modal */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-amber-500" />
                                <h3 className="font-semibold">Not Ekle</h3>
                            </div>
                            <button
                                onClick={() => setIsNoteModalOpen(false)}
                                className="p-1 hover:bg-secondary rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Ayah Reference */}
                        <div className="p-4 bg-secondary/30 border-b border-border">
                            <p className="text-sm text-muted-foreground mb-1">{surahName} {ayah.surah_id}:{ayah.ayah_number}</p>
                            <p
                                className="font-arabic text-right text-lg leading-relaxed"
                                dir="rtl"
                                style={{ fontFamily: arabicFont }}
                            >
                                {ayah.text_arabic.substring(0, 100)}...
                            </p>
                        </div>

                        {/* Note Input */}
                        <div className="p-4">
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Bu ayet hakkında notunuzu yazın..."
                                className="w-full p-3 bg-secondary rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                                autoFocus
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-2 p-4 border-t border-border">
                            <button
                                onClick={() => setIsNoteModalOpen(false)}
                                className="flex-1 py-2 px-4 text-sm text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSaveNote}
                                disabled={!noteContent.trim()}
                                className="flex-1 py-2 px-4 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

