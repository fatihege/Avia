import { Message, PermissionResolvable, TextChannel, Snowflake, MessageEmbed, Collection } from 'discord.js';
import Server from "../../structures/Server";
import { ExecuteFunction } from '../../interfaces/Event';
import Command from '../../interfaces/Command';
import { Bot, Language, Colors } from '../../Constants';
import validatePermissions from "../../utility/ValidatePermissions";

export const name: string = 'message';
export const execute: ExecuteFunction = async (client, message: Message) => {
    if (!message.guild) return;

    let server = await client.servers.get(message.guild.id) as Server;
    if (!server) {
        server = await client.servers.create({
            id: message.guild.id,
            prefix: Bot.DEFAULT_PREFIX,
            language: Language.DEFAULT_LANGUAGE
        } as any);
    }

    let prefix = server.prefix || Bot.DEFAULT_PREFIX;

    let args: string[] = message.content.slice(prefix.length).trim().split(/ +/g);
    const commandName: string = args.shift();
    const command: Command = client.commands.get(commandName) || client.commands.find((c) => c.aliases.includes(commandName));

    if (Bot.PREFIX_MESSAGES.includes(message.content.trim().split(/ +/g)[0])) {
        return message.channel.send(client.embed({
            color: Colors.DEFAULT,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('event.message.prefix.message', prefix),
            timestamp: new Date()
        })).catch((err) => {});
    }

    if (
        !command || !message.member || !message.author || message.author.bot ||
        !(message.channel instanceof TextChannel) || !message.content.startsWith(prefix)
    ) return;

    if (!client.cooldowns.has(command.aliases[0])) {
        client.cooldowns.set(command.aliases[0], new Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.aliases[0]);
    const cooldown = Bot.COOLDOWN;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldown;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;

            return client.tempMessage(message.channel as TextChannel, client.embed({
                color: Colors.RED,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('event.message.cooldown', commandName, timeLeft.toFixed(2))
            }), 3000);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldown);

    let {
        usage = '',
        ownerOnly = false,
        authorOnly = false,
        permissions = null,
        botPermissions = ['SEND_MESSAGES', 'EMBED_LINKS'],
        minArgs = 0,
        maxArgs = null,
    } = command;

    if (authorOnly && message.author.id != Bot.AUTHOR_ID) return;

    if (botPermissions && botPermissions.length) {
        if (typeof botPermissions === 'string' && !Array.isArray(botPermissions)) botPermissions = [botPermissions];
        if (!botPermissions.includes('EMBED_LINKS')) botPermissions.push('EMBED_LINKS');
        if (!botPermissions.includes('SEND_MESSAGES')) botPermissions.push('SEND_MESSAGES');

        validatePermissions(botPermissions, commandName);

        let messageContent = server.translate('event.message.no.permission.bot', commandName);
        let noPermission = false;
        let bot = client.guilds.cache.get(message.guild.id as Snowflake).members.cache.get(client.user.id as Snowflake);

        for (const permission of botPermissions) {
            if (!bot.hasPermission(permission as PermissionResolvable)) {
                messageContent += `**${server.translate(`global.permissions.${permission}`)}**\n`;
                noPermission = true;
            }
        }

        if (noPermission) {
            let embed: MessageEmbed = client.embed({
                color: Colors.RED,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: messageContent,
                footer: {
                    text: message.guild.name,
                    image: message.guild.iconURL()
                }
            });
            return message.channel.send(embed)
                .catch((e) => {
                    return message.guild.owner.createDM()
                        .then((c) => c.send(embed))
                        .catch((e) => {});
                });
        }
    }

    if (ownerOnly && message.author.id != message.guild.ownerID) {
        return message.channel.send(client.embed({
            color: Colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('event.message.only.owner', commandName, message.guild.ownerID)
        }));
    }

    if (permissions && permissions.length) {
        if (typeof permissions === 'string' && !Array.isArray(permissions)) permissions = [permissions];
        validatePermissions(permissions, commandName);
        let messageContent = server.translate('event.message.no.permission.member', commandName);
        let noPermission = false;

        for (const permission of permissions) {
            if (!message.member.hasPermission(permission as PermissionResolvable)) {
                messageContent += server.translate(`global.permissions.${permission}`) + '\n';
                noPermission = true;
            }
        }

        message.member.roles.cache.map((r) => {
            if (r.name === Bot.PERMISSION_ROLE) noPermission = false;
        });

        if (noPermission) {
            return message.channel.send(client.embed({
                color: Colors.RED,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: messageContent
            }));
        }
    }

    if (
        args.length < minArgs ||
        (
            maxArgs !== null && args.length > maxArgs
        )
    ) {
        return message.channel.send(client.embed({
            color: Colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate(
                'event.message.incorrect.syntax',
                commandName,
                prefix,
                server.translate(usage)
            )
        }));
    }

    try {
        await command.execute(client, server, message, args, Colors);
    } catch (err) {
        console.error(`${commandName} | ERROR:`, err);
        message.channel.send(client.errorEmbed(server.language, message.guild, err));
    }
}