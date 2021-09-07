import chalk from 'chalk';
import { appendFileSync } from 'fs';
import { Logger as LoggerConstant } from '../Constants';

export default class Logger {
    private logDirectory: string = `${__dirname}/../../../${LoggerConstant.LOG_FILE}`;

    private send(message, type) {
        const date = new Date()
            .toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '');

        let consoleResult = `${chalk.gray(date)} [${type}] ${chalk.red('>')} ${chalk.white(message)}`;
        let logResult = `${date} ${type.replace(//gi, '').replace(/\[\d{2}m/gi, '')} > ${message}`

        appendFileSync(
            this.logDirectory,
            `${logResult}\n`
        );

        console.log(consoleResult);
    }

    public info(message) {
        this.send(message, chalk.green('INFO'));
    }

    public warning(message) {
        this.send(message, chalk.yellow('WARNING'));
    }

    public error(message) {
        this.send(message, chalk.red('ERROR'));
    }
}