import React, { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { Grid3X3, BookOpen, ChevronRight, X, Heart } from 'lucide-react';

interface TutorialStep {
    title: string;
    description: string;
    icon: React.ReactNode;
    image?: string;
}

export const TutorialOverlay: React.FC = () => {
    const { hasSeenTutorial, setHasSeenTutorial } = useSettingsStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    // If tutorial is seen, don't render anything
    if (hasSeenTutorial) return null;

    const steps: TutorialStep[] = [
        {
            title: "Hoş Geldiniz",
            description: "Kur'an-ı Kerim uygulaması yenilendi! Size daha iyi bir okuma deneyimi sunmak için yeni özellikler ekledik.",
            icon: <Heart className="w-12 h-12 text-primary animate-pulse" fill="currentColor" fillOpacity={0.2} />
        },
        {
            title: "Yeni Görünüm Seçenekleri",
            description: "Ana sayfada sağ üstteki buton ile Liste veya yeni Kompakt Izgara görünümü arasında geçiş yapabilirsiniz.",
            icon: <Grid3X3 className="w-12 h-12 text-blue-500" />
        },
        {
            title: "Mushaf ve Dijital Mod",
            description: "Okuma ekranında 'Mushaf' butonu ile gerçek sayfa görünümüne veya 'Dijital' butonu ile metin moduna geçebilirsiniz.",
            icon: <BookOpen className="w-12 h-12 text-amber-600" />
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setHasSeenTutorial(true);
        }, 300); // 300ms matches exit animation duration
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        >
            <div
                className={`w-[90%] max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
            >
                {/* Header Image Pattern */}
                <div className="h-32 bg-primary/10 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 pattern-islamic opacity-10"></div>
                    <div className="relative z-10 transform transition-all duration-500 ease-in-out scale-110">
                        {steps[currentStep].icon}
                    </div>

                    {/* Skip button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <div className="mb-2 flex justify-center gap-1.5">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-primary' : 'bg-primary/20'}`}
                            />
                        ))}
                    </div>

                    <h2 className="text-xl font-bold mb-3 text-foreground transition-all duration-300">
                        {steps[currentStep].title}
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed min-h-[60px] transition-all duration-300">
                        {steps[currentStep].description}
                    </p>

                    <button
                        onClick={handleNext}
                        className="mt-6 w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        {currentStep === steps.length - 1 ? 'Başla' : 'Sonraki'}
                        {currentStep !== steps.length - 1 && (
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
