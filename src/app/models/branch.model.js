const Sequelize = require('sequelize');

const { DataTypes } = Sequelize;

export default function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const branch = sequelizeClient.define('branch', {
    branch_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    branch_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    bank_id: {
      type: DataTypes.UUID,
      allowNull: false
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

  branch.associate = function (models) {
    const {
      bank,
      cheque,
      account,
      transfer
    } = models;
    branch.belongsTo(bank, { foreignKey: 'bank_id' });
    branch.hasMany(cheque, { foreignKey: 'branch_id' });
    branch.hasMany(account, { foreignKey: 'branch_id' });
    branch.hasMany(transfer, { foreignKey: 'branch_id' });
  };

  return branch;
}
