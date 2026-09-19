"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Star,
  ArrowLeft,
  MessageSquare,
  User,
  Calendar,
  Briefcase,
  AlertCircle,
} from "lucide-react";

interface User {
  id: number;
  fullname: string;
  email: string;
  role: string;
}

interface Review {
  id: number;
  project_id: number;
  rating: number;
  review: string | null;
  created_at: string;
  client_name: string;
  project_title: string;
}

interface RatingData {
  total_reviews: string;
  average_rating: string;
}

export default function FreelancerReviewsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingData, setRatingData] = useState<RatingData>({
    total_reviews: "0",
    average_rating: "0",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD LOGGED-IN USER
  // =====================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setLoading(false);
      setError("User information not found.");
      return;
    }

    try {
      const loggedInUser: User = JSON.parse(storedUser);

      setUser(loggedInUser);

      fetchReviews(loggedInUser.id);
      fetchRating(loggedInUser.id);
    } catch (error) {
      console.error("INVALID USER DATA:", error);
      setError("Invalid user information.");
      setLoading(false);
    }
  }, []);

  // =====================================================
  // GET FREELANCER REVIEWS
  // =====================================================

  const fetchReviews = async (freelancerId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/freelancer/${freelancerId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load reviews."
        );
      }

      setReviews(data.reviews || []);
    } catch (error) {
      console.error("FETCH REVIEWS ERROR:", error);
      setError("Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET FREELANCER RATING
  // =====================================================

  const fetchRating = async (freelancerId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/freelancer/${freelancerId}/rating`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load rating."
        );
      }

      setRatingData(data.rating);
    } catch (error) {
      console.error("FETCH RATING ERROR:", error);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // STAR DISPLAY
  // =====================================================

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">
          Loading your reviews...
        </p>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Ratings & Reviews
            </h1>

            <p className="text-gray-600 mt-1">
              See what clients say about your work.
            </p>
          </div>

          <Link
            href="/freelancer"
            className="
              inline-flex
              items-center
              justify-center
              gap-2

              rounded-lg
              border
              border-gray-300
              bg-white

              px-4
              py-2.5

              text-gray-700

              hover:bg-gray-50
              transition
            "
          >
            <ArrowLeft size={18} />

            Back to Dashboard
          </Link>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-6
              flex
              items-center
              gap-3

              rounded-xl
              border
              border-red-200
              bg-red-50

              p-4

              text-red-700
            "
          >
            <AlertCircle size={20} />

            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            RATING SUMMARY
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">

          {/* Average Rating */}

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white

              p-6

              shadow-sm
            "
          >
            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center

                  rounded-xl
                  bg-yellow-50
                "
              >
                <Star
                  size={30}
                  className="fill-yellow-400 text-yellow-400"
                />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Average Rating
                </p>

                <div className="flex items-center gap-3 mt-1">

                  <p className="text-3xl font-bold text-gray-900">
                    {ratingData.average_rating}
                  </p>

                  <span className="text-gray-500">
                    / 5
                  </span>

                </div>
              </div>

            </div>

            <div className="mt-4">
              {renderStars(
                Math.round(
                  Number(ratingData.average_rating)
                )
              )}
            </div>
          </div>

          {/* Total Reviews */}

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white

              p-6

              shadow-sm
            "
          >
            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center

                  rounded-xl
                  bg-emerald-50
                "
              >
                <MessageSquare
                  size={28}
                  className="text-emerald-600"
                />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total Reviews
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {ratingData.total_reviews}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <div
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white

            shadow-sm
          "
        >

          <div
            className="
              border-b
              border-gray-200
              px-6
              py-5
            "
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Client Reviews
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Reviews you received from completed projects.
            </p>
          </div>

          {/* No reviews */}

          {reviews.length === 0 ? (
            <div className="p-10 text-center">

              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center

                  rounded-full
                  bg-gray-100
                "
              >
                <MessageSquare
                  size={30}
                  className="text-gray-400"
                />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No Reviews Yet
              </h3>

              <p className="mt-2 text-gray-500">
                You haven't received any reviews from clients yet.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-gray-200">

              {reviews.map((item) => (
                <div
                  key={item.id}
                  className="p-6"
                >

                  {/* Top section */}

                  <div
                    className="
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-start
                      sm:justify-between

                      gap-4
                    "
                  >

                    <div className="flex items-center gap-3">

                      {/* Client Avatar */}

                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center

                          rounded-full
                          bg-emerald-100

                          font-semibold
                          text-emerald-600
                        "
                      >
                        {item.client_name
                          ? item.client_name
                              .charAt(0)
                              .toUpperCase()
                          : "C"}
                      </div>

                      <div>

                        <div className="flex items-center gap-2">

                          <User
                            size={15}
                            className="text-gray-400"
                          />

                          <p className="font-semibold text-gray-900">
                            {item.client_name}
                          </p>

                        </div>

                        <div className="flex items-center gap-2 mt-1">

                          <Calendar
                            size={14}
                            className="text-gray-400"
                          />

                          <p className="text-sm text-gray-500">
                            {formatDate(item.created_at)}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* Rating */}

                    <div className="flex items-center gap-2">
                      {renderStars(item.rating)}

                      <span className="text-sm font-medium text-gray-600">
                        {item.rating}/5
                      </span>
                    </div>

                  </div>

                  {/* Project */}

                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      gap-2

                      rounded-lg
                      bg-gray-50

                      px-4
                      py-3

                      text-sm
                      text-gray-700
                    "
                  >

                    <Briefcase
                      size={17}
                      className="text-emerald-600"
                    />

                    <span className="font-medium">
                      Project:
                    </span>

                    <span>
                      {item.project_title}
                    </span>

                  </div>

                  {/* Review text */}

                  <div className="mt-5">

                    <p className="text-gray-700 leading-7">
                      {item.review
                        ? `"${item.review}"`
                        : "The client did not leave a written review."}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}