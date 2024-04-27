// models/booking.js
const mongoose = require('mongoose');

const resourceBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  quantity: { type: Number, default: 1 },
  day: {type:String,required:true},
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  session: {type: mongoose.Schema.Types.ObjectId, ref: 'Session'}
});

const ResourceBooking = mongoose.model('ResourceBooking', resourceBookingSchema);

module.exports = ResourceBooking;

