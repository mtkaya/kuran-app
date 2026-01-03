// Transliteration Provider - Turkish Latin alphabet transliteration for Quran
// Based on common Quran transliteration standards

// Transliteration for first few ayahs of key surahs (sample data)
// In production, this would be fetched from an API or larger dataset

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
export function getTransliteration(surahId: number, ayahNumber: number): string | null {
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
