import { useParams, Link } from 'react-router-dom';
import { getQuranData } from '../data/quran';
import { AyahView } from '../components/AyahView';
import { ArrowLeft } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useMemo } from 'react';
import { getUIStrings } from '../i18n/strings';

export default function Reader() {
    const { id } = useParams();
    const { currentLanguage } = useLanguage();

    const quranData = useMemo(() => getQuranData(currentLanguage), [currentLanguage]);
    const ui = useMemo(() => getUIStrings(currentLanguage), [currentLanguage]);
    const surah = quranData.find(s => s.id === Number(id));

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
                <LanguageSelector />
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto p-4">
                {surah.ayahs.map(ayah => (
                    <AyahView key={ayah.id} ayah={ayah} />
                ))}
            </div>
        </div>
    );
}
