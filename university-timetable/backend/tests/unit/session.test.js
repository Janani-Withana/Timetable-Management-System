// Importing the controller functions
const {
    createSession,
    updateSession,
    deleteSession
  } = require('../../controllers/sessionController');
  
  // Mocking the dependencies
  jest.mock('../../models/session');
  jest.mock('../../models/course');
  jest.mock('../../models/roomBooking');
  jest.mock('../../models/timetable');
  jest.mock('../../utils/isFacultyAssignedToCourse');

  // Import the Session model
  const Session = require('../../models/session');

  
// Grouping tests for sessionController
describe('Session Controller', () => {

  
    // Test suite for updateSession function
    describe('updateSession', () => {
      it('should update a session successfully', async () => {
        // Mocking req and res objects
        const req = {
          params: { id: 'sessionId' },
          body: {
            day: 'Monday',
            startTime: '09:00',
            endTime: '10:00',
            location: 'Room1'
          },
          userId: 'userId',
          userRole: 'Admin'
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
  
        // Mocking isFacultyAssignedToCourse function
        require('../../utils/isFacultyAssignedToCourse').mockResolvedValue(true);
  
        // Mocking findById function of Session model
        const Session = require('../../models/session');
        Session.findById.mockResolvedValueOnce({ course: 'courseId' });
  
        // Executing the function
        await updateSession(req, res);
  
        // Assertions
        expect(res.json).toHaveBeenCalled();
        // Add more specific assertions as needed
      });
  
      // Add more test cases for updateSession function as needed
    });
  
    // Test suite for deleteSession function
    describe('deleteSession', () => {
      it('should delete a session successfully', async () => {
        // Mocking req and res objects
        const req = {
          params: { id: 'sessionId' },
          userId: 'userId',
          userRole: 'Admin'
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
  
        // Mocking isFacultyAssignedToCourse function
        require('../../utils/isFacultyAssignedToCourse').mockResolvedValue(true);
  
        // Mocking findById function of Session model
        const Session = require('../../models/session');
        Session.findById.mockResolvedValueOnce({ course: 'courseId' });
  
        // Executing the function
        await deleteSession(req, res);
  
        // Assertions
        expect(res.json).toHaveBeenCalled();
        // Add more specific assertions as needed
      });
  
      // Add more test cases for deleteSession function as needed
    });
  });
  