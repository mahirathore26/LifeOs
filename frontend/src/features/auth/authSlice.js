import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { extractApiData, extractApiMessage } from '../../lib/api';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  message: null,
};

export const registerUser = createAsyncThunk('auth/registerUser', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', payload);
    return { data: extractApiData(response), message: extractApiMessage(response) };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', payload);
    return { data: extractApiData(response), message: extractApiMessage(response) };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const refreshSession = createAsyncThunk('auth/refreshSession', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/refresh-token');
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Session refresh failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load user');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/forgot-password', payload);
    return { data: extractApiData(response), message: extractApiMessage(response) };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to send reset instructions');
  }
});

export const resendVerificationEmail = createAsyncThunk('auth/resendVerificationEmail', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/resend-verification-email', payload);
    return { data: extractApiData(response), message: extractApiMessage(response) };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to resend verification email');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.message = null;
    },
    logoutLocal: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user ?? action.payload.data ?? null;
        state.isAuthenticated = Boolean(action.payload.data?.accessToken || action.payload.data?.refreshToken);
        state.message = action.payload.message || null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user ?? null;
        state.isAuthenticated = true;
        state.message = action.payload.message || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshSession.fulfilled, (state) => {
        state.isAuthenticated = true;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resendVerificationEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || null;
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthError, logoutLocal } = authSlice.actions;
export default authSlice.reducer;
