import { ValidPermissions } from '../Constants';
import Logger from './Logger';

const logger = new Logger();

export default (permissions: string | string[], commandName: string) => {
    if (typeof permissions === 'string') permissions = [permissions];
    for (const permission of permissions) {
        if (!ValidPermissions.includes(permission)) {
            logger.error(`Unknown permission node "${permission}" in "${commandName}" command.`);
        }
    }
}