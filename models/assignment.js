const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Assignment Schema to represent task assignments for users, linked to admins.
 * @typedef {Object} Assignment
 * @property {mongoose.Schema.Types.ObjectId} userId - The ID of the user this assignment is associated with, required.
 * @property {String} task - The description of the task assigned, required.
 * @property {mongoose.Schema.Types.ObjectId} admin - The ID of the admin managing the assignment, required.
 * @property {String} status - The status of the assignment, which can be 'pending', 'accepted', or 'rejected'. Defaults to 'pending'.
 * @property {Date} createdAt - The date the assignment was created, defaults to the current date.
 */
const assignmentSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        validate: {
            validator: function (value) {
                return value != null;
            },
            message: 'User ID is required'
        }
    },
    task: {
        type: String,
        required: [true, 'A task is required'],
        validate: [
            {
                validator: function (value) {
                    return value != null && value.trim().length > 0;
                },
                message: 'Please provide a valid task'
            }
        ]
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: [true, 'Admin ID is required'],
        validate: {
            validator: function (value) {
                return value != null;
            },
            message: 'Admin ID is required'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
