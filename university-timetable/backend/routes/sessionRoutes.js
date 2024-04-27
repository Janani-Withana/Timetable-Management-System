// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authenticateUser = require('../middleware/authMiddleware');

// Routes
router.post('/create', authenticateUser,sessionController.createSession);
router.put('/update/:id',authenticateUser, sessionController.updateSession);
router.delete('/delete/:id',authenticateUser, sessionController.deleteSession);

module.exports = router;
