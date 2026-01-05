import { useParams, Link } from 'react-router-dom';
import { getQuranData } from '../data/quran';
import { AyahView } from '../components/AyahView';
import { MushafView } from '../components/MushafView';
import { ArrowLeft, Settings } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { getUIStrings } from '../i18n/strings';
import { useReadingStore } from '../store/readingStore';
import { useAudioStore } from '../store/audioStore';
import { useSettingsStore } from '../store/settingsStore';
import { SettingsPanel } from '../components/SettingsPanel';
import { AudioPlayer } from '../components/AudioPlayer';
import { Toast, useToast } from '../components/Toast';

export default function Reader() {
    const { id } = useParams();
    const { currentLanguage } = useLanguage();
    const { setLastRead } = useReadingStore();
    const { currentAyahId, isPlaying, cleanup } = useAudioStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { toast, showToast, hideToast } = useToast();
    const observerRef = useRef<IntersectionObserver | null>(null);
    const { mushafMode } = useSettingsStore();

    const quranData = useMemo(() => getQuranData(currentLanguage), [currentLanguage]);
    const ui = useMemo(() => getUIStrings(currentLanguage), [currentLanguage]);
    const surah = quranData.find(s => s.id === Number(id));

    // Track visible ayah for lastRead
    const handleAyahVisible = useCallback((ayah: { id: number; ayah_number: number }) => {
        if (surah) {
            setLastRead({
                surahId: surah.id,
                ayahId: ayah.id,
                ayahNumber: ayah.ayah_number,
                surahName: surah.name_turkish,
            });
        }
    }, [surah, setLastRead]);

    // Setup IntersectionObserver for tracking reading position
    useEffect(() => {
        if (!surah) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const ayahId = Number(entry.target.getAttribute('data-ayah-id'));
                        const ayahNumber = Number(entry.target.getAttribute('data-ayah-number'));
                        if (ayahId && ayahNumber) {
                            handleAyahVisible({ id: ayahId, ayah_number: ayahNumber });
                        }
                    }
                });
            },
            { threshold: 0.5, rootMargin: '-100px 0px -50% 0px' }
        );

        // Observe all ayah elements
        const ayahElements = document.querySelectorAll('[data-ayah-id]');
        ayahElements.forEach(el => observerRef.current?.observe(el));

        return () => {
            observerRef.current?.disconnect();
        };
    }, [surah, handleAyahVisible]);

    // Scroll to ayah if hash is present or when audio changes
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, []);

    // Auto-scroll to playing ayah
    useEffect(() => {
        if (isPlaying && currentAyahId) {
            const element = document.getElementById(`ayah-${currentAyahId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentAyahId, isPlaying]);

    // Cleanup audio when leaving page
    useEffect(() => {
        return () => {
            // Don't cleanup if navigating - let the audio continue
        };
    }, [cleanup]);

    if (!surah) {
        return <div className="p-8 text-center">{ui.surahNotFound}</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 -ml-2 hover:bg-accent rounded-full text-foreground/80">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg">{surah.name_turkish}</h1>
                        <p className="text-xs text-muted-foreground">{surah.name_arabic}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 hover:bg-accent rounded-full text-foreground/80"
                        aria-label={ui.settings}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <LanguageSelector />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto p-4">
                {mushafMode ? (
                    <div className="animate-fade-in">
                        <MushafView
                            surahId={surah.id}
                            initialAyahId={currentAyahId || undefined}
                        />
                    </div>
                ) : (
                    <>
                        {/* Besmele Banner (not for Surah 9 - Tawbah) */}
                        {surah.id !== 9 && (
                            <div className="besmele-banner rounded-2xl mb-6 animate-fade-in">
                                <p className="font-arabic text-2xl sm:text-3xl text-primary" dir="rtl">
                                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Rahman ve Rahim olan Allah'ın adıyla
                                </p>
                            </div>
                        )}

                        {/* Surah Info Card */}
                        <div className="glass rounded-2xl p-4 mb-6 text-center animate-fade-in" style={{ animationDelay: '100ms' }}>
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <span className="w-8 h-0.5 bg-gradient-to-r from-transparent to-primary/50"></span>
                                <span className="font-arabic text-xl text-primary">{surah.name_arabic}</span>
                                <span className="w-8 h-0.5 bg-gradient-to-l from-transparent to-primary/50"></span>
                            </div>
                            <h2 className="font-semibold text-lg">{surah.name_turkish}</h2>
                            <p className="text-sm text-muted-foreground">{surah.verse_count} ayet</p>
                        </div>

                        {/* Ayahs with Ornamental Dividers */}
                        {surah.ayahs.map((ayah, index) => (
                            <div
                                key={ayah.id}
                                data-ayah-id={ayah.id}
                                data-ayah-number={ayah.ayah_number}
                                className="animate-fade-in"
                                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                            >
                                <AyahView
                                    ayah={ayah}
                                    surahName={surah.name_turkish}
                                    totalAyahs={surah.verse_count}
                                    onCopy={showToast}
                                />
                                {/* Ornamental Divider (not after last ayah) */}
                                {index < surah.ayahs.length - 1 && (
                                    <div className="ornament-divider py-2">
                                        <span className="text-primary/30">✦</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* End of Surah Decoration */}
                        <div className="text-center py-8 mt-4">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <span className="w-16 h-0.5 bg-gradient-to-r from-transparent to-primary/30"></span>
                                <span className="text-2xl">☪</span>
                                <span className="w-16 h-0.5 bg-gradient-to-l from-transparent to-primary/30"></span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                صَدَقَ اللَّهُ الْعَظِيمُ
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Yüce Allah doğru söyledi
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Settings Panel */}
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            {/* Audio Player */}
            <AudioPlayer />

            {/* Toast */}
            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                onHide={hideToast}
            />
        </div>
    );
}
