// controllers/sessionController.js
const Session = require('../models/session');
const Timetable = require('../models/timetable')
const Course = require('../models/course');
const RoomBooking = require('../models/roomBooking');
const StudentEnrollment = require('../models/studentEnrollment')
const { createNotification } = require('../controllers/notificationController.js');
const isFacultyAssignedToCourse = require('../utils/isFacultyAssignedToCourse');


//Create Session
const createSession = async (req, res) => {
  const { courseId, facultyId, day, startTime, endTime, location } = req.body;

  try {
    const isAssigned = await isFacultyAssignedToCourse(req.userId, courseId);
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if ((req.userRole === 'Admin') || (req.userRole === 'Faculty' && isAssigned)) {
      // Parse start and end time strings into Date objects
      const parsedStartTime = parseTimeString(startTime);
      const parsedEndTime = parseTimeString(endTime);

      if (!parsedStartTime || !parsedEndTime) {
        return res.status(400).json({ message: 'Invalid time format' });
      }

      // Check for overlapping sessions
      const overlappingSession = await Session.findOne({
        $and: [
          { day: day },
          { location: location },
          { $or: [
            { $and: [{ startTime: { $lt: parsedEndTime } }, { endTime: { $gt: parsedStartTime } }] },
            { $and: [{ startTime: { $eq: parsedStartTime } }, { endTime: { $eq: parsedEndTime } }] }
          ]}
        ]
      });

      if (overlappingSession) {
        return res.status(400).json({ message: 'Conflict with existing session' });
      }
      
      let session = new Session({
        course: courseId,
        faculty: facultyId,
        day,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        location,
      });
      const savedSession = await session.save();

      // Create room booking for location
      const booking = new RoomBooking({
        user: req.userId,
        room: location, // Assuming location is the room ID
        day,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        session: savedSession._id
      });
      await booking.save();

      //Save Session to the timetable 
      let timetable = await Timetable.findOne({ courseId });
      if (!timetable) {
        timetable = new Timetable({
          courseId,
          sessions: [savedSession._id] 
        });
        await timetable.save();
    
        // Update course model with timetable ID
        course.timetable = timetable._id;
        await course.save();
      } else {
        timetable.sessions.push(savedSession._id);
        await timetable.save();
      }

      // Create notification
      const message = `A new session has been scheduled for ${course.name} on ${day} from ${startTime} to ${endTime}`;
      const eventType = 'session_created';
      const enrolledStudentsDoc = await StudentEnrollment.findOne({ course: courseId });
      if (enrolledStudentsDoc) {
         const recipients = enrolledStudentsDoc.students.map(student => String(student._id));
         console.log("recipients:", recipients);
         await createNotification(message, eventType, recipients);
      } else {
         console.log("No enrolled students found for the course");
      }


      res.status(201).json(savedSession);
    } else {
      return res.status(403).json({ message: 'Unauthorized - Only admins or assigned faculty can create sessions for this course' });
    }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


//Update Session
const updateSession = async (req, res) => {
  const { id } = req.params;
  const { day, startTime, endTime, location } = req.body;

  try {
    // Fetch the session using req.id
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    } 
    const courseId = session.course;
    const course = await Course.findById(courseId)

    const isAssigned = await isFacultyAssignedToCourse(req.userId, courseId);
    if ((req.userRole === 'Admin') || (req.userRole === 'Faculty' && isAssigned)) {
      // Parse start and end time strings into Date objects
      const parsedStartTime = parseTimeString(startTime);
      const parsedEndTime = parseTimeString(endTime);

      if (!parsedStartTime || !parsedEndTime) {
        return res.status(400).json({ message: 'Invalid time format' });
      }

      // Check for overlapping sessions
      const overlappingSession = await Session.findOne({
        $and: [
          { day: day },
          { location: location },
          { $or: [
            { $and: [{ startTime: { $lt: parsedEndTime } }, { endTime: { $gt: parsedStartTime } }] },
            { $and: [{ startTime: { $eq: parsedStartTime } }, { endTime: { $eq: parsedEndTime } }] }
          ]}
        ]
      });

      if (overlappingSession) {
        return res.status(400).json({ message: 'Conflict with existing session' });
      }
      
      const updatedSession = await Session.findByIdAndUpdate(
         id,
         { day, startTime: parsedStartTime, endTime: parsedEndTime, location },
         { new: true }
      );

      //update the associated booking
      const booking = await RoomBooking.findOne({ session: id });
      if (booking) {
        booking.day = day; 
        booking.startTime = parsedStartTime;
        booking.endTime = parsedEndTime;
        booking.room = location;
        await booking.save();
      }
      
      // Create notification
      const message = `Scheduled session has been updated for ${course.name} on ${day} from ${startTime} to ${endTime}`;
      const eventType = 'session_updated';
      const enrolledStudentsDoc = await StudentEnrollment.findOne({ course: courseId });
      if (enrolledStudentsDoc) {
         const recipients = enrolledStudentsDoc.students.map(student => String(student._id));
         console.log("recipients:", recipients);
         await createNotification(message, eventType, recipients);
      } else {
         console.log("No enrolled students found for the course");
      }

      res.json(updatedSession);
    } else {
      return res.status(403).json({ message: 'Unauthorized - Only admins or assigned faculty can update sessions for this course' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Delete Session 
const deleteSession = async (req, res) => {
  const { id } = req.params;

  try {
      // Check if the user making the request is an admin or assigned faculty
      if (req.userRole !== 'Admin' && !(await isFacultyAssignedToCourse(facultyId, courseId))) {
          return res.status(403).json({ message: 'Unauthorized - Only admins or assigned faculty can delete sessions for this course' });
      }

      const session = await Session.findById(id);
      if (!session) {
          return res.status(404).json({ message: 'Session not found' });
      }
      const courseId = session.course
      const course = await Course.findById(courseId)

      // Delete the session
      await session.deleteOne();

      // Remove the deleted session from the sessions array in the timetable
      const timetable = await Timetable.findOne({ courseId: courseId });
      if (timetable) {
          timetable.sessions = timetable.sessions.filter(sessionId => sessionId.toString() !== id);
          await timetable.save();
      }

      // Find the associated booking and delete it
      const booking = await RoomBooking.findOne({ session: session._id });
      if (booking) {
         await booking.deleteOne();
      }

      // Create notification
      const message = `The scheduled session for ${course.name} on ${session.day} from ${session.startTime} to ${session.endTime} has been canceled.`;
      const eventType = 'session_deleted';
      const enrolledStudentsDoc = await StudentEnrollment.findOne({ course: courseId });
      if (enrolledStudentsDoc) {
         const recipients = enrolledStudentsDoc.students.map(student => String(student._id));
         console.log("recipients:", recipients);
         await createNotification(message, eventType, recipients);
      } else {
         console.log("No enrolled students found for the course");
      }

      res.json({ message: 'Session deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


// Function to parse time string into Date object
function parseTimeString(timeString) {
  // Assuming timeString is in format "HH:MM AM/PM"
  const [time, meridiem] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));

  if (isNaN(hours) || isNaN(minutes)) {
    return null; // Invalid time format
  }

  let parsedHours = hours;
  if (meridiem === 'PM' && hours !== 12) {
    parsedHours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    parsedHours = 0;
  }

  return new Date(2000, 0, 1, parsedHours, minutes); // Use a consistent date (2000-01-01)
}


module.exports = {
  createSession,
  updateSession,
  deleteSession,
  parseTimeString
};
