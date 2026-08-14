import { describe, it, expect } from 'vitest';
import {
    corpusVariantFor,
    ensureTransliteration,
    getTransliteration,
    hasCorpus,
    hasTransliteration,
} from './transliteration';

describe('corpusVariantFor', () => {
    it('gives Turkish readers the Turkish reading', () => {
        expect(corpusVariantFor('tr')).toBe('tr');
    });

    it('gives every other language the Latin reading', () => {
        for (const lang of ['en', 'de', 'fr', 'zh', 'ar', 'id', 'ur', 'bn']) {
            expect(corpusVariantFor(lang)).toBe('en');
        }
    });
});

describe('getTransliteration', () => {
    it('serves the built-in Turkish sample when no corpus is loaded', () => {
        expect(getTransliteration(1, 1, 'tr')).toBe('Bismillâhirrahmânirrahîm');
        expect(getTransliteration(2, 5, 'tr')).toContain('Ülâike');
    });

    it('returns null for verses outside the sample', () => {
        expect(getTransliteration(2, 6, 'tr')).toBeNull();
        expect(getTransliteration(18, 1, 'tr')).toBeNull();
    });

    it('never serves the Turkish sample to non-Turkish readers', () => {
        // Wrong convention for those languages — better nothing than mixed
        expect(getTransliteration(1, 1, 'en')).toBeNull();
        expect(getTransliteration(1, 1, 'de')).toBeNull();
    });

    it('keeps the legacy language-less call working', () => {
        expect(getTransliteration(1, 1)).toBe('Bismillâhirrahmânirrahîm');
    });
});

describe('corpus loading', () => {
    it('resolves even when the corpus files are still empty placeholders', async () => {
        await expect(ensureTransliteration('tr')).resolves.toBeUndefined();
        await expect(ensureTransliteration('en')).resolves.toBeUndefined();
    });

    it('reports no corpus while the placeholders are empty', async () => {
        await ensureTransliteration('tr');
        expect(hasCorpus('tr')).toBe(false);
    });

    it('loads a language only once', async () => {
        const first = ensureTransliteration('tr');
        const second = ensureTransliteration('tr');
        await Promise.all([first, second]);
        expect(hasCorpus('tr')).toBe(false); // still empty, but no crash
    });
});

describe('sample coverage helpers', () => {
    it('knows which surahs the sample covers', () => {
        expect(hasTransliteration(1)).toBe(true);
        expect(hasTransliteration(112)).toBe(true);
        expect(hasTransliteration(18)).toBe(false);
    });
});
