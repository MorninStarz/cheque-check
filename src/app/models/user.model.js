const Sequelize = require('sequelize');

const { DataTypes } = Sequelize;

export default function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const user = sequelizeClient.define('user', {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    username: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    permission_id: {
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

  user.associate = function (models) {
    const {
      permission
    } = models;
    user.belongsTo(permission, { foreignKey: 'permission_id' });
    user.belongsTo(user, { foreignKey: 'create_by' });
    user.belongsTo(user, { foreignKey: 'update_by' });
  };

  return user;
}
