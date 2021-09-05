import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import TimeConvert from '../../utility/TimeConvert';
import videoPlayer from '../../utility/VideoPlayer';
import videoFinder from '../../utility/VideoFinder';
import { ExecuteFunction } from '../../interfaces/Command';
import { getConnection, getStreamDispatcher, setConnection } from '../../utility/VoiceConnection';
import escapeMarkdown from '../../utility/EscapeMarkdown';
import timeConvert from '../../utility/TimeConvert';
import streamFinish from "../../utility/StreamFinish";

export const aliases: string[] = ['nowplaying', 'np', 'şimdioynayan', 'şo'];
export const description: string = 'command.nowplaying.description';
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

    serverQueue.textChannel = message.channel.id;
    await wio.set(`queue_${message.guild.id}`, serverQueue);

    const song = serverQueue.songs[serverQueue.order];
    const streamDispatcher = getStreamDispatcher(message.guild.id);

    embed = client.embed({
        color: colors.DEFAULT,
        thumbnail: song.image,
        fields: [
            {
                name: 'Şu an oynatılıyor',
                value: `[${escapeMarkdown(song.title)}](${song.url})`
            },
            {
                name: 'Toplam süre',
                value: song.duration
            },
            {
                name: 'Şu anki süre',
                value: timeConvert(server.language, serverQueue.paused ? (serverQueue.pausedTime ? serverQueue.pausedTime : 0) : (streamDispatcher.streamTime + (serverQueue.pausedTime ? serverQueue.pausedTime : 0))).toTimestamp()
            }
        ]
    });

    message.channel.send(embed);
}
