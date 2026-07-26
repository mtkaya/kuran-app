// Memorization drill setup sheet: pick a range, repetitions and pause,
// then let the audio engine run the drill.
import React, { useEffect, useState } from 'react';
import { X, GraduationCap, Play, Square, Minus, Plus } from 'lucide-react';
import { useAudioStore } from '../store/audioStore';
import { MEMORIZATION_LIMITS } from '../store/memorization';
import { useLanguage } from '../context/LanguageContext';
import { getUIStrings } from '../i18n/strings';

interface MemorizationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    surahId: number;
    surahName: string;
    totalAyahs: number;
    /** Global id of this surah's first ayah */
    surahFirstAyahId: number;
    /** Preselect the range around the ayah the user was looking at */
    suggestedAyah?: number;
}

const GAP_OPTIONS = [0, 1, 2, 3, 5];

export const MemorizationPanel: React.FC<MemorizationPanelProps> = ({
    isOpen, onClose, surahId, surahName, totalAyahs, surahFirstAyahId, suggestedAyah,
}) => {
    const { memorization, startMemorization, stopMemorization } = useAudioStore();
    const { currentLanguage } = useLanguage();
    const ui = getUIStrings(currentLanguage);

    const [fromAyah, setFromAyah] = useState(1);
    const [toAyah, setToAyah] = useState(Math.min(5, totalAyahs));
    const [repeatCount, setRepeatCount] = useState(3);
    const [gapSeconds, setGapSeconds] = useState(1);
    const [loopRange, setLoopRange] = useState(true);

    // Open on the ayah the reader was on, with a short default range
    useEffect(() => {
        if (!isOpen) return;
        const start = Math.min(Math.max(suggestedAyah ?? 1, 1), totalAyahs);
        setFromAyah(start);
        setToAyah(Math.min(start + 4, totalAyahs));
    }, [isOpen, suggestedAyah, totalAyahs]);

    if (!isOpen) return null;

    const clampFrom = (v: number) => {
        const next = Math.min(Math.max(v, 1), totalAyahs);
        setFromAyah(next);
        if (next > toAyah) setToAyah(next);
    };

    const clampTo = (v: number) => {
        const next = Math.min(Math.max(v, 1), totalAyahs);
        setToAyah(next);
        if (next < fromAyah) setFromAyah(next);
    };

    const handleStart = () => {
        startMemorization({
            surahId, surahName, totalAyahs, surahFirstAyahId,
            fromAyah, toAyah, repeatCount, gapSeconds, loopRange,
        });
        onClose();
    };

    const ayahCount = toAyah - fromAyah + 1;

    // Stepper with 44px touch targets
    const Stepper: React.FC<{
        label: string; value: number; min: number; max: number;
        onChange: (v: number) => void; suffix?: string;
    }> = ({ label, value, min, max, onChange, suffix }) => (
        <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onChange(value - 1)}
                    disabled={value <= min}
                    className="w-11 h-11 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/70 disabled:opacity-30 transition-colors"
                    aria-label={`${label} -`}
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="min-w-[3.5rem] text-center font-semibold number-font">
                    {value}{suffix}
                </span>
                <button
                    onClick={() => onChange(value + 1)}
                    disabled={value >= max}
                    className="w-11 h-11 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/70 disabled:opacity-30 transition-colors"
                    aria-label={`${label} +`}
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={ui.memorizationDrill}
                className="w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold">{ui.memorizationDrill}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-5 py-4 space-y-5">
                    <p className="text-sm text-muted-foreground">{surahName}</p>

                    {/* Range */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{ui.drillRange}</span>
                            <span className="text-xs text-muted-foreground number-font">
                                {fromAyah}–{toAyah} ({ayahCount})
                            </span>
                        </div>
                        <Stepper label={ui.drillFrom} value={fromAyah} min={1} max={totalAyahs} onChange={clampFrom} />
                        <Stepper label={ui.drillTo} value={toAyah} min={1} max={totalAyahs} onChange={clampTo} />
                    </div>

                    <div className="h-px bg-border" />

                    {/* Repetitions */}
                    <Stepper
                        label={ui.drillRepeat}
                        value={repeatCount}
                        min={MEMORIZATION_LIMITS.minRepeat}
                        max={MEMORIZATION_LIMITS.maxRepeat}
                        onChange={setRepeatCount}
                        suffix="×"
                    />

                    {/* Gap */}
                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">{ui.drillGap}</span>
                        <div className="flex gap-2">
                            {GAP_OPTIONS.map(sec => (
                                <button
                                    key={sec}
                                    onClick={() => setGapSeconds(sec)}
                                    className={`flex-1 h-11 rounded-lg text-sm font-medium transition-colors ${gapSeconds === sec
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary hover:bg-secondary/70'
                                        }`}
                                >
                                    {sec}s
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loop */}
                    <button
                        onClick={() => setLoopRange(!loopRange)}
                        className="w-full flex items-center justify-between py-2"
                        role="switch"
                        aria-checked={loopRange}
                    >
                        <span className="text-sm">{ui.drillLoop}</span>
                        <span className={`relative w-12 h-6 rounded-full transition-colors ${loopRange ? 'bg-primary' : 'bg-secondary'}`}>
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${loopRange ? 'translate-x-6' : ''}`} />
                        </span>
                    </button>
                </div>

                {/* Actions */}
                <div className="px-5 py-4 border-t border-border flex gap-2 sticky bottom-0 bg-card">
                    {memorization ? (
                        <button
                            onClick={() => { stopMemorization(); onClose(); }}
                            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
                        >
                            <Square className="w-4 h-4" />
                            {ui.drillStop}
                        </button>
                    ) : null}
                    <button
                        onClick={handleStart}
                        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                    >
                        <Play className="w-4 h-4" />
                        {ui.drillStart}
                    </button>
                </div>
            </div>
        </div>
    );
};
