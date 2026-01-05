// Continue Reading Card Component
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useReadingStore } from '../store/readingStore';
import { useLanguage } from '../context/LanguageContext';
import { getUIStrings } from '../i18n/strings';

export const ContinueReading: React.FC = () => {
    const { lastRead } = useReadingStore();
    const { currentLanguage } = useLanguage();
    const ui = getUIStrings(currentLanguage);

    if (!lastRead) return null;

    const timeAgo = getTimeAgo(lastRead.timestamp ?? Date.now(), currentLanguage);

    return (
        <Link
            to={`/surah/${lastRead.surahId}#ayah-${lastRead.ayahId}`}
            className="block p-4 bg-card/95 backdrop-blur-sm border border-border shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium text-foreground">{ui.continueReading}</p>
                        <p className="text-sm text-muted-foreground">
                            {lastRead.surahName} • {ui.verses} {lastRead.ayahNumber}
                        </p>
                        <p className="text-xs text-muted-foreground/70">{timeAgo}</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
        </Link >
    );
};

function getTimeAgo(timestamp: number, lang: string): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) {
        return lang === 'tr' ? 'Az önce' : 'Just now';
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return lang === 'tr' ? `${minutes} dakika önce` : `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return lang === 'tr' ? `${hours} saat önce` : `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    return lang === 'tr' ? `${days} gün önce` : `${days}d ago`;
}
