
"use client";

interface ProfileCompletionProps {
  progress?: number;
  role?: string;
}

export default function ProfileCompletion({
  progress = 0,
  role = "",
}: ProfileCompletionProps) {
  // Admin should not have profile completion
  if (role.toLowerCase() === "admin") {
    return null;
  }

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-sm sm:p-6">

      {/* ================================= */}
      {/* TITLE */}
      {/* ================================= */}

      <h2 className="text-xl font-bold text-gray-800">
        Profile Completion
      </h2>

      {/* ================================= */}
      {/* DESCRIPTION */}
      {/* ================================= */}

      <p className="mt-2 text-gray-500">
        Complete your profile to attract more clients.
      </p>

      {/* ================================= */}
      {/* PROGRESS BAR */}
      {/* ================================= */}

      <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-gray-200">

        <div
          className="h-3 rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />

      </div>

      {/* ================================= */}
      {/* PROGRESS TEXT */}
      {/* ================================= */}

      <p className="mt-3 font-semibold text-emerald-600">
        {progress}% Completed
      </p>

    </div>
  );
}
