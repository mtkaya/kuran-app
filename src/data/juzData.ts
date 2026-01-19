/**
 * Juz (Cüz) Data - Kur'an-ı Kerim'in 30 cüze bölünmüş verileri
 * Her cüz, belirli sure ve ayet aralıklarını içerir
 */

export interface JuzInfo {
    juzNumber: number;       // Cüz numarası (1-30)
    name: string;            // Cüzün adı (ilk kelimeler)
    nameArabic: string;      // Arapça adı
    startSurah: number;      // Başlangıç suresi
    startAyah: number;       // Başlangıç ayeti
    endSurah: number;        // Bitiş suresi
    endAyah: number;         // Bitiş ayeti
    totalVerses: number;     // Toplam ayet sayısı (yaklaşık)
    hizbs: number[];         // Hizb numaraları (her cüzde 2 hizb)
}

// 30 Cüz Verisi
export const JUZ_DATA: JuzInfo[] = [
    {
        juzNumber: 1,
        name: "Elif Lam Mim",
        nameArabic: "الٓمٓ",
        startSurah: 1, startAyah: 1,
        endSurah: 2, endAyah: 141,
        totalVerses: 148,
        hizbs: [1, 2]
    },
    {
        juzNumber: 2,
        name: "Seyekulü",
        nameArabic: "سَيَقُولُ",
        startSurah: 2, startAyah: 142,
        endSurah: 2, endAyah: 252,
        totalVerses: 111,
        hizbs: [3, 4]
    },
    {
        juzNumber: 3,
        name: "Tilker Rusul",
        nameArabic: "تِلْكَ الرُّسُلُ",
        startSurah: 2, startAyah: 253,
        endSurah: 3, endAyah: 92,
        totalVerses: 126,
        hizbs: [5, 6]
    },
    {
        juzNumber: 4,
        name: "Len Tenalu",
        nameArabic: "لَن تَنَالُوا",
        startSurah: 3, startAyah: 93,
        endSurah: 4, endAyah: 23,
        totalVerses: 131,
        hizbs: [7, 8]
    },
    {
        juzNumber: 5,
        name: "Vel Muhsanat",
        nameArabic: "وَالْمُحْصَنَاتُ",
        startSurah: 4, startAyah: 24,
        endSurah: 4, endAyah: 147,
        totalVerses: 124,
        hizbs: [9, 10]
    },
    {
        juzNumber: 6,
        name: "La Yuhibbullah",
        nameArabic: "لَا يُحِبُّ اللَّهُ",
        startSurah: 4, startAyah: 148,
        endSurah: 5, endAyah: 81,
        totalVerses: 110,
        hizbs: [11, 12]
    },
    {
        juzNumber: 7,
        name: "Ve İza Semi'u",
        nameArabic: "وَإِذَا سَمِعُوا",
        startSurah: 5, startAyah: 82,
        endSurah: 6, endAyah: 110,
        totalVerses: 149,
        hizbs: [13, 14]
    },
    {
        juzNumber: 8,
        name: "Ve Lev Ennena",
        nameArabic: "وَلَوْ أَنَّنَا",
        startSurah: 6, startAyah: 111,
        endSurah: 7, endAyah: 87,
        totalVerses: 142,
        hizbs: [15, 16]
    },
    {
        juzNumber: 9,
        name: "Kalel Meleu",
        nameArabic: "قَالَ الْمَلَأُ",
        startSurah: 7, startAyah: 88,
        endSurah: 8, endAyah: 40,
        totalVerses: 159,
        hizbs: [17, 18]
    },
    {
        juzNumber: 10,
        name: "Va'lemu",
        nameArabic: "وَاعْلَمُوا",
        startSurah: 8, startAyah: 41,
        endSurah: 9, endAyah: 92,
        totalVerses: 127,
        hizbs: [19, 20]
    },
    {
        juzNumber: 11,
        name: "Ya'tezirune",
        nameArabic: "يَعْتَذِرُونَ",
        startSurah: 9, startAyah: 93,
        endSurah: 11, endAyah: 5,
        totalVerses: 150,
        hizbs: [21, 22]
    },
    {
        juzNumber: 12,
        name: "Ve Ma Min Dabbetin",
        nameArabic: "وَمَا مِن دَابَّةٍ",
        startSurah: 11, startAyah: 6,
        endSurah: 12, endAyah: 52,
        totalVerses: 170,
        hizbs: [23, 24]
    },
    {
        juzNumber: 13,
        name: "Ve Ma Uberriu",
        nameArabic: "وَمَا أُبَرِّئُ",
        startSurah: 12, startAyah: 53,
        endSurah: 14, endAyah: 52,
        totalVerses: 154,
        hizbs: [25, 26]
    },
    {
        juzNumber: 14,
        name: "Rubema",
        nameArabic: "رُبَمَا",
        startSurah: 15, startAyah: 1,
        endSurah: 16, endAyah: 128,
        totalVerses: 227,
        hizbs: [27, 28]
    },
    {
        juzNumber: 15,
        name: "Subhanellezi",
        nameArabic: "سُبْحَانَ الَّذِي",
        startSurah: 17, startAyah: 1,
        endSurah: 18, endAyah: 74,
        totalVerses: 185,
        hizbs: [29, 30]
    },
    {
        juzNumber: 16,
        name: "Kal Elem",
        nameArabic: "قَالَ أَلَمْ",
        startSurah: 18, startAyah: 75,
        endSurah: 20, endAyah: 135,
        totalVerses: 269,
        hizbs: [31, 32]
    },
    {
        juzNumber: 17,
        name: "İkterebe",
        nameArabic: "اقْتَرَبَ",
        startSurah: 21, startAyah: 1,
        endSurah: 22, endAyah: 78,
        totalVerses: 190,
        hizbs: [33, 34]
    },
    {
        juzNumber: 18,
        name: "Kad Efleha",
        nameArabic: "قَدْ أَفْلَحَ",
        startSurah: 23, startAyah: 1,
        endSurah: 25, endAyah: 20,
        totalVerses: 202,
        hizbs: [35, 36]
    },
    {
        juzNumber: 19,
        name: "Ve Kalellezine",
        nameArabic: "وَقَالَ الَّذِينَ",
        startSurah: 25, startAyah: 21,
        endSurah: 27, endAyah: 55,
        totalVerses: 339,
        hizbs: [37, 38]
    },
    {
        juzNumber: 20,
        name: "Emmen Haleka",
        nameArabic: "أَمَّنْ خَلَقَ",
        startSurah: 27, startAyah: 56,
        endSurah: 29, endAyah: 45,
        totalVerses: 171,
        hizbs: [39, 40]
    },
    {
        juzNumber: 21,
        name: "Utlu Ma Uhiye",
        nameArabic: "اتْلُ مَا أُوحِيَ",
        startSurah: 29, startAyah: 46,
        endSurah: 33, endAyah: 30,
        totalVerses: 178,
        hizbs: [41, 42]
    },
    {
        juzNumber: 22,
        name: "Ve Men Yaknut",
        nameArabic: "وَمَن يَقْنُتْ",
        startSurah: 33, startAyah: 31,
        endSurah: 36, endAyah: 27,
        totalVerses: 169,
        hizbs: [43, 44]
    },
    {
        juzNumber: 23,
        name: "Ve Mali",
        nameArabic: "وَمَا لِيَ",
        startSurah: 36, startAyah: 28,
        endSurah: 39, endAyah: 31,
        totalVerses: 357,
        hizbs: [45, 46]
    },
    {
        juzNumber: 24,
        name: "Femen Azlem",
        nameArabic: "فَمَنْ أَظْلَمُ",
        startSurah: 39, startAyah: 32,
        endSurah: 41, endAyah: 46,
        totalVerses: 175,
        hizbs: [47, 48]
    },
    {
        juzNumber: 25,
        name: "İleyhi Yureddu",
        nameArabic: "إِلَيْهِ يُرَدُّ",
        startSurah: 41, startAyah: 47,
        endSurah: 45, endAyah: 37,
        totalVerses: 246,
        hizbs: [49, 50]
    },
    {
        juzNumber: 26,
        name: "Ha Mim",
        nameArabic: "حم",
        startSurah: 46, startAyah: 1,
        endSurah: 51, endAyah: 30,
        totalVerses: 195,
        hizbs: [51, 52]
    },
    {
        juzNumber: 27,
        name: "Kale Fema Hatbukum",
        nameArabic: "قَالَ فَمَا خَطْبُكُمْ",
        startSurah: 51, startAyah: 31,
        endSurah: 57, endAyah: 29,
        totalVerses: 399,
        hizbs: [53, 54]
    },
    {
        juzNumber: 28,
        name: "Kad Semi'allah",
        nameArabic: "قَدْ سَمِعَ اللَّهُ",
        startSurah: 58, startAyah: 1,
        endSurah: 66, endAyah: 12,
        totalVerses: 137,
        hizbs: [55, 56]
    },
    {
        juzNumber: 29,
        name: "Tebarekellezi",
        nameArabic: "تَبَارَكَ الَّذِي",
        startSurah: 67, startAyah: 1,
        endSurah: 77, endAyah: 50,
        totalVerses: 431,
        hizbs: [57, 58]
    },
    {
        juzNumber: 30,
        name: "Amme Yetesaelun",
        nameArabic: "عَمَّ يَتَسَاءَلُونَ",
        startSurah: 78, startAyah: 1,
        endSurah: 114, endAyah: 6,
        totalVerses: 564,
        hizbs: [59, 60]
    }
];

// Helper: Cüz numarasından bilgi al
export function getJuzInfo(juzNumber: number): JuzInfo | undefined {
    return JUZ_DATA.find(j => j.juzNumber === juzNumber);
}

// Helper: Sure ve ayet numarasından cüz bul
export function getJuzForAyah(surahId: number, ayahNumber: number): number {
    for (const juz of JUZ_DATA) {
        const afterStart =
            surahId > juz.startSurah ||
            (surahId === juz.startSurah && ayahNumber >= juz.startAyah);

        const beforeEnd =
            surahId < juz.endSurah ||
            (surahId === juz.endSurah && ayahNumber <= juz.endAyah);

        if (afterStart && beforeEnd) {
            return juz.juzNumber;
        }
    }
    return 1; // Default to first juz
}

// Helper: Belirli cüzdeki sureleri getir
export function getSurahsInJuz(juzNumber: number): number[] {
    const juz = getJuzInfo(juzNumber);
    if (!juz) return [];

    const surahs: number[] = [];
    for (let i = juz.startSurah; i <= juz.endSurah; i++) {
        surahs.push(i);
    }
    return surahs;
}

// Toplam sayılar
export const TOTAL_JUZ = 30;
export const TOTAL_HIZB = 60;
