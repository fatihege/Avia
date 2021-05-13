import { Model, DataTypes } from 'sequelize';
import sequelize from '../utility/Sequelize';
import { Bot, Language } from '../Constants';

export interface IServer {
    id: string;
    prefix?: string;
    language?: string;
    logChannelID?: string;
    welcomeChannelID?: string;
    welcomeMessage?: string;
    leaveChannelID?: string;
    leaveMessage?: string;
    autoroles?: string;
    botroles?: string;
}

class ServerModel extends Model<IServer> {
    public id: string;
    public prefix?: string;
    public language?: string;
    public logChannelID?: string;
    public welcomeChannelID?: string;
    public welcomeMessage?: string;
    public leaveChannelID?: string;
    public leaveMessage?: string;
    public autoroles?: string;
    public botroles?: string;
}

ServerModel.init({
    id: {
        type: new DataTypes.STRING(18),
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    prefix: {
        type: new DataTypes.STRING(5),
        allowNull: true,
        defaultValue: Bot.DEFAULT_PREFIX
    },
    language: {
        type: new DataTypes.STRING(10),
        allowNull: true,
        defaultValue: Language.DEFAULT_LANGUAGE
    },
    logChannelID: {
        type: new DataTypes.STRING(18),
        allowNull: true
    },
    welcomeChannelID: {
        type: new DataTypes.STRING(18),
        allowNull: true
    },
    welcomeMessage: {
        type: new DataTypes.STRING(500),
        allowNull: true
    },
    leaveChannelID: {
        type: new DataTypes.STRING(18),
        allowNull: true
    },
    leaveMessage: {
        type: new DataTypes.STRING(500),
        allowNull: true
    },
    autoroles: {
        type: new DataTypes.STRING(100),
        allowNull: true
    },
    botroles: {
        type: new DataTypes.STRING(100),
        allowNull: true
    }
}, {
    sequelize: sequelize,
    tableName: 'servers'
});

ServerModel.sync();

export default ServerModel;