import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { extractApiData } from '../../lib/api';

const initialState = {
  overview: null,
  loading: false,
  error: null,
};

export const fetchDashboardOverview = createAsyncThunk('dashboard/fetchDashboardOverview', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/dashboard');
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load dashboard');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
