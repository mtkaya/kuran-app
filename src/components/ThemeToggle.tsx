// Theme Toggle Button Component
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useSettingsStore();

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('system');
        } else {
            setTheme('light');
        }
    };

    const getIcon = () => {
        if (theme === 'dark') {
            return <Moon className="w-5 h-5" />;
        }
        return <Sun className="w-5 h-5" />;
    };

    const getLabel = () => {
        switch (theme) {
            case 'light': return 'Light';
            case 'dark': return 'Dark';
            case 'system': return 'Auto';
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            aria-label={`Theme: ${getLabel()}`}
        >
            {getIcon()}
            <span className="text-xs font-medium">{getLabel()}</span>
        </button>
    );
};
