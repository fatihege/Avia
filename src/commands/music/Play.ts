import wio from 'wio.db';
import { MessageEmbed, Snowflake, TextChannel, VoiceChannel } from 'discord.js';
import TimeConvert from '../../utility/TimeConvert';
import videoPlayer from '../../utility/VideoPlayer';
import { ExecuteFunction } from '../../interfaces/Command';
import { Emoji } from '../../Constants';
import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';
import { setConnection } from '../../utility/VoiceConnection';

export const aliases: string[] = ['play', 'oynat'];
export const description: string = 'command.play.description'
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

    if (!voiceChannel) {
        embed = client.embed({
            color: colors.RED,
            description: 'Lütfen bir ses kanalına girin.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    embed = client.embed({
        color: colors.BLUE,
        description: `${Emoji.MAG_RIGHT} Arama yapılıyor...`
    });

    const infoMessage = await message.channel.send(embed);

    if (ytdl.validateURL(args[0])) {
        let result;

        try {
            result = await ytdl.getInfo(args[0]);

            song = {
                title: result.videoDetails.title,
                url: result.videoDetails.video_url,
                image: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url,
                duration: TimeConvert(server.language, parseInt(result.videoDetails.lengthSeconds) * 1000).toTimestamp()
            };
        } catch (e) {
            embed = client.embed({
                color: colors.RED,
                description: `Herhangi bir sonuç bulunamadı.`
            });

            infoMessage.edit(embed);
        }
    } else {
        const result = await videoFinder(args.join(' '));

        song = {
            title: result.title,
            url: result.url,
            image: result.image,
            duration: result.duration.timestamp
        };
    }

    if (!serverQueue) {
        let queueConstructor = {
            voiceChannel: voiceChannel.id,
            textChannel: message.channel.id,
            playing: false,
            order: 0,
            loop: true,
            songs: [song]
        };

        await wio.set(`queue_${message.guild.id}`, queueConstructor);
        let playing: boolean;

        try {
            const connection = await voiceChannel.join();
            setConnection(message.guild.id, connection);
            playing = await videoPlayer(client, infoMessage, message.guild, queueConstructor.songs[0]);

            if (playing) {
                infoMessage.delete();
            }
        } catch (e) {
            console.error(e);

            await wio.delete(`queue_${message.guild.id}`);
            embed = client.embed({
                color: colors.RED,
                description: 'Ses kanalına bağlanırken bir sorun oluştu.'
            });

            message.channel.send(embed);
        }
    } else {
        let queueConstructor = {
            voiceChannel: voiceChannel.id,
            textChannel: message.channel.id,
            playing: !!(await wio.fetch(`queue_${message.guild.id}`)).playing,
            order: (await wio.fetch(`queue_${message.guild.id}`)).order || 0,
            loop: !!(await wio.fetch(`queue_${message.guild.id}`)).loop,
            songs: ((await wio.fetch(`queue_${message.guild.id}`)) &&
                (await wio.fetch(`queue_${message.guild.id}`)).songs.length) ? [
                ...(await wio.fetch(`queue_${message.guild.id}`)).songs,
                song
            ] : [song]
        };

        await wio.set(`queue_${message.guild.id}`, queueConstructor);

        embed = client.embed({
            color: colors.GREEN,
            thumbnail: song.image,
            fields: [
                {
                    name: 'Kuyruğa eklendi',
                    value: `[${song.title}](${song.url})`
                },
                {
                    name: 'Süre',
                    value: song.duration
                }
            ]
        });
        infoMessage.edit(embed);
        return;
    }
}

const videoFinder = async (q) => {
    const videoResult = await ytSearch(q);
    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
}
