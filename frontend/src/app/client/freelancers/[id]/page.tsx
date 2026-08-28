"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import DashboardLayout from "../../../components/layout/DashboardLayout";

import {
  ArrowLeft,
  User,
  Mail,
  BriefcaseBusiness,
  MapPin,
  Building2,
  Code2,
  FileText,
  ExternalLink,
  FolderOpen,
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

// ==================================================
// USER
// ==================================================

interface UserData {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

// ==================================================
// FREELANCER PROFILE
// ==================================================

interface FreelancerProfile {
  id?: number;
  user_id?: number;
  profile_picture?: string | null;

  professional_title?: string | null;
  category?: string | null;
  city?: string | null;
  skills?: string | string[] | null;
  about?: string | null;

  linkedin_url?: string | null;
  github_url?: string | null;
  google_drive_url?: string | null;
  resume_url?: string | null;

  fullname?: string | null;
  email?: string | null;
}

// ==================================================
// PORTFOLIO
// ==================================================

interface PortfolioItem {
  id: number;
  freelancer_id: number;
  title: string;
  description: string;
  technologies?: string | null;
  project_link?: string | null;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ==================================================
// PAGE
// ==================================================

export default function ClientFreelancerProfilePage() {
  const router = useRouter();
  const params = useParams();

  const freelancerId = params.id;

  // ==================================================
  // STATE
  // ==================================================

  const [client, setClient] = useState<UserData | null>(null);

  const [freelancer, setFreelancer] =
    useState<UserData | null>(null);

  const [profile, setProfile] =
    useState<FreelancerProfile | null>(null);

  const [portfolio, setPortfolio] =
    useState<PortfolioItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // CHECK LOGGED-IN CLIENT
  // ==================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: UserData =
        JSON.parse(storedUser);

      if (loggedInUser.role !== "client") {
        router.push("/login");
        return;
      }

      setClient(loggedInUser);
    } catch (error) {
      console.error("INVALID USER DATA:", error);

      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // ==================================================
  // LOAD FREELANCER PROFILE + PORTFOLIO
  // ==================================================

  useEffect(() => {
    if (!client || !freelancerId) return;

    const loadFreelancer = async () => {
      try {
        setLoading(true);
        setError("");

        // ==================================================
        // GET FREELANCER PROFILE
        // ==================================================

        const profileResponse = await fetch(
          `${BACKEND_URL}/api/freelancer-profile/${freelancerId}`
        );

        const profileData =
          await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileData.message ||
              "Unable to load freelancer profile."
          );
        }

        const freelancerProfile =
          profileData.profile || profileData;

        if (!freelancerProfile) {
          throw new Error(
            "Freelancer profile was not found."
          );
        }

        setProfile(freelancerProfile);

        // ==================================================
        // GET PORTFOLIO
        // ==================================================

        try {
          const portfolioResponse =
            await fetch(
              `${BACKEND_URL}/api/portfolio/freelancer/${freelancerId}`
            );

          const portfolioData =
            await portfolioResponse.json();

          console.log(
            "PORTFOLIO RESPONSE:",
            portfolioData
          );

          if (
            portfolioResponse.ok &&
            portfolioData.success
          ) {
            setPortfolio(
              Array.isArray(
                portfolioData.portfolios
              )
                ? portfolioData.portfolios
                : []
            );
          } else {
            setPortfolio([]);
          }
        } catch (portfolioError) {
          console.error(
            "FETCH PORTFOLIO ERROR:",
            portfolioError
          );

          setPortfolio([]);
        }

        // ==================================================
        // BUILD FREELANCER USER
        // ==================================================

        setFreelancer({
          id: Number(freelancerId),

          fullname:
            profileData.user?.fullname ||
            freelancerProfile.fullname ||
            "Freelancer",

          email:
            profileData.user?.email ||
            freelancerProfile.email ||
            "Email not available",

          role: "freelancer",
        });
      } catch (error) {
        console.error(
          "LOAD FREELANCER PROFILE ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load freelancer profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadFreelancer();
  }, [client, freelancerId]);

  // ==================================================
  // PARSE SKILLS
  // ==================================================

  const parseSkills = (
    value:
      | string
      | string[]
      | null
      | undefined
  ): string[] => {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => String(item).trim())
        .filter(Boolean);
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch {
      // Not JSON, continue with comma-separated parsing.
    }

    return trimmed
      .split(",")
      .map((item) =>
        item
          .trim()
          .replace(/^["']|["']$/g, "")
      )
      .filter(Boolean);
  };

  const skills = parseSkills(
    profile?.skills
  );

  // ==================================================
  // FILE URL HELPER
  // ==================================================

  const getFileUrl = (
    filePath?: string | null
  ) => {
    if (!filePath) {
      return "";
    }

    if (
      filePath.startsWith("http://") ||
      filePath.startsWith("https://")
    ) {
      return filePath;
    }

    return `${BACKEND_URL}${
      filePath.startsWith("/") ? "" : "/"
    }${filePath}`;
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (!client || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="mt-4 text-gray-600">
            Loading freelancer profile...
          </p>

        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (
    error ||
    !freelancer ||
    !profile
  ) {
    return (
      <DashboardLayout role="client">

        <div className="w-full">

          <button
            type="button"
            onClick={() => router.back()}
            className="
              mb-6
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-gray-600
              transition
              hover:text-emerald-600
            "
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">

              <User
                size={26}
                className="text-red-600"
              />

            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Freelancer profile unavailable
            </h2>

            <p className="mt-2 text-gray-600">
              {error ||
                "Profile details could not be loaded."}
            </p>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  // ==================================================
  // PROFILE FILES
  // ==================================================

  const profilePictureUrl =
    getFileUrl(
      profile.profile_picture
    );

  const resumeUrl =
    getFileUrl(
      profile.resume_url
    );

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <DashboardLayout role="client">

      <div className="w-full space-y-6">

        {/* ========================================== */}
        {/* BACK */}
        {/* ========================================== */}

        <button
          type="button"
          onClick={() => router.back()}
          className="
            flex
            items-center
            gap-2
            text-sm
            font-medium
            text-gray-600
            transition
            hover:text-emerald-600
          "
        >
          <ArrowLeft size={18} />
          Back to Proposals
        </button>

        {/* ========================================== */}
        {/* PROFILE HERO */}
        {/* ========================================== */}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 p-6 shadow-lg sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* AVATAR */}

            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/30 bg-white text-3xl font-bold text-emerald-600 shadow-md">

              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={freelancer.fullname}
                  className="h-full w-full object-cover"
                />
              ) : (
                freelancer.fullname
                  .charAt(0)
                  .toUpperCase()
              )}

            </div>

            {/* BASIC INFO */}

            <div className="min-w-0">

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {freelancer.fullname}
              </h1>

              {profile.professional_title && (
                <p className="mt-1 text-base font-medium text-emerald-100">
                  {profile.professional_title}
                </p>
              )}

              <div className="mt-2 flex items-center gap-2 text-sm text-emerald-50">

                <Mail size={16} />

                <span className="break-all">
                  {freelancer.email}
                </span>

              </div>

              {profile.city && (
                <div className="mt-2 flex items-center gap-2 text-sm text-emerald-50">

                  <MapPin size={16} />

                  <span>
                    {profile.city}
                  </span>

                </div>
              )}

            </div>

          </div>

        </section>

        {/* ========================================== */}
        {/* PROFESSIONAL INFORMATION */}
        {/* ========================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">

              <BriefcaseBusiness
                size={20}
                className="text-emerald-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                Professional Information
              </h2>

              <p className="text-sm text-gray-500">
                Freelancer background and skills
              </p>

            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* PROFESSIONAL TITLE */}

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

              <div className="flex items-center gap-2">

                <BriefcaseBusiness
                  size={16}
                  className="text-emerald-600"
                />

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Professional Title
                </p>

              </div>

              <p className="mt-2 font-semibold text-gray-900">
                {profile.professional_title ||
                  "Not provided"}
              </p>

            </div>

            {/* CATEGORY */}

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

              <div className="flex items-center gap-2">

                <Building2
                  size={16}
                  className="text-emerald-600"
                />

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Category
                </p>

              </div>

              <p className="mt-2 font-semibold text-gray-900">
                {profile.category ||
                  "Not provided"}
              </p>

            </div>

            {/* CITY */}

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

              <div className="flex items-center gap-2">

                <MapPin
                  size={16}
                  className="text-emerald-600"
                />

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  City
                </p>

              </div>

              <p className="mt-2 font-semibold text-gray-900">
                {profile.city ||
                  "Not provided"}
              </p>

            </div>

            {/* EMAIL */}

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

              <div className="flex items-center gap-2">

                <Mail
                  size={16}
                  className="text-emerald-600"
                />

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Email
                </p>

              </div>

              <p className="mt-2 break-all font-semibold text-gray-900">
                {freelancer.email}
              </p>

            </div>

          </div>

          {/* ABOUT */}

          <div className="mt-6 border-t border-gray-100 pt-6">

            <h3 className="text-sm font-semibold text-gray-900">
              About
            </h3>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-600">
              {profile.about ||
                "The freelancer has not added an about section yet."}
            </p>

          </div>

          {/* SKILLS */}

          <div className="mt-6 border-t border-gray-100 pt-6">

            <div className="flex items-center gap-2">

              <Code2
                size={17}
                className="text-emerald-600"
              />

              <h3 className="text-sm font-semibold text-gray-900">
                Skills
              </h3>

            </div>

            {skills.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">

                {skills.map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="
                        rounded-lg
                        bg-emerald-50
                        px-3
                        py-1.5
                        text-sm
                        font-medium
                        text-emerald-700
                      "
                    >
                      {skill}
                    </span>
                  )
                )}

              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                No skills added.
              </p>
            )}

          </div>

        </section>

        {/* ========================================== */}
        {/* PROFESSIONAL LINKS */}
        {/* ========================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-5">

            <h2 className="text-xl font-bold text-gray-900">
              Professional Links
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View the freelancer's external work and documents.
            </p>

          </div>

          <div className="grid gap-3 sm:grid-cols-2">

            {/* LINKEDIN */}

            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  p-4
                  transition
                  hover:border-emerald-200
                  hover:bg-emerald-50
                "
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <span className="text-sm font-bold text-blue-600">
                      in
                    </span>
                  </div>

                  <span className="font-semibold text-gray-800">
                    LinkedIn
                  </span>

                </div>

                <ExternalLink
                  size={17}
                  className="text-gray-400"
                />

              </a>
            )}

            {/* GITHUB */}

            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  p-4
                  transition
                  hover:border-emerald-200
                  hover:bg-emerald-50
                "
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <span className="text-sm font-bold text-gray-800">
                      GH
                    </span>
                  </div>

                  <span className="font-semibold text-gray-800">
                    GitHub
                  </span>

                </div>

                <ExternalLink
                  size={17}
                  className="text-gray-400"
                />

              </a>
            )}

            {/* GOOGLE DRIVE / PREVIOUS WORK */}

            {profile.google_drive_url && (
              <a
                href={profile.google_drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  p-4
                  transition
                  hover:border-emerald-200
                  hover:bg-emerald-50
                "
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
                    <FileText
                      size={20}
                      className="text-yellow-600"
                    />
                  </div>

                  <span className="font-semibold text-gray-800">
                    Google Drive / Previous Work
                  </span>

                </div>

                <ExternalLink
                  size={17}
                  className="text-gray-400"
                />

              </a>
            )}

            {/* RESUME */}

            {profile.resume_url && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  p-4
                  transition
                  hover:border-emerald-200
                  hover:bg-emerald-50
                "
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                    <FileText
                      size={20}
                      className="text-red-500"
                    />
                  </div>

                  <span className="font-semibold text-gray-800">
                    Resume
                  </span>

                </div>

                <ExternalLink
                  size={17}
                  className="text-gray-400"
                />

              </a>
            )}

          </div>

          {!profile.linkedin_url &&
            !profile.github_url &&
            !profile.google_drive_url &&
            !profile.resume_url && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">

                <p className="text-sm text-gray-500">
                  No professional links or documents have been added.
                </p>

              </div>
            )}

        </section>

        {/* ========================================== */}
        {/* PORTFOLIO */}
        {/* ========================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">

              <FolderOpen
                size={20}
                className="text-emerald-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                Portfolio
              </h2>

              <p className="text-sm text-gray-500">
                Previous projects and work samples.
              </p>

            </div>

          </div>

          {portfolio.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">

              <FolderOpen
                size={34}
                className="mx-auto text-gray-400"
              />

              <p className="mt-3 text-sm font-medium text-gray-700">
                No portfolio items available.
              </p>

              <p className="mt-1 text-xs text-gray-500">
                This freelancer has not added any portfolio items yet.
              </p>

            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">

              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    transition
                    hover:border-emerald-200
                    hover:shadow-sm
                  "
                >

                  {/* PORTFOLIO IMAGE */}

                  {item.image ? (
                    <div className="h-48 overflow-hidden bg-gray-100">

                      <img
                        src={getFileUrl(
                          item.image
                        )}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />

                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-emerald-50">

                      <FolderOpen
                        size={38}
                        className="text-emerald-500"
                      />

                    </div>
                  )}

                  {/* PORTFOLIO CONTENT */}

                  <div className="p-5">

                    <h3 className="text-lg font-bold text-gray-900">
                      {item.title}
                    </h3>

                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                      {item.description}
                    </p>

                    {/* TECHNOLOGIES */}

                    {item.technologies && (
                      <div className="mt-4">

                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Technologies
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {item.technologies
                            .split(",")
                            .map(
                              (
                                technology,
                                index
                              ) => (
                                <span
                                  key={`${technology.trim()}-${index}`}
                                  className="
                                    rounded-full
                                    bg-emerald-50
                                    px-3
                                    py-1
                                    text-xs
                                    font-medium
                                    text-emerald-700
                                  "
                                >
                                  {technology.trim()}
                                </span>
                              )
                            )}

                        </div>

                      </div>
                    )}

                    {/* PROJECT LINK */}

                    {item.project_link && (
                      <a
                        href={item.project_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          mt-4
                          inline-flex
                          items-center
                          gap-2
                          text-sm
                          font-semibold
                          text-emerald-600
                          transition
                          hover:text-emerald-700
                        "
                      >
                        View Project
                        <ExternalLink
                          size={15}
                        />
                      </a>
                    )}

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>

    </DashboardLayout>
  );
}