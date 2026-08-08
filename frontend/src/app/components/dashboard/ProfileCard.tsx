"use client";

import { useEffect, useState } from "react";
import {
  UserCircle2,
  Mail,
  Shield,
  Pencil,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileCardProps {
  fullname: string;
  email: string;
  role: string;
  profileExists?: boolean;
}

export default function ProfileCard({
  fullname,
  email,
  role,
  profileExists = false,
}: ProfileCardProps) {
  const router = useRouter();

  // =========================================
  // STATE
  // =========================================

  const [hasProfile, setHasProfile] =
    useState<boolean>(profileExists);

  const [checkingProfile, setCheckingProfile] =
    useState(true);

  // =========================================
  // ROLE
  // =========================================

  const userRole = role?.toLowerCase();

  const isAdmin = userRole === "admin";
  const isFreelancer = userRole === "freelancer";
  const isClient = userRole === "client";

  // =========================================
  // CHECK PROFILE FROM BACKEND
  // =========================================

  useEffect(() => {
    const checkProfile = async () => {
      // Admin does not have freelancer/client profile
      if (isAdmin) {
        setCheckingProfile(false);
        return;
      }

      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        setCheckingProfile(false);
        return;
      }

      try {
        const user = JSON.parse(storedUser);

        const userId = user?.id;

        if (!userId) {
          setCheckingProfile(false);
          return;
        }

        // =====================================
        // FREELANCER PROFILE
        // =====================================

        if (isFreelancer) {
          const response = await fetch(
            `http://localhost:5000/api/freelancer-profile/${userId}`
          );

          if (response.ok) {
            const data = await response.json();

            if (data.success && data.profile) {
              setHasProfile(true);
            } else {
              setHasProfile(false);
            }
          } else if (response.status === 404) {
            setHasProfile(false);
          }
        }

        // =====================================
        // CLIENT PROFILE
        // =====================================

        if (isClient) {
          const response = await fetch(
            `http://localhost:5000/api/client-profile/${userId}`
          );

          if (response.ok) {
            const data = await response.json();

            if (data.success && data.profile) {
              setHasProfile(true);
            } else {
              setHasProfile(false);
            }
          } else if (response.status === 404) {
            setHasProfile(false);
          }
        }
      } catch (error) {
        console.error(
          "CHECK PROFILE ERROR:",
          error
        );
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [
    isAdmin,
    isFreelancer,
    isClient,
  ]);

  // =========================================
  // CREATE / EDIT PROFILE
  // =========================================

  const handleProfile = () => {
    // =====================================
    // PROFILE EXISTS → EDIT
    // =====================================

    if (hasProfile) {
      router.push("/profile");
      return;
    }

    // =====================================
    // FREELANCER → CREATE
    // =====================================

    if (isFreelancer) {
      router.push("/create-profile");
      return;
    }

    // =====================================
    // CLIENT → CREATE
    // =====================================

    if (isClient) {
      router.push("/client-create-profile");
      return;
    }
  };

  // =========================================
  // PROFILE COMPLETION
  // =========================================

  const profileCompletion = hasProfile
    ? 100
    : 0;

  // =========================================
  // DO NOT SHOW PROFILE SECTION FOR ADMIN
  // =========================================

  return (
    <div
      className="
        w-full
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        transition
        duration-300
        hover:shadow-md
        sm:p-6
      "
    >
      {/* =========================================
          AVATAR
      ========================================= */}

      <div className="flex flex-col items-center">
        <div
          className="
            rounded-full
            border-4
            border-emerald-100
            bg-emerald-50
            p-1.5
            sm:p-2
          "
        >
          <UserCircle2
            size={68}
            className="text-emerald-500 sm:h-20 sm:w-20"
          />
        </div>

        {/* =========================================
            NAME
        ========================================= */}

        <h2
          className="
            mt-3
            max-w-full
            break-words
            text-center
            text-lg
            font-bold
            leading-6
            text-gray-900
            sm:mt-4
            sm:text-xl
          "
        >
          {fullname}
        </h2>

        {/* =========================================
            ROLE
        ========================================= */}

        <span
          className="
            mt-2
            rounded-full
            bg-emerald-100
            px-3
            py-1
            text-xs
            font-medium
            capitalize
            text-emerald-700
            sm:px-4
            sm:text-sm
          "
        >
          {role}
        </span>
      </div>

      {/* =========================================
          DIVIDER
      ========================================= */}

      <div className="my-4 h-px w-full bg-gray-200 sm:my-5" />

      {/* =========================================
          EMAIL
      ========================================= */}

      <div
        className="
          flex
          min-w-0
          w-full
          items-center
          gap-3
          rounded-xl
          bg-gray-50
          p-3
        "
      >
        <Mail
          size={18}
          className="shrink-0 text-emerald-500"
        />

        <p
          className="
            min-w-0
            flex-1
            truncate
            text-xs
            text-gray-700
            sm:text-sm
          "
          title={email}
        >
          {email}
        </p>
      </div>

      {/* =========================================
          ACCOUNT TYPE
      ========================================= */}

      <div
        className="
          mt-3
          flex
          w-full
          items-center
          gap-3
          rounded-xl
          bg-gray-50
          p-3
        "
      >
        <Shield
          size={18}
          className="shrink-0 text-emerald-500"
        />

        <p className="text-xs capitalize text-gray-700 sm:text-sm">
          {role} Account
        </p>
      </div>

      {/* =========================================
          PROFILE SECTION
          ONLY FREELANCER / CLIENT
      ========================================= */}

      {!isAdmin &&
        (isFreelancer || isClient) && (
          <>
            {/* =====================================
                PROFILE COMPLETION
            ===================================== */}

            <div className="mt-5 w-full">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-gray-600 sm:text-sm">
                  Profile Completion
                </span>

                <span className="shrink-0 text-xs font-bold text-emerald-600 sm:text-sm">
                  {checkingProfile
                    ? "..."
                    : `${profileCompletion}%`}
                </span>
              </div>

              {/* Progress Bar */}

              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="
                    h-2
                    rounded-full
                    bg-emerald-500
                    transition-all
                    duration-500
                  "
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>
            </div>

            {/* =====================================
                CREATE / EDIT PROFILE BUTTON
            ===================================== */}

            <button
              type="button"
              onClick={handleProfile}
              disabled={checkingProfile}
              className="
                mt-5
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-500
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                duration-300
                hover:bg-emerald-600
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:mt-6
                sm:py-3
                sm:text-base
              "
            >
              {checkingProfile ? (
                "Checking Profile..."
              ) : hasProfile ? (
                <>
                  <Pencil size={17} />
                  Edit Profile
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Profile
                </>
              )}
            </button>
          </>
        )}
    </div>
  );
}