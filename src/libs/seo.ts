import {getKeywordIdeas} from "../integrations/google/keyword";
import {getGoogleTrendsData} from "../integrations/google/trend";

const seo = {
    keyword: getKeywordIdeas,
    trend: getGoogleTrendsData,
    serp: null
}

export default seo;