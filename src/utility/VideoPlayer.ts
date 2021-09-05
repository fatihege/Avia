import wio from 'wio.db';
import { MessageEmbed } from 'discord.js';
import ytdl from 'ytdl-core';
import { Colors } from '../Constants';
import streamFinish from './StreamFinish';
import escapeMarkdown from './EscapeMarkdown';
import { getConnection, setStreamDispatcher, getStreamDispatcher, setConnection } from './VoiceConnection';

const videoPlayer = async (client, guild, song, seek: number = null): Promise<boolean> => {
    const connection = getConnection(guild.id);
    let serverQueue = await wio.fetch(`queue_${guild.id}`);
    serverQueue.playing = true;
    await wio.set(`queue_${guild.id}`, serverQueue);
    const textChannel = await client.channels.fetch(serverQueue.textChannel);

    if (!song) {
        await wio.delete(`queue_${guild.id}`);

        let embed: MessageEmbed = client.embed({
            color: Colors.BLUE,
            description: `Kuyruktaki bütün şarkılar oynatıldı.`
        });
        textChannel.send(embed);
        if (getStreamDispatcher(guild.id)) {
            try {
                const streamDispatcher = getStreamDispatcher(guild.id);
                streamDispatcher.pause();
                setStreamDispatcher(guild.id, null);
                setConnection(guild.id, null);
            } catch (e) {
                console.error(e)
            }
        }
        return false;
    }

    let embed: MessageEmbed = client.embed({
        color: Colors.GREEN,
        thumbnail: song.image,
        fields: [
            {
                name: 'Şu an oynatılıyor',
                value: `[${escapeMarkdown(song.title)}](${song.url})`
            },
            {
                name: 'Süre',
                value: song.duration
            },
            {
                name: 'Sıra',
                value: serverQueue.order + 1
            }
        ]
    });

    if (!seek) {
        textChannel.send(embed);
    }

    const stream = ytdl(song.url, { filter: 'audioonly' });
    const streamDispatcher = connection.play(stream, { seek: seek ? seek / 1000 : 0 })
        .on('finish', async () => {
            await streamFinish(serverQueue, client, guild);
        });

    setStreamDispatcher(guild.id, streamDispatcher);

    return true;
}

export default videoPlayer;
