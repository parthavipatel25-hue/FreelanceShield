"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

interface Portfolio {
  id: number;
  freelancer_id: number;
  title: string;
  description: string;
  technologies: string | null;
  project_link: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export default function EditPortfolioPage() {
  const router = useRouter();
  const params = useParams();

  const portfolioId = params.id as string;

  // ==================================================
  // USER
  // ==================================================

  const [user, setUser] = useState<User | null>(null);

  // ==================================================
  // PORTFOLIO
  // ==================================================

  const [portfolio, setPortfolio] =
    useState<Portfolio | null>(null);

  // ==================================================
  // FORM
  // ==================================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [projectLink, setProjectLink] = useState("");

  // ==================================================
  // IMAGE
  // ==================================================

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // Used to tell backend that existing image should be removed
  const [removeImage, setRemoveImage] = useState(false);

  // ==================================================
  // STATES
  // ==================================================

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ==================================================
  // GET USER
  // ==================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: User = JSON.parse(storedUser);

      if (loggedInUser.role !== "freelancer") {
        router.push("/login");
        return;
      }

      setUser(loggedInUser);
    } catch (error) {
      console.error("Invalid user data:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      router.push("/login");
    }
  }, [router]);

  // ==================================================
  // FETCH PORTFOLIO
  // ==================================================

  useEffect(() => {
    if (!user || !portfolioId) {
      return;
    }

    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `http://localhost:5000/api/portfolio/freelancer/${user.id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load portfolio."
          );
        }

        const foundProject = data.portfolio.find(
          (item: Portfolio) =>
            item.id === Number(portfolioId)
        );

        if (!foundProject) {
          throw new Error(
            "Portfolio project not found."
          );
        }

        // Make sure freelancer owns this project
        if (
          foundProject.freelancer_id !== user.id
        ) {
          throw new Error(
            "You are not allowed to edit this project."
          );
        }

        setPortfolio(foundProject);

        setTitle(foundProject.title);
        setDescription(foundProject.description);
        setTechnologies(
          foundProject.technologies || ""
        );
        setProjectLink(
          foundProject.project_link || ""
        );

        if (foundProject.image) {
          setImagePreview(foundProject.image);
        } else {
          setImagePreview("");
        }

        setRemoveImage(false);
      } catch (error) {
        console.error(
          "FETCH PORTFOLIO ERROR:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load portfolio project."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [user, portfolioId]);

  // ==================================================
  // HANDLE IMAGE CHANGE
  // ==================================================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Only images
    if (!file.type.startsWith("image/")) {
      setErrorMessage(
        "Please select a valid image file."
      );

      e.target.value = "";
      return;
    }

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        "Image size must be less than 5 MB."
      );

      e.target.value = "";
      return;
    }

    setErrorMessage("");
    setMessage("");

    setImage(file);

    // If user selects a new image,
    // do not remove the new image
    setRemoveImage(false);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // ==================================================
  // REMOVE IMAGE
  // ==================================================

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview("");
    setRemoveImage(true);

    // Clear file input so the same image
    // can be selected again if needed
    const fileInput =
      document.getElementById(
        "image"
      ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }

    setMessage("");
    setErrorMessage("");
  };

  // ==================================================
  // UPDATE PROJECT
  // ==================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    if (!title.trim()) {
      setErrorMessage(
        "Project title is required."
      );
      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        "Project description is required."
      );
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setErrorMessage("");

      const formData = new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "technologies",
        technologies.trim()
      );

      formData.append(
        "project_link",
        projectLink.trim()
      );

      // If user selected a new image
      if (image) {
        formData.append("image", image);
      }

      // If user removed the existing image
      if (removeImage && !image) {
        formData.append(
          "remove_image",
          "true"
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/portfolio/${portfolioId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update portfolio project."
        );
      }

      setPortfolio(data.portfolio);

      if (data.portfolio.image) {
        setImagePreview(
          data.portfolio.image
        );
      } else {
        setImagePreview("");
      }

      setImage(null);
      setRemoveImage(false);

      setMessage(
        "Portfolio project updated successfully!"
      );

      // Go back after successful update
      setTimeout(() => {
        router.push(
          "/freelancer/portfolio"
        );
      }, 1000);
    } catch (error) {
      console.error(
        "UPDATE PORTFOLIO ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update portfolio project."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading portfolio project...
        </p>
      </div>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto w-full max-w-3xl">

        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            router.push(
              "/freelancer/portfolio"
            )
          }
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-gray-600
            transition
            hover:text-emerald-600
          "
        >
          ← Back to My Portfolio
        </button>

        {/* ==================================================
            FORM CARD
        ================================================== */}

        <section
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-5
            shadow-sm
            sm:p-7
            lg:p-8
          "
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-7">

            <h1
              className="
                text-2xl
                font-bold
                text-gray-800
                sm:text-3xl
              "
            >
              Edit Portfolio Project
            </h1>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-gray-500
              "
            >
              Update your project information
              and showcase your work.
            </p>

          </div>

          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {message && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-emerald-200
                bg-emerald-50
                px-4
                py-3
                text-sm
                font-medium
                text-emerald-700
              "
            >
              {message}
            </div>
          )}

          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {errorMessage && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                font-medium
                text-red-700
              "
            >
              {errorMessage}
            </div>
          )}

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ==================================================
                TITLE
            ================================================== */}

            <div>

              <label
                htmlFor="title"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                Project Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="E-Commerce Website"
                required
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-3
                  text-sm
                  text-gray-800
                  outline-none
                  transition
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                "
              />

            </div>

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <div>

              <label
                htmlFor="description"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Describe the project..."
                rows={6}
                required
                className="
                  w-full
                  resize-y
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-gray-800
                  outline-none
                  transition
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                "
              />

            </div>

            {/* ==================================================
                TECHNOLOGIES
            ================================================== */}

            <div>

              <label
                htmlFor="technologies"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                Technologies Used
              </label>

              <input
                id="technologies"
                type="text"
                value={technologies}
                onChange={(e) =>
                  setTechnologies(
                    e.target.value
                  )
                }
                placeholder="React.js, Node.js, PostgreSQL"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-3
                  text-sm
                  text-gray-800
                  outline-none
                  transition
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                "
              />

              <p className="mt-1 text-xs text-gray-400">
                Separate technologies using commas.
              </p>

            </div>

            {/* ==================================================
                PROJECT LINK
            ================================================== */}

            <div>

              <label
                htmlFor="projectLink"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                Project Link

                <span
                  className="
                    ml-1
                    font-normal
                    text-gray-400
                  "
                >
                  (optional)
                </span>
              </label>

              <input
                id="projectLink"
                type="url"
                value={projectLink}
                onChange={(e) =>
                  setProjectLink(
                    e.target.value
                  )
                }
                placeholder="https://github.com/username/project"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-3
                  text-sm
                  text-gray-800
                  outline-none
                  transition
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                "
              />

            </div>

            {/* ==================================================
                PROJECT IMAGE
            ================================================== */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                Project Image
              </label>

              {/* ==================================================
                  IMAGE PREVIEW
              ================================================== */}

              {imagePreview ? (
                <div
                  className="
                    relative
                    mb-4
                    overflow-hidden
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-100
                  "
                >

                  <img
                    src={imagePreview}
                    alt="Project preview"
                    className="
                      max-h-80
                      w-full
                      object-contain
                    "
                  />

                  {/* REMOVE IMAGE BUTTON */}

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={submitting}
                    aria-label="Remove image"
                    className="
                      absolute
                      right-3
                      top-3
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      bg-red-600
                      text-xl
                      font-bold
                      text-white
                      shadow-md
                      transition
                      hover:bg-red-700
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    ×
                  </button>

                </div>
              ) : (
                <div
                  className="
                    mb-4
                    flex
                    min-h-40
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    text-center
                  "
                >
                  <div>

                    <div className="text-3xl">
                      🖼️
                    </div>

                    <p className="mt-2 text-sm font-medium text-gray-500">
                      No website image selected
                    </p>

                  </div>
                </div>
              )}

              {/* ==================================================
                  CHOOSE WEBSITE IMAGE
              ================================================== */}

              <label
                htmlFor="image"
                className="
                  flex
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-xl
                  border-2
                  border-dashed
                  border-gray-300
                  px-5
                  py-6
                  text-center
                  transition
                  hover:border-emerald-400
                  hover:bg-emerald-50
                "
              >
                <div>

                  <div className="text-2xl">
                    🖼️
                  </div>

                  <p
                    className="
                      mt-2
                      text-sm
                      font-semibold
                      text-gray-700
                    "
                  >
                    Choose New Image
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-400
                    "
                  >
                    PNG, JPG, JPEG or WEBP
                    · Maximum 5 MB
                  </p>

                </div>
              </label>

              <input
                id="image"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* SELECTED FILE NAME */}

              {image && (
                <div
                  className="
                    mt-3
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    bg-emerald-50
                    px-4
                    py-3
                  "
                >

                  <p
                    className="
                      min-w-0
                      truncate
                      text-xs
                      font-medium
                      text-emerald-700
                    "
                  >
                    {image.name}
                  </p>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={submitting}
                    className="
                      ml-3
                      shrink-0
                      text-xs
                      font-semibold
                      text-red-600
                      hover:text-red-700
                    "
                  >
                    Remove
                  </button>

                </div>
              )}

            </div>

            {/* ==================================================
                BUTTONS
            ================================================== */}

            <div
              className="
                flex
                flex-col-reverse
                gap-3
                border-t
                border-gray-100
                pt-6
                sm:flex-row
                sm:justify-end
              "
            >

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/freelancer/portfolio"
                  )
                }
                disabled={submitting}
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:w-auto
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="
                  w-full
                  rounded-xl
                  bg-emerald-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-emerald-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:w-auto
                "
              >
                {submitting
                  ? "Updating..."
                  : "Update Project"}
              </button>

            </div>

          </form>

        </section>

      </div>

    </div>
  );
}