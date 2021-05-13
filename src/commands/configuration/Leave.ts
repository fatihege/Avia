import { MessageEmbed, TextChannel, DMChannel, NewsChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';

type Channel = TextChannel | DMChannel | NewsChannel;

export const aliases: string[] = ['leave', 'ayrilma'];
export const description: string = 'command.leave.description'
export const category: string = 'category.configuration';
export const usage: string = 'command.leave.usage';
export const examples: string[] = ['#leave Hey [userName] [userTag]!', '#leave Lorem ipsum dolor sit amet.', 'Lorem ipsum dolor sit amet...', '\\_\\_reset\\_\\_'];
export const permissions: string = 'MANAGE_GUILD';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    if (!args || !args.length) {
        if (server.leaveChannelID && server.leaveMessage) {
            embed = client.embed({
                color: colors.DEFAULT,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                fields: [
                    {
                        name: server.translate('global.channel'),
                        value: `<#${server.leaveChannelID}>`
                    },
                    {
                        name: server.translate('global.message'),
                        value: server.leaveMessage
                    }
                ]
            });
        } else {
            embed = client.embed({
                color: colors.DEFAULT,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('command.leave.message.not.selected')
            });
        }

        return message.channel.send(embed);
    }

    if (args[0] === '__reset__') {
        if (!server.leaveChannelID) {
            embed = client.embed({
                color: colors.RED,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('global.not.leave.not.already')
            });
            client.tempMessage(message.channel as TextChannel, embed, 10000);
        } else {
            try {
                await server.setLeave(null, null);
                embed = client.embed({
                    color: colors.GREEN,
                    author: {
                        name: message.author.tag,
                        image: message.author.displayAvatarURL()
                    },
                    description: server.translate('command.leave.message.reseted')
                });
                client.tempMessage(message.channel as TextChannel, embed, 10000);
            } catch (err) {
                message.channel.send(client.errorEmbed(server.language, message.guild, err));
            }
        }

        return;
    }

    const channel: Channel = message.mentions.channels.first() || message.channel;
    const leaveMessage: string = args.join(' ').replace(`<#${channel.id}>`, '').trim();

    if (leaveMessage.length < 10 || leaveMessage.length > 500) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.leave.message.out.of.range')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    try {
        await server.setLeave(channel.id, leaveMessage);

        embed = client.embed({
            color: colors.GREEN,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.leave.message.successful', channel.id, leaveMessage)
        });

        client.tempMessage(message.channel as TextChannel, embed, 10000);
    } catch (err) {
        message.channel.send(client.errorEmbed(server.language, message.guild, err));
    }
}
