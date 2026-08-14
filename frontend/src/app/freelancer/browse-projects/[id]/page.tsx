"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import DashboardLayout from "../../../components/layout/DashboardLayout";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  Clock,
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

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);

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
      const loggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "freelancer") {
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
  // FETCH PROJECT DETAILS
  // ============================================

  useEffect(() => {
    if (!user || !projectId) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/projects/${projectId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load project."
          );
        }

        setProject(data.project);
      } catch (error) {
        console.error("FETCH PROJECT DETAILS ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load project."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [user, projectId]);

  // ============================================
  // LOADING
  // ============================================

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="mt-4 text-gray-600">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR / PROJECT NOT FOUND
  // ============================================

  if (error || !project) {
    return (
      <DashboardLayout role="freelancer">
        <div className="w-full">

          <button
            type="button"
            onClick={() =>
              router.push("/freelancer/browse-projects")
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
            Back to Browse Projects
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <BriefcaseBusiness
                size={26}
                className="text-red-600"
              />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Project not found
            </h2>

            <p className="mt-2 text-gray-600">
              {error || "This project could not be found."}
            </p>

          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================
  // PROJECT DETAILS
  // ============================================

  return (
    <DashboardLayout role="freelancer">
      <div className="w-full">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() =>
            router.push("/freelancer/browse-projects")
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
          Back to Browse Projects
        </button>

        {/* PROJECT CARD */}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* HEADER */}

          <div className="border-b border-gray-100 p-6 sm:p-8">

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {project.title}
                  </h1>

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

                <p className="mt-3 text-sm font-medium text-emerald-600">
                  {project.category}
                </p>

              </div>

              {/* APPLY BUTTON */}

              <button
                type="button"
                className="
                  rounded-xl
                  bg-emerald-600
                  px-6
                  py-3
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-emerald-700
                "
              >
                Apply for Project
              </button>

            </div>

          </div>

          {/* PROJECT CONTENT */}

          <div className="p-6 sm:p-8">

            {/* DESCRIPTION */}

            <section>

              <h2 className="text-lg font-semibold text-gray-900">
                Project Description
              </h2>

              <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
                {project.description}
              </p>

            </section>

            {/* PROJECT INFORMATION */}

            <section className="mt-8">

              <h2 className="text-lg font-semibold text-gray-900">
                Project Information
              </h2>

              <div
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-3
                "
              >

                {/* BUDGET */}

                <div className="rounded-xl bg-gray-50 p-4">

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

                      <p className="mt-1 font-semibold text-gray-900">
                        ${Number(project.budget).toFixed(2)}
                      </p>

                    </div>

                  </div>

                </div>

                {/* DEADLINE */}

                <div className="rounded-xl bg-gray-50 p-4">

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

                      <p className="mt-1 font-semibold text-gray-900">
                        {new Date(
                          project.deadline
                        ).toLocaleDateString()}
                      </p>

                    </div>

                  </div>

                </div>

                {/* BUDGET TYPE */}

                <div className="rounded-xl bg-gray-50 p-4">

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

                      <p className="mt-1 font-semibold capitalize text-gray-900">
                        {project.budget_type}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* SKILLS */}

            {project.skills && (
              <section className="mt-8">

                <h2 className="text-lg font-semibold text-gray-900">
                  Required Skills
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">

                  {project.skills
                    .split(",")
                    .map((skill) => (
                      <span
                        key={skill.trim()}
                        className="
                          rounded-full
                          bg-gray-100
                          px-4
                          py-2
                          text-sm
                          font-medium
                          text-gray-700
                        "
                      >
                        {skill.trim()}
                      </span>
                    ))}

                </div>

              </section>
            )}

            {/* PROJECT ID */}

            <div className="mt-8 border-t border-gray-100 pt-5">

              <p className="text-sm text-gray-500">
                Project ID:{" "}
                <span className="font-medium text-gray-700">
                  #{project.id}
                </span>
              </p>

            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}