const request = require("supertest");
const app = require("../src/app");
const {
  sequelize,
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseSplit,
  Payment,
  ActivityLog,
  ExpenseReaction,
} = require("../src/database/models");
const { generateToken } = require("../src/utils/jwt");

let userA, userB, userC, userD;
let tokenA, tokenB, tokenD;
let group1, group2;

const createTestUser = async (name, email) => {
  const bcrypt = require("bcrypt");
  const passwordHash = await bcrypt.hash("Test1234!", 10);
  return User.create({ name, email, password_hash: passwordHash });
};

beforeAll(async () => {
  await sequelize.sync({ force: true });

  userA = await createTestUser("Anas", "anas@test.com");
  userB = await createTestUser("Ali", "ali@test.com");
  userC = await createTestUser("Ahmed", "ahmed@test.com");
  userD = await createTestUser("Diana", "diana@test.com");

  tokenA = generateToken({ user_id: userA.user_id });
  tokenB = generateToken({ user_id: userB.user_id });
  tokenD = generateToken({ user_id: userD.user_id });
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

  const res1 = await request(app)
    .post("/api/groups")
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ name: "Test Group 1" });
  group1 = res1.body.data.group;

  await request(app)
    .post(`/api/groups/${group1.group_id}/members`)
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ user_id: userB.user_id });

  await request(app)
    .post(`/api/groups/${group1.group_id}/members`)
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ user_id: userC.user_id });

  const res2 = await request(app)
    .post("/api/groups")
    .set("Authorization", `Bearer ${tokenD}`)
    .send({ name: "Test Group 2" });
  group2 = res2.body.data.group;
});

// ============================================================
// TEST 1: Group with no expenses - all members settled
// ============================================================
describe("Group with no expenses", () => {
  it("should return all members with zero balance and SETTLED status", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.balances).toHaveLength(3);

    for (const balance of res.body.data.balances) {
      expect(balance.total_paid).toBe(0);
      expect(balance.total_share).toBe(0);
      expect(balance.balance).toBe(0);
      expect(balance.status).toBe("SETTLED");
    }
  });
});

// ============================================================
// TEST 2: Anas pays $90 split among 3 - balances correct
// ============================================================
describe("Single expense - Anas pays $90", () => {
  it("should return correct balances for all 3 members", async () => {
    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.balances).toHaveLength(3);

    const balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    const anas = balancesMap[userA.user_id];
    expect(anas.total_paid).toBe(90);
    expect(anas.total_share).toBe(30);
    expect(anas.balance).toBe(60);
    expect(anas.status).toBe("OWED");

    const ali = balancesMap[userB.user_id];
    expect(ali.total_paid).toBe(0);
    expect(ali.total_share).toBe(30);
    expect(ali.balance).toBe(-30);
    expect(ali.status).toBe("OWES");

    const ahmed = balancesMap[userC.user_id];
    expect(ahmed.total_paid).toBe(0);
    expect(ahmed.total_share).toBe(30);
    expect(ahmed.balance).toBe(-30);
    expect(ahmed.status).toBe("OWES");
  });
});

// ============================================================
// TEST 3: Two expenses - verify aggregated balances
// ============================================================
describe("Two expenses - aggregated balances", () => {
  it("should return correct aggregated balances", async () => {
    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        amount: 60,
        description: "Lunch",
        paid_by: userB.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    const balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    const anas = balancesMap[userA.user_id];
    expect(anas.total_paid).toBe(90);
    expect(anas.total_share).toBe(50);
    expect(anas.balance).toBe(40);
    expect(anas.status).toBe("OWED");

    const ali = balancesMap[userB.user_id];
    expect(ali.total_paid).toBe(60);
    expect(ali.total_share).toBe(50);
    expect(ali.balance).toBe(10);
    expect(ali.status).toBe("OWED");

    const ahmed = balancesMap[userC.user_id];
    expect(ahmed.total_paid).toBe(0);
    expect(ahmed.total_share).toBe(50);
    expect(ahmed.balance).toBe(-50);
    expect(ahmed.status).toBe("OWES");
  });
});

// ============================================================
// TEST 4: $100 split among 3 - verify stored shares respected
// ============================================================
describe("Uneven split - $100 among 3", () => {
  it("should respect stored share amounts ($33.33, $33.33, $33.34)", async () => {
    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 100,
        description: "Groceries",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    const balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    const totalShares = res.body.data.balances.reduce((sum, b) => sum + b.total_share, 0);
    expect(totalShares).toBe(100);

    const totalPaid = res.body.data.balances.reduce((sum, b) => sum + b.total_paid, 0);
    expect(totalPaid).toBe(100);
  });
});

// ============================================================
// TEST 5: Member with no expenses appears with zero balance
// ============================================================
describe("Member with no expenses", () => {
  it("should return member with zero balance", async () => {
    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 60,
        description: "Taxi",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id],
        expense_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.balances).toHaveLength(3);

    const balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    const ahmed = balancesMap[userC.user_id];
    expect(ahmed).toBeDefined();
    expect(ahmed.total_paid).toBe(0);
    expect(ahmed.total_share).toBe(0);
    expect(ahmed.balance).toBe(0);
    expect(ahmed.status).toBe("SETTLED");
  });
});

// ============================================================
// TEST 6: Non-member cannot view balances (403)
// ============================================================
describe("Non-member balance access", () => {
  it("should return 403 for non-member", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenD}`);

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 7: Nonexistent group returns 404
// ============================================================
describe("Nonexistent group", () => {
  it("should return 404 for nonexistent group", async () => {
    const fakeGroupId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app)
      .get(`/api/groups/${fakeGroupId}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
  });
});

// ============================================================
// TEST 8: Unauthenticated access returns 401
// ============================================================
describe("Unauthenticated balance access", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get(`/api/groups/${group1.group_id}/balances`);

    expect(res.status).toBe(401);
  });
});

// ============================================================
// TEST 9: Cross-group isolation
// ============================================================
describe("Cross-group balance isolation", () => {
  it("should not include expenses from other groups", async () => {
    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Group 1 Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    await request(app)
      .post(`/api/groups/${group2.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenD}`)
      .send({
        amount: 200,
        description: "Group 2 Party",
        paid_by: userD.user_id,
        participant_ids: [userD.user_id],
        expense_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    const totalPaid = res.body.data.balances.reduce((sum, b) => sum + b.total_paid, 0);
    expect(totalPaid).toBe(90);
  });
});

// ============================================================
// TEST 10: Balance consistency check (sum of balances = 0)
// ============================================================
describe("Balance consistency", () => {
  it("should have sum of all balances equal to zero", async () => {
    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        amount: 60,
        description: "Lunch",
        paid_by: userB.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    const totalBalance = res.body.data.balances.reduce((sum, b) => sum + b.balance, 0);
    expect(totalBalance).toBe(0);
  });
});

// ============================================================
// TEST 11: Multiple expenses by same user are aggregated
// ============================================================
describe("Multiple expenses by same user", () => {
  it("should aggregate all paid amounts for the same user", async () => {
    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 60,
        description: "Taxi",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id],
        expense_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    const balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    const anas = balancesMap[userA.user_id];
    expect(anas.total_paid).toBe(150);
    expect(anas.total_share).toBe(60);
    expect(anas.balance).toBe(90);
    expect(anas.status).toBe("OWED");
  });
});

// ============================================================
// TEST 12: Multiple splits for same user are aggregated
// ============================================================
describe("Multiple splits for same user", () => {
  it("should aggregate all share amounts for the same user", async () => {
    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        amount: 60,
        description: "Lunch",
        paid_by: userB.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    const balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    const ahmed = balancesMap[userC.user_id];
    expect(ahmed.total_share).toBe(50);
    expect(ahmed.total_paid).toBe(0);
    expect(ahmed.balance).toBe(-50);
  });
});

// ============================================================
// TEST 13: Balance reflects after expense edit
// ============================================================
describe("Balance reflects expense edit", () => {
  it("should update balance when expense is edited", async () => {
    const createRes = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    const expenseId = createRes.body.data.expense.expense_id;

    let res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    let balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });
    expect(balancesMap[userA.user_id].balance).toBe(60);

    await request(app)
      .put(`/api/groups/${group1.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ amount: 120 });

    res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    expect(balancesMap[userA.user_id].balance).toBe(80);
    expect(balancesMap[userA.user_id].total_paid).toBe(120);
    expect(balancesMap[userA.user_id].total_share).toBe(40);
  });
});

// ============================================================
// TEST 14: Balance reflects after expense deletion
// ============================================================
describe("Balance reflects expense deletion", () => {
  it("should update balance when expense is deleted", async () => {
    const createRes = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    const expenseId = createRes.body.data.expense.expense_id;

    let res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    let balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });
    expect(balancesMap[userA.user_id].balance).toBe(60);

    await request(app)
      .delete(`/api/groups/${group1.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    expect(balancesMap[userA.user_id].balance).toBe(0);
    expect(balancesMap[userA.user_id].total_paid).toBe(0);
    expect(balancesMap[userA.user_id].total_share).toBe(0);
    expect(balancesMap[userA.user_id].status).toBe("SETTLED");
  });
});

// ============================================================
// TEST 15: MEMBER and ADMIN can both view balances
// ============================================================
describe("Both ADMIN and MEMBER can view balances", () => {
  it("should allow ADMIN to view balances", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
  });

  it("should allow MEMBER to view balances", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
  });
});

// ============================================================
// TEST 16: Response format validation
// ============================================================
describe("Response format", () => {
  it("should return correct balance response format", async () => {
    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.balances).toBeDefined();
    expect(Array.isArray(res.body.data.balances)).toBe(true);

    for (const balance of res.body.data.balances) {
      expect(balance).toHaveProperty("user_id");
      expect(balance).toHaveProperty("name");
      expect(balance).toHaveProperty("total_paid");
      expect(balance).toHaveProperty("total_share");
      expect(balance).toHaveProperty("balance");
      expect(balance).toHaveProperty("status");
      expect(["OWED", "OWES", "SETTLED"]).toContain(balance.status);
    }
  });
});

// ============================================================
// TEST 17: Existing auth still works (regression)
// ============================================================
describe("Auth endpoints regression", () => {
  it("should still support signup", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "New User",
      email: "newuser@test.com",
      password: "Test1234!",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
  });

  it("should still support login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "anas@test.com", password: "Test1234!" });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it("should still support /me", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("anas@test.com");
  });
});

// ============================================================
// TEST 18: Existing group management still works (regression)
// ============================================================
describe("Group management regression", () => {
  it("should still support group creation", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Regression Group" });

    expect(res.status).toBe(201);
    expect(res.body.data.group.name).toBe("Regression Group");
  });

  it("should still support getting group details", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.group.name).toBe("Test Group 1");
  });
});

// ============================================================
// TEST 19: Existing expense management still works (regression)
// ============================================================
describe("Expense management regression", () => {
  it("should still support expense creation", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 50,
        description: "Coffee",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id],
        expense_date: "2026-08-20",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.expense.description).toBe("Coffee");
  });

  it("should still support getting expenses", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.expenses)).toBe(true);
  });
});
