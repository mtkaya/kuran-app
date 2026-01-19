import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotesPanel } from '../components/NotesPanel';
import { ArrowLeft } from 'lucide-react';

export const Notes: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigateToAyah = (surahId: number, ayahNumber: number) => {
        navigate(`/surah/${surahId}?ayah=${ayahNumber}`);
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header with Back Button */}
            <header
                className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border"
                style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
            >
                <div className="flex items-center gap-3 px-4 py-3">
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
                        aria-label="Geri"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-semibold">Notlarım</h1>
                </div>
            </header>

            <NotesPanel onNavigateToAyah={handleNavigateToAyah} />
        </div>
    );
};

export default Notes;
