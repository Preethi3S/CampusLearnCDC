const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');

// Create a new course (admin only)
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  if (!title) {
    res.status(400);
    throw new Error('Course title is required');
  }
  const course = await Course.create({
    title,
    description,
    isPublished: !!isPublished,
    createdBy: req.user._id
  });
  res.status(201).json(course);
});

// Get all courses (with optional published filter)
const getCourses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.published === 'true') filter.isPublished = true;
  const courses = await Course.find(filter).populate('createdBy', 'name email');
  res.json(courses);
});

// Get single course by id
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('createdBy', 'name email');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json(course);
});

// Update basic course fields
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const { title, description, isPublished } = req.body;
  if (title) course.title = title;
  if (typeof description !== 'undefined') course.description = description;
  if (typeof isPublished !== 'undefined') course.isPublished = !!isPublished;

  await course.save();
  res.json(course);
});

// Delete course
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  await course.remove();
  res.json({ message: 'Course deleted' });
});

/* LEVEL & MODULE helpers */

// Add a level to a course
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
    order: course.levels.length // append
  };
  course.levels.push(level);
  await course.save();
  res.status(201).json(course);
});

// Add a module to a level
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
  res.status(201).json(course);
});

// Update a module (partial)
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

// Remove a module
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
  const module = level.modules.id(moduleId);
  if (!module) {
    res.status(404);
    throw new Error('Module not found');
  }
  module.remove();
  await course.save();
  res.json(course);
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
