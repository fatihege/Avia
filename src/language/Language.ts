import ILanguage from '../interfaces/Language';

export default class Language {
    public aliases: string[];
    public name: string;
    public code: string;
    public emoji: string;
    public translates: object = {};

    public constructor(language: ILanguage) {
        this.aliases = language.aliases;
        this.name = language.name;
        this.code = language.code;
        this.emoji = language.emoji;

        this.parse(language.translates);
    }

    public parse(obj: object, path: string[] = []) {
        for (const [key, value] of Object.entries(obj)) {
            if (!value || typeof value !== 'object' || Array.isArray(value)) {
                this.translates[path.concat(key).join('.')] = value;
            } else {
                this.parse(value, path.concat(key));
            }
        }
    }

    public translate(path: string, args: any[]): any {
        const translated = this.translates[path];

        if (translated && (Array.isArray(translated) || typeof translated === 'string')) {
            if (Array.isArray(translated)) {
                let i = 0;

                const parsed = (translated as string[]).map((text) => {
                    const matched = text.match(/{(\d)}/g);

                    if (matched) {
                        const slice = args.slice(i, i + matched.length);
                        i += matched.length;

                        return this.parseArgs(text, slice);
                    }

                    return text;
                });
                return parsed.join('\n');
            }
            return this.parseArgs(translated as string, args);
        }
        return 'Error';
    }

    public parseArgs(str: string, args: Array<any>): string {
        return str.replace(/{(\d)}/g, (substr, i) => (args[parseInt(i)] || 'Error').toString());
    }
}