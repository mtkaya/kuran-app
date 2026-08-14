// Transliteration Provider
//
// Two sources, chosen by the reading language:
//   - a full corpus fetched from the Açık Kuran API (see
//     scripts/fetch-transliteration.mjs), Turkish reading for `tr` and the
//     Latin reading for every other language;
//   - the small built-in sample below, used until that corpus is present.
//
// The corpus is loaded on demand so the language files stay out of the initial
// bundle; callers await ensureTransliteration() once, then read synchronously.

const transliterationData: Record<number, Record<number, string>> = {
    // Surah 1 - Fatiha
    1: {
        1: "Bismillâhirrahmânirrahîm",
        2: "Elhamdü lillâhi rabbil'âlemîn",
        3: "Errahmânirrahîm",
        4: "Mâliki yevmiddîn",
        5: "İyyâke na'büdü ve iyyâke neste'în",
        6: "İhdinessırâtalmüstekîm",
        7: "Sırâtallezîne en'amte aleyhim ğayrilmağdûbi aleyhim veleddâllîn",
    },
    // Surah 2 - Bakara (first 5 ayahs)
    2: {
        1: "Elif lâm mîm",
        2: "Zâlikel kitâbü lâ raybe fîh, hüden lil müttekîn",
        3: "Ellezîne yü'minûne bil ğaybi ve yükîmûnessalâte ve mimmâ razaknâhüm yünfikûn",
        4: "Vellezîne yü'minûne bimâ ünzile ileyke vemâ ünzile min kablik ve bil'âhireti hüm yûkınûn",
        5: "Ülâike alâ hüden min rabbihim ve ülâike hümül müflihûn",
    },
    // Surah 36 - Yasin (first 5 ayahs)
    36: {
        1: "Yâ sîn",
        2: "Vel kur'ânil hakîm",
        3: "İnneke leminel mürselîn",
        4: "Alâ sırâtim müstekîm",
        5: "Tenzîlel azîzirrahîm",
    },
    // Surah 55 - Rahman (first 13 ayahs)
    55: {
        1: "Errahmân",
        2: "Allemel kur'ân",
        3: "Halekal insân",
        4: "Allemehül beyân",
        5: "Eşşemsü vel kameru bihüsbân",
        6: "Vennecmü veşşeceru yescüdân",
        7: "Vessemâe rafeahâ ve vedaal mîzân",
        8: "Ellâ tatğav fil mîzân",
        9: "Ve ekîmül vezne bil kıstı ve lâ tuhsirul mîzân",
        10: "Vel arda vedaahâ lil enâm",
        11: "Fîhâ fâkihetün vennahl zâtül ekmâm",
        12: "Vel habbü zül asfi verreyhân",
        13: "Febieyyi âlâi rabbikümâ tükezzibân",
    },
    // Surah 112 - Ihlas
    112: {
        1: "Kul hüvallâhü ehad",
        2: "Allâhüssamed",
        3: "Lem yelid ve lem yûled",
        4: "Ve lem yekün lehû küfüven ehad",
    },
    // Surah 113 - Felak
    113: {
        1: "Kul e'ûzü birabbil felak",
        2: "Min şerri mâ halak",
        3: "Ve min şerri ğâsikın izâ vekab",
        4: "Ve min şerrin neffâsâti fil ukad",
        5: "Ve min şerri hâsidin izâ hased",
    },
    // Surah 114 - Nas
    114: {
        1: "Kul e'ûzü birabbinnâs",
        2: "Melikinnâs",
        3: "İlâhinnâs",
        4: "Min şerril vesvâsil hannâs",
        5: "Ellezî yüvesvisü fî sudûrinnâs",
        6: "Minel cinneti vennâs",
    },
};

/**
 * Get transliteration for a specific ayah
 * @param surahId - Surah number (1-114)
 * @param ayahNumber - Ayah number within the surah
 * @returns Transliterated text or null if not available
 */
export type TransliterationCorpus = Record<string, Record<string, string>>;

/** Turkish readers get the Turkish reading; everyone else the Latin one. */
export function corpusVariantFor(language: string): 'tr' | 'en' {
    return language === 'tr' ? 'tr' : 'en';
}

const loadedCorpora: Partial<Record<'tr' | 'en', TransliterationCorpus>> = {};
const inFlight: Partial<Record<'tr' | 'en', Promise<void>>> = {};

/**
 * Load the corpus for a language once. Resolves even when the data files are
 * absent — the built-in sample then remains the only source.
 */
export function ensureTransliteration(language: string): Promise<void> {
    const variant = corpusVariantFor(language);
    if (loadedCorpora[variant]) return Promise.resolve();
    if (inFlight[variant]) return inFlight[variant]!;

    const load = (async () => {
        try {
            const mod = variant === 'tr'
                ? await import('./translit-tr.json')
                : await import('./translit-en.json');
            loadedCorpora[variant] = (mod.default ?? mod) as unknown as TransliterationCorpus;
        } catch {
            // Corpus not bundled yet — fall back to the sample
        }
    })();

    inFlight[variant] = load;
    return load;
}

/**
 * True once a non-empty corpus is available. The JSON files are committed as
 * empty placeholders until scripts/fetch-transliteration.mjs fills them, so
 * presence alone is not enough.
 */
export function hasCorpus(language: string): boolean {
    const corpus = loadedCorpora[corpusVariantFor(language)];
    return Boolean(corpus && Object.keys(corpus).length > 0);
}

export function getTransliteration(
    surahId: number,
    ayahNumber: number,
    language?: string
): string | null {
    if (language) {
        const corpus = loadedCorpora[corpusVariantFor(language)];
        const fromCorpus = corpus?.[String(surahId)]?.[String(ayahNumber)];
        if (fromCorpus) return fromCorpus;
        // Outside Turkish the sample's Turkish reading would be the wrong
        // convention, so do not fall back to it.
        if (corpusVariantFor(language) === 'en') return null;
    }

    const surah = transliterationData[surahId];
    if (!surah) return null;

    return surah[ayahNumber] || null;
}

/**
 * Check if transliteration is available for a surah
 */
export function hasTransliteration(surahId: number): boolean {
    return surahId in transliterationData;
}

/**
 * Get all available surah IDs with transliteration
 */
export function getAvailableSurahIds(): number[] {
    return Object.keys(transliterationData).map(Number);
}
