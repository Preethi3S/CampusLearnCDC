const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
/**
 * @desc    Get all enrollments for a specific course
 * @route   GET /api/enrollments/course/:courseId
 * @access  Private/Admin
 */
const getEnrollmentsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  try {
    console.log(`Fetching enrollments for course: ${courseId}`);
    
    // First, let's verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find all progress records for this course with detailed population
    const progressRecords = await Progress.find({ course: courseId })
      .populate({
        path: 'student',
        select: 'name email',
        model: 'User' // Explicitly specify the model
      })
      .lean();
    
    console.log(`Found ${progressRecords.length} progress records for course ${courseId}`);
    console.log('Progress records sample:', JSON.stringify(progressRecords.slice(0, 2), null, 2));
    
    // Format the response to match frontend expectations
    const enrollments = [];
    
    for (const record of progressRecords) {
      console.log('Processing record:', record._id);
      console.log('Record student field:', record.student);
      
      // If student is not populated, try to fetch it manually
      let studentData = null;
      
      if (!record.student || !record.student._id) {
        console.warn(`No student found for progress record: ${record._id}, trying to fetch student manually`);
        try {
          const student = await User.findById(record.student);
          if (student) {
            studentData = {
              _id: student._id,
              name: student.name || 'Unknown Student',
              email: student.email || 'no-email@example.com'
            };
          }
        } catch (err) {
          console.error('Error fetching student:', err);
        }
      } else {
        // Student was populated successfully
        studentData = {
          _id: record.student._id,
          name: record.student.name || 'Unknown Student',
          email: record.student.email || 'no-email@example.com'
        };
      }
      
      // If we still don't have student data, use a default
      if (!studentData) {
        studentData = {
          _id: 'unknown',
          name: 'Unknown Student',
          email: 'no-email@example.com'
        };
      }
      
      // Create the enrollment object with the structure expected by the frontend
      enrollments.push({
        _id: record._id,
        student: studentData,
        enrolledAt: record.enrolledAt || new Date(),
        status: 'enrolled' // Default status
      });
    }

    res.json({
      course: courseId,
      totalEnrollments: enrollments.length,
      enrollments
    });
  } catch (error) {
    console.error('Error in getEnrollmentsByCourse:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      message: 'Error fetching course enrollments',
      error: error.message
    });
  }
});
/**
 * @desc    Get enrollment statistics (counts by course)
 * @route   GET /api/enrollments/stats
 * @access  Private/Admin
 */
const getEnrollmentStats = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching all courses...');
    const courses = await Course.find({}).lean();
    console.log(`Found ${courses.length} courses`);

    const stats = await Promise.all(courses.map(async (course) => {
      try {
        console.log(`Counting enrollments for course: ${course.title} (${course._id})`);
        
        // Count the number of progress records for this course
        const count = await Progress.countDocuments({ course: course._id });
        console.log(`Found ${count} enrollments for course ${course.title}`);
        
        return {
          _id: course._id,
          title: course.title,
          isPublished: course.isPublished,
          studentCount: count
        };
      } catch (err) {
        console.error(`Error counting enrollments for course ${course._id}:`, err);
        return {
          _id: course._id,
          title: course.title,
          isPublished: course.isPublished,
          studentCount: 0,
          error: err.message
        };
      }
    }));

    console.log('Sending enrollment stats:', JSON.stringify(stats, null, 2));
    res.json(stats);
  } catch (error) {
    console.error('Error in getEnrollmentStats:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Error fetching enrollment stats',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @desc    Get all enrollments for a specific student
 * @route   GET /api/enrollments/student/:studentId
 * @access  Private/Admin
 */
const getStudentEnrollments = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  const student = await User.findById(studentId)
    .populate('enrolledCourses.course', 'title description')
    .select('name email enrolledCourses');

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  res.json({
    studentId: student._id,
    name: student.name,
    email: student.email,
    totalEnrollments: student.enrolledCourses.length,
    enrollments: student.enrolledCourses.map(enrollment => ({
      courseId: enrollment.course._id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      enrolledAt: enrollment.enrolledAt,
      completed: enrollment.completed
    }))
  });
});

module.exports = {
  getEnrollmentsByCourse,
  getEnrollmentStats,
  getStudentEnrollments
};
