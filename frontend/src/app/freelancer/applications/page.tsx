"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  ArrowLeft,
  FileText,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  BriefcaseBusiness,
  Eye,
} from "lucide-react";

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

interface Application {
  id: number;
  project_id: number;
  freelancer_id: number;
  cover_letter: string;
  proposed_budget: string | number;
  delivery_time: number;
  status: "pending" | "accepted" | "rejected";
  created_at?: string;
  updated_at?: string;
  project_title: string;
  project_category: string;
}

export default function FreelancerApplicationsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // CHECK LOGGED-IN FREELANCER
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: User = JSON.parse(storedUser);

      if (loggedInUser.role !== "freelancer") {
        router.push("/login");
        return;
      }

      setUser(loggedInUser);
    } catch (error) {
      console.error("INVALID USER DATA:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      router.push("/login");
    }
  }, [router]);

  // ============================================
  // FETCH APPLICATIONS
  // ============================================

  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/proposals/freelancer/${user.id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load applications."
          );
        }

        setApplications(data.proposals || []);
      } catch (error) {
        console.error("FETCH APPLICATIONS ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load applications."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  // ============================================
  // VIEW PROJECT
  // ============================================

  const handleViewProject = (projectId: number) => {
    router.push(
      `/freelancer/browse-projects/${projectId}`
    );
  };

  // ============================================
  // STATUS HELPERS
  // ============================================

  const getStatusClasses = (
    status: Application["status"]
  ) => {
    if (status === "accepted") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusLabel = (
    status: Application["status"]
  ) => {
    if (status === "accepted") {
      return "Accepted";
    }

    if (status === "rejected") {
      return "Rejected";
    }

    return "Pending";
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
            Loading your applications...
          </p>

        </div>
      </div>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <DashboardLayout role="freelancer">

      <div className="w-full">

        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <div className="mb-6">

          <button
            type="button"
            onClick={() =>
              router.push("/freelancer")
            }
            className="
              mb-4
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
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <FileText
                size={22}
                className="text-emerald-600"
              />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                My Applications
              </h1>

              <p className="mt-1 text-gray-500">
                Track all the proposals you have submitted.
              </p>

            </div>

          </div>

        </div>

        {/* ====================================== */}
        {/* ERROR */}
        {/* ====================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* ====================================== */}
        {/* EMPTY STATE */}
        {/* ====================================== */}

        {!error && applications.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <BriefcaseBusiness
                size={30}
                className="text-emerald-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No applications yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              You haven't submitted any proposals yet.
              Browse projects and apply to jobs that match your skills.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/freelancer/browse-projects"
                )
              }
              className="
                mt-5
                rounded-xl
                bg-emerald-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-emerald-700
              "
            >
              Browse Projects
            </button>

          </div>
        )}

        {/* ====================================== */}
        {/* APPLICATION LIST */}
        {/* ====================================== */}

        {applications.length > 0 && (
          <div className="space-y-5">

            {applications.map(
              (application) => (
                <div
                  key={application.id}
                  className="
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    p-5
                    shadow-sm
                    transition
                    hover:shadow-md
                    sm:p-6
                  "
                >

                  {/* ================================= */}
                  {/* PROJECT HEADER */}
                  {/* ================================= */}

                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-bold text-gray-900">
                          {application.project_title}
                        </h2>

                        <span
                          className={`
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            ${getStatusClasses(
                              application.status
                            )}
                          `}
                        >
                          {getStatusLabel(
                            application.status
                          )}
                        </span>

                      </div>

                      <p className="mt-2 text-sm font-medium text-emerald-600">
                        {application.project_category}
                      </p>

                    </div>

                    {/* VIEW PROJECT */}

                    <button
                      type="button"
                      onClick={() =>
                        handleViewProject(
                          application.project_id
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
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
                      <Eye size={17} />
                      View Project
                    </button>

                  </div>

                  {/* ================================= */}
                  {/* COVER LETTER */}
                  {/* ================================= */}

                  <div className="mt-5 rounded-xl bg-gray-50 p-4">

                    <p className="mb-2 text-sm font-semibold text-gray-700">
                      Your Cover Letter
                    </p>

                    <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                      {application.cover_letter}
                    </p>

                  </div>

                  {/* ================================= */}
                  {/* PROPOSAL INFORMATION */}
                  {/* ================================= */}

                  <div
                    className="
                      mt-5
                      grid
                      grid-cols-1
                      gap-4
                      sm:grid-cols-2
                    "
                  >

                    {/* BUDGET */}

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
                            application.proposed_budget
                          ).toFixed(2)}
                        </p>

                      </div>

                    </div>

                    {/* DELIVERY */}

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
                          {application.delivery_time} days
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* ================================= */}
                  {/* STATUS MESSAGE */}
                  {/* ================================= */}

                  {application.status ===
                    "accepted" && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                      <CheckCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />

                      <div>
                        <p className="text-sm font-semibold text-emerald-800">
                          Proposal accepted
                        </p>

                        <p className="mt-1 text-sm text-emerald-700">
                          Congratulations! You have been
                          selected for this project.
                        </p>
                      </div>

                    </div>
                  )}

                  {application.status ===
                    "rejected" && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                      <XCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-red-600"
                      />

                      <div>
                        <p className="text-sm font-semibold text-red-800">
                          Proposal rejected
                        </p>

                        <p className="mt-1 text-sm text-red-700">
                          This project was awarded to another
                          freelancer.
                        </p>
                      </div>

                    </div>
                  )}

                  {application.status ===
                    "pending" && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">

                      <Clock
                        size={20}
                        className="mt-0.5 shrink-0 text-yellow-600"
                      />

                      <div>
                        <p className="text-sm font-semibold text-yellow-800">
                          Proposal pending
                        </p>

                        <p className="mt-1 text-sm text-yellow-700">
                          The client has not made a final decision yet.
                        </p>
                      </div>

                    </div>
                  )}

                  {/* ================================= */}
                  {/* APPLICATION META */}
                  {/* ================================= */}

                  {application.created_at && (
                    <div className="mt-5 border-t border-gray-100 pt-4">

                      <p className="text-xs text-gray-400">
                        Applied on{" "}
                        {new Date(
                          application.created_at
                        ).toLocaleDateString()}
                      </p>

                    </div>
                  )}

                </div>
              )
            )}

          </div>
        )}

      </div>

    </DashboardLayout>
  );
}