import { Routes, Route, Link } from 'react-router-dom'
import { SurahCard } from './components/SurahCard'
import { useQuranData } from './hooks/useQuranData'
import { Search as SearchIcon, Settings, BookOpen, ScrollText, List, Grid3X3, ArrowDownUp, Layers, FileText } from 'lucide-react'
import { SettingsPanel } from './components/SettingsPanel'
import { useState, useMemo, useEffect, lazy, Suspense, useCallback } from 'react'
import { useLanguage } from './context/LanguageContext'
import { getUIStrings } from './i18n/strings'
import { ThemeToggle } from './components/ThemeToggle'
// ContinueReading import removed for cleaner home design
import { useSettingsStore } from './store/settingsStore'
import { useBookmarkStore } from './store/bookmarkStore'
import { useReadingStore } from './store/readingStore'
import { SplashScreen } from './components/SplashScreen'
import { useNativeFeatures } from './hooks/useNativeFeatures'
import { AudioPlayer } from './components/AudioPlayer'
import { PWAInstallBanner, PWAUpdateBanner, OfflineIndicator } from './components/PWAComponents'

// Lazy load pages for better initial load performance
const Reader = lazy(() => import('./pages/Reader'))
const Search = lazy(() => import('./pages/Search'))
const Notes = lazy(() => import('./pages/Notes'))
const RevelationOrder = lazy(() => import('./pages/RevelationOrder'))
const JuzList = lazy(() => import('./pages/JuzList'))

function App() {
    const [searchTerm, setSearchTerm] = useState('')
    const { currentLanguage } = useLanguage()
    const [isHydrated, setIsHydrated] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const { readingMode, setReadingMode } = useSettingsStore()
    const [surahViewMode, setSurahViewMode] = useState<'list' | 'grid'>('list')
    const [showSplash, setShowSplash] = useState(true)

    // Initialize native features (back button, media session)
    useNativeFeatures()

    // Hydrate all stores on mount
    useEffect(() => {
        useSettingsStore.getState().hydrate();
        useBookmarkStore.getState().hydrate();
        useReadingStore.getState().hydrate();
        setIsHydrated(true);
    }, []);

    // Get Quran data and UI strings for the selected language
    const { quranData, isLoading: isQuranLoading } = useQuranData(currentLanguage)
    const ui = useMemo(() => getUIStrings(currentLanguage), [currentLanguage])

    const filteredSurahs = quranData.filter(surah =>
        surah.name_turkish.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.name_arabic.includes(searchTerm) ||
        surah.id.toString().includes(searchTerm)
    )

    // Handle splash screen completion
    const handleSplashComplete = useCallback(() => {
        setShowSplash(false);
    }, []);

    // Show splash screen on initial load
    if (showSplash) {
        return <SplashScreen onComplete={handleSplashComplete} minDisplayTime={2500} />;
    }

    // Wait for hydration and data loading
    if (!isHydrated || isQuranLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-muted-foreground text-sm">{isQuranLoading ? ui.loading : ''}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Routes>
                <Route path="/" element={
                    <div className="min-h-screen">
                        {/* Minimal Header */}
                        <header
                            className="gradient-header text-white px-safe pb-8"
                            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
                        >
                            <div className="max-w-lg mx-auto px-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src="./logo.svg" alt="Logo" className="w-9 h-9" />
                                        <div>
                                            <h1 className="text-lg font-bold tracking-tight">
                                                {ui.appTitle}
                                            </h1>
                                            <p className="text-white/60 text-xs">{ui.appSubtitle}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        <Link
                                            to="/search"
                                            className="p-2 hover:bg-white/10 rounded-full text-white/80 transition-colors"
                                            aria-label={ui.searchInQuran}
                                        >
                                            <SearchIcon className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            to="/notes"
                                            className="p-2 hover:bg-white/10 rounded-full text-white/80 transition-colors"
                                            aria-label="Notlarım"
                                        >
                                            <FileText className="w-5 h-5" />
                                        </Link>
                                        <ThemeToggle />
                                        <button
                                            onClick={() => setIsSettingsOpen(true)}
                                            className="p-2 hover:bg-white/10 rounded-full text-white/80 transition-colors"
                                            aria-label={ui.settings}
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Main Content */}
                        <main className="max-w-lg mx-auto px-4 space-y-3 pb-8 pt-4">
                            {/* Reading Mode Selection - Compact 3 Options */}
                            <div className="grid grid-cols-3 gap-1.5">
                                <button
                                    onClick={() => setReadingMode('normal')}
                                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border transition-all duration-200 ${readingMode === 'normal'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                        }`}
                                >
                                    <ScrollText className="w-3.5 h-3.5" />
                                    <span className="font-medium text-xs">Normal</span>
                                </button>
                                <button
                                    onClick={() => setReadingMode('mushaf')}
                                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border transition-all duration-200 ${readingMode === 'mushaf'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                        }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span className="font-medium text-xs">Mushaf</span>
                                </button>
                                <button
                                    onClick={() => setReadingMode('digital')}
                                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border transition-all duration-200 ${readingMode === 'digital'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                        }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span className="font-medium text-xs">Dijital</span>
                                </button>
                            </div>

                            {/* Compact Navigation Row */}
                            <div className="flex items-center gap-2">
                                {/* Revelation Order - Compact */}
                                <Link
                                    to="/revelation-order"
                                    className="flex items-center gap-2 flex-1 py-2.5 px-3 bg-card border border-border rounded-lg text-foreground hover:shadow-md hover:border-emerald-500/50 transition-all duration-200"
                                >
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <ArrowDownUp className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <span className="font-medium text-xs">Nüzul</span>
                                </Link>

                                {/* Juz List - Compact */}
                                <Link
                                    to="/juz"
                                    className="flex items-center gap-2 flex-1 py-2.5 px-3 bg-card border border-border rounded-lg text-foreground hover:shadow-md hover:border-blue-500/50 transition-all duration-200"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <Layers className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="font-medium text-xs">Cüz</span>
                                </Link>
                            </div>

                            {/* Surah Search - Simple Input */}
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={ui.searchPlaceholder}
                                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Section Title with View Toggle */}
                            <div className="flex items-center justify-between pt-2 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                                    <h2 className="font-semibold text-foreground">Sureler</h2>
                                    <span className="text-xs text-muted-foreground">({filteredSurahs.length})</span>
                                </div>

                                {/* View Toggle Buttons */}
                                <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
                                    <button
                                        onClick={() => setSurahViewMode('list')}
                                        className={`p-1.5 rounded-md transition-all ${surahViewMode === 'list'
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'}`}
                                        aria-label="Liste Görünümü"
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setSurahViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-all ${surahViewMode === 'grid'
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'}`}
                                        aria-label="Izgara Görünümü"
                                    >
                                        <Grid3X3 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Surah List - List or Grid View */}
                            <div className={surahViewMode === 'grid'
                                ? 'grid grid-cols-5 gap-1 overflow-hidden'
                                : 'space-y-1.5'
                            }>
                                {filteredSurahs.map((surah, index) => (
                                    <div
                                        key={surah.id}
                                        className="animate-fade-in"
                                        style={{ animationDelay: `${Math.min(index * 15, 200)}ms` }}
                                    >
                                        <SurahCard surah={surah} variant={surahViewMode} />
                                    </div>
                                ))}

                                {filteredSurahs.length === 0 && (
                                    <div className={`text-center py-12 text-muted-foreground ${surahViewMode === 'grid' ? 'col-span-full' : ''}`}>
                                        <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>{ui.notFound}</p>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                } />
                <Route path="/surah/:id" element={
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                        <Reader />
                    </Suspense>
                } />
                <Route path="/search" element={
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                        <Search />
                    </Suspense>
                } />
                <Route path="/notes" element={
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                        <Notes />
                    </Suspense>
                } />
                <Route path="/revelation-order" element={
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                        <RevelationOrder />
                    </Suspense>
                } />
                <Route path="/juz" element={
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                        <JuzList />
                    </Suspense>
                } />
            </Routes>

            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            {/* Global Audio Player - visible on all pages */}
            <AudioPlayer />

            {/* PWA Components */}
            <PWAInstallBanner />
            <PWAUpdateBanner />
            <OfflineIndicator />
        </div >
    )
}

export default App
