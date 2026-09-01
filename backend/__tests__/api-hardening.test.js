const request = require("supertest");
const app = require("../src/app");
const { sequelize, User, Group, GroupMember } = require("../src/database/models");
const { generateToken } = require("../src/utils/jwt");

let userA, userB;
let tokenA;
let group1;

const createTestUser = async (name, email) => {
  const bcrypt = require("bcrypt");
  const passwordHash = await bcrypt.hash("Test1234!", 10);
  return User.create({ name, email, password_hash: passwordHash });
};

beforeAll(async () => {
  await sequelize.sync({ force: true });

  userA = await createTestUser("Anas", "anas@test.com");
  userB = await createTestUser("Ali", "ali@test.com");

  tokenA = generateToken({ user_id: userA.user_id });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await GroupMember.destroy({ where: {} });
  await Group.destroy({ where: {} });

  const res1 = await request(app)
    .post("/api/groups")
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ name: "Hardening Group" });
  group1 = res1.body.data.group;

  await request(app)
    .post(`/api/groups/${group1.group_id}/members`)
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ user_id: userB.user_id });
});

// ============================================================
// Malformed route parameters must return 400 BAD_REQUEST
// (never a 500 from the database layer)
// ============================================================
describe("Malformed route parameter validation", () => {
  const badId = "not-a-valid-uuid";
  const validFakeUuid = "00000000-0000-0000-0000-000000000000";

  it("returns 400 for malformed groupId on group-scoped endpoints", async () => {
    const resSummary = await request(app)
      .get(`/api/groups/${badId}/summary`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resSummary.status).toBe(400);
    expect(resSummary.body.success).toBe(false);

    const resExpenses = await request(app)
      .get(`/api/groups/${badId}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resExpenses.status).toBe(400);

    const resBalances = await request(app)
      .get(`/api/groups/${badId}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resBalances.status).toBe(400);

    const resPayments = await request(app)
      .get(`/api/groups/${badId}/payments`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resPayments.status).toBe(400);

    const resActivity = await request(app)
      .get(`/api/groups/${badId}/activity`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resActivity.status).toBe(400);

    const resGroup = await request(app)
      .get(`/api/groups/${badId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resGroup.status).toBe(400);
  });

  it("still returns 404 for well-formed but non-existent groupId", async () => {
    const res = await request(app)
      .get(`/api/groups/${validFakeUuid}/summary`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for malformed expenseId on expense detail routes", async () => {
    const resGet = await request(app)
      .get(`/api/groups/${group1.group_id}/expenses/${badId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resGet.status).toBe(400);

    const resPut = await request(app)
      .put(`/api/groups/${group1.group_id}/expenses/${badId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ amount: 100 });
    expect(resPut.status).toBe(400);

    const resDelete = await request(app)
      .delete(`/api/groups/${group1.group_id}/expenses/${badId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resDelete.status).toBe(400);
  });

  it("returns 400 for malformed expenseId on reaction routes", async () => {
    const resPost = await request(app)
      .post(`/api/expenses/${badId}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "👍" });
    expect(resPost.status).toBe(400);

    const resGet = await request(app)
      .get(`/api/expenses/${badId}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resGet.status).toBe(400);

    const resDelete = await request(app)
      .delete(`/api/expenses/${badId}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resDelete.status).toBe(400);
  });

  it("returns 400 for malformed userId on member management routes", async () => {
    const resRemove = await request(app)
      .delete(`/api/groups/${group1.group_id}/members/${badId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resRemove.status).toBe(400);

    const resRole = await request(app)
      .patch(`/api/groups/${group1.group_id}/members/${badId}/role`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ role: "admin" });
    expect(resRole.status).toBe(400);
  });
});

// ============================================================
// Sensitive-data coverage for /me
// ============================================================
describe("Sensitive data protection", () => {
  it("GET /me never returns password_hash", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("password_hash");
    expect(JSON.stringify(res.body)).not.toContain(userA.password_hash);
  });
});
