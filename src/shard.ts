import Bot from './Bot';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
});

const client = new Bot();

(async () => {
    await client.start(process.env.TOKEN);
    client.logger.info('Client created.');
})();
