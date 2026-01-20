import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
    isInstalled: boolean;
    isInstallable: boolean;
    isOnline: boolean;
    isUpdateAvailable: boolean;
    isIOS: boolean;
    isIPad: boolean;
    isMacOS: boolean;
    isStandalone: boolean;
}

interface PWAActions {
    promptInstall: () => Promise<boolean>;
    updateApp: () => void;
    clearCache: () => Promise<void>;
}

type UsePWAReturn = PWAState & PWAActions;

/**
 * Hook for PWA functionality - installation, updates, and offline status
 */
export function usePWA(): UsePWAReturn {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isIPad = /ipad/.test(userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isMacOS = /macintosh|mac os x/.test(userAgent) && navigator.maxTouchPoints === 0;

    // Check if running as standalone PWA
    const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

    // Check if already installed
    useEffect(() => {
        if (isStandalone) {
            setIsInstalled(true);
        }

        // Listen for display mode changes
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, [isStandalone]);

    // Listen for install prompt (Chrome/Edge)
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // Listen for successful installation
    useEffect(() => {
        const handler = () => {
            setIsInstalled(true);
            setInstallPrompt(null);
        };

        window.addEventListener('appinstalled', handler);

        return () => window.removeEventListener('appinstalled', handler);
    }, []);

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Monitor service worker updates
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
                setRegistration(reg);

                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setIsUpdateAvailable(true);
                            }
                        });
                    }
                });
            });
        }
    }, []);

    // Prompt installation
    const promptInstall = useCallback(async (): Promise<boolean> => {
        if (installPrompt) {
            await installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            setInstallPrompt(null);
            return outcome === 'accepted';
        }
        return false;
    }, [installPrompt]);

    // Update app (reload with new service worker)
    const updateApp = useCallback(() => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
    }, [registration]);

    // Clear all caches
    const clearCache = useCallback(async () => {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
        }
    }, []);

    return {
        isInstalled,
        isInstallable: !!installPrompt || (isIOS && !isInstalled),
        isOnline,
        isUpdateAvailable,
        isIOS,
        isIPad,
        isMacOS,
        isStandalone,
        promptInstall,
        updateApp,
        clearCache,
    };
}
