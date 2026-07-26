// Memorization drill logic — pure, so the whole flow is testable without audio.
//
// A drill walks a range of ayahs, repeating each one a fixed number of times
// with a configurable pause in between, optionally looping the range.

export interface MemorizationConfig {
    surahId: number;
    surahName: string;
    totalAyahs: number;
    /**
     * Global id (1-6236) of this surah's first ayah. Ayah ids are global and
     * sequential, so every ayah id in the surah derives from it.
     */
    surahFirstAyahId: number;
    fromAyah: number;
    toAyah: number;
    /** How many times each ayah is recited before moving on (1-10) */
    repeatCount: number;
    /** Silence between recitations, in seconds (0-10) */
    gapSeconds: number;
    /** Restart the range after the last ayah instead of finishing */
    loopRange: boolean;
}

export const MEMORIZATION_LIMITS = {
    minRepeat: 1,
    maxRepeat: 10,
    minGap: 0,
    maxGap: 10,
} as const;

export type MemorizationStep =
    /** Play the same ayah again (repeatIndex-th recitation) */
    | { type: 'repeat'; ayahNumber: number; repeatIndex: number; delayMs: number }
    /** Move to the next ayah in the range */
    | { type: 'advance'; ayahNumber: number; repeatIndex: number; delayMs: number }
    /** Range finished, start it over */
    | { type: 'loop'; ayahNumber: number; repeatIndex: number; delayMs: number }
    /** Range finished and no loop requested */
    | { type: 'done' };

export function clampConfig(config: MemorizationConfig): MemorizationConfig {
    const from = Math.max(1, Math.min(config.fromAyah, config.totalAyahs));
    const to = Math.max(from, Math.min(config.toAyah, config.totalAyahs));
    return {
        ...config,
        fromAyah: from,
        toAyah: to,
        repeatCount: Math.max(
            MEMORIZATION_LIMITS.minRepeat,
            Math.min(Math.round(config.repeatCount), MEMORIZATION_LIMITS.maxRepeat)
        ),
        gapSeconds: Math.max(
            MEMORIZATION_LIMITS.minGap,
            Math.min(config.gapSeconds, MEMORIZATION_LIMITS.maxGap)
        ),
    };
}

export function isInRange(config: MemorizationConfig, ayahNumber: number): boolean {
    return ayahNumber >= config.fromAyah && ayahNumber <= config.toAyah;
}

/** Global ayah id for an in-surah ayah number */
export function ayahIdFor(config: MemorizationConfig, ayahNumber: number): number {
    return config.surahFirstAyahId + (ayahNumber - 1);
}

/**
 * Decide what happens after the recitation that just finished.
 *
 * @param currentAyah the ayah that just played
 * @param repeatIndex which recitation of that ayah just finished (1-based)
 */
export function nextMemorizationStep(
    config: MemorizationConfig,
    currentAyah: number,
    repeatIndex: number
): MemorizationStep {
    // Playback wandered outside the drill (manual skip) — end it rather than
    // yanking the user back
    if (!isInRange(config, currentAyah)) return { type: 'done' };

    const delayMs = Math.round(config.gapSeconds * 1000);

    if (repeatIndex < config.repeatCount) {
        return { type: 'repeat', ayahNumber: currentAyah, repeatIndex: repeatIndex + 1, delayMs };
    }

    if (currentAyah < config.toAyah) {
        return { type: 'advance', ayahNumber: currentAyah + 1, repeatIndex: 1, delayMs };
    }

    if (config.loopRange) {
        return { type: 'loop', ayahNumber: config.fromAyah, repeatIndex: 1, delayMs };
    }

    return { type: 'done' };
}

/** Total recitations in one pass over the range — used for progress display */
export function totalRecitations(config: MemorizationConfig): number {
    return (config.toAyah - config.fromAyah + 1) * config.repeatCount;
}

/** How many recitations are complete, counting the one in progress */
export function completedRecitations(
    config: MemorizationConfig,
    currentAyah: number,
    repeatIndex: number
): number {
    if (!isInRange(config, currentAyah)) return 0;
    return (currentAyah - config.fromAyah) * config.repeatCount + repeatIndex;
}
