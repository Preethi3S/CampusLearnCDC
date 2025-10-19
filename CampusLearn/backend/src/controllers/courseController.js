const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const { saveQuizForModule } = require('./quizController'); // Assumed dependency

// Helper function to find and return the entire updated course
const saveAndReturnCourse = async (course, res) => {
    await course.save();
    // Return the fresh course object, optionally with populations
    const updatedCourse = await Course.findById(course._id).populate('createdBy', 'name email');
    res.status(200).json(updatedCourse);
};

// --- CRUD for Main Course (No Change) ---
const createCourse = asyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body;
    if (!title) throw new Error('Course title is required');

    const course = await Course.create({
        title,
        description,
        isPublished: !!isPublished,
        createdBy: req.user._id,
        levels: [], // Keep main levels array for optional top-level structure
        subCourses: []
    });
    res.status(201).json(course);
});

const getCourses = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.published === 'true') filter.isPublished = true;
    const courses = await Course.find(filter).populate('createdBy', 'name email');
    res.json(courses);
});

const getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id).populate('createdBy', 'name email');
    if (!course) throw new Error('Course not found');
    res.json(course);
});

const updateCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    const { title, description, isPublished } = req.body;
    if (title) course.title = title;
    if (typeof description !== 'undefined') course.description = description;
    if (typeof isPublished !== 'undefined') course.isPublished = !!isPublished;

    await course.save();
    res.json(course);
});

const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    await Course.deleteOne({ _id: req.params.id });
    res.json({ message: 'Course deleted' });
});

// --- Main Course Level/Module Handlers (Original - Kept for legacy routes) ---
const addLevel = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title) throw new Error('Level title is required');

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    course.levels.push({ title, description, order: course.levels.length, modules: [] });
    await saveAndReturnCourse(course, res);
});

const addModule = asyncHandler(async (req, res) => {
    // ... (logic for adding module to main course level - kept original) ...
    const { levelId } = req.params;
    const { title, type, content } = req.body;
    if (!title || !type) throw new Error('Module must have title and type');

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    const level = course.levels.id(levelId);
    if (!level) throw new Error('Level not found');

    const moduleObj = { title, type, content: content || {}, order: level.modules.length };
    level.modules.push(moduleObj);
    await course.save();

    const newModule = level.modules[level.modules.length - 1];
    if (type === 'quiz') {
        const questionsArray = Array.isArray(content) ? content : [];
        try {
            // Note: This quiz logic is simplified for nested structure
            await saveQuizForModule(course._id, level._id, newModule._id, questionsArray); 
        } catch (err) {
            console.error('Quiz creation failed:', err.message);
        }
    }
    await saveAndReturnCourse(course, res);
});

const updateModule = asyncHandler(async (req, res) => {
    // ... (logic for updating module in main course level - kept original) ...
    const { levelId, moduleId } = req.params;
    const { title, type, content, locked } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    const level = course.levels.id(levelId);
    if (!level) throw new Error('Level not found');

    const module = level.modules.id(moduleId);
    if (!module) throw new Error('Module not found');

    if (title) module.title = title;
    if (type) module.type = type;
    if (typeof content !== 'undefined') module.content = content;
    if (typeof locked !== 'undefined') module.locked = !!locked;

    await saveAndReturnCourse(course, res);
});

const removeModule = asyncHandler(async (req, res) => {
    // ... (logic for removing module from main course level - kept original) ...
    const { levelId, moduleId } = req.params;

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    const level = course.levels.id(levelId);
    if (!level) throw new Error('Level not found');

    level.modules.pull(moduleId);
    await saveAndReturnCourse(course, res);
});

// ------------------------------------------------------------------------------------
// --- SUB-COURSE CONTROLLERS (Updated for Full Nested CRUD) ---
// ------------------------------------------------------------------------------------

const addSubCourse = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title) throw new Error('Sub-course title is required');

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    course.subCourses.push({ title, description, order: course.subCourses.length, levels: [] });
    await saveAndReturnCourse(course, res);
});

// 🌟 NEW: Delete Sub-Course
const deleteSubCourse = asyncHandler(async (req, res) => {
    const { subCourseId } = req.params;

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    course.subCourses.pull(subCourseId);
    await saveAndReturnCourse(course, res);
});

// 🌟 RENAMED & UPDATED: Add Level to Sub-Course
const addLevelToSubCourse = asyncHandler(async (req, res) => {
    const { subCourseId } = req.params;
    const { title, description } = req.body;
    if (!title) throw new Error('Level title is required');

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    const subCourse = course.subCourses.id(subCourseId);
    if (!subCourse) throw new Error('Sub-course not found');

    subCourse.levels.push({ title, description, order: subCourse.levels.length, modules: [] });
    await saveAndReturnCourse(course, res);
});

// 🌟 NEW: Remove Level from Sub-Course
const removeLevelFromSubCourse = asyncHandler(async (req, res) => {
    const { subCourseId, levelId } = req.params;

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    const subCourse = course.subCourses.id(subCourseId);
    if (!subCourse) throw new Error('Sub-course not found');
    
    // Remove the level
    subCourse.levels.pull(levelId);
    
    await saveAndReturnCourse(course, res);
});


// 🌟 RENAMED & UPDATED: Add Module to Sub-Course Level
const addModuleToSubCourseLevel = asyncHandler(async (req, res) => {
    const { subCourseId, levelId } = req.params;
    const { title, type, content } = req.body;
    if (!title || !type) throw new Error('Module must have title and type');

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    const subCourse = course.subCourses.id(subCourseId);
    if (!subCourse) throw new Error('Sub-course not found');

    const level = subCourse.levels.id(levelId);
    if (!level) throw new Error('Level not found');

    const moduleObj = { title, type, content: content || {}, order: level.modules.length };
    level.modules.push(moduleObj);
    await course.save(); // Save to get the generated module ID

    const newModule = level.modules.id(moduleObj._id); // Find the new module using its ID
    if (type === 'quiz') {
        const questionsArray = Array.isArray(content) ? content : [];
        try {
            await saveQuizForModule(course._id, subCourse._id, level._id, newModule._id, questionsArray);
        } catch (err) {
            console.error('Quiz creation failed:', err.message);
        }
    }
    await saveAndReturnCourse(course, res);
});

// 🌟 NEW: Remove Module from Sub-Course Level
const removeModuleFromSubCourseLevel = asyncHandler(async (req, res) => {
    const { subCourseId, levelId, moduleId } = req.params;

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    const subCourse = course.subCourses.id(subCourseId);
    if (!subCourse) throw new Error('Sub-course not found');

    const level = subCourse.levels.id(levelId);
    if (!level) throw new Error('Level not found');

    level.modules.pull(moduleId);
    await saveAndReturnCourse(course, res);
});

// ------------------------------------------------------------------------------------
// --- REORDERING CONTROLLERS (Needed for Drag and Drop) ---
// ------------------------------------------------------------------------------------

// 🌟 NEW: Reorder Levels within a single Sub-Course
const reorderSubCourseLevels = asyncHandler(async (req, res) => {
    const { subCourseId } = req.params;
    const { levelIds } = req.body; // Array of IDs in the new order

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    const subCourse = course.subCourses.id(subCourseId);
    if (!subCourse) throw new Error('Sub-course not found');

    const newLevels = levelIds.map((id, index) => {
        const level = subCourse.levels.id(id);
        if (level) {
            level.order = index;
            return level;
        }
    }).filter(Boolean);
    
    subCourse.levels = newLevels; // Overwrite the levels array with the reordered one
    await saveAndReturnCourse(course, res);
});

// 🌟 NEW: Move Level between Sub-Courses (Cross-Droppable)
const moveLevel = asyncHandler(async (req, res) => {
    const { levelId } = req.params;
    const { sourceSubCourseId, destinationSubCourseId, newIndex } = req.body;
    
    if (!sourceSubCourseId || !destinationSubCourseId || typeof newIndex !== 'number') {
        throw new Error('Missing reorder parameters');
    }

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error('Course not found');

    const sourceSubCourse = course.subCourses.id(sourceSubCourseId);
    const destinationSubCourse = course.subCourses.id(destinationSubCourseId);
    
    if (!sourceSubCourse || !destinationSubCourse) throw new Error('Source or Destination Sub-Course not found');

    const levelToMove = sourceSubCourse.levels.id(levelId);
    if (!levelToMove) throw new Error('Level not found in source Sub-Course');

    // 1. Remove from source
    sourceSubCourse.levels.pull(levelId);
    
    // 2. Insert into destination
    destinationSubCourse.levels.splice(newIndex, 0, levelToMove);
    
    // 3. Update order property for all affected levels
    [sourceSubCourse, destinationSubCourse].forEach(sub => {
        sub.levels.forEach((level, index) => {
            level.order = index;
        });
    });

    await saveAndReturnCourse(course, res);
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
    removeModule,
    // Sub-Courses
    addSubCourse,
    deleteSubCourse, // 🌟 Exported
    addLevelToSubCourse,
    removeLevelFromSubCourse, // 🌟 Exported
    addModuleToSubCourseLevel,
    removeModuleFromSubCourseLevel, // 🌟 Exported
    // Reordering
    reorderSubCourseLevels, // 🌟 Exported
    moveLevel // 🌟 Exported
};