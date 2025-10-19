import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const instance = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

// Optional Authorization header
const withToken = (token) => (token ? { headers: { Authorization: `Bearer ${token}` } } : {});

export default {
    // ------------------------------------
    // Public & Admin (No Changes Needed)
    // ------------------------------------
    getCourses: async (token) => {
        const res = await instance.get('/courses', withToken(token));
        return res.data;
    },
    getCourse: async (id, token) => {
        const res = await instance.get(`/courses/${id}`, withToken(token));
        return res.data;
    },
    createCourse: async (payload, token) => {
        const res = await instance.post('/courses', payload, withToken(token));
        return res.data;
    },
    updateCourse: async (id, payload, token) => {
        const res = await instance.put(`/courses/${id}`, payload, withToken(token));
        return res.data;
    },
    deleteCourse: async (id, token) => {
        const res = await instance.delete(`/courses/${id}`, withToken(token));
        return res.data;
    },

    // ------------------------------------
    // LEVELS (Now Nested within Sub-Courses)
    // ------------------------------------
    // Requires subCourseId in the payload to determine where to place the new level
    addLevel: async (courseId, { subCourseId, title, description }, token) => {
        const res = await instance.post(
            `/courses/${courseId}/sub-courses/${subCourseId}/levels`, 
            { title, description }, // Payload is just level data
            withToken(token)
        );
        // Assumes API returns the full updated course object
        return res.data; 
    },
    
    // 🌟 NEW: Remove Level (Requires both subCourseId and levelId)
    removeLevel: async (courseId, subCourseId, levelId, token) => {
        const res = await instance.delete(
            `/courses/${courseId}/sub-courses/${subCourseId}/levels/${levelId}`,
            withToken(token)
        );
        // Assumes API returns the full updated course object
        return res.data;
    },

    // 🌟 NEW: Reorder Levels within a single Sub-Course
    reorderLevels: async (courseId, subCourseId, levelIds, token) => {
        const res = await instance.put(
            `/courses/${courseId}/sub-courses/${subCourseId}/levels/reorder`,
            { levelIds }, // Array of level IDs in the new order
            withToken(token)
        );
        // Assumes API returns the full updated course object
        return res.data;
    },

    // 🌟 NEW: Move Level between Sub-Courses (Cross-Droppable Drag)
    // Expects: which level, where to move it, and the new index.
    moveLevel: async (courseId, levelId, destinationSubCourseId, newIndex, token) => {
        const res = await instance.put(
            `/courses/${courseId}/levels/${levelId}/move`,
            { destinationSubCourseId, newIndex },
            withToken(token)
        );
        // Assumes API returns the full updated course object
        return res.data;
    },


    // ------------------------------------
    // MODULES (Now Nested within Levels, which are within Sub-Courses)
    // ------------------------------------
    // Requires subCourseId
    addModule: async (courseId, subCourseId, levelId, modulePayload, token) => {
        const res = await instance.post(
            `/courses/${courseId}/sub-courses/${subCourseId}/levels/${levelId}/modules`, 
            modulePayload, 
            withToken(token)
        );
        // Assumes API returns the full updated course object
        return res.data;
    },
    
    // Requires subCourseId
    updateModule: async (courseId, subCourseId, levelId, moduleId, modulePayload, token) => {
        const res = await instance.put(
            `/courses/${courseId}/sub-courses/${subCourseId}/levels/${levelId}/modules/${moduleId}`,
            modulePayload,
            withToken(token)
        );
        // Assumes API returns the full updated course object
        return res.data;
    },

    // Requires subCourseId
    removeModule: async (courseId, subCourseId, levelId, moduleId, token) => {
        const res = await instance.delete(
            `/courses/${courseId}/sub-courses/${subCourseId}/levels/${levelId}/modules/${moduleId}`,
            withToken(token)
        );
        // Assumes API returns the full updated course object
        return res.data;
    },
    
    // 🌟 NEW: Reorder Modules within a single Level (Requires subCourseId)
    reorderModules: async (courseId, subCourseId, levelId, moduleIds, token) => {
        const res = await instance.put(
            `/courses/${courseId}/sub-courses/${subCourseId}/levels/${levelId}/modules/reorder`,
            { moduleIds },
            withToken(token)
        );
        // Assumes API returns the full updated course object
        return res.data;
    },


    // ------------------------------------
    // SUB-COURSES (Minor Changes to Existing)
    // ------------------------------------
    addSubCourse: async (courseId, subCoursePayload, token) => {
        const res = await instance.post(`/courses/${courseId}/sub-courses`, subCoursePayload, withToken(token));
        return res.data;
    },

    updateSubCourse: async (courseId, subCourseId, subCoursePayload, token) => {
        const res = await instance.put(
            `/courses/${courseId}/sub-courses/${subCourseId}`,
            subCoursePayload,
            withToken(token)
        );
        return res.data;
    },

    deleteSubCourse: async (courseId, subCourseId, token) => {
        const res = await instance.delete(`/courses/${courseId}/sub-courses/${subCourseId}`, withToken(token));
        return res.data;
    },

    // 🌟 NEW: Reorder Sub-Courses
    reorderSubCourses: async (courseId, subCourseIds, token) => {
        const res = await instance.put(
            `/courses/${courseId}/sub-courses/reorder`,
            { subCourseIds },
            withToken(token)
        );
        // Assumes API returns the full updated course object
        return res.data;
    }
};