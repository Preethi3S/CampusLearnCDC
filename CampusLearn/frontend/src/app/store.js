import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import coursesReducer from '../features/courses/courseSlice';
import quizReducer from '../features/quizzes/quizSlice';
import messagesReducer from '../features/messages/messageSlice';
import studentProfileReducer from '../features/profile/studentProfileSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    quiz: quizReducer,
    messages : messagesReducer,
    studentProfile: studentProfileReducer,
  }
});

export default store;
