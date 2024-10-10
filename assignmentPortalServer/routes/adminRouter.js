const express = require('express');
const adminRouter = express.Router();

// Define your routes here
adminRouter.get('/', (req, res) => {
    res.send('Assignments');
});

module.exports = adminRouter;