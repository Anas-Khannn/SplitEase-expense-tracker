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

  userA = await createTestUser("Alice", "alice@test.com");
  userB = await createTestUser("Bob", "bob@test.com");
  userC = await createTestUser("Charlie", "charlie@test.com");
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
  await ExpenseSplit.destroy({ where: {} });
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
// TEST 1: Authenticated group member creates expense (201)
// ============================================================
describe("POST /api/groups/:groupId/expenses", () => {
  it("should create an expense and return 201 CREATED", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-19",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expense.description).toBe("Dinner");
    expect(res.body.data.expense.amount).toBe("90.00");
    expect(res.body.data.expense.expense_id).toBeDefined();
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id],
        expense_date: "2026-08-19",
      });

    expect(res.status).toBe(401);
  });
});

// ============================================================
// TEST 2: Creator/payer is a valid group member
// ============================================================
describe("Payer validation", () => {
  it("should reject expense with non-member payer", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 50,
        description: "Lunch",
        paid_by: userD.user_id,
        participant_ids: [userA.user_id],
        expense_date: "2026-08-19",
      });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST 3: Three participants split $90 equally
// ============================================================
describe("Equal split calculation", () => {
  it("should split $90 evenly among 3 participants ($30 each)", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-19",
      });

    expect(res.status).toBe(201);

    const splits = res.body.data.expense.splits;
    expect(splits).toHaveLength(3);

    const shareAmounts = splits.map((s) => parseFloat(s.share_amount));
    expect(shareAmounts).toContain(30);
    expect(shareAmounts.filter((a) => a === 30)).toHaveLength(3);

    const total = shareAmounts.reduce((sum, a) => sum + a, 0);
    expect(total).toBe(90);
  });
});

// ============================================================
// TEST 4: Three participants split $100 (uneven division)
// ============================================================
describe("Uneven division rounding", () => {
  it("should split $100 among 3 as $33.33, $33.33, $33.34", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 100,
        description: "Groceries",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-19",
      });

    expect(res.status).toBe(201);

    const splits = res.body.data.expense.splits;
    expect(splits).toHaveLength(3);

    const shareAmounts = splits.map((s) => parseFloat(s.share_amount)).sort((a, b) => a - b);

    expect(shareAmounts[0]).toBe(33.33);
    expect(shareAmounts[1]).toBe(33.33);
    expect(shareAmounts[2]).toBe(33.34);

    const total = shareAmounts.reduce((sum, a) => sum + a, 0);
    expect(total).toBe(100);
  });
});

// ============================================================
// TEST 5: Non-group payer rejected
// ============================================================
describe("Non-group payer rejection", () => {
  it("should reject expense with payer not in group", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 30,
        description: "Snacks",
        paid_by: userD.user_id,
        participant_ids: [userA.user_id],
        expense_date: "2026-08-19",
      });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST 6: Non-group participant rejected
// ============================================================
describe("Non-group participant rejection", () => {
  it("should reject expense with participant not in group", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 60,
        description: "Movie",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userD.user_id],
        expense_date: "2026-08-19",
      });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST 7: Duplicate participant IDs rejected
// ============================================================
describe("Duplicate participant rejection", () => {
  it("should reject expense with duplicate participant IDs", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 30,
        description: "Coffee",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userA.user_id],
        expense_date: "2026-08-19",
      });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST 8: Non-member cannot create expense (403)
// ============================================================
describe("Non-member expense creation", () => {
  it("should return 403 for non-member creating expense", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenD}`)
      .send({
        amount: 25,
        description: "Taxi",
        paid_by: userD.user_id,
        participant_ids: [userD.user_id],
        expense_date: "2026-08-19",
      });

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 9: Group member gets group expenses
// ============================================================
describe("GET /api/groups/:groupId/expenses", () => {
  it("should return only expenses belonging to the group", async () => {
    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 40,
        description: "Lunch",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id],
        expense_date: "2026-08-19",
      });

    await request(app)
      .post(`/api/groups/${group2.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenD}`)
      .send({
        amount: 50,
        description: "Dinner",
        paid_by: userD.user_id,
        participant_ids: [userD.user_id],
        expense_date: "2026-08-19",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.expenses).toHaveLength(1);
    expect(res.body.data.expenses[0].description).toBe("Lunch");
  });
});

// ============================================================
// TEST 10: Non-member cannot get group expenses (403)
// ============================================================
describe("Non-member expense access", () => {
  it("should return 403 for non-member getting expenses", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenD}`);

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 11: Get single expense with splits
// ============================================================
describe("GET /api/groups/:groupId/expenses/:expenseId", () => {
  it("should return correct expense with splits", async () => {
    const createRes = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 60,
        description: "Concert",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id],
        expense_date: "2026-08-19",
      });

    const expenseId = createRes.body.data.expense.expense_id;

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.expense.description).toBe("Concert");
    expect(res.body.data.expense.amount).toBe("60.00");
    expect(res.body.data.expense.splits).toHaveLength(2);

    const shareAmounts = res.body.data.expense.splits.map((s) => parseFloat(s.share_amount));
    expect(shareAmounts).toContain(30);
  });
});

// ============================================================
// TEST 12: Cannot access expense from another group
// ============================================================
describe("Cross-group expense access", () => {
  it("should reject access to expense from another group", async () => {
    const createRes = await request(app)
      .post(`/api/groups/${group2.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenD}`)
      .send({
        amount: 100,
        description: "Party",
        paid_by: userD.user_id,
        participant_ids: [userD.user_id],
        expense_date: "2026-08-19",
      });

    const expenseId = createRes.body.data.expense.expense_id;

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
  });
});

// ============================================================
// TEST 13: Update expense amount (recalculate splits)
// ============================================================
describe("PUT /api/groups/:groupId/expenses/:expenseId", () => {
  it("should update amount and recalculate splits", async () => {
    const createRes = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-19",
      });

    const expenseId = createRes.body.data.expense.expense_id;

    const updateRes = await request(app)
      .put(`/api/groups/${group1.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ amount: 120 });

    expect(updateRes.status).toBe(200);

    const splits = updateRes.body.data.expense.splits;
    expect(splits).toHaveLength(3);

    const shareAmounts = splits.map((s) => parseFloat(s.share_amount));
    shareAmounts.forEach((share) => {
      expect(share).toBe(40);
    });

    const total = shareAmounts.reduce((sum, a) => sum + a, 0);
    expect(total).toBe(120);
  });
});

// ============================================================
// TEST 14: Update participant list (replace splits)
// ============================================================
describe("Update participant list", () => {
  it("should replace old splits with new participant list", async () => {
    const createRes = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-19",
      });

    const expenseId = createRes.body.data.expense.expense_id;

    const updateRes = await request(app)
      .put(`/api/groups/${group1.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ participant_ids: [userA.user_id, userB.user_id] });

    expect(updateRes.status).toBe(200);

    const splits = updateRes.body.data.expense.splits;
    expect(splits).toHaveLength(2);

    const shareAmounts = splits.map((s) => parseFloat(s.share_amount));
    shareAmounts.forEach((share) => {
      expect(share).toBe(45);
    });

    const dbSplits = await ExpenseSplit.findAll({
      where: { expense_id: expenseId },
    });
    expect(dbSplits).toHaveLength(2);
  });
});

// ============================================================
// TEST 15: Delete expense (cascade removes splits)
// ============================================================
describe("DELETE /api/groups/:groupId/expenses/:expenseId", () => {
  it("should delete expense and cascade remove splits", async () => {
    const createRes = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 50,
        description: "Taxi",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id],
        expense_date: "2026-08-19",
      });

    const expenseId = createRes.body.data.expense.expense_id;

    const splitsBefore = await ExpenseSplit.findAll({
      where: { expense_id: expenseId },
    });
    expect(splitsBefore).toHaveLength(2);

    const deleteRes = await request(app)
      .delete(`/api/groups/${group1.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(deleteRes.status).toBe(200);

    const expenseAfter = await Expense.findByPk(expenseId);
    expect(expenseAfter).toBeNull();

    const splitsAfter = await ExpenseSplit.findAll({
      where: { expense_id: expenseId },
    });
    expect(splitsAfter).toHaveLength(0);
  });
});

// ============================================================
// TEST 16: Transaction rollback on creation failure
// ============================================================
describe("Transaction rollback on creation", () => {
  it("should rollback if split creation fails", async () => {
    const originalBulkCreate = ExpenseSplit.bulkCreate;
    let callCount = 0;

    ExpenseSplit.bulkCreate = async (...args) => {
      callCount++;
      if (callCount === 1) {
        throw new Error("Simulated split creation failure");
      }
      return originalBulkCreate.apply(ExpenseSplit, args);
    };

    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 100,
        description: "Should fail",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id],
        expense_date: "2026-08-19",
      });

    expect(res.status).toBe(500);

    ExpenseSplit.bulkCreate = originalBulkCreate;

    const expenses = await Expense.findAll({
      where: { group_id: group1.group_id, description: "Should fail" },
    });
    expect(expenses).toHaveLength(0);
  });
});

// ============================================================
// TEST 17: Update failure preserves old state
// ============================================================
describe("Update failure preserves old state", () => {
  it("should keep old expense if update transaction fails", async () => {
    const createRes = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 90,
        description: "Original",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-19",
      });

    const expenseId = createRes.body.data.expense.expense_id;

    const originalDestroy = ExpenseSplit.destroy;

    ExpenseSplit.destroy = async () => {
      throw new Error("Simulated split delete failure");
    };

    await request(app)
      .put(`/api/groups/${group1.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ amount: 200 });

    ExpenseSplit.destroy = originalDestroy;

    const expense = await Expense.findByPk(expenseId);
    expect(parseFloat(expense.amount).toFixed(2)).toBe("90.00");
    expect(expense.description).toBe("Original");

    const splits = await ExpenseSplit.findAll({
      where: { expense_id: expenseId },
    });
    expect(splits).toHaveLength(3);
  });
});

// ============================================================
// TEST 18: Auth endpoints still work (regression)
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
      .send({ email: "alice@test.com", password: "Test1234!" });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it("should still support /me", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("alice@test.com");
  });
});

// ============================================================
// TEST 19: Group management endpoints still work (regression)
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

  it("should still support adding members", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ user_id: userD.user_id });

    expect(res.status).toBe(201);
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
// TEST 20: Database schema integrity
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

  it("should have expense_splits unique constraint", async () => {
    const indexes = await sequelize.query("PRAGMA index_list(expense_splits)", {
      type: sequelize.QueryTypes.SELECT,
    });
    const uniqueIndex = indexes.find((i) => i.unique === 1);
    expect(uniqueIndex).toBeDefined();
  });
});

// ============================================================
// EXPENSE SEARCH & FILTERS
// ============================================================
describe("Expense search and filters", () => {
  const createExpense = async (
    token,
    groupId,
    { amount = 100, description = "Test expense", paid_by = userA.user_id, expense_date } = {},
  ) => {
    return request(app)
      .post(`/api/groups/${groupId}/expenses`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount,
        description,
        paid_by,
        participant_ids: [paid_by],
        expense_date: expense_date || "2026-08-19",
      });
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Seeds group1 with:
  //   - "Groceries" paid by A on 2026-08-05
  //   - "Dinner"    paid by B on 2026-08-15
  //   - "Concert"   paid by A on 2026-09-10
  const seedGroup1Expenses = async () => {
    await createExpense(tokenA, group1.group_id, {
      description: "Groceries",
      amount: 30,
      expense_date: "2026-08-05",
    });
    await delay(10);
    await createExpense(tokenB, group1.group_id, {
      description: "Dinner",
      amount: 60,
      paid_by: userB.user_id,
      expense_date: "2026-08-15",
    });
    await delay(10);
    await createExpense(tokenA, group1.group_id, {
      description: "Concert",
      amount: 90,
      expense_date: "2026-09-10",
    });
  };

  const listExpenses = async (token, groupId, query = {}) => {
    return request(app)
      .get(`/api/groups/${groupId}/expenses`)
      .set("Authorization", `Bearer ${token}`)
      .query(query);
  };

  it("TEST 1: authenticated group member can retrieve expenses (200)", async () => {
    await seedGroup1Expenses();

    const res = await listExpenses(tokenA, group1.group_id);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.expenses)).toBe(true);
    expect(res.body.data.expenses).toHaveLength(3);
  });

  it("TEST 2: no filters return all expenses belonging to the group", async () => {
    await seedGroup1Expenses();
    await createExpense(tokenD, group2.group_id, {
      description: "Other group",
      paid_by: userD.user_id,
    });

    const res = await listExpenses(tokenA, group1.group_id);

    const descriptions = res.body.data.expenses.map((e) => e.description);
    expect(descriptions).toHaveLength(3);
    expect(descriptions).toContain("Groceries");
    expect(descriptions).toContain("Dinner");
    expect(descriptions).toContain("Concert");
    expect(descriptions).not.toContain("Other group");
  });

  it("TEST 3: payer_id filter returns only expenses paid by that user", async () => {
    await seedGroup1Expenses();

    const res = await listExpenses(tokenA, group1.group_id, {
      payer_id: userA.user_id,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.expenses).toHaveLength(2);
    res.body.data.expenses.forEach((expense) => {
      expect(expense.paid_by).toBe(userA.user_id);
    });
    const descriptions = res.body.data.expenses.map((e) => e.description);
    expect(descriptions.sort()).toEqual(["Concert", "Groceries"]);
  });

  it("TEST 4: start_date filter works", async () => {
    await seedGroup1Expenses();

    const res = await listExpenses(tokenA, group1.group_id, {
      start_date: "2026-08-10",
    });

    expect(res.status).toBe(200);
    const descriptions = res.body.data.expenses.map((e) => e.description);
    expect(descriptions.sort()).toEqual(["Concert", "Dinner"]);
  });

  it("TEST 5: end_date filter works", async () => {
    await seedGroup1Expenses();

    const res = await listExpenses(tokenA, group1.group_id, {
      end_date: "2026-08-15",
    });

    expect(res.status).toBe(200);
    const descriptions = res.body.data.expenses.map((e) => e.description);
    expect(descriptions.sort()).toEqual(["Dinner", "Groceries"]);
  });

  it("TEST 6: start_date + end_date range works together", async () => {
    await seedGroup1Expenses();

    const res = await listExpenses(tokenA, group1.group_id, {
      start_date: "2026-08-01",
      end_date: "2026-08-31",
    });

    expect(res.status).toBe(200);
    const descriptions = res.body.data.expenses.map((e) => e.description);
    expect(descriptions.sort()).toEqual(["Dinner", "Groceries"]);
    expect(descriptions).not.toContain("Concert");
  });

  it("TEST 7: payer_id + date range work combined", async () => {
    await seedGroup1Expenses();

    const res = await listExpenses(tokenA, group1.group_id, {
      payer_id: userA.user_id,
      start_date: "2026-08-01",
      end_date: "2026-08-31",
    });

    expect(res.status).toBe(200);
    const descriptions = res.body.data.expenses.map((e) => e.description);
    expect(descriptions).toEqual(["Groceries"]);
  });

  it("TEST 8: invalid payer_id returns 400", async () => {
    const res = await listExpenses(tokenA, group1.group_id, {
      payer_id: "not-a-valid-uuid",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("TEST 9: invalid start_date returns 400", async () => {
    const res = await listExpenses(tokenA, group1.group_id, {
      start_date: "not-a-date",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("TEST 10: invalid end_date returns 400", async () => {
    const res = await listExpenses(tokenA, group1.group_id, {
      end_date: "31/12/2026",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("TEST 11: start_date after end_date returns 400", async () => {
    const res = await listExpenses(tokenA, group1.group_id, {
      start_date: "2026-09-01",
      end_date: "2026-08-01",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors.join(" ")).toMatch(/start_date/i);
  });

  it("TEST 12: invalid page returns 400", async () => {
    const resNonNumeric = await listExpenses(tokenA, group1.group_id, {
      page: "abc",
    });
    expect(resNonNumeric.status).toBe(400);

    const resZero = await listExpenses(tokenA, group1.group_id, {
      page: "0",
    });
    expect(resZero.status).toBe(400);
  });

  it("TEST 13: invalid limit returns 400", async () => {
    const resNonNumeric = await listExpenses(tokenA, group1.group_id, {
      limit: "abc",
    });
    expect(resNonNumeric.status).toBe(400);

    const resZero = await listExpenses(tokenA, group1.group_id, {
      limit: "0",
    });
    expect(resZero.status).toBe(400);
  });

  it("TEST 14: limit greater than 100 is rejected", async () => {
    const res = await listExpenses(tokenA, group1.group_id, { limit: "101" });

    expect(res.status).toBe(400);
    expect(res.body.errors.join(" ")).toMatch(/100/);
  });

  it("TEST 15: default page is 1", async () => {
    await seedGroup1Expenses();

    const res = await listExpenses(tokenA, group1.group_id);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(1);
  });

  it("TEST 16: default limit is 20", async () => {
    for (let i = 0; i < 25; i++) {
      await createExpense(tokenA, group1.group_id, {
        description: `Bulk ${i}`,
      });
    }

    const res = await listExpenses(tokenA, group1.group_id);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.limit).toBe(20);
    expect(res.body.data.expenses).toHaveLength(20);
    expect(res.body.data.pagination.total).toBe(25);
  });

  it("TEST 17: pagination returns the correct slice of results", async () => {
    for (let i = 1; i <= 5; i++) {
      await createExpense(tokenA, group1.group_id, {
        description: `Expense ${i}`,
      });
      await delay(10);
    }

    const res = await listExpenses(tokenA, group1.group_id, {
      page: "2",
      limit: "2",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.expenses).toHaveLength(2);
    const descriptions = res.body.data.expenses.map((e) => e.description);
    expect(descriptions).toEqual(["Expense 3", "Expense 2"]);
  });

  it("TEST 18: pagination metadata is correct", async () => {
    for (let i = 1; i <= 5; i++) {
      await createExpense(tokenA, group1.group_id, {
        description: `Meta ${i}`,
      });
      await delay(10);
    }

    const res = await listExpenses(tokenA, group1.group_id, {
      page: "2",
      limit: "2",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toEqual({
      page: 2,
      limit: 2,
      total: 5,
      total_pages: 3,
    });
  });

  it("TEST 19: results are ordered newest first", async () => {
    await seedGroup1Expenses();

    const res = await listExpenses(tokenA, group1.group_id);

    const descriptions = res.body.data.expenses.map((e) => e.description);
    expect(descriptions).toEqual(["Concert", "Dinner", "Groceries"]);
  });

  it("TEST 20: unauthenticated user receives 401", async () => {
    const res = await request(app).get(`/api/groups/${group1.group_id}/expenses`);

    expect(res.status).toBe(401);
  });

  it("TEST 21: non-member receives 403", async () => {
    await seedGroup1Expenses();

    const res = await listExpenses(tokenD, group1.group_id);

    expect(res.status).toBe(403);
  });

  it("TEST 22: non-existent group receives 404", async () => {
    const fakeGroupId = require("crypto").randomUUID();

    const res = await listExpenses(tokenA, fakeGroupId);

    expect(res.status).toBe(404);
  });

  it("TEST 23: cross-group expenses are never returned", async () => {
    await seedGroup1Expenses();
    await createExpense(tokenD, group2.group_id, {
      description: "Secret dinner",
      paid_by: userD.user_id,
    });

    const resFromA = await listExpenses(tokenA, group1.group_id);
    expect(resFromA.body.data.expenses.map((e) => e.description)).not.toContain("Secret dinner");

    const resFromD = await listExpenses(tokenD, group2.group_id);
    expect(resFromD.body.data.expenses).toHaveLength(1);
    expect(resFromD.body.data.expenses[0].description).toBe("Secret dinner");
  });

  it("TEST 24: payer_id belonging to another group cannot leak data", async () => {
    await seedGroup1Expenses();

    const res = await listExpenses(tokenA, group1.group_id, {
      payer_id: userD.user_id,
    });

    expect(res.status).toBe(400);
  });

  it("TEST 25: password_hash is never returned in payer or splits", async () => {
    await seedGroup1Expenses();

    const res = await listExpenses(tokenA, group1.group_id);

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("password_hash");
    expect(JSON.stringify(res.body)).not.toContain(userA.password_hash);
  });
});
