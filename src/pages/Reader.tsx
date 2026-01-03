import { useParams, Link } from 'react-router-dom';
import { getQuranData } from '../data/quran';
import { AyahView } from '../components/AyahView';
import { ArrowLeft, Settings } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { getUIStrings } from '../i18n/strings';
import { useReadingStore } from '../store/readingStore';
import { SettingsPanel } from '../components/SettingsPanel';
import { Toast, useToast } from '../components/Toast';

export default function Reader() {
    const { id } = useParams();
    const { currentLanguage } = useLanguage();
    const { setLastRead } = useReadingStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { toast, showToast, hideToast } = useToast();
    const observerRef = useRef<IntersectionObserver | null>(null);

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

    // Scroll to ayah if hash is present
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

    if (!surah) {
        return <div className="p-8 text-center">{ui.surahNotFound}</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
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
                {surah.ayahs.map(ayah => (
                    <div
                        key={ayah.id}
                        data-ayah-id={ayah.id}
                        data-ayah-number={ayah.ayah_number}
                    >
                        <AyahView
                            ayah={ayah}
                            surahName={surah.name_turkish}
                            onCopy={showToast}
                        />
                    </div>
                ))}
            </div>

            {/* Settings Panel */}
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            {/* Toast */}
            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                onHide={hideToast}
            />
        </div>
    );
}
