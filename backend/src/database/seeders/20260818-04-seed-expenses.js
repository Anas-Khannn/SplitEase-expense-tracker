"use strict";

const expenses = [
  {
    expense_id: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    group_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    paid_by: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    description: "Hotel booking",
    amount: 300.0,
    expense_date: "2026-08-15",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    expense_id: "c9d0e1f2-a3b4-5678-cdef-789012345678",
    group_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    paid_by: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    description: "Dinner at restaurant",
    amount: 85.5,
    expense_date: "2026-08-16",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    expense_id: "d0e1f2a3-b4c5-6789-defa-890123456789",
    group_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    paid_by: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    description: "Gas for road trip",
    amount: 60.0,
    expense_date: "2026-08-17",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("expenses", expenses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("expenses", null, {});
  },
};
