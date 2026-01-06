import { Surah } from '../types';
import { ChevronRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getUIStrings } from '../i18n/strings';

interface SurahCardProps {
    surah: Surah;
    variant?: 'list' | 'grid';
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, variant = 'list' }) => {
    const { currentLanguage } = useLanguage();
    const ui = getUIStrings(currentLanguage);

    // Grid/Compact variant
    if (variant === 'grid') {
        return (
            <Link
                to={`/surah/${surah.id}`}
                className="flex flex-col items-center justify-between p-3 h-[130px] bg-card border border-border/50 rounded-xl transition-all duration-300 hover:shadow-md hover:border-primary/30 active:scale-[0.97]"
            >
                {/* Surah Number */}
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-sm border border-primary/10">
                    {surah.id}
                </div>

                {/* Surah Name */}
                <h3 className="font-semibold text-xs text-foreground text-center truncate w-full mt-1">
                    {surah.name_turkish}
                </h3>

                {/* Arabic Name - single line truncated */}
                <span className="font-arabic text-xs text-muted-foreground truncate w-full text-center">
                    {surah.name_arabic}
                </span>

                {/* Verse Count */}
                <span className="text-[10px] text-muted-foreground">
                    {surah.verse_count} {ui.verses}
                </span>
            </Link>
        );
    }

    // List variant (default)
    return (
        <Link
            to={`/surah/${surah.id}`}
            className="flex items-center justify-between p-3 sm:p-4 bg-card border border-border/50 rounded-xl transition-all duration-300 group touch-target active:scale-[0.98] card-glow"
        >
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Surah Number Badge */}
                <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-lg border border-primary/10">
                    {surah.id}
                </div>

                {/* Surah Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
                        {surah.name_turkish}
                    </h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="font-arabic text-base">{surah.name_arabic}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {surah.verse_count} {ui.verses}
                        </span>
                    </div>
                </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
        </Link>
    );
};

