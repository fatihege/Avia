import { MessageEmbed } from 'discord.js';
import { totalmem, freemem } from 'os';
import { ExecuteFunction } from '../../interfaces/Command';
import byte from '../../utility/Byte';
import timeConvert from '../../utility/TimeConvert';
import resolveMS from '../../utility/ResolveMS';
import TimeUnits from '../../interfaces/TimeUnits';

export const aliases: string[] = ['statistics', 'stats', 'istatistik'];
export const description: string = 'command.statistics.description';
export const category: string = 'category.information';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    let totalGuilds: string = (await client.shard.fetchClientValues('guilds.cache.size'))
        .reduce((a, b) => a + b, 0).toLocaleString();

    let totalUsers: string = (await client.shard.fetchClientValues('users.cache.size'))
        .reduce((a, b) => a + b, 0).toLocaleString();

    let APIPing: string = resolveMS(client.ws.ping);

    const totalRAM: number = totalmem();
    const freeRAM: number = freemem();
    const usedRAM: string = byte(totalRAM - freeRAM);

    const uptime: TimeUnits = timeConvert(server.language, client.uptime);

    embed = client.embed({
        color: colors.DEFAULT,
        author: {
            name: message.author.tag,
            image: message.author.displayAvatarURL()
        },
        thumbnail: client.user.displayAvatarURL(),
        title: server.translate('command.statistics.message.title'),
        description: server.translate(
            'command.statistics.message.description',
            totalGuilds,
            totalUsers,
            APIPing,
            byte(totalRAM),
            byte(freeRAM),
            usedRAM,
            uptime
        )
    });

    message.channel.send(embed);
}