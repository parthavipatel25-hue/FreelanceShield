"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import DashboardLayout from "../../../components/layout/DashboardLayout";

import {
  ArrowLeft,
  Send,
  MessageCircle,
  Loader2,
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
  updated_at: string;
}

// ============================================
// MESSAGE INTERFACE
// ============================================

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

// ============================================
// PAGE
// ============================================

export default function ClientConversationPage() {
  const router = useRouter();
  const params = useParams();

  // ============================================
  // CONVERSATION ID
  // ============================================

  const conversationId = params.id as string;

  // ============================================
  // USER
  // ============================================

  const [user, setUser] = useState<User | null>(null);

  // ============================================
  // CONVERSATION
  // ============================================

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  // ============================================
  // MESSAGES
  // ============================================

  const [messages, setMessages] = useState<Message[]>([]);

  // ============================================
  // MESSAGE INPUT
  // ============================================

  const [newMessage, setNewMessage] = useState("");

  // ============================================
  // LOADING
  // ============================================

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  // ============================================
  // ERROR
  // ============================================

  const [error, setError] = useState("");

  // ============================================
  // MESSAGE END REF
  // ============================================

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
  // FETCH CONVERSATION
  // ============================================

  useEffect(() => {
    if (!user || !conversationId) {
      return;
    }

    const fetchConversation = async () => {
      try {
        setLoading(true);
        setError("");

        // ============================================
        // GET CONVERSATION
        // ============================================

       const conversationResponse = await fetch(
  `http://localhost:5000/api/messages/conversations/${conversationId}?user_id=${user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const conversationData =
          await conversationResponse.json();

        console.log(
          "CONVERSATION RESPONSE:",
          conversationData
        );

        if (
          !conversationResponse.ok ||
          !conversationData.success
        ) {
          throw new Error(
            conversationData.message ||
              "Failed to load conversation."
          );
        }

        const loadedConversation =
          conversationData.conversation;

        // ============================================
        // VERIFY CLIENT
        // ============================================

        if (
          Number(loadedConversation.client_id) !==
          Number(user.id)
        ) {
          throw new Error(
            "You are not allowed to access this conversation."
          );
        }

        setConversation(loadedConversation);

        // ============================================
        // GET MESSAGES
        // ============================================

       const messagesResponse = await fetch(
  `http://localhost:5000/api/messages/conversations/${conversationId}/messages?user_id=${user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const messagesData =
          await messagesResponse.json();

        console.log(
          "MESSAGES RESPONSE:",
          messagesData
        );

        if (
          !messagesResponse.ok ||
          !messagesData.success
        ) {
          throw new Error(
            messagesData.message ||
              "Failed to load messages."
          );
        }

        const loadedMessages =
          Array.isArray(messagesData.messages)
            ? messagesData.messages
            : [];

        setMessages(loadedMessages);

        // ============================================
        // MARK RECEIVED MESSAGES AS READ
        // ============================================

        const unreadMessages =
          loadedMessages.filter(
            (message: Message) =>
              Number(message.receiver_id) ===
                Number(user.id) &&
              !message.is_read
          );

        for (const message of unreadMessages) {
          try {
            await fetch(
  `http://localhost:5000/api/messages/messages/${message.id}/read`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: Number(user.id),
    }),
  }
);
          } catch (readError) {
            console.error(
              "MARK READ ERROR:",
              readError
            );
          }
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
  // SCROLL TO BOTTOM
  // ============================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ============================================
  // SEND MESSAGE
  // ============================================

  const handleSendMessage = async () => {
    if (!user || !conversation) {
      return;
    }

    const trimmedMessage = newMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    try {
      setSending(true);
      setError("");

      // ============================================
      // CLIENT SENDS TO FREELANCER
      // ============================================

      const receiverId =
        Number(conversation.freelancer_id);

      const response = await fetch(
        "http://localhost:5000/api/messages/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation_id: Number(
              conversation.id
            ),
            sender_id: Number(user.id),
            receiver_id: receiverId,
            message: trimmedMessage,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "SEND MESSAGE RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to send message."
        );
      }

      // ============================================
      // ADD NEW MESSAGE TO SCREEN
      // ============================================

      const sentMessage: Message = {
        ...data.data,
        sender_name: user.fullname,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        sentMessage,
      ]);

      // ============================================
      // CLEAR INPUT
      // ============================================

      setNewMessage("");
    } catch (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error
      );

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
  // ENTER KEY
  // ============================================

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSendMessage();
    }
  };

  // ============================================
  // FORMAT TIME
  // ============================================

  const formatMessageTime = (
    dateString: string
  ) => {
    if (!dateString) {
      return "";
    }

    return new Date(
      dateString
    ).toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================
  // LOADING
  // ============================================

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Loader2
              size={25}
              className="animate-spin text-emerald-600"
            />
          </div>

          <p className="mt-4 text-gray-600">
            Loading conversation...
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
      <div className="flex h-[calc(100vh-120px)] min-h-[600px] w-full flex-col">

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="mb-4">

          <button
            type="button"
            onClick={() =>
              router.push("/client/messages")
            }
            className="
              mb-4
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-gray-600
              transition
              hover:text-emerald-600
            "
          >
            <ArrowLeft size={18} />

            Back to Messages
          </button>

          <div
            className="
              flex
              items-center
              gap-4
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-4
              shadow-sm
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-emerald-100
              "
            >
              <MessageCircle
                size={23}
                className="text-emerald-600"
              />
            </div>

            <div className="min-w-0">

              <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                {conversation?.project_title ||
                  "Project Conversation"}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Project #
                {conversation?.project_id}
              </p>

            </div>

          </div>
        </div>

        {/* ============================================
            ERROR
        ============================================ */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ============================================
            CHAT BOX
        ============================================ */}

        <div
          className="
            flex
            min-h-0
            flex-1
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >

          {/* ============================================
              MESSAGES
          ============================================ */}

          <div
            className="
              flex-1
              overflow-y-auto
              bg-gray-50
              p-4
              sm:p-6
            "
          >

            {messages.length === 0 ? (
              <div
                className="
                  flex
                  h-full
                  flex-col
                  items-center
                  justify-center
                  text-center
                "
              >

                <div
                  className="
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

                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  No messages yet
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Start the conversation with the freelancer.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {messages.map((message) => {

                  const isOwnMessage =
                    Number(message.sender_id) ===
                    Number(user.id);

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isOwnMessage
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`
                          max-w-[80%]
                          sm:max-w-[65%]
                          ${
                            isOwnMessage
                              ? "items-end"
                              : "items-start"
                          }
                        `}
                      >

                        {/* SENDER */}

                        <p
                          className={`
                            mb-1
                            px-2
                            text-xs
                            font-medium
                            ${
                              isOwnMessage
                                ? "text-right text-emerald-600"
                                : "text-left text-gray-500"
                            }
                          `}
                        >
                          {isOwnMessage
                            ? "You"
                            : message.sender_name}
                        </p>

                        {/* MESSAGE */}

                        <div
                          className={`
                            rounded-2xl
                            px-4
                            py-3
                            ${
                              isOwnMessage
                                ? "rounded-br-md bg-emerald-600 text-white"
                                : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                            }
                          `}
                        >

                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {message.message}
                          </p>

                        </div>

                        {/* TIME */}

                        <p
                          className={`
                            mt-1
                            px-2
                            text-[11px]
                            ${
                              isOwnMessage
                                ? "text-right text-gray-400"
                                : "text-left text-gray-400"
                            }
                          `}
                        >
                          {formatMessageTime(
                            message.created_at
                          )}
                        </p>

                      </div>

                    </div>
                  );
                })}

                <div ref={messagesEndRef} />

              </div>
            )}

          </div>

          {/* ============================================
              MESSAGE INPUT
          ============================================ */}

          <div
            className="
              border-t
              border-gray-200
              bg-white
              p-4
            "
          >

            <div className="flex items-end gap-3">

              <textarea
                value={newMessage}
                onChange={(event) =>
                  setNewMessage(
                    event.target.value
                  )
                }
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={2}
                disabled={sending}
                className="
                  min-h-[52px]
                  flex-1
                  resize-none
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                  disabled:bg-gray-100
                "
              />

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={
                  sending ||
                  !newMessage.trim()
                }
                className="
                  flex
                  h-[52px]
                  w-[52px]
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
                {sending ? (
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={20} />
                )}
              </button>

            </div>

            <p className="mt-2 text-xs text-gray-400">
              Press Enter to send. Use Shift + Enter for a new line.
            </p>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}