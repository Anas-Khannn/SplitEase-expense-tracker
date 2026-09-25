require("dotenv").config({ quiet: true });

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const read = (name) => (process.env[name] || "").trim();

const jwtSecret = read("JWT_SECRET");
const resendApiKey = read("RESEND_API_KEY");

const corsOriginRaw = process.env.CORS_ORIGIN;

const parsedCorsOrigins =
  corsOriginRaw && corsOriginRaw.trim()
    ? corsOriginRaw
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

const corsOrigin = parsedCorsOrigins.length ? parsedCorsOrigins : ["http://localhost:3000"];

// Collected together so a misconfigured deploy fails once with the full list
// instead of one variable per deploy attempt. Only names are reported, never
// values, so secrets cannot leak through the error message.
const requiredInProduction = [
  { name: "JWT_SECRET", isSet: Boolean(jwtSecret), purpose: "signs auth tokens" },
  { name: "RESEND_API_KEY", isSet: Boolean(resendApiKey), purpose: "sends verification emails" },
  {
    name: "CORS_ORIGIN",
    isSet: parsedCorsOrigins.length > 0,
    purpose: "comma-separated list of allowed origins",
  },
  { name: "DB_HOST", isSet: Boolean(read("DB_HOST")), purpose: "Postgres host" },
  { name: "DB_NAME", isSet: Boolean(read("DB_NAME")), purpose: "Postgres database" },
  { name: "DB_USER", isSet: Boolean(read("DB_USER")), purpose: "Postgres user" },
  { name: "DB_PASSWORD", isSet: Boolean(read("DB_PASSWORD")), purpose: "Postgres password" },
];

if (isProduction) {
  const missing = requiredInProduction.filter((variable) => !variable.isSet);

  if (missing.length) {
    const details = missing.map((v) => `  - ${v.name} (${v.purpose})`).join("\n");

    throw new Error(
      `Missing ${missing.length} required environment variable${
        missing.length === 1 ? "" : "s"
      } for production:\n${details}\n\nSet ${
        missing.length === 1 ? "it" : "them"
      } in the Vercel project under Settings > Environment Variables, then redeploy. Values are intentionally not shown here.`,
    );
  }
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

  email: {
    resendApiKey,
    fromEmail: process.env.RESEND_FROM_EMAIL || "SplitEase <onboarding@resend.dev>",
    otpTtlMinutes: parseInt(process.env.OTP_TTL_MINUTES, 10) || 10,
  },

  cors: {
    origin: corsOrigin,
  },
};

module.exports = env;
