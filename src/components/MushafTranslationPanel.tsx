import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useNotesStore } from '../store/notesStore';
import { NoteModal } from './NoteModal';
import { Ayah } from '../types';

interface MushafTranslationPanelProps {
    pageAyahs: Ayah[];
    currentAyahId: number | null;
    onAyahClick: (ayah: Ayah) => void;
    ui: any; // UI strings object
}

export const MushafTranslationPanel: React.FC<MushafTranslationPanelProps> = ({
    pageAyahs,
    currentAyahId,
    onAyahClick,
    ui
}) => {
    const { arabicFont } = useSettingsStore();
    const { getNotesByAyah, addNote } = useNotesStore();

    // Note Modal State
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [activeNoteAyah, setActiveNoteAyah] = useState<Ayah | null>(null);
    const [noteContent, setNoteContent] = useState('');

    const handleNoteClick = (e: React.MouseEvent, ayah: Ayah) => {
        e.stopPropagation(); // Prevent playing audio
        const notes = getNotesByAyah(ayah.id);
        setActiveNoteAyah(ayah);
        setNoteContent(notes.length > 0 ? notes[0].content : '');
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = (content: string) => {
        if (activeNoteAyah) {
            // surah_id might be missing in some contexts if not careful, but Ayah type should have it
            // Based on MushafView, the ayah object has surah_id
            // However, we need surahName. In MushafView it finds the surah from quranData.
            // But here we only have the Ayah object.
            // We might need to pass surahName in the Ayah object or look it up.
            // For now let's hope Ayah object has what we need or we pass a generic name.
            // Actually, Ayah type usually doesn't have surahName.
            // We might need to pass a lookup or just use "Sure {surah_id}".

            // To be safe, we can use a generic name or ask props for a lookup function.
            // Or simpler: The user task didn't strictly require surah name in note save, but addNote needs it.
            // Let's pass "Sure " + activeNoteAyah.surah_id as fallback.

            addNote(
                activeNoteAyah.surah_id,
                activeNoteAyah.id,
                activeNoteAyah.ayah_number,
                `Sure ${activeNoteAyah.surah_id}`, // Fallback sname
                content.trim()
            );
        }
        setIsNoteModalOpen(false);
        setActiveNoteAyah(null);
    };

    return (
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                <h3 className="font-semibold text-foreground">{ui.pageTranslation}</h3>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {pageAyahs.length} {ui.verses}
                </span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {pageAyahs.map((ayah) => {
                    const isActive = currentAyahId === ayah.id;
                    const notes = getNotesByAyah(ayah.id);
                    const hasNotes = notes.length > 0;

                    return (
                        <div
                            key={ayah.id}
                            onClick={() => onAyahClick(ayah)}
                            className={`p-4 rounded-xl transition-all cursor-pointer border relative group ${isActive
                                ? 'bg-primary/10 border-primary shadow-md ring-1 ring-primary/30'
                                : 'bg-background hover:bg-secondary/50 border-transparent hover:border-border'
                                }`}
                        >
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                                    }`}>
                                    {ayah.surah_id}:{ayah.ayah_number}
                                </span>
                                <p
                                    className="font-arabic text-xl text-right flex-1 leading-loose"
                                    dir="rtl"
                                    style={{ fontFamily: arabicFont }}
                                >
                                    {ayah.text_arabic}
                                </p>
                            </div>
                            <p className={`text-sm leading-relaxed ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                                }`}>
                                {ayah.text_meal}
                            </p>

                            {/* Note Indicator / Button */}
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={(e) => handleNoteClick(e, ayah)}
                                    className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium ${hasNotes
                                            ? 'text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                                            : 'text-muted-foreground hover:bg-secondary opacity-0 group-hover:opacity-100'
                                        }`}
                                    title="Not Ekle/Düzenle"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    {hasNotes && <span>Notum Var</span>}
                                </button>
                            </div>
                        </div>
                    );
                })}

                {pageAyahs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        {ui.loading}
                    </div>
                )}
            </div>

            {/* Note Modal */}
            {activeNoteAyah && (
                <NoteModal
                    isOpen={isNoteModalOpen}
                    onClose={() => setIsNoteModalOpen(false)}
                    onSave={handleSaveNote}
                    initialContent={noteContent}
                    surahName={`Sure ${activeNoteAyah.surah_id}`}
                    surahId={activeNoteAyah.surah_id}
                    ayahNumber={activeNoteAyah.ayah_number}
                    ayahText={activeNoteAyah.text_arabic}
                />
            )}
        </div>
    );
};
