import { describe, it, expect } from 'vitest';
import {
    CARD_BACKGROUNDS,
    CARD_FORMATS,
    arabicFontSize,
    stripBasmala,
    wrapText,
} from './verseCard';

// Real strings from the bundled data (src/data/ar.json), not hand-typed.
const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const BAQARA_1 = `${BASMALA} الٓمٓ`;
// Surahs 95 and 97 carry an extra shadda on the bā in this dataset
const TIN_1 = 'بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ وَٱلتِّينِ وَٱلزَّيْتُونِ';
const TAWBA_1 = 'بَرَآءَةٌۭ مِّنَ ٱللَّهِ وَرَسُولِهِۦٓ';
const INSIRAH_5 = 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا';

describe('stripBasmala', () => {
    it('removes the basmala prefixed to a first ayah', () => {
        expect(stripBasmala(BAQARA_1)).toBe('الٓمٓ');
    });

    it('matches despite the extra shadda in surahs 95 and 97', () => {
        expect(stripBasmala(TIN_1)).toBe('وَٱلتِّينِ وَٱلزَّيْتُونِ');
    });

    it('leaves At-Tawbah alone — it has no basmala', () => {
        expect(stripBasmala(TAWBA_1)).toBe(TAWBA_1);
    });

    it('leaves an ordinary ayah untouched', () => {
        expect(stripBasmala(INSIRAH_5)).toBe(INSIRAH_5);
    });

    it('keeps Al-Fatiha 1 intact — there the basmala is the ayah itself', () => {
        expect(stripBasmala(BASMALA)).toBe(BASMALA);
    });

    it('handles a leading byte-order mark', () => {
        expect(stripBasmala(`﻿${BAQARA_1}`)).toBe('الٓمٓ');
    });
});

describe('wrapText', () => {
    // Fake measurer: every character is 10 units wide
    const measure = (s: string) => s.length * 10;

    it('keeps short text on one line', () => {
        expect(wrapText('bir iki', 1000, measure)).toEqual(['bir iki']);
    });

    it('breaks on word boundaries when the line would overflow', () => {
        expect(wrapText('aaa bbb ccc', 70, measure)).toEqual(['aaa bbb', 'ccc']);
    });

    it('never drops a word that is longer than the line', () => {
        expect(wrapText('aaaaaaaaaaaa bb', 50, measure)).toEqual(['aaaaaaaaaaaa', 'bb']);
    });

    it('collapses irregular whitespace', () => {
        expect(wrapText('  bir   iki  ', 1000, measure)).toEqual(['bir iki']);
    });

    it('returns nothing for empty input', () => {
        expect(wrapText('   ', 1000, measure)).toEqual([]);
    });
});

describe('arabicFontSize', () => {
    it('shrinks as the passage gets longer', () => {
        const short = arabicFontSize(1080, 30);
        const medium = arabicFontSize(1080, 120);
        const long = arabicFontSize(1080, 250);
        const veryLong = arabicFontSize(1080, 500);
        expect(short).toBeGreaterThan(medium);
        expect(medium).toBeGreaterThan(long);
        expect(long).toBeGreaterThan(veryLong);
    });

    it('scales with the card width', () => {
        expect(arabicFontSize(2160, 30)).toBe(arabicFontSize(1080, 30) * 2);
    });
});

describe('card presets', () => {
    it('offers the three share formats at upload-friendly sizes', () => {
        expect(CARD_FORMATS.map(f => f.id)).toEqual(['square', 'post', 'story']);
        for (const f of CARD_FORMATS) {
            expect(f.width).toBe(1080);
            expect(f.height).toBeGreaterThanOrEqual(1080);
        }
    });

    it('gives every background a unique id and a full colour set', () => {
        const ids = CARD_BACKGROUNDS.map(b => b.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const b of CARD_BACKGROUNDS) {
            expect(b.ink).toMatch(/^#|rgba?\(/);
            expect(b.accent).toMatch(/^#|rgba?\(/);
            expect(b.rule).toMatch(/^#|rgba?\(/);
            expect(typeof b.paint).toBe('function');
        }
    });
});
