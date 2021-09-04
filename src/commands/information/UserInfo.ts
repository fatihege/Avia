import { MessageEmbed, GuildMember } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import dateFormat from '../../utility/DateFormat';
import getTargetMember from '../../utility/GetTargetMember';
import { Status } from '../../Constants';

export const aliases: string[] = ['userinfo', 'user', 'kullanıcıbilgi', 'kullanıcı'];
export const description: string = 'command.userinfo.description';
export const usage: string = 'command.userinfo.usage';
export const category: string = 'category.information';
export const examples: string[] = ['', '@Avia', '838775980184436808'];
export const maxArgs: number = 1;
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    const target: GuildMember = getTargetMember(message);
    if (!target) return message.channel.send(server.translate('global.no.member'));

    const roles: string[] = [];
    target.roles.cache.map((role) => {
        if (role.name != '@everyone') roles.push(`<@&${role.id}>`);
    });

    embed = client.embed({
        color: colors.DEFAULT,
        author: {
            name: message.author.tag,
            image: message.author.displayAvatarURL()
        },
        title: server.translate('command.userinfo.message.title'),
        thumbnail: target.user.displayAvatarURL(),
        description: target.id as string,
        fields: [
            {
                name: server.translate('global.user.username'),
                value: target.user.username,
                inline: true
            },
            {
                name: server.translate('global.user.status'),
                value: Status[target.user.presence.status],
                inline: true
            },
            {
                name: server.translate('global.user.created'),
                value: dateFormat(target.user.createdAt, server)
            },
            {
                name: server.translate('global.user.joined'),
                value: dateFormat(target.joinedAt, server)
            },
            {
                name: server.translate('global.user.activity'),
                value: target.user.presence.activities[0] && target.user.presence.activities[0].state ? target.user.presence.activities[0].state :  `_${server.translate('global.empty').toLowerCase()}_`
            },
            {
                name: server.translate('global.roles'),
                value: roles.length ? roles.join('\n') : `_${server.translate('global.empty').toLowerCase()}_`,
                inline: true
            }
        ]
    });

    message.channel.send(embed);
}