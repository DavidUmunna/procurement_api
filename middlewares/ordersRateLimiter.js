const rateLimit = require("express-rate-limit");

const ordersRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // disable the `X-RateLimit-*` headers
});

module.exports = ordersRateLimiter;
