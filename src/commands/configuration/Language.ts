import { MessageEmbed, TextChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { Bot, Colors, Language as LanguageConstant } from '../../Constants';
import Language from '../../language/Language';
import LanguageManager from '../../language/LanguageManager';

export const aliases: string[] = ['language', 'dil'];
export const description: string = 'command.language.description'
export const category: string = 'category.configuration';
export const usage: string = 'command.language.usage';
export const examples: string[] = ['', 'tr_TR', 'default'];
export const maxArgs: number = 1;
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    if (!args[0]) {
        embed = client.embed({
            color: colors.DEFAULT,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: `${
                LanguageManager.getLanguages().map((lang) => {
                    return `${lang.emoji} **${lang.name}** **—** \`${lang.code}\``
                }).join('\n')
            }`
        });

        return message.channel.send(embed);
    }

    if (
        !message.member.hasPermission('MANAGE_GUILD') &&
        !message.member.roles.cache.find((r) => r.name === Bot.PERMISSION_ROLE)
    ) {
        let messageContent: string = server.translate('event.message.no.permission.member', 'language');

        messageContent += server.translate(`global.permissions.MANAGE_GUILD`) + '\n';

        return message.channel.send(client.embed({
            color: Colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: messageContent
        }));
    }

    let language: Language = LanguageManager.includes(args[0]);

    if (args[0] === 'default') language = LanguageManager.getLanguage(LanguageConstant.DEFAULT_LANGUAGE);

    if (!language) {
        embed = client.embed({
            color: colors.GREEN,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('global.not.found.language')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    try {
        await server.setLanguage(language);

        embed = client.embed({
            color: colors.GREEN,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: `${language.emoji} ${
                server.translate('command.language.message.successful', language.name, language.code)
            }`
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    } catch (err) {
        message.channel.send(client.errorEmbed(server.language, message.guild, err));
    }
}
