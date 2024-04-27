const mongoose = require('mongoose');

const studentEnrollmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required:true},
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // Array of student IDs

});

module.exports = mongoose.model('StudentEnrollment', studentEnrollmentSchema);
