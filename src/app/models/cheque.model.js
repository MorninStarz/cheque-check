const Sequelize = require('sequelize');

const { DataTypes } = Sequelize;

export default function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const cheque = sequelizeClient.define('cheque', {
    cheque_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    cheque_no: {
      type: DataTypes.STRING(255),
      unique: true,
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
    month: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false
    },
    remark: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    pending_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approve_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pass_date: {
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
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Pass'),
      allowNull: false
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

  cheque.associate = function (models) {
    const {
      customer,
      bank,
      branch,
      transaction
    } = models;
    cheque.belongsTo(customer, { foreignKey: 'customer_id' });
    cheque.belongsTo(bank, { foreignKey: 'bank_id' });
    cheque.belongsTo(branch, { foreignKey: 'branch_id' });
    cheque.hasMany(transaction, { foreignKey: 'cheque_id' });
  };

  return cheque;
}
