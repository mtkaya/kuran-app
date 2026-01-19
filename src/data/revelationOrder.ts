/**
 * Revelation Order Data - Surelerin iniş (nüzul) sırasına göre listesi
 * Kaynak: İslami kaynaklara göre genel kabul görmüş sıralama
 */

export interface RevelationSurah {
    revelationOrder: number;  // İniş sırası
    surahId: number;          // Mushaf sırası
    period: 'mekki' | 'medeni'; // Mekki veya Medeni
    verseCount: number;
}

// İniş sırasına göre sureler (1-114)
export const REVELATION_ORDER: RevelationSurah[] = [
    { revelationOrder: 1, surahId: 96, period: 'mekki', verseCount: 19 },   // Alak
    { revelationOrder: 2, surahId: 68, period: 'mekki', verseCount: 52 },   // Kalem
    { revelationOrder: 3, surahId: 73, period: 'mekki', verseCount: 20 },   // Müzzemmil
    { revelationOrder: 4, surahId: 74, period: 'mekki', verseCount: 56 },   // Müddessir
    { revelationOrder: 5, surahId: 1, period: 'mekki', verseCount: 7 },     // Fatiha
    { revelationOrder: 6, surahId: 111, period: 'mekki', verseCount: 5 },   // Tebbet
    { revelationOrder: 7, surahId: 81, period: 'mekki', verseCount: 29 },   // Tekvir
    { revelationOrder: 8, surahId: 87, period: 'mekki', verseCount: 19 },   // A'la
    { revelationOrder: 9, surahId: 92, period: 'mekki', verseCount: 21 },   // Leyl
    { revelationOrder: 10, surahId: 89, period: 'mekki', verseCount: 30 },  // Fecr
    { revelationOrder: 11, surahId: 93, period: 'mekki', verseCount: 11 },  // Duha
    { revelationOrder: 12, surahId: 94, period: 'mekki', verseCount: 8 },   // İnşirah
    { revelationOrder: 13, surahId: 103, period: 'mekki', verseCount: 3 },  // Asr
    { revelationOrder: 14, surahId: 100, period: 'mekki', verseCount: 11 }, // Adiyat
    { revelationOrder: 15, surahId: 108, period: 'mekki', verseCount: 3 },  // Kevser
    { revelationOrder: 16, surahId: 102, period: 'mekki', verseCount: 8 },  // Tekasür
    { revelationOrder: 17, surahId: 107, period: 'mekki', verseCount: 7 },  // Maun
    { revelationOrder: 18, surahId: 109, period: 'mekki', verseCount: 6 },  // Kafirun
    { revelationOrder: 19, surahId: 105, period: 'mekki', verseCount: 5 },  // Fil
    { revelationOrder: 20, surahId: 113, period: 'mekki', verseCount: 5 },  // Felak
    { revelationOrder: 21, surahId: 114, period: 'mekki', verseCount: 6 },  // Nas
    { revelationOrder: 22, surahId: 112, period: 'mekki', verseCount: 4 },  // İhlas
    { revelationOrder: 23, surahId: 53, period: 'mekki', verseCount: 62 },  // Necm
    { revelationOrder: 24, surahId: 80, period: 'mekki', verseCount: 42 },  // Abese
    { revelationOrder: 25, surahId: 97, period: 'mekki', verseCount: 5 },   // Kadir
    { revelationOrder: 26, surahId: 91, period: 'mekki', verseCount: 15 },  // Şems
    { revelationOrder: 27, surahId: 85, period: 'mekki', verseCount: 22 },  // Buruc
    { revelationOrder: 28, surahId: 95, period: 'mekki', verseCount: 8 },   // Tin
    { revelationOrder: 29, surahId: 106, period: 'mekki', verseCount: 4 },  // Kureyş
    { revelationOrder: 30, surahId: 101, period: 'mekki', verseCount: 11 }, // Karia
    { revelationOrder: 31, surahId: 75, period: 'mekki', verseCount: 40 },  // Kıyame
    { revelationOrder: 32, surahId: 104, period: 'mekki', verseCount: 9 },  // Hümeze
    { revelationOrder: 33, surahId: 77, period: 'mekki', verseCount: 50 },  // Mürselat
    { revelationOrder: 34, surahId: 50, period: 'mekki', verseCount: 45 },  // Kaf
    { revelationOrder: 35, surahId: 90, period: 'mekki', verseCount: 20 },  // Beled
    { revelationOrder: 36, surahId: 86, period: 'mekki', verseCount: 17 },  // Tarık
    { revelationOrder: 37, surahId: 54, period: 'mekki', verseCount: 55 },  // Kamer
    { revelationOrder: 38, surahId: 38, period: 'mekki', verseCount: 88 },  // Sad
    { revelationOrder: 39, surahId: 7, period: 'mekki', verseCount: 206 },  // A'raf
    { revelationOrder: 40, surahId: 72, period: 'mekki', verseCount: 28 },  // Cin
    { revelationOrder: 41, surahId: 36, period: 'mekki', verseCount: 83 },  // Yasin
    { revelationOrder: 42, surahId: 25, period: 'mekki', verseCount: 77 },  // Furkan
    { revelationOrder: 43, surahId: 35, period: 'mekki', verseCount: 45 },  // Fatır
    { revelationOrder: 44, surahId: 19, period: 'mekki', verseCount: 98 },  // Meryem
    { revelationOrder: 45, surahId: 20, period: 'mekki', verseCount: 135 }, // Taha
    { revelationOrder: 46, surahId: 56, period: 'mekki', verseCount: 96 },  // Vakıa
    { revelationOrder: 47, surahId: 26, period: 'mekki', verseCount: 227 }, // Şuara
    { revelationOrder: 48, surahId: 27, period: 'mekki', verseCount: 93 },  // Neml
    { revelationOrder: 49, surahId: 28, period: 'mekki', verseCount: 88 },  // Kasas
    { revelationOrder: 50, surahId: 17, period: 'mekki', verseCount: 111 }, // İsra
    { revelationOrder: 51, surahId: 10, period: 'mekki', verseCount: 109 }, // Yunus
    { revelationOrder: 52, surahId: 11, period: 'mekki', verseCount: 123 }, // Hud
    { revelationOrder: 53, surahId: 12, period: 'mekki', verseCount: 111 }, // Yusuf
    { revelationOrder: 54, surahId: 15, period: 'mekki', verseCount: 99 },  // Hicr
    { revelationOrder: 55, surahId: 6, period: 'mekki', verseCount: 165 },  // En'am
    { revelationOrder: 56, surahId: 37, period: 'mekki', verseCount: 182 }, // Saffat
    { revelationOrder: 57, surahId: 31, period: 'mekki', verseCount: 34 },  // Lokman
    { revelationOrder: 58, surahId: 34, period: 'mekki', verseCount: 54 },  // Sebe
    { revelationOrder: 59, surahId: 39, period: 'mekki', verseCount: 75 },  // Zümer
    { revelationOrder: 60, surahId: 40, period: 'mekki', verseCount: 85 },  // Mümin
    { revelationOrder: 61, surahId: 41, period: 'mekki', verseCount: 54 },  // Fussilet
    { revelationOrder: 62, surahId: 42, period: 'mekki', verseCount: 53 },  // Şura
    { revelationOrder: 63, surahId: 43, period: 'mekki', verseCount: 89 },  // Zuhruf
    { revelationOrder: 64, surahId: 44, period: 'mekki', verseCount: 59 },  // Duhan
    { revelationOrder: 65, surahId: 45, period: 'mekki', verseCount: 37 },  // Casiye
    { revelationOrder: 66, surahId: 46, period: 'mekki', verseCount: 35 },  // Ahkaf
    { revelationOrder: 67, surahId: 51, period: 'mekki', verseCount: 60 },  // Zariyat
    { revelationOrder: 68, surahId: 88, period: 'mekki', verseCount: 26 },  // Gaşiye
    { revelationOrder: 69, surahId: 18, period: 'mekki', verseCount: 110 }, // Kehf
    { revelationOrder: 70, surahId: 16, period: 'mekki', verseCount: 128 }, // Nahl
    { revelationOrder: 71, surahId: 71, period: 'mekki', verseCount: 28 },  // Nuh
    { revelationOrder: 72, surahId: 14, period: 'mekki', verseCount: 52 },  // İbrahim
    { revelationOrder: 73, surahId: 21, period: 'mekki', verseCount: 112 }, // Enbiya
    { revelationOrder: 74, surahId: 23, period: 'mekki', verseCount: 118 }, // Müminun
    { revelationOrder: 75, surahId: 32, period: 'mekki', verseCount: 30 },  // Secde
    { revelationOrder: 76, surahId: 52, period: 'mekki', verseCount: 49 },  // Tur
    { revelationOrder: 77, surahId: 67, period: 'mekki', verseCount: 30 },  // Mülk
    { revelationOrder: 78, surahId: 69, period: 'mekki', verseCount: 52 },  // Hakka
    { revelationOrder: 79, surahId: 70, period: 'mekki', verseCount: 44 },  // Mearic
    { revelationOrder: 80, surahId: 78, period: 'mekki', verseCount: 40 },  // Nebe
    { revelationOrder: 81, surahId: 79, period: 'mekki', verseCount: 46 },  // Naziat
    { revelationOrder: 82, surahId: 82, period: 'mekki', verseCount: 19 },  // İnfitar
    { revelationOrder: 83, surahId: 84, period: 'mekki', verseCount: 25 },  // İnşikak
    { revelationOrder: 84, surahId: 30, period: 'mekki', verseCount: 60 },  // Rum
    { revelationOrder: 85, surahId: 29, period: 'mekki', verseCount: 69 },  // Ankebut
    { revelationOrder: 86, surahId: 83, period: 'mekki', verseCount: 36 },  // Mutaffifin
    { revelationOrder: 87, surahId: 2, period: 'medeni', verseCount: 286 }, // Bakara
    { revelationOrder: 88, surahId: 8, period: 'medeni', verseCount: 75 },  // Enfal
    { revelationOrder: 89, surahId: 3, period: 'medeni', verseCount: 200 }, // Al-i İmran
    { revelationOrder: 90, surahId: 33, period: 'medeni', verseCount: 73 }, // Ahzab
    { revelationOrder: 91, surahId: 60, period: 'medeni', verseCount: 13 }, // Mümtehine
    { revelationOrder: 92, surahId: 4, period: 'medeni', verseCount: 176 }, // Nisa
    { revelationOrder: 93, surahId: 99, period: 'medeni', verseCount: 8 },  // Zilzal
    { revelationOrder: 94, surahId: 57, period: 'medeni', verseCount: 29 }, // Hadid
    { revelationOrder: 95, surahId: 47, period: 'medeni', verseCount: 38 }, // Muhammed
    { revelationOrder: 96, surahId: 13, period: 'medeni', verseCount: 43 }, // Ra'd
    { revelationOrder: 97, surahId: 55, period: 'medeni', verseCount: 78 }, // Rahman
    { revelationOrder: 98, surahId: 76, period: 'medeni', verseCount: 31 }, // İnsan
    { revelationOrder: 99, surahId: 65, period: 'medeni', verseCount: 12 }, // Talak
    { revelationOrder: 100, surahId: 98, period: 'medeni', verseCount: 8 }, // Beyyine
    { revelationOrder: 101, surahId: 59, period: 'medeni', verseCount: 24 }, // Haşr
    { revelationOrder: 102, surahId: 24, period: 'medeni', verseCount: 64 }, // Nur
    { revelationOrder: 103, surahId: 22, period: 'medeni', verseCount: 78 }, // Hac
    { revelationOrder: 104, surahId: 63, period: 'medeni', verseCount: 11 }, // Münafikun
    { revelationOrder: 105, surahId: 58, period: 'medeni', verseCount: 22 }, // Mücadele
    { revelationOrder: 106, surahId: 49, period: 'medeni', verseCount: 18 }, // Hucurat
    { revelationOrder: 107, surahId: 66, period: 'medeni', verseCount: 12 }, // Tahrim
    { revelationOrder: 108, surahId: 64, period: 'medeni', verseCount: 18 }, // Tegabun
    { revelationOrder: 109, surahId: 61, period: 'medeni', verseCount: 14 }, // Saff
    { revelationOrder: 110, surahId: 62, period: 'medeni', verseCount: 11 }, // Cuma
    { revelationOrder: 111, surahId: 48, period: 'medeni', verseCount: 29 }, // Fetih
    { revelationOrder: 112, surahId: 5, period: 'medeni', verseCount: 120 }, // Maide
    { revelationOrder: 113, surahId: 9, period: 'medeni', verseCount: 129 }, // Tevbe
    { revelationOrder: 114, surahId: 110, period: 'medeni', verseCount: 3 }, // Nasr
];

// Mekki ve Medeni sure sayıları
export const MEKKI_COUNT = REVELATION_ORDER.filter(s => s.period === 'mekki').length; // 86
export const MEDENI_COUNT = REVELATION_ORDER.filter(s => s.period === 'medeni').length; // 28

// Helper: Mushaf sırasından iniş sırasını bul
export function getRevelationOrder(surahId: number): number | undefined {
    return REVELATION_ORDER.find(s => s.surahId === surahId)?.revelationOrder;
}

// Helper: İniş sırasından sure bilgisi al
export function getSurahByRevelationOrder(order: number): RevelationSurah | undefined {
    return REVELATION_ORDER.find(s => s.revelationOrder === order);
}
