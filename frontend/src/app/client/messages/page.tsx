"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  MessageCircle,
  ChevronRight,
  BriefcaseBusiness,
  Clock,
  RefreshCw,
} from "lucide-react";

// ============================================
// USER INTERFACE
// ============================================

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

// ============================================
// CONVERSATION INTERFACE
// ============================================

interface Conversation {
  id: number;

  project_id: number;

  client_id: number;

  freelancer_id: number;

  project_title: string;

  other_user_id: number;

  updated_at: string;
}

// ============================================
// PAGE
// ============================================

export default function ClientMessagesPage() {
  const router = useRouter();

  // ============================================
  // USER
  // ============================================

  const [user, setUser] = useState<User | null>(null);

  // ============================================
  // CONVERSATIONS
  // ============================================

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  // ============================================
  // LOADING
  // ============================================

  const [loading, setLoading] = useState(true);

  // ============================================
  // REFRESHING
  // ============================================

  const [refreshing, setRefreshing] = useState(false);

  // ============================================
  // ERROR
  // ============================================

  const [error, setError] = useState("");

  // ============================================
  // CHECK LOGGED-IN USER
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: User = JSON.parse(storedUser);

      // Only client can access this page
      if (loggedInUser.role !== "client") {
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

  // ============================================
  // FETCH CONVERSATIONS
  // ============================================

  const fetchConversations = async (
    showLoading = true
  ) => {
    if (!user) {
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await fetch(
        `http://localhost:5000/api/messages/conversations/user/${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },

          // Always get latest conversations
          cache: "no-store",
        }
      );

      const data = await response.json();

      console.log(
        "CONVERSATIONS RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load conversations."
        );
      }

      // Make sure response is an array
      const conversationList =
        Array.isArray(data.conversations)
          ? data.conversations
          : [];

      setConversations(conversationList);
    } catch (error) {
      console.error(
        "FETCH CONVERSATIONS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load conversations."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================
  // LOAD CONVERSATIONS WHEN USER IS READY
  // ============================================

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchConversations();
  }, [user]);

  // ============================================
  // FORMAT DATE
  // ============================================

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================
  // OPEN CONVERSATION
  // ============================================

  const openConversation = (
    conversationId: number
  ) => {
    router.push(
      `/client/messages/${conversationId}`
    );
  };

  // ============================================
  // LOADING SCREEN
  // ============================================

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">

          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-emerald-200
              border-t-emerald-600
            "
          />

          <p className="mt-4 text-gray-600">
            Loading messages...
          </p>

        </div>
      </div>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <DashboardLayout role="client">

      <div className="w-full">

        {/* ============================================
            HEADER
        ============================================ */}

        <div
          className="
            mb-6
            flex
            flex-col
            justify-between
            gap-4
            sm:flex-row
            sm:items-center
          "
        >

          <div>

            <h1
              className="
                text-2xl
                font-bold
                text-gray-900
                sm:text-3xl
              "
            >
              Messages
            </h1>

            <p className="mt-1 text-gray-500">
              Communicate with freelancers
              working on your projects.
            </p>

          </div>

          {/* REFRESH BUTTON */}

          <button
            type="button"
            onClick={() =>
              fetchConversations(false)
            }
            disabled={refreshing}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-gray-700
              shadow-sm
              transition
              hover:bg-gray-50
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

        {/* ============================================
            ERROR
        ============================================ */}

        {error && (
          <div
            className="
              mb-5
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-4
              text-sm
              text-red-600
            "
          >
            {error}
          </div>
        )}

        {/* ============================================
            EMPTY STATE
        ============================================ */}

        {!error &&
          conversations.length === 0 && (
            <div
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-10
                text-center
                shadow-sm
              "
            >

              {/* ICON */}

              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-100
                "
              >

                <MessageCircle
                  size={30}
                  className="text-emerald-600"
                />

              </div>

              {/* TITLE */}

              <h2
                className="
                  mt-5
                  text-xl
                  font-semibold
                  text-gray-900
                "
              >
                No conversations yet
              </h2>

              {/* DESCRIPTION */}

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-gray-500
                "
              >
                Once you hire a freelancer
                and start a conversation,
                the project conversation
                will appear here.
              </p>

            </div>
          )}

        {/* ============================================
            CONVERSATION LIST
        ============================================ */}

        {conversations.length > 0 && (
          <div className="space-y-4">

            {conversations.map(
              (conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() =>
                    openConversation(
                      conversation.id
                    )
                  }
                  className="
                    group
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    p-5
                    text-left
                    shadow-sm
                    transition
                    hover:border-emerald-300
                    hover:shadow-md
                    sm:p-6
                  "
                >

                  {/* LEFT SIDE */}

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-4
                    "
                  >

                    {/* ICON */}

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-emerald-100
                      "
                    >

                      <MessageCircle
                        size={23}
                        className="
                          text-emerald-600
                        "
                      />

                    </div>

                    {/* PROJECT INFORMATION */}

                    <div className="min-w-0">

                      {/* PROJECT TITLE */}

                      <h2
                        className="
                          truncate
                          text-base
                          font-semibold
                          text-gray-900
                          group-hover:text-emerald-700
                        "
                      >
                        {conversation.project_title ||
                          "Untitled Project"}
                      </h2>

                      {/* PROJECT ID */}

                      <div
                        className="
                          mt-1
                          flex
                          flex-wrap
                          items-center
                          gap-3
                          text-sm
                          text-gray-500
                        "
                      >

                        <span
                          className="
                            flex
                            items-center
                            gap-1
                          "
                        >
                          <BriefcaseBusiness
                            size={14}
                          />

                          Project #
                          {conversation.project_id}
                        </span>

                        {/* UPDATED DATE */}

                        {conversation.updated_at && (
                          <span
                            className="
                              flex
                              items-center
                              gap-1
                            "
                          >
                            <Clock size={14} />

                            {formatDate(
                              conversation.updated_at
                            )}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* RIGHT SIDE */}

                  <div
                    className="
                      ml-4
                      flex
                      shrink-0
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        hidden
                        text-sm
                        font-medium
                        text-emerald-600
                        sm:block
                      "
                    >
                      Open
                    </span>

                    <ChevronRight
                      size={21}
                      className="
                        text-gray-400
                        transition
                        group-hover:translate-x-1
                        group-hover:text-emerald-600
                      "
                    />

                  </div>

                </button>
              )
            )}

          </div>
        )}

      </div>

    </DashboardLayout>
  );
}