// Settings Panel Component
import React from 'react';
import { X, Minus, Plus, Volume2, Type, Palette, Brain, BookOpen } from 'lucide-react';
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
    const {
        theme, setTheme,
        arabicFontSize, setArabicFontSize,
        mealFontSize, setMealFontSize,
        showTransliteration, setShowTransliteration,
        showTajweed, setShowTajweed,
        memorizationMode, setMemorizationMode,
        mushafMode, setMushafMode,
        arabicFont, setArabicFont
    } = useSettingsStore();
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

                {/* Transliteration Toggle */}
                <div className="mb-6">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Type className="w-4 h-4" />
                            {ui.showTransliteration}
                        </span>
                        <button
                            onClick={() => setShowTransliteration(!showTransliteration)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${showTransliteration ? 'bg-primary' : 'bg-secondary'
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${showTransliteration ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </label>
                    {showTransliteration && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                            Bismillâhirrahmânirrahîm
                        </p>
                    )}
                </div>

                {/* Tajweed Toggle */}
                <div className="mb-6">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            {ui.showTajweed}
                        </span>
                        <button
                            onClick={() => setShowTajweed(!showTajweed)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${showTajweed ? 'bg-primary' : 'bg-secondary'
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${showTajweed ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </label>
                    {showTajweed && (
                        <p className="text-xs text-muted-foreground mt-2">
                            🔴 Ghunnah &nbsp; 🟢 Ikhfa &nbsp; 🔵 Qalqalah
                        </p>
                    )}
                </div>
                {/* Mushaf Mode Toggle */}
                <div className="mb-6">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {ui.mushafMode}
                        </span>
                        <button
                            onClick={() => setMushafMode(!mushafMode)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${mushafMode ? 'bg-primary' : 'bg-secondary'}`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${mushafMode ? 'translate-x-6' : ''}`}
                            />
                        </button>
                    </label>
                </div>

                {/* Memorization Mode Toggle */}
                <div className="mb-6">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            {ui.memorizationMode}
                        </span>
                        <button
                            onClick={() => setMemorizationMode(!memorizationMode)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${memorizationMode ? 'bg-primary' : 'bg-secondary'
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${memorizationMode ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </label>
                    {memorizationMode && (
                        <p className="text-xs text-muted-foreground mt-2">
                            {ui.tapToReveal}
                        </p>
                    )}
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
                                {reciter.country} {reciter.nameLocal} ({reciter.style})
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-2">
                        {RECITERS.length} kâri mevcut
                    </p>
                </div>

                {/* Arabic Font Selection */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        {ui.arabicFont}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'Amiri Quran', name: ui.fontAmiri },
                            { id: 'Reem Kufi', name: ui.fontKufi },
                            { id: 'Amiri', name: ui.fontNesih },
                            { id: 'Scheherazade New', name: ui.fontSulus },
                            { id: 'Noto Nastaliq Urdu', name: ui.fontTalik },
                            { id: 'Aref Ruqaa', name: ui.fontRika },
                            { id: 'Rakkas', name: ui.fontDivani },
                        ].map((font) => (
                            <button
                                key={font.id}
                                onClick={() => setArabicFont(font.id)}
                                className={`py-2 px-3 rounded-lg text-sm transition-colors text-left border ${arabicFont === font.id
                                    ? 'bg-primary/10 border-primary text-primary font-medium'
                                    : 'bg-secondary border-transparent hover:bg-secondary/80'
                                    }`}
                                style={{ fontFamily: font.id }}
                            >
                                {font.name}
                            </button>
                        ))}
                    </div>
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
                        className="text-right mt-3 font-arabic text-muted-foreground transition-all duration-300"
                        dir="rtl"
                        style={{ fontSize: `${arabicFontSize}px`, fontFamily: arabicFont }}
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
