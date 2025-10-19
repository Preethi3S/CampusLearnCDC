import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseApi from '../../api/courseApi';

// fetch all courses
export const fetchCourses = createAsyncThunk('courses/fetchAll', async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  try {
    return await courseApi.getCourses(token);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createCourse = createAsyncThunk('courses/create', async (payload, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  try {
    return await courseApi.createCourse(payload, token);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteCourse = createAsyncThunk('courses/delete', async (id, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  try {
    await courseApi.deleteCourse(id, token);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

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
      .addCase(fetchCourses.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCourses.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createCourse.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createCourse.fulfilled, (s, a) => {
        s.loading = false;
        s.items.unshift(a.payload);
      })
      .addCase(createCourse.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(deleteCourse.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteCourse.fulfilled, (s, a) => {
        s.loading = false;
        s.items = s.items.filter(c => String(c._id) !== String(a.payload));
      })
      .addCase(deleteCourse.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

export default courseSlice.reducer;