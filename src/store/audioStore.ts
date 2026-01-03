// Audio Store - Player state management
import { create } from 'zustand';
import { getAudioUrl, getDefaultReciter } from '../data/reciterProvider';

export type RepeatMode = 'none' | 'ayah' | 'surah';

interface AudioState {
    // Playback state
    isPlaying: boolean;
    isLoading: boolean;

    // Current track
    currentSurahId: number | null;
    currentAyahId: number | null;
    currentAyahNumber: number | null;
    surahName: string | null;
    totalAyahs: number | null;

    // Progress
    progress: number; // 0-100
    currentTime: number;
    duration: number;

    // Settings
    playbackRate: number;
    repeatMode: RepeatMode;
    selectedReciterId: string;

    // Audio element reference
    audioElement: HTMLAudioElement | null;

    // Actions
    initAudio: () => void;
    play: (surahId: number, ayahId: number, ayahNumber: number, surahName: string, totalAyahs: number) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    nextAyah: () => void;
    prevAyah: () => void;
    seekTo: (percent: number) => void;
    setPlaybackRate: (rate: number) => void;
    setRepeatMode: (mode: RepeatMode) => void;
    setReciter: (reciterId: string) => void;
    cleanup: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    // Initial state
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
    selectedReciterId: getDefaultReciter().identifier,
    audioElement: null,

    // Initialize audio element
    initAudio: () => {
        if (get().audioElement) return;

        const audio = new Audio();
        audio.preload = 'auto';

        // Event listeners
        audio.addEventListener('timeupdate', () => {
            const { duration } = audio;
            if (duration > 0) {
                set({
                    currentTime: audio.currentTime,
                    progress: (audio.currentTime / duration) * 100,
                });
            }
        });

        audio.addEventListener('loadedmetadata', () => {
            set({ duration: audio.duration, isLoading: false });
        });

        audio.addEventListener('ended', () => {
            const { repeatMode, currentAyahNumber, totalAyahs } = get();

            if (repeatMode === 'ayah') {
                // Repeat current ayah
                audio.currentTime = 0;
                audio.play();
            } else if (currentAyahNumber && totalAyahs && currentAyahNumber < totalAyahs) {
                // Play next ayah
                get().nextAyah();
            } else if (repeatMode === 'surah') {
                // Repeat surah from beginning
                const state = get();
                if (state.currentSurahId && state.surahName && state.totalAyahs) {
                    // Play first ayah of the surah
                    get().play(
                        state.currentSurahId,
                        state.currentSurahId * 1000 + 1, // Approximate first ayah ID
                        1,
                        state.surahName,
                        state.totalAyahs
                    );
                }
            } else {
                // Stop
                set({ isPlaying: false, progress: 0 });
            }
        });

        audio.addEventListener('waiting', () => set({ isLoading: true }));
        audio.addEventListener('playing', () => set({ isLoading: false }));
        audio.addEventListener('error', () => set({ isLoading: false, isPlaying: false }));

        set({ audioElement: audio });
    },

    // Play specific ayah
    play: (surahId, ayahId, ayahNumber, surahName, totalAyahs) => {
        const { audioElement, selectedReciterId, playbackRate } = get();

        if (!audioElement) {
            get().initAudio();
            // Need to wait for next tick
            setTimeout(() => get().play(surahId, ayahId, ayahNumber, surahName, totalAyahs), 0);
            return;
        }

        const url = getAudioUrl(selectedReciterId, surahId, ayahNumber);

        set({
            isLoading: true,
            currentSurahId: surahId,
            currentAyahId: ayahId,
            currentAyahNumber: ayahNumber,
            surahName,
            totalAyahs,
            progress: 0,
            currentTime: 0,
        });

        audioElement.src = url;
        audioElement.playbackRate = playbackRate;
        audioElement.play()
            .then(() => set({ isPlaying: true, isLoading: false }))
            .catch((e) => {
                console.error('Audio play error:', e);
                set({ isLoading: false });
            });
    },

    pause: () => {
        const { audioElement } = get();
        if (audioElement) {
            audioElement.pause();
            set({ isPlaying: false });
        }
    },

    resume: () => {
        const { audioElement } = get();
        if (audioElement && audioElement.src) {
            audioElement.play()
                .then(() => set({ isPlaying: true }))
                .catch(console.error);
        }
    },

    stop: () => {
        const { audioElement } = get();
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
        set({
            isPlaying: false,
            currentSurahId: null,
            currentAyahId: null,
            currentAyahNumber: null,
            surahName: null,
            totalAyahs: null,
            progress: 0,
            currentTime: 0,
            duration: 0,
        });
    },

    nextAyah: () => {
        const { currentSurahId, currentAyahId, currentAyahNumber, surahName, totalAyahs } = get();

        if (!currentSurahId || !currentAyahNumber || !totalAyahs || !surahName) return;

        if (currentAyahNumber < totalAyahs) {
            const nextAyahNumber = currentAyahNumber + 1;
            const nextAyahId = (currentAyahId || 0) + 1;
            get().play(currentSurahId, nextAyahId, nextAyahNumber, surahName, totalAyahs);
        }
    },

    prevAyah: () => {
        const { currentSurahId, currentAyahId, currentAyahNumber, surahName, totalAyahs } = get();

        if (!currentSurahId || !currentAyahNumber || !surahName || !totalAyahs) return;

        if (currentAyahNumber > 1) {
            const prevAyahNumber = currentAyahNumber - 1;
            const prevAyahId = (currentAyahId || 0) - 1;
            get().play(currentSurahId, prevAyahId, prevAyahNumber, surahName, totalAyahs);
        }
    },

    seekTo: (percent) => {
        const { audioElement, duration } = get();
        if (audioElement && duration > 0) {
            audioElement.currentTime = (percent / 100) * duration;
        }
    },

    setPlaybackRate: (rate) => {
        const { audioElement } = get();
        if (audioElement) {
            audioElement.playbackRate = rate;
        }
        set({ playbackRate: rate });
    },

    setRepeatMode: (mode) => {
        set({ repeatMode: mode });
    },

    setReciter: (reciterId) => {
        const { isPlaying, currentSurahId, currentAyahId, currentAyahNumber, surahName, totalAyahs } = get();
        set({ selectedReciterId: reciterId });

        // If currently playing, restart with new reciter
        if (isPlaying && currentSurahId && currentAyahId && currentAyahNumber && surahName && totalAyahs) {
            get().play(currentSurahId, currentAyahId, currentAyahNumber, surahName, totalAyahs);
        }
    },

    cleanup: () => {
        const { audioElement } = get();
        if (audioElement) {
            audioElement.pause();
            audioElement.src = '';
        }
    },
}));
