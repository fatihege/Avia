import {
    Client,
    Intents,
    Collection,
    MessageEmbed,
    TextChannel,
    Guild,
    DiscordAPIError,
    HTTPError
} from 'discord.js';
import fs from 'fs';
import { join } from 'path';
import Webhooks from './Webhooks';
import ServerManager from './managers/ServerManager';
import Command from './interfaces/Command';
import Event from './interfaces/Event';
import Logger from './utility/Logger';
import { Command as CommandConstant, Colors, Bot as BotConstant } from './Constants';
import EmbedOptions from './interfaces/EmbedOptions';
import LanguageManager from './language/LanguageManager';

export default class Bot extends Client {
    public logger: Logger = new Logger();
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public cooldowns: Collection<string, any> = new Collection();
    public readonly servers: ServerManager = new ServerManager();
    public readonly languageManager: LanguageManager = new LanguageManager(this);
    public readonly webhooks: Webhooks = new Webhooks();

    constructor() {
        super({
            ws: { intents: Intents.ALL },
            messageCacheLifetime: 0,
            messageCacheMaxSize: 200,
            messageEditHistoryMaxSize: -1,
            messageSweepInterval: 0,
            partials: ['MESSAGE', 'REACTION']
        });
    }

    private async readCommands(): Promise<void> {
        const commandPath = fs.readdirSync(join(__dirname, CommandConstant.COMMANDS_DIR));
        for (const folder of commandPath) {
            const commandFiles = fs.readdirSync(join(__dirname, CommandConstant.COMMANDS_DIR, folder))
                .filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = await import(join(__dirname, CommandConstant.COMMANDS_DIR, folder, file));
                this.commands.set(command.aliases[0], command);
            }
        }
    }

    private async readEvents(): Promise<void> {
        const eventPath = fs.readdirSync(join(__dirname, CommandConstant.EVENTS_DIR));

        for (const folder of eventPath) {
            const eventFiles = fs.readdirSync(join(__dirname, CommandConstant.EVENTS_DIR, folder))
                .filter(file => file.endsWith('.js'));

            for (const file of eventFiles) {
                const event = await import(join(__dirname, CommandConstant.EVENTS_DIR, folder, file));
                this.events.set(event.name, event);

                this.on(event.name, event.execute.bind(null, this));
            }
        }
    }

    public async start(token): Promise<void> {
        this.login(token);
        await this.readEvents();
        await this.readCommands();
        await this.languageManager.execute();
    }

    public embed(embedOptions: EmbedOptions): MessageEmbed {
        let {
            color,
            title = null,
            url = null,
            author = null,
            description = null,
            thumbnail = null,
            fields = null,
            image = null,
            files = [],
            timestamp = null,
            footer = null
        } = embedOptions;

        let embed = new MessageEmbed().setColor(color);

        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (url) embed.setURL(url);
        if (author) embed.setAuthor(author.name, author.image || '', author.url || '');
        if (thumbnail) embed.setThumbnail(thumbnail);
        if (fields) embed.addFields(fields);
        if (image) embed.setImage(image);
        if (files.length) embed.attachFiles(files);
        if (timestamp) embed.setTimestamp(timestamp);
        if (footer) embed.setFooter(footer.text, footer.image);

        return embed;
    }

    public errorEmbed(language: string, guild: Guild, error: DiscordAPIError | HTTPError): MessageEmbed {
        return this.embed({
            color: Colors.RED,
            title: LanguageManager.translate(language, 'error.reporter.title'),
            description: `${LanguageManager.translate(
                language,
                'error.reporter.description',
                error.name,
                error.code,
                error.method,
                error.message,
                error.path
            )}\n\n[${LanguageManager.translate(language, 'global.support.server')}](${BotConstant.SUPPORT_URL})`,
            timestamp: new Date()
        });
    }

    public tempMessage(channel: TextChannel, content: string | MessageEmbed, timeout: number) {
        return channel.send(content)
            .then((m) => {
                m.delete({ timeout: timeout });
            });
    }
}