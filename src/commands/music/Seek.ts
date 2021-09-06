import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import timeConvert from '../../utility/TimeConvert';
import videoPlayer from '../../utility/VideoPlayer';
import { ExecuteFunction } from '../../interfaces/Command';
import { getConnection, getStreamDispatcher } from '../../utility/VoiceConnection';

export const aliases: string[] = ['seek', 'süre'];
export const description: string = 'command.seek.description';
export const category: string = 'category.music';
export const usage: string = 'command.seek.usage';
export const examples: string[] = ['50', '120'];
export const minArgs: number = 1;
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

    const seek: number = parseInt(args[0]);

    if (isNaN(seek)) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('global.enter.number')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (seek < 0) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('command.seek.message.min')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    serverQueue.textChannel = message.channel.id;
    await wio.set(`queue_${message.guild.id}`, serverQueue);

    const streamDispatcher = getStreamDispatcher(message.guild.id);

    try {
        streamDispatcher.pause(true);
    } catch (e) {}

    videoPlayer(client, message.guild, server.language, serverQueue.songs[serverQueue.order], seek * 1000);

    embed = client.embed({
        color: colors.BLUE,
        description: server.translate('command.seek.message.continues.from', timeConvert(server.language, seek * 1000).toTimestamp())
    });

    message.channel.send(embed);
}
