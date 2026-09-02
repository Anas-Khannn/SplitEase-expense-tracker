const request = require("supertest");
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");
const app = require("../src/app");
const { sequelize, User } = require("../src/database/models");
const seedUsers = require("../src/database/seeders/20260818-01-seed-users");

const DEV_PASSWORD = "Password123!";
const BOB_EMAIL = "bob@example.com";
const BOB_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const INVALID_PLACEHOLDER_HASH = "$2b$10$placeholder_hash_for_bob_dev_only";

let queryInterface;

const getBob = () => User.findOne({ where: { email: BOB_EMAIL } });

const seed = () => seedUsers.up(queryInterface, Sequelize);

beforeAll(async () => {
  await sequelize.sync({ force: true });
  queryInterface = sequelize.getQueryInterface();
});

afterAll(async () => {
  await sequelize.close();
});

// ============================================================
// Seeder correctness
// ============================================================
describe("Seeded development user credentials", () => {
  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  it("stores a valid bcrypt hash for every seeded user", async () => {
    await seed();

    const users = await User.findAll();
    expect(users.length).toBe(3);

    for (const user of users) {
      expect(user.password_hash.startsWith("$2b$10$")).toBe(true);
      expect(user.password_hash).not.toBe(INVALID_PLACEHOLDER_HASH);
      expect(user.password_hash).not.toContain(DEV_PASSWORD);
      expect(user.password_hash).not.toContain("placeholder");
    }
  });

  it("makes the documented development password match Bob's stored hash", async () => {
    await seed();

    const bob = await getBob();
    expect(bob).not.toBeNull();
    expect(await bcrypt.compare(DEV_PASSWORD, bob.password_hash)).toBe(true);
  });

  it("does not persist any plaintext password", async () => {
    await seed();

    const bob = await getBob();
    expect(bob.password_hash).not.toContain(DEV_PASSWORD);
    expect(Object.keys(bob.toJSON())).not.toContain("password");
    expect(bob.toJSON().password_hash).not.toBe(DEV_PASSWORD);
  });

  it("repairs an existing user that was seeded with the old invalid placeholder hash", async () => {
    // Simulate a database that was seeded before the fix (invalid placeholder).
    await User.create({
      user_id: BOB_ID,
      name: "Bob Smith",
      email: BOB_EMAIL,
      password_hash: INVALID_PLACEHOLDER_HASH,
    });

    await seed();

    // Re-running must not create a duplicate and must replace the bad hash.
    const count = await User.count({ where: { email: BOB_EMAIL } });
    expect(count).toBe(1);

    const bob = await getBob();
    expect(bob.password_hash).not.toBe(INVALID_PLACEHOLDER_HASH);
    expect(await bcrypt.compare(DEV_PASSWORD, bob.password_hash)).toBe(true);
  });
});

// ============================================================
// Login API behavior
// ============================================================
describe("POST /api/auth/login", () => {
  beforeAll(async () => {
    await User.destroy({ where: {} });
    await seed();
  });

  it("logs Bob in with the documented development password (correct field names)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: BOB_EMAIL, password: DEV_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.token.length).toBeGreaterThan(0);
    expect(res.body.data.user).toMatchObject({
      email: BOB_EMAIL,
      name: "Bob Smith",
    });
    // The raw password hash must never be exposed in the response.
    expect(JSON.stringify(res.body.data.user)).not.toContain("password_hash");
    expect(JSON.stringify(res.body.data.user)).not.toContain(DEV_PASSWORD);
  });

  it("returns an authentication error for a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: BOB_EMAIL, password: "definitely-wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid (email|creden)/i);
  });

  it("returns 401 (authentication error, not validation error) for an unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: DEV_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid (email|creden)/i);
  });

  it("returns a validation error for a malformed payload", async () => {
    const missingEmail = await request(app)
      .post("/api/auth/login")
      .send({ password: DEV_PASSWORD });
    expect(missingEmail.status).toBe(400);
    expect(missingEmail.body.success).toBe(false);
    expect(missingEmail.body.message).toBe("Validation failed");

    const missingPassword = await request(app).post("/api/auth/login").send({ email: BOB_EMAIL });
    expect(missingPassword.status).toBe(400);
    expect(missingPassword.body.message).toBe("Validation failed");

    const badEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: DEV_PASSWORD });
    expect(badEmail.status).toBe(400);
    expect(badEmail.body.message).toBe("Validation failed");
  });

  it("rejects credentials whose field names do not match the backend contract", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: BOB_EMAIL, password: DEV_PASSWORD });

    // "email" is missing, so this must be a 400 validation error, not a login.
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
