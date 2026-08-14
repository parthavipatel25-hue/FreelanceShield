"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  Clock,
  ArrowLeft,
} from "lucide-react";

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
  created_at?: string;
}

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

export default function BrowseProjectsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // CHECK LOGGED-IN USER
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "freelancer") {
        router.push("/login");
        return;
      }

      setUser(loggedInUser);
    } catch (error) {
      console.error("Invalid user data:", error);

      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // ============================================
  // FETCH PROJECTS
  // ============================================

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/projects"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load projects."
          );
        }

        setProjects(data.projects || []);
      } catch (error) {
        console.error("FETCH PROJECTS ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load projects."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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
            Loading available projects...
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

        {/* HEADER */}

        <div className="mb-6">

          <button
            type="button"
            onClick={() => router.push("/freelancer")}
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

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Browse Projects
          </h1>

          <p className="mt-1 text-gray-500">
            Browse projects posted by clients and find work that
            matches your skills.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* NO PROJECTS */}

        {!error && projects.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <BriefcaseBusiness
                size={30}
                className="text-emerald-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No projects available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              There are currently no projects posted by clients.
              Please check again later.
            </p>

          </div>
        )}

        {/* PROJECTS */}

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

                {/* PROJECT HEADER */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-xl font-bold text-gray-900">
                        {project.title}
                      </h2>

                      <span
                        className="
                          rounded-full
                          bg-emerald-100
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-emerald-700
                        "
                      >
                        {project.status || "Open"}
                      </span>

                    </div>

                    <p className="mt-2 text-sm font-medium text-emerald-600">
                      {project.category}
                    </p>

                  </div>

                  <div className="shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/freelancer/browse-projects/${project.id}`
                        )
                      }
                      className="
                        rounded-lg
                        bg-emerald-600
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-emerald-700
                      "
                    >
                      View Details
                    </button>

                  </div>

                </div>

                {/* DESCRIPTION */}

                <p className="mt-5 leading-7 text-gray-600">
                  {project.description}
                </p>

                {/* PROJECT INFORMATION */}

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

                  {/* BUDGET */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <DollarSign
                        size={20}
                        className="text-emerald-600"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Budget
                      </p>

                      <p className="font-semibold text-gray-900">
                        ${Number(project.budget).toFixed(2)}
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

                  {/* BUDGET TYPE */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <Clock
                        size={20}
                        className="text-purple-600"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Budget Type
                      </p>

                      <p className="font-semibold capitalize text-gray-900">
                        {project.budget_type}
                      </p>
                    </div>

                  </div>

                </div>

                {/* SKILLS */}

                {project.skills && (
                  <div className="mt-5 border-t border-gray-100 pt-5">

                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      Required Skills
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {project.skills
                        .split(",")
                        .map((skill) => (
                          <span
                            key={skill.trim()}
                            className="
                              rounded-full
                              bg-gray-100
                              px-3
                              py-1
                              text-xs
                              font-medium
                              text-gray-700
                            "
                          >
                            {skill.trim()}
                          </span>
                        ))}

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