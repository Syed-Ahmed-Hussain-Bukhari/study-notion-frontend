const express = require("express");
const router = express.Router();

const {
  initiatePayment,
  stripeWebhook,
  payFastWebhook,
  verifyStripeSession,
  sendPaymentSuccessEmail,
  verifyPayFastSession,
} = require("../controllers/Payments");

const { auth, isStudent } = require("../middlewares/auth");

// ── Student-facing routes ──────────────────────────────────────────────────
// Initiates a payment session for the chosen provider (stripe | payfast)
router.post("/initiate", auth, isStudent, initiatePayment);

// Verifies a Stripe checkout session after redirect-back (fallback to webhook)
router.post("/verify-stripe-session", auth, isStudent, verifyStripeSession);

// Verifies a PayFast session after redirect-back (fallback to webhook)
router.post("/verify-payfast-session", auth, isStudent, verifyPayFastSession);

// Sends a payment success confirmation email
router.post(
  "/sendPaymentSuccessEmail",
  auth,
  isStudent,
  sendPaymentSuccessEmail
);

// ── Webhook routes (no auth middleware — verified by signature) ────────────
// Stripe webhook — must receive raw body; express.raw() is applied in index.js
router.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// PayFast ITN webhook — sends form-urlencoded payload
router.post(
  "/webhook/payfast",
  express.urlencoded({ extended: false }),
  payFastWebhook
);

module.exports = router;