// models/timetable.js
const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  courseId:{type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true},
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session'}],
});

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;

