const express = require('express');
const Admin = require('../models/admin');
const passport = require('passport');
const authenticate = require('../authenticate');
const Assignment = require('../models/assignment');

const adminRouter = express.Router();
adminRouter.use(passport.initialize());

/**
 * @route GET /admins
 * @group Admin
 * @returns {Object} 200 - A list of all admins with their associated assignments.
 * @returns {Error}  default - Unexpected error
 * @description Fetches all admins along with their related assignments.
 */
adminRouter.get('/', async (req, res, next) => {
    try {
        const admins = await Admin.find()
            .populate({
                path: 'assignments',
                model: 'Assignment'
            })
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
 * @route POST /admins/register
 * @group Admin
 * @param {string} username.body.required - The admin's username.
 * @param {string} password.body.required - The admin's password.
 * @param {string} firstname.body.required - The admin's first name.
 * @param {string} lastname.body.required - The admin's last name.
 * @returns {Object} 200 - Successful registration, returns admin's token.
 * @returns {Error}  400 - Invalid input.
 * @returns {Error}  500 - Server error.
 * @description Registers a new admin and logs them in.
 */
adminRouter.post('/register', async (req, res, next) => {
    const { username, password, firstname, lastname } = req.body;

    // Validate input
    if (!username || !password || !firstname || !lastname) {
        return res.status(400).json({ error: 'Username, password, first name, and last name are required' });
    }

    try {
        const user = new Admin({ username, firstname, lastname });
        await Admin.register(user, password);

        passport.authenticate('local-admin', { session: true }, (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ success: false, status: 'Admin Registration failed!', info });
            }
            req.logIn(user, { session: false }, (err) => {
                if (err) {
                    return next(err);
                }
                const token = authenticate.getToken({ _id: user._id });
                res.status(200)
                    .setHeader('Content-Type', 'application/json')
                    .json({ success: true, token: token, status: 'Admin Registration Successful!' });
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
 * @route POST /admins/login
 * @group Admin
 * @returns {Object} 200 - Successful login, returns admin's token.
 * @returns {Error}  401 - Invalid credentials.
 * @description Logs in an admin and returns the token.
 */
adminRouter.post('/login', passport.authenticate('local-admin'), (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'Admin is successfully logged in!' });
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
adminRouter.get('/facebook/token', passport.authenticate('facebook-admin', { session: true }), (req, res) => {
    if (req.user) {
        console.log(req.user);
        const token = authenticate.getToken({ _id: req.user._id });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, token: token, status: `${req.user.firstname} is successfully logged in!` });
    } else {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: false, status: 'Facebook authentication failed!' });
    }
});

/**
 * @route GET /admins/logout
 * @group Admin
 * @returns {Object} 200 - Successful logout.
 * @description Logs out the current admin by destroying the session.
 */
adminRouter.get('/logout', async (req, res, next) => {
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
                status: 'Admin is successfully logged out!'
            });
            console.log('Session after logout:', req.session);
            console.log('Cookies after logout:', req.cookies);
        } catch (err) {
            return next(err);
        }
    } else {
        // No session exists
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
            success: true,
            status: 'Admin is not logged in!'
        });
    }
});

/**
 * @route GET /admins/assignments
 * @group Admin
 * @returns {Object} 200 - List of assignments for the current admin.
 * @returns {Error}  401 - Unauthorized.
 * @description Fetches all assignments for the currently logged-in admin.
 */
adminRouter.get('/assignments', authenticate.verifyAdmin, (req, res, next) => {
    Assignment.find({ admin: req.user._id })
        .populate('admin')
        .then((assignments) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(assignments);
        })
        .catch((err) => next(err));
});

/**
 * @route POST /admins/assignments/:id/accept
 * @group Admin
 * @param {string} id.path.required - The ID of the assignment to accept.
 * @returns {Object} 200 - Success message and updated assignment.
 * @description Accepts an assignment by updating its status to "accepted".
 */
adminRouter.post('/assignments/:id/accept', authenticate.verifyAdmin, (req, res, next) => {
    Assignment.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true })
        .then((assignment) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, assignment });
        })
        .catch((err) => next(err));
});

/**
 * @route POST /admins/assignments/:id/reject
 * @group Admin
 * @param {string} id.path.required - The ID of the assignment to reject.
 * @returns {Object} 200 - Success message and updated assignment.
 * @description Rejects an assignment by updating its status to "rejected".
 */
adminRouter.post('/assignments/:id/reject', authenticate.verifyAdmin, (req, res, next) => {
    Assignment.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true })
        .then((assignment) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, assignment });
        })
        .catch((err) => next(err));
});

/**
 * @route GET /admins/checkJWTtoken
 * @group Admin
 * @returns {Object} 200 - JWT validity status.
 * @returns {Error}  401 - JWT invalid.
 * @description Checks if the JWT token is valid.
 */
adminRouter.get('/checkJWTtoken', (req, res, next) => {
    passport.authenticate('jwt-admin', { session: false }, (err, user, info) => {
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

module.exports = adminRouter;
