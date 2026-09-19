"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ListChecks,
  CalendarDays,
  DollarSign,
  CheckCircle2,
  Clock3,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface User {
  id: number;
  fullname: string;
  role: "admin" | "freelancer" | "client";
  email?: string;
}

interface Project {
  id: number;
  title: string;
  status: string;
}

interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  amount: number | null;
  due_date: string | null;
  progress: number;
  status: "pending" | "in_progress" | "completed";
  created_at?: string;
  updated_at?: string;
}

export default function FreelancerMilestonesPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const [selectedProject, setSelectedProject] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMilestones, setLoadingMilestones] =
    useState(false);

  const [updatingMilestone, setUpdatingMilestone] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  // ============================================
  // LOAD LOGGED-IN USER
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    try {
      const parsedUser: User = JSON.parse(storedUser);

      if (parsedUser.role !== "freelancer") {
        setError("Only freelancers can access this page.");
        setLoading(false);
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("INVALID USER DATA:", error);
      setError("Invalid user data.");
      setLoading(false);
    }
  }, []);

  // ============================================
  // FETCH FREELANCER PROJECTS
  // ============================================

  useEffect(() => {
    if (!user?.id) return;

    fetchProjects();
  }, [user?.id]);

  const fetchProjects = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/projects`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load projects."
        );
      }

      const allProjects: Project[] = data.projects || [];

      // Only show projects assigned to this freelancer.
      const freelancerProjects = allProjects.filter(
        (project: any) =>
          Number(project.freelancer_id) === Number(user.id)
      );

      setProjects(freelancerProjects);

      if (freelancerProjects.length > 0) {
        setSelectedProject(freelancerProjects[0].id);
      } else {
        setSelectedProject(null);
        setMilestones([]);
      }
    } catch (error) {
      console.error("FETCH PROJECTS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FETCH MILESTONES
  // ============================================

  useEffect(() => {
    if (!selectedProject) {
      setMilestones([]);
      return;
    }

    fetchMilestones(selectedProject);
  }, [selectedProject]);

  const fetchMilestones = async (projectId: number) => {
    try {
      setLoadingMilestones(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/milestones/project/${projectId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load milestones."
        );
      }

      setMilestones(data.milestones || []);
    } catch (error) {
      console.error("FETCH MILESTONES ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load milestones."
      );

      setMilestones([]);
    } finally {
      setLoadingMilestones(false);
    }
  };

  // ============================================
  // UPDATE MILESTONE PROGRESS
  // ============================================

  const updateProgress = async (
    milestoneId: number,
    progress: number
  ) => {
    if (!user?.id) return;

    try {
      setUpdatingMilestone(milestoneId);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/milestones/${milestoneId}/progress`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            progress,
            freelancer_id: user.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update milestone progress."
        );
      }

      // Update the milestone immediately on screen.
      setMilestones((previousMilestones) =>
        previousMilestones.map((milestone) =>
          milestone.id === milestoneId
            ? {
                ...milestone,
                progress: data.milestone.progress,
                status: data.milestone.status,
              }
            : milestone
        )
      );
    } catch (error) {
      console.error(
        "UPDATE MILESTONE PROGRESS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update progress."
      );
    } finally {
      setUpdatingMilestone(null);
    }
  };

  // ============================================
  // FORMAT DATE
  // ============================================

  const formatDate = (date: string | null) => {
    if (!date) {
      return "No due date";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================
  // STATUS
  // ============================================

  const getStatusStyle = (status: string) => {
    if (status === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "in_progress") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusLabel = (status: string) => {
    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "completed") {
      return "Completed";
    }

    return "Pending";
  };

  // ============================================
  // CALCULATE SUMMARY
  // ============================================

  const completedCount = milestones.filter(
    (milestone) => milestone.status === "completed"
  ).length;

  const inProgressCount = milestones.filter(
    (milestone) => milestone.status === "in_progress"
  ).length;

  const pendingCount = milestones.filter(
    (milestone) => milestone.status === "pending"
  ).length;

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading milestones...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN PAGE
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ========================================
            HEADER
        ======================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                <ListChecks
                  size={23}
                  className="text-emerald-600"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  My Milestones
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Track your assigned work and update milestone
                  progress.
                </p>
              </div>
            </div>
          </div>

          {/* HEADER BUTTONS */}

          <div className="flex flex-wrap items-center gap-2">
            {/* BACK TO DASHBOARD */}

            <button
              type="button"
              onClick={() =>
                router.push("/freelancer")
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-gray-700
                shadow-sm
                transition
                hover:border-emerald-300
                hover:bg-emerald-50
                hover:text-emerald-600
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>

              Back to Dashboard
            </button>

            {/* EXISTING REFRESH BUTTON */}

            <button
              type="button"
              onClick={fetchProjects}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-gray-700
                shadow-sm
                transition
                hover:border-emerald-300
                hover:bg-emerald-50
                hover:text-emerald-600
              "
            >
              <RefreshCw size={17} />

              Refresh
            </button>
          </div>
        </div>

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ========================================
            NO PROJECTS
        ======================================== */}

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <ListChecks
                size={30}
                className="text-emerald-600"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-gray-900">
              No assigned projects
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You don't have any projects assigned to you yet.
              Once a client hires you, the project's milestones
              will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* ========================================
                PROJECT SELECTOR
            ======================================== */}

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <label
                htmlFor="project"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Select Project
              </label>

              <select
                id="project"
                value={selectedProject ?? ""}
                onChange={(event) =>
                  setSelectedProject(
                    Number(event.target.value)
                  )
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
                  text-gray-800
                  outline-none
                  transition
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                  sm:max-w-xl
                "
              >
                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            {/* ========================================
                SUMMARY CARDS
            ======================================== */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Pending */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Pending
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {pendingCount}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100">
                    <Clock3
                      size={21}
                      className="text-yellow-600"
                    />
                  </div>
                </div>
              </div>

              {/* In Progress */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      In Progress
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {inProgressCount}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                    <Loader2
                      size={21}
                      className="text-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Completed */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Completed
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {completedCount}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                    <CheckCircle2
                      size={21}
                      className="text-green-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================
                MILESTONES
            ======================================== */}

            {loadingMilestones ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

                <p className="mt-3 text-sm text-gray-500">
                  Loading project milestones...
                </p>
              </div>
            ) : milestones.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <ListChecks
                    size={26}
                    className="text-gray-500"
                  />
                </div>

                <h2 className="mt-4 text-lg font-bold text-gray-900">
                  No milestones yet
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  The client has not created any milestones for
                  this project yet.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      shadow-sm
                    "
                  >
                    {/* Milestone Header */}

                    <div className="border-b border-gray-100 p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">
                              {milestone.title}
                            </h2>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                milestone.status
                              )}`}
                            >
                              {getStatusLabel(
                                milestone.status
                              )}
                            </span>
                          </div>

                          {milestone.description && (
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Info */}

                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                            <DollarSign
                              size={18}
                              className="text-emerald-600"
                            />
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Amount
                            </p>

                            <p className="text-sm font-semibold text-gray-900">
                              {milestone.amount !== null
                                ? `₹${Number(
                                    milestone.amount
                                  ).toLocaleString("en-IN")}`
                                : "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                            <CalendarDays
                              size={18}
                              className="text-blue-600"
                            />
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Due Date
                            </p>

                            <p className="text-sm font-semibold text-gray-900">
                              {formatDate(
                                milestone.due_date
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Section */}

                    <div className="p-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            Your Progress
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Update the percentage as you complete
                            the milestone.
                          </p>
                        </div>

                        <span className="text-xl font-bold text-emerald-600">
                          {milestone.progress}%
                        </span>
                      </div>

                      {/* Progress Bar */}

                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                          style={{
                            width: `${milestone.progress}%`,
                          }}
                        />
                      </div>

                      {/* Progress Slider */}

                      <div className="mt-5">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={milestone.progress}
                          disabled={
                            updatingMilestone ===
                              milestone.id ||
                            milestone.status === "completed"
                          }
                          onChange={(event) =>
                            updateProgress(
                              milestone.id,
                              Number(event.target.value)
                            )
                          }
                          className="
                            h-2
                            w-full
                            cursor-pointer
                            accent-emerald-600
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        />
                      </div>

                      {/* Updating */}

                      {updatingMilestone === milestone.id && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />

                          Updating progress...
                        </div>
                      )}

                      {/* Completed */}

                      {milestone.status === "completed" && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">
                          <CheckCircle2 size={18} />

                          This milestone has been completed.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
