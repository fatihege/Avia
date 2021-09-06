import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { getConnection } from '../../utility/VoiceConnection';
import streamFinish from '../../utility/StreamFinish';
import { Emoji } from '../../Constants';

export const aliases: string[] = ['skip', 's', 'atla', 'a'];
export const description: string = 'command.skip.description';
export const category: string = 'category.music';
export const botPermissions: string[] = ['CONNECT', 'SPEAK', 'ADD_REACTIONS'];
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
    serverQueue.loopSong = null;
    await wio.set(`queue_${message.guild.id}`, serverQueue);

    streamFinish(serverQueue, client, message.guild);

    try {
        await message.react(Emoji.THUMBSUP);
    } catch (e) {}
}
