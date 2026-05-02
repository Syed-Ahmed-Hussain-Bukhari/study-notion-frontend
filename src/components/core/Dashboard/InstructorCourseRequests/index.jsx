import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {
  getInstructorCourseRequests,
  updateCourseRequestStatus,
} from "../../../../services/operations/courseRequestAPI"

export default function InstructorCourseRequests() {
  const { token } = useSelector((state) => state.auth)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      const res = await getInstructorCourseRequests(token)
      if (res) {
        setRequests(res)
      }
      setLoading(false)
    }
    fetchRequests()
  }, [token])

  const handleUpdateStatus = async (requestId, status) => {
    const success = await updateCourseRequestStatus({ requestId, status }, token)
    if (success) {
      setRequests((prev) => 
        prev.map((req) => 
          req._id === requestId ? { ...req, status } : req
        )
      )
    }
  }

  return (
    <div className="flex flex-col gap-y-8">
      <h1 className="text-3xl font-medium text-richblack-5">Course Requests</h1>

      <div className="rounded-md border border-richblack-700 bg-richblack-800 p-8">
        <p className="text-2xl font-semibold text-richblack-5 mb-6">Incoming Requests</p>
        
        {loading ? (
          <div className="spinner mx-auto"></div>
        ) : requests?.length === 0 ? (
          <p className="text-richblack-100 text-center">No incoming course requests.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {requests.map((req) => (
              <div key={req._id} className="flex flex-col md:flex-row justify-between border border-richblack-700 rounded-md p-6 bg-richblack-900 gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src={req.student?.image} 
                      alt="student" 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                    <div>
                      <p className="text-md font-medium text-richblack-5">
                        {req.student?.firstName} {req.student?.lastName}
                      </p>
                      <p className="text-xs text-richblack-300">{req.student?.email}</p>
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-yellow-50">{req.courseTopic}</p>
                  {req.description && (
                    <p className="text-sm text-richblack-100 mt-2 bg-richblack-800 p-3 rounded-md">
                      {req.description}
                    </p>
                  )}
                  <p className="text-xs text-richblack-400 mt-2">
                    Requested on: {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col md:items-end justify-center gap-3">
                  <div className="mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                      ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        req.status === 'Accepted' ? 'bg-caribbeangreen-100 text-caribbeangreen-800' : 
                        'bg-pink-100 text-pink-800'}`}>
                      Status: {req.status}
                    </span>
                  </div>
                  
                  {req.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(req._id, "Accepted")}
                        className="bg-caribbeangreen-200 text-caribbeangreen-800 font-semibold px-4 py-2 rounded-md hover:bg-caribbeangreen-300 transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req._id, "Rejected")}
                        className="bg-pink-200 text-pink-800 font-semibold px-4 py-2 rounded-md hover:bg-pink-300 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
