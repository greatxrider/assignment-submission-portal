const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const FacebookTokenStrategy = require('passport-facebook-token');
const config = require('./config.js');
const User = require('./models/user');
const Admin = require('./models/admin');

/**
 * Function to create a local strategy
 * @param {Object} Model - The model to use for authentication
 * @returns {LocalStrategy} - The local strategy
 */
const createLocalStrategy = (Model) => {
    return new LocalStrategy(Model.authenticate());
};
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

/**
 * Function to create a JWT strategy
 * @param {Object} Model - The model to use for authentication
 * @returns {JwtStrategy} - The JWT strategy
 */
const createJwtStrategy = (Model) => {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.secretKey;

    return new JwtStrategy(opts, (jwt_payload, done) => {
        console.log('JWT payload:', jwt_payload);

        Model.findOne({ _id: jwt_payload._id })
            .then((user) => {
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            }).catch((err) => done(err, false));
    });
};

/**
 * Function to create a Facebook strategy
 * @param {Object} Model - The model to use for authentication
 * @returns {FacebookTokenStrategy} - The Facebook strategy
 */
const createFacebookStrategy = (Model) => {
    return new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        },
        (accessToken, refreshToken, profile, done) => {
            Model.findOne({ facebookId: profile.id })
                .then((user) => {
                    if (user) {
                        return done(null, user);
                    } else {
                        // Create a new user if not found
                        const newUser = new Model({
                            username: profile.displayName,
                            facebookId: profile.id,
                            firstname: profile.name.givenName,
                            lastname: profile.name.familyName
                        });
                        // Save the new user
                        return newUser.save()
                            .then((savedUser) => {
                                done(null, savedUser);
                            })
                            .catch((err) => {
                                done(err, false);
                            });
                    }
                })
                .catch((err) => done(err, false));
        }
    );
};

// Local strategies
exports.localUser = passport.use('local-user', createLocalStrategy(User));
exports.localAdmin = passport.use('local-admin', createLocalStrategy(Admin));

// JWT strategies
exports.jwtUser = passport.use('jwt-user', createJwtStrategy(User));
exports.jwtAdmin = passport.use('jwt-admin', createJwtStrategy(Admin));

// Facebook strategies
exports.facebookUser = passport.use('facebook-user', createFacebookStrategy(User));
exports.facebookAdmin = passport.use('facebook-admin', createFacebookStrategy(Admin));

/**
 * Function to generate a token
 * @param {Object} user - The user object
 * @param {number} [time=3600] - The expiration time in seconds
 * @returns {string} - The generated token
 */
exports.getToken = function (user, time = 3600) {
    return jwt.sign(user, config.secretKey, { expiresIn: time });
};

// Middleware to verify user
exports.verifyUser = passport.authenticate('jwt-user', { session: false });

// Middleware to verify admin
exports.verifyAdmin = passport.authenticate('jwt-admin', { session: false });
