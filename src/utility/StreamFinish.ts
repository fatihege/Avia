import wio from 'wio.db';
import videoPlayer from './VideoPlayer';

export default async (serverQueue, client, guild, language, order: number = null) => {
    serverQueue = await wio.fetch(`queue_${guild.id}`);
    serverQueue.playing = false;
    serverQueue.paused = false;
    serverQueue.pausedTime = null;

    if (typeof serverQueue.loopSong !== 'number' && !order) {
        if (!serverQueue.loop && serverQueue.order + 1 >= serverQueue.songs.length) {
            serverQueue.songs = [];
            serverQueue.order = 0;
        } else {
            serverQueue.order = (serverQueue.order + 1 >= serverQueue.songs.length) ? 0 : serverQueue.order + 1;
        }
    }

    await wio.set(`queue_${guild.id}`, serverQueue);
    videoPlayer(client, guild, language, serverQueue.songs[typeof order === 'number' ? order : serverQueue.order]);
}