import { MessageEmbed } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { Bot, Emoji } from '../../Constants';

export const aliases: string[] = ['invite', 'davet'];
export const description: string = 'command.invite.description';
export const category: string = 'category.information';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    embed = client.embed({
        color: colors.BLUE,
        author: {
            name: client.user.username,
            image: client.user.displayAvatarURL()
        },
        fields: [
            {
                name: `${Emoji.ROUND_PUSHPIN} ${server.translate('command.invite.message.invite.url.title')}`,
                value: `[${server.translate('command.invite.message.invite.url.description')}](${Bot.INVITE_URL})`
            },
            // {
            //     name: `${Emoji.PARTYING_FACE} ${server.translate('global.support.server')}`,
            //     value: `[${server.translate('command.invite.message.support.server.description')}](${Bot.SUPPORT_URL})`
            // },
            // {
            //     name: `${Emoji.GEM} ${server.translate('command.invite.message.top.gg.title')}`,
            //     value: `[${server.translate('command.invite.message.top.gg.description')}](${Bot.TOP_GG})`
            // },
            // {
            //     name: `${Emoji.OPEN_FILE_FOLDER} ${server.translate('command.invite.message.open.source.title')}`,
            //     value: `[${server.translate('command.invite.message.open.source.description')}](${Bot.GITHUB})`
            // }
        ]
    });

    message.channel.send(embed);
}