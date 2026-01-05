// Google Drive Turkish Reciters
// These reciters use Google Drive hosting with per-file IDs

export interface GoogleDriveReciter {
    id: string;
    name: string;
    nameLocal: string;
    country: string;
    style: 'Murattal' | 'Mujawwad';
    // Map of surah number -> Google Drive file ID
    surahFileIds: Record<number, string>;
}

// Helper function to get audio URL from Google Drive file ID
export function getGoogleDriveAudioUrl(fileId: string): string {
    return `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
}

// Turkish Reciters from Google Drive
export const GOOGLE_DRIVE_RECITERS: GoogleDriveReciter[] = [
    {
        id: 'davut-kaya',
        name: 'Davut Kaya',
        nameLocal: 'Davut Kaya',
        country: '🇹🇷',
        style: 'Murattal',
        surahFileIds: {
            // Surah number -> Google Drive file ID
            // These need to be collected from Google Drive
            1: '1eTJ-i0SSYKf1X3dUI4ZV3oRT4y5mVuEU', // 001Fatiha.mp3
            // TODO: Add remaining surah file IDs
        },
    },
    // TODO: Add more Turkish reciters as file IDs are collected
    // İlhan Tok
    // Hasan Hüseyin Varol
    // İsmail Biçer
    // Kani Karaca
    // etc.
];

/**
 * Get reciter by ID
 */
export function getGoogleDriveReciterById(id: string): GoogleDriveReciter | undefined {
    return GOOGLE_DRIVE_RECITERS.find(r => r.id === id);
}

/**
 * Check if a Google Drive reciter has a specific surah
 */
export function hasSurah(reciter: GoogleDriveReciter, surahNumber: number): boolean {
    return surahNumber in reciter.surahFileIds;
}

/**
 * Get audio URL for a specific surah from Google Drive reciter
 * Note: Google Drive reciters have full surah audio, not individual ayahs
 */
export function getGoogleDriveSurahAudioUrl(
    reciter: GoogleDriveReciter,
    surahNumber: number
): string | null {
    const fileId = reciter.surahFileIds[surahNumber];
    if (!fileId) return null;
    return getGoogleDriveAudioUrl(fileId);
}
