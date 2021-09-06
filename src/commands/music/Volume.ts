import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { Emoji } from '../../Constants';
import { getConnection, getStreamDispatcher } from '../../utility/VoiceConnection';

export const aliases: string[] = ['volume', 'vol', 'ses'];
export const description: string = 'command.volume.description';
export const category: string = 'category.music';
export const usage: string = 'command.volume.usage';
export const examples: string[] = ['50', '200', '0'];
export const maxArgs: number = 1;
export const botPermissions: string[] = ['CONNECT', 'SPEAK'];
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

    serverQueue.textChannel = message.channel.id;
    await wio.set(`queue_${message.guild.id}`, serverQueue);

    const streamDispatcher = getStreamDispatcher(message.guild.id);

    if (!args[0]) {
        embed = client.embed({
            color: colors.BLUE,
            description: server.translate('command.volume.message.musics.volume', streamDispatcher.volume * 100)
        });

        return message.channel.send(embed);
    }

    const volume = parseInt(args[0]);

    if (isNaN(volume)) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('global.enter.number')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (volume < 0 || volume > 200) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('command.volume.message.range')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    try {
        streamDispatcher.setVolume(volume / 100);

        embed = client.embed({
            color: colors.BLUE,
            description: server.translate('command.volume.message.set', volume)
        });

        message.channel.send(embed);
    } catch (e) {
        embed = client.embed({
            color: colors.RED,
            description: ``
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    try {
        await message.react(Emoji.THUMBSUP);
    } catch (e) {}
}
