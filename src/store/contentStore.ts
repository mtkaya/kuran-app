/**
 * Content Store - Zustand store for content panel state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ContentType, ContentProvider, DownloadProgress } from '../types/content';
import { contentService, DEFAULT_PROVIDERS } from '../services/contentService';
import { cacheService } from '../services/cacheService';

interface ContentState {
    // Panel UI State
    activeTab: ContentType;
    isExpanded: boolean;

    // Selected providers
    selectedMealProvider: string;
    selectedTefsirProvider: string;

    // Downloaded providers
    downloadedProviders: string[];
    downloadProgress: DownloadProgress | null;

    // Loading states
    isLoading: boolean;
    error: string | null;

    // Actions
    setActiveTab: (tab: ContentType) => void;
    setExpanded: (expanded: boolean) => void;
    toggleExpanded: () => void;
    setMealProvider: (providerId: string) => void;
    setTefsirProvider: (providerId: string) => void;
    downloadProvider: (providerId: string) => Promise<void>;
    deleteProvider: (providerId: string) => Promise<void>;
    refreshDownloadedProviders: () => Promise<void>;
    getAvailableProviders: (type: ContentType) => ContentProvider[];
    isProviderDownloaded: (providerId: string) => boolean;
}

export const useContentStore = create<ContentState>()(
    persist(
        (set, get) => ({
            // Initial state
            activeTab: 'meal',
            isExpanded: false,
            selectedMealProvider: 'diyanet-meal-tr',
            selectedTefsirProvider: 'diyanet-tefsir-tr',
            downloadedProviders: [],
            downloadProgress: null,
            isLoading: false,
            error: null,

            // Tab actions
            setActiveTab: (tab) => set({ activeTab: tab }),

            setExpanded: (expanded) => set({ isExpanded: expanded }),

            toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

            // Provider selection
            setMealProvider: (providerId) => set({ selectedMealProvider: providerId }),

            setTefsirProvider: (providerId) => set({ selectedTefsirProvider: providerId }),

            // Download management
            downloadProvider: async (providerId) => {
                const provider = contentService.getProvider(providerId);
                if (!provider) return;

                set({
                    downloadProgress: {
                        providerId,
                        downloaded: 0,
                        total: 100,
                        status: 'downloading',
                    },
                });

                const success = await contentService.downloadProvider(providerId, (progress) => {
                    set({
                        downloadProgress: {
                            providerId,
                            downloaded: progress,
                            total: 100,
                            status: 'downloading',
                        },
                    });
                });

                if (success) {
                    set((state) => ({
                        downloadedProviders: [...state.downloadedProviders, providerId],
                        downloadProgress: {
                            providerId,
                            downloaded: 100,
                            total: 100,
                            status: 'completed',
                        },
                    }));
                } else {
                    set({
                        downloadProgress: {
                            providerId,
                            downloaded: 0,
                            total: 100,
                            status: 'error',
                            error: 'İndirme başarısız oldu',
                        },
                    });
                }

                // Clear progress after delay
                setTimeout(() => set({ downloadProgress: null }), 3000);
            },

            deleteProvider: async (providerId) => {
                await contentService.deleteProvider(providerId);
                set((state) => ({
                    downloadedProviders: state.downloadedProviders.filter((id) => id !== providerId),
                }));
            },

            refreshDownloadedProviders: async () => {
                const downloaded = await cacheService.getDownloadedProviders();
                // Add providers that are bundled offline
                const offlineProviders = DEFAULT_PROVIDERS
                    .filter((p) => p.isOffline)
                    .map((p) => p.id);

                const allDownloaded = [...new Set([...downloaded, ...offlineProviders])];
                set({ downloadedProviders: allDownloaded });
            },

            // Helper functions
            getAvailableProviders: (type) => {
                return contentService.getProviders(type);
            },

            isProviderDownloaded: (providerId) => {
                const provider = contentService.getProvider(providerId);
                if (provider?.isOffline) return true;
                return get().downloadedProviders.includes(providerId);
            },
        }),
        {
            name: 'quran-content-store',
            partialize: (state) => ({
                selectedMealProvider: state.selectedMealProvider,
                selectedTefsirProvider: state.selectedTefsirProvider,
                downloadedProviders: state.downloadedProviders,
            }),
        }
    )
);
