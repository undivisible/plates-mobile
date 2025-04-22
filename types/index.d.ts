/// <reference path="../app/types/index.ts" />

declare global {
    interface Config {
        GOOGLE_API_KEY: string;
        SEARCH_ENGINE_ID: string;
        GEMINI_API_KEY: string;
        GEMINI_API_URL: string;
        IS_DEV?: boolean;
    }

    interface SearchResult {
        title: string;
        content: string;
        quotes: Quote[];
        url: string;
        query: string;
    }

    interface Quote {
        text: string;
        source: string;
        url?: string;
    }

    interface TopicSection {
        id: string;
        title: string;
        content: string;
    }
}

// This empty export is needed to make this file a module
export {};