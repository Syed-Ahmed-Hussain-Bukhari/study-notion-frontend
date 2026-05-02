import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyStripePayment, verifyPayFastPayment } from "../services/operations/studentFeaturesAPI";


export default function PaymentSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useSelector((state) => state.auth);
  const [status, setStatus] = useState("verifying"); 
  const calledRef = useRef(false); 

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const sessionId = searchParams.get("session_id");
    const provider = searchParams.get("provider") || sessionStorage.getItem("pendingProvider") || "stripe";
    const rawCourses = sessionStorage.getItem("pendingCourses");
    const courses = rawCourses ? JSON.parse(rawCourses) : [];

    if (!token) {
      navigate("/login");
      return;
    }

    if (provider === "stripe") {
      if (!sessionId) {
        setStatus("error");
        return;
      }
      setStatus("verifying");
      verifyStripePayment(sessionId, courses, token, navigate, dispatch)
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
    } else if (provider === "payfast") {
      const paymentId = searchParams.get("m_payment_id"); // PayFast might return this
      setStatus("verifying");
      verifyPayFastPayment(paymentId, courses, token, navigate, dispatch)
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
    } else {
      setStatus("success");
    }
  }, [dispatch, navigate, searchParams, token]);

  return (
    <div className="min-h-screen bg-richblack-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-richblack-700 bg-richblack-800 p-10 text-center shadow-xl">

        {status === "verifying" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 rounded-full border-4 border-yellow-50 border-t-transparent animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-richblack-5 mb-2">
              Verifying your payment…
            </h1>
            <p className="text-richblack-200 text-sm">
              Please don't close this tab. This takes just a moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-caribbeangreen-200">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-richblack-5 mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-richblack-200 text-sm mb-8">
              You've been enrolled. Head to your dashboard to start learning.
            </p>
            <button
              onClick={() => navigate("/dashboard/enrolled-courses")}
              className="w-full rounded-lg bg-yellow-50 py-3 font-semibold text-richblack-900 transition duration-200 hover:bg-yellow-100"
            >
              Go to My Courses
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-200">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-richblack-5 mb-2">
              Verification Failed
            </h1>
            <p className="text-richblack-200 text-sm mb-8">
              We couldn't verify your payment. If you were charged, please
              contact support with your Stripe session details.
            </p>
            <button
              onClick={() => navigate("/dashboard/cart")}
              className="w-full rounded-lg border border-richblack-600 py-3 font-semibold text-richblack-100 transition duration-200 hover:bg-richblack-700"
            >
              Back to Cart
            </button>
          </>
        )}

      </div>
    </div>
  );
}
