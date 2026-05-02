const mailSender = require("../../utils/mailSender");
const { courseEnrollmentEmail } = require("../../mail/templates/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../../mail/templates/paymentSuccessEmail");
const enrollmentEmitter = require("../EnrollmentEmitter");

class EmailEnrollmentHandler {
  static register() {
    enrollmentEmitter.on("student:enrolled", async (data) => {
      try {
        const { courseName, studentEmail, studentName } = data;
        await mailSender(
          studentEmail,
          `Successfully Enrolled in ${courseName}`,
          courseEnrollmentEmail(courseName, studentName)
        );
        console.log(`[Observer] Sent enrollment email to ${studentEmail}`);
      } catch (error) {
        console.error("[Observer] Failed to send enrollment email:", error);
      }
    });

    enrollmentEmitter.on("payment:success", async (data) => {
      try {
        const { orderId, paymentId, amount, studentEmail, studentName } = data;
        await mailSender(
          studentEmail,
          "Payment Received – StudyNotion",
          paymentSuccessEmail(studentName, amount, orderId, paymentId)
        );
        console.log(`[Observer] Sent payment success email to ${studentEmail}`);
      } catch (error) {
        console.error("[Observer] Failed to send payment success email:", error);
      }
    });
  }
}

module.exports = EmailEnrollmentHandler;
