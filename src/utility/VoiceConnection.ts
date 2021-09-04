import { Snowflake, VoiceConnection, StreamDispatcher } from 'discord.js';

const connections: Map<Snowflake | string, VoiceConnection> = new Map();
const streamDispatchers: Map<Snowflake | string, StreamDispatcher> = new Map();

export const setConnection = (guildID: Snowflake | string, connection: VoiceConnection) => {
    return connections.set(guildID, connection);
}

export const getConnection = (guildID: Snowflake | string) => {
    return connections.get(guildID);
}

export const setStreamDispatcher = (guildID: Snowflake | string, stream: StreamDispatcher) => {
    return streamDispatchers.set(guildID, stream);
}

export const getStreamDispatcher = (guildID: Snowflake | string) => {
    return streamDispatchers.get(guildID);
}
