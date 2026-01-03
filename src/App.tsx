import { Routes, Route } from 'react-router-dom'
import { SurahCard } from './components/SurahCard'
import { getQuranData } from './data/quran'
import { Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import Reader from './pages/Reader'
import { LanguageSelector } from './components/LanguageSelector'
import { useLanguage } from './context/LanguageContext'
import { getUIStrings } from './i18n/strings'

function App() {
    const [searchTerm, setSearchTerm] = useState('')
    const { currentLanguage } = useLanguage()

    // Get Quran data and UI strings for the selected language
    const quranData = useMemo(() => getQuranData(currentLanguage), [currentLanguage])
    const ui = useMemo(() => getUIStrings(currentLanguage), [currentLanguage])

    const filteredSurahs = quranData.filter(surah =>
        surah.name_turkish.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.name_arabic.includes(searchTerm) ||
        surah.id.toString().includes(searchTerm)
    )

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <Routes>
                <Route path="/" element={
                    <div className="max-w-md mx-auto p-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-bold text-primary">{ui.appTitle}</h1>
                                <p className="text-sm text-muted-foreground">{ui.appSubtitle}</p>
                            </div>
                            <LanguageSelector />
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={ui.searchPlaceholder}
                                className="w-full pl-9 pr-4 py-2 bg-secondary/50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Surah List */}
                        <div className="space-y-3">
                            {filteredSurahs.map(surah => (
                                <SurahCard key={surah.id} surah={surah} />
                            ))}

                            {filteredSurahs.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    {ui.notFound}
                                </div>
                            )}
                        </div>
                    </div>
                } />
                <Route path="/surah/:id" element={<Reader />} />
            </Routes>
        </div>
    )
}

export default App
