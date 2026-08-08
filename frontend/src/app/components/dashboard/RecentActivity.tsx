"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  BriefcaseBusiness,
  CheckCircle,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";

type Role = "admin" | "freelancer" | "client";

interface User {
  role: Role;
}

interface Activity {
  icon: React.ElementType;
  text: string;
}

export default function RecentActivity() {
  const [role, setRole] = useState<Role>("freelancer");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return;

    try {
      const user: User = JSON.parse(storedUser);

      if (
        user.role === "admin" ||
        user.role === "freelancer" ||
        user.role === "client"
      ) {
        setRole(user.role);
      }
    } catch (err) {
      console.error("Invalid user data:", err);
    }
  }, []);

  const activities: Record<Role, Activity[]> = {
    admin: [
      {
        icon: UserPlus,
        text: "A new freelancer registered on the platform.",
      },
      {
        icon: BriefcaseBusiness,
        text: "A client posted a new project.",
      },
      {
        icon: Users,
        text: "User management records were updated.",
      },
      {
        icon: ShieldCheck,
        text: "Platform security settings were reviewed.",
      },
    ],

    freelancer: [
      {
        icon: BriefcaseBusiness,
        text: "A new project matching your skills was posted.",
      },
      {
        icon: FileText,
        text: "Your proposal was viewed by a client.",
      },
      {
        icon: CheckCircle,
        text: "Project milestone marked as completed.",
      },
      {
        icon: UserPlus,
        text: "A client invited you to apply for a project.",
      },
    ],

    client: [
      {
        icon: BriefcaseBusiness,
        text: "Your project received new proposals.",
      },
      {
        icon: Users,
        text: "A freelancer accepted your invitation.",
      },
      {
        icon: CheckCircle,
        text: "One of your projects was completed successfully.",
      },
      {
        icon: FileText,
        text: "Project progress report was updated.",
      },
    ],
  };

  const currentActivities = activities[role] ?? [];

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-sm sm:p-6">

      {/* ================================= */}
      {/* TITLE */}
      {/* ================================= */}

      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Recent Activity
        </h2>

        <p className="mt-1 text-xs text-gray-400 sm:text-sm">
          Latest activity from your account
        </p>
      </div>

      {/* ================================= */}
      {/* ACTIVITIES */}
      {/* ================================= */}

      <div className="space-y-3 sm:space-y-4">

        {currentActivities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div
              key={index}
              className="
                flex
                min-w-0
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                p-3
                transition-all
                duration-300
                hover:border-emerald-300
                hover:bg-emerald-50
                sm:gap-4
                sm:p-4
              "
            >

              {/* Icon */}

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-100
                  sm:h-12
                  sm:w-12
                "
              >
                <Icon
                  size={20}
                  className="text-emerald-600 sm:h-[22px] sm:w-[22px]"
                />
              </div>

              {/* Activity Text */}

              <p
                className="
                  min-w-0
                  flex-1
                  break-words
                  text-xs
                  leading-5
                  text-gray-600
                  sm:text-sm
                  sm:leading-6
                "
              >
                {activity.text}
              </p>

            </div>
          );
        })}

      </div>
    </div>
  );
}