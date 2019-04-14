// Database tools to allow reads and writes to the board state in the database
// by the whiteboard socketio rooms
const models = require('../models');

const { Board } = models;

// Retrieves the board state as a list from the database
async function getBoardState(boardId) {
  let boardState = [];
  let board = {};

  try {
    board = await Board.findOne({
      where: {
        board_url: boardId,
      },
    });

    boardState = board.state;
  } catch (error) {
    boardState = [];
  }

  return boardState;
}

// writes the board state as a list to the database
async function setBoardState(boardId, state) {
  let success = false;
  let board = {};

  try {
    board = await Board.findOne({
      where: {
        board_url: boardId,
      },
    });

    await board.update({
      state,
    });

    success = true;
  } catch (error) {
    success = false;
  }

  return success;
}


module.exports({
  getBoardState,
  setBoardState,
});
