const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true},
  description: { type: String },
  credits: { type: Number, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty'},
  timetable: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable'}
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
