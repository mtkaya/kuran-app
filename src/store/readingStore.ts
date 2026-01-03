// Reading Position Store
import { create } from 'zustand';
import { ReadingPosition } from '../storage/types';
import { getLastRead, saveLastRead } from '../storage/storage';

interface ReadingState {
    lastRead: ReadingPosition | null;
    setLastRead: (position: ReadingPosition) => void;
    clearLastRead: () => void;
    hydrate: () => void;
}

export const useReadingStore = create<ReadingState>((set) => ({
    lastRead: null,

    setLastRead: (position) => {
        const positionWithTime = { ...position, timestamp: Date.now() };
        set({ lastRead: positionWithTime });
        saveLastRead(positionWithTime);
    },

    clearLastRead: () => {
        set({ lastRead: null });
        saveLastRead(null);
    },

    hydrate: () => {
        const lastRead = getLastRead();
        set({ lastRead });
    },
}));
