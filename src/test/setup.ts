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

// Functional in-memory localStorage so storage-layer tests exercise real
// read/write semantics instead of a silent no-op
class LocalStorageMock implements Storage {
    private store = new Map<string, string>();

    getItem(key: string): string | null {
        return this.store.has(key) ? this.store.get(key)! : null;
    }
    setItem(key: string, value: string): void {
        this.store.set(key, String(value));
    }
    removeItem(key: string): void {
        this.store.delete(key);
    }
    clear(): void {
        this.store.clear();
    }
    key(index: number): string | null {
        return Array.from(this.store.keys())[index] ?? null;
    }
    get length(): number {
        return this.store.size;
    }
}

Object.defineProperty(window, 'localStorage', {
    value: new LocalStorageMock(),
    configurable: true,
});
