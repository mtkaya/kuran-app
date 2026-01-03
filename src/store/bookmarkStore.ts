// Bookmark Store
import { create } from 'zustand';
import { Bookmark } from '../storage/types';
import { getBookmarks, saveBookmarks } from '../storage/storage';

interface BookmarkState {
    bookmarks: Bookmark[];
    addBookmark: (bookmark: Omit<Bookmark, 'timestamp'>) => void;
    removeBookmark: (surahId: number, ayahId: number) => void;
    toggleBookmark: (bookmark: Omit<Bookmark, 'timestamp'>) => void;
    isBookmarked: (surahId: number, ayahId: number) => boolean;
    hydrate: () => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
    bookmarks: [],

    addBookmark: (bookmark) => {
        const newBookmark: Bookmark = { ...bookmark, timestamp: Date.now() };
        const bookmarks = [...get().bookmarks, newBookmark];
        set({ bookmarks });
        saveBookmarks(bookmarks);
    },

    removeBookmark: (surahId, ayahId) => {
        const bookmarks = get().bookmarks.filter(
            b => !(b.surahId === surahId && b.ayahId === ayahId)
        );
        set({ bookmarks });
        saveBookmarks(bookmarks);
    },

    toggleBookmark: (bookmark) => {
        const { isBookmarked, addBookmark, removeBookmark } = get();
        if (isBookmarked(bookmark.surahId, bookmark.ayahId)) {
            removeBookmark(bookmark.surahId, bookmark.ayahId);
        } else {
            addBookmark(bookmark);
        }
    },

    isBookmarked: (surahId, ayahId) => {
        return get().bookmarks.some(
            b => b.surahId === surahId && b.ayahId === ayahId
        );
    },

    hydrate: () => {
        const bookmarks = getBookmarks();
        set({ bookmarks });
    },
}));
