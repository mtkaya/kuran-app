// Audio Store - Player state management
// With preloading for seamless ayah transitions
import { create } from 'zustand';
import { getAudioUrl, getDefaultReciter } from '../data/reciterProvider';
import {
    MemorizationConfig,
    ayahIdFor,
    clampConfig,
    isInRange,
    nextMemorizationStep,
} from './memorization';

export type RepeatMode = 'none' | 'ayah' | 'surah';

// Update Media Session API for lock screen controls
function updateMediaSession(
    surahName: string | null,
    ayahNumber: number | null,
    isPlaying: boolean
) {
    if (!('mediaSession' in navigator) || !surahName || !ayahNumber) return;

    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `Ayet ${ayahNumber}`,
            artist: surahName,
            album: 'The Holy Quran',
            artwork: [
                { src: '/logo.svg', sizes: '512x512', type: 'image/svg+xml' },
            ]
        });
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (e) {
        console.log('Media Session update error:', e);
    }
}

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

    // Preloaded next ayah audio element, keyed by the full track identity
    preloadedAudio: HTMLAudioElement | null;
    preloadedAyahNumber: number | null;
    preloadedSurahId: number | null;
    preloadedReciterId: string | null;

    // Memorization drill (null when no drill is running)
    memorization: MemorizationConfig | null;
    /** Which recitation of the current ayah is playing (1-based) */
    memorizationRepeat: number;
    /** Completed passes over the range */
    memorizationCycle: number;

    // Actions
    startMemorization: (config: MemorizationConfig) => void;
    stopMemorization: () => void;
    updateMemorization: (patch: Partial<MemorizationConfig>) => void;
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

/**
 * Preload the next ayah's audio in the background
 */
// True only when the preloaded element is exactly the requested track —
// same surah and reciter, not just the same ayah number
export function isPreloadFor(
    preload: { surahId: number | null; ayahNumber: number | null; reciterId: string | null },
    surahId: number,
    ayahNumber: number,
    reciterId: string
): boolean {
    return (
        preload.surahId === surahId &&
        preload.ayahNumber === ayahNumber &&
        preload.reciterId === reciterId
    );
}

function preloadNextAyahAudio(
    reciterId: string,
    surahId: number,
    nextAyahNumber: number,
    totalAyahs: number
): HTMLAudioElement | null {
    if (nextAyahNumber > totalAyahs) return null;

    try {
        const url = getAudioUrl(reciterId, surahId, nextAyahNumber);
        const preloadAudio = new Audio();
        preloadAudio.preload = 'auto';
        preloadAudio.src = url;
        // Start loading the audio data
        preloadAudio.load();
        return preloadAudio;
    } catch {
        return null;
    }
}

// Pending silence between memorization recitations
let memorizationTimer: ReturnType<typeof setTimeout> | null = null;

function clearMemorizationTimer(): void {
    if (memorizationTimer !== null) {
        clearTimeout(memorizationTimer);
        memorizationTimer = null;
    }
}

function runAfterGap(delayMs: number, action: () => void): void {
    clearMemorizationTimer();
    if (delayMs <= 0) {
        action();
        return;
    }
    memorizationTimer = setTimeout(() => {
        memorizationTimer = null;
        action();
    }, delayMs);
}

/**
 * Single place where "the recitation just finished" is handled — shared by the
 * main audio element and by any preloaded element promoted to main.
 */
function handleTrackEnded(el: HTMLAudioElement): void {
    const set = useAudioStore.setState;
    const {
        memorization, memorizationRepeat, memorizationCycle,
        repeatMode, currentSurahId, currentAyahId, currentAyahNumber,
        surahName, totalAyahs,
    } = useAudioStore.getState();

    // A running drill takes priority over the plain repeat modes
    if (memorization && currentAyahNumber && currentAyahId !== null) {
        const step = nextMemorizationStep(memorization, currentAyahNumber, memorizationRepeat);

        if (step.type === 'done') {
            clearMemorizationTimer();
            set({ memorization: null, memorizationRepeat: 1, isPlaying: false, progress: 0 });
            return;
        }

        if (step.type === 'repeat') {
            set({ memorizationRepeat: step.repeatIndex, isPlaying: false });
            runAfterGap(step.delayMs, () => {
                // The user may have tapped another ayah during the pause —
                // never resurrect a track that is no longer current
                const s = useAudioStore.getState();
                if (!s.memorization || s.audioElement !== el || s.currentAyahNumber !== currentAyahNumber) return;
                el.currentTime = 0;
                el.play()
                    .then(() => set({ isPlaying: true }))
                    .catch(() => set({ isPlaying: false }));
            });
            return;
        }

        // advance / loop
        const targetAyahId = ayahIdFor(memorization, step.ayahNumber);
        if (step.type === 'loop') {
            set({ memorizationCycle: memorizationCycle + 1 });
        }
        set({ isPlaying: false });
        runAfterGap(step.delayMs, () => {
            // Same guard: a manual jump during the pause wins over the drill's
            // scheduled advance
            const s = useAudioStore.getState();
            if (!s.memorization || s.currentAyahNumber !== currentAyahNumber) return;
            s.play(
                s.memorization.surahId,
                targetAyahId,
                step.ayahNumber,
                s.memorization.surahName,
                s.memorization.totalAyahs
            );
        });
        return;
    }

    if (repeatMode === 'ayah') {
        el.currentTime = 0;
        el.play().catch(() => set({ isPlaying: false }));
        return;
    }

    if (currentAyahNumber && totalAyahs && currentAyahNumber < totalAyahs) {
        useAudioStore.getState().nextAyah();
        return;
    }

    if (repeatMode === 'surah' && currentSurahId && surahName && totalAyahs && currentAyahNumber && currentAyahId !== null) {
        // Ayah ids are global and sequential, so the surah's first id is the
        // current id minus its offset inside the surah
        useAudioStore.getState().play(
            currentSurahId,
            currentAyahId - (currentAyahNumber - 1),
            1,
            surahName,
            totalAyahs
        );
        return;
    }

    set({ isPlaying: false, progress: 0 });
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
    preloadedAudio: null,
    preloadedAyahNumber: null,
    preloadedSurahId: null,
    preloadedReciterId: null,
    memorization: null,
    memorizationRepeat: 1,
    memorizationCycle: 0,

    // Start a drill: the first ayah of the range begins immediately
    startMemorization: (config) => {
        const clamped = clampConfig(config);
        clearMemorizationTimer();
        set({ memorization: clamped, memorizationRepeat: 1, memorizationCycle: 0 });
        get().initAudio();
        get().play(
            clamped.surahId,
            ayahIdFor(clamped, clamped.fromAyah),
            clamped.fromAyah,
            clamped.surahName,
            clamped.totalAyahs
        );
    },

    stopMemorization: () => {
        clearMemorizationTimer();
        const { audioElement } = get();
        if (audioElement) audioElement.pause();
        set({ memorization: null, memorizationRepeat: 1, memorizationCycle: 0, isPlaying: false });
    },

    // Adjust repeat count / gap / loop without interrupting playback
    updateMemorization: (patch) => {
        const { memorization } = get();
        if (!memorization) return;
        set({ memorization: clampConfig({ ...memorization, ...patch }) });
    },

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

            // Start preloading next ayah when current is 50% done
            const state = get();
            if (
                duration > 0 &&
                audio.currentTime > duration * 0.5 &&
                !state.preloadedAudio &&
                state.currentAyahNumber &&
                state.totalAyahs &&
                state.currentSurahId &&
                state.currentAyahNumber < state.totalAyahs
            ) {
                const nextAyahNum = state.currentAyahNumber + 1;
                const preloaded = preloadNextAyahAudio(
                    state.selectedReciterId,
                    state.currentSurahId,
                    nextAyahNum,
                    state.totalAyahs
                );
                if (preloaded) {
                    preloaded.playbackRate = state.playbackRate;
                    set({
                        preloadedAudio: preloaded,
                        preloadedAyahNumber: nextAyahNum,
                        preloadedSurahId: state.currentSurahId,
                        preloadedReciterId: state.selectedReciterId,
                    });
                }
            }
        });

        audio.addEventListener('loadedmetadata', () => {
            set({ duration: audio.duration, isLoading: false });
        });

        audio.addEventListener('ended', () => handleTrackEnded(audio));

        audio.addEventListener('waiting', () => set({ isLoading: true }));
        audio.addEventListener('playing', () => set({ isLoading: false }));
        audio.addEventListener('error', () => set({ isLoading: false, isPlaying: false }));

        // Setup Media Session handlers
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => get().resume());
            navigator.mediaSession.setActionHandler('pause', () => get().pause());
            navigator.mediaSession.setActionHandler('previoustrack', () => get().prevAyah());
            navigator.mediaSession.setActionHandler('nexttrack', () => get().nextAyah());
        }

        set({ audioElement: audio });
    },

    // Play specific ayah
    play: (surahId, ayahId, ayahNumber, surahName, totalAyahs) => {
        const state = get();
        const { audioElement, selectedReciterId, playbackRate, preloadedAudio, preloadedAyahNumber, preloadedSurahId, preloadedReciterId } = state;

        if (!audioElement) {
            get().initAudio();
            setTimeout(() => get().play(surahId, ayahId, ayahNumber, surahName, totalAyahs), 0);
            return;
        }

        // Keep the drill consistent with what is actually playing: jumping to
        // another surah or outside the range ends it, and every new track
        // starts at its first recitation.
        if (state.memorization &&
            (state.memorization.surahId !== surahId || !isInRange(state.memorization, ayahNumber))) {
            clearMemorizationTimer();
            set({ memorization: null, memorizationCycle: 0 });
        }
        set({ memorizationRepeat: 1 });

        // Check if we have a preloaded audio for the requested track
        if (preloadedAudio && isPreloadFor(
            { surahId: preloadedSurahId, ayahNumber: preloadedAyahNumber, reciterId: preloadedReciterId },
            surahId, ayahNumber, selectedReciterId
        )) {
            // Swap: stop old audio, use preloaded one as main
            audioElement.pause();

            // Copy event listeners to preloaded audio by swapping elements
            // First, update state with new track info
            set({
                isLoading: false,
                currentSurahId: surahId,
                currentAyahId: ayahId,
                currentAyahNumber: ayahNumber,
                surahName,
                totalAyahs,
                progress: 0,
                currentTime: 0,
                preloadedAudio: null,
                preloadedAyahNumber: null,
                preloadedSurahId: null,
                preloadedReciterId: null,
            });

            // Set up timeupdate on preloaded audio
            preloadedAudio.addEventListener('timeupdate', () => {
                const { duration: dur } = preloadedAudio;
                if (dur > 0) {
                    set({
                        currentTime: preloadedAudio.currentTime,
                        progress: (preloadedAudio.currentTime / dur) * 100,
                    });
                }

                // Start preloading next-next ayah
                const s = get();
                if (
                    dur > 0 &&
                    preloadedAudio.currentTime > dur * 0.5 &&
                    !s.preloadedAudio &&
                    s.currentAyahNumber &&
                    s.totalAyahs &&
                    s.currentSurahId &&
                    s.currentAyahNumber < s.totalAyahs
                ) {
                    const nextNum = s.currentAyahNumber + 1;
                    const nextPreloaded = preloadNextAyahAudio(
                        s.selectedReciterId,
                        s.currentSurahId,
                        nextNum,
                        s.totalAyahs
                    );
                    if (nextPreloaded) {
                        nextPreloaded.playbackRate = s.playbackRate;
                        set({
                            preloadedAudio: nextPreloaded,
                            preloadedAyahNumber: nextNum,
                            preloadedSurahId: s.currentSurahId,
                            preloadedReciterId: s.selectedReciterId,
                        });
                    }
                }
            });

            preloadedAudio.addEventListener('loadedmetadata', () => {
                set({ duration: preloadedAudio.duration, isLoading: false });
            });

            preloadedAudio.addEventListener('ended', () => handleTrackEnded(preloadedAudio));

            preloadedAudio.addEventListener('waiting', () => set({ isLoading: true }));
            preloadedAudio.addEventListener('playing', () => set({ isLoading: false }));
            preloadedAudio.addEventListener('error', () => set({ isLoading: false, isPlaying: false }));

            preloadedAudio.playbackRate = playbackRate;
            set({ audioElement: preloadedAudio, duration: preloadedAudio.duration || 0 });

            preloadedAudio.play()
                .then(() => {
                    set({ isPlaying: true, isLoading: false });
                    updateMediaSession(surahName, ayahNumber, true);
                })
                .catch((e) => {
                    console.error('Preloaded audio play error:', e);
                    set({ isLoading: false });
                });

            return;
        }

        // Normal play (no preloaded audio available) - clean up any stale preloaded
        if (preloadedAudio) {
            preloadedAudio.src = '';
            set({ preloadedAudio: null, preloadedAyahNumber: null, preloadedSurahId: null, preloadedReciterId: null });
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
            .then(() => {
                set({ isPlaying: true, isLoading: false });
                updateMediaSession(surahName, ayahNumber, true);
            })
            .catch((e) => {
                console.error('Audio play error:', e);
                set({ isLoading: false });
            });
    },

    pause: () => {
        // A pause during the silence between recitations must not be
        // undone by the pending timer
        clearMemorizationTimer();
        const { audioElement, surahName, currentAyahNumber } = get();
        if (audioElement) {
            audioElement.pause();
            set({ isPlaying: false });
            updateMediaSession(surahName, currentAyahNumber, false);
        }
    },

    resume: () => {
        const { audioElement, surahName, currentAyahNumber } = get();
        if (audioElement && audioElement.src) {
            audioElement.play()
                .then(() => {
                    set({ isPlaying: true });
                    updateMediaSession(surahName, currentAyahNumber, true);
                })
                .catch(console.error);
        }
    },

    stop: () => {
        clearMemorizationTimer();
        const { audioElement, preloadedAudio } = get();
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
        if (preloadedAudio) {
            preloadedAudio.src = '';
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
            preloadedAudio: null,
            preloadedAyahNumber: null,
            preloadedSurahId: null,
            preloadedReciterId: null,
            memorization: null,
            memorizationRepeat: 1,
            memorizationCycle: 0,
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

        // Clear preloaded audio since we're going backwards
        const { preloadedAudio } = get();
        if (preloadedAudio) {
            preloadedAudio.src = '';
            set({ preloadedAudio: null, preloadedAyahNumber: null, preloadedSurahId: null, preloadedReciterId: null });
        }

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
        const { audioElement, preloadedAudio } = get();
        if (audioElement) {
            audioElement.playbackRate = rate;
        }
        if (preloadedAudio) {
            preloadedAudio.playbackRate = rate;
        }
        set({ playbackRate: rate });
    },

    setRepeatMode: (mode) => {
        set({ repeatMode: mode });
    },

    setReciter: (reciterId) => {
        const { isPlaying, currentSurahId, currentAyahId, currentAyahNumber, surahName, totalAyahs, preloadedAudio } = get();

        // Clear preloaded audio since reciter changed
        if (preloadedAudio) {
            preloadedAudio.src = '';
        }
        set({ selectedReciterId: reciterId, preloadedAudio: null, preloadedAyahNumber: null, preloadedSurahId: null, preloadedReciterId: null });

        // If currently playing, restart with new reciter
        if (isPlaying && currentSurahId && currentAyahId && currentAyahNumber && surahName && totalAyahs) {
            get().play(currentSurahId, currentAyahId, currentAyahNumber, surahName, totalAyahs);
        }
    },

    cleanup: () => {
        clearMemorizationTimer();
        const { audioElement, preloadedAudio } = get();
        if (audioElement) {
            audioElement.pause();
            audioElement.src = '';
            audioElement.onended = null;
            audioElement.ontimeupdate = null;
            audioElement.onloadedmetadata = null;
            audioElement.onwaiting = null;
            audioElement.onplaying = null;
            audioElement.onerror = null;
        }
        if (preloadedAudio) {
            preloadedAudio.src = '';
        }
        set({
            audioElement: null, preloadedAudio: null, preloadedAyahNumber: null,
            preloadedSurahId: null, preloadedReciterId: null,
            memorization: null, memorizationRepeat: 1, memorizationCycle: 0,
        });
    },
}));
