"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Shield,
  Clock,
} from "lucide-react";

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

interface ActivityLog {
  id: number;
  user_id: number | null;
  fullname: string | null;
  email: string | null;
  role: string | null;
  action: string;
  description: string | null;
  entity_type: string | null;
  entity_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AdminActivityLogsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [action, setAction] = useState("");

  const [role, setRole] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  // ============================================
  // CHECK ADMIN
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: User = JSON.parse(storedUser);

      if (loggedInUser.role !== "admin") {
        router.push("/login");
        return;
      }

      setUser(loggedInUser);
    } catch (error) {
      console.error("INVALID USER DATA:", error);

      localStorage.removeItem("user");

      router.push("/login");
    }
  }, [router]);

  // ============================================
  // FETCH ACTIVITY LOGS
  // ============================================

  const fetchActivityLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.append("admin_id", String(user.id));

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (action) {
        params.append("action", action);
      }

      if (role) {
        params.append("role", role);
      }

      if (startDate) {
        params.append("start_date", startDate);
      }

      if (endDate) {
        params.append("end_date", endDate);
      }

      const response = await fetch(
        `http://localhost:5000/api/admin-monitoring/activity-logs?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load activity logs."
        );
      }

      setActivities(data.activities || []);
    } catch (error) {
      console.error("FETCH ACTIVITY LOGS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load activity logs."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // INITIAL FETCH
  // ============================================

  useEffect(() => {
    if (!user) return;

    fetchActivityLogs();
  }, [user]);

  // ============================================
  // APPLY FILTERS
  // ============================================

  const handleApplyFilters = () => {
    fetchActivityLogs();
  };

  // ============================================
  // CLEAR FILTERS
  // ============================================

  const handleClearFilters = () => {
    setSearch("");
    setAction("");
    setRole("");
    setStartDate("");
    setEndDate("");

    setTimeout(() => {
      fetchActivityLogs();
    }, 0);
  };

  // ============================================
  // FORMAT DATE
  // ============================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ============================================
  // ACTION BADGE
  // ============================================

  const getActionStyle = (action: string) => {
    switch (action.toLowerCase()) {
      case "login":
        return "bg-green-100 text-green-700";

      case "logout":
        return "bg-gray-100 text-gray-700";

      case "create":
        return "bg-blue-100 text-blue-700";

      case "update":
        return "bg-yellow-100 text-yellow-700";

      case "delete":
        return "bg-red-100 text-red-700";

      default:
        return "bg-emerald-100 text-emerald-700";
    }
  };

  // ============================================
  // ROLE BADGE
  // ============================================

  const getRoleStyle = (role: string | null) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";

      case "freelancer":
        return "bg-blue-100 text-blue-700";

      case "client":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <DashboardLayout role="admin">
      <div className="w-full space-y-6">

        {/* ========================================
            HEADER
        ======================================== */}

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Activity
                size={25}
                className="text-emerald-600"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Activity Monitoring
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Monitor user and system activities across FreelanceShield.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================
            SUMMARY
        ======================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Activities
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {activities.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                <Activity
                  size={22}
                  className="text-emerald-600"
                />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Users
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {
                    new Set(
                      activities
                        .filter((activity) => activity.user_id !== null)
                        .map((activity) => activity.user_id)
                    ).size
                  }
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <User
                  size={22}
                  className="text-blue-600"
                />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Latest Activity
                </p>

                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {activities.length > 0
                    ? formatDate(activities[0].created_at)
                    : "No activity"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
                <Clock
                  size={22}
                  className="text-purple-600"
                />
              </div>

            </div>
          </div>

        </div>

        {/* ========================================
            FILTERS
        ======================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-2">

            <Filter
              size={20}
              className="text-emerald-600"
            />

            <h2 className="text-lg font-semibold text-gray-900">
              Filters
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">

            {/* SEARCH */}

            <div className="lg:col-span-2">

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search
              </label>

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search user, email, action..."
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

            </div>

            {/* ACTION */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Action
              </label>

              <select
                value={action}
                onChange={(e) =>
                  setAction(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">
                  All Actions
                </option>

                <option value="login">
                  Login
                </option>

                <option value="logout">
                  Logout
                </option>

                <option value="create">
                  Create
                </option>

                <option value="update">
                  Update
                </option>

                <option value="delete">
                  Delete
                </option>

              </select>

            </div>

            {/* ROLE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">
                  All Roles
                </option>

                <option value="admin">
                  Admin
                </option>

                <option value="freelancer">
                  Freelancer
                </option>

                <option value="client">
                  Client
                </option>

              </select>

            </div>

            {/* START DATE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Start Date
              </label>

              <div className="relative">

                <Calendar
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

            </div>

          </div>

          {/* END DATE + BUTTONS */}

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">

            <div className="w-full sm:max-w-xs">

              <label className="mb-2 block text-sm font-medium text-gray-700">
                End Date
              </label>

              <div className="relative">

                <Calendar
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

            </div>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Search size={17} />
              Apply Filters
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={17} />
              Clear
            </button>

          </div>

        </div>

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ========================================
            ACTIVITY TABLE
        ======================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-5 py-4">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Activity Logs
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {activities.length} activities found
                </p>
              </div>

              <Shield
                size={22}
                className="text-emerald-600"
              />

            </div>

          </div>

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

                <p className="mt-3 text-sm text-gray-500">
                  Loading activity logs...
                </p>

              </div>

            </div>
          ) : activities.length === 0 ? (
            <div className="flex min-h-[250px] items-center justify-center px-5">

              <div className="text-center">

                <Activity
                  size={40}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-3 font-semibold text-gray-900">
                  No activities found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Try changing your filters.
                </p>

              </div>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      User
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Description
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Entity
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date & Time
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {activities.map((activity) => (

                    <tr
                      key={activity.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* USER */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                            <User
                              size={18}
                              className="text-emerald-600"
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-gray-900">
                              {activity.fullname ||
                                "System"}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {activity.email ||
                                "System activity"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* ROLE */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleStyle(
                            activity.role
                          )}`}
                        >
                          {activity.role || "system"}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getActionStyle(
                            activity.action
                          )}`}
                        >
                          {activity.action}
                        </span>

                      </td>

                      {/* DESCRIPTION */}

                      <td className="max-w-xs px-5 py-4">

                        <p className="truncate text-sm text-gray-600">
                          {activity.description ||
                            "No description"}
                        </p>

                      </td>

                      {/* ENTITY */}

                      <td className="px-5 py-4">

                        {activity.entity_type ? (
                          <div className="text-sm">

                            <p className="font-medium text-gray-800">
                              {activity.entity_type}
                            </p>

                            {activity.entity_id && (
                              <p className="text-xs text-gray-500">
                                ID: {activity.entity_id}
                              </p>
                            )}

                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            —
                          </span>
                        )}

                      </td>

                      {/* DATE */}

                      <td className="whitespace-nowrap px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <Clock
                            size={15}
                            className="text-gray-400"
                          />

                          {formatDate(
                            activity.created_at
                          )}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}