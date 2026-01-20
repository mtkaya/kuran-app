import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

interface DeviceLayout {
    deviceType: DeviceType;
    orientation: Orientation;
    isTablet: boolean;
    isDesktop: boolean;
    isMobile: boolean;
    isLandscape: boolean;
    isPortrait: boolean;
    screenWidth: number;
    screenHeight: number;
    // Layout helpers
    showSidebar: boolean;
    showSplitView: boolean;
    contentColumns: 1 | 2 | 3;
    surahGridColumns: number;
}

// Breakpoints
const MOBILE_MAX = 767;
const TABLET_MIN = 768;
const TABLET_MAX = 1024;

/**
 * Hook to detect device type and orientation for responsive layouts
 * Optimized for iPad and tablet experiences
 */
export function useDeviceLayout(): DeviceLayout {
    const getLayout = (): DeviceLayout => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = width > height;

        let deviceType: DeviceType;
        if (width <= MOBILE_MAX) {
            deviceType = 'mobile';
        } else if (width >= TABLET_MIN && width <= TABLET_MAX) {
            deviceType = 'tablet';
        } else {
            deviceType = 'desktop';
        }

        const isTablet = deviceType === 'tablet';
        const isDesktop = deviceType === 'desktop';
        const isMobile = deviceType === 'mobile';

        // Determine layout features based on device
        const showSidebar = isDesktop || (isTablet && isLandscape);
        const showSplitView = isDesktop || (isTablet && isLandscape);

        // Content columns for reader view
        let contentColumns: 1 | 2 | 3 = 1;
        if (isDesktop && width >= 1440) {
            contentColumns = 3;
        } else if (isDesktop || (isTablet && isLandscape)) {
            contentColumns = 2;
        }

        // Surah grid columns
        let surahGridColumns = 1;
        if (width >= 1440) {
            surahGridColumns = 5;
        } else if (width >= 1200) {
            surahGridColumns = 4;
        } else if (width >= TABLET_MIN) {
            surahGridColumns = 3;
        } else if (width >= 480) {
            surahGridColumns = 2;
        }

        return {
            deviceType,
            orientation: isLandscape ? 'landscape' : 'portrait',
            isTablet,
            isDesktop,
            isMobile,
            isLandscape,
            isPortrait: !isLandscape,
            screenWidth: width,
            screenHeight: height,
            showSidebar,
            showSplitView,
            contentColumns,
            surahGridColumns,
        };
    };

    const [layout, setLayout] = useState<DeviceLayout>(getLayout);

    useEffect(() => {
        const handleResize = () => {
            setLayout(getLayout());
        };

        // Also listen for orientation changes
        const handleOrientationChange = () => {
            // Delay to allow the browser to update dimensions
            setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);

        // Initial check
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, []);

    return layout;
}

/**
 * CSS class helper based on device layout
 */
export function getLayoutClasses(layout: DeviceLayout): string {
    const classes: string[] = [];

    classes.push(`device-${layout.deviceType}`);
    classes.push(`orientation-${layout.orientation}`);

    if (layout.showSidebar) classes.push('has-sidebar');
    if (layout.showSplitView) classes.push('has-split-view');

    return classes.join(' ');
}
