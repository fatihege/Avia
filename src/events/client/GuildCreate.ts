import { ExecuteFunction } from '../../interfaces/Event';
import { Bot } from '../../Constants';

export const name: string = 'guildCreate';
export const execute: ExecuteFunction = async (client, guild) => {
    // await client.webhooks.guildLogger(guild);

    let guildCount: number = (await client.shard.fetchClientValues('guilds.cache.size')).reduce((a, b) => a + b, 0);
    client.user.setActivity(`${Bot.PREFIX_MESSAGES[0]} | ${guildCount} Servers`, { type: 'PLAYING' });

    await client.servers.create({
        id: guild.id
    });
}