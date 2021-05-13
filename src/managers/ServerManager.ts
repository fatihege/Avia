import { Snowflake } from 'discord.js';
import Manager from './Manager';
import ServerModel, { IServer } from '../models/Server';
import Server from '../structures/Server';

export default class ServerManager extends Manager<Snowflake, Server, typeof ServerModel, IServer> {
    constructor() {
        super(ServerModel);
    }

    protected new(data: IServer): Server {
        return new Server(data);
    }
}