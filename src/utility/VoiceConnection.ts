import { Snowflake, VoiceConnection } from 'discord.js';

const connections: Map<Snowflake | string, VoiceConnection> = new Map();

export const setConnection = (guildID: Snowflake | string, connection: VoiceConnection) => {
    connections.set(guildID, connection);
}

export const getConnection = (guildID: Snowflake | string) => {
    return connections.get(guildID);
}
