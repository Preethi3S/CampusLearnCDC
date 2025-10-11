import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quizApi from '../../api/quizApi';

export const fetchQuiz = createAsyncThunk('quiz/fetchQuiz', async ({ courseId, levelId, moduleId, token }) => {
  return await quizApi.getQuiz(courseId, levelId, moduleId, token);
});

export const submitQuiz = createAsyncThunk('quiz/submitQuiz', async ({ courseId, levelId, moduleId, answers, token }) => {
  return await quizApi.submitQuiz(courseId, levelId, moduleId, answers, token);
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState: { current: null, loading: false, error: null, result: null },
  reducers: { resetQuiz: (state) => { state.current = null; state.result = null; state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuiz.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchQuiz.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchQuiz.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(submitQuiz.fulfilled, (state, action) => { state.result = action.payload; });
  }
});

export const { resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;
