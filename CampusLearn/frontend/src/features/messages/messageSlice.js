import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messageApi from '../../api/messageApi';

// --- Async actions ---
export const fetchMessages = createAsyncThunk('messages/fetchAll', async (token, thunkAPI) => {
  try {
    return await messageApi.getAllMessages(token);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch messages');
  }
});

export const createMessage = createAsyncThunk('messages/create', async ({ data, token }, thunkAPI) => {
  try {
    return await messageApi.createMessage(data, token);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create message');
  }
});

export const updateMessage = createAsyncThunk('messages/update', async ({ id, data, token }, thunkAPI) => {
  try {
    return await messageApi.updateMessage(id, data, token);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update message');
  }
});

export const deleteMessage = createAsyncThunk('messages/delete', async ({ id, token }, thunkAPI) => {
  try {
    await messageApi.deleteMessage(id, token);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to delete message');
  }
});

export const addReply = createAsyncThunk('messages/addReply', async ({ id, replyData, token }, thunkAPI) => {
  try {
    return await messageApi.addReply(id, replyData, token); 
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to add reply');
  }
});

export const addThumb = createAsyncThunk('messages/addThumb', async ({ id, token }, thunkAPI) => {
  try {
    return await messageApi.addThumb(id, token); 
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to add thumbs-up');
  }
});

// --- Slice ---
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
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        // 🚨 FIX: Explicitly check if the payload is an array
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Reset items to empty array on rejection
        state.items = []; 
      })
      // Create
      .addCase(createMessage.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update / Add Reply / Add Thumb: All receive the full updated message object
      .addCase(updateMessage.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(addReply.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(addThumb.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // Delete
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m._id !== action.payload);
      });
  },
});

export default messageSlice.reducer;