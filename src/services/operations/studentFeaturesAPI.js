import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const { INITIATE_PAYMENT_API, VERIFY_STRIPE_SESSION_API, VERIFY_PAYFAST_SESSION_API } = studentEndpoints;

/**
 * buyCourse — Provider-driven flow (Strategy Pattern on backend).
 *
 * 1. Calls backend to create a provider checkout session/link
 * 2. Redirects the browser to provider hosted checkout page
 * 3. On success, Stripe sends the user to /payment-success?session_id=...
 *    where PaymentSuccess.jsx calls verifyStripePayment() to enroll them.
 */
export async function buyCourse(
  token,
  courses,
  userDetails,
  navigate,
  dispatch,
  provider = "stripe"
) {
  const toastId = toast.loading("Initializing checkout…");
  dispatch(setPaymentLoading(true));

  try {
    // Ask backend to create checkout for selected provider
    const response = await apiConnector(
      "POST",
      INITIATE_PAYMENT_API,
      { courses, provider },
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    const checkoutUrl = response?.data?.data?.checkoutUrl;
    if (!checkoutUrl) {
      throw new Error("Missing checkout URL from payment provider");
    }

    // Store course IDs in sessionStorage so the success page can read them
    // (Provider webhook also carries these in metadata/custom fields)
    sessionStorage.setItem("pendingCourses", JSON.stringify(courses));
    sessionStorage.setItem("pendingProvider", provider);

    // Redirect to provider hosted checkout
    window.location.href = checkoutUrl;

  } catch (error) {
    console.error("buyCourse error:", error);
    toast.error("Could not start checkout. Please try again.");
    dispatch(setPaymentLoading(false));
    toast.dismiss(toastId);
  }

  // NOTE: toast & loading state are cleared on the /payment-success page
  // because this function redirects away from the app.
}

/**
 * verifyStripePayment — Called by PaymentSuccess.jsx after Stripe redirects back.
 *
 * Verifies the session with the backend, which then enrolls the student.
 */
export async function verifyStripePayment(sessionId, courses, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying payment…");
  dispatch(setPaymentLoading(true));

  try {
    const response = await apiConnector(
      "POST",
      VERIFY_STRIPE_SESSION_API,
      { sessionId, courses },
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Payment successful! You are now enrolled. 🎉");
    dispatch(resetCart());
    navigate("/dashboard/enrolled-courses");

  } catch (error) {
    console.error("verifyStripePayment error:", error);
    toast.error("Payment verification failed. Contact support if you were charged.");
    navigate("/dashboard/cart");
  } finally {
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
    sessionStorage.removeItem("pendingCourses");
    sessionStorage.removeItem("pendingProvider");
  }
}

/**
 * verifyPayFastPayment — Called by PaymentSuccess.jsx after PayFast redirects back.
 *
 * Fallback enrollment for sandbox/localhost where webhooks don't reach.
 */
export async function verifyPayFastPayment(paymentId, courses, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying your enrollment…");
  dispatch(setPaymentLoading(true));

  try {
    const response = await apiConnector(
      "POST",
      VERIFY_PAYFAST_SESSION_API,
      { paymentId, courses },
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Payment successful! You are now enrolled. 🎉");
    dispatch(resetCart());
    navigate("/dashboard/enrolled-courses");

  } catch (error) {
    console.error("verifyPayFastPayment error:", error);
    toast.error("Payment verification failed. Contact support if you were charged.");
    navigate("/dashboard/cart");
  } finally {
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
    sessionStorage.removeItem("pendingCourses");
    sessionStorage.removeItem("pendingProvider");
  }
}