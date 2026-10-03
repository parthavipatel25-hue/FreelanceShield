"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../components/layout/DashboardLayout";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatsCard from "../components/dashboard/StatsCard";
import ProfileCard from "../components/dashboard/ProfileCard";
import QuickActions from "../components/dashboard/QuickActions";
import RecentActivity from "../components/dashboard/RecentActivity";

import {
  Users,
  Briefcase,
  FolderOpen,
  ShieldCheck,
} from "lucide-react";

interface User {
  id?: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

interface DashboardStats {
  totalUsers: number;
  freelancers: number;
  clients: number;
  projects: number;
}

export default function AdminPage() {
  const router = useRouter();

  // =========================================
  // USER
  // =========================================

  const [user, setUser] = useState<User | null>(null);

  // =========================================
  // DASHBOARD STATS
  // =========================================

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    freelancers: 0,
    clients: 0,
    projects: 0,
  });

  // =========================================
  // LOADING
  // =========================================

  const [statsLoading, setStatsLoading] = useState(true);

  // =========================================
  // FETCH DASHBOARD STATS
  // =========================================

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/admin/dashboard-stats"
      );

      const data = await response.json();

      console.log("ADMIN DASHBOARD STATS:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load dashboard statistics."
        );
      }

      setStats({
        totalUsers: Number(data.stats.totalUsers) || 0,
        freelancers: Number(data.stats.freelancers) || 0,
        clients: Number(data.stats.clients) || 0,
        projects: Number(data.stats.projects) || 0,
      });
    } catch (error) {
      console.error(
        "FETCH ADMIN DASHBOARD STATS ERROR:",
        error
      );

      // Keep values at 0 if API fails.
      setStats({
        totalUsers: 0,
        freelancers: 0,
        clients: 0,
        projects: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // =========================================
  // GET LOGGED-IN USER
  // =========================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: User =
        JSON.parse(storedUser);

      if (loggedInUser.role !== "admin") {
        router.push("/login");
        return;
      }

      setUser(loggedInUser);

      // Fetch admin dashboard statistics
      fetchDashboardStats();
    } catch (error) {
      console.error(
        "Invalid user data:",
        error
      );

      localStorage.removeItem("user");

      router.push("/login");
    }
  }, [router]);

  // =========================================
  // LOADING PAGE
  // =========================================

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout role="admin">

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

          {/* TOTAL USERS */}

          <StatsCard
            title="Total Users"
            value={
              statsLoading
                ? "..."
                : String(stats.totalUsers)
            }
            icon={Users}
          />

          {/* FREELANCERS */}

          <StatsCard
            title="Freelancers"
            value={
              statsLoading
                ? "..."
                : String(stats.freelancers)
            }
            icon={Briefcase}
          />

          {/* CLIENTS */}

          <StatsCard
            title="Clients"
            value={
              statsLoading
                ? "..."
                : String(stats.clients)
            }
            icon={ShieldCheck}
          />

          {/* PROJECTS */}

          <StatsCard
            title="Projects"
            value={
              statsLoading
                ? "..."
                : String(stats.projects)
            }
            icon={FolderOpen}
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

          {/* Recent Activity */}

          <div className="min-w-0 lg:col-span-2">
            <RecentActivity />
          </div>

          {/* Profile */}

          <div className="min-w-0">
            <ProfileCard
              fullname={user.fullname}
              email={user.email}
              role={user.role}
            />
          </div>

        </div>

      </section>

      {/* ========================================= */}
      {/* QUICK ACTIONS */}
      {/* ========================================= */}

      <section className="mt-5 sm:mt-6">
        <QuickActions />
      </section>

    </DashboardLayout>
  );
}