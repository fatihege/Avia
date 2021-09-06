import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { getConnection, getStreamDispatcher } from '../../utility/VoiceConnection';
import escapeMarkdown from '../../utility/EscapeMarkdown';
import timeConvert from '../../utility/TimeConvert';

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
            description: server.translate('global.music.no.queue')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (!voiceChannel) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('global.music.connect.a.channel')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (voiceChannel.id != serverQueue.voiceChannel) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('global.music.no.music.playing.on.your.channel')
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
                name: server.translate('command.nowplaying.message.now.playing'),
                value: `[${escapeMarkdown(song.title)}](${song.url})`
            },
            {
                name: server.translate('global.music.total.duration'),
                value: song.duration
            },
            {
                name: server.translate('command.nowplaying.message.current.time'),
                value: timeConvert(server.language, serverQueue.paused ? (serverQueue.pausedTime ? serverQueue.pausedTime : 0) : (streamDispatcher.streamTime + (serverQueue.pausedTime ? serverQueue.pausedTime : 0))).toTimestamp()
            }
        ]
    });

    message.channel.send(embed);
}
