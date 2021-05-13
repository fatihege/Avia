import { Message } from 'discord.js';
import Bot from '../Bot';
import Server from '../structures/Server';
import { Colors } from '../Constants';

interface Category {
    code: string;
    name: string;
}

export interface ExecuteFunction {
    (client: Bot, server: Server, message: Message, args: string[], colors: typeof Colors): Promise<void | any>
}

export default interface Command {
    aliases: string | string[];
    description: string;
    category: Category;
    usage?: string;
    examples: string | string[];
    ownerOnly?: boolean;
    authorOnly?: boolean;
    permissions?: string | string[];
    botPermissions?: string | string[];
    minArgs?: number;
    maxArgs?: number;
    execute: ExecuteFunction;
}