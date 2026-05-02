import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminDashboardStats } from "../../../../services/operations/adminAPI";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { FiUsers, FiBook, FiDollarSign, FiUserCheck } from "react-icons/fi";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CHART_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#a855f7",
];

const KpiCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-richblack-800 border border-richblack-700 p-6 flex flex-col gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="text-2xl text-white" />
    </div>
    <div>
      <p className="text-richblack-300 text-sm font-medium">{label}</p>
      <p className="text-white text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-richblack-400 text-xs mt-1">{sub}</p>}
    </div>
    <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 ${color}`} />
  </div>
);

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { stats, loading } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(getAdminDashboardStats(token));
  }, [dispatch, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-richblack-300 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { kpis, instructorRevenue, recentCourses } = stats;

  const pieData = {
    labels: instructorRevenue.slice(0, 8).map((i) => i.name),
    datasets: [
      {
        data: instructorRevenue.slice(0, 8).map((i) => i.revenue),
        backgroundColor: CHART_COLORS,
        borderColor: "#1f2937",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const barData = {
    labels: instructorRevenue.slice(0, 8).map((i) => i.name),
    datasets: [
      {
        label: "Students",
        data: instructorRevenue.slice(0, 8).map((i) => i.studentCount),
        backgroundColor: CHART_COLORS.map((c) => c + "cc"),
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
      y: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#d1d5db", font: { size: 12 }, padding: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` $${ctx.parsed.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="w-full px-6 py-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-richblack-400 mt-1">Platform overview and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard
          icon={FiDollarSign}
          label="Total Revenue"
          value={`$${kpis.totalRevenue.toLocaleString()}`}
          sub="Across all courses"
          color="bg-violet-600"
        />
        <KpiCard
          icon={FiUsers}
          label="Total Students"
          value={kpis.totalStudents.toLocaleString()}
          sub="Registered learners"
          color="bg-pink-600"
        />
        <KpiCard
          icon={FiUserCheck}
          label="Instructors"
          value={kpis.totalInstructors.toLocaleString()}
          sub="Active educators"
          color="bg-amber-500"
        />
        <KpiCard
          icon={FiBook}
          label="Total Courses"
          value={kpis.totalCourses.toLocaleString()}
          sub="Published & drafts"
          color="bg-emerald-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="rounded-2xl bg-richblack-800 border border-richblack-700 p-6 shadow-lg">
          <h2 className="text-white font-semibold text-lg mb-1">Revenue by Instructor</h2>
          <p className="text-richblack-400 text-xs mb-5">Income distribution across top educators</p>
          {instructorRevenue.length > 0 ? (
            <div className="max-h-72 flex items-center justify-center">
              <Pie data={pieData} options={pieOptions} />
            </div>
          ) : (
            <p className="text-richblack-400 text-sm text-center py-10">No revenue data yet</p>
          )}
        </div>

        {/* Bar Chart */}
        <div className="rounded-2xl bg-richblack-800 border border-richblack-700 p-6 shadow-lg">
          <h2 className="text-white font-semibold text-lg mb-1">Students per Instructor</h2>
          <p className="text-richblack-400 text-xs mb-5">Enrollment distribution</p>
          {instructorRevenue.length > 0 ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <p className="text-richblack-400 text-sm text-center py-10">No enrollment data yet</p>
          )}
        </div>
      </div>

      {/* Top Instructors */}
      <div className="rounded-2xl bg-richblack-800 border border-richblack-700 p-6 shadow-lg">
        <h2 className="text-white font-semibold text-lg mb-4">🏆 Top Instructors by Revenue</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-richblack-700">
                <th className="text-left py-2 px-3 text-richblack-400 font-medium">Rank</th>
                <th className="text-left py-2 px-3 text-richblack-400 font-medium">Instructor</th>
                <th className="text-right py-2 px-3 text-richblack-400 font-medium">Courses</th>
                <th className="text-right py-2 px-3 text-richblack-400 font-medium">Students</th>
                <th className="text-right py-2 px-3 text-richblack-400 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {instructorRevenue.map((ins, idx) => (
                <tr
                  key={ins.instructorId}
                  className="border-b border-richblack-700/50 hover:bg-richblack-700/30 transition-colors"
                >
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold text-base ${
                        idx === 0
                          ? "text-amber-400"
                          : idx === 1
                          ? "text-slate-300"
                          : idx === 2
                          ? "text-amber-600"
                          : "text-richblack-400"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={ins.image || `https://api.dicebear.com/7.x/initials/svg?seed=${ins.name}`}
                        alt={ins.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-white font-medium">{ins.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-richblack-300">{ins.courseCount}</td>
                  <td className="py-3 px-3 text-right text-richblack-300">{ins.studentCount}</td>
                  <td className="py-3 px-3 text-right font-semibold text-emerald-400">
                    ${ins.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="rounded-2xl bg-richblack-800 border border-richblack-700 p-6 shadow-lg">
        <h2 className="text-white font-semibold text-lg mb-4">🆕 Recently Added Courses</h2>
        <div className="space-y-3">
          {recentCourses.map((course) => (
            <div
              key={course._id}
              className="flex items-center justify-between p-3 rounded-xl bg-richblack-700/40 hover:bg-richblack-700/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{course.courseName}</p>
                  <p className="text-richblack-400 text-xs">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-richblack-300 text-xs">{course.studentsEnrolled?.length || 0} students</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    course.status === "Published"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {course.status}
                </span>
                <span className="text-emerald-400 text-sm font-semibold">
                  ${course.price || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
