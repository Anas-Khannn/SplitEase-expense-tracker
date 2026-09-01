"use strict";

const users = [
  {
    user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Alice Johnson",
    email: "alice@example.com",
    password_hash: "$2b$10$placeholder_hash_for_alice_dev_only",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Bob Smith",
    email: "bob@example.com",
    password_hash: "$2b$10$placeholder_hash_for_bob_dev_only",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    user_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    name: "Charlie Davis",
    email: "charlie@example.com",
    password_hash: "$2b$10$placeholder_hash_for_charlie_dev_only",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
