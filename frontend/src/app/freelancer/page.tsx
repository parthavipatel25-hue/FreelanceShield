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

export default function FreelancerPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

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

  if (!user) {
    return null;
  }

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

          <StatsCard
            title="Available Jobs"
            value="0"
            subtitle="Open for applications"
            icon={Briefcase}
          />

          <StatsCard
            title="Applications"
            value="0"
            subtitle="Submitted"
            icon={FileText}
          />

          <StatsCard
            title="Ongoing"
            value="0"
            subtitle="Current Projects"
            icon={Clock}
          />

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