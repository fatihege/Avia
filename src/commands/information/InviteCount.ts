import { MessageEmbed, GuildMember, Collection, Invite } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import getTargetMember from '../../utility/GetTargetMember';

export const aliases: string[] = ['invitecount', 'davetsayısı'];
export const description: string = 'command.invitecount.description';
export const category: string = 'category.information';
export const maxArgs: number = 1;
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const target: GuildMember = getTargetMember(message);

    if (!target) return message.channel.send(server.translate('global.no.member'));

    const invites: Collection<string, Invite> = (await message.guild.fetchInvites())
        .filter((i) => i.inviter.id === target.id);
    let inviteCount = 0;

    await invites.map((invite) => inviteCount += invite.uses);

    embed = client.embed({
        color: colors.DEFAULT,
        author: {
            name: message.author.tag,
            image: message.author.displayAvatarURL()
        },
        thumbnail: target.user.displayAvatarURL(),
        title: target.user.tag,
        description: server.translate(
            'command.invitecount.message.description',
            invites.size.toLocaleString(),
            inviteCount.toLocaleString()
        ),
        timestamp: new Date()
    });

    message.channel.send(embed);
}