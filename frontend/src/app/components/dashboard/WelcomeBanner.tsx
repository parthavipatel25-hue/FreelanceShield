"use client";

import { Sparkles } from "lucide-react";

interface WelcomeBannerProps {
  fullname: string;
  role?: string;
}

export default function WelcomeBanner({
  fullname,
  role,
}: WelcomeBannerProps) {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  // Role based messages
  const roleMessages: Record<string, string> = {
    admin:
      "Manage users, monitor platform activities, review reports, and keep FreelanceShield running efficiently.",

    freelancer:
      "Discover exciting projects, submit proposals, manage your work, and grow your freelance career with confidence.",

    client:
      "Post projects, hire talented freelancers, track project progress, and build successful collaborations effortlessly.",
  };

  const currentRole = role?.toLowerCase().trim() || "";

  const message =
    roleMessages[currentRole] ||
    "Welcome to FreelanceShield. Have a productive day!";

  return (
    <div
      className="
        relative
        w-full
        overflow-hidden
        rounded-3xl
        bg-gradient-to-r
        from-emerald-500
        to-teal-500
        px-5
        py-7
        shadow-lg
        sm:px-7
        sm:py-8
        md:px-9
        md:py-9
        lg:px-10
        lg:py-10
      "
    >
      {/* ================================= */}
      {/* BACKGROUND EFFECTS */}
      {/* ================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          bg-white/10
          blur-3xl
          sm:h-52
          sm:w-52
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-16
          -left-16
          h-36
          w-36
          rounded-full
          bg-white/10
          blur-3xl
          sm:h-48
          sm:w-48
        "
      />

      {/* ================================= */}
      {/* CONTENT */}
      {/* ================================= */}

      <div
        className="
          relative
          z-10
          flex
          items-center
          justify-between
          gap-5
        "
      >
        {/* ================================= */}
        {/* TEXT */}
        {/* ================================= */}

        <div className="min-w-0 max-w-3xl">

          {/* Greeting */}

          <p
            className="
              text-base
              font-medium
              text-emerald-100
              sm:text-lg
            "
          >
            {greeting},
          </p>

          {/* Name */}

          <h1
            className="
              mt-1
              break-words
              text-3xl
              font-bold
              leading-tight
              text-white
              sm:mt-2
              sm:text-4xl
              md:text-5xl
            "
          >
            {fullname} 👋
          </h1>

          {/* Description */}

          <p
            className="
              mt-4
              max-w-2xl
              text-sm
              leading-6
              text-emerald-50
              sm:mt-5
              sm:text-base
              sm:leading-7
            "
          >
            {message}
          </p>

        </div>

        {/* ================================= */}
        {/* SPARKLES */}
        {/* ================================= */}

        <div
          className="
            hidden
            h-20
            w-20
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-white/20
            md:flex
            lg:h-24
            lg:w-24
          "
        >
          <Sparkles
            size={40}
            className="text-white lg:h-12 lg:w-12"
          />
        </div>

      </div>
    </div>
  );
}