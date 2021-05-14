import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Event';
import ServerModel from '../../models/Server';
import { Colors } from '../../Constants';

export const name: string = 'guildMemberAdd';
export const execute: ExecuteFunction = async (client, member: GuildMember) => {
    let embed: MessageEmbed;
    let server = await ServerModel.findOne({ where: { id: member.guild.id } });

    if (!server) {
        server = await ServerModel.create({ id: member.guild.id });
    }

    if (server.welcomeChannelID && server.welcomeMessage) {
        const channel = member.guild.channels.cache.get(server.welcomeChannelID) as TextChannel;

        if (!channel) {
            try {
                await server.update({
                    welcomeChannelID: null,
                    welcomeMessage: null
                });
            } catch (err) {}

            return;
        }

        embed = client.embed({
            color: Colors.GREEN,
            thumbnail: member.user.displayAvatarURL(),
            description: server.welcomeMessage
                .replace(/\[userName]/g, member.user.tag)
                .replace(/\[userTag]/g, `<@!${member.id}>`),
            timestamp: new Date()
        });

        channel.send(embed);
    }

    if (server.autoroles && server.autoroles.length && !member.user.bot) {
        const roles: string[] = server.autoroles.split(/ +g/);

        roles.map(async (r) => {
            const role = await member.guild.roles.cache.get(r);

            try {
                if (role) await member.roles.add(role);
            } catch (err) {}
        });
    }

    if (server.botroles && server.botroles.length && member.user.bot) {
        const roles: string[] = server.botroles.split(/ +g/);

        roles.map(async (r) => {
            const role = await member.guild.roles.cache.get(r);

            try {
                if (role) await member.roles.add(role);
            } catch (err) {}
        });
    }
}