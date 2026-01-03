import { useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, X, BookOpen, FileText, Languages } from 'lucide-react';
import { useSearchStore, SearchFilter, SearchResult } from '../store/searchStore';
import { useLanguage } from '../context/LanguageContext';
import { getUIStrings } from '../i18n/strings';

export default function Search() {
    const navigate = useNavigate();
    const { currentLanguage } = useLanguage();
    const ui = getUIStrings(currentLanguage);

    const { query, filter, results, isSearching, setQuery, setFilter, search, clearSearch } = useSearchStore();

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                search(currentLanguage);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, filter, currentLanguage, search]);

    const handleClear = useCallback(() => {
        clearSearch();
    }, [clearSearch]);

    const getFilterIcon = (f: SearchFilter) => {
        switch (f) {
            case 'arabic': return <Languages className="w-4 h-4" />;
            case 'translation': return <FileText className="w-4 h-4" />;
            default: return <BookOpen className="w-4 h-4" />;
        }
    };

    const getMatchBadge = (result: SearchResult) => {
        switch (result.matchType) {
            case 'arabic':
                return <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded">{ui.arabic}</span>;
            case 'translation':
                return <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">{ui.translation}</span>;
            case 'surah_name':
                return <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded">{ui.surahName}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-4 py-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-accent rounded-full text-foreground/80"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={ui.searchInQuran}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 bg-secondary/50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={handleClear}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mt-3">
                    {(['all', 'arabic', 'translation'] as SearchFilter[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === f
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary hover:bg-secondary/80'
                                }`}
                        >
                            {getFilterIcon(f)}
                            {f === 'all' ? ui.all : f === 'arabic' ? ui.arabic : ui.translation}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            <div className="max-w-2xl mx-auto p-4">
                {/* Loading */}
                {isSearching && (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* No query */}
                {!query && !isSearching && (
                    <div className="text-center py-12 text-muted-foreground">
                        <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{ui.searchHint}</p>
                    </div>
                )}

                {/* No results */}
                {query && query.length >= 2 && !isSearching && results.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>{ui.noSearchResults}</p>
                    </div>
                )}

                {/* Results list */}
                {results.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground mb-4">
                            {results.length} {ui.resultsFound}
                        </p>

                        {results.map((result, index) => (
                            <Link
                                key={`${result.surah.id}-${result.ayah.id}-${index}`}
                                to={`/surah/${result.surah.id}#ayah-${result.ayah.id}`}
                                className="block p-4 bg-card border rounded-xl hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                            {result.surah.id}
                                        </span>
                                        <div>
                                            <span className="font-medium">{result.surah.name_turkish}</span>
                                            <span className="text-muted-foreground mx-1">•</span>
                                            <span className="text-sm text-muted-foreground">{ui.verses} {result.ayah.ayah_number}</span>
                                        </div>
                                    </div>
                                    {getMatchBadge(result)}
                                </div>

                                {/* Arabic preview */}
                                {result.matchType === 'arabic' && (
                                    <p className="text-right font-arabic text-lg leading-loose truncate mb-2" dir="rtl">
                                        {result.ayah.text_arabic}
                                    </p>
                                )}

                                {/* Translation preview */}
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {result.ayah.text_meal}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
