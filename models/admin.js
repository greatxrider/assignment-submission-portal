const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

/**
 * Admin Schema to represent Admin users.
 * @typedef {Object} Admin
 * @property {String} firstname - First name of the admin, required.
 * @property {String} lastname - Last name of the admin, required.
 * @property {String} username - Unique username for the admin, required.
 * @property {String} facebookId - Optional Facebook ID for the admin, defaults to null.
 */
const adminSchema = new Schema({
    firstname: {
        type: String,
        required: [true, 'First name is required']
    },
    lastname: {
        type: String,
        required: [true, 'Last name is required']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true
    },
    facebookId: {
        type: String,
        default: null
    }
});

/**
 * Virtual field `assignments` to get assignments related to the admin.
 * Links assignments where the admin's `_id` is referenced in the `admin` field of the Assignment model.
 * @type {Object}
 * @property {String} ref - Model to reference (Assignment).
 * @property {String} localField - Local field to use in the reference (Admin `_id`).
 * @property {String} foreignField - Foreign field in Assignment to match against (admin field).
 */
adminSchema.virtual('assignments', {
    ref: 'Assignment',
    localField: '_id',
    foreignField: 'admin'
});

/**
 * Ensures virtual fields (like `assignments`) are included in JSON responses.
 * @param {boolean} virtuals - Set to true to include virtual fields.
 */
adminSchema.set('toJSON', {
    virtuals: true
});

/**
 * Plugin to add username, password hashing, and authentication methods via passport-local-mongoose.
 * This plugin simplifies setting up user authentication.
 */
adminSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Admin', adminSchema);
