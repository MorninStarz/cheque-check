const Sequelize = require('sequelize');

const { DataTypes } = Sequelize;

export default function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const transfer = sequelizeClient.define('transfer', {
    transfer_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    transfer_date: {
      type: DataTypes.DATE,
      allowNull: true
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

  transfer.associate = function (models) {
    const {
      customer,
      user,
      transaction
    } = models;
    transfer.belongsTo(customer, { foreignKey: 'customer_id' });
    transfer.belongsTo(user, { foreignKey: 'create_by' });
    transfer.belongsTo(user, { foreignKey: 'update_by' });
    transfer.hasMany(transaction, { foreignKey: 'transfer_id' });
  };

  return transfer;
}
