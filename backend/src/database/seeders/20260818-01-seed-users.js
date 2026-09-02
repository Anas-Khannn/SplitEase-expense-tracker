"use strict";

const { hashPassword } = require("../../utils/password");
const { User } = require("../models");

// LOCAL DEVELOPMENT / TEST ONLY credential.
//
// The seeded users below all share a single, intentionally simple password so
// developers can log in locally for testing. This password is NOT a production
// credential and must never be used in a real deployment.
//
//   Email:    bob@example.com
//   Password: Password123!
//
// The plaintext password is documented here and known to the seed, but it is
// only ever stored as a bcrypt hash produced by the project's own hashing
// utility. No plaintext password is persisted.
const DEV_PASSWORD = "Password123!";

const users = [
  {
    user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Alice Johnson",
    email: "alice@example.com",
  },
  {
    user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Bob Smith",
    email: "bob@example.com",
  },
  {
    user_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    name: "Charlie Davis",
    email: "charlie@example.com",
  },
];

module.exports = {
  DEV_PASSWORD,

  async up() {
    const password_hash = await hashPassword(DEV_PASSWORD);
    const seedRows = users.map((user) => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      password_hash,
    }));

    // bulkCreate with updateOnDuplicate makes the seeder safe to re-run: an
    // already-seeded user (matched by the stable user_id primary key) has its
    // password_hash updated in place instead of being duplicated. This repairs
    // a database that was previously seeded with an invalid placeholder hash
    // without dropping any related data.
    await User.bulkCreate(seedRows, {
      updateOnDuplicate: ["name", "password_hash", "updated_at"],
      validate: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
