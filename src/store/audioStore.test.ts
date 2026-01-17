// Audio Store Tests
import { describe, it, expect, beforeEach } from 'vitest'
import { useAudioStore } from '../store/audioStore'

describe('AudioStore', () => {
    beforeEach(() => {
        // Reset store before each test
        useAudioStore.setState({
            isPlaying: false,
            isLoading: false,
            currentSurahId: null,
            currentAyahId: null,
            currentAyahNumber: null,
            surahName: null,
            totalAyahs: null,
            progress: 0,
            currentTime: 0,
            duration: 0,
            playbackRate: 1,
            repeatMode: 'none',
            audioElement: null,
        })
    })

    it('should have initial state', () => {
        const state = useAudioStore.getState()
        expect(state.isPlaying).toBe(false)
        expect(state.isLoading).toBe(false)
        expect(state.currentSurahId).toBeNull()
        expect(state.progress).toBe(0)
    })

    it('should set repeat mode', () => {
        const { setRepeatMode } = useAudioStore.getState()
        setRepeatMode('ayah')
        expect(useAudioStore.getState().repeatMode).toBe('ayah')

        setRepeatMode('surah')
        expect(useAudioStore.getState().repeatMode).toBe('surah')

        setRepeatMode('none')
        expect(useAudioStore.getState().repeatMode).toBe('none')
    })

    it('should set playback rate', () => {
        const { setPlaybackRate } = useAudioStore.getState()
        setPlaybackRate(1.5)
        expect(useAudioStore.getState().playbackRate).toBe(1.5)
    })

    it('should initialize audio element', () => {
        const { initAudio } = useAudioStore.getState()
        initAudio()
        expect(useAudioStore.getState().audioElement).not.toBeNull()
    })

    it('should stop and reset state', () => {
        // Set some state first
        useAudioStore.setState({
            isPlaying: true,
            currentSurahId: 1,
            currentAyahNumber: 5,
            surahName: 'Fatiha',
        })

        const { stop } = useAudioStore.getState()
        stop()

        const state = useAudioStore.getState()
        expect(state.isPlaying).toBe(false)
        expect(state.currentSurahId).toBeNull()
        expect(state.surahName).toBeNull()
    })
})
