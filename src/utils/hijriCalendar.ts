// Hijri (Islamic) Calendar Utilities
// Based on the Umm al-Qura calendar calculation

const HIJRI_MONTHS = [
    'Muharrem',
    'Safer',
    'Rebiülevvel',
    'Rebiülahir',
    'Cemaziyelevvel',
    'Cemaziyelahir',
    'Recep',
    'Şaban',
    'Ramazan',
    'Şevval',
    'Zilkade',
    'Zilhicce'
];

const HIJRI_MONTHS_AR = [
    'محرم',
    'صفر',
    'ربيع الأول',
    'ربيع الثاني',
    'جمادى الأولى',
    'جمادى الآخرة',
    'رجب',
    'شعبان',
    'رمضان',
    'شوال',
    'ذو القعدة',
    'ذو الحجة'
];

interface HijriDate {
    day: number;
    month: number;
    year: number;
    monthName: string;
    monthNameAr: string;
}

/**
 * Convert Gregorian date to Hijri date
 * Uses the Kuwaiti algorithm which is widely accepted
 */
export function gregorianToHijri(date: Date = new Date()): HijriDate {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    // Julian Day calculation
    let jd = Math.floor((11 * year + 3) / 30) +
        Math.floor(354 * year) +
        Math.floor(30 * month) -
        Math.floor((month - 1) / 2) +
        day + 1948440 - 385;

    if (month < 2) {
        jd = Math.floor((1461 * (year - 1 + 4800)) / 4) +
            Math.floor((367 * (month + 10)) / 12) -
            Math.floor((3 * (Math.floor((year - 1 + 4900) / 100))) / 4) +
            day - 32075;
    } else {
        jd = Math.floor((1461 * (year + 4800)) / 4) +
            Math.floor((367 * (month - 2)) / 12) -
            Math.floor((3 * (Math.floor((year + 4900) / 100))) / 4) +
            day - 32075;
    }

    // Convert Julian Day to Hijri
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
        Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
        Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;

    const hijriMonth = Math.floor((24 * l3) / 709);
    const hijriDay = l3 - Math.floor((709 * hijriMonth) / 24);
    const hijriYear = 30 * n + j - 30;

    return {
        day: hijriDay,
        month: hijriMonth,
        year: hijriYear,
        monthName: HIJRI_MONTHS[hijriMonth - 1] || HIJRI_MONTHS[0],
        monthNameAr: HIJRI_MONTHS_AR[hijriMonth - 1] || HIJRI_MONTHS_AR[0]
    };
}

/**
 * Format Hijri date as string
 */
export function formatHijriDate(hijri: HijriDate, format: 'short' | 'long' | 'arabic' = 'long'): string {
    switch (format) {
        case 'short':
            return `${hijri.day}/${hijri.month}/${hijri.year}`;
        case 'arabic':
            return `${hijri.day} ${hijri.monthNameAr} ${hijri.year}`;
        case 'long':
        default:
            return `${hijri.day} ${hijri.monthName} ${hijri.year}`;
    }
}

/**
 * Get current Hijri date formatted
 */
export function getCurrentHijriDate(format: 'short' | 'long' | 'arabic' = 'long'): string {
    const hijri = gregorianToHijri(new Date());
    return formatHijriDate(hijri, format);
}

/**
 * Get Hijri date object for current date
 */
export function getTodayHijri(): HijriDate {
    return gregorianToHijri(new Date());
}
