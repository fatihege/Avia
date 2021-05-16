import { Snowflake } from 'discord.js';
import Structure from './Structure';
import ServerModel, { IServer } from '../models/Server';
import Language from '../language/Language';
import LanguageManager from '../language/LanguageManager';

export default class Server extends Structure<typeof ServerModel, IServer> {
    public id: Snowflake;
    public prefix?: string;
    public language?: string;
    public logChannelID?: string;
    public welcomeChannelID?: Snowflake;
    public welcomeMessage?: string;
    public leaveChannelID?: Snowflake;
    public leaveMessage?: string;
    public autoroles?: string;
    public botroles?: string;

    constructor(data: IServer) {
        super(ServerModel, data);
    }

    protected setup(data: IServer) {
        this.id = data.id;
        this.prefix = data.prefix || this.prefix;
        this.language = data.language || this.language;
        this.logChannelID = data.logChannelID || this.logChannelID;
        this.welcomeChannelID = data.welcomeChannelID || this.welcomeChannelID;
        this.welcomeMessage = data.welcomeMessage || this.welcomeMessage;
        this.leaveChannelID = data.leaveChannelID || this.leaveChannelID;
        this.leaveMessage = data.leaveMessage || this.leaveMessage;
        this.autoroles = data.autoroles || this.autoroles;
        this.botroles = data.botroles || this.botroles;
    }

    public async setPrefix(prefix: string): Promise<void> {
        await this.update({
            id: this.id,
            prefix: prefix
        });
    }

    public async setLanguage(language: Language): Promise<void> {
        await this.update({
            id: this.id,
            language: language.code
        });
    }

    public async setLogChannel(id: Snowflake | null): Promise<void> {
        await this.update({
            id: this.id,
            logChannelID: id
        });
    }

    public async setWelcome(id: Snowflake | null, message: string | null): Promise<void> {
        await this.update({
            id: this.id,
            welcomeChannelID: id,
            welcomeMessage: message
        });
    }

    public async setLeave(id: Snowflake | null, message: string | null): Promise<void> {
        await this.update({
            id: this.id,
            leaveChannelID: id,
            leaveMessage: message
        });
    }

    public async setAutoroles(roles: string | null) {
        await this.update({
            id: this.id,
            autoroles: roles
        });
    }

    public async setBotroles(roles: string | null) {
        await this.update({
            id: this.id,
            botroles: roles
        });
    }

    public translate(path: string, ...args: any[]): any {
        return LanguageManager.translate(this.language, path, ...args);
    }
}