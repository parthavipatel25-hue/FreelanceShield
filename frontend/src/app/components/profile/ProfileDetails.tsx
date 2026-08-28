"use client";

import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  BriefcaseBusiness,
  MapPin,
  Code2,
  FileText,
  ExternalLink,
  Building2,
} from "lucide-react";

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

interface FreelancerProfile {
  professional_title?: string | null;
  category?: string | null;
  city?: string | null;
  skills?: string | null;
  about?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  google_drive_url?: string | null;
  resume_url?: string | null;
}

interface Props {
  user: User;
  profile?: FreelancerProfile | null;
}

export default function ProfileDetails({
  user,
  profile,
}: Props) {
  const formattedRole =
    user.role.charAt(0).toUpperCase() +
    user.role.slice(1);

  // =========================================================
  // SKILLS
  // =========================================================

  const skills = profile?.skills
    ? profile.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  // =========================================================
  // HELPER
  // =========================================================

  const hasValue = (value?: string | null) =>
    Boolean(value && value.trim());

  return (
    <div className="p-5 sm:p-8">

      {/* ================================================= */}
      {/* PERSONAL INFORMATION */}
      {/* ================================================= */}

      <div className="mb-6 flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <User
            size={20}
            className="text-emerald-600"
          />
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Personal Information
          </h3>

          <p className="text-sm text-gray-500">
            Your basic account information
          </p>
        </div>

      </div>

      <div className="grid gap-4 sm:grid-cols-2">

        {/* FULL NAME */}

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30">

          <div className="mb-2 flex items-center gap-2">
            <User
              size={16}
              className="text-emerald-600"
            />

            <label className="text-sm font-medium text-gray-500">
              Full Name
            </label>
          </div>

          <p className="break-words text-base font-semibold text-gray-800">
            {user.fullname}
          </p>

        </div>

        {/* EMAIL */}

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30">

          <div className="mb-2 flex items-center gap-2">
            <Mail
              size={16}
              className="text-emerald-600"
            />

            <label className="text-sm font-medium text-gray-500">
              Email Address
            </label>
          </div>

          <p className="break-all text-base font-semibold text-gray-800">
            {user.email}
          </p>

        </div>

        {/* ROLE */}

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30">

          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck
              size={16}
              className="text-emerald-600"
            />

            <label className="text-sm font-medium text-gray-500">
              Account Role
            </label>
          </div>

          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            {formattedRole}
          </span>

        </div>

        {/* JOINED */}

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30">

          <div className="mb-2 flex items-center gap-2">
            <CalendarDays
              size={16}
              className="text-emerald-600"
            />

            <label className="text-sm font-medium text-gray-500">
              Joined
            </label>
          </div>

          <p className="text-base font-semibold text-gray-800">
            Account Member
          </p>

        </div>

      </div>

      {/* ================================================= */}
      {/* FREELANCER INFORMATION */}
      {/* ================================================= */}

      {user.role === "freelancer" && profile && (
        <div className="mt-8">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
              <BriefcaseBusiness
                size={20}
                className="text-teal-600"
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Professional Information
              </h3>

              <p className="text-sm text-gray-500">
                Your freelancer profile details
              </p>
            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* PROFESSIONAL TITLE */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <div className="mb-2 flex items-center gap-2">
                <BriefcaseBusiness
                  size={16}
                  className="text-emerald-600"
                />

                <label className="text-sm font-medium text-gray-500">
                  Professional Title
                </label>
              </div>

              <p className="break-words text-base font-semibold text-gray-800">
                {hasValue(profile.professional_title)
                  ? profile.professional_title
                  : "Not added"}
              </p>

            </div>

            {/* CATEGORY */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <div className="mb-2 flex items-center gap-2">
                <Building2
                  size={16}
                  className="text-emerald-600"
                />

                <label className="text-sm font-medium text-gray-500">
                  Category
                </label>
              </div>

              <p className="break-words text-base font-semibold text-gray-800">
                {hasValue(profile.category)
                  ? profile.category
                  : "Not added"}
              </p>

            </div>

            {/* CITY */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <div className="mb-2 flex items-center gap-2">
                <MapPin
                  size={16}
                  className="text-emerald-600"
                />

                <label className="text-sm font-medium text-gray-500">
                  City
                </label>
              </div>

              <p className="break-words text-base font-semibold text-gray-800">
                {hasValue(profile.city)
                  ? profile.city
                  : "Not added"}
              </p>

            </div>

            {/* SKILLS */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:col-span-2">

              <div className="mb-3 flex items-center gap-2">
                <Code2
                  size={16}
                  className="text-emerald-600"
                />

                <label className="text-sm font-medium text-gray-500">
                  Skills
                </label>
              </div>

              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No skills added.
                </p>
              )}

            </div>

            {/* ABOUT */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:col-span-2">

              <label className="mb-2 block text-sm font-medium text-gray-500">
                About
              </label>

              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                {hasValue(profile.about)
                  ? profile.about
                  : "No information added."}
              </p>

            </div>

          </div>

          {/* ================================================= */}
          {/* LINKS */}
          {/* ================================================= */}

          <div className="mt-6">

            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Professional Links
            </h4>

            <div className="grid gap-3 sm:grid-cols-2">

              {/* LINKEDIN */}

              {hasValue(profile.linkedin_url) && (
                <a
                  href={profile.linkedin_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-800">
  GH
</span>

                    <span className="text-sm font-semibold text-gray-800">
                      LinkedIn
                    </span>
                  </div>

                  <ExternalLink
                    size={16}
                    className="text-gray-400"
                  />
                </a>
              )}

              {/* GITHUB */}

              {hasValue(profile.github_url) && (
                <a
                  href={profile.github_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="flex items-center gap-3">
                   <span className="text-sm font-bold text-gray-800">
  GH
</span>

                    <span className="text-sm font-semibold text-gray-800">
                      GitHub
                    </span>
                  </div>

                  <ExternalLink
                    size={16}
                    className="text-gray-400"
                  />
                </a>
              )}

              {/* GOOGLE DRIVE */}

              {hasValue(profile.google_drive_url) && (
                <a
                  href={profile.google_drive_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="flex items-center gap-3">
                    <FileText
                      size={20}
                      className="text-emerald-600"
                    />

                    <span className="text-sm font-semibold text-gray-800">
                      Google Drive / Portfolio
                    </span>
                  </div>

                  <ExternalLink
                    size={16}
                    className="text-gray-400"
                  />
                </a>
              )}

            </div>

          </div>

          {/* ================================================= */}
          {/* RESUME */}
          {/* ================================================= */}

          {hasValue(profile.resume_url) && (
            <div className="mt-6">

              <h4 className="mb-3 text-sm font-semibold text-gray-700">
                Resume
              </h4>

              <a
                href={profile.resume_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition hover:bg-emerald-100"
              >
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <FileText
                      size={20}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Resume
                    </p>

                    <p className="text-xs text-gray-500">
                      View uploaded resume
                    </p>
                  </div>

                </div>

                <ExternalLink
                  size={18}
                  className="text-emerald-600"
                />

              </a>

            </div>
          )}

        </div>
      )}

      {/* ================================================= */}
      {/* ACCOUNT STATUS */}
      {/* ================================================= */}

      <div className="mt-8 flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <ShieldCheck
              size={18}
              className="text-emerald-600"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              Account Status
            </p>

            <p className="text-xs text-gray-500">
              Your account is active and secure.
            </p>
          </div>

        </div>

        <span className="w-fit rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white">
          Active
        </span>

      </div>

    </div>
  );
}