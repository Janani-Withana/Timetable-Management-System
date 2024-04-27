const RoomBooking = require('../models/roomBooking');
const ResourceBooking = require('../models/resourceBooking');
const Resource = require('../models/resource');
const Session = require('../models/session');
//const {parseTimeString} = require('../controllers/sessionController')

// Book Room
const bookRoom = async (req, res) => {
  try {
    if (!(req.userRole == 'Admin' || req.userRole == 'Faculty')) {
      return res.status(403).json({ message: 'Only admins and faculties can book rooms' });
    }
    const userId = req.userId
    const { roomId, day, startTime, endTime, session} = req.body;
   
    // Parse start time and end time strings into Date objects
    const parsedStartTime = parseTimeString(startTime);
    const parsedEndTime = parseTimeString(endTime);
    if (!parsedStartTime || !parsedEndTime) {
      return res.status(400).json({ message: 'Invalid time format' });
    }

    console.log(parsedEndTime,parsedStartTime)

    // Check if room is available for booking at the specified time
    const isRoomAvailable = await checkRoomAvailability(day, roomId, parsedStartTime, parsedEndTime);
    console.log("is room available"+ isRoomAvailable)
    if (!isRoomAvailable) {
      return res.status(400).json({ message: 'Room is not available at the specified time' });
    }

    // Create booking
    const booking = new RoomBooking({
      room: roomId,
      user: userId,
      day,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      session
    });
    const newBooking = await booking.save();

    // Update the session with the booked room
    const sessionToUpdate = await Session.findById(session);
    if (!sessionToUpdate) {
      return res.status(404).json({ message: 'Session not found' });
    }
    sessionToUpdate.rooms.push(roomId);
    await sessionToUpdate.save();

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error booking room', error: error.message });
  }
};

// Book Resource
const bookResource = async (req, res) => {
  try {
    if (!(req.userRole == 'Admin' || req.userRole == 'Faculty')) {
      return res.status(403).json({ message: 'Only admins and faculties can book resources' });
    }
    const { resourceId, quantity, day, startTime, endTime,session } = req.body;
    // Parse start time and end time strings into Date objects
    const parsedStartTime = parseTimeString(startTime);
    const parsedEndTime = parseTimeString(endTime);
    if (!parsedStartTime || !parsedEndTime) {
      return res.status(400).json({ message: 'Invalid time format' });
    }

    // Check if resource is available for booking at the specified time and has non-zero quantity
    const isResourceAvailable = await checkResourceAvailability(resourceId,quantity);
    if (!isResourceAvailable) {
      return res.status(400).json({ message: 'Resource is not available at the specified time or has zero quantity' });
    }

    // Create booking
    const booking = new ResourceBooking({
      user: req.userId,
      resource: resourceId,
      quantity,
      day,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      session
    });
    const newBooking = await booking.save();

    // Reduce the quantity of the resource by quantity
    const resource = await Resource.findById(resourceId);
    resource.quantity -= quantity;
    await resource.save();

    // Update the session with the booked resource
    const sessionToUpdate = await Session.findById(session);
    if (!sessionToUpdate) {
      return res.status(404).json({ message: 'Session not found' });
    }
    sessionToUpdate.resources.push(resourceId);
    await sessionToUpdate.save();

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error booking resource:', error);
    res.status(500).json({ message: 'Error booking resource', error: error.message });
  }
};

// Read Room Bookings
const getRoomBookings = async (req, res) => {
  try {
    const bookings = await RoomBooking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// Read Resource Bookings
const getResourceBookings = async (req, res) => {
  try {
    const bookings = await ResourceBooking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// Read ResourceBooking by ID
const getRoomBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await RoomBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
};

// Read ResourceBooking by ID
const getResourceBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await ResourceBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
};

// Update Room Booking
const updateRoomBooking = async (req, res) => {
  const { id } = req.params;
  const { day, startTime, endTime,room,session } = req.body;
  try {
    const booking = await RoomBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    // Check if the user making the request is the same as the user who created the booking
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized - You are not allowed to update this booking' });
    }

    // Parse start time and end time strings into Date objects
    const parsedStartTime = parseTimeString(startTime);
    const parsedEndTime = parseTimeString(endTime);
    if (!parsedStartTime || !parsedEndTime) {
      return res.status(400).json({ message: 'Invalid time format' });
    }

    // Check if room is available for booking at the specified time
    const isRoomAvailable = await checkRoomAvailabilityForUpdate(day, room, parsedStartTime, parsedEndTime, id);
    console.log("is room available"+ isRoomAvailable)
    if (!isRoomAvailable) {
      return res.status(400).json({ message: 'Room is not available at the specified time' });
    }

    const updatedBooking = await RoomBooking.findByIdAndUpdate(
      id, 
      {room, day, startTime: parsedStartTime, endTime: parsedEndTime, session }, 
      { new: true }
    );

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
};

// Update Room Booking
const updateResourceBooking = async (req, res) => {
  const { id } = req.params;
  const { resource, quantity, day, startTime, endTime, session } = req.body;
  
  try {
    const booking = await ResourceBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the user making the request is the same as the user who created the booking
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized - You are not allowed to update this booking' });
    }

    // Parse start time and end time strings into Date objects
    const parsedStartTime = parseTimeString(startTime);
    const parsedEndTime = parseTimeString(endTime);
    if (!parsedStartTime || !parsedEndTime) {
      return res.status(400).json({ message: 'Invalid time format' });
    }

    // Retrieve the resource details
    const resourceToUpdate = await Resource.findById(resource);
    if (!resourceToUpdate) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    resourceToUpdate.quantity += booking.quantity;  // Add the existing booking quantity back to the resource's quantity
    await resourceToUpdate.save();

    // Check if resource is available for booking at the specified time and has non-zero quantity
    const isResourceAvailable = await checkResourceAvailability(resource, quantity);
    if (!isResourceAvailable) {
      // Restore the original quantity if the resource is not available
      resourceToUpdate.quantity -= booking.quantity;
      await resourceToUpdate.save();
      return res.status(400).json({ message: 'Resource has insufficient quantity' });
    }

    // Deduct the updated quantity from the resource's quantity
    resourceToUpdate.quantity -= quantity;
    await resourceToUpdate.save();

    // Update the booking
    const updatedBooking = await ResourceBooking.findByIdAndUpdate(id, 
      { resource, quantity, day, startTime: parsedStartTime, endTime: parsedEndTime, session }, 
      { new: true }
    );

    res.status(201).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
};


// Delete Resource Booking
const deleteResourceBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await ResourceBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    // Check if the user making the request is the same as the user who created the booking
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized - You are not allowed to update this booking' });
    }

    // Retrieve the resource details
    const resourceToUpdate = await Resource.findById(booking.resource);
    if (!resourceToUpdate) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    resourceToUpdate.quantity += booking.quantity;  // Add the existing booking quantity back to the resource's quantity
    await resourceToUpdate.save();

    await ResourceBooking.findByIdAndDelete(id);

    // Remove the deleted resource from the resources array in the session
    const session = await Session.findById(booking.session);
    if (session) {
      console.log(booking.resource.toString())
      session.resources = session.resources.filter(resourceId => resourceId.toString() !== booking.resource.toString());
      await session.save();
    }
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
};

// Delete Room Booking
const deleteRoomBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await RoomBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    // Check if the user making the request is the same as the user who created the booking
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized - You are not allowed to update this booking' });
    }

    await RoomBooking.findByIdAndDelete(id);

    // Remove the deleted room from the rooms array in the session
    const session = await Session.findById(booking.session);
    if (session) {
      console.log(booking.room.toString())
      session.rooms = session.rooms.filter(roomId => roomId.toString() !== booking.room.toString());
      await session.save();
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
};

// Check Room Availability
const checkRoomAvailability = async (day,roomId, startTime, endTime) => {
  const overlappingBookings = await RoomBooking.findOne({
        $and: [
          { day: day },
          { room: roomId },
          { $or: [
            { $and: [{ startTime: { $lt: endTime } }, { endTime: { $gt: startTime } }] },
            { $and: [{ startTime: { $eq: startTime } }, { endTime: { $eq: endTime } }] }
          ]}
        ]  
  });
  if (!overlappingBookings) {
    return true; // No overlap found
  }
};

// Check Resource Availability with Quantity
const checkResourceAvailability = async (resourceId, requiredQuantity) => {
  try {
    const resource = await Resource.findById(resourceId);
    return resource && resource.quantity >= requiredQuantity;
  } catch (error) {
    console.error('Error checking resource availability:', error);
    return false; // Return false in case of any error
  }
};

//Check Room Availability for update
const checkRoomAvailabilityForUpdate = async (day, roomId, startTime, endTime, excludedBookingId) => {
  const query = {
    $and: [
      { day: day },
      { room: roomId },
      { _id: { $ne: excludedBookingId } }, // Exclude the provided booking ID
      {
        $or: [
          { $and: [{ startTime: { $lt: endTime } }, { endTime: { $gt: startTime } }] },
          { $and: [{ startTime: { $eq: startTime } }, { endTime: { $eq: endTime } }] }
        ]
      }
    ]
  };

  const overlappingBookings = await RoomBooking.findOne(query);
  if (!overlappingBookings) {
    return true; // No overlap found
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
  bookRoom,
  bookResource,
  getResourceBookings,
  getRoomBookings,
  getResourceBookingById,
  getRoomBookingById,
  updateResourceBooking,
  updateRoomBooking,
  deleteResourceBooking,
  deleteRoomBooking,
  checkRoomAvailability,
  checkResourceAvailability,
};
