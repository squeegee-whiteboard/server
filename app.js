const express = require('express');
const Cors = require('cors');
const Debug = require('debug');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const models = require('./models');

const changeUserRouter = require('./routes/changeUser');
const authRouter = require('./routes/auth');
const changeBoardRouter = require('./routes/changeBoard');
const boardInfoRouter = require('./routes/boardInfo');
// const indexRouter = require('./routes/index');

const app = express();
const debug = Debug('server');

// Configure middleware
require('./config/passport');

app.use(Cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(morgan('dev'));

// app.use('/', indexRouter);
app.use('/changeUser', changeUserRouter);
app.use('/auth', authRouter);
app.use('/changeBoard', changeBoardRouter);
app.use('/boardInfo', boardInfoRouter);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

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
