// Settings Store Tests
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSettingsStore } from '../store/settingsStore'

// Mock storage functions
vi.mock('../storage/storage', () => ({
    getSettings: () => ({
        theme: 'system',
        arabicFontSize: 28,
        mealFontSize: 16,
        showTransliteration: false,
        showTajweed: true,
        memorizationMode: false,
        readingMode: 'normal',
        arabicFont: 'Amiri Quran',
    }),
    saveSettings: vi.fn(),
}))

describe('SettingsStore', () => {
    beforeEach(() => {
        useSettingsStore.setState({
            theme: 'system',
            arabicFontSize: 28,
            mealFontSize: 16,
            showTransliteration: false,
            showTajweed: true,
            memorizationMode: false,
            readingMode: 'normal',
            arabicFont: 'Amiri Quran',
        })
    })

    it('should have default settings', () => {
        const state = useSettingsStore.getState()
        expect(state.theme).toBe('system')
        expect(state.arabicFontSize).toBe(28)
        expect(state.mealFontSize).toBe(16)
    })

    it('should set theme', () => {
        const { setTheme } = useSettingsStore.getState()
        setTheme('dark')
        expect(useSettingsStore.getState().theme).toBe('dark')

        setTheme('light')
        expect(useSettingsStore.getState().theme).toBe('light')
    })

    it('should set arabic font size', () => {
        const { setArabicFontSize } = useSettingsStore.getState()
        setArabicFontSize(32)
        expect(useSettingsStore.getState().arabicFontSize).toBe(32)
    })

    it('should set meal font size', () => {
        const { setMealFontSize } = useSettingsStore.getState()
        setMealFontSize(18)
        expect(useSettingsStore.getState().mealFontSize).toBe(18)
    })

    it('should toggle transliteration', () => {
        const { setShowTransliteration } = useSettingsStore.getState()
        setShowTransliteration(true)
        expect(useSettingsStore.getState().showTransliteration).toBe(true)
    })

    it('should set reading mode', () => {
        const { setReadingMode } = useSettingsStore.getState()
        setReadingMode('mushaf')
        expect(useSettingsStore.getState().readingMode).toBe('mushaf')

        setReadingMode('digital')
        expect(useSettingsStore.getState().readingMode).toBe('digital')
    })
})
