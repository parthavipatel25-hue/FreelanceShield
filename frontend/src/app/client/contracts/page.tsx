"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  FileSignature,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  Loader2,
  RefreshCw,
  AlertCircle,
  Building2,
  Target,
} from "lucide-react";

// ==================================================
// TYPES
// ==================================================

interface UserData {
  id: number;
  fullname: string;
  email: string;
  role: "client";
}

interface Contract {
  id: number;
  project_id: number;
  proposal_id: number;
  client_id: number;
  freelancer_id: number;

  start_date: string;
  end_date?: string | null;

  amount: string | number;

  status: "active" | "completed" | "cancelled";

  created_at?: string;
  updated_at?: string;

  project_title?: string;
  project_description?: string;
  project_category?: string;

  project_status?: string;
  project_progress?: number;

  freelancer_name?: string;
  freelancer_email?: string;
}

// ==================================================
// PAGE
// ==================================================

export default function ClientContractsPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [selectedContractId, setSelectedContractId] =
    useState<number | null>(null);

  // ==================================================
  // GET USER
  // ==================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "client") {
        router.push("/login");
        return;
      }

      setUser(parsedUser);
    } catch (err) {
      console.error("Invalid user data:", err);
      router.push("/login");
    }
  }, [router]);

  // ==================================================
  // FETCH CONTRACTS
  // ==================================================

  const fetchContracts = async (
    showRefreshing = false
  ) => {
    if (!user) return;

    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `http://localhost:5000/api/contracts/client/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch contracts"
        );
      }

      const fetchedContracts: Contract[] = Array.isArray(data)
        ? data
        : data.contracts || [];

      setContracts(fetchedContracts);

      // Select first contract automatically
      if (fetchedContracts.length > 0) {
        setSelectedContractId((current) => {
          const exists = fetchedContracts.some(
            (contract) => contract.id === current
          );

          return exists
            ? current
            : fetchedContracts[0].id;
        });
      } else {
        setSelectedContractId(null);
      }
    } catch (err: any) {
      console.error("Fetch client contracts error:", err);

      setError(
        err.message ||
          "Something went wrong while loading contracts."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==================================================
  // LOAD CONTRACTS
  // ==================================================

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  // ==================================================
  // SELECTED CONTRACT
  // ==================================================

  const selectedContract = useMemo(() => {
    return contracts.find(
      (contract) => contract.id === selectedContractId
    );
  }, [contracts, selectedContractId]);

  // ==================================================
  // STATISTICS
  // ==================================================

  const stats = useMemo(() => {
    const active = contracts.filter(
      (contract) => contract.status === "active"
    ).length;

    const completed = contracts.filter(
      (contract) => contract.status === "completed"
    ).length;

    const cancelled = contracts.filter(
      (contract) => contract.status === "cancelled"
    ).length;

    const totalValue = contracts.reduce((total, contract) => {
      return total + Number(contract.amount || 0);
    }, 0);

    return {
      active,
      completed,
      cancelled,
      totalValue,
    };
  }, [contracts]);

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date?: string | null) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==================================================
  // FORMAT AMOUNT
  // ==================================================

  const formatAmount = (amount: string | number) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  };

  // ==================================================
  // PROJECT STATUS
  // ==================================================

  const getProjectStatus = (contract: Contract) => {
    if (contract.status === "completed") {
      return "Completed";
    }

    const status = contract.project_status?.toLowerCase();

    if (
      status === "in_progress" ||
      status === "in progress" ||
      status === "active"
    ) {
      return "In Progress";
    }

    if (status === "completed") {
      return "Completed";
    }

    if (status === "open") {
      return "Open";
    }

    if (status) {
      return contract.project_status as string;
    }

    return "In Progress";
  };

  // ==================================================
  // STATUS STYLE
  // ==================================================

  const getStatusStyles = (
    status: Contract["status"]
  ) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "completed":
        return "bg-teal-50 text-teal-700 border-teal-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <DashboardLayout role="client">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />

            <p className="text-sm font-medium text-gray-500">
              Loading your contracts...
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
    <DashboardLayout role="client">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
              <FileSignature size={17} />

              <span>Client Workspace</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              My Contracts
            </h1>

            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Manage your hired freelancers and track project
              progress.
            </p>
          </div>

          <button
            onClick={() => fetchContracts(true)}
            disabled={refreshing}
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl border border-gray-200 bg-white
              px-4 py-2.5 text-sm font-semibold text-gray-700
              shadow-sm transition-all
              hover:border-emerald-300
              hover:bg-emerald-50
              hover:text-emerald-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Active */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Contracts
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.active}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Currently ongoing
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Briefcase size={21} />
              </div>
            </div>
          </div>

          {/* Completed */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.completed}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Successfully completed
                </p>
              </div>

              <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
                <CheckCircle size={21} />
              </div>
            </div>
          </div>

          {/* Cancelled */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Cancelled
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.cancelled}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Cancelled contracts
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3 text-red-500">
                <Clock size={21} />
              </div>
            </div>
          </div>

          {/* Total Value */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  Contract Value
                </p>

                <p className="mt-2 truncate text-2xl font-bold text-gray-900">
                  {formatAmount(stats.totalValue)}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Total project value
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <DollarSign size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {contracts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FileSignature size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No Contracts Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              When you accept a freelancer&apos;s proposal,
              the contract will appear here.
            </p>

            <button
              onClick={() =>
                router.push("/client/proposals")
              }
              className="
                mt-6 inline-flex items-center gap-2
                rounded-xl bg-emerald-600
                px-5 py-3 text-sm font-semibold
                text-white shadow-sm
                transition-all hover:bg-emerald-700
              "
            >
              View Proposals
            </button>
          </div>
        ) : (
          /* ==================================================
             MAIN AREA
          ================================================== */

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            {/* ==================================================
                CONTRACT LIST
            ================================================== */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900">
                      Your Contracts
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      {contracts.length}{" "}
                      {contracts.length === 1
                        ? "contract"
                        : "contracts"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    {contracts.length}
                  </div>
                </div>
              </div>

              <div className="max-h-[700px] overflow-y-auto p-3">
                <div className="space-y-2">
                  {contracts.map((contract) => {
                    const isSelected =
                      selectedContractId === contract.id;

                    const progress =
                      Number(
                        contract.project_progress
                      ) || 0;

                    return (
                      <button
                        key={contract.id}
                        onClick={() =>
                          setSelectedContractId(
                            contract.id
                          )
                        }
                        className={`
                          w-full rounded-xl border p-4
                          text-left transition-all
                          ${
                            isSelected
                              ? "border-emerald-300 bg-emerald-50/60 shadow-sm"
                              : "border-gray-100 bg-white hover:border-emerald-200 hover:bg-gray-50"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-gray-400">
                              CONTRACT #{contract.id}
                            </span>

                            <h3 className="mt-2 truncate font-bold text-gray-900">
                              {contract.project_title ||
                                "Untitled Project"}
                            </h3>
                          </div>

                          <span
                            className={`
                              shrink-0 rounded-full border
                              px-2 py-1 text-[10px]
                              font-bold uppercase
                              ${getStatusStyles(
                                contract.status
                              )}
                            `}
                          >
                            {contract.status}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Progress
                          </span>

                          <span className="font-bold text-emerald-600">
                            {progress}%
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{
                              width: `${Math.min(
                                Math.max(progress, 0),
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="truncate text-xs text-gray-500">
                            {contract.freelancer_name ||
                              "Freelancer"}
                          </span>

                          <span className="text-sm font-bold text-gray-900">
                            {formatAmount(contract.amount)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ==================================================
                DETAILS
            ================================================== */}

            <div className="min-w-0">
              {selectedContract && (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {/* Header */}

                  <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50/80 to-teal-50/60 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          <FileSignature size={15} />

                          Contract #{selectedContract.id}
                        </div>

                        <h2 className="mt-2 break-words text-2xl font-bold text-gray-900">
                          {selectedContract.project_title ||
                            "Untitled Project"}
                        </h2>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedContract.project_category && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
                              <Briefcase size={13} />

                              {
                                selectedContract.project_category
                              }
                            </span>
                          )}

                          <span
                            className={`
                              rounded-full border
                              px-3 py-1.5 text-xs font-bold
                              ${getStatusStyles(
                                selectedContract.status
                              )}
                            `}
                          >
                            {selectedContract.status
                              .charAt(0)
                              .toUpperCase() +
                              selectedContract.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 rounded-2xl bg-white px-5 py-3 shadow-sm">
                        <p className="text-xs font-medium text-gray-400">
                          Contract Value
                        </p>

                        <p className="mt-1 text-xl font-bold text-emerald-700">
                          {formatAmount(
                            selectedContract.amount
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}

                  {selectedContract.project_description && (
                    <div className="border-b border-gray-100 p-6">
                      <h3 className="text-sm font-bold text-gray-900">
                        Project Description
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {
                          selectedContract.project_description
                        }
                      </p>
                    </div>
                  )}

                  {/* Information */}

                  <div className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Freelancer */}

                    <div className="bg-white p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                          <User size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">
                            Freelancer
                          </p>

                          <p className="mt-1 truncate text-sm font-bold text-gray-900">
                            {selectedContract.freelancer_name ||
                              "Freelancer"}
                          </p>

                          {selectedContract.freelancer_email && (
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              {
                                selectedContract.freelancer_email
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Start Date */}

                    <div className="bg-white p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                          <Calendar size={18} />
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Start Date
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-900">
                            {formatDate(
                              selectedContract.start_date
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Deadline */}

                    <div className="bg-white p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
                          <Clock size={18} />
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Deadline
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-900">
                            {formatDate(
                              selectedContract.end_date
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}

                    <div className="bg-white p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
                          <Target size={18} />
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Project Status
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-900">
                            {getProjectStatus(
                              selectedContract
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}

                  <div className="p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Project Progress
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Track the freelancer&apos;s current
                          project progress.
                        </p>
                      </div>

                      <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-emerald-50 text-xl font-bold text-emerald-700">
                        {Number(
                          selectedContract.project_progress
                        ) || 0}
                        %
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                Number(
                                  selectedContract.project_progress
                                ) || 0,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex justify-between text-[11px] font-medium text-gray-400">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Completion */}

                    {selectedContract.status ===
                      "completed" ||
                    Number(
                      selectedContract.project_progress
                    ) >= 100 ? (
                      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                          <CheckCircle size={23} />
                        </div>

                        <div>
                          <p className="font-bold text-teal-800">
                            Project Completed
                          </p>

                          <p className="mt-1 text-sm text-teal-700">
                            This project has been completed by
                            the freelancer.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <Clock size={21} />
                        </div>

                        <div>
                          <p className="font-bold text-emerald-800">
                            Project In Progress
                          </p>

                          <p className="mt-1 text-sm text-emerald-700">
                            Your freelancer is currently
                            working on this project.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}

                  <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                      <span>
                        Contract created{" "}
                        {formatDate(
                          selectedContract.created_at
                        )}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Building2 size={14} />

                        FreelanceShield Contract
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}