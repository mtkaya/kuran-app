import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LanguageCode = 'tr' | 'en' | 'de' | 'fr' | 'zh' | 'ar' | 'id' | 'ur' | 'bn';

interface Language {
    code: LanguageCode;
    name: string;
    nativeName: string;
}

export const LANGUAGES: Language[] = [
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

interface LanguageContextType {
    currentLanguage: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
        const saved = localStorage.getItem('quran-app-language');
        return (saved as LanguageCode) || 'tr';
    });

    useEffect(() => {
        localStorage.setItem('quran-app-language', currentLanguage);
    }, [currentLanguage]);

    const setLanguage = (lang: LanguageCode) => {
        setCurrentLanguage(lang);
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, setLanguage, languages: LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
