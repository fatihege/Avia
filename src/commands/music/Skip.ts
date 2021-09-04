import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { getConnection } from '../../utility/VoiceConnection';
import videoPlayer from '../../utility/VideoPlayer';
import { Emoji } from '../../Constants';

export const aliases: string[] = ['skip', 's', 'atla', 'a'];
export const description: string = 'command.skip.description'
export const category: string = 'category.music';
export const botPermissions: string[] = ['CONNECT', 'SPEAK'];
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const voiceChannel: VoiceChannel = message.member.voice.channel;
    let serverQueue = await wio.fetch(`queue_${message.guild.id}`);

    if (!serverQueue || !serverQueue.songs.length || !getConnection(message.guild.id)) {
        embed = client.embed({
            color: colors.RED,
            description: 'Bu sunucuya ait bir oynatma listesi bulunamadı.'
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

    if (voiceChannel.id != serverQueue.voiceChannel) {
        embed = client.embed({
            color: colors.RED,
            description: 'Sizin bulunduğunuz kanalda müzik oynatılmıyor.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    let order: number = serverQueue.order + 1;
    if (serverQueue.loop && order + 1 > serverQueue.songs.length) {
        order = 0;
    }

    serverQueue.order = order;
    serverQueue.textChannel = message.channel.id;
    serverQueue.paused = false;
    await wio.set(`queue_${message.guild.id}`, serverQueue);
    videoPlayer(client, message.guild, serverQueue.songs[order]);

    try {
        await message.react(Emoji.THUMBSUP);
    } catch (e) {}
}
