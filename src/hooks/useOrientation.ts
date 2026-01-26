import { useState, useEffect } from 'react';

interface OrientationState {
    isLandscape: boolean;
    isPortrait: boolean;
    angle: number;
    type: 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary' | 'unknown';
}

export function useOrientation(): OrientationState {
    const [orientation, setOrientation] = useState<OrientationState>(() => {
        if (typeof window === 'undefined') {
            return {
                isLandscape: false,
                isPortrait: true,
                angle: 0,
                type: 'portrait-primary'
            };
        }

        const isLandscape = window.innerWidth > window.innerHeight;
        return {
            isLandscape,
            isPortrait: !isLandscape,
            angle: window.screen?.orientation?.angle ?? 0,
            type: (window.screen?.orientation?.type as OrientationState['type']) ?? 'unknown'
        };
    });

    useEffect(() => {
        const updateOrientation = () => {
            const isLandscape = window.innerWidth > window.innerHeight;
            setOrientation({
                isLandscape,
                isPortrait: !isLandscape,
                angle: window.screen?.orientation?.angle ?? 0,
                type: (window.screen?.orientation?.type as OrientationState['type']) ?? 'unknown'
            });
        };

        // Listen to both resize and orientation change events
        window.addEventListener('resize', updateOrientation);
        window.addEventListener('orientationchange', updateOrientation);

        // Also listen to screen orientation API if available
        if (window.screen?.orientation) {
            window.screen.orientation.addEventListener('change', updateOrientation);
        }

        return () => {
            window.removeEventListener('resize', updateOrientation);
            window.removeEventListener('orientationchange', updateOrientation);
            if (window.screen?.orientation) {
                window.screen.orientation.removeEventListener('change', updateOrientation);
            }
        };
    }, []);

    return orientation;
}

// Hook for detecting tablet/desktop
export function useDeviceType() {
    const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

    useEffect(() => {
        const updateDeviceType = () => {
            const width = window.innerWidth;
            if (width >= 1024) {
                setDeviceType('desktop');
            } else if (width >= 768) {
                setDeviceType('tablet');
            } else {
                setDeviceType('mobile');
            }
        };

        updateDeviceType();
        window.addEventListener('resize', updateDeviceType);

        return () => window.removeEventListener('resize', updateDeviceType);
    }, []);

    return deviceType;
}
