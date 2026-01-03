import { Surah } from '../types';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getUIStrings } from '../i18n/strings';

interface SurahCardProps {
    surah: Surah;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah }) => {
    const { currentLanguage } = useLanguage();
    const ui = getUIStrings(currentLanguage);

    return (
        <Link
            to={`/surah/${surah.id}`}
            className="flex items-center justify-between p-4 bg-card hover:bg-accent/50 border rounded-lg transition-colors group"
        >
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                    {surah.id}
                </div>
                <div>
                    <h3 className="font-semibold text-lg">{surah.name_turkish}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <span className="font-arabic">{surah.name_arabic}</span>
                        <span>•</span>
                        <span>{surah.verse_count} {ui.verses}</span>
                    </p>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
    );
};
