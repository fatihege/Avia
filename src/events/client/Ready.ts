import wio from 'wio.db';
import { TextChannel, VoiceChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Event';
import { Bot, Colors, Emoji } from '../../Constants';
import ServerModel from '../../models/Server';
import videoPlayer from '../../utility/VideoPlayer';
import { setConnection } from '../../utility/VoiceConnection';

export const name: string = 'ready';
export const execute: ExecuteFunction = async (client) => {
    let guildCount: number = (await client.shard.fetchClientValues('guilds.cache.size')).reduce((a, b) => a + b, 0);
    client.user.setActivity(`${Bot.PREFIX_MESSAGES[0]} | ${guildCount} Servers`, { type: 'PLAYING' });

    const guilds = (await client.shard.fetchClientValues('guilds.cache'))[0];
    guilds.map(async (g) => {
        let server = await ServerModel.findOne({ where: { id: g.id } });
        let serverQueue = await wio.fetch(`queue_${g.id}`);

        if (!server) {
            await ServerModel.create({ id: g.id });
        }

        if (serverQueue && serverQueue.playing === true && serverQueue.songs.length) {
            const textChannel = await client.channels.fetch(serverQueue.textChannel) as TextChannel;
            const voiceChannel = await client.channels.fetch(serverQueue.voiceChannel) as VoiceChannel;
            let embed = client.embed({
                color: Colors.GREEN,
                author: {
                    name: client.user.tag,
                    image: client.user.displayAvatarURL()
                },
                description: 'Yeniden bağlanıldı.',
            });
            await textChannel.send(embed);

            embed = client.embed({
                color: Colors.BLUE,
                author: {
                    name: client.user.tag,
                    image: client.user.displayAvatarURL()
                },
                description: `${Emoji.MAG_RIGHT} Sıradaki şarkı bulunuyor...`,
            });
            let playing: boolean;
            const infoMessage = await textChannel.send(embed);
            try {
                const connection = await voiceChannel.join();
                setConnection(g.id, connection);
                playing = await videoPlayer(client, infoMessage, g, serverQueue.songs[serverQueue.order]);
            } catch (e) {
                console.error(e);
            }

            if (playing) {
                infoMessage.delete();
            }
        }
    });
}