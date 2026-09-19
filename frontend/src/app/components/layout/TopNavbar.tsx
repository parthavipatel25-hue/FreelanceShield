"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Settings,
  CheckCheck,
  BriefcaseBusiness,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  id: number;
  fullname: string;
  role: "admin" | "freelancer" | "client";
  email?: string;
}

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  reference_id: number | null;
  is_read: boolean;
  created_at: string;
}

interface ProjectSearchResult {
  id: number;
  client_id: number;
  client_user_id?: number;
  client_name?: string;
  client_user_name?: string;
  client_email?: string;
  title: string;
  description: string;
  category: string;
  skills: string | null;
  budget: number;
  budget_type: string;
  deadline: string;
  status?: string;
}

interface FreelancerSearchResult {
  id: number;
  user_id: number;
  fullname: string;
  email: string;
  profile_picture: string | null;
  professional_title: string | null;
  category: string | null;
  city: string | null;
  skills: string | null;
  about: string | null;
}

export default function TopNavbar() {
  const router = useRouter();

  // ============================================
  // USER
  // ============================================

  const [user, setUser] = useState<User | null>(null);

  // ============================================
  // NOTIFICATIONS
  // ============================================

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  // ============================================
  // SEARCH
  // ============================================

  const [searchText, setSearchText] = useState("");

  const [searching, setSearching] = useState(false);

  const [showSearchResults, setShowSearchResults] =
    useState(false);

  const [projectResults, setProjectResults] = useState<
    ProjectSearchResult[]
  >([]);

  const [freelancerResults, setFreelancerResults] =
    useState<FreelancerSearchResult[]>([]);

  const [searchError, setSearchError] = useState("");

  // ============================================
  // LOAD LOGGED-IN USER
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser: User = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
    }
  }, []);

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================

  const fetchNotifications = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoadingNotifications(true);

      const response = await fetch(
        `http://localhost:5000/api/notifications/user/${user.id}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load notifications."
        );
      }

      const loadedNotifications: Notification[] =
        data.notifications || [];

      setNotifications(loadedNotifications);

      setUnreadCount(
        loadedNotifications.filter(
          (notification) => !notification.is_read
        ).length
      );
    } catch (error) {
      console.error(
        "FETCH NOTIFICATIONS ERROR:",
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  // ============================================
  // INITIAL LOAD + AUTO REFRESH
  // ============================================

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.id]);

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = async () => {
    const trimmedSearch = searchText.trim();

    // Empty search
    if (trimmedSearch === "") {
      setProjectResults([]);
      setFreelancerResults([]);
      setShowSearchResults(false);
      setSearchError("");
      return;
    }

    // Admin search
    if (user?.role === "admin") {
      setSearchError(
        "Admin search will be available soon."
      );

      setProjectResults([]);
      setFreelancerResults([]);
      setShowSearchResults(true);

      return;
    }

    try {
      setSearching(true);
      setSearchError("");

      setProjectResults([]);
      setFreelancerResults([]);

      // ==========================================
      // FREELANCER SEARCH
      // Search:
      // - Project name
      // - Client name
      // - Category
      // - Skills
      // - Description
      // ==========================================

      if (user?.role === "freelancer") {
        const params = new URLSearchParams();

        params.append("search", trimmedSearch);

        const response = await fetch(
          `http://localhost:5000/api/projects/search?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to search projects."
          );
        }

        setProjectResults(data.projects || []);
      }

      // ==========================================
      // CLIENT SEARCH
      // Search:
      // - Freelancer name
      // - Professional title
      // - Category
      // - Skills
      // - About
      // ==========================================

      if (user?.role === "client") {
        const params = new URLSearchParams();

        params.append("search", trimmedSearch);

        const response = await fetch(
          `http://localhost:5000/api/freelancer-profile/search?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to search freelancers."
          );
        }

        setFreelancerResults(
          data.freelancers || []
        );
      }

      setShowSearchResults(true);
    } catch (error) {
      console.error("SEARCH ERROR:", error);

      setSearchError(
        error instanceof Error
          ? error.message
          : "Unable to perform search."
      );

      setShowSearchResults(true);
    } finally {
      setSearching(false);
    }
  };

  // ============================================
  // SEARCH ENTER KEY
  // ============================================

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // ============================================
  // CLEAR SEARCH
  // ============================================

  const handleClearSearch = () => {
    setSearchText("");
    setProjectResults([]);
    setFreelancerResults([]);
    setSearchError("");
    setShowSearchResults(false);
  };

  // ============================================
  // FORMAT SKILLS
  // ============================================

  const formatSkills = (
    skillsValue: string | null
  ): string[] => {
    if (!skillsValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(skillsValue);

      if (Array.isArray(parsed)) {
        return parsed
          .map((skill) => String(skill).trim())
          .filter((skill) => skill !== "");
      }
    } catch {
      // Not JSON
    }

    return skillsValue
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");
  };

  // ============================================
  // SELECT PROJECT
  // ============================================

  const handleProjectSelect = (
    project: ProjectSearchResult
  ) => {
    setShowSearchResults(false);
    setSearchText("");

    router.push(
      `/freelancer/browse-projects/${project.id}`
    );
  };

  // ============================================
  // SELECT FREELANCER
  // ============================================

  const handleFreelancerSelect = (
  freelancer: FreelancerSearchResult
) => {
  setShowSearchResults(false);
  setSearchText("");

  router.push(`/client/freelancers/${freelancer.user_id}`);
};

  // ============================================
  // MARK SINGLE NOTIFICATION AS READ
  // ============================================

  const handleNotificationClick = async (
    notification: Notification
  ) => {
    try {
      if (!notification.is_read) {
        const response = await fetch(
          `http://localhost:5000/api/notifications/${notification.id}/read`,
          {
            method: "PUT",
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setNotifications(
            (previousNotifications) =>
              previousNotifications.map((item) =>
                item.id === notification.id
                  ? {
                      ...item,
                      is_read: true,
                    }
                  : item
              )
          );

          setUnreadCount((previousCount) =>
            Math.max(previousCount - 1, 0)
          );
        }
      }
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error
      );
    }
  };

  // ============================================
  // MARK ALL AS READ
  // ============================================

  const handleMarkAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/user/${user.id}/read-all`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to mark notifications as read."
        );
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS READ ERROR:",
        error
      );
    }
  };

  // ============================================
  // SEARCH PLACEHOLDER
  // ============================================

  const placeholder =
    user?.role === "admin"
      ? "Search users, freelancers, clients..."
      : user?.role === "freelancer"
      ? "Search projects, clients, categories..."
      : "Search freelancers, skills, services...";

  // ============================================
  // FORMAT NOTIFICATION TIME
  // ============================================

  const formatNotificationTime = (
    createdAt: string
  ) => {
    const notificationDate = new Date(createdAt);
    const now = new Date();

    const difference =
      now.getTime() - notificationDate.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return notificationDate.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div
        className="
          flex
          min-h-[72px]
          items-center
          justify-between
          gap-3
          pl-20
          pr-4
          py-3
          sm:px-6
          lg:px-8
        "
      >
        {/* ============================================
            SEARCH
        ============================================ */}

        <div className="relative min-w-0 max-w-[420px] flex-1">
          <Search
            size={19}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
              sm:left-4
            "
          />

          <input
            type="text"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);

              if (event.target.value.trim() === "") {
                setShowSearchResults(false);
                setSearchError("");
                setProjectResults([]);
                setFreelancerResults([]);
              }
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder={placeholder}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              bg-gray-50
              py-2.5
              pl-10
              pr-10
              text-xs
              outline-none
              transition-all
              duration-300
              focus:border-emerald-500
              focus:bg-white
              focus:ring-2
              focus:ring-emerald-100
              sm:py-3
              sm:pl-12
              sm:pr-10
              sm:text-sm
            "
          />

          {/* SEARCH BUTTON */}

          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="
              absolute
              right-2
              top-1/2
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-lg
              text-gray-400
              transition
              hover:bg-emerald-50
              hover:text-emerald-600
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:right-3
            "
            aria-label="Search"
          >
            <Search size={16} />
          </button>

          {/* CLEAR BUTTON */}

          {searchText && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="
                absolute
                right-10
                top-1/2
                -translate-y-1/2
                text-gray-400
                transition
                hover:text-gray-600
                sm:right-12
              "
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}

          {/* ==========================================
              SEARCH RESULTS DROPDOWN
          ========================================== */}

          {showSearchResults && (
            <div
              className="
                absolute
                left-0
                right-0
                top-full
                z-50
                mt-3
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-xl
              "
            >
              {/* SEARCHING */}

              {searching && (
                <div className="px-4 py-8 text-center">
                  <div
                    className="
                      mx-auto
                      h-7
                      w-7
                      animate-spin
                      rounded-full
                      border-2
                      border-emerald-200
                      border-t-emerald-600
                    "
                  />

                  <p className="mt-3 text-sm text-gray-500">
                    Searching...
                  </p>
                </div>
              )}

              {/* ERROR */}

              {!searching && searchError && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm font-medium text-red-600">
                    {searchError}
                  </p>
                </div>
              )}

              {/* ========================================
                  FREELANCER PROJECT RESULTS
              ======================================== */}

              {!searching &&
                !searchError &&
                user?.role === "freelancer" && (
                  <div>
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Projects
                      </p>
                    </div>

                    {projectResults.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <BriefcaseBusiness
                          size={28}
                          className="mx-auto text-gray-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-gray-700">
                          No projects found
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Try another project name,
                          client name, skill, or category.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[400px] overflow-y-auto">
                        {projectResults.map(
                          (project) => (
                            <button
                              key={project.id}
                              type="button"
                              onClick={() =>
                                handleProjectSelect(
                                  project
                                )
                              }
                              className="
                                flex
                                w-full
                                gap-3
                                border-b
                                border-gray-100
                                px-4
                                py-4
                                text-left
                                transition
                                hover:bg-emerald-50
                              "
                            >
                              {/* PROJECT ICON */}

                              <div
                                className="
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-emerald-100
                                "
                              >
                                <BriefcaseBusiness
                                  size={19}
                                  className="text-emerald-600"
                                />
                              </div>

                              {/* PROJECT INFO */}

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                  {project.title}
                                </p>

                                <p className="mt-1 text-xs text-emerald-600">
                                  {project.category}
                                </p>

                                {/* CLIENT NAME */}

                                {(project.client_name ||
                                  project.client_user_name) && (
                                  <p className="mt-1 text-xs font-medium text-gray-600">
                                    Client:{" "}
                                    {project.client_name ||
                                      project.client_user_name}
                                  </p>
                                )}

                                {/* SKILLS */}

                                <div className="mt-2 flex flex-wrap gap-1">
                                  {formatSkills(
                                    project.skills
                                  )
                                    .slice(0, 3)
                                    .map(
                                      (
                                        skill,
                                        index
                                      ) => (
                                        <span
                                          key={`${skill}-${index}`}
                                          className="
                                            rounded-full
                                            bg-gray-100
                                            px-2
                                            py-0.5
                                            text-[10px]
                                            font-medium
                                            text-gray-600
                                          "
                                        >
                                          {skill}
                                        </span>
                                      )
                                    )}
                                </div>

                                <p className="mt-2 text-[11px] font-medium text-emerald-600">
                                  Click to view project →
                                </p>
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* ========================================
                  CLIENT FREELANCER RESULTS
              ======================================== */}

              {!searching &&
                !searchError &&
                user?.role === "client" && (
                  <div>
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Freelancers
                      </p>
                    </div>

                    {freelancerResults.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <UserRound
                          size={28}
                          className="mx-auto text-gray-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-gray-700">
                          No freelancers found
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Try another name, skill,
                          category, or service.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[400px] overflow-y-auto">
                        {freelancerResults.map(
                          (freelancer) => {
                            const freelancerSkills =
                              formatSkills(
                                freelancer.skills
                              );

                            return (
                              <button
                                key={freelancer.user_id}
                                type="button"
                                onClick={() =>
                                  handleFreelancerSelect(
                                    freelancer
                                  )
                                }
                                className="
                                  flex
                                  w-full
                                  gap-3
                                  border-b
                                  border-gray-100
                                  px-4
                                  py-4
                                  text-left
                                  transition
                                  hover:bg-emerald-50
                                "
                              >
                                {/* PROFILE IMAGE */}

                                <div
                                  className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    rounded-full
                                    bg-emerald-100
                                  "
                                >
                                  {freelancer.profile_picture ? (
                                    <img
                                      src={`http://localhost:5000${freelancer.profile_picture}`}
                                      alt={
                                        freelancer.fullname
                                      }
                                      className="
                                        h-full
                                        w-full
                                        object-cover
                                      "
                                    />
                                  ) : (
                                    <UserRound
                                      size={21}
                                      className="text-emerald-600"
                                    />
                                  )}
                                </div>

                                {/* FREELANCER INFORMATION */}

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-gray-900">
                                    {
                                      freelancer.fullname
                                    }
                                  </p>

                                  {freelancer.professional_title && (
                                    <p className="mt-0.5 truncate text-xs text-emerald-600">
                                      {
                                        freelancer.professional_title
                                      }
                                    </p>
                                  )}

                                  {freelancer.category && (
                                    <p className="mt-1 text-xs text-gray-500">
                                      {
                                        freelancer.category
                                      }

                                      {freelancer.city
                                        ? ` • ${freelancer.city}`
                                        : ""}
                                    </p>
                                  )}

                                  {freelancerSkills.length >
                                    0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {freelancerSkills
                                        .slice(0, 3)
                                        .map(
                                          (
                                            skill,
                                            index
                                          ) => (
                                            <span
                                              key={`${skill}-${index}`}
                                              className="
                                                rounded-full
                                                bg-gray-100
                                                px-2
                                                py-0.5
                                                text-[10px]
                                                font-medium
                                                text-gray-600
                                              "
                                            >
                                              {skill}
                                            </span>
                                          )
                                        )}
                                    </div>
                                  )}

                                  <p className="mt-2 text-[11px] font-medium text-emerald-600">
                                    Click to select freelancer →
                                  </p>
                                </div>
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>

        {/* ============================================
            RIGHT SIDE
        ============================================ */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* ============================================
              NOTIFICATIONS
          ============================================ */}

          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() =>
                setShowNotifications(
                  (previous) => !previous
                )
              }
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-gray-200
                bg-white
                transition-all
                duration-300
                hover:bg-gray-100
                sm:h-11
                sm:w-11
              "
            >
              <Bell
                size={19}
                className="text-gray-700 sm:h-[22px] sm:w-[22px]"
              />

              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    min-h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-1
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* ==========================================
                NOTIFICATION DROPDOWN
            ========================================== */}

            {showNotifications && (
              <div
                className="
                  absolute
                  right-0
                  mt-3
                  w-[350px]
                  max-w-[calc(100vw-2rem)]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  shadow-xl
                "
              >
                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Notifications
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : "You're all caught up"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="
                        inline-flex
                        items-center
                        gap-1
                        text-xs
                        font-semibold
                        text-emerald-600
                        hover:text-emerald-700
                      "
                    >
                      <CheckCheck size={14} />
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* NOTIFICATION LIST */}

                <div className="max-h-[420px] overflow-y-auto">
                  {/* LOADING */}

                  {loadingNotifications && (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading notifications...
                    </div>
                  )}

                  {/* EMPTY */}

                  {!loadingNotifications &&
                    notifications.length === 0 && (
                      <div className="px-4 py-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                          <Bell
                            size={22}
                            className="text-emerald-600"
                          />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-gray-800">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Important updates will appear here.
                        </p>
                      </div>
                    )}

                  {/* NOTIFICATIONS */}

                  {!loadingNotifications &&
                    notifications.length > 0 &&
                    notifications.map(
                      (notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                          className={`
                            flex
                            w-full
                            gap-3
                            border-b
                            border-gray-100
                            px-4
                            py-4
                            text-left
                            transition
                            hover:bg-gray-50
                            ${
                              notification.is_read
                                ? "bg-white"
                                : "bg-emerald-50/60"
                            }
                          `}
                        >
                          {/* UNREAD INDICATOR */}

                          <div className="pt-1">
                            <span
                              className={`
                                block
                                h-2
                                w-2
                                rounded-full
                                ${
                                  notification.is_read
                                    ? "bg-gray-300"
                                    : "bg-emerald-500"
                                }
                              `}
                            />
                          </div>

                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </p>

                              <span className="shrink-0 text-[10px] text-gray-400">
                                {formatNotificationTime(
                                  notification.created_at
                                )}
                              </span>
                            </div>

                            <p className="mt-1 text-xs leading-5 text-gray-600">
                              {notification.message}
                            </p>
                          </div>
                        </button>
                      )
                    )}
                </div>
              </div>
            )}
          </div>

          {/* ============================================
              SETTINGS
          ============================================ */}

          <Link
            href="/settings"
            aria-label="Settings"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-gray-200
              bg-white
              text-gray-700
              transition-all
              duration-300
              hover:border-emerald-500
              hover:bg-emerald-50
              hover:text-emerald-600
              sm:h-auto
              sm:w-auto
              sm:gap-2
              sm:px-4
              sm:py-3
            "
          >
            <Settings
              size={19}
              className="sm:h-5 sm:w-5"
            />

            <span className="hidden font-medium sm:block">
              Settings
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}