const request = require("supertest");
const app = require("../src/app");
const {
  sequelize,
  User,
  Group,
  GroupMember,
  ActivityLog,
  ExpenseReaction,
  ExpenseSplit,
  Payment,
  Expense,
} = require("../src/database/models");
const { generateToken } = require("../src/utils/jwt");

let userA, userB, userC;
let tokenA, tokenB, tokenC;

const createTestUser = async (name, email) => {
  const bcrypt = require("bcrypt");
  const passwordHash = await bcrypt.hash("Test1234!", 10);
  return User.create({ name, email, password_hash: passwordHash });
};

beforeAll(async () => {
  await sequelize.sync({ force: true });

  userA = await createTestUser("Alice", "alice@test.com");
  userB = await createTestUser("Bob", "bob@test.com");
  userC = await createTestUser("Charlie", "charlie@test.com");

  tokenA = generateToken({ user_id: userA.user_id });
  tokenB = generateToken({ user_id: userB.user_id });
  tokenC = generateToken({ user_id: userC.user_id });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await ActivityLog.destroy({ where: {} });
  await ExpenseReaction.destroy({ where: {} });
  await ExpenseSplit.destroy({ where: {} });
  await Payment.destroy({ where: {} });
  await Expense.destroy({ where: {} });
  await GroupMember.destroy({ where: {} });
  await Group.destroy({ where: {} });
});

// ============================================================
// TEST 1: Authenticated user creates group
// ============================================================
describe("POST /api/groups", () => {
  it("should create a group and return 201 CREATED", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Test Group" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.group.name).toBe("Test Group");
    expect(res.body.data.group.group_id).toBeDefined();
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app).post("/api/groups").send({ name: "No Auth Group" });

    expect(res.status).toBe(401);
  });

  it("should return 400 for invalid group data", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST 2: Creator automatically becomes ADMIN
// ============================================================
describe("Creator ADMIN role", () => {
  it("should assign ADMIN role to the group creator", async () => {
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Admin Check Group" });

    const groupId = createRes.body.data.group.group_id;

    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userA.user_id },
    });

    expect(membership).not.toBeNull();
    expect(membership.role).toBe("admin");
  });
});

// ============================================================
// TEST 3 & 4: ADMIN adds a member, member gets MEMBER role
// ============================================================
describe("POST /api/groups/:groupId/members", () => {
  let groupId;

  beforeEach(async () => {
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Member Add Group" });
    groupId = createRes.body.data.group.group_id;
  });

  it("should allow ADMIN to add a member with MEMBER role (201)", async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: userB.user_id });

    expect(res.status).toBe(201);
    expect(res.body.data.member.role).toBe("member");
    expect(res.body.data.member.user_id).toBe(userB.user_id);
  });

  it("should return 409 when adding duplicate member", async () => {
    await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: userB.user_id });

    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: userB.user_id });

    expect(res.status).toBe(409);
  });

  it("should return 404 when adding non-existent user", async () => {
    const fakeUserId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: fakeUserId });

    expect(res.status).toBe(404);
  });

  it("should return 400 for invalid user_id format", async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: "not-a-uuid" });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST 5: MEMBER cannot add a member (403 FORBIDDEN)
// ============================================================
describe("MEMBER authorization for add member", () => {
  let groupId;

  beforeEach(async () => {
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Auth Check Group" });
    groupId = createRes.body.data.group.group_id;

    await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: userB.user_id });
  });

  it("should return 403 when MEMBER tries to add a member", async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ user_id: userC.user_id });

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 6: ADMIN removes a member (200 OK)
// ============================================================
describe("DELETE /api/groups/:groupId/members/:userId", () => {
  let groupId;

  beforeEach(async () => {
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Remove Group" });
    groupId = createRes.body.data.group.group_id;

    await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: userB.user_id });
  });

  it("should allow ADMIN to remove a member (200 OK)", async () => {
    const res = await request(app)
      .delete(`/api/groups/${groupId}/members/${userB.user_id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Member removed successfully");

    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userB.user_id },
    });
    expect(membership).toBeNull();
  });

  it("should return 404 when removing non-existent member", async () => {
    const res = await request(app)
      .delete(`/api/groups/${groupId}/members/${userC.user_id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
  });
});

// ============================================================
// TEST 7: MEMBER cannot remove a member (403 FORBIDDEN)
// ============================================================
describe("MEMBER authorization for remove member", () => {
  let groupId;

  beforeEach(async () => {
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Remove Auth Group" });
    groupId = createRes.body.data.group.group_id;

    await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: userB.user_id });
  });

  it("should return 403 when MEMBER tries to remove a member", async () => {
    const res = await request(app)
      .delete(`/api/groups/${groupId}/members/${userC.user_id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 8: User cannot access group they don't belong to (403)
// ============================================================
describe("GET /api/groups/:groupId authorization", () => {
  let groupId;

  beforeEach(async () => {
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Private Group" });
    groupId = createRes.body.data.group.group_id;
  });

  it("should return 403 for non-member accessing group details", async () => {
    const res = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${tokenC}`);

    expect(res.status).toBe(403);
  });

  it("should return group details for group member", async () => {
    const res = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.group.name).toBe("Private Group");
    expect(res.body.data.group.members).toBeDefined();
  });
});

// ============================================================
// TEST 9: Nonexistent group returns 404
// ============================================================
describe("Nonexistent group", () => {
  it("should return 404 for nonexistent group", async () => {
    const fakeGroupId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app)
      .get(`/api/groups/${fakeGroupId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
  });
});

// ============================================================
// TEST 10: Add same user twice returns 409 CONFLICT
// ============================================================
describe("Duplicate membership", () => {
  it("should return 409 when adding same user twice", async () => {
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Duplicate Test Group" });
    const groupId = createRes.body.data.group.group_id;

    await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: userB.user_id });

    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: userB.user_id });

    expect(res.status).toBe(409);
  });
});

// ============================================================
// TEST 11: Cannot remove last ADMIN
// ============================================================
describe("Last admin protection", () => {
  it("should reject removing the last admin", async () => {
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Last Admin Group" });
    const groupId = createRes.body.data.group.group_id;

    const res = await request(app)
      .delete(`/api/groups/${groupId}/members/${userA.user_id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(400);

    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userA.user_id },
    });
    expect(membership).not.toBeNull();
  });
});

// ============================================================
// TEST 12: Get user's groups only returns user's groups
// ============================================================
describe("GET /api/groups", () => {
  it("should return only groups the user belongs to", async () => {
    const createRes1 = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Alice Group 1" });

    await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Alice Group 2" });

    const group1Id = createRes1.body.data.group.group_id;
    await request(app)
      .post(`/api/groups/${group1Id}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: userB.user_id });

    const resA = await request(app).get("/api/groups").set("Authorization", `Bearer ${tokenA}`);

    expect(resA.status).toBe(200);
    expect(resA.body.data.groups.length).toBe(2);

    const resB = await request(app).get("/api/groups").set("Authorization", `Bearer ${tokenB}`);

    expect(resB.status).toBe(200);
    expect(resB.body.data.groups.length).toBe(1);
    expect(resB.body.data.groups[0].role).toBe("member");

    const resC = await request(app).get("/api/groups").set("Authorization", `Bearer ${tokenC}`);

    expect(resC.status).toBe(200);
    expect(resC.body.data.groups.length).toBe(0);
  });
});

// ============================================================
// TEST 13: Transaction atomicity check
// ============================================================
describe("Create group transaction", () => {
  it("should create group and membership atomically", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Transactional Group" });

    expect(res.status).toBe(201);
    const groupId = res.body.data.group.group_id;

    const group = await Group.findByPk(groupId);
    expect(group).not.toBeNull();

    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userA.user_id },
    });
    expect(membership).not.toBeNull();
    expect(membership.role).toBe("admin");
  });
});

// ============================================================
// TEST 14: Existing authentication endpoints still work
// ============================================================
describe("Auth endpoints regression", () => {
  it("should still support signup", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "New User", email: "new@test.com", password: "Test1234!" });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe("new@test.com");
  });

  it("should still support login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.com", password: "Test1234!" });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it("should still support /me", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("alice@test.com");
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it("should still reject invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.com", password: "wrong" });

    expect(res.status).toBe(401);
  });

  it("should still reject duplicate email on signup", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Alice Again", email: "alice@test.com", password: "Test1234!" });

    expect(res.status).toBe(409);
  });
});

// ============================================================
// TEST 15: Database schema integrity
// ============================================================
describe("Database schema integrity", () => {
  it("should have all required tables", async () => {
    const tables = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'", {
      type: sequelize.QueryTypes.SELECT,
    });
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain("users");
    expect(tableNames).toContain("groups");
    expect(tableNames).toContain("group_members");
    expect(tableNames).toContain("expenses");
    expect(tableNames).toContain("expense_splits");
    expect(tableNames).toContain("payments");
    expect(tableNames).toContain("expense_reactions");
    expect(tableNames).toContain("activity_logs");
  });

  it("should have role column in group_members", async () => {
    const columns = await sequelize.query("PRAGMA table_info(group_members)", {
      type: sequelize.QueryTypes.SELECT,
    });
    const columnNames = columns.map((c) => c.name);

    expect(columnNames).toContain("role");
  });

  it("should have unique constraint on group_members(group_id, user_id)", async () => {
    const indexes = await sequelize.query("PRAGMA index_list(group_members)", {
      type: sequelize.QueryTypes.SELECT,
    });
    const uniqueIndex = indexes.find((i) => i.unique === 1);
    expect(uniqueIndex).toBeDefined();
  });
});
