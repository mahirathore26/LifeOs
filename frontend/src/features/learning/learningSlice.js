import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { extractApiData } from '../../lib/api';

const initialState = {
  items: [],
  stats: null,
  analytics: null,
  goals: [],
  dueRevisions: [],
  revisionHistory: [],
  loading: false,
  goalsLoading: false,
  revisionsLoading: false,
  error: null,
  pagination: null,
};

export const fetchLearnings = createAsyncThunk('learning/fetchLearnings', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/learning', { params });
    return {
      data: extractApiData(response),
      pagination: response?.data?.pagination ?? null,
    };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load learning resources');
  }
});

export const createLearningResource = createAsyncThunk('learning/createLearningResource', async (body, { rejectWithValue }) => {
  try {
    const response = await api.post('/learning', body);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create learning resource');
  }
});

export const updateLearningResource = createAsyncThunk('learning/updateLearningResource', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/learning/${id}`, body);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update learning resource');
  }
});

export const deleteLearningResource = createAsyncThunk('learning/deleteLearningResource', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/learning/${id}`);
    return { id, data: extractApiData(response) };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete learning resource');
  }
});

export const restoreLearningResource = createAsyncThunk('learning/restoreLearningResource', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/learning/${id}/restore`);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to restore learning resource');
  }
});

export const toggleFavoriteLearning = createAsyncThunk('learning/toggleFavoriteLearning', async ({ id, isFavorite }, { rejectWithValue }) => {
  try {
    const response = await api.patch(isFavorite ? `/learning/${id}/favorite` : `/learning/${id}/unfavorite`);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update favorite status');
  }
});

export const createLearningSession = createAsyncThunk('learning/createLearningSession', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/learning/${id}/sessions`, body);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add learning session');
  }
});

export const fetchLearningStats = createAsyncThunk('learning/fetchLearningStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/learning/stats');
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load learning stats');
  }
});

export const fetchLearningAnalytics = createAsyncThunk('learning/fetchLearningAnalytics', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/learning/analytics');
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load learning analytics');
  }
});

export const fetchLearningGoals = createAsyncThunk('learning/fetchLearningGoals', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/learning/goals');
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load learning goals');
  }
});

export const createLearningGoal = createAsyncThunk('learning/createLearningGoal', async (body, { rejectWithValue }) => {
  try {
    const response = await api.post('/learning/goals', body);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create learning goal');
  }
});

export const updateLearningGoal = createAsyncThunk('learning/updateLearningGoal', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/learning/goals/${id}`, body);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update learning goal');
  }
});

export const deleteLearningGoal = createAsyncThunk('learning/deleteLearningGoal', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/learning/goals/${id}`);
    return { id, data: extractApiData(response) };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete learning goal');
  }
});

export const fetchDueRevisions = createAsyncThunk('learning/fetchDueRevisions', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/learning/revisions/due');
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load due revisions');
  }
});

export const createLearningRevision = createAsyncThunk('learning/createLearningRevision', async (body, { rejectWithValue }) => {
  try {
    const response = await api.post('/learning/revisions', body);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create revision');
  }
});

export const markRevisionComplete = createAsyncThunk('learning/markRevisionComplete', async (id, { rejectWithValue }) => {
  try {
    const response = await api.post(`/learning/revisions/${id}/review`, { quality: 5 });
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to complete revision');
  }
});

export const deleteLearningRevision = createAsyncThunk('learning/deleteLearningRevision', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/learning/revisions/${id}`);
    return { id, data: extractApiData(response) };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete revision');
  }
});

const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLearnings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLearnings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data ?? [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLearnings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLearningResource.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateLearningResource.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(deleteLearningResource.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item._id === action.payload.id ? { ...item, isDeleted: true } : item));
      })
      .addCase(restoreLearningResource.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(toggleFavoriteLearning.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(createLearningSession.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(fetchLearningStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchLearningAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(fetchLearningGoals.pending, (state) => {
        state.goalsLoading = true;
      })
      .addCase(fetchLearningGoals.fulfilled, (state, action) => {
        state.goalsLoading = false;
        state.goals = action.payload ?? [];
      })
      .addCase(fetchLearningGoals.rejected, (state, action) => {
        state.goalsLoading = false;
        state.error = action.payload;
      })
      .addCase(createLearningGoal.fulfilled, (state, action) => {
        state.goals.unshift(action.payload);
      })
      .addCase(updateLearningGoal.fulfilled, (state, action) => {
        state.goals = state.goals.map((goal) => (goal._id === action.payload._id ? action.payload : goal));
      })
      .addCase(deleteLearningGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((goal) => goal._id !== action.payload.id);
      })
      .addCase(fetchDueRevisions.pending, (state) => {
        state.revisionsLoading = true;
      })
      .addCase(fetchDueRevisions.fulfilled, (state, action) => {
        state.revisionsLoading = false;
        state.dueRevisions = action.payload ?? [];
      })
      .addCase(fetchDueRevisions.rejected, (state, action) => {
        state.revisionsLoading = false;
        state.error = action.payload;
      })
      .addCase(createLearningRevision.fulfilled, (state, action) => {
        state.dueRevisions.unshift(action.payload);
        state.revisionHistory.unshift(action.payload);
      })
      .addCase(markRevisionComplete.fulfilled, (state, action) => {
        state.dueRevisions = state.dueRevisions.filter((revision) => revision._id !== action.payload._id);
        state.revisionHistory = state.revisionHistory.map((revision) => (revision._id === action.payload._id ? action.payload : revision));
      })
      .addCase(deleteLearningRevision.fulfilled, (state, action) => {
        state.dueRevisions = state.dueRevisions.filter((revision) => revision._id !== action.payload.id);
        state.revisionHistory = state.revisionHistory.filter((revision) => revision._id !== action.payload.id);
      });
  },
});

export default learningSlice.reducer;
