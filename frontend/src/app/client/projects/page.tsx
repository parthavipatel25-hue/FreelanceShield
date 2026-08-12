"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function MyProjectsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ============================================
  // POST PROJECT PAGE
  // ============================================

  const goToCreateProject = () => {
    router.push("/client/create-project");
  };

  // ============================================
  // GET LOGGED-IN USER
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "client") {
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
  // FETCH CLIENT PROJECTS
  // ============================================

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/projects/client/${user.id}`
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
  // DELETE PROJECT
  // ============================================

  const handleDelete = async (projectId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(projectId);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete project."
        );
      }

      // Remove deleted project from the screen
      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) => project.id !== projectId
        )
      );
    } catch (error) {
      console.error("DELETE PROJECT ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete project."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================
  // FORMAT DEADLINE
  // Avoid hydration mismatch
  // ============================================

  const formatDeadline = (deadline: string) => {
    if (!deadline) {
      return "N/A";
    }

    const datePart = deadline.split("T")[0];

    const parts = datePart.split("-");

    if (parts.length !== 3) {
      return deadline;
    }

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    return `${month}/${day}/${year}`;
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
            Loading your projects...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 lg:px-8">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="mb-6">

        {/* BACK TO DASHBOARD */}

        <button
          type="button"
          onClick={() => router.push("/client")}
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

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          {/* PAGE TITLE */}

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              My Projects
            </h1>

            <p className="mt-1 text-gray-500">
              Manage the projects you have posted.
            </p>
          </div>

          {/* ====================================
              POST PROJECT BUTTON
              ONLY SHOW WHEN PROJECTS EXIST
          ==================================== */}


        </div>
      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* ========================================
          NO PROJECTS
      ======================================== */}

      {!error && projects.length === 0 && (
        <div
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-10
            text-center
            shadow-sm
          "
        >

          {/* ICON */}

          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-emerald-100
            "
          >
            <BriefcaseBusiness
              size={30}
              className="text-emerald-600"
            />
          </div>

          {/* TITLE */}

          <h2 className="mt-5 text-xl font-semibold text-gray-900">
            No projects yet
          </h2>

          {/* DESCRIPTION */}

          <p className="mx-auto mt-2 max-w-md text-gray-500">
            You haven't posted any projects yet. Create your
            first project to start finding freelancers.
          </p>

          {/* ====================================
              FIRST PROJECT BUTTON
              GOES TO /client/create-project
          ==================================== */}

          <button
            type="button"
            onClick={goToCreateProject}
            className="
              mt-6
              rounded-xl
              bg-emerald-600
              px-6
              py-3
              font-semibold
              text-white
              transition
              hover:bg-emerald-700
            "
          >
            Post Your First Project
          </button>

        </div>
      )}

      {/* ========================================
          PROJECT LIST
      ======================================== */}

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

              {/* ==================================
                  PROJECT HEADER
              ================================== */}

              <div className="flex flex-col justify-between gap-4 lg:flex-row">

                {/* PROJECT TITLE */}

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
                      {project.status || "open"}
                    </span>

                  </div>

                  <p className="mt-2 text-sm font-medium text-emerald-600">
                    {project.category}
                  </p>

                </div>

                {/* ==================================
                    EDIT + DELETE BUTTONS
                ================================== */}

                <div className="flex shrink-0 gap-3">

                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/client/projects/${project.id}/edit`
                      )
                    }
                    className="
                      rounded-lg
                      border
                      border-gray-300
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-gray-700
                      transition
                      hover:border-emerald-500
                      hover:text-emerald-600
                    "
                  >
                    Edit
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="
                      rounded-lg
                      border
                      border-red-200
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-red-600
                      transition
                      hover:bg-red-50
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {deletingId === project.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>

              </div>

              {/* ==================================
                  DESCRIPTION
              ================================== */}

              <p className="mt-5 leading-7 text-gray-600">
                {project.description}
              </p>

              {/* ==================================
                  PROJECT INFORMATION
              ================================== */}

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

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-lg
                      bg-emerald-100
                    "
                  >
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

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-lg
                      bg-blue-100
                    "
                  >
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
                      {formatDeadline(project.deadline)}
                    </p>
                  </div>

                </div>

                {/* BUDGET TYPE */}

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-lg
                      bg-purple-100
                    "
                  >
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

              {/* ==================================
                  REQUIRED SKILLS
              ================================== */}

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
  );
}