import { describe, it, expect } from 'vitest';
import { arabicFontStack, BUNDLED_ARABIC_FONT } from './arabicFont';

describe('arabicFontStack', () => {
    // Only BUNDLED_ARABIC_FONT ships with the app; the rest are CDN-only, so
    // every stack has to end somewhere that can actually draw Arabic.
    const CDN_FONTS = [
        'Amiri',
        'Aref Ruqaa',
        'Noto Nastaliq Urdu',
        'Rakkas',
        'Reem Kufi',
        'Scheherazade New',
        'KFGQPC Uthmanic Script Hafs',
    ];

    it('puts the chosen face first', () => {
        for (const font of CDN_FONTS) {
            expect(arabicFontStack(font).startsWith(`'${font}'`), font).toBe(true);
        }
    });

    it('falls back to the bundled face, never to a bare generic', () => {
        for (const font of CDN_FONTS) {
            expect(arabicFontStack(font), font).toContain(`'${BUNDLED_ARABIC_FONT}'`);
        }
    });

    it('does not repeat the bundled face when it is the choice', () => {
        const stack = arabicFontStack(BUNDLED_ARABIC_FONT);
        expect(stack).toBe(`'${BUNDLED_ARABIC_FONT}', serif`);
        expect(stack.match(/Amiri Quran/g)).toHaveLength(1);
    });

    it('handles a missing or blank setting', () => {
        for (const value of [undefined, null, '', '   ']) {
            expect(arabicFontStack(value), String(value)).toBe(`'${BUNDLED_ARABIC_FONT}', serif`);
        }
    });

    it('ends with a generic family so the stack always resolves', () => {
        expect(arabicFontStack('Reem Kufi').endsWith('serif')).toBe(true);
    });
});
