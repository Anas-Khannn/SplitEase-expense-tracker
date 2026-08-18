"use strict";

const activityLogs = [
  {
    activity_id: "e3f4a5b6-c7d8-9012-efab-123456789012",
    group_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    action: "created_group",
    description: "Alice Johnson created the group Weekend Trip",
    created_at: new Date(),
  },
  {
    activity_id: "f4a5b6c7-d8e9-0123-fabc-234567890123",
    group_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    action: "added_expense",
    description: "Alice Johnson added expense: Hotel booking",
    created_at: new Date(),
  },
  {
    activity_id: "a5b6c7d8-e9f0-1234-abcd-345678901234",
    group_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    action: "made_payment",
    description: "Bob Smith paid $100.00 to Alice Johnson",
    created_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("activity_logs", activityLogs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("activity_logs", null, {});
  },
};
