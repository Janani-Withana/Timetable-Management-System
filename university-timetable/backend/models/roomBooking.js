// models/roomBooking.js
const mongoose = require('mongoose');

const roomBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  day: {type:String,required:true},
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  session: {type: mongoose.Schema.Types.ObjectId, ref: 'Session'}
});

const RoomBooking = mongoose.model('RoomBooking', roomBookingSchema);

module.exports = RoomBooking;
