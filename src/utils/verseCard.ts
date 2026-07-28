// Verse card renderer — draws a shareable image of an ayah onto a canvas.
//
// Everything is painted in code: no image assets ship with the backgrounds,
// so adding styles costs nothing in bundle size.

export interface CardFormat {
    id: 'square' | 'post' | 'story';
    labelKey: 'cardFormatSquare' | 'cardFormatPost' | 'cardFormatStory';
    width: number;
    height: number;
}

export const CARD_FORMATS: CardFormat[] = [
    { id: 'square', labelKey: 'cardFormatSquare', width: 1080, height: 1080 },
    { id: 'post', labelKey: 'cardFormatPost', width: 1080, height: 1350 },
    { id: 'story', labelKey: 'cardFormatStory', width: 1080, height: 1920 },
];

export interface CardBackground {
    id: string;
    /** Short Turkish-neutral name shown as the swatch tooltip */
    name: string;
    /** CSS gradient used for the little swatch in the picker */
    swatch: string;
    /** Colour of the verse text */
    ink: string;
    /** Colour of the reference line */
    accent: string;
    /** Colour of hairlines (frame, divider) */
    rule: string;
    paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/** Eight-pointed star (rub el hizb) lattice, drawn as two rotated squares */
function starGrid(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
    const step = w / 5.5;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = w / 620;
    for (let y = -step; y < h + step; y += step) {
        for (let x = -step; x < w + step; x += step) {
            const cx = x + step / 2;
            const cy = y + step / 2;
            const r = step * 0.34;
            for (let k = 0; k < 2; k++) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate((k * Math.PI) / 4);
                ctx.beginPath();
                ctx.rect(-r, -r, r * 2, r * 2);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
    ctx.restore();
}

function linear(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    x1: number, y1: number, x2: number, y2: number,
    stops: [number, string][]
) {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    for (const [at, color] of stops) g.addColorStop(at, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
}

export const CARD_BACKGROUNDS: CardBackground[] = [
    {
        id: 'emerald', name: 'Zümrüt',
        swatch: 'linear-gradient(150deg,#08322A,#12664C 60%,#1E9B72)',
        ink: '#F2FBF6', accent: '#9BE8C4', rule: 'rgba(255,255,255,.30)',
        paint(ctx, w, h) {
            linear(ctx, w, h, 0, 0, w * 0.7, h, [[0, '#08322A'], [0.55, '#12664C'], [1, '#1E9B72']]);
            glow(ctx, w * 0.78, h * 0.18, w * 0.55, 'rgba(160,255,214,.16)');
        },
    },
    {
        id: 'night', name: 'Gece',
        swatch: 'linear-gradient(150deg,#060A12,#111F3C 60%,#1E3660)',
        ink: '#EAF1F8', accent: '#8FB6E0', rule: 'rgba(255,255,255,.26)',
        paint(ctx, w, h) {
            linear(ctx, w, h, 0, 0, w * 0.4, h, [[0, '#060A12'], [0.6, '#111F3C'], [1, '#1E3660']]);
            glow(ctx, w * 0.2, h * 0.82, w * 0.6, 'rgba(120,170,235,.14)');
        },
    },
    {
        id: 'dawn', name: 'Şafak',
        swatch: 'linear-gradient(150deg,#FBEDC6,#EDBE6A 60%,#D3902F)',
        ink: '#2A1B06', accent: '#7A4E10', rule: 'rgba(60,38,6,.30)',
        paint(ctx, w, h) {
            linear(ctx, w, h, 0, 0, w * 0.5, h, [[0, '#FBEDC6'], [0.55, '#EDBE6A'], [1, '#D3902F']]);
            glow(ctx, w * 0.5, h * 0.1, w * 0.7, 'rgba(255,255,255,.34)');
        },
    },
    {
        id: 'girih', name: 'Girih',
        swatch: 'repeating-linear-gradient(45deg,#14100B,#14100B 5px,#3A2E14 5px,#3A2E14 10px)',
        ink: '#F6EFDD', accent: '#D8B450', rule: 'rgba(216,180,80,.55)',
        paint(ctx, w, h) {
            ctx.fillStyle = '#14100B';
            ctx.fillRect(0, 0, w, h);
            starGrid(ctx, w, h, 'rgba(216,180,80,.22)');
            glow(ctx, w * 0.5, h * 0.5, w * 0.75, 'rgba(0,0,0,.42)');
        },
    },
    {
        id: 'sand', name: 'Çöl',
        swatch: 'linear-gradient(150deg,#F5E7D2,#E2C79E 60%,#C9A473)',
        ink: '#33220F', accent: '#8A5A22', rule: 'rgba(60,40,18,.28)',
        paint(ctx, w, h) {
            linear(ctx, w, h, 0, h, w, 0, [[0, '#C9A473'], [0.5, '#E2C79E'], [1, '#F5E7D2']]);
        },
    },
    {
        id: 'olive', name: 'Zeytin',
        swatch: 'linear-gradient(150deg,#1F2617,#3F502C 60%,#657B45)',
        ink: '#F3F6EC', accent: '#C4D8A0', rule: 'rgba(255,255,255,.28)',
        paint(ctx, w, h) {
            linear(ctx, w, h, 0, 0, w, h, [[0, '#1F2617'], [0.6, '#3F502C'], [1, '#657B45']]);
            glow(ctx, w * 0.25, h * 0.2, w * 0.5, 'rgba(220,240,190,.12)');
        },
    },
    {
        id: 'paper', name: 'Kâğıt',
        swatch: 'linear-gradient(150deg,#FBF7EE,#F0E9D9)',
        ink: '#241E14', accent: '#8A7332', rule: 'rgba(40,32,18,.24)',
        paint(ctx, w, h) {
            ctx.fillStyle = '#F8F3E7';
            ctx.fillRect(0, 0, w, h);
            ctx.save();
            ctx.strokeStyle = 'rgba(120,100,60,.05)';
            ctx.lineWidth = 1;
            // Deterministic hairlines so the same verse always renders identically
            for (let i = 0; i < 90; i++) {
                const y = ((i * 61.803) % 100) / 100 * h;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y + ((i % 7) - 3));
                ctx.stroke();
            }
            ctx.restore();
        },
    },
    {
        id: 'ink', name: 'Mürekkep',
        swatch: 'linear-gradient(150deg,#111,#232323)',
        ink: '#F2F2F2', accent: '#B9B9B9', rule: 'rgba(255,255,255,.24)',
        paint(ctx, w, h) {
            ctx.fillStyle = '#121212';
            ctx.fillRect(0, 0, w, h);
            glow(ctx, w * 0.5, h * 0.28, w * 0.62, 'rgba(255,255,255,.06)');
        },
    },
    {
        id: 'lapis', name: 'Lâcivert',
        swatch: 'linear-gradient(150deg,#0C2350,#1A4287 60%,#28599F)',
        ink: '#F4EEDC', accent: '#E2C165', rule: 'rgba(226,193,101,.5)',
        paint(ctx, w, h) {
            linear(ctx, w, h, 0, 0, w * 0.6, h, [[0, '#0C2350'], [0.6, '#1A4287'], [1, '#28599F']]);
            starGrid(ctx, w, h, 'rgba(226,193,101,.13)');
        },
    },
];

// --- Basmala handling ------------------------------------------------------
//
// The bundled data prepends the basmala to the first ayah of every surah
// except At-Tawbah, so sharing "Al-Ikhlas 1" would otherwise put the basmala
// on the card. Two surahs (95, 97) carry an extra shadda on the bā, so the
// match has to ignore diacritics rather than compare strings literally.

const ARABIC_DIACRITICS = /[ً-ٰٟۖ-ۭـ﻿]/;

/** Letters of the basmala with every diacritic and space removed */
const BASMALA_SKELETON = 'بسمٱللهٱلرحمنٱلرحيم';

function isSkippable(ch: string): boolean {
    return ARABIC_DIACRITICS.test(ch) || /\s/.test(ch);
}

/**
 * Remove a leading basmala, if present. Returns the text untouched when the
 * ayah does not start with one (At-Tawbah, or any non-first ayah).
 */
export function stripBasmala(text: string): string {
    let skeletonIndex = 0;
    let i = 0;
    while (i < text.length && skeletonIndex < BASMALA_SKELETON.length) {
        const ch = text[i];
        if (isSkippable(ch)) {
            i++;
            continue;
        }
        if (ch !== BASMALA_SKELETON[skeletonIndex]) return text;
        skeletonIndex++;
        i++;
    }
    if (skeletonIndex < BASMALA_SKELETON.length) return text;

    // Skip the diacritics and whitespace that trail the final mīm
    while (i < text.length && isSkippable(text[i])) i++;
    const rest = text.slice(i).trim();
    return rest.length > 0 ? rest : text;
}

// --- Text layout -----------------------------------------------------------

/**
 * Greedy word wrap. Takes a measuring function instead of a canvas context so
 * the layout can be tested without a real canvas.
 */
export function wrapText(
    text: string,
    maxWidth: number,
    measure: (s: string) => number
): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && measure(candidate) > maxWidth) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    }
    if (line) lines.push(line);
    return lines;
}

/** Arabic gets smaller as the passage grows so long ayahs still fit */
export function arabicFontSize(width: number, textLength: number): number {
    if (textLength > 320) return width * 0.042;
    if (textLength > 180) return width * 0.05;
    if (textLength > 90) return width * 0.058;
    return width * 0.082;
}

// --- Fonts -----------------------------------------------------------------

export const CARD_ARABIC_FONT = '"Amiri Quran", "Amiri", serif';
export const CARD_LATIN_FONT =
    'ui-sans-serif, -apple-system, "Segoe UI", system-ui, sans-serif';

/**
 * Canvas draws with whatever is loaded at that moment, so the Quranic face has
 * to be resolved before painting or the card silently falls back to a system
 * font. The face is bundled with the app, so this also works offline.
 */
export async function ensureCardFonts(sizePx = 80): Promise<void> {
    if (typeof document === 'undefined' || !document.fonts) return;
    try {
        await document.fonts.load(`${sizePx}px "Amiri Quran"`, 'بسم');
        await document.fonts.ready;
    } catch {
        // Fall back to whatever the system provides
    }
}

// --- Drawing ---------------------------------------------------------------

export interface VerseCardOptions {
    arabic: string;
    translation: string;
    /** e.g. "İnşirah 94:5" */
    reference: string;
    background: CardBackground;
    format: CardFormat;
    showTranslation: boolean;
    showSignature: boolean;
    showFrame: boolean;
    signature?: string;
}

export function drawVerseCard(
    canvas: HTMLCanvasElement,
    options: VerseCardOptions
): void {
    const { format, background: bg } = options;
    const w = format.width;
    const h = format.height;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    bg.paint(ctx, w, h);

    const pad = w * 0.115;
    const inner = w - pad * 2;

    if (options.showFrame) {
        ctx.save();
        ctx.strokeStyle = bg.rule;
        ctx.lineWidth = Math.max(2, w / 460);
        ctx.strokeRect(pad * 0.58, pad * 0.58, w - pad * 1.16, h - pad * 1.16);
        ctx.lineWidth = Math.max(1, w / 900);
        ctx.strokeRect(pad * 0.74, pad * 0.74, w - pad * 1.48, h - pad * 1.48);
        ctx.restore();
    }

    const arabic = stripBasmala(options.arabic);
    const arSize = arabicFontSize(w, arabic.length);
    const trSize = w * 0.036;
    const arLead = arSize * 1.85;
    const trLead = trSize * 1.62;

    ctx.font = `${arSize}px ${CARD_ARABIC_FONT}`;
    const arLines = wrapText(arabic, inner, (s) => ctx.measureText(s).width);

    let trLines: string[] = [];
    if (options.showTranslation && options.translation) {
        ctx.font = `${trSize}px ${CARD_LATIN_FONT}`;
        trLines = wrapText(options.translation, inner * 0.94, (s) => ctx.measureText(s).width);
    }

    const dividerGap = trLines.length ? arSize * 1.15 : 0;
    const blockH = arLines.length * arLead + dividerGap + trLines.length * trLead;
    let y = (h - blockH) / 2 + arLead * 0.74;

    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.fillStyle = bg.ink;
    ctx.font = `${arSize}px ${CARD_ARABIC_FONT}`;
    for (const line of arLines) {
        ctx.fillText(line, w / 2, y);
        y += arLead;
    }
    ctx.restore();

    if (trLines.length) {
        const dy = y - arLead * 0.34 + dividerGap * 0.34;
        ctx.save();
        ctx.strokeStyle = bg.rule;
        ctx.lineWidth = Math.max(1, w / 900);
        ctx.beginPath();
        ctx.moveTo(w / 2 - inner * 0.12, dy);
        ctx.lineTo(w / 2 + inner * 0.12, dy);
        ctx.stroke();
        ctx.restore();

        y += dividerGap * 0.78;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = bg.ink;
        ctx.globalAlpha = 0.88;
        ctx.font = `${trSize}px ${CARD_LATIN_FONT}`;
        for (const line of trLines) {
            ctx.fillText(line, w / 2, y);
            y += trLead;
        }
        ctx.restore();
    }

    const refSize = w * 0.031;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `600 ${refSize}px ${CARD_LATIN_FONT}`;
    ctx.fillStyle = bg.accent;
    ctx.fillText(options.reference, w / 2, h - pad * (options.showSignature ? 1.12 : 0.78));
    if (options.showSignature && options.signature) {
        ctx.font = `${refSize * 0.78}px ${CARD_LATIN_FONT}`;
        ctx.globalAlpha = 0.62;
        ctx.fillStyle = bg.ink;
        ctx.fillText(options.signature, w / 2, h - pad * 0.72);
    }
    ctx.restore();
}

/** Canvas → PNG blob */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
