const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const User = require("./User")(sequelize, DataTypes);
const Group = require("./Group")(sequelize, DataTypes);
const GroupMember = require("./GroupMember")(sequelize, DataTypes);
const Expense = require("./Expense")(sequelize, DataTypes);
const ExpenseSplit = require("./ExpenseSplit")(sequelize, DataTypes);
const Payment = require("./Payment")(sequelize, DataTypes);
const ExpenseReaction = require("./ExpenseReaction")(sequelize, DataTypes);
const ActivityLog = require("./ActivityLog")(sequelize, DataTypes);

// =====================================================
// ONE-TO-MANY RELATIONSHIPS
// =====================================================

// User → Group (creator)
User.hasMany(Group, { foreignKey: "created_by", as: "createdGroups" });
Group.belongsTo(User, { foreignKey: "created_by", as: "creator" });

// User ↔ GroupMember
User.hasMany(GroupMember, { foreignKey: "user_id", as: "groupMemberships" });
GroupMember.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Group ↔ GroupMember
Group.hasMany(GroupMember, { foreignKey: "group_id", as: "members" });
GroupMember.belongsTo(Group, { foreignKey: "group_id", as: "group" });

// Group → Expense
Group.hasMany(Expense, { foreignKey: "group_id", as: "expenses" });
Expense.belongsTo(Group, { foreignKey: "group_id", as: "group" });

// User → Expense (payer)
User.hasMany(Expense, { foreignKey: "paid_by", as: "paidExpenses" });
Expense.belongsTo(User, { foreignKey: "paid_by", as: "payer" });

// Expense ↔ ExpenseSplit
Expense.hasMany(ExpenseSplit, { foreignKey: "expense_id", as: "splits" });
ExpenseSplit.belongsTo(Expense, { foreignKey: "expense_id", as: "expense" });

// User ↔ ExpenseSplit
User.hasMany(ExpenseSplit, { foreignKey: "user_id", as: "expenseSplits" });
ExpenseSplit.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Group → Payment
Group.hasMany(Payment, { foreignKey: "group_id", as: "payments" });
Payment.belongsTo(Group, { foreignKey: "group_id", as: "group" });

// User → Payment (payer)
User.hasMany(Payment, { foreignKey: "paid_by", as: "sentPayments" });
Payment.belongsTo(User, { foreignKey: "paid_by", as: "payer" });

// User → Payment (receiver)
User.hasMany(Payment, { foreignKey: "paid_to", as: "receivedPayments" });
Payment.belongsTo(User, { foreignKey: "paid_to", as: "receiver" });

// Expense ↔ ExpenseReaction
Expense.hasMany(ExpenseReaction, { foreignKey: "expense_id", as: "reactions" });
ExpenseReaction.belongsTo(Expense, { foreignKey: "expense_id", as: "expense" });

// User ↔ ExpenseReaction
User.hasMany(ExpenseReaction, { foreignKey: "user_id", as: "expenseReactions" });
ExpenseReaction.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Group → ActivityLog
Group.hasMany(ActivityLog, { foreignKey: "group_id", as: "activities" });
ActivityLog.belongsTo(Group, { foreignKey: "group_id", as: "group" });

// User → ActivityLog
User.hasMany(ActivityLog, { foreignKey: "user_id", as: "activities" });
ActivityLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

// =====================================================
// MANY-TO-MANY RELATIONSHIPS (belongsToMany)
// =====================================================

// User ↔ Group (through GroupMember)
User.belongsToMany(Group, {
  through: GroupMember,
  foreignKey: "user_id",
  otherKey: "group_id",
  as: "groups",
});
Group.belongsToMany(User, {
  through: GroupMember,
  foreignKey: "group_id",
  otherKey: "user_id",
  as: "groupUsers",
});

// User ↔ Expense (through ExpenseSplit)
User.belongsToMany(Expense, {
  through: ExpenseSplit,
  foreignKey: "user_id",
  otherKey: "expense_id",
  as: "splitExpenses",
});
Expense.belongsToMany(User, {
  through: ExpenseSplit,
  foreignKey: "expense_id",
  otherKey: "user_id",
  as: "splitWithUsers",
});

// User ↔ Expense (through ExpenseReaction)
User.belongsToMany(Expense, {
  through: ExpenseReaction,
  foreignKey: "user_id",
  otherKey: "expense_id",
  as: "reactedExpenses",
});
Expense.belongsToMany(User, {
  through: ExpenseReaction,
  foreignKey: "expense_id",
  otherKey: "user_id",
  as: "reactors",
});

// =====================================================
// DATABASE AUTHENTICATION
// =====================================================

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

module.exports = {
  sequelize,
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseSplit,
  Payment,
  ExpenseReaction,
  ActivityLog,
};
