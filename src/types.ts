export interface Ayah {
    id: number;
    surah_id: number;
    ayah_number: number;
    text_arabic: string;
    text_meal: string;
    notes?: string;
    related_ayahs?: number[];
}

export interface Surah {
    id: number;
    name_arabic: string;
    name_turkish: string;
    verse_count: number;
    ayahs: Ayah[];
}
