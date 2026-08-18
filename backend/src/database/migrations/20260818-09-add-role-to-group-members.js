"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add role column as nullable first
    await queryInterface.addColumn("group_members", "role", {
      type: Sequelize.ENUM("admin", "member"),
      allowNull: true,
    });

    // Assign the creator of each group as admin
    await queryInterface.sequelize.query(`
      UPDATE group_members gm
      SET role = 'admin'
      FROM groups g
      WHERE gm.group_id = g.group_id
        AND gm.user_id = g.created_by
    `);

    // Assign all remaining members as member
    await queryInterface.sequelize.query(`
      UPDATE group_members
      SET role = 'member'
      WHERE role IS NULL
    `);

    // Now make role NOT NULL
    await queryInterface.changeColumn("group_members", "role", {
      type: Sequelize.ENUM("admin", "member"),
      allowNull: false,
      defaultValue: "member",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("group_members", "role");
  },
};
