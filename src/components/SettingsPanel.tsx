// Settings Panel Component
import React from 'react';
import { X, Minus, Plus, Volume2 } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useAudioStore } from '../store/audioStore';
import { useLanguage } from '../context/LanguageContext';
import { getUIStrings } from '../i18n/strings';
import { RECITERS } from '../data/reciterProvider';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme, arabicFontSize, setArabicFontSize, mealFontSize, setMealFontSize } = useSettingsStore();
    const { selectedReciterId, setReciter } = useAudioStore();
    const { currentLanguage } = useLanguage();
    const ui = getUIStrings(currentLanguage);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">{ui.settings}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Theme Selection */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                        {ui.theme}
                    </label>
                    <div className="flex gap-2">
                        {(['light', 'dark', 'system'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                                    ${theme === t
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary hover:bg-secondary/80'
                                    }`}
                            >
                                {t === 'light' ? ui.lightMode : t === 'dark' ? ui.darkMode : ui.systemMode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reciter Selection */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        {ui.reciter}
                    </label>
                    <select
                        value={selectedReciterId}
                        onChange={(e) => setReciter(e.target.value)}
                        className="w-full bg-secondary border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                    >
                        {RECITERS.map((reciter) => (
                            <option key={reciter.id} value={reciter.identifier}>
                                {reciter.name} - {reciter.arabicName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Arabic Font Size */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-muted-foreground">
                            {ui.arabicFontSize}
                        </label>
                        <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                            {arabicFontSize}px
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setArabicFontSize(Math.max(20, arabicFontSize - 2))}
                            className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                            disabled={arabicFontSize <= 20}
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <input
                            type="range"
                            min="20"
                            max="48"
                            value={arabicFontSize}
                            onChange={(e) => setArabicFontSize(Number(e.target.value))}
                            className="flex-1 accent-primary"
                        />
                        <button
                            onClick={() => setArabicFontSize(Math.min(48, arabicFontSize + 2))}
                            className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                            disabled={arabicFontSize >= 48}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Preview */}
                    <p
                        className="text-right mt-3 font-arabic text-muted-foreground"
                        dir="rtl"
                        style={{ fontSize: `${arabicFontSize}px` }}
                    >
                        بِسْمِ اللَّهِ
                    </p>
                </div>

                {/* Meal Font Size */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-muted-foreground">
                            {ui.mealFontSize}
                        </label>
                        <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                            {mealFontSize}px
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMealFontSize(Math.max(14, mealFontSize - 1))}
                            className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                            disabled={mealFontSize <= 14}
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <input
                            type="range"
                            min="14"
                            max="28"
                            value={mealFontSize}
                            onChange={(e) => setMealFontSize(Number(e.target.value))}
                            className="flex-1 accent-primary"
                        />
                        <button
                            onClick={() => setMealFontSize(Math.min(28, mealFontSize + 1))}
                            className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                            disabled={mealFontSize >= 28}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Preview */}
                    <p
                        className="mt-3 text-muted-foreground"
                        style={{ fontSize: `${mealFontSize}px` }}
                    >
                        Rahman ve Rahim olan Allah'ın adıyla
                    </p>
                </div>
            </div>
        </>
    );
};
