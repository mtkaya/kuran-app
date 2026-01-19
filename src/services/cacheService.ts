/**
 * Cache Service - IndexedDB based caching for offline content
 * Handles storing and retrieving tefsir, meal, and related content
 */

import { CacheEntry, SurahContentBatch } from '../types/content';

const DB_NAME = 'quran-content-cache';
const DB_VERSION = 1;
const STORE_CONTENT = 'content';
const STORE_BATCHES = 'batches';
const STORE_META = 'meta';

class CacheService {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    /**
     * Initialize the IndexedDB database
     */
    async init(): Promise<void> {
        if (this.db) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open cache database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Store for individual content items
                if (!db.objectStoreNames.contains(STORE_CONTENT)) {
                    const contentStore = db.createObjectStore(STORE_CONTENT, { keyPath: 'key' });
                    contentStore.createIndex('providerId', 'providerId', { unique: false });
                    contentStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Store for surah-level batches
                if (!db.objectStoreNames.contains(STORE_BATCHES)) {
                    const batchStore = db.createObjectStore(STORE_BATCHES, { keyPath: ['surahId', 'providerId', 'type'] });
                    batchStore.createIndex('providerId', 'providerId', { unique: false });
                }

                // Store for metadata (downloaded providers, etc.)
                if (!db.objectStoreNames.contains(STORE_META)) {
                    db.createObjectStore(STORE_META, { keyPath: 'key' });
                }
            };
        });

        return this.initPromise;
    }

    /**
     * Generate cache key for content
     */
    private generateKey(type: string, providerId: string, surahId: number, ayahNumber: number): string {
        return `${type}:${providerId}:${surahId}:${ayahNumber}`;
    }

    /**
     * Get single content item from cache
     */
    async get<T>(type: string, providerId: string, surahId: number, ayahNumber: number): Promise<T | null> {
        await this.init();
        if (!this.db) return null;

        const key = this.generateKey(type, providerId, surahId, ayahNumber);

        return new Promise((resolve) => {
            const transaction = this.db!.transaction(STORE_CONTENT, 'readonly');
            const store = transaction.objectStore(STORE_CONTENT);
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result as CacheEntry<T> | undefined;
                if (result) {
                    // Check if expired
                    if (result.expiresAt && result.expiresAt < Date.now()) {
                        resolve(null);
                    } else {
                        resolve(result.data);
                    }
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                console.error('Cache get error:', request.error);
                resolve(null);
            };
        });
    }

    /**
     * Store single content item in cache
     */
    async set<T>(
        type: string,
        providerId: string,
        surahId: number,
        ayahNumber: number,
        data: T,
        ttlMs?: number
    ): Promise<void> {
        await this.init();
        if (!this.db) return;

        const key = this.generateKey(type, providerId, surahId, ayahNumber);
        const entry: CacheEntry<T> = {
            key,
            data,
            timestamp: Date.now(),
            expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
            providerId,
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_CONTENT, 'readwrite');
            const store = transaction.objectStore(STORE_CONTENT);
            const request = store.put(entry);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get entire surah content batch
     */
    async getSurahBatch(type: string, providerId: string, surahId: number): Promise<SurahContentBatch | null> {
        await this.init();
        if (!this.db) return null;

        return new Promise((resolve) => {
            const transaction = this.db!.transaction(STORE_BATCHES, 'readonly');
            const store = transaction.objectStore(STORE_BATCHES);
            const request = store.get([surahId, providerId, type]);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('Batch get error:', request.error);
                resolve(null);
            };
        });
    }

    /**
     * Store entire surah content batch
     */
    async setSurahBatch(batch: SurahContentBatch): Promise<void> {
        await this.init();
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_BATCHES, 'readwrite');
            const store = transaction.objectStore(STORE_BATCHES);
            const request = store.put(batch);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Check if provider content is downloaded
     */
    async isProviderDownloaded(providerId: string): Promise<boolean> {
        await this.init();
        if (!this.db) return false;

        return new Promise((resolve) => {
            const transaction = this.db!.transaction(STORE_META, 'readonly');
            const store = transaction.objectStore(STORE_META);
            const request = store.get(`provider:${providerId}`);

            request.onsuccess = () => {
                resolve(!!request.result?.downloaded);
            };

            request.onerror = () => resolve(false);
        });
    }

    /**
     * Mark provider as downloaded
     */
    async setProviderDownloaded(providerId: string, downloaded: boolean): Promise<void> {
        await this.init();
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_META, 'readwrite');
            const store = transaction.objectStore(STORE_META);
            const request = store.put({
                key: `provider:${providerId}`,
                downloaded,
                timestamp: Date.now(),
            });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get list of downloaded providers
     */
    async getDownloadedProviders(): Promise<string[]> {
        await this.init();
        if (!this.db) return [];

        return new Promise((resolve) => {
            const transaction = this.db!.transaction(STORE_META, 'readonly');
            const store = transaction.objectStore(STORE_META);
            const request = store.getAll();

            request.onsuccess = () => {
                const providers = request.result
                    .filter((item: { key: string; downloaded: boolean }) =>
                        item.key.startsWith('provider:') && item.downloaded
                    )
                    .map((item: { key: string }) => item.key.replace('provider:', ''));
                resolve(providers);
            };

            request.onerror = () => resolve([]);
        });
    }

    /**
     * Clear all cached content for a specific provider
     */
    async clearProvider(providerId: string): Promise<void> {
        await this.init();
        if (!this.db) return;

        // Clear from content store
        const contentTransaction = this.db.transaction(STORE_CONTENT, 'readwrite');
        const contentStore = contentTransaction.objectStore(STORE_CONTENT);
        const contentIndex = contentStore.index('providerId');
        const contentRequest = contentIndex.openCursor(IDBKeyRange.only(providerId));

        contentRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        // Clear from batches store
        const batchTransaction = this.db.transaction(STORE_BATCHES, 'readwrite');
        const batchStore = batchTransaction.objectStore(STORE_BATCHES);
        const batchIndex = batchStore.index('providerId');
        const batchRequest = batchIndex.openCursor(IDBKeyRange.only(providerId));

        batchRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        // Update meta
        await this.setProviderDownloaded(providerId, false);
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{ totalItems: number; totalSize: number }> {
        await this.init();
        if (!this.db) return { totalItems: 0, totalSize: 0 };

        return new Promise((resolve) => {
            const transaction = this.db!.transaction([STORE_CONTENT, STORE_BATCHES], 'readonly');
            let totalItems = 0;

            const contentStore = transaction.objectStore(STORE_CONTENT);
            const contentCount = contentStore.count();
            contentCount.onsuccess = () => {
                totalItems += contentCount.result;
            };

            const batchStore = transaction.objectStore(STORE_BATCHES);
            const batchCount = batchStore.count();
            batchCount.onsuccess = () => {
                totalItems += batchCount.result;
            };

            transaction.oncomplete = () => {
                // Estimate size (rough calculation)
                const estimatedSize = totalItems * 500; // ~500 bytes per item average
                resolve({ totalItems, totalSize: estimatedSize });
            };

            transaction.onerror = () => resolve({ totalItems: 0, totalSize: 0 });
        });
    }
}

// Export singleton instance
export const cacheService = new CacheService();
