const express = require('express');
const Cors = require('cors');
const Debug = require('debug');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const models = require('./models');

const indexRouter = require('./routes/index');
const registerRouter = require('./routes/registerUser');
const loginRouter = require('./routes/loginUser');
const updateUsernameRouter = require('./routes/updateUsername');

const app = express();
const debug = Debug('server');

// Configure middleware
require('./config/passportAuth');

app.use(Cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(morgan('dev'));

app.use('/', indexRouter);
app.use('/registerUser', registerRouter);
app.use('/loginUser', loginRouter);
app.use('/updateUsername', updateUsernameRouter);

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
