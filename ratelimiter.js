import rateLimit from "express-rate-limit"

export const websiteAPILimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: "Rate limit exceeded for website API",
});