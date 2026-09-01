import React, { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { arabicFontStack } from '../utils/arabicFont';

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (content: string) => void;
    initialContent: string;
    surahName: string;
    surahId: number;
    ayahNumber: number;
    ayahText: string;
}

export const NoteModal: React.FC<NoteModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialContent,
    surahName,
    surahId,
    ayahNumber,
    ayahText
}) => {
    const { arabicFont } = useSettingsStore();
    const [content, setContent] = useState(initialContent);

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold">Not Ekle</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Ayah Reference */}
                <div className="p-4 bg-secondary/30 border-b border-border">
                    <p className="text-sm text-muted-foreground mb-1">{surahName} {surahId}:{ayahNumber}</p>
                    <p
                        className="font-arabic text-right text-lg leading-relaxed line-clamp-2"
                        dir="rtl"
                        style={{ fontFamily: arabicFontStack(arabicFont) }}
                    >
                        {ayahText}
                    </p>
                </div>

                {/* Note Input */}
                <div className="p-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Bu ayet hakkında notunuzu yazın..."
                        className="w-full p-3 bg-secondary rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                        autoFocus
                    />
                </div>

                {/* Modal Footer */}
                <div className="flex gap-2 p-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 text-sm text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={() => onSave(content)}
                        disabled={!content.trim()}
                        className="flex-1 py-2 px-4 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
};
