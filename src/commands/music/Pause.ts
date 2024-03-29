import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { getConnection, getStreamDispatcher } from '../../utility/VoiceConnection';
import { Emoji } from '../../Constants';

export const aliases: string[] = ['pause', 'pa', 'durdur', 'dur'];
export const description: string = 'command.pause.description';
export const category: string = 'category.music';
export const botPermissions: string[] = ['CONNECT', 'SPEAK'];
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const voiceChannel: VoiceChannel = message.member.voice.channel;
    let serverQueue = await wio.fetch(`queue_${message.guild.id}`);
    const streamDispatcher = getStreamDispatcher(message.guild.id);

    if (!serverQueue || !serverQueue.songs.length || !getConnection(message.guild.id) || !streamDispatcher) {
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

    if (serverQueue.paused) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('command.pause.message.already.paused')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    streamDispatcher.pause(true);
    serverQueue.paused = true;
    serverQueue.pausedTime = streamDispatcher.totalStreamTime + (serverQueue.pausedTime ? serverQueue.pausedTime : 0);
    serverQueue.textChannel = message.channel.id;
    await wio.set(`queue_${message.guild.id}`, serverQueue);

    embed = client.embed({
        color: colors.GREEN,
        description: `${Emoji.PAUSED_BUTTON} ${server.translate('command.pause.message.paused')}`
    });

    message.channel.send(embed);
}
