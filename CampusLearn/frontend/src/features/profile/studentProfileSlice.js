import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import studentProfileApi from '../../api/studentProfileApi';

export const fetchProfile = createAsyncThunk('studentProfile/fetch', async (token) => {
  return await studentProfileApi.getProfile(token);
});

export const saveProfile = createAsyncThunk('studentProfile/save', async ({ formData, token }) => {
  return await studentProfileApi.saveProfile(formData, token);
});

const slice = createSlice({
  name: 'studentProfile',
  initialState: { profile: null, loading: false, error: null },
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending, state => { state.loading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(saveProfile.pending, state => { state.loading = true; })
      .addCase(saveProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(saveProfile.rejected, (state, action) => { state.loading = false; state.error = action.error.message; });
  }
});

export default slice.reducer;
