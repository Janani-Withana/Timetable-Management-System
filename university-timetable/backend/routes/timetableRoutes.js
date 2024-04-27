// routes/timetableRoutes.js
const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const authenticateUser = require('../middleware/authMiddleware');

// Routes
router.post('/create',authenticateUser, timetableController.createTimetableEntry);
router.put('/update/:id',authenticateUser, timetableController.updateTimetableEntry);
router.delete('/delete/:id',authenticateUser, timetableController.deleteTimetableEntry);

module.exports = router;
