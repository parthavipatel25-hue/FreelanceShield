"use client";
import { BASE_URL } from '@/lib/api'


import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  KeyRound,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  X,
  User,
  Mail,
  CalendarDays,
  ShieldCheck,
  Loader2,
} from "lucide-react";

// =========================================
// TYPES
// =========================================

type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

interface ResetRequest {
  id: number;
  user_id: number;
  fullname?: string;
  user_fullname?: string;
  email: string;
  status: RequestStatus;
  rejection_reason?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  completed_at?: string | null;
}

type FilterStatus = "all" | RequestStatus;

const API_URL = `${BASE_URL}/api/password-reset`;

// =========================================
// MAIN COMPONENT
// =========================================

export default function PasswordResetRequestsPage() {
  const router = useRouter();

  // =========================================
  // STATES
  // =========================================

  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [token, setToken] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const [activeFilter, setActiveFilter] =
    useState<FilterStatus>("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ResetRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Details modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsRequest, setDetailsRequest] =
    useState<ResetRequest | null>(null);

  // Action loading
  const [actionLoading, setActionLoading] = useState<number | null>(
    null
  );

  // =========================================
  // ADMIN AUTHENTICATION
  // =========================================

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedUser || !storedToken) {
      router.replace("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "admin") {
        router.replace("/login");
        return;
      }

      setToken(storedToken);
      setAuthorized(true);
    } catch (error) {
      console.error("ADMIN AUTHENTICATION ERROR:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      router.replace("/login");
    }
  }, [router]);

  // =========================================
  // FETCH PASSWORD RESET REQUESTS
  // =========================================

  const fetchRequests = useCallback(
    async (showRefresh = false) => {
      if (!token) return;

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${API_URL}/admin/requests`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            data.message || "Your admin session is invalid. Please log in again."
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load password reset requests."
          );
        }

        setRequests(
          Array.isArray(data.requests) ? data.requests : []
        );
      } catch (err) {
        console.error("FETCH PASSWORD RESET REQUESTS ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  // =========================================
  // LOAD REQUESTS AFTER AUTHENTICATION
  // =========================================

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
useEffect(() => {
    if (authorized && token) {
      fetchRequests();
    }
  }, [authorized, token, fetchRequests]);

  // =========================================
  // APPROVE REQUEST
  // =========================================

  const handleApprove = async (request: ResetRequest) => {
    const confirmed = window.confirm(
      `Are you sure you want to approve the password reset request for ${request.email}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(request.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/admin/requests/${request.id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to approve the request."
        );
      }

      setSuccess(
        `Password reset request for ${request.email} approved successfully.`
      );

      await fetchRequests(true);
    } catch (err) {
      console.error("APPROVE REQUEST ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve the request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================
  // OPEN REJECT MODAL
  // =========================================

  const openRejectModal = (request: ResetRequest) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setRejectModalOpen(true);
    setError("");
    setSuccess("");
  };

  // =========================================
  // REJECT REQUEST
  // =========================================

  const handleReject = async () => {
    if (!selectedRequest) return;

    const reason = rejectionReason.trim();

    if (!reason) {
      setError("Please enter a reason for rejecting this request.");
      return;
    }

    if (reason.length > 500) {
      setError("Rejection reason cannot exceed 500 characters.");
      return;
    }

    try {
      setActionLoading(selectedRequest.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/admin/requests/${selectedRequest.id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to reject the request."
        );
      }

      setSuccess(
        `Password reset request for ${selectedRequest.email} rejected.`
      );

      setRejectModalOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");

      await fetchRequests(true);
    } catch (err) {
      console.error("REJECT REQUEST ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to reject the request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================
  // FILTER COUNTS
  // =========================================

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  // =========================================
  // FILTER AND SEARCH
  // =========================================

  const filteredRequests = requests.filter((request) => {
    const matchesStatus =
      activeFilter === "all" || request.status === activeFilter;

    const name =
      request.fullname || request.user_fullname || "";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date?: string | null) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================
  // STATUS STYLING
  // =========================================

  const getStatusStyle = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "approved":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return Clock;

      case "approved":
        return CheckCircle;

      case "rejected":
        return XCircle;

      case "completed":
        return ShieldCheck;

      default:
        return AlertCircle;
    }
  };

  // =========================================
  // FILTER OPTIONS
  // =========================================

  const filters: {
    label: string;
    value: FilterStatus;
    count: number;
  }[] = [
    { label: "All Requests", value: "all", count: counts.all },
    { label: "Pending", value: "pending", count: counts.pending },
    { label: "Approved", value: "approved", count: counts.approved },
    { label: "Rejected", value: "rejected", count: counts.rejected },
    { label: "Completed", value: "completed", count: counts.completed },
  ];

  // =========================================
  // LOADING PAGE
  // =========================================

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  // =========================================
  // MAIN UI
  // =========================================

  return (
    <DashboardLayout role="admin">
      <div className="w-full space-y-6">

        {/* PAGE HEADER */}

        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <KeyRound size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Password Reset Requests
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Review and manage user password reset requests.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchRequests(true)}
            disabled={refreshing || loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh Requests
          </button>
        </section>

        {/* SUCCESS MESSAGE */}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle size={20} className="mt-0.5 shrink-0" />
            <p>{success}</p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto"
              aria-label="Close success message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto"
              aria-label="Close error message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* STATISTICS CARDS */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* PENDING */}

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Requests
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {loading ? "..." : counts.pending}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock size={24} />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Waiting for admin review
            </p>
          </div>

          {/* APPROVED */}

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Approved Requests
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {loading ? "..." : counts.approved}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle size={24} />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Approved by administrator
            </p>
          </div>

          {/* REJECTED */}

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Rejected Requests
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {loading ? "..." : counts.rejected}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <XCircle size={24} />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Requests not approved
            </p>
          </div>

          {/* COMPLETED */}

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed Requests
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {loading ? "..." : counts.completed}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={24} />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Password successfully changed
            </p>
          </div>
        </section>

        {/* REQUEST MANAGEMENT */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* SECTION HEADER */}

          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  All Password Reset Requests
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review the status and details of user requests.
                </p>
              </div>

              {/* SEARCH */}

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* FILTER TABS */}

            <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    activeFilter === filter.value
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {filter.label}

                  <span
                    className={`rounded-md px-2 py-0.5 text-xs ${
                      activeFilter === filter.value
                        ? "bg-white/20 text-white"
                        : "bg-white text-gray-600"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* REQUEST LIST */}

          {loading ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <Loader2
                size={34}
                className="animate-spin text-emerald-600"
              />

              <p className="mt-4 text-sm font-medium text-gray-600">
                Loading password reset requests...
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <KeyRound size={30} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-gray-800">
                No requests found
              </h3>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                {searchTerm
                  ? "No requests match your search. Try another name or email."
                  : activeFilter === "all"
                    ? "There are currently no password reset requests."
                    : `There are no ${activeFilter} password reset requests.`}
              </p>

              {(searchTerm || activeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveFilter("all");
                  }}
                  className="mt-5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        User
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Request Date
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredRequests.map((request) => {
                      const StatusIcon = getStatusIcon(request.status);

                      const displayName =
                        request.fullname ||
                        request.user_fullname ||
                        "User";

                      return (
                        <tr
                          key={request.id}
                          className="transition hover:bg-gray-50/70"
                        >
                          {/* USER */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                                {displayName.charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {displayName}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  {request.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* DATE */}

                          <td className="px-6 py-5">
                            <p className="text-sm text-gray-700">
                              {formatDate(request.created_at)}
                            </p>
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                                request.status
                              )}`}
                            >
                              <StatusIcon size={14} />
                              {request.status}
                            </span>
                          </td>

                          {/* ACTIONS */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailsRequest(request);
                                  setDetailsModalOpen(true);
                                }}
                                title="View details"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                              >
                                <Eye size={17} />
                              </button>

                              {request.status === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={actionLoading === request.id}
                                    onClick={() => handleApprove(request)}
                                    title="Approve request"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50"
                                  >
                                    {actionLoading === request.id ? (
                                      <Loader2
                                        size={17}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle size={17} />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={actionLoading === request.id}
                                    onClick={() => openRejectModal(request)}
                                    title="Reject request"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                                  >
                                    <XCircle size={17} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE REQUEST CARDS */}

              <div className="space-y-4 p-4 md:hidden">
                {filteredRequests.map((request) => {
                  const StatusIcon = getStatusIcon(request.status);

                  const displayName =
                    request.fullname ||
                    request.user_fullname ||
                    "User";

                  return (
                    <div
                      key={request.id}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                            {displayName.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {displayName}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {request.email}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold capitalize ${getStatusStyle(
                            request.status
                          )}`}
                        >
                          <StatusIcon size={12} />
                          {request.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                        <CalendarDays size={15} />
                        {formatDate(request.created_at)}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailsRequest(request);
                            setDetailsModalOpen(true);
                          }}
                          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Eye size={15} />
                          View Details
                        </button>

                        {request.status === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={actionLoading === request.id}
                              onClick={() => handleApprove(request)}
                              className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <CheckCircle size={15} />
                              Approve
                            </button>

                            <button
                              type="button"
                              disabled={actionLoading === request.id}
                              onClick={() => openRejectModal(request)}
                              className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              <XCircle size={15} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* FOOTER */}

          {!loading && filteredRequests.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {filteredRequests.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {requests.length}
                </span>{" "}
                requests
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ========================================= */}
      {/* REJECT REQUEST MODAL */}
      {/* ========================================= */}

      {rejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <XCircle size={25} />
              </div>

              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close reject modal"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Reject Password Reset Request
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              You are rejecting the password reset request from{" "}
              <span className="font-semibold text-gray-800">
                {selectedRequest.email}
              </span>
              . Please provide a reason.
            </p>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Rejection Reason
              </label>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejecting this request..."
                rows={4}
                maxLength={500}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {rejectionReason.length}/500 characters
              </p>
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectModalOpen(false);
                  setError("");
                }}
                disabled={actionLoading !== null}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={
                  actionLoading !== null ||
                  !rejectionReason.trim()
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading === selectedRequest.id ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle size={17} />
                    Reject Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* REQUEST DETAILS MODAL */}
      {/* ========================================= */}

      {detailsModalOpen && detailsRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Request Details
              </h2>

              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <User size={22} />
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {detailsRequest.fullname ||
                      detailsRequest.user_fullname ||
                      "User"}
                  </p>

                  <p className="text-xs text-gray-500">
                    User ID: {detailsRequest.user_id}
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-xl bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 text-gray-400" />

                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="mt-1 break-all text-sm font-medium text-gray-800">
                      {detailsRequest.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays
                    size={18}
                    className="mt-0.5 text-gray-400"
                  />

                  <div>
                    <p className="text-xs text-gray-500">Request Date</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {formatDate(detailsRequest.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 text-gray-400" />

                  <div>
                    <p className="text-xs text-gray-500">Current Status</p>

                    <span
                      className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                        detailsRequest.status
                      )}`}
                    >
                      {detailsRequest.status}
                    </span>
                  </div>
                </div>

                {detailsRequest.reviewed_at && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Reviewed Date
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {formatDate(detailsRequest.reviewed_at)}
                    </p>
                  </div>
                )}

                {detailsRequest.completed_at && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Completed Date
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {formatDate(detailsRequest.completed_at)}
                    </p>
                  </div>
                )}

                {detailsRequest.rejection_reason && (
                  <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                    <p className="text-xs font-semibold text-red-700">
                      Rejection Reason
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      {detailsRequest.rejection_reason}
                    </p>
                  </div>
                )}
              </div>

              {detailsRequest.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDetailsModalOpen(false);
                      openRejectModal(detailsRequest);
                    }}
                    className="flex-1 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDetailsModalOpen(false);
                      handleApprove(detailsRequest);
                    }}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
