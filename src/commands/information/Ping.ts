import { MessageEmbed } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import resolveMS from '../../utility/ResolveMS'

export const aliases: string[] = ['ping'];
export const description: string = 'command.ping.description';
export const category: string = 'category.information';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    embed = client.embed({
        color: colors.DEFAULT,
        description: server.translate('command.ping.message.calculating'),
        author: {
            name: message.author.tag,
            image: message.author.displayAvatarURL()
        },
        timestamp: new Date()
    });

    return message.channel.send(embed)
        .then(async (m) => {
            embed = client.embed({
                color: colors.DEFAULT,
                description: `**${server.translate('command.ping.message.bot')}:** ${resolveMS(m.createdTimestamp - message.createdTimestamp)}\n**${server.translate('command.ping.message.api')}:** ${resolveMS(client.ws.ping)}`,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            });

            m.edit(embed);
        });
}