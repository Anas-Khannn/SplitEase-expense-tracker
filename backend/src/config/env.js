require("dotenv").config();

const nodeEnv = process.env.NODE_ENV || "development";

const jwtSecret = process.env.JWT_SECRET || "";

if (nodeEnv === "production" && !jwtSecret.trim()) {
  throw new Error(
    "JWT_SECRET is required in production. Set JWT_SECRET to a non-empty secret before starting the server."
  );
}

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv,

  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || "splitease_dev",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
  },

  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
      : ["http://localhost:3000"],
  },
};

module.exports = env;
