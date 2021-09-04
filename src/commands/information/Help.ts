import {MessageEmbed} from 'discord.js';
import Command, {ExecuteFunction} from '../../interfaces/Command';
import {Bot, Emoji} from '../../Constants';

export const aliases: string[] = ['help', 'yardım'];
export const description: string = 'command.help.description'
export const category: string = 'category.information';
export const usage: string = 'command.help.usage';
export const examples: string[] = ['', 'ping'];
export const maxArgs: number = 1;
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const selectedCommand: Command = args[0] ?
        (client.commands.find((c) => c.aliases.includes(args[0])) || null) : null;

    if (!selectedCommand) {
        let categories: any[] = [];

        client.commands.map((c) => {
            if (!categories[server.translate(`${c.category}.code`)]) {
                categories[server.translate(`${c.category}.code`)] = [];
                categories[server.translate(`${c.category}.code`)].code = `category.${
                    server.translate(`${c.category}.code`)
                }`;
                categories[server.translate(`${c.category}.code`)].commands = [];
            }

            if (!categories[server.translate(`${c.category}.code`)][c.aliases[0]] && c.authorOnly !== true) {
                categories[server.translate(`${c.category}.code`)].commands.push(c.aliases[0]);
            }
        });

        categories = Object.values(categories);

        embed = client.embed({
            color: colors.DEFAULT,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            footer: {
                text: server.translate('command.help.message.for.more', server.prefix || Bot.DEFAULT_PREFIX)
            },
            timestamp: new Date()
        });

        categories.map((c) => {
            embed.addField(
                `${Emoji.CATEGORY[c.code.replace('category.', '')] || ''} ${server.translate(`${c.code}.name`)}`,
                `\`${c.commands.join('`**,** `')}\``
            );
        });
    } else {
        let alias: string = (!Array.isArray(selectedCommand.aliases) && typeof selectedCommand.aliases === 'string') ?
            selectedCommand.aliases : selectedCommand.aliases[0];

        embed = client.embed({
            color: colors.DEFAULT,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.help.message.note'),
            fields: [
                {
                    name: server.translate('global.command.aliases'),
                    value: (!Array.isArray(selectedCommand.aliases) && typeof selectedCommand.aliases === 'string') ?
                        selectedCommand.aliases : selectedCommand.aliases.join('\n')
                },
                {
                    name: server.translate('global.command.description'),
                    value: server.translate(selectedCommand.description)
                },
                {
                    name: server.translate('global.command.category'),
                    value: server.translate(`${selectedCommand.category}.name`)
                },
                {
                    name: server.translate('global.command.usage'),
                    value: `\`${server.prefix || Bot.DEFAULT_PREFIX}${
                        (!Array.isArray(selectedCommand.aliases) && typeof selectedCommand.aliases === 'string') ?
                            selectedCommand.aliases :
                            selectedCommand.aliases[0]}${server.translate(selectedCommand.usage)
                        ? ' ' + server.translate(selectedCommand.usage) : ''
                    }\``
                }
            ],
            timestamp: new Date()
        });

        if (selectedCommand.examples && selectedCommand.examples.length) {
            let examples = [];

            if ((!Array.isArray(selectedCommand.examples) && typeof selectedCommand.examples === 'string')) {
                examples.push(`${server.prefix || Bot.DEFAULT_PREFIX}${alias} ${selectedCommand.examples}`);
            } else {
                selectedCommand.examples.map((e) => {
                    examples.push(`${server.prefix || Bot.DEFAULT_PREFIX}${alias} ${e}`);
                });
            }

            embed.addField(
                server.translate('global.command.examples'),
                `\`\`\`\n${examples.join('\n')}\n\`\`\``
            );
        }

        if (selectedCommand.permissions && selectedCommand.permissions.length) {
            let requiredPermissions = [];

            if (!Array.isArray(selectedCommand.permissions) && typeof selectedCommand.permissions === 'string') {
                requiredPermissions.push(server.translate(`global.permissions.${selectedCommand.permissions}`));
            } else {
                selectedCommand.permissions.map((p) => {
                    requiredPermissions.push(server.translate(`global.permissions.${p}`))
                });
            }

            embed.addField(
                server.translate('global.command.permissions'),
                requiredPermissions.join('\n')
            );
        }
    }

    message.channel.send(embed);
}
