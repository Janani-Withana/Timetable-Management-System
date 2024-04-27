// controllers/roomController.js
const Room = require('../models/room');
const User = require('../models/user');

//Create Room
const createRoom = async (req, res) => {
  const { name, facultyId, capacity, resources } = req.body;
  try {
    // Check if the facultyId is provided
    if (!facultyId) {
      return res.status(400).json({ message: 'Faculty ID is required' });
    }

    if ((req.userRole === 'Admin') || (req.userRole === 'Faculty' && req.userId === facultyId)) {
      const room = new Room({ name, facultyId, capacity, resources });
      const newRoom = await room.save();

      // Update the faculty's rooms array
      const faculty = await User.Faculty.findById(facultyId);
      if (!faculty.facultyRooms.includes(newRoom._id)) {
        faculty.facultyRooms.push(newRoom._id);
        await faculty.save();
      }

      res.status(201).json(newRoom);
    } else {
      return res.status(403).json({ message: 'Only admins and related faculty can create rooms' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


//Read All Rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Read Room by Room ID
const getRoomById = async (req, res) => {
  const { id } = req.params;

  try {
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Read Rooms by Faculty ID
const getRoomsByFacultyId = async (req, res) => {
  const { id } = req.params; // Assuming facultyId is passed as a URL parameter
  try {
    const rooms = await Room.find();
    // Filter rooms based on the given faculty ID
    const facultyRooms = rooms.filter(room => room.facultyId == id);

    // Check if any rooms are found
    if (facultyRooms.length === 0) {
      return res.status(404).json({ message: 'No rooms found for the specified faculty ID' });
    }
    res.json(facultyRooms);
  } catch (error) {
    // Handle any errors that occur during the database query
    res.status(500).json({ message: 'Error fetching rooms by faculty ID', error: error.message });
  }
};


//Update Room
const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name, facultyId, capacity, resources } = req.body;

  try {
    if (!facultyId) {
      return res.status(400).json({ message: 'Faculty ID is required' });
    }
    if((req.userRole == 'Admin') || (req.userRole == 'Faculty' && req.userId === facultyId)){
      const updatedRoom = await Room.findByIdAndUpdate(id, { name, facultyId, capacity, resources }, { new: true });
      res.json(updatedRoom);
    }else{
      return res.status(403).json({ message: 'Only admins and related faculty can update rooms' });
    }
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


//Delete Room
const deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the room by ID
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if the user is an admin or the owner of the room
    if (req.userRole == 'Admin' || (req.userRole == 'Faculty' && req.userId == room.facultyId)) {
      // If the room is associated with a faculty, remove it from the faculty's facultyRooms array
      if (room.facultyId) {
        const faculty = await User.Faculty.findById(room.facultyId);
        if (faculty) {
          const index = faculty.facultyRooms.indexOf(id);
          if (index > -1) {
            faculty.facultyRooms.splice(index, 1);
            await faculty.save();
          }
        }
      }

      await Room.findByIdAndDelete(id);
      return res.json({ message: 'Room deleted successfully' });
    } else {
      return res.status(403).json({ message: 'Unauthorized - Only admins or the related faculty of the room can delete it' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  getRoomsByFacultyId,
  updateRoom,
  deleteRoom,
};
