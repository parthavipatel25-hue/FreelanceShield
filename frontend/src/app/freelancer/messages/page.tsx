"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  MessageCircle,
  ChevronRight,
} from "lucide-react";

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

interface Conversation {
  id: number;
  project_id: number;
  client_id: number;
  freelancer_id: number;
  project_title: string;
  other_user_id: number;
  updated_at: string;
}

export default function FreelancerMessagesPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // CHECK USER
  // ============================================

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
      console.error("INVALID USER DATA:", error);

      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // ============================================
  // FETCH CONVERSATIONS
  // ============================================

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/messages/conversations/user/${user.id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load conversations."
          );
        }

        setConversations(data.conversations || []);
      } catch (error) {
        console.error("FETCH CONVERSATIONS ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load conversations."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // ============================================
  // LOADING
  // ============================================

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

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
    <DashboardLayout role="freelancer">
      <div className="w-full">

        {/* HEADER */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Messages
          </h1>

          <p className="mt-1 text-gray-500">
            Communicate with clients about your ongoing projects.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}

        {!error && conversations.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <MessageCircle
                size={30}
                className="text-emerald-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No conversations yet
            </h2>

            <p className="mt-2 text-gray-500">
              Conversations with clients will appear here once
              you are working on a project.
            </p>

          </div>
        )}

        {/* CONVERSATION LIST */}

        {conversations.length > 0 && (
          <div className="space-y-3">

            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() =>
                  router.push(
                    `/freelancer/messages/${conversation.id}`
                  )
                }
                className="
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
                "
              >

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <MessageCircle
                      size={22}
                      className="text-emerald-600"
                    />
                  </div>

                  <div className="min-w-0">

                    <h2 className="truncate text-base font-semibold text-gray-900">
                      {conversation.project_title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Project #{conversation.project_id}
                    </p>

                  </div>

                </div>

                <ChevronRight
                  size={20}
                  className="shrink-0 text-gray-400"
                />

              </button>
            ))}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}