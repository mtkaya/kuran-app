// Theme Toggle Button Component
import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
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
        switch (theme) {
            case 'light':
                return <Sun className="w-5 h-5" />;
            case 'dark':
                return <Moon className="w-5 h-5" />;
            case 'system':
                return <Monitor className="w-5 h-5" />;
        }
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
            className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors"
            aria-label={`Theme: ${getLabel()}`}
        >
            {getIcon()}
        </button>
    );
};
