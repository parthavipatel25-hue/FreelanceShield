"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  X,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";

export default function ClientProfileForm() {
  const router = useRouter();

  // =========================================
  // PROFILE IMAGE
  // =========================================

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProfileImage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setProfileImage(imageUrl);
  };

  const removeProfileImage = () => {
    setProfileImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================
  // CLIENT INFORMATION
  // =========================================

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [city, setCity] = useState("");
  const [about, setAbout] = useState("");

  // =========================================
  // PROFESSIONAL LINKS
  // =========================================

  const [showLinks, setShowLinks] = useState(true);

  const [linkedin, setLinkedin] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [github, setGithub] = useState("");
  const [googleDrive, setGoogleDrive] = useState("");

  const [showCompanyWebsite, setShowCompanyWebsite] =
    useState(false);

  const [showGithub, setShowGithub] =
    useState(false);

  const [showGoogleDrive, setShowGoogleDrive] =
    useState(false);

  // =========================================
  // FORM STATE
  // =========================================

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================================
  // CREATE CLIENT PROFILE
  // =========================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");

    // =========================================
    // VALIDATION
    // =========================================

    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!industry.trim()) {
      alert("Please select your industry.");
      return;
    }

    if (!city.trim()) {
      alert("Please enter your city.");
      return;
    }

    if (!about.trim()) {
      alert(
        "Please tell freelancers about yourself or your organization."
      );
      return;
    }

    if (!linkedin.trim()) {
      alert("Please enter your LinkedIn profile URL.");
      return;
    }

    // =========================================
    // GET LOGGED-IN USER
    // =========================================

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      alert("Please login first.");
      router.push("/login");
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch {
      alert("Invalid login session. Please login again.");

      localStorage.removeItem("user");

      router.push("/login");

      return;
    }

    const user_id = user?.id;

    if (!user_id) {
      alert("User ID not found. Please login again.");

      router.push("/login");

      return;
    }

    // =========================================
    // CHECK ROLE
    // =========================================

    if (user.role !== "client") {
      alert("Only clients can create a client profile.");
      return;
    }

    // =========================================
    // PROFILE DATA
    //
    // Skills and Hiring Requirements have
    // intentionally been removed.
    // They will be added when posting a project.
    // =========================================

    const profileData = {
      user_id,

      fullname: fullName.trim(),

      company_name:
        companyName.trim() || null,

      industry: industry.trim(),

      city: city.trim(),

      about: about.trim(),

      linkedin_url:
        linkedin.trim(),

      company_website:
        companyWebsite.trim() || null,

      github_url:
        github.trim() || null,

      google_drive_url:
        googleDrive.trim() || null,

      // No skills
      // No hiring requirements
      // No profile image
    };

    console.log(
      "CLIENT PROFILE DATA:",
      profileData
    );

    // =========================================
    // API REQUEST
    // =========================================

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/client-profile",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(profileData),
        }
      );

      const data = await response.json();

      console.log(
        "CLIENT PROFILE RESPONSE:",
        data
      );

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to create client profile."
        );

        return;
      }

      // =========================================
      // SUCCESS
      // =========================================

      alert(
        "Client profile created successfully!"
      );

      router.push("/client");

    } catch (error) {
      console.error(
        "CLIENT PROFILE ERROR:",
        error
      );

      setMessage(
        "Unable to connect to the server. Please make sure the backend is running."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        {/* =========================================
            BACK TO DASHBOARD
        ========================================= */}

        <button
          type="button"
          onClick={() => router.push("/client")}
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-gray-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-gray-600
            shadow-sm
            transition
            hover:border-emerald-200
            hover:bg-emerald-50
            hover:text-emerald-700
          "
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create Client Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Complete your profile to build trust and help
            freelancers understand you better.
          </p>
        </div>

        {/* =========================================
            ERROR MESSAGE
        ========================================= */}

        {message && (
          <div className="
            mb-6
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            font-medium
            text-red-600
          ">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* =========================================
              PROFILE PICTURE
          ========================================= */}

          <section className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
            sm:p-8
          ">

            <h2 className="
              mb-6
              text-xl
              font-semibold
              text-gray-900
            ">
              Profile Picture
            </h2>

            <div className="
              flex
              flex-col
              items-center
              justify-center
            ">

              <div className="relative mb-5">

                <div className="
                  flex
                  h-28
                  w-28
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border-4
                  border-emerald-50
                  bg-emerald-100
                  text-3xl
                  font-bold
                  text-emerald-700
                ">

                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Client profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "C"
                  )}

                </div>

                {profileImage && (
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    aria-label="Remove profile photo"
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      bg-red-500
                      text-white
                      shadow-md
                      transition
                      hover:bg-red-600
                    "
                  >
                    <X size={15} />
                  </button>
                )}

              </div>

              <label className="
                inline-flex
                cursor-pointer
                items-center
                gap-2
                rounded-lg
                border
                border-emerald-200
                bg-white
                px-5
                py-2.5
                text-sm
                font-medium
                text-emerald-700
                transition
                hover:bg-emerald-50
              ">

                <Camera size={17} />

                {profileImage
                  ? "Change Photo"
                  : "Upload Photo"}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleProfileImage}
                  className="hidden"
                />

              </label>

              <p className="
                mt-2
                text-xs
                text-gray-400
              ">
                JPG, PNG or WEBP • Max 5MB
              </p>

              <p className="
                mt-1
                text-xs
                text-gray-400
              ">
                Profile picture will not be saved yet.
              </p>

            </div>
          </section>

          {/* =========================================
              CLIENT INFORMATION
          ========================================= */}

          <section className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
            sm:p-8
          ">

            <h2 className="
              mb-6
              text-xl
              font-semibold
              text-gray-900
            ">
              Client Information
            </h2>

            <div className="space-y-6">

              {/* FULL NAME */}

              <div>
                <label
                  htmlFor="fullName"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-gray-800
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />
              </div>

              {/* COMPANY */}

              <div>
                <label
                  htmlFor="companyName"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Company / Organization Name
                </label>

                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) =>
                    setCompanyName(e.target.value)
                  }
                  placeholder="Optional"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-gray-800
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />
              </div>

              {/* INDUSTRY + CITY */}

              <div className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
              ">

                {/* INDUSTRY */}

                <div>
                  <label
                    htmlFor="industry"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
                    Industry
                  </label>

                  <div className="relative">

                    <select
                      id="industry"
                      name="industry"
                      value={industry}
                      onChange={(e) =>
                        setIndustry(e.target.value)
                      }
                      className="
                        w-full
                        appearance-none
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-4
                        py-3
                        pr-10
                        text-gray-800
                        outline-none
                        transition
                        focus:border-emerald-500
                        focus:ring-2
                        focus:ring-emerald-100
                      "
                    >
                      <option value="Technology">
                        Technology
                      </option>

                      <option value="Education">
                        Education
                      </option>

                      <option value="Healthcare">
                        Healthcare
                      </option>

                      <option value="Finance">
                        Finance
                      </option>

                      <option value="Marketing">
                        Marketing
                      </option>

                      <option value="Retail">
                        Retail
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>

                    <ChevronDown
                      size={18}
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                      "
                    />

                  </div>
                </div>

                {/* CITY */}

                <div>
                  <label
                    htmlFor="city"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={city}
                    onChange={(e) =>
                      setCity(e.target.value)
                    }
                    placeholder="Ahmedabad"
                    required
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-4
                      py-3
                      text-gray-800
                      outline-none
                      transition
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />
                </div>

              </div>

              {/* ABOUT */}

              <div>
                <label
                  htmlFor="about"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  About You / Your Organization
                </label>

                <textarea
                  id="about"
                  name="about"
                  rows={5}
                  value={about}
                  onChange={(e) =>
                    setAbout(e.target.value)
                  }
                  maxLength={500}
                  placeholder="Tell freelancers about yourself or your organization..."
                  required
                  className="
                    w-full
                    resize-none
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-gray-800
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />

                <p className="
                  mt-1
                  text-right
                  text-xs
                  text-gray-400
                ">
                  {about.length}/500
                </p>
              </div>

            </div>
          </section>

          {/* =========================================
              PROFESSIONAL LINKS
          ========================================= */}

          <section className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
          ">

            <button
              type="button"
              onClick={() =>
                setShowLinks((current) => !current)
              }
              className="
                flex
                w-full
                items-center
                justify-between
                p-6
                text-left
                sm:p-8
              "
              aria-expanded={showLinks}
            >

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-emerald-50
                  text-emerald-600
                ">
                  <LinkIcon size={20} />
                </div>

                <div>

                  <h2 className="
                    text-xl
                    font-semibold
                    text-gray-900
                  ">
                    Professional Links
                  </h2>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-500
                  ">
                    Connect your professional profiles
                  </p>

                </div>

              </div>

              {showLinks ? (
                <ChevronUp
                  size={20}
                  className="text-gray-400"
                />
              ) : (
                <ChevronDown
                  size={20}
                  className="text-gray-400"
                />
              )}

            </button>

            {showLinks && (
              <div className="
                border-t
                border-gray-100
                px-6
                pb-6
                pt-6
                sm:px-8
                sm:pb-8
              ">

                {/* =====================================
                    LINKEDIN
                ===================================== */}

                <div>

                  <label
                    htmlFor="linkedin"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
                    LinkedIn Profile

                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    value={linkedin}
                    onChange={(e) =>
                      setLinkedin(e.target.value)
                    }
                    placeholder="https://linkedin.com/in/username"
                    required
                    pattern="https?://(www\.)?linkedin\.com/.*"
                    title="Please enter a valid LinkedIn profile URL."
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-4
                      py-3
                      text-gray-800
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />

                  <p className="
                    mt-2
                    text-xs
                    text-gray-400
                  ">
                    LinkedIn profile is required.
                  </p>

                </div>

                {/* =====================================
                    OPTIONAL LINKS
                ===================================== */}

                <div className="mt-7">

                  <p className="
                    mb-4
                    text-sm
                    font-medium
                    text-gray-700
                  ">
                    Optional Links
                  </p>

                  <div className="
                    flex
                    flex-wrap
                    gap-3
                  ">

                    {/* COMPANY WEBSITE BUTTON */}

                    {!showCompanyWebsite && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowCompanyWebsite(true)
                        }
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-lg
                          border
                          border-dashed
                          border-gray-300
                          px-4
                          py-2.5
                          text-sm
                          font-medium
                          text-gray-600
                          transition
                          hover:border-emerald-400
                          hover:bg-emerald-50
                          hover:text-emerald-600
                        "
                      >
                        <Plus size={16} />
                        Add Company Website
                      </button>
                    )}

                    {/* GITHUB BUTTON */}

                    {!showGithub && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowGithub(true)
                        }
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-lg
                          border
                          border-dashed
                          border-gray-300
                          px-4
                          py-2.5
                          text-sm
                          font-medium
                          text-gray-600
                          transition
                          hover:border-emerald-400
                          hover:bg-emerald-50
                          hover:text-emerald-600
                        "
                      >
                        <Plus size={16} />
                        Add GitHub
                      </button>
                    )}

                    {/* GOOGLE DRIVE BUTTON */}

                    {!showGoogleDrive && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowGoogleDrive(true)
                        }
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-lg
                          border
                          border-dashed
                          border-gray-300
                          px-4
                          py-2.5
                          text-sm
                          font-medium
                          text-gray-600
                          transition
                          hover:border-emerald-400
                          hover:bg-emerald-50
                          hover:text-emerald-600
                        "
                      >
                        <Plus size={16} />
                        Add Google Drive
                      </button>
                    )}

                  </div>

                  {/* =====================================
                      COMPANY WEBSITE
                  ===================================== */}
{showCompanyWebsite && (
  <div className="mt-5">
    <div className="mb-2 flex items-center justify-between">
      <label
        htmlFor="companyWebsite"
        className="text-sm font-medium text-gray-700"
      >
        Company Website
      </label>

      <button
        type="button"
        onClick={() => {
          setShowCompanyWebsite(false);
          setCompanyWebsite("");
        }}
        className="text-xs font-medium text-red-500 hover:text-red-600"
      >
        Remove
      </button>
    </div>

    <input
      id="companyWebsite"
      name="companyWebsite"
      type="url"
      value={companyWebsite}
      onChange={(e) => setCompanyWebsite(e.target.value)}
      placeholder="https://yourcompany.com"
      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
    />
  </div>
)}

                  {/* =====================================
                      GITHUB
                  ===================================== */}

                  {showGithub && (
                    <div className="mt-5">

                      <div className="
                        mb-2
                        flex
                        items-center
                        justify-between
                      ">

                        <label
                          htmlFor="github"
                          className="
                            text-sm
                            font-medium
                            text-gray-700
                          "
                        >
                          GitHub Profile
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setShowGithub(false);
                            setGithub("");
                          }}
                          className="
                            text-xs
                            font-medium
                            text-red-500
                            hover:text-red-600
                          "
                        >
                          Remove
                        </button>

                      </div>

                      <input
                        id="github"
                        name="github"
                        type="url"
                        value={github}
                        onChange={(e) =>
                          setGithub(e.target.value)
                        }
                        placeholder="https://github.com/username"
                        className="
                          w-full
                          rounded-lg
                          border
                          border-gray-300
                          px-4
                          py-3
                          text-gray-800
                          outline-none
                          transition
                          focus:border-emerald-500
                          focus:ring-2
                          focus:ring-emerald-100
                        "
                      />

                    </div>
                  )}



                </div>

              </div>
            )}

          </section>

          {/* =========================================
              CREATE PROFILE
          ========================================= */}

          <div className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          ">

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-lg
                bg-emerald-600
                px-6
                py-3.5
                text-base
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-emerald-700
                hover:shadow-md
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-500
                focus:ring-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading
                ? "Creating Profile..."
                : "Create Profile"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}