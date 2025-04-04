// googleTrends.ts

export type TrendPoint = {
    date: string;
    value: number;
};

export type RelatedQuery = {
    query: string;
    value: number;
};

export type GoogleTrendsResponse = {
    keyword: string;
    timeline: TrendPoint[];
};

export type GoogleTrendsRelatedResponse = {
    keyword: string;
    top: RelatedQuery[];
    rising: RelatedQuery[];
};

/**
 * Ottiene i dati storici di trend per una keyword.
 */
export async function getGoogleTrendsData(
    keyword: string,
    geo: string = 'IT',
    timeRange: string = 'today 12-m'
): Promise<GoogleTrendsResponse> {
    const exploreUrl = `https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=${encodeURIComponent(
        JSON.stringify({
            comparisonItem: [{ keyword, geo, time: timeRange }],
            category: 0,
            property: '',
        })
    )}&_=${Date.now()}`;

    const widgetRes = await fetch(exploreUrl);
    const widgetText = await widgetRes.text();
    const widgetData = JSON.parse(widgetText.replace(")]}',", ''));

    const timelineWidget = widgetData.widgets.find((w: any) => w.id === 'TIMESERIES');
    if (!timelineWidget) throw new Error('Timeline widget not found');

    const token = timelineWidget.token;
    const req = timelineWidget.request;

    const timelineUrl = `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=0&req=${encodeURIComponent(
        JSON.stringify(req)
    )}&token=${token}&_=${Date.now()}`;

    const timelineRes = await fetch(timelineUrl);
    const timelineText = await timelineRes.text();
    const timelineData = JSON.parse(timelineText.replace(")]}',", ''));

    const timeline: TrendPoint[] = timelineData.default.timelineData.map((d: any) => ({
        date: d.formattedTime,
        value: d.value[0],
    }));

    return {
        keyword,
        timeline,
    };
}

/**
 * Ottiene query correlate (top e rising) per una keyword.
 */
export async function getGoogleTrendsRelated(
    keyword: string,
    geo: string = 'IT',
    timeRange: string = 'today 12-m'
): Promise<GoogleTrendsRelatedResponse> {
    const exploreUrl = `https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=${encodeURIComponent(
        JSON.stringify({
            comparisonItem: [{ keyword, geo, time: timeRange }],
            category: 0,
            property: '',
        })
    )}&_=${Date.now()}`;

    const widgetRes = await fetch(exploreUrl);
    const widgetText = await widgetRes.text();
    const widgetData = JSON.parse(widgetText.replace(")]}',", ''));

    const relatedWidget = widgetData.widgets.find((w: any) => w.id === 'RELATED_QUERIES');
    if (!relatedWidget) throw new Error('Related queries widget not found');

    const relatedUrl = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=en-US&tz=0&req=${encodeURIComponent(
        JSON.stringify(relatedWidget.request)
    )}&token=${relatedWidget.token}&_=${Date.now()}`;

    const relatedRes = await fetch(relatedUrl);
    const relatedText = await relatedRes.text();
    const relatedData = JSON.parse(relatedText.replace(")]}',", ''));

    const top = relatedData.default.rankedList?.[0]?.rankedKeyword?.map((item: any) => ({
        query: item.query,
        value: item.value,
    })) || [];

    const rising = relatedData.default.rankedList?.[1]?.rankedKeyword?.map((item: any) => ({
        query: item.query,
        value: item.value,
    })) || [];

    return {
        keyword,
        top,
        rising,
    };
}
