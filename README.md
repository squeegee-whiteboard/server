# Squeegee Whiteboard - Server

The server for the Squeegee Whiteboard application

[![Build Status](https://travis-ci.org/squeegee-whiteboard/server.svg?branch=master)](https://travis-ci.org/squeegee-whiteboard/server)

## Usage

To start the server: `npm start`.

To lint the code: `npm run lint`.

To start the dev server (auto reload on code change): `npm run dev`.

### Debug Messages

To insert debug messages, use the debug package: <https://github.com/visionmedia/debug>.
Essentially:

```javascript
const Debug = require('debug');

const debug = Debug('your:tag:here');

// ...

debug('debug message');
```

And then run the dev server (or regular server, using `npm start`) with:
`DEBUG=your:tag:here npm run dev` to get only debug messages from that specific tag.
Alternatively, to get debug messages from all tags use: `DEBUG=* npm run dev`. For more
info, see the above link to the debug project on github.
