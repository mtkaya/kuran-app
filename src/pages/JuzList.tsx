/**
 * JuzList Page - Kur'an-ı Kerim'i 30 cüze göre görüntüler
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useQuranData } from '../hooks/useQuranData';
import { JUZ_DATA, TOTAL_JUZ } from '../data/juzData';
import { useMemo, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';

export default function JuzList() {
    const { currentLanguage } = useLanguage();
    const { quranData } = useQuranData(currentLanguage);
    const { arabicFont } = useSettingsStore();
    const [expandedJuz, setExpandedJuz] = useState<number | null>(null);

    // Enrich juz data with surah names
    const enrichedJuzData = useMemo(() => {
        return JUZ_DATA.map(juz => {
            const startSurah = quranData.find(s => s.id === juz.startSurah);
            const endSurah = quranData.find(s => s.id === juz.endSurah);

            // Get all surahs in this juz
            const surahsInJuz = quranData.filter(s =>
                s.id >= juz.startSurah && s.id <= juz.endSurah
            );

            return {
                ...juz,
                startSurahName: startSurah?.name_turkish || '',
                endSurahName: endSurah?.name_turkish || '',
                surahsInJuz,
            };
        });
    }, [quranData]);

    const toggleJuz = (juzNumber: number) => {
        setExpandedJuz(expandedJuz === juzNumber ? null : juzNumber);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header
                className="gradient-header text-white px-safe"
                style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)', paddingBottom: '1.5rem' }}
            >
                <div className="max-w-lg mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Link
                            to="/"
                            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg font-bold">Cüz Cüz Kur'an</h1>
                            <p className="text-white/60 text-xs">30 Cüz • 60 Hizb</p>
                        </div>
                        <BookOpen className="w-6 h-6 opacity-60" />
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                        <div className="px-3 py-1.5 bg-white/10 rounded-full">
                            <span className="text-white/80">{TOTAL_JUZ} Cüz</span>
                        </div>
                        <div className="px-3 py-1.5 bg-white/10 rounded-full">
                            <span className="text-white/80">60 Hizb</span>
                        </div>
                        <div className="px-3 py-1.5 bg-white/10 rounded-full">
                            <span className="text-white/80">604 Sayfa</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Juz List */}
            <main className="max-w-lg mx-auto px-4 py-4">
                <div className="space-y-3">
                    {enrichedJuzData.map((juz, index) => (
                        <div
                            key={juz.juzNumber}
                            className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in"
                            style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
                        >
                            {/* Juz Header - Clickable */}
                            <button
                                onClick={() => toggleJuz(juz.juzNumber)}
                                className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                            >
                                {/* Juz Number */}
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex flex-col items-center justify-center text-primary-foreground shadow-lg">
                                    <span className="text-xs font-medium opacity-80">Cüz</span>
                                    <span className="text-xl font-bold">{juz.juzNumber}</span>
                                </div>

                                {/* Juz Info */}
                                <div className="flex-1 text-left">
                                    <h3
                                        className="font-arabic text-lg text-foreground mb-1"
                                        dir="rtl"
                                        style={{ fontFamily: arabicFont }}
                                    >
                                        {juz.nameArabic}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {juz.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {juz.startSurahName} {juz.startAyah} → {juz.endSurahName} {juz.endAyah}
                                    </p>
                                </div>

                                {/* Expand Icon */}
                                <ChevronRight
                                    className={`w-5 h-5 text-muted-foreground transition-transform ${expandedJuz === juz.juzNumber ? 'rotate-90' : ''
                                        }`}
                                />
                            </button>

                            {/* Expanded Content - Surahs in Juz */}
                            {expandedJuz === juz.juzNumber && (
                                <div className="border-t border-border bg-secondary/30 p-3">
                                    <p className="text-xs text-muted-foreground mb-2 px-1">
                                        Bu cüzdeki sureler:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {juz.surahsInJuz.map(surah => (
                                            <Link
                                                key={surah.id}
                                                to={`/surah/${surah.id}`}
                                                className="flex items-center gap-2 p-2 bg-card rounded-lg hover:bg-accent transition-colors"
                                            >
                                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                                    {surah.id}
                                                </span>
                                                <span className="text-sm text-foreground truncate">
                                                    {surah.name_turkish}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Quick Read Button */}
                                    <Link
                                        to={`/surah/${juz.startSurah}`}
                                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Cüzü Oku
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Info Card */}
                <div className="mt-6 p-4 bg-secondary/30 rounded-xl border border-border">
                    <h3 className="font-semibold text-foreground mb-2">📚 Cüz Nedir?</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Kur'an-ı Kerim 30 eşit parçaya (cüz) bölünmüştür. Her cüz yaklaşık 20 sayfa içerir
                        ve 2 hizbe ayrılır. Ramazan ayında her gün bir cüz okuyarak bir ayda Kur'an
                        hatmi tamamlanabilir.
                    </p>
                </div>
            </main>
        </div>
    );
}
