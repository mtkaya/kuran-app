import { describe, it, expect } from 'vitest';
import {
    MemorizationConfig,
    ayahIdFor,
    clampConfig,
    completedRecitations,
    isInRange,
    nextMemorizationStep,
    totalRecitations,
} from './memorization';

// Bakara 1-3, each ayah 3x, 2s pause. Bakara's first ayah is global id 8.
const base: MemorizationConfig = {
    surahId: 2,
    surahName: 'Bakara',
    totalAyahs: 286,
    surahFirstAyahId: 8,
    fromAyah: 1,
    toAyah: 3,
    repeatCount: 3,
    gapSeconds: 2,
    loopRange: false,
};

describe('nextMemorizationStep', () => {
    it('repeats the same ayah until the repeat count is reached', () => {
        expect(nextMemorizationStep(base, 1, 1)).toEqual({
            type: 'repeat', ayahNumber: 1, repeatIndex: 2, delayMs: 2000,
        });
        expect(nextMemorizationStep(base, 1, 2)).toEqual({
            type: 'repeat', ayahNumber: 1, repeatIndex: 3, delayMs: 2000,
        });
    });

    it('advances to the next ayah after the last repetition', () => {
        expect(nextMemorizationStep(base, 1, 3)).toEqual({
            type: 'advance', ayahNumber: 2, repeatIndex: 1, delayMs: 2000,
        });
    });

    it('finishes at the end of the range when looping is off', () => {
        expect(nextMemorizationStep(base, 3, 3)).toEqual({ type: 'done' });
    });

    it('loops back to the start of the range when looping is on', () => {
        expect(nextMemorizationStep({ ...base, loopRange: true }, 3, 3)).toEqual({
            type: 'loop', ayahNumber: 1, repeatIndex: 1, delayMs: 2000,
        });
    });

    it('ends the drill when playback moved outside the range', () => {
        expect(nextMemorizationStep(base, 7, 1)).toEqual({ type: 'done' });
    });

    it('runs a single-ayah range correctly', () => {
        const single = { ...base, fromAyah: 5, toAyah: 5, repeatCount: 2, loopRange: true };
        expect(nextMemorizationStep(single, 5, 1)).toMatchObject({ type: 'repeat', repeatIndex: 2 });
        expect(nextMemorizationStep(single, 5, 2)).toMatchObject({ type: 'loop', ayahNumber: 5 });
    });

    it('uses no delay when the gap is zero', () => {
        expect(nextMemorizationStep({ ...base, gapSeconds: 0 }, 1, 1)).toMatchObject({ delayMs: 0 });
    });

    it('walks a full pass in the expected order', () => {
        const seen: string[] = [];
        let ayah = base.fromAyah;
        let repeat = 1;
        for (let guard = 0; guard < 20; guard++) {
            seen.push(`${ayah}#${repeat}`);
            const step = nextMemorizationStep(base, ayah, repeat);
            if (step.type === 'done') break;
            ayah = step.ayahNumber;
            repeat = step.repeatIndex;
        }
        expect(seen).toEqual([
            '1#1', '1#2', '1#3',
            '2#1', '2#2', '2#3',
            '3#1', '3#2', '3#3',
        ]);
    });
});

describe('clampConfig', () => {
    it('keeps the range inside the surah and orders it', () => {
        const c = clampConfig({ ...base, fromAyah: 0, toAyah: 999 });
        expect(c.fromAyah).toBe(1);
        expect(c.toAyah).toBe(286);
    });

    it('never lets the end fall before the start', () => {
        expect(clampConfig({ ...base, fromAyah: 10, toAyah: 3 })).toMatchObject({ fromAyah: 10, toAyah: 10 });
    });

    it('bounds repeat count and gap', () => {
        expect(clampConfig({ ...base, repeatCount: 99, gapSeconds: 99 })).toMatchObject({ repeatCount: 10, gapSeconds: 10 });
        expect(clampConfig({ ...base, repeatCount: 0, gapSeconds: -5 })).toMatchObject({ repeatCount: 1, gapSeconds: 0 });
    });
});

describe('ayah ids and progress', () => {
    it('derives global ayah ids from the surah start', () => {
        expect(ayahIdFor(base, 1)).toBe(8);   // Bakara 1
        expect(ayahIdFor(base, 3)).toBe(10);
    });

    it('reports range membership', () => {
        expect(isInRange(base, 2)).toBe(true);
        expect(isInRange(base, 4)).toBe(false);
    });

    it('counts recitations for progress display', () => {
        expect(totalRecitations(base)).toBe(9);
        expect(completedRecitations(base, 1, 1)).toBe(1);
        expect(completedRecitations(base, 2, 2)).toBe(5);
        expect(completedRecitations(base, 3, 3)).toBe(9);
        expect(completedRecitations(base, 99, 1)).toBe(0);
    });
});
