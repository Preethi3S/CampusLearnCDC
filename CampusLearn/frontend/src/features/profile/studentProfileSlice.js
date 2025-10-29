import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import studentProfileService from '../../api/studentProfileApi';

// Fetch Student Profile
export const fetchProfile = createAsyncThunk(
  'studentProfile/fetchProfile',
  async (token, { rejectWithValue }) => {
    try {
      return await studentProfileService.getProfile(token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load profile');
    }
  }
);

// Save or Update Student Profile
export const saveProfile = createAsyncThunk(
  'studentProfile/saveProfile',
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      return await studentProfileService.saveProfile(formData, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to save profile');
    }
  }
);

const studentProfileSlice = createSlice({
  name: 'studentProfile',
  initialState: {
    profile: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(saveProfile.pending, (state) => {
        state.status = 'saving';
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.status = 'saved';
        state.profile = action.payload;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload;
      });
  },
});

export default studentProfileSlice.reducer;
