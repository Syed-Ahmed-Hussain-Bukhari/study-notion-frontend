import { apiConnector } from "../apiconnector";
import { adminEndpoints } from "../apis";
import { toast } from "react-hot-toast";
import {
  setStats,
  setCourses,
  setInstructors,
  setCategories,
  setUsers,
  setLoading,
  setError,
} from "../../slices/adminSlice";

const {
  ADMIN_DASHBOARD_API,
  ADMIN_COURSES_API,
  ADMIN_INSTRUCTORS_API,
  ADMIN_CATEGORIES_API,
  ADMIN_DELETE_CATEGORY_API,
  ADMIN_USERS_API,
} = adminEndpoints;

// ─── Get Dashboard Stats ──────────────────────────────────────────────────────
export const getAdminDashboardStats = (token) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await apiConnector("GET", ADMIN_DASHBOARD_API, null, {
      Authorization: `Bearer ${token}`,
    });
    if (!res.data.success) throw new Error(res.data.message);
    dispatch(setStats(res.data.data));
  } catch (error) {
    dispatch(setError(error.message));
    toast.error("Could not load dashboard data");
  } finally {
    dispatch(setLoading(false));
  }
};

// ─── Get All Courses ──────────────────────────────────────────────────────────
export const getAdminCourses = (token) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await apiConnector("GET", ADMIN_COURSES_API, null, {
      Authorization: `Bearer ${token}`,
    });
    if (!res.data.success) throw new Error(res.data.message);
    dispatch(setCourses(res.data.data));
  } catch (error) {
    dispatch(setError(error.message));
    toast.error("Could not load courses");
  } finally {
    dispatch(setLoading(false));
  }
};

// ─── Get All Instructors ──────────────────────────────────────────────────────
export const getAdminInstructors = (token) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await apiConnector("GET", ADMIN_INSTRUCTORS_API, null, {
      Authorization: `Bearer ${token}`,
    });
    if (!res.data.success) throw new Error(res.data.message);
    dispatch(setInstructors(res.data.data));
  } catch (error) {
    dispatch(setError(error.message));
    toast.error("Could not load instructors");
  } finally {
    dispatch(setLoading(false));
  }
};

// ─── Get All Categories ───────────────────────────────────────────────────────
export const getAdminCategories = (token) => async (dispatch) => {
  try {
    const res = await apiConnector("GET", ADMIN_CATEGORIES_API, null, {
      Authorization: `Bearer ${token}`,
    });
    if (!res.data.success) throw new Error(res.data.message);
    dispatch(setCategories(res.data.data));
  } catch (error) {
    dispatch(setError(error.message));
    toast.error("Could not load categories");
  }
};

// ─── Create Category ──────────────────────────────────────────────────────────
export const createAdminCategory = (name, description, token) => async (dispatch) => {
  const toastId = toast.loading("Creating category...");
  try {
    const res = await apiConnector(
      "POST",
      ADMIN_CATEGORIES_API,
      { name, description },
      { Authorization: `Bearer ${token}` }
    );
    if (!res.data.success) throw new Error(res.data.message);
    toast.success("Category created successfully");
    dispatch(getAdminCategories(token));
  } catch (error) {
    toast.error(error.message || "Failed to create category");
  } finally {
    toast.dismiss(toastId);
  }
};

// ─── Delete Category ──────────────────────────────────────────────────────────
export const deleteAdminCategory = (categoryId, token) => async (dispatch) => {
  const toastId = toast.loading("Deleting category...");
  try {
    const res = await apiConnector(
      "DELETE",
      ADMIN_DELETE_CATEGORY_API,
      { categoryId },
      { Authorization: `Bearer ${token}` }
    );
    if (!res.data.success) throw new Error(res.data.message);
    toast.success("Category deleted");
    dispatch(getAdminCategories(token));
  } catch (error) {
    toast.error(error.message || "Failed to delete category");
  } finally {
    toast.dismiss(toastId);
  }
};

// ─── Get All Users ────────────────────────────────────────────────────────────
export const getAdminUsers = (token) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await apiConnector("GET", ADMIN_USERS_API, null, {
      Authorization: `Bearer ${token}`,
    });
    if (!res.data.success) throw new Error(res.data.message);
    dispatch(setUsers(res.data.data));
  } catch (error) {
    dispatch(setError(error.message));
    toast.error("Could not load users");
  } finally {
    dispatch(setLoading(false));
  }
};
