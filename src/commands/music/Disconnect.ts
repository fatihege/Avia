import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { getConnection, setConnection } from '../../utility/VoiceConnection';

export const aliases: string[] = ['disconnect', 'bağlantıyıkes'];
export const description: string = 'command.disconnect.description';
export const category: string = 'category.music';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const voiceChannel: VoiceChannel = message.member.voice.channel;
    const serverQueue = await wio.fetch(`queue_${message.guild.id}`);

    if (!getConnection(message.guild.id) || !serverQueue) {
        embed = client.embed({
            color: colors.RED,
            description: 'Herhangi bir ses kanalı bağlantısı yok.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (!voiceChannel) {
        embed = client.embed({
            color: colors.RED,
            description: 'Lütfen bir ses kanalına bağlanın.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (serverQueue.voiceChannel != voiceChannel.id) {
        embed = client.embed({
            color: colors.RED,
            description: 'Sizin bulunduğunuz kanalda müzik oynatılmıyor.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    try {
        const connection = getConnection(message.guild.id);
        connection.disconnect();
        await wio.delete(`queue_${message.guild.id}`);
        setConnection(message.guild.id, null);
        embed = client.embed({
            color: colors.GREEN,
            description: 'Ses kanalı bağlantısı kesildi.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    } catch (e) {
        console.error(e)
    }
}
