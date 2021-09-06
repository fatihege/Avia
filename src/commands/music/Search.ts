import wio from 'wio.db';
import { MessageEmbed, TextChannel, VoiceChannel, VoiceConnection } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import { Emoji } from '../../Constants';
import videoFinder from '../../utility/VideoFinder';
import escapeMarkdown from '../../utility/EscapeMarkdown';
import { getConnection, setConnection } from '../../utility/VoiceConnection';

export const aliases: string[] = ['search', 'ara'];
export const description: string = 'command.search.description';
export const usage: string = 'command.search.usage';
export const minArgs: number = 1;
export const category: string = 'category.music';
export const botPermissions: string[] = ['CONNECT', 'SPEAK'];
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const voiceChannel: VoiceChannel = message.member.voice.channel;
    let serverQueue = await wio.fetch(`queue_${message.guild.id}`);
    let connection: VoiceConnection = getConnection(message.guild.id);

    if (!voiceChannel) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('global.music.connect.a.channel')
        });

        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    serverQueue.textChannel = message.channel.id;
    await wio.set(`queue_${message.guild.id}`, serverQueue);

    embed = client.embed({
        color: colors.BLUE,
        description: `${Emoji.MAG_RIGHT} ${server.translate('global.music.searching')}`
    });

    const infoMessage = await message.channel.send(embed);

    const query = args.join(' ');
    const results: any = await videoFinder(args.join(' '), 10);

    if (!results || !results.length) {
        embed = client.embed({
            color: colors.RED,
            description: server.translate('command.search.message.no.results.found', escapeMarkdown(query))
        });

        return infoMessage.edit(embed);
    }

    embed = client.embed({
        color: colors.GREEN,
        title: server.translate('command.search.message.listing', results.length),
    });

    embed.setDescription('');

    results.map((v, i) => {
        embed.description += `**${i + 1})** [${escapeMarkdown(v.title)}](${v.url})\n`;
    });

    infoMessage.edit(embed);

    if (!connection) {
        connection = await voiceChannel.join();
        setConnection(message.guild.id, connection);
    }
}
