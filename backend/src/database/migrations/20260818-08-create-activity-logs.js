"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("activity_logs", {
      activity_id: {
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
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("activity_logs");
  },
};
