const StudentEnrollment = require('../models/studentEnrollment');
const Course = require('../models/course');

// Enroll Student in Course
const enrollStudentInCourse = async (req, res) => {
  try {
      const { courseId } = req.body;
      const studentId = req.userId;

      console.log("courseId" + courseId);

      if (req.userRole !== 'Student') {
          return res.status(403).json({ message: 'Only students can enroll in courses' });
      }

      const course = await Course.findById(courseId);
      if (!course) {
          return res.status(404).json({ message: 'Course not found' });
      }

      // Check if the student is already enrolled in the course
      const existingEnrollment = await StudentEnrollment.findOne({ course: courseId, students: studentId });
      if (existingEnrollment) {
          return res.status(400).json({ message: 'Student is already enrolled in the course' });
      }

      // Check if there is an enrollment record for the course
      const courseEnrollment = await StudentEnrollment.findOne({ course: courseId });
      if (!courseEnrollment) {
          // If not, create one and add the student
          const newEnrollment = new StudentEnrollment({
              course: courseId,
              students: [studentId]
          });
          await newEnrollment.save();
      } else {
          // If available, add the student to it
          await StudentEnrollment.updateOne({ course: courseId }, { $push: { students: studentId } }, { upsert: true });
      }

      res.status(201).json({ message: 'Student enrolled in course successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error enrolling student in course', error: error.message });
  }
};

  

// Unenroll Student from Course
const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.userId;

    // Check if the user is a student
    if (req.userRole !== 'Student') {
      console.log("0001")
      return res.status(403).json({ message: 'Only students can unenroll from courses' });
    }

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      console.log("0002")
      return res.status(404).json({ message: 'Course not found' });
    }

    const enrollment = await StudentEnrollment.findOne({ course: courseId });
    if (!enrollment) {
      console.log("0003");
      return res.status(404).json({ message: 'Course enrollment not found' });
    }

    // Check if the provided studentId is included in the enrolled students array
    if (!enrollment.students.includes(studentId)) {
       console.log("0004");
       return res.status(404).json({ message: 'Student is not enrolled in this course' });
    }

    // Remove the studentId from the students array
    await StudentEnrollment.updateOne({ course: courseId }, { $pull: { students: studentId } });

    res.json({ message: 'Student unenrolled from course successfully' });
  } catch (error) {
    console.log("0004")
    res.status(500).json({ message: 'Error unenrolling student from course', error: error.message });
  }
};

  

// Get Enrolled Courses of a Student
const getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.userId;

    // Check if the user is a student
    if (req.userRole !== 'Student') {
      return res.status(403).json({ message: 'Only students can view their enrolled courses' });
    }

    // Find all enrollments for the student
    const enrollments = await StudentEnrollment.find({ students: studentId }).populate('course');

    // Check if there are enrolled courses
    if (enrollments.length == 0) {
        return res.status(404).json({ message: 'No enrolled courses found for the student' });
    }

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrolled courses', error: error.message });
  }
};

//get Students Specific timetable
const getEnrolledTimetables = async (req, res) => {
    try {
      const studentId = req.userId;
  
      // Get the list of courses in which the student is enrolled
      const enrolledCourses = await StudentEnrollment.find({ students: studentId }).select('course').populate('course');
  
      // Iterate through each enrolled course to retrieve its timetable
      const timetables = [];
      for (const enrollment of enrolledCourses) {
        const course = enrollment.course;
        if (course.timetable) {
          // If the course has a timetable, add it to the list
          timetables.push(course.timetable);
        }
      }
  
      res.json({ timetables });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching enrolled courses timetables', error: error.message });
    }
};
  


// Get Student Enrollments
const getStudentEnrollments = async (req, res) => {
  try {
    // Check if the user making the request is a faculty or admin
    if (req.userRole == 'Student') {
      return res.status(403).json({ message: "Unauthorized - Only faculty and admins can view all students' enrollments" });
    }

    const enrollments = await StudentEnrollment.find().populate('students').populate('course');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student enrollments', error: error.message });
  }
};

// Remove Student from Course
const removeStudentFromCourse = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    const isAssigned = await isFacultyAssignedToCourse(req.userId, courseId);

    // Check if the user is an admin or faculty
    if ((req.userRole !== 'Admin') && (req.userRole !== 'Faculty' || !isAssigned)) {
      return res.status(403).json({ message: 'Only admins and assigned faculty can remove students from courses' });
    }

    // Find the enrollment
    const enrollment = await StudentEnrollment.findOne({ course: courseId, students: studentId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Remove the student from the students array
    enrollment.students = enrollment.students.filter(student => student.toString() !== studentId);
    await enrollment.save();

    res.json({ message: 'Student removed from course successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing student from course', error: error.message });
  }
};


// Helper function to check if faculty is assigned to a course
const isFacultyAssignedToCourse = async (facultyId, courseId) => {
  const course = await Course.findById(courseId);
  return course && course.faculty && course.faculty._id == facultyId;
};
  

module.exports = {
  enrollStudentInCourse,
  unenrollFromCourse,
  getEnrolledCourses,
  getEnrolledTimetables,
  getStudentEnrollments,
  removeStudentFromCourse,
};
