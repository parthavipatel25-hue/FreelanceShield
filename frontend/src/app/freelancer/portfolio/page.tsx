"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../../components/layout/DashboardLayout";

// ============================================================
// CONSTANTS
// ============================================================

const API_BASE_URL = "http://localhost:5000";

// ============================================================
// TYPES
// ============================================================

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

interface PortfolioForm {
  title: string;
  description: string;
  technologies: string;
  project_link: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  portfolio?: Portfolio;
  portfolios?: Portfolio[];
}

// ============================================================
// IMAGE URL
// ============================================================

function getImageUrl(image: string | null): string {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  const cleanImage = image.startsWith("/")
    ? image
    : `/${image}`;

  return `${API_BASE_URL}${cleanImage}`;
}

// ============================================================
// READ API RESPONSE
// ============================================================

async function readApiResponse(
  response: Response
): Promise<ApiResponse> {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return {
        success: false,
        message: `Server returned invalid JSON. HTTP ${response.status}`,
      };
    }
  }

  const text = await response.text();

  return {
    success: false,
    message:
      text ||
      `Server returned HTTP ${response.status}`,
  };
}

// ============================================================
// COMPONENT
// ============================================================

export default function FreelancerPortfolioPage() {
  const router = useRouter();

  // ==========================================================
  // USER
  // ==========================================================

  const [user, setUser] = useState<User | null>(null);

  // ==========================================================
  // PORTFOLIO
  // ==========================================================

  const [portfolio, setPortfolio] = useState<Portfolio[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  // ==========================================================
  // ADD
  // ==========================================================

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [form, setForm] = useState<PortfolioForm>({
    title: "",
    description: "",
    technologies: "",
    project_link: "",
  });

  const [submitting, setSubmitting] =
    useState(false);

  const [addImage, setAddImage] =
    useState<File | null>(null);

  const [addImagePreview, setAddImagePreview] =
    useState("");

  // ==========================================================
  // EDIT
  // ==========================================================

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editForm, setEditForm] =
    useState<PortfolioForm>({
      title: "",
      description: "",
      technologies: "",
      project_link: "",
    });

  const [updating, setUpdating] =
    useState(false);

  const [editImage, setEditImage] =
    useState<File | null>(null);

  const [editImagePreview, setEditImagePreview] =
    useState("");

  const [removeImage, setRemoveImage] =
    useState(false);

  // ==========================================================
  // MESSAGES
  // ==========================================================

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = (): string | null => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  };

  // ==========================================================
  // LOAD USER
  // ==========================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: User =
        JSON.parse(storedUser);

      if (
        !loggedInUser.id ||
        loggedInUser.role !== "freelancer"
      ) {
        router.push("/login");
        return;
      }

      setUser(loggedInUser);
    } catch (error) {
      console.error("INVALID USER DATA:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      router.push("/login");
    }
  }, [router]);

  // ==========================================================
  // FETCH PORTFOLIO
  // ==========================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const token = getToken();

        const headers: HeadersInit = {
          Accept: "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const url =
          `${API_BASE_URL}/api/portfolio/freelancer/${user.id}`;

        console.log("GET PORTFOLIO URL:", url);

        const response = await fetch(url, {
          method: "GET",
          headers,
          cache: "no-store",
        });

        const data =
          await readApiResponse(response);

        console.log(
          "FETCH PORTFOLIO:",
          response.status,
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              `Failed to load portfolio. HTTP ${response.status}`
          );
        }

        if (data.success === false) {
          throw new Error(
            data.message ||
              "Failed to load portfolio."
          );
        }

        setPortfolio(
          Array.isArray(data.portfolios)
            ? data.portfolios
            : []
        );
      } catch (error) {
        console.error(
          "FETCH PORTFOLIO ERROR:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your portfolio."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [user]);

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // EDIT FORM CHANGE
  // ==========================================================

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // IMAGE VALIDATION
  // ==========================================================

  const validateImage = (file: File): boolean => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        "Please select JPG, JPEG, PNG or WEBP image."
      );
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        "Image size must be less than 5 MB."
      );
      return false;
    }

    return true;
  };

  // ==========================================================
  // ADD IMAGE
  // ==========================================================

  const handleAddImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    if (addImagePreview) {
      URL.revokeObjectURL(addImagePreview);
    }

    setErrorMessage("");
    setAddImage(file);

    const preview = URL.createObjectURL(file);

    setAddImagePreview(preview);
  };

  // ==========================================================
  // REMOVE ADD IMAGE
  // ==========================================================

  const handleRemoveAddImage = () => {
    if (addImagePreview) {
      URL.revokeObjectURL(addImagePreview);
    }

    setAddImage(null);
    setAddImagePreview("");
  };

  // ==========================================================
  // EDIT IMAGE
  // ==========================================================

  const handleEditImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }

    setErrorMessage("");
    setEditImage(file);
    setRemoveImage(false);

    const preview = URL.createObjectURL(file);

    setEditImagePreview(preview);
  };

  // ==========================================================
  // REMOVE EDIT IMAGE
  // ==========================================================

  const handleRemoveEditImage = () => {
    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditImage(null);
    setEditImagePreview("");
    setRemoveImage(true);
  };

  // ==========================================================
  // RESET ADD FORM
  // ==========================================================

  const resetAddForm = () => {
    if (addImagePreview) {
      URL.revokeObjectURL(addImagePreview);
    }

    setForm({
      title: "",
      description: "",
      technologies: "",
      project_link: "",
    });

    setAddImage(null);
    setAddImagePreview("");
    setShowAddForm(false);
  };

  // ==========================================================
  // OPEN ADD
  // ==========================================================

  const handleOpenAddForm = () => {
    setMessage("");
    setErrorMessage("");

    setForm({
      title: "",
      description: "",
      technologies: "",
      project_link: "",
    });

    setAddImage(null);
    setAddImagePreview("");

    setShowAddForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================================
  // CLOSE ADD
  // ==========================================================

  const handleCloseAddForm = () => {
    if (submitting) {
      return;
    }

    resetAddForm();

    setMessage("");
    setErrorMessage("");
  };

  // ==========================================================
  // ADD PORTFOLIO
  // ==========================================================

  const handleAddSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!user) {
      setErrorMessage(
        "User information is missing."
      );
      return;
    }

    if (!form.title.trim()) {
      setErrorMessage(
        "Project title is required."
      );
      return;
    }

    if (!form.description.trim()) {
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
        "freelancer_id",
        String(user.id)
      );

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "technologies",
        form.technologies.trim()
      );

      formData.append(
        "project_link",
        form.project_link.trim()
      );

      if (addImage) {
        formData.append(
          "image",
          addImage
        );
      }

      const token = getToken();

      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/portfolio`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      const data =
        await readApiResponse(response);

      console.log(
        "ADD PORTFOLIO:",
        response.status,
        data
      );

      if (
        !response.ok ||
        data.success !== true
      ) {
        throw new Error(
          data.message ||
            `Failed to add portfolio. HTTP ${response.status}`
        );
      }

      if (!data.portfolio) {
        throw new Error(
          "Portfolio was created but no project was returned."
        );
      }

      setPortfolio((previous) => [
        data.portfolio!,
        ...previous,
      ]);

      resetAddForm();

      setMessage(
        "Portfolio project added successfully!"
      );
    } catch (error) {
      console.error(
        "ADD PORTFOLIO ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to add portfolio project."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const handleEdit = (item: Portfolio) => {
    setMessage("");
    setErrorMessage("");

    setEditingId(item.id);

    setEditForm({
      title: item.title,
      description: item.description,
      technologies: item.technologies || "",
      project_link: item.project_link || "",
    });

    setEditImage(null);
    setEditImagePreview("");
    setRemoveImage(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================================
  // CLOSE EDIT
  // ==========================================================

  const handleCloseEdit = () => {
    if (updating) {
      return;
    }

    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditingId(null);

    setEditForm({
      title: "",
      description: "",
      technologies: "",
      project_link: "",
    });

    setEditImage(null);
    setEditImagePreview("");
    setRemoveImage(false);

    setMessage("");
    setErrorMessage("");
  };

  // ==========================================================
  // UPDATE PORTFOLIO
  // ==========================================================

  const handleUpdateSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (editingId === null) {
      return;
    }

    if (!editForm.title.trim()) {
      setErrorMessage(
        "Project title is required."
      );
      return;
    }

    if (!editForm.description.trim()) {
      setErrorMessage(
        "Project description is required."
      );
      return;
    }

    try {
      setUpdating(true);
      setMessage("");
      setErrorMessage("");

      const formData = new FormData();

      formData.append(
        "title",
        editForm.title.trim()
      );

      formData.append(
        "description",
        editForm.description.trim()
      );

      formData.append(
        "technologies",
        editForm.technologies.trim()
      );

      formData.append(
        "project_link",
        editForm.project_link.trim()
      );

      formData.append(
        "remove_image",
        removeImage ? "true" : "false"
      );

      if (editImage) {
        formData.append(
          "image",
          editImage
        );
      }

      const token = getToken();

      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/portfolio/${editingId}`,
        {
          method: "PUT",
          headers,
          body: formData,
        }
      );

      const data =
        await readApiResponse(response);

      console.log(
        "UPDATE PORTFOLIO:",
        response.status,
        data
      );

      if (
        !response.ok ||
        data.success !== true
      ) {
        throw new Error(
          data.message ||
            `Failed to update portfolio. HTTP ${response.status}`
        );
      }

      if (!data.portfolio) {
        throw new Error(
          "Project updated but server did not return portfolio data."
        );
      }

      setPortfolio((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? data.portfolio!
            : item
        )
      );

      handleCloseEdit();

      setMessage(
        "Portfolio project updated successfully!"
      );
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
      setUpdating(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this portfolio project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      const token = getToken();

      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/portfolio/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data =
        await readApiResponse(response);

      console.log(
        "DELETE PORTFOLIO:",
        response.status,
        data
      );

      if (
        !response.ok ||
        data.success !== true
      ) {
        throw new Error(
          data.message ||
            `Failed to delete portfolio. HTTP ${response.status}`
        );
      }

      setPortfolio((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );

      setMessage(
        "Portfolio project deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE PORTFOLIO ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete portfolio project."
      );
    }
  };

  // ==========================================================
  // WAIT FOR USER
  // ==========================================================

  if (!user) {
    return null;
  }

  // ==========================================================
  // EDITING PROJECT
  // ==========================================================

  const editingProject =
    editingId !== null
      ? portfolio.find(
          (item) => item.id === editingId
        )
      : null;

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <DashboardLayout role="freelancer">
      <div className="mx-auto w-full max-w-7xl">

        {/* ==================================================
            EDIT PAGE
        ================================================== */}

        {editingId !== null &&
        editingProject ? (
          <section className="mx-auto max-w-3xl">

            <button
              type="button"
              onClick={handleCloseEdit}
              disabled={updating}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-600"
            >
              ← Back to My Portfolio
            </button>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                Edit Portfolio Project
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Update your project information and image.
              </p>
            </div>

            {message && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

              <form
                onSubmit={handleUpdateSubmit}
                className="space-y-6"
              >

                <div>
                  <label
                    htmlFor="edit-title"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Project Title
                  </label>

                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    value={editForm.title}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-description"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="edit-description"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows={5}
                    required
                    className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-technologies"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Technologies Used
                  </label>

                  <input
                    id="edit-technologies"
                    name="technologies"
                    type="text"
                    value={editForm.technologies}
                    onChange={handleEditChange}
                    placeholder="React.js, Node.js, MySQL"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-project-link"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Project Link
                  </label>

                  <input
                    id="edit-project-link"
                    name="project_link"
                    type="url"
                    value={editForm.project_link}
                    onChange={handleEditChange}
                    placeholder="https://github.com/username/project"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Project Image
                  </label>

                  {!removeImage &&
                    (editImagePreview ||
                      editingProject.image) && (
                      <div className="relative mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">

                        <img
                          src={
                            editImagePreview ||
                            getImageUrl(
                              editingProject.image
                            )
                          }
                          alt={editingProject.title}
                          className="h-64 w-full object-cover sm:h-80"
                        />

                        <button
                          type="button"
                          onClick={
                            handleRemoveEditImage
                          }
                          disabled={updating}
                          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl font-bold text-gray-700 shadow-lg hover:bg-red-50 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}

                  {removeImage && (
                    <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center">
                      <p className="text-sm text-gray-500">
                        Image removed.
                      </p>
                    </div>
                  )}

                  <label className="inline-flex cursor-pointer items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                    Choose New Image

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={
                        handleEditImageChange
                      }
                      className="hidden"
                    />
                  </label>

                  <p className="mt-2 text-xs text-gray-400">
                    JPG, PNG, JPEG or WEBP · Maximum 5 MB
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    disabled={updating}
                    className="w-full rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {updating
                      ? "Updating..."
                      : "Update Project"}
                  </button>

                </div>

              </form>
            </div>
          </section>
        ) : (

          /* ==================================================
             NORMAL PAGE
          ================================================== */

          <>
            {/* HEADER */}

            <section className="mb-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl lg:text-4xl">
                    My Portfolio
                  </h1>

                  <p className="mt-2 text-sm text-gray-500 sm:text-base">
                    Showcase your previous work to potential clients.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddForm}
                  className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 sm:w-auto"
                >
                  + Add Project
                </button>

              </div>
            </section>

            {/* MESSAGES */}

            {message && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            {/* ==================================================
                ADD FORM
            ================================================== */}

            {showAddForm && (
              <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                    Add Portfolio Project
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Add a project you have previously completed.
                  </p>
                </div>

                <form
                  onSubmit={handleAddSubmit}
                  className="space-y-5"
                >

                  {/* TITLE */}

                  <div>
                    <label
                      htmlFor="add-title"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Project Title
                    </label>

                    <input
                      id="add-title"
                      name="title"
                      type="text"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="E-Commerce Website"
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  {/* DESCRIPTION */}

                  <div>
                    <label
                      htmlFor="add-description"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Description
                    </label>

                    <textarea
                      id="add-description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the project..."
                      rows={5}
                      required
                      className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  {/* TECHNOLOGIES */}

                  <div>
                    <label
                      htmlFor="add-technologies"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Technologies Used
                    </label>

                    <input
                      id="add-technologies"
                      name="technologies"
                      type="text"
                      value={form.technologies}
                      onChange={handleChange}
                      placeholder="React.js, Node.js, MySQL"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />

                    <p className="mt-1 text-xs text-gray-400">
                      Separate technologies using commas.
                    </p>
                  </div>

                  {/* PROJECT LINK */}

                  <div>
                    <label
                      htmlFor="add-project-link"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Project Link
                    </label>

                    <input
                      id="add-project-link"
                      name="project_link"
                      type="url"
                      value={form.project_link}
                      onChange={handleChange}
                      placeholder="https://github.com/username/project"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  {/* IMAGE */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Project Image
                    </label>

                    {addImagePreview && (
                      <div className="relative mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">

                        <img
                          src={addImagePreview}
                          alt="Selected project"
                          className="h-64 w-full object-cover sm:h-80"
                        />

                        <button
                          type="button"
                          onClick={
                            handleRemoveAddImage
                          }
                          disabled={submitting}
                          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl font-bold text-gray-700 shadow-lg hover:bg-red-50 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    <label
                      htmlFor="add-project-image"
                      className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-5 py-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
                    >
                      <div>
                        <div className="text-3xl">
                          🖼️
                        </div>

                        <p className="mt-2 text-sm font-semibold text-gray-700">
                          Choose Website Image
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          PNG, JPG, JPEG or WEBP · Maximum 5 MB
                        </p>
                      </div>
                    </label>

                    <input
                      id="add-project-image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={
                        handleAddImageChange
                      }
                      className="hidden"
                    />
                  </div>

                  {/* BUTTONS */}

                  <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={
                        handleCloseAddForm
                      }
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {submitting
                        ? "Adding..."
                        : "Add Project"}
                    </button>

                  </div>
                </form>
              </section>
            )}

            {/* LOADING */}

            {loading && (
              <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-gray-500">
                  Loading your portfolio...
                </p>
              </section>
            )}

            {/* EMPTY */}

            {!loading &&
              portfolio.length === 0 &&
              !showAddForm && (
                <section className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                    <span className="text-3xl">
                      💼
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-gray-800">
                    Your Portfolio is Empty
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Add your previous projects, websites, applications, or other work.
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleOpenAddForm
                    }
                    className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    + Add Your First Project
                  </button>

                </section>
              )}

            {/* PORTFOLIO */}

            {!loading &&
              portfolio.length > 0 && (
                <section>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                    {portfolio.map((item) => {

                      const technologyList =
                        item.technologies
                          ? item.technologies
                              .split(",")
                              .map((tech) =>
                                tech.trim()
                              )
                              .filter(Boolean)
                          : [];

                      return (
                        <article
                          key={item.id}
                          className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >

                          {/* IMAGE */}

                          {item.image ? (
                            <div className="aspect-video w-full overflow-hidden bg-gray-100">

                              <img
                                src={getImageUrl(
                                  item.image
                                )}
                                alt={item.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  console.error(
                                    "IMAGE LOAD ERROR:",
                                    getImageUrl(
                                      item.image
                                    )
                                  );

                                  e.currentTarget.style.display =
                                    "none";
                                }}
                              />

                            </div>
                          ) : (
                            <div className="flex aspect-video w-full items-center justify-center bg-emerald-50">
                              <span className="text-4xl">
                                💼
                              </span>
                            </div>
                          )}

                          {/* CONTENT */}

                          <div className="flex flex-1 flex-col p-5">

                            <h2 className="break-words text-lg font-bold text-gray-800">
                              {item.title}
                            </h2>

                            <p className="mt-2 line-clamp-4 text-sm leading-6 text-gray-500">
                              {item.description}
                            </p>

                            {/* TECHNOLOGIES */}

                            {technologyList.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">

                                {technologyList.map(
                                  (
                                    technology,
                                    index
                                  ) => (
                                    <span
                                      key={`${technology}-${index}`}
                                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                                    >
                                      {technology}
                                    </span>
                                  )
                                )}

                              </div>
                            )}

                            {/* BUTTONS */}

                            <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">

                              {item.project_link && (
                                <a
                                  href={
                                    item.project_link
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                  View Project
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    item
                                  )
                                }
                                className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    item.id
                                  )
                                }
                                className="flex-1 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>

                            </div>

                          </div>
                        </article>
                      );
                    })}

                  </div>
                </section>
              )}

          </>
        )}

      </div>
    </DashboardLayout>
  );
}