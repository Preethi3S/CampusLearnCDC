import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseApi from '../../api/courseApi';

// --- Fetch all courses
export const fetchCourses = createAsyncThunk('courses/fetchAll', async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  try {
    return await courseApi.getCourses(token);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// --- Create new course
export const createCourse = createAsyncThunk('courses/create', async (payload, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  try {
    return await courseApi.createCourse(payload, token);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// --- Delete course
export const deleteCourse = createAsyncThunk('courses/delete', async (id, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  try {
    await courseApi.deleteCourse(id, token);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// --- Add level
export const addLevel = createAsyncThunk('courses/addLevel', async ({ courseId, levelPayload }, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  try {
    return await courseApi.addLevel(courseId, levelPayload, token);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// --- Add module
export const addModule = createAsyncThunk(
  'courses/addModule',
  async ({ courseId, levelId, modulePayload }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await courseApi.addModule(courseId, levelId, modulePayload, token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Update module
export const updateModule = createAsyncThunk(
  'courses/updateModule',
  async ({ courseId, levelId, moduleId, modulePayload }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await courseApi.updateModule(courseId, levelId, moduleId, modulePayload, token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Remove module
export const removeModule = createAsyncThunk(
  'courses/removeModule',
  async ({ courseId, levelId, moduleId }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await courseApi.removeModule(courseId, levelId, moduleId, token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Sub-Courses
export const addSubCourse = createAsyncThunk(
  'courses/addSubCourse',
  async ({ courseId, subCoursePayload }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await courseApi.addSubCourse(courseId, subCoursePayload, token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateSubCourse = createAsyncThunk(
  'courses/updateSubCourse',
  async ({ courseId, subCourseId, subCoursePayload }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await courseApi.updateSubCourse(courseId, subCourseId, subCoursePayload, token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteSubCourse = createAsyncThunk(
  'courses/deleteSubCourse',
  async ({ courseId, subCourseId }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await courseApi.deleteSubCourse(courseId, subCourseId, token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch courses
      .addCase(fetchCourses.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCourses.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // --- Create course
      .addCase(createCourse.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createCourse.fulfilled, (s, a) => { s.loading = false; s.items.unshift(a.payload); })
      .addCase(createCourse.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // --- Delete course
      .addCase(deleteCourse.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteCourse.fulfilled, (s, a) => { s.loading = false; s.items = s.items.filter(c => String(c._id) !== String(a.payload)); })
      .addCase(deleteCourse.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // --- Levels & Modules handled above (already included)

      // --- Sub-Courses
      .addCase(addSubCourse.fulfilled, (s, a) => {
        const course = s.items.find(c => String(c._id) === String(a.payload._id));
        if (course) course.subCourses = a.payload.subCourses;
      })
      .addCase(updateSubCourse.fulfilled, (s, a) => {
        const course = s.items.find(c => String(c._id) === String(a.payload._id));
        if (course) course.subCourses = a.payload.subCourses;
      })
      .addCase(deleteSubCourse.fulfilled, (s, a) => {
        const course = s.items.find(c => String(c._id) === String(a.payload._id));
        if (course) course.subCourses = a.payload.subCourses;
      });
  }
});

export default courseSlice.reducer;
