import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import progressApi from '../../api/progressApi';

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
  initialState: { courses: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(enrollCourse.pending, s => { s.loading = true; s.error = null; })
      .addCase(enrollCourse.fulfilled, (s, a) => {
        s.loading = false;
        s.courses.push(a.payload);
      })
      .addCase(enrollCourse.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchMyCourses.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchMyCourses.fulfilled, (s, a) => { s.loading = false; s.courses = a.payload; })
      .addCase(fetchMyCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

export default progressSlice.reducer;
