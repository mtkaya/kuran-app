// Native functionality hooks - Back button and Media Session
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { useAudioStore } from '../store/audioStore';

/**
 * Hook to handle Android back button behavior
 * - On surah pages: go back to home
 * - On home page: exit app (or minimize)
 */
export function useBackButton() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Listen for back button on Android
        const backHandler = App.addListener('backButton', ({ canGoBack }) => {
            // If we're on a surah page, go back to home
            if (location.pathname.startsWith('/surah/')) {
                navigate('/', { replace: true });
            } else if (location.pathname === '/search' || location.pathname === '/notes') {
                navigate('/', { replace: true });
            } else if (location.pathname === '/') {
                // On home page, exit the app
                App.exitApp();
            } else if (canGoBack) {
                window.history.back();
            } else {
                App.exitApp();
            }
        });

        return () => {
            backHandler.then(h => h.remove());
        };
    }, [navigate, location.pathname]);
}

/**
 * Hook to setup Media Session API for lock screen controls
 * This enables media controls in notification bar and lock screen
 */
export function useMediaSession() {
    const {
        isPlaying,
        currentAyahNumber,
        surahName,
        pause,
        resume,
        nextAyah,
        prevAyah,
        stop,
    } = useAudioStore();

    useEffect(() => {
        // Check if Media Session API is available
        if (!('mediaSession' in navigator)) {
            console.log('Media Session API not supported');
            return;
        }

        // Update metadata when current track changes
        if (surahName && currentAyahNumber) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: `Ayet ${currentAyahNumber}`,
                artist: surahName,
                album: 'The Holy Quran',
                artwork: [
                    { src: '/logo.svg', sizes: '96x96', type: 'image/svg+xml' },
                    { src: '/logo.svg', sizes: '128x128', type: 'image/svg+xml' },
                    { src: '/logo.svg', sizes: '192x192', type: 'image/svg+xml' },
                    { src: '/logo.svg', sizes: '256x256', type: 'image/svg+xml' },
                    { src: '/logo.svg', sizes: '384x384', type: 'image/svg+xml' },
                    { src: '/logo.svg', sizes: '512x512', type: 'image/svg+xml' },
                ]
            });
        }

        // Update playback state
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    }, [isPlaying, surahName, currentAyahNumber]);

    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        // Set up action handlers
        navigator.mediaSession.setActionHandler('play', () => {
            resume();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            pause();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            prevAyah();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            nextAyah();
        });

        navigator.mediaSession.setActionHandler('stop', () => {
            stop();
        });

        // Seek handlers (optional)
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            const audio = useAudioStore.getState().audioElement;
            if (audio) {
                audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 10));
            }
        });

        navigator.mediaSession.setActionHandler('seekforward', (details) => {
            const audio = useAudioStore.getState().audioElement;
            if (audio) {
                audio.currentTime = Math.min(audio.duration, audio.currentTime + (details.seekOffset || 10));
            }
        });

        return () => {
            // Clear action handlers on cleanup
            try {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
                navigator.mediaSession.setActionHandler('stop', null);
                navigator.mediaSession.setActionHandler('seekbackward', null);
                navigator.mediaSession.setActionHandler('seekforward', null);
            } catch (e) {
                // Some browsers don't support null handlers
            }
        };
    }, [pause, resume, nextAyah, prevAyah, stop]);
}

/**
 * Combined hook for all native functionality
 */
export function useNativeFeatures() {
    useBackButton();
    useMediaSession();
}
