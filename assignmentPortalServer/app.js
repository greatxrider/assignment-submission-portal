var createError = require('http-errors');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Config
const passport = require('passport');
const config = require('./config');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// Routers
const indexRouter = require('./routes/indexRouter');
const adminRouter = require('./routes/adminRouter');
const usersRouter = require('./routes/userRouter');
const mongoose = require('mongoose');

// Session
const session = require('express-session');
const FileStore = require('session-file-store')(session);

// MongoDB Connection
const url = config.mongoUrl;
const connect = async () => {
  await mongoose.connect(url, {});
};

connect()
  .then(() => console.log('Successfully connected to the mongodb server!'))
  .catch((err) => console.error(err));

// Create the Express app
const app = express();

// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
    res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});

// Initialize session middleware
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore({
    path: './sessions', // Specify the path explicitly
    retries: 0 // Set the number of retries to 0 to prevent retries
  })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: '10mb' }));
app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);

// Enable All CORS Requests
app.use(cors());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

/**
 * Send 404 if no other route matched.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

/**
 * Error handler.
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
app.use(function (err, req, res) {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
