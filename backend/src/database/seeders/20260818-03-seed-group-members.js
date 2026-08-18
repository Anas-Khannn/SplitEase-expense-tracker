"use strict";

const groupMembers = [
  {
    group_member_id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    group_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    joined_at: new Date(),
    created_at: new Date(),
  },
  {
    group_member_id: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    group_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    joined_at: new Date(),
    created_at: new Date(),
  },
  {
    group_member_id: "a7b8c9d0-e1f2-3456-abcd-567890123456",
    group_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    user_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    joined_at: new Date(),
    created_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("group_members", groupMembers, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("group_members", null, {});
  },
};
