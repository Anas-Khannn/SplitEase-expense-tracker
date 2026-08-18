"use strict";

const expenseReactions = [
  {
    reaction_id: "c1d2e3f4-a5b6-7890-cdef-901234567890",
    expense_id: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    reaction: "thumbs_up",
    created_at: new Date(),
  },
  {
    reaction_id: "d2e3f4a5-b6c7-8901-defa-012345678901",
    expense_id: "c9d0e1f2-a3b4-5678-cdef-789012345678",
    user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    reaction: "heart",
    created_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("expense_reactions", expenseReactions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("expense_reactions", null, {});
  },
};
