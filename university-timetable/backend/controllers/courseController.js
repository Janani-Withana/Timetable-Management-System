// controllers/courseController.js
const Course = require('../models/course');
const studentEnrollment = require('../models/studentEnrollment');
const User = require('../models/user');

//Create Course
const createCourse = async (req, res) => {
  const { name, code, description, credits } = req.body;
  try {
    // Check if the user making the request is an admin
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can create courses' });
    }

    const course = new Course({ name, code, description, credits });
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Read All Courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Read Course by ID
const getCourseById = async (req, res) => {
  const { id } = req.params; // Get the course ID from request parameters
 
  try {
    const course = await Course.findById(id); // Find the course by its ID
    if (!course) {
      return res.status(404).json({ message: 'Course not found' }); // Return 404 if course is not found
    }
    res.json(course); // Return the course if found
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return 500 if any error occurs
  }
};

//Update Course
const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, code, description, credits } = req.body;
  console.log("req.userId::",req.userId)
  try {
    const isAssigned = await isFacultyAssignedToCourse(req.userId, id);
    
    if((req.userRole == 'Admin') || (req.userRole == 'Faculty' && isAssigned)){
      const updatedCourse = await Course.findByIdAndUpdate(
        id,
        { name, code, description, credits },
        { new: true }
      );
      res.json(updatedCourse);
    }
    else{
      return res.status(403).json({ message: 'Unauthorized - Only admins or assigned faculty can update courses' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Delete Course
const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const isAssigned = await isFacultyAssignedToCourse(req.userId, id);
    
    // Check if the user making the request is an admin or assigned faculty
    if((req.userRole == 'Admin') || (req.userRole == 'Faculty' && isAssigned)){
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const deletedCourse = await Course.findByIdAndDelete(id);
      
      // If the course had a faculty assigned, remove the course from faculty's courses array
      if (course.faculty) {
        const faculty = await User.Faculty.findById(course.faculty);
        if (faculty) {
          const index = faculty.facultyCourses.indexOf(id);
          if (index > -1) {
            faculty.facultyCourses.splice(index, 1);
            await faculty.save();
          }
        }
      }
      
       // Delete associated enrollment document from StudentEnrollment collection
       await studentEnrollment.findOneAndDelete({ course: id });

      res.json({ message: 'Course deleted successfully' });
    } else {
      return res.status(403).json({ message: 'Unauthorized - Only admins or assigned faculty can delete courses' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Assign Faculty to a Course
const assignFacultyToCourse = async (req, res) => {
  try {
    const { courseId, facultyId } = req.body;

    // Check if the user making the request is an admin
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can assign faculty to courses' });
    }

    // Update the course with the provided Faculty ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    //Check whether any faculty is already assigned to the course 
    if (course && course.faculty) {
      if(course.faculty == facultyId){
        return res.status(400).json({ message: 'This Faculty is already assigned to this course' });
      }else{
        return res.status(400).json({ message: 'Another Faculty is already assigned to this course' });
      }
    }
    

    // Assign faculty to the course
    course.faculty = facultyId;
    await course.save();

    // Update the faculty's courses array
    const faculty = await User.Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    // Add the courseId to the faculty's courses array if not already present
    if (!faculty.facultyCourses.includes(courseId)) {
      faculty.facultyCourses.push(courseId);
      await faculty.save();
    }

    res.status(200).json({ message: 'Faculty assigned to course successfully' });
  } catch (error) {
    console.error('Assign Faculty to Course Error:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

// Helper function to check if faculty is assigned to a course
const isFacultyAssignedToCourse = async (facultyId, courseId) => {
  const course = await Course.findById(courseId);
  return course && course.faculty && course.faculty._id == facultyId;
};


module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  assignFacultyToCourse,
};
