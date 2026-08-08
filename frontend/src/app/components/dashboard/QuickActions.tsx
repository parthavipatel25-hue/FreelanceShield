"use client";

import {
  PlusCircle,
  Users,
  Settings,
  ShieldCheck,
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Add User",
      icon: Users,
    },
    {
      title: "Manage Roles",
      icon: ShieldCheck,
    },
    {
      title: "Create Project",
      icon: PlusCircle,
    },
    {
      title: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-sm sm:p-6">

      {/* ================================= */}
      {/* TITLE */}
      {/* ================================= */}

      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Quick Actions
        </h2>

        <p className="mt-1 text-xs text-gray-400 sm:text-sm">
          Quickly access common actions
        </p>
      </div>

      {/* ================================= */}
      {/* ACTIONS */}
      {/* ================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          sm:gap-4
          lg:grid-cols-4
        "
      >
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              type="button"
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                p-3
                text-left
                transition-all
                duration-300
                hover:border-emerald-500
                hover:bg-emerald-50
                active:scale-[0.98]
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
                  sm:h-11
                  sm:w-11
                "
              >
                <Icon
                  size={20}
                  className="text-emerald-500 sm:h-6 sm:w-6"
                />
              </div>

              {/* Title */}

              <span
                className="
                  min-w-0
                  flex-1
                  truncate
                  text-sm
                  font-medium
                  text-gray-700
                  sm:text-base
                "
              >
                {action.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}