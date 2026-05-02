const User = require("../models/User");
const Course = require("../models/Course");
const Category = require("../models/Category");
const ApiResponseBuilder = require("../builders/ApiResponseBuilder");

// ─── Dashboard KPIs + Pie Chart Data ────────────────────────────────────────
exports.getAdminDashboardStats = async (req, res) => {
  try {
    const [totalCourses, totalStudents, totalInstructors, allCourses] =
      await Promise.all([
        Course.countDocuments({}),
        User.countDocuments({ accountType: "Student" }),
        User.countDocuments({ accountType: "Instructor" }),
        Course.find({}).populate("instructor", "firstName lastName image"),
      ]);

    // Per-instructor revenue for pie chart
    const instructorRevenueMap = {};
    let totalRevenue = 0;

    allCourses.forEach((course) => {
      if (!course.instructor) return;
      const revenue = (course.price || 0) * course.studentsEnrolled.length;
      totalRevenue += revenue;
      const key = course.instructor._id.toString();
      if (!instructorRevenueMap[key]) {
        instructorRevenueMap[key] = {
          instructorId: key,
          name: `${course.instructor.firstName} ${course.instructor.lastName}`,
          image: course.instructor.image,
          revenue: 0,
          courseCount: 0,
          studentCount: 0,
        };
      }
      instructorRevenueMap[key].revenue += revenue;
      instructorRevenueMap[key].courseCount += 1;
      instructorRevenueMap[key].studentCount += course.studentsEnrolled.length;
    });

    const instructorRevenue = Object.values(instructorRevenueMap).sort(
      (a, b) => b.revenue - a.revenue
    );

    // Recent courses (last 5)
    const recentCourses = await Course.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("instructor", "firstName lastName")
      .select("courseName price studentsEnrolled status createdAt");

    return new ApiResponseBuilder()
      .success()
      .status(200)
      .message("Admin dashboard stats fetched")
      .data({
        kpis: {
          totalRevenue,
          totalCourses,
          totalStudents,
          totalInstructors,
        },
        instructorRevenue,
        recentCourses,
      })
      .send(res);
  } catch (error) {
    console.error("getAdminDashboardStats error:", error);
    return new ApiResponseBuilder()
      .failure()
      .status(500)
      .message("Failed to fetch admin stats")
      .error(error)
      .send(res);
  }
};

// ─── All Courses (Admin View) ────────────────────────────────────────────────
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate("instructor", "firstName lastName email image")
      .populate("category", "name")
      .select(
        "courseName courseDescription price thumbnail studentsEnrolled status createdAt instructor category"
      )
      .sort({ createdAt: -1 });

    const coursesWithRevenue = courses.map((course) => ({
      _id: course._id,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      price: course.price || 0,
      status: course.status,
      createdAt: course.createdAt,
      instructor: course.instructor,
      category: course.category,
      studentsCount: course.studentsEnrolled?.length || 0,
      revenue: (course.price || 0) * (course.studentsEnrolled?.length || 0),
    }));

    return new ApiResponseBuilder()
      .success()
      .status(200)
      .message("All courses fetched")
      .data(coursesWithRevenue)
      .send(res);
  } catch (error) {
    console.error("getAllCoursesAdmin error:", error);
    return new ApiResponseBuilder()
      .failure()
      .status(500)
      .message("Failed to fetch courses")
      .error(error)
      .send(res);
  }
};

// ─── All Instructors (Admin View) ────────────────────────────────────────────
exports.getAllInstructorsAdmin = async (req, res) => {
  try {
    const instructors = await User.find({ accountType: "Instructor" })
      .populate("additionalDetails")
      .select("firstName lastName email image courses additionalDetails createdAt");

    const instructorData = await Promise.all(
      instructors.map(async (instructor) => {
        const courses = await Course.find({ instructor: instructor._id }).select(
          "courseName price thumbnail studentsEnrolled status"
        );

        const totalStudents = courses.reduce(
          (acc, c) => acc + (c.studentsEnrolled?.length || 0),
          0
        );
        const totalRevenue = courses.reduce(
          (acc, c) =>
            acc + (c.price || 0) * (c.studentsEnrolled?.length || 0),
          0
        );

        return {
          _id: instructor._id,
          firstName: instructor.firstName,
          lastName: instructor.lastName,
          email: instructor.email,
          image: instructor.image,
          about: instructor.additionalDetails?.about || "",
          contactNumber: instructor.additionalDetails?.contactNumber || "",
          joinedAt: instructor.createdAt,
          courses: courses.map((c) => ({
            _id: c._id,
            courseName: c.courseName,
            price: c.price || 0,
            thumbnail: c.thumbnail,
            status: c.status,
            studentsCount: c.studentsEnrolled?.length || 0,
            revenue: (c.price || 0) * (c.studentsEnrolled?.length || 0),
          })),
          totalCourses: courses.length,
          totalStudents,
          totalRevenue,
        };
      })
    );

    // Sort by totalRevenue descending (for leaderboard)
    instructorData.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return new ApiResponseBuilder()
      .success()
      .status(200)
      .message("All instructors fetched")
      .data(instructorData)
      .send(res);
  } catch (error) {
    console.error("getAllInstructorsAdmin error:", error);
    return new ApiResponseBuilder()
      .failure()
      .status(500)
      .message("Failed to fetch instructors")
      .error(error)
      .send(res);
  }
};

// ─── Delete Category ─────────────────────────────────────────────────────────
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) {
      return new ApiResponseBuilder()
        .failure()
        .status(400)
        .message("Category ID is required")
        .send(res);
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return new ApiResponseBuilder()
        .failure()
        .status(404)
        .message("Category not found")
        .send(res);
    }

    return new ApiResponseBuilder()
      .success()
      .status(200)
      .message("Category deleted successfully")
      .send(res);
  } catch (error) {
    console.error("deleteCategory error:", error);
    return new ApiResponseBuilder()
      .failure()
      .status(500)
      .message("Failed to delete category")
      .error(error)
      .send(res);
  }
};

// ─── All Users (Admin View) ───────────────────────────────────────────────────
exports.getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({})
      .populate("additionalDetails", "about contactNumber gender dateOfBirth")
      .select("firstName lastName email image accountType createdAt courses")
      .sort({ createdAt: -1 });

    const usersWithStats = users.map((u) => ({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      image: u.image,
      accountType: u.accountType,
      joinedAt: u.createdAt,
      courseCount: u.courses?.length || 0,
      about: u.additionalDetails?.about || "",
    }));

    return new ApiResponseBuilder()
      .success()
      .status(200)
      .message("All users fetched")
      .data(usersWithStats)
      .send(res);
  } catch (error) {
    console.error("getAllUsersAdmin error:", error);
    return new ApiResponseBuilder()
      .failure()
      .status(500)
      .message("Failed to fetch users")
      .error(error)
      .send(res);
  }
};
