import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
    const { currentLanguage, setLanguage, languages } = useLanguage();

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as typeof currentLanguage)}
                className="bg-secondary/50 border-none rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.nativeName}
                    </option>
                ))}
            </select>
        </div>
    );
}
