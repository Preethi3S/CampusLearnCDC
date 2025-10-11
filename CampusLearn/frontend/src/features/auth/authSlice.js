import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../../api/authApi';

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null
};

// load from localStorage if present
const saved = localStorage.getItem('campuslearn_auth');
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    initialState.user = parsed.user || null;
    initialState.token = parsed.token || null;
  } catch (e) { /* ignore */ }
}

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const data = await authApi.register(payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const data = await authApi.login(payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('campuslearn_auth');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s, action) => {
        s.loading = false;
        s.user = action.payload;
        s.token = action.payload.token;
        localStorage.setItem('campuslearn_auth', JSON.stringify({ user: s.user, token: s.token }));
      })
      .addCase(register.rejected, (s, action) => { s.loading = false; s.error = action.payload; })

      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, action) => {
        s.loading = false;
        s.user = action.payload;
        s.token = action.payload.token;
        localStorage.setItem('campuslearn_auth', JSON.stringify({ user: s.user, token: s.token }));
      })
      .addCase(login.rejected, (s, action) => { s.loading = false; s.error = action.payload; });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
