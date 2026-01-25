import { Surah } from '../types';
import { ChevronRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SurahCardProps {
    surah: Surah;
    variant?: 'list' | 'grid';
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, variant = 'list' }) => {

    // Grid/Compact variant - Fixed height for 5 rows visible
    if (variant === 'grid') {
        return (
            <Link
                to={`/surah/${surah.id}`}
                className="flex flex-col items-center justify-between p-2 h-[88px] min-w-0 bg-card border border-border/50 rounded-xl transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.97] overflow-hidden"
            >
                {/* Surah Number */}
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-[10px] border border-primary/10">
                    {surah.id}
                </div>

                {/* Surah Name - Turkish */}
                <h3 className="font-semibold text-[10px] text-foreground text-center leading-tight line-clamp-1 w-full">
                    {surah.name_turkish}
                </h3>

                {/* Arabic Name */}
                <span className="font-arabic text-[12px] text-muted-foreground text-center leading-tight line-clamp-1 w-full" dir="rtl">
                    {surah.name_arabic}
                </span>
            </Link>
        );
    }

    // List variant (default) - Compact
    return (
        <Link
            to={`/surah/${surah.id}`}
            className="flex items-center justify-between p-2.5 bg-card border border-border/50 rounded-xl transition-all duration-300 group active:scale-[0.98]"
        >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Surah Number Badge - Smaller */}
                <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-sm border border-primary/10">
                    {surah.id}
                </div>

                {/* Surah Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                        {surah.name_turkish}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-arabic text-sm">{surah.name_arabic}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                        <span className="flex items-center gap-0.5">
                            <BookOpen className="w-3 h-3" />
                            {surah.verse_count}
                        </span>
                    </div>
                </div>
            </div>

            {/* Arrow - Smaller */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-secondary/30 group-hover:bg-primary/10 transition-colors">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
        </Link>
    );
};

