"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("expenses", {
      expense_id: {
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
      paid_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      expense_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("expenses");
  },
};
