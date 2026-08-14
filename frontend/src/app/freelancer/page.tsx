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

interface User {
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

interface Project {
  id: number;
  title: string;
  status?: string;
}

export default function FreelancerPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [availableJobs, setAvailableJobs] = useState(0);

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
  // GET AVAILABLE PROJECT COUNT
  // ============================================

  useEffect(() => {
    const fetchAvailableJobs = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/projects"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load available projects."
          );
        }

        const projects: Project[] = data.projects || [];

        // Count only open projects
        const openProjects = projects.filter(
          (project) =>
            !project.status ||
            project.status.toLowerCase() === "open"
        );

        setAvailableJobs(openProjects.length);
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

  // ============================================
  // LOADING
  // ============================================

  if (!user) {
    return null;
  }

  // ============================================
  // DASHBOARD
  // ============================================

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
            value={String(availableJobs)}
            subtitle="Open for applications"
            icon={Briefcase}
          />

          {/* APPLICATIONS */}

          <StatsCard
            title="Applications"
            value="0"
            subtitle="Submitted"
            icon={FileText}
          />

          {/* ONGOING */}

          <StatsCard
            title="Ongoing"
            value="0"
            subtitle="Current Projects"
            icon={Clock}
          />

          {/* COMPLETED */}

          <StatsCard
            title="Completed"
            value="0"
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