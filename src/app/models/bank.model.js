const Sequelize = require('sequelize');

const { DataTypes } = Sequelize;

export default function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const bank = sequelizeClient.define('bank', {
    bank_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    bank_name: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    create_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1
    }
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    },
    paranoid: true
  });

  bank.associate = function (models) {
    const {
      branch,
      cheque,
      account,
      transfer
    } = models;
    bank.hasMany(branch, { foreignKey: 'bank_id' });
    bank.hasMany(cheque, { foreignKey: 'bank_id' });
    bank.hasMany(account, { foreignKey: 'bank_id' });
    bank.hasMany(transfer, { foreignKey: 'bank_id' });
  };

  return bank;
}
