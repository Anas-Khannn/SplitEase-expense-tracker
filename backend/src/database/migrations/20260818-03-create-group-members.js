"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("group_members", {
      group_member_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      group_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "groups",
          key: "group_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    await queryInterface.addConstraint("group_members", {
      fields: ["group_id", "user_id"],
      type: "unique",
      name: "unique_group_user",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("group_members", "unique_group_user");
    await queryInterface.dropTable("group_members");
  },
};
