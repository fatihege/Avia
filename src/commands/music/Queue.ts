import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { getConnection } from '../../utility/VoiceConnection';
import escapeMarkdown from '../../utility/EscapeMarkdown';

export const aliases: string[] = ['queue', 'q', 'liste'];
export const description: string = 'command.queue.description';
export const category: string = 'category.music';
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

    embed = client.embed({
        color: colors.BLUE,
        title: server.translate('command.queue.message.music.list', serverQueue.songs.length),
    });
    embed.setDescription('');
    serverQueue.songs.map((s, i) => {
        embed.description += serverQueue.order === i ? `**${i + 1}) [${escapeMarkdown(s.title)}](${s.url})**\n` :
            `**${i + 1})** [${escapeMarkdown(s.title)}](${s.url})\n`;
    });
    const queueLoopStatus = serverQueue.loop ? server.translate('global.opened') :
        server.translate('global.closed');
    const songLoopStatus = typeof serverQueue.loopSong === 'number' ? server.translate('global.opened') :
        server.translate('global.closed');
    embed.description += `\n${server.translate('command.queue.message.details', queueLoopStatus, songLoopStatus)}`;

    message.channel.send(embed);
}
