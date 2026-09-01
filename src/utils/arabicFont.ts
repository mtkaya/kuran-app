// Arabic font stacks.
//
// Only 'Amiri Quran' is bundled (public/fonts/amiri-quran.woff2, Arabic range
// only). Every other selectable face — Amiri, Aref Ruqaa, Noto Nastaliq Urdu,
// Rakkas, Reem Kufi, Scheherazade New — is fetched from the Google Fonts CDN,
// and KFGQPC Uthmanic Script Hafs from jsDelivr.
//
// A bare `font-family: 'Reem Kufi'` therefore falls back to the browser's
// default when that request fails, and the default has no Arabic glyphs: the
// verse renders as tofu boxes. That is reachable on any offline launch, which
// the app otherwise supports.
//
// Ending every stack with the bundled face makes the worst case the wrong
// style rather than unreadable text. The verse card renderer already does this
// (CARD_ARABIC_FONT in utils/verseCard.ts); this is the same rule for the DOM.

export const BUNDLED_ARABIC_FONT = 'Amiri Quran';

export function arabicFontStack(font?: string | null): string {
    const chosen = (font ?? '').trim();
    if (!chosen || chosen === BUNDLED_ARABIC_FONT) {
        return `'${BUNDLED_ARABIC_FONT}', serif`;
    }
    return `'${chosen}', '${BUNDLED_ARABIC_FONT}', serif`;
}
