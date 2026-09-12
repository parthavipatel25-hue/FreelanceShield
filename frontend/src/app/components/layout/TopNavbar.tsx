"use client";

import Link from "next/link";
import {
  Bell,
  Search,
  Settings,
  CheckCheck,
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

export default function TopNavbar() {
  const [user, setUser] = useState<User | null>(null);

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

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
    if (!user?.id) return;

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
  // INITIAL LOAD + REFRESH
  // ============================================

  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.id]);

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
          setNotifications((previousNotifications) =>
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
  // TIME FORMAT
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

        {/* ================================= */}
        {/* SEARCH */}
        {/* ================================= */}

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
            placeholder={placeholder}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              bg-gray-50
              py-2.5
              pl-10
              pr-3
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
              sm:pr-4
              sm:text-sm
            "
          />

        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* ================================= */}
          {/* NOTIFICATIONS */}
          {/* ================================= */}

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

              {/* UNREAD BADGE */}

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

            {/* ================================= */}
            {/* NOTIFICATION DROPDOWN */}
            {/* ================================= */}

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

                  {loadingNotifications && (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading notifications...
                    </div>
                  )}

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

          {/* ================================= */}
          {/* SETTINGS */}
          {/* ================================= */}

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