/**
 * ContentPanel - Expandable panel for tefsir, meal, and related content
 * Responsive design: bottom sheet on mobile, side panel on tablet/iPad
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronUp,
    ChevronDown,
    Book,
    BookOpen,
    Link2,
    Download,
    Check,
    Loader2,
    Settings2,
} from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import { useSettingsStore } from '../store/settingsStore';
import { contentService } from '../services/contentService';
import { ContentType, TefsirContent, ContentProvider } from '../types/content';
import { Ayah } from '../types';

interface ContentPanelProps {
    currentAyah: Ayah | null;
    surahName?: string;
    isVisible?: boolean;
}

// Tab configuration
const TABS: { id: ContentType; label: string; labelTr: string; icon: React.ReactNode }[] = [
    { id: 'meal', label: 'Translation', labelTr: 'Meal', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tefsir', label: 'Tafsir', labelTr: 'Tefsir', icon: <Book className="w-4 h-4" /> },
];

export const ContentPanel: React.FC<ContentPanelProps> = ({
    currentAyah,
    surahName,
    isVisible = true,
}) => {
    const { arabicFont } = useSettingsStore();
    const {
        activeTab,
        setActiveTab,
        isExpanded,
        toggleExpanded,
        selectedTefsirProvider,
        setTefsirProvider,
        getAvailableProviders,
        isProviderDownloaded,
        downloadProvider,
        downloadProgress,
    } = useContentStore();

    // Local state
    const [tefsirContent, setTefsirContent] = useState<TefsirContent | null>(null);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [contentError, setContentError] = useState<string | null>(null);
    const [showProviderSelect, setShowProviderSelect] = useState(false);

    // Fetch tefsir content when ayah or provider changes
    const fetchTefsir = useCallback(async () => {
        if (!currentAyah || activeTab !== 'tefsir') return;

        setIsLoadingContent(true);
        setContentError(null);

        const result = await contentService.getTefsir(
            selectedTefsirProvider,
            currentAyah.surah_id,
            currentAyah.ayah_number
        );

        if (result.success && result.data) {
            setTefsirContent(result.data);
        } else {
            setContentError(result.error || 'İçerik yüklenemedi');
            setTefsirContent(null);
        }

        setIsLoadingContent(false);
    }, [currentAyah, activeTab, selectedTefsirProvider]);

    useEffect(() => {
        if (activeTab === 'tefsir') {
            fetchTefsir();
        }
    }, [activeTab, currentAyah?.id, selectedTefsirProvider]);

    // Auto-expand when ayah is selected
    useEffect(() => {
        if (currentAyah && !isExpanded) {
            // Optionally auto-expand - commented out for now
            // setExpanded(true);
        }
    }, [currentAyah]);

    if (!isVisible) return null;

    const tefsirProviders = getAvailableProviders('tefsir');

    // Render content based on active tab
    const renderContent = () => {
        if (!currentAyah) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm">Görüntülemek için bir ayet seçin</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'meal':
                return (
                    <div className="space-y-4">
                        {/* Ayah Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-bold rounded-md bg-primary/10 text-primary">
                                {currentAyah.surah_id}:{currentAyah.ayah_number}
                            </span>
                            {surahName && (
                                <span className="text-sm text-muted-foreground">{surahName}</span>
                            )}
                        </div>

                        {/* Arabic Text */}
                        <p
                            className="text-xl leading-loose text-right font-arabic"
                            dir="rtl"
                            style={{ fontFamily: arabicFont }}
                        >
                            {currentAyah.text_arabic}
                        </p>

                        {/* Translation */}
                        <div className="pt-4 border-t border-border/50">
                            <p className="text-base leading-relaxed text-foreground">
                                {currentAyah.text_meal}
                            </p>
                        </div>
                    </div>
                );

            case 'tefsir':
                return (
                    <div className="space-y-4">
                        {/* Provider Selector */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs font-bold rounded-md bg-primary/10 text-primary">
                                    {currentAyah.surah_id}:{currentAyah.ayah_number}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowProviderSelect(!showProviderSelect)}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80"
                            >
                                <Settings2 className="w-3 h-3" />
                                Kaynak
                            </button>
                        </div>

                        {/* Provider Selection Modal */}
                        {showProviderSelect && (
                            <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Tefsir Kaynağı Seçin</p>
                                <div className="space-y-2">
                                    {tefsirProviders.map((provider) => (
                                        <ProviderOption
                                            key={provider.id}
                                            provider={provider}
                                            isSelected={selectedTefsirProvider === provider.id}
                                            isDownloaded={isProviderDownloaded(provider.id)}
                                            onSelect={() => {
                                                setTefsirProvider(provider.id);
                                                setShowProviderSelect(false);
                                            }}
                                            onDownload={() => downloadProvider(provider.id)}
                                            downloadProgress={
                                                downloadProgress?.providerId === provider.id ? downloadProgress : null
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tefsir Content */}
                        {isLoadingContent ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="ml-2 text-sm text-muted-foreground">Yükleniyor...</span>
                            </div>
                        ) : contentError ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <p className="text-sm">{contentError}</p>
                                <p className="text-xs mt-2">
                                    Bu tefsir henüz yapılandırılmamış veya API bağlantısı gerekli.
                                </p>
                            </div>
                        ) : tefsirContent ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-base leading-relaxed">{tefsirContent.text}</p>
                                {tefsirContent.references && tefsirContent.references.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Referanslar:</p>
                                        <ul className="text-xs text-muted-foreground">
                                            {tefsirContent.references.map((ref, i) => (
                                                <li key={i}>{ref}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Book className="w-10 h-10 mb-3 opacity-50" />
                                <p className="text-sm">Tefsir içeriği hazırlanıyor</p>
                                <p className="text-xs mt-1">Yakında eklenecek</p>
                            </div>
                        )}
                    </div>
                );

            case 'related':
                return (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Link2 className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-sm">İlgili ayetler özelliği</p>
                        <p className="text-xs mt-1">Yakında AI destekli olarak eklenecek</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div
            className={`
        fixed bottom-0 left-0 right-0 z-40
        bg-card/95 backdrop-blur-md border-t border-border/50
        shadow-lg transition-all duration-300 ease-out
        ${isExpanded ? 'h-[60vh] md:h-[50vh]' : 'h-14'}
      `}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            {/* Header / Toggle Bar */}
            <button
                onClick={toggleExpanded}
                className="w-full h-14 flex items-center justify-between px-4 hover:bg-accent/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {/* Drag indicator */}
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />

                    {/* Current ayah indicator */}
                    {currentAyah && (
                        <span className="text-sm font-medium text-foreground">
                            {currentAyah.surah_id}:{currentAyah.ayah_number}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {isExpanded ? 'Daralt' : 'Genişlet'}
                    </span>
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="h-[calc(100%-3.5rem)] flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-border/50 px-4">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium
                  border-b-2 transition-colors -mb-px
                  ${activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }
                `}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.labelTr}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {renderContent()}
                    </div>
                </div>
            )}
        </div>
    );
};

// Provider Option Component
interface ProviderOptionProps {
    provider: ContentProvider;
    isSelected: boolean;
    isDownloaded: boolean;
    onSelect: () => void;
    onDownload: () => void;
    downloadProgress: { downloaded: number; status: string } | null;
}

const ProviderOption: React.FC<ProviderOptionProps> = ({
    provider,
    isSelected,
    isDownloaded,
    onSelect,
    onDownload,
    downloadProgress,
}) => {
    const isDownloading = downloadProgress?.status === 'downloading';

    return (
        <div
            className={`
        flex items-center justify-between p-2 rounded-lg cursor-pointer
        ${isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary'}
      `}
            onClick={() => isDownloaded && onSelect()}
        >
            <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{provider.name}</p>
                {provider.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
                )}
                {provider.size && !isDownloaded && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {(provider.size / (1024 * 1024)).toFixed(0)} MB
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 ml-2">
                {isDownloading ? (
                    <div className="flex items-center gap-1">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs text-primary">{downloadProgress?.downloaded}%</span>
                    </div>
                ) : isDownloaded ? (
                    <Check className="w-4 h-4 text-green-500" />
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDownload();
                        }}
                        className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ContentPanel;
