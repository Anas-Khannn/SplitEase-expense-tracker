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
let tokenA, tokenB, tokenD;
let group1;
let expense1;

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

  await request(app)
    .post("/api/groups")
    .set("Authorization", `Bearer ${tokenD}`)
    .send({ name: "Test Group 2" });

  const expenseRes = await request(app)
    .post(`/api/groups/${group1.group_id}/expenses`)
    .set("Authorization", `Bearer ${tokenA}`)
    .send({
      amount: 90,
      description: "Dinner",
      paid_by: userA.user_id,
      participant_ids: [userA.user_id, userB.user_id, userC.user_id],
      expense_date: "2026-08-20",
    });
  expense1 = expenseRes.body.data.expense;
});

// ============================================================
// TEST 1: Authenticated group member can create reaction
// ============================================================
describe("POST /api/expenses/:expenseId/reactions", () => {
  it("should create a reaction and return 201 CREATED", async () => {
    const res = await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "👍" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reaction.reaction).toBe("👍");
    expect(res.body.data.reaction.user.user_id).toBe(userA.user_id);
  });

  it("should update existing reaction and return 200 OK", async () => {
    await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "👍" });

    const res = await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "😂" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reaction.reaction).toBe("😂");
  });
});

// ============================================================
// TEST 2: Authenticated group member can retrieve reactions
// ============================================================
describe("GET /api/expenses/:expenseId/reactions", () => {
  it("should return reactions and 200 OK", async () => {
    await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "👍" });

    await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ reaction: "😂" });

    const res = await request(app)
      .get(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reactions).toHaveLength(2);
  });
});

// ============================================================
// TEST 3: Authenticated group member can delete their own reaction
// ============================================================
describe("DELETE /api/expenses/:expenseId/reactions", () => {
  it("should delete own reaction and return 200 OK", async () => {
    await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "👍" });

    const res = await request(app)
      .delete(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ============================================================
// TEST 4: Unauthenticated user cannot create reaction
// ============================================================
describe("Unauthenticated reaction creation", () => {
  it("should return 401 without token", async () => {
    const res = await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .send({ reaction: "👍" });

    expect(res.status).toBe(401);
  });
});

// ============================================================
// TEST 5: Unauthenticated user cannot retrieve reactions
// ============================================================
describe("Unauthenticated reaction retrieval", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get(`/api/expenses/${expense1.expense_id}/reactions`);

    expect(res.status).toBe(401);
  });
});

// ============================================================
// TEST 6: Unauthenticated user cannot delete reaction
// ============================================================
describe("Unauthenticated reaction deletion", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).delete(`/api/expenses/${expense1.expense_id}/reactions`);

    expect(res.status).toBe(401);
  });
});

// ============================================================
// TEST 7: Non-member cannot create reaction
// ============================================================
describe("Non-member reaction creation", () => {
  it("should return 403 for non-member", async () => {
    const res = await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenD}`)
      .send({ reaction: "👍" });

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 8: Non-member cannot retrieve reactions
// ============================================================
describe("Non-member reaction retrieval", () => {
  it("should return 403 for non-member", async () => {
    const res = await request(app)
      .get(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenD}`);

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 9: Non-member cannot delete reaction
// ============================================================
describe("Non-member reaction deletion", () => {
  it("should return 403 for non-member", async () => {
    const res = await request(app)
      .delete(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenD}`);

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 10: Non-existent expense
// ============================================================
describe("Non-existent expense reaction", () => {
  it("should return 404 for non-existent expense", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app)
      .post(`/api/expenses/${fakeId}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "👍" });

    expect(res.status).toBe(404);
  });
});

// ============================================================
// TEST 11: Invalid reaction value
// ============================================================
describe("Invalid reaction value", () => {
  it("should return 400 for invalid reaction", async () => {
    const res = await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "🚀" });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST 12: Empty reaction
// ============================================================
describe("Empty reaction", () => {
  it("should return 400 for empty reaction", async () => {
    const res = await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "" });

    expect(res.status).toBe(400);
  });
});

// ============================================================
// TEST 13: Same user reacts twice - only one DB row
// ============================================================
describe("Duplicate reaction prevention", () => {
  it("should only have one reaction row when user reacts twice", async () => {
    await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "👍" });

    await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "😂" });

    const count = await ExpenseReaction.count({
      where: {
        expense_id: expense1.expense_id,
        user_id: userA.user_id,
      },
    });
    expect(count).toBe(1);

    const reaction = await ExpenseReaction.findOne({
      where: {
        expense_id: expense1.expense_id,
        user_id: userA.user_id,
      },
    });
    expect(reaction.reaction).toBe("😂");
  });
});

// ============================================================
// TEST 14: Existing reaction is updated when user changes
// ============================================================
describe("Reaction update", () => {
  it("should update the reaction value", async () => {
    await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "👍" });

    const res = await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "❤️" });

    expect(res.status).toBe(200);
    expect(res.body.data.reaction.reaction).toBe("❤️");

    const dbReaction = await ExpenseReaction.findOne({
      where: {
        expense_id: expense1.expense_id,
        user_id: userA.user_id,
      },
    });
    expect(dbReaction.reaction).toBe("❤️");
  });
});

// ============================================================
// TEST 15: User cannot delete another user's reaction
// ============================================================
describe("Cross-user deletion", () => {
  it("should return 404 when trying to delete another user's reaction", async () => {
    await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ reaction: "👍" });

    const res = await request(app)
      .delete(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);

    const reaction = await ExpenseReaction.findOne({
      where: {
        expense_id: expense1.expense_id,
        user_id: userB.user_id,
      },
    });
    expect(reaction).not.toBeNull();
  });
});

// ============================================================
// TEST 16: Reactions include user name
// ============================================================
describe("Reaction user info", () => {
  it("should include user name in reaction response", async () => {
    await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "👍" });

    const res = await request(app)
      .get(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.body.data.reactions[0].user.name).toBe("Anas");
    expect(res.body.data.reactions[0].user.user_id).toBe(userA.user_id);
  });
});

// ============================================================
// TEST 17: password_hash is never returned
// ============================================================
describe("Security - no password hash", () => {
  it("should not return password_hash in reaction response", async () => {
    await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "👍" });

    const res = await request(app)
      .get(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`);

    res.body.data.reactions.forEach((r) => {
      expect(r.user.password_hash).toBeUndefined();
    });
  });
});

// ============================================================
// TEST 18: User from another group cannot access reactions
// ============================================================
describe("Cross-group access", () => {
  it("should return 403 for user from another group", async () => {
    const res = await request(app)
      .get(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenD}`);

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 19: Reactions for Expense A do not appear on Expense B
// ============================================================
describe("Expense isolation", () => {
  it("should not mix reactions between different expenses", async () => {
    const expense2Res = await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 50,
        description: "Coffee",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id],
        expense_date: "2026-08-20",
      });
    const expense2 = expense2Res.body.data.expense;

    await request(app)
      .post(`/api/expenses/${expense1.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reaction: "👍" });

    const res = await request(app)
      .get(`/api/expenses/${expense2.expense_id}/reactions`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.body.data.reactions).toHaveLength(0);
  });
});

// ============================================================
// TEST 20: Existing authentication still works
// ============================================================
describe("Auth regression", () => {
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
});

// ============================================================
// TEST 21: Existing group functionality still works
// ============================================================
describe("Group regression", () => {
  it("should still support group creation", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Regression Group" });
    expect(res.status).toBe(201);
    expect(res.body.data.group.name).toBe("Regression Group");
  });
});

// ============================================================
// TEST 22: Existing expense functionality still works
// ============================================================
describe("Expense regression", () => {
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
});

// ============================================================
// TEST 23: Existing balance calculation still works
// ============================================================
describe("Balance regression", () => {
  it("should still calculate balances correctly", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/balances`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.data.balances).toBeDefined();
  });
});

// ============================================================
// TEST 24: Existing payment functionality still works
// ============================================================
describe("Payment regression", () => {
  it("should still support payment creation", async () => {
    const res = await request(app)
      .post(`/api/groups/${group1.group_id}/payments`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        paid_to: userA.user_id,
        amount: 30,
        payment_date: "2026-08-20",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.payment).toBeDefined();
  });
});

// ============================================================
// TEST 25: Existing activity feed still works
// ============================================================
describe("Activity feed regression", () => {
  it("should still return activity feed", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/activity`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.data.activities).toBeDefined();
  });
});
