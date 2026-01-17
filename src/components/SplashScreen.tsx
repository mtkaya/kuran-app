// Splash Screen Component - Beautiful animated splash screen
import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
    minDisplayTime?: number; // Minimum time to show splash in ms
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
    onComplete,
    minDisplayTime = 2000
}) => {
    const [isAnimating, setIsAnimating] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFadingOut(true);
            // Wait for fade out animation then call onComplete
            setTimeout(() => {
                setIsAnimating(false);
                onComplete();
            }, 500);
        }, minDisplayTime);

        return () => clearTimeout(timer);
    }, [minDisplayTime, onComplete]);

    if (!isAnimating) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[hsl(195,13%,20%)] via-[hsl(174,11%,22%)] to-[hsl(25,31%,35%)] transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23DCD7C9' stroke-width='0.5' opacity='0.4'%3E%3Cpath d='M40 5 L47 22 L65 17 L53 32 L75 40 L53 48 L65 63 L47 58 L40 75 L33 58 L15 63 L27 48 L5 40 L27 32 L15 17 L33 22 Z'/%3E%3Cpolygon points='40,15 55,23 62,40 55,57 40,65 25,57 18,40 25,23'/%3E%3Ccircle cx='40' cy='40' r='8'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '80px 80px',
                        animation: 'patternFloat 20s linear infinite',
                    }}
                />
            </div>

            {/* Logo Container with Glow */}
            <div className="relative mb-8 animate-float">
                {/* Outer Glow Rings */}
                <div className="absolute inset-0 -m-8 animate-pulse">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(25,31%,50%)] to-[hsl(25,40%,60%)] opacity-20 blur-xl" />
                </div>
                <div className="absolute inset-0 -m-4 animate-pulse" style={{ animationDelay: '0.5s' }}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(25,31%,50%)] to-[hsl(25,40%,60%)] opacity-30 blur-lg" />
                </div>

                {/* Logo */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center rounded-3xl bg-gradient-to-br from-[hsl(25,31%,45%)] to-[hsl(25,40%,55%)] shadow-2xl overflow-hidden">
                    <img
                        src="./logo.svg"
                        alt="The Holy Quran"
                        className="w-20 h-20 sm:w-24 sm:h-24 animate-scale-in"
                    />
                    {/* Shine Effect */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{
                            animation: 'shimmerSplash 3s ease-in-out infinite',
                        }}
                    />
                </div>
            </div>

            {/* App Title */}
            <div className="text-center mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(44,26%,90%)] mb-2 tracking-wide">
                    The Holy Quran
                </h1>
                <p className="text-lg text-[hsl(44,26%,70%)] font-arabic" dir="rtl">
                    القرآن الكريم
                </p>
            </div>

            {/* Tagline */}
            <p
                className="text-sm text-[hsl(44,26%,60%)] mb-8 animate-fade-in"
                style={{ animationDelay: '500ms' }}
            >
                Read • Listen • Reflect
            </p>

            {/* Loading Indicator */}
            <div
                className="flex items-center gap-2 animate-fade-in"
                style={{ animationDelay: '700ms' }}
            >
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-[hsl(25,31%,55%)]"
                            style={{
                                animation: 'bounce 1.4s ease-in-out infinite',
                                animationDelay: `${i * 0.16}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Branding */}
            <div
                className="absolute bottom-8 text-center animate-fade-in"
                style={{ animationDelay: '900ms' }}
            >
                <p className="text-xs text-[hsl(44,26%,50%)]">
                    Arfhause
                </p>
            </div>

            {/* Inline Keyframes */}
            <style>{`
                @keyframes patternFloat {
                    0% { background-position: 0 0; }
                    100% { background-position: 80px 80px; }
                }
                @keyframes shimmerSplash {
                    0% { transform: translateX(-100%); }
                    50%, 100% { transform: translateX(100%); }
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
