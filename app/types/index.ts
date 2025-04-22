export interface Config {
    GOOGLE_API_KEY: string;
    SEARCH_ENGINE_ID: string;
    GEMINI_API_KEY: string;
    GEMINI_API_URL: string;
    IS_DEV?: boolean;
}

export interface ImageResult {
    url: string;
    title: string;
    thumbnailUrl: string;
    contextUrl: string;
}

export interface SearchResult {
    title: string;
    content: string;
    quotes: Quote[];
    url: string;
    query: string;
    images?: ImageResult[];
}

export interface Quote {
    text: string;
    source: string;
    url?: string;
}

export interface TopicSection {
    id: string;
    title: string;
    content: string;
}