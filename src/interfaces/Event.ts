import Bot from '../Bot';

export interface ExecuteFunction {
    (client: Bot, ...args: any[]): Promise<void | any>;
}

export default interface Event {
    name: string;
    execute: ExecuteFunction;
}