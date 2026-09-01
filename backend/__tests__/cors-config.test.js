const { spawnSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

const ENV_PATH = path.join(__dirname, "..", "src", "config", "env.js");

// Run env.js in a fresh Node process working directory with no .env file, so
// dotenv loads nothing and only the explicitly passed env vars are visible.
function loadEnvInFreshProcess({ nodeEnv, corsOrigin, jwtSecret = "ci-test-secret" }) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "splitease-cors-"));
  try {
    const env = { NODE_ENV: nodeEnv, JWT_SECRET: jwtSecret };
    if (corsOrigin !== undefined) env.CORS_ORIGIN = corsOrigin;

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
    const env = { NODE_ENV: nodeEnv, JWT_SECRET: "ci-test-secret" };
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

describe("CORS_ORIGIN production validation", () => {
  it("fails to load when NODE_ENV=production and CORS_ORIGIN is missing", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: undefined,
    });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/CORS_ORIGIN is required in production/);
  });

  it("fails to load when NODE_ENV=production and CORS_ORIGIN is empty", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "",
    });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/CORS_ORIGIN is required in production/);
  });

  it("fails to load when NODE_ENV=production and CORS_ORIGIN is whitespace-only", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "   ",
    });
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/CORS_ORIGIN is required in production/);
  });

  it("loads successfully when NODE_ENV=production and a valid CORS_ORIGIN is set", () => {
    const { status, stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "https://app.example.com",
    });
    expect(status).toBe(0);
    expect(stderr).not.toMatch(/CORS_ORIGIN is required in production/);
  });

  it("does not expose CORS_ORIGIN values in the error message", () => {
    const { stderr } = loadEnvInFreshProcess({
      nodeEnv: "production",
      corsOrigin: "  ",
    });
    expect(stderr).not.toMatch(/https:\/\/app\.example\.com/);
    expect(stderr).toMatch(/CORS_ORIGIN is required in production/);
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
