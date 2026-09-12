"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import DashboardLayout from "../../../components/layout/DashboardLayout";

import {
  ArrowLeft,
  Send,
  MessageCircle,
  User,
  Check,
  CheckCheck,
} from "lucide-react";

interface UserData {
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
  updated_at: string;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
}

export default function FreelancerConversationPage() {
  const router = useRouter();
  const params = useParams();

  const conversationId = params.id;

  const [user, setUser] = useState<UserData | null>(null);
  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ============================================
  // GET LOGGED-IN USER
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: UserData = JSON.parse(storedUser);

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
  // FETCH CONVERSATION + MESSAGES
  // ============================================

  useEffect(() => {
    if (!user || !conversationId) return;

    const fetchConversation = async () => {
      try {
        setError("");

        const conversationResponse = await fetch(
          `http://localhost:5000/api/messages/conversations/${conversationId}`
        );

        const conversationData =
          await conversationResponse.json();

        if (
          !conversationResponse.ok ||
          !conversationData.success
        ) {
          throw new Error(
            conversationData.message ||
              "Failed to load conversation."
          );
        }

        setConversation(
          conversationData.conversation
        );

        const messagesResponse = await fetch(
          `http://localhost:5000/api/messages/conversations/${conversationId}/messages`
        );

        const messagesData =
          await messagesResponse.json();

        if (
          !messagesResponse.ok ||
          !messagesData.success
        ) {
          throw new Error(
            messagesData.message ||
              "Failed to load messages."
          );
        }

        const loadedMessages: Message[] =
          messagesData.messages || [];

        setMessages(loadedMessages);

        // ============================================
        // MARK RECEIVED UNREAD MESSAGES AS READ
        // ============================================

        const unreadMessages = loadedMessages.filter(
          (message) =>
            message.receiver_id === user.id &&
            !message.is_read
        );

        await Promise.all(
          unreadMessages.map((message) =>
            fetch(
              `http://localhost:5000/api/messages/messages/${message.id}/read`,
              {
                method: "PUT",
              }
            )
          )
        );

        if (unreadMessages.length > 0) {
          setMessages((previousMessages) =>
            previousMessages.map((message) =>
              message.receiver_id === user.id
                ? {
                    ...message,
                    is_read: true,
                  }
                : message
            )
          );
        }
      } catch (error) {
        console.error(
          "FETCH CONVERSATION ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load conversation."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [user, conversationId]);

  // ============================================
  // AUTO REFRESH MESSAGES
  // ============================================

  useEffect(() => {
    if (!user || !conversationId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/messages/conversations/${conversationId}/messages`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error(
          "REFRESH MESSAGES ERROR:",
          error
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, conversationId]);

  // ============================================
  // SCROLL TO LAST MESSAGE
  // ============================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ============================================
  // SEND MESSAGE
  // ============================================

  const handleSendMessage = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user || !conversation || !messageText.trim()) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const receiverId = conversation.client_id;

      const response = await fetch(
        "http://localhost:5000/api/messages/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation_id: conversation.id,
            sender_id: user.id,
            receiver_id: receiverId,
            message: messageText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to send message."
        );
      }

      setMessageText("");

      // Add new message immediately to UI
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          ...data.data,
          sender_name: user.fullname,
        },
      ]);
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="mt-4 text-gray-600">
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error && !conversation) {
    return (
      <DashboardLayout role="freelancer">
        <div className="w-full">

          <button
            type="button"
            onClick={() =>
              router.push("/freelancer/messages")
            }
            className="
              mb-6
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-gray-600
              hover:text-emerald-600
            "
          >
            <ArrowLeft size={18} />
            Back to Messages
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Unable to load conversation
            </h2>

            <p className="mt-2 text-gray-600">
              {error}
            </p>
          </div>

        </div>
      </DashboardLayout>
    );
  }

  // ============================================
  // CHAT PAGE
  // ============================================

  return (
    <DashboardLayout role="freelancer">

      <div className="flex h-[calc(100vh-120px)] min-h-[600px] w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* ======================================== */}
        {/* HEADER */}
        {/* ======================================== */}

        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

          <div className="flex min-w-0 items-center gap-3">

            <button
              type="button"
              onClick={() =>
                router.push("/freelancer/messages")
              }
              className="
                rounded-lg
                p-2
                text-gray-500
                transition
                hover:bg-gray-100
                hover:text-gray-800
              "
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <MessageCircle
                size={20}
                className="text-emerald-600"
              />
            </div>

            <div className="min-w-0">

              <h1 className="truncate text-base font-bold text-gray-900">
                {conversation?.project_title ||
                  "Project Conversation"}
              </h1>

              <p className="text-xs text-gray-500">
                Project #{conversation?.project_id}
              </p>

            </div>

          </div>

        </div>

        {/* ======================================== */}
        {/* ERROR */}
        {/* ======================================== */}

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ======================================== */}
        {/* MESSAGES */}
        {/* ======================================== */}

        <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-5">

          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <MessageCircle
                    size={24}
                    className="text-emerald-600"
                  />
                </div>

                <p className="mt-3 font-medium text-gray-700">
                  No messages yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Start the conversation with the client.
                </p>

              </div>
            </div>
          )}

          {messages.map((message) => {

            const isMine =
              message.sender_id === user.id;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isMine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`
                    max-w-[80%]
                    rounded-2xl
                    px-4
                    py-3
                    shadow-sm
                    sm:max-w-[65%]
                    ${
                      isMine
                        ? "rounded-br-md bg-emerald-600 text-white"
                        : "rounded-bl-md bg-white text-gray-800 border border-gray-200"
                    }
                  `}
                >

                  {!isMine && (
                    <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <User size={13} />
                      {message.sender_name}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                    {message.message}
                  </p>

                  <div
                    className={`
                      mt-2
                      flex
                      items-center
                      justify-end
                      gap-1
                      text-[11px]
                      ${
                        isMine
                          ? "text-emerald-100"
                          : "text-gray-400"
                      }
                    `}
                  >
                    {new Date(
                      message.created_at
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}

                    {isMine && (
                      message.is_read ? (
                        <CheckCheck size={14} />
                      ) : (
                        <Check size={14} />
                      )
                    )}
                  </div>

                </div>

              </div>
            );
          })}

          <div ref={messagesEndRef} />

        </div>

        {/* ======================================== */}
        {/* SEND MESSAGE */}
        {/* ======================================== */}

        <form
          onSubmit={handleSendMessage}
          className="flex items-end gap-3 border-t border-gray-200 bg-white p-4"
        >

          <textarea
            value={messageText}
            onChange={(event) =>
              setMessageText(event.target.value)
            }
            rows={2}
            placeholder="Type a message..."
            className="
              min-h-[48px]
              flex-1
              resize-none
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              text-sm
              text-gray-900
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-100
            "
          />

          <button
            type="submit"
            disabled={
              sending ||
              !messageText.trim()
            }
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-600
              text-white
              transition
              hover:bg-emerald-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Send size={19} />
          </button>

        </form>

      </div>

    </DashboardLayout>
  );
}