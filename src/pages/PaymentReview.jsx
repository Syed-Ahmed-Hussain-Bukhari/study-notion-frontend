import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { buyCourse } from "../services/operations/studentFeaturesAPI";

export default function PaymentReview() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { cart } = useSelector((state) => state.cart);

  const reviewCourses = useMemo(() => {
    const fromState = location?.state?.courses;
    if (Array.isArray(fromState) && fromState.length > 0) {
      return fromState;
    }
    return cart;
  }, [location?.state?.courses, cart]);

  const total = useMemo(
    () =>
      reviewCourses.reduce((sum, course) => sum + Number(course?.price || 0), 0),
    [reviewCourses]
  );

  const onPayNow = (provider) => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!reviewCourses.length) {
      toast.error("No courses selected for checkout");
      navigate("/dashboard/cart");
      return;
    }

    const courseIds = reviewCourses.map((course) => course._id);
    buyCourse(token, courseIds, user, navigate, dispatch, provider);
  };

  return (
    <div className="mx-auto w-11/12 max-w-maxContent py-10 text-richblack-5">
      <h1 className="mb-6 text-3xl font-semibold">Review Your Order</h1>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-richblack-700 bg-richblack-800 p-4">
          <p className="mb-4 text-sm text-richblack-300">
            Confirm the course details before proceeding to payment.
          </p>

          <div className="space-y-4">
            {reviewCourses.map((course) => (
              <div
                key={course._id}
                className="flex gap-4 rounded-md border border-richblack-700 bg-richblack-900 p-3"
              >
                <img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="h-20 w-32 rounded object-cover"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <p className="font-medium text-richblack-5">{course.courseName}</p>
                  {/* <p className="text-sm text-richblack-300">Course ID: {course._id}</p> */}
                  <p className="text-yellow-100">$ {course.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-lg border border-richblack-700 bg-richblack-800 p-4">
          <p className="mb-2 text-sm text-richblack-300">Choose Payment Method</p>
          <div className="mb-4 flex flex-col gap-2">
            <button
              className="yellowButton w-full justify-center"
              onClick={() => onPayNow("payfast")}
            >
              Pay with PayFast
            </button>
            <button
              className="yellowButton w-full justify-center"
              onClick={() => onPayNow("stripe")}
            >
              Pay with Stripe
            </button>
          </div>

          <p className="text-sm text-richblack-300">Total</p>
          <p className="mb-4 text-2xl font-semibold text-yellow-100">$ {total}</p>
        </div>
      </div>
    </div>
  );
}
