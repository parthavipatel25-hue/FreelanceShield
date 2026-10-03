"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";

interface SecurityReport {
  id: number;
  user_id: number | null;
  fullname: string | null;
  email: string | null;
  role: string | null;
  attempted_email?: string | null;
  event_type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  status: "open" | "investigating" | "resolved" | "dismissed";
  resolved_by: number | null;
  resolved_at: string | null;
  created_at: string;
}

interface Risk {
  id: number;
  user_id: number | null;
  security_report_id: number | null;
  risk_type: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  recommended_action: string | null;
  status: "open" | "reviewed" | "resolved";
  reviewed_by: number | null;
  reviewed_at: string | null;
  resolved_by: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  user_name: string | null;
  user_email: string | null;
  reviewer_name: string | null;
  resolver_name: string | null;
}

interface Summary {
  total_reports: number;
  open_reports: number;
  investigating_reports: number;
  resolved_reports: number;
  critical_reports: number;
}

export default function SecurityReportsPage() {
  const router = useRouter();

  const [reports, setReports] = useState<SecurityReport[]>([]);

  const [risks, setRisks] = useState<Risk[]>([]);

  const [summary, setSummary] = useState<Summary>({
    total_reports: 0,
    open_reports: 0,
    investigating_reports: 0,
    resolved_reports: 0,
    critical_reports: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [severityFilter, setSeverityFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedReport, setSelectedReport] =
    useState<SecurityReport | null>(null);

  // ==================================================
  // CHECK ADMIN
  // ==================================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "admin") {
        router.push("/login");
      }
    } catch (error) {
      console.error(
        "INVALID USER DATA:",
        error
      );

      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // ==================================================
  // FETCH SECURITY REPORTS
  // ==================================================

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/security-reports"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load security reports."
        );
      }

      setReports(data.reports || []);
    } catch (error) {
      console.error(
        "FETCH SECURITY REPORTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load security reports."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // FETCH SECURITY SUMMARY
  // ==================================================

  const fetchSummary = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/security-reports/summary"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load security summary."
        );
      }

      setSummary(data.summary);
    } catch (error) {
      console.error(
        "FETCH SECURITY SUMMARY ERROR:",
        error
      );
    }
  };

  // ==================================================
  // FETCH RISKS
  // ==================================================

  const fetchRisks = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/risks"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load risks."
        );
      }

      setRisks(data.risks || []);
    } catch (error) {
      console.error(
        "FETCH RISKS FOR SECURITY REPORTS ERROR:",
        error
      );

      // Do not break the Security Reports page
      // if risk loading fails.
      setRisks([]);
    }
  };

  // ==================================================
  // INITIAL FETCH
  // ==================================================

  useEffect(() => {
    fetchReports();
    fetchSummary();
    fetchRisks();
  }, []);

  // ==================================================
  // REFRESH
  // ==================================================

  const handleRefresh = async () => {
    await Promise.all([
      fetchReports(),
      fetchSummary(),
      fetchRisks(),
    ]);
  };

  // ==================================================
  // FILTER REPORTS
  // ==================================================

  const filteredReports = reports.filter(
    (report) => {
      const severityMatch =
        severityFilter === "all" ||
        report.severity === severityFilter;

      const statusMatch =
        statusFilter === "all" ||
        report.status === statusFilter;

      return severityMatch && statusMatch;
    }
  );

  // ==================================================
  // FIND RELATED RISK
  // ==================================================

  const getRelatedRisk = (
    reportId: number
  ) => {
    return risks.find(
      (risk) =>
        Number(risk.security_report_id) ===
        Number(reportId)
    );
  };

  // ==================================================
  // SEVERITY STYLE
  // ==================================================

  const getSeverityStyle = (
    severity: string
  ) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";

      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";

      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "low":
        return "bg-green-100 text-green-700 border-green-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ==================================================
  // STATUS STYLE
  // ==================================================

  const getStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case "open":
        return "bg-red-50 text-red-600 border-red-200";

      case "investigating":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "resolved":
        return "bg-green-50 text-green-700 border-green-200";

      case "dismissed":
        return "bg-gray-100 text-gray-600 border-gray-200";

      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // ==================================================
  // RISK STATUS STYLE
  // ==================================================

  const getRiskStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case "open":
        return "bg-red-50 text-red-700 border-red-200";

      case "reviewed":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "resolved":
        return "bg-green-50 text-green-700 border-green-200";

      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

            <p className="mt-4 text-gray-600">
              Loading security reports...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <DashboardLayout role="admin">
      <div className="w-full">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <ShieldAlert
                  size={25}
                  className="text-red-600"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Security Reports
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Review security events and their
                  recorded details.
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* TOTAL */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Reports
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {summary.total_reports}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <ShieldAlert
                  size={21}
                  className="text-blue-600"
                />
              </div>

            </div>
          </div>

          {/* OPEN */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Open
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {summary.open_reports}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                <AlertCircle
                  size={21}
                  className="text-red-600"
                />
              </div>

            </div>
          </div>

          {/* INVESTIGATING */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Investigating
                </p>

                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {summary.investigating_reports}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100">
                <Clock
                  size={21}
                  className="text-yellow-600"
                />
              </div>

            </div>
          </div>

          {/* RESOLVED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Resolved
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {summary.resolved_reports}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle
                  size={21}
                  className="text-green-600"
                />
              </div>

            </div>
          </div>

          {/* CRITICAL */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Critical
                </p>

                <p className="mt-2 text-3xl font-bold text-red-700">
                  {summary.critical_reports}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle
                  size={21}
                  className="text-red-600"
                />
              </div>

            </div>
          </div>

        </div>

        {/* ==================================================
            FILTER REPORTS
            KEEPING YOUR EXISTING FILTER BOX
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-gray-900">
              Filter Reports
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Filter security events by severity or status.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* SEVERITY */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Severity
              </label>

              <select
                value={severityFilter}
                onChange={(e) =>
                  setSeverityFilter(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">
                  All Severities
                </option>

                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="critical">
                  Critical
                </option>
              </select>

            </div>

            {/* STATUS */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="open">
                  Open
                </option>

                <option value="investigating">
                  Investigating
                </option>

                <option value="resolved">
                  Resolved
                </option>

                <option value="dismissed">
                  Dismissed
                </option>
              </select>

            </div>

          </div>

        </div>

        {/* ==================================================
            REPORTS
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-5 py-5">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Security Events
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredReports.length} report
                  {filteredReports.length !== 1
                    ? "s"
                    : ""}{" "}
                  displayed
                </p>

              </div>

            </div>

          </div>

          {/* EMPTY */}

          {filteredReports.length === 0 && (
            <div className="p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <ShieldAlert
                  size={30}
                  className="text-gray-400"
                />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                No security reports found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                There are no reports matching the selected filters.
              </p>

            </div>
          )}

          {/* ==================================================
              DESKTOP TABLE
          ================================================== */}

          {filteredReports.length > 0 && (
            <div className="hidden overflow-x-auto lg:block">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Event
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      User
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Severity
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      IP Address
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredReports.map((report) => (

                    <tr
                      key={report.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* EVENT */}

                      <td className="px-5 py-4">

                        <p className="font-medium text-gray-900">
                          {report.event_type}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-sm text-gray-500">
                          {report.description ||
                            "No description"}
                        </p>

                      </td>

                      {/* USER */}

                      <td className="px-5 py-4">

                        <p className="font-medium text-gray-900">
                          {report.user_id
                            ? report.fullname ||
                              "Unknown User"
                            : "Unknown User"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {report.user_id
                            ? report.email || "-"
                            : report.attempted_email ||
                              "-"}
                        </p>

                      </td>

                      {/* SEVERITY */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getSeverityStyle(
                            report.severity
                          )}`}
                        >
                          {report.severity}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>

                      </td>

                      {/* IP */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {report.ip_address || "-"}
                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {new Date(
                          report.created_at
                        ).toLocaleString()}
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedReport(
                              report
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Eye size={15} />

                          View Details
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

          {/* ==================================================
              MOBILE / TABLET CARDS
          ================================================== */}

          {filteredReports.length > 0 && (
            <div className="space-y-4 p-4 lg:hidden">

              {filteredReports.map((report) => (

                <div
                  key={report.id}
                  className="rounded-xl border border-gray-200 p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <h3 className="font-semibold text-gray-900">
                        {report.event_type}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {report.description ||
                          "No description"}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getSeverityStyle(
                        report.severity
                      )}`}
                    >
                      {report.severity}
                    </span>

                  </div>

                  <div className="mt-4 space-y-2 text-sm">

                    <div>
                      <span className="font-medium text-gray-700">
                        User:
                      </span>{" "}
                      <span className="text-gray-500">
                        {report.user_id
                          ? report.fullname ||
                            "Unknown User"
                          : report.attempted_email ||
                            "Unknown User"}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">
                        IP:
                      </span>{" "}
                      <span className="text-gray-500">
                        {report.ip_address || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">
                        Date:
                      </span>{" "}
                      <span className="text-gray-500">
                        {new Date(
                          report.created_at
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">
                        Status:
                      </span>{" "}
                      <span
                        className={`ml-1 inline-flex rounded-full border px-2 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedReport(report)
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Eye size={16} />

                    View Details
                  </button>

                </div>

              ))}

            </div>
          )}

        </div>

      </div>

      {/* ==================================================
          SECURITY REPORT DETAILS MODAL
      ================================================== */}

      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setSelectedReport(null)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-gray-200 p-6">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                    <ShieldAlert
                      size={22}
                      className="text-red-600"
                    />
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-gray-900">
                      Security Report #{selectedReport.id}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Security event details
                    </p>

                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReport(null)
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="space-y-6 p-6">

              {/* EVENT + SEVERITY */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Event
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {selectedReport.event_type}
                  </p>

                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Severity
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getSeverityStyle(
                      selectedReport.severity
                    )}`}
                  >
                    {selectedReport.severity}
                  </span>

                </div>

              </div>

              {/* USER */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  User Information
                </h3>

                <div className="rounded-xl border border-gray-200 p-4">

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>

                      <p className="text-xs text-gray-500">
                        Name
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {selectedReport.user_id
                          ? selectedReport.fullname ||
                            "Unknown User"
                          : "Unknown User"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Email
                      </p>

                      <p className="mt-1 break-all font-medium text-gray-900">
                        {selectedReport.user_id
                          ? selectedReport.email ||
                            "-"
                          : selectedReport.attempted_email ||
                            "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Role
                      </p>

                      <p className="mt-1 font-medium capitalize text-gray-900">
                        {selectedReport.role ||
                          "Unknown"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        User ID
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {selectedReport.user_id ||
                          "Unknown"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* TECHNICAL DETAILS */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Technical Details
                </h3>

                <div className="rounded-xl border border-gray-200 p-4">

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>

                      <p className="text-xs text-gray-500">
                        IP Address
                      </p>

                      <p className="mt-1 break-all font-medium text-gray-900">
                        {selectedReport.ip_address ||
                          "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Status
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                          selectedReport.status
                        )}`}
                      >
                        {selectedReport.status}
                      </span>

                    </div>

                    <div className="sm:col-span-2">

                      <p className="text-xs text-gray-500">
                        User Agent
                      </p>

                      <p className="mt-1 break-all text-sm text-gray-700">
                        {selectedReport.user_agent ||
                          "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Created At
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {new Date(
                          selectedReport.created_at
                        ).toLocaleString()}
                      </p>

                    </div>

                    {selectedReport.resolved_at && (
                      <div>

                        <p className="text-xs text-gray-500">
                          Resolved At
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {new Date(
                            selectedReport.resolved_at
                          ).toLocaleString()}
                        </p>

                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Description
                </h3>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                  <p className="text-sm leading-6 text-gray-700">
                    {selectedReport.description ||
                      "No description was provided for this security event."}
                  </p>

                </div>

              </div>

              {/* ==================================================
                  RELATED RISK
              ================================================== */}

              {(() => {
                const relatedRisk =
                  getRelatedRisk(
                    selectedReport.id
                  );

                if (!relatedRisk) {
                  return (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                      <div className="flex items-start gap-3">

                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-200">
                          <AlertCircle
                            size={18}
                            className="text-gray-600"
                          />
                        </div>

                        <div>

                          <p className="font-semibold text-gray-900">
                            No Related Risk
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            This security report does not
                            currently have a related risk
                            in Risk Management.
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }

                return (
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                          <AlertTriangle
                            size={19}
                            className="text-orange-600"
                          />
                        </div>

                        <div>

                          <p className="font-semibold text-gray-900">
                            Related Risk
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            Risk #{relatedRisk.id}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getRiskStatusStyle(
                          relatedRisk.status
                        )}`}
                      >
                        {relatedRisk.status}
                      </span>

                    </div>

                    <div className="mt-4">

                      <p className="font-semibold text-gray-900">
                        {relatedRisk.title}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {relatedRisk.description}
                      </p>

                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <span
                        className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getSeverityStyle(
                          relatedRisk.severity
                        )}`}
                      >
                        {relatedRisk.severity} risk
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/admin/risk-management?riskId=${relatedRisk.id}`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                      >
                        View Risk

                        <ExternalLink
                          size={15}
                        />
                      </button>

                    </div>

                  </div>
                );
              })()}

            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  setSelectedReport(null)
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </DashboardLayout>
  );
}