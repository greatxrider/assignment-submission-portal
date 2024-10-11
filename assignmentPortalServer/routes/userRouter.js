const express = require('express');
const User = require('../models/user');
const Admin = require('../models/admin');
const passport = require('passport');
const authenticate = require('../authenticate');
const Assignment = require('../models/assignment');

const mongoose = require('mongoose');

const userRouter = express.Router();
userRouter.use(passport.initialize());

/**
 * Register a new user.
 * 
 * @route POST /register
 * @param {string} req.body.username - The username of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {string} req.body.firstname - The first name of the user.
 * @param {string} req.body.lastname - The last name of the user.
 * @returns {object} A success message and token if registration is successful.
 * @throws Will return a 400 error if required fields are missing.
 * @throws Will return a 500 error for any internal server errors.
 */
userRouter.post('/register', async (req, res, next) => {
  const { username, password, firstname, lastname } = req.body;

  // Validate input
  if (!username || !password || !firstname || !lastname) {
    return res.status(400).json({ error: 'Username, password, first name, and last name are required' });
  }

  try {
    const user = new User({ username, firstname, lastname });
    await User.register(user, password);

    passport.authenticate('local-user', { session: true }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ success: false, status: 'User Registration failed!', info });
      }
      req.logIn(user, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        const token = authenticate.getToken({ _id: user._id });
        res.status(200)
          .setHeader('Content-Type', 'application/json')
          .json({ success: true, token: token, status: 'User Registration Successful!' });
      });
    })(req, res, next);
    console.log(req.session);
  } catch (err) {
    res.status(500)
      .setHeader('Content-Type', 'application/json')
      .json({ error: err.message });
    next(err);
  }
});

/**
 * @route POST /login
 * @description Logs in an existing user using the "local-user" passport strategy.
 *              After successful login, it generates a JWT token for the authenticated user.
 *              Session management is enabled.
 * @access Public
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user credentials
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with success status and JWT token if login is successful.
 * 
 */
userRouter.post('/login', passport.authenticate('local-user', { session: true }), (req, res) => {
  console.log(req.session);
  const token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'User is successfully logged in!' });
});

/**
 * @route GET /facebook/token
 * @desc Authenticates a user via Facebook and returns a JWT token if successful.
 * @access Public
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} - Response with success status and JWT token
 */
userRouter.get('/facebook/token', passport.authenticate('facebook-user', { session: true }), (req, res) => {
  if (req.user) {
    console.log(req.user);
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'Facebook user is successfully logged in!' });
  } else {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: false, status: 'Facebook authentication failed!' });
  }
});

/**
 * User logout.
 * 
 * @route GET /logout
 * @returns {object} A success message if the user is logged out or not logged in.
 * @throws Will return a 500 error for any internal server errors.
 */
userRouter.get('/logout', async (req, res, next) => {
  console.log(req.session);
  if (req.session.passport) {
    try {
      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            return reject(err);
          }
          res.clearCookie('session-id');
          resolve();
        });
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        status: 'User is successfully logged out!'
      });
    } catch (err) {
      return next(err);
    }
  } else {
    // No session exists
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      status: 'User is not logged in!'
    });
  }
});

/**
 * Upload an assignment.
 * 
 * @route POST /upload
 * @param {string} req.body.task - The task/assignment description.
 * @param {string} req.body.adminId - The ID of the admin responsible for the assignment.
 * @returns {object} A success message and the uploaded assignment if successful.
 * @throws Will return a 400 error if task or adminId is missing or invalid.
 * @throws Will return a 500 error for any internal server errors.
 */
userRouter.post('/upload', authenticate.verifyUser, async (req, res, next) => {
  try {
    const { task, adminId } = req.body;

    // Validate input fields
    if (!task || !adminId) {
      return res.status(400).json({ error: 'Task and adminId are required' });
    }

    // Check if adminId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: 'Invalid adminId' });
    }

    // Create new assignment
    const newAssignment = new Assignment({
      userId: req.user._id,  // Use the authenticated user's ID from the `verifyUser` middleware
      task: task,
      admin: adminId
    });

    // Save the new assignment to the database
    const savedAssignment = await newAssignment.save();

    // Send back the saved assignment with a success response
    return res.status(201).json({
      success: true,
      assignment: savedAssignment
    });

  } catch (err) {
    // Log the error for debugging
    console.error('Error uploading assignment:', err);

    // Pass the error to the error-handling middleware
    return next(err);
  }
});

/**
 * Fetch all admins with their associated assignments.
 * 
 * @route GET /admins
 * @returns {object} A list of admins with their assignments.
 * @throws Will return a 500 error for any internal server errors.
 */
userRouter.get('/admins', authenticate.verifyUser, async (req, res, next) => {
  try {
    const admins = await Admin.find()
      .populate('assignments') // Populate assignments field
      .exec();

    res.status(200).json({
      success: true,
      data: admins,
      status: 'Fetched all admins successfully!'
    });
  } catch (err) {
    next(err); // Handle any errors
  }
});

/**
 * Check if JWT token is valid.
 * 
 * @route GET /checkJWTtoken
 * @returns {object} Status of the JWT token validity.
 * @throws Will return a 500 error for any internal server errors.
 */
userRouter.get('/checkJWTtoken', (req, res, next) => {
  passport.authenticate('jwt-user', { session: false }, (err, user, info) => {
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

module.exports = userRouter;
