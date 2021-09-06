import fetch from 'node-fetch';
import { MessageEmbed } from 'discord.js';
import escapeMarkdown from '../../utility/EscapeMarkdown';
import { ExecuteFunction } from '../../interfaces/Command';
import { Emoji } from '../../Constants';

export const aliases: string[] = ['lyrics', 'ly', 'sözler'];
export const description: string = 'command.lyrics.description';
export const category: string = 'category.music';
export const usage: string = 'command.lyrics.usage';
export const examples: string[] = ['Lorem ipsum'];
export const minArgs: number = 1;
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    embed = client.embed({
        color: colors.BLUE,
        description: `${Emoji.MAG_RIGHT} ${server.translate('command.lyrics.message.searching')}`
    });
    const infoMessage = await message.channel.send(embed);
    const response = await fetch(`https://genius-api.fatihege.repl.co/search?q=${encodeURI(args.join(' '))}`);
    const data = await response.json();

    embed = client.embed({
        color: colors.DEFAULT,
        thumbnail: data.thumbnailUrl,
        title: `${escapeMarkdown(data.title)}`,
        description: `${data.lyrics}\n\n${server.translate('command.lyrics.message.for.more', data.url)}`,
    });

    infoMessage.edit(embed);
}
