"use client";

import Link from "next/link";
import { Bell, Search, Settings } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  fullname: string;
  role: "admin" | "freelancer" | "client";
}

export default function TopNavbar() {
  const [role, setRole] = useState<
    "admin" | "freelancer" | "client"
  >("freelancer");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        setRole(user.role);
      } catch (error) {
        console.error("Invalid user data:", error);
      }
    }
  }, []);

  const placeholder =
    role === "admin"
      ? "Search users, freelancers, clients..."
      : role === "freelancer"
      ? "Search projects, clients, categories..."
      : "Search freelancers, skills, services...";

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">

     <div className="
  flex
  min-h-[72px]
  items-center
  justify-between
  gap-3
  pl-20
  pr-4
  py-3
  sm:px-6
  lg:px-8
">

        {/* ================================= */}
        {/* SEARCH */}
        {/* ================================= */}

        <div className="relative min-w-0 flex-1 max-w-[420px]">

          <Search
            size={19}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
              sm:left-4
            "
          />

          <input
            type="text"
            placeholder={placeholder}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              bg-gray-50
              py-2.5
              pl-10
              pr-3
              text-xs
              outline-none
              transition-all
              duration-300
              focus:border-emerald-500
              focus:bg-white
              focus:ring-2
              focus:ring-emerald-100
              sm:py-3
              sm:pl-12
              sm:pr-4
              sm:text-sm
            "
          />

        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Notification */}

          <button
            type="button"
            aria-label="Notifications"
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-gray-200
              bg-white
              transition-all
              duration-300
              hover:bg-gray-100
              sm:h-11
              sm:w-11
            "
          >

            <Bell
              size={19}
              className="text-gray-700 sm:h-[22px] sm:w-[22px]"
            />

            {/* Notification Dot */}

            <span
              className="
                absolute
                right-1.5
                top-1.5
                h-2
                w-2
                rounded-full
                bg-red-500
                sm:right-2
                sm:top-2
                sm:h-2.5
                sm:w-2.5
              "
            />

          </button>

          {/* Settings */}

          <Link
            href="/settings"
            aria-label="Settings"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-gray-200
              bg-white
              text-gray-700
              transition-all
              duration-300
              hover:border-emerald-500
              hover:bg-emerald-50
              hover:text-emerald-600
              sm:h-auto
              sm:w-auto
              sm:gap-2
              sm:px-4
              sm:py-3
            "
          >

            <Settings
              size={19}
              className="sm:h-5 sm:w-5"
            />

            {/* Hide text on mobile */}

            <span className="hidden font-medium sm:block">
              Settings
            </span>

          </Link>

        </div>

      </div>

    </header>
  );
}