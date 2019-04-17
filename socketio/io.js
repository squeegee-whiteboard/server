// Defines the socketio events for both the dashboard and individual whiteboard

/* eslint-disable no-param-reassign */
const Debug = require('debug');
const io = require('socket.io')();
const { Project } = require('paper-jsdom');
const {
  getBoardState,
  setBoardState,
  setBoardPreview,
  newPath,
  removePaths,
} = require('./boardTools');

const debug = Debug('server');

// Socket whiteboard connections
// Connect when arriving to the board
// Disconnect when leaving the dash
const boardSocket = io.of('/board');

// A board state to store the board ID and number of online users for each board currently
// being accessed
const boardStates = {};

boardSocket.on('connection', (socket) => {
  // Sets the boardId the user is connected to
  // User will send this immediately upon connection
  socket.on('boardId', (boardId) => {
    // Join the socket room for the board
    socket.join(boardId);

    // Set the board ID for the current socket
    socket.boardId = boardId;

    // Check if the board exists in boardStates already
    if (boardId in boardStates) {
      boardStates[boardId].userCount += 1;

      debug(`New user, current board users: ${boardStates[boardId].userCount}`);

      debug(`sending existing board dump ${socket.boardId}`);
      socket.emit('board_dump', boardStates[boardId].board.exportJSON());
    } else {
      // If the board doesn't exist in board states, add it
      boardStates[boardId] = {
        userCount: 1,
        board: new Project(),
      };

      debug(`new board in mem ${boardId}`);

      getBoardState(boardId).then(
        (boardState) => {
          if (!(boardId in boardStates)) {
            debug('db_state_callback - board id was undefined');
            return;
          }
          boardStates[boardId].board.importJSON(boardState);
          debug(`sending newly imported board dump ${socket.boardId}`);
          socket.emit('board_dump', boardStates[boardId].board.exportJSON());
        },
      );
    }
  });

  socket.on('new_path', (pathJSON) => {
    if (socket.boardId === undefined) {
      debug('new_path - socket board id was undefined');
      return;
    }
    debug('Got new path');
    socket.broadcast.to(socket.boardId).emit('new_path', pathJSON);

    const paperObject = boardStates[socket.boardId].board;
    newPath(paperObject, pathJSON);
  });

  socket.on('removed_paths', (pathJSONList) => {
    if (socket.boardId === undefined) {
      debug('removed_paths - socket board id was undefined');
      return;
    }
    debug('Got new removed path list');
    socket.broadcast.to(socket.boardId).emit('removed_paths', pathJSONList);

    const paperObject = boardStates[socket.boardId].board;
    removePaths(paperObject, pathJSONList);
  });

  socket.on('disconnect', () => {
    if (socket.boardId === undefined) {
      debug('disconnect - socket board id was undefined');
      return;
    }
    const { boardId } = socket;
    debug(`Got disconnect from ${boardId}`);
    boardStates[boardId].userCount -= 1;

    const newState = boardStates[boardId].board.exportJSON();
    const preview = boardStates[boardId].board.exportSVG({ asString: true, bounds: 'content' });
    setBoardState(socket.boardId, newState).then((success) => {
      if (success) {
        debug(`successfully saved board state for ${boardId}`);
      } else {
        debug(`unsuccessfully saved board state for ${boardId}`);
      }
    });
    setBoardPreview(socket.boardId, preview).then((success) => {
      if (success) {
        debug(`successfully saved board preview for ${boardId}`);
      } else {
        debug(`unsuccessfully saved board preview for ${boardId}`);
      }
    });

    if (boardStates[boardId].userCount <= 0) {
      debug(`removing board ${boardId}`);
      delete boardStates[boardId];
    }
  });
});


// Socket dashboard connections
// Connect when arriving to the dash
// Disconnect when leaving the dash
const dashSocket = io.of('/dash');

dashSocket.on('connection', (socket) => {
  debug('connected to dash socket');

  // Indicates something about a board was changed
  // User sends when they change the name, create, or delete a board
  // Sends a refreshBoards event to all users, prompts them to reload their dashboard
  socket.on('change_board', () => {
    debug('change_board');
    socket.broadcast.emit('refresh_boards');
  });
});

module.exports = io;
