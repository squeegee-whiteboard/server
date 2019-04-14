// Defines the socketio events for both the dashboard and individual whiteboard

/* eslint-disable no-param-reassign */
const Debug = require('debug');
const io = require('socket.io')();

const debug = Debug('server');


// Socket whiteboard connections
// Connect when arriving to the board
// Disconnect when leaving the dash
const boardSocket = io.of('/board');

// A board state to store the board ID and number of online users for each board currently
// being accessed
const boardStates = {};

boardSocket.on('connection', (socket) => {
  debug('connected to board socket');

  // Sets the boardId the user is connected to
  // User will send this immediately upon connection
  // sets the board id in the socket session
  // and joins/create a room for that id
  socket.on('boardId', (boardId) => {
    socket.join(boardId);
    socket.boardId = boardId;
    debug(`Set board id ${socket.boardId}`);
  });

  socket.on('new_path', (pathJSON) => {
    debug('Got new path');
    socket.broadcast.to(socket.boardId).emit('new_path', pathJSON);
  });

  socket.on('removed_items', (pathJSONList) => {
    debug('Got new removed path list');
    socket.broadcast.to(socket.boardId).emit('removed_paths', pathJSONList);
  });

  socket.on('disconnect', () => {
    // TODO: disconnect event to persist board state to database
    debug(`Got disconnect from ${socket.boardId}`);
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
  socket.on('changeBoard', () => {
    debug('changeBoard');
    dashSocket.emit('refreshBoards');
  });
});

module.exports = io;
