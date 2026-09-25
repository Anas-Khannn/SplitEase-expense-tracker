const { spawnSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

const ENV_PATH = path.join(__dirname, "..", "src", "config", "env.js");

// Run env.js in a fresh Node process working directory with no .env file, so
// dotenv loads nothing and only the explicitly passed env vars are visible.
function loadEnvInFreshProcess(
  nodeEnv,
  jwtSecret,
  corsOrigin = "https://app.example.com",
  db = { DB_HOST: "db.example.com", DB_NAME: "splitease", DB_USER: "splitease", DB_PASSWORD: "ci-test-password" },
) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "splitease-env-"));
  try {
    const env = { NODE_ENV: nodeEnv, CORS_ORIGIN: corsOrigin, RESEND_API_KEY: "re_test_key", ...db };
    if (jwtSecret !== undefined) env.JWT_SECRET = jwtSecret;

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

describe("JWT_SECRET production validation", () => {
  it("fails to load when NODE_ENV=production and JWT_SECRET is missing", () => {
    const { status, stderr } = loadEnvInFreshProcess("production", undefined);
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/JWT_SECRET/);
  });

  it("fails to load when NODE_ENV=production and JWT_SECRET is empty", () => {
    const { status, stderr } = loadEnvInFreshProcess("production", "");
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/JWT_SECRET/);
  });

  it("reports JWT_SECRET as the only missing variable in this scenario", () => {
    const { stderr } = loadEnvInFreshProcess("production", "");
    expect(stderr).toMatch(/Missing 1 required environment variable for production/);
    expect(stderr).toMatch(/- JWT_SECRET /);
  });

  it("loads successfully when NODE_ENV=production and a valid JWT_SECRET is set", () => {
    const { status, stderr } = loadEnvInFreshProcess("production", "some-production-secret");
    expect(status).toBe(0);
    expect(stderr).not.toMatch(/Missing \d+ required environment variable/);
  });

  it("loads successfully in development without a JWT_SECRET", () => {
    const { status, stderr } = loadEnvInFreshProcess("development", undefined);
    expect(status).toBe(0);
    expect(stderr).not.toMatch(/Missing \d+ required environment variable/);
  });

  it("does not expose the secret in the error message", () => {
    // Boot fails on a missing DB_PASSWORD while a real JWT secret and a real
    // CORS origin are set, so the message must not echo either of them.
    const { status, stderr } = loadEnvInFreshProcess("production", "s3cret-value-do-not-log", undefined, {
      DB_HOST: "db.example.com",
      DB_NAME: "splitease",
      DB_USER: "splitease",
      DB_PASSWORD: "",
    });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/DB_PASSWORD/);
    expect(stderr).not.toMatch(/s3cret-value-do-not-log/);
    expect(stderr).not.toMatch(/re_test_key/);
    expect(stderr).not.toMatch(/app\.example\.com/);
  });
});

describe("JWT generation and verification with a configured secret", () => {
  const { generateToken, verifyToken } = require("../src/utils/jwt");

  it("signs and verifies a token with the configured test secret", () => {
    const token = generateToken({ user_id: "test-user-1" });
    const decoded = verifyToken(token);
    expect(decoded.user_id).toBe("test-user-1");
  });
});
