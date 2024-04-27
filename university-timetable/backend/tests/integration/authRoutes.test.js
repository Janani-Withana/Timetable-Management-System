const request = require('supertest');
const app = require('../../../server');
const {User} = require('../../models/user');
const http = require('http'); // Import the 'http' module
const mongoose = require('mongoose');

// Specify the port number for testing
const TEST_PORT = 5000;
const TEST_DB_URI = 'mongodb+srv://wijethungenipun:U5OYFkBenODCBMkI@cluster0.2bbufx5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace 'your_test_db_uri' with your test database URI

describe('Auth Routes', () => {
  let server; // Declare a variable to hold the server instance

  // Connect to the database before all tests
beforeAll(async () => {
    try {
      // Close any existing connections
      await mongoose.connection.close();
  
      // Establish a new connection
      await mongoose.connect(TEST_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to the database');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error; // Throw the error to fail the tests
    }
  });
  

  // Clear the database before each test
  beforeEach(async () => {
    await User.deleteMany({}); // Clear all data from the User collection
  });

  // Close the database connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Before running the tests, start the server on the specified test port
  beforeAll(async () => {
    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, resolve); // Assign the server instance
    });
  });

  describe('POST /login', () => {
    it('should return 401 for invalid credentials', async () => {
      const res = await request(`http://localhost:${TEST_PORT}`)
        .post('/api/auth/login')
        .send({ username: 'student1', password: 'invalidpassword' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Invalid credentials' });
    })

    // Add more test cases as needed
  });

  // Add test suite for POST /register route
  describe('POST /register', () => {
    it('should create a new student account', async () => {
      // Define the input data for registering a new student account
      const username = 'student980';
      const password = 'student980@1234';
      const role = 'Student';
      const studentData = {
        studentId: 'STD3567',
        studentName: 'John Doe',
        academicYear: 'Y1S2',
        studentFaculty: '65fdf2517369d84626f86bb1'
      };

      // Send a request to register a new student account
      const res = await request(`http://localhost:4000`)
        .post('/api/auth/register')
        .send({ username, password, role, ...studentData });

      expect(res.status).toBe(201);
    });

    // Add more test cases for registering users with different roles
  });

  // After running the tests, close the server
  afterAll(async () => {
    await new Promise((resolve) => {
      server.close(resolve); // Close the server instance
    });
  });
});
