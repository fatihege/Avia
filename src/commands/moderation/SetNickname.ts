import { MessageEmbed, TextChannel, GuildMember } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import getTargetMember from '../../utility/GetTargetMember';

export const aliases: string[] = ['setnickname', 'setnick', 'kullanıcıadı'];
export const description: string = 'command.setnickname.description';
export const usage: string = 'command.setnickname.usage';
export const category: string = 'category.moderation';
export const examples: string[] = ['@Avia AviaBot', '838775980184436808 AviaBot', '@AviaBot \\_\\_reset\\_\\_'];
export const permissions: string[] = ['CHANGE_NICKNAME', 'MANAGE_NICKNAMES']
export const minArgs: number = 2;
export const botPermissions: string[] = ['SEND_MESSAGES', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES']
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    const target: GuildMember = getTargetMember(message);
    let embed: MessageEmbed;
    let nick: string;

    if (!target) return message.channel.send(server.translate('global.no.member'));

    if (args.length == 2 && args.includes('__reset__')) nick = target.user.username;
    else if (message.mentions.members.size)
        nick = (args.join(' ')).replace(/<@!*\d{17,19}>/, '').trim();
    else nick = (args.join(' ')).replace(/\d{17,19}/, '');

    if (nick.length > 32) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.setnickname.message.too.long')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    try {
        await target.setNickname(nick)
            .then(() => {
                embed = client.embed({
                    color: colors.GREEN,
                    author: {
                        name: message.author.tag,
                        image: message.author.displayAvatarURL()
                    },
                    description: server.translate('command.setnickname.message.changed', target.id, nick)
                });
                client.tempMessage(message.channel as TextChannel, embed, 10000);
            })
            .catch((err) => {
                message.channel.send(client.errorEmbed(server.language, message.guild, err));
            });
    } catch (err) {
        message.channel.send(client.errorEmbed(server.language, message.guild, err));
    }
}