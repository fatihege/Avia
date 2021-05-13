import { Collection } from 'discord.js';
import { sep } from 'path';
import { readdirSync } from 'fs';
import Bot from '../Bot';
import Language from './Language';
import { Language as LanguageConstant } from '../Constants';

export default class LanguageManager {
    private static languages: Collection<string, Language> = new Collection();
    private static LANGUAGE_PATH: string = `${process.cwd()}${sep}${LanguageConstant.LANGUAGE_PATH}`;
    public static DEFAULT_LANGUAGE = LanguageConstant.DEFAULT_LANGUAGE;

    constructor(private client: Bot) {
        this.client = client;
    }

    public async execute() {
        const files = readdirSync(LanguageManager.LANGUAGE_PATH);
        if (!files.length) return this.client.logger.error('No language files found.');

        for (const file of files) {
            if (!file.endsWith('.json')) {
                this.client.logger.warning('This file has no ".json" extension.');
                continue;
            }

            const language = await import(`${LanguageManager.LANGUAGE_PATH}${sep}${file}`);
            this.client.logger.info(`"${language.name}" language has been successfully loaded.`);

            LanguageManager.addLanguage(new Language(language));
        }

        if (!LanguageManager.languages.get(LanguageManager.DEFAULT_LANGUAGE)) {
            this.client.logger.error(`Default language could not be loaded. (${LanguageManager.DEFAULT_LANGUAGE})`);
            process.exit(1);
        }

        this.client.logger.info(
            `A total of ${LanguageManager.languages.size} language files have been loaded successfully.`
        );
    }

    public static addLanguage(lang: Language) {
        this.languages.set(lang.code, lang);
    }

    public static findLanguage(code: string): Language | null {
        return this.languages.find((lang) => lang.code === code || lang.aliases.includes(code));
    }

    public static getLanguage(code: string): Language {
        return this.findLanguage(code) || this.languages.get(LanguageManager.DEFAULT_LANGUAGE);
    }

    public static includes(code: string): Language | null {
        return this.findLanguage(code) || null;
    }

    public static getLanguages(): Array<Language> {
        return Array.from(this.languages.values());
    }

    public static translate(code: string, path: string, ...args: any[]): any {
        const translated = LanguageManager.getLanguage(code).translate(path, args);
        if (!translated) return LanguageManager.getLanguage(LanguageManager.DEFAULT_LANGUAGE).translate(path, args);
        return translated;
    }
}