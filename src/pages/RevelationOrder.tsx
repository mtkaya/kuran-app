/**
 * RevelationOrder Page - Sureleri iniş (nüzul) sırasına göre listeler
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useQuranData } from '../hooks/useQuranData';
import { REVELATION_ORDER, MEKKI_COUNT, MEDENI_COUNT } from '../data/revelationOrder';
import { useMemo, useState } from 'react';

type FilterType = 'all' | 'mekki' | 'medeni';

export default function RevelationOrder() {
    const { currentLanguage } = useLanguage();
    const { quranData } = useQuranData(currentLanguage);
    const [filter, setFilter] = useState<FilterType>('all');

    // Combine revelation order with surah data
    const surahs = useMemo(() => {
        return REVELATION_ORDER
            .filter(rev => filter === 'all' || rev.period === filter)
            .map(rev => {
                const surah = quranData.find(s => s.id === rev.surahId);
                return {
                    ...rev,
                    name_turkish: surah?.name_turkish || '',
                    name_arabic: surah?.name_arabic || '',
                    verse_count: surah?.verse_count || 0,
                };
            });
    }, [quranData, filter]);

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
                            <h1 className="text-lg font-bold">İniş Sırasına Göre</h1>
                            <p className="text-white/60 text-xs">Nüzul Tertibi</p>
                        </div>
                        <BookOpen className="w-6 h-6 opacity-60" />
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                            <span className="text-white/80">Mekki: {MEKKI_COUNT}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                            <span className="text-white/80">Medeni: {MEDENI_COUNT}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="sticky top-0 z-10 bg-background border-b border-border">
                <div className="max-w-lg mx-auto px-4 py-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                }`}
                        >
                            Tümü (114)
                        </button>
                        <button
                            onClick={() => setFilter('mekki')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'mekki'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                }`}
                        >
                            Mekki ({MEKKI_COUNT})
                        </button>
                        <button
                            onClick={() => setFilter('medeni')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'medeni'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                }`}
                        >
                            Medeni ({MEDENI_COUNT})
                        </button>
                    </div>
                </div>
            </div>

            {/* Surah List */}
            <main className="max-w-lg mx-auto px-4 py-4">
                <div className="space-y-2">
                    {surahs.map((surah, index) => (
                        <Link
                            key={surah.surahId}
                            to={`/surah/${surah.surahId}`}
                            className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all animate-fade-in"
                            style={{ animationDelay: `${Math.min(index * 20, 300)}ms` }}
                        >
                            {/* Revelation Order Number */}
                            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${surah.period === 'mekki' ? 'bg-emerald-500' : 'bg-blue-500'
                                }`}>
                                {surah.revelationOrder}
                                {/* Period indicator */}
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-background border-2 border-current flex items-center justify-center">
                                    <MapPin className="w-2 h-2" />
                                </div>
                            </div>

                            {/* Surah Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground truncate">
                                        {surah.name_turkish}
                                    </h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${surah.period === 'mekki'
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                        }`}>
                                        {surah.period === 'mekki' ? 'Mekki' : 'Medeni'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Mushaf: {surah.surahId}. sure</span>
                                    <span>•</span>
                                    <span>{surah.verse_count} ayet</span>
                                </div>
                            </div>

                            {/* Arabic Name */}
                            <p className="font-arabic text-xl text-primary" dir="rtl">
                                {surah.name_arabic}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Info Card */}
                <div className="mt-6 p-4 bg-secondary/30 rounded-xl border border-border">
                    <h3 className="font-semibold text-foreground mb-2">📖 Nüzul Tertibi Nedir?</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Nüzul tertibi, Kur'an-ı Kerim surelerinin Hz. Muhammed'e (s.a.v.) iniş sırasına göre
                        dizilişidir. İlk inen sure Alak suresidir. Mekki sureler Hicret'ten önce,
                        Medeni sureler ise Hicret'ten sonra inmiştir.
                    </p>
                </div>
            </main>
        </div>
    );
}
