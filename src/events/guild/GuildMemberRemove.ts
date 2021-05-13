import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Event';
import ServerModel from '../../models/Server';
import { Colors } from '../../Constants';

export const name: string = 'guildMemberRemove';
export const execute: ExecuteFunction = async (client, member: GuildMember) => {
    let embed: MessageEmbed;
    let server = await ServerModel.findOne({ where: { id: member.guild.id } });

    if (!server) {
        server = await ServerModel.create({ id: member.guild.id });
    }

    if (server.leaveChannelID && server.leaveMessage) {
        const channel = member.guild.channels.cache.get(server.leaveChannelID) as TextChannel;

        embed = client.embed({
            color: Colors.RED,
            thumbnail: member.user.displayAvatarURL(),
            description: server.leaveMessage
                .replace(/\[userName]/g, member.user.tag)
                .replace(/\[userTag]/g, `<@!${member.id}>`),
            timestamp: new Date()
        });

        channel.send(embed);
    }
}