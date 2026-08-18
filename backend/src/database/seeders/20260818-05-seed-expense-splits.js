"use strict";

const expenseSplits = [
  // Splits for Hotel booking (300.00 split 3 ways = 100.00 each)
  {
    expense_split_id: "e1f2a3b4-c5d6-7890-efab-901234567890",
    expense_id: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    share_amount: 100.0,
    created_at: new Date(),
  },
  {
    expense_split_id: "f2a3b4c5-d6e7-8901-fabc-012345678901",
    expense_id: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    share_amount: 100.0,
    created_at: new Date(),
  },
  {
    expense_split_id: "a3b4c5d6-e7f8-9012-abcd-123456789012",
    expense_id: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    user_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    share_amount: 100.0,
    created_at: new Date(),
  },
  // Splits for Dinner (85.50 split 3 ways = 28.50 each)
  {
    expense_split_id: "b4c5d6e7-f8a9-0123-bcde-234567890123",
    expense_id: "c9d0e1f2-a3b4-5678-cdef-789012345678",
    user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    share_amount: 28.5,
    created_at: new Date(),
  },
  {
    expense_split_id: "c5d6e7f8-a9b0-1234-cdef-345678901234",
    expense_id: "c9d0e1f2-a3b4-5678-cdef-789012345678",
    user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    share_amount: 28.5,
    created_at: new Date(),
  },
  {
    expense_split_id: "d6e7f8a9-b0c1-2345-defa-456789012345",
    expense_id: "c9d0e1f2-a3b4-5678-cdef-789012345678",
    user_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    share_amount: 28.5,
    created_at: new Date(),
  },
  // Splits for Gas (60.00 split 3 ways = 20.00 each)
  {
    expense_split_id: "e7f8a9b0-c1d2-3456-efab-567890123456",
    expense_id: "d0e1f2a3-b4c5-6789-defa-890123456789",
    user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    share_amount: 20.0,
    created_at: new Date(),
  },
  {
    expense_split_id: "f8a9b0c1-d2e3-4567-fabc-678901234567",
    expense_id: "d0e1f2a3-b4c5-6789-defa-890123456789",
    user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    share_amount: 20.0,
    created_at: new Date(),
  },
  {
    expense_split_id: "a9b0c1d2-e3f4-5678-abcd-789012345678",
    expense_id: "d0e1f2a3-b4c5-6789-defa-890123456789",
    user_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    share_amount: 20.0,
    created_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("expense_splits", expenseSplits, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("expense_splits", null, {});
  },
};
