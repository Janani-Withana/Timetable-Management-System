const User = require('../models/user');
const Course = require('../models/course');
// const isFacultyAssignedToCourse = async (facultyId, courseId) => {
//   try {
//     const faculty = await User.Faculty.findById(facultyId);

//     if (!faculty) {
//       // Faculty not found
//       return false;
//     }

//     // Check if the faculty's courses include the given courseId
//     return faculty.courses.includes(courseId);
//   } catch (error) {
//     // Handle errors (e.g., database error)
//     console.error('Error checking faculty assignment to course:', error);
//     return false;
//   }
// };

// Helper function to check if faculty is assigned to a course
const isFacultyAssignedToCourse = async (facultyId, courseId) => {
  const course = await Course.findById(courseId);
  return course && course.faculty._id == facultyId;
};

module.exports = isFacultyAssignedToCourse;
