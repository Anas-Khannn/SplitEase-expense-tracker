const EVENTS = Object.freeze({
  MEMBER_ADDED: "notification:member-added",
  MEMBER_REMOVED: "notification:member-removed",
  MEMBER_ROLE_CHANGED: "notification:member-role-changed",
  EXPENSE_CREATED: "notification:expense-created",
  EXPENSE_UPDATED: "notification:expense-updated",
  EXPENSE_DELETED: "notification:expense-deleted",
  PAYMENT_CREATED: "notification:payment-created",
  REACTION_ADDED: "notification:reaction-added",
});

module.exports = EVENTS;