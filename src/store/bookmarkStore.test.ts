// Bookmark Store Tests
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBookmarkStore } from '../store/bookmarkStore'

// Mock storage functions
vi.mock('../storage/storage', () => ({
    getBookmarks: () => [],
    saveBookmarks: vi.fn(),
}))

describe('BookmarkStore', () => {
    beforeEach(() => {
        useBookmarkStore.setState({
            bookmarks: [],
        })
    })

    const testBookmark = {
        surahId: 1,
        ayahId: 101,
        surahName: 'Fatiha',
        ayahNumber: 1,
    }

    it('should have empty bookmarks initially', () => {
        const state = useBookmarkStore.getState()
        expect(state.bookmarks.length).toBe(0)
    })

    it('should add bookmark', () => {
        const { addBookmark } = useBookmarkStore.getState()
        addBookmark(testBookmark)
        expect(useBookmarkStore.getState().bookmarks.length).toBe(1)
        expect(useBookmarkStore.getState().bookmarks[0].surahId).toBe(1)
    })

    it('should remove bookmark', () => {
        const { addBookmark, removeBookmark } = useBookmarkStore.getState()
        addBookmark(testBookmark)
        removeBookmark(1, 101)
        expect(useBookmarkStore.getState().bookmarks.length).toBe(0)
    })

    it('should toggle bookmark', () => {
        const { toggleBookmark } = useBookmarkStore.getState()

        // Add
        toggleBookmark(testBookmark)
        expect(useBookmarkStore.getState().isBookmarked(1, 101)).toBe(true)

        // Remove
        useBookmarkStore.getState().toggleBookmark(testBookmark)
        expect(useBookmarkStore.getState().isBookmarked(1, 101)).toBe(false)
    })

    it('should check if ayah is bookmarked', () => {
        const { addBookmark, isBookmarked } = useBookmarkStore.getState()
        expect(isBookmarked(1, 101)).toBe(false)
        addBookmark(testBookmark)
        expect(useBookmarkStore.getState().isBookmarked(1, 101)).toBe(true)
    })
})
