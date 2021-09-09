import { ExecuteFunction } from '../../interfaces/Command';

export const aliases: string[] = ['eval'];
export const authorOnly: boolean = true;
export const minArgs: number = 1;
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let result: string;

    try {
        let code = eval(args.join(' '));
        if (typeof code !== 'string') code = (await import('util')).inspect(code, { depth: 0 });
        result = `\`\`\`js\n${code}\n\`\`\``;
    } catch (e) {
        result = `\`\`\`js\n${e}\n\`\`\``;
    }

    message.channel.send(result);
}
