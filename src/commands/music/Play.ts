import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import TimeConvert from '../../utility/TimeConvert';
import videoPlayer from '../../utility/VideoPlayer';
import videoFinder from '../../utility/VideoFinder';
import { ExecuteFunction } from '../../interfaces/Command';
import { Emoji } from '../../Constants';
import ytdl from 'ytdl-core';
import { setConnection } from '../../utility/VoiceConnection';
import escapeMarkdown from '../../utility/EscapeMarkdown';

export const aliases: string[] = ['play', 'pl', 'oynat'];
export const description: string = 'command.play.description';
export const category: string = 'category.music';
export const usage: string = 'command.play.usage';
export const examples: string[] = ['https://www.youtube.com/watch?v=lorem', 'Lorem ipsum'];
export const minArgs: number = 1;
export const botPermissions: string[] = ['CONNECT', 'SPEAK'];
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const voiceChannel: VoiceChannel = message.member.voice.channel;
    let song = null;
    let serverQueue = await wio.fetch(`queue_${message.guild.id}`);

    if (serverQueue && serverQueue.voiceChannel != voiceChannel.id) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('global.music.stream.on.another.channel')
        });

        message.channel.send(embed);
        return;
    }

    if (!voiceChannel) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('global.music.connect.a.channel')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    embed = client.embed({
        color: colors.BLUE,
        description: `${Emoji.MAG_RIGHT} ${server.translate('global.music.searching')}`
    });

    const infoMessage = await message.channel.send(embed);

    if (ytdl.validateURL(args[0])) {
        let result;

        try {
            result = await ytdl.getInfo(args[0]);

            song = {
                id: serverQueue && serverQueue.songs.length ? serverQueue.songs[serverQueue.songs.length - 1].id + 1 : 0,
                title: result.videoDetails.title,
                url: result.videoDetails.video_url,
                image: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url,
                duration: TimeConvert(server.language, parseInt(result.videoDetails.lengthSeconds) * 1000).toTimestamp()
            };
        } catch (e) {
            embed = client.embed({
                color: colors.RED,
                description: server.translate('global.music.no.results.found')
            });

            infoMessage.edit(embed);
        }
    } else {
        try {
            const result: any = await videoFinder(args.join(' '));

            song = {
                id: serverQueue && serverQueue.songs.length ? serverQueue.songs[serverQueue.songs.length - 1].id + 1 : 0,
                title: result.title,
                url: result.url,
                image: result.image,
                duration: result.duration.timestamp
            };
        } catch (e) {
            embed = client.embed({
                color: colors.RED,
                description: server.translate('global.music.no.results.found')
            });

            infoMessage.edit(embed);
        }
    }

    if (!song) return;

    if (!serverQueue) {
        let queueConstructor = {
            voiceChannel: voiceChannel.id,
            textChannel: message.channel.id,
            playing: false,
            order: 0,
            loopSong: null,
            loop: false,
            paused: false,
            pausedTime: null,
            volume: 1,
            songs: [song]
        };

        await wio.set(`queue_${message.guild.id}`, queueConstructor);
        let playing: boolean;

        try {
            const connection = await voiceChannel.join();
            setConnection(message.guild.id, connection);
            playing = await videoPlayer(client, message.guild, server.language, queueConstructor.songs[0]);

            if (playing) {
                infoMessage.delete();
            }
        } catch (e) {
            console.error(e);

            await wio.delete(`queue_${message.guild.id}`);
            embed = client.embed({
                color: colors.RED,
                description: server.translate('global.music.connection.problem')
            });

            message.channel.send(embed);
        }
    } else {
        let serverQueue = await wio.fetch(`queue_${message.guild.id}`);

        if (serverQueue.songs.length + 1 > 15) {
            embed = client.embed({
                color: colors.RED,
                description: server.translate('command.play.message.max.queue.length')
            });

            return client.tempMessage(message.channel as TextChannel, embed, 10000);
        }

        let queueConstructor = {
            voiceChannel: voiceChannel.id,
            textChannel: message.channel.id,
            playing: !!serverQueue.playing,
            order: serverQueue.order || 0,
            loopSong: serverQueue.loopSong || null,
            loop: !!serverQueue.loop,
            paused: serverQueue.paused,
            pausedTime: serverQueue.pausedTime || null,
            volume: serverQueue.volume || 1,
            songs: (serverQueue &&
                serverQueue.songs.length) ? [
                ...serverQueue.songs,
                song
            ] : [song]
        };

        await wio.set(`queue_${message.guild.id}`, queueConstructor);

        embed = client.embed({
            color: colors.GREEN,
            thumbnail: song.image,
            fields: [
                {
                    name: server.translate('global.music.added.to.queue'),
                    value: `[${escapeMarkdown(song.title)}](${song.url})`
                },
                {
                    name: server.translate('global.music.duration'),
                    value: song.duration
                },
                {
                    name: server.translate('global.music.order'),
                    value: queueConstructor.songs.length
                }
            ]
        });

        return infoMessage.edit(embed);
    }
}
