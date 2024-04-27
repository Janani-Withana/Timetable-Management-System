const mongoose = require('mongoose');
const { sign } = require('jsonwebtoken');
const User = require('../models/user');
const Course = require('../models/course');
const crypto = require('crypto');
const fs = require('fs');
const secretKeyPath = 'secret.key'
const errorHandlerMiddleware = require('../middleware/errorHandler');
const studentEnrollment = require('../models/studentEnrollment');

//Sign In
const login = async (req, res) => {
  const { username, password } = req.body;
  const secretKey = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(secretKeyPath, secretKey, 'utf-8'); // Write the secret key to the SecretKey file

  try {
    const user = await User.User.findOne({ username });
    if (!user || !(await user.isValidPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("Secret key at auth controller:", secretKey);
    const token = sign({ userId: user._id, role: user.role }, secretKey, { expiresIn: '1h' }); // Create a JWT token
    res.header('Authorization', `Bearer ${token}`);// Attach the token to the response header as a Bearer token
    res.json({ token });
    process.env.thunderClient = { user_auth: token };// Set the access token to the thunderClient environment variable user_auth
  } catch (error) {
    errorHandlerMiddleware(error, req, res);
    res.status(500).json({ message: 'An unexpected error occurred during login' });
  }
};

//Sign up
const register = async (req, res) => {
  const { username, password, role, ...roleSpecificData } = req.body;
  
  try {
    // Check if the username already exists in the specific user collection
    const existingUser = await User[role].findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const commonUserId = new mongoose.Types.ObjectId();//Common User ID based on object ID
    const userId = generateUserId(role);//Generate unique user ID based on role
    // Create a new common user
    const commonUser = new User.User({
      _id: commonUserId,
      username,
      password,
      role,
    });
    
    await commonUser.save();// Save the common user to the main User collection

    let newUser; // Create a new user with role-specific data
    switch (role) {
      case 'Admin':
        newUser = new User.Admin({
          _id: commonUserId,
          username,
          password,
          role,
          adminId: userId,
        });
        break;
      case 'Student':
        newUser = new User.Student({
          _id: commonUserId,
          username,
          password,
          role,
          studentId: userId,
          studentName: roleSpecificData.studentName,
          academicYear: roleSpecificData.academicYear,
          studentFaculty: roleSpecificData.studentFaculty,
        });
        break;
      case 'Faculty':
        newUser = new User.Faculty({
          _id: commonUserId,
          username,
          password,
          role,
          facultyId: userId,
          facultyName: roleSpecificData.facultyName,
          facultyCourses: roleSpecificData.facultyCourses,
        });
        break;
      default:
        newUser = new User.User({
          _id: commonUserId,
          username,
          password,
          role,
        });
        break;
    }
    await newUser.save();// Save the role-specific user

    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyValue) {
      res.status(400).json({ message: `Username '${error.keyValue.username}' already exists` });
    }else{
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'An unexpected error occurred during registration' });
    }
    errorHandlerMiddleware(error, req, res);
  }
};

const logout = async (req, res) => {
  try {
    // Check if user is authorized
    const userId = req.userId;
    const user = await User.User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the secret key file
    fs.unlinkSync(secretKeyPath);
    
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'An unexpected error occurred during logout' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const role = req.userRole;
    const userId = req.userId;

    const user = await User.User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user from their relevant role collection
    switch (role) {
      case 'Admin':
        await User.Admin.findByIdAndDelete(userId);
        break;
      case 'Student':
        // Remove student from enrollment records
        const studentEnrollments = await studentEnrollment.find({ students: userId });
        for (const enrollment of studentEnrollments) {
          enrollment.students = enrollment.students.filter(student => student.toString() !== userId);
          await enrollment.save();
        }
        await User.Student.findByIdAndDelete(userId);
        break;
      case 'Faculty':
        // Unassign faculty from courses
        const faculty = await User.Faculty.findById(userId);
        if (faculty) {
          // Loop through the faculty's courses and unassign them
          for (const courseId of faculty.facultyCourses) {
            const course = await Course.findById(courseId);
            if (course) {
              course.faculty = null; // Unassign faculty from the course
              await course.save();
            }
          }
        }
        await User.Faculty.findByIdAndDelete(userId);
        break;
      default:
        break;
    }

    // Delete user from the main User collection
    await User.User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User Deleted successfully' });

  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'An unexpected error occurred during deletion' });
    errorHandlerMiddleware(error, req, res);
  }
};


// Helper function to generate formatted unique userId
const generateUserId = (role) => {
  // Define a prefix for each role
  const rolePrefix = {
    'Admin': 'ADM',
    'Faculty': 'FAC',
    'Student': 'STD',
  };
  // Generate a random number between 1000 and 9999
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  // Combine the prefix and random number to form the ID
  return `${rolePrefix[role]}${randomNum}`;
};

// Middleware to check if token is blacklisted
// const checkTokenBlacklist = (req, res, next) => {
//   const token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header
//   if (tokenBlacklist.has(token)) {
//     return res.status(401).json({ message: 'Token revoked. Please login again.' });
//   }
//   next();
// };

module.exports = {
  login,
  logout,
  register,
  deleteAccount
};
