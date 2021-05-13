import { MessageEmbed } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';

export const aliases: string[] = ['guessnumber', 'sayitahmin'];
export const description: string = 'command.guessnumber.description';
export const usage: string = 'command.guessnumber.usage';
export const category: string = 'category.game';
export const examples: string[] = ['', '20'];
export const maxArgs: number = 1;
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const limit: number = isNaN(+args[0]) ? 10 : +args[0];
    let randomNumber: number = Math.floor(Math.random() * limit);

    if (randomNumber < 1) randomNumber = 1;

    if (limit < 10 || limit > 100) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.guessnumber.message.limit.range')
        });

        return message.channel.send(embed);
    }

    embed = client.embed({
        color: colors.GREEN,
        author: {
            name: message.author.tag,
            image: message.author.displayAvatarURL()
        },
        description: server.translate('command.guessnumber.message.kept.number', limit)
    });

    return message.channel.send(embed)
        .then((msg) => {
            const filter = (m) => m.content.trim().startsWith('--') && m.author.id === message.author.id;
            const collector = msg.channel.createMessageCollector(filter);

            collector.on('collect', (m) => {
                if (m.content.replace('--', '').trim() === 'end') {
                    embed = client.embed({
                        color: colors.GREEN,
                        author: {
                            name: message.author.tag,
                            image: message.author.displayAvatarURL()
                        },
                        description: server.translate('global.game.ended')
                    });

                    message.channel.send(embed);
                    collector.stop();
                    return;
                }

                const prediction: number = +m.content.match(/[0-9]+/) || null;

                if (!prediction) return;

                if (prediction === randomNumber) {
                    embed = client.embed({
                        color: colors.GREEN,
                        author: {
                            name: message.author.tag,
                            image: message.author.displayAvatarURL()
                        },
                        description: server.translate('command.guessnumber.message.right', randomNumber)
                    });

                    message.channel.send(embed);
                    collector.stop();
                    return;
                } else if (prediction < randomNumber) {
                    embed = client.embed({
                        color: colors.RED,
                        author: {
                            name: message.author.tag,
                            image: message.author.displayAvatarURL()
                        },
                        description: server.translate('command.guessnumber.message.wrong.higher')
                    });

                    return message.channel.send(embed);
                } else if (prediction > randomNumber) {
                    embed = client.embed({
                        color: colors.RED,
                        author: {
                            name: message.author.tag,
                            image: message.author.displayAvatarURL()
                        },
                        description: server.translate('command.guessnumber.message.wrong.smaller')
                    });

                    return message.channel.send(embed);
                }
            });
        });
}