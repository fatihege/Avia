import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { getConnection } from '../../utility/VoiceConnection';
import { Emoji } from '../../Constants';
import videoPlayer from '../../utility/VideoPlayer';

export const aliases: string[] = ['resume', 'r', 'devamet', 'de'];
export const description: string = 'command.resume.description'
export const category: string = 'category.music';
export const botPermissions: string[] = ['CONNECT', 'SPEAK'];
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const voiceChannel: VoiceChannel = message.member.voice.channel;
    let serverQueue = await wio.fetch(`queue_${message.guild.id}`);
    const connection = getConnection(message.guild.id);

    if (!serverQueue || !serverQueue.songs.length || !connection) {
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

    if (!serverQueue.paused) {
        embed = client.embed({
            color: colors.RED,
            description: 'Bu müzik durdurulmamış.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    serverQueue.paused = false;
    serverQueue.textChannel = message.channel.id;
    await wio.set(`queue_${message.guild.id}`, serverQueue);

    embed = client.embed({
        color: colors.GREEN,
        description: `${Emoji.ARROW_FORWARD} Müzik devam ediyor...`
    });

    message.channel.send(embed);

    videoPlayer(client, message.guild, serverQueue.songs[serverQueue.order], serverQueue.pausedTime);
}
