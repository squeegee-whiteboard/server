// Database tools to allow reads and writes to the board state in the database
// by the whiteboard socketio rooms
const { Path } = require('paper-jsdom');
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

// Add a new path from the given JSON to a paper project
function newPath(paperProject, pathJSON) {
  const layer = paperProject.activeLayer;
  const path = Path.importJSON(pathJSON);
  layer.addChild(path);
}

// Compare two arrays and return true if all of their elements are equal according to the
// given comparison function.
// Params:
//   a1 First array
//   a2 Second array
//   comp Comparison function that should take 2 arguments and return true if they are equal
//     and false otherwise
function arrayComp(a1, a2, comp) {
  // Early return if lengths don't match
  if (a1.length !== a2.length) {
    return false;
  }

  // Loop through and compare each element
  for (let i = 0; i < a1.length; i += 1) {
    if (!comp(a1[i], a2[i])) {
      return false;
    }
  }

  // No elements were different, so the arrays match
  return true;
}

// Remove the given paths (in JSON form) from the project
function removePaths(paperProject, pathJSONList) {
  const layer = paperProject.activeLayer;

  // convert the list of JSON paths to a list of Path objects
  const pathList = pathJSONList.map(path => Path.importJSON(path));

  // Remove each from the layer
  pathList.forEach((receivedPath) => {
    const toRemove = layer.getItem({
      class: Path,
      match: localPath => arrayComp(
        receivedPath.segments,
        localPath.segments,
        (seg1, seg2) => {
          // We need to cast the point coordinates to integers and compare them directly
          // since the floating points get truncated when being transferred from user to
          // user, so the provided comparison function doesn't work
          const point1 = seg1.point;
          const point2 = seg2.point;
          const p1x = parseInt(point1.x, 10);
          const p1y = parseInt(point1.y, 10);
          const p2x = parseInt(point2.x, 10);
          const p2y = parseInt(point2.y, 10);
          return (p1x === p2x) && (p1y === p2y);
        },
      ),
    });

    // Remove the object if it exists
    if (toRemove !== null) {
      toRemove.remove();
    }
  });
}

module.exports = {
  getBoardState,
  setBoardState,
  newPath,
  removePaths,
};
