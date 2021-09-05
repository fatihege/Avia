import wio from 'wio.db';
import videoPlayer from './VideoPlayer';

export default async (serverQueue, client, guild, order: number = null) => {
    serverQueue = await wio.fetch(`queue_${guild.id}`);
    serverQueue.playing = false;
    serverQueue.paused = false;
    serverQueue.pausedTime = null;
    if (typeof serverQueue.loopSong !== 'number' && !order) {
        serverQueue.order = (serverQueue.order + 1 >= serverQueue.songs.length) ? 0 : serverQueue.order + 1;
        if (!serverQueue.loop) {
            serverQueue.songs.shift();
            serverQueue.order = serverQueue.order - 1 < 0 ? 0 : serverQueue.order - 1;
        }
    }
    await wio.set(`queue_${guild.id}`, serverQueue);
    videoPlayer(client, guild, serverQueue.songs[typeof order === 'number' ? order : serverQueue.order]);
}