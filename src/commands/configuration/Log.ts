import { MessageEmbed, TextChannel, DMChannel, NewsChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';

type Channel = TextChannel | DMChannel | NewsChannel;

export const aliases: string[] = ['log', 'gunlukkaydi'];
export const description: string = 'command.log.description'
export const category: string = 'category.configuration';
export const usage: string = 'command.log.usage';
export const examples: string[] = ['#log', '__reset__'];
export const permissions: string = 'MANAGE_GUILD';
export const authorOnly: boolean = true;
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    if (!args || !args.length) {
        if (server.logChannelID) {
            embed = client.embed({
                color: colors.DEFAULT,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                fields: [
                    {
                        name: server.translate('global.channel'),
                        value: `<#${server.logChannelID}>`
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
                description: server.translate('command.log.message.not.selected')
            });
        }

        return message.channel.send(embed);
    }

    if (args[0] === '__reset__') {
        if (!server.logChannelID) {
            embed = client.embed({
                color: colors.RED,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('global.not.log.not.already')
            });
            client.tempMessage(message.channel as TextChannel, embed, 10000);
        } else {
            try {
                await server.setLogChannel(null);
                embed = client.embed({
                    color: colors.GREEN,
                    author: {
                        name: message.author.tag,
                        image: message.author.displayAvatarURL()
                    },
                    description: server.translate('command.log.message.reseted')
                });
                client.tempMessage(message.channel as TextChannel, embed, 10000);
            } catch (err) {
                message.channel.send(client.errorEmbed(server.language, message.guild, err));
            }
        }

        return;
    }

    const channel: Channel = message.mentions.channels.first() || message.channel;

    try {
        await server.setLogChannel(channel.id);

        embed = client.embed({
            color: colors.GREEN,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.log.message.successful', channel.id)
        });

        client.tempMessage(message.channel as TextChannel, embed, 10000);
    } catch (err) {
        message.channel.send(client.errorEmbed(server.language, message.guild, err));
    }
}
