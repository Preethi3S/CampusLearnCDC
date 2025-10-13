import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quizApi from '../../api/quizApi';

// The submitQuiz thunk is correctly defined, but quizApi.submitQuiz was missing!
export const fetchQuiz = createAsyncThunk('quiz/fetchQuiz', async ({ courseId, levelId, moduleId, token }) => {
  return await quizApi.getQuiz(courseId, levelId, moduleId, token);
});

export const submitQuiz = createAsyncThunk('quiz/submitQuiz', async ({ courseId, levelId, moduleId, answers, token }, { rejectWithValue }) => {
  try {
    return await quizApi.submitQuiz(courseId, levelId, moduleId, answers, token);
  } catch (error) {
    // Extract the specific error message from the server response
    const message = error.response?.data?.message || error.message;
    return rejectWithValue(message);
  }
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState: { current: null, loading: false, error: null, result: null },
  reducers: { resetQuiz: (state) => { state.current = null; state.result = null; state.error = null; } },
  extraReducers: (builder) => {
    builder
      // Fetch Quiz Reducers
      .addCase(fetchQuiz.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchQuiz.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchQuiz.rejected, (state, action) => { 
          state.loading = false; 
          state.error = action.error.message; 
      })
      
      // 🎯 FIX: Submit Quiz Reducers (Handling loading and error states)
      .addCase(submitQuiz.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(submitQuiz.fulfilled, (state, action) => { 
          state.loading = false;
          state.result = action.payload; 
          state.error = null; // Clear any previous error
      })
      .addCase(submitQuiz.rejected, (state, action) => {
          state.loading = false;
          // Use the message passed via rejectWithValue
          state.error = action.payload || action.error.message; 
          // Keep current quiz data but reset the result to null 
          state.result = null; 
      });
  }
});

export const { resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;