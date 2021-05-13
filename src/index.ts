import { ShardingManager } from 'discord.js';
import dotenv from 'dotenv';
import Logger from './utility/Logger';

dotenv.config({
    path: './.env'
});

const logger = new Logger();

const manager = new ShardingManager('./dist/shard.js', {
    totalShards: 'auto',
    token: process.env.TOKEN
});

manager.on('shardCreate', async (shard) => {
    logger.info(`Shard ${shard.id} created.`);

    shard.on('ready', () => {
        logger.info(`Shard ${shard.id} ready.`);
    });

    shard.on('disconnect', () => {
        logger.warning(`Shard ${shard.id} disconnected.`);
    });

    shard.on('death', () => {
        logger.error(`Shard ${shard.id} death.`);
    });

    shard.on('error', (error) => {
        logger.error(error);
    });
});

(async () => {
    await manager.spawn();
    logger.info('All shards are deployed.');
})();