
"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, RefreshCw, FileText } from "lucide-react";
import DashboardLayout from "@/app/components/layout/DashboardLayout";

interface Report {
  id: number;
  reporter_id: number | null;
  reported_user_id: number | null;
  project_id: number | null;
  reason: string;
  description: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const REPORT_STATUSES = [
  "pending",
  "reviewing",
  "resolved",
  "dismissed",
] as const;

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(
    null
  );
  const [updateMessage, setUpdateMessage] = useState("");

  const fetchReports = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in as an administrator.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search,
        status,
        page: String(page),
        limit: "10",
      });

      const response = await fetch(
        `http://localhost:5000/api/admin/reports?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load reports.");
      }

      setReports(data.reports);
      setPagination(data.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusChange = async (
    reportId: number,
    newStatus: string
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in as an administrator.");
      return;
    }

    const previousReport = reports.find((report) => report.id === reportId);

    if (!previousReport || previousReport.status === newStatus) {
      return;
    }

    setUpdatingReportId(reportId);
    setError("");
    setUpdateMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/reports/${reportId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update report status.");
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === reportId
            ? { ...report, ...data.report }
            : report
        )
      );

      setUpdateMessage(`Report #${reportId} status updated to ${newStatus}.`);

      // Refresh the list so the current status filter and pagination stay accurate.
      await fetchReports();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update report status."
      );
    } finally {
      setUpdatingReportId(null);
    }
  };

  const statusLabel = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  const statusClasses = (value: string) => {
    switch (value) {
      case "pending":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "reviewing":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "resolved":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "dismissed":
        return "border-gray-200 bg-gray-100 text-gray-700";
      default:
        return "border-gray-200 bg-white text-gray-700";
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                <FileText className="text-emerald-600" size={30} />
                Report Management
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Review and monitor user and project reports.
              </p>
            </div>

            <button
              onClick={fetchReports}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {pagination.total}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Pending Reports (current page)
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {reports.filter((report) => report.status === "pending").length}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search report reason or description..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">All statuses</option>
              {REPORT_STATUSES.map((reportStatus) => (
                <option key={reportStatus} value={reportStatus}>
                  {statusLabel(reportStatus)}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {updateMessage && !error && (
            <div
              role="status"
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
            >
              {updateMessage}
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Report",
                      "Reporter ID",
                      "Reported User",
                      "Project ID",
                      "Status",
                      "Created",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-sm text-gray-500"
                      >
                        Loading reports...
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-sm text-gray-500"
                      >
                        No reports found.
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="max-w-xs px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            #{report.id} · {report.reason}
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {report.description}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                          {report.reporter_id ?? "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                          {report.reported_user_id ?? "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                          {report.project_id ?? "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <select
                            aria-label={`Status for report ${report.id}`}
                            value={report.status}
                            disabled={updatingReportId === report.id}
                            onChange={(event) =>
                              handleStatusChange(report.id, event.target.value)
                            }
                            className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-wait disabled:opacity-60 ${statusClasses(
                              report.status
                            )}`}
                          >
                            {REPORT_STATUSES.map((reportStatus) => (
                              <option
                                key={reportStatus}
                                value={reportStatus}
                              >
                                {statusLabel(reportStatus)}
                              </option>
                            ))}
                          </select>

                          {updatingReportId === report.id && (
                            <p className="mt-1 text-xs text-gray-500">
                              Updating...
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                          {report.created_at
                            ? new Date(report.created_at).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                {pagination.total === 0
                  ? "No reports"
                  : `Showing ${(page - 1) * pagination.limit + 1}–${Math.min(
                      page * pagination.limit,
                      pagination.total
                    )} of ${pagination.total} reports`}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((current) => current - 1)}
                  disabled={loading || page <= 1}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="px-2 text-sm text-gray-600">
                  Page {pagination.page} of{" "}
                  {Math.max(1, pagination.totalPages)}
                </span>

                <button
                  onClick={() => setPage((current) => current + 1)}
                  disabled={loading || page >= pagination.totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
