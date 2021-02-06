const Sequelize = require('sequelize');

const { DataTypes } = Sequelize;

export default function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const customer = sequelizeClient.define('customer', {
    customer_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    expect_amount: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0
    },
    actual_amount: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0
    },
    due_date: {
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

  customer.associate = function (models) {
    const {
      cheque,
      transaction,
      account,
      transfer
    } = models;
    customer.hasMany(cheque, { foreignKey: 'customer_id' });
    customer.hasMany(transfer, { foreignKey: 'customer_id' });
    customer.hasMany(transaction, { foreignKey: 'customer_id' });
    customer.hasMany(account, { foreignKey: 'customer_id' });
  };

  return customer;
}
