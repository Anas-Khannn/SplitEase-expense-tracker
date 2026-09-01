const request = require("supertest");
const app = require("../src/app");
const {
  sequelize,
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseSplit,
  ActivityLog,
  ExpenseReaction,
  Payment,
} = require("../src/database/models");
const { generateToken } = require("../src/utils/jwt");

let userA, userB, userC, userD;
let tokenA, tokenB, tokenC, tokenD;
let group1, group2;

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
  userD = await createTestUser("Diana", "diana@test.com");

  tokenA = generateToken({ user_id: userA.user_id });
  tokenB = generateToken({ user_id: userB.user_id });
  tokenC = generateToken({ user_id: userC.user_id });
  tokenD = generateToken({ user_id: userD.user_id });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await ActivityLog.destroy({ where: {} });
  await ExpenseReaction.destroy({ where: {} });
  await ExpenseSplit.destroy({ where: {} });
  await Expense.destroy({ where: {} });
  await Payment.destroy({ where: {} });
  await GroupMember.destroy({ where: {} });
  await Group.destroy({ where: {} });

  const res1 = await request(app)
    .post("/api/groups")
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ name: "Summary Group" });
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
    .send({ name: "Other Group" });
  group2 = res2.body.data.group;
});

const createExpense = async (
  token,
  groupId,
  { amount, description = "Test expense", paid_by, expense_date },
) => {
  return request(app)
    .post(`/api/groups/${groupId}/expenses`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount,
      description,
      paid_by,
      participant_ids: [paid_by],
      expense_date,
    });
};

const getSummary = async (token, groupId, query = {}) => {
  return request(app)
    .get(`/api/groups/${groupId}/summary`)
    .set("Authorization", `Bearer ${token}`)
    .query(query);
};

const findContribution = (res, userId) =>
  res.body.data.contributions.find((c) => c.user_id === userId);

// ============================================================
// TEST 1: Authenticated group member can retrieve summary
// ============================================================
describe("GET /api/groups/:groupId/summary - authorization", () => {
  it("TEST 1: authenticated group member can retrieve summary (200)", async () => {
    const res = await getSummary(tokenA, group1.group_id);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.total_spending).toBe("number");
    expect(Array.isArray(res.body.data.contributions)).toBe(true);
  });

  it("TEST 2: unauthenticated user receives 401", async () => {
    const res = await request(app).get(`/api/groups/${group1.group_id}/summary`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("TEST 3: authenticated non-member receives 403", async () => {
    const res = await getSummary(tokenD, group1.group_id);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("TEST 4: non-existent group receives 404", async () => {
    const fakeGroupId = require("crypto").randomUUID();

    const res = await getSummary(tokenA, fakeGroupId);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================
// TESTS 5-8: SUM(amount) and GROUP BY paid_by correctness
// ============================================================
describe("GET /api/groups/:groupId/summary - aggregation", () => {
  it("TEST 5: returns correct total spending via SUM(amount)", async () => {
    await createExpense(tokenA, group1.group_id, {
      amount: 500,
      paid_by: userA.user_id,
      expense_date: "2026-08-05",
    });
    await createExpense(tokenA, group1.group_id, {
      amount: 1000,
      paid_by: userB.user_id,
      expense_date: "2026-08-06",
    });
    await createExpense(tokenB, group1.group_id, {
      amount: 2500,
      paid_by: userA.user_id,
      expense_date: "2026-08-07",
    });

    const res = await getSummary(tokenA, group1.group_id);

    expect(res.status).toBe(200);
    expect(res.body.data.total_spending).toBe(4000);
  });

  it("TEST 6: returns correct contribution for a single member", async () => {
    await createExpense(tokenA, group1.group_id, {
      amount: 5000,
      description: "Anas pays everything",
      paid_by: userA.user_id,
      expense_date: "2026-08-05",
    });

    const res = await getSummary(tokenA, group1.group_id);

    expect(res.status).toBe(200);
    expect(res.body.data.total_spending).toBe(5000);
    expect(res.body.data.contributions).toHaveLength(1);

    const anas = findContribution(res, userA.user_id);
    expect(anas.name).toBe("Alice");
    expect(anas.amount).toBe(5000);
  });

  it("TEST 7: aggregates multiple expenses from the same payer", async () => {
    await createExpense(tokenA, group1.group_id, {
      amount: 1000,
      paid_by: userA.user_id,
      expense_date: "2026-08-05",
    });
    await createExpense(tokenA, group1.group_id, {
      amount: 2000,
      paid_by: userA.user_id,
      expense_date: "2026-08-06",
    });
    await createExpense(tokenA, group1.group_id, {
      amount: 3000,
      paid_by: userA.user_id,
      expense_date: "2026-08-07",
    });

    const res = await getSummary(tokenA, group1.group_id);

    expect(res.status).toBe(200);
    expect(res.body.data.contributions).toHaveLength(1);
    expect(findContribution(res, userA.user_id).amount).toBe(6000);
  });

  it("TEST 8: multiple members have independent contribution totals", async () => {
    await createExpense(tokenA, group1.group_id, {
      amount: 1000,
      paid_by: userA.user_id,
      expense_date: "2026-08-05",
    });
    await createExpense(tokenB, group1.group_id, {
      amount: 2000,
      paid_by: userA.user_id,
      expense_date: "2026-08-06",
    });
    await createExpense(tokenB, group1.group_id, {
      amount: 700,
      paid_by: userB.user_id,
      expense_date: "2026-08-07",
    });
    await createExpense(tokenC, group1.group_id, {
      amount: 300,
      paid_by: userB.user_id,
      expense_date: "2026-08-08",
    });

    const res = await getSummary(tokenA, group1.group_id);

    expect(res.status).toBe(200);
    expect(res.body.data.total_spending).toBe(4000);
    expect(res.body.data.contributions).toHaveLength(2);
    expect(findContribution(res, userA.user_id)).toEqual({
      user_id: userA.user_id,
      name: "Alice",
      amount: 3000,
    });
    expect(findContribution(res, userB.user_id)).toEqual({
      user_id: userB.user_id,
      name: "Bob",
      amount: 1000,
    });
  });
});

// ============================================================
// TESTS 9-11: Monthly filtering combined with aggregation
// ============================================================
describe("GET /api/groups/:groupId/summary?month=YYYY-MM", () => {
  // Seeds:
  //   - A pays 500  on 2026-08-05
  //   - B pays 250  on 2026-08-31 (month boundary day)
  //   - A pays 900  on 2026-09-10
  const seedMonthlyExpenses = async () => {
    await createExpense(tokenA, group1.group_id, {
      amount: 500,
      description: "August groceries",
      paid_by: userA.user_id,
      expense_date: "2026-08-05",
    });
    await createExpense(tokenB, group1.group_id, {
      amount: 250,
      description: "August dinner",
      paid_by: userB.user_id,
      expense_date: "2026-08-31",
    });
    await createExpense(tokenA, group1.group_id, {
      amount: 900,
      description: "September concert",
      paid_by: userA.user_id,
      expense_date: "2026-09-10",
    });
  };

  it("TEST 9: monthly filter returns only expenses from requested month", async () => {
    await seedMonthlyExpenses();

    const res = await getSummary(tokenA, group1.group_id, {
      month: "2026-08",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.total_spending).toBe(750);
    expect(res.body.data.contributions).toHaveLength(2);
    expect(findContribution(res, userA.user_id).amount).toBe(500);
    expect(findContribution(res, userB.user_id).amount).toBe(250);
  });

  it("TEST 10: monthly filter changes total spending vs all-time", async () => {
    await seedMonthlyExpenses();

    const allTimeRes = await getSummary(tokenA, group1.group_id);
    const augustRes = await getSummary(tokenA, group1.group_id, {
      month: "2026-08",
    });
    const septemberRes = await getSummary(tokenA, group1.group_id, {
      month: "2026-09",
    });

    expect(allTimeRes.body.data.total_spending).toBe(1650);
    expect(augustRes.body.data.total_spending).toBe(750);
    expect(septemberRes.body.data.total_spending).toBe(900);
  });

  it("TEST 11: monthly filter changes contribution breakdown", async () => {
    await seedMonthlyExpenses();
    await createExpense(tokenC, group1.group_id, {
      amount: 400,
      description: "September taxi",
      paid_by: userC.user_id,
      expense_date: "2026-09-02",
    });

    const augustRes = await getSummary(tokenA, group1.group_id, {
      month: "2026-08",
    });
    expect(
      augustRes.body.data.contributions.find((c) => c.user_id === userC.user_id),
    ).toBeUndefined();
    expect(augustRes.body.data.contributions.map((c) => c.name).sort()).toEqual(["Alice", "Bob"]);

    const septemberRes = await getSummary(tokenA, group1.group_id, {
      month: "2026-09",
    });
    expect(septemberRes.body.data.total_spending).toBe(1300);
    expect(septemberRes.body.data.contributions).toHaveLength(2);
    expect(
      septemberRes.body.data.contributions.find((c) => c.user_id === userA.user_id).amount,
    ).toBe(900);
    expect(
      septemberRes.body.data.contributions.find((c) => c.user_id === userC.user_id).amount,
    ).toBe(400);
  });
});

// ============================================================
// TEST 12: Month with no expenses
// ============================================================
describe("GET /api/groups/:groupId/summary - empty results", () => {
  it("TEST 12: month with no expenses returns zero spending and empty contributions", async () => {
    await createExpense(tokenA, group1.group_id, {
      amount: 500,
      paid_by: userA.user_id,
      expense_date: "2026-07-20",
    });

    const res = await getSummary(tokenA, group1.group_id, {
      month: "2026-12",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.total_spending).toBe(0);
    expect(res.body.data.contributions).toEqual([]);
  });
});

// ============================================================
// TESTS 13-14: Month validation
// ============================================================
describe("GET /api/groups/:groupId/summary - month validation", () => {
  it.each(["2026", "08-2026", "2026-8", "hello"])(
    "TEST 13: invalid month format %s returns 400",
    async (invalidMonth) => {
      const res = await getSummary(tokenA, group1.group_id, {
        month: invalidMonth,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    },
  );

  it.each(["2026-13", "2026-00", "2026-99"])(
    "TEST 14: invalid month value %s returns 400",
    async (invalidMonth) => {
      const res = await getSummary(tokenA, group1.group_id, {
        month: invalidMonth,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.join(" ")).toMatch(/month/i);
    },
  );
});

// ============================================================
// TESTS 15-16: Cross-group data isolation
// ============================================================
describe("GET /api/groups/:groupId/summary - group isolation", () => {
  it("TEST 15: expenses from another group never affect the result", async () => {
    await createExpense(tokenA, group1.group_id, {
      amount: 5000,
      paid_by: userA.user_id,
      expense_date: "2026-08-05",
    });
    await createExpense(tokenD, group2.group_id, {
      amount: 99999,
      description: "Other group expense",
      paid_by: userD.user_id,
      expense_date: "2026-08-06",
    });

    const resGroup1 = await getSummary(tokenA, group1.group_id);
    expect(resGroup1.body.data.total_spending).toBe(5000);
    expect(resGroup1.body.data.contributions).toHaveLength(1);
    expect(findContribution(resGroup1, userD.user_id)).toBeUndefined();

    const resGroup2 = await getSummary(tokenD, group2.group_id);
    expect(resGroup2.body.data.total_spending).toBe(99999);
    expect(resGroup2.body.data.contributions).toHaveLength(1);
  });

  it("TEST 16: same payer across groups is aggregated per group only", async () => {
    await request(app)
      .post(`/api/groups/${group2.group_id}/members`)
      .set("Authorization", `Bearer ${tokenD}`)
      .send({ user_id: userB.user_id });

    await createExpense(tokenA, group1.group_id, {
      amount: 400,
      description: "Group 1 lunch",
      paid_by: userB.user_id,
      expense_date: "2026-08-05",
    });
    await createExpense(tokenD, group2.group_id, {
      amount: 6000,
      description: "Group 2 party",
      paid_by: userB.user_id,
      expense_date: "2026-08-06",
    });

    const resGroup1 = await getSummary(tokenA, group1.group_id);
    expect(resGroup1.body.data.total_spending).toBe(400);
    expect(findContribution(resGroup1, userB.user_id).amount).toBe(400);
    expect(findContribution(resGroup1, userD.user_id)).toBeUndefined();

    const resGroup2 = await getSummary(tokenD, group2.group_id);
    expect(resGroup2.body.data.total_spending).toBe(6000);
    expect(findContribution(resGroup2, userB.user_id).amount).toBe(6000);
  });
});

// ============================================================
// TEST 17: No sensitive fields leaked
// ============================================================
describe("GET /api/groups/:groupId/summary - sensitive data", () => {
  it("TEST 17: password_hash is never returned in the summary", async () => {
    await createExpense(tokenA, group1.group_id, {
      amount: 100,
      paid_by: userA.user_id,
      expense_date: "2026-08-05",
    });

    const res = await getSummary(tokenA, group1.group_id);

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("password_hash");
    expect(JSON.stringify(res.body)).not.toContain(userA.password_hash);
  });
});
