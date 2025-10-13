import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import coursesReducer from '../features/courses/courseSlice';
import quizReducer from '../features/quizzes/quizSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    quiz: quizReducer,
  }
});

export default store;
