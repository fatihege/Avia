import { MessageEmbed, TextChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import findSnowflake from '../../utility/FindSnowflake';

export const aliases: string[] = ['unban', 'yasakkaldir'];
export const description: string = 'command.unban.description';
export const usage: string = 'command.unban.usage';
export const category: string = 'category.moderation';
export const examples: string[] = ['840300297527885865', '840300297527885865 Lorem Ipsum'];
export const permissions: string = 'BAN_MEMBERS'
export const minArgs: number = 1;
export const botPermissions: string[] = ['SEND_MESSAGES', 'BAN_MEMBERS']
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    const snowflake: string = findSnowflake(message.content)[0];
    let embed: MessageEmbed = client.embed({
        color: colors.RED,
        author: {
            name: message.author.tag,
            image: message.author.displayAvatarURL()
        },
        description: server.translate('global.not.ban')
    });

    message.guild.fetchBan(snowflake)
        .then((ban) => {
            if (!ban.user.id) return client.tempMessage(message.channel as TextChannel, embed, 10000);

            message.guild.members.unban(snowflake);
            embed = client.embed({
                color: colors.GREEN,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('command.unban.message.unbanned', ban.user.tag)
            });

            client.tempMessage(message.channel as TextChannel, embed, 10000);
        })
        .catch((err) => {
            message.channel.send(client.errorEmbed(server.language, message.guild, err));
        });
}