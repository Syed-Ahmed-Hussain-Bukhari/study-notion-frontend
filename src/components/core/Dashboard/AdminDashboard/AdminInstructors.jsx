import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminInstructors } from "../../../../services/operations/adminAPI";
import { FiSearch, FiChevronDown, FiChevronUp, FiX, FiMail, FiBook, FiUsers, FiDollarSign } from "react-icons/fi";

const MEDAL = ["🥇", "🥈", "🥉"];

function InstructorModal({ instructor, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-richblack-800 rounded-2xl border border-richblack-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative p-6 border-b border-richblack-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-richblack-700 text-richblack-400 hover:text-white transition-colors"
          >
            <FiX />
          </button>
          <div className="flex items-center gap-4">
            <img
              src={
                instructor.image ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${instructor.firstName}`
              }
              alt={instructor.firstName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-violet-500"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {instructor.firstName} {instructor.lastName}
              </h2>
              <div className="flex items-center gap-1 mt-1 text-richblack-300 text-sm">
                <FiMail className="text-xs" />
                <span>{instructor.email}</span>
              </div>
              {instructor.about && (
                <p className="text-richblack-400 text-xs mt-1 max-w-md">{instructor.about}</p>
              )}
            </div>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Courses", val: instructor.totalCourses, color: "text-violet-400" },
              { label: "Students", val: instructor.totalStudents, color: "text-pink-400" },
              { label: "Revenue", val: `$${instructor.totalRevenue.toLocaleString()}`, color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-richblack-700/50 p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-richblack-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Courses */}
        <div className="p-6">
          <h3 className="text-white font-semibold mb-3">Courses Offered</h3>
          <div className="space-y-3">
            {instructor.courses.length === 0 ? (
              <p className="text-richblack-400 text-sm">No courses yet</p>
            ) : (
              instructor.courses.map((course) => (
                <div
                  key={course._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-richblack-700/40 hover:bg-richblack-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={course.thumbnail || "https://placehold.co/40x30/1e293b/6366f1?text=C"}
                      alt={course.courseName}
                      className="w-14 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">{course.courseName}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          course.status === "Published"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-richblack-300 text-xs">{course.studentsCount} students</p>
                    <p className="text-emerald-400 text-sm font-semibold">${course.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InstructorCard({ instructor, rank, onViewProfile }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-richblack-800 border border-richblack-700 overflow-hidden hover:border-violet-500/40 transition-all duration-300 shadow-lg">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  instructor.image ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${instructor.firstName}`
                }
                alt={instructor.firstName}
                className="w-14 h-14 rounded-2xl object-cover"
              />
              {rank < 3 && (
                <span className="absolute -top-2 -right-2 text-lg">{MEDAL[rank]}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold text-lg">
                  {instructor.firstName} {instructor.lastName}
                </h3>
                <span className="text-richblack-500 text-sm">#{rank + 1}</span>
              </div>
              <div className="flex items-center gap-1 text-richblack-400 text-sm mt-0.5">
                <FiMail className="text-xs" />
                <span>{instructor.email}</span>
              </div>
              {instructor.about && (
                <p className="text-richblack-400 text-xs mt-1 max-w-xs line-clamp-1">{instructor.about}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onViewProfile(instructor)}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors flex-shrink-0"
          >
            View Profile
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl bg-richblack-700/50 p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <FiBook className="text-violet-400 text-xs" />
              <span className="text-white font-bold text-sm">{instructor.totalCourses}</span>
            </div>
            <p className="text-richblack-400 text-xs">Courses</p>
          </div>
          <div className="rounded-xl bg-richblack-700/50 p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <FiUsers className="text-pink-400 text-xs" />
              <span className="text-white font-bold text-sm">{instructor.totalStudents}</span>
            </div>
            <p className="text-richblack-400 text-xs">Students</p>
          </div>
          <div className="rounded-xl bg-richblack-700/50 p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <FiDollarSign className="text-emerald-400 text-xs" />
              <span className="text-emerald-400 font-bold text-sm">
                ${instructor.totalRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-richblack-400 text-xs">Revenue</p>
          </div>
        </div>
      </div>

      {/* Expand Courses */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-3 bg-richblack-700/30 border-t border-richblack-700 text-richblack-300 hover:text-white text-sm transition-colors"
      >
        <span>View {instructor.totalCourses} course{instructor.totalCourses !== 1 ? "s" : ""}</span>
        {expanded ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {expanded && (
        <div className="p-4 border-t border-richblack-700 bg-richblack-900/20 space-y-2">
          {instructor.courses.length === 0 ? (
            <p className="text-richblack-400 text-sm text-center py-2">No courses</p>
          ) : (
            instructor.courses.map((course) => (
              <div
                key={course._id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-richblack-700/30 hover:bg-richblack-700/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={course.thumbnail || "https://placehold.co/36x27/1e293b/6366f1?text=C"}
                    alt={course.courseName}
                    className="w-12 h-8 rounded-lg object-cover"
                  />
                  <span className="text-white text-sm">{course.courseName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-richblack-300">{course.studentsCount} students</span>
                  <span className="text-emerald-400 font-medium">${course.revenue}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminInstructors() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { instructors, loading } = useSelector((s) => s.admin);

  const [search, setSearch] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  useEffect(() => {
    dispatch(getAdminInstructors(token));
  }, [dispatch, token]);

  const filtered = instructors.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.firstName?.toLowerCase().includes(q) ||
      i.lastName?.toLowerCase().includes(q) ||
      i.email?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = instructors.reduce((acc, i) => acc + i.totalRevenue, 0);
  const totalStudents = instructors.reduce((acc, i) => acc + i.totalStudents, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Instructors</h1>
          <p className="text-richblack-400 mt-1">
            {instructors.length} instructors · {totalStudents.toLocaleString()} total students
          </p>
        </div>
        <div className="rounded-xl bg-richblack-800 border border-richblack-700 px-4 py-2 flex items-center gap-2">
          <FiDollarSign className="text-emerald-400" />
          <span className="text-white font-semibold">${totalRevenue.toLocaleString()}</span>
          <span className="text-richblack-400 text-xs">platform total</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-richblack-800 border border-richblack-700 rounded-xl px-4 py-2 max-w-md">
        <FiSearch className="text-richblack-400" />
        <input
          type="text"
          placeholder="Search instructors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-white text-sm placeholder:text-richblack-500 outline-none w-full"
        />
      </div>

      {/* Top 3 Leaderboard */}
      {!search && instructors.length >= 3 && (
        <div className="rounded-2xl bg-gradient-to-br from-violet-900/30 to-richblack-800 border border-violet-500/20 p-6">
          <h2 className="text-white font-semibold text-lg mb-4">🏆 Top Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {instructors.slice(0, 3).map((ins, idx) => (
              <div
                key={ins._id}
                onClick={() => setSelectedInstructor(ins)}
                className={`rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-105 ${
                  idx === 0
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : idx === 1
                    ? "bg-slate-500/10 border border-slate-400/30"
                    : "bg-amber-700/10 border border-amber-700/30"
                }`}
              >
                <div className="text-3xl mb-2">{MEDAL[idx]}</div>
                <img
                  src={
                    ins.image ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${ins.firstName}`
                  }
                  alt={ins.firstName}
                  className="w-14 h-14 rounded-full object-cover mx-auto mb-2 ring-2 ring-offset-2 ring-offset-richblack-800"
                  style={{ ringColor: idx === 0 ? "#f59e0b" : idx === 1 ? "#94a3b8" : "#b45309" }}
                />
                <p className="text-white font-semibold text-sm">
                  {ins.firstName} {ins.lastName}
                </p>
                <p className="text-emerald-400 font-bold text-lg mt-1">
                  ${ins.totalRevenue.toLocaleString()}
                </p>
                <p className="text-richblack-400 text-xs">{ins.totalStudents} students</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Instructors Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-richblack-400">No instructors found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((instructor, idx) => (
            <InstructorCard
              key={instructor._id}
              instructor={instructor}
              rank={idx}
              onViewProfile={setSelectedInstructor}
            />
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {selectedInstructor && (
        <InstructorModal
          instructor={selectedInstructor}
          onClose={() => setSelectedInstructor(null)}
        />
      )}
    </div>
  );
}
