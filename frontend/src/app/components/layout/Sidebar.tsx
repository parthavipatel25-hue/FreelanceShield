"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  User,
  FolderOpen,
  Briefcase,
  Users,
  FileText,
  LogOut,
  PlusCircle,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "freelancer" | "client";
}

interface LoggedInUser {
  fullname: string;
  role: string;
  email: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);

  let user: LoggedInUser = {
    fullname: "Guest",
    role: "",
    email: "",
  };

  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch (error) {
        console.error("Invalid user data:", error);
      }
    }
  }

  const adminMenu = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
    },
    {
      title: "Profile",
      icon: User,
      href: "/profile",
    },
    {
      title: "Manage Users",
      icon: Users,
      href: "#",
    },
    {
      title: "Reports",
      icon: FileText,
      href: "#",
    },
  ];

  const freelancerMenu = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/freelancer",
    },
    {
      title: "Profile",
      icon: User,
      href: "/profile",
    },
    {
      title: "Browse Projects",
      icon: Briefcase,
      
  href: "/freelancer/browse-projects",
    },
    {
      title: "My Applications",
      icon: FolderOpen,
      href: "#",
    },
  ];

  const clientMenu = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/client",
    },
    {
      title: "Profile",
      icon: User,
      href: "/profile",
    },
   {
  title: "My Projects",
  icon: FolderOpen,
  href: "/client/projects",
},
    {
  title: "Post Project",
  icon: PlusCircle,
  href: "/client/create-project",
},
  ];

  const menu =
    role === "admin"
      ? adminMenu
      : role === "freelancer"
      ? freelancerMenu
      : clientMenu;

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleNavigation = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ========================================= */}
      {/* MOBILE MENU BUTTON */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="
          fixed
          left-4
          top-4
          z-40
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-emerald-600
          text-white
          shadow-lg
          transition
          hover:bg-emerald-700
          lg:hidden
        "
        aria-label="Open menu"
      >
        <Menu size={23} />
      </button>

      {/* ========================================= */}
      {/* MOBILE OVERLAY */}
      {/* ========================================= */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            backdrop-blur-[2px]
            lg:hidden
          "
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ========================================= */}
      {/* SIDEBAR */}
      {/* ========================================= */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-72
          flex-col
          border-r
          border-gray-200
          bg-white
          shadow-lg
          transition-transform
          duration-300
          ease-in-out

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
          lg:z-30
        `}
      >
        {/* ========================================= */}
        {/* LOGO */}
        {/* ========================================= */}

        <div className="border-b border-gray-200 px-6 py-6 sm:px-7 sm:py-8">

          <div className="flex items-start justify-between">

            <div>
              <h1 className="text-2xl font-bold text-emerald-600 sm:text-3xl">
                FreelanceShield
              </h1>

              <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                Work Smart. Earn Better.
              </p>
            </div>

            {/* Mobile Close Button */}

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="
                rounded-lg
                p-2
                text-gray-500
                transition
                hover:bg-gray-100
                hover:text-gray-700
                lg:hidden
              "
              aria-label="Close menu"
            >
              <X size={22} />
            </button>

          </div>

        </div>

        {/* ========================================= */}
        {/* NAVIGATION */}
        {/* ========================================= */}

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-5 sm:py-7">

          <p className="mb-4 px-1 text-xs font-bold uppercase tracking-widest text-gray-400">
            MAIN MENU
          </p>

          <div className="space-y-2">

            {menu.map((item) => {
              const Icon = item.icon;

              const active = pathname === item.href;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={handleNavigation}
                  className={`
                    flex
                    items-center
                    gap-4
                    rounded-xl
                    px-4
                    py-3
                    font-medium
                    transition-all
                    duration-300
                    sm:px-5

                    ${
                      active
                        ? "bg-emerald-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                    }
                  `}
                >
                  <Icon size={21} />

                  <span>{item.title}</span>
                </Link>
              );
            })}

            {/* ========================================= */}
            {/* LOGOUT */}
            {/* ========================================= */}

            <button
              type="button"
              onClick={handleLogout}
              className="
                flex
                w-full
                items-center
                gap-4
                rounded-xl
                px-4
                py-3
                font-medium
                text-red-500
                transition-all
                duration-300
                hover:bg-red-50
                hover:text-red-600
                sm:px-5
              "
            >
              <LogOut size={21} />

              <span>Logout</span>
            </button>

          </div>

        </div>

        {/* ========================================= */}
        {/* USER SECTION */}
        {/* ========================================= */}

        <div className="border-t border-gray-200 p-4">

          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">

            <div className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-emerald-100
              font-semibold
              text-emerald-600
            ">
              {user.fullname
                ? user.fullname.charAt(0).toUpperCase()
                : "G"}
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-gray-800">
                {user.fullname}
              </p>

              <p className="truncate text-xs capitalize text-gray-500">
                {role}
              </p>

            </div>

          </div>

        </div>

      </aside>
    </>
  );
}