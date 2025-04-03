export const FIREBASE_BUCKET_ERRORS     = 'errors';
export const FIREBASE_BUCKET_METAOBJECT = 'metaobject';
export const FIREBASE_BUCKET_DICTIONARY = 'dictionary';
export const FIREBASE_BUCKET_SITEMAP    = 'sitemap';
export const FIREBASE_BUCKET_SITETREE   = 'sitetree';
export const FIREBASE_BUCKET_SERP       = 'serp';
export const FIREBASE_BUCKET_AICHAT     = 'aichat';
export const SEP = '/';
export const DOT = '.';

export const DEFAULT_LANG = 'it';

export const consoleLog = (...args: any[]): void => {
    if (0 && process.env.NODE_ENV === 'development') {
        console.log(...args);
    }
};


export interface PageRawBase {
    path        : string;
    strategy    : string;
    caller      : string;
    relRule     : string;
    relData     : string;
}

export const defaultPageRawBase = {
    path        : "",
    strategy    : "",
    caller      : "",
    relRule     : "",
    relData     : ""
}


interface Image {
    thumbnail: string;
    original: string;
    original_width: number;
    original_height: number;
    alt: string;
}

interface Section {
    title: string;
    paragraph: string[];
    image: Image;
}

export interface Page {
    meta: {
        category: string;
        title: string;
        description: string;
        keyword: string;
        searchIntent: string;
    };
    header: {
        title: string;
        content: string;
    };
    footer: {
        content: {
            title: string;
            paragraph: string[];
        };
    };
    sections: Section[];
    image: Image;
    gallery: {
        title: string;
        description: string;
        slides: Image[];
    };
}

export const defaultPage = {
    meta: {
        category: "",
        title: "",
        description: "",
        keyword: "",
        searchIntent: ""
    },
    header: {
        title: "",
        content: ""
    },
    footer: {
        content: {
            title: "",
            paragraph: []
        }
    },
    sections: [],
    image: {
        thumbnail: "",
        original: "",
        original_width: 0,
        original_height: 0,
        alt: ""
    },
    gallery: {
        title: "",
        description: "",
        slides: []
    }
}