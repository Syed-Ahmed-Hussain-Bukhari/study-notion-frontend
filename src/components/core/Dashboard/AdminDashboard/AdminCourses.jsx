import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminCourses } from "../../../../services/operations/adminAPI";
import { FiSearch, FiFilter, FiUsers, FiDollarSign, FiChevronUp, FiChevronDown } from "react-icons/fi";

const STATUS_COLORS = {
  Published: "bg-emerald-500/20 text-emerald-400",
  Draft: "bg-amber-500/20 text-amber-400",
};

export default function AdminCourses() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { courses, loading } = useSelector((s) => s.admin);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("revenue");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    dispatch(getAdminCourses(token));
  }, [dispatch, token]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  const filtered = courses
    .filter((c) => {
      const q = search.toLowerCase();
      const nameMatch = c.courseName?.toLowerCase().includes(q);
      const instrMatch = `${c.instructor?.firstName} ${c.instructor?.lastName}`.toLowerCase().includes(q);
      const statusMatch = statusFilter === "All" || c.status === statusFilter;
      return (nameMatch || instrMatch) && statusMatch;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "revenue") return (a.revenue - b.revenue) * dir;
      if (sortBy === "students") return (a.studentsCount - b.studentsCount) * dir;
      if (sortBy === "price") return (a.price - b.price) * dir;
      if (sortBy === "name") return a.courseName?.localeCompare(b.courseName) * dir;
      if (sortBy === "instructor") {
        const nameA = `${a.instructor?.firstName} ${a.instructor?.lastName}`;
        const nameB = `${b.instructor?.firstName} ${b.instructor?.lastName}`;
        return nameA.localeCompare(nameB) * dir;
      }
      if (sortBy === "category") return (a.category?.name || "").localeCompare(b.category?.name || "") * dir;
      if (sortBy === "status") return a.status.localeCompare(b.status) * dir;
      return 0;
    });

  const totalRevenue = filtered.reduce((acc, c) => acc + c.revenue, 0);
  const totalStudents = filtered.reduce((acc, c) => acc + c.studentsCount, 0);

  const SortIcon = ({ col }) => (
    <span className={`inline-block align-middle ml-1 ${sortBy === col ? "text-violet-400" : "text-richblack-600 opacity-100"}`}>
      {sortBy === col ? (sortDir === "asc" ? <FiChevronUp /> : <FiChevronDown />) : <FiChevronDown className="opacity-30" />}
    </span>
  );

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
          <h1 className="text-3xl font-bold text-white">All Courses</h1>
          <p className="text-richblack-400 mt-1">{filtered.length} courses found</p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-xl bg-richblack-800 border border-richblack-700 px-4 py-2 flex items-center gap-2">
            <FiDollarSign className="text-emerald-400" />
            <span className="text-white font-semibold">${totalRevenue.toLocaleString()}</span>
            <span className="text-richblack-400 text-xs">revenue</span>
          </div>
          <div className="rounded-xl bg-richblack-800 border border-richblack-700 px-4 py-2 flex items-center gap-2">
            <FiUsers className="text-violet-400" />
            <span className="text-white font-semibold">{totalStudents.toLocaleString()}</span>
            <span className="text-richblack-400 text-xs">students</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-richblack-800 border border-richblack-700 rounded-xl px-4 py-2 flex-1">
          <FiSearch className="text-richblack-400" />
          <input
            type="text"
            placeholder="Search courses or instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white text-sm placeholder:text-richblack-500 outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2 bg-richblack-800 border border-richblack-700 rounded-xl px-4 py-2">
          <FiFilter className="text-richblack-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-richblack-200 text-sm outline-none cursor-pointer"
          >
            <option value="All" className="bg-richblack-800">All Status</option>
            <option value="Published" className="bg-richblack-800">Published</option>
            <option value="Draft" className="bg-richblack-800">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-richblack-800 border border-richblack-700 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-richblack-700/60 border-b border-richblack-700">
                <th
                  className="text-left py-4 px-4 text-richblack-300 font-medium cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggleSort("name")}
                >
                  Course <SortIcon col="name" />
                </th>
                <th
                  className="text-left py-4 px-4 text-richblack-300 font-medium cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggleSort("instructor")}
                >
                  Instructor <SortIcon col="instructor" />
                </th>
                <th
                  className="text-left py-4 px-4 text-richblack-300 font-medium cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggleSort("category")}
                >
                  Category <SortIcon col="category" />
                </th>
                <th
                  className="text-right py-4 px-4 text-richblack-300 font-medium cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggleSort("students")}
                >
                  Students <SortIcon col="students" />
                </th>
                <th
                  className="text-right py-4 px-4 text-richblack-300 font-medium cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggleSort("price")}
                >
                  Price <SortIcon col="price" />
                </th>
                <th
                  className="text-right py-4 px-4 text-richblack-300 font-medium cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggleSort("revenue")}
                >
                  Revenue <SortIcon col="revenue" />
                </th>
                <th
                  className="text-center py-4 px-4 text-richblack-300 font-medium cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggleSort("status")}
                >
                  Status <SortIcon col="status" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-richblack-400">
                    No courses found
                  </td>
                </tr>
              ) : (
                filtered.map((course, idx) => (
                  <tr
                    key={course._id}
                    className={`border-b border-richblack-700/40 hover:bg-richblack-700/30 transition-colors ${
                      idx % 2 === 0 ? "" : "bg-richblack-800/50"
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail || "https://placehold.co/40x40/1e293b/6366f1?text=C"}
                          alt={course.courseName}
                          className="w-12 h-9 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate max-w-[200px]">
                            {course.courseName}
                          </p>
                          <p className="text-richblack-400 text-xs truncate max-w-[200px]">
                            {course.courseDescription}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <img
                          src={
                            course.instructor?.image ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${course.instructor?.firstName}`
                          }
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-richblack-200 text-sm">
                          {course.instructor?.firstName} {course.instructor?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-richblack-300 text-xs bg-richblack-700 px-2 py-1 rounded-lg whitespace-nowrap">
                        {course.category?.name || "—"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-richblack-200 font-medium">
                      {course.studentsCount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-richblack-200">
                      ${course.price.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-emerald-400">
                      ${course.revenue.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          STATUS_COLORS[course.status] || "bg-richblack-700 text-richblack-300"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
