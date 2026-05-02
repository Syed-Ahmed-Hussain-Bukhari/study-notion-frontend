import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminUsers } from "../../../../services/operations/adminAPI";
import { FiSearch, FiFilter, FiUser } from "react-icons/fi";

const ROLE_STYLES = {
  Student: "bg-blue-500/20 text-blue-400",
  Instructor: "bg-violet-500/20 text-violet-400",
  Admin: "bg-amber-500/20 text-amber-400",
};

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { users, loading } = useSelector((s) => s.admin);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    dispatch(getAdminUsers(token));
  }, [dispatch, token]);

  const filtered = users.filter((u) => {
    if (u.accountType === "Admin") return false;
    const q = search.toLowerCase();
    const nameMatch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const roleMatch = roleFilter === "All" || u.accountType === roleFilter;
    return nameMatch && roleMatch;
  });

  const roleCounts = users.reduce((acc, u) => {
    if (u.accountType !== "Admin") {
      acc[u.accountType] = (acc[u.accountType] || 0) + 1;
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">All Users</h1>
        <p className="text-richblack-400 mt-1">
          {users.filter(u => u.accountType !== "Admin").length} registered members
        </p>
      </div>

      {/* Role Stats */}
      <div className="flex flex-wrap gap-3">
        {["Student", "Instructor"].map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(roleFilter === role ? "All" : role)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${roleFilter === role
                ? "border-violet-500 bg-violet-500/10 text-white"
                : "border-richblack-700 bg-richblack-800 text-richblack-300 hover:border-richblack-600"
              }`}
          >
            <span className={`w-2 h-2 rounded-full ${role === "Student" ? "bg-blue-400" : "bg-violet-400"
              }`} />
            {role}s
            <span className="ml-1 text-xs text-richblack-400">{roleCounts[role] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-richblack-800 border border-richblack-700 rounded-xl px-4 py-2 max-w-md">
        <FiSearch className="text-richblack-400" />
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-white text-sm placeholder:text-richblack-500 outline-none w-full"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-richblack-800 border border-richblack-700 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-richblack-700/60 border-b border-richblack-700">
                <th className="text-left py-4 px-5 text-richblack-300 font-medium">User</th>
                <th className="text-left py-4 px-5 text-richblack-300 font-medium">Email</th>
                <th className="text-center py-4 px-5 text-richblack-300 font-medium">Role</th>
                <th className="text-right py-4 px-5 text-richblack-300 font-medium">Courses</th>
                <th className="text-right py-4 px-5 text-richblack-300 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-richblack-400">
                    <FiUser className="text-4xl mx-auto mb-2 opacity-30" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user, idx) => (
                  <tr
                    key={user._id}
                    className={`border-b border-richblack-700/40 hover:bg-richblack-700/30 transition-colors ${idx % 2 === 0 ? "" : "bg-richblack-800/30"
                      }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.image ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}${user.lastName}`
                          }
                          alt={user.firstName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-white font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.about && (
                            <p className="text-richblack-500 text-xs max-w-[180px] truncate">
                              {user.about}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-richblack-300">{user.email}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold ${ROLE_STYLES[user.accountType] || "bg-richblack-700 text-richblack-300"
                          }`}
                      >
                        {user.accountType}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-richblack-300">
                      {user.courseCount}
                    </td>
                    <td className="py-3.5 px-5 text-right text-richblack-400 text-xs">
                      {new Date(user.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-richblack-700 text-richblack-400 text-xs">
            Showing {filtered.length} users
          </div>
        )}
      </div>
    </div>
  );
}
