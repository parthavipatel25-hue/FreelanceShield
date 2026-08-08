"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../components/layout/DashboardLayout";
import EditProfileForm from "../components/profile/EditProfileForm";
import ChangePasswordForm from "../components/profile/ChangePasswordForm";

import {
  BriefcaseBusiness,
  UserRound,
  LockKeyhole,
  CheckCircle2,
  FolderOpen,
  IndianRupee,
  Users,
  MapPin,
  Building2,
  Code2,
  ExternalLink,
  FileText,
} from "lucide-react";

// ==================================================
// BACKEND URL
// ==================================================

const BACKEND_URL = "http://localhost:5000";

// ==================================================
// USER TYPE
// ==================================================

export interface User {
  id: number;
  fullname: string;
  email: string;
  role: "freelancer" | "client";
}

// ==================================================
// PROFILE DATA TYPE
// ==================================================

interface ProfileData {
  id?: number;
  user_id?: number;

  profile_picture?: string | null;

  // Freelancer
  professional_title?: string | null;
  category?: string | null;
  city?: string | null;
  skills?: string | string[] | null;
  about?: string | null;

  linkedin_url?: string | null;
  github_url?: string | null;
  google_drive_url?: string | null;
  resume_url?: string | null;

  // Client
  full_name?: string | null;
  company_name?: string | null;
  industry?: string | null;
  requirements?: string | string[] | null;
  company_website?: string | null;

  profile_exists?: boolean;
}

// ==================================================
// PROFILE PAGE
// ==================================================

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  // ==================================================
  // LOAD LOGGED-IN USER
  // ==================================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const loggedInUser: User =
        JSON.parse(storedUser);

      if (
        !loggedInUser ||
        !loggedInUser.id ||
        !loggedInUser.fullname ||
        !loggedInUser.email ||
        !loggedInUser.role
      ) {
        throw new Error(
          "Invalid user data"
        );
      }

      if (
        loggedInUser.role !== "freelancer" &&
        loggedInUser.role !== "client"
      ) {
        throw new Error(
          "Invalid user role"
        );
      }

      setUser(loggedInUser);
    } catch (error) {
      console.error(
        "Invalid user data:",
        error
      );

      localStorage.removeItem("user");

      router.replace("/login");
    }
  }, [router]);

  // ==================================================
  // LOAD PROFILE
  // ==================================================

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        const endpoint =
          user.role === "freelancer"
            ? `${BACKEND_URL}/api/freelancer-profile/${user.id}`
            : `${BACKEND_URL}/api/client-profile/${user.id}`;

        console.log(
          "PROFILE API:",
          endpoint
        );

        const response =
          await fetch(endpoint);

        const data =
          await response.json();

        console.log(
          "PROFILE RESPONSE:",
          data
        );

        if (!response.ok) {
          setProfile(null);
          return;
        }

        const profileData =
          data?.profile || data;

        if (
          profileData &&
          !profileData.message
        ) {
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error(
          "PROFILE LOAD ERROR:",
          error
        );

        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // ==================================================
  // LOADING
  // ==================================================

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  // ==================================================
  // ROLE
  // ==================================================

  const isFreelancer =
    user.role === "freelancer";

  const roleTitle = isFreelancer
    ? "Freelancer Profile"
    : "Client Profile";

  const roleDescription = isFreelancer
    ? "Manage your professional profile and freelance account."
    : "Manage your client profile and project information.";

  // ==================================================
  // PROFILE VALUES
  // ==================================================

  const profileName =
    profile?.full_name ||
    user.fullname;

  const professionalTitle =
    profile?.professional_title || "";

  const category =
    profile?.category || "";

  const companyName =
    profile?.company_name || "";

  const industry =
    profile?.industry || "";

  const city =
    profile?.city || "";

  const about =
    profile?.about || "";

  // ==================================================
  // SKILLS
  // ==================================================

  const skills: string[] =
    Array.isArray(profile?.skills)
      ? profile.skills
      : typeof profile?.skills ===
          "string"
        ? profile.skills
            .split(",")
            .map((skill) =>
              skill.trim()
            )
            .filter(Boolean)
        : [];

  // ==================================================
  // REQUIREMENTS
  // ==================================================

  const requirements: string[] =
    Array.isArray(
      profile?.requirements
    )
      ? profile.requirements
      : typeof profile?.requirements ===
          "string"
        ? profile.requirements
            .split(",")
            .map((requirement) =>
              requirement.trim()
            )
            .filter(Boolean)
        : [];

  // ==================================================
  // LINKS
  // ==================================================

  const linkedinUrl =
    profile?.linkedin_url || "";

  const githubUrl =
    profile?.github_url || "";

  const googleDriveUrl =
    profile?.google_drive_url || "";

  const resumeUrl =
    profile?.resume_url || "";

  const companyWebsite =
    profile?.company_website || "";

  // ==================================================
  // FILE URL HELPER
  // ==================================================

  const getFileUrl = (
    filePath: string
  ) => {
    if (!filePath) return "";

    // Already a complete URL
    if (
      filePath.startsWith("http://") ||
      filePath.startsWith("https://")
    ) {
      return filePath;
    }

    // Backend file
    return `${BACKEND_URL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const profilePictureUrl =
    profile?.profile_picture
      ? getFileUrl(
          profile.profile_picture
        )
      : "";

  const resumeFullUrl =
    resumeUrl
      ? getFileUrl(resumeUrl)
      : "";

  // ==================================================
  // UI
  // ==================================================

  return (
    <DashboardLayout role={user.role}>
      <div className="space-y-8">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Account
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            {roleTitle}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            {roleDescription}
          </p>
        </div>

        {/* ==================================================
            PROFILE HERO
        ================================================== */}

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 p-6 shadow-lg sm:p-8">

          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex min-w-0 items-center gap-4 sm:gap-5">

              {/* AVATAR */}

              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/30 bg-white text-2xl font-bold text-emerald-600 shadow-md sm:h-24 sm:w-24 sm:text-3xl">

                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={profileName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profileName
                    .charAt(0)
                    .toUpperCase()
                )}

              </div>

              {/* USER INFORMATION */}

              <div className="min-w-0">

                <h2 className="truncate text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                  {profileName}
                </h2>

                {isFreelancer &&
                  professionalTitle && (
                    <p className="mt-1 truncate text-sm font-medium text-emerald-100 sm:text-base">
                      {professionalTitle}
                    </p>
                  )}

                <p className="mt-1 truncate text-sm text-emerald-50 sm:text-base">
                  {user.email}
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold capitalize text-white backdrop-blur-sm sm:text-sm">

                  {isFreelancer ? (
                    <BriefcaseBusiness size={15} />
                  ) : (
                    <UserRound size={15} />
                  )}

                  {user.role}

                </div>

              </div>
            </div>

            {/* SECURITY BADGE */}

            <div className="hidden items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm sm:flex">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <LockKeyhole
                  size={20}
                  className="text-white"
                />
              </div>

              <div>
                <p className="text-xs text-emerald-100">
                  Account Status
                </p>

                <p className="text-sm font-semibold text-white">
                  Active
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* ==================================================
            PROFILE INFORMATION
        ================================================== */}

        <section>

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <UserRound
                size={20}
                className="text-emerald-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Profile Information
              </h2>

              <p className="text-sm text-gray-500">
                Details added to your profile
              </p>
            </div>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

            {profileLoading ? (
              <p className="text-sm text-gray-500">
                Loading profile details...
              </p>
            ) : profile ? (

              <div className="space-y-6">

                {/* BASIC INFORMATION */}

                <div className="grid gap-5 md:grid-cols-2">

                  {/* FULL NAME */}

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Full Name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {profileName}
                    </p>

                  </div>

                  {/* EMAIL */}

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                      {user.email}
                    </p>

                  </div>

                  {/* PROFESSIONAL TITLE */}

                  {isFreelancer &&
                    professionalTitle && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                        <div className="flex items-center gap-2">

                          <BriefcaseBusiness
                            size={15}
                            className="text-emerald-500"
                          />

                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Professional Title
                          </p>

                        </div>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {professionalTitle}
                        </p>

                      </div>
                    )}

                  {/* CATEGORY */}

                  {isFreelancer &&
                    category && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Category
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {category}
                        </p>

                      </div>
                    )}

                  {/* COMPANY */}

                  {companyName && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                      <div className="flex items-center gap-2">

                        <Building2
                          size={15}
                          className="text-emerald-500"
                        />

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Company / Organization
                        </p>

                      </div>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {companyName}
                      </p>

                    </div>
                  )}

                  {/* INDUSTRY */}

                  {industry && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Industry
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {industry}
                      </p>

                    </div>
                  )}

                  {/* CITY */}

                  {city && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                      <div className="flex items-center gap-2">

                        <MapPin
                          size={15}
                          className="text-emerald-500"
                        />

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          City
                        </p>

                      </div>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {city}
                      </p>

                    </div>
                  )}

                </div>

                {/* ABOUT */}

                {about && (
                  <div className="border-t border-gray-100 pt-5">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      About
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {about}
                    </p>

                  </div>
                )}

                {/* SKILLS */}

                {isFreelancer && (
                  <div className="border-t border-gray-100 pt-5">

                    <div className="flex items-center gap-2">

                      <Code2
                        size={17}
                        className="text-emerald-500"
                      />

                      <p className="text-sm font-semibold text-gray-900">
                        Skills
                      </p>

                    </div>

                    {skills.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">

                        {skills.map(
                          (
                            skill,
                            index
                          ) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700"
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
                )}

                {/* CLIENT REQUIREMENTS */}

                {!isFreelancer &&
                  requirements.length >
                    0 && (
                    <div className="border-t border-gray-100 pt-5">

                      <p className="text-sm font-semibold text-gray-900">
                        Hiring Requirements
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {requirements.map(
                          (
                            requirement,
                            index
                          ) => (
                            <span
                              key={`${requirement}-${index}`}
                              className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"
                            >
                              {requirement}
                            </span>
                          )
                        )}

                      </div>

                    </div>
                  )}

                {/* ==================================================
                    PROFESSIONAL LINKS & DOCUMENTS
                ================================================== */}

                {(linkedinUrl ||
                  githubUrl ||
                  googleDriveUrl ||
                  resumeUrl ||
                  companyWebsite) && (

                  <div className="border-t border-gray-100 pt-5">

                    <p className="text-sm font-semibold text-gray-900">
                      Professional Links & Documents
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">

                      {/* LINKEDIN */}

                      {linkedinUrl && (
                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50"
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 font-bold text-blue-600">
                            in
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-sm font-semibold text-gray-800">
                              LinkedIn
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {linkedinUrl}
                            </p>

                          </div>

                          <ExternalLink
                            size={16}
                            className="shrink-0 text-gray-400"
                          />

                        </a>
                      )}

                      {/* GITHUB */}

                      {githubUrl && (
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50"
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 font-bold text-gray-800">
                            GH
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-sm font-semibold text-gray-800">
                              GitHub
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {githubUrl}
                            </p>

                          </div>

                          <ExternalLink
                            size={16}
                            className="shrink-0 text-gray-400"
                          />

                        </a>
                      )}

                      {/* GOOGLE DRIVE */}

                      {googleDriveUrl && (
                        <a
                          href={googleDriveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50"
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-50 text-sm font-bold text-yellow-600">
                            GD
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-sm font-semibold text-gray-800">
                              Google Drive
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {googleDriveUrl}
                            </p>

                          </div>

                          <ExternalLink
                            size={16}
                            className="shrink-0 text-gray-400"
                          />

                        </a>
                      )}

                      {/* ==================================================
                          RESUME
                      ================================================== */}

                      {resumeUrl && (
                        <a
                          href={resumeFullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50"
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                            <FileText
                              size={18}
                              className="text-red-500"
                            />
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-sm font-semibold text-gray-800">
                              Resume
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              Open uploaded resume
                            </p>

                          </div>

                          <ExternalLink
                            size={16}
                            className="shrink-0 text-gray-400"
                          />

                        </a>
                      )}

                      {/* COMPANY WEBSITE */}

                      {companyWebsite && (
                        <a
                          href={companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50"
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-600">
                            WWW
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-sm font-semibold text-gray-800">
                              Company Website
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {companyWebsite}
                            </p>

                          </div>

                          <ExternalLink
                            size={16}
                            className="shrink-0 text-gray-400"
                          />

                        </a>
                      )}

                    </div>
                  </div>
                )}

              </div>

            ) : (

              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">

                <p className="text-sm font-medium text-gray-700">
                  Profile details are not available yet.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Create your profile first.
                </p>

              </div>

            )}

          </div>

        </section>

        {/* ==================================================
            ACCOUNT OVERVIEW
        ================================================== */}

        <section>

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
              <BriefcaseBusiness
                size={20}
                className="text-teal-600"
              />
            </div>

            <div>

              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Account Overview
              </h2>

              <p className="text-sm text-gray-500">
                Information related to your account
              </p>

            </div>

          </div>

          {isFreelancer ? (

            <div className="grid gap-4 sm:grid-cols-3">

              {/* SKILLS */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <BriefcaseBusiness
                    size={21}
                    className="text-emerald-600"
                  />
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Skills
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-gray-900">
                  {skills.length > 0
                    ? skills.join(", ")
                    : "No skills added"}
                </p>

              </div>

              {/* PROJECTS */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100">
                  <CheckCircle2
                    size={21}
                    className="text-teal-600"
                  />
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Completed Projects
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  0
                </p>

              </div>

              {/* EARNINGS */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <IndianRupee
                    size={21}
                    className="text-emerald-600"
                  />
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Earnings
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  ₹0
                </p>

              </div>

            </div>

          ) : (

            <div className="grid gap-4 sm:grid-cols-3">

              {/* POSTED PROJECTS */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <FolderOpen
                    size={21}
                    className="text-emerald-600"
                  />
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Posted Projects
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  0
                </p>

              </div>

              {/* ACTIVE FREELANCERS */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100">
                  <Users
                    size={21}
                    className="text-teal-600"
                  />
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Active Freelancers
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  0
                </p>

              </div>

              {/* CONTRACTS */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <CheckCircle2
                    size={21}
                    className="text-emerald-600"
                  />
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Completed Contracts
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  0
                </p>

              </div>

            </div>

          )}

        </section>

        {/* ==================================================
            EDIT PROFILE
        ================================================== */}

        <section>

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <UserRound
                size={20}
                className="text-emerald-600"
              />
            </div>

            <div>

              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Edit Profile
              </h2>

              <p className="text-sm text-gray-500">
                Update your personal information
              </p>

            </div>

          </div>

          <EditProfileForm
            user={user}
            setUser={setUser}
          />

        </section>

        {/* ==================================================
            SECURITY
        ================================================== */}

        <section>

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
              <LockKeyhole
                size={20}
                className="text-teal-600"
              />
            </div>

            <div>

              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Security
              </h2>

              <p className="text-sm text-gray-500">
                Keep your account secure
              </p>

            </div>

          </div>

          <ChangePasswordForm
            userId={user.id}
          />

        </section>

        {/* ==================================================
            SECURITY NOTE
        ================================================== */}

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:p-5">

          <div className="flex items-start gap-3">

            <LockKeyhole
              size={21}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>

              <p className="text-sm font-semibold text-emerald-800">
                Keep your account secure
              </p>

              <p className="mt-1 text-sm leading-5 text-emerald-700">
                Never share your password with
                anyone. Use a strong password and
                update it regularly.
              </p>

            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}