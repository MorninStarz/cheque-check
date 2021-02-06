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
    account_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    bank_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    branch_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false
    },
    transfer_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    create_by: {
      type: DataTypes.UUID,
      allowNull: true
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
      account,
      bank,
      branch,
      transaction
    } = models;
    transfer.belongsTo(account, { foreignKey: 'account_id' });
    transfer.belongsTo(customer, { foreignKey: 'customer_id' });
    transfer.belongsTo(bank, { foreignKey: 'bank_id' });
    transfer.belongsTo(branch, { foreignKey: 'branch_id' });
    transfer.hasMany(transaction, { foreignKey: 'transfer_id' });
  };

  return transfer;
}
