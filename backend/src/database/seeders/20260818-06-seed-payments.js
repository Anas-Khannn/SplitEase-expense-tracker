"use strict";

const payments = [
  {
    payment_id: "b0c1d2e3-f4a5-6789-bcde-890123456789",
    group_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    paid_by: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    paid_to: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    amount: 100.0,
    payment_date: "2026-08-17",
    note: "Reimbursing for hotel",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("payments", payments, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("payments", null, {});
  },
};
