const Sequelize = require('sequelize');

const { DataTypes } = Sequelize;

export default function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const transaction = sequelizeClient.define('transaction', {
    transaction_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    cheque_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    cheque_no: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    transfer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    remark: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    transaction_type: {
      type: DataTypes.ENUM('create', 'update', 'delete'),
      allowNull: false,
      defaultValue: 'create'
    },
    cheque_status: {
      type: DataTypes.ENUM('Waiting', 'Pending', 'Approved'),
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

  transaction.associate = function (models) {
    const {
      cheque,
      customer,
      account,
      transfer
    } = models;
    transaction.belongsTo(cheque, { foreignKey: 'cheque_id' });
    transaction.belongsTo(transfer, { foreignKey: 'transfer_id' });
    transaction.belongsTo(customer, { foreignKey: 'customer_id' });
    transaction.belongsTo(account, { foreignKey: 'account_id' });
  };

  return transaction;
}
