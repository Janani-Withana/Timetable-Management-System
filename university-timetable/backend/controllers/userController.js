// // controllers/userController.js
// const { findOne, createUser } = require('../models/user');

// const register = async (req, res) => {
//   const { username, password, role } = req.body;

//   try {
//     // Check if the username already exists
//     const existingUser = await findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Username already exists' });
//     }

//     // Create a new user
//     const newUser = await createUser({ username, password, role });

//     res.status(201).json(newUser);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { register };