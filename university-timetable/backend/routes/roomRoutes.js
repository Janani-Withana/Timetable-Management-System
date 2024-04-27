// routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authenticateUser = require('../middleware/authMiddleware');

router.post('/create',authenticateUser,roomController.createRoom);
router.get('/getAllRooms',roomController.getAllRooms);
router.get('/getRoom/:id',roomController.getRoomById);
router.get('/getRoomsByFaculty/:id',roomController.getRoomsByFacultyId);
router.put('/update/:id',authenticateUser, roomController.updateRoom);
router.delete('/delete/:id',authenticateUser, roomController.deleteRoom);

module.exports = router;
