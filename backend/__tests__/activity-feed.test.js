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
// TEST 1: Group creation creates GROUP_CREATED activity
// ============================================================
describe("GROUP_CREATED activity", () => {
  it("should create a GROUP_CREATED activity when a group is created", async () => {
    const activities = await ActivityLog.findAll({
      where: { group_id: group1.group_id, action: "GROUP_CREATED" },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0].user_id).toBe(userA.user_id);
    expect(activities[0].description).toContain("created the group");
  });
});

// ============================================================
// TEST 2: Member addition creates MEMBER_ADDED activity
// ============================================================
describe("MEMBER_ADDED activity", () => {
  it("should create MEMBER_ADDED activities when members are added", async () => {
    const activities = await ActivityLog.findAll({
      where: { group_id: group1.group_id, action: "MEMBER_ADDED" },
    });
    expect(activities).toHaveLength(2);
  });
});

// ============================================================
// TEST 3: Member removal creates MEMBER_REMOVED activity
// ============================================================
describe("MEMBER_REMOVED activity", () => {
  it("should create a MEMBER_REMOVED activity when a member is removed", async () => {
    await request(app)
      .delete(`/api/groups/${group1.group_id}/members/${userC.user_id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    const activities = await ActivityLog.findAll({
      where: { group_id: group1.group_id, action: "MEMBER_REMOVED" },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0].user_id).toBe(userA.user_id);
    expect(activities[0].description).toContain("removed");
  });
});

// ============================================================
// TEST 4: Expense creation creates EXPENSE_CREATED activity
// ============================================================
describe("EXPENSE_CREATED activity", () => {
  it("should create an EXPENSE_CREATED activity when an expense is created", async () => {
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

    const activities = await ActivityLog.findAll({
      where: { group_id: group1.group_id, action: "EXPENSE_CREATED" },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0].user_id).toBe(userA.user_id);
    expect(activities[0].description).toContain("Dinner");
    expect(activities[0].description).toContain("90");
  });
});

// ============================================================
// TEST 5: Expense update creates EXPENSE_UPDATED activity
// ============================================================
describe("EXPENSE_UPDATED activity", () => {
  it("should create an EXPENSE_UPDATED activity when an expense is updated", async () => {
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

    await request(app)
      .put(`/api/groups/${group1.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 100,
        description: "Updated Dinner",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id, userB.user_id, userC.user_id],
        expense_date: "2026-08-20",
      });

    const activities = await ActivityLog.findAll({
      where: { group_id: group1.group_id, action: "EXPENSE_UPDATED" },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0].user_id).toBe(userA.user_id);
    expect(activities[0].description).toContain("Updated Dinner");
  });
});

// ============================================================
// TEST 6: Expense deletion creates EXPENSE_DELETED activity
// ============================================================
describe("EXPENSE_DELETED activity", () => {
  it("should create an EXPENSE_DELETED activity when an expense is deleted", async () => {
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

    await request(app)
      .delete(`/api/groups/${group1.group_id}/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    const activities = await ActivityLog.findAll({
      where: { group_id: group1.group_id, action: "EXPENSE_DELETED" },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0].user_id).toBe(userA.user_id);
    expect(activities[0].description).toContain("Dinner");
  });
});

// ============================================================
// TEST 7: Payment creation creates PAYMENT_CREATED activity
// ============================================================
describe("PAYMENT_CREATED activity", () => {
  it("should create a PAYMENT_CREATED activity when a payment is created", async () => {
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

    const activities = await ActivityLog.findAll({
      where: { group_id: group1.group_id, action: "PAYMENT_CREATED" },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0].user_id).toBe(userB.user_id);
    expect(activities[0].description).toContain("paid");
    expect(activities[0].description).toContain("30");
  });
});

// ============================================================
// TEST 8: Failed expense creation does not create activity
// ============================================================
describe("Transaction consistency - expense", () => {
  it("should not create activity when expense creation fails", async () => {
    const originalBulkCreate = ExpenseSplit.bulkCreate;
    ExpenseSplit.bulkCreate = async () => {
      throw new Error("Simulated split creation failure");
    };

    try {
      const res = await request(app)
        .post(`/api/groups/${group1.group_id}/expenses`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          amount: 90,
          description: "Dinner",
          paid_by: userA.user_id,
          participant_ids: [userA.user_id, userB.user_id, userC.user_id],
          expense_date: "2026-08-20",
        });
      expect(res.status).toBe(500);
    } finally {
      ExpenseSplit.bulkCreate = originalBulkCreate;
    }

    const activities = await ActivityLog.findAll({
      where: { group_id: group1.group_id, action: "EXPENSE_CREATED" },
    });
    expect(activities).toHaveLength(0);
  });
});

// ============================================================
// TEST 9: Failed payment transaction does not create activity
// ============================================================
describe("Transaction consistency - payment", () => {
  it("should not create activity when payment creation fails", async () => {
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
    Payment.create = async () => {
      throw new Error("Simulated payment creation failure");
    };

    try {
      const res = await request(app)
        .post(`/api/groups/${group1.group_id}/payments`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({
          paid_to: userA.user_id,
          amount: 30,
          payment_date: "2026-08-20",
        });
      expect(res.status).toBe(500);
    } finally {
      Payment.create = originalCreate;
    }

    const activities = await ActivityLog.findAll({
      where: { group_id: group1.group_id, action: "PAYMENT_CREATED" },
    });
    expect(activities).toHaveLength(0);
  });
});

// ============================================================
// TEST 10: Group member can retrieve activity
// ============================================================
describe("Activity retrieval authorization", () => {
  it("should allow group admin to retrieve activity", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/activity`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.activities).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
  });

  it("should allow group member to retrieve activity", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/activity`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ============================================================
// TEST 11: Non-member cannot retrieve activity
// ============================================================
describe("Non-member activity access", () => {
  it("should return 403 for non-member", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/activity`)
      .set("Authorization", `Bearer ${tokenD}`);

    expect(res.status).toBe(403);
  });
});

// ============================================================
// TEST 12: Unauthenticated request
// ============================================================
describe("Unauthenticated activity access", () => {
  it("should return 401 without token", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/activity`);

    expect(res.status).toBe(401);
  });
});

// ============================================================
// TEST 13: Non-existent group
// ============================================================
describe("Non-existent group activity", () => {
  it("should return 404 for non-existent group", async () => {
    const fakeGroupId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app)
      .get(`/api/groups/${fakeGroupId}/activity`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
  });
});

// ============================================================
// TEST 14: Activities are ordered newest first
// ============================================================
describe("Activity ordering", () => {
  it("should return activities in reverse chronological order", async () => {
    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 10,
        description: "First",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id],
        expense_date: "2026-08-20",
      });

    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 20,
        description: "Second",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id],
        expense_date: "2026-08-20",
      });

    await request(app)
      .post(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: 30,
        description: "Third",
        paid_by: userA.user_id,
        participant_ids: [userA.user_id],
        expense_date: "2026-08-20",
      });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/activity`)
      .set("Authorization", `Bearer ${tokenA}`);

    const expenseActivities = res.body.data.activities.filter(
      (a) => a.action === "EXPENSE_CREATED"
    );
    expect(expenseActivities).toHaveLength(3);
    expect(expenseActivities[0].description).toContain("Third");
    expect(expenseActivities[1].description).toContain("Second");
    expect(expenseActivities[2].description).toContain("First");
  });
});

// ============================================================
// TEST 15: Pagination works
// ============================================================
describe("Pagination", () => {
  it("should return paginated results", async () => {
    const activities = [];
    for (let i = 0; i < 25; i++) {
      activities.push({
        group_id: group1.group_id,
        user_id: userA.user_id,
        action: "EXPENSE_CREATED",
        description: `Activity ${i}`,
      });
    }
    await ActivityLog.bulkCreate(activities);

    const totalBefore = await ActivityLog.count({
      where: { group_id: group1.group_id },
    });

    const res1 = await request(app)
      .get(`/api/groups/${group1.group_id}/activity?page=1&limit=20`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res1.body.data.activities).toHaveLength(20);
    expect(res1.body.data.pagination.page).toBe(1);
    expect(res1.body.data.pagination.total).toBe(totalBefore);
    expect(res1.body.data.pagination.total_pages).toBe(
      Math.ceil(totalBefore / 20)
    );

    const res2 = await request(app)
      .get(`/api/groups/${group1.group_id}/activity?page=2&limit=20`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res2.body.data.activities).toHaveLength(totalBefore - 20);
    expect(res2.body.data.pagination.page).toBe(2);
  });
});

// ============================================================
// TEST 16: Default pagination values work
// ============================================================
describe("Default pagination", () => {
  it("should use default page=1 and limit=20", async () => {
    const activities = [];
    for (let i = 0; i < 25; i++) {
      activities.push({
        group_id: group1.group_id,
        user_id: userA.user_id,
        action: "EXPENSE_CREATED",
        description: `Activity ${i}`,
      });
    }
    await ActivityLog.bulkCreate(activities);

    const totalBefore = await ActivityLog.count({
      where: { group_id: group1.group_id },
    });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/activity`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.body.data.activities).toHaveLength(
      Math.min(20, totalBefore)
    );
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(20);
  });
});

// ============================================================
// TEST 17: Maximum page size is enforced
// ============================================================
describe("Maximum page size", () => {
  it("should cap limit at 100", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/activity?limit=200`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.body.data.pagination.limit).toBe(100);
  });
});

// ============================================================
// TEST 18: Activities from another group are never returned
// ============================================================
describe("Cross-group isolation", () => {
  it("should not include activities from other groups", async () => {
    await ActivityLog.create({
      group_id: group2.group_id,
      user_id: userD.user_id,
      action: "EXPENSE_CREATED",
      description: "Group 2 Activity",
    });

    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/activity`)
      .set("Authorization", `Bearer ${tokenA}`);

    const group2Activities = res.body.data.activities.filter(
      (a) => a.description === "Group 2 Activity"
    );
    expect(group2Activities).toHaveLength(0);
  });
});

// ============================================================
// TEST 19: Sensitive user information is never returned
// ============================================================
describe("Security", () => {
  it("should not return password_hash in activity response", async () => {
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
      .get(`/api/groups/${group1.group_id}/activity`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.body.data.activities.length).toBeGreaterThan(0);
    res.body.data.activities.forEach((activity) => {
      expect(activity.user.password_hash).toBeUndefined();
    });
  });
});

// ============================================================
// TEST 20: Existing authentication still works
// ============================================================
describe("Auth regression", () => {
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

  it("should still support getting group details", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.data.group.name).toBe("Test Group 1");
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

  it("should still support getting expenses", async () => {
    const res = await request(app)
      .get(`/api/groups/${group1.group_id}/expenses`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.expenses)).toBe(true);
  });
});

// ============================================================
// TEST 23: Existing balance calculation still works
// ============================================================
describe("Balance regression", () => {
  it("should still calculate balances correctly", async () => {
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
    expect(res.body.data.balances).toBeDefined();
  });
});

// ============================================================
// TEST 24: Existing payment functionality still works
// ============================================================
describe("Payment regression", () => {
  it("should still support payment creation", async () => {
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
        payment_date: "2026-08-20",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.payment).toBeDefined();
  });
});
