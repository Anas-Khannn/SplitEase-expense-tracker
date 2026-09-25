const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../src/app");
const { sequelize, User } = require("../src/database/models");

const EMAIL = "verify@test.com";
const PASSWORD = "Test1234!";

const createUnverifiedUser = async (email = EMAIL) => {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  return User.create({ name: "Verify Test", email, password_hash: passwordHash });
};

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await User.destroy({ where: {} });
});

// ============================================================
// POST /api/auth/send-verification-otp
// ============================================================
describe("POST /api/auth/send-verification-otp", () => {
  it("generates and stores a 6-digit OTP for an unverified user", async () => {
    await createUnverifiedUser();

    const res = await request(app).post("/api/auth/send-verification-otp").send({ email: EMAIL });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expires_in).toEqual(expect.any(Number));

    const user = await User.findOne({ where: { email: EMAIL } });
    expect(user.email_verification_otp).toMatch(/^\d{6}$/);
    expect(user.email_verification_otp_expires_at).not.toBeNull();
  });

  it("rejects an unknown email with 404", async () => {
    const res = await request(app)
      .post("/api/auth/send-verification-otp")
      .send({ email: "nobody@example.com" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("rejects a user that is already verified with 400", async () => {
    const user = await createUnverifiedUser();
    user.email_verified = true;
    await user.save();

    const res = await request(app).post("/api/auth/send-verification-otp").send({ email: EMAIL });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a malformed payload with 400", async () => {
    const res = await request(app)
      .post("/api/auth/send-verification-otp")
      .send({ email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });
});

// ============================================================
// POST /api/auth/verify-email
// ============================================================
describe("POST /api/auth/verify-email", () => {
  it("verifies the email with the correct OTP and issues a token", async () => {
    await createUnverifiedUser();

    await request(app).post("/api/auth/send-verification-otp").send({ email: EMAIL });
    const user = await User.findOne({ where: { email: EMAIL } });
    const otp = user.email_verification_otp;

    const res = await request(app).post("/api/auth/verify-email").send({ email: EMAIL, otp });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user).toMatchObject({
      email: EMAIL,
      email_verified: true,
    });
    expect(JSON.stringify(res.body.data.user)).not.toContain("password_hash");

    const after = await User.findOne({ where: { email: EMAIL } });
    expect(after.email_verified).toBe(true);
    expect(after.email_verification_otp).toBeNull();
    expect(after.email_verification_otp_expires_at).toBeNull();
  });

  it("rejects an incorrect OTP with 400", async () => {
    await createUnverifiedUser();
    await request(app).post("/api/auth/send-verification-otp").send({ email: EMAIL });

    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: EMAIL, otp: "000000" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    const user = await User.findOne({ where: { email: EMAIL } });
    expect(user.email_verified).toBe(false);
  });

  it("rejects an expired OTP with 400", async () => {
    await createUnverifiedUser();
    await request(app).post("/api/auth/send-verification-otp").send({ email: EMAIL });

    const user = await User.findOne({ where: { email: EMAIL } });
    const otp = user.email_verification_otp;
    await user.update({ email_verification_otp_expires_at: new Date(Date.now() - 1000) });

    const res = await request(app).post("/api/auth/verify-email").send({ email: EMAIL, otp });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/expired/i);

    const after = await User.findOne({ where: { email: EMAIL } });
    expect(after.email_verified).toBe(false);
  });

  it("returns success + token for an already-verified user", async () => {
    const user = await createUnverifiedUser();
    user.email_verified = true;
    await user.save();

    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: EMAIL, otp: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email_verified).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("rejects an unknown email with 404", async () => {
    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: "nobody@example.com", otp: "123456" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("rejects a non-numeric or short OTP via validation", async () => {
    await createUnverifiedUser();

    const badOtp = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: EMAIL, otp: "12ab56" });
    expect(badOtp.status).toBe(400);

    const shortOtp = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: EMAIL, otp: "123" });
    expect(shortOtp.status).toBe(400);
  });
});

// ============================================================
// Signup + login integration
// ============================================================
describe("Email verification integration with auth", () => {
  it("signup returns an unverified user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "New Verify", email: EMAIL, password: PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email_verified).toBe(false);
    expect(res.body.data.token).toBeDefined();
  });

  it("login succeeds for an unverified user and exposes email_verified", async () => {
    await createUnverifiedUser();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: EMAIL, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email_verified).toBe(false);
  });

  it("verifying a fresh account lets it log in as verified", async () => {
    await createUnverifiedUser();
    await request(app).post("/api/auth/send-verification-otp").send({ email: EMAIL });

    const user = await User.findOne({ where: { email: EMAIL } });
    await request(app)
      .post("/api/auth/verify-email")
      .send({ email: EMAIL, otp: user.email_verification_otp });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: EMAIL, password: PASSWORD });

    expect(login.status).toBe(200);
    expect(login.body.data.user.email_verified).toBe(true);
  });

  it("/me exposes the email_verified flag", async () => {
    const user = await createUnverifiedUser();
    const { generateToken } = require("../src/utils/jwt");
    const token = generateToken({ user_id: user.user_id });

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email_verified).toBe(false);
  });
});
