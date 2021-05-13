import { WebhookClient, Guild, MessageEmbed, Invite } from 'discord.js';
import { Colors } from './Constants';
import dateFormat from './utility/DateFormat';

export default class Webhooks extends WebhookClient {
    constructor() {
        super(process.env.LOGGER_WEBHOOK_ID, process.env.LOGGER_WEBHOOK_TOKEN);
    }

    public async guildLogger(guild: Guild, create: boolean = true): Promise<void> {
        const embed = new MessageEmbed()
            .setColor(create ? Colors.GREEN : Colors.RED)
            .setTitle(create ? 'Added to New Server' : 'Kicked from Server')
            .setThumbnail(guild.iconURL() || guild.bannerURL())
            .setDescription(guild.id)
            .addFields([
                {
                    name: 'Name',
                    value: guild.name,
                    inline: true
                },
                {
                    name: 'Owner',
                    value: guild.owner.user.tag || '__(unknown)__',
                    inline: true
                },
                {
                    name: 'Owner ID',
                    value: guild.ownerID
                },
                {
                    name: 'Member Count',
                    value: guild.members.cache.filter((m) => !m.user.bot).size,
                    inline: true
                },
                {
                    name: 'Bot Count',
                    value: guild.members.cache.filter((m) => m.user.bot).size,
                    inline: true
                },
                {
                    name: 'Creation Date',
                    value: dateFormat(guild.createdAt)
                }
            ])
            .setTimestamp();

        await this.send(embed);
    }
}