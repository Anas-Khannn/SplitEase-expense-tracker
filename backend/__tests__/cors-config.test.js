const { spawnSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

const ENV_PATH = path.join(__dirname, "..", "src", "config", "env.js");

const FULL_DB = {
  DB_HOST: "db.example.com",
  DB_NAME: "splitease",
  DB_USER: "splitease",
  DB_PASSWORD: "ci-test-password",
};

// Run env.js in a fresh Node process working directory with no .env file, so
// dotenv loads nothing and only the explicitly passed env vars are visible.
function loadEnvInFreshProcess({
  nodeEnv,
  corsOrigin,
  jwtSecret = "ci-test-secret",
  resendApiKey = "re_test_key",
  logOtpEmails,
  db = FULL_DB,
}) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "splitease-cors-"));
  try {
    const env = { NODE_ENV: nodeEnv, JWT_SECRET: jwtSecret, RESEND_API_KEY: resendApiKey, ...db };
    if (corsOrigin !== undefined) env.CORS_ORIGIN = corsOrigin;
    if (logOtpEmails !== undefined) env.LOG_OTP_EMAILS = logOtpEmails;

    const res = spawnSync(process.execPath, ["-e", `require(${JSON.stringify(ENV_PATH)});`], {
      env,
      cwd,
      encoding: "utf8",
    });
    return {
      status: res.status,
      stderr: res.stderr || "",
    };
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
}

// dotenv v17 writes a log line to stdout, so origins are echoed to a file
// instead of stdout.
function loadCorsOriginsInFreshProcess({ nodeEnv, corsOrigin }) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "splitease-cors-"));
  const outputFile = path.join(cwd, "output.json");
  try {
    const env = {
      NODE_ENV: nodeEnv,
      JWT_SECRET: "ci-test-secret",
      RESEND_API_KEY: "re_test_key",
      ...FULL_DB,
    };
    if (corsOrigin !== undefined) env.CORS_ORIGIN = corsOrigin;

    const script = `
      const fs = require("fs");
      const env = require(${JSON.stringify(ENV_PATH)});
      fs.writeFileSync(process.env.SPLITEASE_OUTPUT, JSON.stringify(env.cors.origin));
    `;
    env.SPLITEASE_OUTPUT = outputFile;

    const res = spawnSync(process.execPath, ["-e", script], { env, cwd, encoding: "utf8" });
    return {
      status: res.status,
      stderr: res.stderr || "",
      origins: JSON.parse(fs.readFileSync(outputFile, "utf8")),
    };
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
}

describe("production environment validation", () => {
  it("reports CORS_ORIGIN as missing when NODE_ENV=production and it is unset", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: undefined,
    });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/Missing 1 required environment variable for production/);
    expect(stderr).toMatch(/CORS_ORIGIN/);
  });

  it("reports CORS_ORIGIN as missing when it is empty", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "",
    });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/CORS_ORIGIN/);
  });

  it("reports CORS_ORIGIN as missing when it is whitespace-only", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "   ",
    });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/CORS_ORIGIN/);
  });

  it("reports CORS_ORIGIN as missing when it contains only separators", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: " , , ",
    });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/CORS_ORIGIN/);
  });

  it("loads successfully when every required production variable is set", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "https://app.example.com",
    });
    expect(status).toBe(0);
    expect(stderr).not.toMatch(/Missing \d+ required environment variable/);
  });

  it("reports every missing variable in a single failure", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: undefined,
      jwtSecret: "",
      resendApiKey: "",
      db: {},
    });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/Missing 7 required environment variables for production/);
    for (const name of [
      "JWT_SECRET",
      "RESEND_API_KEY",
      "CORS_ORIGIN",
      "DB_HOST",
      "DB_NAME",
      "DB_USER",
      "DB_PASSWORD",
    ]) {
      expect(stderr).toMatch(new RegExp(`- ${name} `));
    }
  });

  it("reports DB_PASSWORD as missing when it is the only absent variable", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "https://app.example.com",
      db: { ...FULL_DB, DB_PASSWORD: "" },
    });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/DB_PASSWORD/);
    expect(stderr).not.toMatch(/JWT_SECRET/);
  });

  it("points at the Vercel dashboard instead of the local file system", () => {
    const { stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: undefined,
    });
    expect(stderr).toMatch(/Vercel project under Settings > Environment Variables/);
  });

  it("reports RESEND_API_KEY as missing when it cannot be bypassed", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "https://app.example.com",
      resendApiKey: "",
    });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/RESEND_API_KEY/);
  });

  it("does not echo configured values in the error message", () => {
    const { stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "https://app.example.com",
      db: { ...FULL_DB, DB_PASSWORD: "" },
    });
    expect(stderr).not.toMatch(/https:\/\/app\.example\.com/);
    expect(stderr).not.toMatch(/ci-test-secret/);
    expect(stderr).not.toMatch(/re_test_key/);
  });
});

describe("LOG_OTP_EMAILS opt-in bypass", () => {
  const boot = (overrides) =>
    loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "https://app.example.com",
      resendApiKey: "",
      ...overrides,
    });

  it("still requires RESEND_API_KEY in production when the flag is unset", () => {
    const { status, stderr } = boot({});
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/RESEND_API_KEY/);
  });

  it("still requires RESEND_API_KEY when the flag is explicitly false", () => {
    const { status, stderr } = boot({ logOtpEmails: "false" });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/RESEND_API_KEY/);
  });

  it("boots without RESEND_API_KEY when the flag is truthy", () => {
    const { status, stderr } = boot({ logOtpEmails: "true" });
    expect(status).toBe(0);
    expect(stderr).not.toMatch(/Missing \d+ required environment variable/);
  });

  it("accepts the common truthy spellings", () => {
    for (const value of ["1", "TRUE", "yes", "on"]) {
      const { status } = boot({ logOtpEmails: value });
      expect(status).toBe(0);
    }
  });

  it("warns at boot that codes are being logged rather than emailed", () => {
    const { stderr } = boot({ logOtpEmails: "true" });
    expect(stderr).toMatch(/LOG_OTP_EMAILS is enabled without RESEND_API_KEY/);
  });

  it("does not warn when RESEND_API_KEY is present", () => {
    const { stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "https://app.example.com",
      resendApiKey: "re_test_key",
      logOtpEmails: "true",
    });
    expect(stderr).not.toMatch(/LOG_OTP_EMAILS is enabled/);
  });

  it("does not require the flag in development", () => {
    const { status } = loadEnvInFreshProcess({
      nodeEnv: "development",
      resendApiKey: "",
    });
    expect(status).toBe(0);
  });
});

describe("CORS_ORIGIN development fallback", () => {
  it("loads successfully in development without a CORS_ORIGIN", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "development",
      corsOrigin: undefined,
    });
    expect(status).toBe(0);
    expect(stderr).not.toMatch(/CORS_ORIGIN is required/);
  });

  it("falls back to http://localhost:3000 in development without a CORS_ORIGIN", () => {
    const { status, origins } = loadCorsOriginsInFreshProcess({
      nodeEnv: "development",
      corsOrigin: undefined,
    });
    expect(status).toBe(0);
    expect(origins).toEqual(["http://localhost:3000"]);
  });

  it("parses a comma-separated CORS_ORIGIN into multiple trimmed origins", () => {
    const { status, origins } = loadCorsOriginsInFreshProcess({
      nodeEnv: "development",
      corsOrigin: "https://app.example.com, https://admin.example.com",
    });
    expect(status).toBe(0);
    expect(origins).toEqual(["https://app.example.com", "https://admin.example.com"]);
  });
});
