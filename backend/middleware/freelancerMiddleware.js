const freelancerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "freelancer") {
    return res.status(403).json({
      success: false,
      message: "Only freelancers can manage portfolios.",
    });
  }

  next();
};

module.exports = freelancerOnly;