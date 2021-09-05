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
            description: 'Bu sunucuya ait bir oynatma listesi bulunamadı.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (!voiceChannel) {
        embed = client.embed({
            color: colors.RED,
            description: 'Lütfen bir ses kanalına bağlanın.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (voiceChannel.id != serverQueue.voiceChannel) {
        embed = client.embed({
            color: colors.RED,
            description: 'Sizin bulunduğunuz kanalda müzik oynatılmıyor.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    embed = client.embed({
        color: colors.BLUE,
        title: `Şarkı Listesi - ${serverQueue.songs.length} şarkı`,
    });
    embed.setDescription('');
    serverQueue.songs.map((s, i) => {
        embed.description += `**${i + 1})** [${escapeMarkdown(s.title)}](${s.url})\n`;
    });
    embed.description += `\n\nŞarkı listesi döngüsü: **
    ${serverQueue.loop ? 'Açık' : 'Kapalı'}**\nŞarkı döngüsü: **${typeof serverQueue.loopSong === 'number' ? 'Açık' : 'Kapalı'}**`;

    message.channel.send(embed);
}
