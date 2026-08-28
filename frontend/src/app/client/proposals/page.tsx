"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Users,
  Eye,
} from "lucide-react";

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

interface Project {
  id: number;
  client_id: number;
  title: string;
  description: string;
  category: string;
  skills: string | null;
  budget: number;
  budget_type: string;
  deadline: string;
  status?: string;
  freelancer_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface ProjectWithProposals extends Project {
  proposalCount: number;
}

export default function ClientProposalsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<
    ProjectWithProposals[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const loggedInUser: User =
        JSON.parse(storedUser);

      if (loggedInUser.role !== "client") {
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
  // FETCH CLIENT PROJECTS + PROPOSAL COUNTS
  // ============================================

  useEffect(() => {
    if (!user) return;

    const fetchProjectsAndProposals = async () => {
      try {
        setLoading(true);
        setError("");

        // ========================================
        // GET CLIENT PROJECTS
        // ========================================

        const projectsResponse = await fetch(
          `http://localhost:5000/api/projects/client/${user.id}`
        );

        const projectsData =
          await projectsResponse.json();

        if (
          !projectsResponse.ok ||
          !projectsData.success
        ) {
          throw new Error(
            projectsData.message ||
              "Failed to load your projects."
          );
        }

        const clientProjects: Project[] =
          projectsData.projects || [];

        // ========================================
        // GET PROPOSALS FOR EACH PROJECT
        // ========================================

        const projectsWithCounts =
          await Promise.all(
            clientProjects.map(
              async (project) => {
                try {
                  const proposalResponse =
                    await fetch(
                      `http://localhost:5000/api/proposals/project/${project.id}`
                    );

                  const proposalData =
                    await proposalResponse.json();

                  if (
                    proposalResponse.ok &&
                    proposalData.success
                  ) {
                    return {
                      ...project,
                      proposalCount:
                        Array.isArray(
                          proposalData.proposals
                        )
                          ? proposalData.proposals.length
                          : 0,
                    };
                  }

                  return {
                    ...project,
                    proposalCount: 0,
                  };
                } catch (proposalError) {
                  console.error(
                    `FAILED TO LOAD PROPOSALS FOR PROJECT ${project.id}:`,
                    proposalError
                  );

                  return {
                    ...project,
                    proposalCount: 0,
                  };
                }
              }
            )
          );

        setProjects(projectsWithCounts);
      } catch (error) {
        console.error(
          "CLIENT PROPOSALS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load proposals."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndProposals();
  }, [user]);

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

        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <div className="mb-6">

          <button
            type="button"
            onClick={() =>
              router.push("/client")
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
                Proposals Received
              </h1>

              <p className="mt-1 text-gray-500">
                Review freelancer applications for your projects.
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
        {/* NO PROJECTS */}
        {/* ====================================== */}

        {!error && projects.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <BriefcaseBusiness
                size={30}
                className="text-emerald-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No projects found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              You haven't posted any projects yet.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/client/create-project"
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
              Post a Project
            </button>

          </div>
        )}

        {/* ====================================== */}
        {/* PROJECTS */}
        {/* ====================================== */}

        {projects.length > 0 && (
          <div className="space-y-5">

            {projects.map((project) => (
              <div
                key={project.id}
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

                {/* ================================== */}
                {/* PROJECT HEADER */}
                {/* ================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-xl font-bold text-gray-900">
                        {project.title}
                      </h2>

                      <span
                        className={`
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          ${
                            project.status ===
                            "open"
                              ? "bg-emerald-100 text-emerald-700"
                              : project.status ===
                                "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        `}
                      >
                        {project.status ||
                          "open"}
                      </span>

                    </div>

                    <p className="mt-2 text-sm font-medium text-emerald-600">
                      {project.category}
                    </p>

                  </div>

                  {/* VIEW PROPOSALS */}

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/client/projects/${project.id}/proposals`
                      )
                    }
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
                    "
                  >
                    <Eye size={18} />
                    View Proposals
                  </button>

                </div>

                {/* ================================== */}
                {/* PROJECT DESCRIPTION */}
                {/* ================================== */}

                <p className="mt-5 leading-7 text-gray-600">
                  {project.description}
                </p>

                {/* ================================== */}
                {/* PROPOSAL SUMMARY */}
                {/* ================================== */}

                <div
                  className="
                    mt-6
                    grid
                    grid-cols-1
                    gap-4
                    border-t
                    border-gray-100
                    pt-5
                    sm:grid-cols-3
                  "
                >

                  {/* PROPOSALS */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <Users
                        size={20}
                        className="text-emerald-600"
                      />
                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Proposals
                      </p>

                      <p className="font-semibold text-gray-900">
                        {project.proposalCount}
                      </p>

                    </div>

                  </div>

                  {/* DEADLINE */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <CalendarDays
                        size={20}
                        className="text-blue-600"
                      />
                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Deadline
                      </p>

                      <p className="font-semibold text-gray-900">
                        {new Date(
                          project.deadline
                        ).toLocaleDateString()}
                      </p>

                    </div>

                  </div>

                  {/* BUDGET */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <FileText
                        size={20}
                        className="text-purple-600"
                      />
                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Budget
                      </p>

                      <p className="font-semibold text-gray-900">
                        $
                        {Number(
                          project.budget
                        ).toFixed(2)}
                      </p>

                    </div>

                  </div>

                </div>

                {/* ================================== */}
                {/* NO PROPOSAL NOTICE */}
                {/* ================================== */}

                {project.proposalCount === 0 && (
                  <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">

                    <p className="text-sm text-gray-500">
                      No freelancers have applied for
                      this project yet.
                    </p>

                  </div>
                )}

                {/* ================================== */}
                {/* HAS PROPOSALS */}
                {/* ================================== */}

                {project.proposalCount > 0 && (
                  <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-sm font-semibold text-gray-900">
                          Freelancer applications received
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                          Review the proposals and choose
                          the freelancer you want to hire.
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/client/projects/${project.id}/proposals`
                          )
                        }
                        className="
                          hidden
                          shrink-0
                          rounded-lg
                          bg-white
                          px-4
                          py-2
                          text-sm
                          font-semibold
                          text-emerald-700
                          shadow-sm
                          transition
                          hover:bg-emerald-50
                          sm:block
                        "
                      >
                        Review
                      </button>

                    </div>

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