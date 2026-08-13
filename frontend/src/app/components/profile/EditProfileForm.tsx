"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  BriefcaseBusiness,
  MapPin,
  Code2,
  FileText,
  Save,
  Loader2,
  Building2,
  Globe,
  Link as LinkIcon,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";

// ==================================================
// USER TYPE
// ==================================================

interface User {
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

  professional_title?: string | null;
  category?: string | null;

  company_name?: string | null;
  industry?: string | null;

  city?: string | null;

  skills?: string[] | string | null;

  about?: string | null;

  linkedin_url?: string | null;
  github_url?: string | null;

  resume_url?: string | null;

  company_website?: string | null;
}

// ==================================================
// PROPS
// ==================================================

interface EditProfileFormProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// ==================================================
// BACKEND URL
// ==================================================

const API_BASE_URL = "http://localhost:5000";

// ==================================================
// COMPONENT
// ==================================================

export default function EditProfileForm({
  user,
  setUser,
}: EditProfileFormProps) {
  // ==================================================
  // ROLE
  // ==================================================

  const isFreelancer = user.role === "freelancer";
  const isClient = user.role === "client";

  // ==================================================
  // BASIC INFORMATION
  // ==================================================

  const [fullname, setFullname] = useState(user.fullname);

  // ==================================================
  // FREELANCER FIELDS
  // ==================================================

  const [professionalTitle, setProfessionalTitle] =
    useState("");

  const [category, setCategory] = useState("");

  const [skills, setSkills] = useState("");

  // ==================================================
  // RESUME
  // ==================================================

  const [resumeFile, setResumeFile] =
    useState<File | null>(null);

  const [existingResumeUrl, setExistingResumeUrl] =
    useState("");

  // ==================================================
  // CLIENT FIELDS
  // ==================================================

  const [companyName, setCompanyName] = useState("");

  const [industry, setIndustry] = useState("");

  // ==================================================
  // COMMON PROFILE FIELDS
  // ==================================================

  const [city, setCity] = useState("");

  const [about, setAbout] = useState("");

  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [githubUrl, setGithubUrl] = useState("");

  const [companyWebsite, setCompanyWebsite] =
    useState("");

  // ==================================================
  // UI STATES
  // ==================================================

  const [loading, setLoading] = useState(false);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [message, setMessage] = useState("");

  // ==================================================
  // CONVERT RESUME URL TO FULL BACKEND URL
  // ==================================================

  const getResumeUrl = (url: string) => {
    if (!url) {
      return "";
    }

    // Already a complete URL
    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    // Backend returned something like:
    // /uploads/resumes/resume.pdf
    if (url.startsWith("/")) {
      return `${API_BASE_URL}${url}`;
    }

    // Backend returned something like:
    // uploads/resumes/resume.pdf
    return `${API_BASE_URL}/${url}`;
  };

  // ==================================================
  // LOAD PROFILE
  // ==================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setMessage("");

        const endpoint = isFreelancer
          ? `${API_BASE_URL}/api/freelancer-profile/${user.id}`
          : `${API_BASE_URL}/api/client-profile/${user.id}`;

        const response = await fetch(endpoint);

        if (response.status === 404) {
          setProfileLoading(false);
          return;
        }

        const data = await response.json();

        console.log(
          "EDIT PROFILE DATA:",
          data
        );

        const profile: ProfileData =
          data?.profile || data;

        if (!profile) {
          return;
        }

        // ==================================================
        // BASIC
        // ==================================================

        setFullname(user.fullname || "");

        // ==================================================
        // FREELANCER
        // ==================================================

        if (isFreelancer) {
          setProfessionalTitle(
            profile.professional_title || ""
          );

          setCategory(
            profile.category || ""
          );

          // Skills may be array or string
          if (Array.isArray(profile.skills)) {
            setSkills(
              profile.skills.join(", ")
            );
          } else {
            setSkills(
              profile.skills || ""
            );
          }

          setGithubUrl(
            profile.github_url || ""
          );

          // ==================================================
          // EXISTING RESUME
          // ==================================================

          setExistingResumeUrl(
            getResumeUrl(
              profile.resume_url || ""
            )
          );
        }

        // ==================================================
        // CLIENT
        // ==================================================

        if (isClient) {
          setCompanyName(
            profile.company_name || ""
          );

          setIndustry(
            profile.industry || ""
          );

          // Company website is optional
          setCompanyWebsite(
            profile.company_website || ""
          );
        }

        // ==================================================
        // COMMON
        // ==================================================

        setCity(
          profile.city || ""
        );

        setAbout(
          profile.about || ""
        );

        setLinkedinUrl(
          profile.linkedin_url || ""
        );
      } catch (error) {
        console.error(
          "LOAD EDIT PROFILE ERROR:",
          error
        );

        setMessage(
          "Unable to load profile information."
        );
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [
    user.id,
    user.fullname,
    isFreelancer,
    isClient,
  ]);

  // ==================================================
  // UPDATE NAME WHEN USER CHANGES
  // ==================================================

  useEffect(() => {
    setFullname(user.fullname);
  }, [user.fullname]);

  // ==================================================
  // HANDLE RESUME UPLOAD
  // PDF ONLY
  // ==================================================

  const handleResumeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // ==================================================
    // PDF ONLY
    // ==================================================

    const isPDF =
      file.type === "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPDF) {
      alert(
        "Only PDF files are allowed for the resume."
      );

      event.target.value = "";

      setResumeFile(null);

      return;
    }

    // ==================================================
    // MAXIMUM 5MB
    // ==================================================

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Resume PDF must be less than 5MB."
      );

      event.target.value = "";

      setResumeFile(null);

      return;
    }

    setResumeFile(file);

    setMessage("");
  };

  // ==================================================
  // REMOVE SELECTED RESUME
  // ==================================================

  const removeSelectedResume = () => {
    setResumeFile(null);
  };

  // ==================================================
  // HANDLE SUBMIT
  // ==================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      // ==================================================
      // COMMON VALIDATION
      // ==================================================

      if (!fullname.trim()) {
        setMessage(
          "Full name is required."
        );

        setLoading(false);
        return;
      }

      if (!city.trim()) {
        setMessage(
          "City is required."
        );

        setLoading(false);
        return;
      }

      if (!about.trim()) {
        setMessage(
          "About section is required."
        );

        setLoading(false);
        return;
      }

      // ==================================================
      // FREELANCER VALIDATION
      // ==================================================

      if (isFreelancer) {
        if (!professionalTitle.trim()) {
          setMessage(
            "Professional title is required."
          );

          setLoading(false);
          return;
        }

        if (!category.trim()) {
          setMessage(
            "Category is required."
          );

          setLoading(false);
          return;
        }

        if (!skills.trim()) {
          setMessage(
            "Skills are required."
          );

          setLoading(false);
          return;
        }

        if (!linkedinUrl.trim()) {
          setMessage(
            "LinkedIn URL is required."
          );

          setLoading(false);
          return;
        }
      }

      // ==================================================
      // CLIENT VALIDATION
      // ==================================================

      if (isClient) {
        if (!companyName.trim()) {
          setMessage(
            "Company / Organization name is required."
          );

          setLoading(false);
          return;
        }

        if (!industry.trim()) {
          setMessage(
            "Industry is required."
          );

          setLoading(false);
          return;
        }

        if (!linkedinUrl.trim()) {
          setMessage(
            "LinkedIn URL is required."
          );

          setLoading(false);
          return;
        }

        // IMPORTANT:
        // Company Website is OPTIONAL.
        // No validation is required.
      }

      // ==================================================
      // PROFILE API ENDPOINT
      // ==================================================

      const endpoint = isFreelancer
        ? `${API_BASE_URL}/api/freelancer-profile/${user.id}`
        : `${API_BASE_URL}/api/client-profile/${user.id}`;

      // ==================================================
      // FREELANCER UPDATE
      // ==================================================

      if (isFreelancer) {
        const formData = new FormData();

        // --------------------------------------------------
        // BASIC PROFILE INFORMATION
        // --------------------------------------------------

        formData.append(
          "professional_title",
          professionalTitle.trim()
        );

        formData.append(
          "category",
          category.trim()
        );

        formData.append(
          "city",
          city.trim()
        );

        formData.append(
          "about",
          about.trim()
        );

        formData.append(
          "linkedin_url",
          linkedinUrl.trim()
        );

        // --------------------------------------------------
        // SKILLS
        // --------------------------------------------------

        const skillsArray = skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

        formData.append(
          "skills",
          JSON.stringify(skillsArray)
        );

        // --------------------------------------------------
        // OPTIONAL GITHUB
        // --------------------------------------------------

        formData.append(
          "github_url",
          githubUrl.trim()
        );

        // --------------------------------------------------
        // RESUME PDF
        // --------------------------------------------------

        if (resumeFile) {
          formData.append(
            "resume",
            resumeFile
          );
        }

        console.log(
          "Updating freelancer profile..."
        );

        const profileResponse =
          await fetch(endpoint, {
            method: "PUT",

            // Do NOT set Content-Type manually.
            body: formData,
          });

        const profileText =
          await profileResponse.text();

        console.log(
          "FREELANCER UPDATE RESPONSE:",
          profileText
        );

        if (!profileResponse.ok) {
          let errorMessage =
            "Failed to update freelancer profile.";

          try {
            const errorData =
              JSON.parse(profileText);

            if (errorData?.message) {
              errorMessage =
                errorData.message;
            }
          } catch {
            // Keep default error
          }

          setMessage(errorMessage);

          setLoading(false);

          return;
        }
      }

      // ==================================================
      // CLIENT UPDATE
      // ==================================================

      if (isClient) {
        const body = {
          company_name:
            companyName.trim(),

          industry:
            industry.trim(),

          city:
            city.trim(),

          about:
            about.trim(),

          linkedin_url:
            linkedinUrl.trim(),

          // OPTIONAL
          company_website:
            companyWebsite.trim() || null,
        };

        console.log(
          "CLIENT PROFILE UPDATE:",
          body
        );

        const profileResponse =
          await fetch(endpoint, {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(body),
          });

        const profileText =
          await profileResponse.text();

        console.log(
          "CLIENT UPDATE RESPONSE:",
          profileText
        );

        if (!profileResponse.ok) {
          let errorMessage =
            "Failed to update client profile.";

          try {
            const errorData =
              JSON.parse(profileText);

            if (errorData?.message) {
              errorMessage =
                errorData.message;
            }
          } catch {
            // Keep default error
          }

          setMessage(errorMessage);

          setLoading(false);

          return;
        }
      }

      // ==================================================
      // UPDATE USER NAME
      // ==================================================

      const nameResponse =
        await fetch(
          `${API_BASE_URL}/api/profile/${user.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              fullname:
                fullname.trim(),
            }),
          }
        );

      const nameText =
        await nameResponse.text();

      console.log(
        "NAME UPDATE RESPONSE:",
        nameText
      );

      if (!nameResponse.ok) {
        console.warn(
          "Name update failed:",
          nameText
        );
      }

      // ==================================================
      // UPDATE LOCAL STORAGE
      // ==================================================

      const updatedUser: User = {
        ...user,
        fullname:
          fullname.trim(),
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);

      // ==================================================
      // SUCCESS
      // ==================================================

      setMessage(
        "Profile updated successfully."
      );

      // Reset selected file
      setResumeFile(null);

      // ==================================================
      // RELOAD PROFILE TO GET UPDATED RESUME
      // ==================================================

      if (isFreelancer) {
        try {
          const refreshedResponse =
            await fetch(
              `${API_BASE_URL}/api/freelancer-profile/${user.id}`
            );

          if (refreshedResponse.ok) {
            const refreshedData =
              await refreshedResponse.json();

            const refreshedProfile: ProfileData =
              refreshedData?.profile ||
              refreshedData;

            setExistingResumeUrl(
              getResumeUrl(
                refreshedProfile?.resume_url ||
                  ""
              )
            );
          }
        } catch (error) {
          console.error(
            "REFRESH PROFILE ERROR:",
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "EDIT PROFILE ERROR:",
        error
      );

      setMessage(
        "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOADING SCREEN
  // ==================================================

  if (profileLoading) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2
            size={20}
            className="animate-spin text-emerald-600"
          />

          Loading profile information...
        </div>
      </div>
    );
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-md sm:p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-7">
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">

            {isFreelancer ? (
              <BriefcaseBusiness
                size={21}
                className="text-emerald-600"
              />
            ) : (
              <Building2
                size={21}
                className="text-emerald-600"
              />
            )}

          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
              Edit Profile
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isFreelancer
                ? "Update your professional freelancer information."
                : "Update your client and organization information."}
            </p>
          </div>

        </div>
      </div>

      {/* ==================================================
          FORM
      ================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-7"
      >

        {/* ==================================================
            PERSONAL INFORMATION
        ================================================== */}

        <div>

          <div className="mb-4 flex items-center gap-2">

            <User
              size={18}
              className="text-emerald-600"
            />

            <h3 className="text-base font-bold text-gray-800">
              Personal Information
            </h3>

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* FULL NAME */}

            <div>
              <label
                htmlFor="fullname"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>

              <input
                id="fullname"
                type="text"
                value={fullname}
                onChange={(e) => {
                  setFullname(
                    e.target.value
                  );

                  setMessage("");
                }}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-base"
                required
              />
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={user.email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none sm:text-base"
              />

              <p className="mt-1 text-xs text-gray-400">
                Email cannot be changed here.
              </p>
            </div>

          </div>
        </div>

        {/* ==================================================
            FREELANCER INFORMATION
        ================================================== */}

        {isFreelancer && (
          <div className="border-t border-gray-100 pt-7">

            <div className="mb-4 flex items-center gap-2">

              <BriefcaseBusiness
                size={18}
                className="text-emerald-600"
              />

              <h3 className="text-base font-bold text-gray-800">
                Professional Information
              </h3>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* PROFESSIONAL TITLE */}

              <div>
                <label
                  htmlFor="professionalTitle"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Professional Title
                </label>

                <input
                  id="professionalTitle"
                  type="text"
                  value={professionalTitle}
                  onChange={(e) => {
                    setProfessionalTitle(
                      e.target.value
                    );

                    setMessage("");
                  }}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-base"
                  required
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>

                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setCategory(
                      e.target.value
                    );

                    setMessage("");
                  }}
                  placeholder="e.g. Web Development"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-base"
                  required
                />
              </div>

              {/* SKILLS */}

              <div className="md:col-span-2">

                <label
                  htmlFor="skills"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <Code2
                    size={16}
                    className="text-emerald-600"
                  />

                  Skills
                </label>

                <input
                  id="skills"
                  type="text"
                  value={skills}
                  onChange={(e) => {
                    setSkills(
                      e.target.value
                    );

                    setMessage("");
                  }}
                  placeholder="React, Next.js, Node.js, PostgreSQL"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-base"
                  required
                />

                <p className="mt-1 text-xs text-gray-400">
                  Separate multiple skills with commas.
                </p>

              </div>

            </div>

            {/* ==================================================
                RESUME UPLOAD
            ================================================== */}

            <div className="mt-6">

              <label
                htmlFor="resume"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <FileText
                  size={16}
                  className="text-emerald-600"
                />

                Resume
              </label>

              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">

                {/* UPLOAD AREA */}

                <label
                  htmlFor="resume"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-7 text-center transition hover:border-emerald-300 hover:bg-emerald-50/30"
                >

                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Upload size={22} />
                  </div>

                  <p className="text-sm font-semibold text-gray-700">
                    Click to upload your resume
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    PDF only • Maximum 5MB
                  </p>

                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleResumeChange}
                    className="hidden"
                  />

                </label>

                {/* SELECTED NEW RESUME */}

                {resumeFile && (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600">
                        <FileText size={18} />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-emerald-700">
                          {resumeFile.name}
                        </p>

                        <p className="text-xs text-emerald-600">
                          New resume selected
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={
                        removeSelectedResume
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-100"
                      aria-label="Remove selected resume"
                    >
                      <X size={17} />
                    </button>

                  </div>
                )}

                {/* EXISTING RESUME */}

                {!resumeFile &&
                  existingResumeUrl && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                            <FileText size={19} />
                          </div>

                          <div className="min-w-0">

                            <p className="text-sm font-semibold text-gray-700">
                              Current Resume
                            </p>

                            <p className="truncate text-xs text-gray-400">
                              Existing PDF resume
                            </p>

                          </div>

                        </div>

                        {/* FIXED RESUME LINK */}

                        <a
                          href={existingResumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
                        >
                          <ExternalLink
                            size={14}
                          />

                          View Resume
                        </a>

                      </div>

                    </div>
                  )}

              </div>

              <p className="mt-2 text-xs text-gray-400">
                Upload a new PDF to replace your current resume.
              </p>

            </div>

          </div>
        )}

        {/* ==================================================
            CLIENT INFORMATION
        ================================================== */}

        {isClient && (
          <div className="border-t border-gray-100 pt-7">

            <div className="mb-4 flex items-center gap-2">

              <Building2
                size={18}
                className="text-emerald-600"
              />

              <h3 className="text-base font-bold text-gray-800">
                Organization Information
              </h3>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* COMPANY */}

              <div>
                <label
                  htmlFor="companyName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Company / Organization
                </label>

                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(
                      e.target.value
                    );

                    setMessage("");
                  }}
                  placeholder="Enter company or organization name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-base"
                  required
                />
              </div>

              {/* INDUSTRY */}

              <div>
                <label
                  htmlFor="industry"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Industry
                </label>

                <input
                  id="industry"
                  type="text"
                  value={industry}
                  onChange={(e) => {
                    setIndustry(
                      e.target.value
                    );

                    setMessage("");
                  }}
                  placeholder="e.g. IT, Finance, Education"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-base"
                  required
                />
              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            LOCATION + ABOUT
        ================================================== */}

        <div className="border-t border-gray-100 pt-7">

          <div className="mb-4 flex items-center gap-2">

            <MapPin
              size={18}
              className="text-emerald-600"
            />

            <h3 className="text-base font-bold text-gray-800">
              Profile Details
            </h3>

          </div>

          <div className="space-y-5">

            {/* CITY */}

            <div>
              <label
                htmlFor="city"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                City
              </label>

              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(
                    e.target.value
                  );

                  setMessage("");
                }}
                placeholder="Enter your city"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-base"
                required
              />
            </div>

            {/* ABOUT */}

            <div>

              <label
                htmlFor="about"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <FileText
                  size={16}
                  className="text-emerald-600"
                />

                About
              </label>

              <textarea
                id="about"
                value={about}
                onChange={(e) => {
                  setAbout(
                    e.target.value
                  );

                  setMessage("");
                }}
                placeholder={
                  isFreelancer
                    ? "Tell clients about yourself, your experience and expertise..."
                    : "Tell freelancers about your company or organization..."
                }
                rows={5}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-6 text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-base"
                required
              />

            </div>

          </div>
        </div>

        {/* ==================================================
            PROFESSIONAL LINKS
        ================================================== */}

        <div className="border-t border-gray-100 pt-7">

          <div className="mb-4 flex items-center gap-2">

            <LinkIcon
              size={18}
              className="text-emerald-600"
            />

            <h3 className="text-base font-bold text-gray-800">
              Professional Links
            </h3>

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* LINKEDIN */}

            <div>

              <label
                htmlFor="linkedinUrl"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                LinkedIn URL
              </label>

              <input
                id="linkedinUrl"
                type="url"
                value={linkedinUrl}
                onChange={(e) => {
                  setLinkedinUrl(
                    e.target.value
                  );

                  setMessage("");
                }}
                placeholder="https://linkedin.com/in/yourname"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-base"
                required
              />

            </div>

            {/* GITHUB - FREELANCER ONLY */}

            {isFreelancer && (
              <div>

                <label
                  htmlFor="githubUrl"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  GitHub URL
                </label>

                <input
                  id="githubUrl"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(
                      e.target.value
                    );

                    setMessage("");
                  }}
                  placeholder="https://github.com/username"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-base"
                />

              </div>
            )}

            {/* COMPANY WEBSITE - CLIENT ONLY */}

            {isClient && (
              <div>

                <label
                  htmlFor="companyWebsite"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <Globe
                    size={16}
                    className="text-emerald-600"
                  />

                  Company Website
                  <span className="text-xs font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <input
                  id="companyWebsite"
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => {
                    setCompanyWebsite(
                      e.target.value
                    );

                    setMessage("");
                  }}
                  placeholder="https://yourcompany.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-base"
                />

              </div>
            )}

          </div>
        </div>

        {/* ==================================================
            MESSAGE
        ================================================== */}

        {message && (
          <div
            className={`rounded-xl border p-4 text-sm font-medium ${
              message.includes(
                "successfully"
              )
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* ==================================================
            SAVE BUTTON
        ================================================== */}

        <div className="border-t border-gray-100 pt-6">

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-base"
          >

            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Saving Changes...
              </>
            ) : (
              <>
                <Save size={18} />

                Save Changes
              </>
            )}

          </button>

        </div>

      </form>
    </div>
  );
}