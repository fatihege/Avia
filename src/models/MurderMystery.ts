import { Model, DataTypes } from 'sequelize';
import sequelize from '../utility/Sequelize';

export interface IMurderMystery {
    id: string;
    gamers?: string;
    murderers?: string;
}

class MurderMysteryModel extends Model<IMurderMystery> {
    public id: string;
    public gamers?: string;
    public murderers?: string;
}

MurderMysteryModel.init({
    id: {
        type: new DataTypes.STRING(18),
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    gamers: {
        type: new DataTypes.STRING(400),
        allowNull: true
    },
    murderers: {
        type: new DataTypes.STRING(350),
        allowNull: true
    }
}, {
    sequelize: sequelize,
    tableName: 'murdermystery'
});

MurderMysteryModel.sync();

export default MurderMysteryModel;