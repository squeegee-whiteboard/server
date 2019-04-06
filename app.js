const express = require('express');
const Debug = require('debug');
const http = require('http');
const morgan = require('morgan');
const models = require('./models');

const indexRouter = require('./routes/index');

const app = express();
const debug = Debug('server');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use('/', indexRouter);

// Get port from environment and store in Express.
const port = process.env.PORT || '3000';
app.set('port', port);

// Create HTTP server.
const server = http.createServer(app);


// Sync models with the database
models.sequelize.sync().then(() => {
  // Listen on provided port, on all network interfaces.
  server.listen(port);
  server.on('listening', () => {
    debug(`Listening on http://${server.address().address}:${server.address().port}`);
  });
}).catch((error) => {
  debug(error, 'Error syncing the database!');
});

