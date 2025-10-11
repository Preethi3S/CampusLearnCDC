import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import coursesReducer from '../features/courses/courseSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer
  }
});

export default store;
