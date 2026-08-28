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
  FileText,
  Pencil,
  Users,
} from "lucide-react";

interface Project {
  id: number;
  client_id: number;
  user_id: number;
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

interface User {
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
  status: string;
  fullname?: string;
  email?: string;
}

export default function ClientProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  const [proposalCount, setProposalCount] = useState(0);

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
      const loggedInUser: User = JSON.parse(storedUser);

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
  // FETCH PROJECT
  // ============================================

  useEffect(() => {
    if (!user || !projectId) return;

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError("");

        // ============================================
        // GET PROJECT
        // ============================================

        const projectResponse = await fetch(
          `http://localhost:5000/api/projects/${projectId}`
        );

        const projectData = await projectResponse.json();

        if (!projectResponse.ok || !projectData.success) {
          throw new Error(
            projectData.message || "Failed to load project."
          );
        }

        const loadedProject: Project = projectData.project;

        // ============================================
        // VERIFY PROJECT BELONGS TO CLIENT
        // ============================================

        if (loadedProject.user_id !== user.id) {
          setError(
            "You are not authorized to view this project."
          );
          return;
        }

        setProject(loadedProject);

        // ============================================
        // GET PROPOSALS
        // ============================================

        try {
          const proposalResponse = await fetch(
            `http://localhost:5000/api/proposals/project/${projectId}`
          );

          const proposalData = await proposalResponse.json();

          if (proposalResponse.ok && proposalData.success) {
            const proposals: Proposal[] =
              proposalData.proposals || [];

            setProposalCount(proposals.length);
          } else {
            setProposalCount(0);
          }
        } catch (proposalError) {
          console.error(
            "FETCH PROPOSALS ERROR:",
            proposalError
          );

          setProposalCount(0);
        }
      } catch (error) {
        console.error(
          "FETCH CLIENT PROJECT ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load project."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
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
  // ERROR
  // ============================================

  if (error || !project) {
    return (
      <DashboardLayout role="client">
        <div className="w-full">

          <button
            type="button"
            onClick={() =>
              router.push("/client/projects")
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
            Back to My Projects
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <BriefcaseBusiness
                size={26}
                className="text-red-600"
              />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Project unavailable
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
    <DashboardLayout role="client">
      <div className="w-full">

        {/* ====================================== */}
        {/* BACK */}
        {/* ====================================== */}

        <button
          type="button"
          onClick={() =>
            router.push("/client/projects")
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
          Back to My Projects
        </button>

        {/* ====================================== */}
        {/* PROJECT CARD */}
        {/* ====================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* ==================================== */}
          {/* HEADER */}
          {/* ==================================== */}

          <div className="border-b border-gray-100 p-6 sm:p-8">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {project.title}
                  </h1>

                  <span
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      ${
                        project.status === "open"
                          ? "bg-emerald-100 text-emerald-700"
                          : project.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    `}
                  >
                    {project.status || "Open"}
                  </span>

                </div>

                <p className="mt-3 text-sm font-medium text-emerald-600">
                  {project.category}
                </p>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-col gap-3 sm:flex-row">

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
                    shadow-sm
                    transition
                    hover:bg-emerald-700
                  "
                >
                  <Users size={18} />
                  View Proposals ({proposalCount})
                </button>

                {/* EDIT */}

                {project.status === "open" && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/client/projects/${project.id}/edit`
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
                    <Pencil size={18} />
                    Edit Project
                  </button>
                )}

              </div>

            </div>

          </div>

          {/* ==================================== */}
          {/* PROJECT CONTENT */}
          {/* ==================================== */}

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

            {/* ================================= */}
            {/* PROJECT INFORMATION */}
            {/* ================================= */}

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

            {/* ================================= */}
            {/* REQUIRED SKILLS */}
            {/* ================================= */}

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

            {/* ================================= */}
            {/* PROPOSAL SUMMARY */}
            {/* ================================= */}

            <section className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <FileText
                    size={20}
                    className="text-emerald-600"
                  />
                </div>

                <div>

                  <p className="text-sm font-semibold text-gray-900">
                    Proposals Received
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {proposalCount} freelancer
                    {proposalCount === 1 ? "" : "s"} applied
                    for this project.
                  </p>

                </div>

              </div>

            </section>

            {/* ================================= */}
            {/* PROJECT ID */}
            {/* ================================= */}

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