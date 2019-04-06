module.exports = (sequelize, DataTypes) => {
  const Board = sequelize.define('Board', {
    board_name: {
      type: DataTypes.STRING,
      notEmpty: true,
      allowNull: false,
    },
    state: {
      type: DataTypes.JSON,
      notEmpty: true,
      allowNull: false,
      defaultValue: [],
    },
  }, {});
  Board.associate = (models) => {
    // associations can be defined here
    Board.belongsTo(models.User, {
      as: 'owner',
      foreignKey: 'owner_id',
      onDelete: 'CASCADE',
    });
    Board.belongsToMany(models.User, {
      as: 'members',
      through: 'board_members',
      foreignKey: 'board_id',
    });
  };
  return Board;
};
