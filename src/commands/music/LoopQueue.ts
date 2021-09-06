import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { Emoji } from '../../Constants';
import { getConnection } from '../../utility/VoiceConnection';

export const aliases: string[] = ['loopqueue', 'lq', 'sıradöngüsü', 'q24/7'];
export const description: string = 'command.loopqueue.description';
export const category: string = 'category.music';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const voiceChannel: VoiceChannel = message.member.voice.channel;
    let serverQueue = await wio.fetch(`queue_${message.guild.id}`);

    if (!serverQueue || !serverQueue.songs.length || !getConnection(message.guild.id)) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('global.music.no.queue')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (!voiceChannel) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('global.music.connect.a.channel')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (voiceChannel.id != serverQueue.voiceChannel) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('global.music.no.music.playing.on.your.channel')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    const currentSong = serverQueue.songs[serverQueue.order];
    const firstLength = serverQueue.songs.length;
    let lastLength: number = firstLength;
    serverQueue.loop = !serverQueue.loop;

    if (!serverQueue.loop) {
        serverQueue.songs = serverQueue.songs.filter((s) => s.id >= currentSong.id);
    }

    lastLength = serverQueue.songs.length;
    serverQueue.order = Math.abs(serverQueue.order - (firstLength - lastLength));
    serverQueue.loopSong = !serverQueue.loop ? (typeof serverQueue.loopSong === 'number' ? serverQueue.order : null) : serverQueue.loopSong;
    serverQueue.textChannel = message.channel.id;
    await wio.set(`queue_${message.guild.id}`, serverQueue);

    try {
        await message.react(Emoji.THUMBSUP);
        embed = client.embed({
            color: serverQueue.loop ? colors.GREEN : colors.RED,
            description: serverQueue.loop ? server.translate('command.loopqueue.message.opened') : server.translate('command.loopqueue.message.closed')
        });
        message.channel.send(embed);
    } catch (e) {}
}