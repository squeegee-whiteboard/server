const uuidv4 = require('uuid/v4');
const base64url = require('base64url');

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
    is_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    board_url: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: function () {
        let uuid = uuidv4();
        let b64url = base64url(uuid);
        return b64url;
      },
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

  Board.prototype.toSimpleObject = function() {
    let simpleBoard = {
      board_id: this.board_url,
      board_name: this.board_name,
    };

    return simpleBoard;
  };

  return Board;
};
