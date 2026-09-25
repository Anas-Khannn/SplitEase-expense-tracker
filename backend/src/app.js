const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/error.middleware");
const HTTP_STATUSES = require("./constants/http-statuses");
const env = require("./config/env");
const { registerNotificationListeners } = require("./events/notification.listener");

const app = express();

registerNotificationListeners();

app.use(express.json());
const configuredOrigins = (env.cors.origin || []).map((o) => o.replace(/\/+$/, ""));

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const normalized = origin.replace(/\/+$/, "");

  // 1. Explicitly configured origins (including wildcards)
  if (configuredOrigins.includes("*") || configuredOrigins.includes(normalized)) {
    return true;
  }

  // 2. Any Vercel deployment of SplitEase frontend (production or preview branches)
  if (/^https:\/\/split-ease[a-z0-9-]*\.vercel\.app$/.test(normalized)) {
    return true;
  }

  // 3. Local development origins
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  }),
);

app.get("/api/health", (req, res) => {
  res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: "SplitEase API is running",
  });
});

if (env.nodeEnv !== "production") {
  const debugRoutes = require("./routes/debug.routes");
  app.use("/api/debug", debugRoutes);
}

app.use("/api", routes);

app.use(errorHandler);

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  const PORT = env.port;
  app.listen(PORT, () => {
    console.log(`SplitEase server running on port ${PORT} [${env.nodeEnv}]`);
  });
}

module.exports = app;
