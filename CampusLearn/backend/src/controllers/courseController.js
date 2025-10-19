const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');

const { saveQuizForModule } = require('./quizController');

const createCourse = asyncHandler(async (req, res) => {
  const { title, description, isPublished, prerequisiteCourse } = req.body;
  if (!title) {
    res.status(400);
    throw new Error('Course title is required');
  }
  const course = await Course.create({
    title,
    description,
    isPublished: !!isPublished,
    createdBy: req.user._id,
    // 🎯 ADDED: Save prerequisite course ID
    prerequisiteCourse: prerequisiteCourse || null 
  });
  res.status(201).json(course);
});

const getCourses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.published === 'true') filter.isPublished = true;
  // Populate prerequisiteCourse as well
  const courses = await Course.find(filter)
    .populate('createdBy', 'name email')
    .populate('prerequisiteCourse', 'title'); 
  res.json(courses);
});

const getCourseById = asyncHandler(async (req, res) => {
  // Populate prerequisiteCourse as well
  const course = await Course.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('prerequisiteCourse', 'title'); 
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json(course);
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const { title, description, isPublished, prerequisiteCourse } = req.body;
  if (title) course.title = title;
  if (typeof description !== 'undefined') course.description = description;
  if (typeof isPublished !== 'undefined') course.isPublished = !!isPublished;
  
  // 🎯 ADDED: Update prerequisiteCourse field
  if (typeof prerequisiteCourse !== 'undefined') {
    course.prerequisiteCourse = prerequisiteCourse || null;
  }

  await course.save();
  res.json(course);
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  await Course.deleteOne({ _id: req.params.id }); 
  
  res.json({ message: 'Course deleted' });
});

const addLevel = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    res.status(400);
    throw new Error('Level title is required');
  }
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const level = {
    title,
    description,
    order: course.levels.length 
  };
  course.levels.push(level);
  await course.save();
  res.status(201).json(course);
});

const addModule = asyncHandler(async (req, res) => {
  const { levelId } = req.params;
  
  const { title, type, content } = req.body; 

  if (!title || !type) {
    res.status(400);
    throw new Error('Module must have title and type');
  }
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const level = course.levels.id(levelId);
  if (!level) {
    res.status(404);
    throw new Error('Level not found');
  }
  
  const moduleObj = {
    title,
    type,
    content: content || {}, 
    order: level.modules.length
  };
  level.modules.push(moduleObj);
  
  await course.save();
  
  const newModule = level.modules[level.modules.length - 1]; 
  if (type === 'quiz') { 
    try {
      const questionsArray = Array.isArray(content) ? content : [];
      await saveQuizForModule(course._id, level._id, newModule._id, questionsArray);
    } catch (err) {
      console.error('Failed to create quiz for module:', err.message);
    }
  }

  res.status(201).json(course);
});

const updateModule = asyncHandler(async (req, res) => {
  const { levelId, moduleId } = req.params;
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const level = course.levels.id(levelId);
  if (!level) {
    res.status(404);
    throw new Error('Level not found');
  }
  const module = level.modules.id(moduleId);
  if (!module) {
    res.status(404);
    throw new Error('Module not found');
  }

  const { title, type, content, locked } = req.body;
  if (title) module.title = title;
  if (type) module.type = type;
  if (typeof content !== 'undefined') module.content = content;
  if (typeof locked !== 'undefined') module.locked = !!locked;

  await course.save();
  res.json(course);
});

const removeModule = asyncHandler(async (req, res) => {
  const { levelId, moduleId } = req.params;
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const level = course.levels.id(levelId);
  if (!level) {
    res.status(404);
    throw new Error('Level not found');
  }

  level.modules.pull(moduleId); 
  
  await course.save();
  
  res.json({ message: 'Module removed', course });
});

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLevel,
  addModule,
  updateModule,
  removeModule
};