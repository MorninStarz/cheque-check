const Sequelize = require('sequelize');

const { DataTypes } = Sequelize;

export default function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const account = sequelizeClient.define('account', {
    account_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
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
    account_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    account_no: {
      type: DataTypes.STRING(255),
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

  account.associate = function (models) {
    const {
      customer,
      transaction,
      transfer,
      bank,
      branch
    } = models;
    account.belongsTo(customer, { foreignKey: 'customer_id' });
    account.belongsTo(bank, { foreignKey: 'bank_id' });
    account.belongsTo(branch, { foreignKey: 'branch_id' });
    account.hasMany(transaction, { foreignKey: 'account_id' });
    account.hasMany(transfer, { foreignKey: 'account_id' });
  };

  return account;
}
