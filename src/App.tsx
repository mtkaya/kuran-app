import { Routes, Route, Link } from 'react-router-dom'
import { SurahCard } from './components/SurahCard'
import { useQuranData } from './hooks/useQuranData'
import { Search as SearchIcon, Settings, BookOpen, ScrollText, List, Grid3X3, FileText, ArrowDownUp, Layers, ChevronDown } from 'lucide-react'
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
import { TutorialOverlay } from './components/TutorialOverlay'
import { getTodayHijri } from './utils/hijriCalendar'

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
    const [showDigitalMenu, setShowDigitalMenu] = useState(false)

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

    // Get today's Hijri date
    const hijriDate = useMemo(() => getTodayHijri(), [])

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
                        {/* Responsive Header */}
                        <header
                            className="gradient-header text-white px-safe pb-8 lg:pb-6"
                            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
                        >
                            <div className="max-w-lg lg:max-w-4xl xl:max-w-6xl mx-auto px-4 lg:px-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 lg:gap-4">
                                        <img src="./logo.svg" alt="Logo" className="w-9 h-9 lg:w-11 lg:h-11" />
                                        <div>
                                            <h1 className="text-lg lg:text-xl font-bold tracking-tight">
                                                {ui.appTitle}
                                            </h1>
                                            <p className="text-white/60 text-xs lg:text-sm">{ui.appSubtitle}</p>
                                            <p className="text-white/50 text-[10px] lg:text-xs mt-0.5">
                                                {hijriDate.day} {hijriDate.monthName} {hijriDate.year} H
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 lg:gap-1">
                                        <Link
                                            to="/search"
                                            className="p-2 lg:px-3 lg:py-2 hover:bg-white/10 rounded-full lg:rounded-lg text-white/80 transition-colors flex items-center gap-2"
                                            aria-label={ui.searchInQuran}
                                        >
                                            <SearchIcon className="w-5 h-5" />
                                            <span className="hidden lg:inline text-sm font-medium">Ara</span>
                                        </Link>
                                        <Link
                                            to="/notes"
                                            className="p-2 lg:px-3 lg:py-2 hover:bg-white/10 rounded-full lg:rounded-lg text-white/80 transition-colors flex items-center gap-2"
                                            aria-label="Notlarım"
                                        >
                                            <FileText className="w-5 h-5" />
                                            <span className="hidden lg:inline text-sm font-medium">Notlar</span>
                                        </Link>
                                        <ThemeToggle />
                                        <button
                                            onClick={() => setIsSettingsOpen(true)}
                                            className="p-2 lg:px-3 lg:py-2 hover:bg-white/10 rounded-full lg:rounded-lg text-white/80 transition-colors flex items-center gap-2"
                                            aria-label={ui.settings}
                                        >
                                            <Settings className="w-5 h-5" />
                                            <span className="hidden lg:inline text-sm font-medium">Ayarlar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Main Content - Responsive */}
                        <main className="max-w-lg lg:max-w-4xl xl:max-w-6xl mx-auto px-4 lg:px-8 space-y-3 lg:space-y-4 pb-8 pt-4 lg:pt-6">
                            {/* Reading Mode + Search - Flex layout on tablet/desktop */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
                                {/* Reading Mode Selection - 4 Options */}
                                <div className="grid grid-cols-4 gap-1.5 lg:gap-2 lg:flex lg:shrink-0">
                                    <button
                                        onClick={() => setReadingMode('normal')}
                                        className={`flex items-center justify-center gap-1 lg:gap-2 py-2 lg:py-2.5 px-2 lg:px-4 rounded-lg border transition-all duration-200 ${readingMode === 'normal'
                                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                            : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <ScrollText className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                        <span className="font-medium text-[10px] lg:text-sm">Normal</span>
                                    </button>
                                    <button
                                        onClick={() => setReadingMode('mushaf')}
                                        className={`flex items-center justify-center gap-1 lg:gap-2 py-2 lg:py-2.5 px-2 lg:px-4 rounded-lg border transition-all duration-200 ${readingMode === 'mushaf'
                                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                            : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                        <span className="font-medium text-[10px] lg:text-sm">Mushaf</span>
                                    </button>

                                    {/* Digital Mode Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowDigitalMenu(!showDigitalMenu)}
                                            className={`flex items-center justify-center gap-1 lg:gap-2 py-2 lg:py-2.5 px-2 lg:px-4 rounded-lg border transition-all duration-200 w-full ${readingMode === 'digital'
                                                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                                : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                            <span className="font-medium text-[10px] lg:text-sm">Dijital</span>
                                            <ChevronDown className={`w-3 h-3 transition-transform ${showDigitalMenu ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showDigitalMenu && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setShowDigitalMenu(false)}
                                                />
                                                <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[140px]">
                                                    <button
                                                        onClick={() => {
                                                            setReadingMode('digital');
                                                            setShowDigitalMenu(false);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                                                    >
                                                        <BookOpen className="w-4 h-4 text-primary" />
                                                        <span className="text-sm font-medium">Dijital Mod</span>
                                                    </button>
                                                    <Link
                                                        to="/revelation-order"
                                                        onClick={() => setShowDigitalMenu(false)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                                                    >
                                                        <ArrowDownUp className="w-4 h-4 text-amber-500" />
                                                        <span className="text-sm font-medium">Nüzul Sırası</span>
                                                    </Link>
                                                    <Link
                                                        to="/juz-list"
                                                        onClick={() => setShowDigitalMenu(false)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                                                    >
                                                        <Layers className="w-4 h-4 text-emerald-500" />
                                                        <span className="text-sm font-medium">Cüzler</span>
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <Link
                                        to="/search"
                                        className="flex items-center justify-center gap-1 lg:gap-2 py-2 lg:py-2.5 px-2 lg:px-4 rounded-lg border border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                                    >
                                        <SearchIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                        <span className="font-medium text-[10px] lg:text-sm">Ara</span>
                                    </Link>
                                </div>

                                {/* Surah Search - Next to buttons on tablet/desktop */}
                                <div className="relative flex-1 mt-3 lg:mt-0 lg:max-w-md">
                                    <SearchIcon className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder={ui.searchPlaceholder}
                                        className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none text-sm lg:text-base"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Section Title with View Toggle */}
                            <div className="flex items-center justify-between pt-2 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                                    <h2 className="font-semibold text-foreground lg:text-lg">Sureler</h2>
                                    <span className="text-xs lg:text-sm text-muted-foreground">({filteredSurahs.length})</span>
                                </div>

                                {/* View Toggle Buttons */}
                                <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
                                    <button
                                        onClick={() => setSurahViewMode('list')}
                                        className={`p-1.5 lg:p-2 rounded-md transition-all ${surahViewMode === 'list'
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'}`}
                                        aria-label="Liste Görünümü"
                                    >
                                        <List className="w-4 h-4 lg:w-5 lg:h-5" />
                                    </button>
                                    <button
                                        onClick={() => setSurahViewMode('grid')}
                                        className={`p-1.5 lg:p-2 rounded-md transition-all ${surahViewMode === 'grid'
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'}`}
                                        aria-label="Izgara Görünümü"
                                    >
                                        <Grid3X3 className="w-4 h-4 lg:w-5 lg:h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Surah List - Responsive Grid */}
                            <div className={surahViewMode === 'grid'
                                ? 'grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 lg:gap-2 overflow-hidden'
                                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 lg:gap-3'
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
            <TutorialOverlay />
        </div >
    )
}

export default App
