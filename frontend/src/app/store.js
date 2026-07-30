import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import notesReducer from '../features/notes/notesSlice';
import projectsReducer from '../features/projects/projectsSlice';
import learningReducer from '../features/learning/learningSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    tasks: tasksReducer,
    notes: notesReducer,
    projects: projectsReducer,
    learning: learningReducer,
  },
});

export default store;
