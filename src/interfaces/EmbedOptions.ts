interface FieldOptions {
    name: string;
    value: string;
    inline?: boolean;
}

interface EmbedAuthorOptions {
    name: string;
    image?: string;
    url?: string;
}

interface EmbedFooterOptions {
    text: string;
    image?: string;
}

export default interface EmbedOptions {
    color: string | number;
    title?: string;
    url?: string;
    author?: EmbedAuthorOptions;
    description?: string;
    thumbnail?: string;
    fields?: Array<FieldOptions>;
    image?: string;
    files?: Array<string>;
    timestamp?: Date | number;
    footer?: EmbedFooterOptions;
}