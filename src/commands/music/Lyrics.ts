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
    const forMoreString: string = `\n\n**${server.translate('command.lyrics.message.for.more', data.url)}**`;

    if (data && data.lyrics) {
        embed = client.embed({
            color: colors.DEFAULT,
            title: `${escapeMarkdown(data.title)}`,
            description: `${data.lyrics}`,
        });

        if (data.thumbnailUrl) embed.setThumbnail(data.thumbnailUrl)
    } else {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('command.lyrics.message.no.results.found'),
        });
    }

    try {
        await infoMessage.edit(embed);
    } catch (e) {
        if (data && data.lyrics) {
            try {
                embed.setDescription(`${embed.description.slice(0, 4096 - forMoreString.length - 3)}...${forMoreString}`);
                await infoMessage.edit(embed);
            } catch (e) {
                embed = client.embed({
                    color: colors.RED,
                    description: server.translate('command.lyrics.message.error'),
                });
                await infoMessage.edit(embed);
            }
        }
    }
}
