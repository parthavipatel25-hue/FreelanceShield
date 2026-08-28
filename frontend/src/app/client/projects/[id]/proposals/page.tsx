"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import DashboardLayout from "../../../../components/layout/DashboardLayout";

import {
  ArrowLeft,
  User,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";

interface UserData {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

interface Proposal {
  id: number;
  project_id: number;
  freelancer_id: number;
  cover_letter: string;
  proposed_budget: number;
  delivery_time: number;
  status: "pending" | "accepted" | "rejected";
  fullname: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export default function ClientProjectProposalsPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = params.id;

  const [user, setUser] = useState<UserData | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  // ============================================
  // CHECK LOGGED-IN CLIENT
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: UserData = JSON.parse(storedUser);

      if (loggedInUser.role !== "client") {
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
  // FETCH PROPOSALS
  // ============================================

  useEffect(() => {
    if (!user || !projectId) return;

    const fetchProposals = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/proposals/project/${projectId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load proposals."
          );
        }

        setProposals(data.proposals || []);
      } catch (error) {
        console.error("FETCH PROPOSALS ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load proposals."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [user, projectId]);

  // ============================================
  // ACCEPT PROPOSAL
  // ============================================

  const handleAccept = async (proposalId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to accept this proposal? Other pending proposals for this project will be rejected."
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(proposalId);
      setError("");
      setActionMessage("");

      const response = await fetch(
        `http://localhost:5000/api/proposals/${proposalId}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to accept proposal."
        );
      }

      setActionMessage(
        "Proposal accepted successfully. The freelancer has been hired."
      );

      // Refresh proposals so accepted/rejected statuses are current
      const refreshResponse = await fetch(
        `http://localhost:5000/api/proposals/project/${projectId}`
      );

      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok && refreshData.success) {
        setProposals(refreshData.proposals || []);
      }
    } catch (error) {
      console.error("ACCEPT PROPOSAL ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to accept proposal."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================
  // REJECT PROPOSAL
  // ============================================

  const handleReject = async (proposalId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this proposal?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(proposalId);
      setError("");
      setActionMessage("");

      const response = await fetch(
        `http://localhost:5000/api/proposals/${proposalId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to reject proposal."
        );
      }

      setActionMessage(
        "Proposal rejected successfully."
      );

      setProposals((current) =>
        current.map((proposal) =>
          proposal.id === proposalId
            ? {
                ...proposal,
                status: "rejected",
              }
            : proposal
        )
      );
    } catch (error) {
      console.error("REJECT PROPOSAL ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to reject proposal."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="mt-4 text-gray-600">
            Loading proposals...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <DashboardLayout role="client">
      <div className="w-full">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.push(`/client/projects/${projectId}`)
          }
          className="
            mb-6
            flex
            items-center
            gap-2
            text-sm
            font-medium
            text-gray-600
            transition
            hover:text-emerald-600
          "
        >
          <ArrowLeft size={18} />
          Back to Project
        </button>

        {/* HEADER */}

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <FileText
                size={22}
                className="text-emerald-600"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Project Proposals
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Review freelancers who applied for this project.
              </p>
            </div>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}

        {actionMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {actionMessage}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* NO PROPOSALS */}

        {!error && proposals.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <FileText
                size={30}
                className="text-gray-400"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No proposals yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              No freelancers have submitted a proposal for this
              project yet.
            </p>

          </div>
        )}

        {/* PROPOSALS */}

        {proposals.length > 0 && (
          <div className="space-y-5">

            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-5
                  shadow-sm
                  sm:p-6
                "
              >

                {/* FREELANCER HEADER */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <User
                        size={24}
                        className="text-emerald-600"
                      />
                    </div>

                    <div>

                      <h2 className="text-lg font-bold text-gray-900">
                        {proposal.fullname}
                      </h2>

                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                        <Mail size={15} />
                        {proposal.email}
                      </div>

                    </div>

                  </div>

                  {/* STATUS */}

                  <span
                    className={`
                      h-fit
                      w-fit
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      ${
                        proposal.status === "accepted"
                          ? "bg-emerald-100 text-emerald-700"
                          : proposal.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    `}
                  >
                    {proposal.status}
                  </span>

                </div>

                {/* COVER LETTER */}

                <div className="mt-5 rounded-xl bg-gray-50 p-4">

                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    Cover Letter
                  </p>

                  <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                    {proposal.cover_letter}
                  </p>

                </div>

                {/* PROPOSAL INFORMATION */}

                <div
                  className="
                    mt-5
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                  "
                >

                  {/* PROPOSED BUDGET */}

                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <DollarSign
                        size={20}
                        className="text-emerald-600"
                      />
                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Proposed Budget
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        $
                        {Number(
                          proposal.proposed_budget
                        ).toFixed(2)}
                      </p>

                    </div>

                  </div>

                  {/* DELIVERY TIME */}

                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Clock
                        size={20}
                        className="text-blue-600"
                      />
                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Delivery Time
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {proposal.delivery_time} days
                      </p>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                {proposal.status === "pending" && (
                  <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                    {/* VIEW PROFILE */}

                    <button
                      type="button"
                      onClick={() => {
                        router.push(
                          `/client/freelancers/${proposal.freelancer_id}`
                        );
                      }}
                      className="
                        rounded-xl
                        border
                        border-gray-300
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-gray-700
                        transition
                        hover:bg-gray-50
                      "
                    >
                      View Profile
                    </button>

                    {/* REJECT */}

                    <button
                      type="button"
                      onClick={() =>
                        handleReject(proposal.id)
                      }
                      disabled={processingId !== null}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-red-200
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-red-600
                        transition
                        hover:bg-red-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <XCircle size={17} />
                      Reject
                    </button>

                    {/* ACCEPT */}

                    <button
                      type="button"
                      onClick={() =>
                        handleAccept(proposal.id)
                      }
                      disabled={processingId !== null}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-emerald-600
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-emerald-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <CheckCircle size={17} />

                      {processingId === proposal.id
                        ? "Processing..."
                        : "Accept"}
                    </button>

                  </div>
                )}

                {/* ALREADY PROCESSED */}

                {proposal.status === "accepted" && (
                  <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-5 text-sm font-medium text-emerald-600">
                    <CheckCircle size={18} />
                    This freelancer has been hired for this project.
                  </div>
                )}

                {proposal.status === "rejected" && (
                  <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-5 text-sm font-medium text-red-500">
                    <XCircle size={18} />
                    This proposal was rejected.
                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}