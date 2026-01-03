import React from 'react';
import { Ayah } from '../types';
import { Share2, Bookmark } from 'lucide-react';

interface AyahViewProps {
    ayah: Ayah;
}

export const AyahView: React.FC<AyahViewProps> = ({ ayah }) => {
    return (
        <div className="py-6 border-b last:border-0 hover:bg-accent/5 transition-colors">

            {/* Arabic Text (Right Aligned) */}
            <div className="text-right mb-4">
                <p className="font-arabic text-3xl leading-loose font-medium" dir="rtl">
                    {ayah.text_arabic}
                    <span className="inline-flex items-center justify-center w-8 h-8 mr-2 text-sm border border-primary rounded-full text-primary number-font">
                        {ayah.ayah_number}
                    </span>
                </p>
            </div>

            {/* Turkish Meal (Left Aligned) */}
            <div className="space-y-2">
                <p className="text-lg text-foreground/90 leading-relaxed font-sans">
                    {ayah.text_meal}
                </p>
            </div>

            {/* Actions (Notes, Share, etc. - Implementation later) */}
            <div className="flex gap-4 mt-4 pt-2">
                <button className="text-muted-foreground hover:text-primary transition-colors">
                    <Bookmark className="w-5 h-5" />
                </button>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
                {/* Placeholder for "Related Verses" trigger */}
                {ayah.related_ayahs && (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                        Bağlantılı Ayetler
                    </span>
                )}
            </div>

        </div>
    );
};
