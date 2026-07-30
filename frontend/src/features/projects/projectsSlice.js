import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { extractApiData } from '../../lib/api';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/projects', { params });
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load projects');
  }
});

export const createProject = createAsyncThunk('projects/createProject', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/projects', payload);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/updateProject', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/projects/${id}`, payload);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update project');
  }
});

export const archiveProject = createAsyncThunk('projects/archiveProject', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/projects/${id}/archive`);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to archive project');
  }
});

export const unarchiveProject = createAsyncThunk('projects/unarchiveProject', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/projects/${id}/unarchive`);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to unarchive project');
  }
});

export const deleteProject = createAsyncThunk('projects/deleteProject', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
  }
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.items = state.items.map((project) => (project._id === action.payload._id ? action.payload : project));
      })
      .addCase(archiveProject.fulfilled, (state, action) => {
        state.items = state.items.map((project) => (project._id === action.payload._id ? action.payload : project));
      })
      .addCase(unarchiveProject.fulfilled, (state, action) => {
        state.items = state.items.map((project) => (project._id === action.payload._id ? action.payload : project));
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter((project) => project._id !== action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(archiveProject.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(unarchiveProject.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearProjectError } = projectsSlice.actions;
export default projectsSlice.reducer;
