import { MessageEmbed, TextChannel, DMChannel, NewsChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';

type Channel = TextChannel | DMChannel | NewsChannel;

export const aliases: string[] = ['welcome', 'hosgeldin'];
export const description: string = 'command.welcome.description'
export const category: string = 'category.configuration';
export const usage: string = 'command.welcome.usage';
export const examples: string[] = ['#welcome Hey [userName] [userTag]!', '#welcome Lorem ipsum dolor sit amet.', 'Lorem ipsum dolor sit amet...', '\\_\\_reset\\_\\_'];
export const permissions: string = 'MANAGE_GUILD';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    if (!args || !args.length) {
        if (server.welcomeChannelID && server.welcomeMessage) {
            embed = client.embed({
                color: colors.DEFAULT,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                fields: [
                    {
                        name: server.translate('global.channel'),
                        value: `<#${server.welcomeChannelID}>`
                    },
                    {
                        name: server.translate('global.message'),
                        value: server.welcomeMessage
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
                description: server.translate('command.welcome.message.not.selected')
            });
        }

        return message.channel.send(embed);
    }

    if (args[0] === '__reset__') {
        if (!server.welcomeChannelID) {
            embed = client.embed({
                color: colors.RED,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('global.not.welcome.not.already')
            });
            client.tempMessage(message.channel as TextChannel, embed, 10000);
        } else {
            try {
                await server.setWelcome(null, null);
                embed = client.embed({
                    color: colors.GREEN,
                    author: {
                        name: message.author.tag,
                        image: message.author.displayAvatarURL()
                    },
                    description: server.translate('command.welcome.message.reseted')
                });
                client.tempMessage(message.channel as TextChannel, embed, 10000);
            } catch (err) {
                message.channel.send(client.errorEmbed(server.language, message.guild, err));
            }
        }

        return;
    }

    const channel: Channel = message.mentions.channels.first() || message.channel;
    const welcomeMessage: string = args.join(' ').replace(`<#${channel.id}>`, '').trim();

    if (welcomeMessage.length < 10 || welcomeMessage.length > 500) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.welcome.message.out.of.range')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    try {
        await server.setWelcome(channel.id, welcomeMessage);

        embed = client.embed({
            color: colors.GREEN,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.welcome.message.successful', channel.id, welcomeMessage)
        });

        client.tempMessage(message.channel as TextChannel, embed, 10000);
    } catch (err) {
        message.channel.send(client.errorEmbed(server.language, message.guild, err));
    }
}
