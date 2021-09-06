import wio from 'wio.db';
import { TextChannel, VoiceChannel, Message } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Event';
import { Bot, Colors, Emoji } from '../../Constants';
import ServerModel from '../../models/Server';
import videoPlayer from '../../utility/VideoPlayer';
import { setConnection } from '../../utility/VoiceConnection';
import LanguageManager from "../../language/LanguageManager";

export const name: string = 'ready';
export const execute: ExecuteFunction = async (client) => {
    client.user.setActivity(`${Bot.PREFIX_MESSAGES[0]} | Game, moderation and music bot.`, { type: 'WATCHING' });

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
                description: LanguageManager.translate(server.language, 'event.ready.music.reconnected'),
            });
            await textChannel.send(embed);

            embed = client.embed({
                color: Colors.BLUE,
                author: {
                    name: client.user.tag,
                    image: client.user.displayAvatarURL()
                },
                description: `${Emoji.MAG_RIGHT} ${LanguageManager.translate(server.language, 'event.ready.music.finding.next.song')}`,
            });
            let playing: boolean;
            let infoMessage: Message;
            if (!serverQueue.paused) {
                infoMessage = await textChannel.send(embed);
            }
            try {
                const connection = await voiceChannel.join();
                setConnection(g.id, connection);
                if (!serverQueue.paused) {
                    playing = await videoPlayer(client, g, serverQueue.songs[serverQueue.order], serverQueue.pausedTime || 0);
                }
            } catch (e) {
                console.error(e);
            }

            if (playing) {
                try {
                    await infoMessage.delete();
                } catch (e) {}
            }
        }
    });
}