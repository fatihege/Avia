import wio from 'wio.db';
import { MessageEmbed } from 'discord.js';
import ytdl from 'ytdl-core';
import { Colors } from '../Constants';
import { getConnection, setStreamDispatcher, getStreamDispatcher } from './VoiceConnection';

const videoPlayer = async (client, guild, song, seek: number = null) => {
    const connection = getConnection(guild.id);
    let songQueue = await wio.fetch(`queue_${guild.id}`);
    songQueue.playing = true;
    await wio.set(`queue_${guild.id}`, songQueue);
    const textChannel = await client.channels.fetch(songQueue.textChannel);

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
                value: `[${song.title}](${song.url})`
            },
            {
                name: 'Süre',
                value: song.duration
            }
        ]
    });

    if (!seek) {
        textChannel.send(embed);
    }

    const stream = ytdl(song.url, { filter: 'audioonly' });
    const streamDispatcher = connection.play(stream, { seek: seek ? seek / 1000 : 0, volume: 1 })
        .on('finish', async () => {
            songQueue = await wio.fetch(`queue_${guild.id}`);
            songQueue.playing = false;
            songQueue.paused = false;
            songQueue.pausedTime = null;
            songQueue.order = (songQueue.order + 1 >= songQueue.songs.length) ? 0 : songQueue.order + 1;
            if (!songQueue.loop) {
                songQueue.songs.shift();
                songQueue.order = songQueue.order - 1 < 0 ? 0 : songQueue.order - 1;
            }
            await wio.set(`queue_${guild.id}`, songQueue);
            videoPlayer(client, guild, songQueue.songs[songQueue.order]);
        });

    setStreamDispatcher(guild.id, streamDispatcher);

    return true;
}

export default videoPlayer;
