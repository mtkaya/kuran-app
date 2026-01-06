import { Routes, Route, Link } from 'react-router-dom'
import { SurahCard } from './components/SurahCard'
import { getQuranData } from './data/quran'
import { Search as SearchIcon, Settings, BookOpen, ScrollText, FileText } from 'lucide-react'
import { SettingsPanel } from './components/SettingsPanel'
import { useState, useMemo, useEffect } from 'react'
import Reader from './pages/Reader'
import Search from './pages/Search'
import { Notes } from './pages/Notes'
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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const { mushafMode, setMushafMode } = useSettingsStore()

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
                                        <button
                                            onClick={() => setIsSettingsOpen(true)}
                                            className="p-2 hover:bg-white/10 rounded-full text-white/90 transition-colors"
                                            aria-label={ui.settings}
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
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

                            {/* Mode Selection Toggles */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button
                                    onClick={() => setMushafMode(false)}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${!mushafMode
                                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                        }`}
                                >
                                    <ScrollText className="w-4 h-4" />
                                    <span className="font-medium text-sm">Normal</span>
                                </button>
                                <button
                                    onClick={() => setMushafMode(true)}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${mushafMode
                                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                        }`}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    <span className="font-medium text-sm">Mushaf</span>
                                </button>
                            </div>

                            {/* Notes Link */}
                            <Link
                                to="/notes"
                                className="flex items-center gap-3 w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-amber-500" />
                                </div>
                                <span className="font-medium">Notlarım</span>
                            </Link>

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
                <Route path="/notes" element={<Notes />} />
            </Routes>

            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    )
}

export default App
