import { MessageEmbed } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import sleep from '../../utility/Sleep';
import MurderMysteryModel from '../../models/MurderMystery';
import { Bot } from '../../Constants';

export const aliases: string[] = ['murdermystery', 'katilkim'];
export const description: string = 'command.murdermystery.description';
export const usage: string = 'command.murdermystery.usage';
export const category: string = 'category.game';
export const examples: string[] = ['2 @Avia @foo @bar', '1 838775980184436808 799520588485361675', 'end', '-- @Avia'];
export const minArgs: number = 1;
export const maxArgs: number = 21;
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    if (args[0].toLowerCase() === 'end') {
        if (await MurderMysteryModel.findOne({ where: { id: message.channel.id } })) {
            try {
                await MurderMysteryModel.destroy({ where: { id: message.channel.id } });

                embed = client.embed({
                    color: colors.GREEN,
                    author: {
                        name: message.author.tag,
                        image: message.author.displayAvatarURL()
                    },
                    description: server.translate('global.game.ended')
                });

                message.channel.send(embed);
            } catch (err) {}
        } else {
            embed = client.embed({
                color: colors.RED,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('command.murdermystery.message.not.started')
            });

            message.channel.send(embed);
        }

        return;
    } else if (
        args[0] === '--' ||
        args[0] === 'guess' ||
        args[0] === 'g' ||
        args[0] === server.translate('command.murdermystery.arg.guess')
    ) {
        if (!await MurderMysteryModel.findOne({ where: { id: message.channel.id } })) {
            try {
                await MurderMysteryModel.destroy({ where: { id: message.channel.id } });

                embed = client.embed({
                    color: colors.RED,
                    author: {
                        name: message.author.tag,
                        image: message.author.displayAvatarURL()
                    },
                    description: server.translate('command.murdermystery.message.not.started')
                });

                message.channel.send(embed);
            } catch (err) {
                message.channel.send(client.errorEmbed(server.language, message.guild, err));
            }

            return;
        }

        let gamers = await MurderMysteryModel.findOne({ where: {id: message.channel.id}}) ?
            (await MurderMysteryModel.findOne({ where: {id: message.channel.id}})).gamers.split(/ +/g) :
            [];
        let murderers = await MurderMysteryModel.findOne({ where: {id: message.channel.id}}) ?
            (await MurderMysteryModel.findOne({ where: {id: message.channel.id}})).murderers.split(/ +/g) :
            [];
        let snowflake: string = message.content.match(/\d{17,19}/)[0] || null;
        let messageContent: string = '';
        let murderersCache: string[] = [];

        if (!snowflake && message.mentions.members.size) {
            snowflake = message.mentions.members.first().id;
        }

        if (!snowflake) return;

        if (snowflake == message.author.id) {
            return message.channel.send(client.embed({
                color: colors.RED,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('command.murdermystery.message.not.tag.yourself')
            }));
        }

        if (!gamers.includes(snowflake)) {
            message.channel.send(client.embed({
                color: colors.RED,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('global.game.not.in.game', snowflake)
            }));
        } else {
            await MurderMysteryModel.upsert({
                id: message.channel.id,
                gamers: gamers.filter((m) => m != snowflake).join(' ')
            });

            gamers = await MurderMysteryModel.findOne({ where: { id: message.channel.id } }) ?
                (await MurderMysteryModel.findOne({ where: { id: message.channel.id } })).gamers.split(/ +/g) :
                [];
            gamers = gamers.filter((g) => g != '');

            if (murderers.includes(snowflake)) {
                await MurderMysteryModel.upsert({
                    id: message.channel.id,
                    murderers: murderers.filter((m) => m != snowflake).join(' ')
                });

                murderers = await MurderMysteryModel.findOne({ where: { id: message.channel.id } }) ?
                    (await MurderMysteryModel.findOne({
                        where: {
                            id: message.channel.id
                        }
                    })).murderers.split(/ +/g) :
                    [];
                murderers = murderers.filter((m) => m != '');

                murderersCache.push(snowflake);
                messageContent += `${
                    server.translate('command.murdermystery.message.is.murderer', snowflake)
                }\n`;
            } else {
                messageContent += `${
                    server.translate('command.murdermystery.message.is.innocent', snowflake)
                }\n`;
            }
        }

        await sleep(100);

        if (!messageContent.length) return;

        message.channel.send(client.embed({
            color: colors.DEFAULT,
            description: server.translate('global.checking')
        })).then(async (msg) => {

            await sleep(100);

            if (!gamers.length || !murderers.length) {
                try {
                    await MurderMysteryModel.destroy({
                        where: {
                            id: message.channel.id
                        }
                    });
                } catch (err) {}
            }

            msg.edit(client.embed({
                color: colors.DEFAULT,
                description: messageContent,
                fields: [
                    {
                        name: server.translate('global.game.latest.status'),
                        value: `**${
                            server.translate('command.murdermystery.message.count.innocent')
                        }:** ${gamers.length - murderers.length}\n**${
                            server.translate('command.murdermystery.message.count.murderer')
                        }:** ${murderers.length}`
                    }
                ]
            }));
        });

        await sleep(100);

        if (!murderers.length && gamers.length) {
            try {
                await MurderMysteryModel.destroy({
                    where: {
                        id: message.channel.id
                    }
                });

                message.channel.send(client.embed({
                    color: colors.GREEN,
                    description: `${server.translate('command.murdermystery.message.win.innocents')}\n\n**${
                        server.translate('command.murdermystery.message.murderers')
                    }**\n${
                        murderersCache.length ? murderersCache.map((murderer) => `<@!${murderer}>\n`) : ''
                    }${
                        murderers.length ? murderers.map((murderer) => `<@!${murderer}>\n`) : ''
                    }`
                }));
            } catch (err) {}
        } else if (murderers.length && gamers.length - murderers.length < 2 && gamers.length < 3) {
            try {
                await MurderMysteryModel.destroy({
                    where: {
                        id: message.channel.id
                    }
                });

                message.channel.send(client.embed({
                    color: colors.RED,
                    description: `${server.translate('command.murdermystery.message.win.murderers')}\n\n${
                        murderersCache.length ? murderersCache.map((murderer) => `<@!${murderer}>\n`) : ''
                    }${
                        murderers.length ? murderers.map((murderer) => `<@!${murderer}>\n`) : ''
                    }`
                }));
            } catch (err) {}
        }

        return;
    }

    if (await MurderMysteryModel.findOne({ where: { id: message.channel.id } })) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.murdermystery.message.process')
        });

        return message.channel.send(embed);
    }
    let gamers: string[] = [message.author.id];
    let murderers: string[] = [];
    let snowflakes: string[] = message.content.match(/\d{17,19}/g) || [];

    snowflakes.map((sf) => {
        let member = message.guild.members.cache.get(sf);
        if (
            member &&
            !member.user.bot &&
            !gamers.includes(member.id)
        ) {
            gamers.push(member.id);
            message.content = message.content.replace(member.id, '');
        }
    });

    if (message.mentions.members && message.mentions.members.size) {
        message.mentions.members.map((member) => {
            if (!member.user.bot && !gamers.includes(member.id)) {
                gamers.push(member.id)
                message.content = message.content.replace(member.id, '');
            }
        });
    }

    if (!gamers.length || gamers.length < 3 || gamers.length > 20) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.murdermystery.message.gamer.range')
        });

        return message.channel.send(embed);
    }

    let murdererCount: number = message.content.match(/\d{1,2}/) ? parseInt(message.content.match(/\d{1,2}/)[0]) : 1;

    if (murdererCount > gamers.length) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.murdermystery.message.murderers.higher')
        });

        return message.channel.send(embed);
    }

    if (gamers.length - murdererCount < 2) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.murdermystery.message.min.innocent')
        });

        return message.channel.send(embed);
    }

    for (let i = 0; i < murdererCount; i++) {
        let random = Math.floor(Math.random() * gamers.length);

        if (!murderers.includes(gamers[random])) murderers.push(gamers[random]);
    }

    embed = client.embed({
        color: colors.DEFAULT,
        author: {
            name: message.author.tag,
            image: message.author.displayAvatarURL()
        },
        description: server.translate('global.game.preparing')
    });

    message.channel.send(embed)
        .then(async (msg) => {
            try {
                await MurderMysteryModel.upsert({
                    id: message.channel.id,
                    gamers: gamers.join(' '),
                    murderers: murderers.join(' ')
                });

                gamers.map(async (gamer) => {
                    let member = message.guild.members.cache.get(gamer);
                    member.send(client.embed({
                        color: murderers.includes(member.id) ? colors.RED : colors.GREEN,
                        author: {
                            name: message.guild.name,
                            image: message.guild.iconURL()
                        },
                        description: server.translate(`command.murdermystery.message.you.are.${
                            murderers.includes(member.id) ? 'murderer' : 'innocent'
                        }`, message.channel.id)
                    }))
                        .catch(async (err) => {
                            await message.channel.send(client.embed({
                                color: colors.RED,
                                description: server.translate('global.not.allow.dm', member.id)
                            }));

                            try {
                                await MurderMysteryModel.destroy({ where: {id: message.channel.id}});
                                message.channel.send(client.embed({
                                    color: colors.RED,
                                    description: server.translate('global.game.ended')
                                }));
                            } catch (e) {}
                        });
                });

                await sleep(gamers.length * 100);

                embed = client.embed({
                    color: colors.GREEN,
                    title: `${server.translate('global.game.started')}`,
                    description: server.translate(
                        'command.murdermystery.message.for.guess',
                        server.prefix || Bot.DEFAULT_PREFIX
                    ),
                    fields: [
                        {
                            name: server.translate('command.murdermystery.message.count.innocent'),
                            value: (gamers.length - murderers.length).toLocaleString()
                        },
                        {
                            name: server.translate('command.murdermystery.message.count.murderer'),
                            value: murderers.length.toLocaleString()
                        }
                    ]
                });

                msg.edit(embed);
            } catch (err) {}
        });
}