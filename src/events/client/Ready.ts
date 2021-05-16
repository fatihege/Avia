import { ExecuteFunction } from '../../interfaces/Event';
import { Bot } from '../../Constants';
import ServerModel from '../../models/Server';

export const name: string = 'ready';
export const execute: ExecuteFunction = async (client) => {
    let guildCount: number = (await client.shard.fetchClientValues('guilds.cache.size')).reduce((a, b) => a + b, 0);
    client.user.setActivity(`${Bot.PREFIX_MESSAGES[0]} | ${guildCount} Servers`, { type: 'PLAYING' });

    if (guildCount !== client.servers.size) {
        const guilds = (await client.shard.fetchClientValues('guilds.cache'))[0];
        guilds.map(async (g) => {
            let server = await ServerModel.findOne({ where: { id: g.id } });
            if (!server) {
                await ServerModel.create({ id: g.id });
            }
        });
    }

}