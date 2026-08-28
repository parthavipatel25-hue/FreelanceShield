"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../components/layout/DashboardLayout";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatsCard from "../components/dashboard/StatsCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import ProfileCard from "../components/dashboard/ProfileCard";

import {
  BriefcaseBusiness,
  Users,
  Clock,
  FileText,
} from "lucide-react";

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

interface Project {
  id: number;
  title: string;
}

interface Proposal {
  id: number;
  project_id: number;
  freelancer_id: number;
  status: string;
}

export default function ClientPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [projectCount, setProjectCount] = useState(0);
  const [proposalCount, setProposalCount] = useState(0);

  useEffect(() => {
    const loadClientData = async () => {
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

        // ============================================
        // GET CLIENT PROJECTS
        // ============================================

        const projectsResponse = await fetch(
          `http://localhost:5000/api/projects/client/${loggedInUser.id}`
        );

        const projectsData = await projectsResponse.json();

        if (!projectsResponse.ok || !projectsData.success) {
          throw new Error(
            projectsData.message || "Failed to load client projects."
          );
        }

        const clientProjects: Project[] =
          projectsData.projects || [];

        setProjectCount(clientProjects.length);

        // ============================================
        // GET PROPOSALS FOR CLIENT PROJECTS
        // ============================================

        if (clientProjects.length === 0) {
          setProposalCount(0);
          return;
        }

        const proposalResponses = await Promise.all(
          clientProjects.map(async (project) => {
            try {
              const response = await fetch(
                `http://localhost:5000/api/proposals/project/${project.id}`
              );

              const data = await response.json();

              if (!response.ok || !data.success) {
                return [];
              }

              return data.proposals || [];
            } catch (error) {
              console.error(
                `Failed to load proposals for project ${project.id}:`,
                error
              );

              return [];
            }
          })
        );

        const allProposals: Proposal[] =
          proposalResponses.flat();

        setProposalCount(allProposals.length);

      } catch (error) {
        console.error(
          "CLIENT DASHBOARD ERROR:",
          error
        );

        localStorage.removeItem("user");
        router.push("/login");
      }
    };

    loadClientData();
  }, [router]);

  // ============================================
  // LOADING
  // ============================================

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout role="client">

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

          {/* PROJECTS POSTED */}

          <StatsCard
            title="Projects Posted"
            value={projectCount.toString()}
            subtitle="Total projects created"
            icon={BriefcaseBusiness}
          />

          {/* ACTIVE PROJECTS */}

          <StatsCard
            title="Active Projects"
            value="0"
            subtitle="Currently running"
            icon={Clock}
          />

          {/* PROPOSALS RECEIVED */}

          <StatsCard
            title="Proposals Received"
            value={proposalCount.toString()}
            subtitle="Freelancer applications"
            icon={FileText}
          />

          {/* HIRED FREELANCERS */}

          <StatsCard
            title="Hired Freelancers"
            value="0"
            subtitle="Working with you"
            icon={Users}
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