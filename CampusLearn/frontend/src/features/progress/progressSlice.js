import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import progressApi from '../../api/progressApi';

// --- Enroll in a course
export const enrollCourse = createAsyncThunk(
  'progress/enroll',
  async (courseId, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await progressApi.enrollCourse(courseId, token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Fetch student's courses
export const fetchMyCourses = createAsyncThunk(
  'progress/fetchMyCourses',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await progressApi.getMyCourses(token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Get progress for a single course
export const fetchCourseProgress = createAsyncThunk(
  'progress/fetchCourseProgress',
  async (courseId, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await progressApi.getCourseProgress(courseId, token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Complete module (main course)
export const completeModule = createAsyncThunk(
  'progress/completeModule',
  async ({ courseId, levelId, moduleId, evidence }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await progressApi.completeModule(courseId, levelId, moduleId, token, evidence);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Complete module (sub-course)
export const completeSubCourseModule = createAsyncThunk(
  'progress/completeSubCourseModule',
  async ({ courseId, subCourseId, levelId, moduleId, evidence }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await progressApi.completeSubCourseModule(courseId, subCourseId, levelId, moduleId, token, evidence);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    courses: [],
    currentCourse: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Enroll
      .addCase(enrollCourse.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(enrollCourse.fulfilled, (s, a) => { s.loading = false; s.courses.push(a.payload); })
      .addCase(enrollCourse.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // --- Fetch my courses
      .addCase(fetchMyCourses.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMyCourses.fulfilled, (s, a) => { s.loading = false; s.courses = a.payload; })
      .addCase(fetchMyCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // --- Fetch single course progress
      .addCase(fetchCourseProgress.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCourseProgress.fulfilled, (s, a) => { s.loading = false; s.currentCourse = a.payload; })
      .addCase(fetchCourseProgress.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // --- Complete module (main course)
      .addCase(completeModule.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(completeModule.fulfilled, (s, a) => {
        s.loading = false;
        s.currentCourse = a.payload;
        // Update in courses list
        const idx = s.courses.findIndex(c => String(c._id) === String(a.payload._id));
        if (idx >= 0) s.courses[idx] = a.payload;
      })
      .addCase(completeModule.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // --- Complete module (sub-course)
      .addCase(completeSubCourseModule.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(completeSubCourseModule.fulfilled, (s, a) => {
        s.loading = false;
        s.currentCourse = a.payload;
        const idx = s.courses.findIndex(c => String(c._id) === String(a.payload._id));
        if (idx >= 0) s.courses[idx] = a.payload;
      })
      .addCase(completeSubCourseModule.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

export default progressSlice.reducer;
