// models/session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  day: { type: String, required: true },
  startTime: { type: Date, required: true }, 
  endTime: { type: Date, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Room',required:true},
  resources:[{type: mongoose.Schema.Types.ObjectId, ref: 'Resources'}],
  rooms:[{type: mongoose.Schema.Types.ObjectId, ref: 'Room'}]
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
