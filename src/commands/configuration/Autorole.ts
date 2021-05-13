import { MessageEmbed, TextChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';

export const aliases: string[] = ['autorole', 'otorol'];
export const description: string = 'command.autorole.description'
export const category: string = 'category.configuration';
export const usage: string = 'command.autorole.usage';
export const examples: string[] = ['@lorem', '@foo @bar @baz', '815875969713307679 817669756256518145', '\\_\\_reset\\_\\_'];
export const permissions: string = 'MANAGE_GUILD';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    if (!args || !args.length) {
        if (server.autoroles && server.autoroles.length) {
            embed = client.embed({
                color: colors.DEFAULT,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                fields: [
                    {
                        name: server.translate('global.roles'),
                        value: `${server.autoroles.split(/ +/g).map((r) => `<@&${r}>`).join('\n')}`
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
                description: server.translate('command.autorole.message.not.selected')
            });
        }

        return message.channel.send(embed);
    }

    if (args[0] === '__reset__') {
        if (!server.autoroles) {
            embed = client.embed({
                color: colors.RED,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('global.not.autorole.not.already')
            });
            client.tempMessage(message.channel as TextChannel, embed, 10000);
        } else {
            try {
                await server.setAutoroles(null);
                embed = client.embed({
                    color: colors.GREEN,
                    author: {
                        name: message.author.tag,
                        image: message.author.displayAvatarURL()
                    },
                    description: server.translate('command.autorole.message.reseted')
                });
                client.tempMessage(message.channel as TextChannel, embed, 10000);
            } catch (err) {
                message.channel.send(client.errorEmbed(server.language, message.guild, err));
            }
        }

        return;
    }

    let roles: string[] = [];
    const snowflakes: string[] = message.content.match(/\d{17,18}/g);

    snowflakes.map((sf) => {
        if (message.guild.roles.cache.get(sf)) roles.push(sf);
    });

    if (roles.length < 1 || roles.length > 5) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.autorole.message.out.of.range')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    try {
        await server.setAutoroles(roles.join(' '));

        embed = client.embed({
            color: colors.GREEN,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: `${server.translate('command.autorole.message.successful')}\n${
                roles.map((r) => `<@&${r}>`).join('\n')
            }`
        });

        client.tempMessage(message.channel as TextChannel, embed, 10000);
    } catch (err) {
        message.channel.send(client.errorEmbed(server.language, message.guild, err));
    }
}
