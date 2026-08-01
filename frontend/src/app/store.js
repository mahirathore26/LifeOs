import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import notesReducer from '../features/notes/notesSlice';
import projectsReducer from '../features/projects/projectsSlice';
import learningReducer from '../features/learning/learningSlice';
import documentsReducer from '../features/documents/documentsSlice';
import tagsReducer from '../features/tags/tagsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    tasks: tasksReducer,
    notes: notesReducer,
    projects: projectsReducer,
    learning: learningReducer,
    documents: documentsReducer,
    tags: tagsReducer,
  },
});

export default store;
