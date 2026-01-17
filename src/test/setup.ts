// Test setup file
import '@testing-library/jest-dom'

// Mock IntersectionObserver
class IntersectionObserverMock {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];

    constructor() { }

    disconnect() { }
    observe() { }
    unobserve() { }
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

// Mock Audio
class AudioMock {
    src = '';
    currentTime = 0;
    duration = 0;
    paused = true;
    volume = 1;
    playbackRate = 1;
    preload = 'auto';

    play() {
        this.paused = false;
        return Promise.resolve();
    }
    pause() {
        this.paused = true;
    }
    addEventListener() { }
    removeEventListener() { }
}

global.Audio = AudioMock as unknown as typeof Audio;

// Mock navigator.mediaSession
Object.defineProperty(navigator, 'mediaSession', {
    value: {
        metadata: null,
        playbackState: 'none',
        setActionHandler: () => { },
    },
    writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }),
});

// Mock localStorage
const localStorageMock = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
    length: 0,
    key: () => null,
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});
