const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// Base User schema
const userSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Faculty', 'Student'], required: true },
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
});

// Hash the password before saving to the database
userSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with the hashed password in the database
userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

const User = mongoose.model('User', userSchema);

const Admin = mongoose.model('Admin', new Schema({
  // Admin-specific properties 
  adminId:{type:String,required:true}
}));

const Faculty = mongoose.model('Faculty', new Schema({
  // Faculty-specific properties
  facultyId:{type:String,required:true},
  facultyName: { type: String},
  facultyCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  facultyRooms:[{type: Schema.Types.ObjectId, ref: 'Room'}]
}));

const Student = mongoose.model('Student', new Schema({
  // Student-specific properties
  studentId: {type:String,required:true},
  studentName: { type: String, required: true },
  academicYear: { type: String, required: true },
  studentFaculty: { type: Schema.Types.ObjectId, ref: 'Faculty' },
}));

module.exports = {
  User,
  Admin,
  Faculty,
  Student,
};
