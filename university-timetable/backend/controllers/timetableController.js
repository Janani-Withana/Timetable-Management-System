// controllers/timetableController.js
const Course = require('../models/course');
const Timetable = require('../models/timetable');
const isFacultyAssignedToCourse = require('../utils/isFacultyAssignedToCourse');

const createTimetableEntry = async (req, res) => {
  const { courseId } = req.body;
  console.log("courseId"+courseId)
  console.log("userId"+req.userId)
  try {
    const course = await Course.findById(courseId);
    console.log("course"+course)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (req.userRole === 'Admin') {
      const timetableEntry = new Timetable({
        courseId
      });

      console.log("Timetable Entry:", timetableEntry); // Log timetableEntry for debugging

      const savedTimetableEntry = await timetableEntry.save();

      console.log("Saved Timetable Entry:", savedTimetableEntry); // Log savedTimetableEntry for debugging

      // Update the course's timetable field
      if (!course.timetable) {
        course.timetable = savedTimetableEntry;
      await course.save();
      }

      res.status(201).json(savedTimetableEntry);
    } else {
      return res.status(403).json({ message: 'Unauthorized - Only admins can create timetables' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const updateTimetableEntry = async (req, res) => {
  const { id } = req.params;
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (req.userRole === 'Admin') {

    const updatedTimetableEntry = await Timetable.findByIdAndUpdate(
      id,
      { courseId: courseId }, // Use $addToSet to avoid duplicate sessions
      { new: true }
    );
    res.json(updatedTimetableEntry);

    }else {
      return res.status(403).json({ message: 'Unauthorized - Only admins can create timetables' });
    }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTimetableEntry = async (req, res) => {
  const { id } = req.params;
  try {
    const timetable = await Timetable.findById(id)
    const courseId = timetable.courseId
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if ((req.userRole === 'Admin') || (req.userRole === 'Faculty' && isAssigned)) {

    await Timetable.findByIdAndDelete(id);
    res.json({ message: 'Timetable entry deleted successfully' });

    }else {
      return res.status(403).json({ message: 'Unauthorized - Only admins or assigned faculty can create sessions for this course' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
};
