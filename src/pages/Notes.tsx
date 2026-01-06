import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotesPanel } from '../components/NotesPanel';

export const Notes: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigateToAyah = (surahId: number, ayahNumber: number) => {
        navigate(`/surah/${surahId}?ayah=${ayahNumber}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <NotesPanel onNavigateToAyah={handleNavigateToAyah} />
        </div>
    );
};
