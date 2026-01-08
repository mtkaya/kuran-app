import React, { useState, useMemo } from 'react';
import { Search, Trash2, Edit3, FileText, ChevronRight, X, Save } from 'lucide-react';
import { useNotesStore } from '../store/notesStore';
import { Note } from '../storage/types';

interface NotesPanelProps {
    onNavigateToAyah?: (surahId: number, ayahNumber: number) => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ onNavigateToAyah }) => {
    const { notes, updateNote, deleteNote } = useNotesStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    // Filter notes by search query
    const filteredNotes = useMemo(() => {
        if (!searchQuery.trim()) return notes;
        const query = searchQuery.toLowerCase();
        return notes.filter(
            (note) =>
                note.content.toLowerCase().includes(query) ||
                note.surahName.toLowerCase().includes(query)
        );
    }, [notes, searchQuery]);

    // Sort by most recent
    const sortedNotes = useMemo(() => {
        return [...filteredNotes].sort((a, b) => b.updatedAt - a.updatedAt);
    }, [filteredNotes]);

    const handleEdit = (note: Note) => {
        setEditingNoteId(note.id);
        setEditContent(note.content);
    };

    const handleSave = () => {
        if (editingNoteId && editContent.trim()) {
            updateNote(editingNoteId, editContent.trim());
            setEditingNoteId(null);
            setEditContent('');
        }
    };

    const handleCancel = () => {
        setEditingNoteId(null);
        setEditContent('');
    };

    const handleDelete = (noteId: string) => {
        if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
            deleteNote(noteId);
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Bugün';
        if (diffDays === 1) return 'Dün';
        if (diffDays < 7) return `${diffDays} gün önce`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
        return date.toLocaleDateString('tr-TR');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Notlarım</h2>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {notes.length}
                    </span>
                </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Notlarda ara..."
                        className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sortedNotes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="text-sm">
                            {searchQuery ? 'Sonuç bulunamadı' : 'Henüz not eklenmemiş'}
                        </p>
                        <p className="text-xs mt-1 opacity-70">
                            Ayetlere not eklemek için okuma sayfasına gidin
                        </p>
                    </div>
                ) : (
                    sortedNotes.map((note) => (
                        <div
                            key={note.id}
                            className="bg-card border border-border rounded-xl p-4 transition-all hover:shadow-md"
                        >
                            {/* Note Header */}
                            <div className="flex items-center justify-between mb-2">
                                <button
                                    onClick={() => onNavigateToAyah?.(note.surahId, note.ayahNumber)}
                                    className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                >
                                    {note.surahName} {note.surahId}:{note.ayahNumber}
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                                <span className="text-xs text-muted-foreground">
                                    {formatDate(note.updatedAt)}
                                </span>
                            </div>

                            {/* Note Content */}
                            {editingNoteId === note.id ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full p-3 bg-secondary rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        rows={4}
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                            İptal
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            <Save className="w-3 h-3" />
                                            Kaydet
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                        {note.content}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                                        <button
                                            onClick={() => handleEdit(note)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Sil
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
