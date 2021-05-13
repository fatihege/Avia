import { ExecuteFunction } from '../../interfaces/Event';

export const name: string = 'error';
export const execute: ExecuteFunction = async (client, error) => {
    client.logger.error(error);
}