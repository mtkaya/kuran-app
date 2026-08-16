import { describe, it, expect, vi } from 'vitest';
import { corpusVariantFor } from './transliteration';

// The module caches a loaded corpus in module scope, so any test that cares
// about load state takes a fresh copy instead of inheriting the previous
// test's. Without this the results depend on declaration order.
async function fresh() {
    vi.resetModules();
    return import('./transliteration');
}

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

describe('before the corpus is loaded', () => {
    it('serves the built-in Turkish sample', async () => {
        const { getTransliteration } = await fresh();
        expect(getTransliteration(1, 1, 'tr')).toBe('Bismillâhirrahmânirrahîm');
        expect(getTransliteration(2, 5, 'tr')).toContain('Ülâike');
    });

    it('returns null for verses outside the sample', async () => {
        const { getTransliteration } = await fresh();
        expect(getTransliteration(2, 6, 'tr')).toBeNull();
        expect(getTransliteration(18, 1, 'tr')).toBeNull();
    });

    it('never serves the Turkish sample to non-Turkish readers', async () => {
        // Wrong convention for those languages — better nothing than mixed
        const { getTransliteration } = await fresh();
        expect(getTransliteration(1, 1, 'en')).toBeNull();
        expect(getTransliteration(1, 1, 'de')).toBeNull();
    });

    it('keeps the legacy language-less call working', async () => {
        const { getTransliteration } = await fresh();
        expect(getTransliteration(1, 1)).toBe('Bismillâhirrahmânirrahîm');
    });
});

describe('after the corpus is loaded', () => {
    it('reports the corpus as present', async () => {
        const { ensureTransliteration, hasCorpus } = await fresh();
        await ensureTransliteration('tr');
        expect(hasCorpus('tr')).toBe(true);
    });

    it('covers the verses the sample never reached', async () => {
        const { ensureTransliteration, getTransliteration } = await fresh();
        await ensureTransliteration('tr');
        // The gap a reader reported on iOS: readings stopped after Bakara 5
        expect(getTransliteration(2, 6, 'tr')).toBeTruthy();
        expect(getTransliteration(18, 1, 'tr')).toBeTruthy();
        expect(getTransliteration(2, 286, 'tr')).toBeTruthy();
    });

    it('prefers the corpus over the built-in sample', async () => {
        const { ensureTransliteration, getTransliteration } = await fresh();
        await ensureTransliteration('tr');
        expect(getTransliteration(1, 1, 'tr')).not.toBe('Bismillâhirrahmânirrahîm');
    });

    it('serves non-Turkish readers the Latin reading', async () => {
        const { ensureTransliteration, getTransliteration } = await fresh();
        await ensureTransliteration('en');
        const latin = getTransliteration(2, 6, 'en');
        expect(latin).toBeTruthy();
        expect(getTransliteration(2, 6, 'de')).toBe(latin);
    });

    it('loads a language only once', async () => {
        const { ensureTransliteration, hasCorpus } = await fresh();
        const first = ensureTransliteration('tr');
        const second = ensureTransliteration('tr');
        expect(second).toBe(first); // same in-flight promise, not a second import
        await Promise.all([first, second]);
        expect(hasCorpus('tr')).toBe(true);
    });

    it('resolves for both variants', async () => {
        const { ensureTransliteration } = await fresh();
        await expect(ensureTransliteration('tr')).resolves.toBeUndefined();
        await expect(ensureTransliteration('en')).resolves.toBeUndefined();
    });
});

describe('sample coverage helpers', () => {
    // Unused by the app now that the full corpus ships, but still exported —
    // the sample is what renders in the instant before the lazy chunk lands.
    it('knows which surahs the sample covers', async () => {
        const { hasTransliteration } = await fresh();
        expect(hasTransliteration(1)).toBe(true);
        expect(hasTransliteration(112)).toBe(true);
        expect(hasTransliteration(18)).toBe(false);
    });
});

describe('basmala alignment', () => {
    // src/data/ar.json carries the basmala inside ayah 1 for 113 of 114
    // surahs, so the reading has to carry it too or the two lines disagree
    // on screen. Surah 1's ayah 1 already is the basmala and surah 9 has
    // none — those two must be left alone.
    const BASMALA = 'Bismillahir rahmanir rahim.';

    it('prefixes the reading of ayah 1 everywhere the Arabic has it', async () => {
        const { ensureTransliteration, getTransliteration } = await fresh();
        await ensureTransliteration('tr');
        for (const surah of [2, 18, 36, 112, 114]) {
            expect(getTransliteration(surah, 1, 'tr'), `sure ${surah}`).toMatch(
                new RegExp(`^${BASMALA.replace('.', '\\.')}\\s`)
            );
        }
    });

    it('leaves surah 9 alone, which has no basmala', async () => {
        const { ensureTransliteration, getTransliteration } = await fresh();
        await ensureTransliteration('tr');
        expect(getTransliteration(9, 1, 'tr')).not.toContain(BASMALA);
    });

    it('does not double the basmala in surah 1, where it is ayah 1', async () => {
        const { ensureTransliteration, getTransliteration } = await fresh();
        await ensureTransliteration('tr');
        expect(getTransliteration(1, 1, 'tr')).toBe(BASMALA);
    });
});
