import { MessageEmbed, TextChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';

export const aliases: string[] = ['botrole', 'botrol'];
export const description: string = 'command.botrole.description'
export const category: string = 'category.configuration';
export const usage: string = 'command.botrole.usage';
export const examples: string[] = ['@lorem', '@foo @bar @baz', '815875969713307679 817669756256518145', '__reset__'];
export const permissions: string = 'MANAGE_GUILD';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    if (!args || !args.length) {
        if (server.botroles && server.botroles.length) {
            embed = client.embed({
                color: colors.DEFAULT,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                fields: [
                    {
                        name: server.translate('global.roles'),
                        value: `${server.botroles.split(/ +/g).map((r) => `<@&${r}>`).join('\n')}`
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
                description: server.translate('command.botrole.message.not.selected')
            });
        }

        return message.channel.send(embed);
    }

    if (args[0] === '__reset__') {
        if (!server.botroles) {
            embed = client.embed({
                color: colors.RED,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('global.not.botrole.not.already')
            });
            client.tempMessage(message.channel as TextChannel, embed, 10000);
        } else {
            try {
                await server.setBotroles(null);
                embed = client.embed({
                    color: colors.GREEN,
                    author: {
                        name: message.author.tag,
                        image: message.author.displayAvatarURL()
                    },
                    description: server.translate('command.botrole.message.reseted')
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
        if (message.guild.roles.cache.get(sf) && !roles.includes(sf)) roles.push(sf);
    });

    if (message.mentions.roles.size) message.mentions.roles.map((r) => {
        if (!roles.includes(r.id)) roles.push(r.id);
    });

    if (roles.length < 1 || roles.length > 5) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.botrole.message.out.of.range')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    try {
        await server.setBotroles(roles.join(' '));

        embed = client.embed({
            color: colors.GREEN,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: `${server.translate('command.botrole.message.successful')}\n${
                roles.map((r) => `<@&${r}>`).join('\n')
            }`
        });

        client.tempMessage(message.channel as TextChannel, embed, 10000);
    } catch (err) {
        message.channel.send(client.errorEmbed(server.language, message.guild, err));
    }
}
