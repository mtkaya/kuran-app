import React, { useState, useMemo } from 'react';
import { Layers, Search, BookOpen, FileText } from 'lucide-react';
import { useQuranData } from '../hooks/useQuranData';
import { useLanguage } from '../context/LanguageContext';
import { JUZ_DATA, JuzInfo } from '../data/juzData';
import { getPageForAyah, PAGE_COUNT } from '../data/pageMapping';
import { Surah } from '../types';

interface MushafNavigatorProps {
    isOpen: boolean;
    onClose: () => void;
    currentPage: number;
    onPageChange: (page: number) => void;
    surahId?: number;
}

type Tab = 'page' | 'surah' | 'juz';

export const MushafNavigator: React.FC<MushafNavigatorProps> = ({
    isOpen,
    onClose,
    currentPage,
    onPageChange,
    surahId
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('page');
    const [searchTerm, setSearchTerm] = useState('');
    const { currentLanguage } = useLanguage();
    const { quranData } = useQuranData(currentLanguage);

    // Reset state when opening
    React.useEffect(() => {
        if (isOpen) {
            // Default to 'page' or maybe 'surah' if specifically asked?
            // Keeping 'page' as default for quick slider access
        }
    }, [isOpen]);

    const handleSurahClick = (surah: Surah) => {
        onClose();
        // Delay page change to allow drawer to close smoothly without frame drop
        setTimeout(() => {
            const page = getPageForAyah(surah.id, 1);
            onPageChange(page);
        }, 300);
    };

    const handleJuzClick = (juz: JuzInfo) => {
        onClose();
        // Delay page change to allow drawer to close smoothly without frame drop
        setTimeout(() => {
            const page = getPageForAyah(juz.startSurah, juz.startAyah);
            onPageChange(page);
        }, 300);
    };

    const filteredSurahs = useMemo(() => {
        return quranData.filter(s =>
            s.name_turkish.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.name_arabic.includes(searchTerm) ||
            s.id.toString().includes(searchTerm)
        );
    }, [quranData, searchTerm]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            />

            {/* Panel */}
            <div
                className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl z-50 bg-card rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag handle / Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <div className="flex-1 flex justify-center">
                        <div className="w-12 h-1.5 bg-muted rounded-full" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 p-2 gap-2 border-b border-border/50">
                    <button
                        onClick={() => setActiveTab('page')}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 ${activeTab === 'page'
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary'
                            }`}
                    >
                        <FileText className="w-5 h-5" />
                        Sayfa
                    </button>
                    <button
                        onClick={() => setActiveTab('surah')}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 ${activeTab === 'surah'
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary'
                            }`}
                    >
                        <BookOpen className="w-5 h-5" />
                        Sureler
                    </button>
                    <button
                        onClick={() => setActiveTab('juz')}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 ${activeTab === 'juz'
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary'
                            }`}
                    >
                        <Layers className="w-5 h-5" />
                        Cüzler
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[60vh] p-4">
                    {activeTab === 'page' && (
                        <div className="flex flex-col gap-8 py-8 items-center justify-center h-full">
                            <div className="text-center space-y-2">
                                <h3 className="text-4xl font-bold font-mono">{currentPage}</h3>
                                <p className="text-muted-foreground">/ {PAGE_COUNT}</p>
                            </div>

                            <div className="w-full max-w-sm px-4">
                                <input
                                    type="range"
                                    min="1"
                                    max={PAGE_COUNT}
                                    value={currentPage}
                                    onChange={(e) => onPageChange(Number(e.target.value))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span>1</span>
                                    <span>{PAGE_COUNT}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                                <button
                                    onClick={() => onPageChange(Math.max(1, currentPage - 10))}
                                    className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors active:scale-95"
                                >
                                    -10
                                </button>
                                <div className="p-3 text-center text-sm font-medium text-muted-foreground">
                                    Hızlı Geçiş
                                </div>
                                <button
                                    onClick={() => onPageChange(Math.min(PAGE_COUNT, currentPage + 10))}
                                    className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors active:scale-95"
                                >
                                    +10
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'surah' && (
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Sure ara..."
                                    className="w-full pl-9 pr-4 py-2.5 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {filteredSurahs.map((surah) => (
                                    <button
                                        key={surah.id}
                                        onClick={() => handleSurahClick(surah)}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors text-left ${surah.id === surahId
                                            ? 'bg-primary/10 border border-primary/30'
                                            : 'bg-secondary/50 hover:bg-secondary'
                                            }`}
                                    >
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${surah.id === surahId
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background text-muted-foreground'
                                            }`}>
                                            {surah.id}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium truncate block">{surah.name_turkish}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'juz' && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {JUZ_DATA.map((juz) => (
                                <button
                                    key={juz.juzNumber}
                                    onClick={() => handleJuzClick(juz)}
                                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 hover:border-primary/50 transition-all group"
                                >
                                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        {juz.juzNumber}
                                    </span>
                                    <span className="font-arabic text-lg mb-1">{juz.nameArabic}</span>
                                    <span className="text-xs text-muted-foreground text-center truncate w-full">
                                        {juz.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
