import { ExecuteFunction } from '../../interfaces/Event';
import { Bot } from '../../Constants';

export const name: string = 'ready';
export const execute: ExecuteFunction = async (client) => {
    let guildCount = (await client.shard.fetchClientValues('guilds.cache.size')).reduce((a, b) => a + b, 0);
    client.user.setActivity(`${Bot.PREFIX_MESSAGES[0]} | ${guildCount} Servers`, { type: 'PLAYING' });

    if (guildCount > client.servers.size) {
        const guilds = await client.shard.fetchClientValues('guilds.cache');
        guilds[0].map(async (g) => {
            if (!await client.servers.get(g.id)) {
                await client.servers.create({
                    id: g.id
                });
            }
        });
    }

}