/* USER
Represents a user
Attributes:
  username: The name of the user
  email: The email the user uses to log in
  password: the user's password (hashed and salted)
  is_admin: whether or not the user is an admin

Associations:
  owned_boards: Boards the user has created 1:N (User:Board)
  board_members: Boards the user is a member of, M:N (User:Board)
*/
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
