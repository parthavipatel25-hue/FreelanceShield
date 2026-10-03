"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Trash2,
  Eye,
  RefreshCw,
  X,
  ArrowLeft,
  Wrench,
  LockKeyhole,
  UserX,
  Bell,
  KeyRound,
  Loader2,
  ClipboardCheck,
} from "lucide-react";

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

  resolution_action: string | null;
  resolution_note: string | null;

  created_at: string;
  updated_at: string;

  user_name: string | null;
  user_email: string | null;

  reviewer_name: string | null;
  resolver_name: string | null;

  review_note?: string | null;
}

interface RiskSummary {
  total_risks: string;
  open_risks: string;
  reviewed_risks: string;
  resolved_risks: string;

  critical_risks: string;
  high_risks: string;
  medium_risks: string;
  low_risks: string;
}

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

type ResolutionAction =
  | "reset_password"
  | "disable_account"
  | "unlock_account"
  | "notify_user"
  | "manual_fix";

export default function RiskManagementPage() {
  const router = useRouter();

  // ==================================================
  // USER
  // ==================================================

  const [user, setUser] = useState<User | null>(null);

  // ==================================================
  // DATA
  // ==================================================

  const [risks, setRisks] = useState<Risk[]>([]);
  const [summary, setSummary] = useState<RiskSummary | null>(null);

  // ==================================================
  // LOADING / MESSAGES
  // ==================================================

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================================================
  // FILTERS
  // ==================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // ==================================================
  // DETAILS MODAL
  // ==================================================

  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  // ==================================================
  // REVIEW MODAL
  // ==================================================

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRisk, setReviewRisk] = useState<Risk | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  // ==================================================
  // RESOLUTION MODAL
  // ==================================================

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionRisk, setResolutionRisk] = useState<Risk | null>(null);

  const [resolutionAction, setResolutionAction] = useState<
    ResolutionAction | ""
  >("");

  const [resolutionNote, setResolutionNote] = useState("");

  // ==================================================
  // GET LOGGED-IN USER
  // ==================================================

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

  // ==================================================
  // FETCH RISKS
  // ==================================================

  const fetchRisks = async () => {
    try {
      setLoading(true);
      setError("");

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
      console.error("FETCH RISKS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load risks."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // FETCH SUMMARY
  // ==================================================

  const fetchSummary = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/risks/summary"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load risk summary."
        );
      }

      setSummary(data.summary);
    } catch (error) {
      console.error(
        "FETCH RISK SUMMARY ERROR:",
        error
      );
    }
  };

  // ==================================================
  // INITIAL FETCH
  // ==================================================

  useEffect(() => {
    if (!user) return;

    fetchRisks();
    fetchSummary();
  }, [user]);

  // ==================================================
  // REFRESH
  // ==================================================

  const handleRefresh = async () => {
    setSuccess("");
    setError("");

    await Promise.all([
      fetchRisks(),
      fetchSummary(),
    ]);
  };

  // ==================================================
  // UPDATE RISK STATUS
  // ==================================================

  const updateRiskStatus = async (
    riskId: number,
    status: "open" | "reviewed" | "resolved",
    action?: string,
    note?: string
  ) => {
    if (!user) return;

    try {
      setActionLoading(riskId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:5000/api/risks/${riskId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            admin_id: user.id,

            resolution_action: action || null,

            resolution_note: note || null,

            review_note:
              status === "reviewed"
                ? note || null
                : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update risk."
        );
      }

      setRisks((currentRisks) =>
        currentRisks.map((risk) =>
          risk.id === riskId
            ? {
                ...risk,
                ...data.risk,
              }
            : risk
        )
      );

      setSelectedRisk((currentRisk) =>
        currentRisk && currentRisk.id === riskId
          ? {
              ...currentRisk,
              ...data.risk,
            }
          : currentRisk
      );

      setReviewRisk((currentRisk) =>
        currentRisk && currentRisk.id === riskId
          ? {
              ...currentRisk,
              ...data.risk,
            }
          : currentRisk
      );

      setResolutionRisk((currentRisk) =>
        currentRisk && currentRisk.id === riskId
          ? {
              ...currentRisk,
              ...data.risk,
            }
          : currentRisk
      );

      setSuccess(
        data.message ||
          "Risk updated successfully."
      );

      await fetchSummary();

      // Close review modal
      setShowReviewModal(false);
      setReviewRisk(null);
      setReviewNote("");

      // Close resolve modal
      setShowResolveModal(false);
      setResolutionRisk(null);
      setResolutionAction("");
      setResolutionNote("");
    } catch (error) {
      console.error(
        "UPDATE RISK ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update risk."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==================================================
  // OPEN REVIEW MODAL
  // ==================================================

  const openReviewModal = (risk: Risk) => {
    setError("");
    setSuccess("");

    setReviewRisk(risk);
    setReviewNote(risk.review_note || "");

    setShowReviewModal(true);
  };

  // ==================================================
  // CLOSE REVIEW MODAL
  // ==================================================

  const closeReviewModal = () => {
    if (actionLoading !== null) {
      return;
    }

    setShowReviewModal(false);
    setReviewRisk(null);
    setReviewNote("");
  };

  // ==================================================
  // CONFIRM REVIEW
  // ==================================================

  const handleConfirmReview = async () => {
    if (!reviewRisk) {
      return;
    }

    if (!reviewNote.trim()) {
      setError(
        "Please enter a review note."
      );

      return;
    }

    await updateRiskStatus(
      reviewRisk.id,
      "reviewed",
      undefined,
      reviewNote.trim()
    );
  };

  // ==================================================
  // OPEN RESOLVE MODAL
  // ==================================================

  const openResolveModal = (risk: Risk) => {
    setError("");
    setSuccess("");

    setResolutionRisk(risk);
    setResolutionAction("");
    setResolutionNote("");

    setShowResolveModal(true);
  };

  // ==================================================
  // CLOSE RESOLVE MODAL
  // ==================================================

  const closeResolveModal = () => {
    if (actionLoading !== null) {
      return;
    }

    setShowResolveModal(false);
    setResolutionRisk(null);
    setResolutionAction("");
    setResolutionNote("");
  };

  // ==================================================
  // CONFIRM RESOLUTION
  // ==================================================

  const handleConfirmResolution = async () => {
    if (!resolutionRisk) {
      return;
    }

    if (!resolutionAction) {
      setError(
        "Please select a resolution action."
      );

      return;
    }

    if (!resolutionNote.trim()) {
      setError(
        "Please enter a resolution note."
      );

      return;
    }

    await updateRiskStatus(
      resolutionRisk.id,
      "resolved",
      resolutionAction,
      resolutionNote.trim()
    );
  };

  // ==================================================
  // DELETE RISK
  // ==================================================

  const deleteRisk = async (riskId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this risk?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(riskId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:5000/api/risks/${riskId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete risk."
        );
      }

      setRisks((currentRisks) =>
        currentRisks.filter(
          (risk) => risk.id !== riskId
        )
      );

      if (selectedRisk?.id === riskId) {
        setSelectedRisk(null);
      }

      if (reviewRisk?.id === riskId) {
        setShowReviewModal(false);
        setReviewRisk(null);
      }

      if (resolutionRisk?.id === riskId) {
        setShowResolveModal(false);
        setResolutionRisk(null);
      }

      setSuccess(
        data.message ||
          "Risk deleted successfully."
      );

      await fetchSummary();
    } catch (error) {
      console.error(
        "DELETE RISK ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete risk."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==================================================
  // FILTER RISKS
  // ==================================================

  const filteredRisks = useMemo(() => {
    return risks.filter((risk) => {
      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        risk.title
          .toLowerCase()
          .includes(searchText) ||
        risk.description
          .toLowerCase()
          .includes(searchText) ||
        risk.risk_type
          .toLowerCase()
          .includes(searchText) ||
        (risk.user_name || "")
          .toLowerCase()
          .includes(searchText) ||
        (risk.user_email || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        risk.status === statusFilter;

      const matchesSeverity =
        severityFilter === "all" ||
        risk.severity === severityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSeverity
      );
    });
  }, [
    risks,
    search,
    statusFilter,
    severityFilter,
  ]);

  // ==================================================
  // SEVERITY STYLE
  // ==================================================

  const getSeverityClass = (
    severity: Risk["severity"]
  ) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";

      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";

      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ==================================================
  // STATUS STYLE
  // ==================================================

  const getStatusClass = (
    status: Risk["status"]
  ) => {
    switch (status) {
      case "open":
        return "bg-red-50 text-red-700 border-red-200";

      case "reviewed":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // ==================================================
  // RESOLUTION ACTION LABEL
  // ==================================================

  const getResolutionActionLabel = (
    action: string | null
  ) => {
    switch (action) {
      case "reset_password":
        return "Reset Password";

      case "disable_account":
        return "Disable Account";

      case "unlock_account":
        return "Unlock Account";

      case "notify_user":
        return "Notify User";

      case "manual_fix":
        return "Manual Fix";

      default:
        return "N/A";
    }
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (
    date: string | null
  ) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="mt-4 text-gray-600">
            Loading risk management...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 lg:px-8">

      {/* BACK TO DASHBOARD */}

      <div className="mb-5">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-gray-300
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-gray-700
            shadow-sm
            transition-all
            duration-200
            hover:border-emerald-500
            hover:bg-emerald-50
            hover:text-emerald-600
          "
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>
      </div>

      {/* HEADER */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <ShieldAlert
                size={25}
                className="text-emerald-600"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Risk Management
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Identify, review, resolve, and monitor platform risks.
              </p>
            </div>

          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-gray-300
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-gray-700
            transition
            hover:border-emerald-500
            hover:text-emerald-600
          "
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Risks
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {summary?.total_risks || "0"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
              <ShieldAlert
                size={22}
                className="text-purple-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Open Risks
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {summary?.open_risks || "0"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
              <AlertTriangle
                size={22}
                className="text-red-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Reviewed
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {summary?.reviewed_risks || "0"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <Clock
                size={22}
                className="text-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Resolved
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {summary?.resolved_risks || "0"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <CheckCircle2
                size={22}
                className="text-emerald-600"
              />
            </div>
          </div>
        </div>

      </div>

      {/* SEVERITY SUMMARY */}

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        <h2 className="text-lg font-bold text-gray-900">
          Risk Severity
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-semibold uppercase text-red-600">
              Critical
            </p>

            <p className="mt-1 text-2xl font-bold text-red-700">
              {summary?.critical_risks || "0"}
            </p>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-xs font-semibold uppercase text-orange-600">
              High
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-700">
              {summary?.high_risks || "0"}
            </p>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs font-semibold uppercase text-yellow-700">
              Medium
            </p>

            <p className="mt-1 text-2xl font-bold text-yellow-700">
              {summary?.medium_risks || "0"}
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase text-blue-600">
              Low
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-700">
              {summary?.low_risks || "0"}
            </p>
          </div>

        </div>
      </div>

      {/* FILTERS — UNCHANGED */}

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="relative">

            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search risks..."
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                bg-white
                py-2.5
                pl-10
                pr-4
                text-sm
                outline-none
                transition
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-100
              "
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-2.5
              text-sm
              text-gray-700
              outline-none
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-100
            "
          >
            <option value="all">
              All Statuses
            </option>

            <option value="open">
              Open
            </option>

            <option value="reviewed">
              Reviewed
            </option>

            <option value="resolved">
              Resolved
            </option>
          </select>

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value)
            }
            className="
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-2.5
              text-sm
              text-gray-700
              outline-none
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-100
            "
          >
            <option value="all">
              All Severities
            </option>

            <option value="critical">
              Critical
            </option>

            <option value="high">
              High
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="low">
              Low
            </option>
          </select>

        </div>

      </div>

      {/* ==================================================
          RISK RECORDS — LAYOUT KEPT
      ================================================== */}

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-5 py-4">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Risk Records
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredRisks.length} risk
                {filteredRisks.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>

          </div>

        </div>

        {filteredRisks.length === 0 && (
          <div className="px-5 py-14 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2
                size={28}
                className="text-emerald-600"
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No risks found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              No risk records match your current filters.
            </p>

          </div>
        )}

        {filteredRisks.length > 0 && (
          <div className="divide-y divide-gray-100">

            {filteredRisks.map((risk) => (

              <div
                key={risk.id}
                className="p-5 transition hover:bg-gray-50"
              >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                  {/* LEFT */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="text-base font-bold text-gray-900">
                        {risk.title}
                      </h3>

                      <span
                        className={`
                          rounded-full
                          border
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          capitalize
                          ${getSeverityClass(
                            risk.severity
                          )}
                        `}
                      >
                        {risk.severity}
                      </span>

                      <span
                        className={`
                          rounded-full
                          border
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          capitalize
                          ${getStatusClass(
                            risk.status
                          )}
                        `}
                      >
                        {risk.status}
                      </span>

                    </div>

                    <p className="mt-2 text-sm font-medium text-emerald-600">
                      {risk.risk_type}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                      {risk.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">

                      <span>
                        User:{" "}
                        <span className="font-medium text-gray-700">
                          {risk.user_name || "System"}
                        </span>
                      </span>

                      {risk.user_email && (
                        <span>
                          {risk.user_email}
                        </span>
                      )}

                      <span>
                        Created:{" "}
                        {formatDate(
                          risk.created_at
                        )}
                      </span>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex shrink-0 flex-wrap gap-2">

                    {/* VIEW */}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRisk(risk)
                      }
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-3
                        py-2
                        text-sm
                        font-medium
                        text-gray-700
                        transition
                        hover:border-emerald-500
                        hover:text-emerald-600
                      "
                    >
                      <Eye size={16} />
                      View
                    </button>

                    {/* REVIEW */}

                    {risk.status === "open" && (
                      <button
                        type="button"
                        disabled={
                          actionLoading === risk.id
                        }
                        onClick={() =>
                          openReviewModal(risk)
                        }
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-lg
                          border
                          border-blue-200
                          bg-blue-50
                          px-3
                          py-2
                          text-sm
                          font-medium
                          text-blue-700
                          transition
                          hover:bg-blue-100
                          disabled:opacity-50
                        "
                      >
                        <ClipboardCheck size={16} />
                        Review
                      </button>
                    )}

                    {/* RESOLVE */}

                    {risk.status !== "resolved" && (
                      <button
                        type="button"
                        disabled={
                          actionLoading === risk.id
                        }
                        onClick={() =>
                          openResolveModal(risk)
                        }
                        className="
                          rounded-lg
                          border
                          border-emerald-200
                          bg-emerald-50
                          px-3
                          py-2
                          text-sm
                          font-medium
                          text-emerald-700
                          transition
                          hover:bg-emerald-100
                          disabled:opacity-50
                        "
                      >
                        Resolve
                      </button>
                    )}

                    {/* REOPEN */}

                    {risk.status === "resolved" && (
                      <button
                        type="button"
                        disabled={
                          actionLoading === risk.id
                        }
                        onClick={() =>
                          updateRiskStatus(
                            risk.id,
                            "open"
                          )
                        }
                        className="
                          rounded-lg
                          border
                          border-orange-200
                          bg-orange-50
                          px-3
                          py-2
                          text-sm
                          font-medium
                          text-orange-700
                          transition
                          hover:bg-orange-100
                          disabled:opacity-50
                        "
                      >
                        Reopen
                      </button>
                    )}

                    {/* DELETE */}

                    <button
                      type="button"
                      disabled={
                        actionLoading === risk.id
                      }
                      onClick={() =>
                        deleteRisk(risk.id)
                      }
                      className="
                        flex
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-red-200
                        bg-white
                        px-3
                        py-2
                        text-red-600
                        transition
                        hover:bg-red-50
                        disabled:opacity-50
                      "
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

      {/* ==================================================
          VIEW DETAILS MODAL
      ================================================== */}

      {selectedRisk && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
          onClick={() =>
            setSelectedRisk(null)
          }
        >

          <div
            className="
              max-h-[90vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-gray-100 p-5">

              <div className="pr-4">

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedRisk.title}
                  </h2>

                  <span
                    className={`
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-xs
                      font-semibold
                      capitalize
                      ${getSeverityClass(
                        selectedRisk.severity
                      )}
                    `}
                  >
                    {selectedRisk.severity}
                  </span>

                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Risk #{selectedRisk.id}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRisk(null)
                }
                className="
                  rounded-lg
                  p-2
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-700
                "
              >
                <X size={20} />
              </button>

            </div>

            {/* BODY */}

            <div className="space-y-5 p-5">

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Risk Type
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {selectedRisk.risk_type}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Description
                </p>

                <p className="mt-1 leading-7 text-gray-700">
                  {selectedRisk.description}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Recommended Action
                </p>

                <p className="mt-1 leading-7 text-gray-700">
                  {selectedRisk.recommended_action ||
                    "No recommended action provided."}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-xs font-semibold uppercase text-gray-500">
                  Associated User
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {selectedRisk.user_name || "System"}
                </p>

                {selectedRisk.user_email && (
                  <p className="text-sm text-gray-500">
                    {selectedRisk.user_email}
                  </p>
                )}

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Status
                  </p>

                  <span
                    className={`
                      mt-2
                      inline-flex
                      rounded-full
                      border
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      capitalize
                      ${getStatusClass(
                        selectedRisk.status
                      )}
                    `}
                  >
                    {selectedRisk.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Created
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {formatDate(
                      selectedRisk.created_at
                    )}
                  </p>
                </div>

              </div>

              {/* REVIEW INFORMATION */}

              {selectedRisk.reviewed_by && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <p className="text-xs font-semibold uppercase text-blue-600">
                    Reviewed By
                  </p>

                  <p className="mt-1 font-semibold text-blue-900">
                    {selectedRisk.reviewer_name ||
                      "Administrator"}
                  </p>

                  <p className="mt-1 text-sm text-blue-700">
                    {formatDate(
                      selectedRisk.reviewed_at
                    )}
                  </p>

                  {selectedRisk.review_note && (
                    <div className="mt-3 border-t border-blue-200 pt-3">

                      <p className="text-xs font-semibold uppercase text-blue-600">
                        Review Note
                      </p>

                      <p className="mt-1 text-sm leading-6 text-blue-900">
                        {selectedRisk.review_note}
                      </p>

                    </div>
                  )}

                </div>
              )}

              {/* RESOLUTION INFORMATION */}

              {selectedRisk.status === "resolved" && (
                <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">

                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-600">
                      Resolution Action
                    </p>

                    <p className="mt-1 font-semibold text-emerald-900">
                      {getResolutionActionLabel(
                        selectedRisk.resolution_action
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-600">
                      Resolution Note
                    </p>

                    <p className="mt-1 leading-6 text-emerald-900">
                      {selectedRisk.resolution_note ||
                        "No resolution note provided."}
                    </p>
                  </div>

                  {selectedRisk.resolved_by && (
                    <div className="border-t border-emerald-200 pt-3">

                      <p className="text-xs font-semibold uppercase text-emerald-600">
                        Resolved By
                      </p>

                      <p className="mt-1 font-semibold text-emerald-900">
                        {selectedRisk.resolver_name ||
                          "Administrator"}
                      </p>

                      <p className="mt-1 text-sm text-emerald-700">
                        {formatDate(
                          selectedRisk.resolved_at
                        )}
                      </p>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* FOOTER */}

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 p-5">

              {selectedRisk.status === "open" && (
                <button
                  type="button"
                  disabled={
                    actionLoading ===
                    selectedRisk.id
                  }
                  onClick={() => {
                    setSelectedRisk(null);
                    openReviewModal(
                      selectedRisk
                    );
                  }}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-blue-600
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-700
                    disabled:opacity-50
                  "
                >
                  <ClipboardCheck size={17} />
                  Review Risk
                </button>
              )}

              {selectedRisk.status !== "resolved" && (
                <button
                  type="button"
                  disabled={
                    actionLoading ===
                    selectedRisk.id
                  }
                  onClick={() => {
                    setSelectedRisk(null);
                    openResolveModal(
                      selectedRisk
                    );
                  }}
                  className="
                    rounded-lg
                    bg-emerald-600
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-emerald-700
                    disabled:opacity-50
                  "
                >
                  Mark Resolved
                </button>
              )}

              {selectedRisk.status === "resolved" && (
                <button
                  type="button"
                  disabled={
                    actionLoading ===
                    selectedRisk.id
                  }
                  onClick={() =>
                    updateRiskStatus(
                      selectedRisk.id,
                      "open"
                    )
                  }
                  className="
                    rounded-lg
                    bg-orange-500
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-orange-600
                    disabled:opacity-50
                  "
                >
                  Reopen Risk
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedRisk(null)
                }
                className="
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                "
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================
          REVIEW RISK MODAL
      ================================================== */}

      {showReviewModal && reviewRisk && (
        <div
          className="
            fixed
            inset-0
            z-[60]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
          "
          onClick={closeReviewModal}
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-gray-100 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                  <ClipboardCheck
                    size={21}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Review Risk
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Review this security risk before deciding whether further action is required.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                disabled={
                  actionLoading !== null
                }
                className="
                  rounded-lg
                  p-2
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-700
                  disabled:opacity-50
                "
              >
                <X size={20} />
              </button>

            </div>

            {/* BODY */}

            <div className="space-y-5 p-5">

              {/* RISK */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                <div className="flex flex-wrap items-center gap-2">

                  <h3 className="font-semibold text-gray-900">
                    {reviewRisk.title}
                  </h3>

                  <span
                    className={`
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-xs
                      font-semibold
                      capitalize
                      ${getSeverityClass(
                        reviewRisk.severity
                      )}
                    `}
                  >
                    {reviewRisk.severity}
                  </span>

                </div>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {reviewRisk.description}
                </p>

              </div>

              {/* RISK TYPE */}

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Risk Type
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {reviewRisk.risk_type}
                </p>
              </div>

              {/* ASSOCIATED USER */}

              <div className="rounded-xl border border-gray-200 bg-white p-4">

                <p className="text-xs font-semibold uppercase text-gray-500">
                  Associated User
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {reviewRisk.user_name || "System"}
                </p>

                {reviewRisk.user_email && (
                  <p className="text-sm text-gray-500">
                    {reviewRisk.user_email}
                  </p>
                )}

              </div>

              {/* REVIEW NOTE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Review Note
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  value={reviewNote}
                  onChange={(event) =>
                    setReviewNote(
                      event.target.value
                    )
                  }
                  disabled={
                    actionLoading !== null
                  }
                  rows={5}
                  placeholder="Write what you found during the review..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-gray-700
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                    disabled:bg-gray-100
                  "
                />

                <p className="mt-2 text-xs text-gray-500">
                  Example: "Checked the user's login activity. Multiple failed attempts were detected, but no additional suspicious activity was found."
                </p>

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={closeReviewModal}
                disabled={
                  actionLoading !== null
                }
                className="
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReview}
                disabled={
                  actionLoading !== null ||
                  !reviewNote.trim()
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {actionLoading ===
                reviewRisk.id ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Reviewing...
                  </>
                ) : (
                  <>
                    <ClipboardCheck size={17} />
                    Mark as Reviewed
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================
          RESOLVE RISK MODAL
      ================================================== */}

      {showResolveModal && resolutionRisk && (
        <div
          className="
            fixed
            inset-0
            z-[60]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
          "
          onClick={closeResolveModal}
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-gray-100 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <Wrench
                    size={21}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Resolve Risk
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Select the corrective action and record what was done.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={closeResolveModal}
                disabled={
                  actionLoading !== null
                }
                className="
                  rounded-lg
                  p-2
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-700
                  disabled:opacity-50
                "
              >
                <X size={20} />
              </button>

            </div>

            {/* BODY */}

            <div className="space-y-5 p-5">

              {/* RISK */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                <div className="flex flex-wrap items-center gap-2">

                  <h3 className="font-semibold text-gray-900">
                    {resolutionRisk.title}
                  </h3>

                  <span
                    className={`
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-xs
                      font-semibold
                      capitalize
                      ${getSeverityClass(
                        resolutionRisk.severity
                      )}
                    `}
                  >
                    {resolutionRisk.severity}
                  </span>

                </div>

                <p className="mt-2 text-sm text-gray-600">
                  {resolutionRisk.description}
                </p>

              </div>

              {/* ACTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Resolution Action
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  value={resolutionAction}
                  onChange={(event) =>
                    setResolutionAction(
                      event.target.value as
                        | ResolutionAction
                        | ""
                    )
                  }
                  disabled={
                    actionLoading !== null
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-gray-700
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                    disabled:bg-gray-100
                  "
                >

                  <option value="">
                    Select resolution action
                  </option>

                  <option value="reset_password">
                    Reset Password
                  </option>

                  <option value="disable_account">
                    Disable Account
                  </option>

                  <option value="unlock_account">
                    Unlock Account
                  </option>

                  <option value="notify_user">
                    Notify User Only
                  </option>

                  <option value="manual_fix">
                    Manual Fix
                  </option>

                </select>

                <p className="mt-2 text-xs text-gray-500">
                  Choose the corrective action that was performed to resolve this risk.
                </p>

              </div>

              {/* ACTION DESCRIPTION */}

              {resolutionAction && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">

                  <div className="flex items-start gap-3">

                    {resolutionAction ===
                      "reset_password" && (
                      <KeyRound
                        size={19}
                        className="mt-0.5 text-emerald-600"
                      />
                    )}

                    {resolutionAction ===
                      "disable_account" && (
                      <UserX
                        size={19}
                        className="mt-0.5 text-emerald-600"
                      />
                    )}

                    {resolutionAction ===
                      "unlock_account" && (
                      <LockKeyhole
                        size={19}
                        className="mt-0.5 text-emerald-600"
                      />
                    )}

                    {resolutionAction ===
                      "notify_user" && (
                      <Bell
                        size={19}
                        className="mt-0.5 text-emerald-600"
                      />
                    )}

                    {resolutionAction ===
                      "manual_fix" && (
                      <Wrench
                        size={19}
                        className="mt-0.5 text-emerald-600"
                      />
                    )}

                    <p className="text-sm leading-6 text-emerald-800">

                      {resolutionAction ===
                        "reset_password" &&
                        "A temporary password will be generated and the user will be required to change it."}

                      {resolutionAction ===
                        "disable_account" &&
                        "The associated user's account will be disabled."}

                      {resolutionAction ===
                        "unlock_account" &&
                        "The associated user's account will be activated/unlocked."}

                      {resolutionAction ===
                        "notify_user" &&
                        "A security notification will be sent to the associated user."}

                      {resolutionAction ===
                        "manual_fix" &&
                        "The risk will be recorded as manually fixed by the administrator."}

                    </p>

                  </div>

                </div>
              )}

              {/* NOTE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Resolution Note
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  value={resolutionNote}
                  onChange={(event) =>
                    setResolutionNote(
                      event.target.value
                    )
                  }
                  disabled={
                    actionLoading !== null
                  }
                  rows={5}
                  placeholder="Explain what was done to resolve this risk..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-gray-700
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                    disabled:bg-gray-100
                  "
                />

                <p className="mt-2 text-xs text-gray-500">
                  This note will be saved with the risk and included in the activity history.
                </p>

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={closeResolveModal}
                disabled={
                  actionLoading !== null
                }
                className="
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleConfirmResolution
                }
                disabled={
                  actionLoading !== null ||
                  !resolutionAction ||
                  !resolutionNote.trim()
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-emerald-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-emerald-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {actionLoading ===
                resolutionRisk.id ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Confirm Resolution
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}