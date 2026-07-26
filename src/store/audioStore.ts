// Audio Store - Player state management
// With preloading for seamless ayah transitions
import { create } from 'zustand';
import { getAudioUrl, getDefaultReciter } from '../data/reciterProvider';

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

        audio.addEventListener('ended', () => {
            const { repeatMode, currentAyahNumber, totalAyahs } = get();

            if (repeatMode === 'ayah') {
                // Repeat current ayah
                audio.currentTime = 0;
                audio.play();
            } else if (currentAyahNumber && totalAyahs && currentAyahNumber < totalAyahs) {
                // Play next ayah (will use preloaded audio if available)
                get().nextAyah();
            } else if (repeatMode === 'surah') {
                // Repeat surah from beginning
                const state = get();
                if (state.currentSurahId && state.surahName && state.totalAyahs) {
                    get().play(
                        state.currentSurahId,
                        state.currentSurahId * 1000 + 1,
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

            preloadedAudio.addEventListener('ended', () => {
                const { repeatMode, currentAyahNumber: currAyah, totalAyahs: totAyahs } = get();

                if (repeatMode === 'ayah') {
                    preloadedAudio.currentTime = 0;
                    preloadedAudio.play();
                } else if (currAyah && totAyahs && currAyah < totAyahs) {
                    get().nextAyah();
                } else if (repeatMode === 'surah') {
                    const st = get();
                    if (st.currentSurahId && st.surahName && st.totalAyahs) {
                        get().play(st.currentSurahId, st.currentSurahId * 1000 + 1, 1, st.surahName, st.totalAyahs);
                    }
                } else {
                    set({ isPlaying: false, progress: 0 });
                }
            });

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
        set({ audioElement: null, preloadedAudio: null, preloadedAyahNumber: null, preloadedSurahId: null, preloadedReciterId: null });
    },
}));
