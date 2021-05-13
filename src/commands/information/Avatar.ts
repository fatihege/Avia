import { MessageEmbed, GuildMember } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import getTargetMember from '../../utility/GetTargetMember';

export const aliases: string[] = ['avatar'];
export const description: string = 'command.avatar.description';
export const usage: string = 'command.avatar.usage';
export const category: string = 'category.information';
export const examples: string[] = ['', '@Avia', '838775980184436808'];
export const maxArgs: number = 1;
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    const target: GuildMember = getTargetMember(message);
    if (!target) return message.channel.send(server.translate('global.no.member'));

    embed = client.embed({
        color: colors.DEFAULT,
        author: {
            name: message.author.tag,
            image: message.author.displayAvatarURL()
        },
        description: `[png](${target.user.displayAvatarURL({ dynamic: false, size: 1024, format: 'png' })}) **|** [jpg](${target.user.displayAvatarURL({ dynamic: false, size: 1024, format: 'jpg' })}) **|** [webp](${target.user.displayAvatarURL({ dynamic: false, size: 1024, format: 'webp' })})`,
        image: target.user.displayAvatarURL({ dynamic: false, size: 1024, format: 'png' })
    });

    message.channel.send(embed);
}