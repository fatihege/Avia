import wio from 'wio.db';
import videoPlayer from './VideoPlayer';

export default async (songQueue, client, guild) => {
    songQueue = await wio.fetch(`queue_${guild.id}`);
    songQueue.playing = false;
    songQueue.paused = false;
    songQueue.pausedTime = null;
    if (typeof songQueue.loopSong !== 'number') {
        songQueue.order = (songQueue.order + 1 >= songQueue.songs.length) ? 0 : songQueue.order + 1;
        if (!songQueue.loop) {
            songQueue.songs.shift();
            songQueue.order = songQueue.order - 1 < 0 ? 0 : songQueue.order - 1;
        }
    }
    await wio.set(`queue_${guild.id}`, songQueue);
    videoPlayer(client, guild, songQueue.songs[songQueue.order]);
}