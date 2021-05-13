import { MessageEmbed, Collection, GuildMember, GuildChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import dateFormat from '../../utility/DateFormat';

export const aliases: string[] = ['serverinfo', 'server', 'sunucubilgi', 'sunucu'];
export const description: string = 'command.serverinfo.description';
export const category: string = 'category.information';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const { guild } = message;

    const peoples: Collection<string, GuildMember> = guild.members.cache.filter((m) => !m.user.bot);
    const bots: number = guild.members.cache.size - peoples.size;
    const onlinePeoples: number = peoples.filter((m) => m.user.presence.status !== 'offline').size;
    const offlinePeoples: number = peoples.size - onlinePeoples;

    const channels: Collection<string, GuildChannel> = guild.channels.cache.filter((c) => c.type !== 'category');
    const textChannels: number = channels.filter((c) => c.type === 'text').size;
    const voiceChannels: number = channels.filter((c) => c.type === 'voice').size;
    const otherChannels: number = channels.filter((c) => c.type !== 'voice' && c.type !== 'text').size;

    embed = client.embed({
        color: colors.DEFAULT,
        author: {
            name: guild.name,
            image: guild.iconURL()
        },
        title: server.translate('command.serverinfo.message.title'),
        thumbnail: guild.iconURL(),
        description: guild.id,
        fields: [
            {
                name: server.translate('global.guild.owner'),
                value: `<@!${guild.ownerID}>`
            },
            {
                name: server.translate('global.guild.created'),
                value: dateFormat(guild.createdAt, server)
            },
            {
                name: server.translate('global.guild.verification.level'),
                value: server.translate(`global.verification.level.${message.guild.verificationLevel}`),
            },
            {
                name: server.translate('global.prefix'),
                value: `\`${server.prefix}\``,
                inline: true
            },
            {
                name: `${server.translate('global.guild.members')} [${peoples.size + bots}]`,
                value: `**${server.translate('global.online')}** ${onlinePeoples.toLocaleString()}\n**${server.translate('global.offline')}:** ${offlinePeoples.toLocaleString()}\n**${server.translate('global.bots')}:** ${bots.toLocaleString()}`,
                inline: true
            },
            {
                name: `${server.translate('global.guild.channels')} [${channels.size}]`,
                value: `**${server.translate('global.guild.channel.text')}** ${textChannels.toLocaleString()}\n**${server.translate('global.guild.channel.voice')}**: ${voiceChannels.toLocaleString()}\n**${server.translate('global.guild.channel.other')}**: ${otherChannels.toLocaleString()}`,
                inline: true
            },
            {
                name: `${server.translate('global.roles')} [${guild.roles.cache.filter((r) => r.name !== '@everyone').size}]`,
                value: server.translate('command.serverinfo.message.roles.info', server.prefix),
                inline: true
            }
        ],
        footer: {
            text: message.author.tag,
            image: message.author.displayAvatarURL()
        }
    });

    message.channel.send(embed);
}