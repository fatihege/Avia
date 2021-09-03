import wio from 'wio.db';
import { MessageEmbed } from 'discord.js';
import ytdl from 'ytdl-core';
import { Colors } from '../Constants';
import { getConnection } from './VoiceConnection';

const videoPlayer = async (client, infoMessage, guild, song) => {
    const connection = getConnection(guild.id);
    let songQueue = await wio.fetch(`queue_${guild.id}`);
    songQueue.playing = true;
    await wio.set(`queue_${guild.id}`, songQueue);
    const textChannel = await client.channels.fetch(songQueue.textChannel);
    const voiceChannel = await client.channels.fetch(songQueue.voiceChannel);

    if (!song) {
        await wio.delete(`queue_${guild.id}`);

        let embed: MessageEmbed = client.embed({
            color: Colors.BLUE,
            description: `Kuyruktaki bütün şarkılar oynatıldı.`
        });
        textChannel.send(embed);
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

    textChannel.send(embed);

    const stream = ytdl(song.url, { filter: 'audioonly' });

    connection.play(stream, { seek: 0, volume: 1 })
        .on('finish', async () => {
            songQueue = await wio.fetch(`queue_${guild.id}`);
            songQueue.playing = false;
            songQueue.order = (songQueue.order + 1 >= songQueue.songs.length) ? 0 : songQueue.order + 1;
            if (!songQueue.loop) {
                songQueue.songs.shift();
                songQueue.order = songQueue.order - 1 < 0 ? 0 : songQueue.order - 1;
            }
            console.log(songQueue.order);
            await wio.set(`queue_${guild.id}`, songQueue);
            videoPlayer(client, infoMessage, guild, songQueue.songs[songQueue.order]);
        });

    return true;
}

export default videoPlayer;
