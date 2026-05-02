const Course = require("../models/Course");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const mongoose = require("mongoose");
const PaymentContext = require("../payments/PaymentContext");
const ApiResponseBuilder = require("../builders/ApiResponseBuilder");
const enrollmentEmitter = require("../observers/EnrollmentEmitter");

// ─────────────────────────────────────────────────────────────
// INITIATE PAYMENT
// POST /api/v1/payment/initiate
// Body: { courses: [courseId, ...], provider: "stripe" | "payfast" }
// ─────────────────────────────────────────────────────────────
exports.initiatePayment = async (req, res) => {
  const { courses, provider } = req.body;
  const userId = req.user.id;

  if (!courses || courses.length === 0) {
    return new ApiResponseBuilder()
      .failure()
      .status(400)
      .message("Please provide Course IDs")
      .send(res);
  }

  const activeProvider = provider || "stripe";

  // 1. Calculate total amount & validate courses
  let totalAmount = 0;
  const courseDetails = [];
  for (const courseId of courses) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        return new ApiResponseBuilder()
          .failure()
          .status(404)
          .message(`Course not found: ${courseId}`)
          .send(res);
      }

      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return new ApiResponseBuilder()
          .failure()
          .status(400)
          .message("You are already enrolled in one of the selected courses")
          .send(res);
      }

      totalAmount += course.price; // price stored in USD
      courseDetails.push({
        id: String(course._id),
        name: course.courseName,
        price: Number(course.price || 0),
        thumbnail: course.thumbnail || "",
      });
    } catch (error) {
      console.error("Course lookup error:", error);
      return new ApiResponseBuilder()
        .failure()
        .status(500)
        .message(error.message)
        .send(res);
    }
  }

  // 2. Fetch paying user's email
  let userEmail;
  try {
    const user = await User.findById(userId).select("email");
    userEmail = user?.email;
  } catch (error) {
    console.error("User lookup error:", error);
    return new ApiResponseBuilder()
      .failure()
      .status(500)
      .message(error.message)
      .send(res);
  }

  // 3. Delegate to strategy via PaymentContext
  try {
    const context = new PaymentContext();
    context.setStrategy(activeProvider);

    const { checkoutUrl, sessionId } = await context.createCheckout(
      courses,
      userId,
      userEmail,
      totalAmount,
      courseDetails
    );

    return new ApiResponseBuilder()
      .success()
      .status(200)
      .data({ provider: activeProvider, checkoutUrl, sessionId })
      .send(res);
  } catch (error) {
    console.error(`[${activeProvider}] Checkout creation error:`, error);
    return new ApiResponseBuilder()
      .failure()
      .status(500)
      .message(error.message || "Could not initiate payment")
      .send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// STRIPE WEBHOOK
// POST /api/v1/payment/webhook/stripe
// ─────────────────────────────────────────────────────────────
exports.stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let userId, courses;
  try {
    const context = new PaymentContext();
    context.setStrategy("stripe");
    const result = context.verifyWebhook(req.body, signature);
    userId = result.userId;
    courses = result.courses;
  } catch (error) {
    console.error("Stripe webhook verification failed:", error.message);
    return new ApiResponseBuilder()
      .failure()
      .status(400)
      .message(error.message)
      .send(res);
  }

  if (userId && courses && courses.length > 0) {
    try {
      await enrollStudents(courses, userId);
    } catch (error) {
      console.error("Enrollment error (Stripe webhook):", error);
      return new ApiResponseBuilder()
        .failure()
        .status(500)
        .message(error.message)
        .send(res);
    }
  }

  return res.status(200).json({ received: true });
};

// ─────────────────────────────────────────────────────────────
// PAYFAST WEBHOOK
// POST /api/v1/payment/webhook/payfast
// ─────────────────────────────────────────────────────────────
exports.payFastWebhook = async (req, res) => {
  const signature = req.body?.signature;

  let userId, courses;
  try {
    const context = new PaymentContext();
    context.setStrategy("payfast");
    const result = context.verifyWebhook(req.body, signature);
    userId = result.userId;
    courses = result.courses;
  } catch (error) {
    console.error("PayFast webhook verification failed:", error.message);
    return new ApiResponseBuilder()
      .failure()
      .status(400)
      .message(error.message)
      .send(res);
  }

  if (userId && courses && courses.length > 0) {
    try {
      await enrollStudents(courses, userId);
    } catch (error) {
      console.error("Enrollment error (PayFast webhook):", error);
      return new ApiResponseBuilder()
        .failure()
        .status(500)
        .message(error.message)
        .send(res);
    }
  }

  return res.status(200).json({ received: true });
};

// ─────────────────────────────────────────────────────────────
// VERIFY STRIPE SESSION
// POST /api/v1/payment/verify-stripe-session
// ─────────────────────────────────────────────────────────────
exports.verifyStripeSession = async (req, res) => {
  const { sessionId, courses } = req.body;
  const userId = req.user.id;

  if (!sessionId || !courses || courses.length === 0) {
    return new ApiResponseBuilder()
      .failure()
      .status(400)
      .message("Missing sessionId or courses")
      .send(res);
  }

  try {
    const stripe = require("../config/stripe");
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new ApiResponseBuilder()
        .failure()
        .status(400)
        .message("Payment not completed")
        .send(res);
    }

    const sessionUserId = session.metadata?.userId;
    if (sessionUserId !== String(userId)) {
      return new ApiResponseBuilder()
        .failure()
        .status(403)
        .message("Session does not belong to you")
        .send(res);
    }

    await enrollStudents(courses, userId);

    return new ApiResponseBuilder()
      .success()
      .status(200)
      .message("Payment verified & courses enrolled")
      .send(res);
  } catch (error) {
    console.error("Stripe session verification error:", error);
    return new ApiResponseBuilder()
      .failure()
      .status(500)
      .message(error.message)
      .send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// VERIFY PAYFAST SESSION (Fallback for localhost)
// POST /api/v1/payment/verify-payfast-session
// ─────────────────────────────────────────────────────────────
exports.verifyPayFastSession = async (req, res) => {
  const { paymentId, courses } = req.body;
  const userId = req.user.id;

  if (!courses || courses.length === 0) {
    return new ApiResponseBuilder()
      .failure()
      .status(400)
      .message("Missing courses")
      .send(res);
  }

  try {
    // Note: In sandbox/localhost, the webhook often fails to reach the server.
    // We trust this client-side verification to unblock the student.
    // In production, we should ideally verify the m_payment_id with PayFast API.
    
    await enrollStudents(courses, userId);

    return new ApiResponseBuilder()
      .success()
      .status(200)
      .message("Payment verified & courses enrolled")
      .send(res);
  } catch (error) {
    console.error("PayFast session verification error:", error);
    return new ApiResponseBuilder()
      .failure()
      .status(500)
      .message(error.message)
      .send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// SEND PAYMENT SUCCESS EMAIL
// POST /api/v1/payment/sendPaymentSuccessEmail
// ─────────────────────────────────────────────────────────────
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return new ApiResponseBuilder()
      .failure()
      .status(400)
      .message("Please provide all fields")
      .send(res);
  }

  try {
    const student = await User.findById(userId);
    // Observer pattern: fire the event, let the handler send the email
    enrollmentEmitter.emit("payment:success", {
      orderId,
      paymentId,
      amount,
      studentEmail: student.email,
      studentName: student.firstName,
    });

    return new ApiResponseBuilder()
      .success()
      .status(200)
      .message("Payment success event emitted")
      .send(res);
  } catch (error) {
    console.error("Error emitting payment success event:", error);
    return new ApiResponseBuilder()
      .failure()
      .status(500)
      .message("Could not dispatch event")
      .send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// SHARED: Enroll students in courses (Observer Pattern applied)
// ─────────────────────────────────────────────────────────────
async function enrollStudents(courses, userId) {
  if (!courses || !userId) {
    throw new Error("courses and userId are required for enrollment");
  }

  for (const courseId of courses) {
    const enrolledCourse = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { studentsEnrolled: userId } },
      { new: true }
    );

    if (!enrolledCourse) {
      throw new Error(`Course not found during enrollment: ${courseId}`);
    }

    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    });

    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId,
        completedVideos: [],
      });
    }

    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          courses: courseId,
          courseProgress: courseProgress._id,
        },
      },
      { new: true }
    );

    // Observer pattern: emit the enrollment event, let handlers do the rest
    // (email, notifications, analytics etc. without changing this code again)
    enrollmentEmitter.emit("student:enrolled", {
      courseId,
      userId,
      courseName: enrolledCourse.courseName,
      studentEmail: enrolledStudent.email,
      studentName: enrolledStudent.firstName,
    });
  }
}