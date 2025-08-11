import {FIREBASE_BUCKET_SCRAPE} from "../constant";
import {normalizeKey, proxy} from "../libs/utils";
import {fetchJson} from "../libs/fetch";
import {getPromptCountry, getPromptLang} from "../conf/Prompt";
import {cache} from "../libs/cache";
import { Config, onConfigChange, ScrapeConfig } from "../Config";

const SERPAPI_ENDPOINT = "https://api.serpapi.com/search";

const ENGINE_GOOGLE                 = "google";
const ENGINE_GOOGLE_IMAGES          = "google_images";
const ENGINE_GOOGLE_AUTOCOMPLETE    = "google_autocomplete";
const ENGINE_GOOGLE_TRENDS          = "google_trends";
const ENGINE_GOOGLE_MAPS            = "google_maps";

const SEARCH_QUERY = {
    q: null,                        //required
}

const nameCountry   = getPromptCountry();
const codeCountry   = getPromptCountry(true);
const codeLang      = getPromptLang(true);

const SERPAPI_PARAMS = {
    engine: null,                   //required:
                                    // Set parameter to google to use the Google API engine.
    device: null,                   // Parameter defines the device to use to get the results.
                                    // It can be set to desktop (default) to use a regular browser,
                                    // tablet to use a tablet browser (currently using iPads),
                                    // or mobile to use a mobile browser (currently using iPhones).
    no_cache: false,                // Parameter will force SerpApi to fetch the Google results even if a cached version is already present.
                                    // A cache is served only if the query and all parameters are exactly the same.
                                    // Cache expires after 1h. Cached searches are free, and are not counted towards your searches per month.
                                    // It can be set to false (default) to allow results from the cache, or true to disallow results from the cache.
                                    // no_cache and async parameters should not be used together.
    async: false,                   // Parameter defines the way you want to submit your search to SerpApi.
                                    // It can be set to false (default) to open an HTTP connection and keep it open until you got your search results,
                                    // or true to just submit your search to SerpApi and retrieve them later.
                                    // In this case, you'll need to use our Searches Archive API to retrieve your results.
                                    // async and no_cache parameters should not be used together.
                                    // async should not be used on accounts with Ludicrous Speed enabled.
    output: "json",                 // Parameter defines the final output you want.
                                    // It can be set to json (default) to get a structured JSON of the results,
                                    // or html to get the raw html retrieved.
};
const GEOGRAPHIC_LOCATION = {
    location: nameCountry,          // Parameter defines from where you want the search to originate.
                                    // If several locations match the location requested,
                                    // we'll pick the most popular one.
                                    // Head to the /locations.json API if you need more precise control.
                                    // The location and uule parameters can't be used together.
                                    // It is recommended to specify location at the city level in order to simulate a real user’s search.
                                    // If location is omitted, the search may take on the location of the proxy.
    uule: null,                     // Parameter is the Google encoded location you want to use for the search.
}
const GEOGRAPHIC_LOCATION2 = {
    geo: nameCountry,               //Parameter defines the location from where you want the search to originate.
                                    // It defaults to Worldwide (activated when the value of geo parameter is not set or empty).
                                    // Head to the Google Trends Locations for a full list of supported Google Trends locations.
    region: null,                   //Parameter is used for getting more specific results when using
                                    // "Compared breakdown by region" and "Interest by region" data_type charts.
                                    // Other data_type charts do not accept region parameter.
                                    // The default value depends on the geo location that is set.
                                    // Available options:
                                    //  COUNTRY - Country
                                    //  REGION - Subregion
                                    //  DMA - Metro
                                    //  CITY - City
                                    //  Not all region options will return results for every geo location.
}
const LOCALIZATION = {
    google_domain: "google.com",    // Parameter defines the Google domain to use.
                                    // It defaults to google.com. Head to the Google domains page for a full list of supported Google domains.
    gl: codeCountry.toLowerCase(),  // Parameter defines the country to use for the Google search.
                                    // It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France).
                                    // Head to the Google countries page for a full list of supported Google countries.
    hl: codeLang,                       // Parameter defines the language to use for the Google search.
                                    // It's a two-letter language code. (e.g., en for English, es for Spanish, or fr for French).
                                    // Head to the Google languages page for a full list of supported Google languages.
    cr: "country" + codeCountry,                // Parameter defines one or multiple countries to limit the search to.
                                    // It uses country{two-letter upper-case country code} to specify countries and | as a delimiter.
                                    // (e.g., countryFR|countryDE will only search French and German pages).
                                    // Head to the Google cr countries page for a full list of supported countries.
    lr: "lang_" + codeLang,         // Parameter defines one or multiple languages to limit the search to.
                                    // It uses lang_{two-letter language code} to specify languages and | as a delimiter.
                                    // (e.g., lang_fr|lang_de will only search French and German pages).
                                    // Head to the Google lr languages page for a full list of supported languages.
}

const ADVANCED = {
    tbs: null,                      // (to be searched) parameter defines advanced search parameters that aren't possible in the regular query field.
                                    // (e.g., advanced search for patents, dates, news, videos, images, apps, or text contents).
    safe: "active",                 // Parameter defines the level of filtering for adult content.
                                    // It can be set to active or off, by default Google will blur explicit content.
    nfpr: 0,                        // Parameter defines the exclusion of results from an auto-corrected query that is spelled wrong.
                                    // It can be set to 1 to exclude these results, or 0 to include them (default).
    filter: 1,                      // Parameter defines if the filters for 'Similar Results' and 'Omitted Results' are on or off.
                                    // It can be set to 1 (default) to enable these filters, or 0 to disable these filters.
}

const SEARCH_BY_ENGINE = {
    [ENGINE_GOOGLE]: {
        ...SERPAPI_PARAMS,
        ...GEOGRAPHIC_LOCATION,
        ...LOCALIZATION,
        ...ADVANCED,
        ...SEARCH_QUERY,
        engine: ENGINE_GOOGLE,          //required
        ludocid: null,                  // Parameter defines the id (CID) of the Google My Business listing you want to scrape.
                                        // Also known as Google Place ID.
        lsig: null,                     // Parameter that you might have to use to force the knowledge graph map view to show up.
                                        // You can find the lsig ID by using our Local Pack API or Google Local API.
                                        // lsig ID is also available via a redirect Google uses within Google My Business.
        kgmid: null,                    // Parameter defines the id (KGMID) of the Google Knowledge Graph listing you want to scrape.
                                        // Also known as Google Knowledge Graph ID.
                                        // Searches with kgmid parameter will return results for the originally encrypted search parameters.
                                        // For some searches, kgmid may override all other parameters except start, and num parameters.
        si: null,                       // Parameter defines the cached search parameters of the Google Search you want to scrape.
                                        // Searches with si parameter will return results for the originally encrypted search parameters.
                                        // For some searches, si may override all other parameters except start, and num parameters.
                                        // si can be used to scrape Google Knowledge Graph Tabs.
        tbm: null,                      // (to be matched) parameter defines the type of search you want to do.
                                        // It can be set to:
                                            // (no tbm parameter): regular Google Search,
                                            // isch: Google Images API,
                                            // lcl - Google Local API
                                            // vid: Google Videos API,
                                            // nws: Google News API,
                                            // shop: Google Shopping API,
                                            // pts: Google Patents API,
                                            // or any other Google service.
        start: null,                    // Parameter defines the result offset.
                                        // It skips the given number of results. It's used for pagination.
                                        // (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.).
                                        // Google Local Results only accepts multiples of 20(e.g. 20 for the second page results, 40 for the third page results, etc.) as the start value.
        num: null,                      // Parameter defines the maximum number of results to return.
                                        // (e.g., 10 (default) returns 10 results, 40 returns 40 results, and 100 returns 100 results).

    },
    [ENGINE_GOOGLE_IMAGES]: {
        ...SERPAPI_PARAMS,
        ...GEOGRAPHIC_LOCATION,
        ...LOCALIZATION,
        ...ADVANCED,
        ...SEARCH_QUERY,
        engine: ENGINE_GOOGLE_IMAGES,   //required
        chips: null,                    //Parameter enables to filter image search.
                                        // It's a string provided by Google as suggested search,
                                        // like: red apple. Chips are provided under the section: suggested_searches when ijn = 0.
                                        // Both chips value and link to SerpApi is provided for each suggested search.
        ijn: null,                      // Parameter defines the page number for Google Images.
                                        // There are 100 images per page. This parameter is equivalent to start (offset) = ijn * 100.
    },
    [ENGINE_GOOGLE_AUTOCOMPLETE]: {
        ...SERPAPI_PARAMS,
        ...LOCALIZATION,
        ...SEARCH_QUERY,
        engine: ENGINE_GOOGLE_AUTOCOMPLETE,   //required
        cp: null,                       //Cursor pointer defines the position of cursor for the query provided,
                                        // position starts from 0 which is a case where cursor is placed before the query |query.
                                        // If not provided acts as cursor is placed in the end of query query|.
        client: null,                   // Parameter used to define client for autocomplete. List of supported clients.
    },
    [ENGINE_GOOGLE_TRENDS]: {
        ...SERPAPI_PARAMS,
        ...GEOGRAPHIC_LOCATION2,
        ...SEARCH_QUERY,
        engine: ENGINE_GOOGLE_TRENDS,   //required
        data_type: null,                //Parameter defines the type of search you want to do. Available options:
                                        //    TIMESERIES - Interest over time (default) - Accepts both single and multiple queries per search.
                                        //    GEO_MAP - Compared breakdown by region - Accepts only multiple queries per search.
                                        //    GEO_MAP_0 - Interest by region - Accepts only single query per search.
                                        //    RELATED_TOPICS - Related topics - Accepts only single query per search.
                                        //    RELATED_QUERIES - Related queries - Accepts only single query per search.
        tz: null,                       //Parameter is used to define a time zone.
                                        //The default value is set to 420 (Pacific Day Time(PDT): -07:00).
                                        //Value is shown in minutes and can span from -1439 to 1439.
                                        //  tz can be calculated using the time difference between UTC +0 and desired timezone.
                                        //  Example: 60 x ((Time in UTC+0 Now) - (Time in PDT Now)) = 420 will give results for PDT now.
                                        //  Because the reference point is UTC+0, the positive time zones will result in negative tz whereas negative time zones will result in positive tz.
                                        //  tz parameter also affects timestamps in response.
        cat: null,                      // Parameter is used to define a search category.
                                        // The default value is set to 0 ("All categories").
                                        // Head to the Google Trends Categories for a full list of supported Google Trends Categories.
        gprop: null,                    //Parameter is used for sorting results by property.
                                        //The default property is set to Web Search (activated when the value of gprop parameter is not set or empty).
                                        //Other available options:
                                        //  images - Image Search
                                        //  news - News Search
                                        //  froogle - Google Shopping
                                        //  youtube - YouTube Search
        date: null,                     // Parameter is used to define a date. Available options:
                                        //        now 1-H - Past hour
                                        //        now 4-H - Past 4 hours
                                        //        now 1-d - Past day
                                        //        now 7-d - Past 7 days
                                        //        today 1-m - Past 30 days
                                        //        today 3-m - Past 90 days
                                        //        today 12-m - Past 12 months
                                        //        today 5-y - Past 5 years
                                        //        all - 2004 - present
                                        //        You can also pass custom values:
                                        //Dates from 2004 to present: yyyy-mm-dd yyyy-mm-dd (e.g. 2021-10-15 2022-05-25)
                                        //Dates with hours within a week range: yyyy-mm-ddThh yyyy-mm-ddThh (e.g. 2022-05-19T10 2022-05-24T22). Hours will be calculated depending on the tz (time zone) parameter.
        csv: null,                      //Parameter is used for retrieving the CSV results.
                                        //Set the parameter to true to retrieve CSV results as an array.
    },
    [ENGINE_GOOGLE_MAPS]: { //todo da verificare
        ...SERPAPI_PARAMS,
        ...GEOGRAPHIC_LOCATION,
        ...LOCALIZATION,
        ...ADVANCED,
        ...SEARCH_QUERY,
        engine: ENGINE_GOOGLE_MAPS,   //required
    },
};


let config: ScrapeConfig | undefined = undefined;
onConfigChange((newConfig: Config) => {
    config = newConfig.scrape;
});

let API_KEY_INDEX = 0;
function getSerpApikey(next = false) {
    const apis = config?.serpApiKey?.split(",");
    if (!apis) return null;

    if (next) {
        API_KEY_INDEX++;
    }

    return (API_KEY_INDEX < apis.length
        ? apis[API_KEY_INDEX]
        : null
    );
}

function removeNullProperties(obj: Record<string, any>): Record<string, any> {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
        if (obj[key] !== null) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}

const fetchSerpApi = async (search: string, engine: string) => {
    const getRequest = (apiKey: string) => {
        const query = removeNullProperties({
            ...(SEARCH_BY_ENGINE as any)[engine],
            api_key: apiKey,
            q: search,
        });
        console.log(SERPAPI_ENDPOINT, query);
        const params = new URLSearchParams(query);
        const url = `${SERPAPI_ENDPOINT}?${params}`;

        return proxy(url);
    }

    let apiKey = getSerpApikey();
    while (apiKey) {
        try {
            return await fetchJson(getRequest(apiKey));
        } catch (error) {
            console.error(`SerpApi: invalid api key: ${apiKey}`, error);
            apiKey = getSerpApikey(true);
        }
    }

    return null;
};



const callSerpApi = async (search: string, strategy: string, {caller = null, storePaths = []}: {caller?: any, storePaths?: string[]} = {}) => {
    return await cache(
        search, strategy,
        {
            callLabel: "Serp Api",
            callKey: normalizeKey(search),
            callBasePath: FIREBASE_BUCKET_SCRAPE,
            callService: "serpApi",
            callFunc: fetchSerpApi,
            callOptions: {}
        },
        caller, storePaths
    );
}

const fetchScrape = (caller: any = null, storePaths: string[] = []) => {
    return {
        googleSearch: async (search: string) => {
            return await callSerpApi(search, ENGINE_GOOGLE, {caller, storePaths});
        },
        googleImages: async (search: string) => {
            return await callSerpApi(search, ENGINE_GOOGLE_IMAGES, {caller, storePaths});
        },
        googleAutocomplete: async (search: string) => {
            return await callSerpApi(search, ENGINE_GOOGLE_AUTOCOMPLETE, {caller, storePaths});
        },
        googleTrends: async (search: string) => {
            return await callSerpApi(search, ENGINE_GOOGLE_TRENDS, {caller, storePaths});
        },
        googleMaps: async (search: string) => {
            return await callSerpApi(search, ENGINE_GOOGLE_MAPS, {caller, storePaths});
        },
    }
}

export default fetchScrape;