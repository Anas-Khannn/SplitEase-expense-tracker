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
// TEST 1: Authenticated group member creates valid payment (201)
// ============================================================
describe("POST /api/groups/:groupId/payments", () => {
  it("should create a payment and return 201 CREATED", async () => {
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
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        note: "Dinner settlement",
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.payment).toBeDefined();
    expect(res.body.data.payment.amount).toBe("30.00");
    expect(res.body.data.payment.note).toBe("Dinner settlement");
    expect(res.body.data.payment.payer.user_id).toBe(userB.user_id);
    expect(res.body.data.payment.receiver.user_id).toBe(userA.user_id);
  });
});

// ============================================================
// TEST 2: Unauthenticated user attempts payment (401)
// ============================================================
describe("Unauthenticated payment", () => {
  it("should return 401 without token", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(401);
  });
});

// ============================================================
// TEST 3: Non-member attempts payment (403)
// ============================================================
describe("Non-member payment creation", () => {
  it("should return 403 for non-member creating payment", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenD}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 4: Receiver is not a member of the group (403)
// ============================================================
describe("Non-member receiver", () => {
  it("should return 403 when receiver is not a group member", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userD.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 5: Payer and receiver are the same user (400)
// ============================================================
describe("Self-payment", () => {
  it("should return 400 when payer and receiver are the same user", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST 6: Amount is zero (400)
// ============================================================
describe("Zero amount", () => {
  it("should return 400 when amount is zero", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 0,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST 7: Negative amount (400)
// ============================================================
describe("Negative amount", () => {
  it("should return 400 when amount is negative", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: -30,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST 8: Non-existent group (404)
// ============================================================
describe("Non-existent group payment", () => {
  it("should return 404 for non-existent group", async () => {
    const fakeGroupId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app)
      .post(`/api/groups/${fakeGroupId}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(404);
  });
});

// ============================================================
// TEST 9: Valid settlement - balance goes to zero
// ============================================================
describe("Valid settlement", () => {
  it("should settle balance to zero after payment", async () => {
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

    let res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    let balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });
    expect(balancesMap[userA.user_id].balance).toBe(60);
    expect(balancesMap[userB.user_id].balance).toBe(-30);

    await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        note: "Dinner settlement",
        payment_date: "2026-08-20",
      });

    res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    expect(balancesMap[userA.user_id].balance).toBe(30);
    expect(balancesMap[userB.user_id].balance).toBe(0);
    expect(balancesMap[userB.user_id].status).toBe("SETTLED");
  });
});

// ============================================================
// TEST 10: Payment history returns the payment
// ============================================================
describe("GET /api/groups/:groupId/payments", () => {
  it("should return payment history", async () => {
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
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        note: "Dinner settlement",
        payment_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.payments).toHaveLength(1);
    expect(res.body.data.payments[0].amount).toBe("30.00");
  });
});

// ============================================================
// TEST 11: Payment appears with correct payer and receiver
// ============================================================
describe("Payment payer and receiver", () => {
  it("should show correct payer and receiver information", async () => {
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
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenA}`);

    const payment = res.body.data.payments[0];
    expect(payment.payer.user_id).toBe(userB.user_id);
    expect(payment.payer.name).toBe("Ali");
    expect(payment.receiver.user_id).toBe(userA.user_id);
    expect(payment.receiver.name).toBe("Anas");
  });
});

// ============================================================
// TEST 12: Payment from another group does not affect current group balance
// ============================================================
describe("Cross-group payment isolation", () => {
  it("should not include payments from other groups in balance", async () => {
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
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
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

    const balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    expect(balancesMap[userA.user_id].balance).toBe(30);
    expect(balancesMap[userB.user_id].balance).toBe(0);
  });
});

// ============================================================
// TEST 13: Payment failure rolls back transaction
// ============================================================
describe("Payment transaction rollback", () => {
  it("should rollback payment if creation fails", async () => {
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

    const originalCreate = Payment.create;
    let callCount = 0;

    Payment.create = async (...args) => {
      callCount++;
      if (callCount === 1) {
        throw new Error("Simulated payment creation failure");
      }
      return originalCreate.apply(Payment, args);
    };

    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(500);

    Payment.create = originalCreate;

    const payments = await Payment.findAll({
      where: { group_id: group1.group_id },
    });
    expect(payments).toHaveLength(0);
  });
});

// ============================================================
// TEST 14: Existing expense balance calculation still works
// ============================================================
describe("Expense balance regression", () => {
  it("should still calculate expense-only balances correctly", async () => {
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

    const balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    expect(balancesMap[userA.user_id].balance).toBe(60);
    expect(balancesMap[userB.user_id].balance).toBe(-30);
    expect(balancesMap[userC.user_id].balance).toBe(-30);
  });
});

// ============================================================
// TEST 15: Existing authentication still works
// ============================================================
describe("Auth endpoints regression", () => {
  it("should still support signup", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
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
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("anas@test.com");
  });
});

// ============================================================
// TEST 16: Existing group authorization still works
// ============================================================
describe("Group authorization regression", () => {
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
// TEST 17: Existing expense functionality still works
// ============================================================
describe("Expense functionality regression", () => {
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

// ============================================================
// TEST: Balance consistency - sum of all balances equals zero
// ============================================================
describe("Balance consistency after payments", () => {
  it("should have sum of all balances equal to zero after payments", async () => {
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
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    const totalBalance = res.body.data.balances.reduce(
      (sum, b) => sum + b.balance,
      0
    );
    expect(totalBalance).toBe(0);
  });

  it("should maintain zero sum after full settlement", async () => {
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
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenC}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    const totalBalance = res.body.data.balances.reduce(
      (sum, b) => sum + b.balance,
      0
    );
    expect(totalBalance).toBe(0);

    const balancesMap = {};
    res.body.data.balances.forEach((b) => {
      balancesMap[b.user_id] = b;
    });

    expect(balancesMap[userA.user_id].balance).toBe(0);
    expect(balancesMap[userA.user_id].status).toBe("SETTLED");
    expect(balancesMap[userB.user_id].balance).toBe(0);
    expect(balancesMap[userB.user_id].status).toBe("SETTLED");
    expect(balancesMap[userC.user_id].balance).toBe(0);
    expect(balancesMap[userC.user_id].status).toBe("SETTLED");
  });
});

// ============================================================
// TEST: Payment history requires authentication
// ============================================================
describe("Payment history auth", () => {
  it("should return 401 for unauthenticated payment history access", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/payments`);

    expect(res.status).toBe(401);
  });

  it("should return 403 for non-member payment history access", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenD}`);

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST: Payment direction validation
// ============================================================
describe("Payment direction validation", () => {
  it("should reject payment when payer has positive balance (is owed money)", async () => {
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
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        paid_to: userB.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST: Overpayment prevention - a payment cannot exceed the payer's
// outstanding (net) balance
// ============================================================
describe("Payment overpayment prevention", () => {
  // Creates a 90 expense on group1 paid by A and split 3 ways, giving B a net
  // balance of -30 (outstanding 30).
  const createOwingExpense = async () => {
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
  };

  it("should allow a partial payment up to the outstanding balance", async () => {
    await createOwingExpense();

    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 25,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(201);
  });

  it("should allow an exact payment equal to the outstanding balance", async () => {
    await createOwingExpense();

    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(201);
  });

  it("should reject a payment exceeding the outstanding balance (overpayment)", async () => {
    await createOwingExpense();

    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30.01,
        payment_date: "2026-08-20",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(
      "Payment amount cannot exceed your outstanding balance"
    );
  });

  it("should not create a Payment record when overpayment is rejected", async () => {
    await createOwingExpense();

    await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30.01,
        payment_date: "2026-08-20",
      });

    const payments = await Payment.findAll({
      where: { group_id: group1.group_id },
    });
    expect(payments).toHaveLength(0);
  });

  it("should not create a PAYMENT_CREATED activity-log entry on overpayment", async () => {
    await createOwingExpense();

    await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30.01,
        payment_date: "2026-08-20",
      });

    const logs = await ActivityLog.findAll({
      where: { group_id: group1.group_id },
    });
    const paymentLogs = logs.filter(
      (log) => log.action === "PAYMENT_CREATED"
    );
    expect(paymentLogs).toHaveLength(0);
  });
});
