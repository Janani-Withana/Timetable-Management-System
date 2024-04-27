// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateUser = require('../middleware/authMiddleware');

// CRUD operations on courses
router.get('/get_all_courses', courseController.getAllCourses);
router.get('/get_course/:id', courseController.getCourseById);
router.post('/create_course', authenticateUser,courseController.createCourse);
router.put('/update_course/:id', authenticateUser,courseController.updateCourse);
router.delete('/delete_course/:id', authenticateUser,courseController.deleteCourse);

// Assign Faculty to a Course
router.post('/assign_faculty', authenticateUser, courseController.assignFacultyToCourse);

module.exports = router;
