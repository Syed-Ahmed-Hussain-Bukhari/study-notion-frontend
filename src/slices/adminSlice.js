import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: null,
  courses: [],
  instructors: [],
  categories: [],
  users: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setStats(state, action) {
      state.stats = action.payload;
    },
    setCourses(state, action) {
      state.courses = action.payload;
    },
    setInstructors(state, action) {
      state.instructors = action.payload;
    },
    setCategories(state, action) {
      state.categories = action.payload;
    },
    setUsers(state, action) {
      state.users = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setStats,
  setCourses,
  setInstructors,
  setCategories,
  setUsers,
  setLoading,
  setError,
} = adminSlice.actions;

export default adminSlice.reducer;
