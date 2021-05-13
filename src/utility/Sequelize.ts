import { Sequelize } from 'sequelize';
import { resolve } from 'path';
import Logger from './Logger';

const logger = new Logger();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: resolve(__dirname, '..', '..', 'db', 'database.sqlite'),
    logging: false,
    define: {
        timestamps: false
    }
});

sequelize.sync()
    .then(() => {
        logger.info('Connected to database.');
    })
    .catch((err) => {
        logger.error('Couldn\'t connect to database.');
    });

export default sequelize;