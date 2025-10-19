const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Progress = require('../models/Progress');

// GET /api/users - admin only: list users (with optional filters)
const listUsers = asyncHandler(async (req, res) => {
  const { role, status } = req.query;
  const filter = {};
  
  if (role) filter.role = role;
  if (status) filter.status = status;
  
  const users = await User.find(filter)
    .select('name username email role status createdAt lastLogin')
    .sort({ createdAt: -1 });
    
  res.json(users);
});

// PATCH /api/users/:id/approve - admin only: approve a user
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (user.status === 'approved') {
    res.status(400);
    throw new Error('User is already approved');
  }
  
  user.status = 'approved';
  user.updatedAt = Date.now();
  await user.save();
  
  res.json({ 
    message: 'User approved successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      status: user.status
    }
  });
});

// PATCH /api/users/:id/reject - admin only: reject a user
const rejectUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  if (!reason || reason.trim().length < 5) {
    res.status(400);
    throw new Error('Please provide a reason for rejection (min 5 characters)');
  }
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (user.status === 'rejected') {
    res.status(400);
    throw new Error('User is already rejected');
  }
  
  user.status = 'rejected';
  user.rejectionReason = reason;
  user.updatedAt = Date.now();
  await user.save();
  
  res.json({ 
    message: 'User rejected successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      status: user.status
    }
  });
});

// DELETE /api/users/:id - admin only: delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Prevent deleting own account
  if (user._id.toString() === req.user.id) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }
  
  await User.deleteOne({ _id: user._id });
  res.json({ message: 'User removed successfully' });
});

// Get student's enrolled courses with progress
// Get student's enrolled courses with progress
const getStudentEnrollments = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Verify student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find all progress records for this student
        const enrollments = await Progress.find({ student: studentId })
            .populate({
                path: 'course',
                select: 'title code description',
                // Ensure the reference is not null
                match: { _id: { $exists: true } }
            })
            .select('course enrolledAt levels')
            .lean();
        
        console.log('Raw enrollments data:', JSON.stringify(enrollments, null, 2));
        
        // Filter out any enrollments where course is null or undefined
        const validEnrollments = enrollments.filter(e => e.course);
        
        // Format the response
        const formattedEnrollments = validEnrollments.map(enrollment => {
            console.log('Processing enrollment:', enrollment._id, 'Course:', enrollment.course);
            return {
                _id: enrollment._id,
                course: {
                    _id: enrollment.course._id,
                    title: enrollment.course.title || 'Unknown Course',
                    code: enrollment.course.code || 'N/A',
                    description: enrollment.course.description || ''
                },
                enrolledAt: enrollment.enrolledAt,
                progress: calculateCourseProgress(enrollment.levels)
            };
        });
        
        console.log('Formatted enrollments:', JSON.stringify(formattedEnrollments, null, 2));
        res.json(formattedEnrollments);
    } catch (error) {
        console.error('Error fetching student enrollments:', error);
        res.status(500).json({ 
            message: 'Error fetching student enrollments',
            error: error.message 
        });
    }
};

// Helper function to calculate course progress percentage
function calculateCourseProgress(levels) {
    if (!levels || levels.length === 0) return 0;
    
    let totalModules = 0;
    let completedModules = 0;
    
    levels.forEach(level => {
        totalModules += level.modules.length;
        completedModules += level.modules.filter(m => m.completed).length;
    });
    
    return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
}

// Export all controller functions
module.exports = { 
    listUsers, 
    approveUser, 
    rejectUser, 
    deleteUser,
    getStudentEnrollments
};