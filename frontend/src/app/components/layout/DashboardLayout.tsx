"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "admin" | "freelancer" | "client";
}

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content */}
      <div className="ml-0 min-h-screen lg:ml-72">

        {/* Top Navbar */}
        <TopNavbar />

        {/* Page Content */}
        <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          {children}
        </main>

      </div>

    </div>
  );
}