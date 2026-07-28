// Verse card share sheet — style an ayah as an image, then share or save it.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Share2, Download, Check } from 'lucide-react';
import { Ayah } from '../types';
import {
    CARD_BACKGROUNDS,
    CARD_FORMATS,
    CardBackground,
    CardFormat,
    canvasToBlob,
    drawVerseCard,
    ensureCardFonts,
} from '../utils/verseCard';
import { useLanguage } from '../context/LanguageContext';
import { getUIStrings } from '../i18n/strings';

interface VerseCardSheetProps {
    isOpen: boolean;
    onClose: () => void;
    ayah: Ayah | null;
    surahName: string;
    /** Copy the verse as plain text — the behaviour the share button used to have */
    onCopyText?: () => void;
}

export const VerseCardSheet: React.FC<VerseCardSheetProps> = ({
    isOpen, onClose, ayah, surahName, onCopyText,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { currentLanguage } = useLanguage();
    const ui = getUIStrings(currentLanguage);

    const [background, setBackground] = useState<CardBackground>(CARD_BACKGROUNDS[0]);
    const [format, setFormat] = useState<CardFormat>(CARD_FORMATS[0]);
    const [showTranslation, setShowTranslation] = useState(true);
    const [showSignature, setShowSignature] = useState(true);
    const [showFrame, setShowFrame] = useState(true);
    const [fontsReady, setFontsReady] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saved' | 'unsupported'>('idle');

    // The Quranic face must be resolved before the first paint, otherwise the
    // card silently renders in a system font
    useEffect(() => {
        if (!isOpen) return;
        let alive = true;
        ensureCardFonts().then(() => {
            if (alive) setFontsReady(true);
        });
        return () => { alive = false; };
    }, [isOpen]);

    const reference = ayah ? `${surahName} ${ayah.surah_id}:${ayah.ayah_number}` : '';

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !ayah) return;
        drawVerseCard(canvas, {
            arabic: ayah.text_arabic,
            translation: ayah.text_meal,
            reference,
            background,
            format,
            showTranslation,
            showSignature,
            showFrame,
            signature: ui.appTitle,
        });
    }, [ayah, reference, background, format, showTranslation, showSignature, showFrame, ui.appTitle]);

    useEffect(() => {
        if (isOpen) render();
    }, [isOpen, render, fontsReady]);

    // Reset transient feedback whenever the sheet reopens
    useEffect(() => {
        if (isOpen) setStatus('idle');
    }, [isOpen]);

    const fileName = ayah ? `ayet-${ayah.surah_id}-${ayah.ayah_number}.png` : 'ayet.png';

    const handleShare = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const blob = await canvasToBlob(canvas);
        if (!blob) return;

        const file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: reference });
            } catch {
                // User dismissed the share sheet
            }
            return;
        }
        // No file sharing on this platform — fall back to a download
        handleSave(blob);
        setStatus('unsupported');
        setTimeout(() => setStatus('idle'), 2600);
    };

    const handleSave = async (existing?: Blob) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const blob = existing ?? (await canvasToBlob(canvas));
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        if (!existing) {
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 2200);
        }
    };

    if (!isOpen || !ayah) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={ui.verseCard}
                className="w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl max-h-[92vh] overflow-y-auto"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
                    <h2 className="font-semibold">{ui.verseCard}</h2>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 -mr-2 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                        aria-label={ui.close}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Preview */}
                <div className="px-5 pt-4 flex justify-center">
                    <canvas
                        ref={canvasRef}
                        className="max-w-full rounded-lg shadow-lg"
                        style={{ maxHeight: '42vh', width: 'auto' }}
                        aria-label={ui.verseCardPreview}
                    />
                </div>

                <div className="px-5 py-4 space-y-5">
                    {/* Backgrounds */}
                    <div className="space-y-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                            {ui.cardBackground}
                        </span>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {CARD_BACKGROUNDS.map((bg) => (
                                <button
                                    key={bg.id}
                                    onClick={() => setBackground(bg)}
                                    className={`shrink-0 w-12 h-12 rounded-xl border-2 transition-transform hover:-translate-y-0.5 ${background.id === bg.id ? 'border-primary' : 'border-transparent'
                                        }`}
                                    style={{ background: bg.swatch }}
                                    aria-label={bg.name}
                                    aria-pressed={background.id === bg.id}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Format */}
                    <div className="space-y-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                            {ui.cardFormat}
                        </span>
                        <div className="flex gap-2">
                            {CARD_FORMATS.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFormat(f)}
                                    className={`flex-1 h-11 rounded-lg text-sm font-medium transition-colors ${format.id === f.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary hover:bg-secondary/70'
                                        }`}
                                    aria-pressed={format.id === f.id}
                                >
                                    {ui[f.labelKey]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content toggles */}
                    <div className="space-y-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                            {ui.cardContent}
                        </span>
                        <div className="flex gap-2">
                            {([
                                [ui.cardTranslation, showTranslation, setShowTranslation],
                                [ui.cardSignature, showSignature, setShowSignature],
                                [ui.cardFrame, showFrame, setShowFrame],
                            ] as const).map(([label, value, set]) => (
                                <button
                                    key={label}
                                    onClick={() => set(!value)}
                                    className={`flex-1 h-11 rounded-lg text-sm font-medium border transition-colors ${value
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-secondary border-transparent hover:bg-secondary/70'
                                        }`}
                                    aria-pressed={value}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-4 border-t border-border sticky bottom-0 bg-card space-y-2">
                    {status !== 'idle' && (
                        <p className="text-xs text-center text-muted-foreground" role="status">
                            {status === 'saved' ? ui.cardSaved : ui.cardShareUnsupported}
                        </p>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={handleShare}
                            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                        >
                            <Share2 className="w-4 h-4" />
                            {ui.cardShare}
                        </button>
                        <button
                            onClick={() => handleSave()}
                            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-border font-medium hover:bg-secondary transition-colors"
                        >
                            {status === 'saved' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                            {ui.cardSave}
                        </button>
                    </div>
                    {onCopyText && (
                        <button
                            onClick={() => { onCopyText(); onClose(); }}
                            className="w-full h-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {ui.copyVerse}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
