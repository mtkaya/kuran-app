import { create } from 'zustand';
import { Note } from '../storage/types';

const NOTES_STORAGE_KEY = 'kuran-app-notes';

interface NotesState {
    notes: Note[];

    // Actions
    addNote: (surahId: number, ayahId: number, ayahNumber: number, surahName: string, content: string) => void;
    updateNote: (noteId: string, content: string) => void;
    deleteNote: (noteId: string) => void;
    getNotesByAyah: (ayahId: number) => Note[];
    getNotesBySurah: (surahId: number) => Note[];
    loadNotes: () => void;
}

// Generate unique ID
const generateId = (): string => {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Save to localStorage
const saveNotes = (notes: Note[]) => {
    try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
        console.error('Error saving notes:', error);
    }
};

// Load from localStorage
const loadNotesFromStorage = (): Note[] => {
    try {
        const stored = localStorage.getItem(NOTES_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading notes:', error);
    }
    return [];
};

export const useNotesStore = create<NotesState>((set, get) => ({
    notes: [],

    addNote: (surahId, ayahId, ayahNumber, surahName, content) => {
        const newNote: Note = {
            id: generateId(),
            surahId,
            ayahId,
            ayahNumber,
            surahName,
            content,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        set((state) => {
            const updatedNotes = [...state.notes, newNote];
            saveNotes(updatedNotes);
            return { notes: updatedNotes };
        });
    },

    updateNote: (noteId, content) => {
        set((state) => {
            const updatedNotes = state.notes.map((note) =>
                note.id === noteId
                    ? { ...note, content, updatedAt: Date.now() }
                    : note
            );
            saveNotes(updatedNotes);
            return { notes: updatedNotes };
        });
    },

    deleteNote: (noteId) => {
        set((state) => {
            const updatedNotes = state.notes.filter((note) => note.id !== noteId);
            saveNotes(updatedNotes);
            return { notes: updatedNotes };
        });
    },

    getNotesByAyah: (ayahId) => {
        return get().notes.filter((note) => note.ayahId === ayahId);
    },

    getNotesBySurah: (surahId) => {
        return get().notes.filter((note) => note.surahId === surahId);
    },

    loadNotes: () => {
        const notes = loadNotesFromStorage();
        set({ notes });
    },
}));

// Initialize notes on app start
if (typeof window !== 'undefined') {
    useNotesStore.getState().loadNotes();
}
