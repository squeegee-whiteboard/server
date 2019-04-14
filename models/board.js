/* BOARD
Represents a whiteboard
Attributes:
  board_name: The name of the board
  state: The boards current state (as a paper.js json object)
  is_enabled: If the board is enabled or disabled (disable = effectively deleted)
  board_url: The url extension to access the board, base64 encoded uuid

Associations:
  owner: One user who created the board, 1:N (User:Board)
  members: Users who have joined the board, M:N (User:Board)
*/
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
      defaultValue: () => {
        const uuid = uuidv4();
        const b64url = base64url(uuid);
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

  // Converts the board to a simpler object containing only url and name
  Board.prototype.toSimpleObject = function toSimpleObject() {
    const simpleBoard = {
      board_id: this.board_url,
      board_name: this.board_name,
    };

    return simpleBoard;
  };

  return Board;
};
