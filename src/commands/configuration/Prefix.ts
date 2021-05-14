import { MessageEmbed, TextChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { Bot } from '../../Constants';

export const aliases: string[] = ['prefix', 'onek'];
export const description: string = 'command.prefix.description'
export const category: string = 'category.configuration';
export const usage: string = 'command.prefix.usage';
export const examples: string[] = ['', '!a', 'default'];
export const minArgs: number = 1;
export const maxArgs: number = 1;
export const permissions: string = 'MANAGE_GUILD';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    let prefix: string = args[0];

    if (prefix.length > 5 && prefix !== 'default') {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.prefix.message.too.long')
        })
        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (prefix === 'default') prefix = Bot.DEFAULT_PREFIX;

    try {
        await server.setPrefix(prefix);

        embed = client.embed({
            color: colors.GREEN,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.prefix.message.successful', prefix)
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    } catch (err) {
        message.channel.send(client.errorEmbed(server.language, message.guild, err));
    }
}
