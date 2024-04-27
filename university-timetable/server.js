const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const loggerMiddleware = require('../university-timetable/backend/middleware/logger');

//app middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(loggerMiddleware);


const PORT = 4000;

//const MONGODB_URL = 'mongodb+srv://jananijayasuriya330:RxIKTQPI1PQlUIC3@cluster0.mongodb.net/university-timetable?retryWrites=true&w=majority';
const MONGODB_URL = 'mongodb+srv://jananijayasuriya330:RxIKTQPI1PQlUIC3@cluster0.rbnblhi.mongodb.net/university-timetable?retryWrites=true&w=majority&appName=Cluster0'

// Database connection
mongoose.connect(MONGODB_URL, {
}).then(() => {
  console.log("DB connection successfull!");
}).catch((err) => {
  console.log('connection Unsuccessfull', err);
})

const authRoutes = require('./backend/routes/authRoutes');
const enrollmentRoutes = require('./backend/routes/studentEnrollmentRoutes');
const courseRoutes = require('./backend/routes/courseRoutes');
const timetableRoutes = require('./backend/routes/timetableRoutes');
const sessionRoutes = require('./backend/routes/sessionRoutes');
const roomRoutes = require('./backend/routes/roomRoutes');
const resourceRoutes = require('./backend/routes/resourceRoutes');
const bookingRoutes = require('./backend/routes/bookingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings',bookingRoutes)

app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
})

module.exports = app; // Export the app object



