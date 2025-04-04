import { Config, GoogleConfig, onConfigChange } from "../../Config";
import { googleGetAccessToken } from "./GoogleAuth";

// ====================
// Config dinamico
// ====================

let config: GoogleConfig | undefined = undefined;
onConfigChange((newConfig: Config) => {
    config = newConfig.google;
});

// ====================
// Costanti di default
// ====================

export const DEFAULT_GEO_TARGET = 'geoTargetConstants/2380';     // Italia
export const DEFAULT_LANGUAGE = 'languageConstants/1000';        // Italiano

// ====================
// Mappatura geoTarget per simboli
// ====================

export const GEO_TARGETS: Record<string, string> = {
    ita: 'geoTargetConstants/2380',       // Italia
    rome: 'geoTargetConstants/1033236',   // Roma
    mil: 'geoTargetConstants/1033239',    // Milano
    nap: 'geoTargetConstants/1033245',    // Napoli
    tor: 'geoTargetConstants/1033247',    // Torino
};

// ====================
// Mappatura language per simboli
// ====================

export const LANGUAGE_TARGETS: Record<string, string> = {
    it: 'languageConstants/1000',   // Italiano (default)
    en: 'languageConstants/1001',   // Inglese
    fr: 'languageConstants/1002',   // Francese
    es: 'languageConstants/1003',   // Spagnolo
    de: 'languageConstants/1005',   // Tedesco
};

// ====================
// Funzioni helper
// ====================

export function getGeoTargetConstant(code: string): string {
    return GEO_TARGETS[code.toLowerCase()] || DEFAULT_GEO_TARGET;
}

export function getLanguageConstant(code: string): string {
    return LANGUAGE_TARGETS[code.toLowerCase()] || DEFAULT_LANGUAGE;
}

// ====================
// Interfaccia per getKeywordIdeas
// ====================

type GetKeywordIdeasParams = {
    keyword: string;
    googleAdsAccountId: string;
    geoCode?: string;
    languageCode?: string;
};

// ====================
// Funzione principale
// ====================

export async function getKeywordIdeas({
                                          keyword,
                                          googleAdsAccountId,
                                          geoCode               = 'ita',
                                          languageCode          = 'it',
                                      }: GetKeywordIdeasParams) {
    if (!config?.developerToken) {
        console.error(`
❌ Google Ads API: developerToken non configurato.

Per ottenere un developerToken segui questi passaggi:

1️⃣ Vai su https://ads.google.com/aw/apicenter
2️⃣ Seleziona o crea un account Google Ads Manager (MCC) se non ne hai uno.
3️⃣ Vai alla sezione "Strumenti e impostazioni" → "Accesso API" (o "API Center").
4️⃣ Clicca su "Richiedi accesso API" se non l’hai ancora fatto.
5️⃣ Copia il valore del tuo Developer Token (è un identificatore simile a: 'ABc123456789xyz').
6️⃣ Inseriscilo nel tuo file di configurazione, nella sezione:
    config.google.developerToken

ℹ️ Attenzione: Inizialmente il token sarà in modalità di test. Per usarlo in produzione, dovrai richiedere l'approvazione da Google Ads.
`);
        return [];
    }

    const accessToken = await googleGetAccessToken([
        'https://www.googleapis.com/auth/adwords',
    ]);

    const geoTarget = getGeoTargetConstant(geoCode);
    const language = getLanguageConstant(languageCode);

    const url = `https://googleads.googleapis.com/v13/customers/${googleAdsAccountId}:generateKeywordIdeas`;

    const body = {
        keywordSeed: {
            keywords: [keyword],
        },
        geoTargetConstants: [geoTarget],
        language,
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': config.developerToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Keyword planner error: ${res.status} – ${err}`);
    }

    const data = await res.json();

    return data.results?.map((item: any) => ({
        keyword: item.text,
        avgMonthlySearches: item.keywordIdeaMetrics?.avgMonthlySearches || 0,
        competition: item.keywordIdeaMetrics?.competition || 'UNSPECIFIED',
        cpc: item.keywordIdeaMetrics?.averageCpc?.micros
            ? item.keywordIdeaMetrics.averageCpc.micros / 1_000_000
            : null,
    })) || [];
}
