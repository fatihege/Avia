import { MessageEmbed, version as discordJSVersion } from 'discord.js';
import os from 'os';
import { ExecuteFunction } from '../../interfaces/Command';
import timeConvert from '../../utility/TimeConvert';
import byte from '../../utility/Byte';
import { Bot } from '../../Constants';
import TimeUnits from '../../interfaces/TimeUnits';
import { version as aviaVersion } from '../../../package.json';

export const aliases: string[] = ['botinfo', 'botbilgi'];
export const description: string = 'command.botinfo.description';
export const category: string = 'category.information';
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;

    // Uptime
    const botUptime: TimeUnits = timeConvert(server.language, client.uptime);

    // Operating System
    const operatingSystem: string = `${os.platform()} (${os.type()} ${os.arch()}) — ${os.release()}`;
    const operatingSystemUptime: TimeUnits = timeConvert(server.language, os.uptime() * 1000);

    // Versions
    const nodeJSVersion: string = process.versions.node;

    // Processor
    const cpuModel: string = os.cpus()[0].model;
    const cpuSpeed: string = `${os.cpus()[0].speed} GHz`;
    const cpuCores: number = os.cpus().length / 2;
    const cpuThreads: number = os.cpus().length;

    // Memory
    const totalRAM: number = os.totalmem();
    const freeRAM: number = os.freemem();
    const usedRAM: string = byte(totalRAM - freeRAM);
    const botsUsedRAM: string = byte((await client.shard.broadcastEval('process.memoryUsage()'))
        .reduce((a, b) => a.heapUsed + b.heapUsed, { heapUsed: 0 }));
    const shardsUsedRAM: string = byte(process.memoryUsage().heapUsed);

    embed = client.embed({
        color: colors.DEFAULT,
        author: {
            name: client.user.username,
            image: client.user.displayAvatarURL()
        },
        thumbnail: client.user.displayAvatarURL(),
        title: server.translate('command.botinfo.message.title'),
        fields: [
            {
                name: server.translate('command.botinfo.message.field.os.name'),
                value: server.translate(
                    'command.botinfo.message.field.os.value',
                    operatingSystem,
                    operatingSystemUptime
                )
            },
            {
                name: server.translate('command.botinfo.message.field.uptime.name'),
                value: botUptime.toString()
            },
            {
                name: server.translate('command.botinfo.message.field.versions.name'),
                value: server.translate(
                    'command.botinfo.message.field.versions.value',
                    aviaVersion,
                    nodeJSVersion,
                    discordJSVersion
                )
            },
            {
                name: server.translate('command.botinfo.message.field.cpu.name'),
                value: server.translate(
                    'command.botinfo.message.field.cpu.value',
                    cpuModel,
                    cpuSpeed,
                    cpuCores,
                    cpuThreads
                )
            },
            {
                name: server.translate('command.botinfo.message.field.ram.name'),
                value: server.translate(
                    'command.botinfo.message.field.ram.value',
                    byte(totalRAM),
                    byte(freeRAM),
                    usedRAM,
                    botsUsedRAM,
                    shardsUsedRAM
                )
            }
        ],
        timestamp: new Date(),
        footer: {
            text: server.translate('global.brand'),
            image: Bot.SUPPORT_LOGO
        }
    });

    message.channel.send(embed);
}