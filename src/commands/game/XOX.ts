import { MessageEmbed, TextChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { Emoji } from '../../Constants';

let xox: typeof Emoji.XOX = Emoji.XOX;

export const aliases: string[] = ['xox', 'tictactoe'];
export const description: string = 'command.xox.description';
export const usage: string = 'command.xox.usage';
export const category: string = 'category.game';
export const examples: string[] = ['@Avia', '838775980184436808'];
export const botPermissions: string = 'ADD_REACTIONS';
export const minArgs: number = 1;
export const maxArgs: number = 1;
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    let snowflake = message.content.match(/\d{17,19}/) ? message.content.match(/\d{17,19}/)[0] : null;

    if (!snowflake && message.mentions.users.size) {
        snowflake = message.mentions.users.first().id;
    }

    let member = message.guild.members.cache.get(snowflake) || null;

    if (!snowflake || !member) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('global.tag.user')
        });

        return message.channel.send(embed);
    }

    if (member.user.bot) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('global.not.target.bot')
        });

        return message.channel.send(embed);
    }

    let gamers = [message.author.id, member.id];
    let turn = 0;
    let table = [
        [xox.NUMBERS[1], xox.NUMBERS[2], xox.NUMBERS[3]],
        [xox.NUMBERS[4], xox.NUMBERS[5], xox.NUMBERS[6]],
        [xox.NUMBERS[7], xox.NUMBERS[8], xox.NUMBERS[9]]
    ];
    let content = mapTable(table, gamers[0]);
    let emojis = {
        [xox.NUMBERS[1]]: 1,
        [xox.NUMBERS[2]]: 2,
        [xox.NUMBERS[3]]: 3,
        [xox.NUMBERS[4]]: 4,
        [xox.NUMBERS[5]]: 5,
        [xox.NUMBERS[6]]: 6,
        [xox.NUMBERS[7]]: 7,
        [xox.NUMBERS[8]]: 8,
        [xox.NUMBERS[9]]: 9
    }

    embed = client.embed({
        color: colors.DEFAULT,
        description: server.translate('global.game.preparing')
    });

    message.channel.send(embed)
        .then(async (msg) => {
            for (let i = 1; i < 10; i++) {
                await msg.react(xox.NUMBERS[i]);
            }

            await msg.react('⏹️');

            msg.edit(content, { embed: null });

            const filter = (r, u) => Object.values(xox.NUMBERS).includes(`<:${r.emoji.name}:${r.emoji.id}>`) ||
                r.emoji.name === '⏹️';
            const collector = msg.createReactionCollector(filter);

            collector.on('collect', async (reaction, user) => {
                await reaction.users.remove(user.id);

                if (reaction.emoji.name === '⏹️' && gamers.includes(user.id)) {
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

                if (user.id !== gamers[turn]) {
                    embed = client.embed({
                        color: colors.RED,
                        description: server.translate('global.game.not.your.turn', user.id)
                    });

                    return client.tempMessage(message.channel as TextChannel, embed, 3000);
                }

                let targetNumber = emojis[`<:${reaction.emoji.name}:${reaction.emoji.id}>`];
                let index: number;

                if (targetNumber <= 3) index = 0;
                else if (targetNumber > 3 && targetNumber <= 6) {
                    index = 1;
                    targetNumber = targetNumber - 3;
                } else {
                    index = 2;
                    targetNumber = targetNumber - 6;
                }

                let alreadyPlaced: boolean = false;
                if (turn === 0 && table[index][targetNumber - 1] === xox.X) alreadyPlaced = true;
                else if (turn === 1 && table[index][targetNumber - 1] === xox.O) alreadyPlaced = true;

                if (alreadyPlaced === true) {
                    embed = client.embed({
                        color: colors.RED,
                        description: server.translate(
                            'command.xox.message.already.placed',
                            turn === 0 ? xox.X : xox.O, gamers[turn]
                        )
                    });

                    return client.tempMessage(message.channel as TextChannel, embed, 3000);
                }

                if (Object.keys(emojis).includes(table[index][targetNumber - 1]))
                    table[index][targetNumber - 1] = turn === 0 ? xox.X : xox.O;
                else {
                    embed = client.embed({
                        color: colors.RED,
                        description: server.translate('command.xox.message.block.full', turn === 0
                            ? xox.X : xox.O, gamers[turn])
                    });

                    return client.tempMessage(message.channel as TextChannel, embed, 3000);
                }

                let content: string = mapTable(table, gamers[turn === 0 ? 1 : 0]);
                let win: string = null;

                msg.edit(content);

                for (let i = 0; i < table.length; i++) {
                    if (table[i][0] === table[i][1] && table[i][1] === table[i][2] && !Object.keys(emojis).includes(table[i][0])) {
                        win = gamers[turn];
                        break;
                    }
                }

                if (table[0][0] === table[1][1] && table[1][1] === table[2][2] && !Object.keys(emojis).includes(table[0][0]))
                    win = gamers[turn];

                if (table[0][2] === table[1][1] && table[1][1] === table[2][0] && !Object.keys(emojis).includes(table[0][2]))
                    win = gamers[turn];

                if (
                    (
                        table[0][0] === table[1][0] && table[1][0] === table[2][0] && !Object.keys(emojis).includes(table[0][0])
                    ) ||
                    (
                        table[0][1] === table[1][1] && table[1][1] === table[2][1] && !Object.keys(emojis).includes(table[0][1])
                    ) ||
                    (
                        table[0][2] === table[1][2] && table[1][2] === table[2][2] && !Object.keys(emojis).includes(table[0][2])
                    )
                ) win = gamers[turn];

                if (win) {
                    embed = client.embed({
                        color: colors.GREEN,
                        description: server.translate('command.xox.message.won', win)
                    });

                    message.channel.send(embed);
                    collector.stop();
                    return;
                }

                let emptyBlock: boolean = false;
                for (let i = 0; i < table.length; i++) {
                    for (let j = 0; j < table[i].length; j++) {
                        if (Object.keys(emojis).includes(table[i][j])) {
                            emptyBlock = true;
                            break;
                        }
                    }
                }

                if (!win && !emptyBlock) {
                    embed = client.embed({
                        color: colors.BLUE,
                        title: server.translate('global.game.draw'),
                        description: server.translate('command.xox.message.draw')
                    });

                    message.channel.send(embed);
                    collector.stop();
                    return;
                }

                turn = turn === 0 ? 1 : 0;
            });
        });
}

const mapTable = (table, gamer): string => {
    let content = `<@!${gamer}>\n`;

    for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < table[i].length; j++) {
            content += table[i][j];
        }

        content += '\n';
    }

    return content;
}