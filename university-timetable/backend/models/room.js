// models/room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  facultyId: {type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required:true},
  capacity: { type: Number, required: true,required:true },
  resources: { type: [String], default: [] },
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
