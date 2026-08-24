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
let tokenA, tokenB, tokenC, tokenD;

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
  await Payment.destroy({ where: {} });
  await Expense.destroy({ where: {} });
  await GroupMember.destroy({ where: {} });
  await Group.destroy({ where: {} });
});

// ============================================================
// Helpers
// ============================================================
const getDashboard = async (token) =>
  request(app)
    .get("/api/dashboard/summary")
    .set("Authorization", `Bearer ${token}`);

const createGroup = async (token, name) => {
  const res = await request(app)
    .post("/api/groups")
    .set("Authorization", `Bearer ${token}`)
    .send({ name });
  return res.body.data.group;
};

const addMember = async (token, groupId, userId) =>
  request(app)
    .post(`/api/groups/${groupId}/members`)
    .set("Authorization", `Bearer ${token}`)
    .send({ user_id: userId });

const createExpense = async (
  token,
  groupId,
  { amount, description = "Test expense", paid_by, participant_ids }
) =>
  request(app)
    .post(`/api/groups/${groupId}/expenses`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount,
      description,
      paid_by,
      participant_ids,
      expense_date: "2026-08-20",
    });

const createPayment = async (
  token,
  groupId,
  { paid_to, amount, note }
) =>
  request(app)
    .post(`/api/groups/${groupId}/payments`)
    .set("Authorization", `Bearer ${token}`)
    .send({ paid_to, amount, note, payment_date: "2026-08-21" });

const findGroupEntry = (res, groupId) =>
  res.body.data.groups.find((g) => g.group_id === groupId);

// Builds the PRD reference scenario for userA:
//   Apartment 4B -> A is owed  +2500 (expense 5000 paid by A, split A/B)
//   Tokyo Trip   -> A is owed  +4000 (expense 8000 paid by A, split A/C)
//   Camping      -> A owes     -1000 (expense 2000 paid by C, split A/C)
const seedPrdScenario = async () => {
  const apartment = await createGroup(tokenA, "Apartment 4B");
  const trip = await createGroup(tokenA, "Tokyo Trip");
  const camping = await createGroup(tokenA, "Camping");

  await addMember(tokenA, apartment.group_id, userB.user_id);
  await addMember(tokenA, trip.group_id, userC.user_id);
  await addMember(tokenA, camping.group_id, userC.user_id);

  await createExpense(tokenA, apartment.group_id, {
    amount: 5000,
    description: "Rent",
    paid_by: userA.user_id,
    participant_ids: [userA.user_id, userB.user_id],
  });

  await createExpense(tokenA, trip.group_id, {
    amount: 8000,
    description: "Flights",
    paid_by: userA.user_id,
    participant_ids: [userA.user_id, userC.user_id],
  });

  await createExpense(tokenC, camping.group_id, {
    amount: 2000,
    description: "Tent",
    paid_by: userC.user_id,
    participant_ids: [userA.user_id, userC.user_id],
  });

  return { apartment, trip, camping };
};

// ============================================================
// TESTS 1-2: Access control
// ============================================================
describe("GET /api/dashboard/summary - access", () => {
  it("TEST 1: authenticated user can retrieve dashboard (200)", async () => {
    const res = await getDashboard(tokenA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("total_owed");
    expect(res.body.data).toHaveProperty("total_owe");
    expect(res.body.data).toHaveProperty("net_balance");
    expect(res.body.data).toHaveProperty("groups");
  });

  it("TEST 2: unauthenticated user receives 401", async () => {
    const res = await request(app).get("/api/dashboard/summary");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================
// TESTS 3-12: Cross-group aggregation correctness
// ============================================================
describe("GET /api/dashboard/summary - aggregation", () => {
  it("TEST 3: user with one group receives its correct balance", async () => {
    const group = await createGroup(tokenA, "Solo Flat");
    await addMember(tokenA, group.group_id, userB.user_id);

    await createExpense(tokenA, group.group_id, {
      amount: 90,
      description: "Dinner",
      paid_by: userA.user_id,
      participant_ids: [userA.user_id, userB.user_id],
    });

    const res = await getDashboard(tokenA);

    expect(res.status).toBe(200);
    expect(res.body.data.groups).toHaveLength(1);
    expect(findGroupEntry(res, group.group_id)).toEqual({
      group_id: group.group_id,
      group_name: "Solo Flat",
      icon: null,
      balance: 45,
    });
  });

  it("TEST 4: user with multiple groups receives all and only their groups", async () => {
    const { apartment } = await seedPrdScenario();

    const resAnas = await getDashboard(tokenA);
    expect(resAnas.body.data.groups).toHaveLength(3);
    expect(resAnas.body.data.groups.map((g) => g.group_name).sort()).toEqual([
      "Apartment 4B",
      "Camping",
      "Tokyo Trip",
    ]);

    const resAli = await getDashboard(tokenB);
    expect(resAli.body.data.groups).toHaveLength(1);
    expect(resAli.body.data.groups[0].group_id).toBe(apartment.group_id);
  });

  it("TEST 5: correct total_owed across groups", async () => {
    await seedPrdScenario();

    const res = await getDashboard(tokenA);

    expect(res.body.data.total_owed).toBe(6500);
  });

  it("TEST 6: correct total_owe across groups", async () => {
    const { apartment } = await seedPrdScenario();

    const resAnas = await getDashboard(tokenA);
    expect(resAnas.body.data.total_owe).toBe(1000);

    const resAli = await getDashboard(tokenB);
    expect(resAli.body.data.total_owe).toBe(2500);
    expect(findGroupEntry(resAli, apartment.group_id).balance).toBe(-2500);
  });

  it("TEST 7: correct net_balance across groups", async () => {
    await seedPrdScenario();

    const resAnas = await getDashboard(tokenA);
    expect(resAnas.body.data.net_balance).toBe(5500);

    const resAhmed = await getDashboard(tokenC);
    expect(resAhmed.body.data.net_balance).toBe(-3000);
  });

  it("TEST 8: positive group balances are classified as owed", async () => {
    const { apartment } = await seedPrdScenario();

    const res = await getDashboard(tokenA);

    const entry = findGroupEntry(res, apartment.group_id);
    expect(entry.balance).toBe(2500);
    expect(res.body.data.total_owed).toBe(2500 + 4000);
    expect(res.body.data.total_owe).toBe(1000);
  });

  it("TEST 9: negative group balances are classified as owed-to-others", async () => {
    const { camping } = await seedPrdScenario();

    const res = await getDashboard(tokenA);

    expect(findGroupEntry(res, camping.group_id).balance).toBe(-1000);
    expect(res.body.data.total_owe).toBe(1000);
    expect(res.body.data.total_owed).toBe(6500);
  });

  it("TEST 10: multiple positive balances aggregate correctly", async () => {
    await seedPrdScenario();

    const res = await getDashboard(tokenA);

    const positiveGroups = res.body.data.groups.filter((g) => g.balance > 0);
    expect(positiveGroups).toHaveLength(2);
    expect(
      positiveGroups.reduce((sum, g) => sum + g.balance, 0)
    ).toBe(6500);
    expect(res.body.data.total_owed).toBe(6500);
  });

  it("TEST 11: multiple negative balances aggregate correctly", async () => {
    const { movies } = await seedExtraNegativeGroup();

    const res = await getDashboard(tokenA);

    const negativeGroups = res.body.data.groups.filter((g) => g.balance < 0);
    expect(negativeGroups).toHaveLength(2);
    expect(negativeGroups.map((g) => g.group_id)).toContain(
      movies.group_id
    );
    expect(res.body.data.total_owe).toBe(1250);
  });

  it("TEST 12: positive and negative balances produce correct net balance", async () => {
    await seedExtraNegativeGroup();

    const res = await getDashboard(tokenA);

    expect(res.body.data.total_owed).toBe(6500);
    expect(res.body.data.total_owe).toBe(1250);
    expect(res.body.data.net_balance).toBe(5250);
    expect(
      res.body.data.net_balance -
        (res.body.data.total_owed - res.body.data.total_owe)
    ).toBe(0);
  });
});

// Adds a fourth group ("Movies") on top of the PRD scenario where
// userA additionally owes -250 (expense 500 paid by B, split A/B).
const seedExtraNegativeGroup = async () => {
  await seedPrdScenario();

  const movies = await createGroup(tokenA, "Movies");
  await addMember(tokenA, movies.group_id, userB.user_id);

  await createExpense(tokenB, movies.group_id, {
    amount: 500,
    description: "Tickets",
    paid_by: userB.user_id,
    participant_ids: [userA.user_id, userB.user_id],
  });

  return { movies };
};

// ============================================================
// TEST 13: User with no groups
// ============================================================
describe("GET /api/dashboard/summary - empty dashboard", () => {
  it("TEST 13: user with no groups receives zeroed empty dashboard", async () => {
    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Lone Wolf", email: "lonewolf@test.com", password: "Test1234!" });

    const res = await getDashboard(signupRes.body.data.token);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      total_owed: 0,
      total_owe: 0,
      net_balance: 0,
      groups: [],
    });
  });
});

// ============================================================
// TESTS 14-15: Data isolation
// ============================================================
describe("GET /api/dashboard/summary - isolation", () => {
  it("TEST 14: another user's groups are never included", async () => {
    await seedPrdScenario();

    const dianaGroup = await createGroup(tokenD, "Diana Secret Squad");
    await createExpense(tokenD, dianaGroup.group_id, {
      amount: 300,
      description: "Private lunch",
      paid_by: userD.user_id,
      participant_ids: [userD.user_id],
    });

    const resAnas = await getDashboard(tokenA);
    expect(findGroupEntry(resAnas, dianaGroup.group_id)).toBeUndefined();
    expect(resAnas.body.data.groups).toHaveLength(3);

    const resDiana = await getDashboard(tokenD);
    expect(resDiana.body.data.groups).toHaveLength(1);
    expect(resDiana.body.data.groups[0].group_name).toBe(
      "Diana Secret Squad"
    );
  });

  it("TEST 15: another group's financial data cannot leak into the dashboard", async () => {
    await seedPrdScenario();

    const before = await getDashboard(tokenA);
    expect(before.body.data.total_owed).toBe(6500);
    expect(before.body.data.net_balance).toBe(5500);

    const dianaGroup = await createGroup(tokenD, "Leak Attempt");
    await createExpense(tokenD, dianaGroup.group_id, {
      amount: 99999,
      description: "Should not leak",
      paid_by: userD.user_id,
      participant_ids: [userD.user_id],
    });

    const after = await getDashboard(tokenA);
    expect(after.body.data.total_owed).toBe(6500);
    expect(after.body.data.total_owe).toBe(1000);
    expect(after.body.data.net_balance).toBe(5500);
    expect(after.body.data.groups).toHaveLength(3);
  });
});

// ============================================================
// TESTS 16-19: Dashboard reacts to financial mutations
// ============================================================
describe("GET /api/dashboard/summary - reactivity", () => {
  let group;

  beforeEach(async () => {
    group = await createGroup(tokenA, "Reactive Group");
    await addMember(tokenA, group.group_id, userB.user_id);
  });

  it("TEST 16: adding an expense changes the dashboard", async () => {
    const before = await getDashboard(tokenA);
    expect(before.body.data.total_owed).toBe(0);

    await createExpense(tokenA, group.group_id, {
      amount: 90,
      description: "Dinner",
      paid_by: userA.user_id,
      participant_ids: [userA.user_id, userB.user_id],
    });

    const after = await getDashboard(tokenA);
    expect(after.body.data.total_owed).toBe(45);
    expect(findGroupEntry(after, group.group_id).balance).toBe(45);
  });

  it("TEST 17: editing an expense changes the dashboard", async () => {
    const createRes = await createExpense(tokenA, group.group_id, {
      amount: 90,
      description: "Dinner",
      paid_by: userA.user_id,
      participant_ids: [userA.user_id, userB.user_id],
    });
    const expenseId = createRes.body.data.expense.expense_id;

    const before = await getDashboard(tokenA);
    expect(before.body.data.total_owed).toBe(45);

    await request(app)
      .put(`/api/groups/${group.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ amount: 180 });

    const after = await getDashboard(tokenA);
    expect(after.body.data.total_owed).toBe(90);
    expect(findGroupEntry(after, group.group_id).balance).toBe(90);
  });

  it("TEST 18: deleting an expense changes the dashboard", async () => {
    const createRes = await createExpense(tokenA, group.group_id, {
      amount: 90,
      description: "Dinner",
      paid_by: userA.user_id,
      participant_ids: [userA.user_id, userB.user_id],
    });
    const expenseId = createRes.body.data.expense.expense_id;

    const before = await getDashboard(tokenA);
    expect(before.body.data.total_owed).toBe(45);

    await request(app)
      .delete(`/api/groups/${group.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    const after = await getDashboard(tokenA);
    expect(after.body.data.total_owed).toBe(0);
    expect(findGroupEntry(after, group.group_id).balance).toBe(0);
  });

  it("TEST 19: recording a payment changes the dashboard", async () => {
    await createExpense(tokenA, group.group_id, {
      amount: 100,
      description: "Groceries",
      paid_by: userA.user_id,
      participant_ids: [userA.user_id, userB.user_id],
    });

    const beforeA = await getDashboard(tokenA);
    const beforeB = await getDashboard(tokenB);
    expect(findGroupEntry(beforeA, group.group_id).balance).toBe(50);
    expect(findGroupEntry(beforeB, group.group_id).balance).toBe(-50);

    const payRes = await createPayment(tokenB, group.group_id, {
      paid_to: userA.user_id,
      amount: 30,
      note: "partial settle",
    });
    expect(payRes.status).toBe(201);

    const afterA = await getDashboard(tokenA);
    const afterB = await getDashboard(tokenB);
    expect(findGroupEntry(afterA, group.group_id).balance).toBe(20);
    expect(findGroupEntry(afterB, group.group_id).balance).toBe(-20);
    expect(afterA.body.data.total_owed).toBe(20);
    expect(afterB.body.data.total_owe).toBe(20);
  });
});

// ============================================================
// TEST 26: Sensitive data never leaks
// ============================================================
describe("GET /api/dashboard/summary - sensitive data", () => {
  it("TEST 26: password_hash never appears anywhere in the response", async () => {
    await seedPrdScenario();

    const res = await getDashboard(tokenA);

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("password_hash");
    expect(JSON.stringify(res.body)).not.toContain(userA.password_hash);
    expect(JSON.stringify(res.body)).not.toContain(userB.password_hash);
  });
});
