import { MessageEmbed, GuildMember, TextChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import findSnowflake from '../../utility/FindSnowflake';

export const aliases: string[] = ['kick', 'at'];
export const description: string = 'command.kick.description';
export const usage: string = 'command.kick.usage';
export const category: string = 'category.moderation';
export const examples: string[] = ['@foo', '@foo Spam', '840300297527885865', '840300297527885865 Spam'];
export const permissions: string = 'KICK_MEMBERS'
export const minArgs: number = 1;
export const botPermissions: string[] = ['SEND_MESSAGES', 'KICK_MEMBERS']
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const snowflake: string = findSnowflake(message.content)[0];
    const reason: string = (args.join(' '))
        .replace(snowflake, '')
        .replace(/<@!*>/, '')
        .trim();
    const member: GuildMember = message.guild.members.cache.get(snowflake);

    if (!member) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('global.no.member')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (member.id == message.author.id) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.kick.message.cannot.kick.yourself')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (member.kickable) {
        member.kick(reason)
            .then(() => {
                embed = client.embed({
                    color: colors.GREEN,
                    author: {
                        name: message.author.tag,
                        image: message.author.displayAvatarURL()
                    },
                    description: server.translate('command.kick.message.kicked', member.user.tag)
                });

                client.tempMessage(message.channel as TextChannel, embed, 10000);
            })
            .catch((err) => {
                message.channel.send(client.errorEmbed(server.language, message.guild, err))
            });
    } else {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('global.not.kickable', member.id)
        });
        client.tempMessage(message.channel as TextChannel, embed, 10000);
    }
}