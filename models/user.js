const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

/**
 * User Schema to represent system users with their personal details and assignments.
 * @typedef {Object} User
 * @property {String} firstname - The first name of the user, required.
 * @property {String} lastname - The last name of the user, required.
 * @property {String} username - The unique username for the user, required and must be unique.
 * @property {String} facebookId - The Facebook ID of the user, optional, defaults to null.
 * @property {Assignment[]} assignments - A virtual field referencing the assignments associated with the user.
 */
const userSchema = new Schema({
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
        type: String
    }
});

/**
 * Virtual field to reference assignments associated with the user.
 * @typedef {Assignment[]} User.assignments
 * @property {mongoose.Schema.Types.ObjectId} _id - The ID of the user that matches the foreignField in the Assignment schema.
 * @property {mongoose.Schema.Types.ObjectId} user - The field in the Assignment schema that stores the reference to the User.
 */
userSchema.virtual('assignments', {
    ref: 'Assignment',   // The model to reference
    localField: '_id',   // The field in Admin that matches the foreignField in Assignment
    foreignField: 'user'  // The field in Assignment that stores the reference to Admin
});

// Plugin for passport-local-mongoose to handle user authentication
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
