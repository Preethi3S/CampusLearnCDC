// src/features/messages/messageSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messageApi from '../../api/messageApi';

// --- Fetch messages ---
export const fetchMessages = createAsyncThunk(
  'messages/fetchAll',
  async (token, thunkAPI) => {
    try {
      return await messageApi.getAllMessages(token);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch messages'
      );
    }
  }
);

// --- Create message ---
export const createMessage = createAsyncThunk(
  'messages/create',
  async ({ data, token }, thunkAPI) => {
    try {
      return await messageApi.createMessage(data, token);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to create message'
      );
    }
  }
);

// --- Delete message ---
export const deleteMessage = createAsyncThunk(
  'messages/delete',
  async ({ id, token }, thunkAPI) => {
    try {
      await messageApi.deleteMessage(id, token);
      return id; // Return deleted message id for reducer
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to delete message'
      );
    }
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch messages ---
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Create message ---
      .addCase(createMessage.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // --- Delete message ---
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.items = state.items.filter((msg) => msg._id !== action.payload);
      });
  },
});

export default messageSlice.reducer;
