import wio from 'wio.db';
import { MessageEmbed } from 'discord.js';
import ytdl from 'ytdl-core';
import { Colors } from '../Constants';
import streamFinish from './StreamFinish';
import escapeMarkdown from './EscapeMarkdown';
import { getConnection, setStreamDispatcher, getStreamDispatcher } from './VoiceConnection';
import LanguageManager from "../language/LanguageManager";

const videoPlayer = async (client, guild, language, song, seek: number = null): Promise<boolean> => {
    const connection = getConnection(guild.id);
    let serverQueue = await wio.fetch(`queue_${guild.id}`);
    serverQueue.playing = true;
    await wio.set(`queue_${guild.id}`, serverQueue);
    const textChannel = await client.channels.fetch(serverQueue.textChannel);

    if (!song) {
        serverQueue.playing = false;
        serverQueue.paused = false;
        serverQueue.pausedTime = null;
        serverQueue.songs = [];
        await wio.set(`queue_${guild.id}`, serverQueue);

        let embed: MessageEmbed = client.embed({
            color: Colors.BLUE,
            description: LanguageManager.translate(language, 'global.music.queue.finish')
        });
        textChannel.send(embed);
        if (getStreamDispatcher(guild.id)) {
            try {
                const streamDispatcher = getStreamDispatcher(guild.id);
                streamDispatcher.pause(true);
            } catch (e) {
                console.error(e);
            }
        }
        return false;
    }

    let embed: MessageEmbed = client.embed({
        color: Colors.GREEN,
        thumbnail: song.image,
        fields: [
            {
                name: LanguageManager.translate(language, 'global.music.now.playing'),
                value: `[${escapeMarkdown(song.title)}](${song.url})`
            },
            {
                name: LanguageManager.translate(language, 'global.music.duration'),
                value: song.duration
            },
            {
                name: LanguageManager.translate(language, 'global.music.order'),
                value: serverQueue.order + 1
            }
        ]
    });

    if (!seek) {
        textChannel.send(embed);
    }

    const stream = ytdl(song.url, { filter: 'audioonly' });
    const streamDispatcher = connection.play(stream, { seek: seek ? seek / 1000 : 0, volume: serverQueue.volume || 1 })
        .on('finish', async () => {
            await streamFinish(serverQueue, client, guild, language);
        });

    setStreamDispatcher(guild.id, streamDispatcher);

    return true;
}

export default videoPlayer;
