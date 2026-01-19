// Google Drive Turkish Reciters
// These reciters use Google Drive hosting with per-file IDs

export interface GoogleDriveReciter {
    id: string;
    name: string;
    nameLocal: string;
    country: string;
    style: 'Murattal' | 'Mujawwad';
    // Map of surah number -> Google Drive file ID
    surahFileIds: Record<number, string>;
}

// Helper function to get audio URL from Google Drive file ID
export function getGoogleDriveAudioUrl(fileId: string): string {
    return `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
}

// Turkish Reciters from Google Drive
export const GOOGLE_DRIVE_RECITERS: GoogleDriveReciter[] = [
    {
        id: 'davut-kaya',
        name: 'Davut Kaya',
        nameLocal: 'Davut Kaya',
        country: '🇹🇷',
        style: 'Murattal',
        surahFileIds: {
            1: '1eTJ-i0SSYKf1X3dUI4ZV3oRT4y5mVuEU',
            2: '1ZtKV9Mw7ks2OavecGJ6bz3EfBL5ZAf9g',
            3: '1fFWvMVh5BkJ283jYlVCPVRBY3A8vGXBl',
            4: '1cWwm3LMXWwBUdriPTcrZaPz7615u4Tzk',
            5: '1V1I9pEDl4RMTNtz7UCnb1UHNxoQ7UW50',
            6: '1Z1m97R8WOMFn43oAqJR673NwEtBunvIu',
            7: '15vE5xQGyCx62iLyo2VrZynEK7x8JyuKh',
            8: '1yzjXVsLao64eGG0sWSX8xcKsvkFnqOMP',
            9: '1eGnwj_exH6MEb6H9enYtJyIJDd-lWNCe',
            10: '1OzEmcglElDCiajmwASIEWlONWTmzLxkW',
            11: '12TFoG5XinIBWp-TWexiOJX5nvH9tgSvb',
            12: '1Ey6LqJb8nu1UA-wF6EHSV8iHT61VgMTr',
            13: '1HeihPHzoec8usfYYh0_NFQroFOFKZ2Zl',
            14: '1-svxPpmFf9b8IztaGzw1hqkXXBlDyAde',
            15: '1skxAI-eGGaG7RzNAerhKv4x0yARKsrpj',
            16: '1VaF27deVkHiAc_lELZ-WQ1t7SqJHeImY',
            17: '1b8mSBEPzE6BXpOKzh4EQOxYcYr0HkYzI',
            18: '1cQREpCRuutCfmGa_vT77U_ASJbC8ihSg',
            19: '1OoBMe54GCSWUOIilEIktqow_43Spg6R-',
            20: '1g-z3-4vJjTdwr5xaDCSoOECkSIQs2Ufi',
            21: '1YL-HagTAmKKwh-HISh4kRR1MzRsT978J',
            22: '1RauT99HFTETyEk7LJgH5zwZ8XaNwdJb9',
            23: '1qTp6qWnb9pn9d7UasOXvGOQZWJTZMbrD',
            24: '1fzZ5icq4ebm4natGaxM5uhI0GT6VM4bS',
            25: '1zEY4BCy6OimO3IcBJyj36PcLjK80R9sR',
            26: '1_rYBkPYfFOE8SEngNGAP6HiH5m2JbgAV',
            27: '1t5-twu3t0HP7o1aGR3RGFVWdE9ATsCog',
            28: '1tiV-iLdt_KO5Vf0BDe15Q9N7V51ZErU_',
            29: '14nS_ySTtWG3RcF5-uT3pYkpspVcluCHN',
            30: '19Tl_RtIwhUmkRap0JN3lCUW2fdx4zkti',
            31: '1r_sr6R01-79BXyryqiudOZNttlU5-Qh0',
            32: '1-ezb-Iw_2nX_2qou6tNzlCwdc-6599NA',
            33: '1mpFEkMyH1k15IcdMlRp9-EdN3Ra6gsq5',
            34: '1Vsh1FexkVZ7n3eAtck1oAF_raXtDM2if',
            35: '1_j4F7vDFEqigbcm1aJluTduiBBC96MQQ',
            36: '1gsRf3b2qsJrTS_x-kxhkvS6mTQLspWq1',
            37: '1dq-TASso7IVyYslWh8ueWPZ46TyVv73b',
            38: '1DQTW3dUliMzhhw3pmne2Dfe1CHAdWXsT',
            39: '1QDxyIuJVyzbNzr26OCc-cG4vV4sUJ0cn',
            40: '1gSE8t-TtXTVP6B7ttmColqLNn9_EU6no',
            41: '1PXZeFyxS3plOdrUeiInXesr59ZE4jQUk',
            42: '19taRX9czD4UTSHl1yRM94AJiL6nyRy2W',
            43: '1a2G_32bph53x1HqST9W6UPaet4gFr1eG',
            44: '1bI_QGUrSsK6gqUzW9sIF2vjg9eT4qtub',
            45: '1RCoRwuJhmvM1-f1iEAvXe2NIYS8TSv7m',
            46: '1eVcqa-hej_YbOSnMh5cAAtpHz8gumESg',
            47: '1EOzSj1aDINE-tk9rlIdVwkE8XFjcl4E3',
            48: '11Xlca4hfsZumuF7wRZLTtUWlHEr11JA7',
            49: '1Z5H4jE27agMTjwUtZR0EXQXAWqa0N4eq',
            50: '1Ce39QkIiOSBFVB8vQcReDsF1kmXMGcIa',
            51: '1QLX6HkMXGR6ZbuTIueGJcT_Mgm4FLeAG',
            52: '1_wLqnT5uvcWinlyllIfr7DBA3dpyhJZw',
            53: '17niOusfoTGLVp9Cl5dt656HK5K7n5Ffu',
            54: '159br6whw5M_JCnbOy2HqbskbTtP2Gsy1',
            55: '18RjVLO4f7JPigPijZpoCPePSal_Er68j',
            56: '1qWmyvO0Xm7Wls5cytt1V05uLilc0AxIk',
            57: '1hkoAVpCIvoV7zfL21huOUfkOH3KwzIOP',
            58: '18q-HYt4eT6Uynfc1_h9tYLsFBCR2eZMp',
            59: '1Xv8zoH_oocoWIOe4kDy5XulFnMmvrRk6',
            60: '1CMEQPTAQtZfsePUeLtuVK7NDG4KuIKHZ',
            61: '1_MIn-TGP30-1gBgmI_33maa2UfyOtKCC',
            62: '1DFkxnzy1I0ILHQy7FNuqY4oR4PvrmUGN',
            63: '1ktbZCdeiy_tnI5Pj2azGmkwFurqQ7Svr',
            64: '1BeQqbZYel3GFDTYmFUXq5CnKkS-lGN7w',
            65: '1f9FAmDasm11WqlDCfImiggkHwKC6PpVR',
            66: '1ZXDZcRl86pdKoVqeUPbxS7sg9pN1M5Sz',
            67: '1pYpv57AItvHzTlxwRbp1rGU-9_oFIBTD',
            68: '1xrvx4S0nKu39-ZPjC-xAlNUoT9JsvLWT',
            69: '1L1E74L-fh-zMa4wJR1wp71PJ2Yfutr2e',
            70: '1KN-8Zv4CQUd22RPnWpWOkSek_PvCP6sB',
            71: '1t11gebp5jDsBVwB-YEeaGOkf8KCxRjsQ',
            72: '1fZS_BIM93iRcXnbB5Z4TYTdwJswwioPf',
            73: '1CyNNZiGYwiL54nvuxELp_oiFt8EyZXPt',
            74: '17EL-XA_nL1rhRgCMhQ6zAaoD7sdB1po0',
            75: '1zWx_By5JTMRQd9I_1LwaxImrLQfC42XQ',
            76: '1TYHGj3sdGK4w32H7XLwyRsa-Ykmvl5o7',
            77: '1BFcozWCobOGH27qZpRlEiqVMEezpf6rF',
            78: '1h6-hExFjuuWkrNKTRlxgzs_BG4hYyPm_',
            79: '1_CCpiStsvAHkOV_yjU2pJFBFNfwt2j9K',
            80: '1XgRjzw-u6WC_O_1WAqMrQu4mOQQ2YqXX',
            81: '18iFHYOeFDEz9-L_fA876yKMXndxOVpVH',
            82: '153U2n4CcaSf-P_3fDsCoGFA-kV13b0Ez',
            83: '1gXVfse1D6CXZqLBI0aeTqBrDHtCxTt7J',
            84: '1aSPVgB16xxOGJNWpYiBSqOS9D7ouIddV',
            85: '16SLsVym2XGFtggvaAO49n7VLniP-7fFO',
            86: '1d5LO0lk2HnFMGFtBbc7c0xcLYfIktecx',
            87: '1KqBfMaqesgg9WQAYMFeeuE9UCU_2kHRv',
            88: '1YXU4EA2dTi2wfdXt0maBhYgNR_qDb0OB',
            89: '1YONnh0SnA2Vngk1nXYjla15HjN5Q6Ji0',
            90: '1rSIUS_x4Pbkoz1Tl8iPVo60tuAqLG2fe',
            91: '1Wd7qCzxQ8Ke4Tk770dZNcpRx3qEipb1D',
            92: '1tb82y_mAGqF-jLZs3Qybtr8buqeYFo_U',
            93: '1GGNK8JjJW90TmP18qzuzmZrbX6gwvoHa',
            94: '1B37CAaQQ4nPtG9TcG1Pixx-Kt6Mvesrg',
            95: '1KOz00znX25P6JTvwpKayH4NqY1cU5k-1',
            96: '1mvqodpMK5v-pw-hLO1C0lv9aq7ywh-X0',
            97: '17gf1MBxHfiWqNXgedw3Ny2dt5tZmZf05',
            98: '177W7H13UXNhvmbnTEDbfxzpEHhPz66w3',
            99: '1DXEU3bhI89DkjpSjsd_k1P0K7u-YZtW-',
            100: '17HtjYyqUjhm4XIeRz-eLmBvlJY-I_FIL',
            101: '1D9AM-OZpj8VkGOrS3KonO0OxjbwNC402',
            102: '19dbREzK3L6BjNjcYZNj9qIKBO05a4VTc',
            103: '1SzNpVPmas2a3A23JzIL1yodOQRkCrw9a',
            104: '1v2EOGoSyk4XdkNvWmWA_h0ZNv4-NkiWR',
            105: '1_YJBeUYZCcsLG9TYbWnc1iymuJSoawBM',
            106: '1aXlEWE8Z5yYG__uN5fIJMJqpXuy4UXiv',
            107: '11iKcdEw9-cvgfQ1sraLY4q43XkG6y9I2',
            108: '1ZUgh77Vg5hOQMEbgzfLvrgL0TqHSXaO2',
            109: '1okLGZEazOcoFUKggbQCBdoP2a6lQrQuF',
            110: '1Bykz-tOzYVeo0mOkHMxuaxNcd9sqqDI4',
            111: '18pSU6JEJOmp7JmHEdD8cAiwsjP0svAhF',
            112: '1QXlbSimhD-LokjozVm2l2iDxzC8G2STv',
            113: '1IZuJoqdthDep_VFOA4vJDcIja5IglQx1',
            114: '1Z1JZFYMlwSgtYeO_Ly8Nn0d5QnGngUTu',
        },
    },
    // Placeholder for other reciters - will be filled as we extract their IDs
    {
        id: 'ismail-bicer-gdrive',
        name: 'İsmail Biçer',
        nameLocal: 'İsmail Biçer',
        country: '🇹🇷',
        style: 'Murattal',
        surahFileIds: {},
    },
    {
        id: 'kani-karaca-gdrive',
        name: 'Kani Karaca',
        nameLocal: 'Kani Karaca',
        country: '🇹🇷',
        style: 'Mujawwad',
        surahFileIds: {},
    },
    {
        id: 'ilhan-tok-gdrive',
        name: 'İlhan Tok',
        nameLocal: 'İlhan Tok',
        country: '🇹🇷',
        style: 'Murattal',
        surahFileIds: {},
    },
    {
        id: 'hasan-huseyin-varol-gdrive',
        name: 'Hasan Hüseyin Varol',
        nameLocal: 'Hasan Hüseyin Varol',
        country: '🇹🇷',
        style: 'Murattal',
        surahFileIds: {},
    },
    {
        id: 'tayyar-altikulac-gdrive',
        name: 'Tayyar Altıkulaç',
        nameLocal: 'Tayyar Altıkulaç',
        country: '🇹🇷',
        style: 'Murattal',
        surahFileIds: {},
    },
];

/**
 * Get reciter by ID
 */
export function getGoogleDriveReciterById(id: string): GoogleDriveReciter | undefined {
    return GOOGLE_DRIVE_RECITERS.find(r => r.id === id);
}

/**
 * Check if a Google Drive reciter has a specific surah
 */
export function hasSurah(reciter: GoogleDriveReciter, surahNumber: number): boolean {
    return surahNumber in reciter.surahFileIds;
}

/**
 * Get audio URL for a specific surah from Google Drive reciter
 * Note: Google Drive reciters have full surah audio, not individual ayahs
 */
export function getGoogleDriveSurahAudioUrl(
    reciter: GoogleDriveReciter,
    surahNumber: number
): string | null {
    const fileId = reciter.surahFileIds[surahNumber];
    if (!fileId) return null;
    return getGoogleDriveAudioUrl(fileId);
}

/**
 * Get all available Google Drive reciters (those with at least 1 surah)
 */
export function getAvailableGoogleDriveReciters(): GoogleDriveReciter[] {
    return GOOGLE_DRIVE_RECITERS.filter(r => Object.keys(r.surahFileIds).length > 0);
}
