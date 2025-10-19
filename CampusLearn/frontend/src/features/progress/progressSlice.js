import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import progressApi from '../../api/progressApi';

// New Thunk: Fetches detailed progress for a single course
export const fetchCourseProgress = createAsyncThunk('progress/fetchCourseProgress', async (courseId, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  try {
    // Calls the existing API endpoint /progress/:courseId
    return await progressApi.getCourseProgress(courseId, token);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const enrollCourse = createAsyncThunk('progress/enroll', async (courseId, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  try {
    return await progressApi.enrollCourse(courseId, token);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchMyCourses = createAsyncThunk('progress/fetchMy', async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  try {
    return await progressApi.getMyCourses(token);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

const progressSlice = createSlice({
  name: 'progress',
  initialState: { 
    courses: [], 
    loading: false, 
    error: null,
    // NEW STATE: To hold the progress details of the currently viewed course
    currentCourseProgress: null, 
    progressLoading: false 
},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(enrollCourse.pending, s => { s.loading = true; s.error = null; })
      .addCase(enrollCourse.fulfilled, (s, a) => {
        s.loading = false;
        // Check if the course is already in the list before pushing
        if (!s.courses.some(c => c._id === a.payload._id)) {
          s.courses.push(a.payload);
        }
      })
      .addCase(enrollCourse.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchMyCourses.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchMyCourses.fulfilled, (s, a) => { s.loading = false; s.courses = a.payload; })
      .addCase(fetchMyCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      
      // NEW REDUCER CASES FOR fetchCourseProgress
      .addCase(fetchCourseProgress.pending, s => { 
          s.progressLoading = true; 
          s.error = null; 
      })
      .addCase(fetchCourseProgress.fulfilled, (s, a) => { 
          s.progressLoading = false; 
          s.currentCourseProgress = a.payload; // Store the detailed progress
      })
      .addCase(fetchCourseProgress.rejected, (s, a) => { 
          s.progressLoading = false; 
          s.error = a.payload; 
          s.currentCourseProgress = null;
      });
  }
});

export default progressSlice.reducer;