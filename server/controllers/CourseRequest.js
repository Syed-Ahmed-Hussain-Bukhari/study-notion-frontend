const CourseRequest = require("../models/CourseRequest");
const User = require("../models/User");

exports.createCourseRequest = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { instructorId, courseTopic, description } = req.body;

        if (!instructorId || !courseTopic) {
            return res.status(400).json({
                success: false,
                message: "Instructor and Course Topic are required fields",
            });
        }

        const instructorDetails = await User.findById(instructorId);
        if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
            return res.status(404).json({
                success: false,
                message: "Instructor not found",
            });
        }

        const request = await CourseRequest.create({
            student: studentId,
            instructor: instructorId,
            courseTopic,
            description,
        });

        res.status(200).json({
            success: true,
            data: request,
            message: "Course request submitted successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create course request",
            error: error.message,
        });
    }
}

exports.getStudentCourseRequests = async (req, res) => {
    try {
        const studentId = req.user.id;
        const requests = await CourseRequest.find({ student: studentId })
            .populate("instructor", "firstName lastName email image")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve course requests",
            error: error.message,
        });
    }
}

exports.getInstructorCourseRequests = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const requests = await CourseRequest.find({ instructor: instructorId })
            .populate("student", "firstName lastName email image")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve course requests for instructor",
            error: error.message,
        });
    }
}

exports.updateCourseRequestStatus = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { requestId, status } = req.body;

        if (!requestId || !status) {
            return res.status(400).json({
                success: false,
                message: "Request ID and status are required fields",
            });
        }

        if (!["Pending", "Accepted", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }

        const request = await CourseRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Course request not found",
            });
        }

        if (request.instructor.toString() !== instructorId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this request",
            });
        }

        request.status = status;
        await request.save();

        res.status(200).json({
            success: true,
            data: request,
            message: "Course request status updated successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update course request status",
            error: error.message,
        });
    }
}
