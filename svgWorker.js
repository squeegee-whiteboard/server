/* eslint-disable no-await-in-loop */
const { Project } = require('paper-jsdom');
const Debug = require('debug');

const debug = Debug('svgworker');

// Function for computing the preview of a paper.js board given JSON for a board
function computePreview(boardJSON) {
  // Import the given board
  const board = new Project();
  board.importJSON(boardJSON);

  // return the generated preview as a string
  return board.exportSVG({ asString: true, bounds: 'content' });
}

// Wait for the board queue and generate previews when requested
async function waitForQueue(boardQueue) {
  // Wait 0.5 seconds in between checking so we don't pin the CPU
  while (boardQueue.length <= 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return boardQueue.shift();
}

async function waitLoop(boardQueue) {
  for (;;) {
    // Wait until something's on the queue
    const result = await waitForQueue(boardQueue);
    const { boardId, boardJSON } = result;

    // Generate the preview and send it back to the parent
    debug(`generating preview for ${boardId}`);
    const preview = computePreview(boardJSON);
    debug(`generated preview for ${boardId}`);
    process.send({ boardId, preview });
  }
}

// Initialize an empty board queue
const boardQueue = [];

// Event for receiving a message from the parent process
process.on('message', (data) => {
  boardQueue.push(data);
});

waitLoop(boardQueue);
