import { MessageEmbed, GuildMember, Role, TextChannel } from 'discord.js';
import { ExecuteFunction } from '../../interfaces/Command';
import sleep from '../../utility/Sleep';

export const aliases: string[] = ['giverole', 'rolver'];
export const description: string = 'command.giverole.description';
export const usage: string = 'command.giverole.usage';
export const category: string = 'category.moderation';
export const examples: string[] = ['@Avia @Bot', '@Avia @Fatih @foo @bar', '838775980184436808 817694411080073226'];
export const permissions: string = 'MANAGE_ROLES'
export const minArgs: number = 2;
export const botPermissions: string[] = ['SEND_MESSAGES', 'MANAGE_ROLES', 'MANAGE_MESSAGES']
export const execute: ExecuteFunction = async (client, server, message, args, colors) => {
    let embed: MessageEmbed;
    const snowflakes: string[] = (args.join(' ')).match(/\d{17,19}/gi);
    let members: Array<GuildMember> = [];
    let roles: Array<Role> = [];

    snowflakes.map((sf) => {
        if (message.guild.members.cache.get(sf)) members.push(message.guild.members.cache.get(sf));
        if (message.guild.roles.cache.get(sf)) roles.push(message.guild.roles.cache.get(sf));
    });

    if (message.mentions.members.size) message.mentions.members.map((m) => members.push(m));
    if (message.mentions.roles.size) message.mentions.roles.map((r) => roles.push(r));

    if (!members.length || !roles.length) {
        embed = client.embed({
            color: colors.RED,
            author: {
                name: message.author.tag,
                image: message.author.displayAvatarURL()
            },
            description: server.translate('global.no.member.or.role')
        });
        return client.tempMessage(message.channel as TextChannel, embed, 10000);
    }

    embed = client.embed({
        color: colors.BLUE,
        author: {
            name: message.author.tag,
            image: message.author.displayAvatarURL()
        },
        description: server.translate('command.giverole.message.processing')
    });

    return message.channel.send(embed)
        .then(async (m) => {
            let result: boolean = false;

            await members.map((member) => {
                roles.map(async (role) => {
                    try {
                        await member.roles.add(role);
                        result = true;
                    } catch (e) {
                        message.channel.send(client.errorEmbed(server.language, message.guild, e));
                    }
                });
            });

            await sleep(members.length * 1000);

            if (result) {
                embed = client.embed({
                    color: colors.GREEN,
                    author: {
                        name: message.author.tag,
                        image: message.author.displayAvatarURL()
                    },
                    description: server.translate('command.giverole.message.gived')
                });
            } else {
                embed = client.embed({
                    color: colors.RED,
                    author: {
                        name: message.author.tag,
                        image: message.author.displayAvatarURL()
                    },
                    description: server.translate('command.giverole.message.error')
                });
            }

            m.edit(embed)
                .then((msg) => msg.delete({ timeout: 10000 }));
        });
}