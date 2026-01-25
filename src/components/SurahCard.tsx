import { Surah } from '../types';
import { ChevronRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SurahCardProps {
    surah: Surah;
    variant?: 'list' | 'grid';
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, variant = 'list' }) => {

    // Grid/Compact variant - Ultra compact for 5-column layout
    if (variant === 'grid') {
        return (
            <Link
                to={`/surah/${surah.id}`}
                className="flex flex-col items-center justify-center gap-0 p-[2px] h-[56px] min-w-0 bg-card border border-border/50 rounded-lg transition-all duration-200 hover:shadow-sm hover:border-primary/30 active:scale-[0.97] overflow-hidden"
            >
                {/* Surah Name - Turkish */}
                <h3 className="font-semibold text-[7px] text-foreground text-center leading-none tracking-tight line-clamp-1 w-full px-0.5">
                    {surah.name_turkish}
                </h3>

                {/* Arabic Name */}
                <span className="font-arabic text-[8px] text-muted-foreground text-center leading-none mt-0.5 line-clamp-1 w-full" dir="rtl">
                    {surah.name_arabic}
                </span>
            </Link>
        );
    }

    // List variant (default) - Compact
    return (
        <Link
            to={`/surah/${surah.id}`}
            className="flex items-center justify-between p-2 bg-card border border-border/50 rounded-lg transition-all duration-300 group active:scale-[0.98]"
        >
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xs text-foreground truncate">
                    {surah.name_turkish}
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                    <span className="font-arabic text-xs">{surah.name_arabic}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40"></span>
                    <span className="flex items-center gap-0.5">
                        <BookOpen className="w-2.5 h-2.5" />
                        {surah.verse_count}
                    </span>
                </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-secondary/30 group-hover:bg-primary/10 transition-colors">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
        </Link>
    );
};

