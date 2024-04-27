const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authenticateUser = require('../middleware/authMiddleware');

// Enroll student in course
router.post('/enroll', authenticateUser, enrollmentController.enrollStudentInCourse);
router.post('/unenroll', authenticateUser,enrollmentController.unenrollFromCourse);
router.get('/enrolled_timetable',authenticateUser, enrollmentController.getEnrolledTimetables);
router.get('/enrolled_courses',authenticateUser, enrollmentController.getEnrolledCourses);
router.get('/enrolled_students', authenticateUser,enrollmentController.getStudentEnrollments);
router.delete('/remove_student',authenticateUser,enrollmentController.removeStudentFromCourse)

module.exports = router;
