"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  User,
  Shield,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface LoggedInUser {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

interface ManagedUser {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
  account_status: "active" | "suspended" | "disabled";
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const router = useRouter();

  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Check authentication and admin access.
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: LoggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "admin") {
        router.push("/login");
        return;
      }

      setUser(loggedInUser);
    } catch {
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // Load users from the admin API.
  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session token is missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setNotice("");

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (search.trim()) params.set("search", search.trim());
      if (role) params.set("role", role);
      if (status) params.set("status", status);

      const response = await fetch(
        `http://localhost:5000/api/admin/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load users.");
      }

      setUsers(data.users || []);
      setPagination({
        page: data.pagination?.page ?? page,
        limit: data.pagination?.limit ?? 10,
        total: data.pagination?.total ?? 0,
        totalPages: Math.max(1, data.pagination?.totalPages ?? 1),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, [page, role, search, status]);

  useEffect(() => {
    if (user) {
      void fetchUsers();
    }
  }, [user, fetchUsers]);

  // Apply search and filters from the form.
  const handleApplyFilters = () => {
    setPage(1);
    setSearch(searchInput.trim());
    if (page === 1 && search === searchInput.trim()) {
      void fetchUsers();
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);

    if (page === 1 && !search && !role && !status) {
      void fetchUsers();
    }
  };

  // Update account status.
  const handleStatusChange = async (
    targetUser: ManagedUser,
    nextStatus: "active" | "suspended" | "disabled"
  ) => {
    const action = nextStatus === "active" ? "reactivate" : nextStatus;

    if (
      !window.confirm(
        `Are you sure you want to ${action} the account for ${targetUser.fullname}?`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session token is missing. Please log in again.");
      return;
    }

    try {
      setUpdatingId(targetUser.id);
      setError("");
      setNotice("");

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${targetUser.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ account_status: nextStatus }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update account status.");
      }

      setNotice(
        `${targetUser.fullname}'s account status was updated to ${nextStatus}.`
      );

      await fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update account status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleStyle = (value: string) => {
    switch (value) {
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

  const getStatusStyle = (value: string) => {
    switch (value) {
      case "active":
        return "bg-green-100 text-green-700";
      case "suspended":
        return "bg-amber-100 text-amber-700";
      case "disabled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Users size={25} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                User Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Search users and manage account access across FreelanceShield.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void fetchUsers()}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Matching Users</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {pagination.total}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                <UserCheck size={22} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Page</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {pagination.page} / {pagination.totalPages}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <Shield size={22} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Filter size={20} className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Search & Filters
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search users
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleApplyFilters();
                  }}
                  placeholder="Name or email address..."
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Account status
              </label>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
              Clear Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Registered Users
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {pagination.total} users found
              </p>
            </div>
            <Users size={22} className="text-emerald-600" />
          </div>

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
                <p className="mt-3 text-sm text-gray-500">
                  Loading users...
                </p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex min-h-[250px] items-center justify-center px-5">
              <div className="text-center">
                <UserX size={40} className="mx-auto text-gray-300" />
                <h3 className="mt-3 font-semibold text-gray-900">
                  No users found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try changing your search or filters.
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
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Joined
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {users.map((managedUser) => (
                    <tr
                      key={managedUser.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                            <User size={18} className="text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {managedUser.fullname}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {managedUser.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getRoleStyle(
                            managedUser.role
                          )}`}
                        >
                          {managedUser.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                            managedUser.account_status
                          )}`}
                        >
                          {managedUser.account_status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {formatDate(managedUser.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        {managedUser.id === user.id ? (
                          <span className="text-xs text-gray-400">
                            Current account
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {managedUser.account_status !== "active" && (
                              <button
                                type="button"
                                disabled={updatingId !== null}
                                onClick={() =>
                                  void handleStatusChange(
                                    managedUser,
                                    "active"
                                  )
                                }
                                className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                              >
                                {updatingId === managedUser.id
                                  ? "Updating..."
                                  : "Activate"}
                              </button>
                            )}

                            {managedUser.account_status !== "suspended" && (
                              <button
                                type="button"
                                disabled={updatingId !== null}
                                onClick={() =>
                                  void handleStatusChange(
                                    managedUser,
                                    "suspended"
                                  )
                                }
                                className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            )}

                            {managedUser.account_status !== "disabled" && (
                              <button
                                type="button"
                                disabled={updatingId !== null}
                                onClick={() =>
                                  void handleStatusChange(
                                    managedUser,
                                    "disabled"
                                  )
                                }
                                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                Disable
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && pagination.total > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Showing page {pagination.page} of {pagination.totalPages} ·{" "}
                {pagination.total} total users
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.totalPages, current + 1)
                    )
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
