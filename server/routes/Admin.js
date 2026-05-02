const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middlewares/auth");
const {
  getAdminDashboardStats,
  getAllCoursesAdmin,
  getAllInstructorsAdmin,
  deleteCategory,
  getAllUsersAdmin,
} = require("../controllers/Admin");
const { createCategory, showAllCategories } = require("../controllers/Category");

// All admin routes are protected by auth + isAdmin middleware

// ─── Dashboard ───────────────────────────────────────────────────────────────
router.get("/dashboard", auth, isAdmin, getAdminDashboardStats);

// ─── Courses ─────────────────────────────────────────────────────────────────
router.get("/courses", auth, isAdmin, getAllCoursesAdmin);

// ─── Instructors ──────────────────────────────────────────────────────────────
router.get("/instructors", auth, isAdmin, getAllInstructorsAdmin);

// ─── Categories ───────────────────────────────────────────────────────────────
router.get("/categories", auth, isAdmin, showAllCategories);
router.post("/categories", auth, isAdmin, createCategory);
router.delete("/categories", auth, isAdmin, deleteCategory);

// ─── Users ────────────────────────────────────────────────────────────────────
router.get("/users", auth, isAdmin, getAllUsersAdmin);

module.exports = router;
