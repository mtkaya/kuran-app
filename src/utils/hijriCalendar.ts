// Hijri (Islamic) Calendar Utilities
// Uses the browser's Intl.DateTimeFormat API with the Umm al-Qura calendar
// for accurate Hijri date conversion

const HIJRI_MONTHS_TR = [
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
 * Uses the Intl.DateTimeFormat API with the Umm al-Qura calendar for accuracy
 */
export function gregorianToHijri(date: Date = new Date()): HijriDate {
    try {
        // Use the Intl API with Umm al-Qura calendar (most accurate)
        const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        }).formatToParts(date);

        let day = 1;
        let month = 1;
        let year = 1445;

        for (const part of parts) {
            if (part.type === 'day') day = parseInt(part.value, 10);
            if (part.type === 'month') month = parseInt(part.value, 10);
            if (part.type === 'year') year = parseInt(part.value, 10);
        }

        return {
            day,
            month,
            year,
            monthName: HIJRI_MONTHS_TR[month - 1] || HIJRI_MONTHS_TR[0],
            monthNameAr: HIJRI_MONTHS_AR[month - 1] || HIJRI_MONTHS_AR[0],
        };
    } catch {
        // Fallback: algorithmic conversion (Kuwaiti algorithm) for older browsers
        return gregorianToHijriFallback(date);
    }
}

/**
 * Fallback algorithmic conversion for browsers without Intl support
 * Uses the Kuwaiti algorithm
 */
function gregorianToHijriFallback(date: Date): HijriDate {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    let jd: number;
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
        monthName: HIJRI_MONTHS_TR[hijriMonth - 1] || HIJRI_MONTHS_TR[0],
        monthNameAr: HIJRI_MONTHS_AR[hijriMonth - 1] || HIJRI_MONTHS_AR[0],
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
