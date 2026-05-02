import { toast } from "react-hot-toast"

import { courseRequestEndpoints, profileEndpoints } from "../apis"
import { apiConnector } from "../apiconnector"

const {
  CREATE_COURSE_REQUEST_API,
  GET_STUDENT_COURSE_REQUESTS_API,
  GET_INSTRUCTOR_COURSE_REQUESTS_API,
  UPDATE_COURSE_REQUEST_STATUS_API,
} = courseRequestEndpoints

const { GET_ALL_INSTRUCTORS_API } = profileEndpoints

export const getAllInstructors = async (token) => {
  const toastId = toast.loading("Loading Instructors...")
  let result = []
  try {
    const response = await apiConnector("GET", GET_ALL_INSTRUCTORS_API, null, {
      Authorization: `Bearer ${token}`,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data.data
  } catch (error) {
    console.log("GET_ALL_INSTRUCTORS_API API ERROR............", error)
    toast.error("Could Not Fetch Instructors")
  }
  toast.dismiss(toastId)
  return result
}

export const createCourseRequest = async (data, token) => {
  const toastId = toast.loading("Submitting Request...")
  let success = false
  try {
    const response = await apiConnector("POST", CREATE_COURSE_REQUEST_API, data, {
      Authorization: `Bearer ${token}`,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Course Request Submitted")
    success = true
  } catch (error) {
    console.log("CREATE_COURSE_REQUEST_API API ERROR............", error)
    toast.error("Could Not Submit Request")
  }
  toast.dismiss(toastId)
  return success
}

export const getStudentCourseRequests = async (token) => {
  const toastId = toast.loading("Loading Requests...")
  let result = []
  try {
    const response = await apiConnector("GET", GET_STUDENT_COURSE_REQUESTS_API, null, {
      Authorization: `Bearer ${token}`,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data.data
  } catch (error) {
    console.log("GET_STUDENT_COURSE_REQUESTS_API API ERROR............", error)
    toast.error("Could Not Fetch Requests")
  }
  toast.dismiss(toastId)
  return result
}

export const getInstructorCourseRequests = async (token) => {
  const toastId = toast.loading("Loading Requests...")
  let result = []
  try {
    const response = await apiConnector("GET", GET_INSTRUCTOR_COURSE_REQUESTS_API, null, {
      Authorization: `Bearer ${token}`,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data.data
  } catch (error) {
    console.log("GET_INSTRUCTOR_COURSE_REQUESTS_API API ERROR............", error)
    toast.error("Could Not Fetch Requests")
  }
  toast.dismiss(toastId)
  return result
}

export const updateCourseRequestStatus = async (data, token) => {
  const toastId = toast.loading("Updating Status...")
  let success = false
  try {
    const response = await apiConnector("PUT", UPDATE_COURSE_REQUEST_STATUS_API, data, {
      Authorization: `Bearer ${token}`,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Status Updated Successfully")
    success = true
  } catch (error) {
    console.log("UPDATE_COURSE_REQUEST_STATUS_API API ERROR............", error)
    toast.error("Could Not Update Status")
  }
  toast.dismiss(toastId)
  return success
}
