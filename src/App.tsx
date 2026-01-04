import { Routes, Route, Link } from 'react-router-dom'
import { SurahCard } from './components/SurahCard'
import { getQuranData } from './data/quran'
import { Search as SearchIcon } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import Reader from './pages/Reader'
import Search from './pages/Search'
import { LanguageSelector } from './components/LanguageSelector'
import { useLanguage } from './context/LanguageContext'
import { getUIStrings } from './i18n/strings'
import { ThemeToggle } from './components/ThemeToggle'
import { ContinueReading } from './components/ContinueReading'
import { useSettingsStore } from './store/settingsStore'
import { useBookmarkStore } from './store/bookmarkStore'
import { useReadingStore } from './store/readingStore'

function App() {
    const [searchTerm, setSearchTerm] = useState('')
    const { currentLanguage } = useLanguage()
    const [isHydrated, setIsHydrated] = useState(false)

    // Hydrate all stores on mount
    useEffect(() => {
        useSettingsStore.getState().hydrate();
        useBookmarkStore.getState().hydrate();
        useReadingStore.getState().hydrate();
        setIsHydrated(true);
    }, []);

    // Get Quran data and UI strings for the selected language
    const quranData = useMemo(() => getQuranData(currentLanguage), [currentLanguage])
    const ui = useMemo(() => getUIStrings(currentLanguage), [currentLanguage])

    const filteredSurahs = quranData.filter(surah =>
        surah.name_turkish.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.name_arabic.includes(searchTerm) ||
        surah.id.toString().includes(searchTerm)
    )

    // Wait for hydration before rendering
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Routes>
                <Route path="/" element={
                    <div className="min-h-screen">
                        {/* Gradient Header */}
                        <header className="gradient-header text-white px-safe py-6 pb-20 -mb-14">
                            <div className="max-w-lg mx-auto px-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="space-y-1">
                                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                            ☪ {ui.appTitle}
                                        </h1>
                                        <p className="text-white/70 text-sm">{ui.appSubtitle}</p>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <ThemeToggle />
                                        <LanguageSelector />
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Main Content */}
                        <main className="max-w-lg mx-auto px-4 space-y-4 pb-8">
                            {/* Continue Reading Card */}
                            <div className="transform -translate-y-4">
                                <ContinueReading />
                            </div>

                            {/* Search Bar - Enhanced */}
                            <Link
                                to="/search"
                                className="flex items-center gap-3 w-full px-4 py-4 glass rounded-xl text-muted-foreground hover:shadow-lg transition-all duration-300 card-hover touch-target"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <SearchIcon className="w-5 h-5 text-primary" />
                                </div>
                                <span className="font-medium">{ui.searchInQuran}</span>
                            </Link>

                            {/* Quick Search for Surahs */}
                            <div className="relative">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={ui.searchPlaceholder}
                                    className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none touch-target"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Section Title */}
                            <div className="flex items-center gap-2 pt-2">
                                <div className="w-1 h-5 bg-primary rounded-full"></div>
                                <h2 className="font-semibold text-foreground">Sureler</h2>
                                <span className="text-xs text-muted-foreground">({filteredSurahs.length})</span>
                            </div>

                            {/* Surah List - Enhanced */}
                            <div className="space-y-2">
                                {filteredSurahs.map((surah, index) => (
                                    <div
                                        key={surah.id}
                                        className="animate-fade-in"
                                        style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                                    >
                                        <SurahCard surah={surah} />
                                    </div>
                                ))}

                                {filteredSurahs.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>{ui.notFound}</p>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                } />
                <Route path="/surah/:id" element={<Reader />} />
                <Route path="/search" element={<Search />} />
            </Routes>
        </div>
    )
}

export default App
