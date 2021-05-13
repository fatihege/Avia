import { Message, Snowflake, GuildMember } from 'discord.js';
import findSnowflake from './FindSnowflake';

export default (message: Message): GuildMember => {
    let targetID;
    if (message.mentions.users.size) targetID = message.mentions.users.first().id;
    else if (findSnowflake(message.content)) targetID = findSnowflake(message.content)[0];
    else targetID = message.author.id;

    const target = message.guild.members.cache.get(targetID as Snowflake);

    return target;
}