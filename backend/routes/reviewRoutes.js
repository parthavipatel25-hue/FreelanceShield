const express = require("express");

const router = express.Router();

const {
  createReview,
  getProjectReview,
  getFreelancerReviews,
  getFreelancerRating,
} = require("../controllers/reviewController");

// Create a review
router.post("/", createReview);

// Get review for a project
router.get("/project/:project_id", getProjectReview);

// Get all reviews of a freelancer
router.get("/freelancer/:freelancer_id", getFreelancerReviews);

// Get freelancer average rating
router.get("/freelancer/:freelancer_id/rating", getFreelancerRating);

module.exports = router;