import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { getConnection, getStreamDispatcher } from '../../utility/VoiceConnection';
import escapeMarkdown from '../../utility/EscapeMarkdown';
import streamFinish from "../../utility/StreamFinish";

export const aliases: string[] = ['remove', 'rm', 'kaldır'];
export const description: string = 'command.remove.description';
export const category: string = 'category.music';
export const usage: string = 'command.remove.usage';
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

    const songID = parseInt(args[0]);

    if (isNaN(songID)) {
        embed = client.embed({
            color: colors.RED,
            description: 'Lütfen bir sayı girin.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    if (songID < 1 || songID > 15) {
        embed = client.embed({
            color: colors.RED,
            description: 'Şarkı numarası 1-15 aralığında olmalıdır.'
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    const songIndex = songID - 1;
    const song = serverQueue.songs[songIndex];
    const currentSong = serverQueue.order;
    const streamDispatcher = getStreamDispatcher(message.guild.id);

    if (songIndex === currentSong && streamDispatcher) {
        streamDispatcher.pause(true);
    }

    serverQueue.songs.splice(songIndex, 1);
    let order = serverQueue.order;
    if (order >= serverQueue.songs.length) order = serverQueue.songs.length - 1;
    serverQueue.order = order;
    await wio.set(`queue_${message.guild.id}`, serverQueue);

    embed = client.embed({
        color: colors.GREEN,
        description: `**${escapeMarkdown(song.title)}** şarkı listesinden kaldırıldı.`
    });

    message.channel.send(embed);


    streamFinish(serverQueue, client, message.guild, order);
}
