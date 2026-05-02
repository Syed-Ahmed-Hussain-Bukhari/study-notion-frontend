const express = require("express")
const router = express.Router()

const {
  createCourseRequest,
  getStudentCourseRequests,
  getInstructorCourseRequests,
  updateCourseRequestStatus,
} = require("../controllers/CourseRequest")

const { auth, isStudent, isInstructor } = require("../middlewares/auth")

router.post("/create", auth, isStudent, createCourseRequest)
router.get("/getStudentCourseRequests", auth, isStudent, getStudentCourseRequests)
router.get("/getInstructorCourseRequests", auth, isInstructor, getInstructorCourseRequests)
router.put("/updateCourseRequestStatus", auth, isInstructor, updateCourseRequestStatus)

module.exports = router
