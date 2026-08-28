"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../components/layout/DashboardLayout";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatsCard from "../components/dashboard/StatsCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import ProfileCard from "../components/dashboard/ProfileCard";

import {
  Briefcase,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";

// ==================================================
// USER
// ==================================================

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

// ==================================================
// PROJECT
// ==================================================

interface Project {
  id: number;
  title: string;
  status?: string;
}

// ==================================================
// PROPOSAL
// ==================================================

interface Proposal {
  id: number;
  project_id: number;
  freelancer_id: number;
  cover_letter: string;
  proposed_budget: string | number;
  delivery_time: number;
  status: "pending" | "accepted" | "rejected";
  project_title?: string;
  project_category?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================================================
// FREELANCER DASHBOARD
// ==================================================

export default function FreelancerPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [availableJobs, setAvailableJobs] =
    useState(0);

  const [applicationCount, setApplicationCount] =
    useState(0);

  const [ongoingCount, setOngoingCount] =
    useState(0);

  const [completedCount, setCompletedCount] =
    useState(0);

  // ==================================================
  // GET LOGGED-IN USER
  // ==================================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: User =
        JSON.parse(storedUser);

      if (
        !loggedInUser ||
        loggedInUser.role !== "freelancer"
      ) {
        router.push("/login");
        return;
      }

      setUser(loggedInUser);
    } catch (error) {
      console.error(
        "INVALID USER DATA:",
        error
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      router.push("/login");
    }
  }, [router]);

  // ==================================================
  // GET AVAILABLE PROJECT COUNT
  // ==================================================

  useEffect(() => {
    const fetchAvailableJobs = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/projects"
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to load available projects."
          );
        }

        const projects: Project[] =
          data.projects || [];

        // Only projects that are open
        const openProjects =
          projects.filter(
            (project) =>
              !project.status ||
              project.status.toLowerCase() ===
                "open"
          );

        setAvailableJobs(
          openProjects.length
        );
      } catch (error) {
        console.error(
          "FETCH AVAILABLE PROJECTS ERROR:",
          error
        );

        setAvailableJobs(0);
      }
    };

    fetchAvailableJobs();
  }, []);

  // ==================================================
  // GET FREELANCER APPLICATIONS
  // ==================================================

  useEffect(() => {
    if (!user) return;

    const fetchApplicationStats =
      async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/proposals/freelancer/${user.id}`
          );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                "Failed to load applications."
            );
          }

          const proposals: Proposal[] =
            data.proposals || [];

          // ========================================
          // APPLICATIONS
          // ========================================

          setApplicationCount(
            proposals.length
          );

          // ========================================
          // GET PROJECT STATUS FOR ACCEPTED
          // ========================================

          const acceptedProposals =
            proposals.filter(
              (proposal) =>
                proposal.status ===
                "accepted"
            );

          if (
            acceptedProposals.length ===
            0
          ) {
            setOngoingCount(0);
            setCompletedCount(0);
            return;
          }

          const projectResponses =
            await Promise.all(
              acceptedProposals.map(
                async (proposal) => {
                  try {
                    const projectResponse =
                      await fetch(
                        `http://localhost:5000/api/projects/${proposal.project_id}`
                      );

                    const projectData =
                      await projectResponse.json();

                    if (
                      projectResponse.ok &&
                      projectData.success
                    ) {
                      return projectData.project;
                    }

                    return null;
                  } catch (projectError) {
                    console.error(
                      `FAILED TO LOAD PROJECT ${proposal.project_id}:`,
                      projectError
                    );

                    return null;
                  }
                }
              )
            );

          // ========================================
          // COUNT ONGOING + COMPLETED
          // ========================================

          let ongoing = 0;
          let completed = 0;

          projectResponses.forEach(
            (project) => {
              if (!project) {
                return;
              }

              const status =
                String(
                  project.status || ""
                ).toLowerCase();

              if (
                status === "in_progress" ||
                status === "in progress"
              ) {
                ongoing++;
              }

              if (
                status === "completed" ||
                status === "complete"
              ) {
                completed++;
              }
            }
          );

          setOngoingCount(ongoing);
          setCompletedCount(completed);
        } catch (error) {
          console.error(
            "FETCH APPLICATION STATS ERROR:",
            error
          );

          setApplicationCount(0);
          setOngoingCount(0);
          setCompletedCount(0);
        }
      };

    fetchApplicationStats();
  }, [user]);

  // ==================================================
  // LOADING
  // ==================================================

  if (!user) {
    return null;
  }

  // ==================================================
  // DASHBOARD
  // ==================================================

  return (
    <DashboardLayout role="freelancer">

      {/* ========================================= */}
      {/* WELCOME BANNER */}
      {/* ========================================= */}

      <section className="w-full">
        <WelcomeBanner
          fullname={user.fullname}
          role={user.role}
        />
      </section>

      {/* ========================================= */}
      {/* STATISTICS */}
      {/* ========================================= */}

      <section className="mt-5 sm:mt-6">

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            sm:gap-5
            xl:grid-cols-4
            xl:gap-6
          "
        >

          {/* AVAILABLE JOBS */}

          <StatsCard
            title="Available Jobs"
            value={String(
              availableJobs
            )}
            subtitle="Open for applications"
            icon={Briefcase}
          />

          {/* APPLICATIONS */}

          <StatsCard
            title="Applications"
            value={String(
              applicationCount
            )}
            subtitle="Submitted"
            icon={FileText}
          />

          {/* ONGOING */}

          <StatsCard
            title="Ongoing"
            value={String(
              ongoingCount
            )}
            subtitle="Current Projects"
            icon={Clock}
          />

          {/* COMPLETED */}

          <StatsCard
            title="Completed"
            value={String(
              completedCount
            )}
            subtitle="Successfully Delivered"
            icon={CheckCircle}
          />

        </div>
      </section>

      {/* ========================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================= */}

      <section className="mt-5 sm:mt-6">

        <div
          className="
            grid
            grid-cols-1
            gap-5
            lg:grid-cols-3
            lg:gap-6
          "
        >

          {/* ================================= */}
          {/* RECENT ACTIVITY */}
          {/* ================================= */}

          <div className="min-w-0 lg:col-span-2">

            <RecentActivity />

          </div>

          {/* ================================= */}
          {/* PROFILE */}
          {/* ================================= */}

          <div className="min-w-0">

            <ProfileCard
              fullname={user.fullname}
              email={user.email}
              role={user.role}
            />

          </div>

        </div>

      </section>

    </DashboardLayout>
  );
}