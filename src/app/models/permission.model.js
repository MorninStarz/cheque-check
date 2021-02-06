const Sequelize = require('sequelize');

const { DataTypes } = Sequelize;

export default function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const permission = sequelizeClient.define('permission', {
    permission_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    permission_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    view_permission: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    edit_permission: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    delete_permission: {
      type: DataTypes.STRING(255),
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

  permission.associate = function (models) {
    const {
      user
    } = models;
    permission.hasOne(user, { foreignKey: 'permission_id' });
  };

  return permission;
}
