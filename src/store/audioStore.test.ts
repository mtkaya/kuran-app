// Audio Store Tests
import { describe, it, expect, beforeEach } from 'vitest'
import { useAudioStore, isPreloadFor } from '../store/audioStore'

describe('isPreloadFor', () => {
    const preload = { surahId: 2, ayahNumber: 5, reciterId: 'mishari' }

    it('matches only the exact surah, ayah and reciter', () => {
        expect(isPreloadFor(preload, 2, 5, 'mishari')).toBe(true)
        // Same ayah number in a different surah must NOT reuse the preload
        expect(isPreloadFor(preload, 3, 5, 'mishari')).toBe(false)
        expect(isPreloadFor(preload, 2, 6, 'mishari')).toBe(false)
        expect(isPreloadFor(preload, 2, 5, 'other')).toBe(false)
    })

    it('never matches when nothing is preloaded', () => {
        expect(isPreloadFor({ surahId: null, ayahNumber: null, reciterId: null }, 2, 5, 'mishari')).toBe(false)
    })
})

describe('AudioStore — memorization drill', () => {
    const config = {
        surahId: 2,
        surahName: 'Bakara',
        totalAyahs: 286,
        surahFirstAyahId: 8,
        fromAyah: 2,
        toAyah: 4,
        repeatCount: 3,
        gapSeconds: 0,
        loopRange: true,
    }

    beforeEach(() => {
        useAudioStore.getState().cleanup()
    })

    it('starts a drill on the first ayah of the range', () => {
        useAudioStore.getState().startMemorization(config)
        const s = useAudioStore.getState()
        expect(s.memorization).toMatchObject({ fromAyah: 2, toAyah: 4, repeatCount: 3 })
        expect(s.memorizationRepeat).toBe(1)
        expect(s.currentAyahNumber).toBe(2)
        // Global id of Bakara 2 is 9
        expect(s.currentAyahId).toBe(9)
    })

    it('clamps an out-of-bounds configuration', () => {
        useAudioStore.getState().startMemorization({ ...config, toAyah: 9999, repeatCount: 50 })
        expect(useAudioStore.getState().memorization).toMatchObject({ toAyah: 286, repeatCount: 10 })
    })

    it('keeps the drill when playback stays inside the range', () => {
        useAudioStore.getState().startMemorization(config)
        useAudioStore.getState().play(2, 10, 3, 'Bakara', 286)
        expect(useAudioStore.getState().memorization).not.toBeNull()
        expect(useAudioStore.getState().memorizationRepeat).toBe(1)
    })

    it('ends the drill when the user jumps outside the range', () => {
        useAudioStore.getState().startMemorization(config)
        useAudioStore.getState().play(2, 20, 13, 'Bakara', 286)
        expect(useAudioStore.getState().memorization).toBeNull()
    })

    it('ends the drill when the user switches surah', () => {
        useAudioStore.getState().startMemorization(config)
        useAudioStore.getState().play(3, 300, 2, 'Ali İmran', 200)
        expect(useAudioStore.getState().memorization).toBeNull()
    })

    it('stopMemorization clears the drill and stops playback', () => {
        useAudioStore.getState().startMemorization(config)
        useAudioStore.getState().stopMemorization()
        const s = useAudioStore.getState()
        expect(s.memorization).toBeNull()
        expect(s.isPlaying).toBe(false)
    })

    it('updateMemorization adjusts a running drill without restarting it', () => {
        useAudioStore.getState().startMemorization(config)
        useAudioStore.getState().updateMemorization({ repeatCount: 5 })
        expect(useAudioStore.getState().memorization).toMatchObject({ repeatCount: 5, fromAyah: 2 })
        expect(useAudioStore.getState().currentAyahNumber).toBe(2)
    })

    it('updateMemorization is a no-op when no drill is running', () => {
        useAudioStore.getState().updateMemorization({ repeatCount: 5 })
        expect(useAudioStore.getState().memorization).toBeNull()
    })
})

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
