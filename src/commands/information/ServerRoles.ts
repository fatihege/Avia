import { MessageEmbed, Role } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';

export const aliases: string[] = ['serverroles', 'sunucurolleri'];
export const description: string = 'command.serverroles.description';
export const category: string = 'category.information';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const { guild } = message;
    const roles: string[] = [];

    guild.roles.cache.map((r) => {
        if (r.name !== '@everyone') {
            roles.push(`<@&${r.id}> ${server.translate('command.serverroles.message.members', r.members.size.toString())}`)
        }
    });

    embed = client.embed({
        color: colors.DEFAULT,
        author: {
            name: guild.name,
            image: guild.iconURL()
        },
        title: server.translate('command.serverroles.message.title', roles.length.toString()),
        thumbnail: guild.iconURL(),
        description: roles.length ? roles.join('\n') : server.translate('command.serverroles.message.no.roles'),
        footer: {
            text: message.author.tag,
            image: message.author.displayAvatarURL()
        }
    });

    message.channel.send(embed);
}