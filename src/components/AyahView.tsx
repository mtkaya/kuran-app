import React, { useState, useEffect } from 'react';
import { Ayah } from '../types';
import { Share2, Bookmark, BookmarkCheck, Play, Pause, FileText, Flag } from 'lucide-react';
import { NoteModal } from './NoteModal';
import { VerseCardSheet } from './VerseCardSheet';
import { useBookmarkStore } from '../store/bookmarkStore';
import { useReadingStore } from '../store/readingStore';
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
    onSelect?: (ayah: Ayah) => void;
    isSelected?: boolean;
}

export const AyahView: React.FC<AyahViewProps> = ({ ayah, surahName, totalAyahs, onCopy, onSelect, isSelected }) => {
    const { lastRead } = useReadingStore();
    const { isBookmarked, toggleBookmark } = useBookmarkStore();
    const { arabicFontSize, mealFontSize, showTransliteration, memorizationMode, arabicFont } = useSettingsStore();
    const { isPlaying, currentAyahId, memorization, memorizationRepeat, play, pause, resume, initAudio } = useAudioStore();
    const { addNote, getNotesByAyah } = useNotesStore();
    const { currentLanguage } = useLanguage();
    const ui = getUIStrings(currentLanguage);

    // Memorization mode - track if this ayah is revealed
    const [revealed, setRevealed] = useState(false);

    // Each recitation is a fresh test: hide the text again whenever a new
    // repetition of this ayah starts during a drill
    const drillCursor = memorization && currentAyahId === ayah.id ? memorizationRepeat : null;
    useEffect(() => {
        if (drillCursor !== null) setRevealed(false);
    }, [drillCursor]);

    // Leaving memorization mode clears the per-ayah reveal state
    useEffect(() => {
        if (!memorizationMode) setRevealed(false);
    }, [memorizationMode]);

    // Note modal state
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isCardOpen, setIsCardOpen] = useState(false);

    const transliteration = showTransliteration ? getTransliteration(ayah.surah_id, ayah.ayah_number) : null;

    const bookmarked = isBookmarked(ayah.surah_id, ayah.id);
    const isLastRead = lastRead?.surahId === ayah.surah_id && lastRead?.ayahId === ayah.id;
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
        } catch (err) {
            // Modern browsers require user interaction for clipboard access
            console.error('Clipboard API failed:', err);
            onCopy?.('Kopyalama başarısız');
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
        setIsNoteModalOpen(true);
    };

    return (
        <>
            <div
                id={`ayah-${ayah.id}`}
                onClick={() => onSelect?.(ayah)}
                className={`py-5 px-4 rounded-xl transition-all cursor-pointer ${isCurrentlyPlaying
                    ? 'bg-primary/10 border-2 border-primary/50 shadow-lg shadow-primary/10'
                    : isSelected
                        ? 'bg-accent border-2 border-primary/30 shadow-md'
                        : 'bg-card border border-border/50 hover:border-primary/30 hover:shadow-md'
                    }`}
            >
                {/* Arabic Text (Right Aligned) */}
                <div
                    className={`text-right mb-4 overflow-hidden ${memorizationMode && !revealed ? 'cursor-pointer' : ''}`}
                    onClick={() => memorizationMode && !revealed && setRevealed(true)}
                >
                    {isLastRead && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 bg-red-500/15 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold shadow-sm border border-red-500/20">
                            <Flag className="w-3.5 h-3.5 fill-red-500" />
                            <span>Son Okunan</span>
                        </div>
                    )}
                    <p
                        className={`font-arabic leading-loose font-medium transition-all duration-300 break-words ${memorizationMode && !revealed ? 'blur-md select-none' : ''
                            }`}
                        dir="rtl"
                        style={{ fontSize: `${arabicFontSize}px`, lineHeight: '2', fontFamily: arabicFont, wordBreak: 'break-word', overflowWrap: 'break-word' }}
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

                    {/* Share Button — opens the card sheet; copying text lives inside it */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsCardOpen(true); }}
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label={ui.verseCard}
                    >
                        <Share2 className="w-5 h-5" />
                    </button>

                    {/* Mark as Last Read Button */}
                    <button
                        onClick={() => {
                            const { setLastRead } = useReadingStore.getState();
                            setLastRead({
                                surahId: ayah.surah_id,
                                ayahId: ayah.id,
                                ayahNumber: ayah.ayah_number,
                                surahName,
                            });
                            if (navigator.vibrate) {
                                navigator.vibrate(50);
                            }
                            onCopy?.('Son okunan olarak işaretlendi!');
                        }}
                        className={`p-2 rounded-lg transition-colors ${isLastRead
                            ? 'text-red-500 bg-red-500/10'
                            : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/5'
                            }`}
                        aria-label="Son okunan olarak işaretle"
                        title="Son okunan olarak işaretle"
                    >
                        <Flag className={`w-5 h-5 ${isLastRead ? 'fill-red-500' : ''}`} />
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
            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                onSave={(content) => {
                    addNote(ayah.surah_id, ayah.id, ayah.ayah_number, surahName, content.trim());
                    setIsNoteModalOpen(false);
                    onCopy?.('Not eklendi!');
                }}
                initialContent={ayahNotes.length > 0 ? ayahNotes[0].content : ''}
                surahName={surahName}
                surahId={ayah.surah_id}
                ayahNumber={ayah.ayah_number}
                ayahText={ayah.text_arabic}
            />

            {/* Verse card share sheet */}
            <VerseCardSheet
                isOpen={isCardOpen}
                onClose={() => setIsCardOpen(false)}
                ayah={ayah}
                surahName={surahName}
                onCopyText={handleShare}
            />
        </>
    );
};

