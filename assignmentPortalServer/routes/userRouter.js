const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const Assignment = require('../models/assignment');
const authenticate = require('../authenticate');

const userRouter = express.Router();
userRouter.use(passport.initialize());

// Register a new user
userRouter.post('/register', async (req, res, next) => {
  const { username, password, firstname, lastname } = req.body;

  // Validate input
  if (!username || !password || !firstname || !lastname) {
    return res.status(400).json({ error: 'Username, password, first name, and last name are required' });
  }

  try {
    const user = new User({ username, firstname, lastname });
    await User.register(user, password);

    await user.save().then(
      err => {
        if (!err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err: err });
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Registration Successful!' });
        });
      }
    );
  } catch (err) {
    next(err);
  }
});

// User login
userRouter.post('/login', passport.authenticate('local', { session: false }), (req, res, err) => {
  const token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});

// User Logout
userRouter.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
});

// Check if JWT token is valid
userRouter.get('/checkJWTtoken', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    if (!user) {
      return res.json({ status: 'JWT invalid!', success: false, err: info });
    } else {
      return res.json({ status: 'JWT valid!', success: true, user: user });
    }
  })(req, res);
});

// Upload an assignment
userRouter.post('/upload', authenticate.verifyUser, (req, res, next) => {
  const newAssignment = new Assignment({
    userId: req.user._id,
    task: req.body.task,
    admin: req.body.adminId
  });
  newAssignment.save()
    .then((user) => {
      res.status(201)
        .setHeader('Content-Type', 'application/json')
        .json({ success: true, user });
    })
    .catch((err) => next(err));
});

// Fetch all admins
userRouter.get('/admins', authenticate.verifyUser, (req, res, next) => {
  User.find({ admin: true })
    .then((err, admins) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200)
        .setHeader('Content-Type', 'application/json')
        .json({ success: true, admins });
    })
    .catch(err => next(err));
});

module.exports = userRouter;
