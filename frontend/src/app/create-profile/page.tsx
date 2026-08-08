"use client";

import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Camera,
  Plus,
  X,
  Link as LinkIcon,
  FileText,
  Upload,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const CreateFreelancerProfile = () => {
  const router = useRouter();

  // =========================================
  // USER ID
  // =========================================

  const [userId, setUserId] = useState("");

  // =========================================
  // PROFILE PICTURE
  // =========================================

  const [profileImage, setProfileImage] =
    useState<File | null>(null);

  const [profileImagePreview, setProfileImagePreview] =
    useState<string | null>(null);

  // =========================================
  // PROFESSIONAL INFORMATION
  // =========================================

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [about, setAbout] = useState("");

  // =========================================
  // SKILLS
  // =========================================

  const [skills, setSkills] = useState<string[]>([
    "React",
    "Next.js",
    "Node.js",
  ]);

  const [newSkill, setNewSkill] = useState("");

  // =========================================
  // PROFESSIONAL LINKS
  // =========================================

  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [googleDrive, setGoogleDrive] = useState("");

  const [showGithub, setShowGithub] = useState(false);
  const [showGoogleDrive, setShowGoogleDrive] =
    useState(false);

  const [linksOpen, setLinksOpen] = useState(true);

  // =========================================
  // RESUME
  // =========================================

  const [resume, setResume] =
    useState<File | null>(null);

  // =========================================
  // LOADING
  // =========================================

  const [loading, setLoading] = useState(false);

  // =========================================
  // LOAD USER ID
  // =========================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        if (user?.id) {
          setUserId(String(user.id));
        }
      }

      const storedUserId =
        localStorage.getItem("userId");

      if (storedUserId) {
        setUserId(String(storedUserId));
      }
    } catch (error) {
      console.error(
        "USER DATA ERROR:",
        error
      );
    }
  }, []);

  // =========================================
  // CLEANUP PROFILE IMAGE PREVIEW
  // =========================================

  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(
          profileImagePreview
        );
      }
    };
  }, [profileImagePreview]);

  // =========================================
  // PROFILE IMAGE
  // =========================================

  const handleProfileImage = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select a valid image."
      );

      e.target.value = "";

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Profile picture must be less than 5 MB."
      );

      e.target.value = "";

      return;
    }

    if (profileImagePreview) {
      URL.revokeObjectURL(
        profileImagePreview
      );
    }

    setProfileImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setProfileImagePreview(
      previewUrl
    );
  };

  // =========================================
  // REMOVE PROFILE IMAGE
  // =========================================

  const removeProfileImage = () => {
    if (profileImagePreview) {
      URL.revokeObjectURL(
        profileImagePreview
      );
    }

    setProfileImage(null);
    setProfileImagePreview(null);
  };

  // =========================================
  // ADD SKILL
  // =========================================

  const handleAddSkill = () => {
    const skill = newSkill.trim();

    if (!skill) return;

    const alreadyExists = skills.some(
      (item) =>
        item.toLowerCase() ===
        skill.toLowerCase()
    );

    if (alreadyExists) {
      alert(
        "This skill is already added."
      );

      return;
    }

    setSkills((previousSkills) => [
      ...previousSkills,
      skill,
    ]);

    setNewSkill("");
  };

  // =========================================
  // REMOVE SKILL
  // =========================================

  const handleRemoveSkill = (
    skillToRemove: string
  ) => {
    setSkills((previousSkills) =>
      previousSkills.filter(
        (skill) =>
          skill !== skillToRemove
      )
    );
  };

  // =========================================
  // RESUME
  // =========================================

  const handleResume = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // PDF ONLY
    const isPdf =
      file.type === "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdf) {
      alert(
        "Only PDF files are allowed."
      );

      e.target.value = "";

      return;
    }

    // 5 MB MAXIMUM
    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Resume size must be less than 5 MB."
      );

      e.target.value = "";

      return;
    }

    // STORE FILE
    setResume(file);

    console.log(
      "Resume selected:",
      file.name
    );
  };

  // =========================================
  // REMOVE RESUME
  // =========================================

  const removeResume = () => {
    setResume(null);
  };

  // =========================================
  // CREATE PROFILE
  // =========================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // =========================================
    // VALIDATION
    // =========================================

    if (!userId) {
      alert(
        "User ID not found. Please login again."
      );

      return;
    }

    if (!title.trim()) {
      alert(
        "Please enter your professional title."
      );

      return;
    }

    if (!category) {
      alert(
        "Please select a category."
      );

      return;
    }

    if (!city.trim()) {
      alert(
        "Please enter your city."
      );

      return;
    }

    if (skills.length === 0) {
      alert(
        "Please add at least one skill."
      );

      return;
    }

    if (!about.trim()) {
      alert(
        "Please tell clients about yourself."
      );

      return;
    }

    if (!linkedin.trim()) {
      alert(
        "LinkedIn profile is required."
      );

      return;
    }

    if (!resume) {
      alert(
        "Please upload your resume."
      );

      return;
    }

    // =========================================
    // CREATE FORMDATA
    // =========================================

    const formData =
      new FormData();

    formData.append(
      "user_id",
      String(Number(userId))
    );

    formData.append(
      "professional_title",
      title.trim()
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
      "skills",
      skills.join(", ")
    );

    formData.append(
      "about",
      about.trim()
    );

    formData.append(
      "linkedin_url",
      linkedin.trim()
    );

    // =========================================
    // OPTIONAL LINKS
    // =========================================

    if (github.trim()) {
      formData.append(
        "github_url",
        github.trim()
      );
    }

    if (googleDrive.trim()) {
      formData.append(
        "google_drive_url",
        googleDrive.trim()
      );
    }

    // =========================================
    // PROFILE PICTURE
    // =========================================

    if (profileImage) {
      formData.append(
        "profile_picture",
        profileImage,
        profileImage.name
      );
    }

    // =========================================
    // RESUME
    // =========================================

    formData.append(
      "resume",
      resume,
      resume.name
    );

    // =========================================
    // DEBUG
    // =========================================

    console.log(
      "================================="
    );

    console.log(
      "CREATING FREELANCER PROFILE"
    );

    console.log(
      "USER ID:",
      userId
    );

    console.log(
      "PROFILE IMAGE:",
      profileImage?.name
    );

    console.log(
      "RESUME ORIGINAL NAME:",
      resume.name
    );

    console.log(
      "RESUME TYPE:",
      resume.type
    );

    console.log(
      "RESUME SIZE:",
      resume.size
    );

    console.log(
      "================================="
    );

    // =========================================
    // SEND TO BACKEND
    // =========================================

    try {
      setLoading(true);

      const response =
        await fetch(
          "http://localhost:5000/api/freelancer-profile",
          {
            method: "POST",

            /*
             * IMPORTANT:
             *
             * DO NOT SET:
             *
             * headers: {
             *   "Content-Type":
             *      "multipart/form-data"
             * }
             *
             * The browser automatically
             * creates the correct multipart
             * boundary.
             */

            body: formData,
          }
        );

      // =========================================
      // READ RESPONSE SAFELY
      // =========================================

      const contentType =
        response.headers.get(
          "content-type"
        );

      let data: any = null;

      if (
        contentType?.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      } else {
        const text =
          await response.text();

        console.error(
          "SERVER RESPONSE:",
          text
        );

        alert(
          "Server returned an invalid response."
        );

        return;
      }

      // =========================================
      // DEBUG RESPONSE
      // =========================================

      console.log(
        "CREATE PROFILE RESPONSE:",
        data
      );

      // =========================================
      // ERROR
      // =========================================

      if (!response.ok) {
        alert(
          data?.message ||
            "Failed to create profile."
        );

        return;
      }

      // =========================================
      // CHECK UPLOAD PATH
      // =========================================

      console.log(
        "PROFILE PICTURE URL:",
        data?.profile_picture
      );

      console.log(
        "RESUME URL:",
        data?.resume
      );

      // =========================================
      // SUCCESS
      // =========================================

      alert(
        "Freelancer profile created successfully!"
      );

      // =========================================
      // GO TO FREELANCER DASHBOARD
      // =========================================

      router.push(
        "/freelancer"
      );

    } catch (error) {
      console.error(
        "CREATE PROFILE ERROR:",
        error
      );

      alert(
        "Unable to connect to the backend server."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="mx-auto max-w-5xl">

      {/* =========================================
          BACK TO DASHBOARD
      ========================================= */}

      <button
        type="button"
        onClick={() =>
          router.push(
            "/freelancer"
          )
        }
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      >
        <ArrowLeft size={17} />

        Back to Dashboard
      </button>

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Create Profile
        </h1>

        <p className="mt-2 text-gray-500">
          Complete your profile to showcase
          your skills and attract clients.
        </p>

      </div>

      {/* =========================================
          FORM
      ========================================= */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* =========================================
            PROFILE PICTURE
        ========================================= */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <h2 className="mb-6 text-lg font-semibold text-gray-800">
            Profile Picture
          </h2>

          <div className="flex flex-col items-center justify-center">

            <div className="relative mb-5">

              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-emerald-50 bg-emerald-100 text-3xl font-bold text-emerald-700">

                {profileImagePreview ? (
                  <img
                    src={
                      profileImagePreview
                    }
                    alt="Profile Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "R"
                )}

              </div>

              {profileImage && (
                <button
                  type="button"
                  onClick={
                    removeProfileImage
                  }
                  className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                >
                  <X size={15} />
                </button>
              )}

            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-white px-5 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">

              <Camera size={17} />

              {profileImage
                ? "Change Photo"
                : "Upload Photo"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleProfileImage
                }
                className="hidden"
              />

            </label>

            <p className="mt-2 text-xs text-gray-400">
              JPG, PNG or WEBP • Maximum 5 MB
            </p>

          </div>

        </div>

        {/* =========================================
            PROFESSIONAL INFORMATION
        ========================================= */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <h2 className="mb-6 text-lg font-semibold text-gray-800">
            Professional Information
          </h2>

          <div className="space-y-6">

            {/* TITLE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Professional Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="e.g. Full Stack Developer"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>

            {/* CATEGORY + CITY */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="">
                    Select Category
                  </option>

                  <option value="Web Development">
                    Web Development
                  </option>

                  <option value="App Development">
                    App Development
                  </option>

                  <option value="UI/UX Design">
                    UI/UX Design
                  </option>

                  <option value="Graphic Design">
                    Graphic Design
                  </option>

                  <option value="Digital Marketing">
                    Digital Marketing
                  </option>

                  <option value="Content Writing">
                    Content Writing
                  </option>

                  <option value="Data Science">
                    Data Science
                  </option>

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  City
                </label>

                <input
                  type="text"
                  value={city}
                  onChange={(e) =>
                    setCity(
                      e.target.value
                    )
                  }
                  placeholder="Ahmedabad"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

            </div>

            {/* SKILLS */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Skills
              </label>

              <div className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">

                {skills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"
                    >

                      {skill}

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveSkill(
                            skill
                          )
                        }
                        className="rounded-full hover:text-red-500"
                      >
                        <X size={14} />
                      </button>

                    </span>
                  )
                )}

                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) =>
                    setNewSkill(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {

                    if (
                      e.key ===
                      "Enter"
                    ) {
                      e.preventDefault();

                      handleAddSkill();
                    }

                  }}
                  placeholder="+ Add Skill"
                  className="min-w-[110px] flex-1 border-none px-2 py-1 text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={
                    handleAddSkill
                  }
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                >

                  <Plus size={16} />

                  Add

                </button>

              </div>

            </div>

            {/* ABOUT */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                About You
              </label>

              <textarea
                value={about}
                onChange={(e) =>
                  setAbout(
                    e.target.value
                  )
                }
                rows={5}
                maxLength={500}
                placeholder="Tell clients about yourself..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {about.length}/500
              </p>

            </div>

          </div>

        </div>

        {/* =========================================
            PROFESSIONAL LINKS
        ========================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <button
            type="button"
            onClick={() =>
              setLinksOpen(
                !linksOpen
              )
            }
            className="flex w-full items-center justify-between px-6 py-5 text-left sm:px-8"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <LinkIcon size={20} />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-800">
                  Professional Links
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  Add links to showcase your work
                </p>

              </div>

            </div>

            {linksOpen ? (
              <ChevronUp
                size={20}
                className="text-gray-500"
              />
            ) : (
              <ChevronDown
                size={20}
                className="text-gray-500"
              />
            )}

          </button>

          {linksOpen && (
            <div className="border-t border-gray-100 px-6 pb-7 pt-6 sm:px-8">

              {/* LINKEDIN */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  LinkedIn Profile

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) =>
                    setLinkedin(
                      e.target.value
                    )
                  }
                  placeholder="https://linkedin.com/in/username"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

              {/* OPTIONAL LINKS */}

              <div className="mt-7">

                <p className="mb-4 text-sm font-medium text-gray-700">
                  Optional Links
                </p>

                <div className="flex flex-wrap gap-3">

                  {!showGithub && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowGithub(
                          true
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
                    >

                      <Plus size={16} />

                      Add GitHub

                    </button>
                  )}

                  {!showGoogleDrive && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowGoogleDrive(
                          true
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
                    >

                      <Plus size={16} />

                      Add Google Drive

                    </button>
                  )}

                </div>

              </div>

              {/* GITHUB */}

              {showGithub && (
                <div className="mt-5">

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-medium text-gray-700">
                      GitHub Profile
                    </label>

                    <button
                      type="button"
                      onClick={() => {

                        setShowGithub(
                          false
                        );

                        setGithub("");

                      }}
                      className="text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>

                  </div>

                  <input
                    type="url"
                    value={github}
                    onChange={(e) =>
                      setGithub(
                        e.target.value
                      )
                    }
                    placeholder="https://github.com/username"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                </div>
              )}

              {/* GOOGLE DRIVE */}

              {showGoogleDrive && (
                <div className="mt-5">

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-medium text-gray-700">
                      Google Drive
                    </label>

                    <button
                      type="button"
                      onClick={() => {

                        setShowGoogleDrive(
                          false
                        );

                        setGoogleDrive("");

                      }}
                      className="text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>

                  </div>

                  <input
                    type="url"
                    value={googleDrive}
                    onChange={(e) =>
                      setGoogleDrive(
                        e.target.value
                      )
                    }
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                </div>
              )}

            </div>
          )}

        </div>

        {/* =========================================
            RESUME
        ========================================= */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <h2 className="mb-6 text-lg font-semibold text-gray-800">
            Resume
          </h2>

          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-emerald-400">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <FileText size={23} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-800">

              {resume
                ? "Resume Selected"
                : "Upload your Resume"}

            </h3>

            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 hover:shadow-md">

              <Upload size={17} />

              {resume
                ? "Change Resume"
                : "Choose PDF"}

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={
                  handleResume
                }
                className="hidden"
              />

            </label>

            {resume && (
              <div className="mx-auto mt-4 flex max-w-md items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-left">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

                    <FileText
                      size={18}
                      className="text-emerald-600"
                    />

                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-medium text-gray-800">
                      {resume.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {(
                        resume.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB • PDF
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    removeResume
                  }
                  className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white hover:text-red-500"
                  title="Remove resume"
                >
                  <X size={18} />
                </button>

              </div>
            )}

            <p className="mt-3 text-xs text-gray-400">
              PDF only • Maximum 5 MB
            </p>

          </div>

        </div>

        {/* =========================================
            CREATE PROFILE BUTTON
        ========================================= */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading
              ? "Creating Profile..."
              : "Create Profile"}

          </button>

        </div>

      </form>

    </div>
  );
};

export default CreateFreelancerProfile;
