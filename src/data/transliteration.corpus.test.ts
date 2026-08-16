// Coverage checks for the bundled transliteration corpora.
//
// The Latin corpus ships with the app; the Turkish one is a placeholder until
// scripts/fetch-transliteration.mjs is run, so its checks only apply once it
// has content.
import { describe, it, expect } from 'vitest';
import latin from './translit-en.json';
import turkish from './translit-tr.json';

const SURAH_COUNT = 114;
const VERSE_COUNT = 6236;
// Verses per surah, in order — used to confirm nothing is skipped mid-surah
const VERSES_PER_SURAH = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
    111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
    54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
    49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
    44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
    26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
    6, 3, 5, 4, 5, 6,
];

type Corpus = Record<string, Record<string, string>>;

function audit(corpus: Corpus) {
    const surahIds = Object.keys(corpus).map(Number).sort((a, b) => a - b);
    let verses = 0;
    const gaps: string[] = [];
    const blanks: string[] = [];

    for (const id of surahIds) {
        const expected = VERSES_PER_SURAH[id - 1];
        for (let n = 1; n <= expected; n++) {
            const text = corpus[String(id)]?.[String(n)];
            if (text === undefined) {
                gaps.push(`${id}:${n}`);
                continue;
            }
            if (!text.trim()) blanks.push(`${id}:${n}`);
            verses++;
        }
    }
    return { surahIds, verses, gaps, blanks };
}

describe('Latin transliteration corpus', () => {
    const report = audit(latin as Corpus);

    it('covers all 114 surahs', () => {
        expect(report.surahIds.length).toBe(SURAH_COUNT);
        expect(report.surahIds[0]).toBe(1);
        expect(report.surahIds[SURAH_COUNT - 1]).toBe(SURAH_COUNT);
    });

    it('covers all 6236 verses with no gaps', () => {
        expect(report.gaps).toEqual([]);
        expect(report.verses).toBe(VERSE_COUNT);
    });

    it('has no blank records', () => {
        expect(report.blanks).toEqual([]);
    });

    // Asserted against the Turkish corpus rather than against one source's
    // spelling, so swapping where the Latin reading comes from does not fail
    // this on a wording change.
    it.skipIf(Object.keys(turkish as Corpus).length === 0)(
        'carries the Latin reading, not the Turkish one',
        () => {
            const tr = turkish as Corpus;
            const en = latin as Corpus;
            const sample = ['2:6', '18:1', '55:13', '112:1'];
            for (const ref of sample) {
                const [surah, ayah] = ref.split(':');
                expect(en[surah]?.[ayah], `${ref} Latin`).toBeTruthy();
                expect(en[surah][ayah], `${ref} iki korpusta aynı`).not.toBe(tr[surah]?.[ayah]);
            }
        }
    );
});

describe('Turkish transliteration corpus', () => {
    const corpus = turkish as Corpus;
    const populated = Object.keys(corpus).length > 0;

    it.skipIf(!populated)('covers all 114 surahs and 6236 verses with no gaps', () => {
        const report = audit(corpus);
        expect(report.surahIds.length).toBe(SURAH_COUNT);
        expect(report.gaps).toEqual([]);
        expect(report.blanks).toEqual([]);
        expect(report.verses).toBe(VERSE_COUNT);
    });

    it('is a valid object even while it is still a placeholder', () => {
        expect(typeof corpus).toBe('object');
    });
});
