const PASSWORD_HASH_LENGTH = 60;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      notEmpty: true,
      allowNull: false,
      defaultValue: 'NewUser',
    },
    email: {
      type: DataTypes.STRING,
      notEmpty: true,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(PASSWORD_HASH_LENGTH),
      allowNull: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {});
  User.associate = (models) => {
    // associations can be defined here
    User.hasMany(models.Board, {
      as: 'owned_boards',
      foreignKey: 'owner_id',
    });
    User.belongsToMany(models.Board, {
      as: 'boards',
      through: 'board_members',
      foreignKey: 'user_id',
    });
  };
  return User;
};
