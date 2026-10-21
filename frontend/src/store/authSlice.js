
import { createSlice } from "@reduxjs/toolkit";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  try {
    return localStorage.getItem("access_token");
  } catch {
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken()),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, access_token, token } = action.payload;

      state.user = user ?? null;
      state.token = access_token ?? token ?? null;
      state.isAuthenticated = Boolean(state.token);
      state.loading = false;
      state.error = null;

      if (state.token) {
        localStorage.setItem("access_token", state.token);
      } else {
        localStorage.removeItem("access_token");
      }

      if (state.user) {
        localStorage.setItem("user", JSON.stringify(state.user));
      } else {
        localStorage.removeItem("user");
      }
    },

    setUser: (state, action) => {
      state.user = action.payload;

      if (state.user) {
        localStorage.setItem("user", JSON.stringify(state.user));
      } else {
        localStorage.removeItem("user");
      }
    },

    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },

    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  setUser,
  setAuthLoading,
  setAuthError,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
