import { MessageEmbed, TextChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';

export const aliases: string[] = ['purge', 'kes'];
export const description: string = 'command.purge.description';
export const usage: string = 'command.purge.usage';
export const category: string = 'category.moderation';
export const examples: string[] = ['5'];
export const minArgs: number = 1;
export const maxArgs: number = 1;
export const permissions: string = 'MANAGE_MESSAGES';
export const botPermissions: string[] = ['SEND_MESSAGES', 'MANAGE_MESSAGES'];
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    const channel: TextChannel = message.channel as TextChannel;
    const amount: number = +args[0];
    let embed: MessageEmbed;

    if (isNaN(amount)) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.purge.message.must.be.number')
        });

        return client.tempMessage(channel, embed, 10000);
    }

    if (amount > 100 || amount < 2) {
        embed = client.embed({
            color: colors.DEFAULT,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('command.purge.message.out.of.range', amount)
        });

        return client.tempMessage(channel, embed, 10000);
    }

    channel.bulkDelete(amount)
        .then((messages) => {
            embed = client.embed({
                color: colors.GREEN,
                author: {
                    name: message.author.tag,
                    image: message.author.displayAvatarURL()
                },
                description: server.translate('command.purge.message.deleted', messages.size)
            });

            client.tempMessage(channel, embed, 10000);
        })
        .catch((err) => {
            message.channel.send(client.errorEmbed(server.language, message.guild, err));
        });
}