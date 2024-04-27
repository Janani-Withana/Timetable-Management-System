const express = require('express');
const router = express.Router();
const {
  bookRoom,
  bookResource,
  getResourceBookings,
  getRoomBookings,
  getResourceBookingById,
  getRoomBookingById,
  updateResourceBooking,
  updateRoomBooking,
  deleteResourceBooking,
  deleteRoomBooking,
} = require('../controllers/bookingController');
const authenticateUser = require('../middleware/authMiddleware');

router.post('/book_room',authenticateUser, bookRoom);
router.post('/book_resource',authenticateUser, bookResource);
router.get('/get_resource_bookings', getResourceBookings);
router.get('/get_room_bookings', getRoomBookings);
router.get('/get_resource_booking/:id', getResourceBookingById);
router.get('/get_room_booking/:id', getRoomBookingById);
router.put('/update_resource_booking/:id', authenticateUser, updateResourceBooking);
router.put('/update_room_booking/:id', authenticateUser, updateRoomBooking);
router.delete('/delete_resource_booking/:id', authenticateUser, deleteResourceBooking);
router.delete('/delete_room_booking/:id', authenticateUser, deleteRoomBooking);

module.exports = router;
