import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import tasksService from './services/tasksService';

const initialState = {
  items: [],
  loading: false,
  error: null,
  pagination: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (params = {}, { rejectWithValue }) => {
  try {
    return await tasksService.getTasks(params);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load tasks');
  }
});

export const createTask = createAsyncThunk('tasks/createTask', async (payload, { rejectWithValue }) => {
  try {
    return await tasksService.createTask(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await tasksService.updateTask(id, payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id, { rejectWithValue }) => {
  try {
    return await tasksService.deleteTask(id);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
  }
});

export const restoreTask = createAsyncThunk('tasks/restoreTask', async (id, { rejectWithValue }) => {
  try {
    return await tasksService.restoreTask(id);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to restore task');
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data ?? [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.items = state.items.map((task) => (task._id === action.payload._id ? action.payload : task));
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task._id !== action.payload);
      })
      .addCase(restoreTask.fulfilled, (state, action) => {
        state.items = state.items.map((task) => (task._id === action.payload._id ? action.payload : task));
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(restoreTask.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;
