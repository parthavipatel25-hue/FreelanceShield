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
  FileSignature,
  LogOut,
  PlusCircle,
  Menu,
  X,
  MessageCircle,
  ListChecks,
  Star,
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

  // =========================================
  // GET LOGGED-IN USER
  // =========================================

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

  // =========================================
  // ADMIN MENU
  // =========================================

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

  // =========================================
  // FREELANCER MENU
  // =========================================

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
      href: "/freelancer/applications",
    },
    {
      title: "My Portfolio",
      icon: Briefcase,
      href: "/freelancer/portfolio",
    },
    {
      title: "My Contracts",
      icon: FileSignature,
      href: "/freelancer/contracts",
    },
    {
      title: "Milestones",
      icon: ListChecks,
      href: "/freelancer/milestones",
    },
    {
  title: "Ratings & Reviews",
  icon: Star,
  href: "/freelancer/reviews",
},
    {
      title: "Messages",
      icon: MessageCircle,
      href: "/freelancer/messages",
    },
  ];

  // =========================================
  // CLIENT MENU
  // =========================================

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
      title: "Proposals",
      icon: FileText,
      href: "/client/proposals",
    },
    {
      title: "My Contracts",
      icon: FileSignature,
      href: "/client/contracts",
    },
    
    {
      title: "Milestones",
      icon: ListChecks,
      href: "/client/milestones",
    },
    {
      title: "Ratings & Reviews",
      icon: Star,
      href: "/client/reviews",
    },
    
    {
      title: "Messages",
      icon: MessageCircle,
      href: "/client/messages",
    },
    {
      title: "Post Project",
      icon: PlusCircle,
      href: "/client/create-project",
    },
  ];

  // =========================================
  // SELECT MENU BASED ON ROLE
  // =========================================

  const menu =
    role === "admin"
      ? adminMenu
      : role === "freelancer"
      ? freelancerMenu
      : clientMenu;

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setMobileOpen(false);

    router.push("/login");
  };

  // =========================================
  // MOBILE NAVIGATION
  // =========================================

  const handleNavigation = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* =========================================
          MOBILE MENU BUTTON
      ========================================= */}

      {!mobileOpen && (
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

            transition-all
            duration-300

            hover:bg-emerald-700
            active:scale-95

            lg:hidden
          "
          aria-label="Open menu"
        >
          <Menu size={23} />
        </button>
      )}

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

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

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50

          flex
          h-screen
          w-[280px]
          max-w-[85vw]
          flex-col

          border-r
          border-gray-200
          bg-white
          shadow-xl

          transition-transform
          duration-300
          ease-in-out

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:z-30
          lg:w-72
          lg:translate-x-0
        `}
      >
        {/* =========================================
            LOGO SECTION
        ========================================= */}

        <div
          className="
            shrink-0
            border-b
            border-gray-200
            px-5
            py-5

            sm:px-6
            sm:py-6

            lg:px-7
            lg:py-7
          "
        >
          <div className="flex items-start justify-between gap-3">
            {/* LOGO */}

            <div className="min-w-0">
              <h1
                className="
                  truncate
                  text-2xl
                  font-bold
                  text-emerald-600

                  sm:text-3xl
                "
              >
                FreelanceShield
              </h1>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500

                  sm:mt-2
                  sm:text-sm
                "
              >
                Work Smart. Earn Better.
              </p>
            </div>

            {/* MOBILE CLOSE BUTTON */}

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-lg
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

        {/* =========================================
            NAVIGATION
        ========================================= */}

        <div
          className="
            flex-1
            overflow-y-auto

            px-3
            py-5

            sm:px-4
            sm:py-6

            lg:px-5
            lg:py-7
          "
        >
          <p
            className="
              mb-3
              px-2

              text-[11px]
              font-bold
              uppercase
              tracking-widest
              text-gray-400

              sm:mb-4
              sm:text-xs
            "
          >
            MAIN MENU
          </p>

          <div className="space-y-1.5 sm:space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                (item.href !== "#" &&
                  item.href !== "/client" &&
                  item.href !== "/admin" &&
                  item.href !== "/freelancer" &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={handleNavigation}
                  className={`
                    flex
                    min-h-[46px]
                    items-center
                    gap-3

                    rounded-xl
                    px-4
                    py-3

                    text-sm
                    font-medium

                    transition-all
                    duration-200

                    sm:gap-4
                    sm:px-5
                    sm:text-base

                    ${
                      active
                        ? "bg-emerald-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className="shrink-0"
                  />

                  <span className="truncate">
                    {item.title}
                  </span>
                </Link>
              );
            })}

            {/* =========================================
                LOGOUT
            ========================================= */}

            <button
              type="button"
              onClick={handleLogout}
              className="
                mt-2
                flex
                min-h-[46px]
                w-full
                items-center
                gap-3

                rounded-xl
                px-4
                py-3

                text-sm
                font-medium
                text-red-500

                transition-all
                duration-200

                hover:bg-red-50
                hover:text-red-600

                sm:gap-4
                sm:px-5
                sm:text-base
              "
            >
              <LogOut
                size={20}
                className="shrink-0"
              />

              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* =========================================
            USER SECTION
        ========================================= */}

        <div
          className="
            shrink-0
            border-t
            border-gray-200

            p-3

            sm:p-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-3

              rounded-xl
              bg-gray-50
              p-3
            "
          >
            {/* USER AVATAR */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-full
                bg-emerald-100

                text-sm
                font-semibold
                text-emerald-600
              "
            >
              {user.fullname
                ? user.fullname
                    .charAt(0)
                    .toUpperCase()
                : "G"}
            </div>

            {/* USER INFORMATION */}

            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-gray-800
                "
              >
                {user.fullname}
              </p>

              <p
                className="
                  truncate
                  text-xs
                  capitalize
                  text-gray-500
                "
              >
                {role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}