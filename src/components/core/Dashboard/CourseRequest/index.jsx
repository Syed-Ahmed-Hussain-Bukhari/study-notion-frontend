import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {
  createCourseRequest,
  getAllInstructors,
  getStudentCourseRequests,
} from "../../../../services/operations/courseRequestAPI"
import IconBtn from "../../../common/IconBtn"

export default function CourseRequest() {
  const { token } = useSelector((state) => state.auth)
  const [instructors, setInstructors] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    instructorId: "",
    courseTopic: "",
    description: "",
  })

  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true)
      const resInstructors = await getAllInstructors(token)
      if (resInstructors) {
        setInstructors(resInstructors)
      }
      const resRequests = await getStudentCourseRequests(token)
      if (resRequests) {
        setRequests(resRequests)
      }
      setLoading(false)
    }
    fetchFormData()
  }, [token])

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const success = await createCourseRequest(formData, token)
    if (success) {
      setFormData({
        instructorId: "",
        courseTopic: "",
        description: "",
      })
      // Refresh requests
      const resRequests = await getStudentCourseRequests(token)
      if (resRequests) {
        setRequests(resRequests)
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-y-8">
      <h1 className="text-3xl font-medium text-richblack-5">Course Request</h1>

      <div className="rounded-md border border-richblack-700 bg-richblack-800 p-8 space-y-8">
        <p className="text-2xl font-semibold text-richblack-5">Request a Custom Course</p>

        <form onSubmit={handleOnSubmit} className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-2">
            <label htmlFor="instructorId" className="text-sm text-richblack-5">
              Select Instructor <sup className="text-pink-200">*</sup>
            </label>
            <select
              required
              name="instructorId"
              id="instructorId"
              value={formData.instructorId}
              onChange={handleOnChange}
              className="form-style"
            >
              <option value="" disabled>Choose an Instructor</option>
              {instructors?.map((inst) => (
                <option key={inst._id} value={inst._id}>
                  {inst.firstName} {inst.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-y-2">
            <label htmlFor="courseTopic" className="text-sm text-richblack-5">
              Course Topic <sup className="text-pink-200">*</sup>
            </label>
            <input
              required
              type="text"
              name="courseTopic"
              id="courseTopic"
              placeholder="e.g. Advanced System Design"
              value={formData.courseTopic}
              onChange={handleOnChange}
              className="form-style"
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label htmlFor="description" className="text-sm text-richblack-5">
              Why do you need this course? (Optional)
            </label>
            <textarea
              name="description"
              id="description"
              placeholder="Describe what you want to learn..."
              value={formData.description}
              onChange={handleOnChange}
              className="form-style min-h-[120px]"
            />
          </div>

          <div className="flex justify-end gap-x-2">
            <IconBtn
              type="submit"
              disabled={loading}
              text="Submit Request"
            />
          </div>
        </form>
      </div>

      <div className="rounded-md border border-richblack-700 bg-richblack-800 p-8">
        <p className="text-2xl font-semibold text-richblack-5 mb-6">Your Past Requests</p>
        {requests?.length === 0 ? (
          <p className="text-richblack-100 text-center">No course requests found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {requests.map((req) => (
              <div key={req._id} className="flex justify-between border border-richblack-700 rounded-md p-4 bg-richblack-900">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-semibold text-richblack-5">{req.courseTopic}</p>
                  <p className="text-sm text-richblack-300">Instructor: {req.instructor?.firstName} {req.instructor?.lastName}</p>
                  {req.description && (
                    <p className="text-sm text-richblack-200 line-clamp-2">{req.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                    ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      req.status === 'Accepted' ? 'bg-caribbeangreen-100 text-caribbeangreen-800' :
                        'bg-pink-100 text-pink-800'}`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
