"use strict";

const groups = [
  {
    group_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    created_by: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Weekend Trip",
    icon: "plane",
    description: "Expenses for our weekend getaway",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("groups", groups, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("groups", null, {});
  },
};
