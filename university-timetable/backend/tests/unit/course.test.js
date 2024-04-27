const { 
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    assignFacultyToCourse
  } = require('../../controllers/courseController');
  const Course = require('../../models/course');
  // const User = require('../../models/user');
  
  jest.mock('../../models/course');
  jest.mock('../../models/user');
  
  describe('Course Controller', () => {
    describe('createCourse', () => {
      it('should create a new course', async () => {
        const req = {
          body: { name: 'Test Course', code: 'TEST123', description: 'Test Description', credits: 3 },
          userRole: 'Admin'
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const saveMock = jest.fn().mockResolvedValueOnce({ _id: '123', ...req.body });
        Course.mockReturnValueOnce({ save: saveMock });
  
        await createCourse(req, res);
  
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ _id: '123', ...req.body });
      });
  
      it('should return 403 if user is not an admin', async () => {
        const req = { 
          body: {}, // Empty body object
          userRole: 'Student'
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
      
        await createCourse(req, res);
      
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Only admins can create courses' });
      });
      
  
      it('should return 400 if error occurs', async () => {
        const req = { 
          body: { name: 'Test Course', code: 'TEST123', description: 'Test Description', credits: 3 },
          userRole: 'Admin'
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        Course.mockReturnValueOnce({ save: jest.fn().mockRejectedValueOnce(new Error('Test error')) });
      
        await createCourse(req, res);
      
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Test error' });
      });
      
    });
  
    // Write similar tests for other functions
  });
  